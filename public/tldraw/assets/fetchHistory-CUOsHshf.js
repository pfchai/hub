
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c5651b0e-9938-57dd-ab04-185f97b7e078")}catch(e){}}();
import{Xr as e}from"./index-ClHYEQFz.js";import"./useAppState-C01-APlR.js";async function t(t,n){try{let r=await e(n?`/api/f/${t}/history?offset=${n}`:`/api/f/${t}/history`);return r.ok?await r.json():null}catch(e){return console.error(`Failed to fetch history:`,e),null}}async function n(t,n){try{let r=await e(n?`/api/f/${t}/pierre-history?nextCursor=${n}`:`/api/f/${t}/pierre-history`);return r.ok?await r.json():null}catch(e){return console.error(`Failed to fetch Pierre history:`,e),null}}export{n,t};
//# sourceMappingURL=fetchHistory-CUOsHshf.js.map
//# debugId=c5651b0e-9938-57dd-ab04-185f97b7e078
