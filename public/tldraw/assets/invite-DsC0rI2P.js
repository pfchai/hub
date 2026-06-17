
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="357f87de-7b9b-5a54-9e5a-b8da49389b2d")}catch(e){}}();
import{o as e,t}from"./TlaSignInDialog-DU1wP96x.js";import{Pr as n,Ti as r,Vi as i,_i as a,er as o,fi as s,ft as c,gi as l,ji as u}from"./index-ClHYEQFz.js";var d=i(u()),f=o();function p(e){return function(){let{token:i}=a(),o=r(),{addDialog:u}=c(),p=l(),[m,h]=(0,d.useState)(!1);return i&&n(e,i),(0,d.useEffect)(()=>{o.isLoaded&&!o.isSignedIn&&!m&&(h(!0),u({component:e=>(0,f.jsx)(t,{...e,skipRedirect:!0}),onClose:()=>p(`/`,{replace:!0})}))},[i,o.isLoaded,o.isSignedIn,u,m,p]),o.isLoaded&&o.isSignedIn?(0,f.jsx)(s,{to:`/`,replace:!0}):null}}var m=p(e.GROUP_INVITE_TOKEN);export{m as Component};
//# sourceMappingURL=invite-DsC0rI2P.js.map
//# debugId=357f87de-7b9b-5a54-9e5a-b8da49389b2d
