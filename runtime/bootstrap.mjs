import { openCatalog, importInitialIndex } from './catalog.mjs'
const catalog=await openCatalog()
console.log(JSON.stringify(await importInitialIndex(catalog)))
