export const PACKAGE_PART=/^[a-z0-9][a-z0-9-]*$/
export const SEMVER=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
export function checkIdentity(namespace,name,version) {
 if(!PACKAGE_PART.test(namespace||'')||!PACKAGE_PART.test(name||'')||
    (version!==undefined&&!SEMVER.test(version)))throw Object.assign(Error('invalid package identity'),{status:400})
}
