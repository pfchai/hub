
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5dd9ef31-f073-5127-a65f-1cfa3e2fedf7")}catch(e){}}();
import{a as e,t}from"./TlaSignInDialog-DU1wP96x.js";import{Ti as n,Vi as r,di as i,er as a,ft as o,gi as s,ji as c,o as l}from"./index-ClHYEQFz.js";var u=r(c()),d=a();function f(){let[r]=i(),a=r.get(`url`),c=n(),{addDialog:f}=o(),p=s(),m=(0,u.useRef)(!1);return(0,u.useEffect)(()=>{if(!a?.trim()){p(l.tlaRoot(),{replace:!0});return}if(c.isLoaded){if(c.isSignedIn){p(l.tlaRoot(),{replace:!0,state:{importUrl:a}});return}m.current||(m.current=!0,e(),f({component:e=>(0,d.jsx)(t,{...e})}))}},[a,c.isLoaded,c.isSignedIn,f,p]),null}export{f as Component};
//# sourceMappingURL=import-CT683ayx.js.map
//# debugId=5dd9ef31-f073-5127-a65f-1cfa3e2fedf7
