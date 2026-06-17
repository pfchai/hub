
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="6595e8f9-1a45-5c83-937c-68f6333dcda3")}catch(e){}}();
import{Vi as e,gi as t,ji as n,o as r}from"./index-ClHYEQFz.js";import{a as i,i as a}from"./useAppState-C01-APlR.js";var o=e(n());function s(){let e=a(),n=t(),s=i();return(0,o.useEffect)(()=>{(async()=>{if(!e){n(r.tlaRoot(),{replace:!0});return}let t=await e.createFile();if(t.ok){let{fileId:e}=t.value;n(r.tlaFile(e),{replace:!0}),s(`create-file`,{source:`new-page`})}else n(r.tlaRoot(),{replace:!0})})()},[e,n,s]),null}export{s as Component};
//# sourceMappingURL=tla-new-CgGeJCb6.js.map
//# debugId=6595e8f9-1a45-5c83-937c-68f6333dcda3
