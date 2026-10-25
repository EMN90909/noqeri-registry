// SPDX-License-Identifier: GPL-3.0-only
// Linux x86-64 preview host for the Noqeri-owned registry application.
// This file owns POSIX sockets, archive compression, JSON serialization and
// filesystem access, NOT the application's native Noqeri route policy.
// Source-index mode is explicit and read-only; it is not a NoeSQL deployment.
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <unistd.h>
#include <json-c/json.h>
#include <openssl/sha.h>
#include <zlib.h>
#include <algorithm>
#include <array>
#include <cerrno>
#include <chrono>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <limits>
#include <map>
#include <regex>
#include <stdexcept>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

namespace fs = std::filesystem;
using Bytes = std::vector<unsigned char>;
constexpr std::size_t kMaxFiles = 256, kMaxBytes = 8 * 1024 * 1024;
constexpr std::size_t kMaxTotalMemory = 64 * 1024 * 1024;
extern "C" int registryRouteCode(const unsigned char*, std::size_t);
extern "C" bool registryMethodValid(const unsigned char*, std::size_t);
extern "C" bool registryIdentityBytesValid(const unsigned char*, std::size_t);
extern "C" bool registryPathSafe(const unsigned char*, std::size_t);
extern "C" bool registryPaginationValid(std::size_t, std::size_t);
extern "C" bool registrySearchBytesValid(std::size_t);
extern "C" bool registryQueryStringBytesValid(std::size_t);

