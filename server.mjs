#!/usr/bin/env node
// Transport only. All package/release metadata comes from NoeSQL .noedb.
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {openRegistry} from './service/catalog.mjs'
import {createRegistryServer} from './service/http.mjs'
const root=fileURLToPath(new URL('.',import.meta.url))
const port=Number(process.env.PORT||8080)
if(!Number.isInteger(port)||port<1||port>65535)throw Error('invalid PORT')
const data=process.env.NOQERI_REGISTRY_DATA?resolve(process.env.NOQERI_REGISTRY_DATA):fileURLToPath(new URL('data/',import.meta.url))
const registry=await openRegistry({root,data})
createRegistryServer(registry).listen(port,'0.0.0.0',()=>console.log('Noqeri Registry /v1 listening on '+port))
