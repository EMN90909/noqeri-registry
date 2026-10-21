// SemVer 2.0 precedence, build metadata does not affect precedence.
export const VALID_VERSION = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-((?:0|[1-9A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
function parts(v) {
  if(!VALID_VERSION.test(v)) throw new Error('invalid semantic version')
  const withoutBuild=v.split('+',1)[0]
  const dash=withoutBuild.indexOf('-')
  const base=dash<0?withoutBuild:withoutBuild.slice(0,dash)
  const pre=dash<0?[]:withoutBuild.slice(dash+1).split('.')
  if(pre.some(part=>/^0[0-9]+$/.test(part)))throw new Error('invalid numeric prerelease identifier')
  return {base:base.split('.').map(BigInt),pre}
}
export function compareSemver(left,right) {
  const a=parts(left),b=parts(right)
  for(let i=0;i<3;i++){if(a.base[i]<b.base[i])return -1;if(a.base[i]>b.base[i])return 1}
  if(!a.pre.length||!b.pre.length)return a.pre.length===b.pre.length?0:a.pre.length? -1:1
  for(let i=0;i<Math.max(a.pre.length,b.pre.length);i++){
    if(i===a.pre.length)return -1
    if(i===b.pre.length)return 1
    const x=a.pre[i],y=b.pre[i]
    const numericX=/^\d+$/.test(x),numericY=/^\d+$/.test(y)
    if(numericX&&numericY){const n=BigInt(x),m=BigInt(y);if(n!==m)return n<m?-1:1;continue}
    if(numericX!==numericY)return numericX?-1:1
    if(x!==y)return x<y?-1:1
  }
  return 0
}
