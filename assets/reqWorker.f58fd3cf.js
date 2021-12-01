(()=>{(function(){"use strict";const t=self;t.addEventListener("message",e=>{const{url:n,params:a,id:c}=e.data;fetch(n,a).then(s=>s.json()).then(s=>{t.postMessage({id:c,res:s})})})})();})();
