
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="01dae566-94f5-5d01-92a3-c920f0cfb4fa")}catch(e){}}();
import{Xr as e,or as t,qr as n}from"./index-ClHYEQFz.js";import{t as r}from"./config-Ciro3s2H.js";async function i({url:i}){let a=n(i);try{let n=await(await e(r+`?`+new URLSearchParams({url:i}).toString(),{method:`POST`})).json();return{id:t.createId(a),typeName:`asset`,type:`bookmark`,props:{src:i,description:n?.description??``,image:n?.image??``,favicon:n?.favicon??``,title:n?.title??``},meta:{}}}catch(e){return console.error(e),{id:t.createId(a),typeName:`asset`,type:`bookmark`,props:{src:i,description:``,image:``,favicon:``,title:``},meta:{}}}}export{i as t};
//# sourceMappingURL=createAssetFromUrl-DiQMffRK.js.map
//# debugId=01dae566-94f5-5d01-92a3-c920f0cfb4fa
