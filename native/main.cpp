// SPDX-License-Identifier: GPL-3.0-only
// Stage-0 AOT entrypoint host. This ABI is currently Linux x86-64 experimental.
#include <cstddef>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <string>
extern "C" int noqeri_entry(const void* abi);

struct Abi {
    std::uint32_t version;
    std::uint32_t size;
    void* context;
    std::int32_t (*write)(void*,const char*,std::size_t);
    std::int64_t (*clockMillis)(void*);
    struct Name {const char* data;std::size_t size;};
    Name (*platform)(void*);
    std::size_t services;
    const void* serviceTable;
};
static std::int32_t writeOutput(void*,const char* data,std::size_t len){
    if(!data)return len?1:0;
    return std::fwrite(data,1,len,stdout)==len?0:1;
}
static std::int64_t clockMillis(void*){return 0;}
static Abi::Name platformName(void*){static const char p[]="linux";return {p,5};}
int main(){
    Abi abi{2,sizeof(Abi),nullptr,writeOutput,clockMillis,platformName,0,nullptr};
    return noqeri_entry(&abi);
}