namespace {
struct Json {
    json_object* value = nullptr;
    explicit Json(json_object* v = nullptr) : value(v) {}
    ~Json() { if (value) json_object_put(value); }
    Json(Json&& other) noexcept : value(std::exchange(other.value, nullptr)) {}
    Json& operator=(Json&& other) noexcept {
        if (this != &other) { if (value) json_object_put(value); value=std::exchange(other.value,nullptr); }
        return *this;
    }
    Json(const Json&)=delete; Json& operator=(const Json&)=delete;
};
std::string text(const json_object* v) {
    return v && json_object_is_type(v,json_type_string) ? json_object_get_string(const_cast<json_object*>(v)) : "";
}
json_object* field(json_object* v, const char* k) {
    json_object* out=nullptr;
    return v && json_object_object_get_ex(v,k,&out) ? out : nullptr;
}
std::string val(json_object* v, const char* k) { return text(field(v,k)); }
bool flag(json_object* v, const char* k) { auto* f=field(v,k);return f&&json_object_get_boolean(f); }
void str(json_object* v, const char* k, const std::string& s) {
    json_object_object_add(v,k,json_object_new_string_len(s.data(),int(s.size())));
}
void num(json_object* v, const char* k, std::int64_t n) { json_object_object_add(v,k,json_object_new_int64(n)); }
void yes(json_object* v, const char* k, bool b) { json_object_object_add(v,k,json_object_new_boolean(b)); }
std::string dump(json_object* v) { return json_object_to_json_string_ext(v,JSON_C_TO_STRING_PLAIN); }
std::string sha256(const unsigned char* p, std::size_t len) {
    std::array<unsigned char,SHA256_DIGEST_LENGTH> digest{};
    SHA256(p,len,digest.data());
    static constexpr char hex[]="0123456789abcdef";
    std::string out;out.reserve(digest.size()*2);
    for (auto byte:digest) { out.push_back(hex[byte>>4]);out.push_back(hex[byte&15]); }
    return out;
}
std::string sha256(const Bytes& data) { return sha256(data.data(),data.size()); }
bool safeRelative(const std::string& s) {
    if (s.empty() || s.front()=='/' || s.find('\\')!=std::string::npos || s.find('\0')!=std::string::npos) return false;
    if (s.size()>100) return false;
    std::size_t i=0;
    while (i<s.size()) {
        auto end=s.find('/',i);if(end==std::string::npos)end=s.size();
        auto component=s.substr(i,end-i);
        if(component.empty() || component=="." || component=="..")return false;
        i=end+1;
    }
    return true;
}
Bytes loadFile(const fs::path& path, std::size_t limit) {
    std::ifstream f(path,std::ios::binary);
    if(!f)throw std::runtime_error("file not readable: "+path.string());
    f.seekg(0,std::ios::end);auto n=f.tellg();
    if(n<0 || static_cast<std::uint64_t>(n)>limit)throw std::runtime_error("file size limit: "+path.string());
    f.seekg(0);
    Bytes out(static_cast<std::size_t>(n));
    if(!out.empty() && !f.read(reinterpret_cast<char*>(out.data()),n))throw std::runtime_error("truncated file");
    return out;
}
void octal(unsigned char* data,std::size_t offset,std::size_t width,std::size_t value) {
    std::string valueText;
    do {valueText.insert(valueText.begin(),char('0'+(value&7)));value>>=3;}while(value);
    if(valueText.size()>=width)throw std::runtime_error("tar number overflow");
    std::fill(data+offset,data+offset+width,0);
    std::fill(data+offset,data+offset+width-1-valueText.size(),'0');
    std::memcpy(data+offset+width-1-valueText.size(),valueText.data(),valueText.size());
}
void appendTar(Bytes& out,const std::string& name,const Bytes& file) {
    if(!safeRelative(name))throw std::runtime_error("unsafe tar pathname");
    std::array<unsigned char,512> header{};
    std::memcpy(header.data(),name.data(),name.size());
    octal(header.data(),100,8,0644); octal(header.data(),108,8,0);octal(header.data(),116,8,0);
    octal(header.data(),124,12,file.size());octal(header.data(),136,12,0);
    std::fill(header.begin()+148,header.begin()+156,' ');
    header[156]='0';std::memcpy(header.data()+257,"ustar",5);
    header[263]='0';header[264]='0';
    std::size_t sum=0;for(auto c:header)sum+=c;
    octal(header.data(),148,8,sum);
    out.insert(out.end(),header.begin(),header.end());
    out.insert(out.end(),file.begin(),file.end());
    out.insert(out.end(),(512-file.size()%512)%512,0);
}
Bytes gzip(const Bytes& input) {
    z_stream z{};
    if(deflateInit2(&z,9,Z_DEFLATED,15+16,8,Z_DEFAULT_STRATEGY)!=Z_OK)
        throw std::runtime_error("zlib initialization failed");
    gz_header hdr{};hdr.time=0;hdr.os=255;
    if(deflateSetHeader(&z,&hdr)!=Z_OK) {deflateEnd(&z);throw std::runtime_error("gzip header error");}
    Bytes out(compressBound(static_cast<uLong>(input.size()))+32);
    z.next_in=const_cast<Bytef*>(input.data());z.avail_in=static_cast<uInt>(input.size());
    z.next_out=out.data();z.avail_out=static_cast<uInt>(out.size());
    int result=deflate(&z,Z_FINISH);
    if(result!=Z_STREAM_END){deflateEnd(&z);throw std::runtime_error("gzip compression error");}
    out.resize(z.total_out);deflateEnd(&z);
    if(out.size()>kMaxBytes)throw std::runtime_error("compressed archive exceeds limit");
    return out;
}
struct Archive { Bytes bytes;std::string integrity,entry;bool legacy=false;Json dependencies{json_object_new_object()}; };
Archive makeArchive(const fs::path& root) {
    std::vector<std::pair<std::string,Bytes>> files;
    std::size_t total=0,dirs=0;
    if(!fs::is_directory(root))throw std::runtime_error("package directory missing: "+root.string());
    for(fs::recursive_directory_iterator it(root,fs::directory_options::none),end;it!=end;++it) {
        if(it.depth()>12 || ++dirs>4096)throw std::runtime_error("package nesting limit");
        auto status=it->symlink_status();
        if(fs::is_symlink(status))throw std::runtime_error("package symlink forbidden");
        if(fs::is_directory(status))continue;
        if(!fs::is_regular_file(status))throw std::runtime_error("package special file forbidden");
        if(fs::hard_link_count(it->path())>1)throw std::runtime_error("package hardlink forbidden");
        std::string relative=fs::relative(it->path(),root).generic_string();
        if(!safeRelative(relative) || files.size()>=kMaxFiles)throw std::runtime_error("package path/count limit");
        auto data=loadFile(it->path(),kMaxBytes-total);
        total+=data.size();files.emplace_back(relative,std::move(data));
    }
    std::sort(files.begin(),files.end(),[](const auto& a,const auto& b){return a.first<b.first;});
    auto m=std::find_if(files.begin(),files.end(),[](const auto& p){return p.first=="package.noqeri";});
    if(m==files.end())m=std::find_if(files.begin(),files.end(),[](const auto& p){return p.first=="package.nqr";});
    if(m==files.end())throw std::runtime_error("manifest missing");
    std::string manifest(m->second.begin(),m->second.end());
    std::smatch entryMatch;
    if(!std::regex_search(manifest,entryMatch,std::regex(R"REG(\bentry\s*:\s*"([^"]+)")REG")))
        throw std::runtime_error("manifest entry missing");
    Archive archive;archive.entry=entryMatch[1];archive.legacy=(m->first=="package.nqr");
    if(!safeRelative(archive.entry) ||
       std::none_of(files.begin(),files.end(),[&](const auto& p){return p.first==archive.entry;}))
        throw std::runtime_error("manifest entry invalid");
    // Dependencies are recorded as alias: "namespace/name@version".
    const std::regex dep(R"REG(\b([A-Za-z_][A-Za-z0-9_]*)\s*:\s*"([a-z0-9-]+/[a-z0-9-]+@[^"]+)")REG");
    for(std::sregex_iterator p(manifest.begin(),manifest.end(),dep),end;p!=end;++p) {
        if((*p)[1]!="name" && (*p)[1]!="entry")
            str(archive.dependencies.value,(*p)[1].str().c_str(),(*p)[2]);
    }
    Bytes tar;tar.reserve(total+512*(files.size()+2));
    SHA256_CTX ctx;SHA256_Init(&ctx);
    for(const auto& f:files) {
        SHA256_Update(&ctx,f.first.data(),f.first.size());
        unsigned char nul=0;SHA256_Update(&ctx,&nul,1);
        if(!f.second.empty())SHA256_Update(&ctx,f.second.data(),f.second.size());
        SHA256_Update(&ctx,&nul,1);
        appendTar(tar,f.first,f.second);
    }
    tar.insert(tar.end(),1024,0);
    archive.bytes=gzip(tar);
    archive.integrity="sha256:"+sha256(archive.bytes);
    return archive;
}
struct Release {
    std::string version;bool yanked=false;
    Archive archive;
    Json metadata;
};
struct Package {
    std::string ns,name,description;
    std::vector<Release> releases;
    Json metadata;
};
int compareVersions(const std::string& a,const std::string& b) {
    auto components=[](const std::string& s) {
        std::array<std::uint64_t,3> result{};std::size_t start=0;
        for(int i=0;i<3;++i){auto end=s.find('.',start);if(end==std::string::npos)end=s.find('-',start);
            if(end==std::string::npos)end=s.size();
            try{result[i]=std::stoull(s.substr(start,end-start));}catch(...){result[i]=0;}
            start=end+1;
        }return result;
    };
    const auto x=components(a),y=components(b);
    for(int i=0;i<3;++i)if(x[i]!=y[i])return x[i]>y[i]?1:-1;
    return a==b?0:(a>b?1:-1);
}
class Catalog {
public:
    std::vector<Package> packages;
    Json index{json_object_new_object()},all{json_object_new_object()},advisories;
    explicit Catalog(const fs::path& root) {
        Json data(json_object_from_file((root/"registry/index.json").string().c_str()));
        if(!data.value || val(data.value,"protocol")!="v1" || val(data.value,"packageFormat")!="nqpkg-1")
            throw std::runtime_error("invalid registry source index");
        json_object* source=field(data.value,"packages");
        if(!source || !json_object_is_type(source,json_type_array))throw std::runtime_error("packages array missing");
        std::size_t reserved=0;
        for(std::size_t i=0;i<json_object_array_length(source);++i) {
            json_object* p=json_object_array_get_idx(source,i);
            Package pkg;pkg.ns=val(p,"namespace");pkg.name=val(p,"name");pkg.description=val(p,"description");
            if(!validIdentity(pkg.ns) || !validIdentity(pkg.name))throw std::runtime_error("bad package identity");
            json_object* releases=field(p,"versions");
            if(!releases || !json_object_is_type(releases,json_type_array))throw std::runtime_error("invalid releases");
            for(std::size_t j=0;j<json_object_array_length(releases);++j) {
                json_object* rel=json_object_array_get_idx(releases,j);
                Release release;release.version=val(rel,"version");release.yanked=flag(rel,"yanked");
                if(!std::regex_match(release.version,std::regex(R"((0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[A-Za-z0-9.-]+)?(?:\+[A-Za-z0-9.-]+)?)")))
                    throw std::runtime_error("invalid version");
                std::string expected="packages/"+pkg.ns+"/"+pkg.name+"/"+release.version;
                if(val(rel,"path")!=expected)throw std::runtime_error("index release path mismatch");
                release.archive=makeArchive(root/expected);
                reserved+=release.archive.bytes.size();
                if(reserved>kMaxTotalMemory)throw std::runtime_error("archive cache memory limit");
                release.metadata=Json(json_object_new_object());
                str(release.metadata.value,"version",release.version);
                yes(release.metadata.value,"yanked",release.yanked);
                str(release.metadata.value,"archiveIntegrity",release.archive.integrity);
                str(release.metadata.value,"entry",release.archive.entry);
                yes(release.metadata.value,"legacy",release.archive.legacy);
                json_object_object_add(release.metadata.value,"dependencies",json_object_get(release.archive.dependencies.value));
                num(release.metadata.value,"downloads",0);
                pkg.releases.push_back(std::move(release));
            }
            std::sort(pkg.releases.begin(),pkg.releases.end(),[](const Release& a,const Release& b){
                return compareVersions(a.version,b.version)>0;
            });
            pkg.metadata=Json(json_object_new_object());
            str(pkg.metadata.value,"namespace",pkg.ns);str(pkg.metadata.value,"name",pkg.name);
            str(pkg.metadata.value,"description",pkg.description);
            json_object* versions=json_object_new_array();
            for(auto& rel:pkg.releases)json_object_array_add(versions,json_object_get(rel.metadata.value));
            json_object_object_add(pkg.metadata.value,"versions",versions);
            packages.push_back(std::move(pkg));
        }
        std::sort(packages.begin(),packages.end(),[](const Package& a,const Package& b){
            return a.ns+"/"+a.name < b.ns+"/"+b.name;
        });
        auto makeList=[&]() {
            json_object* arr=json_object_new_array();
            for(const auto& pkg:packages)json_object_array_add(arr,json_object_get(pkg.metadata.value));
            return arr;
        };
        str(index.value,"protocol","v1");str(index.value,"packageFormat","nqpkg-1");
        json_object_object_add(index.value,"packages",makeList());
        json_object_object_add(all.value,"packages",makeList());
        advisories=Json(json_object_from_file((root/"advisories/index.json").string().c_str()));
        if(!advisories.value)throw std::runtime_error("advisory catalog unreadable");
    }
    const Package* lookup(std::string_view ns,std::string_view name)const {
        auto it=std::find_if(packages.begin(),packages.end(),[&](const Package& p){return p.ns==ns&&p.name==name;});
        return it==packages.end()?nullptr:&*it;
    }
    static bool validIdentity(const std::string& s) {
        return registryIdentityBytesValid(reinterpret_cast<const unsigned char*>(s.data()),s.size());
    }
};
struct Reply { int status=200;std::string contentType="application/json; charset=utf-8";std::string body,sha,fileName;};
Reply jsonReply(int status,Json data) {return {status,"application/json; charset=utf-8",dump(data.value),"",""};}
Reply error(int code,const std::string& message) {
    Json data(json_object_new_object());str(data.value,"error",message);return jsonReply(code,std::move(data));
}
std::string lower(std::string s) {for(char& c:s)if(c>='A'&&c<='Z')c=char(c+32);return s;}
std::string decode(const std::string& input) {
    std::string out;
    for(std::size_t i=0;i<input.size();++i) {
        if(input[i]=='+')out.push_back(' ');
        else if(input[i]=='%') {
            if(i+2>=input.size())throw std::runtime_error("invalid percent escape");
            auto digit=[](char c)->int{if(c>='0'&&c<='9')return c-'0';if(c>='a'&&c<='f')return c-'a'+10;if(c>='A'&&c<='F')return c-'A'+10;return -1;};
            int a=digit(input[i+1]),b=digit(input[i+2]);
            if(a<0||b<0)throw std::runtime_error("invalid percent escape");
            out.push_back(char((a<<4)|b));i+=2;
        }else out.push_back(input[i]);
    }return out;
}
std::map<std::string,std::string> queryParams(const std::string& q) {
    std::map<std::string,std::string> out;
    std::size_t start=0;
    while(start<q.size()){auto end=q.find('&',start);if(end==std::string::npos)end=q.size();
        auto item=q.substr(start,end-start);
        auto equal=item.find('=');
        auto name=decode(item.substr(0,equal)),value=equal==std::string::npos?"":decode(item.substr(equal+1));
        if(!out.count(name))out.emplace(std::move(name),std::move(value));
        start=end+1;
    }return out;
}
bool numeric(const std::string& s,std::size_t maxDigits) {
    return !s.empty()&&s.size()<=maxDigits&&(s=="0"||s.front()!='0')&&
      std::all_of(s.begin(),s.end(),[](char c){return c>='0'&&c<='9';});
}
std::vector<std::string> split(const std::string& s) {
    std::vector<std::string> out;
    std::size_t start=0;
    while(start<=s.size()){auto end=s.find('/',start);if(end==std::string::npos)end=s.size();
        out.push_back(s.substr(start,end-start));if(end==s.size())break;start=end+1;}
    return out;
}
Reply handle(const Catalog& catalog,const std::string& method,const std::string& target) {
    if(!registryMethodValid(reinterpret_cast<const unsigned char*>(method.data()),method.size()))
        return error(405,"method_not_allowed");
    auto qpos=target.find('?');auto path=target.substr(0,qpos);
    auto query=qpos==std::string::npos?"":target.substr(qpos+1);
    if(!registryQueryStringBytesValid(query.size()))return error(414,"query_too_long");
    if(path.size()>512)return error(414,"uri_too_long");
    if(!registryPathSafe(reinterpret_cast<const unsigned char*>(path.data()),path.size()))
        return error(400,"invalid_path");
    const int route=registryRouteCode(reinterpret_cast<const unsigned char*>(path.data()),path.size());
    if(route==1)return {200,"application/json; charset=utf-8",
        R"({"status":"ok","storage":"source-index-preview","database":null,"nativeQualified":false})","",""};
    if(route==2)return {200,"application/json; charset=utf-8",
        R"({"status":"experimental","protocol":"v1","storage":"source-index-preview","nativeQualified":false,"publishingEnabled":false})","",""};
    if(route==3)return {200,"application/json; charset=utf-8",dump(catalog.index.value),"",""};
    if(route==4)return {200,"application/json; charset=utf-8",dump(catalog.all.value),"",""};
    if(route==6)return {200,"application/json; charset=utf-8",dump(catalog.advisories.value),"",""};
    if(route==5) {
        std::map<std::string,std::string> params;
        try{params=queryParams(query);}catch(...){return error(400,"invalid_query");}
        auto q=params.count("q")?params["q"]:"";
        if(!registrySearchBytesValid(q.size()))return error(400,"search_too_long");
        auto off=params.count("offset")?params["offset"]:"0";
        auto lim=params.count("limit")?params["limit"]:"50";
        if(!numeric(off,8)||!numeric(lim,3))return error(400,"invalid_pagination");
        std::size_t offset=std::stoull(off),limit=std::stoull(lim);
        if(!registryPaginationValid(offset,limit))return error(400,"invalid_pagination");
        Json data(json_object_new_object());auto* matched=json_object_new_array();
        int total=0;auto term=lower(q);
        for(const auto& pkg:catalog.packages) {
            if(lower(pkg.ns+"/"+pkg.name+" "+pkg.description).find(term)==std::string::npos)continue;
            if(std::size_t(total)>=offset&&std::size_t(total)<offset+limit)
                json_object_array_add(matched,json_object_get(pkg.metadata.value));
            ++total;
        }
        json_object_object_add(data.value,"packages",matched);
        num(data.value,"total",total);num(data.value,"offset",offset);num(data.value,"limit",limit);
        return jsonReply(200,std::move(data));
    }
    if(route!=7)return error(404,"not_found");
    auto parts=split(path);
    if(parts.size()<5||parts.size()>7)return error(404,"not_found");
    const auto& ns=parts[3];const auto& name=parts[4];
    if(!Catalog::validIdentity(ns)||!Catalog::validIdentity(name))return error(400,"invalid_package_identity");
    auto pkg=catalog.lookup(ns,name);if(!pkg)return error(404,"package_not_found");
    if(parts.size()==5)return {200,"application/json; charset=utf-8",dump(pkg->metadata.value),"",""};
    if(parts.size()==6&&parts[5]=="versions"){
        Json data(json_object_new_object());str(data.value,"namespace",ns);str(data.value,"name",name);
        json_object_object_add(data.value,"versions",json_object_get(field(pkg->metadata.value,"versions")));
        return jsonReply(200,std::move(data));
    }
    const std::string& version=parts[5];
    if(!std::regex_match(version,std::regex(R"((0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[A-Za-z0-9.-]+)?(?:\+[A-Za-z0-9.-]+)?)")))
        return error(400,"invalid_version");
    const Release* rel=nullptr;
    for(const auto& v:pkg->releases)if(v.version==version){rel=&v;break;}
    if(!rel)return error(404,"release_not_found");
    if(parts.size()==6) {
        Json data(json_object_new_object());str(data.value,"namespace",ns);str(data.value,"name",name);
        json_object_object_foreach(rel->metadata.value,key,v) {
            json_object_object_add(data.value,key,json_object_get(v));
        }
        return jsonReply(200,std::move(data));
    }
    if(parts[6]!="download")return error(404,"not_found");
    if(rel->yanked)return error(404,"release_yanked");
    if(rel->archive.bytes.size()>kMaxBytes ||
        "sha256:"+sha256(rel->archive.bytes)!=rel->archive.integrity)
        return error(503,"artifact_integrity_mismatch");
    return {200,"application/vnd.noqeri.package+gzip",
        std::string(reinterpret_cast<const char*>(rel->archive.bytes.data()),rel->archive.bytes.size()),
        rel->archive.integrity.substr(7),ns+"-"+name+"-"+version+".nqpkg"};
}
bool sendAll(int fd,const std::string& s) {
    std::size_t pos=0;while(pos<s.size()){
        ssize_t n=send(fd,s.data()+pos,s.size()-pos,MSG_NOSIGNAL);
        if(n<=0){if(n<0&&errno==EINTR)continue;return false;}pos+=static_cast<std::size_t>(n);
    }return true;
}
void service(int fd,const Catalog& catalog) {
    timeval timeout{10,0};
    setsockopt(fd,SOL_SOCKET,SO_RCVTIMEO,&timeout,sizeof(timeout));
    setsockopt(fd,SOL_SOCKET,SO_SNDTIMEO,&timeout,sizeof(timeout));
    std::string buffer;buffer.reserve(4096);char chunk[2048];Reply response;
    for(;;){
        auto n=recv(fd,chunk,sizeof(chunk),0);
        if(n<=0)break;
        buffer.append(chunk,std::size_t(n));
        if(buffer.size()>16384){response=error(431,"headers_too_large");break;}
        if(buffer.find("\r\n\r\n")!=std::string::npos)break;
    }
    if(response.body.empty()) {
        auto end=buffer.find("\r\n"),fields=buffer.find("\r\n\r\n");
        if(end==std::string::npos||fields==std::string::npos){response=error(400,"invalid_http_request");}
        else {
            auto line=buffer.substr(0,end);
            auto first=line.find(' '),last=line.rfind(' ');
            if(first==std::string::npos||last==first||line.substr(last+1)!="HTTP/1.1"){
                response=error(400,"invalid_http_request");
            }else {
                auto method=line.substr(0,first),target=line.substr(first+1,last-first-1);
                if(target.size()>4096)response=error(414,"uri_too_long");
                else response=handle(catalog,method,target);
                const char* names[]={"content-length:","transfer-encoding:"};
                auto header=lower(buffer.substr(end+2,fields-end-2));
                if(registryMethodValid(reinterpret_cast<const unsigned char*>(method.data()),method.size()) &&
                   (header.find(names[0])!=std::string::npos||header.find(names[1])!=std::string::npos))
                    response=error(400,"request_body_not_supported");
            }
        }
    }
    const char* reason="OK";
    switch(response.status){
        case 400:reason="Bad Request";break;case 404:reason="Not Found";break;
        case 405:reason="Method Not Allowed";break;case 414:reason="URI Too Long";break;
        case 431:reason="Request Header Fields Too Large";break;
        case 503:reason="Service Unavailable";break;case 500:reason="Internal Server Error";break;
    }
    std::string headers="HTTP/1.1 "+std::to_string(response.status)+" "+reason+"\r\n";
    headers+="Connection: close\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\n";
    headers+="Content-Security-Policy: default-src 'none'\r\nAccess-Control-Allow-Origin: *\r\n";
    headers+="Content-Type: "+response.contentType+"\r\nContent-Length: "+std::to_string(response.body.size())+"\r\n";
    if(response.status==405)headers+="Allow: GET, HEAD\r\n";
    if(!response.sha.empty()){
        headers+="X-Archive-SHA256: "+response.sha+"\r\n";
        headers+="Content-Disposition: attachment; filename=\""+response.fileName+"\"\r\n";
    }
    headers+="\r\n";
    sendAll(fd,headers);
    if(buffer.rfind("HEAD ",0)!=0)sendAll(fd,response.body);
}
int startServer(const Catalog& catalog,int port,const std::string& host) {
    int listener=socket(AF_INET,SOCK_STREAM,0);
    if(listener<0)throw std::runtime_error("socket failed");
    int reuse=1;setsockopt(listener,SOL_SOCKET,SO_REUSEADDR,&reuse,sizeof(reuse));
    sockaddr_in addr{};addr.sin_family=AF_INET;addr.sin_port=htons(static_cast<uint16_t>(port));
    if(inet_pton(AF_INET,host.c_str(),&addr.sin_addr)!=1){close(listener);throw std::runtime_error("invalid REGISTRY_HOST IPv4 address");}
    if(bind(listener,reinterpret_cast<sockaddr*>(&addr),sizeof(addr))!=0){close(listener);throw std::runtime_error("bind failed");}
    if(listen(listener,64)!=0){close(listener);throw std::runtime_error("listen failed");}
    sockaddr_in assigned{};socklen_t len=sizeof(assigned);
    getsockname(listener,reinterpret_cast<sockaddr*>(&assigned),&len);
    std::cout<<"Noqeri native preview listening on "<<host<<":"<<ntohs(assigned.sin_port)<<std::endl;
    for(;;){
        int fd=accept(listener,nullptr,nullptr);
        if(fd<0){if(errno==EINTR)continue;close(listener);throw std::runtime_error("accept failed");}
        try{service(fd,catalog);}catch(const std::exception& e){std::cerr<<"request error: "<<e.what()<<"\n";}
        close(fd);
    }
}
} // namespace

extern "C" std::int64_t registryHostServe(const char*,const char*,std::int64_t defaultPort) {
    try{
        if(!std::getenv("REGISTRY_SOURCE_INDEX_PREVIEW") ||
           std::string(std::getenv("REGISTRY_SOURCE_INDEX_PREVIEW"))!="1")
            throw std::runtime_error("native source-index mode requires REGISTRY_SOURCE_INDEX_PREVIEW=1; native NoeSQL sessions are not qualified");
        auto root=fs::current_path();
        if(const char* env=std::getenv("REGISTRY_ROOT"))root=fs::absolute(env);
        Catalog catalog(root);
        auto port=defaultPort;
        if(const char* env=std::getenv("PORT")){
            std::string s(env);
            if(!numeric(s,5))throw std::runtime_error("invalid PORT");
            port=std::stol(s);
        }
        if(port<0||port>65535)throw std::runtime_error("invalid port");
        const char* host=std::getenv("REGISTRY_HOST");
        return startServer(catalog,int(port),host?host:"127.0.0.1");
    }catch(const std::exception& e){
        std::cerr<<"registry native startup failed: "<<e.what()<<"\n";
        // The Stage-0 top-level entry currently discards the main() return code.
        // Fail closed with a nonzero process status instead of reporting success.
        std::exit(EXIT_FAILURE);
    }
}
