(()=>{var it="openchamber.sdk";var wr="data-oc-scrolling",mp=`
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [${wr}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${wr}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${wr}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${wr}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function _p(n){let e=n.documentElement;if(e.hasAttribute("data-oc-scrollbar-activity"))return;e.setAttribute("data-oc-scrollbar-activity","");let t=new WeakMap;n.addEventListener("scroll",i=>{let s=i.target===n?e:i.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let r=t.get(s);r!==void 0&&clearTimeout(r),t.set(s,setTimeout(()=>{t.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var gp=`(${_p.toString()})(document);`;var Uh=n=>{let e=[],t=0,i=0;return{push:s=>{for(e.push(s),i+=s.length;i-t>n&&e.length>1;){let r=e.shift();i-=r?.length??0,t=0}},pull:s=>{let r=0;for(;r<s.length&&e.length>0;){let o=e[0],a=Math.min(s.length-r,o.length-t);s.set(o.subarray(t,t+a),r),r+=a,t+=a,t>=o.length&&(e.shift(),i-=o.length,t=0)}s.fill(0,r)},clear:()=>{e.length=0,t=0,i=0},get size(){return i-t}}};var Hh=/^[a-z][a-z0-9-]{0,39}$/;var Lh=n=>Object(n)===n&&!Array.isArray(n),va=(n,e)=>Object.keys(n).every(t=>e.includes(t)),Nh=n=>String(n)===n&&n.length>=1&&n.length<=60,Dh=n=>String(n)===n&&n.length>=1&&n.length<=80,Fh=n=>{if(!Array.isArray(n)||n.length>4)return!1;let e=new Set;for(let t of n){if(!Lh(t)||!Hh.test(t.id)||!Nh(t.label)||t.disabled!==void 0&&t.disabled!==!0&&t.disabled!==!1||e.has(t.id))return!1;if(e.add(t.id),t.kind==="button"){if(!va(t,["kind","id","label","disabled"]))return!1;continue}if(t.kind!=="select"||!va(t,["kind","id","label","value","options","disabled"])||!Dh(t.value)||!Array.isArray(t.options)||t.options.length<1||t.options.length>16)return!1;let i=new Set;for(let s of t.options){if(!Lh(s)||!va(s,["value","label"])||!Dh(s.value)||!Nh(s.label)||i.has(s.value))return!1;i.add(s.value)}if(!i.has(t.value))return!1}return!0};var xp=1024*1024;var Bh=["{id}","{segment}","{segments+}"];var IS=new Set(Bh);var zh=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var OS=new Set(zh);var ba=n=>"bytes"in n?n.bytes.byteLength:n.content.length,kh=(n,e)=>{if(n.path!==e.path||n.readOnly!==e.readOnly)return!1;if(n.encoding==="text"||e.encoding==="text")return n.encoding==="text"&&e.encoding==="text"&&n.content===e.content;if(n.bytes.byteLength!==e.bytes.byteLength)return!1;for(let t=0;t<n.bytes.byteLength;t+=1)if(n.bytes[t]!==e.bytes[t])return!1;return!0};var Gh=/^[A-Za-z0-9_-]{1,80}$/;var Vh=["left","right","top","bottom"];var Wh=(n,e=0,t={remaining:16e3})=>{if(--t.remaining<0||e>=32)return!1;if(n===null)return!0;let i=Array.isArray(n)?n:Object(n)===n?Object.values(n):[];for(let s of i)if(!Wh(s,e+1,t))return!1;return!0},Aa=n=>{if(n===null||n===!0||n===!1)return!0;if(Array.isArray(n))return Object.keys(n).every(e=>/^(0|[1-9]\d*)$/.test(e)&&Number(e)<n.length)&&n.every(Aa);if(Object(n)===n){let e=Object.getPrototypeOf(n);return(e===null||e===Object.prototype)&&Object.values(n).every(Aa)}return String(n)===n||Number.isFinite(n)},Ra=n=>{try{return String(n.id)!==n.id||!Gh.test(n.id)||!Number.isFinite(n.anchor.x)||Math.abs(n.anchor.x)>1e5||!Number.isFinite(n.anchor.y)||Math.abs(n.anchor.y)>1e5||!Number.isFinite(n.anchor.width)||!Number.isFinite(n.anchor.height)||n.anchor.width<=0||n.anchor.height<=0||n.anchor.width>1e5||n.anchor.height>1e5||!Number.isInteger(n.width)||n.width<160||n.width>640||!Number.isInteger(n.height)||n.height<48||n.height>480||n.side!==void 0&&!Vh.includes(n.side)||n.focus!==void 0&&n.focus!==!0&&n.focus!==!1||!Wh(n.data)||!Aa(n.data)?!1:JSON.stringify(n.data).length<=16e3}catch{return!1}};var Ca=2e3;var Yh=["file","directory","other","missing"],Ia=n=>!!(n&&"sessionId"in n),Pa=n=>!!(n&&"sent"in n&&!("sessionId"in n));var qh=/^[0-9a-f]{7,64}$/i,Oa=n=>qh.test(n),Cr=500,Ir=32e3,Kh=16e3,Zh=128,$h=200,Jh=2e3,jh=16e3,Qh=80,eu=200,tu=16e3;var nu=2e3;var Ua=2e4,Pr=1024,Or=2e6;var Ur=64e3,Lr=8e3,La=4e3;var Na=96e4,yp=60*6e4;var iu=999,su=1e4,Gs=500,ru=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],ou=["stopped","starting","ready","failed"],Sp=new Set(ru),au=n=>Sp.has(n),cu=n=>n&&au(n)?n:"HOST_REJECTED",Yi=n=>n===void 0?!1:n===null||n===!0||n===!1||String(n)===n?!0:Number(n)===n?Number.isFinite(n):Array.isArray(n)?n.every(Yi):Object(n)===n?Object.values(n).every(Yi):!1,lu=n=>Yi(n)&&JSON.stringify(n).length<=tu,Xh=n=>n?.trim().slice(0,eu)??"",qi=n=>{let e=n.id.trim().slice(0,Zh),t=n.title.trim().slice(0,$h),i=n.url.trim().slice(0,Jh),s=n.text?.trim().slice(0,jh),r=n.author?.trim().slice(0,Qh),o=n.kind==="pull"?"pull":"issue",a={providerId:n.providerId.trim(),id:e,title:t||e,url:i,kind:o};if(s&&(a.text=s),r&&(a.author=r),o==="pull"){let l=Xh(n.branches?.head),c=Xh(n.branches?.base);l&&c&&(a.branches={head:l,base:c})}return lu(n.data)&&(a.data=n.data),a},Da=n=>{let e=qi(n);return n.projectId&&(e.projectId=n.projectId),n.navigation&&(e.navigation=n.navigation),n.worktree&&(e.worktree=n.worktree),e},Ha=n=>{let e={text:n.text.trim().slice(0,Kh)};return n.send&&(e.send=!0),e},Fa=n=>n===null||!Number.isFinite(n)?null:Math.min(iu,Math.max(0,Math.round(n))),Ba=n=>Number.isFinite(n)?Math.min(su,Math.max(0,Math.ceil(n))):0;var Ki=n=>n.length>0&&n.length<=Pr&&!n.includes("\0")&&!n.includes("\\");var Nr=n=>!n.startsWith("/")||n.includes("\0")||n.includes("\\")||n.includes("://")||n.length>nu?!1:!n.split("/").some(t=>t==="."||t===".."),Tp=new Set(ou),za=n=>!!(n&&"status"in n&&Tp.has(String(n.status))&&!("body"in n)),Dr=n=>!!(n&&"status"in n&&"body"in n&&Number.isInteger(n.status)),ka=n=>!!(n&&"content"in n&&String(n.content)===n.content),Ga=n=>!!(n&&"written"in n&&n.written===!0),Va=n=>!!(n&&"entries"in n&&Array.isArray(n.entries)),Mp=new Set(Yh),Wa=n=>!!(n&&"kind"in n&&"size"in n&&Mp.has(String(n.kind))&&Number.isFinite(n.size)),Xa=n=>!!(n&&"text"in n&&String(n.text)===n.text&&!("status"in n)),vp=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),bp=n=>Object(n)===n?n:null,wa=n=>String(n)===n&&n.length>0,Ap=n=>{if(!wa(n.id))return null;if(n.ok===!0){let e={channel:it,v:1,type:"result",id:n.id,ok:!0};return Object(n.payload)===n.payload&&(e.payload=n.payload),e}return n.ok===!1&&wa(n.error)?{channel:it,v:1,type:"result",id:n.id,ok:!1,error:n.error,code:cu(wa(n.code)?n.code:void 0)}:null},Ya=n=>{let e=bp(n);return!e||e.channel!==it||e.v!==1?null:e.type==="result"?Ap(e):!vp.has(String(e.type))||Object(e.payload)!==e.payload?null:e};var hu=n=>"key"in n&&"metaKey"in n&&"ctrlKey"in n,Rp=n=>(n.metaKey||n.ctrlKey)&&!n.altKey&&!n.shiftKey&&n.key.toLowerCase()==="s",Be=class extends Error{code;constructor(e,t){super(t),this.name="HostRequestError",this.code=e}},uu=()=>Promise.reject(new Be("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Hr=()=>Promise.reject(new Be("BAD_PATH",`File path must be 1 to ${Pr} characters without NUL or backslash.`)),Fr=n=>{if(n!==void 0){if(Object(n)!==n||Array.isArray(n)||n.scope!==void 0&&n.scope!=="instance"&&n.scope!=="device")throw new Be("HOST_REJECTED",'Storage scope must be "instance" or "device".');return n.scope==="device"?"device":void 0}},Xe=n=>(n.value+=1,`oc-${n.value}`),Ja=(n={})=>{let e=n.target??("window"in globalThis?window:null);if(!e)throw new Be("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let t=n.acceptSource??(v=>v===e.parent),i=n.requestTimeoutMs??Ua,s=new Set,r=new Set,o=new Set,a=new Set,l=new Set,c=new Set,h=new Set,d=new Set,f=new Set,u=new Set,m=new Set,g=new Set,_=[],p=null,S=null,x=new Set,E=new Set,D=null,w=null,O=!1,U=new Map,T=new Map,y=new Map,P=!1,F={value:0},L=null,B=null,Z=!1,G=!1,se=null,K=null,ge=v=>v?{sessionId:v.id,phase:v.busy?"started":"completed"}:null,pe=v=>{e.parent.postMessage(v,"*")},Se=()=>{P||e.parent===e||g.size===0||L?.features?.lateGenerateResults!==!0||pe({channel:it,v:1,type:"generate-late-listen"})},ve=(v,C)=>{for(let ie of v)try{ie(C)}catch(Q){console.error(Q)}},tt=v=>{if(!(v instanceof MessageEvent)||!t(v.source))return;let C=Ya(v.data);if(!C)return;if(C.type==="workspace"){let Q=T.get(C.payload.subscriptionId);Q&&ve([Q],C.payload.snapshot);return}if(C.type==="shells"){let Q=y.get(C.payload.subscriptionId);Q&&ve([Q],C.payload.snapshot);return}if(C.type==="microphone-audio"){K?.queue.push(C.payload.samples);return}if(C.type==="microphone-ended"){let Q=K;if(!Q)return;K=null,Q.release(),ve(Q.endedListeners,C.payload.reason);return}if(C.type==="ready"){L=C.payload,B=ge(C.payload.session),ve(s,C.payload),ve(r,C.payload.directory),ve(o,C.payload.session),B&&ve(a,B),ve(l,C.payload.connection),ve(c,C.payload.settings),ve(h,C.payload.item),C.payload.block&&ve(d,C.payload.block),Se();return}if(C.type==="service-event"){ve(f,C.payload);return}if(C.type==="generate-late"){g.size===0?_.push(C.payload):ve(g,C.payload);return}if(C.type==="directory"){L&&(L={...L,directory:C.payload.directory}),ve(r,C.payload.directory);return}if(C.type==="session"){L&&(L={...L,session:C.payload.session}),C.payload.session?B?.sessionId!==C.payload.session.id&&(B=ge(C.payload.session)):B=null,ve(o,C.payload.session);return}if(C.type==="session-lifecycle"){B=C.payload,ve(a,C.payload);return}if(C.type==="connection"){L&&(L={...L,connection:C.payload.connection}),ve(l,C.payload.connection);return}if(C.type==="settings"){L&&(L={...L,settings:C.payload.settings}),ve(c,C.payload.settings);return}if(C.type==="item"){L&&(L={...L,item:C.payload.item}),ve(h,C.payload.item);return}if(C.type==="status-control-event"){ve(u,C.payload);return}if(C.type==="popover-closed"){ve(m,C.payload);return}if(C.type==="action"){let Q=Ae=>{P||pe({channel:it,v:1,type:"action-result",id:C.id,payload:Ae})},ce=S;if(!ce){Q({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>ce(C.payload)).then(()=>Q({ok:!0}),Ae=>{let re=(Ae instanceof Error?Ae.message:String(Ae)).trim();Q({ok:!1,error:(re||"Action failed.").slice(0,Gs)})});return}if(C.type==="file-open"){let Q=C.payload;if(w&&kh(w,Q))return;w=Q,ve(x,C.payload);return}if(C.type==="file-saved"){ve(E,C.payload.version);return}if(C.type==="file-snapshot"){let Q=re=>{P||pe({channel:it,v:1,type:"file-snapshot-result",id:C.id,payload:re})},ce=re=>Q({error:(re.trim()||"Could not read the edited file.").slice(0,Gs)}),Ae=D;if(!Ae){ce("This extension does not edit files.");return}Promise.resolve().then(()=>Ae(C.payload.purpose)).then(re=>{if(ba(re)>2e7){ce(`The file is over ${2e7} ${"bytes"in re?"bytes":"characters"}.`);return}if(re.version.length>256){ce(`The snapshot version is over ${256} characters.`);return}Q({snapshot:"bytes"in re?{bytes:re.bytes,version:re.version}:{content:re.content,version:re.version}})},re=>ce(re instanceof Error?re.message:String(re)));return}if(C.type==="resolve"){let Q=Ae=>{pe({channel:it,v:1,type:"resolve-result",id:C.id,payload:Ae})},ce=p;if(!ce){Q({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>ce(C.payload)).then(Ae=>Q({item:Ae?qi(Ae):null}),Ae=>{let re=(Ae instanceof Error?Ae.message:String(Ae)).trim();Q({error:(re||"Command failed.").slice(0,Gs)})});return}let ie=U.get(C.id);if(ie){if(clearTimeout(ie.timer),U.delete(C.id),C.ok){ie.resolve(C.payload);return}ie.reject(new Be(C.code,C.error))}};e.addEventListener("message",tt),pe({channel:it,v:1,type:"hello"});let ee=(v,C=i)=>P||e.parent===e?Promise.reject(new Be("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((ie,Q)=>{let ce=setTimeout(()=>{U.delete(v.id),Q(new Be("HOST_TIMEOUT","Host did not answer in time."))},C);U.set(v.id,{resolve:ie,reject:Q,timer:ce}),pe(v)}),ae=v=>ee(v).then(()=>{}),_e={channel:it,v:1},me=v=>{!P&&e.parent!==e&&pe(v)},Ne=()=>me({..._e,type:"file-save"}),Ve=()=>{!P&&e.parent!==e&&pe({..._e,type:"microphone-close",id:Xe(F)})},ze=async()=>{if(K)throw new Be("HOST_REJECTED","The microphone is already open in this frame.");if(L?.features?.microphone!==!0)throw new Be("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let v=globalThis.AudioContext;if(typeof v!="function")throw new Be("UNSUPPORTED","This frame has no Web Audio.");let C=new v;if(C.sampleRate<8e3||C.sampleRate>192e3)throw C.close().catch(()=>{}),new Be("UNSUPPORTED",`Audio at ${C.sampleRate} Hz is not supported.`);let ie=C.state==="suspended"?C.resume().catch(()=>{}):void 0,Q=Uh(Math.round(C.sampleRate/4)),ce=C.createScriptProcessor(1024,1,1);ce.onaudioprocess=Ce=>Q.pull(Ce.outputBuffer.getChannelData(0));let Ae=C.createMediaStreamDestination();ce.connect(Ae);let re=new Set,ye={queue:Q,endedListeners:re,release:()=>{ce.onaudioprocess=null,ce.disconnect(),Q.clear();for(let Ce of Ae.stream.getTracks())Ce.stop();C.close().catch(()=>{})}};K=ye;try{let Ce=await ee({..._e,type:"microphone-open",id:Xe(F),payload:{sampleRate:C.sampleRate}},12e4);if(!Ce||!("opened"in Ce)||Ce.opened!==!0)throw new Be("HOST_REJECTED","Host did not open the microphone.");if(await ie,K!==ye)throw new Be("DISCONNECTED","The microphone closed while it was opening.")}catch(Ce){throw K===ye&&(K=null),ye.release(),Ve(),Ce}return{stream:Ae.stream,close:()=>{K===ye&&(K=null,ye.release(),Ve())},onEnded:Ce=>(re.add(Ce),()=>{re.delete(Ce)})}},Je=v=>{!hu(v)||!Rp(v)||(v.preventDefault(),Ne())},oe=v=>{!hu(v)||v.key!=="Escape"||L?.surface!=="popover"||!L.popover||(v.preventDefault(),q(L.popover.id,"escape").catch(()=>{}))},de=()=>{let v=L?.surface==="popover"?L.popover:void 0;if(!v)return;let C=Z||G;se!==C&&(se=C,ne(v.id,C).catch(()=>{}))},H=()=>{L?.surface!=="popover"||Z||(Z=!0,de())},Ie=v=>{L?.surface!=="popover"||v.relatedTarget!==null||!Z||(Z=!1,de())},he=()=>{L?.surface!=="popover"||G||(G=!0,de())},Me=()=>{L?.surface!=="popover"||!G||(G=!1,de())},fe=(v,C=1024)=>{if(!v.trim()||v.length>C)throw new Be("HOST_REJECTED",`Identity must contain 1 to ${C} characters.`)},Fe=async v=>{v.kind!=="projects"&&fe(v.projectId);let C=await ee({..._e,type:"workspace-read",id:Xe(F),payload:v});if(!C||!("kind"in C)||!("state"in C)||C.kind!==v.kind)throw new Be("HOST_REJECTED","Host did not return workspace data.");return C},Te=async(v,C)=>{v.kind!=="projects"&&fe(v.projectId);let ie=Xe(F);T.set(ie,C);try{await ae({..._e,type:"workspace-subscribe",id:Xe(F),payload:{subscriptionId:ie,query:v}})}catch(Q){throw T.delete(ie),P||pe({..._e,type:"workspace-unsubscribe",id:Xe(F),payload:{subscriptionId:ie}}),Q}return()=>{!T.delete(ie)||P||pe({..._e,type:"workspace-unsubscribe",id:Xe(F),payload:{subscriptionId:ie}})}},I=async(v,C)=>{v.kind==="session"&&fe(v.sessionId),v.kind==="project"&&fe(v.projectId);let ie=Xe(F);y.set(ie,C);try{await ae({..._e,type:"shells-subscribe",id:Xe(F),payload:{subscriptionId:ie,scope:v}})}catch(Q){throw y.delete(ie),P||pe({..._e,type:"shells-unsubscribe",id:Xe(F),payload:{subscriptionId:ie}}),Q}return()=>{!y.delete(ie)||P||pe({..._e,type:"shells-unsubscribe",id:Xe(F),payload:{subscriptionId:ie}})}},M=async v=>{if("key"in v&&(v.key.length===0||v.key.length>128))throw new Be("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(v.op==="set"&&!Yi(v.value))throw new Be("HOST_REJECTED","Storage values must be JSON.");if(v.op==="set"&&new TextEncoder().encode(JSON.stringify(v.value)).length>65536)throw new Be("HOST_REJECTED","Storage value exceeds 64 KiB.");if(v.scope==="device"&&L?.features?.deviceStorage!==!0)throw new Be("UNSUPPORTED","This host does not support device storage.");let C=await ee({..._e,type:"storage",id:Xe(F),payload:v});if(!C||!("storage"in C)||C.op!==v.op)throw new Be("HOST_REJECTED","Host did not return storage data.");return C},q=(v,C)=>L?.features?.popovers!==!0&&!(L?.surface==="popover"&&L.popover?.id===v)?Promise.reject(new Be("UNSUPPORTED","This host does not support popovers.")):ae({..._e,type:"popover-close",id:Xe(F),payload:C?{id:v,reason:C}:{id:v}}),ne=(v,C)=>L?.features?.popovers!==!0&&!(L?.surface==="popover"&&L.popover?.id===v)?Promise.reject(new Be("UNSUPPORTED","This host does not support popovers.")):ae({..._e,type:"popover-anchor",id:Xe(F),payload:{id:v,active:C}});return e.addEventListener("keydown",oe,!0),e.addEventListener("pointerover",H),e.addEventListener("pointermove",H),e.addEventListener("pointerout",Ie),e.addEventListener("focus",he),e.addEventListener("blur",Me),{onAction:v=>(S=v,()=>{S===v&&(S=null)}),listProjects:async()=>{let v=await Fe({kind:"projects"});if(v.kind!=="projects")throw new Be("HOST_REJECTED","Expected projects.");return v},listWorktrees:async v=>{let C=await Fe({kind:"worktrees",projectId:v});if(C.kind!=="worktrees")throw new Be("HOST_REJECTED","Expected worktrees.");return C},listSessions:async v=>{let C=await Fe({kind:"sessions",projectId:v});if(C.kind!=="sessions")throw new Be("HOST_REJECTED","Expected sessions.");return C},onProjects:v=>Te({kind:"projects"},C=>{C.kind==="projects"&&v(C)}),onWorktrees:(v,C)=>Te({kind:"worktrees",projectId:v},ie=>{ie.kind==="worktrees"&&C(ie)}),onSessions:(v,C)=>Te({kind:"sessions",projectId:v},ie=>{ie.kind==="sessions"&&C(ie)}),onRunningShells:(v,C)=>I(v,C),readShellOutput:async(v,C)=>{fe(v,128);let ie=C?.cursor;if(ie!==void 0&&(!Number.isInteger(ie)||ie<0))throw new Be("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let Q=C?.tailBytes;if(Q!==void 0&&(!Number.isInteger(Q)||Q<1||Q>65536))throw new Be("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let Ae=await ee({..._e,type:"shell-output",id:Xe(F),payload:{shellId:v,cursor:ie,tailBytes:Q}});if(!Ae||typeof Ae.output!="string"||!Number.isFinite(Ae.cursor))throw new Be("HOST_REJECTED","Host did not return shell output.");return Ae},stopShell:async v=>{if(fe(v,128),(await ee({..._e,type:"shell-stop",id:Xe(F),payload:{shellId:v}}))?.stopped!==!0)throw new Be("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async v=>{fe(v),await ae({..._e,type:"open-session",id:Xe(F),payload:{sessionId:v}})},storage:{get:async(v,C)=>{let ie=Fr(C),Q={op:"get",key:v};ie&&(Q.scope=ie);let ce=await M(Q);return ce.op==="get"&&ce.found?ce.value:void 0},set:async(v,C,ie)=>{let Q=Fr(ie),ce={op:"set",key:v,value:C};Q&&(ce.scope=Q),await M(ce)},delete:async(v,C)=>{let ie=Fr(C),Q={op:"delete",key:v};ie&&(Q.scope=ie),await M(Q)},keys:async v=>{let C=Fr(v),ie={op:"keys"};C&&(ie.scope=C);let Q=await M(ie);if(Q.op!=="keys")throw new Be("HOST_REJECTED","Expected storage keys.");return Q.keys}},onReady:v=>(s.add(v),L&&v(L),()=>{s.delete(v)}),onDirectory:v=>(r.add(v),L&&v(L.directory),()=>{r.delete(v)}),onSession:v=>(o.add(v),L&&v(L.session),()=>{o.delete(v)}),onSessionLifecycle:v=>(a.add(v),B&&v(B),()=>{a.delete(v)}),onConnection:v=>(l.add(v),L&&v(L.connection),()=>{l.delete(v)}),onSettings:v=>(c.add(v),L&&v(L.settings),()=>{c.delete(v)}),onItem:v=>(h.add(v),L&&v(L.item),()=>{h.delete(v)}),onBlock:v=>(d.add(v),L?.block&&v(L.block),()=>{d.delete(v)}),onServiceEvent:v=>(f.add(v),()=>{f.delete(v)}),onStatusControl:v=>(u.add(v),()=>{u.delete(v)}),onPopoverClosed:v=>(m.add(v),()=>{m.delete(v)}),setStatusControls:v=>L?.features?.statusControls!==!0?Promise.reject(new Be("UNSUPPORTED","This host does not support status controls.")):Fh(v)?ae({..._e,type:"status-controls",id:Xe(F),payload:{controls:v}}):Promise.reject(new Be("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:v=>L?.features?.popovers!==!0?Promise.reject(new Be("UNSUPPORTED","This host does not support popovers.")):Ra(v)?ae({..._e,type:"popover-open",id:Xe(F),payload:v}):Promise.reject(new Be("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:q,setPopoverAnchorActive:ne,onResolve:v=>(p=v,()=>{p===v&&(p=null)}),toast:v=>{let C=v.message.trim();return!C||C.length>Cr?Promise.reject(new Be("HOST_REJECTED",`Toast message must contain 1 to ${Cr} characters.`)):v.copy&&v.copy!==!0&&(!v.copy.text.length||v.copy.text.length>Ir)?Promise.reject(new Be("HOST_REJECTED",`Toast copy text must contain 1 to ${Ir} characters.`)):ae({channel:it,v:1,type:"toast",id:Xe(F),payload:{...v,message:C}})},openUrl:v=>ae({channel:it,v:1,type:"open-url",id:Xe(F),payload:{url:v}}),openCommit:v=>Oa(v)?ae({channel:it,v:1,type:"open-commit",id:Xe(F),payload:{sha:v}}):Promise.reject(new Be("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:v=>ae({channel:it,v:1,type:"block-answer",id:Xe(F),payload:{text:v.trim().slice(0,Ca)}}),openSurface:v=>ae({channel:it,v:1,type:"open-surface",id:Xe(F),payload:{surfaceId:v}}),writeClipboard:v=>ae({channel:it,v:1,type:"clipboard-write",id:Xe(F),payload:{text:v}}),compose:v=>ae({channel:it,v:1,type:"compose",id:Xe(F),payload:v}),attach:v=>ae({channel:it,v:1,type:"attach",id:Xe(F),payload:qi(v)}),startSession:async v=>{v.projectId!==void 0&&fe(v.projectId);let C=v.worktree;C&&C!==!0&&(C.kind==="existing"?fe(C.directory):(C.name!==void 0&&fe(C.name,200),C.baseBranch!==void 0&&fe(C.baseBranch,200)));let ie=await ee({channel:it,v:1,type:"start-session",id:Xe(F),payload:Da(v)},n.requestTimeoutMs??18e4);if(!Ia(ie))throw new Be("HOST_REJECTED","Host did not return a session.");return ie},prompt:v=>ee({channel:it,v:1,type:"prompt",id:Xe(F),payload:Ha(v)}).then(C=>{if(!Pa(C))throw new Be("HOST_REJECTED","Host did not return a prompt result.");return C}),sessionLink:v=>ae({channel:it,v:1,type:"session-link",id:Xe(F),payload:qi(v)}),close:()=>ae({channel:it,v:1,type:"close",id:Xe(F)}),oauthStart:()=>ae({channel:it,v:1,type:"oauth-start",id:Xe(F)}),oauthDisconnect:()=>ae({channel:it,v:1,type:"oauth-disconnect",id:Xe(F)}),request:v=>(Nr(v.path)?ee({channel:it,v:1,type:"request",id:Xe(F),payload:v}):uu()).then(C=>{if(!Dr(C))throw new Be("HOST_REJECTED","Host request result was empty.");return C}),serviceRequest:v=>(Nr(v.path)?ee({channel:it,v:1,type:"service-request",id:Xe(F),payload:v}):uu()).then(C=>{if(!Dr(C))throw new Be("HOST_REJECTED","Host service request result was empty.");return C}),serviceStatus:()=>ee({channel:it,v:1,type:"service-status",id:Xe(F)}).then(v=>{if(!za(v))throw new Be("HOST_REJECTED","Host did not return service status.");return v}),readFile:v=>(Ki(v)?ee({channel:it,v:1,type:"file-read",id:Xe(F),payload:{path:v}}):Hr()).then(C=>{if(!ka(C))throw new Be("HOST_REJECTED","Host did not return file content.");return C}),writeFile:(v,C)=>Ki(v)?C.length>Or?Promise.reject(new Be("FILE_TOO_LARGE",`Content is over ${Or} characters.`)):ee({channel:it,v:1,type:"file-write",id:Xe(F),payload:{path:v,content:C}}).then(ie=>{if(!Ga(ie))throw new Be("HOST_REJECTED","Host did not confirm the write.");return ie}):Hr(),listDir:v=>(Ki(v)?ee({channel:it,v:1,type:"file-list",id:Xe(F),payload:{path:v}}):Hr()).then(C=>{if(!Va(C))throw new Be("HOST_REJECTED","Host did not return directory entries.");return C}),stat:v=>(Ki(v)?ee({channel:it,v:1,type:"file-stat",id:Xe(F),payload:{path:v}}):Hr()).then(C=>{if(!Wa(C))throw new Be("HOST_REJECTED","Host did not return file status.");return C}),generate:v=>{let C=v.prompt.trim(),ie=v.system?.trim();if(C.length===0||C.length>Ur)return Promise.reject(new Be("HOST_REJECTED",`Prompt must be 1 to ${Ur} characters.`));if(ie!==void 0&&(ie.length===0||ie.length>Lr))return Promise.reject(new Be("HOST_REJECTED",`System prompt must be 1 to ${Lr} characters.`));let Q=v.maxOutputTokens===void 0?void 0:Math.min(La,Math.max(1,Math.floor(v.maxOutputTokens)));if(Q!==void 0&&!Number.isFinite(Q))return Promise.reject(new Be("HOST_REJECTED","maxOutputTokens must be a number."));let ce={prompt:C};return ie!==void 0&&(ce.system=ie),Q!==void 0&&(ce.maxOutputTokens=Q),ee({channel:it,v:1,type:"generate",id:Xe(F),payload:ce},n.requestTimeoutMs??Na).then(Ae=>{if(!Xa(Ae))throw new Be("HOST_REJECTED","Host did not return generated text.");return Ae})},onLateGenerateResult:v=>{g.add(v);for(let C of _.splice(0))ve([v],C);return Se(),()=>{g.delete(v)}},openMicrophone:ze,setBadge:v=>ae({channel:it,v:1,type:"badge",id:Xe(F),payload:{count:Fa(v)}}),setHeight:v=>ae({channel:it,v:1,type:"resize",id:Xe(F),payload:{height:Ba(v)}}),onFileOpen:v=>(x.add(v),O||(O=!0,e.addEventListener("keydown",Je,!0)),w&&v(w),()=>{x.delete(v)}),onFileSnapshot:v=>(D=v,()=>{D===v&&(D=null)}),onFileSaved:v=>(E.add(v),()=>{E.delete(v)}),reportFileChange:v=>me({..._e,type:"file-change",payload:{dirty:v.dirty,edited:v.edited}}),requestFileSave:Ne,reportFileUnsupported:()=>me({..._e,type:"file-unsupported"}),dispose:()=>{for(let v of T.keys())pe({..._e,type:"workspace-unsubscribe",id:Xe(F),payload:{subscriptionId:v}});T.clear();for(let v of y.keys())pe({..._e,type:"shells-unsubscribe",id:Xe(F),payload:{subscriptionId:v}});y.clear(),K&&(Ve(),K.release(),K=null),P=!0,p=null,S=null,D=null,x.clear(),E.clear(),O&&e.removeEventListener("keydown",Je,!0),e.removeEventListener("message",tt),e.removeEventListener("keydown",oe,!0),e.removeEventListener("pointerover",H),e.removeEventListener("pointermove",H),e.removeEventListener("pointerout",Ie),e.removeEventListener("focus",he),e.removeEventListener("blur",Me);for(let v of U.values())clearTimeout(v.timer),v.reject(new Be("HOST_UNAVAILABLE","Host client was disposed."));U.clear(),s.clear(),r.clear(),o.clear(),a.clear(),l.clear(),c.clear(),h.clear(),d.clear(),f.clear(),u.clear(),m.clear(),g.clear(),_.length=0}}};var gu=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var ZS=new Set(gu);var wp=10*6e4;var Cp=10*6e4;var Ip=10*6e4;var Pp=10*6e4;var Eu=["none","agent","user"];var JS=new Set(Eu);var Hi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Fi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Op=0,xu=1,Up=2;var Ud=1,Ql=2,Dn=3,ui=0,Kt=1,Ft=2,li=0,fs=1,zn=2,yu=3,Su=4,Lp=5,wi=100,Np=101,Dp=102,Hp=103,Fp=104,Bp=200,zp=201,kp=202,Gp=203,Pc=204,Oc=205,Vp=206,Wp=207,Xp=208,Yp=209,qp=210,Kp=211,Zp=212,$p=213,Jp=214,Uc=0,Lc=1,Nc=2,gs=3,Dc=4,Hc=5,Fc=6,Bc=7,Ld=0,jp=1,Qp=2,hi=0,em=1,tm=2,nm=3,eh=4,im=5,sm=6,rm=7;var Nd=300,Es=301,xs=302,zc=303,kc=304,ea=306,ys=1e3,Hn=1001,Gc=1002,tn=1003,om=1004;var Br=1005;var Mn=1006,ja=1007;var Pi=1008;var kn=1009,Dd=1010,Hd=1011,sr=1012,th=1013,Oi=1014,vn=1015,gr=1016,nh=1017,ih=1018,Ss=1020,Fd=35902,Bd=1021,zd=1022,_n=1023,kd=1024,Gd=1025,ps=1026,Ts=1027,sh=1028,rh=1029,Vd=1030,oh=1031;var ah=1033,po=33776,mo=33777,_o=33778,go=33779,Vc=35840,Wc=35841,Xc=35842,Yc=35843,qc=36196,Kc=37492,Zc=37496,$c=37808,Jc=37809,jc=37810,Qc=37811,el=37812,tl=37813,nl=37814,il=37815,sl=37816,rl=37817,ol=37818,al=37819,cl=37820,ll=37821,Eo=36492,hl=36494,ul=36495,Wd=36283,dl=36284,fl=36285,pl=36286;var xo=2300,ml=2301,Qa=2302,Tu=2400,Mu=2401,vu=2402;var am=3200,cm=3201;var Xd=0,lm=1,ci="",At="srgb",ws="srgb-linear",ta="linear",ft="srgb";var Zi=7680;var bu=519,hm=512,um=513,dm=514,Yd=515,fm=516,pm=517,mm=518,_m=519,Au=35044;var Ru="300 es",Fn=2e3,yo=2001,Gn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let s=this._listeners[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let i=this._listeners[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},zt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],wu=1234567,js=Math.PI/180,rr=180/Math.PI;function Bi(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(zt[n&255]+zt[n>>8&255]+zt[n>>16&255]+zt[n>>24&255]+"-"+zt[e&255]+zt[e>>8&255]+"-"+zt[e>>16&15|64]+zt[e>>24&255]+"-"+zt[t&63|128]+zt[t>>8&255]+"-"+zt[t>>16&255]+zt[t>>24&255]+zt[i&255]+zt[i>>8&255]+zt[i>>16&255]+zt[i>>24&255]).toLowerCase()}function wt(n,e,t){return Math.max(e,Math.min(t,n))}function ch(n,e){return(n%e+e)%e}function gm(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function Em(n,e,t){return n!==e?(t-n)/(e-n):0}function Qs(n,e,t){return(1-t)*n+t*e}function xm(n,e,t,i){return Qs(n,e,1-Math.exp(-t*i))}function ym(n,e=1){return e-Math.abs(ch(n,e*2)-e)}function Sm(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function Tm(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function Mm(n,e){return n+Math.floor(Math.random()*(e-n+1))}function vm(n,e){return n+Math.random()*(e-n)}function bm(n){return n*(.5-Math.random())}function Am(n){n!==void 0&&(wu=n);let e=wu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Rm(n){return n*js}function wm(n){return n*rr}function Cm(n){return(n&n-1)===0&&n!==0}function Im(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Pm(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Om(n,e,t,i,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+i)/2),h=o((e+i)/2),d=r((e-i)/2),f=o((e-i)/2),u=r((i-e)/2),m=o((i-e)/2);switch(s){case"XYX":n.set(a*h,l*d,l*f,a*c);break;case"YZY":n.set(l*f,a*h,l*d,a*c);break;case"ZXZ":n.set(l*d,l*f,a*h,a*c);break;case"XZX":n.set(a*h,l*m,l*u,a*c);break;case"YXY":n.set(l*u,a*h,l*m,a*c);break;case"ZYZ":n.set(l*m,l*u,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function hs(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Wt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var na={DEG2RAD:js,RAD2DEG:rr,generateUUID:Bi,clamp:wt,euclideanModulo:ch,mapLinear:gm,inverseLerp:Em,lerp:Qs,damp:xm,pingpong:ym,smoothstep:Sm,smootherstep:Tm,randInt:Mm,randFloat:vm,randFloatSpread:bm,seededRandom:Am,degToRad:Rm,radToDeg:wm,isPowerOfTwo:Cm,ceilPowerOfTwo:Im,floorPowerOfTwo:Pm,setQuaternionFromProperEuler:Om,normalize:Wt,denormalize:hs},le=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(wt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ze=class n{constructor(e,t,i,s,r,o,a,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],d=i[7],f=i[2],u=i[5],m=i[8],g=s[0],_=s[3],p=s[6],S=s[1],x=s[4],E=s[7],D=s[2],w=s[5],O=s[8];return r[0]=o*g+a*S+l*D,r[3]=o*_+a*x+l*w,r[6]=o*p+a*E+l*O,r[1]=c*g+h*S+d*D,r[4]=c*_+h*x+d*w,r[7]=c*p+h*E+d*O,r[2]=f*g+u*S+m*D,r[5]=f*_+u*x+m*w,r[8]=f*p+u*E+m*O,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-i*r*h+i*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],d=h*o-a*c,f=a*l-h*r,u=c*r-o*l,m=t*d+i*f+s*u;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let g=1/m;return e[0]=d*g,e[1]=(s*c-h*i)*g,e[2]=(a*i-s*o)*g,e[3]=f*g,e[4]=(h*t-s*l)*g,e[5]=(s*r-a*t)*g,e[6]=u*g,e[7]=(i*l-c*t)*g,e[8]=(o*t-i*r)*g,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(ec.makeScale(e,t)),this}rotate(e){return this.premultiply(ec.makeRotation(-e)),this}translate(e,t){return this.premultiply(ec.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},ec=new Ze;function qd(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function So(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Um(){let n=So("canvas");return n.style.display="block",n}var Cu={};function $s(n){n in Cu||(Cu[n]=!0,console.warn(n))}function Lm(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}function Nm(n){let e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Dm(n){let e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var ct={enabled:!0,workingColorSpace:ws,spaces:{},convert:function(n,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===ft&&(n.r=Bn(n.r),n.g=Bn(n.g),n.b=Bn(n.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(n.applyMatrix3(this.spaces[e].toXYZ),n.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===ft&&(n.r=ms(n.r),n.g=ms(n.g),n.b=ms(n.b))),n},fromWorkingColorSpace:function(n,e){return this.convert(n,this.workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===ci?ta:this.spaces[n].transfer},getLuminanceCoefficients:function(n,e=this.workingColorSpace){return n.fromArray(this.spaces[e].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,e,t){return n.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace}};function Bn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function ms(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Iu=[.64,.33,.3,.6,.15,.06],Pu=[.2126,.7152,.0722],Ou=[.3127,.329],Uu=new Ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Lu=new Ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);ct.define({[ws]:{primaries:Iu,whitePoint:Ou,transfer:ta,toXYZ:Uu,fromXYZ:Lu,luminanceCoefficients:Pu,workingColorSpaceConfig:{unpackColorSpace:At},outputColorSpaceConfig:{drawingBufferColorSpace:At}},[At]:{primaries:Iu,whitePoint:Ou,transfer:ft,toXYZ:Uu,fromXYZ:Lu,luminanceCoefficients:Pu,outputColorSpaceConfig:{drawingBufferColorSpace:At}}});var $i,_l=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{$i===void 0&&($i=So("canvas")),$i.width=e.width,$i.height=e.height;let i=$i.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=$i}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=So("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Bn(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Bn(t[i]/255)*255):t[i]=Bn(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Hm=0,To=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Hm++}),this.uuid=Bi(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(tc(s[o].image)):r.push(tc(s[o]))}else r=tc(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function tc(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?_l.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Fm=0,Zt=class n extends Gn{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Hn,s=Hn,r=Mn,o=Pi,a=_n,l=kn,c=n.DEFAULT_ANISOTROPY,h=ci){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Fm++}),this.uuid=Bi(),this.name="",this.source=new To(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new le(0,0),this.repeat=new le(1,1),this.center=new le(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Nd)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ys:e.x=e.x-Math.floor(e.x);break;case Hn:e.x=e.x<0?0:1;break;case Gc:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ys:e.y=e.y-Math.floor(e.y);break;case Hn:e.y=e.y<0?0:1;break;case Gc:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Zt.DEFAULT_IMAGE=null;Zt.DEFAULT_MAPPING=Nd;Zt.DEFAULT_ANISOTROPY=1;var pt=class n{constructor(e=0,t=0,i=0,s=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,l=e.elements,c=l[0],h=l[4],d=l[8],f=l[1],u=l[5],m=l[9],g=l[2],_=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(d-g)<.01&&Math.abs(m-_)<.01){if(Math.abs(h+f)<.1&&Math.abs(d+g)<.1&&Math.abs(m+_)<.1&&Math.abs(c+u+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,E=(u+1)/2,D=(p+1)/2,w=(h+f)/4,O=(d+g)/4,U=(m+_)/4;return x>E&&x>D?x<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(x),s=w/i,r=O/i):E>D?E<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(E),i=w/s,r=U/s):D<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(D),i=O/r,s=U/r),this.set(i,s,r,t),this}let S=Math.sqrt((_-m)*(_-m)+(d-g)*(d-g)+(f-h)*(f-h));return Math.abs(S)<.001&&(S=1),this.x=(_-m)/S,this.y=(d-g)/S,this.z=(f-h)/S,this.w=Math.acos((c+u+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},gl=class extends Gn{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new pt(0,0,e,t),this.scissorTest=!1,this.viewport=new pt(0,0,e,t);let s={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Mn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);let r=new Zt(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);r.flipY=!1,r.generateMipmaps=i.generateMipmaps,r.internalFormat=i.internalFormat,this.textures=[];let o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,s=e.textures.length;i<s;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new To(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Vn=class extends gl{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Mo=class extends Zt{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=tn,this.minFilter=tn,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var El=class extends Zt{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=tn,this.minFilter=tn,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Nt=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],h=i[s+2],d=i[s+3],f=r[o+0],u=r[o+1],m=r[o+2],g=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d;return}if(a===1){e[t+0]=f,e[t+1]=u,e[t+2]=m,e[t+3]=g;return}if(d!==g||l!==f||c!==u||h!==m){let _=1-a,p=l*f+c*u+h*m+d*g,S=p>=0?1:-1,x=1-p*p;if(x>Number.EPSILON){let D=Math.sqrt(x),w=Math.atan2(D,p*S);_=Math.sin(_*w)/D,a=Math.sin(a*w)/D}let E=a*S;if(l=l*_+f*E,c=c*_+u*E,h=h*_+m*E,d=d*_+g*E,_===1-a){let D=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=D,c*=D,h*=D,d*=D}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,s,r,o){let a=i[s],l=i[s+1],c=i[s+2],h=i[s+3],d=r[o],f=r[o+1],u=r[o+2],m=r[o+3];return e[t]=a*m+h*d+l*u-c*f,e[t+1]=l*m+h*f+c*d-a*u,e[t+2]=c*m+h*u+a*f-l*d,e[t+3]=h*m-a*d-l*f-c*u,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(s/2),d=a(r/2),f=l(i/2),u=l(s/2),m=l(r/2);switch(o){case"XYZ":this._x=f*h*d+c*u*m,this._y=c*u*d-f*h*m,this._z=c*h*m+f*u*d,this._w=c*h*d-f*u*m;break;case"YXZ":this._x=f*h*d+c*u*m,this._y=c*u*d-f*h*m,this._z=c*h*m-f*u*d,this._w=c*h*d+f*u*m;break;case"ZXY":this._x=f*h*d-c*u*m,this._y=c*u*d+f*h*m,this._z=c*h*m+f*u*d,this._w=c*h*d-f*u*m;break;case"ZYX":this._x=f*h*d-c*u*m,this._y=c*u*d+f*h*m,this._z=c*h*m-f*u*d,this._w=c*h*d+f*u*m;break;case"YZX":this._x=f*h*d+c*u*m,this._y=c*u*d+f*h*m,this._z=c*h*m-f*u*d,this._w=c*h*d-f*u*m;break;case"XZY":this._x=f*h*d-c*u*m,this._y=c*u*d-f*h*m,this._z=c*h*m+f*u*d,this._w=c*h*d+f*u*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],d=t[10],f=i+a+d;if(f>0){let u=.5/Math.sqrt(f+1);this._w=.25/u,this._x=(h-l)*u,this._y=(r-c)*u,this._z=(o-s)*u}else if(i>a&&i>d){let u=2*Math.sqrt(1+i-a-d);this._w=(h-l)/u,this._x=.25*u,this._y=(s+o)/u,this._z=(r+c)/u}else if(a>d){let u=2*Math.sqrt(1+a-i-d);this._w=(r-c)/u,this._x=(s+o)/u,this._y=.25*u,this._z=(l+h)/u}else{let u=2*Math.sqrt(1+d-i-a);this._w=(o-s)/u,this._x=(r+c)/u,this._y=(l+h)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(wt(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-s*a,this._w=o*h-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+i*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let u=1-t;return this._w=u*o+t*this._w,this._x=u*i+t*this._x,this._y=u*s+t*this._y,this._z=u*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),d=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=o*d+this._w*f,this._x=i*d+this._x*f,this._y=s*d+this._y*f,this._z=r*d+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},N=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Nu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Nu.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),h=2*(a*t-r*s),d=2*(r*i-o*t);return this.x=t+l*c+o*d-a*h,this.y=i+l*h+a*c-r*d,this.z=s+l*d+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return nc.copy(this).projectOnVector(e),this.sub(nc)}reflect(e){return this.sub(nc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(wt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},nc=new N,Nu=new Nt,Wn=class{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(dn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(dn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=dn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,dn):dn.fromBufferAttribute(r,o),dn.applyMatrix4(e.matrixWorld),this.expandByPoint(dn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),zr.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),zr.copy(i.boundingBox)),zr.applyMatrix4(e.matrixWorld),this.union(zr)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,dn),dn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Vs),kr.subVectors(this.max,Vs),Ji.subVectors(e.a,Vs),ji.subVectors(e.b,Vs),Qi.subVectors(e.c,Vs),ni.subVectors(ji,Ji),ii.subVectors(Qi,ji),Si.subVectors(Ji,Qi);let t=[0,-ni.z,ni.y,0,-ii.z,ii.y,0,-Si.z,Si.y,ni.z,0,-ni.x,ii.z,0,-ii.x,Si.z,0,-Si.x,-ni.y,ni.x,0,-ii.y,ii.x,0,-Si.y,Si.x,0];return!ic(t,Ji,ji,Qi,kr)||(t=[1,0,0,0,1,0,0,0,1],!ic(t,Ji,ji,Qi,kr))?!1:(Gr.crossVectors(ni,ii),t=[Gr.x,Gr.y,Gr.z],ic(t,Ji,ji,Qi,kr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,dn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(dn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Pn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Pn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Pn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Pn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Pn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Pn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Pn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Pn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Pn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Pn=[new N,new N,new N,new N,new N,new N,new N,new N],dn=new N,zr=new Wn,Ji=new N,ji=new N,Qi=new N,ni=new N,ii=new N,Si=new N,Vs=new N,kr=new N,Gr=new N,Ti=new N;function ic(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){Ti.fromArray(n,r);let a=s.x*Math.abs(Ti.x)+s.y*Math.abs(Ti.y)+s.z*Math.abs(Ti.z),l=e.dot(Ti),c=t.dot(Ti),h=i.dot(Ti);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Bm=new Wn,Ws=new N,sc=new N,di=class{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):Bm.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ws.subVectors(e,this.center);let t=Ws.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Ws,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(sc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ws.copy(e.center).add(sc)),this.expandByPoint(Ws.copy(e.center).sub(sc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},On=new N,rc=new N,Vr=new N,si=new N,oc=new N,Wr=new N,ac=new N,Ui=class{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,On)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=On.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(On.copy(this.origin).addScaledVector(this.direction,t),On.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){rc.copy(e).add(t).multiplyScalar(.5),Vr.copy(t).sub(e).normalize(),si.copy(this.origin).sub(rc);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Vr),a=si.dot(this.direction),l=-si.dot(Vr),c=si.lengthSq(),h=Math.abs(1-o*o),d,f,u,m;if(h>0)if(d=o*l-a,f=o*a-l,m=r*h,d>=0)if(f>=-m)if(f<=m){let g=1/h;d*=g,f*=g,u=d*(d+o*f+2*a)+f*(o*d+f+2*l)+c}else f=r,d=Math.max(0,-(o*f+a)),u=-d*d+f*(f+2*l)+c;else f=-r,d=Math.max(0,-(o*f+a)),u=-d*d+f*(f+2*l)+c;else f<=-m?(d=Math.max(0,-(-o*r+a)),f=d>0?-r:Math.min(Math.max(-r,-l),r),u=-d*d+f*(f+2*l)+c):f<=m?(d=0,f=Math.min(Math.max(-r,-l),r),u=f*(f+2*l)+c):(d=Math.max(0,-(o*r+a)),f=d>0?r:Math.min(Math.max(-r,-l),r),u=-d*d+f*(f+2*l)+c);else f=o>0?-r:r,d=Math.max(0,-(o*f+a)),u=-d*d+f*(f+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(rc).addScaledVector(Vr,f),u}intersectSphere(e,t){On.subVectors(e.center,this.origin);let i=On.dot(this.direction),s=On.dot(On)-i*i,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,f=this.origin;return c>=0?(i=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(i=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),h>=0?(r=(e.min.y-f.y)*h,o=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,o=(e.min.y-f.y)*h),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(e.min.z-f.z)*d,l=(e.max.z-f.z)*d):(a=(e.max.z-f.z)*d,l=(e.min.z-f.z)*d),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,On)!==null}intersectTriangle(e,t,i,s,r){oc.subVectors(t,e),Wr.subVectors(i,e),ac.crossVectors(oc,Wr);let o=this.direction.dot(ac),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;si.subVectors(this.origin,e);let l=a*this.direction.dot(Wr.crossVectors(si,Wr));if(l<0)return null;let c=a*this.direction.dot(oc.cross(si));if(c<0||l+c>o)return null;let h=-a*si.dot(ac);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ot=class n{constructor(e,t,i,s,r,o,a,l,c,h,d,f,u,m,g,_){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,h,d,f,u,m,g,_)}set(e,t,i,s,r,o,a,l,c,h,d,f,u,m,g,_){let p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=d,p[14]=f,p[3]=u,p[7]=m,p[11]=g,p[15]=_,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,s=1/es.setFromMatrixColumn(e,0).length(),r=1/es.setFromMatrixColumn(e,1).length(),o=1/es.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let f=o*h,u=o*d,m=a*h,g=a*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=u+m*c,t[5]=f-g*c,t[9]=-a*l,t[2]=g-f*c,t[6]=m+u*c,t[10]=o*l}else if(e.order==="YXZ"){let f=l*h,u=l*d,m=c*h,g=c*d;t[0]=f+g*a,t[4]=m*a-u,t[8]=o*c,t[1]=o*d,t[5]=o*h,t[9]=-a,t[2]=u*a-m,t[6]=g+f*a,t[10]=o*l}else if(e.order==="ZXY"){let f=l*h,u=l*d,m=c*h,g=c*d;t[0]=f-g*a,t[4]=-o*d,t[8]=m+u*a,t[1]=u+m*a,t[5]=o*h,t[9]=g-f*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let f=o*h,u=o*d,m=a*h,g=a*d;t[0]=l*h,t[4]=m*c-u,t[8]=f*c+g,t[1]=l*d,t[5]=g*c+f,t[9]=u*c-m,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let f=o*l,u=o*c,m=a*l,g=a*c;t[0]=l*h,t[4]=g-f*d,t[8]=m*d+u,t[1]=d,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=u*d+m,t[10]=f-g*d}else if(e.order==="XZY"){let f=o*l,u=o*c,m=a*l,g=a*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=f*d+g,t[5]=o*h,t[9]=u*d-m,t[2]=m*d-u,t[6]=a*h,t[10]=g*d+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(zm,e,km)}lookAt(e,t,i){let s=this.elements;return Qt.subVectors(e,t),Qt.lengthSq()===0&&(Qt.z=1),Qt.normalize(),ri.crossVectors(i,Qt),ri.lengthSq()===0&&(Math.abs(i.z)===1?Qt.x+=1e-4:Qt.z+=1e-4,Qt.normalize(),ri.crossVectors(i,Qt)),ri.normalize(),Xr.crossVectors(Qt,ri),s[0]=ri.x,s[4]=Xr.x,s[8]=Qt.x,s[1]=ri.y,s[5]=Xr.y,s[9]=Qt.y,s[2]=ri.z,s[6]=Xr.z,s[10]=Qt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],d=i[5],f=i[9],u=i[13],m=i[2],g=i[6],_=i[10],p=i[14],S=i[3],x=i[7],E=i[11],D=i[15],w=s[0],O=s[4],U=s[8],T=s[12],y=s[1],P=s[5],F=s[9],L=s[13],B=s[2],Z=s[6],G=s[10],se=s[14],K=s[3],ge=s[7],pe=s[11],Se=s[15];return r[0]=o*w+a*y+l*B+c*K,r[4]=o*O+a*P+l*Z+c*ge,r[8]=o*U+a*F+l*G+c*pe,r[12]=o*T+a*L+l*se+c*Se,r[1]=h*w+d*y+f*B+u*K,r[5]=h*O+d*P+f*Z+u*ge,r[9]=h*U+d*F+f*G+u*pe,r[13]=h*T+d*L+f*se+u*Se,r[2]=m*w+g*y+_*B+p*K,r[6]=m*O+g*P+_*Z+p*ge,r[10]=m*U+g*F+_*G+p*pe,r[14]=m*T+g*L+_*se+p*Se,r[3]=S*w+x*y+E*B+D*K,r[7]=S*O+x*P+E*Z+D*ge,r[11]=S*U+x*F+E*G+D*pe,r[15]=S*T+x*L+E*se+D*Se,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],d=e[6],f=e[10],u=e[14],m=e[3],g=e[7],_=e[11],p=e[15];return m*(+r*l*d-s*c*d-r*a*f+i*c*f+s*a*u-i*l*u)+g*(+t*l*u-t*c*f+r*o*f-s*o*u+s*c*h-r*l*h)+_*(+t*c*d-t*a*u-r*o*d+i*o*u+r*a*h-i*c*h)+p*(-s*a*h-t*l*d+t*a*f+s*o*d-i*o*f+i*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],d=e[9],f=e[10],u=e[11],m=e[12],g=e[13],_=e[14],p=e[15],S=d*_*c-g*f*c+g*l*u-a*_*u-d*l*p+a*f*p,x=m*f*c-h*_*c-m*l*u+o*_*u+h*l*p-o*f*p,E=h*g*c-m*d*c+m*a*u-o*g*u-h*a*p+o*d*p,D=m*d*l-h*g*l-m*a*f+o*g*f+h*a*_-o*d*_,w=t*S+i*x+s*E+r*D;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/w;return e[0]=S*O,e[1]=(g*f*r-d*_*r-g*s*u+i*_*u+d*s*p-i*f*p)*O,e[2]=(a*_*r-g*l*r+g*s*c-i*_*c-a*s*p+i*l*p)*O,e[3]=(d*l*r-a*f*r-d*s*c+i*f*c+a*s*u-i*l*u)*O,e[4]=x*O,e[5]=(h*_*r-m*f*r+m*s*u-t*_*u-h*s*p+t*f*p)*O,e[6]=(m*l*r-o*_*r-m*s*c+t*_*c+o*s*p-t*l*p)*O,e[7]=(o*f*r-h*l*r+h*s*c-t*f*c-o*s*u+t*l*u)*O,e[8]=E*O,e[9]=(m*d*r-h*g*r-m*i*u+t*g*u+h*i*p-t*d*p)*O,e[10]=(o*g*r-m*a*r+m*i*c-t*g*c-o*i*p+t*a*p)*O,e[11]=(h*a*r-o*d*r-h*i*c+t*d*c+o*i*u-t*a*u)*O,e[12]=D*O,e[13]=(h*g*s-m*d*s+m*i*f-t*g*f-h*i*_+t*d*_)*O,e[14]=(m*a*s-o*g*s-m*i*l+t*g*l+o*i*_-t*a*_)*O,e[15]=(o*d*s-h*a*s+h*i*l-t*d*l-o*i*f+t*a*f)*O,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+i,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,d=a+a,f=r*c,u=r*h,m=r*d,g=o*h,_=o*d,p=a*d,S=l*c,x=l*h,E=l*d,D=i.x,w=i.y,O=i.z;return s[0]=(1-(g+p))*D,s[1]=(u+E)*D,s[2]=(m-x)*D,s[3]=0,s[4]=(u-E)*w,s[5]=(1-(f+p))*w,s[6]=(_+S)*w,s[7]=0,s[8]=(m+x)*O,s[9]=(_-S)*O,s[10]=(1-(f+g))*O,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements,r=es.set(s[0],s[1],s[2]).length(),o=es.set(s[4],s[5],s[6]).length(),a=es.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],fn.copy(this);let c=1/r,h=1/o,d=1/a;return fn.elements[0]*=c,fn.elements[1]*=c,fn.elements[2]*=c,fn.elements[4]*=h,fn.elements[5]*=h,fn.elements[6]*=h,fn.elements[8]*=d,fn.elements[9]*=d,fn.elements[10]*=d,t.setFromRotationMatrix(fn),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=Fn){let l=this.elements,c=2*r/(t-e),h=2*r/(i-s),d=(t+e)/(t-e),f=(i+s)/(i-s),u,m;if(a===Fn)u=-(o+r)/(o-r),m=-2*o*r/(o-r);else if(a===yo)u=-o/(o-r),m=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=u,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=Fn){let l=this.elements,c=1/(t-e),h=1/(i-s),d=1/(o-r),f=(t+e)*c,u=(i+s)*h,m,g;if(a===Fn)m=(o+r)*d,g=-2*d;else if(a===yo)m=r*d,g=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-u,l[2]=0,l[6]=0,l[10]=g,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},es=new N,fn=new ot,zm=new N(0,0,0),km=new N(1,1,1),ri=new N,Xr=new N,Qt=new N,Du=new ot,Hu=new Nt,bn=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],d=s[2],f=s[6],u=s[10];switch(t){case"XYZ":this._y=Math.asin(wt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,u),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-wt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,u),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(wt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-d,u),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-wt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(f,u),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(wt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,u));break;case"XZY":this._z=Math.asin(-wt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,u),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Du.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Du,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Hu.setFromEuler(this),this.setFromQuaternion(Hu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};bn.DEFAULT_ORDER="XYZ";var or=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Gm=0,Fu=new N,ts=new Nt,Un=new ot,Yr=new N,Xs=new N,Vm=new N,Wm=new Nt,Bu=new N(1,0,0),zu=new N(0,1,0),ku=new N(0,0,1),Gu={type:"added"},Xm={type:"removed"},ns={type:"childadded",child:null},cc={type:"childremoved",child:null},Vt=class n extends Gn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Gm++}),this.uuid=Bi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new N,t=new bn,i=new Nt,s=new N(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ot},normalMatrix:{value:new Ze}}),this.matrix=new ot,this.matrixWorld=new ot,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new or,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ts.setFromAxisAngle(e,t),this.quaternion.multiply(ts),this}rotateOnWorldAxis(e,t){return ts.setFromAxisAngle(e,t),this.quaternion.premultiply(ts),this}rotateX(e){return this.rotateOnAxis(Bu,e)}rotateY(e){return this.rotateOnAxis(zu,e)}rotateZ(e){return this.rotateOnAxis(ku,e)}translateOnAxis(e,t){return Fu.copy(e).applyQuaternion(this.quaternion),this.position.add(Fu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Bu,e)}translateY(e){return this.translateOnAxis(zu,e)}translateZ(e){return this.translateOnAxis(ku,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Un.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Yr.copy(e):Yr.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Xs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Un.lookAt(Xs,Yr,this.up):Un.lookAt(Yr,Xs,this.up),this.quaternion.setFromRotationMatrix(Un),s&&(Un.extractRotation(s.matrixWorld),ts.setFromRotationMatrix(Un),this.quaternion.premultiply(ts.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Gu),ns.child=e,this.dispatchEvent(ns),ns.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Xm),cc.child=e,this.dispatchEvent(cc),cc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Un.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Un.multiply(e.parent.matrixWorld)),e.applyMatrix4(Un),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Gu),ns.child=e,this.dispatchEvent(ns),ns.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xs,e,Vm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xs,Wm,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),d=o(e.shapes),f=o(e.skeletons),u=o(e.animations),m=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),f.length>0&&(i.skeletons=f),u.length>0&&(i.animations=u),m.length>0&&(i.nodes=m)}return i.object=s,i;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};Vt.DEFAULT_UP=new N(0,1,0);Vt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var pn=new N,Ln=new N,lc=new N,Nn=new N,is=new N,ss=new N,Vu=new N,hc=new N,uc=new N,dc=new N,fc=new pt,pc=new pt,mc=new pt,Ci=class n{constructor(e=new N,t=new N,i=new N){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),pn.subVectors(e,t),s.cross(pn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){pn.subVectors(s,t),Ln.subVectors(i,t),lc.subVectors(e,t);let o=pn.dot(pn),a=pn.dot(Ln),l=pn.dot(lc),c=Ln.dot(Ln),h=Ln.dot(lc),d=o*c-a*a;if(d===0)return r.set(0,0,0),null;let f=1/d,u=(c*l-a*h)*f,m=(o*h-a*l)*f;return r.set(1-u-m,m,u)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Nn)===null?!1:Nn.x>=0&&Nn.y>=0&&Nn.x+Nn.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,Nn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Nn.x),l.addScaledVector(o,Nn.y),l.addScaledVector(a,Nn.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return fc.setScalar(0),pc.setScalar(0),mc.setScalar(0),fc.fromBufferAttribute(e,t),pc.fromBufferAttribute(e,i),mc.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(fc,r.x),o.addScaledVector(pc,r.y),o.addScaledVector(mc,r.z),o}static isFrontFacing(e,t,i,s){return pn.subVectors(i,t),Ln.subVectors(e,t),pn.cross(Ln).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return pn.subVectors(this.c,this.b),Ln.subVectors(this.a,this.b),pn.cross(Ln).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,o,a;is.subVectors(s,i),ss.subVectors(r,i),hc.subVectors(e,i);let l=is.dot(hc),c=ss.dot(hc);if(l<=0&&c<=0)return t.copy(i);uc.subVectors(e,s);let h=is.dot(uc),d=ss.dot(uc);if(h>=0&&d<=h)return t.copy(s);let f=l*d-h*c;if(f<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(i).addScaledVector(is,o);dc.subVectors(e,r);let u=is.dot(dc),m=ss.dot(dc);if(m>=0&&u<=m)return t.copy(r);let g=u*c-l*m;if(g<=0&&c>=0&&m<=0)return a=c/(c-m),t.copy(i).addScaledVector(ss,a);let _=h*m-u*d;if(_<=0&&d-h>=0&&u-m>=0)return Vu.subVectors(r,s),a=(d-h)/(d-h+(u-m)),t.copy(s).addScaledVector(Vu,a);let p=1/(_+g+f);return o=g*p,a=f*p,t.copy(i).addScaledVector(is,o).addScaledVector(ss,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Kd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},oi={h:0,s:0,l:0},qr={h:0,s:0,l:0};function _c(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var De=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=At){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ct.toWorkingColorSpace(this,t),this}setRGB(e,t,i,s=ct.workingColorSpace){return this.r=e,this.g=t,this.b=i,ct.toWorkingColorSpace(this,s),this}setHSL(e,t,i,s=ct.workingColorSpace){if(e=ch(e,1),t=wt(t,0,1),i=wt(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=_c(o,r,e+1/3),this.g=_c(o,r,e),this.b=_c(o,r,e-1/3)}return ct.toWorkingColorSpace(this,s),this}setStyle(e,t=At){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=At){let i=Kd[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Bn(e.r),this.g=Bn(e.g),this.b=Bn(e.b),this}copyLinearToSRGB(e){return this.r=ms(e.r),this.g=ms(e.g),this.b=ms(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=At){return ct.fromWorkingColorSpace(kt.copy(this),e),Math.round(wt(kt.r*255,0,255))*65536+Math.round(wt(kt.g*255,0,255))*256+Math.round(wt(kt.b*255,0,255))}getHexString(e=At){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ct.workingColorSpace){ct.fromWorkingColorSpace(kt.copy(this),t);let i=kt.r,s=kt.g,r=kt.b,o=Math.max(i,s,r),a=Math.min(i,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let d=o-a;switch(c=h<=.5?d/(o+a):d/(2-o-a),o){case i:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-i)/d+2;break;case r:l=(i-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=ct.workingColorSpace){return ct.fromWorkingColorSpace(kt.copy(this),t),e.r=kt.r,e.g=kt.g,e.b=kt.b,e}getStyle(e=At){ct.fromWorkingColorSpace(kt.copy(this),e);let t=kt.r,i=kt.g,s=kt.b;return e!==At?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(oi),this.setHSL(oi.h+e,oi.s+t,oi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(oi),e.getHSL(qr);let i=Qs(oi.h,qr.h,t),s=Qs(oi.s,qr.s,t),r=Qs(oi.l,qr.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},kt=new De;De.NAMES=Kd;var Ym=0,fi=class extends Gn{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ym++}),this.uuid=Bi(),this.name="",this.blending=fs,this.side=ui,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Pc,this.blendDst=Oc,this.blendEquation=wi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new De(0,0,0),this.blendAlpha=0,this.depthFunc=gs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=bu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zi,this.stencilZFail=Zi,this.stencilZPass=Zi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==fs&&(i.blending=this.blending),this.side!==ui&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Pc&&(i.blendSrc=this.blendSrc),this.blendDst!==Oc&&(i.blendDst=this.blendDst),this.blendEquation!==wi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==gs&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==bu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Zi&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Zi&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Zi&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},Ct=class extends fi{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new De(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.combine=Ld,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Rt=new N,Kr=new le,bt=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Au,this.updateRanges=[],this.gpuType=vn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Kr.fromBufferAttribute(this,t),Kr.applyMatrix3(e),this.setXY(t,Kr.x,Kr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyMatrix3(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyMatrix4(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyNormalMatrix(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.transformDirection(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=hs(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Wt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=hs(t,this.array)),t}setX(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=hs(t,this.array)),t}setY(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=hs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=hs(t,this.array)),t}setW(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Wt(t,this.array),i=Wt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=Wt(t,this.array),i=Wt(i,this.array),s=Wt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=Wt(t,this.array),i=Wt(i,this.array),s=Wt(s,this.array),r=Wt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Au&&(e.usage=this.usage),e}};var vo=class extends bt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var bo=class extends bt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var $e=class extends bt{constructor(e,t,i){super(new Float32Array(e),t,i)}},qm=0,on=new ot,gc=new Vt,rs=new N,en=new Wn,Ys=new Wn,Lt=new N,gt=class n extends Gn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:qm++}),this.uuid=Bi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(qd(e)?bo:vo)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Ze().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return on.makeRotationFromQuaternion(e),this.applyMatrix4(on),this}rotateX(e){return on.makeRotationX(e),this.applyMatrix4(on),this}rotateY(e){return on.makeRotationY(e),this.applyMatrix4(on),this}rotateZ(e){return on.makeRotationZ(e),this.applyMatrix4(on),this}translate(e,t,i){return on.makeTranslation(e,t,i),this.applyMatrix4(on),this}scale(e,t,i){return on.makeScale(e,t,i),this.applyMatrix4(on),this}lookAt(e){return gc.lookAt(e),gc.updateMatrix(),this.applyMatrix4(gc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(rs).negate(),this.translate(rs.x,rs.y,rs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new $e(i,3))}else{for(let i=0,s=t.count;i<s;i++){let r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Wn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];en.setFromBufferAttribute(r),this.morphTargetsRelative?(Lt.addVectors(this.boundingBox.min,en.min),this.boundingBox.expandByPoint(Lt),Lt.addVectors(this.boundingBox.max,en.max),this.boundingBox.expandByPoint(Lt)):(this.boundingBox.expandByPoint(en.min),this.boundingBox.expandByPoint(en.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new di);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){let i=this.boundingSphere.center;if(en.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Ys.setFromBufferAttribute(a),this.morphTargetsRelative?(Lt.addVectors(en.min,Ys.min),en.expandByPoint(Lt),Lt.addVectors(en.max,Ys.max),en.expandByPoint(Lt)):(en.expandByPoint(Ys.min),en.expandByPoint(Ys.max))}en.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Lt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Lt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Lt.fromBufferAttribute(a,c),l&&(rs.fromBufferAttribute(e,c),Lt.add(rs)),s=Math.max(s,i.distanceToSquared(Lt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new bt(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let U=0;U<i.count;U++)a[U]=new N,l[U]=new N;let c=new N,h=new N,d=new N,f=new le,u=new le,m=new le,g=new N,_=new N;function p(U,T,y){c.fromBufferAttribute(i,U),h.fromBufferAttribute(i,T),d.fromBufferAttribute(i,y),f.fromBufferAttribute(r,U),u.fromBufferAttribute(r,T),m.fromBufferAttribute(r,y),h.sub(c),d.sub(c),u.sub(f),m.sub(f);let P=1/(u.x*m.y-m.x*u.y);isFinite(P)&&(g.copy(h).multiplyScalar(m.y).addScaledVector(d,-u.y).multiplyScalar(P),_.copy(d).multiplyScalar(u.x).addScaledVector(h,-m.x).multiplyScalar(P),a[U].add(g),a[T].add(g),a[y].add(g),l[U].add(_),l[T].add(_),l[y].add(_))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let U=0,T=S.length;U<T;++U){let y=S[U],P=y.start,F=y.count;for(let L=P,B=P+F;L<B;L+=3)p(e.getX(L+0),e.getX(L+1),e.getX(L+2))}let x=new N,E=new N,D=new N,w=new N;function O(U){D.fromBufferAttribute(s,U),w.copy(D);let T=a[U];x.copy(T),x.sub(D.multiplyScalar(D.dot(T))).normalize(),E.crossVectors(w,T);let P=E.dot(l[U])<0?-1:1;o.setXYZW(U,x.x,x.y,x.z,P)}for(let U=0,T=S.length;U<T;++U){let y=S[U],P=y.start,F=y.count;for(let L=P,B=P+F;L<B;L+=3)O(e.getX(L+0)),O(e.getX(L+1)),O(e.getX(L+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new bt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,u=i.count;f<u;f++)i.setXYZ(f,0,0,0);let s=new N,r=new N,o=new N,a=new N,l=new N,c=new N,h=new N,d=new N;if(e)for(let f=0,u=e.count;f<u;f+=3){let m=e.getX(f+0),g=e.getX(f+1),_=e.getX(f+2);s.fromBufferAttribute(t,m),r.fromBufferAttribute(t,g),o.fromBufferAttribute(t,_),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),a.fromBufferAttribute(i,m),l.fromBufferAttribute(i,g),c.fromBufferAttribute(i,_),a.add(h),l.add(h),c.add(h),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(g,l.x,l.y,l.z),i.setXYZ(_,c.x,c.y,c.z)}else for(let f=0,u=t.count;f<u;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),i.setXYZ(f+0,h.x,h.y,h.z),i.setXYZ(f+1,h.x,h.y,h.z),i.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Lt.fromBufferAttribute(e,t),Lt.normalize(),e.setXYZ(t,Lt.x,Lt.y,Lt.z)}toNonIndexed(){function e(a,l){let c=a.array,h=a.itemSize,d=a.normalized,f=new c.constructor(l.length*h),u=0,m=0;for(let g=0,_=l.length;g<_;g++){a.isInterleavedBufferAttribute?u=l[g]*a.data.stride+a.offset:u=l[g]*h;for(let p=0;p<h;p++)f[m++]=c[u++]}return new bt(f,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,i);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,d=c.length;h<d;h++){let f=c[h],u=e(f,i);l.push(u)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,f=c.length;d<f;d++){let u=c[d];h.push(u.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone(t));let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],d=r[c];for(let f=0,u=d.length;f<u;f++)h.push(d[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Wu=new ot,Mi=new Ui,Zr=new di,Xu=new N,$r=new N,Jr=new N,jr=new N,Ec=new N,Qr=new N,Yu=new N,eo=new N,$=class extends Vt{constructor(e=new gt,t=new Ct){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Qr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],d=r[l];h!==0&&(Ec.fromBufferAttribute(d,e),o?Qr.addScaledVector(Ec,h):Qr.addScaledVector(Ec.sub(t),h))}t.add(Qr)}return t}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Zr.copy(i.boundingSphere),Zr.applyMatrix4(r),Mi.copy(e.ray).recast(e.near),!(Zr.containsPoint(Mi.origin)===!1&&(Mi.intersectSphere(Zr,Xu)===null||Mi.origin.distanceToSquared(Xu)>(e.far-e.near)**2))&&(Wu.copy(r).invert(),Mi.copy(e.ray).applyMatrix4(Wu),!(i.boundingBox!==null&&Mi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Mi)))}_computeIntersections(e,t,i){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,f=r.groups,u=r.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,g=f.length;m<g;m++){let _=f[m],p=o[_.materialIndex],S=Math.max(_.start,u.start),x=Math.min(a.count,Math.min(_.start+_.count,u.start+u.count));for(let E=S,D=x;E<D;E+=3){let w=a.getX(E),O=a.getX(E+1),U=a.getX(E+2);s=to(this,p,e,i,c,h,d,w,O,U),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=_.materialIndex,t.push(s))}}else{let m=Math.max(0,u.start),g=Math.min(a.count,u.start+u.count);for(let _=m,p=g;_<p;_+=3){let S=a.getX(_),x=a.getX(_+1),E=a.getX(_+2);s=to(this,o,e,i,c,h,d,S,x,E),s&&(s.faceIndex=Math.floor(_/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,g=f.length;m<g;m++){let _=f[m],p=o[_.materialIndex],S=Math.max(_.start,u.start),x=Math.min(l.count,Math.min(_.start+_.count,u.start+u.count));for(let E=S,D=x;E<D;E+=3){let w=E,O=E+1,U=E+2;s=to(this,p,e,i,c,h,d,w,O,U),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=_.materialIndex,t.push(s))}}else{let m=Math.max(0,u.start),g=Math.min(l.count,u.start+u.count);for(let _=m,p=g;_<p;_+=3){let S=_,x=_+1,E=_+2;s=to(this,o,e,i,c,h,d,S,x,E),s&&(s.faceIndex=Math.floor(_/3),t.push(s))}}}};function Km(n,e,t,i,s,r,o,a){let l;if(e.side===Kt?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===ui,a),l===null)return null;eo.copy(a),eo.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(eo);return c<t.near||c>t.far?null:{distance:c,point:eo.clone(),object:n}}function to(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,$r),n.getVertexPosition(l,Jr),n.getVertexPosition(c,jr);let h=Km(n,e,t,i,$r,Jr,jr,Yu);if(h){let d=new N;Ci.getBarycoord(Yu,$r,Jr,jr,d),s&&(h.uv=Ci.getInterpolatedAttribute(s,a,l,c,d,new le)),r&&(h.uv1=Ci.getInterpolatedAttribute(r,a,l,c,d,new le)),o&&(h.normal=Ci.getInterpolatedAttribute(o,a,l,c,d,new N),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let f={a,b:l,c,normal:new N,materialIndex:0};Ci.getNormal($r,Jr,jr,f.normal),h.face=f,h.barycoord=d}return h}var at=class n extends gt{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],d=[],f=0,u=0;m("z","y","x",-1,-1,i,t,e,o,r,0),m("z","y","x",1,-1,i,t,-e,o,r,1),m("x","z","y",1,1,e,i,t,s,o,2),m("x","z","y",1,-1,e,i,-t,s,o,3),m("x","y","z",1,-1,e,t,i,s,r,4),m("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new $e(c,3)),this.setAttribute("normal",new $e(h,3)),this.setAttribute("uv",new $e(d,2));function m(g,_,p,S,x,E,D,w,O,U,T){let y=E/O,P=D/U,F=E/2,L=D/2,B=w/2,Z=O+1,G=U+1,se=0,K=0,ge=new N;for(let pe=0;pe<G;pe++){let Se=pe*P-L;for(let ve=0;ve<Z;ve++){let tt=ve*y-F;ge[g]=tt*S,ge[_]=Se*x,ge[p]=B,c.push(ge.x,ge.y,ge.z),ge[g]=0,ge[_]=0,ge[p]=w>0?1:-1,h.push(ge.x,ge.y,ge.z),d.push(ve/O),d.push(1-pe/U),se+=1}}for(let pe=0;pe<U;pe++)for(let Se=0;Se<O;Se++){let ve=f+Se+Z*pe,tt=f+Se+Z*(pe+1),ee=f+(Se+1)+Z*(pe+1),ae=f+(Se+1)+Z*pe;l.push(ve,tt,ae),l.push(tt,ee,ae),K+=6}a.addGroup(u,K,T),u+=K,f+=se}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Ms(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function Xt(n){let e={};for(let t=0;t<n.length;t++){let i=Ms(n[t]);for(let s in i)e[s]=i[s]}return e}function Zm(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Zd(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ct.workingColorSpace}var $m={clone:Ms,merge:Xt},Jm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,jm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,An=class extends fi{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Jm,this.fragmentShader=jm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ms(e.uniforms),this.uniformsGroups=Zm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},Ao=class extends Vt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ot,this.projectionMatrix=new ot,this.projectionMatrixInverse=new ot,this.coordinateSystem=Fn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},ai=new N,qu=new le,Ku=new le,Gt=class extends Ao{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=rr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(js*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return rr*2*Math.atan(Math.tan(js*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){ai.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ai.x,ai.y).multiplyScalar(-e/ai.z),ai.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(ai.x,ai.y).multiplyScalar(-e/ai.z)}getViewSize(e,t){return this.getViewBounds(e,qu,Ku),t.subVectors(Ku,qu)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(js*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},os=-90,as=1,xl=class extends Vt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Gt(os,as,e,t);s.layers=this.layers,this.add(s);let r=new Gt(os,as,e,t);r.layers=this.layers,this.add(r);let o=new Gt(os,as,e,t);o.layers=this.layers,this.add(o);let a=new Gt(os,as,e,t);a.layers=this.layers,this.add(a);let l=new Gt(os,as,e,t);l.layers=this.layers,this.add(l);let c=new Gt(os,as,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===Fn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===yo)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,d=e.getRenderTarget(),f=e.getActiveCubeFace(),u=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let g=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=g,e.setRenderTarget(i,5,s),e.render(t,h),e.setRenderTarget(d,f,u),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},Ro=class extends Zt{constructor(e,t,i,s,r,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:Es,super(e,t,i,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},yl=class extends Vn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new Ro(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Mn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new at(5,5,5),r=new An({name:"CubemapFromEquirect",uniforms:Ms(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Kt,blending:li});r.uniforms.tEquirect.value=t;let o=new $(s,r),a=t.minFilter;return t.minFilter===Pi&&(t.minFilter=Mn),new xl(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,s){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}},xc=new N,Qm=new N,e_=new Ze,mn=class{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=xc.subVectors(i,t).cross(Qm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(xc),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||e_.getNormalMatrix(e),s=this.coplanarPoint(xc).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},vi=new di,no=new N,ar=class{constructor(e=new mn,t=new mn,i=new mn,s=new mn,r=new mn,o=new mn){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Fn){let i=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],h=s[5],d=s[6],f=s[7],u=s[8],m=s[9],g=s[10],_=s[11],p=s[12],S=s[13],x=s[14],E=s[15];if(i[0].setComponents(l-r,f-c,_-u,E-p).normalize(),i[1].setComponents(l+r,f+c,_+u,E+p).normalize(),i[2].setComponents(l+o,f+h,_+m,E+S).normalize(),i[3].setComponents(l-o,f-h,_-m,E-S).normalize(),i[4].setComponents(l-a,f-d,_-g,E-x).normalize(),t===Fn)i[5].setComponents(l+a,f+d,_+g,E+x).normalize();else if(t===yo)i[5].setComponents(a,d,g,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),vi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),vi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(vi)}intersectsSprite(e){return vi.center.set(0,0,0),vi.radius=.7071067811865476,vi.applyMatrix4(e.matrixWorld),this.intersectsSphere(vi)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(no.x=s.normal.x>0?e.max.x:e.min.x,no.y=s.normal.y>0?e.max.y:e.min.y,no.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(no)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function $d(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function t_(n){let e=new WeakMap;function t(a,l){let c=a.array,h=a.usage,d=c.byteLength,f=n.createBuffer();n.bindBuffer(l,f),n.bufferData(l,c,h),a.onUploadCallback();let u;if(c instanceof Float32Array)u=n.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?u=n.HALF_FLOAT:u=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)u=n.SHORT;else if(c instanceof Uint32Array)u=n.UNSIGNED_INT;else if(c instanceof Int32Array)u=n.INT;else if(c instanceof Int8Array)u=n.BYTE;else if(c instanceof Uint8Array)u=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)u=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:u,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function i(a,l,c){let h=l.array,d=l.updateRanges;if(n.bindBuffer(c,a),d.length===0)n.bufferSubData(c,0,h);else{d.sort((u,m)=>u.start-m.start);let f=0;for(let u=1;u<d.length;u++){let m=d[f],g=d[u];g.start<=m.start+m.count+1?m.count=Math.max(m.count,g.start+g.count-m.start):(++f,d[f]=g)}d.length=f+1;for(let u=0,m=d.length;u<m;u++){let g=d[u];n.bufferSubData(c,g.start*h.BYTES_PER_ELEMENT,h,g.start,g.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var Xn=class n extends gt{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,h=l+1,d=e/a,f=t/l,u=[],m=[],g=[],_=[];for(let p=0;p<h;p++){let S=p*f-o;for(let x=0;x<c;x++){let E=x*d-r;m.push(E,-S,0),g.push(0,0,1),_.push(x/a),_.push(1-p/l)}}for(let p=0;p<l;p++)for(let S=0;S<a;S++){let x=S+c*p,E=S+c*(p+1),D=S+1+c*(p+1),w=S+1+c*p;u.push(x,E,w),u.push(E,D,w)}this.setIndex(u),this.setAttribute("position",new $e(m,3)),this.setAttribute("normal",new $e(g,3)),this.setAttribute("uv",new $e(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},n_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,i_=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,s_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,r_=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,o_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,a_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,c_=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT )
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN )
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,l_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,h_=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,u_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,d_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,f_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,p_=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,m_=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,__=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,g_=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,E_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,x_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,y_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,S_=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,T_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,M_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,v_=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,b_=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,A_=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,R_=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,w_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,C_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,I_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,P_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,O_="gl_FragColor = linearToOutputTexel( gl_FragColor );",U_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,L_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,N_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif

#endif`,D_=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,H_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,F_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,B_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,z_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,k_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,G_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,V_=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,W_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,X_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Y_=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,q_=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,K_=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Z_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,$_=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,J_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,j_=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Q_=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,eg=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,tg=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,ng=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,ig=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,sg=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,rg=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,og=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ag=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,cg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,lg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,hg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,ug=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,dg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,fg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,pg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,mg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,_g=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,gg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Eg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,xg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,yg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Sg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Tg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Mg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,vg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,bg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ag=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Rg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,wg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Cg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ig=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Pg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Og=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ug=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Lg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ng=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Dg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Hg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;

		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Fg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Bg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,zg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,kg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Gg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Vg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Wg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Xg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Yg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,qg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Kg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Zg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,$g=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;

				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;

				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;

		#else

			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );

		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Jg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,jg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Qg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,e0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,t0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,n0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,i0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,s0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,r0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,o0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,a0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,c0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,l0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,h0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,u0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,d0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,f0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,p0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,m0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,_0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,g0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,E0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,x0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,y0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,S0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,T0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,M0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,v0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,b0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,A0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,R0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,w0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,C0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,I0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,P0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,O0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,U0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,L0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,je={alphahash_fragment:n_,alphahash_pars_fragment:i_,alphamap_fragment:s_,alphamap_pars_fragment:r_,alphatest_fragment:o_,alphatest_pars_fragment:a_,aomap_fragment:c_,aomap_pars_fragment:l_,batching_pars_vertex:h_,batching_vertex:u_,begin_vertex:d_,beginnormal_vertex:f_,bsdfs:p_,iridescence_fragment:m_,bumpmap_pars_fragment:__,clipping_planes_fragment:g_,clipping_planes_pars_fragment:E_,clipping_planes_pars_vertex:x_,clipping_planes_vertex:y_,color_fragment:S_,color_pars_fragment:T_,color_pars_vertex:M_,color_vertex:v_,common:b_,cube_uv_reflection_fragment:A_,defaultnormal_vertex:R_,displacementmap_pars_vertex:w_,displacementmap_vertex:C_,emissivemap_fragment:I_,emissivemap_pars_fragment:P_,colorspace_fragment:O_,colorspace_pars_fragment:U_,envmap_fragment:L_,envmap_common_pars_fragment:N_,envmap_pars_fragment:D_,envmap_pars_vertex:H_,envmap_physical_pars_fragment:K_,envmap_vertex:F_,fog_vertex:B_,fog_pars_vertex:z_,fog_fragment:k_,fog_pars_fragment:G_,gradientmap_pars_fragment:V_,lightmap_pars_fragment:W_,lights_lambert_fragment:X_,lights_lambert_pars_fragment:Y_,lights_pars_begin:q_,lights_toon_fragment:Z_,lights_toon_pars_fragment:$_,lights_phong_fragment:J_,lights_phong_pars_fragment:j_,lights_physical_fragment:Q_,lights_physical_pars_fragment:eg,lights_fragment_begin:tg,lights_fragment_maps:ng,lights_fragment_end:ig,logdepthbuf_fragment:sg,logdepthbuf_pars_fragment:rg,logdepthbuf_pars_vertex:og,logdepthbuf_vertex:ag,map_fragment:cg,map_pars_fragment:lg,map_particle_fragment:hg,map_particle_pars_fragment:ug,metalnessmap_fragment:dg,metalnessmap_pars_fragment:fg,morphinstance_vertex:pg,morphcolor_vertex:mg,morphnormal_vertex:_g,morphtarget_pars_vertex:gg,morphtarget_vertex:Eg,normal_fragment_begin:xg,normal_fragment_maps:yg,normal_pars_fragment:Sg,normal_pars_vertex:Tg,normal_vertex:Mg,normalmap_pars_fragment:vg,clearcoat_normal_fragment_begin:bg,clearcoat_normal_fragment_maps:Ag,clearcoat_pars_fragment:Rg,iridescence_pars_fragment:wg,opaque_fragment:Cg,packing:Ig,premultiplied_alpha_fragment:Pg,project_vertex:Og,dithering_fragment:Ug,dithering_pars_fragment:Lg,roughnessmap_fragment:Ng,roughnessmap_pars_fragment:Dg,shadowmap_pars_fragment:Hg,shadowmap_pars_vertex:Fg,shadowmap_vertex:Bg,shadowmask_pars_fragment:zg,skinbase_vertex:kg,skinning_pars_vertex:Gg,skinning_vertex:Vg,skinnormal_vertex:Wg,specularmap_fragment:Xg,specularmap_pars_fragment:Yg,tonemapping_fragment:qg,tonemapping_pars_fragment:Kg,transmission_fragment:Zg,transmission_pars_fragment:$g,uv_pars_fragment:Jg,uv_pars_vertex:jg,uv_vertex:Qg,worldpos_vertex:e0,background_vert:t0,background_frag:n0,backgroundCube_vert:i0,backgroundCube_frag:s0,cube_vert:r0,cube_frag:o0,depth_vert:a0,depth_frag:c0,distanceRGBA_vert:l0,distanceRGBA_frag:h0,equirect_vert:u0,equirect_frag:d0,linedashed_vert:f0,linedashed_frag:p0,meshbasic_vert:m0,meshbasic_frag:_0,meshlambert_vert:g0,meshlambert_frag:E0,meshmatcap_vert:x0,meshmatcap_frag:y0,meshnormal_vert:S0,meshnormal_frag:T0,meshphong_vert:M0,meshphong_frag:v0,meshphysical_vert:b0,meshphysical_frag:A0,meshtoon_vert:R0,meshtoon_frag:w0,points_vert:C0,points_frag:I0,shadow_vert:P0,shadow_frag:O0,sprite_vert:U0,sprite_frag:L0},xe={common:{diffuse:{value:new De(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ze},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ze}},envmap:{envMap:{value:null},envMapRotation:{value:new Ze},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ze},normalScale:{value:new le(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new De(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new De(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0},uvTransform:{value:new Ze}},sprite:{diffuse:{value:new De(16777215)},opacity:{value:1},center:{value:new le(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ze},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0}}},Tn={basic:{uniforms:Xt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.fog]),vertexShader:je.meshbasic_vert,fragmentShader:je.meshbasic_frag},lambert:{uniforms:Xt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new De(0)}}]),vertexShader:je.meshlambert_vert,fragmentShader:je.meshlambert_frag},phong:{uniforms:Xt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new De(0)},specular:{value:new De(1118481)},shininess:{value:30}}]),vertexShader:je.meshphong_vert,fragmentShader:je.meshphong_frag},standard:{uniforms:Xt([xe.common,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.roughnessmap,xe.metalnessmap,xe.fog,xe.lights,{emissive:{value:new De(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag},toon:{uniforms:Xt([xe.common,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.gradientmap,xe.fog,xe.lights,{emissive:{value:new De(0)}}]),vertexShader:je.meshtoon_vert,fragmentShader:je.meshtoon_frag},matcap:{uniforms:Xt([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,{matcap:{value:null}}]),vertexShader:je.meshmatcap_vert,fragmentShader:je.meshmatcap_frag},points:{uniforms:Xt([xe.points,xe.fog]),vertexShader:je.points_vert,fragmentShader:je.points_frag},dashed:{uniforms:Xt([xe.common,xe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:je.linedashed_vert,fragmentShader:je.linedashed_frag},depth:{uniforms:Xt([xe.common,xe.displacementmap]),vertexShader:je.depth_vert,fragmentShader:je.depth_frag},normal:{uniforms:Xt([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,{opacity:{value:1}}]),vertexShader:je.meshnormal_vert,fragmentShader:je.meshnormal_frag},sprite:{uniforms:Xt([xe.sprite,xe.fog]),vertexShader:je.sprite_vert,fragmentShader:je.sprite_frag},background:{uniforms:{uvTransform:{value:new Ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:je.background_vert,fragmentShader:je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ze}},vertexShader:je.backgroundCube_vert,fragmentShader:je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:je.cube_vert,fragmentShader:je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:je.equirect_vert,fragmentShader:je.equirect_frag},distanceRGBA:{uniforms:Xt([xe.common,xe.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:je.distanceRGBA_vert,fragmentShader:je.distanceRGBA_frag},shadow:{uniforms:Xt([xe.lights,xe.fog,{color:{value:new De(0)},opacity:{value:1}}]),vertexShader:je.shadow_vert,fragmentShader:je.shadow_frag}};Tn.physical={uniforms:Xt([Tn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ze},clearcoatNormalScale:{value:new le(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ze},sheen:{value:0},sheenColor:{value:new De(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ze},transmissionSamplerSize:{value:new le},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ze},attenuationDistance:{value:0},attenuationColor:{value:new De(0)},specularColor:{value:new De(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ze},anisotropyVector:{value:new le},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ze}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag};var io={r:0,b:0,g:0},bi=new bn,N0=new ot;function D0(n,e,t,i,s,r,o){let a=new De(0),l=r===!0?0:1,c,h,d=null,f=0,u=null;function m(S){let x=S.isScene===!0?S.background:null;return x&&x.isTexture&&(x=(S.backgroundBlurriness>0?t:e).get(x)),x}function g(S){let x=!1,E=m(S);E===null?p(a,l):E&&E.isColor&&(p(E,1),x=!0);let D=n.xr.getEnvironmentBlendMode();D==="additive"?i.buffers.color.setClear(0,0,0,1,o):D==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||x)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function _(S,x){let E=m(x);E&&(E.isCubeTexture||E.mapping===ea)?(h===void 0&&(h=new $(new at(1,1,1),new An({name:"BackgroundCubeMaterial",uniforms:Ms(Tn.backgroundCube.uniforms),vertexShader:Tn.backgroundCube.vertexShader,fragmentShader:Tn.backgroundCube.fragmentShader,side:Kt,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(D,w,O){this.matrixWorld.copyPosition(O.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),bi.copy(x.backgroundRotation),bi.x*=-1,bi.y*=-1,bi.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(bi.y*=-1,bi.z*=-1),h.material.uniforms.envMap.value=E,h.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(N0.makeRotationFromEuler(bi)),h.material.toneMapped=ct.getTransfer(E.colorSpace)!==ft,(d!==E||f!==E.version||u!==n.toneMapping)&&(h.material.needsUpdate=!0,d=E,f=E.version,u=n.toneMapping),h.layers.enableAll(),S.unshift(h,h.geometry,h.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new $(new Xn(2,2),new An({name:"BackgroundMaterial",uniforms:Ms(Tn.background.uniforms),vertexShader:Tn.background.vertexShader,fragmentShader:Tn.background.fragmentShader,side:ui,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=ct.getTransfer(E.colorSpace)!==ft,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(d!==E||f!==E.version||u!==n.toneMapping)&&(c.material.needsUpdate=!0,d=E,f=E.version,u=n.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null))}function p(S,x){S.getRGB(io,Zd(n)),i.buffers.color.setClear(io.r,io.g,io.b,x,o)}return{getClearColor:function(){return a},setClearColor:function(S,x=1){a.set(S),l=x,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(S){l=S,p(a,l)},render:g,addToRenderList:_}}function H0(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=f(null),r=s,o=!1;function a(y,P,F,L,B){let Z=!1,G=d(L,F,P);r!==G&&(r=G,c(r.object)),Z=u(y,L,F,B),Z&&m(y,L,F,B),B!==null&&e.update(B,n.ELEMENT_ARRAY_BUFFER),(Z||o)&&(o=!1,E(y,P,F,L),B!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(B).buffer))}function l(){return n.createVertexArray()}function c(y){return n.bindVertexArray(y)}function h(y){return n.deleteVertexArray(y)}function d(y,P,F){let L=F.wireframe===!0,B=i[y.id];B===void 0&&(B={},i[y.id]=B);let Z=B[P.id];Z===void 0&&(Z={},B[P.id]=Z);let G=Z[L];return G===void 0&&(G=f(l()),Z[L]=G),G}function f(y){let P=[],F=[],L=[];for(let B=0;B<t;B++)P[B]=0,F[B]=0,L[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:F,attributeDivisors:L,object:y,attributes:{},index:null}}function u(y,P,F,L){let B=r.attributes,Z=P.attributes,G=0,se=F.getAttributes();for(let K in se)if(se[K].location>=0){let pe=B[K],Se=Z[K];if(Se===void 0&&(K==="instanceMatrix"&&y.instanceMatrix&&(Se=y.instanceMatrix),K==="instanceColor"&&y.instanceColor&&(Se=y.instanceColor)),pe===void 0||pe.attribute!==Se||Se&&pe.data!==Se.data)return!0;G++}return r.attributesNum!==G||r.index!==L}function m(y,P,F,L){let B={},Z=P.attributes,G=0,se=F.getAttributes();for(let K in se)if(se[K].location>=0){let pe=Z[K];pe===void 0&&(K==="instanceMatrix"&&y.instanceMatrix&&(pe=y.instanceMatrix),K==="instanceColor"&&y.instanceColor&&(pe=y.instanceColor));let Se={};Se.attribute=pe,pe&&pe.data&&(Se.data=pe.data),B[K]=Se,G++}r.attributes=B,r.attributesNum=G,r.index=L}function g(){let y=r.newAttributes;for(let P=0,F=y.length;P<F;P++)y[P]=0}function _(y){p(y,0)}function p(y,P){let F=r.newAttributes,L=r.enabledAttributes,B=r.attributeDivisors;F[y]=1,L[y]===0&&(n.enableVertexAttribArray(y),L[y]=1),B[y]!==P&&(n.vertexAttribDivisor(y,P),B[y]=P)}function S(){let y=r.newAttributes,P=r.enabledAttributes;for(let F=0,L=P.length;F<L;F++)P[F]!==y[F]&&(n.disableVertexAttribArray(F),P[F]=0)}function x(y,P,F,L,B,Z,G){G===!0?n.vertexAttribIPointer(y,P,F,B,Z):n.vertexAttribPointer(y,P,F,L,B,Z)}function E(y,P,F,L){g();let B=L.attributes,Z=F.getAttributes(),G=P.defaultAttributeValues;for(let se in Z){let K=Z[se];if(K.location>=0){let ge=B[se];if(ge===void 0&&(se==="instanceMatrix"&&y.instanceMatrix&&(ge=y.instanceMatrix),se==="instanceColor"&&y.instanceColor&&(ge=y.instanceColor)),ge!==void 0){let pe=ge.normalized,Se=ge.itemSize,ve=e.get(ge);if(ve===void 0)continue;let tt=ve.buffer,ee=ve.type,ae=ve.bytesPerElement,_e=ee===n.INT||ee===n.UNSIGNED_INT||ge.gpuType===th;if(ge.isInterleavedBufferAttribute){let me=ge.data,Ne=me.stride,Ve=ge.offset;if(me.isInstancedInterleavedBuffer){for(let ze=0;ze<K.locationSize;ze++)p(K.location+ze,me.meshPerAttribute);y.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=me.meshPerAttribute*me.count)}else for(let ze=0;ze<K.locationSize;ze++)_(K.location+ze);n.bindBuffer(n.ARRAY_BUFFER,tt);for(let ze=0;ze<K.locationSize;ze++)x(K.location+ze,Se/K.locationSize,ee,pe,Ne*ae,(Ve+Se/K.locationSize*ze)*ae,_e)}else{if(ge.isInstancedBufferAttribute){for(let me=0;me<K.locationSize;me++)p(K.location+me,ge.meshPerAttribute);y.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let me=0;me<K.locationSize;me++)_(K.location+me);n.bindBuffer(n.ARRAY_BUFFER,tt);for(let me=0;me<K.locationSize;me++)x(K.location+me,Se/K.locationSize,ee,pe,Se*ae,Se/K.locationSize*me*ae,_e)}}else if(G!==void 0){let pe=G[se];if(pe!==void 0)switch(pe.length){case 2:n.vertexAttrib2fv(K.location,pe);break;case 3:n.vertexAttrib3fv(K.location,pe);break;case 4:n.vertexAttrib4fv(K.location,pe);break;default:n.vertexAttrib1fv(K.location,pe)}}}}S()}function D(){U();for(let y in i){let P=i[y];for(let F in P){let L=P[F];for(let B in L)h(L[B].object),delete L[B];delete P[F]}delete i[y]}}function w(y){if(i[y.id]===void 0)return;let P=i[y.id];for(let F in P){let L=P[F];for(let B in L)h(L[B].object),delete L[B];delete P[F]}delete i[y.id]}function O(y){for(let P in i){let F=i[P];if(F[y.id]===void 0)continue;let L=F[y.id];for(let B in L)h(L[B].object),delete L[B];delete F[y.id]}}function U(){T(),o=!0,r!==s&&(r=s,c(r.object))}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:U,resetDefaultState:T,dispose:D,releaseStatesOfGeometry:w,releaseStatesOfProgram:O,initAttributes:g,enableAttribute:_,disableUnusedAttributes:S}}function F0(n,e,t){let i;function s(c){i=c}function r(c,h){n.drawArrays(i,c,h),t.update(h,i,1)}function o(c,h,d){d!==0&&(n.drawArraysInstanced(i,c,h,d),t.update(h,i,d))}function a(c,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,d);let u=0;for(let m=0;m<d;m++)u+=h[m];t.update(u,i,1)}function l(c,h,d,f){if(d===0)return;let u=e.get("WEBGL_multi_draw");if(u===null)for(let m=0;m<c.length;m++)o(c[m],h[m],f[m]);else{u.multiDrawArraysInstancedWEBGL(i,c,0,h,0,f,0,d);let m=0;for(let g=0;g<d;g++)m+=h[g]*f[g];t.update(m,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function B0(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let O=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(O.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(O){return!(O!==_n&&i.convert(O)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(O){let U=O===gr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(O!==kn&&i.convert(O)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&O!==vn&&!U)}function l(O){if(O==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";O="mediump"}return O==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=t.logarithmicDepthBuffer===!0,f=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),u=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_TEXTURE_SIZE),_=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),S=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),x=n.getParameter(n.MAX_VARYING_VECTORS),E=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),D=m>0,w=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reverseDepthBuffer:f,maxTextures:u,maxVertexTextures:m,maxTextureSize:g,maxCubemapSize:_,maxAttributes:p,maxVertexUniforms:S,maxVaryings:x,maxFragmentUniforms:E,vertexTextures:D,maxSamples:w}}function z0(n){let e=this,t=null,i=0,s=!1,r=!1,o=new mn,a=new Ze,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,f){let u=d.length!==0||f||i!==0||s;return s=f,i=d.length,u},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,f){t=h(d,f,0)},this.setState=function(d,f,u){let m=d.clippingPlanes,g=d.clipIntersection,_=d.clipShadows,p=n.get(d);if(!s||m===null||m.length===0||r&&!_)r?h(null):c();else{let S=r?0:i,x=S*4,E=p.clippingState||null;l.value=E,E=h(m,f,x,u);for(let D=0;D!==x;++D)E[D]=t[D];p.clippingState=E,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(d,f,u,m){let g=d!==null?d.length:0,_=null;if(g!==0){if(_=l.value,m!==!0||_===null){let p=u+g*4,S=f.matrixWorldInverse;a.getNormalMatrix(S),(_===null||_.length<p)&&(_=new Float32Array(p));for(let x=0,E=u;x!==g;++x,E+=4)o.copy(d[x]).applyMatrix4(S,a),o.normal.toArray(_,E),_[E+3]=o.constant}l.value=_,l.needsUpdate=!0}return e.numPlanes=g,e.numIntersection=0,_}}function k0(n){let e=new WeakMap;function t(o,a){return a===zc?o.mapping=Es:a===kc&&(o.mapping=xs),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===zc||a===kc)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new yl(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}var wo=class extends Ao{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},us=4,Zu=[.125,.215,.35,.446,.526,.582],Ii=20,yc=new wo,$u=new De,Sc=null,Tc=0,Mc=0,vc=!1,Ri=(1+Math.sqrt(5))/2,cs=1/Ri,Ju=[new N(-Ri,cs,0),new N(Ri,cs,0),new N(-cs,0,Ri),new N(cs,0,Ri),new N(0,Ri,-cs),new N(0,Ri,cs),new N(-1,1,-1),new N(1,1,-1),new N(-1,1,1),new N(1,1,1)],Co=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100){Sc=this._renderer.getRenderTarget(),Tc=this._renderer.getActiveCubeFace(),Mc=this._renderer.getActiveMipmapLevel(),vc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,i,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ed(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Sc,Tc,Mc),this._renderer.xr.enabled=vc,e.scissorTest=!1,so(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Es||e.mapping===xs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Sc=this._renderer.getRenderTarget(),Tc=this._renderer.getActiveCubeFace(),Mc=this._renderer.getActiveMipmapLevel(),vc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Mn,minFilter:Mn,generateMipmaps:!1,type:gr,format:_n,colorSpace:ws,depthBuffer:!1},s=ju(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ju(e,t,i);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=G0(r)),this._blurMaterial=V0(r,e,t)}return s}_compileMaterial(e){let t=new $(this._lodPlanes[0],e);this._renderer.compile(t,yc)}_sceneToCubeUV(e,t,i,s){let a=new Gt(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor($u),h.toneMapping=hi,h.autoClear=!1;let u=new Ct({name:"PMREM.Background",side:Kt,depthWrite:!1,depthTest:!1}),m=new $(new at,u),g=!1,_=e.background;_?_.isColor&&(u.color.copy(_),e.background=null,g=!0):(u.color.copy($u),g=!0);for(let p=0;p<6;p++){let S=p%3;S===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):S===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));let x=this._cubeSize;so(s,S*x,p>2?x:0,x,x),h.setRenderTarget(s),g&&h.render(m,a),h.render(e,a)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=f,h.autoClear=d,e.background=_}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===Es||e.mapping===xs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=ed()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Qu());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new $(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;so(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,yc)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Ju[(s-r-1)%Ju.length];this._blur(e,r-1,r,o,a)}t.autoClear=i}_blur(e,t,i,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,d=new $(this._lodPlanes[s],c),f=c.uniforms,u=this._sizeLods[i]-1,m=isFinite(r)?Math.PI/(2*u):2*Math.PI/(2*Ii-1),g=r/m,_=isFinite(r)?1+Math.floor(h*g):Ii;_>Ii&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${_} samples when the maximum is set to ${Ii}`);let p=[],S=0;for(let O=0;O<Ii;++O){let U=O/g,T=Math.exp(-U*U/2);p.push(T),O===0?S+=T:O<_&&(S+=2*T)}for(let O=0;O<p.length;O++)p[O]=p[O]/S;f.envMap.value=e.texture,f.samples.value=_,f.weights.value=p,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:x}=this;f.dTheta.value=m,f.mipInt.value=x-i;let E=this._sizeLods[s],D=3*E*(s>x-us?s-x+us:0),w=4*(this._cubeSize-E);so(t,D,w,3*E,2*E),l.setRenderTarget(t),l.render(d,yc)}};function G0(n){let e=[],t=[],i=[],s=n,r=n-us+1+Zu.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>n-us?l=Zu[o-n+us-1]:o===0&&(l=0),i.push(l);let c=1/(a-2),h=-c,d=1+c,f=[h,h,d,h,d,d,h,h,d,d,h,d],u=6,m=6,g=3,_=2,p=1,S=new Float32Array(g*m*u),x=new Float32Array(_*m*u),E=new Float32Array(p*m*u);for(let w=0;w<u;w++){let O=w%3*2/3-1,U=w>2?0:-1,T=[O,U,0,O+2/3,U,0,O+2/3,U+1,0,O,U,0,O+2/3,U+1,0,O,U+1,0];S.set(T,g*m*w),x.set(f,_*m*w);let y=[w,w,w,w,w,w];E.set(y,p*m*w)}let D=new gt;D.setAttribute("position",new bt(S,g)),D.setAttribute("uv",new bt(x,_)),D.setAttribute("faceIndex",new bt(E,p)),e.push(D),s>us&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function ju(n,e,t){let i=new Vn(n,e,t);return i.texture.mapping=ea,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function so(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function V0(n,e,t){let i=new Float32Array(Ii),s=new N(0,1,0);return new An({name:"SphericalGaussianBlur",defines:{n:Ii,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:lh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:li,depthTest:!1,depthWrite:!1})}function Qu(){return new An({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:lh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:li,depthTest:!1,depthWrite:!1})}function ed(){return new An({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:lh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:li,depthTest:!1,depthWrite:!1})}function lh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function W0(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===zc||l===kc,h=l===Es||l===xs;if(c||h){let d=e.get(a),f=d!==void 0?d.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new Co(n)),d=c?t.fromEquirectangular(a,d):t.fromCubemap(a,d),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),d.texture;if(d!==void 0)return d.texture;{let u=a.image;return c&&u&&u.height>0||h&&u&&s(u)?(t===null&&(t=new Co(n)),d=c?t.fromEquirectangular(a):t.fromCubemap(a),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),a.addEventListener("dispose",r),d.texture):null}}}return a}function s(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function X0(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&$s("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function Y0(n,e,t,i){let s={},r=new WeakMap;function o(d){let f=d.target;f.index!==null&&e.remove(f.index);for(let m in f.attributes)e.remove(f.attributes[m]);for(let m in f.morphAttributes){let g=f.morphAttributes[m];for(let _=0,p=g.length;_<p;_++)e.remove(g[_])}f.removeEventListener("dispose",o),delete s[f.id];let u=r.get(f);u&&(e.remove(u),r.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(d,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function l(d){let f=d.attributes;for(let m in f)e.update(f[m],n.ARRAY_BUFFER);let u=d.morphAttributes;for(let m in u){let g=u[m];for(let _=0,p=g.length;_<p;_++)e.update(g[_],n.ARRAY_BUFFER)}}function c(d){let f=[],u=d.index,m=d.attributes.position,g=0;if(u!==null){let S=u.array;g=u.version;for(let x=0,E=S.length;x<E;x+=3){let D=S[x+0],w=S[x+1],O=S[x+2];f.push(D,w,w,O,O,D)}}else if(m!==void 0){let S=m.array;g=m.version;for(let x=0,E=S.length/3-1;x<E;x+=3){let D=x+0,w=x+1,O=x+2;f.push(D,w,w,O,O,D)}}else return;let _=new(qd(f)?bo:vo)(f,1);_.version=g;let p=r.get(d);p&&e.remove(p),r.set(d,_)}function h(d){let f=r.get(d);if(f){let u=d.index;u!==null&&f.version<u.version&&c(d)}else c(d);return r.get(d)}return{get:a,update:l,getWireframeAttribute:h}}function q0(n,e,t){let i;function s(f){i=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,u){n.drawElements(i,u,r,f*o),t.update(u,i,1)}function c(f,u,m){m!==0&&(n.drawElementsInstanced(i,u,r,f*o,m),t.update(u,i,m))}function h(f,u,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,f,0,m);let _=0;for(let p=0;p<m;p++)_+=u[p];t.update(_,i,1)}function d(f,u,m,g){if(m===0)return;let _=e.get("WEBGL_multi_draw");if(_===null)for(let p=0;p<f.length;p++)c(f[p]/o,u[p],g[p]);else{_.multiDrawElementsInstancedWEBGL(i,u,0,r,f,0,g,0,m);let p=0;for(let S=0;S<m;S++)p+=u[S]*g[S];t.update(p,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=d}function K0(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function Z0(n,e,t){let i=new WeakMap,s=new pt;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0,f=i.get(a);if(f===void 0||f.count!==d){let T=function(){O.dispose(),i.delete(a),a.removeEventListener("dispose",T)};f!==void 0&&f.texture.dispose();let u=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,g=a.morphAttributes.color!==void 0,_=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],S=a.morphAttributes.color||[],x=0;u===!0&&(x=1),m===!0&&(x=2),g===!0&&(x=3);let E=a.attributes.position.count*x,D=1;E>e.maxTextureSize&&(D=Math.ceil(E/e.maxTextureSize),E=e.maxTextureSize);let w=new Float32Array(E*D*4*d),O=new Mo(w,E,D,d);O.type=vn,O.needsUpdate=!0;let U=x*4;for(let y=0;y<d;y++){let P=_[y],F=p[y],L=S[y],B=E*D*4*y;for(let Z=0;Z<P.count;Z++){let G=Z*U;u===!0&&(s.fromBufferAttribute(P,Z),w[B+G+0]=s.x,w[B+G+1]=s.y,w[B+G+2]=s.z,w[B+G+3]=0),m===!0&&(s.fromBufferAttribute(F,Z),w[B+G+4]=s.x,w[B+G+5]=s.y,w[B+G+6]=s.z,w[B+G+7]=0),g===!0&&(s.fromBufferAttribute(L,Z),w[B+G+8]=s.x,w[B+G+9]=s.y,w[B+G+10]=s.z,w[B+G+11]=L.itemSize===4?s.w:1)}}f={count:d,texture:O,size:new le(E,D)},i.set(a,f),a.addEventListener("dispose",T)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let u=0;for(let g=0;g<c.length;g++)u+=c[g];let m=a.morphTargetsRelative?1:1-u;l.getUniforms().setValue(n,"morphTargetBaseInfluence",m),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:r}}function $0(n,e,t,i){let s=new WeakMap;function r(l){let c=i.render.frame,h=l.geometry,d=e.get(l,h);if(s.get(d)!==c&&(e.update(d),s.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return d}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}var Io=class extends Zt{constructor(e,t,i,s,r,o,a,l,c,h=ps){if(h!==ps&&h!==Ts)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===ps&&(i=Oi),i===void 0&&h===Ts&&(i=Ss),super(null,s,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:tn,this.minFilter=l!==void 0?l:tn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Jd=new Zt,td=new Io(1,1),jd=new Mo,Qd=new El,ef=new Ro,nd=[],id=[],sd=new Float32Array(16),rd=new Float32Array(9),od=new Float32Array(4);function Cs(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=nd[s];if(r===void 0&&(r=new Float32Array(s),nd[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function It(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Pt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function ia(n,e){let t=id[e];t===void 0&&(t=new Int32Array(e),id[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function J0(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function j0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;n.uniform2fv(this.addr,e),Pt(t,e)}}function Q0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(It(t,e))return;n.uniform3fv(this.addr,e),Pt(t,e)}}function eE(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;n.uniform4fv(this.addr,e),Pt(t,e)}}function tE(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(It(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Pt(t,e)}else{if(It(t,i))return;od.set(i),n.uniformMatrix2fv(this.addr,!1,od),Pt(t,i)}}function nE(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(It(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Pt(t,e)}else{if(It(t,i))return;rd.set(i),n.uniformMatrix3fv(this.addr,!1,rd),Pt(t,i)}}function iE(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(It(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Pt(t,e)}else{if(It(t,i))return;sd.set(i),n.uniformMatrix4fv(this.addr,!1,sd),Pt(t,i)}}function sE(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function rE(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;n.uniform2iv(this.addr,e),Pt(t,e)}}function oE(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(It(t,e))return;n.uniform3iv(this.addr,e),Pt(t,e)}}function aE(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;n.uniform4iv(this.addr,e),Pt(t,e)}}function cE(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function lE(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;n.uniform2uiv(this.addr,e),Pt(t,e)}}function hE(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(It(t,e))return;n.uniform3uiv(this.addr,e),Pt(t,e)}}function uE(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;n.uniform4uiv(this.addr,e),Pt(t,e)}}function dE(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(td.compareFunction=Yd,r=td):r=Jd,t.setTexture2D(e||r,s)}function fE(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||Qd,s)}function pE(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||ef,s)}function mE(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||jd,s)}function _E(n){switch(n){case 5126:return J0;case 35664:return j0;case 35665:return Q0;case 35666:return eE;case 35674:return tE;case 35675:return nE;case 35676:return iE;case 5124:case 35670:return sE;case 35667:case 35671:return rE;case 35668:case 35672:return oE;case 35669:case 35673:return aE;case 5125:return cE;case 36294:return lE;case 36295:return hE;case 36296:return uE;case 35678:case 36198:case 36298:case 36306:case 35682:return dE;case 35679:case 36299:case 36307:return fE;case 35680:case 36300:case 36308:case 36293:return pE;case 36289:case 36303:case 36311:case 36292:return mE}}function gE(n,e){n.uniform1fv(this.addr,e)}function EE(n,e){let t=Cs(e,this.size,2);n.uniform2fv(this.addr,t)}function xE(n,e){let t=Cs(e,this.size,3);n.uniform3fv(this.addr,t)}function yE(n,e){let t=Cs(e,this.size,4);n.uniform4fv(this.addr,t)}function SE(n,e){let t=Cs(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function TE(n,e){let t=Cs(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function ME(n,e){let t=Cs(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function vE(n,e){n.uniform1iv(this.addr,e)}function bE(n,e){n.uniform2iv(this.addr,e)}function AE(n,e){n.uniform3iv(this.addr,e)}function RE(n,e){n.uniform4iv(this.addr,e)}function wE(n,e){n.uniform1uiv(this.addr,e)}function CE(n,e){n.uniform2uiv(this.addr,e)}function IE(n,e){n.uniform3uiv(this.addr,e)}function PE(n,e){n.uniform4uiv(this.addr,e)}function OE(n,e,t){let i=this.cache,s=e.length,r=ia(t,s);It(i,r)||(n.uniform1iv(this.addr,r),Pt(i,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Jd,r[o])}function UE(n,e,t){let i=this.cache,s=e.length,r=ia(t,s);It(i,r)||(n.uniform1iv(this.addr,r),Pt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Qd,r[o])}function LE(n,e,t){let i=this.cache,s=e.length,r=ia(t,s);It(i,r)||(n.uniform1iv(this.addr,r),Pt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||ef,r[o])}function NE(n,e,t){let i=this.cache,s=e.length,r=ia(t,s);It(i,r)||(n.uniform1iv(this.addr,r),Pt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||jd,r[o])}function DE(n){switch(n){case 5126:return gE;case 35664:return EE;case 35665:return xE;case 35666:return yE;case 35674:return SE;case 35675:return TE;case 35676:return ME;case 5124:case 35670:return vE;case 35667:case 35671:return bE;case 35668:case 35672:return AE;case 35669:case 35673:return RE;case 5125:return wE;case 36294:return CE;case 36295:return IE;case 36296:return PE;case 35678:case 36198:case 36298:case 36306:case 35682:return OE;case 35679:case 36299:case 36307:return UE;case 35680:case 36300:case 36308:case 36293:return LE;case 36289:case 36303:case 36311:case 36292:return NE}}var Sl=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=_E(t.type)}},Tl=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=DE(t.type)}},Ml=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],i)}}},bc=/(\w+)(\])?(\[|\.)?/g;function ad(n,e){n.seq.push(e),n.map[e.id]=e}function HE(n,e,t){let i=n.name,s=i.length;for(bc.lastIndex=0;;){let r=bc.exec(i),o=bc.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){ad(t,c===void 0?new Sl(a,n,e):new Tl(a,n,e));break}else{let d=t.map[a];d===void 0&&(d=new Ml(a),ad(t,d)),t=d}}}var _s=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);HE(r,o,this)}}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&i.push(o)}return i}};function cd(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var FE=37297,BE=0;function zE(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}var ld=new Ze;function kE(n){ct._getMatrix(ld,ct.workingColorSpace,n);let e=`mat3( ${ld.elements.map(t=>t.toFixed(4))} )`;switch(ct.getTransfer(n)){case ta:return[e,"LinearTransferOETF"];case ft:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function hd(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),s=n.getShaderInfoLog(e).trim();if(i&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+zE(n.getShaderSource(e),o)}else return s}function GE(n,e){let t=kE(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function VE(n,e){let t;switch(e){case em:t="Linear";break;case tm:t="Reinhard";break;case nm:t="Cineon";break;case eh:t="ACESFilmic";break;case sm:t="AgX";break;case rm:t="Neutral";break;case im:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ro=new N;function WE(){ct.getLuminanceCoefficients(ro);let n=ro.x.toFixed(4),e=ro.y.toFixed(4),t=ro.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function XE(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Js).join(`
`)}function YE(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function qE(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),o=r.name,a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Js(n){return n!==""}function ud(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function dd(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var KE=/^[ \t]*#include +<([\w\d./]+)>/gm;function vl(n){return n.replace(KE,$E)}var ZE=new Map;function $E(n,e){let t=je[e];if(t===void 0){let i=ZE.get(e);if(i!==void 0)t=je[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return vl(t)}var JE=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function fd(n){return n.replace(JE,jE)}function jE(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function pd(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function QE(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Ud?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Ql?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Dn&&(e="SHADOWMAP_TYPE_VSM"),e}function ex(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Es:case xs:e="ENVMAP_TYPE_CUBE";break;case ea:e="ENVMAP_TYPE_CUBE_UV";break}return e}function tx(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case xs:e="ENVMAP_MODE_REFRACTION";break}return e}function nx(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Ld:e="ENVMAP_BLENDING_MULTIPLY";break;case jp:e="ENVMAP_BLENDING_MIX";break;case Qp:e="ENVMAP_BLENDING_ADD";break}return e}function ix(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function sx(n,e,t,i){let s=n.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=QE(t),c=ex(t),h=tx(t),d=nx(t),f=ix(t),u=XE(t),m=YE(r),g=s.createProgram(),_,p,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Js).join(`
`),_.length>0&&(_+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Js).join(`
`),p.length>0&&(p+=`
`)):(_=[pd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Js).join(`
`),p=[pd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==hi?"#define TONE_MAPPING":"",t.toneMapping!==hi?je.tonemapping_pars_fragment:"",t.toneMapping!==hi?VE("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",je.colorspace_pars_fragment,GE("linearToOutputTexel",t.outputColorSpace),WE(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Js).join(`
`)),o=vl(o),o=ud(o,t),o=dd(o,t),a=vl(a),a=ud(a,t),a=dd(a,t),o=fd(o),a=fd(a),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,_=[u,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,p=["#define varying in",t.glslVersion===Ru?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ru?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let x=S+_+o,E=S+p+a,D=cd(s,s.VERTEX_SHADER,x),w=cd(s,s.FRAGMENT_SHADER,E);s.attachShader(g,D),s.attachShader(g,w),t.index0AttributeName!==void 0?s.bindAttribLocation(g,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(g,0,"position"),s.linkProgram(g);function O(P){if(n.debug.checkShaderErrors){let F=s.getProgramInfoLog(g).trim(),L=s.getShaderInfoLog(D).trim(),B=s.getShaderInfoLog(w).trim(),Z=!0,G=!0;if(s.getProgramParameter(g,s.LINK_STATUS)===!1)if(Z=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,g,D,w);else{let se=hd(s,D,"vertex"),K=hd(s,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(g,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+F+`
`+se+`
`+K)}else F!==""?console.warn("THREE.WebGLProgram: Program Info Log:",F):(L===""||B==="")&&(G=!1);G&&(P.diagnostics={runnable:Z,programLog:F,vertexShader:{log:L,prefix:_},fragmentShader:{log:B,prefix:p}})}s.deleteShader(D),s.deleteShader(w),U=new _s(s,g),T=qE(s,g)}let U;this.getUniforms=function(){return U===void 0&&O(this),U};let T;this.getAttributes=function(){return T===void 0&&O(this),T};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(g,FE)),y},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=BE++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=D,this.fragmentShader=w,this}var rx=0,bl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Al(e),t.set(e,i)),i}},Al=class{constructor(e){this.id=rx++,this.code=e,this.usedTimes=0}};function ox(n,e,t,i,s,r,o){let a=new or,l=new bl,c=new Set,h=[],d=s.logarithmicDepthBuffer,f=s.vertexTextures,u=s.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(T){return c.add(T),T===0?"uv":`uv${T}`}function _(T,y,P,F,L){let B=F.fog,Z=L.geometry,G=T.isMeshStandardMaterial?F.environment:null,se=(T.isMeshStandardMaterial?t:e).get(T.envMap||G),K=se&&se.mapping===ea?se.image.height:null,ge=m[T.type];T.precision!==null&&(u=s.getMaxPrecision(T.precision),u!==T.precision&&console.warn("THREE.WebGLProgram.getParameters:",T.precision,"not supported, using",u,"instead."));let pe=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Se=pe!==void 0?pe.length:0,ve=0;Z.morphAttributes.position!==void 0&&(ve=1),Z.morphAttributes.normal!==void 0&&(ve=2),Z.morphAttributes.color!==void 0&&(ve=3);let tt,ee,ae,_e;if(ge){let et=Tn[ge];tt=et.vertexShader,ee=et.fragmentShader}else tt=T.vertexShader,ee=T.fragmentShader,l.update(T),ae=l.getVertexShaderID(T),_e=l.getFragmentShaderID(T);let me=n.getRenderTarget(),Ne=n.state.buffers.depth.getReversed(),Ve=L.isInstancedMesh===!0,ze=L.isBatchedMesh===!0,Je=!!T.map,oe=!!T.matcap,de=!!se,H=!!T.aoMap,Ie=!!T.lightMap,he=!!T.bumpMap,Me=!!T.normalMap,fe=!!T.displacementMap,Fe=!!T.emissiveMap,Te=!!T.metalnessMap,I=!!T.roughnessMap,M=T.anisotropy>0,q=T.clearcoat>0,ne=T.dispersion>0,v=T.iridescence>0,C=T.sheen>0,ie=T.transmission>0,Q=M&&!!T.anisotropyMap,ce=q&&!!T.clearcoatMap,Ae=q&&!!T.clearcoatNormalMap,re=q&&!!T.clearcoatRoughnessMap,ye=v&&!!T.iridescenceMap,Ce=v&&!!T.iridescenceThicknessMap,ke=C&&!!T.sheenColorMap,we=C&&!!T.sheenRoughnessMap,nt=!!T.specularMap,R=!!T.specularColorMap,k=!!T.specularIntensityMap,b=ie&&!!T.transmissionMap,z=ie&&!!T.thicknessMap,V=!!T.gradientMap,Y=!!T.alphaMap,te=T.alphaTest>0,ue=!!T.alphaHash,We=!!T.extensions,Ye=hi;T.toneMapped&&(me===null||me.isXRRenderTarget===!0)&&(Ye=n.toneMapping);let st={shaderID:ge,shaderType:T.type,shaderName:T.name,vertexShader:tt,fragmentShader:ee,defines:T.defines,customVertexShaderID:ae,customFragmentShaderID:_e,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:u,batching:ze,batchingColor:ze&&L._colorsTexture!==null,instancing:Ve,instancingColor:Ve&&L.instanceColor!==null,instancingMorph:Ve&&L.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:me===null?n.outputColorSpace:me.isXRRenderTarget===!0?me.texture.colorSpace:ws,alphaToCoverage:!!T.alphaToCoverage,map:Je,matcap:oe,envMap:de,envMapMode:de&&se.mapping,envMapCubeUVHeight:K,aoMap:H,lightMap:Ie,bumpMap:he,normalMap:Me,displacementMap:f&&fe,emissiveMap:Fe,normalMapObjectSpace:Me&&T.normalMapType===lm,normalMapTangentSpace:Me&&T.normalMapType===Xd,metalnessMap:Te,roughnessMap:I,anisotropy:M,anisotropyMap:Q,clearcoat:q,clearcoatMap:ce,clearcoatNormalMap:Ae,clearcoatRoughnessMap:re,dispersion:ne,iridescence:v,iridescenceMap:ye,iridescenceThicknessMap:Ce,sheen:C,sheenColorMap:ke,sheenRoughnessMap:we,specularMap:nt,specularColorMap:R,specularIntensityMap:k,transmission:ie,transmissionMap:b,thicknessMap:z,gradientMap:V,opaque:T.transparent===!1&&T.blending===fs&&T.alphaToCoverage===!1,alphaMap:Y,alphaTest:te,alphaHash:ue,combine:T.combine,mapUv:Je&&g(T.map.channel),aoMapUv:H&&g(T.aoMap.channel),lightMapUv:Ie&&g(T.lightMap.channel),bumpMapUv:he&&g(T.bumpMap.channel),normalMapUv:Me&&g(T.normalMap.channel),displacementMapUv:fe&&g(T.displacementMap.channel),emissiveMapUv:Fe&&g(T.emissiveMap.channel),metalnessMapUv:Te&&g(T.metalnessMap.channel),roughnessMapUv:I&&g(T.roughnessMap.channel),anisotropyMapUv:Q&&g(T.anisotropyMap.channel),clearcoatMapUv:ce&&g(T.clearcoatMap.channel),clearcoatNormalMapUv:Ae&&g(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:re&&g(T.clearcoatRoughnessMap.channel),iridescenceMapUv:ye&&g(T.iridescenceMap.channel),iridescenceThicknessMapUv:Ce&&g(T.iridescenceThicknessMap.channel),sheenColorMapUv:ke&&g(T.sheenColorMap.channel),sheenRoughnessMapUv:we&&g(T.sheenRoughnessMap.channel),specularMapUv:nt&&g(T.specularMap.channel),specularColorMapUv:R&&g(T.specularColorMap.channel),specularIntensityMapUv:k&&g(T.specularIntensityMap.channel),transmissionMapUv:b&&g(T.transmissionMap.channel),thicknessMapUv:z&&g(T.thicknessMap.channel),alphaMapUv:Y&&g(T.alphaMap.channel),vertexTangents:!!Z.attributes.tangent&&(Me||M),vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!Z.attributes.uv&&(Je||Y),fog:!!B,useFog:T.fog===!0,fogExp2:!!B&&B.isFogExp2,flatShading:T.flatShading===!0,sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:Ne,skinning:L.isSkinnedMesh===!0,morphTargets:Z.morphAttributes.position!==void 0,morphNormals:Z.morphAttributes.normal!==void 0,morphColors:Z.morphAttributes.color!==void 0,morphTargetsCount:Se,morphTextureStride:ve,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:T.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ye,decodeVideoTexture:Je&&T.map.isVideoTexture===!0&&ct.getTransfer(T.map.colorSpace)===ft,decodeVideoTextureEmissive:Fe&&T.emissiveMap.isVideoTexture===!0&&ct.getTransfer(T.emissiveMap.colorSpace)===ft,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===Ft,flipSided:T.side===Kt,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:We&&T.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(We&&T.extensions.multiDraw===!0||ze)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return st.vertexUv1s=c.has(1),st.vertexUv2s=c.has(2),st.vertexUv3s=c.has(3),c.clear(),st}function p(T){let y=[];if(T.shaderID?y.push(T.shaderID):(y.push(T.customVertexShaderID),y.push(T.customFragmentShaderID)),T.defines!==void 0)for(let P in T.defines)y.push(P),y.push(T.defines[P]);return T.isRawShaderMaterial===!1&&(S(y,T),x(y,T),y.push(n.outputColorSpace)),y.push(T.customProgramCacheKey),y.join()}function S(T,y){T.push(y.precision),T.push(y.outputColorSpace),T.push(y.envMapMode),T.push(y.envMapCubeUVHeight),T.push(y.mapUv),T.push(y.alphaMapUv),T.push(y.lightMapUv),T.push(y.aoMapUv),T.push(y.bumpMapUv),T.push(y.normalMapUv),T.push(y.displacementMapUv),T.push(y.emissiveMapUv),T.push(y.metalnessMapUv),T.push(y.roughnessMapUv),T.push(y.anisotropyMapUv),T.push(y.clearcoatMapUv),T.push(y.clearcoatNormalMapUv),T.push(y.clearcoatRoughnessMapUv),T.push(y.iridescenceMapUv),T.push(y.iridescenceThicknessMapUv),T.push(y.sheenColorMapUv),T.push(y.sheenRoughnessMapUv),T.push(y.specularMapUv),T.push(y.specularColorMapUv),T.push(y.specularIntensityMapUv),T.push(y.transmissionMapUv),T.push(y.thicknessMapUv),T.push(y.combine),T.push(y.fogExp2),T.push(y.sizeAttenuation),T.push(y.morphTargetsCount),T.push(y.morphAttributeCount),T.push(y.numDirLights),T.push(y.numPointLights),T.push(y.numSpotLights),T.push(y.numSpotLightMaps),T.push(y.numHemiLights),T.push(y.numRectAreaLights),T.push(y.numDirLightShadows),T.push(y.numPointLightShadows),T.push(y.numSpotLightShadows),T.push(y.numSpotLightShadowsWithMaps),T.push(y.numLightProbes),T.push(y.shadowMapType),T.push(y.toneMapping),T.push(y.numClippingPlanes),T.push(y.numClipIntersection),T.push(y.depthPacking)}function x(T,y){a.disableAll(),y.supportsVertexTextures&&a.enable(0),y.instancing&&a.enable(1),y.instancingColor&&a.enable(2),y.instancingMorph&&a.enable(3),y.matcap&&a.enable(4),y.envMap&&a.enable(5),y.normalMapObjectSpace&&a.enable(6),y.normalMapTangentSpace&&a.enable(7),y.clearcoat&&a.enable(8),y.iridescence&&a.enable(9),y.alphaTest&&a.enable(10),y.vertexColors&&a.enable(11),y.vertexAlphas&&a.enable(12),y.vertexUv1s&&a.enable(13),y.vertexUv2s&&a.enable(14),y.vertexUv3s&&a.enable(15),y.vertexTangents&&a.enable(16),y.anisotropy&&a.enable(17),y.alphaHash&&a.enable(18),y.batching&&a.enable(19),y.dispersion&&a.enable(20),y.batchingColor&&a.enable(21),T.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reverseDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),T.push(a.mask)}function E(T){let y=m[T.type],P;if(y){let F=Tn[y];P=$m.clone(F.uniforms)}else P=T.uniforms;return P}function D(T,y){let P;for(let F=0,L=h.length;F<L;F++){let B=h[F];if(B.cacheKey===y){P=B,++P.usedTimes;break}}return P===void 0&&(P=new sx(n,y,T,r),h.push(P)),P}function w(T){if(--T.usedTimes===0){let y=h.indexOf(T);h[y]=h[h.length-1],h.pop(),T.destroy()}}function O(T){l.remove(T)}function U(){l.dispose()}return{getParameters:_,getProgramCacheKey:p,getUniforms:E,acquireProgram:D,releaseProgram:w,releaseShaderCache:O,programs:h,dispose:U}}function ax(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function cx(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function md(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function _d(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(d,f,u,m,g,_){let p=n[e];return p===void 0?(p={id:d.id,object:d,geometry:f,material:u,groupOrder:m,renderOrder:d.renderOrder,z:g,group:_},n[e]=p):(p.id=d.id,p.object=d,p.geometry=f,p.material=u,p.groupOrder=m,p.renderOrder=d.renderOrder,p.z=g,p.group=_),e++,p}function a(d,f,u,m,g,_){let p=o(d,f,u,m,g,_);u.transmission>0?i.push(p):u.transparent===!0?s.push(p):t.push(p)}function l(d,f,u,m,g,_){let p=o(d,f,u,m,g,_);u.transmission>0?i.unshift(p):u.transparent===!0?s.unshift(p):t.unshift(p)}function c(d,f){t.length>1&&t.sort(d||cx),i.length>1&&i.sort(f||md),s.length>1&&s.sort(f||md)}function h(){for(let d=e,f=n.length;d<f;d++){let u=n[d];if(u.id===null)break;u.id=null,u.object=null,u.geometry=null,u.material=null,u.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function lx(){let n=new WeakMap;function e(i,s){let r=n.get(i),o;return r===void 0?(o=new _d,n.set(i,[o])):s>=r.length?(o=new _d,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function hx(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new N,color:new De};break;case"SpotLight":t={position:new N,direction:new N,color:new De,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new De,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new De,groundColor:new De};break;case"RectAreaLight":t={color:new De,position:new N,halfWidth:new N,halfHeight:new N};break}return n[e.id]=t,t}}}function ux(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new le};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new le};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new le,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var dx=0;function fx(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function px(n){let e=new hx,t=ux(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new N);let s=new N,r=new ot,o=new ot;function a(c){let h=0,d=0,f=0;for(let T=0;T<9;T++)i.probe[T].set(0,0,0);let u=0,m=0,g=0,_=0,p=0,S=0,x=0,E=0,D=0,w=0,O=0;c.sort(fx);for(let T=0,y=c.length;T<y;T++){let P=c[T],F=P.color,L=P.intensity,B=P.distance,Z=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=F.r*L,d+=F.g*L,f+=F.b*L;else if(P.isLightProbe){for(let G=0;G<9;G++)i.probe[G].addScaledVector(P.sh.coefficients[G],L);O++}else if(P.isDirectionalLight){let G=e.get(P);if(G.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let se=P.shadow,K=t.get(P);K.shadowIntensity=se.intensity,K.shadowBias=se.bias,K.shadowNormalBias=se.normalBias,K.shadowRadius=se.radius,K.shadowMapSize=se.mapSize,i.directionalShadow[u]=K,i.directionalShadowMap[u]=Z,i.directionalShadowMatrix[u]=P.shadow.matrix,S++}i.directional[u]=G,u++}else if(P.isSpotLight){let G=e.get(P);G.position.setFromMatrixPosition(P.matrixWorld),G.color.copy(F).multiplyScalar(L),G.distance=B,G.coneCos=Math.cos(P.angle),G.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),G.decay=P.decay,i.spot[g]=G;let se=P.shadow;if(P.map&&(i.spotLightMap[D]=P.map,D++,se.updateMatrices(P),P.castShadow&&w++),i.spotLightMatrix[g]=se.matrix,P.castShadow){let K=t.get(P);K.shadowIntensity=se.intensity,K.shadowBias=se.bias,K.shadowNormalBias=se.normalBias,K.shadowRadius=se.radius,K.shadowMapSize=se.mapSize,i.spotShadow[g]=K,i.spotShadowMap[g]=Z,E++}g++}else if(P.isRectAreaLight){let G=e.get(P);G.color.copy(F).multiplyScalar(L),G.halfWidth.set(P.width*.5,0,0),G.halfHeight.set(0,P.height*.5,0),i.rectArea[_]=G,_++}else if(P.isPointLight){let G=e.get(P);if(G.color.copy(P.color).multiplyScalar(P.intensity),G.distance=P.distance,G.decay=P.decay,P.castShadow){let se=P.shadow,K=t.get(P);K.shadowIntensity=se.intensity,K.shadowBias=se.bias,K.shadowNormalBias=se.normalBias,K.shadowRadius=se.radius,K.shadowMapSize=se.mapSize,K.shadowCameraNear=se.camera.near,K.shadowCameraFar=se.camera.far,i.pointShadow[m]=K,i.pointShadowMap[m]=Z,i.pointShadowMatrix[m]=P.shadow.matrix,x++}i.point[m]=G,m++}else if(P.isHemisphereLight){let G=e.get(P);G.skyColor.copy(P.color).multiplyScalar(L),G.groundColor.copy(P.groundColor).multiplyScalar(L),i.hemi[p]=G,p++}}_>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=xe.LTC_FLOAT_1,i.rectAreaLTC2=xe.LTC_FLOAT_2):(i.rectAreaLTC1=xe.LTC_HALF_1,i.rectAreaLTC2=xe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=f;let U=i.hash;(U.directionalLength!==u||U.pointLength!==m||U.spotLength!==g||U.rectAreaLength!==_||U.hemiLength!==p||U.numDirectionalShadows!==S||U.numPointShadows!==x||U.numSpotShadows!==E||U.numSpotMaps!==D||U.numLightProbes!==O)&&(i.directional.length=u,i.spot.length=g,i.rectArea.length=_,i.point.length=m,i.hemi.length=p,i.directionalShadow.length=S,i.directionalShadowMap.length=S,i.pointShadow.length=x,i.pointShadowMap.length=x,i.spotShadow.length=E,i.spotShadowMap.length=E,i.directionalShadowMatrix.length=S,i.pointShadowMatrix.length=x,i.spotLightMatrix.length=E+D-w,i.spotLightMap.length=D,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=O,U.directionalLength=u,U.pointLength=m,U.spotLength=g,U.rectAreaLength=_,U.hemiLength=p,U.numDirectionalShadows=S,U.numPointShadows=x,U.numSpotShadows=E,U.numSpotMaps=D,U.numLightProbes=O,i.version=dx++)}function l(c,h){let d=0,f=0,u=0,m=0,g=0,_=h.matrixWorldInverse;for(let p=0,S=c.length;p<S;p++){let x=c[p];if(x.isDirectionalLight){let E=i.directional[d];E.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(_),d++}else if(x.isSpotLight){let E=i.spot[u];E.position.setFromMatrixPosition(x.matrixWorld),E.position.applyMatrix4(_),E.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(_),u++}else if(x.isRectAreaLight){let E=i.rectArea[m];E.position.setFromMatrixPosition(x.matrixWorld),E.position.applyMatrix4(_),o.identity(),r.copy(x.matrixWorld),r.premultiply(_),o.extractRotation(r),E.halfWidth.set(x.width*.5,0,0),E.halfHeight.set(0,x.height*.5,0),E.halfWidth.applyMatrix4(o),E.halfHeight.applyMatrix4(o),m++}else if(x.isPointLight){let E=i.point[f];E.position.setFromMatrixPosition(x.matrixWorld),E.position.applyMatrix4(_),f++}else if(x.isHemisphereLight){let E=i.hemi[g];E.direction.setFromMatrixPosition(x.matrixWorld),E.direction.transformDirection(_),g++}}}return{setup:a,setupView:l,state:i}}function gd(n){let e=new px(n),t=[],i=[];function s(h){c.camera=h,t.length=0,i.length=0}function r(h){t.push(h)}function o(h){i.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}let c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function mx(n){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new gd(n),e.set(s,[a])):r>=o.length?(a=new gd(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var Rl=class extends fi{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=am,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},wl=class extends fi{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},_x=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,gx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Ex(n,e,t){let i=new ar,s=new le,r=new le,o=new pt,a=new Rl({depthPacking:cm}),l=new wl,c={},h=t.maxTextureSize,d={[ui]:Kt,[Kt]:ui,[Ft]:Ft},f=new An({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new le},radius:{value:4}},vertexShader:_x,fragmentShader:gx}),u=f.clone();u.defines.HORIZONTAL_PASS=1;let m=new gt;m.setAttribute("position",new bt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let g=new $(m,f),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ud;let p=this.type;this.render=function(w,O,U){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||w.length===0)return;let T=n.getRenderTarget(),y=n.getActiveCubeFace(),P=n.getActiveMipmapLevel(),F=n.state;F.setBlending(li),F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let L=p!==Dn&&this.type===Dn,B=p===Dn&&this.type!==Dn;for(let Z=0,G=w.length;Z<G;Z++){let se=w[Z],K=se.shadow;if(K===void 0){console.warn("THREE.WebGLShadowMap:",se,"has no shadow.");continue}if(K.autoUpdate===!1&&K.needsUpdate===!1)continue;s.copy(K.mapSize);let ge=K.getFrameExtents();if(s.multiply(ge),r.copy(K.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ge.x),s.x=r.x*ge.x,K.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ge.y),s.y=r.y*ge.y,K.mapSize.y=r.y)),K.map===null||L===!0||B===!0){let Se=this.type!==Dn?{minFilter:tn,magFilter:tn}:{};K.map!==null&&K.map.dispose(),K.map=new Vn(s.x,s.y,Se),K.map.texture.name=se.name+".shadowMap",K.camera.updateProjectionMatrix()}n.setRenderTarget(K.map),n.clear();let pe=K.getViewportCount();for(let Se=0;Se<pe;Se++){let ve=K.getViewport(Se);o.set(r.x*ve.x,r.y*ve.y,r.x*ve.z,r.y*ve.w),F.viewport(o),K.updateMatrices(se,Se),i=K.getFrustum(),E(O,U,K.camera,se,this.type)}K.isPointLightShadow!==!0&&this.type===Dn&&S(K,U),K.needsUpdate=!1}p=this.type,_.needsUpdate=!1,n.setRenderTarget(T,y,P)};function S(w,O){let U=e.update(g);f.defines.VSM_SAMPLES!==w.blurSamples&&(f.defines.VSM_SAMPLES=w.blurSamples,u.defines.VSM_SAMPLES=w.blurSamples,f.needsUpdate=!0,u.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Vn(s.x,s.y)),f.uniforms.shadow_pass.value=w.map.texture,f.uniforms.resolution.value=w.mapSize,f.uniforms.radius.value=w.radius,n.setRenderTarget(w.mapPass),n.clear(),n.renderBufferDirect(O,null,U,f,g,null),u.uniforms.shadow_pass.value=w.mapPass.texture,u.uniforms.resolution.value=w.mapSize,u.uniforms.radius.value=w.radius,n.setRenderTarget(w.map),n.clear(),n.renderBufferDirect(O,null,U,u,g,null)}function x(w,O,U,T){let y=null,P=U.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(P!==void 0)y=P;else if(y=U.isPointLight===!0?l:a,n.localClippingEnabled&&O.clipShadows===!0&&Array.isArray(O.clippingPlanes)&&O.clippingPlanes.length!==0||O.displacementMap&&O.displacementScale!==0||O.alphaMap&&O.alphaTest>0||O.map&&O.alphaTest>0){let F=y.uuid,L=O.uuid,B=c[F];B===void 0&&(B={},c[F]=B);let Z=B[L];Z===void 0&&(Z=y.clone(),B[L]=Z,O.addEventListener("dispose",D)),y=Z}if(y.visible=O.visible,y.wireframe=O.wireframe,T===Dn?y.side=O.shadowSide!==null?O.shadowSide:O.side:y.side=O.shadowSide!==null?O.shadowSide:d[O.side],y.alphaMap=O.alphaMap,y.alphaTest=O.alphaTest,y.map=O.map,y.clipShadows=O.clipShadows,y.clippingPlanes=O.clippingPlanes,y.clipIntersection=O.clipIntersection,y.displacementMap=O.displacementMap,y.displacementScale=O.displacementScale,y.displacementBias=O.displacementBias,y.wireframeLinewidth=O.wireframeLinewidth,y.linewidth=O.linewidth,U.isPointLight===!0&&y.isMeshDistanceMaterial===!0){let F=n.properties.get(y);F.light=U}return y}function E(w,O,U,T,y){if(w.visible===!1)return;if(w.layers.test(O.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&y===Dn)&&(!w.frustumCulled||i.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse,w.matrixWorld);let L=e.update(w),B=w.material;if(Array.isArray(B)){let Z=L.groups;for(let G=0,se=Z.length;G<se;G++){let K=Z[G],ge=B[K.materialIndex];if(ge&&ge.visible){let pe=x(w,ge,T,y);w.onBeforeShadow(n,w,O,U,L,pe,K),n.renderBufferDirect(U,null,L,pe,w,K),w.onAfterShadow(n,w,O,U,L,pe,K)}}}else if(B.visible){let Z=x(w,B,T,y);w.onBeforeShadow(n,w,O,U,L,Z,null),n.renderBufferDirect(U,null,L,Z,w,null),w.onAfterShadow(n,w,O,U,L,Z,null)}}let F=w.children;for(let L=0,B=F.length;L<B;L++)E(F[L],O,U,T,y)}function D(w){w.target.removeEventListener("dispose",D);for(let U in c){let T=c[U],y=w.target.uuid;y in T&&(T[y].dispose(),delete T[y])}}}var xx={[Uc]:Lc,[Nc]:Fc,[Dc]:Bc,[gs]:Hc,[Lc]:Uc,[Fc]:Nc,[Bc]:Dc,[Hc]:gs};function yx(n,e){function t(){let b=!1,z=new pt,V=null,Y=new pt(0,0,0,0);return{setMask:function(te){V!==te&&!b&&(n.colorMask(te,te,te,te),V=te)},setLocked:function(te){b=te},setClear:function(te,ue,We,Ye,st){st===!0&&(te*=Ye,ue*=Ye,We*=Ye),z.set(te,ue,We,Ye),Y.equals(z)===!1&&(n.clearColor(te,ue,We,Ye),Y.copy(z))},reset:function(){b=!1,V=null,Y.set(-1,0,0,0)}}}function i(){let b=!1,z=!1,V=null,Y=null,te=null;return{setReversed:function(ue){if(z!==ue){let We=e.get("EXT_clip_control");z?We.clipControlEXT(We.LOWER_LEFT_EXT,We.ZERO_TO_ONE_EXT):We.clipControlEXT(We.LOWER_LEFT_EXT,We.NEGATIVE_ONE_TO_ONE_EXT);let Ye=te;te=null,this.setClear(Ye)}z=ue},getReversed:function(){return z},setTest:function(ue){ue?me(n.DEPTH_TEST):Ne(n.DEPTH_TEST)},setMask:function(ue){V!==ue&&!b&&(n.depthMask(ue),V=ue)},setFunc:function(ue){if(z&&(ue=xx[ue]),Y!==ue){switch(ue){case Uc:n.depthFunc(n.NEVER);break;case Lc:n.depthFunc(n.ALWAYS);break;case Nc:n.depthFunc(n.LESS);break;case gs:n.depthFunc(n.LEQUAL);break;case Dc:n.depthFunc(n.EQUAL);break;case Hc:n.depthFunc(n.GEQUAL);break;case Fc:n.depthFunc(n.GREATER);break;case Bc:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}Y=ue}},setLocked:function(ue){b=ue},setClear:function(ue){te!==ue&&(z&&(ue=1-ue),n.clearDepth(ue),te=ue)},reset:function(){b=!1,V=null,Y=null,te=null,z=!1}}}function s(){let b=!1,z=null,V=null,Y=null,te=null,ue=null,We=null,Ye=null,st=null;return{setTest:function(et){b||(et?me(n.STENCIL_TEST):Ne(n.STENCIL_TEST))},setMask:function(et){z!==et&&!b&&(n.stencilMask(et),z=et)},setFunc:function(et,Ht,Ut){(V!==et||Y!==Ht||te!==Ut)&&(n.stencilFunc(et,Ht,Ut),V=et,Y=Ht,te=Ut)},setOp:function(et,Ht,Ut){(ue!==et||We!==Ht||Ye!==Ut)&&(n.stencilOp(et,Ht,Ut),ue=et,We=Ht,Ye=Ut)},setLocked:function(et){b=et},setClear:function(et){st!==et&&(n.clearStencil(et),st=et)},reset:function(){b=!1,z=null,V=null,Y=null,te=null,ue=null,We=null,Ye=null,st=null}}}let r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap,h={},d={},f=new WeakMap,u=[],m=null,g=!1,_=null,p=null,S=null,x=null,E=null,D=null,w=null,O=new De(0,0,0),U=0,T=!1,y=null,P=null,F=null,L=null,B=null,Z=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),G=!1,se=0,K=n.getParameter(n.VERSION);K.indexOf("WebGL")!==-1?(se=parseFloat(/^WebGL (\d)/.exec(K)[1]),G=se>=1):K.indexOf("OpenGL ES")!==-1&&(se=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),G=se>=2);let ge=null,pe={},Se=n.getParameter(n.SCISSOR_BOX),ve=n.getParameter(n.VIEWPORT),tt=new pt().fromArray(Se),ee=new pt().fromArray(ve);function ae(b,z,V,Y){let te=new Uint8Array(4),ue=n.createTexture();n.bindTexture(b,ue),n.texParameteri(b,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(b,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let We=0;We<V;We++)b===n.TEXTURE_3D||b===n.TEXTURE_2D_ARRAY?n.texImage3D(z,0,n.RGBA,1,1,Y,0,n.RGBA,n.UNSIGNED_BYTE,te):n.texImage2D(z+We,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,te);return ue}let _e={};_e[n.TEXTURE_2D]=ae(n.TEXTURE_2D,n.TEXTURE_2D,1),_e[n.TEXTURE_CUBE_MAP]=ae(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),_e[n.TEXTURE_2D_ARRAY]=ae(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),_e[n.TEXTURE_3D]=ae(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),me(n.DEPTH_TEST),o.setFunc(gs),he(!1),Me(xu),me(n.CULL_FACE),H(li);function me(b){h[b]!==!0&&(n.enable(b),h[b]=!0)}function Ne(b){h[b]!==!1&&(n.disable(b),h[b]=!1)}function Ve(b,z){return d[b]!==z?(n.bindFramebuffer(b,z),d[b]=z,b===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=z),b===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=z),!0):!1}function ze(b,z){let V=u,Y=!1;if(b){V=f.get(z),V===void 0&&(V=[],f.set(z,V));let te=b.textures;if(V.length!==te.length||V[0]!==n.COLOR_ATTACHMENT0){for(let ue=0,We=te.length;ue<We;ue++)V[ue]=n.COLOR_ATTACHMENT0+ue;V.length=te.length,Y=!0}}else V[0]!==n.BACK&&(V[0]=n.BACK,Y=!0);Y&&n.drawBuffers(V)}function Je(b){return m!==b?(n.useProgram(b),m=b,!0):!1}let oe={[wi]:n.FUNC_ADD,[Np]:n.FUNC_SUBTRACT,[Dp]:n.FUNC_REVERSE_SUBTRACT};oe[Hp]=n.MIN,oe[Fp]=n.MAX;let de={[Bp]:n.ZERO,[zp]:n.ONE,[kp]:n.SRC_COLOR,[Pc]:n.SRC_ALPHA,[qp]:n.SRC_ALPHA_SATURATE,[Xp]:n.DST_COLOR,[Vp]:n.DST_ALPHA,[Gp]:n.ONE_MINUS_SRC_COLOR,[Oc]:n.ONE_MINUS_SRC_ALPHA,[Yp]:n.ONE_MINUS_DST_COLOR,[Wp]:n.ONE_MINUS_DST_ALPHA,[Kp]:n.CONSTANT_COLOR,[Zp]:n.ONE_MINUS_CONSTANT_COLOR,[$p]:n.CONSTANT_ALPHA,[Jp]:n.ONE_MINUS_CONSTANT_ALPHA};function H(b,z,V,Y,te,ue,We,Ye,st,et){if(b===li){g===!0&&(Ne(n.BLEND),g=!1);return}if(g===!1&&(me(n.BLEND),g=!0),b!==Lp){if(b!==_||et!==T){if((p!==wi||E!==wi)&&(n.blendEquation(n.FUNC_ADD),p=wi,E=wi),et)switch(b){case fs:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case zn:n.blendFunc(n.ONE,n.ONE);break;case yu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Su:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",b);break}else switch(b){case fs:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case zn:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case yu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Su:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",b);break}S=null,x=null,D=null,w=null,O.set(0,0,0),U=0,_=b,T=et}return}te=te||z,ue=ue||V,We=We||Y,(z!==p||te!==E)&&(n.blendEquationSeparate(oe[z],oe[te]),p=z,E=te),(V!==S||Y!==x||ue!==D||We!==w)&&(n.blendFuncSeparate(de[V],de[Y],de[ue],de[We]),S=V,x=Y,D=ue,w=We),(Ye.equals(O)===!1||st!==U)&&(n.blendColor(Ye.r,Ye.g,Ye.b,st),O.copy(Ye),U=st),_=b,T=!1}function Ie(b,z){b.side===Ft?Ne(n.CULL_FACE):me(n.CULL_FACE);let V=b.side===Kt;z&&(V=!V),he(V),b.blending===fs&&b.transparent===!1?H(li):H(b.blending,b.blendEquation,b.blendSrc,b.blendDst,b.blendEquationAlpha,b.blendSrcAlpha,b.blendDstAlpha,b.blendColor,b.blendAlpha,b.premultipliedAlpha),o.setFunc(b.depthFunc),o.setTest(b.depthTest),o.setMask(b.depthWrite),r.setMask(b.colorWrite);let Y=b.stencilWrite;a.setTest(Y),Y&&(a.setMask(b.stencilWriteMask),a.setFunc(b.stencilFunc,b.stencilRef,b.stencilFuncMask),a.setOp(b.stencilFail,b.stencilZFail,b.stencilZPass)),Fe(b.polygonOffset,b.polygonOffsetFactor,b.polygonOffsetUnits),b.alphaToCoverage===!0?me(n.SAMPLE_ALPHA_TO_COVERAGE):Ne(n.SAMPLE_ALPHA_TO_COVERAGE)}function he(b){y!==b&&(b?n.frontFace(n.CW):n.frontFace(n.CCW),y=b)}function Me(b){b!==Op?(me(n.CULL_FACE),b!==P&&(b===xu?n.cullFace(n.BACK):b===Up?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Ne(n.CULL_FACE),P=b}function fe(b){b!==F&&(G&&n.lineWidth(b),F=b)}function Fe(b,z,V){b?(me(n.POLYGON_OFFSET_FILL),(L!==z||B!==V)&&(n.polygonOffset(z,V),L=z,B=V)):Ne(n.POLYGON_OFFSET_FILL)}function Te(b){b?me(n.SCISSOR_TEST):Ne(n.SCISSOR_TEST)}function I(b){b===void 0&&(b=n.TEXTURE0+Z-1),ge!==b&&(n.activeTexture(b),ge=b)}function M(b,z,V){V===void 0&&(ge===null?V=n.TEXTURE0+Z-1:V=ge);let Y=pe[V];Y===void 0&&(Y={type:void 0,texture:void 0},pe[V]=Y),(Y.type!==b||Y.texture!==z)&&(ge!==V&&(n.activeTexture(V),ge=V),n.bindTexture(b,z||_e[b]),Y.type=b,Y.texture=z)}function q(){let b=pe[ge];b!==void 0&&b.type!==void 0&&(n.bindTexture(b.type,null),b.type=void 0,b.texture=void 0)}function ne(){try{n.compressedTexImage2D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function v(){try{n.compressedTexImage3D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function C(){try{n.texSubImage2D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function ie(){try{n.texSubImage3D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Q(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function ce(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Ae(){try{n.texStorage2D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function re(){try{n.texStorage3D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function ye(){try{n.texImage2D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Ce(){try{n.texImage3D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function ke(b){tt.equals(b)===!1&&(n.scissor(b.x,b.y,b.z,b.w),tt.copy(b))}function we(b){ee.equals(b)===!1&&(n.viewport(b.x,b.y,b.z,b.w),ee.copy(b))}function nt(b,z){let V=c.get(z);V===void 0&&(V=new WeakMap,c.set(z,V));let Y=V.get(b);Y===void 0&&(Y=n.getUniformBlockIndex(z,b.name),V.set(b,Y))}function R(b,z){let Y=c.get(z).get(b);l.get(z)!==Y&&(n.uniformBlockBinding(z,Y,b.__bindingPointIndex),l.set(z,Y))}function k(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),h={},ge=null,pe={},d={},f=new WeakMap,u=[],m=null,g=!1,_=null,p=null,S=null,x=null,E=null,D=null,w=null,O=new De(0,0,0),U=0,T=!1,y=null,P=null,F=null,L=null,B=null,tt.set(0,0,n.canvas.width,n.canvas.height),ee.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:me,disable:Ne,bindFramebuffer:Ve,drawBuffers:ze,useProgram:Je,setBlending:H,setMaterial:Ie,setFlipSided:he,setCullFace:Me,setLineWidth:fe,setPolygonOffset:Fe,setScissorTest:Te,activeTexture:I,bindTexture:M,unbindTexture:q,compressedTexImage2D:ne,compressedTexImage3D:v,texImage2D:ye,texImage3D:Ce,updateUBOMapping:nt,uniformBlockBinding:R,texStorage2D:Ae,texStorage3D:re,texSubImage2D:C,texSubImage3D:ie,compressedTexSubImage2D:Q,compressedTexSubImage3D:ce,scissor:ke,viewport:we,reset:k}}function Ed(n,e,t,i){let s=Sx(i);switch(t){case Bd:return n*e;case kd:return n*e;case Gd:return n*e*2;case sh:return n*e/s.components*s.byteLength;case rh:return n*e/s.components*s.byteLength;case Vd:return n*e*2/s.components*s.byteLength;case oh:return n*e*2/s.components*s.byteLength;case zd:return n*e*3/s.components*s.byteLength;case _n:return n*e*4/s.components*s.byteLength;case ah:return n*e*4/s.components*s.byteLength;case po:case mo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case _o:case go:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Wc:case Yc:return Math.max(n,16)*Math.max(e,8)/4;case Vc:case Xc:return Math.max(n,8)*Math.max(e,8)/2;case qc:case Kc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Zc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case $c:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Jc:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case jc:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Qc:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case el:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case tl:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case nl:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case il:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case sl:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case rl:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case ol:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case al:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case cl:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case ll:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Eo:case hl:case ul:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Wd:case dl:return Math.ceil(n/4)*Math.ceil(e/4)*8;case fl:case pl:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Sx(n){switch(n){case kn:case Dd:return{byteLength:1,components:1};case sr:case Hd:case gr:return{byteLength:2,components:1};case nh:case ih:return{byteLength:2,components:4};case Oi:case th:case vn:return{byteLength:4,components:1};case Fd:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function Tx(n,e,t,i,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new le,h=new WeakMap,d,f=new WeakMap,u=!1;try{u=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(I,M){return u?new OffscreenCanvas(I,M):So("canvas")}function g(I,M,q){let ne=1,v=Te(I);if((v.width>q||v.height>q)&&(ne=q/Math.max(v.width,v.height)),ne<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let C=Math.floor(ne*v.width),ie=Math.floor(ne*v.height);d===void 0&&(d=m(C,ie));let Q=M?m(C,ie):d;return Q.width=C,Q.height=ie,Q.getContext("2d").drawImage(I,0,0,C,ie),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+v.width+"x"+v.height+") to ("+C+"x"+ie+")."),Q}else return"data"in I&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+v.width+"x"+v.height+")."),I;return I}function _(I){return I.generateMipmaps}function p(I){n.generateMipmap(I)}function S(I){return I.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?n.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function x(I,M,q,ne,v=!1){if(I!==null){if(n[I]!==void 0)return n[I];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let C=M;if(M===n.RED&&(q===n.FLOAT&&(C=n.R32F),q===n.HALF_FLOAT&&(C=n.R16F),q===n.UNSIGNED_BYTE&&(C=n.R8)),M===n.RED_INTEGER&&(q===n.UNSIGNED_BYTE&&(C=n.R8UI),q===n.UNSIGNED_SHORT&&(C=n.R16UI),q===n.UNSIGNED_INT&&(C=n.R32UI),q===n.BYTE&&(C=n.R8I),q===n.SHORT&&(C=n.R16I),q===n.INT&&(C=n.R32I)),M===n.RG&&(q===n.FLOAT&&(C=n.RG32F),q===n.HALF_FLOAT&&(C=n.RG16F),q===n.UNSIGNED_BYTE&&(C=n.RG8)),M===n.RG_INTEGER&&(q===n.UNSIGNED_BYTE&&(C=n.RG8UI),q===n.UNSIGNED_SHORT&&(C=n.RG16UI),q===n.UNSIGNED_INT&&(C=n.RG32UI),q===n.BYTE&&(C=n.RG8I),q===n.SHORT&&(C=n.RG16I),q===n.INT&&(C=n.RG32I)),M===n.RGB_INTEGER&&(q===n.UNSIGNED_BYTE&&(C=n.RGB8UI),q===n.UNSIGNED_SHORT&&(C=n.RGB16UI),q===n.UNSIGNED_INT&&(C=n.RGB32UI),q===n.BYTE&&(C=n.RGB8I),q===n.SHORT&&(C=n.RGB16I),q===n.INT&&(C=n.RGB32I)),M===n.RGBA_INTEGER&&(q===n.UNSIGNED_BYTE&&(C=n.RGBA8UI),q===n.UNSIGNED_SHORT&&(C=n.RGBA16UI),q===n.UNSIGNED_INT&&(C=n.RGBA32UI),q===n.BYTE&&(C=n.RGBA8I),q===n.SHORT&&(C=n.RGBA16I),q===n.INT&&(C=n.RGBA32I)),M===n.RGB&&q===n.UNSIGNED_INT_5_9_9_9_REV&&(C=n.RGB9_E5),M===n.RGBA){let ie=v?ta:ct.getTransfer(ne);q===n.FLOAT&&(C=n.RGBA32F),q===n.HALF_FLOAT&&(C=n.RGBA16F),q===n.UNSIGNED_BYTE&&(C=ie===ft?n.SRGB8_ALPHA8:n.RGBA8),q===n.UNSIGNED_SHORT_4_4_4_4&&(C=n.RGBA4),q===n.UNSIGNED_SHORT_5_5_5_1&&(C=n.RGB5_A1)}return(C===n.R16F||C===n.R32F||C===n.RG16F||C===n.RG32F||C===n.RGBA16F||C===n.RGBA32F)&&e.get("EXT_color_buffer_float"),C}function E(I,M){let q;return I?M===null||M===Oi||M===Ss?q=n.DEPTH24_STENCIL8:M===vn?q=n.DEPTH32F_STENCIL8:M===sr&&(q=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Oi||M===Ss?q=n.DEPTH_COMPONENT24:M===vn?q=n.DEPTH_COMPONENT32F:M===sr&&(q=n.DEPTH_COMPONENT16),q}function D(I,M){return _(I)===!0||I.isFramebufferTexture&&I.minFilter!==tn&&I.minFilter!==Mn?Math.log2(Math.max(M.width,M.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?M.mipmaps.length:1}function w(I){let M=I.target;M.removeEventListener("dispose",w),U(M),M.isVideoTexture&&h.delete(M)}function O(I){let M=I.target;M.removeEventListener("dispose",O),y(M)}function U(I){let M=i.get(I);if(M.__webglInit===void 0)return;let q=I.source,ne=f.get(q);if(ne){let v=ne[M.__cacheKey];v.usedTimes--,v.usedTimes===0&&T(I),Object.keys(ne).length===0&&f.delete(q)}i.remove(I)}function T(I){let M=i.get(I);n.deleteTexture(M.__webglTexture);let q=I.source,ne=f.get(q);delete ne[M.__cacheKey],o.memory.textures--}function y(I){let M=i.get(I);if(I.depthTexture&&(I.depthTexture.dispose(),i.remove(I.depthTexture)),I.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(M.__webglFramebuffer[ne]))for(let v=0;v<M.__webglFramebuffer[ne].length;v++)n.deleteFramebuffer(M.__webglFramebuffer[ne][v]);else n.deleteFramebuffer(M.__webglFramebuffer[ne]);M.__webglDepthbuffer&&n.deleteRenderbuffer(M.__webglDepthbuffer[ne])}else{if(Array.isArray(M.__webglFramebuffer))for(let ne=0;ne<M.__webglFramebuffer.length;ne++)n.deleteFramebuffer(M.__webglFramebuffer[ne]);else n.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&n.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&n.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let ne=0;ne<M.__webglColorRenderbuffer.length;ne++)M.__webglColorRenderbuffer[ne]&&n.deleteRenderbuffer(M.__webglColorRenderbuffer[ne]);M.__webglDepthRenderbuffer&&n.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let q=I.textures;for(let ne=0,v=q.length;ne<v;ne++){let C=i.get(q[ne]);C.__webglTexture&&(n.deleteTexture(C.__webglTexture),o.memory.textures--),i.remove(q[ne])}i.remove(I)}let P=0;function F(){P=0}function L(){let I=P;return I>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+I+" texture units while this GPU supports only "+s.maxTextures),P+=1,I}function B(I){let M=[];return M.push(I.wrapS),M.push(I.wrapT),M.push(I.wrapR||0),M.push(I.magFilter),M.push(I.minFilter),M.push(I.anisotropy),M.push(I.internalFormat),M.push(I.format),M.push(I.type),M.push(I.generateMipmaps),M.push(I.premultiplyAlpha),M.push(I.flipY),M.push(I.unpackAlignment),M.push(I.colorSpace),M.join()}function Z(I,M){let q=i.get(I);if(I.isVideoTexture&&fe(I),I.isRenderTargetTexture===!1&&I.version>0&&q.__version!==I.version){let ne=I.image;if(ne===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ne.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ee(q,I,M);return}}t.bindTexture(n.TEXTURE_2D,q.__webglTexture,n.TEXTURE0+M)}function G(I,M){let q=i.get(I);if(I.version>0&&q.__version!==I.version){ee(q,I,M);return}t.bindTexture(n.TEXTURE_2D_ARRAY,q.__webglTexture,n.TEXTURE0+M)}function se(I,M){let q=i.get(I);if(I.version>0&&q.__version!==I.version){ee(q,I,M);return}t.bindTexture(n.TEXTURE_3D,q.__webglTexture,n.TEXTURE0+M)}function K(I,M){let q=i.get(I);if(I.version>0&&q.__version!==I.version){ae(q,I,M);return}t.bindTexture(n.TEXTURE_CUBE_MAP,q.__webglTexture,n.TEXTURE0+M)}let ge={[ys]:n.REPEAT,[Hn]:n.CLAMP_TO_EDGE,[Gc]:n.MIRRORED_REPEAT},pe={[tn]:n.NEAREST,[om]:n.NEAREST_MIPMAP_NEAREST,[Br]:n.NEAREST_MIPMAP_LINEAR,[Mn]:n.LINEAR,[ja]:n.LINEAR_MIPMAP_NEAREST,[Pi]:n.LINEAR_MIPMAP_LINEAR},Se={[hm]:n.NEVER,[_m]:n.ALWAYS,[um]:n.LESS,[Yd]:n.LEQUAL,[dm]:n.EQUAL,[mm]:n.GEQUAL,[fm]:n.GREATER,[pm]:n.NOTEQUAL};function ve(I,M){if(M.type===vn&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===Mn||M.magFilter===ja||M.magFilter===Br||M.magFilter===Pi||M.minFilter===Mn||M.minFilter===ja||M.minFilter===Br||M.minFilter===Pi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(I,n.TEXTURE_WRAP_S,ge[M.wrapS]),n.texParameteri(I,n.TEXTURE_WRAP_T,ge[M.wrapT]),(I===n.TEXTURE_3D||I===n.TEXTURE_2D_ARRAY)&&n.texParameteri(I,n.TEXTURE_WRAP_R,ge[M.wrapR]),n.texParameteri(I,n.TEXTURE_MAG_FILTER,pe[M.magFilter]),n.texParameteri(I,n.TEXTURE_MIN_FILTER,pe[M.minFilter]),M.compareFunction&&(n.texParameteri(I,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(I,n.TEXTURE_COMPARE_FUNC,Se[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===tn||M.minFilter!==Br&&M.minFilter!==Pi||M.type===vn&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||i.get(M).__currentAnisotropy){let q=e.get("EXT_texture_filter_anisotropic");n.texParameterf(I,q.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),i.get(M).__currentAnisotropy=M.anisotropy}}}function tt(I,M){let q=!1;I.__webglInit===void 0&&(I.__webglInit=!0,M.addEventListener("dispose",w));let ne=M.source,v=f.get(ne);v===void 0&&(v={},f.set(ne,v));let C=B(M);if(C!==I.__cacheKey){v[C]===void 0&&(v[C]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,q=!0),v[C].usedTimes++;let ie=v[I.__cacheKey];ie!==void 0&&(v[I.__cacheKey].usedTimes--,ie.usedTimes===0&&T(M)),I.__cacheKey=C,I.__webglTexture=v[C].texture}return q}function ee(I,M,q){let ne=n.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(ne=n.TEXTURE_2D_ARRAY),M.isData3DTexture&&(ne=n.TEXTURE_3D);let v=tt(I,M),C=M.source;t.bindTexture(ne,I.__webglTexture,n.TEXTURE0+q);let ie=i.get(C);if(C.version!==ie.__version||v===!0){t.activeTexture(n.TEXTURE0+q);let Q=ct.getPrimaries(ct.workingColorSpace),ce=M.colorSpace===ci?null:ct.getPrimaries(M.colorSpace),Ae=M.colorSpace===ci||Q===ce?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,M.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,M.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ae);let re=g(M.image,!1,s.maxTextureSize);re=Fe(M,re);let ye=r.convert(M.format,M.colorSpace),Ce=r.convert(M.type),ke=x(M.internalFormat,ye,Ce,M.colorSpace,M.isVideoTexture);ve(ne,M);let we,nt=M.mipmaps,R=M.isVideoTexture!==!0,k=ie.__version===void 0||v===!0,b=C.dataReady,z=D(M,re);if(M.isDepthTexture)ke=E(M.format===Ts,M.type),k&&(R?t.texStorage2D(n.TEXTURE_2D,1,ke,re.width,re.height):t.texImage2D(n.TEXTURE_2D,0,ke,re.width,re.height,0,ye,Ce,null));else if(M.isDataTexture)if(nt.length>0){R&&k&&t.texStorage2D(n.TEXTURE_2D,z,ke,nt[0].width,nt[0].height);for(let V=0,Y=nt.length;V<Y;V++)we=nt[V],R?b&&t.texSubImage2D(n.TEXTURE_2D,V,0,0,we.width,we.height,ye,Ce,we.data):t.texImage2D(n.TEXTURE_2D,V,ke,we.width,we.height,0,ye,Ce,we.data);M.generateMipmaps=!1}else R?(k&&t.texStorage2D(n.TEXTURE_2D,z,ke,re.width,re.height),b&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,re.width,re.height,ye,Ce,re.data)):t.texImage2D(n.TEXTURE_2D,0,ke,re.width,re.height,0,ye,Ce,re.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){R&&k&&t.texStorage3D(n.TEXTURE_2D_ARRAY,z,ke,nt[0].width,nt[0].height,re.depth);for(let V=0,Y=nt.length;V<Y;V++)if(we=nt[V],M.format!==_n)if(ye!==null)if(R){if(b)if(M.layerUpdates.size>0){let te=Ed(we.width,we.height,M.format,M.type);for(let ue of M.layerUpdates){let We=we.data.subarray(ue*te/we.data.BYTES_PER_ELEMENT,(ue+1)*te/we.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,V,0,0,ue,we.width,we.height,1,ye,We)}M.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,V,0,0,0,we.width,we.height,re.depth,ye,we.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,V,ke,we.width,we.height,re.depth,0,we.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else R?b&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,V,0,0,0,we.width,we.height,re.depth,ye,Ce,we.data):t.texImage3D(n.TEXTURE_2D_ARRAY,V,ke,we.width,we.height,re.depth,0,ye,Ce,we.data)}else{R&&k&&t.texStorage2D(n.TEXTURE_2D,z,ke,nt[0].width,nt[0].height);for(let V=0,Y=nt.length;V<Y;V++)we=nt[V],M.format!==_n?ye!==null?R?b&&t.compressedTexSubImage2D(n.TEXTURE_2D,V,0,0,we.width,we.height,ye,we.data):t.compressedTexImage2D(n.TEXTURE_2D,V,ke,we.width,we.height,0,we.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):R?b&&t.texSubImage2D(n.TEXTURE_2D,V,0,0,we.width,we.height,ye,Ce,we.data):t.texImage2D(n.TEXTURE_2D,V,ke,we.width,we.height,0,ye,Ce,we.data)}else if(M.isDataArrayTexture)if(R){if(k&&t.texStorage3D(n.TEXTURE_2D_ARRAY,z,ke,re.width,re.height,re.depth),b)if(M.layerUpdates.size>0){let V=Ed(re.width,re.height,M.format,M.type);for(let Y of M.layerUpdates){let te=re.data.subarray(Y*V/re.data.BYTES_PER_ELEMENT,(Y+1)*V/re.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,Y,re.width,re.height,1,ye,Ce,te)}M.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,re.width,re.height,re.depth,ye,Ce,re.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,ke,re.width,re.height,re.depth,0,ye,Ce,re.data);else if(M.isData3DTexture)R?(k&&t.texStorage3D(n.TEXTURE_3D,z,ke,re.width,re.height,re.depth),b&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,re.width,re.height,re.depth,ye,Ce,re.data)):t.texImage3D(n.TEXTURE_3D,0,ke,re.width,re.height,re.depth,0,ye,Ce,re.data);else if(M.isFramebufferTexture){if(k)if(R)t.texStorage2D(n.TEXTURE_2D,z,ke,re.width,re.height);else{let V=re.width,Y=re.height;for(let te=0;te<z;te++)t.texImage2D(n.TEXTURE_2D,te,ke,V,Y,0,ye,Ce,null),V>>=1,Y>>=1}}else if(nt.length>0){if(R&&k){let V=Te(nt[0]);t.texStorage2D(n.TEXTURE_2D,z,ke,V.width,V.height)}for(let V=0,Y=nt.length;V<Y;V++)we=nt[V],R?b&&t.texSubImage2D(n.TEXTURE_2D,V,0,0,ye,Ce,we):t.texImage2D(n.TEXTURE_2D,V,ke,ye,Ce,we);M.generateMipmaps=!1}else if(R){if(k){let V=Te(re);t.texStorage2D(n.TEXTURE_2D,z,ke,V.width,V.height)}b&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ye,Ce,re)}else t.texImage2D(n.TEXTURE_2D,0,ke,ye,Ce,re);_(M)&&p(ne),ie.__version=C.version,M.onUpdate&&M.onUpdate(M)}I.__version=M.version}function ae(I,M,q){if(M.image.length!==6)return;let ne=tt(I,M),v=M.source;t.bindTexture(n.TEXTURE_CUBE_MAP,I.__webglTexture,n.TEXTURE0+q);let C=i.get(v);if(v.version!==C.__version||ne===!0){t.activeTexture(n.TEXTURE0+q);let ie=ct.getPrimaries(ct.workingColorSpace),Q=M.colorSpace===ci?null:ct.getPrimaries(M.colorSpace),ce=M.colorSpace===ci||ie===Q?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,M.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,M.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ce);let Ae=M.isCompressedTexture||M.image[0].isCompressedTexture,re=M.image[0]&&M.image[0].isDataTexture,ye=[];for(let Y=0;Y<6;Y++)!Ae&&!re?ye[Y]=g(M.image[Y],!0,s.maxCubemapSize):ye[Y]=re?M.image[Y].image:M.image[Y],ye[Y]=Fe(M,ye[Y]);let Ce=ye[0],ke=r.convert(M.format,M.colorSpace),we=r.convert(M.type),nt=x(M.internalFormat,ke,we,M.colorSpace),R=M.isVideoTexture!==!0,k=C.__version===void 0||ne===!0,b=v.dataReady,z=D(M,Ce);ve(n.TEXTURE_CUBE_MAP,M);let V;if(Ae){R&&k&&t.texStorage2D(n.TEXTURE_CUBE_MAP,z,nt,Ce.width,Ce.height);for(let Y=0;Y<6;Y++){V=ye[Y].mipmaps;for(let te=0;te<V.length;te++){let ue=V[te];M.format!==_n?ke!==null?R?b&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,te,0,0,ue.width,ue.height,ke,ue.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,te,nt,ue.width,ue.height,0,ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):R?b&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,te,0,0,ue.width,ue.height,ke,we,ue.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,te,nt,ue.width,ue.height,0,ke,we,ue.data)}}}else{if(V=M.mipmaps,R&&k){V.length>0&&z++;let Y=Te(ye[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,z,nt,Y.width,Y.height)}for(let Y=0;Y<6;Y++)if(re){R?b&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,ye[Y].width,ye[Y].height,ke,we,ye[Y].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,nt,ye[Y].width,ye[Y].height,0,ke,we,ye[Y].data);for(let te=0;te<V.length;te++){let We=V[te].image[Y].image;R?b&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,te+1,0,0,We.width,We.height,ke,we,We.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,te+1,nt,We.width,We.height,0,ke,we,We.data)}}else{R?b&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,ke,we,ye[Y]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,nt,ke,we,ye[Y]);for(let te=0;te<V.length;te++){let ue=V[te];R?b&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,te+1,0,0,ke,we,ue.image[Y]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,te+1,nt,ke,we,ue.image[Y])}}}_(M)&&p(n.TEXTURE_CUBE_MAP),C.__version=v.version,M.onUpdate&&M.onUpdate(M)}I.__version=M.version}function _e(I,M,q,ne,v,C){let ie=r.convert(q.format,q.colorSpace),Q=r.convert(q.type),ce=x(q.internalFormat,ie,Q,q.colorSpace),Ae=i.get(M),re=i.get(q);if(re.__renderTarget=M,!Ae.__hasExternalTextures){let ye=Math.max(1,M.width>>C),Ce=Math.max(1,M.height>>C);v===n.TEXTURE_3D||v===n.TEXTURE_2D_ARRAY?t.texImage3D(v,C,ce,ye,Ce,M.depth,0,ie,Q,null):t.texImage2D(v,C,ce,ye,Ce,0,ie,Q,null)}t.bindFramebuffer(n.FRAMEBUFFER,I),Me(M)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ne,v,re.__webglTexture,0,he(M)):(v===n.TEXTURE_2D||v>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&v<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,ne,v,re.__webglTexture,C),t.bindFramebuffer(n.FRAMEBUFFER,null)}function me(I,M,q){if(n.bindRenderbuffer(n.RENDERBUFFER,I),M.depthBuffer){let ne=M.depthTexture,v=ne&&ne.isDepthTexture?ne.type:null,C=E(M.stencilBuffer,v),ie=M.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Q=he(M);Me(M)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Q,C,M.width,M.height):q?n.renderbufferStorageMultisample(n.RENDERBUFFER,Q,C,M.width,M.height):n.renderbufferStorage(n.RENDERBUFFER,C,M.width,M.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ie,n.RENDERBUFFER,I)}else{let ne=M.textures;for(let v=0;v<ne.length;v++){let C=ne[v],ie=r.convert(C.format,C.colorSpace),Q=r.convert(C.type),ce=x(C.internalFormat,ie,Q,C.colorSpace),Ae=he(M);q&&Me(M)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ae,ce,M.width,M.height):Me(M)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ae,ce,M.width,M.height):n.renderbufferStorage(n.RENDERBUFFER,ce,M.width,M.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Ne(I,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,I),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let ne=i.get(M.depthTexture);ne.__renderTarget=M,(!ne.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),Z(M.depthTexture,0);let v=ne.__webglTexture,C=he(M);if(M.depthTexture.format===ps)Me(M)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,v,0,C):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,v,0);else if(M.depthTexture.format===Ts)Me(M)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,v,0,C):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,v,0);else throw new Error("Unknown depthTexture format")}function Ve(I){let M=i.get(I),q=I.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==I.depthTexture){let ne=I.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),ne){let v=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,ne.removeEventListener("dispose",v)};ne.addEventListener("dispose",v),M.__depthDisposeCallback=v}M.__boundDepthTexture=ne}if(I.depthTexture&&!M.__autoAllocateDepthBuffer){if(q)throw new Error("target.depthTexture not supported in Cube render targets");Ne(M.__webglFramebuffer,I)}else if(q){M.__webglDepthbuffer=[];for(let ne=0;ne<6;ne++)if(t.bindFramebuffer(n.FRAMEBUFFER,M.__webglFramebuffer[ne]),M.__webglDepthbuffer[ne]===void 0)M.__webglDepthbuffer[ne]=n.createRenderbuffer(),me(M.__webglDepthbuffer[ne],I,!1);else{let v=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,C=M.__webglDepthbuffer[ne];n.bindRenderbuffer(n.RENDERBUFFER,C),n.framebufferRenderbuffer(n.FRAMEBUFFER,v,n.RENDERBUFFER,C)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=n.createRenderbuffer(),me(M.__webglDepthbuffer,I,!1);else{let ne=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,v=M.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,v),n.framebufferRenderbuffer(n.FRAMEBUFFER,ne,n.RENDERBUFFER,v)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function ze(I,M,q){let ne=i.get(I);M!==void 0&&_e(ne.__webglFramebuffer,I,I.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),q!==void 0&&Ve(I)}function Je(I){let M=I.texture,q=i.get(I),ne=i.get(M);I.addEventListener("dispose",O);let v=I.textures,C=I.isWebGLCubeRenderTarget===!0,ie=v.length>1;if(ie||(ne.__webglTexture===void 0&&(ne.__webglTexture=n.createTexture()),ne.__version=M.version,o.memory.textures++),C){q.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(M.mipmaps&&M.mipmaps.length>0){q.__webglFramebuffer[Q]=[];for(let ce=0;ce<M.mipmaps.length;ce++)q.__webglFramebuffer[Q][ce]=n.createFramebuffer()}else q.__webglFramebuffer[Q]=n.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){q.__webglFramebuffer=[];for(let Q=0;Q<M.mipmaps.length;Q++)q.__webglFramebuffer[Q]=n.createFramebuffer()}else q.__webglFramebuffer=n.createFramebuffer();if(ie)for(let Q=0,ce=v.length;Q<ce;Q++){let Ae=i.get(v[Q]);Ae.__webglTexture===void 0&&(Ae.__webglTexture=n.createTexture(),o.memory.textures++)}if(I.samples>0&&Me(I)===!1){q.__webglMultisampledFramebuffer=n.createFramebuffer(),q.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,q.__webglMultisampledFramebuffer);for(let Q=0;Q<v.length;Q++){let ce=v[Q];q.__webglColorRenderbuffer[Q]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,q.__webglColorRenderbuffer[Q]);let Ae=r.convert(ce.format,ce.colorSpace),re=r.convert(ce.type),ye=x(ce.internalFormat,Ae,re,ce.colorSpace,I.isXRRenderTarget===!0),Ce=he(I);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ce,ye,I.width,I.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Q,n.RENDERBUFFER,q.__webglColorRenderbuffer[Q])}n.bindRenderbuffer(n.RENDERBUFFER,null),I.depthBuffer&&(q.__webglDepthRenderbuffer=n.createRenderbuffer(),me(q.__webglDepthRenderbuffer,I,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(C){t.bindTexture(n.TEXTURE_CUBE_MAP,ne.__webglTexture),ve(n.TEXTURE_CUBE_MAP,M);for(let Q=0;Q<6;Q++)if(M.mipmaps&&M.mipmaps.length>0)for(let ce=0;ce<M.mipmaps.length;ce++)_e(q.__webglFramebuffer[Q][ce],I,M,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ce);else _e(q.__webglFramebuffer[Q],I,M,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);_(M)&&p(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ie){for(let Q=0,ce=v.length;Q<ce;Q++){let Ae=v[Q],re=i.get(Ae);t.bindTexture(n.TEXTURE_2D,re.__webglTexture),ve(n.TEXTURE_2D,Ae),_e(q.__webglFramebuffer,I,Ae,n.COLOR_ATTACHMENT0+Q,n.TEXTURE_2D,0),_(Ae)&&p(n.TEXTURE_2D)}t.unbindTexture()}else{let Q=n.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(Q=I.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Q,ne.__webglTexture),ve(Q,M),M.mipmaps&&M.mipmaps.length>0)for(let ce=0;ce<M.mipmaps.length;ce++)_e(q.__webglFramebuffer[ce],I,M,n.COLOR_ATTACHMENT0,Q,ce);else _e(q.__webglFramebuffer,I,M,n.COLOR_ATTACHMENT0,Q,0);_(M)&&p(Q),t.unbindTexture()}I.depthBuffer&&Ve(I)}function oe(I){let M=I.textures;for(let q=0,ne=M.length;q<ne;q++){let v=M[q];if(_(v)){let C=S(I),ie=i.get(v).__webglTexture;t.bindTexture(C,ie),p(C),t.unbindTexture()}}}let de=[],H=[];function Ie(I){if(I.samples>0){if(Me(I)===!1){let M=I.textures,q=I.width,ne=I.height,v=n.COLOR_BUFFER_BIT,C=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=i.get(I),Q=M.length>1;if(Q)for(let ce=0;ce<M.length;ce++)t.bindFramebuffer(n.FRAMEBUFFER,ie.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,ie.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,ie.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ie.__webglFramebuffer);for(let ce=0;ce<M.length;ce++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(v|=n.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(v|=n.STENCIL_BUFFER_BIT)),Q){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ie.__webglColorRenderbuffer[ce]);let Ae=i.get(M[ce]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ae,0)}n.blitFramebuffer(0,0,q,ne,0,0,q,ne,v,n.NEAREST),l===!0&&(de.length=0,H.length=0,de.push(n.COLOR_ATTACHMENT0+ce),I.depthBuffer&&I.resolveDepthBuffer===!1&&(de.push(C),H.push(C),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,H)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,de))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Q)for(let ce=0;ce<M.length;ce++){t.bindFramebuffer(n.FRAMEBUFFER,ie.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.RENDERBUFFER,ie.__webglColorRenderbuffer[ce]);let Ae=i.get(M[ce]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,ie.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.TEXTURE_2D,Ae,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ie.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.resolveDepthBuffer===!1&&l){let M=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[M])}}}function he(I){return Math.min(s.maxSamples,I.samples)}function Me(I){let M=i.get(I);return I.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function fe(I){let M=o.render.frame;h.get(I)!==M&&(h.set(I,M),I.update())}function Fe(I,M){let q=I.colorSpace,ne=I.format,v=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||q!==ws&&q!==ci&&(ct.getTransfer(q)===ft?(ne!==_n||v!==kn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",q)),M}function Te(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(c.width=I.naturalWidth||I.width,c.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(c.width=I.displayWidth,c.height=I.displayHeight):(c.width=I.width,c.height=I.height),c}this.allocateTextureUnit=L,this.resetTextureUnits=F,this.setTexture2D=Z,this.setTexture2DArray=G,this.setTexture3D=se,this.setTextureCube=K,this.rebindTextures=ze,this.setupRenderTarget=Je,this.updateRenderTargetMipmap=oe,this.updateMultisampleRenderTarget=Ie,this.setupDepthRenderbuffer=Ve,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=Me}function Mx(n,e){function t(i,s=ci){let r,o=ct.getTransfer(s);if(i===kn)return n.UNSIGNED_BYTE;if(i===nh)return n.UNSIGNED_SHORT_4_4_4_4;if(i===ih)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Fd)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Dd)return n.BYTE;if(i===Hd)return n.SHORT;if(i===sr)return n.UNSIGNED_SHORT;if(i===th)return n.INT;if(i===Oi)return n.UNSIGNED_INT;if(i===vn)return n.FLOAT;if(i===gr)return n.HALF_FLOAT;if(i===Bd)return n.ALPHA;if(i===zd)return n.RGB;if(i===_n)return n.RGBA;if(i===kd)return n.LUMINANCE;if(i===Gd)return n.LUMINANCE_ALPHA;if(i===ps)return n.DEPTH_COMPONENT;if(i===Ts)return n.DEPTH_STENCIL;if(i===sh)return n.RED;if(i===rh)return n.RED_INTEGER;if(i===Vd)return n.RG;if(i===oh)return n.RG_INTEGER;if(i===ah)return n.RGBA_INTEGER;if(i===po||i===mo||i===_o||i===go)if(o===ft)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===po)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===mo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===_o)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===go)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===po)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===mo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===_o)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===go)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Vc||i===Wc||i===Xc||i===Yc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Vc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Wc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Xc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Yc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===qc||i===Kc||i===Zc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===qc||i===Kc)return o===ft?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Zc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===$c||i===Jc||i===jc||i===Qc||i===el||i===tl||i===nl||i===il||i===sl||i===rl||i===ol||i===al||i===cl||i===ll)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===$c)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Jc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===jc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Qc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===el)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===tl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===nl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===il)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===sl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===rl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===ol)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===al)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===cl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===ll)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Eo||i===hl||i===ul)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Eo)return o===ft?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===hl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===ul)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Wd||i===dl||i===fl||i===pl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Eo)return r.COMPRESSED_RED_RGTC1_EXT;if(i===dl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===fl)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===pl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Ss?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var Cl=class extends Gt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Pe=class extends Vt{constructor(){super(),this.isGroup=!0,this.type="Group"}},vx={type:"move"},er=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Pe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Pe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Pe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let g of e.hand.values()){let _=t.getJointPose(g,i),p=this._getHandJoint(c,g);_!==null&&(p.matrix.fromArray(_.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=_.radius),p.visible=_!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],f=h.position.distanceTo(d.position),u=.02,m=.005;c.inputState.pinching&&f>u+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=u-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(vx)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Pe;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},bx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ax=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Il=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){let s=new Zt,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new An({vertexShader:bx,fragmentShader:Ax,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new $(new Xn(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Pl=class extends Gn{constructor(e,t){super();let i=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,d=null,f=null,u=null,m=null,g=new Il,_=t.getContextAttributes(),p=null,S=null,x=[],E=[],D=new le,w=null,O=new Gt;O.viewport=new pt;let U=new Gt;U.viewport=new pt;let T=[O,U],y=new Cl,P=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ee){let ae=x[ee];return ae===void 0&&(ae=new er,x[ee]=ae),ae.getTargetRaySpace()},this.getControllerGrip=function(ee){let ae=x[ee];return ae===void 0&&(ae=new er,x[ee]=ae),ae.getGripSpace()},this.getHand=function(ee){let ae=x[ee];return ae===void 0&&(ae=new er,x[ee]=ae),ae.getHandSpace()};function L(ee){let ae=E.indexOf(ee.inputSource);if(ae===-1)return;let _e=x[ae];_e!==void 0&&(_e.update(ee.inputSource,ee.frame,c||o),_e.dispatchEvent({type:ee.type,data:ee.inputSource}))}function B(){s.removeEventListener("select",L),s.removeEventListener("selectstart",L),s.removeEventListener("selectend",L),s.removeEventListener("squeeze",L),s.removeEventListener("squeezestart",L),s.removeEventListener("squeezeend",L),s.removeEventListener("end",B),s.removeEventListener("inputsourceschange",Z);for(let ee=0;ee<x.length;ee++){let ae=E[ee];ae!==null&&(E[ee]=null,x[ee].disconnect(ae))}P=null,F=null,g.reset(),e.setRenderTarget(p),u=null,f=null,d=null,s=null,S=null,tt.stop(),i.isPresenting=!1,e.setPixelRatio(w),e.setSize(D.width,D.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ee){r=ee,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ee){a=ee,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(ee){c=ee},this.getBaseLayer=function(){return f!==null?f:u},this.getBinding=function(){return d},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(ee){if(s=ee,s!==null){if(p=e.getRenderTarget(),s.addEventListener("select",L),s.addEventListener("selectstart",L),s.addEventListener("selectend",L),s.addEventListener("squeeze",L),s.addEventListener("squeezestart",L),s.addEventListener("squeezeend",L),s.addEventListener("end",B),s.addEventListener("inputsourceschange",Z),_.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(D),s.renderState.layers===void 0){let ae={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:r};u=new XRWebGLLayer(s,t,ae),s.updateRenderState({baseLayer:u}),e.setPixelRatio(1),e.setSize(u.framebufferWidth,u.framebufferHeight,!1),S=new Vn(u.framebufferWidth,u.framebufferHeight,{format:_n,type:kn,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil})}else{let ae=null,_e=null,me=null;_.depth&&(me=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ae=_.stencil?Ts:ps,_e=_.stencil?Ss:Oi);let Ne={colorFormat:t.RGBA8,depthFormat:me,scaleFactor:r};d=new XRWebGLBinding(s,t),f=d.createProjectionLayer(Ne),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new Vn(f.textureWidth,f.textureHeight,{format:_n,type:kn,depthTexture:new Io(f.textureWidth,f.textureHeight,_e,void 0,void 0,void 0,void 0,void 0,void 0,ae),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),tt.setContext(s),tt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function Z(ee){for(let ae=0;ae<ee.removed.length;ae++){let _e=ee.removed[ae],me=E.indexOf(_e);me>=0&&(E[me]=null,x[me].disconnect(_e))}for(let ae=0;ae<ee.added.length;ae++){let _e=ee.added[ae],me=E.indexOf(_e);if(me===-1){for(let Ve=0;Ve<x.length;Ve++)if(Ve>=E.length){E.push(_e),me=Ve;break}else if(E[Ve]===null){E[Ve]=_e,me=Ve;break}if(me===-1)break}let Ne=x[me];Ne&&Ne.connect(_e)}}let G=new N,se=new N;function K(ee,ae,_e){G.setFromMatrixPosition(ae.matrixWorld),se.setFromMatrixPosition(_e.matrixWorld);let me=G.distanceTo(se),Ne=ae.projectionMatrix.elements,Ve=_e.projectionMatrix.elements,ze=Ne[14]/(Ne[10]-1),Je=Ne[14]/(Ne[10]+1),oe=(Ne[9]+1)/Ne[5],de=(Ne[9]-1)/Ne[5],H=(Ne[8]-1)/Ne[0],Ie=(Ve[8]+1)/Ve[0],he=ze*H,Me=ze*Ie,fe=me/(-H+Ie),Fe=fe*-H;if(ae.matrixWorld.decompose(ee.position,ee.quaternion,ee.scale),ee.translateX(Fe),ee.translateZ(fe),ee.matrixWorld.compose(ee.position,ee.quaternion,ee.scale),ee.matrixWorldInverse.copy(ee.matrixWorld).invert(),Ne[10]===-1)ee.projectionMatrix.copy(ae.projectionMatrix),ee.projectionMatrixInverse.copy(ae.projectionMatrixInverse);else{let Te=ze+fe,I=Je+fe,M=he-Fe,q=Me+(me-Fe),ne=oe*Je/I*Te,v=de*Je/I*Te;ee.projectionMatrix.makePerspective(M,q,ne,v,Te,I),ee.projectionMatrixInverse.copy(ee.projectionMatrix).invert()}}function ge(ee,ae){ae===null?ee.matrixWorld.copy(ee.matrix):ee.matrixWorld.multiplyMatrices(ae.matrixWorld,ee.matrix),ee.matrixWorldInverse.copy(ee.matrixWorld).invert()}this.updateCamera=function(ee){if(s===null)return;let ae=ee.near,_e=ee.far;g.texture!==null&&(g.depthNear>0&&(ae=g.depthNear),g.depthFar>0&&(_e=g.depthFar)),y.near=U.near=O.near=ae,y.far=U.far=O.far=_e,(P!==y.near||F!==y.far)&&(s.updateRenderState({depthNear:y.near,depthFar:y.far}),P=y.near,F=y.far),O.layers.mask=ee.layers.mask|2,U.layers.mask=ee.layers.mask|4,y.layers.mask=O.layers.mask|U.layers.mask;let me=ee.parent,Ne=y.cameras;ge(y,me);for(let Ve=0;Ve<Ne.length;Ve++)ge(Ne[Ve],me);Ne.length===2?K(y,O,U):y.projectionMatrix.copy(O.projectionMatrix),pe(ee,y,me)};function pe(ee,ae,_e){_e===null?ee.matrix.copy(ae.matrixWorld):(ee.matrix.copy(_e.matrixWorld),ee.matrix.invert(),ee.matrix.multiply(ae.matrixWorld)),ee.matrix.decompose(ee.position,ee.quaternion,ee.scale),ee.updateMatrixWorld(!0),ee.projectionMatrix.copy(ae.projectionMatrix),ee.projectionMatrixInverse.copy(ae.projectionMatrixInverse),ee.isPerspectiveCamera&&(ee.fov=rr*2*Math.atan(1/ee.projectionMatrix.elements[5]),ee.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(f===null&&u===null))return l},this.setFoveation=function(ee){l=ee,f!==null&&(f.fixedFoveation=ee),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=ee)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(y)};let Se=null;function ve(ee,ae){if(h=ae.getViewerPose(c||o),m=ae,h!==null){let _e=h.views;u!==null&&(e.setRenderTargetFramebuffer(S,u.framebuffer),e.setRenderTarget(S));let me=!1;_e.length!==y.cameras.length&&(y.cameras.length=0,me=!0);for(let Ve=0;Ve<_e.length;Ve++){let ze=_e[Ve],Je=null;if(u!==null)Je=u.getViewport(ze);else{let de=d.getViewSubImage(f,ze);Je=de.viewport,Ve===0&&(e.setRenderTargetTextures(S,de.colorTexture,f.ignoreDepthValues?void 0:de.depthStencilTexture),e.setRenderTarget(S))}let oe=T[Ve];oe===void 0&&(oe=new Gt,oe.layers.enable(Ve),oe.viewport=new pt,T[Ve]=oe),oe.matrix.fromArray(ze.transform.matrix),oe.matrix.decompose(oe.position,oe.quaternion,oe.scale),oe.projectionMatrix.fromArray(ze.projectionMatrix),oe.projectionMatrixInverse.copy(oe.projectionMatrix).invert(),oe.viewport.set(Je.x,Je.y,Je.width,Je.height),Ve===0&&(y.matrix.copy(oe.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),me===!0&&y.cameras.push(oe)}let Ne=s.enabledFeatures;if(Ne&&Ne.includes("depth-sensing")){let Ve=d.getDepthInformation(_e[0]);Ve&&Ve.isValid&&Ve.texture&&g.init(e,Ve,s.renderState)}}for(let _e=0;_e<x.length;_e++){let me=E[_e],Ne=x[_e];me!==null&&Ne!==void 0&&Ne.update(me,ae,c||o)}Se&&Se(ee,ae),ae.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ae}),m=null}let tt=new $d;tt.setAnimationLoop(ve),this.setAnimationLoop=function(ee){Se=ee},this.dispose=function(){}}},Ai=new bn,Rx=new ot;function wx(n,e){function t(_,p){_.matrixAutoUpdate===!0&&_.updateMatrix(),p.value.copy(_.matrix)}function i(_,p){p.color.getRGB(_.fogColor.value,Zd(n)),p.isFog?(_.fogNear.value=p.near,_.fogFar.value=p.far):p.isFogExp2&&(_.fogDensity.value=p.density)}function s(_,p,S,x,E){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(_,p):p.isMeshToonMaterial?(r(_,p),d(_,p)):p.isMeshPhongMaterial?(r(_,p),h(_,p)):p.isMeshStandardMaterial?(r(_,p),f(_,p),p.isMeshPhysicalMaterial&&u(_,p,E)):p.isMeshMatcapMaterial?(r(_,p),m(_,p)):p.isMeshDepthMaterial?r(_,p):p.isMeshDistanceMaterial?(r(_,p),g(_,p)):p.isMeshNormalMaterial?r(_,p):p.isLineBasicMaterial?(o(_,p),p.isLineDashedMaterial&&a(_,p)):p.isPointsMaterial?l(_,p,S,x):p.isSpriteMaterial?c(_,p):p.isShadowMaterial?(_.color.value.copy(p.color),_.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(_,p){_.opacity.value=p.opacity,p.color&&_.diffuse.value.copy(p.color),p.emissive&&_.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(_.map.value=p.map,t(p.map,_.mapTransform)),p.alphaMap&&(_.alphaMap.value=p.alphaMap,t(p.alphaMap,_.alphaMapTransform)),p.bumpMap&&(_.bumpMap.value=p.bumpMap,t(p.bumpMap,_.bumpMapTransform),_.bumpScale.value=p.bumpScale,p.side===Kt&&(_.bumpScale.value*=-1)),p.normalMap&&(_.normalMap.value=p.normalMap,t(p.normalMap,_.normalMapTransform),_.normalScale.value.copy(p.normalScale),p.side===Kt&&_.normalScale.value.negate()),p.displacementMap&&(_.displacementMap.value=p.displacementMap,t(p.displacementMap,_.displacementMapTransform),_.displacementScale.value=p.displacementScale,_.displacementBias.value=p.displacementBias),p.emissiveMap&&(_.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,_.emissiveMapTransform)),p.specularMap&&(_.specularMap.value=p.specularMap,t(p.specularMap,_.specularMapTransform)),p.alphaTest>0&&(_.alphaTest.value=p.alphaTest);let S=e.get(p),x=S.envMap,E=S.envMapRotation;x&&(_.envMap.value=x,Ai.copy(E),Ai.x*=-1,Ai.y*=-1,Ai.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Ai.y*=-1,Ai.z*=-1),_.envMapRotation.value.setFromMatrix4(Rx.makeRotationFromEuler(Ai)),_.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,_.reflectivity.value=p.reflectivity,_.ior.value=p.ior,_.refractionRatio.value=p.refractionRatio),p.lightMap&&(_.lightMap.value=p.lightMap,_.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,_.lightMapTransform)),p.aoMap&&(_.aoMap.value=p.aoMap,_.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,_.aoMapTransform))}function o(_,p){_.diffuse.value.copy(p.color),_.opacity.value=p.opacity,p.map&&(_.map.value=p.map,t(p.map,_.mapTransform))}function a(_,p){_.dashSize.value=p.dashSize,_.totalSize.value=p.dashSize+p.gapSize,_.scale.value=p.scale}function l(_,p,S,x){_.diffuse.value.copy(p.color),_.opacity.value=p.opacity,_.size.value=p.size*S,_.scale.value=x*.5,p.map&&(_.map.value=p.map,t(p.map,_.uvTransform)),p.alphaMap&&(_.alphaMap.value=p.alphaMap,t(p.alphaMap,_.alphaMapTransform)),p.alphaTest>0&&(_.alphaTest.value=p.alphaTest)}function c(_,p){_.diffuse.value.copy(p.color),_.opacity.value=p.opacity,_.rotation.value=p.rotation,p.map&&(_.map.value=p.map,t(p.map,_.mapTransform)),p.alphaMap&&(_.alphaMap.value=p.alphaMap,t(p.alphaMap,_.alphaMapTransform)),p.alphaTest>0&&(_.alphaTest.value=p.alphaTest)}function h(_,p){_.specular.value.copy(p.specular),_.shininess.value=Math.max(p.shininess,1e-4)}function d(_,p){p.gradientMap&&(_.gradientMap.value=p.gradientMap)}function f(_,p){_.metalness.value=p.metalness,p.metalnessMap&&(_.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,_.metalnessMapTransform)),_.roughness.value=p.roughness,p.roughnessMap&&(_.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,_.roughnessMapTransform)),p.envMap&&(_.envMapIntensity.value=p.envMapIntensity)}function u(_,p,S){_.ior.value=p.ior,p.sheen>0&&(_.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),_.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(_.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,_.sheenColorMapTransform)),p.sheenRoughnessMap&&(_.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,_.sheenRoughnessMapTransform))),p.clearcoat>0&&(_.clearcoat.value=p.clearcoat,_.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(_.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,_.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(_.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,_.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(_.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,_.clearcoatNormalMapTransform),_.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Kt&&_.clearcoatNormalScale.value.negate())),p.dispersion>0&&(_.dispersion.value=p.dispersion),p.iridescence>0&&(_.iridescence.value=p.iridescence,_.iridescenceIOR.value=p.iridescenceIOR,_.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],_.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(_.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,_.iridescenceMapTransform)),p.iridescenceThicknessMap&&(_.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,_.iridescenceThicknessMapTransform))),p.transmission>0&&(_.transmission.value=p.transmission,_.transmissionSamplerMap.value=S.texture,_.transmissionSamplerSize.value.set(S.width,S.height),p.transmissionMap&&(_.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,_.transmissionMapTransform)),_.thickness.value=p.thickness,p.thicknessMap&&(_.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,_.thicknessMapTransform)),_.attenuationDistance.value=p.attenuationDistance,_.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(_.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(_.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,_.anisotropyMapTransform))),_.specularIntensity.value=p.specularIntensity,_.specularColor.value.copy(p.specularColor),p.specularColorMap&&(_.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,_.specularColorMapTransform)),p.specularIntensityMap&&(_.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,_.specularIntensityMapTransform))}function m(_,p){p.matcap&&(_.matcap.value=p.matcap)}function g(_,p){let S=e.get(p).light;_.referencePosition.value.setFromMatrixPosition(S.matrixWorld),_.nearDistance.value=S.shadow.camera.near,_.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Cx(n,e,t,i){let s={},r={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,x){let E=x.program;i.uniformBlockBinding(S,E)}function c(S,x){let E=s[S.id];E===void 0&&(m(S),E=h(S),s[S.id]=E,S.addEventListener("dispose",_));let D=x.program;i.updateUBOMapping(S,D);let w=e.render.frame;r[S.id]!==w&&(f(S),r[S.id]=w)}function h(S){let x=d();S.__bindingPointIndex=x;let E=n.createBuffer(),D=S.__size,w=S.usage;return n.bindBuffer(n.UNIFORM_BUFFER,E),n.bufferData(n.UNIFORM_BUFFER,D,w),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,x,E),E}function d(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(S){let x=s[S.id],E=S.uniforms,D=S.__cache;n.bindBuffer(n.UNIFORM_BUFFER,x);for(let w=0,O=E.length;w<O;w++){let U=Array.isArray(E[w])?E[w]:[E[w]];for(let T=0,y=U.length;T<y;T++){let P=U[T];if(u(P,w,T,D)===!0){let F=P.__offset,L=Array.isArray(P.value)?P.value:[P.value],B=0;for(let Z=0;Z<L.length;Z++){let G=L[Z],se=g(G);typeof G=="number"||typeof G=="boolean"?(P.__data[0]=G,n.bufferSubData(n.UNIFORM_BUFFER,F+B,P.__data)):G.isMatrix3?(P.__data[0]=G.elements[0],P.__data[1]=G.elements[1],P.__data[2]=G.elements[2],P.__data[3]=0,P.__data[4]=G.elements[3],P.__data[5]=G.elements[4],P.__data[6]=G.elements[5],P.__data[7]=0,P.__data[8]=G.elements[6],P.__data[9]=G.elements[7],P.__data[10]=G.elements[8],P.__data[11]=0):(G.toArray(P.__data,B),B+=se.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,F,P.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function u(S,x,E,D){let w=S.value,O=x+"_"+E;if(D[O]===void 0)return typeof w=="number"||typeof w=="boolean"?D[O]=w:D[O]=w.clone(),!0;{let U=D[O];if(typeof w=="number"||typeof w=="boolean"){if(U!==w)return D[O]=w,!0}else if(U.equals(w)===!1)return U.copy(w),!0}return!1}function m(S){let x=S.uniforms,E=0,D=16;for(let O=0,U=x.length;O<U;O++){let T=Array.isArray(x[O])?x[O]:[x[O]];for(let y=0,P=T.length;y<P;y++){let F=T[y],L=Array.isArray(F.value)?F.value:[F.value];for(let B=0,Z=L.length;B<Z;B++){let G=L[B],se=g(G),K=E%D,ge=K%se.boundary,pe=K+ge;E+=ge,pe!==0&&D-pe<se.storage&&(E+=D-pe),F.__data=new Float32Array(se.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=E,E+=se.storage}}}let w=E%D;return w>0&&(E+=D-w),S.__size=E,S.__cache={},this}function g(S){let x={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(x.boundary=4,x.storage=4):S.isVector2?(x.boundary=8,x.storage=8):S.isVector3||S.isColor?(x.boundary=16,x.storage=12):S.isVector4?(x.boundary=16,x.storage=16):S.isMatrix3?(x.boundary=48,x.storage=48):S.isMatrix4?(x.boundary=64,x.storage=64):S.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",S),x}function _(S){let x=S.target;x.removeEventListener("dispose",_);let E=o.indexOf(x.__bindingPointIndex);o.splice(E,1),n.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function p(){for(let S in s)n.deleteBuffer(s[S]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}var Po=class{constructor(e={}){let{canvas:t=Um(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reverseDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let u;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");u=i.getContextAttributes().alpha}else u=o;let m=new Uint32Array(4),g=new Int32Array(4),_=null,p=null,S=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=At,this.toneMapping=hi,this.toneMappingExposure=1;let E=this,D=!1,w=0,O=0,U=null,T=-1,y=null,P=new pt,F=new pt,L=null,B=new De(0),Z=0,G=t.width,se=t.height,K=1,ge=null,pe=null,Se=new pt(0,0,G,se),ve=new pt(0,0,G,se),tt=!1,ee=new ar,ae=!1,_e=!1,me=new ot,Ne=new ot,Ve=new N,ze=new pt,Je={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},oe=!1;function de(){return U===null?K:1}let H=i;function Ie(A,W){return t.getContext(A,W)}try{let A={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",Y,!1),t.addEventListener("webglcontextrestored",te,!1),t.addEventListener("webglcontextcreationerror",ue,!1),H===null){let W="webgl2";if(H=Ie(W,A),H===null)throw Ie(W)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let he,Me,fe,Fe,Te,I,M,q,ne,v,C,ie,Q,ce,Ae,re,ye,Ce,ke,we,nt,R,k,b;function z(){he=new X0(H),he.init(),R=new Mx(H,he),Me=new B0(H,he,e,R),fe=new yx(H,he),Me.reverseDepthBuffer&&f&&fe.buffers.depth.setReversed(!0),Fe=new K0(H),Te=new ax,I=new Tx(H,he,fe,Te,Me,R,Fe),M=new k0(E),q=new W0(E),ne=new t_(H),k=new H0(H,ne),v=new Y0(H,ne,Fe,k),C=new $0(H,v,ne,Fe),ke=new Z0(H,Me,I),re=new z0(Te),ie=new ox(E,M,q,he,Me,k,re),Q=new wx(E,Te),ce=new lx,Ae=new mx(he),Ce=new D0(E,M,q,fe,C,u,l),ye=new Ex(E,C,Me),b=new Cx(H,Fe,Me,fe),we=new F0(H,he,Fe),nt=new q0(H,he,Fe),Fe.programs=ie.programs,E.capabilities=Me,E.extensions=he,E.properties=Te,E.renderLists=ce,E.shadowMap=ye,E.state=fe,E.info=Fe}z();let V=new Pl(E,H);this.xr=V,this.getContext=function(){return H},this.getContextAttributes=function(){return H.getContextAttributes()},this.forceContextLoss=function(){let A=he.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=he.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return K},this.setPixelRatio=function(A){A!==void 0&&(K=A,this.setSize(G,se,!1))},this.getSize=function(A){return A.set(G,se)},this.setSize=function(A,W,J=!0){if(V.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}G=A,se=W,t.width=Math.floor(A*K),t.height=Math.floor(W*K),J===!0&&(t.style.width=A+"px",t.style.height=W+"px"),this.setViewport(0,0,A,W)},this.getDrawingBufferSize=function(A){return A.set(G*K,se*K).floor()},this.setDrawingBufferSize=function(A,W,J){G=A,se=W,K=J,t.width=Math.floor(A*J),t.height=Math.floor(W*J),this.setViewport(0,0,A,W)},this.getCurrentViewport=function(A){return A.copy(P)},this.getViewport=function(A){return A.copy(Se)},this.setViewport=function(A,W,J,j){A.isVector4?Se.set(A.x,A.y,A.z,A.w):Se.set(A,W,J,j),fe.viewport(P.copy(Se).multiplyScalar(K).round())},this.getScissor=function(A){return A.copy(ve)},this.setScissor=function(A,W,J,j){A.isVector4?ve.set(A.x,A.y,A.z,A.w):ve.set(A,W,J,j),fe.scissor(F.copy(ve).multiplyScalar(K).round())},this.getScissorTest=function(){return tt},this.setScissorTest=function(A){fe.setScissorTest(tt=A)},this.setOpaqueSort=function(A){ge=A},this.setTransparentSort=function(A){pe=A},this.getClearColor=function(A){return A.copy(Ce.getClearColor())},this.setClearColor=function(){Ce.setClearColor.apply(Ce,arguments)},this.getClearAlpha=function(){return Ce.getClearAlpha()},this.setClearAlpha=function(){Ce.setClearAlpha.apply(Ce,arguments)},this.clear=function(A=!0,W=!0,J=!0){let j=0;if(A){let X=!1;if(U!==null){let Ee=U.texture.format;X=Ee===ah||Ee===oh||Ee===rh}if(X){let Ee=U.texture.type,be=Ee===kn||Ee===Oi||Ee===sr||Ee===Ss||Ee===nh||Ee===ih,Oe=Ce.getClearColor(),Ue=Ce.getClearAlpha(),qe=Oe.r,Ke=Oe.g,Le=Oe.b;be?(m[0]=qe,m[1]=Ke,m[2]=Le,m[3]=Ue,H.clearBufferuiv(H.COLOR,0,m)):(g[0]=qe,g[1]=Ke,g[2]=Le,g[3]=Ue,H.clearBufferiv(H.COLOR,0,g))}else j|=H.COLOR_BUFFER_BIT}W&&(j|=H.DEPTH_BUFFER_BIT),J&&(j|=H.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),H.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Y,!1),t.removeEventListener("webglcontextrestored",te,!1),t.removeEventListener("webglcontextcreationerror",ue,!1),ce.dispose(),Ae.dispose(),Te.dispose(),M.dispose(),q.dispose(),C.dispose(),k.dispose(),b.dispose(),ie.dispose(),V.dispose(),V.removeEventListener("sessionstart",Bs),V.removeEventListener("sessionend",Ah),yi.stop()};function Y(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function te(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;let A=Fe.autoReset,W=ye.enabled,J=ye.autoUpdate,j=ye.needsUpdate,X=ye.type;z(),Fe.autoReset=A,ye.enabled=W,ye.autoUpdate=J,ye.needsUpdate=j,ye.type=X}function ue(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function We(A){let W=A.target;W.removeEventListener("dispose",We),Ye(W)}function Ye(A){st(A),Te.remove(A)}function st(A){let W=Te.get(A).programs;W!==void 0&&(W.forEach(function(J){ie.releaseProgram(J)}),A.isShaderMaterial&&ie.releaseShaderCache(A))}this.renderBufferDirect=function(A,W,J,j,X,Ee){W===null&&(W=Je);let be=X.isMesh&&X.matrixWorld.determinant()<0,Oe=dp(A,W,J,j,X);fe.setMaterial(j,be);let Ue=J.index,qe=1;if(j.wireframe===!0){if(Ue=v.getWireframeAttribute(J),Ue===void 0)return;qe=2}let Ke=J.drawRange,Le=J.attributes.position,lt=Ke.start*qe,_t=(Ke.start+Ke.count)*qe;Ee!==null&&(lt=Math.max(lt,Ee.start*qe),_t=Math.min(_t,(Ee.start+Ee.count)*qe)),Ue!==null?(lt=Math.max(lt,0),_t=Math.min(_t,Ue.count)):Le!=null&&(lt=Math.max(lt,0),_t=Math.min(_t,Le.count));let xt=_t-lt;if(xt<0||xt===1/0)return;k.setup(X,j,Oe,J,Ue);let qt,ut=we;if(Ue!==null&&(qt=ne.get(Ue),ut=nt,ut.setIndex(qt)),X.isMesh)j.wireframe===!0?(fe.setLineWidth(j.wireframeLinewidth*de()),ut.setMode(H.LINES)):ut.setMode(H.TRIANGLES);else if(X.isLine){let He=j.linewidth;He===void 0&&(He=1),fe.setLineWidth(He*de()),X.isLineSegments?ut.setMode(H.LINES):X.isLineLoop?ut.setMode(H.LINE_LOOP):ut.setMode(H.LINE_STRIP)}else X.isPoints?ut.setMode(H.POINTS):X.isSprite&&ut.setMode(H.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)ut.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(he.get("WEBGL_multi_draw"))ut.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let He=X._multiDrawStarts,In=X._multiDrawCounts,dt=X._multiDrawCount,un=Ue?ne.get(Ue).bytesPerElement:1,Xi=Te.get(j).currentProgram.getUniforms();for(let jt=0;jt<dt;jt++)Xi.setValue(H,"_gl_DrawID",jt),ut.render(He[jt]/un,In[jt])}else if(X.isInstancedMesh)ut.renderInstances(lt,xt,X.count);else if(J.isInstancedBufferGeometry){let He=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,In=Math.min(J.instanceCount,He);ut.renderInstances(lt,xt,In)}else ut.render(lt,xt)};function et(A,W,J){A.transparent===!0&&A.side===Ft&&A.forceSinglePass===!1?(A.side=Kt,A.needsUpdate=!0,Rr(A,W,J),A.side=ui,A.needsUpdate=!0,Rr(A,W,J),A.side=Ft):Rr(A,W,J)}this.compile=function(A,W,J=null){J===null&&(J=A),p=Ae.get(J),p.init(W),x.push(p),J.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(p.pushLight(X),X.castShadow&&p.pushShadow(X))}),A!==J&&A.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(p.pushLight(X),X.castShadow&&p.pushShadow(X))}),p.setupLights();let j=new Set;return A.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let Ee=X.material;if(Ee)if(Array.isArray(Ee))for(let be=0;be<Ee.length;be++){let Oe=Ee[be];et(Oe,J,X),j.add(Oe)}else et(Ee,J,X),j.add(Ee)}),x.pop(),p=null,j},this.compileAsync=function(A,W,J=null){let j=this.compile(A,W,J);return new Promise(X=>{function Ee(){if(j.forEach(function(be){Te.get(be).currentProgram.isReady()&&j.delete(be)}),j.size===0){X(A);return}setTimeout(Ee,10)}he.get("KHR_parallel_shader_compile")!==null?Ee():setTimeout(Ee,10)})};let Ht=null;function Ut(A){Ht&&Ht(A)}function Bs(){yi.stop()}function Ah(){yi.start()}let yi=new $d;yi.setAnimationLoop(Ut),typeof self<"u"&&yi.setContext(self),this.setAnimationLoop=function(A){Ht=A,V.setAnimationLoop(A),A===null?yi.stop():yi.start()},V.addEventListener("sessionstart",Bs),V.addEventListener("sessionend",Ah),this.render=function(A,W){if(W!==void 0&&W.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),V.enabled===!0&&V.isPresenting===!0&&(V.cameraAutoUpdate===!0&&V.updateCamera(W),W=V.getCamera()),A.isScene===!0&&A.onBeforeRender(E,A,W,U),p=Ae.get(A,x.length),p.init(W),x.push(p),Ne.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),ee.setFromProjectionMatrix(Ne),_e=this.localClippingEnabled,ae=re.init(this.clippingPlanes,_e),_=ce.get(A,S.length),_.init(),S.push(_),V.enabled===!0&&V.isPresenting===!0){let Ee=E.xr.getDepthSensingMesh();Ee!==null&&Ma(Ee,W,-1/0,E.sortObjects)}Ma(A,W,0,E.sortObjects),_.finish(),E.sortObjects===!0&&_.sort(ge,pe),oe=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,oe&&Ce.addToRenderList(_,A),this.info.render.frame++,ae===!0&&re.beginShadows();let J=p.state.shadowsArray;ye.render(J,A,W),ae===!0&&re.endShadows(),this.info.autoReset===!0&&this.info.reset();let j=_.opaque,X=_.transmissive;if(p.setupLights(),W.isArrayCamera){let Ee=W.cameras;if(X.length>0)for(let be=0,Oe=Ee.length;be<Oe;be++){let Ue=Ee[be];wh(j,X,A,Ue)}oe&&Ce.render(A);for(let be=0,Oe=Ee.length;be<Oe;be++){let Ue=Ee[be];Rh(_,A,Ue,Ue.viewport)}}else X.length>0&&wh(j,X,A,W),oe&&Ce.render(A),Rh(_,A,W);U!==null&&(I.updateMultisampleRenderTarget(U),I.updateRenderTargetMipmap(U)),A.isScene===!0&&A.onAfterRender(E,A,W),k.resetDefaultState(),T=-1,y=null,x.pop(),x.length>0?(p=x[x.length-1],ae===!0&&re.setGlobalState(E.clippingPlanes,p.state.camera)):p=null,S.pop(),S.length>0?_=S[S.length-1]:_=null};function Ma(A,W,J,j){if(A.visible===!1)return;if(A.layers.test(W.layers)){if(A.isGroup)J=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(W);else if(A.isLight)p.pushLight(A),A.castShadow&&p.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||ee.intersectsSprite(A)){j&&ze.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Ne);let be=C.update(A),Oe=A.material;Oe.visible&&_.push(A,be,Oe,J,ze.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||ee.intersectsObject(A))){let be=C.update(A),Oe=A.material;if(j&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),ze.copy(A.boundingSphere.center)):(be.boundingSphere===null&&be.computeBoundingSphere(),ze.copy(be.boundingSphere.center)),ze.applyMatrix4(A.matrixWorld).applyMatrix4(Ne)),Array.isArray(Oe)){let Ue=be.groups;for(let qe=0,Ke=Ue.length;qe<Ke;qe++){let Le=Ue[qe],lt=Oe[Le.materialIndex];lt&&lt.visible&&_.push(A,be,lt,J,ze.z,Le)}}else Oe.visible&&_.push(A,be,Oe,J,ze.z,null)}}let Ee=A.children;for(let be=0,Oe=Ee.length;be<Oe;be++)Ma(Ee[be],W,J,j)}function Rh(A,W,J,j){let X=A.opaque,Ee=A.transmissive,be=A.transparent;p.setupLightsView(J),ae===!0&&re.setGlobalState(E.clippingPlanes,J),j&&fe.viewport(P.copy(j)),X.length>0&&Ar(X,W,J),Ee.length>0&&Ar(Ee,W,J),be.length>0&&Ar(be,W,J),fe.buffers.depth.setTest(!0),fe.buffers.depth.setMask(!0),fe.buffers.color.setMask(!0),fe.setPolygonOffset(!1)}function wh(A,W,J,j){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[j.id]===void 0&&(p.state.transmissionRenderTarget[j.id]=new Vn(1,1,{generateMipmaps:!0,type:he.has("EXT_color_buffer_half_float")||he.has("EXT_color_buffer_float")?gr:kn,minFilter:Pi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ct.workingColorSpace}));let Ee=p.state.transmissionRenderTarget[j.id],be=j.viewport||P;Ee.setSize(be.z,be.w);let Oe=E.getRenderTarget();E.setRenderTarget(Ee),E.getClearColor(B),Z=E.getClearAlpha(),Z<1&&E.setClearColor(16777215,.5),E.clear(),oe&&Ce.render(J);let Ue=E.toneMapping;E.toneMapping=hi;let qe=j.viewport;if(j.viewport!==void 0&&(j.viewport=void 0),p.setupLightsView(j),ae===!0&&re.setGlobalState(E.clippingPlanes,j),Ar(A,J,j),I.updateMultisampleRenderTarget(Ee),I.updateRenderTargetMipmap(Ee),he.has("WEBGL_multisampled_render_to_texture")===!1){let Ke=!1;for(let Le=0,lt=W.length;Le<lt;Le++){let _t=W[Le],xt=_t.object,qt=_t.geometry,ut=_t.material,He=_t.group;if(ut.side===Ft&&xt.layers.test(j.layers)){let In=ut.side;ut.side=Kt,ut.needsUpdate=!0,Ch(xt,J,j,qt,ut,He),ut.side=In,ut.needsUpdate=!0,Ke=!0}}Ke===!0&&(I.updateMultisampleRenderTarget(Ee),I.updateRenderTargetMipmap(Ee))}E.setRenderTarget(Oe),E.setClearColor(B,Z),qe!==void 0&&(j.viewport=qe),E.toneMapping=Ue}function Ar(A,W,J){let j=W.isScene===!0?W.overrideMaterial:null;for(let X=0,Ee=A.length;X<Ee;X++){let be=A[X],Oe=be.object,Ue=be.geometry,qe=j===null?be.material:j,Ke=be.group;Oe.layers.test(J.layers)&&Ch(Oe,W,J,Ue,qe,Ke)}}function Ch(A,W,J,j,X,Ee){A.onBeforeRender(E,W,J,j,X,Ee),A.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),X.onBeforeRender(E,W,J,j,A,Ee),X.transparent===!0&&X.side===Ft&&X.forceSinglePass===!1?(X.side=Kt,X.needsUpdate=!0,E.renderBufferDirect(J,W,j,X,A,Ee),X.side=ui,X.needsUpdate=!0,E.renderBufferDirect(J,W,j,X,A,Ee),X.side=Ft):E.renderBufferDirect(J,W,j,X,A,Ee),A.onAfterRender(E,W,J,j,X,Ee)}function Rr(A,W,J){W.isScene!==!0&&(W=Je);let j=Te.get(A),X=p.state.lights,Ee=p.state.shadowsArray,be=X.state.version,Oe=ie.getParameters(A,X.state,Ee,W,J),Ue=ie.getProgramCacheKey(Oe),qe=j.programs;j.environment=A.isMeshStandardMaterial?W.environment:null,j.fog=W.fog,j.envMap=(A.isMeshStandardMaterial?q:M).get(A.envMap||j.environment),j.envMapRotation=j.environment!==null&&A.envMap===null?W.environmentRotation:A.envMapRotation,qe===void 0&&(A.addEventListener("dispose",We),qe=new Map,j.programs=qe);let Ke=qe.get(Ue);if(Ke!==void 0){if(j.currentProgram===Ke&&j.lightsStateVersion===be)return Ph(A,Oe),Ke}else Oe.uniforms=ie.getUniforms(A),A.onBeforeCompile(Oe,E),Ke=ie.acquireProgram(Oe,Ue),qe.set(Ue,Ke),j.uniforms=Oe.uniforms;let Le=j.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Le.clippingPlanes=re.uniform),Ph(A,Oe),j.needsLights=pp(A),j.lightsStateVersion=be,j.needsLights&&(Le.ambientLightColor.value=X.state.ambient,Le.lightProbe.value=X.state.probe,Le.directionalLights.value=X.state.directional,Le.directionalLightShadows.value=X.state.directionalShadow,Le.spotLights.value=X.state.spot,Le.spotLightShadows.value=X.state.spotShadow,Le.rectAreaLights.value=X.state.rectArea,Le.ltc_1.value=X.state.rectAreaLTC1,Le.ltc_2.value=X.state.rectAreaLTC2,Le.pointLights.value=X.state.point,Le.pointLightShadows.value=X.state.pointShadow,Le.hemisphereLights.value=X.state.hemi,Le.directionalShadowMap.value=X.state.directionalShadowMap,Le.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Le.spotShadowMap.value=X.state.spotShadowMap,Le.spotLightMatrix.value=X.state.spotLightMatrix,Le.spotLightMap.value=X.state.spotLightMap,Le.pointShadowMap.value=X.state.pointShadowMap,Le.pointShadowMatrix.value=X.state.pointShadowMatrix),j.currentProgram=Ke,j.uniformsList=null,Ke}function Ih(A){if(A.uniformsList===null){let W=A.currentProgram.getUniforms();A.uniformsList=_s.seqWithValue(W.seq,A.uniforms)}return A.uniformsList}function Ph(A,W){let J=Te.get(A);J.outputColorSpace=W.outputColorSpace,J.batching=W.batching,J.batchingColor=W.batchingColor,J.instancing=W.instancing,J.instancingColor=W.instancingColor,J.instancingMorph=W.instancingMorph,J.skinning=W.skinning,J.morphTargets=W.morphTargets,J.morphNormals=W.morphNormals,J.morphColors=W.morphColors,J.morphTargetsCount=W.morphTargetsCount,J.numClippingPlanes=W.numClippingPlanes,J.numIntersection=W.numClipIntersection,J.vertexAlphas=W.vertexAlphas,J.vertexTangents=W.vertexTangents,J.toneMapping=W.toneMapping}function dp(A,W,J,j,X){W.isScene!==!0&&(W=Je),I.resetTextureUnits();let Ee=W.fog,be=j.isMeshStandardMaterial?W.environment:null,Oe=U===null?E.outputColorSpace:U.isXRRenderTarget===!0?U.texture.colorSpace:ws,Ue=(j.isMeshStandardMaterial?q:M).get(j.envMap||be),qe=j.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,Ke=!!J.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),Le=!!J.morphAttributes.position,lt=!!J.morphAttributes.normal,_t=!!J.morphAttributes.color,xt=hi;j.toneMapped&&(U===null||U.isXRRenderTarget===!0)&&(xt=E.toneMapping);let qt=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,ut=qt!==void 0?qt.length:0,He=Te.get(j),In=p.state.lights;if(ae===!0&&(_e===!0||A!==y)){let rn=A===y&&j.id===T;re.setState(j,A,rn)}let dt=!1;j.version===He.__version?(He.needsLights&&He.lightsStateVersion!==In.state.version||He.outputColorSpace!==Oe||X.isBatchedMesh&&He.batching===!1||!X.isBatchedMesh&&He.batching===!0||X.isBatchedMesh&&He.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&He.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&He.instancing===!1||!X.isInstancedMesh&&He.instancing===!0||X.isSkinnedMesh&&He.skinning===!1||!X.isSkinnedMesh&&He.skinning===!0||X.isInstancedMesh&&He.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&He.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&He.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&He.instancingMorph===!1&&X.morphTexture!==null||He.envMap!==Ue||j.fog===!0&&He.fog!==Ee||He.numClippingPlanes!==void 0&&(He.numClippingPlanes!==re.numPlanes||He.numIntersection!==re.numIntersection)||He.vertexAlphas!==qe||He.vertexTangents!==Ke||He.morphTargets!==Le||He.morphNormals!==lt||He.morphColors!==_t||He.toneMapping!==xt||He.morphTargetsCount!==ut)&&(dt=!0):(dt=!0,He.__version=j.version);let un=He.currentProgram;dt===!0&&(un=Rr(j,W,X));let Xi=!1,jt=!1,zs=!1,yt=un.getUniforms(),Sn=He.uniforms;if(fe.useProgram(un.program)&&(Xi=!0,jt=!0,zs=!0),j.id!==T&&(T=j.id,jt=!0),Xi||y!==A){fe.buffers.depth.getReversed()?(me.copy(A.projectionMatrix),Nm(me),Dm(me),yt.setValue(H,"projectionMatrix",me)):yt.setValue(H,"projectionMatrix",A.projectionMatrix),yt.setValue(H,"viewMatrix",A.matrixWorldInverse);let ei=yt.map.cameraPosition;ei!==void 0&&ei.setValue(H,Ve.setFromMatrixPosition(A.matrixWorld)),Me.logarithmicDepthBuffer&&yt.setValue(H,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&yt.setValue(H,"isOrthographic",A.isOrthographicCamera===!0),y!==A&&(y=A,jt=!0,zs=!0)}if(X.isSkinnedMesh){yt.setOptional(H,X,"bindMatrix"),yt.setOptional(H,X,"bindMatrixInverse");let rn=X.skeleton;rn&&(rn.boneTexture===null&&rn.computeBoneTexture(),yt.setValue(H,"boneTexture",rn.boneTexture,I))}X.isBatchedMesh&&(yt.setOptional(H,X,"batchingTexture"),yt.setValue(H,"batchingTexture",X._matricesTexture,I),yt.setOptional(H,X,"batchingIdTexture"),yt.setValue(H,"batchingIdTexture",X._indirectTexture,I),yt.setOptional(H,X,"batchingColorTexture"),X._colorsTexture!==null&&yt.setValue(H,"batchingColorTexture",X._colorsTexture,I));let ks=J.morphAttributes;if((ks.position!==void 0||ks.normal!==void 0||ks.color!==void 0)&&ke.update(X,J,un),(jt||He.receiveShadow!==X.receiveShadow)&&(He.receiveShadow=X.receiveShadow,yt.setValue(H,"receiveShadow",X.receiveShadow)),j.isMeshGouraudMaterial&&j.envMap!==null&&(Sn.envMap.value=Ue,Sn.flipEnvMap.value=Ue.isCubeTexture&&Ue.isRenderTargetTexture===!1?-1:1),j.isMeshStandardMaterial&&j.envMap===null&&W.environment!==null&&(Sn.envMapIntensity.value=W.environmentIntensity),jt&&(yt.setValue(H,"toneMappingExposure",E.toneMappingExposure),He.needsLights&&fp(Sn,zs),Ee&&j.fog===!0&&Q.refreshFogUniforms(Sn,Ee),Q.refreshMaterialUniforms(Sn,j,K,se,p.state.transmissionRenderTarget[A.id]),_s.upload(H,Ih(He),Sn,I)),j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(_s.upload(H,Ih(He),Sn,I),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&yt.setValue(H,"center",X.center),yt.setValue(H,"modelViewMatrix",X.modelViewMatrix),yt.setValue(H,"normalMatrix",X.normalMatrix),yt.setValue(H,"modelMatrix",X.matrixWorld),j.isShaderMaterial||j.isRawShaderMaterial){let rn=j.uniformsGroups;for(let ei=0,ti=rn.length;ei<ti;ei++){let Oh=rn[ei];b.update(Oh,un),b.bind(Oh,un)}}return un}function fp(A,W){A.ambientLightColor.needsUpdate=W,A.lightProbe.needsUpdate=W,A.directionalLights.needsUpdate=W,A.directionalLightShadows.needsUpdate=W,A.pointLights.needsUpdate=W,A.pointLightShadows.needsUpdate=W,A.spotLights.needsUpdate=W,A.spotLightShadows.needsUpdate=W,A.rectAreaLights.needsUpdate=W,A.hemisphereLights.needsUpdate=W}function pp(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return O},this.getRenderTarget=function(){return U},this.setRenderTargetTextures=function(A,W,J){Te.get(A.texture).__webglTexture=W,Te.get(A.depthTexture).__webglTexture=J;let j=Te.get(A);j.__hasExternalTextures=!0,j.__autoAllocateDepthBuffer=J===void 0,j.__autoAllocateDepthBuffer||he.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),j.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(A,W){let J=Te.get(A);J.__webglFramebuffer=W,J.__useDefaultFramebuffer=W===void 0},this.setRenderTarget=function(A,W=0,J=0){U=A,w=W,O=J;let j=!0,X=null,Ee=!1,be=!1;if(A){let Ue=Te.get(A);if(Ue.__useDefaultFramebuffer!==void 0)fe.bindFramebuffer(H.FRAMEBUFFER,null),j=!1;else if(Ue.__webglFramebuffer===void 0)I.setupRenderTarget(A);else if(Ue.__hasExternalTextures)I.rebindTextures(A,Te.get(A.texture).__webglTexture,Te.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let Le=A.depthTexture;if(Ue.__boundDepthTexture!==Le){if(Le!==null&&Te.has(Le)&&(A.width!==Le.image.width||A.height!==Le.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");I.setupDepthRenderbuffer(A)}}let qe=A.texture;(qe.isData3DTexture||qe.isDataArrayTexture||qe.isCompressedArrayTexture)&&(be=!0);let Ke=Te.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Ke[W])?X=Ke[W][J]:X=Ke[W],Ee=!0):A.samples>0&&I.useMultisampledRTT(A)===!1?X=Te.get(A).__webglMultisampledFramebuffer:Array.isArray(Ke)?X=Ke[J]:X=Ke,P.copy(A.viewport),F.copy(A.scissor),L=A.scissorTest}else P.copy(Se).multiplyScalar(K).floor(),F.copy(ve).multiplyScalar(K).floor(),L=tt;if(fe.bindFramebuffer(H.FRAMEBUFFER,X)&&j&&fe.drawBuffers(A,X),fe.viewport(P),fe.scissor(F),fe.setScissorTest(L),Ee){let Ue=Te.get(A.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_CUBE_MAP_POSITIVE_X+W,Ue.__webglTexture,J)}else if(be){let Ue=Te.get(A.texture),qe=W||0;H.framebufferTextureLayer(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,Ue.__webglTexture,J||0,qe)}T=-1},this.readRenderTargetPixels=function(A,W,J,j,X,Ee,be){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Oe=Te.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&be!==void 0&&(Oe=Oe[be]),Oe){fe.bindFramebuffer(H.FRAMEBUFFER,Oe);try{let Ue=A.texture,qe=Ue.format,Ke=Ue.type;if(!Me.textureFormatReadable(qe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Me.textureTypeReadable(Ke)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=A.width-j&&J>=0&&J<=A.height-X&&H.readPixels(W,J,j,X,R.convert(qe),R.convert(Ke),Ee)}finally{let Ue=U!==null?Te.get(U).__webglFramebuffer:null;fe.bindFramebuffer(H.FRAMEBUFFER,Ue)}}},this.readRenderTargetPixelsAsync=async function(A,W,J,j,X,Ee,be){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Oe=Te.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&be!==void 0&&(Oe=Oe[be]),Oe){let Ue=A.texture,qe=Ue.format,Ke=Ue.type;if(!Me.textureFormatReadable(qe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Me.textureTypeReadable(Ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(W>=0&&W<=A.width-j&&J>=0&&J<=A.height-X){fe.bindFramebuffer(H.FRAMEBUFFER,Oe);let Le=H.createBuffer();H.bindBuffer(H.PIXEL_PACK_BUFFER,Le),H.bufferData(H.PIXEL_PACK_BUFFER,Ee.byteLength,H.STREAM_READ),H.readPixels(W,J,j,X,R.convert(qe),R.convert(Ke),0);let lt=U!==null?Te.get(U).__webglFramebuffer:null;fe.bindFramebuffer(H.FRAMEBUFFER,lt);let _t=H.fenceSync(H.SYNC_GPU_COMMANDS_COMPLETE,0);return H.flush(),await Lm(H,_t,4),H.bindBuffer(H.PIXEL_PACK_BUFFER,Le),H.getBufferSubData(H.PIXEL_PACK_BUFFER,0,Ee),H.deleteBuffer(Le),H.deleteSync(_t),Ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(A,W=null,J=0){A.isTexture!==!0&&($s("WebGLRenderer: copyFramebufferToTexture function signature has changed."),W=arguments[0]||null,A=arguments[1]);let j=Math.pow(2,-J),X=Math.floor(A.image.width*j),Ee=Math.floor(A.image.height*j),be=W!==null?W.x:0,Oe=W!==null?W.y:0;I.setTexture2D(A,0),H.copyTexSubImage2D(H.TEXTURE_2D,J,0,0,be,Oe,X,Ee),fe.unbindTexture()},this.copyTextureToTexture=function(A,W,J=null,j=null,X=0){A.isTexture!==!0&&($s("WebGLRenderer: copyTextureToTexture function signature has changed."),j=arguments[0]||null,A=arguments[1],W=arguments[2],X=arguments[3]||0,J=null);let Ee,be,Oe,Ue,qe,Ke,Le,lt,_t,xt=A.isCompressedTexture?A.mipmaps[X]:A.image;J!==null?(Ee=J.max.x-J.min.x,be=J.max.y-J.min.y,Oe=J.isBox3?J.max.z-J.min.z:1,Ue=J.min.x,qe=J.min.y,Ke=J.isBox3?J.min.z:0):(Ee=xt.width,be=xt.height,Oe=xt.depth||1,Ue=0,qe=0,Ke=0),j!==null?(Le=j.x,lt=j.y,_t=j.z):(Le=0,lt=0,_t=0);let qt=R.convert(W.format),ut=R.convert(W.type),He;W.isData3DTexture?(I.setTexture3D(W,0),He=H.TEXTURE_3D):W.isDataArrayTexture||W.isCompressedArrayTexture?(I.setTexture2DArray(W,0),He=H.TEXTURE_2D_ARRAY):(I.setTexture2D(W,0),He=H.TEXTURE_2D),H.pixelStorei(H.UNPACK_FLIP_Y_WEBGL,W.flipY),H.pixelStorei(H.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),H.pixelStorei(H.UNPACK_ALIGNMENT,W.unpackAlignment);let In=H.getParameter(H.UNPACK_ROW_LENGTH),dt=H.getParameter(H.UNPACK_IMAGE_HEIGHT),un=H.getParameter(H.UNPACK_SKIP_PIXELS),Xi=H.getParameter(H.UNPACK_SKIP_ROWS),jt=H.getParameter(H.UNPACK_SKIP_IMAGES);H.pixelStorei(H.UNPACK_ROW_LENGTH,xt.width),H.pixelStorei(H.UNPACK_IMAGE_HEIGHT,xt.height),H.pixelStorei(H.UNPACK_SKIP_PIXELS,Ue),H.pixelStorei(H.UNPACK_SKIP_ROWS,qe),H.pixelStorei(H.UNPACK_SKIP_IMAGES,Ke);let zs=A.isDataArrayTexture||A.isData3DTexture,yt=W.isDataArrayTexture||W.isData3DTexture;if(A.isRenderTargetTexture||A.isDepthTexture){let Sn=Te.get(A),ks=Te.get(W),rn=Te.get(Sn.__renderTarget),ei=Te.get(ks.__renderTarget);fe.bindFramebuffer(H.READ_FRAMEBUFFER,rn.__webglFramebuffer),fe.bindFramebuffer(H.DRAW_FRAMEBUFFER,ei.__webglFramebuffer);for(let ti=0;ti<Oe;ti++)zs&&H.framebufferTextureLayer(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,Te.get(A).__webglTexture,X,Ke+ti),A.isDepthTexture?(yt&&H.framebufferTextureLayer(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,Te.get(W).__webglTexture,X,_t+ti),H.blitFramebuffer(Ue,qe,Ee,be,Le,lt,Ee,be,H.DEPTH_BUFFER_BIT,H.NEAREST)):yt?H.copyTexSubImage3D(He,X,Le,lt,_t+ti,Ue,qe,Ee,be):H.copyTexSubImage2D(He,X,Le,lt,_t+ti,Ue,qe,Ee,be);fe.bindFramebuffer(H.READ_FRAMEBUFFER,null),fe.bindFramebuffer(H.DRAW_FRAMEBUFFER,null)}else yt?A.isDataTexture||A.isData3DTexture?H.texSubImage3D(He,X,Le,lt,_t,Ee,be,Oe,qt,ut,xt.data):W.isCompressedArrayTexture?H.compressedTexSubImage3D(He,X,Le,lt,_t,Ee,be,Oe,qt,xt.data):H.texSubImage3D(He,X,Le,lt,_t,Ee,be,Oe,qt,ut,xt):A.isDataTexture?H.texSubImage2D(H.TEXTURE_2D,X,Le,lt,Ee,be,qt,ut,xt.data):A.isCompressedTexture?H.compressedTexSubImage2D(H.TEXTURE_2D,X,Le,lt,xt.width,xt.height,qt,xt.data):H.texSubImage2D(H.TEXTURE_2D,X,Le,lt,Ee,be,qt,ut,xt);H.pixelStorei(H.UNPACK_ROW_LENGTH,In),H.pixelStorei(H.UNPACK_IMAGE_HEIGHT,dt),H.pixelStorei(H.UNPACK_SKIP_PIXELS,un),H.pixelStorei(H.UNPACK_SKIP_ROWS,Xi),H.pixelStorei(H.UNPACK_SKIP_IMAGES,jt),X===0&&W.generateMipmaps&&H.generateMipmap(He),fe.unbindTexture()},this.copyTextureToTexture3D=function(A,W,J=null,j=null,X=0){return A.isTexture!==!0&&($s("WebGLRenderer: copyTextureToTexture3D function signature has changed."),J=arguments[0]||null,j=arguments[1]||null,A=arguments[2],W=arguments[3],X=arguments[4]||0),$s('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(A,W,J,j,X)},this.initRenderTarget=function(A){Te.get(A).__webglFramebuffer===void 0&&I.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?I.setTextureCube(A,0):A.isData3DTexture?I.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?I.setTexture2DArray(A,0):I.setTexture2D(A,0),fe.unbindTexture()},this.resetState=function(){w=0,O=0,U=null,fe.reset(),k.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Fn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorspace=ct._getDrawingBufferColorSpace(e),t.unpackColorSpace=ct._getUnpackColorSpace()}};var Oo=class n{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new De(e),this.near=t,this.far=i}clone(){return new n(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Uo=class extends Vt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new bn,this.environmentIntensity=1,this.environmentRotation=new bn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var Ol=class extends Zt{constructor(e=null,t=1,i=1,s,r,o,a,l,c=tn,h=tn,d,f){super(null,o,a,l,c,h,s,r,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var cr=class extends bt{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ls=new ot,xd=new ot,oo=[],yd=new Wn,Ix=new ot,qs=new $,Ks=new di,Yn=class extends ${constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new cr(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,Ix)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Wn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,ls),yd.copy(e.boundingBox).applyMatrix4(ls),this.boundingBox.union(yd)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new di),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,ls),Ks.copy(e.boundingSphere).applyMatrix4(ls),this.boundingSphere.union(Ks)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,o=e*r+1;for(let a=0;a<i.length;a++)i[a]=s[o+a]}raycast(e,t){let i=this.matrixWorld,s=this.count;if(qs.geometry=this.geometry,qs.material=this.material,qs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ks.copy(this.boundingSphere),Ks.applyMatrix4(i),e.ray.intersectsSphere(Ks)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ls),xd.multiplyMatrices(i,ls),qs.matrixWorld=xd,qs.raycast(e,oo);for(let o=0,a=oo.length;o<a;o++){let l=oo[o];l.instanceId=r,l.object=this,t.push(l)}oo.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new cr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new Ol(new Float32Array(s*this.count),s,this.count,sh,vn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var qn=class extends fi{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new De(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Sd=new ot,Ul=new Ui,ao=new di,co=new N,pi=class extends Vt{constructor(e=new gt,t=new qn){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ao.copy(i.boundingSphere),ao.applyMatrix4(s),ao.radius+=r,e.ray.intersectsSphere(ao)===!1)return;Sd.copy(s).invert(),Ul.copy(e.ray).applyMatrix4(Sd);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,d=i.attributes.position;if(c!==null){let f=Math.max(0,o.start),u=Math.min(c.count,o.start+o.count);for(let m=f,g=u;m<g;m++){let _=c.getX(m);co.fromBufferAttribute(d,_),Td(co,_,l,s,e,t,this)}}else{let f=Math.max(0,o.start),u=Math.min(d.count,o.start+o.count);for(let m=f,g=u;m<g;m++)co.fromBufferAttribute(d,m),Td(co,m,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Td(n,e,t,i,s,r,o){let a=Ul.distanceSqToPoint(n);if(a<t){let l=new N;Ul.closestPointToPoint(n,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var Kn=class extends Zt{constructor(e,t,i,s,r,o,a,l,c){super(e,t,i,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},an=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let i=this.getLengths(),s=0,r=i.length,o;t?o=t:o=e*i[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=i[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===o)return s/(r-1);let h=i[s],f=i[s+1]-h,u=(o-h)/f;return(s+u)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new le:new N);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){let i=new N,s=[],r=[],o=[],a=new N,l=new ot;for(let u=0;u<=e;u++){let m=u/e;s[u]=this.getTangentAt(m,new N)}r[0]=new N,o[0]=new N;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),d=Math.abs(s[0].y),f=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),d<=c&&(c=d,i.set(0,1,0)),f<=c&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let u=1;u<=e;u++){if(r[u]=r[u-1].clone(),o[u]=o[u-1].clone(),a.crossVectors(s[u-1],s[u]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(wt(s[u-1].dot(s[u]),-1,1));r[u].applyMatrix4(l.makeRotationAxis(a,m))}o[u].crossVectors(s[u],r[u])}if(t===!0){let u=Math.acos(wt(r[0].dot(r[e]),-1,1));u/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(u=-u);for(let m=1;m<=e;m++)r[m].applyMatrix4(l.makeRotationAxis(s[m],u*m)),o[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},lr=class extends an{constructor(e=0,t=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new le){let i=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),f=l-this.aX,u=c-this.aY;l=f*h-u*d+this.aX,c=f*d+u*h+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ll=class extends lr{constructor(e,t,i,s,r,o){super(e,t,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function hh(){let n=0,e=0,t=0,i=0;function s(r,o,a,l){n=r,e=a,t=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,d){let f=(o-r)/c-(a-r)/(c+h)+(a-o)/h,u=(a-o)/h-(l-o)/(h+d)+(l-a)/d;f*=h,u*=h,s(o,a,f,u)},calc:function(r){let o=r*r,a=o*r;return n+e*r+t*o+i*a}}}var lo=new N,Ac=new hh,Rc=new hh,wc=new hh,Rn=class extends an{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new N){let i=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(lo.subVectors(s[0],s[1]).add(s[0]),c=lo);let d=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(lo.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=lo),this.curveType==="centripetal"||this.curveType==="chordal"){let u=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(d),u),g=Math.pow(d.distanceToSquared(f),u),_=Math.pow(f.distanceToSquared(h),u);g<1e-4&&(g=1),m<1e-4&&(m=g),_<1e-4&&(_=g),Ac.initNonuniformCatmullRom(c.x,d.x,f.x,h.x,m,g,_),Rc.initNonuniformCatmullRom(c.y,d.y,f.y,h.y,m,g,_),wc.initNonuniformCatmullRom(c.z,d.z,f.z,h.z,m,g,_)}else this.curveType==="catmullrom"&&(Ac.initCatmullRom(c.x,d.x,f.x,h.x,this.tension),Rc.initCatmullRom(c.y,d.y,f.y,h.y,this.tension),wc.initCatmullRom(c.z,d.z,f.z,h.z,this.tension));return i.set(Ac.calc(l),Rc.calc(l),wc.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new N().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Md(n,e,t,i,s){let r=(i-e)*.5,o=(s-t)*.5,a=n*n,l=n*a;return(2*t-2*i+r+o)*l+(-3*t+3*i-2*r-o)*a+r*n+t}function Px(n,e){let t=1-n;return t*t*e}function Ox(n,e){return 2*(1-n)*n*e}function Ux(n,e){return n*n*e}function tr(n,e,t,i){return Px(n,e)+Ox(n,t)+Ux(n,i)}function Lx(n,e){let t=1-n;return t*t*t*e}function Nx(n,e){let t=1-n;return 3*t*t*n*e}function Dx(n,e){return 3*(1-n)*n*n*e}function Hx(n,e){return n*n*n*e}function nr(n,e,t,i,s){return Lx(n,e)+Nx(n,t)+Dx(n,i)+Hx(n,s)}var Lo=class extends an{constructor(e=new le,t=new le,i=new le,s=new le){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new le){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(nr(e,s.x,r.x,o.x,a.x),nr(e,s.y,r.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Nl=class extends an{constructor(e=new N,t=new N,i=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new N){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(nr(e,s.x,r.x,o.x,a.x),nr(e,s.y,r.y,o.y,a.y),nr(e,s.z,r.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},No=class extends an{constructor(e=new le,t=new le){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new le){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new le){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Dl=class extends an{constructor(e=new N,t=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new N){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new N){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Do=class extends an{constructor(e=new le,t=new le,i=new le){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new le){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(tr(e,s.x,r.x,o.x),tr(e,s.y,r.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ho=class extends an{constructor(e=new N,t=new N,i=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new N){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(tr(e,s.x,r.x,o.x),tr(e,s.y,r.y,o.y),tr(e,s.z,r.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Fo=class extends an{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new le){let i=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],d=s[o>s.length-3?s.length-1:o+2];return i.set(Md(a,l.x,c.x,h.x,d.x),Md(a,l.y,c.y,h.y,d.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new le().fromArray(s))}return this}},Bo=Object.freeze({__proto__:null,ArcCurve:Ll,CatmullRomCurve3:Rn,CubicBezierCurve:Lo,CubicBezierCurve3:Nl,EllipseCurve:lr,LineCurve:No,LineCurve3:Dl,QuadraticBezierCurve:Do,QuadraticBezierCurve3:Ho,SplineCurve:Fo}),Hl=class extends an{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Bo[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let o=s[r]-i,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(new Bo[s.type]().fromJSON(s))}return this}},hr=class extends Hl{constructor(e){super(),this.type="Path",this.currentPoint=new le,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new No(this.currentPoint.clone(),new le(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){let r=new Do(this.currentPoint.clone(),new le(e,t),new le(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,o){let a=new Lo(this.currentPoint.clone(),new le(e,t),new le(i,s),new le(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new Fo(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,s,r,o),this}absarc(e,t,i,s,r,o){return this.absellipse(e,t,i,i,s,r,o),this}ellipse(e,t,i,s,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,i,s,r,o,a,l),this}absellipse(e,t,i,s,r,o,a,l){let c=new lr(e,t,i,s,r,o,a,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},ur=class n extends gt{constructor(e=[new le(0,-.5),new le(.5,0),new le(0,.5)],t=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:s},t=Math.floor(t),s=wt(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],h=1/t,d=new N,f=new le,u=new N,m=new N,g=new N,_=0,p=0;for(let S=0;S<=e.length-1;S++)switch(S){case 0:_=e[S+1].x-e[S].x,p=e[S+1].y-e[S].y,u.x=p*1,u.y=-_,u.z=p*0,g.copy(u),u.normalize(),l.push(u.x,u.y,u.z);break;case e.length-1:l.push(g.x,g.y,g.z);break;default:_=e[S+1].x-e[S].x,p=e[S+1].y-e[S].y,u.x=p*1,u.y=-_,u.z=p*0,m.copy(u),u.x+=g.x,u.y+=g.y,u.z+=g.z,u.normalize(),l.push(u.x,u.y,u.z),g.copy(m)}for(let S=0;S<=t;S++){let x=i+S*h*s,E=Math.sin(x),D=Math.cos(x);for(let w=0;w<=e.length-1;w++){d.x=e[w].x*E,d.y=e[w].y,d.z=e[w].x*D,o.push(d.x,d.y,d.z),f.x=S/t,f.y=w/(e.length-1),a.push(f.x,f.y);let O=l[3*w+0]*E,U=l[3*w+1],T=l[3*w+0]*D;c.push(O,U,T)}}for(let S=0;S<t;S++)for(let x=0;x<e.length-1;x++){let E=x+S*e.length,D=E,w=E+e.length,O=E+e.length+1,U=E+1;r.push(D,w,U),r.push(O,U,w)}this.setIndex(r),this.setAttribute("position",new $e(o,3)),this.setAttribute("uv",new $e(a,2)),this.setAttribute("normal",new $e(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.points,e.segments,e.phiStart,e.phiLength)}},Bt=class n extends ur{constructor(e=1,t=1,i=4,s=8){let r=new hr;r.absarc(0,-t/2,e,Math.PI*1.5,0),r.absarc(0,t/2,e,0,Math.PI*.5),super(r.getPoints(i),s),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:i,radialSegments:s}}static fromJSON(e){return new n(e.radius,e.length,e.capSegments,e.radialSegments)}},wn=class n extends gt{constructor(e=1,t=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:s},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new N,h=new le;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let d=0,f=3;d<=t;d++,f+=3){let u=i+d/t*s;c.x=e*Math.cos(u),c.y=e*Math.sin(u),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[f]/e+1)/2,h.y=(o[f+1]/e+1)/2,l.push(h.x,h.y)}for(let d=1;d<=t;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new $e(o,3)),this.setAttribute("normal",new $e(a,3)),this.setAttribute("uv",new $e(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Qe=class n extends gt{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],f=[],u=[],m=0,g=[],_=i/2,p=0;S(),o===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new $e(d,3)),this.setAttribute("normal",new $e(f,3)),this.setAttribute("uv",new $e(u,2));function S(){let E=new N,D=new N,w=0,O=(t-e)/i;for(let U=0;U<=r;U++){let T=[],y=U/r,P=y*(t-e)+e;for(let F=0;F<=s;F++){let L=F/s,B=L*l+a,Z=Math.sin(B),G=Math.cos(B);D.x=P*Z,D.y=-y*i+_,D.z=P*G,d.push(D.x,D.y,D.z),E.set(Z,O,G).normalize(),f.push(E.x,E.y,E.z),u.push(L,1-y),T.push(m++)}g.push(T)}for(let U=0;U<s;U++)for(let T=0;T<r;T++){let y=g[T][U],P=g[T+1][U],F=g[T+1][U+1],L=g[T][U+1];(e>0||T!==0)&&(h.push(y,P,L),w+=3),(t>0||T!==r-1)&&(h.push(P,F,L),w+=3)}c.addGroup(p,w,0),p+=w}function x(E){let D=m,w=new le,O=new N,U=0,T=E===!0?e:t,y=E===!0?1:-1;for(let F=1;F<=s;F++)d.push(0,_*y,0),f.push(0,y,0),u.push(.5,.5),m++;let P=m;for(let F=0;F<=s;F++){let B=F/s*l+a,Z=Math.cos(B),G=Math.sin(B);O.x=T*G,O.y=_*y,O.z=T*Z,d.push(O.x,O.y,O.z),f.push(0,y,0),w.x=Z*.5+.5,w.y=G*.5*y+.5,u.push(w.x,w.y),m++}for(let F=0;F<s;F++){let L=D+F,B=P+F;E===!0?h.push(B,B+1,L):h.push(B+1,B,L),U+=3}c.addGroup(p,U,E===!0?1:2),p+=U}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Yt=class n extends Qe{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},zo=class n extends gt{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};let r=[],o=[];a(s),c(i),h(),this.setAttribute("position",new $e(r,3)),this.setAttribute("normal",new $e(r.slice(),3)),this.setAttribute("uv",new $e(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(S){let x=new N,E=new N,D=new N;for(let w=0;w<t.length;w+=3)u(t[w+0],x),u(t[w+1],E),u(t[w+2],D),l(x,E,D,S)}function l(S,x,E,D){let w=D+1,O=[];for(let U=0;U<=w;U++){O[U]=[];let T=S.clone().lerp(E,U/w),y=x.clone().lerp(E,U/w),P=w-U;for(let F=0;F<=P;F++)F===0&&U===w?O[U][F]=T:O[U][F]=T.clone().lerp(y,F/P)}for(let U=0;U<w;U++)for(let T=0;T<2*(w-U)-1;T++){let y=Math.floor(T/2);T%2===0?(f(O[U][y+1]),f(O[U+1][y]),f(O[U][y])):(f(O[U][y+1]),f(O[U+1][y+1]),f(O[U+1][y]))}}function c(S){let x=new N;for(let E=0;E<r.length;E+=3)x.x=r[E+0],x.y=r[E+1],x.z=r[E+2],x.normalize().multiplyScalar(S),r[E+0]=x.x,r[E+1]=x.y,r[E+2]=x.z}function h(){let S=new N;for(let x=0;x<r.length;x+=3){S.x=r[x+0],S.y=r[x+1],S.z=r[x+2];let E=_(S)/2/Math.PI+.5,D=p(S)/Math.PI+.5;o.push(E,1-D)}m(),d()}function d(){for(let S=0;S<o.length;S+=6){let x=o[S+0],E=o[S+2],D=o[S+4],w=Math.max(x,E,D),O=Math.min(x,E,D);w>.9&&O<.1&&(x<.2&&(o[S+0]+=1),E<.2&&(o[S+2]+=1),D<.2&&(o[S+4]+=1))}}function f(S){r.push(S.x,S.y,S.z)}function u(S,x){let E=S*3;x.x=e[E+0],x.y=e[E+1],x.z=e[E+2]}function m(){let S=new N,x=new N,E=new N,D=new N,w=new le,O=new le,U=new le;for(let T=0,y=0;T<r.length;T+=9,y+=6){S.set(r[T+0],r[T+1],r[T+2]),x.set(r[T+3],r[T+4],r[T+5]),E.set(r[T+6],r[T+7],r[T+8]),w.set(o[y+0],o[y+1]),O.set(o[y+2],o[y+3]),U.set(o[y+4],o[y+5]),D.copy(S).add(x).add(E).divideScalar(3);let P=_(D);g(w,y+0,S,P),g(O,y+2,x,P),g(U,y+4,E,P)}}function g(S,x,E,D){D<0&&S.x===1&&(o[x]=S.x-1),E.x===0&&E.z===0&&(o[x]=D/2/Math.PI+.5)}function _(S){return Math.atan2(S.z,-S.x)}function p(S){return Math.atan2(-S.y,Math.sqrt(S.x*S.x+S.z*S.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.details)}},ko=class n extends zo{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,s=1/i,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-i,0,-s,i,0,s,-i,0,s,i,-s,-i,0,-s,i,0,s,-i,0,s,i,0,-i,0,-s,i,0,-s,-i,0,s,i,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var dr=class extends hr{constructor(e){super(e),this.uuid=Bi(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(new hr().fromJSON(s))}return this}},Fx={triangulate:function(n,e,t=2){let i=e&&e.length,s=i?e[0]*t:n.length,r=tf(n,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c,h,d,f,u;if(i&&(r=Vx(n,e,r,t)),n.length>80*t){a=c=n[0],l=h=n[1];for(let m=t;m<s;m+=t)d=n[m],f=n[m+1],d<a&&(a=d),f<l&&(l=f),d>c&&(c=d),f>h&&(h=f);u=Math.max(c-a,h-l),u=u!==0?32767/u:0}return fr(r,o,t,a,l,u,0),o}};function tf(n,e,t,i,s){let r,o;if(s===ey(n,e,t,i)>0)for(r=e;r<t;r+=i)o=vd(r,n[r],n[r+1],o);else for(r=t-i;r>=e;r-=i)o=vd(r,n[r],n[r+1],o);return o&&sa(o,o.next)&&(mr(o),o=o.next),o}function Li(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(sa(t,t.next)||Mt(t.prev,t,t.next)===0)){if(mr(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function fr(n,e,t,i,s,r,o){if(!n)return;!o&&r&&Kx(n,i,s,r);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,r?zx(n,i,s,r):Bx(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),mr(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=kx(Li(n),e,t),fr(n,e,t,i,s,r,2)):o===2&&Gx(n,e,t,i,s,r):fr(Li(n),e,t,i,s,r,1);break}}}function Bx(n){let e=n.prev,t=n,i=n.next;if(Mt(e,t,i)>=0)return!1;let s=e.x,r=t.x,o=i.x,a=e.y,l=t.y,c=i.y,h=s<r?s<o?s:o:r<o?r:o,d=a<l?a<c?a:c:l<c?l:c,f=s>r?s>o?s:o:r>o?r:o,u=a>l?a>c?a:c:l>c?l:c,m=i.next;for(;m!==e;){if(m.x>=h&&m.x<=f&&m.y>=d&&m.y<=u&&ds(s,a,r,l,o,c,m.x,m.y)&&Mt(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function zx(n,e,t,i){let s=n.prev,r=n,o=n.next;if(Mt(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,h=s.y,d=r.y,f=o.y,u=a<l?a<c?a:c:l<c?l:c,m=h<d?h<f?h:f:d<f?d:f,g=a>l?a>c?a:c:l>c?l:c,_=h>d?h>f?h:f:d>f?d:f,p=Fl(u,m,e,t,i),S=Fl(g,_,e,t,i),x=n.prevZ,E=n.nextZ;for(;x&&x.z>=p&&E&&E.z<=S;){if(x.x>=u&&x.x<=g&&x.y>=m&&x.y<=_&&x!==s&&x!==o&&ds(a,h,l,d,c,f,x.x,x.y)&&Mt(x.prev,x,x.next)>=0||(x=x.prevZ,E.x>=u&&E.x<=g&&E.y>=m&&E.y<=_&&E!==s&&E!==o&&ds(a,h,l,d,c,f,E.x,E.y)&&Mt(E.prev,E,E.next)>=0))return!1;E=E.nextZ}for(;x&&x.z>=p;){if(x.x>=u&&x.x<=g&&x.y>=m&&x.y<=_&&x!==s&&x!==o&&ds(a,h,l,d,c,f,x.x,x.y)&&Mt(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;E&&E.z<=S;){if(E.x>=u&&E.x<=g&&E.y>=m&&E.y<=_&&E!==s&&E!==o&&ds(a,h,l,d,c,f,E.x,E.y)&&Mt(E.prev,E,E.next)>=0)return!1;E=E.nextZ}return!0}function kx(n,e,t){let i=n;do{let s=i.prev,r=i.next.next;!sa(s,r)&&nf(s,i,i.next,r)&&pr(s,r)&&pr(r,s)&&(e.push(s.i/t|0),e.push(i.i/t|0),e.push(r.i/t|0),mr(i),mr(i.next),i=n=r),i=i.next}while(i!==n);return Li(i)}function Gx(n,e,t,i,s,r){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Jx(o,a)){let l=sf(o,a);o=Li(o,o.next),l=Li(l,l.next),fr(o,e,t,i,s,r,0),fr(l,e,t,i,s,r,0);return}a=a.next}o=o.next}while(o!==n)}function Vx(n,e,t,i){let s=[],r,o,a,l,c;for(r=0,o=e.length;r<o;r++)a=e[r]*i,l=r<o-1?e[r+1]*i:n.length,c=tf(n,a,l,i,!1),c===c.next&&(c.steiner=!0),s.push($x(c));for(s.sort(Wx),r=0;r<s.length;r++)t=Xx(s[r],t);return t}function Wx(n,e){return n.x-e.x}function Xx(n,e){let t=Yx(n,e);if(!t)return e;let i=sf(t,n);return Li(i,i.next),Li(t,t.next)}function Yx(n,e){let t=e,i=-1/0,s,r=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let f=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=r&&f>i&&(i=f,s=t.x<t.next.x?t:t.next,f===r))return s}t=t.next}while(t!==e);if(!s)return null;let a=s,l=s.x,c=s.y,h=1/0,d;t=s;do r>=t.x&&t.x>=l&&r!==t.x&&ds(o<c?r:i,o,l,c,o<c?i:r,o,t.x,t.y)&&(d=Math.abs(o-t.y)/(r-t.x),pr(t,n)&&(d<h||d===h&&(t.x>s.x||t.x===s.x&&qx(s,t)))&&(s=t,h=d)),t=t.next;while(t!==a);return s}function qx(n,e){return Mt(n.prev,n,e.prev)<0&&Mt(e.next,n,n.next)<0}function Kx(n,e,t,i){let s=n;do s.z===0&&(s.z=Fl(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,Zx(s)}function Zx(n){let e,t,i,s,r,o,a,l,c=1;do{for(t=n,n=null,r=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(s=t,t=t.nextZ,a--):(s=i,i=i.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;t=i}r.nextZ=null,c*=2}while(o>1);return n}function Fl(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function $x(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function ds(n,e,t,i,s,r,o,a){return(s-o)*(e-a)>=(n-o)*(r-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(i-a)}function Jx(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!jx(n,e)&&(pr(n,e)&&pr(e,n)&&Qx(n,e)&&(Mt(n.prev,n,e.prev)||Mt(n,e.prev,e))||sa(n,e)&&Mt(n.prev,n,n.next)>0&&Mt(e.prev,e,e.next)>0)}function Mt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function sa(n,e){return n.x===e.x&&n.y===e.y}function nf(n,e,t,i){let s=uo(Mt(n,e,t)),r=uo(Mt(n,e,i)),o=uo(Mt(t,i,n)),a=uo(Mt(t,i,e));return!!(s!==r&&o!==a||s===0&&ho(n,t,e)||r===0&&ho(n,i,e)||o===0&&ho(t,n,i)||a===0&&ho(t,e,i))}function ho(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function uo(n){return n>0?1:n<0?-1:0}function jx(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&nf(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function pr(n,e){return Mt(n.prev,n,n.next)<0?Mt(n,e,n.next)>=0&&Mt(n,n.prev,e)>=0:Mt(n,e,n.prev)<0||Mt(n,n.next,e)<0}function Qx(n,e){let t=n,i=!1,s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function sf(n,e){let t=new Bl(n.i,n.x,n.y),i=new Bl(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function vd(n,e,t,i){let s=new Bl(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function mr(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Bl(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function ey(n,e,t,i){let s=0;for(let r=e,o=t-i;r<t;r+=i)s+=(n[o]-n[r])*(n[r+1]+n[o+1]),o=r;return s}var ir=class n{static area(e){let t=e.length,i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],s=[],r=[];bd(e),Ad(i,e);let o=e.length;t.forEach(bd);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,Ad(i,t[l]);let a=Fx.triangulate(i,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function bd(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function Ad(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var Go=class n extends gt{constructor(e=new dr([new le(.5,.5),new le(-.5,.5),new le(-.5,-.5),new le(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new $e(s,3)),this.setAttribute("uv",new $e(r,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,u=t.bevelThickness!==void 0?t.bevelThickness:.2,m=t.bevelSize!==void 0?t.bevelSize:u-.1,g=t.bevelOffset!==void 0?t.bevelOffset:0,_=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,S=t.UVGenerator!==void 0?t.UVGenerator:ty,x,E=!1,D,w,O,U;p&&(x=p.getSpacedPoints(h),E=!0,f=!1,D=p.computeFrenetFrames(h,!1),w=new N,O=new N,U=new N),f||(_=0,u=0,m=0,g=0);let T=a.extractPoints(c),y=T.shape,P=T.holes;if(!ir.isClockWise(y)){y=y.reverse();for(let oe=0,de=P.length;oe<de;oe++){let H=P[oe];ir.isClockWise(H)&&(P[oe]=H.reverse())}}let L=ir.triangulateShape(y,P),B=y;for(let oe=0,de=P.length;oe<de;oe++){let H=P[oe];y=y.concat(H)}function Z(oe,de,H){return de||console.error("THREE.ExtrudeGeometry: vec does not exist"),oe.clone().addScaledVector(de,H)}let G=y.length,se=L.length;function K(oe,de,H){let Ie,he,Me,fe=oe.x-de.x,Fe=oe.y-de.y,Te=H.x-oe.x,I=H.y-oe.y,M=fe*fe+Fe*Fe,q=fe*I-Fe*Te;if(Math.abs(q)>Number.EPSILON){let ne=Math.sqrt(M),v=Math.sqrt(Te*Te+I*I),C=de.x-Fe/ne,ie=de.y+fe/ne,Q=H.x-I/v,ce=H.y+Te/v,Ae=((Q-C)*I-(ce-ie)*Te)/(fe*I-Fe*Te);Ie=C+fe*Ae-oe.x,he=ie+Fe*Ae-oe.y;let re=Ie*Ie+he*he;if(re<=2)return new le(Ie,he);Me=Math.sqrt(re/2)}else{let ne=!1;fe>Number.EPSILON?Te>Number.EPSILON&&(ne=!0):fe<-Number.EPSILON?Te<-Number.EPSILON&&(ne=!0):Math.sign(Fe)===Math.sign(I)&&(ne=!0),ne?(Ie=-Fe,he=fe,Me=Math.sqrt(M)):(Ie=fe,he=Fe,Me=Math.sqrt(M/2))}return new le(Ie/Me,he/Me)}let ge=[];for(let oe=0,de=B.length,H=de-1,Ie=oe+1;oe<de;oe++,H++,Ie++)H===de&&(H=0),Ie===de&&(Ie=0),ge[oe]=K(B[oe],B[H],B[Ie]);let pe=[],Se,ve=ge.concat();for(let oe=0,de=P.length;oe<de;oe++){let H=P[oe];Se=[];for(let Ie=0,he=H.length,Me=he-1,fe=Ie+1;Ie<he;Ie++,Me++,fe++)Me===he&&(Me=0),fe===he&&(fe=0),Se[Ie]=K(H[Ie],H[Me],H[fe]);pe.push(Se),ve=ve.concat(Se)}for(let oe=0;oe<_;oe++){let de=oe/_,H=u*Math.cos(de*Math.PI/2),Ie=m*Math.sin(de*Math.PI/2)+g;for(let he=0,Me=B.length;he<Me;he++){let fe=Z(B[he],ge[he],Ie);me(fe.x,fe.y,-H)}for(let he=0,Me=P.length;he<Me;he++){let fe=P[he];Se=pe[he];for(let Fe=0,Te=fe.length;Fe<Te;Fe++){let I=Z(fe[Fe],Se[Fe],Ie);me(I.x,I.y,-H)}}}let tt=m+g;for(let oe=0;oe<G;oe++){let de=f?Z(y[oe],ve[oe],tt):y[oe];E?(O.copy(D.normals[0]).multiplyScalar(de.x),w.copy(D.binormals[0]).multiplyScalar(de.y),U.copy(x[0]).add(O).add(w),me(U.x,U.y,U.z)):me(de.x,de.y,0)}for(let oe=1;oe<=h;oe++)for(let de=0;de<G;de++){let H=f?Z(y[de],ve[de],tt):y[de];E?(O.copy(D.normals[oe]).multiplyScalar(H.x),w.copy(D.binormals[oe]).multiplyScalar(H.y),U.copy(x[oe]).add(O).add(w),me(U.x,U.y,U.z)):me(H.x,H.y,d/h*oe)}for(let oe=_-1;oe>=0;oe--){let de=oe/_,H=u*Math.cos(de*Math.PI/2),Ie=m*Math.sin(de*Math.PI/2)+g;for(let he=0,Me=B.length;he<Me;he++){let fe=Z(B[he],ge[he],Ie);me(fe.x,fe.y,d+H)}for(let he=0,Me=P.length;he<Me;he++){let fe=P[he];Se=pe[he];for(let Fe=0,Te=fe.length;Fe<Te;Fe++){let I=Z(fe[Fe],Se[Fe],Ie);E?me(I.x,I.y+x[h-1].y,x[h-1].x+H):me(I.x,I.y,d+H)}}}ee(),ae();function ee(){let oe=s.length/3;if(f){let de=0,H=G*de;for(let Ie=0;Ie<se;Ie++){let he=L[Ie];Ne(he[2]+H,he[1]+H,he[0]+H)}de=h+_*2,H=G*de;for(let Ie=0;Ie<se;Ie++){let he=L[Ie];Ne(he[0]+H,he[1]+H,he[2]+H)}}else{for(let de=0;de<se;de++){let H=L[de];Ne(H[2],H[1],H[0])}for(let de=0;de<se;de++){let H=L[de];Ne(H[0]+G*h,H[1]+G*h,H[2]+G*h)}}i.addGroup(oe,s.length/3-oe,0)}function ae(){let oe=s.length/3,de=0;_e(B,de),de+=B.length;for(let H=0,Ie=P.length;H<Ie;H++){let he=P[H];_e(he,de),de+=he.length}i.addGroup(oe,s.length/3-oe,1)}function _e(oe,de){let H=oe.length;for(;--H>=0;){let Ie=H,he=H-1;he<0&&(he=oe.length-1);for(let Me=0,fe=h+_*2;Me<fe;Me++){let Fe=G*Me,Te=G*(Me+1),I=de+Ie+Fe,M=de+he+Fe,q=de+he+Te,ne=de+Ie+Te;Ve(I,M,q,ne)}}}function me(oe,de,H){l.push(oe),l.push(de),l.push(H)}function Ne(oe,de,H){ze(oe),ze(de),ze(H);let Ie=s.length/3,he=S.generateTopUV(i,s,Ie-3,Ie-2,Ie-1);Je(he[0]),Je(he[1]),Je(he[2])}function Ve(oe,de,H,Ie){ze(oe),ze(de),ze(Ie),ze(de),ze(H),ze(Ie);let he=s.length/3,Me=S.generateSideWallUV(i,s,he-6,he-3,he-2,he-1);Je(Me[0]),Je(Me[1]),Je(Me[3]),Je(Me[1]),Je(Me[2]),Je(Me[3])}function ze(oe){s.push(l[oe*3+0]),s.push(l[oe*3+1]),s.push(l[oe*3+2])}function Je(oe){r.push(oe.x),r.push(oe.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return ny(t,i,e)}static fromJSON(e,t){let i=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];i.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Bo[s.type]().fromJSON(s)),new n(i,e.options)}},ty={generateTopUV:function(n,e,t,i,s){let r=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],c=e[s*3],h=e[s*3+1];return[new le(r,o),new le(a,l),new le(c,h)]},generateSideWallUV:function(n,e,t,i,s,r){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[i*3],h=e[i*3+1],d=e[i*3+2],f=e[s*3],u=e[s*3+1],m=e[s*3+2],g=e[r*3],_=e[r*3+1],p=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new le(o,1-l),new le(c,1-d),new le(f,1-m),new le(g,1-p)]:[new le(a,1-l),new le(h,1-d),new le(u,1-m),new le(_,1-p)]}};function ny(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Vo=class n extends zo{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var Wo=class n extends gt{constructor(e=.5,t=1,i=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:o},i=Math.max(3,i),s=Math.max(1,s);let a=[],l=[],c=[],h=[],d=e,f=(t-e)/s,u=new N,m=new le;for(let g=0;g<=s;g++){for(let _=0;_<=i;_++){let p=r+_/i*o;u.x=d*Math.cos(p),u.y=d*Math.sin(p),l.push(u.x,u.y,u.z),c.push(0,0,1),m.x=(u.x/t+1)/2,m.y=(u.y/t+1)/2,h.push(m.x,m.y)}d+=f}for(let g=0;g<s;g++){let _=g*(i+1);for(let p=0;p<i;p++){let S=p+_,x=S,E=S+i+1,D=S+i+2,w=S+1;a.push(x,E,w),a.push(E,D,w)}}this.setIndex(a),this.setAttribute("position",new $e(l,3)),this.setAttribute("normal",new $e(c,3)),this.setAttribute("uv",new $e(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var Re=class n extends gt{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,h=[],d=new N,f=new N,u=[],m=[],g=[],_=[];for(let p=0;p<=i;p++){let S=[],x=p/i,E=0;p===0&&o===0?E=.5/t:p===i&&l===Math.PI&&(E=-.5/t);for(let D=0;D<=t;D++){let w=D/t;d.x=-e*Math.cos(s+w*r)*Math.sin(o+x*a),d.y=e*Math.cos(o+x*a),d.z=e*Math.sin(s+w*r)*Math.sin(o+x*a),m.push(d.x,d.y,d.z),f.copy(d).normalize(),g.push(f.x,f.y,f.z),_.push(w+E,1-x),S.push(c++)}h.push(S)}for(let p=0;p<i;p++)for(let S=0;S<t;S++){let x=h[p][S+1],E=h[p][S],D=h[p+1][S],w=h[p+1][S+1];(p!==0||o>0)&&u.push(x,E,w),(p!==i-1||l<Math.PI)&&u.push(E,D,w)}this.setIndex(u),this.setAttribute("position",new $e(m,3)),this.setAttribute("normal",new $e(g,3)),this.setAttribute("uv",new $e(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var vs=class n extends gt{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);let o=[],a=[],l=[],c=[],h=new N,d=new N,f=new N;for(let u=0;u<=i;u++)for(let m=0;m<=s;m++){let g=m/s*r,_=u/i*Math.PI*2;d.x=(e+t*Math.cos(_))*Math.cos(g),d.y=(e+t*Math.cos(_))*Math.sin(g),d.z=t*Math.sin(_),a.push(d.x,d.y,d.z),h.x=e*Math.cos(g),h.y=e*Math.sin(g),f.subVectors(d,h).normalize(),l.push(f.x,f.y,f.z),c.push(m/s),c.push(u/i)}for(let u=1;u<=i;u++)for(let m=1;m<=s;m++){let g=(s+1)*u+m-1,_=(s+1)*(u-1)+m-1,p=(s+1)*(u-1)+m,S=(s+1)*u+m;o.push(g,_,S),o.push(_,p,S)}this.setIndex(o),this.setAttribute("position",new $e(a,3)),this.setAttribute("normal",new $e(l,3)),this.setAttribute("uv",new $e(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var Zn=class n extends gt{constructor(e=new Ho(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),t=64,i=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:s,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new N,l=new N,c=new le,h=new N,d=[],f=[],u=[],m=[];g(),this.setIndex(m),this.setAttribute("position",new $e(d,3)),this.setAttribute("normal",new $e(f,3)),this.setAttribute("uv",new $e(u,2));function g(){for(let x=0;x<t;x++)_(x);_(r===!1?t:0),S(),p()}function _(x){h=e.getPointAt(x/t,h);let E=o.normals[x],D=o.binormals[x];for(let w=0;w<=s;w++){let O=w/s*Math.PI*2,U=Math.sin(O),T=-Math.cos(O);l.x=T*E.x+U*D.x,l.y=T*E.y+U*D.y,l.z=T*E.z+U*D.z,l.normalize(),f.push(l.x,l.y,l.z),a.x=h.x+i*l.x,a.y=h.y+i*l.y,a.z=h.z+i*l.z,d.push(a.x,a.y,a.z)}}function p(){for(let x=1;x<=t;x++)for(let E=1;E<=s;E++){let D=(s+1)*(x-1)+(E-1),w=(s+1)*x+(E-1),O=(s+1)*x+E,U=(s+1)*(x-1)+E;m.push(D,w,U),m.push(w,O,U)}}function S(){for(let x=0;x<=t;x++)for(let E=0;E<=s;E++)c.x=x/t,c.y=E/s,u.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new n(new Bo[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var Ge=class extends fi{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new De(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new De(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xd,this.normalScale=new le(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},bs=class extends Ge{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new le(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return wt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new De(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new De(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new De(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};function fo(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function iy(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var As=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break e}o=i,i=0;break t}break n}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},zl=class extends As{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Tu,endingEnd:Tu}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Mu:r=e,a=2*t-i;break;case vu:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Mu:o=e,l=2*i-t;break;case vu:o=1,l=i+s[1]-s[0];break;default:o=e-1,l=t}let c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,d=this._offsetNext,f=this._weightPrev,u=this._weightNext,m=(i-t)/(s-t),g=m*m,_=g*m,p=-f*_+2*f*g-f*m,S=(1+f)*_+(-1.5-2*f)*g+(-.5+f)*m+1,x=(-1-u)*_+(1.5+u)*g+.5*m,E=u*_-u*g;for(let D=0;D!==a;++D)r[D]=p*o[h+D]+S*o[c+D]+x*o[l+D]+E*o[d+D];return r}},kl=class extends As{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(i-t)/(s-t),d=1-h;for(let f=0;f!==a;++f)r[f]=o[c+f]*d+o[l+f]*h;return r}},Gl=class extends As{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},gn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=fo(t,this.TimeBufferType),this.values=fo(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:fo(e.times,Array),values:fo(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Gl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new kl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new zl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case xo:t=this.InterpolantFactoryMethodDiscrete;break;case ml:t=this.InterpolantFactoryMethodLinear;break;case Qa:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return xo;case this.InterpolantFactoryMethodLinear:return ml;case this.InterpolantFactoryMethodSmooth:return Qa}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){let i=this.times,s=i.length,r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&iy(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Qa,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{let d=a*i,f=d-i,u=d+i;for(let m=0;m!==i;++m){let g=t[d+m];if(g!==t[f+m]||g!==t[u+m]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let d=a*i,f=o*i;for(let u=0;u!==i;++u)t[f+u]=t[d+u]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};gn.prototype.TimeBufferType=Float32Array;gn.prototype.ValueBufferType=Float32Array;gn.prototype.DefaultInterpolation=ml;var Ni=class extends gn{constructor(e,t,i){super(e,t,i)}};Ni.prototype.ValueTypeName="bool";Ni.prototype.ValueBufferType=Array;Ni.prototype.DefaultInterpolation=xo;Ni.prototype.InterpolantFactoryMethodLinear=void 0;Ni.prototype.InterpolantFactoryMethodSmooth=void 0;var Vl=class extends gn{};Vl.prototype.ValueTypeName="color";var Wl=class extends gn{};Wl.prototype.ValueTypeName="number";var Xl=class extends As{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(s-t),c=e*a;for(let h=c+a;c!==h;c+=4)Nt.slerpFlat(r,0,o,c-a,o,c,l);return r}},Xo=class extends gn{InterpolantFactoryMethodLinear(e){return new Xl(this.times,this.values,this.getValueSize(),e)}};Xo.prototype.ValueTypeName="quaternion";Xo.prototype.InterpolantFactoryMethodSmooth=void 0;var Di=class extends gn{constructor(e,t,i){super(e,t,i)}};Di.prototype.ValueTypeName="string";Di.prototype.ValueBufferType=Array;Di.prototype.DefaultInterpolation=xo;Di.prototype.InterpolantFactoryMethodLinear=void 0;Di.prototype.InterpolantFactoryMethodSmooth=void 0;var Yl=class extends gn{};Yl.prototype.ValueTypeName="vector";var ql=class{constructor(e,t,i){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,f=c.length;d<f;d+=2){let u=c[d],m=c[d+1];if(u.global&&(u.lastIndex=0),u.test(h))return m}return null}}},sy=new ql,Kl=class{constructor(e){this.manager=e!==void 0?e:sy,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};Kl.DEFAULT_MATERIAL_NAME="__DEFAULT";var Rs=class extends Vt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new De(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Yo=class extends Rs{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Vt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new De(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Cc=new ot,Rd=new N,wd=new N,qo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new le(512,512),this.map=null,this.mapPass=null,this.matrix=new ot,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ar,this._frameExtents=new le(1,1),this._viewportCount=1,this._viewports=[new pt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;Rd.setFromMatrixPosition(e.matrixWorld),t.position.copy(Rd),wd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(wd),t.updateMatrixWorld(),Cc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Cc),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Cc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Cd=new ot,Zs=new N,Ic=new N,Zl=class extends qo{constructor(){super(new Gt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new le(4,2),this._viewportCount=6,this._viewports=[new pt(2,1,1,1),new pt(0,1,1,1),new pt(3,1,1,1),new pt(1,1,1,1),new pt(3,0,1,1),new pt(1,0,1,1)],this._cubeDirections=[new N(1,0,0),new N(-1,0,0),new N(0,0,1),new N(0,0,-1),new N(0,1,0),new N(0,-1,0)],this._cubeUps=[new N(0,1,0),new N(0,1,0),new N(0,1,0),new N(0,1,0),new N(0,0,1),new N(0,0,-1)]}updateMatrices(e,t=0){let i=this.camera,s=this.matrix,r=e.distance||i.far;r!==i.far&&(i.far=r,i.updateProjectionMatrix()),Zs.setFromMatrixPosition(e.matrixWorld),i.position.copy(Zs),Ic.copy(i.position),Ic.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(Ic),i.updateMatrixWorld(),s.makeTranslation(-Zs.x,-Zs.y,-Zs.z),Cd.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Cd)}},Ko=class extends Rs{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new Zl}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},$l=class extends qo{constructor(){super(new wo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Zo=class extends Rs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Vt.DEFAULT_UP),this.updateMatrix(),this.target=new Vt,this.shadow=new $l}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},$o=class extends Rs{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var Jo=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Id(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=Id();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};function Id(){return performance.now()}var uh="\\[\\]\\.:\\/",ry=new RegExp("["+uh+"]","g"),dh="[^"+uh+"]",oy="[^"+uh.replace("\\.","")+"]",ay=/((?:WC+[\/:])*)/.source.replace("WC",dh),cy=/(WCOD+)?/.source.replace("WCOD",oy),ly=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",dh),hy=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",dh),uy=new RegExp("^"+ay+cy+ly+hy+"$"),dy=["material","materials","bones","map"],Jl=class{constructor(e,t,i){let s=i||Tt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},Tt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(ry,"")}static parseTrackName(e){let t=uy.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);dy.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Tt.Composite=Jl;Tt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Tt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Tt.prototype.GetterByBindingType=[Tt.prototype._getValue_direct,Tt.prototype._getValue_array,Tt.prototype._getValue_arrayElement,Tt.prototype._getValue_toArray];Tt.prototype.SetterByBindingTypeAndVersioning=[[Tt.prototype._setValue_direct,Tt.prototype._setValue_direct_setNeedsUpdate,Tt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Tt.prototype._setValue_array,Tt.prototype._setValue_array_setNeedsUpdate,Tt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Tt.prototype._setValue_arrayElement,Tt.prototype._setValue_arrayElement_setNeedsUpdate,Tt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Tt.prototype._setValue_fromArray,Tt.prototype._setValue_fromArray_setNeedsUpdate,Tt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Nw=new Float32Array(1);var Pd=new ot,jo=class{constructor(e,t,i=0,s=1/0){this.ray=new Ui(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new or,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Pd.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Pd),this}intersectObject(e,t=!0,i=[]){return jl(e,this,i,t),i.sort(Od),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)jl(e[s],this,i,t);return i.sort(Od),i}};function Od(n,e){return n.distance-e.distance}function jl(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let o=0,a=r.length;o<a;o++)jl(r[o],e,t,!0)}}var _r=class{constructor(e=1,t=0,i=0){return this.radius=e,this.phi=t,this.theta=i,this}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(wt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Qo=class extends Gn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");var rf={type:"change"},ph={type:"start"},af={type:"end"},ra=new Ui,of=new mn,fy=Math.cos(70*na.DEG2RAD),Ot=new N,$t=2*Math.PI,mt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},fh=1e-6,oa=class extends Qo{constructor(e,t=null){super(e,t),this.state=mt.NONE,this.enabled=!0,this.target=new N,this.cursor=new N,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Hi.ROTATE,MIDDLE:Hi.DOLLY,RIGHT:Hi.PAN},this.touches={ONE:Fi.ROTATE,TWO:Fi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new N,this._lastQuaternion=new Nt,this._lastTargetPosition=new N,this._quat=new Nt().setFromUnitVectors(e.up,new N(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new _r,this._sphericalDelta=new _r,this._scale=1,this._panOffset=new N,this._rotateStart=new le,this._rotateEnd=new le,this._rotateDelta=new le,this._panStart=new le,this._panEnd=new le,this._panDelta=new le,this._dollyStart=new le,this._dollyEnd=new le,this._dollyDelta=new le,this._dollyDirection=new N,this._mouse=new le,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=my.bind(this),this._onPointerDown=py.bind(this),this._onPointerUp=_y.bind(this),this._onContextMenu=My.bind(this),this._onMouseWheel=xy.bind(this),this._onKeyDown=yy.bind(this),this._onTouchStart=Sy.bind(this),this._onTouchMove=Ty.bind(this),this._onMouseDown=gy.bind(this),this._onMouseMove=Ey.bind(this),this._interceptControlDown=vy.bind(this),this._interceptControlUp=by.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(rf),this.update(),this.state=mt.NONE}update(e=null){let t=this.object.position;Ot.copy(t).sub(this.target),Ot.applyQuaternion(this._quat),this._spherical.setFromVector3(Ot),this.autoRotate&&this.state===mt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=$t:i>Math.PI&&(i-=$t),s<-Math.PI?s+=$t:s>Math.PI&&(s-=$t),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Ot.setFromSpherical(this._spherical),Ot.applyQuaternion(this._quatInverse),t.copy(this.target).add(Ot),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Ot.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new N(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new N(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Ot.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(ra.origin.copy(this.object.position),ra.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ra.direction))<fy?this.object.lookAt(this.target):(of.setFromNormalAndCoplanarPoint(this.object.up,this.target),ra.intersectPlane(of,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>fh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>fh||this._lastTargetPosition.distanceToSquared(this.target)>fh?(this.dispatchEvent(rf),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?$t/60*this.autoRotateSpeed*e:$t/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Ot.setFromMatrixColumn(t,0),Ot.multiplyScalar(-e),this._panOffset.add(Ot)}_panUp(e,t){this.screenSpacePanning===!0?Ot.setFromMatrixColumn(t,1):(Ot.setFromMatrixColumn(t,0),Ot.crossVectors(this.object.up,Ot)),Ot.multiplyScalar(e),this._panOffset.add(Ot)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Ot.copy(s).sub(this.target);let r=Ot.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,o=i.width,a=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft($t*this._rotateDelta.x/t.clientHeight),this._rotateUp($t*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp($t*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(-$t*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft($t*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(-$t*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft($t*this._rotateDelta.x/t.clientHeight),this._rotateUp($t*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new le,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function py(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n)))}function my(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function _y(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(af),this.state=mt.NONE;break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function gy(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Hi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=mt.DOLLY;break;case Hi.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=mt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=mt.ROTATE}break;case Hi.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=mt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=mt.PAN}break;default:this.state=mt.NONE}this.state!==mt.NONE&&this.dispatchEvent(ph)}function Ey(n){switch(this.state){case mt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case mt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case mt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function xy(n){this.enabled===!1||this.enableZoom===!1||this.state!==mt.NONE||(n.preventDefault(),this.dispatchEvent(ph),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(af))}function yy(n){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(n)}function Sy(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case Fi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=mt.TOUCH_ROTATE;break;case Fi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=mt.TOUCH_PAN;break;default:this.state=mt.NONE}break;case 2:switch(this.touches.TWO){case Fi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=mt.TOUCH_DOLLY_PAN;break;case Fi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=mt.TOUCH_DOLLY_ROTATE;break;default:this.state=mt.NONE}break;default:this.state=mt.NONE}this.state!==mt.NONE&&this.dispatchEvent(ph)}function Ty(n){switch(this._trackPointer(n),this.state){case mt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case mt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case mt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case mt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=mt.NONE}}function My(n){this.enabled!==!1&&n.preventDefault()}function vy(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function by(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function En(n){let e=2166136261;for(let t=0;t<n.length;t++)e^=n.charCodeAt(t),e=Math.imul(e,16777619)>>>0;return e>>>0}function Et(n){let e=n>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}var nn=[{id:"draft",name:"Drafts",rect:{x0:-46,x1:-24,z0:6,z1:28}},{id:"awaiting",name:"Awaiting review",rect:{x0:-22.6,x1:-.6,z0:6,z1:28}},{id:"changes",name:"Changes requested",rect:{x0:.8,x1:22.8,z0:6,z1:28}},{id:"ready",name:"Ready to merge",rect:{x0:24.2,x1:46.2,z0:6,z1:28}},{id:"merged",name:"Merged",rect:{x0:-46,x1:46.2,z0:-34,z1:3}}];function Er(n){return nn.find(e=>e.id===n)??nn[nn.length-1]}function cf(n){let{rect:e}=Er(n);return{x:(e.x0+e.x1)/2,z:(e.z0+e.z1)/2}}var zi=["#e5484d","#f76b15","#ffc53d","#8e4ec6","#0090ff","#12a594","#e93d82","#00a2c7","#3e63dd","#d6409f","#f4f4f4","#8d6e63","#ff8fab","#7dd3fc","#a3e635","#1c1c1c"];function lf(n){let e=[...new Set(n)].sort(),t=new Set,i=new Map;for(let s of e){let r=En(s)%zi.length;for(let o=0;o<zi.length&&t.has(r);o++)r=(r+1)%zi.length;t.add(r),i.set(s,zi[r])}return i}var hf=n=>Math.max(0,zi.indexOf(n));var mi=512,ca=256,mh=16,ki=32,Is=mi/ki,aa=Math.PI*2,ht={muzzle:0,dark:1,horn:2,white:3,brass:4,udder:5,body:6,face:7,hoof:8,nose:9,tuft:10,hornTip:11,brassDark:12},_h=n=>Is+n;function pf(n){let e=n%Is,t=Math.floor(n/Is),i=(e+.5)/Is,s=ca+mh+t*ki+ki/2;return[i,1-s/mi]}var gh=1-ca/mi;function uf(n,e,t,i){let s=[],r=6+Math.floor(n()*5);for(let o=0;o<r;o++)s.push({x:e+(n()-.5)*i*.9,y:t+(n()-.5)*i*.55,rx:i*(.28+n()*.34),ry:i*(.2+n()*.3),rot:n()*Math.PI});return s}function df(n,e,t,i){n.fillStyle=e;for(let s of t)n.beginPath(),n.ellipse(s.x+i,s.y,s.rx,s.ry,s.rot,0,aa),n.fill()}function Ay(n,e,t){let i=mi,s=ca;n.fillStyle=e.body,n.fillRect(0,0,i,s+mh);let r=e.patch??e.body,o=c=>{for(let h of[-i,0,i])c(h)};if(e.pattern==="patches"){let c=6+Math.floor(t()*5);for(let h=0;h<c;h++){let d=uf(t,t()*i,t()*s,55+t()*80);o(f=>df(n,r,d,f))}}else if(e.pattern==="belt"){let c=s*.36,h=s*.6,d=n.createLinearGradient(0,c-10,0,h+10);d.addColorStop(0,"rgba(0,0,0,0)"),d.addColorStop(.08,r),d.addColorStop(.92,r),d.addColorStop(1,"rgba(0,0,0,0)"),n.fillStyle=d,n.fillRect(0,c-10,i,h-c+20)}else if(e.pattern==="backstripe")n.fillStyle=r,n.fillRect(i*.43,0,i*.14,s),n.fillRect(0,0,i*.05,s),n.fillRect(i*.95,0,i*.05,s);else if(e.pattern==="roan"){for(let c=0;c<520;c++){n.globalAlpha=.45+t()*.55,n.fillStyle=r;let h=t()*i,d=t()*s,f=1.5+t()*5;o(u=>{n.beginPath(),n.arc(h+u,d,f,0,aa),n.fill()})}n.globalAlpha=1}else if(e.pattern==="nguni"){let c=3+Math.floor(t()*3),h=[];for(let d=0;d<c;d++){let f=t()*i,u=t()*s;h.push([f,u]);let m=uf(t,f,u,70+t()*90);o(g=>df(n,r,m,g))}for(let d=0;d<900;d++){let[f,u]=h[Math.floor(t()*h.length)],m=t()<.65,g=m?f+(t()-.5)*220:t()*i,_=m?u+(t()-.5)*140:t()*s,p=1.5+t()*(m?9:4);n.globalAlpha=.7+t()*.3,n.fillStyle=r,o(S=>{n.beginPath(),n.ellipse(g+S,_,p,p*(.6+t()*.6),t()*Math.PI,0,aa),n.fill()})}n.globalAlpha=1}else if(e.pattern==="whiteface")for(let[c,h]of[[0,i*.07],[i*.93,i*.07]]){let d=n.createLinearGradient(c,0,c+h,0);d.addColorStop(0,c===0?r:"rgba(0,0,0,0)"),d.addColorStop(1,c===0?"rgba(0,0,0,0)":r),n.fillStyle=d,n.fillRect(c,0,h,s)}n.globalAlpha=e.shaggy?.14:.07;let a=e.shaggy?3200:1800;for(let c=0;c<a;c++)n.fillStyle=t()>.5?"#000000":"#ffffff",n.fillRect(t()*i,t()*s,e.shaggy?2:1,3+t()*(e.shaggy?10:5));n.globalAlpha=1;let l=n.createLinearGradient(0,0,i,0);l.addColorStop(0,"rgba(0,0,0,0.32)"),l.addColorStop(.2,"rgba(0,0,0,0.06)"),l.addColorStop(.5,"rgba(255,255,255,0.05)"),l.addColorStop(.8,"rgba(0,0,0,0.06)"),l.addColorStop(1,"rgba(0,0,0,0.32)"),n.fillStyle=l,n.fillRect(0,0,i,s)}function Jt(n,e,t){let i=e%Is,s=Math.floor(e/Is);n.fillStyle=t,n.fillRect(i*ki,ca+mh+s*ki,ki,ki)}function Ry(n,e){let t=new De(n);return t.multiplyScalar(1-e),`#${t.getHexString()}`}function wy(n){let e=document.createElement("canvas");e.width=mi,e.height=mi;let t=e.getContext("2d");t.fillStyle=n.body,t.fillRect(0,0,mi,mi),Ay(t,n,Et(En(n.id)));let i=new De(n.body).getHSL({h:0,s:0,l:0}).l>.5;Jt(t,ht.muzzle,n.muzzle),Jt(t,ht.dark,"#1d1917"),Jt(t,ht.horn,i?"#d9ccb4":"#e6dac3"),Jt(t,ht.white,"#ffffff"),Jt(t,ht.brass,"#d4a63a"),Jt(t,ht.udder,"#efb8ae"),Jt(t,ht.body,n.body),Jt(t,ht.face,n.pattern==="whiteface"?n.patch??n.body:n.body),Jt(t,ht.hoof,"#2a221f"),Jt(t,ht.nose,Ry(n.muzzle,.45)),Jt(t,ht.tuft,i?"#3a312c":"#15120f"),Jt(t,ht.hornTip,"#3d342c"),Jt(t,ht.brassDark,"#8a6a1f"),zi.forEach((r,o)=>Jt(t,_h(o),r));let s=new Kn(e);return s.colorSpace=At,s.wrapS=ys,s.wrapT=Hn,s.anisotropy=4,s}var ff=new Map;function mf(n){let e=ff.get(n.id);return e||(e=wy(n),ff.set(n.id,e)),e}function _f(){let n=document.createElement("canvas");n.width=1024,n.height=1024;let e=n.getContext("2d"),t=Et(7);e.fillStyle="#5fae4a",e.fillRect(0,0,1024,1024);let i=["#56a443","#6ab854","#4f9c3f","#73bf5a","#62ab4b","#7cc463"];for(let r=0;r<700;r++)e.fillStyle=i[Math.floor(t()*i.length)],e.globalAlpha=.25+t()*.35,e.beginPath(),e.ellipse(t()*1024,t()*1024,18+t()*70,10+t()*40,t()*Math.PI,0,aa),e.fill();e.globalAlpha=.22;for(let r=0;r<9e3;r++)e.fillStyle=t()>.5?"#3f8a33":"#9ad77c",e.fillRect(t()*1024,t()*1024,2,3+t()*5);e.globalAlpha=1;let s=new Kn(n);return s.colorSpace=At,s.wrapS=s.wrapT=ys,s.repeat.set(7,7),s.anisotropy=8,s}function xr(n){let e=n.canvas.getContext("2d"),{width:t,height:i}=n.canvas;e.fillStyle="#c9a26b",e.fillRect(0,0,t,i);let s=Et(En(n.name));e.strokeStyle="rgba(120, 80, 40, 0.18)",e.lineWidth=2;for(let r=0;r<26;r++){let o=s()*i;e.beginPath(),e.moveTo(0,o),e.bezierCurveTo(t*.3,o+(s()-.5)*18,t*.7,o+(s()-.5)*18,t,o+(s()-.5)*10),e.stroke()}e.strokeStyle="#8a6238",e.lineWidth=14,e.strokeRect(7,7,t-14,i-14),e.fillStyle="#3b2a1a",e.textAlign="center",e.textBaseline="middle",e.font="bold 58px 'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif",e.fillText(n.name,t/2,i*.38,t-60),e.font="600 40px 'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif",e.fillText(`${n.count} cow${n.count===1?"":"s"}`,t/2,i*.74),n.texture.needsUpdate=!0}function Ef(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),r={},o={},a=n[0].morphTargetsRelative,l=new gt,c=0;for(let h=0;h<n.length;++h){let d=n[h],f=0;if(t!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let u in d.attributes){if(!i.has(u))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+u+'" attribute exists among all geometries, or in none of them.'),null;r[u]===void 0&&(r[u]=[]),r[u].push(d.attributes[u]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let u in d.morphAttributes){if(!s.has(u))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[u]===void 0&&(o[u]=[]),o[u].push(d.morphAttributes[u])}if(e){let u;if(t)u=d.index.count;else if(d.attributes.position!==void 0)u=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,u,h),c+=u}}if(t){let h=0,d=[];for(let f=0;f<n.length;++f){let u=n[f].index;for(let m=0;m<u.count;++m)d.push(u.getX(m)+h);h+=n[f].attributes.position.count}l.setIndex(d)}for(let h in r){let d=gf(r[h]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,d)}for(let h in o){let d=o[h][0].length;if(d===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let f=0;f<d;++f){let u=[];for(let g=0;g<o[h].length;++g)u.push(o[h][g][f]);let m=gf(u);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(m)}}return l}function gf(n){let e,t,i,s=-1,r=0;for(let c=0;c<n.length;++c){let h=n[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}let o=new e(r),a=new bt(o,t,i),l=0;for(let c=0;c<n.length;++c){let h=n[c];if(h.isInterleavedBufferAttribute){let d=l/t;for(let f=0,u=h.count;f<u;f++)for(let m=0;m<t;m++){let g=h.getComponent(f,m);a.setComponent(f+d,m,g)}}else o.set(h.array,l);l+=h.count*t}return s!==void 0&&(a.gpuType=s),a}var yr=1.7,yf=.6,Eh=.93,xn=Eh+yf*.78,ha=n=>(xn+yf*.9)*n,Sf=n=>(xn+1.05)*n;function Dt(n,e){let[t,i]=pf(e),s=n.attributes.uv;for(let r=0;r<s.count;r++)s.setXY(r,t,i);return n}function Ps(n,e,t=1,i=0){let s=n.attributes.uv;for(let r=0;r<s.count;r++){let o=Math.min(1,Math.max(0,s.getY(r)*t+i));s.setXY(r,s.getX(r)+e,gh+o*(1-gh))}return n}function Tf(n,e){let t=new Nt().setFromUnitVectors(new N(0,1,0),e.clone().normalize());return n.applyQuaternion(t)}function xf(n){let t=[[0,0],[.3,.015],[.47,.07],[.55,.17],[.585,.32],[.6,.5],[.595,.66],[.565,.8],[.49,.92],[.32,.98],[0,1]].map(([r,o])=>new le(r,o*yr)),i=new ur(t,30);i.rotateX(Math.PI/2),i.translate(0,0,-yr/2);let s=i.attributes.position;for(let r=0;r<s.count;r++){let o=s.getY(r),a=s.getZ(r),l=o>0?o*.86:o*1.08;o<0&&a>.2&&(l-=(a-.2)*.06),s.setY(r,l)}return i.computeVertexNormals(),i.translate(0,xn,0),Ps(i,n)}function xh(){let n=new N(0,xn+.16,yr/2-.14),e=new N(0,xn+.5,yr/2+.36),t=e.clone().sub(n),i=t.length();return{base:n,tip:e,direction:t.normalize(),length:i}}function Cy(n){let{base:e,direction:t,length:i}=xh(),s=new Qe(.21,.34,i+.2,16,1,!1);return s.translate(0,(i+.2)/2-.1,0),Tf(s,t),s.translate(e.x,e.y,e.z),Ps(s,n,.35,.6)}function Iy(n){let{base:e,direction:t,length:i}=xh(),s=new Qe(.33,.345,.15,22,1,!0);Tf(s,t);let r=e.clone().addScaledVector(t,i*.5);s.translate(r.x,r.y,r.z),Dt(s,_h(n));let o=new Qe(.062,.095,.15,4,1,!1);o.rotateY(Math.PI/4),o.translate(0,r.y-.42,r.z+.12),Dt(o,ht.brass);let a=new vs(.032,.011,6,12);a.translate(0,r.y-.33,r.z+.12),Dt(a,ht.brassDark);let l=new Re(.02,6,5);return l.translate(0,r.y-.51,r.z+.12),Dt(l,ht.brassDark),[s,o,a,l]}function Py(n){let e=new Re(.34,16,12);return e.scale(.95,.85,1.3),e.translate(0,xn+.4,.42),Ps(e,n)}function Oy(n){let e=new Re(.16,12,8);return e.scale(.75,1.5,1.6),e.translate(0,xn-.42,.72),Ps(e,n)}function Uy(){let n=new Re(.27,14,10);n.scale(1.1,.7,1.05),n.translate(0,xn-.56,-.42),Dt(n,ht.udder);let e=[-.1,.1].map(t=>{let i=new Bt(.028,.08,4,8);return i.translate(t,xn-.76,-.42),Dt(i,ht.udder)});return[n,...e]}var Ly={short:{points:[[.2,.32,-.02],[.36,.4,.03],[.47,.52,.16],[.5,.66,.3]],base:.075,tip:.022},long:{points:[[.2,.32,-.02],[.5,.45,.02],[.78,.7,.12],[.9,1.05,.3]],base:.08,tip:.02},huge:{points:[[.2,.3,-.02],[.7,.4,.02],[1.35,.5,.12],[1.85,.72,.36]],base:.09,tip:.022},lyre:{points:[[.2,.32,-.02],[.55,.65,0],[.85,1.25,.08],[.95,1.85,.25]],base:.16,tip:.04}};function Ny(n,e){let t=Ly[n],i=new Rn(t.points.map(([h,d,f])=>new N(h*e,d,f))),s=16,r=9,o=new Zn(i,s,t.base,r,!1),a=o.attributes.position;for(let h=0;h<=s;h++){let d=h/s,f=i.getPointAt(d),u=(t.base+(t.tip-t.base)*Math.pow(d,.85))/t.base;for(let m=0;m<=r;m++){let g=h*(r+1)+m;a.setXYZ(g,f.x+(a.getX(g)-f.x)*u,f.y+(a.getY(g)-f.y)*u,f.z+(a.getZ(g)-f.z)*u)}}o.computeVertexNormals(),Dt(o,ht.horn);let l=i.getPointAt(1),c=new Re(t.tip*1.05,8,6);return c.translate(l.x,l.y,l.z),Dt(c,ht.hornTip),[o,c]}function Dy(n,e){let t=[],i=n.pattern==="patches"||n.pattern==="roan"||n.pattern==="solid"||n.pattern==="nguni",s=a=>n.pattern==="whiteface"?Dt(a,ht.face):i?Ps(a,e+.37,.5,.25):Dt(a,ht.body),r=new Re(.3,22,16);r.scale(1.2,1.05,1.55),r.translate(0,.06,.12),t.push(s(r));let o=new Bt(.19,.24,6,16);o.rotateX(Math.PI/2),o.translate(0,-.08,.5),t.push(Dt(o,ht.muzzle));for(let a of[-1,1]){let l=new Re(.032,8,6);l.scale(1,.8,1),l.translate(a*.085,-.06,.735),t.push(Dt(l,ht.nose));let c=new Re(.078,12,10);c.translate(a*.31,.1,.22),t.push(Dt(c,ht.dark));let h=new Re(.024,8,6);h.translate(a*.35,.135,.265),t.push(Dt(h,ht.white));let d=new Re(.16,12,8);n.ears==="droop"?(d.scale(1.6,.3,.7),d.translate(a*.2,0,0),d.rotateZ(a*-1.1),d.translate(a*.3,.16,-.05)):(d.scale(1.35,.32,.75),d.translate(a*.14,0,0),d.rotateZ(a*.45),d.translate(a*.3,.2,-.05)),t.push(s(d)),n.horns!=="none"&&t.push(...Ny(n.horns,a))}if(n.shaggy){let a=new Re(.2,14,10);a.scale(1.5,.55,1.05),a.translate(0,.3,.2),t.push(s(a))}return t}function Hy(n,e){let t=n.pattern==="belt"||n.pattern==="backstripe",i=l=>t?Dt(l,ht.body):Ps(l,e+.12,.3,.1),s=new Qe(.115,.095,.47,12);s.translate(0,-.235,0);let r=new Re(.1,10,8);r.translate(0,-.47,0);let o=new Qe(.09,.075,.38,12);o.translate(0,-.66,.012);let a=new Qe(.095,.11,.1,12);return a.translate(0,-Eh+.05,.012),[i(s),i(r),i(o),Dt(a,ht.hoof)]}function Fy(){let n=new Rn([new N(0,0,0),new N(0,-.22,-.1),new N(0,-.5,-.1),new N(0,-.72,-.03)]),e=new Zn(n,10,.036,7,!1);Dt(e,ht.body);let t=new Re(.078,10,8);return t.scale(1,1.5,1),t.translate(0,-.8,-.02),Dt(t,ht.tuft),[e,t]}function la(n){let e=Ef(n,!1);for(let t of n)t.dispose();if(!e)throw new Error("could not merge cow parts");return e}function Mf(n){let e=n.breed,i=Et(n.seed)(),s=new Ge({map:mf(e),roughness:.92,metalness:0}),r=new Pe,o=new Pe;o.scale.setScalar(e.size),r.add(o);let a=[],l=(m,g)=>{let _=new $(m,s);return _.castShadow=g,_.userData.cowID=n.id,a.push(_),_},c=[xf(i),Cy(i),...Iy(n.collar)];if(e.shaggy){let m=xf(i+.5);m.scale(1.05,1.05,1.01),m.translate(0,-xn*.05,0),c.push(m)}e.hump&&c.push(Py(i),Oy(i)),e.dairy&&c.push(...Uy()),o.add(l(la(c),!0));let{tip:h}=xh(),d=new Pe;d.position.copy(h),d.add(l(la(Dy(e,i)),!0)),o.add(d);let f=[];for(let[m,g]of[[-.26,.52],[.26,.52],[-.27,-.56],[.27,-.56]]){let _=new Pe;_.position.set(m,Eh,g),_.add(l(la(Hy(e,i)),!1)),o.add(_),f.push(_)}let u=new Pe;return u.position.set(0,xn+.3,-yr/2-.02),u.add(l(la(Fy()),!1)),o.add(u),{group:r,rig:o,head:d,headRest:h.clone(),legs:f,tail:u,meshes:a,materials:[s]}}function yh(n){for(let e of n.meshes)e.geometry.dispose();for(let e of n.materials)e.dispose()}var By="wolf:",zy=n=>`${By}${n.id}`;function vf(n){return{id:zy(n),name:"Wolf",kind:"wolf",blurb:n.name,body:"#5d6166",patch:"#a8abae",eyes:"#e8c34a",size:.9,ears:"point",legs:"regular",speed:6}}var Sr="kobi",bf=[{id:Sr,name:"Kobi",kind:"farmer",blurb:"The farmer. Walks the fences. Do not click.",body:"#1c1c1c",eyes:"#1d1917",size:1,ears:"up",legs:"regular",speed:1.6},{id:"moon",name:"Moon",kind:"dog",blurb:"Kobi's queen. Blue coat, blue eyes, does NOT want to go on a walk.",body:"#5b5652",eyes:"#a9bcc8",size:.9,ears:"floppy",legs:"regular",speed:3.4,follows:Sr},{id:"bean",name:"Bean",kind:"dog",blurb:"Best dog in the office. Sits like a person. Famous for the bean lean.",body:"#e6d7bd",patch:"#f7f2ea",eyes:"#4a2e1c",size:.76,ears:"up",legs:"regular",speed:3,follows:Sr},{id:"waffles",name:"Waffles",kind:"dog",blurb:"Mallory's prince. Cocker spaniel, 21 pounds, every photo a renaissance painting.",body:"#e2cba0",patch:"#efe0c2",eyes:"#2b1d14",size:.52,ears:"long",legs:"regular",speed:3.6,fluffy:!0},{id:"felix",name:"Felix",kind:"cat",blurb:"Office cat, north corner. Profoundly masculine.",body:"#141414",eyes:"#7bd389",size:.58,ears:"point",legs:"regular",speed:2.8},{id:"haru",name:"Haru",kind:"cat",blurb:"Office cat, south corner. It's her desk now.",body:"#181818",eyes:"#f0c419",size:.52,ears:"point",legs:"regular",speed:3.2}],ua={id:"john-pork",name:"John Pork",kind:"pig",blurb:"John Pork is calling. Do not answer.",body:"#f2b7b0",eyes:"#1d1917",size:1,ears:"up",legs:"regular",speed:0};var da=["Get back to work.","Those PRs won't review themselves.","I'm not paying you to click on me.","Cows to move. Comments to resolve. Chop chop.","Ship it. Then we'll talk.","You've got three unresolved threads and you're poking a farmer?","Queues are lookin' healthy. Your PR isn't."];var fa=5,_i=(()=>{let n=Math.min(...nn.map(o=>o.rect.x0))-fa,e=Math.max(...nn.map(o=>o.rect.x1))+fa,t=Math.min(...nn.map(o=>o.rect.z0))-fa,i=Math.max(...nn.map(o=>o.rect.z1))+fa,s=e-n,r=i-t;return{x0:n,x1:e,z0:t,z1:i,width:s,depth:r,length:2*(s+r)}})(),Cn=n=>(n%_i.length+_i.length)%_i.length;function pa(n,e=0){let{x0:t,x1:i,z0:s,z1:r,width:o,depth:a}=_i,l=Cn(n);return l<o?{x:t+l,z:r+e,heading:Math.atan2(1,0),side:"front"}:(l-=o,l<a?{x:i+e,z:r-l,heading:Math.atan2(0,-1),side:"right"}:(l-=a,l<o?{x:i-l,z:s-e,heading:Math.atan2(-1,0),side:"back"}:(l-=o,{x:t-e,z:s+l,heading:Math.atan2(0,1),side:"left"})))}function Af(n){switch(n){case"front":return Math.atan2(0,-1);case"right":return Math.atan2(-1,0);case"back":return Math.atan2(0,1);default:return Math.atan2(1,0)}}var Os=Math.PI*2,vt=(n,e=.9)=>new Ge({color:n,roughness:e,metalness:0}),Rf=(n,e)=>Cn(e-n+_i.length/2)-_i.length/2;function Gi(n,e,t){let i=(e-n+Math.PI)%Os-Math.PI;return i<-Math.PI&&(i+=Os),n+i*Math.min(1,t)}function $n(n){return n.castShadow=!0,n}function ky(n){let e=new Pe,t=new Pe;t.scale.setScalar(n.size),e.add(t);let i=vt(n.body),s=vt(n.patch??n.body),r=vt("#1d1917",.7),o=n.legs==="short"?.42:.72,a=o+.34,l=$n(new $(new Bt(.42,n.legs==="short"?1.25:1.05,6,14),i));if(l.rotation.x=Math.PI/2,l.position.y=a,n.fluffy&&l.scale.set(1.2,1.2,1),t.add(l),n.fluffy){let p=new $(new Re(.5,12,10),i);p.scale.set(1.05,.7,1.15),p.position.set(0,a-.28,-.05),t.add(p)}if(n.patch){let p=new $(new Re(.3,12,10),s);p.scale.set(1,.85,.6),p.position.set(0,a-.14,.62),t.add(p)}let c=new Pe;c.position.set(0,a+.36,.82),t.add(c);let h=$n(new $(new Re(.38,16,12),i));if(n.fluffy&&h.scale.set(1.15,1.15,1.05),c.add(h),n.fluffy){let p=new $(new Re(.24,10,8),i);p.scale.set(1.1,.7,1),p.position.set(0,.32,-.02),c.add(p)}let d=new $(new at(.34,.26,.36),n.patch?s:i);d.position.set(0,-.1,.38),c.add(d);let f=new $(new Re(.075,8,6),r);f.position.set(0,-.03,.57),c.add(f);for(let p of[-1,1]){let S=new $(new Re(.07,8,6),vt(n.eyes,.4));S.position.set(p*.16,.1,.3),c.add(S);let x=new $(new Re(.19,10,8),i);n.ears==="long"?(x.scale.set(.75,1.7,.55),x.position.set(p*.4,-.12,-.04),x.rotation.z=p*.18):n.ears==="floppy"?(x.scale.set(.55,1,.35),x.position.set(p*.36,-.02,-.02),x.rotation.z=p*.35):(x.scale.set(.5,.95,.35),x.position.set(p*.26,.4,-.06),x.rotation.z=p*-.45,x.rotation.x=-.35),c.add(x)}let u=[];for(let[p,S]of[[-.2,.4],[.2,.4],[-.2,-.42],[.2,-.42]]){let x=new Pe;x.position.set(p,o,S);let E=new $(new Qe(.09,.08,o,8),i);E.position.y=-o/2,x.add(E);let D=new $(new Re(.1,8,6),n.patch?s:i);D.position.set(0,-o+.04,.04),x.add(D),t.add(x),u.push(x)}let m=new Pe;m.position.set(0,a+.22,-.62);let g=n.fluffy?.3:.6,_=new $(new Qe(.04,.06,g,6),i);return _.position.set(0,g*.36,-g*.27),_.rotation.x=-.75,m.add(_),t.add(m),{group:e,rig:t,head:c,legs:u,arms:[],tail:m,brows:[],top:a+.95}}function Gy(n){let e=new Pe,t=new Pe;t.scale.setScalar(n.size),e.add(t);let i=vt(n.body,.85),s=vt("#d98a8a"),r=.55,o=r+.3,a=$n(new $(new Bt(.34,1.05,6,14),i));a.rotation.x=Math.PI/2,a.position.y=o,t.add(a);let l=new Pe;l.position.set(0,o+.3,.74),t.add(l),l.add($n(new $(new Re(.34,16,12),i)));let c=new $(new Re(.16,10,8),i);c.scale.set(1.2,.7,.8),c.position.set(0,-.1,.26),l.add(c);let h=new $(new Re(.04,6,5),s);h.position.set(0,-.05,.38),l.add(h);for(let m of[-1,1]){let g=new $(new Re(.075,10,8),vt(n.eyes,.3));g.position.set(m*.14,.07,.27),l.add(g);let _=new $(new Re(.03,6,5),vt("#111111",.3));_.scale.set(.5,1.4,1),_.position.set(m*.14,.07,.335),l.add(_);let p=new $(new Yt(.13,.3,4),i);p.position.set(m*.19,.36,-.02),p.rotation.z=m*-.35,p.rotation.y=Math.PI/4,l.add(p)}let d=[];for(let[m,g]of[[-.16,.36],[.16,.36],[-.16,-.38],[.16,-.38]]){let _=new Pe;_.position.set(m,r,g);let p=new $(new Qe(.07,.06,r,8),i);p.position.y=-r/2,_.add(p),t.add(_),d.push(_)}let f=new Pe;f.position.set(0,o+.12,-.55);let u=new Rn([new N(0,0,0),new N(0,.3,-.35),new N(0,.75,-.45),new N(0,1,-.25)]);return f.add(new $(new Zn(u,10,.045,6,!1),i)),t.add(f),{group:e,rig:t,head:l,legs:d,arms:[],tail:f,brows:[],top:o+.9}}function Vy(n){let e=new Pe,t=new Pe;t.scale.setScalar(n.size),e.add(t);let i=vt(n.body,.95),s=vt(n.patch??n.body,.95),r=vt("#141414",.6),o=.82,a=o+.36,l=$n(new $(new Bt(.38,1.35,6,14),i));l.rotation.x=Math.PI/2,l.position.y=a,t.add(l);let c=new $(new Bt(.26,1,4,10),s);c.rotation.x=Math.PI/2,c.position.set(0,a-.2,.05),t.add(c);let h=new $(new Re(.44,12,10),i);h.scale.set(1.05,.95,.8),h.position.set(0,a+.08,.62),t.add(h);let d=new Pe;d.position.set(0,a+.34,1),t.add(d),d.add($n(new $(new Re(.33,16,12),i)));let f=new $(new at(.24,.2,.5),i);f.position.set(0,-.08,.42),d.add(f);let u=new $(new at(.2,.1,.42),s);u.position.set(0,-.17,.38),d.add(u);let m=new $(new Re(.06,8,6),r);m.position.set(0,-.02,.68),d.add(m);for(let x of[-1,1]){let E=new $(new Re(.06,8,6),vt(n.eyes,.3));E.position.set(x*.15,.1,.25),d.add(E);let D=new $(new Re(.028,6,5),r);D.position.set(x*.15,.1,.305),d.add(D);let w=new $(new Yt(.12,.34,5),i);w.position.set(x*.18,.36,-.06),w.rotation.z=x*-.3,d.add(w)}let g=[];for(let[x,E]of[[-.2,.5],[.2,.5],[-.2,-.52],[.2,-.52]]){let D=new Pe;D.position.set(x,o,E);let w=new $(new Qe(.085,.07,o,8),i);w.position.y=-o/2,D.add(w);let O=new $(new Re(.09,8,6),r);O.position.set(0,-o+.04,.04),D.add(O),t.add(D),g.push(D)}let _=new Pe;_.position.set(0,a+.12,-.75);let p=new $(new Bt(.1,.55,4,8),i);p.position.set(0,-.28,-.22),p.rotation.x=.7,_.add(p);let S=new $(new Re(.09,8,6),s);return S.position.set(0,-.55,-.42),_.add(S),t.add(_),{group:e,rig:t,head:d,legs:g,arms:[],tail:_,brows:[],top:a+.95}}function Wy(n){let e=new Pe,t=new Pe;e.add(t);let i=vt(n.body),s=vt("#6b4a2d"),r=vt("#111111",.6),o=vt("#e8b892"),a=vt("#d9b660",1),l=vt("#1d1917",.7),c=vt("#8a6238",1),h=vt("#9aa0a6",.4),d=[];for(let y of[-1,1]){let P=new Pe;P.position.set(y*.17,1.02,0);let F=$n(new $(new Qe(.14,.12,1,10),s));F.position.y=-.5,P.add(F);let L=new $(new at(.26,.16,.44),r);L.position.set(0,-.96,.08),P.add(L),t.add(P),d.push(P)}let f=$n(new $(new Bt(.36,.55,6,14),i));f.position.y=1.55,t.add(f);let u=new $(new Re(.3,12,10),i);u.scale.set(1.1,.6,.8),u.position.set(0,1.98,-.16),t.add(u);let m=[];for(let y of[-1,1]){let P=new Pe;P.position.set(y*.46,1.86,0);let F=new $(new Bt(.11,.62,4,10),i);F.position.y=-.42,P.add(F);let L=new $(new Re(.11,8,6),o);if(L.position.y=-.86,P.add(L),y>0){let B=new Pe;B.position.set(.05,-.86,.05);let Z=new $(new Qe(.03,.03,2.1,6),c);Z.position.y=.35,B.add(Z);for(let se of[-.11,0,.11]){let K=new $(new Qe(.014,.008,.36,5),h);K.position.set(se,1.58,0),B.add(K)}let G=new $(new at(.28,.04,.04),h);G.position.y=1.4,B.add(G),P.add(B)}t.add(P),m.push(P)}let g=new Pe;g.position.set(0,2.28,0),t.add(g),g.add($n(new $(new Re(.31,16,12),o)));let _=[];for(let y of[-1,1]){let P=new $(new Re(.045,8,6),l);P.position.set(y*.11,.04,.28),g.add(P);let F=new $(new at(.13,.03,.03),l);F.position.set(y*.11,.14,.28),g.add(F),_.push(F)}let p=new $(new at(.14,.025,.03),l);p.position.set(0,-.12,.29),g.add(p);let S=new $(new vs(.075,.014,6,12,Math.PI),l);S.position.set(0,-.17,.29),S.visible=!1,g.add(S);let x=vt("#161616",.8),E=new $(new Re(.33,16,12,0,Os,0,Math.PI/2),x);E.position.y=.06,g.add(E);let D=new $(new Qe(.335,.335,.06,16),x);D.position.y=.06,g.add(D);let w=new $(new at(.34,.03,.3),x);w.position.set(0,.05,.4),w.rotation.x=.12,g.add(w);let O=new $(new at(.14,.1,.02),vt("#d9d4c7",.7));O.position.set(0,.2,.31),g.add(O);let U=new $(new Re(.12,10,8),l);U.scale.set(1.1,.7,.6),U.position.set(0,-.22,.24),g.add(U);let T=new $(new Re(.29,14,10,0,Os,Math.PI*.62,Math.PI*.2),vt("#3a2f28",.9));return T.position.y=.04,T.scale.set(1.03,1.03,1.03),g.add(T),{group:e,rig:t,head:g,legs:d,arms:m,brows:_,smile:p,frown:S,top:2.85}}function wf(n){let e=new Pe;n.add(e);let t=new Map,i=-1;function s(c,h){let d=Et(En(c.id)),f=c.kind==="dog"?ky(c):c.kind==="cat"?Gy(c):c.kind==="wolf"?Vy(c):Wy(c);f.rig.traverse(g=>{g.userData.critterID=c.id}),e.add(f.group);let u=c.kind==="wolf",m={spec:c,parts:f,s:Cn(_i.length/6*h+d()*8),dir:d()<.5?1:-1,offset:(u?1.8:.6)+d()*(u?1.6:1.4),offsetTarget:0,speed:c.speed,cruise:c.speed,mode:"go",timer:2+d()*6,phase:d()*Os,gait:d()*Os,heading:0,hop:0,grump:0,gap:0,whim:0,chaseUntil:0,x:0,z:0,rand:d};return m.offsetTarget=m.offset,c.kind==="farmer"&&(m.dir=1),t.set(c.id,m),a(m,0),m.heading=pa(m.s).heading+(m.dir>0?0:Math.PI),f.group.position.set(m.x,0,m.z),f.group.rotation.y=m.heading,m}function r(c){let h=t.get(c);h&&(e.remove(h.parts.group),h.parts.group.traverse(d=>{let f=d;f.geometry&&f.geometry.dispose();let u=f.material;if(u)for(let m of Array.isArray(u)?u:[u])m.dispose()}),t.delete(c))}bf.forEach((c,h)=>s(c,h));let o=0;for(let c of t.values()){if(!c.spec.follows)continue;let h=t.get(c.spec.follows);h&&(c.gap=2.6+o*2.2,o++,c.s=Cn(h.s-h.dir*c.gap),c.dir=h.dir,c.offset=h.offset+.8+o*.5,c.offsetTarget=c.offset)}function a(c,h){let d=pa(c.s,c.offset);return c.x=d.x,c.z=d.z,c.dir>0?d.heading:d.heading+Math.PI}function l(c,h,d,f){let{parts:u,spec:m}=c;if(c.timer-=h,c.hop=Math.max(0,c.hop-h*2.2),c.rand()<h*.3&&(c.offsetTarget=m.kind==="wolf"?1.6+c.rand()*2:.5+c.rand()*(m.kind==="farmer"?1:2.2)),c.offset+=(c.offsetTarget-c.offset)*Math.min(1,h*.8),c.mode==="flee"){c.speed=m.speed*2.6,c.s=Cn(c.s+c.dir*c.speed*h),c.offsetTarget=3.5;let S=a(c,h);c.heading=Gi(c.heading,S,h*6),c.gait+=h*16;let x=Math.sin(c.gait)*.8;u.legs[0].rotation.x=x,u.legs[3].rotation.x=x,u.legs[1].rotation.x=-x,u.legs[2].rotation.x=-x,u.rig.position.y=Math.abs(Math.sin(c.gait))*.14,u.tail&&(u.tail.rotation.x=.9);let E=Math.max(0,Math.min(1,c.timer/1.2));u.rig.scale.setScalar(m.size*(.4+.6*E)),u.group.position.set(c.x,0,c.z),u.group.rotation.y=c.heading,c.timer<=0&&r(m.id);return}let g=c.chasing?t.get(c.chasing):void 0;if(c.chasing&&(!g||d>c.chaseUntil)&&(c.chasing=void 0,c.mode="go",c.timer=1),g&&c.chasing){c.mode="chase";let S=Rf(c.s,g.s);c.speed=m.speed*2.6,c.dir=S>=0?1:-1,c.s=Cn(c.s+c.dir*Math.min(Math.abs(S)-1.5>0?c.speed*h:0,Math.abs(S))),c.offset+=(g.offset-c.offset)*Math.min(1,h*2);let x=a(c,h);c.heading=Gi(c.heading,x,h*6),c.gait+=h*14;let E=Math.sin(c.gait)*.75;u.legs[0].rotation.x=E,u.legs[3].rotation.x=E,u.legs[1].rotation.x=-E,u.legs[2].rotation.x=-E,u.rig.position.y=Math.abs(Math.sin(c.gait))*.12,u.head.rotation.x=Math.sin(d*12)*.12,u.tail&&(u.tail.rotation.y=Math.sin(d*22)*.5),u.group.position.set(c.x,0,c.z),u.group.rotation.y=c.heading;return}let _=m.follows?t.get(m.follows):void 0;if(_&&c.mode!=="grumpy"){c.timer<=0&&(c.whim=c.rand()<.3?-(2+c.rand()*4):(c.rand()-.5)*2,c.timer=2+c.rand()*5);let S=Cn(_.s-_.dir*(c.gap+c.whim)),x=Rf(c.s,S),E=Math.abs(x),D=_.mode!=="go";if(E>(D?.6:.35)){c.mode="go";let w=Math.min(m.speed*2.4,.9+E*1.4);c.speed+=(w-c.speed)*Math.min(1,h*3);let O=Math.sign(x)*Math.min(E,c.speed*h);c.s=Cn(c.s+O),c.dir=x>=0?1:-1;let U=a(c,h);c.heading=Gi(c.heading,U,h*5),c.gait+=h*(4+c.speed*2.2);let T=Math.sin(c.gait)*.6;u.legs[0].rotation.x=T,u.legs[3].rotation.x=T,u.legs[1].rotation.x=-T,u.legs[2].rotation.x=-T,u.rig.position.y=Math.abs(Math.sin(c.gait))*(.05+c.speed*.02),u.head.rotation.x=Math.sin(c.gait)*.08,u.head.rotation.y=Math.sin(d*1.3+c.phase)*.2}else{c.mode="rest",c.speed=0,a(c,h);let w=Math.atan2(_.x-c.x,_.z-c.z);c.heading=Gi(c.heading,w,h*3);for(let O of u.legs)O.rotation.x*=1-Math.min(1,h*6);u.rig.position.y+=(0-u.rig.position.y)*Math.min(1,h*6),u.rig.rotation.z=m.id==="bean"?Math.sin(d*.6+c.phase)*.12:0,u.head.rotation.x+=(-.1-u.head.rotation.x)*Math.min(1,h*3),u.head.rotation.y=Math.sin(d*.9+c.phase)*.4}}else if(c.mode==="go"){c.speed+=(c.cruise-c.speed)*Math.min(1,h*1.5),c.s=Cn(c.s+c.dir*c.speed*h);let S=a(c,h);c.heading=Gi(c.heading,S,h*4),c.gait+=h*(m.kind==="farmer"?5.5:4+c.speed*2.2);let x=Math.sin(c.gait)*(m.kind==="farmer"?.45:.6);if(m.kind==="farmer")u.legs[0].rotation.x=x,u.legs[1].rotation.x=-x,u.arms[0].rotation.x=-x*.6,u.arms[1].rotation.x=x*.25,u.rig.position.y=Math.abs(Math.sin(c.gait))*.03,u.head.rotation.y=Math.sin(d*.8+c.phase)*.25;else{u.legs[0].rotation.x=x,u.legs[3].rotation.x=x,u.legs[1].rotation.x=-x,u.legs[2].rotation.x=-x;let E=m.kind==="dog"?.06+c.speed*.02:.03;u.rig.position.y=Math.abs(Math.sin(c.gait))*E,u.head.rotation.x=Math.sin(c.gait)*.08,u.head.rotation.y=Math.sin(d*1.3+c.phase)*.2}if(c.timer<=0){let E=c.rand();m.kind==="farmer"?(c.mode="inspect",c.timer=3+c.rand()*4):E<.35?(c.mode="rest",c.timer=1.5+c.rand()*4):E<.6?(c.cruise=m.speed*(1.8+c.rand()),c.timer=1.5+c.rand()*2):E<.75?(c.dir=c.dir>0?-1:1,c.cruise=m.speed,c.timer=2+c.rand()*5):(c.cruise=m.speed*(.6+c.rand()*.6),c.timer=3+c.rand()*6)}}else{c.speed=0;for(let S of u.legs)S.rotation.x*=1-Math.min(1,h*6);for(let S of u.arms)S.rotation.x*=1-Math.min(1,h*6);if(u.rig.position.y+=(0-u.rig.position.y)*Math.min(1,h*6),c.mode==="inspect"){let S=pa(c.s).side;c.heading=Gi(c.heading,Af(S),h*3),u.head.rotation.y=Math.sin(d*.9+c.phase)*.5}else if(c.mode==="grumpy"){let S=Math.atan2(f.position.x-c.x,f.position.z-c.z);c.heading=Gi(c.heading,S,h*5),u.head.rotation.y=0,u.head.rotation.x=-.08}else m.kind==="wolf"?(u.head.rotation.x+=(-.85-u.head.rotation.x)*Math.min(1,h*4),u.head.rotation.y=0):(u.head.rotation.x+=(m.kind==="cat"?.15:-.1-u.head.rotation.x)*Math.min(1,h*3),u.head.rotation.y=Math.sin(d*.7+c.phase)*.5);c.timer<=0&&(c.mode="go",c.cruise=m.speed,c.timer=(m.kind==="farmer"?8:3)+c.rand()*8,u.head.rotation.x=0)}if(c.grump=c.mode==="grumpy"?Math.min(1,c.grump+h*6):Math.max(0,c.grump-h*3),u.brows.length&&(u.brows[0].rotation.z=-.55*c.grump,u.brows[1].rotation.z=.55*c.grump,u.brows[0].position.y=.14-.05*c.grump,u.brows[1].position.y=.14-.05*c.grump,u.smile&&(u.smile.visible=c.grump<.5),u.frown&&(u.frown.visible=c.grump>=.5),c.mode==="grumpy"?(u.arms[0].rotation.x=-1.3*c.grump,u.arms[1].rotation.x=-1.3*c.grump,u.arms[0].rotation.z=.9*c.grump,u.arms[1].rotation.z=-.9*c.grump):(u.arms[0].rotation.z*=1-Math.min(1,h*6),u.arms[1].rotation.z*=1-Math.min(1,h*6))),u.tail){let S=m.kind==="dog"?Math.sin(d*(c.mode==="go"?16:9)+c.phase)*.55:Math.sin(d*1.8+c.phase)*.35;u.tail.rotation.y=S,m.kind==="cat"&&(u.tail.rotation.x=Math.sin(d*1.1+c.phase)*.15)}let p=Math.sin(Math.min(1,c.hop)*Math.PI)*(m.kind==="farmer"?0:.9);u.group.position.set(c.x,p,c.z),u.group.rotation.y=c.heading}return{root:e,tick(c,h,d){for(let f of t.values())l(f,c,h,d)},setWolves(c){let h=new Map(c.map(u=>[u.id,u])),d=["bean","moon"].map(u=>t.get(u)).filter(u=>!!u&&!u.chasing);for(let[u,m]of t){if(m.spec.kind!=="wolf"||h.has(u)||m.mode==="flee")continue;m.mode="flee",m.timer=5;let g=d.shift();g&&(g.chasing=u,g.chaseUntil=Number.POSITIVE_INFINITY,g.hop=1)}let f=0;for(let u of c)t.has(u.id)||s(u,f),f++},poke(c){let h=t.get(c);if(h){if(h.spec.id===Sr){h.mode="grumpy",h.timer=4.5;let d=Math.floor(h.rand()*da.length);return d===i&&(d=(d+1)%da.length),i=d,da[d]}h.hop=1,h.mode!=="go"&&(h.mode="go",h.timer=3+h.rand()*4),h.cruise=h.spec.speed*2}},position(c){let h=t.get(c);if(h)return{x:h.x,y:h.parts.top*h.spec.size+h.parts.group.position.y,z:h.z}},dispose(){n.remove(e),e.traverse(c=>{let h=c;h.geometry&&h.geometry.dispose();let d=h.material;if(d)for(let f of Array.isArray(d)?d:[d])f.dispose()})}}}var Sh=3.6,Cf=25,Xy=(n,e)=>new Ct({color:n,transparent:!0,opacity:e,depthWrite:!1,blending:zn});function If(n,e,t){let i=new Pe,s=[],r=[["#ff2d12",.55,1],["#ff8a1f",.8,.72],["#ffe066",.95,.42]];for(let a=0;a<9;a++){let l=(t()-.5)*.9*n,c=(t()-.5)*1.6*n,h=e*(.7+t()*.5);for(let[d,f,u]of r){let m=new $(new Yt(.22*n*u,.95*n*u,7),Xy(d,f));m.position.set(l,h,c),i.add(m),s.push({mesh:m,phase:t()*Math.PI*2,base:h})}}let o=new Ge({color:"#5a5652",transparent:!0,opacity:.55,roughness:1,depthWrite:!1});return{group:i,tongues:s,puffs:[],smokeMaterial:o,lastPuff:-1}}function Pf(n,e,t,i,s,r,o){n.group.visible=i>.02;for(let a of n.tongues){let l=.75+.35*Math.sin(e*13+a.phase)+.2*Math.sin(e*29+a.phase*1.7);a.mesh.scale.set(i*(.8+.2*l),i*l,i*(.8+.2*l)),a.mesh.position.y=a.base+Math.sin(e*9+a.phase)*.06*r,a.mesh.rotation.z=Math.sin(e*7+a.phase)*.18,a.mesh.rotation.x=Math.cos(e*6+a.phase)*.14}if(s&&e-n.lastPuff>.28){n.lastPuff=e;let a=new $(new Re(.22*r,8,6),n.smokeMaterial);a.position.set((o()-.5)*.6*r,r*1.3,(o()-.5)*.8*r),n.group.add(a),n.puffs.push({mesh:a,born:e,drift:(o()-.5)*.6})}for(let a of[...n.puffs]){let l=e-a.born;if(l>2.6){n.group.remove(a.mesh),a.mesh.geometry.dispose(),n.puffs.splice(n.puffs.indexOf(a),1);continue}a.mesh.position.y+=t*(1.1+l*.4)*r,a.mesh.position.x+=t*a.drift;let c=1+l*1.1;a.mesh.scale.setScalar(c)}n.smokeMaterial.opacity=.5}function Of(n){for(let e of n.tongues)e.mesh.geometry.dispose(),e.mesh.material.dispose();for(let e of n.puffs)e.mesh.geometry.dispose();n.smokeMaterial.dispose()}function Uf(n,e,t,i){let s=new $(new wn(1.1*t,20),new Ct({color:"#1a1410",transparent:!0,opacity:.55,depthWrite:!1}));return s.rotation.x=-Math.PI/2,s.position.set(n,.025,e),{mesh:s,born:i}}function Lf(n,e){let t=e-n.born,i=n.mesh.material;return i.opacity=.55*Math.max(0,1-t/Cf),t<Cf}function Nf(){let n=new Ge({color:"#f2c9a8",roughness:.85}),e=new Pe,t=new $(new Bt(.95,1.2,6,14),n);t.rotation.x=Math.PI/2,t.scale.set(1.1,.42,1),t.castShadow=!0,e.add(t);let i=new $(new Qe(1.15,1.05,3.2,16),new Ge({color:"#f7f5ef",roughness:.9}));i.position.set(0,1.8,-.6),e.add(i);let s=new $(new Qe(1.25,1.25,.5,16),new Ge({color:"#3b5bdb",roughness:.8}));s.position.set(0,.45,-.6),e.add(s);let r=[];for(let l=0;l<4;l++){let c=new Pe;c.position.set(-.78+l*.52,-.05,1.1);let h=new $(new Bt(.24,1.2,4,10),n);h.rotation.x=Math.PI/2,h.position.z=.7,h.castShadow=!0,c.add(h),e.add(c),r.push(c)}let o=new Pe;o.position.set(1.15,-.05,.1);let a=new $(new Bt(.27,1,4,10),n);return a.rotation.z=-Math.PI/2,a.position.x=.6,a.castShadow=!0,o.add(a),e.add(o),e.scale.setScalar(2.1),e.visible=!1,{group:e,fingers:r,thumb:o}}function Us(n,e){for(let t of n.fingers)t.rotation.x=.25+e*1.05;n.thumb.rotation.z=-.1-e*.9}var ma=7;function Df(){let n=new Pe,e=new Ge({color:"#c9ced6",roughness:.35,metalness:.85}),t=new Ge({color:"#5a6070",roughness:.5,metalness:.7}),i=new $(new Re(3.2,28,10),e);i.scale.set(1,.22,1),i.castShadow=!0,n.add(i);let s=new $(new Qe(1.6,1.1,.5,20),t);s.position.y=-.5,n.add(s);let r=new $(new Re(1.35,20,12,0,Math.PI*2,0,Math.PI/2),new bs({color:"#8fd8ff",roughness:.05,metalness:0,transmission:.6,transparent:!0,opacity:.85,thickness:.5}));r.position.y=.55,n.add(r);let o=new $(new Re(.42,12,10),new Ge({color:"#7fd66b",roughness:.8}));o.scale.set(.8,1.1,.8),o.position.y=.85,n.add(o);for(let h of[-1,1]){let d=new $(new Re(.11,8,6),new Ct({color:"#111111"}));d.scale.set(.7,1.4,.6),d.position.set(h*.16,1.02,.34),n.add(d)}let a=[];for(let h=0;h<12;h++){let d=h/12*Math.PI*2,f=new $(new Re(.16,8,6),new Ct({color:"#ffd166"}));f.position.set(Math.cos(d)*2.55,-.18,Math.sin(d)*2.55),n.add(f),a.push(f)}let l=new Ct({color:"#9ef7c8",transparent:!0,opacity:0,depthWrite:!1,side:Ft,blending:zn}),c=new $(new Yt(2.4,1,24,1,!0),l);return c.geometry.translate(0,-.5,0),c.position.y=-.7,n.add(c),n.visible=!1,{group:n,beam:c,beamMaterial:l,lights:a,disc:i,hover:ma}}function Hf(n,e,t,i){n.group.rotation.y=e*.6,n.lights.forEach((s,r)=>{let o=(Math.sin(e*6-r*.55)+1)/2;s.material.color.setHSL(.13,1,.45+o*.35)}),n.beam.scale.set(1,Math.max(.01,t),1),n.beamMaterial.opacity=.32*i*(.85+.15*Math.sin(e*9)),n.beam.visible=i>.01,n.beam.rotation.y=-n.group.rotation.y}var Ff={name:"San Francisco",lat:37.7749,lon:-122.4194,timeZone:"America/Los_Angeles"},sn=Math.PI/180;function Vf(n,e=Ff.lat,t=Ff.lon){let i=n.getTime(),r=(i/864e5+24405875e-1-2451545)/36525,o=(280.46646+r*(36000.76983+r*3032e-7))%360,l=(357.52911+r*(35999.05029-1537e-7*r))*sn,c=Math.sin(l)*(1.914602-r*(.004817+14e-6*r))+Math.sin(2*l)*(.019993-101e-6*r)+Math.sin(3*l)*289e-6,h=o+c,d=125.04-1934.136*r,f=h-.00569-.00478*Math.sin(d*sn),m=23+(26+(21.448-r*(46.815+r*(59e-5-r*.001813)))/60)/60+.00256*Math.cos(d*sn),g=Math.asin(Math.sin(m*sn)*Math.sin(f*sn)),_=Math.tan(m/2*sn)**2,p=.016708634-r*(42037e-9+1267e-10*r),S=4*(180/Math.PI)*(_*Math.sin(2*o*sn)-2*p*Math.sin(l)+4*p*_*Math.sin(l)*Math.cos(2*o*sn)-.5*_*_*Math.sin(4*o*sn)-1.25*p*p*Math.sin(2*l)),D=((i%864e5/6e4+S+4*t)%1440+1440)%1440/4-180;D<-180&&(D+=360);let w=e*sn,O=D*sn,U=Math.sin(w)*Math.sin(g)+Math.cos(w)*Math.cos(g)*Math.cos(O),T=Math.acos(Math.max(-1,Math.min(1,U))),y,P=Math.cos(w)*Math.sin(T);if(Math.abs(P)<1e-9)y=180;else{let F=(Math.sin(w)*Math.cos(T)-Math.sin(g))/P;y=Math.acos(Math.max(-1,Math.min(1,F)))/sn,y=D>0?(y+180)%360:(540-y)%360}return{altitude:90-T/sn,azimuth:y}}var Tr=(n,e,t)=>[n[0]+(e[0]-n[0])*t,n[1]+(e[1]-n[1])*t,n[2]+(e[2]-n[2])*t],gi=([n,e,t])=>`#${[n,e,t].map(i=>Math.round(Math.max(0,Math.min(255,i))).toString(16).padStart(2,"0")).join("")}`,Bf=[11,18,42],zf=[58,63,122],kf=[243,168,106],Yy=[169,216,245],Gf=[24,30,58],Th=[255,196,136],qy=[191,224,245];function Wf(n){let e=i=>Math.max(0,Math.min(1,i));if(n<=-12)return{sky:gi(Bf),horizon:gi(Gf),sunColor:"#9fb4ff",sunIntensity:.12,ambient:.12,stars:1};if(n<=0){let i=e((n+12)/12);return{sky:gi(Tr(Bf,zf,i)),horizon:gi(Tr(Gf,Th,i*.8)),sunColor:"#ff9a5c",sunIntensity:.12+.5*i,ambient:.12+.18*i,stars:1-i}}if(n<=10){let i=e(n/10);return{sky:gi(Tr(zf,kf,i)),horizon:gi(Th),sunColor:"#ffb070",sunIntensity:.6+1*i,ambient:.3+.25*i,stars:0}}let t=e((n-10)/30);return{sky:gi(Tr(kf,Yy,t)),horizon:gi(Tr(Th,qy,t)),sunColor:t<1?"#ffe0b8":"#fff4dc",sunIntensity:1.6+.6*t,ambient:.55+.4*t,stars:0}}var Ky=210;function Xf(n,e,t=Ky){let i=n*Math.PI/180,s=e*Math.PI/180;return new N(Math.sin(s)*Math.cos(i)*t,Math.sin(i)*t,-Math.cos(s)*Math.cos(i)*t)}function Zy(n){let t=new Float32Array(7800),i=new Float32Array(2600),s=Et(131);for(let l=0;l<2600;l++)t.set([(s()-.5)*140,s()*40,(s()-.5)*100+4],l*3),i[l]=.7+s()*.6;let r=new gt;r.setAttribute("position",new bt(t,3));let o=new qn({color:"#cfe3ff",size:.35,sizeAttenuation:!0,transparent:!0,opacity:0,depthWrite:!1}),a=new pi(r,o);return a.frustumCulled=!1,a.visible=!1,n.add(a),{points:a,velocities:i,material:o,kind:"none"}}function Yf(n){let{scene:e,sun:t,moon:i,light:s,hemisphere:r,ambient:o,stars:a,clouds:l,cloudMaterial:c}=n,h=Zy(e),d=e.fog,f=e.background,u={altitude:45,azimuth:180,weather:null},m=1,g=0,_=0,p=()=>{let S=Wf(u.altitude),x=u.weather,E=x?.cloudCover??.15,D=x?Math.max(E*.55,x.precipitation!=="none"?.6:0,x.fog?.5:0):0,w=new De(S.sky),O=new De(S.horizon),U=new De(u.altitude>0?"#8b949c":"#151a26");w.lerp(U,D),O.lerp(U,D*.8),f.copy(w),d.color.copy(O),d.near=x?.fog?30:130,d.far=x?.fog?120:280;let T=Xf(u.altitude,u.azimuth);t.position.copy(T),t.visible=u.altitude>-3,t.material.color.set(u.altitude<8?"#ffb86b":"#fff1a8");let y=Xf(Math.max(15,-u.altitude),(u.azimuth+180)%360);i.position.copy(y),i.visible=u.altitude<2;let P=u.altitude>-2?T:y;s.position.copy(P.clone().normalize().multiplyScalar(90)),s.position.y=Math.max(s.position.y,12),s.color.set(S.sunColor),s.intensity=S.sunIntensity*(1-D*.7),r.intensity=S.ambient*(1-D*.3),r.color.copy(w).lerp(new De("#ffffff"),.3),o.intensity=.12+S.ambient*.18,a.material.opacity=S.stars*(1-E);let F=Math.round(2+E*(l.length-2));l.forEach((Z,G)=>{Z.visible=G<F});let L=new De(u.altitude>0?"#ffffff":"#3a3f52").lerp(new De(u.altitude>0?"#8e959e":"#22262f"),D);c.color.copy(L),c.emissive.copy(L),c.emissiveIntensity=u.altitude>0?.3*(1-D):.05;let B=x?.precipitation??"none";_=B==="none"?0:Math.min(1,.35+(x?.intensity??0)*.5),h.kind=B,h.material.color.set(B==="snow"?"#ffffff":"#cfe3ff"),h.material.size=B==="snow"?.55:.35,m=.5+(x?.windKph??0)/20};return{set(S){u=S,p()},tick(S,x){if(g+=(_-g)*Math.min(1,x*.8),h.points.visible=g>.01,h.material.opacity=.75*g,!h.points.visible)return;let E=h.points.geometry.attributes.position,D=h.kind==="snow"?4:42,w=h.kind==="snow"?1.6:.4;for(let O=0;O<E.count;O++){let U=E.getY(O)-D*h.velocities[O]*x,T=E.getX(O)+Math.sin(S*1.3+O)*w*x+m*x*(h.kind==="snow"?.6:2);U<0&&(U=38+Math.random()*4,T=(Math.random()-.5)*140),T>72&&(T=-72),E.setXY(O,T,U)}E.needsUpdate=!0},dispose(){h.points.geometry.dispose(),h.material.dispose()}}}function qf(n){let e=new Pe,t=Et(415),i=new $(new Xn(700,90),new Ge({color:"#3b7fb5",roughness:.25,metalness:.1}));i.rotation.x=-Math.PI/2,i.position.set(0,.05,-200),e.add(i);let s=new Ge({color:"#6b8a5c",roughness:1});for(let[U,T,y,P]of[[-260,-290,220,40],[-60,-300,260,34],[170,-295,240,44],[-200,-250,80,22]]){let F=new $(new Re(1,20,12),s);F.scale.set(y/2,P,y/3),F.position.set(U,-2,T),e.add(F)}let r=new Ge({color:"#8fa6bb",roughness:.4,metalness:.5}),o=new Ge({color:"#c9c4b8",roughness:.9}),a=new Ge({color:"#e8e4dc",roughness:.9}),l=new Pe;for(let U=0;U<34;U++){let T=5+t()*9,y=10+t()*30,P=new $(new at(T,y,T),t()<.5?r:o);P.position.set((t()-.5)*150,y/2,(t()-.5)*40),l.add(P)}let c=new $(new Qe(4.6,6,78,18),r);c.position.set(12,39,-6),l.add(c);let h=new $(new Qe(3.6,4.6,6,18),new Ge({color:"#dfe8f0",roughness:.3,emissive:"#9fc7ff",emissiveIntensity:.25}));h.position.set(12,81,-6),l.add(h);let d=new $(new Yt(7,62,4),a);d.rotation.y=Math.PI/4,d.position.set(-22,31,4),l.add(d);let f=new $(new Qe(.4,.9,12,6),a);f.position.set(-22,66,4),l.add(f);let u=new $(new Re(16,16,10),s);u.scale.set(1.6,.55,1.2),u.position.set(-62,0,8),l.add(u);let m=new $(new Qe(2.2,2.6,22,14),a);m.position.set(-62,19,8),l.add(m),l.position.set(70,0,-262),e.add(l);let g=new $(new Re(40,18,12),s);g.scale.set(1.5,.45,1),g.position.set(-30,-4,-270),e.add(g);let _=new Ge({color:"#d9d4cb",roughness:.6});for(let U of[-5,0,5]){let T=new $(new Qe(.5,1,50,6),_);T.position.set(-30+U,39,-270),e.add(T)}for(let U of[40,52,62]){let T=new $(new at(14,.8,.8),_);T.position.set(-30,U,-270),e.add(T)}let p=new Ge({color:"#c0472b",roughness:.7}),S=new Pe,x=150,E=16,D=62,w=new $(new at(x+60,1.6,8),p);w.position.y=E,S.add(w);for(let U of[-x/2,x/2]){for(let T of[-3,3]){let y=new $(new at(3,D,2.4),p);y.position.set(U,D/2,T),S.add(y)}for(let T of[E+14,E+30,D-4]){let y=new $(new at(3.4,2.6,8.4),p);y.position.set(U,T,0),S.add(y)}}let O=(U,T,y,P,F)=>{let L=[];for(let B=0;B<=24;B++){let Z=B/24,G=U+(T-U)*Z,se=y+(P-y)*Z-Math.sin(Z*Math.PI)*F;L.push(new N(G,se,0))}return L};for(let U of[-3.6,3.6])for(let[T,y,P,F,L]of[[-x/2,x/2,D,D,D-E-4],[-x/2-30,-x/2,E+2,D,0],[x/2,x/2+30,D,E+2,0]]){let B=new $(new Zn(new Rn(O(T,y,P,F,L)),32,.45,5,!1),p);B.position.z=U,S.add(B);for(let Z=1;Z<24;Z+=2){let G=O(T,y,P,F,L)[Z];if(G.y-E<2)continue;let se=new $(new Qe(.16,.16,G.y-E,4),p);se.position.set(G.x,E+(G.y-E)/2,U),S.add(se)}}return S.position.set(-150,0,-235),S.rotation.y=.35,e.add(S),e.traverse(U=>{let T=U;T.isMesh&&(T.castShadow=!1,T.receiveShadow=!1)}),n.add(e),e}var ln=4.6,Jn=4.4,Mr=["#ff4fd8","#4fe3ff","#ffe14f","#7dff5a","#ff7a4f","#b14fff"];function $y(){let n=document.createElement("canvas");n.width=128,n.height=64;let e=n.getContext("2d"),t=Et(88);e.fillStyle="#1a1c22",e.fillRect(0,0,128,64);for(let s=0;s<64;s+=4)for(let r=0;r<128;r+=4)e.fillStyle=`hsl(${205+t()*30}, 18%, ${50+t()*45}%)`,e.fillRect(r,s,3.3,3.3);let i=new Kn(n);return i.colorSpace=At,i}function Kf(n){let{barn:e,width:t,depth:i,wall:s,dark:r,trim:o}=n,a=Et(2026),l=[];for(let L of[-1,1]){let B=new Pe;B.position.set(L*ln/2,0,i/2+.1);let Z=new $(new at(ln/2,Jn,.16),r);Z.position.set(-L*ln/4,Jn/2,0),Z.castShadow=!0,B.add(Z);let G=new $(new at(Math.hypot(ln/2,Jn)-.6,.28,.1),o);G.position.set(-L*ln/4,Jn/2,.13),G.rotation.z=-L*Math.atan2(Jn,ln/2),B.add(G),e.add(B),l.push(B)}let c=new Pe;c.visible=!1,e.add(c);let h=new N(0,s-1.1,-.4),d=new $(new Qe(.03,.03,1,6),new Ge({color:"#8a8a8a"}));d.position.set(h.x,h.y+1.05,h.z),c.add(d);let f=$y(),u=new $(new Re(.62,24,16),new Ge({map:f,metalness:.9,roughness:.3,emissive:"#ffffff",emissiveMap:f,emissiveIntensity:.4}));u.position.copy(h),c.add(u);let m=new Pe;m.position.copy(h),c.add(m);let g=[];Mr.slice(0,5).forEach((L,B)=>{let Z=new Yt(1.4,6,18,1,!0);Z.translate(0,-3,0);let G=new Ct({color:L,transparent:!0,opacity:.2,depthWrite:!1,side:Ft,blending:zn}),se=new $(Z,G);se.rotation.x=.55+B%2*.25;let K=new Pe;K.rotation.y=B/5*Math.PI*2,K.add(se),m.add(K),g.push(G)});let _=new Ko("#ffffff",0,40,2);_.position.copy(h),c.add(_);let p=280,S=new Float32Array(p*3),x=new Float32Array(p*3),E=[],D=new Float32Array(p),w=0;for(;w<p;){let L=(a()-.5)*(t-1),B=-i/2+.5+a()*(i+9);if(B>i/2&&Math.abs(L)>ln/2+(B-i/2)*.55)continue;S.set([L,.09,B],w*3);let G=new De(Mr[Math.floor(a()*Mr.length)]);E.push(G),x.set([G.r,G.g,G.b],w*3),D[w]=a()*Math.PI*2,w++}let O=new gt;O.setAttribute("position",new bt(S,3));let U=new bt(x,3);O.setAttribute("color",U);let T=new pi(O,new qn({size:.42,vertexColors:!0,transparent:!0,opacity:.85,depthWrite:!1,blending:zn,sizeAttenuation:!0}));c.add(T);let y=[];for(let L=0;L<=14;L++){let B=new De(Mr[L%Mr.length]),Z=new Ct({color:B}),G=new $(new Re(.15,8,6),Z);G.position.set(-7+L,s+.25-Math.abs(Math.sin(L*.9))*.22,i/2+.45),c.add(G),y.push({material:Z,base:B})}let P=0,F=0;return{set(L){P=L?1:0,L&&(c.visible=!0)},on:()=>P===1,tick(L,B){F+=(P-F)*Math.min(1,B*1.6),P===0&&F<.01&&(F=0,c.visible=!1);let Z=F*F*(3-2*F);if(l[0].rotation.y=-Z*1.9,l[1].rotation.y=Z*1.9,!!c.visible){u.rotation.y=L*.9,m.rotation.y=L*.55,_.intensity=140*Z,_.color.setHSL(L*.1%1,.9,.6),g.forEach((G,se)=>{G.opacity=Z*(.14+.1*(.5+.5*Math.sin(L*3+se)))}),T.material.opacity=.9*Z;for(let G=0;G<p;G++){let se=.25+.75*(.5+.5*Math.sin(L*4+D[G]));U.setXYZ(G,E[G].r*se,E[G].g*se,E[G].b*se)}U.needsUpdate=!0,y.forEach(({material:G,base:se},K)=>{G.color.copy(se).multiplyScalar(.3+.7*(.5+.5*Math.sin(L*5-K*.7)))})}}}}var Vi=Math.PI*2,St={x:-30,z:-19,rx:6,rz:4};function Ls(n,e,t=1.5){let i=(n-St.x)/(St.rx+t),s=(e-St.z)/(St.rz+t);return i*i+s*s<1}function Jy(n){let e=new $(new Xn(360,360),new Ge({map:_f(),roughness:1,metalness:0}));e.rotation.x=-Math.PI/2,e.receiveShadow=!0,n.add(e)}function jy(){let i=new De("#5aa848"),s=new De("#b6ec98"),r=[],o=[],a=[],l=[],c=[];for(let d=0;d<=4;d++){let f=d/4,u=.07*(1-f)/2+.003,m=f*f*.14,g=i.clone().lerp(s,f);for(let _ of[-u,u])r.push(_,f*.55,m),o.push(g.r,g.g,g.b),a.push(0,1,0),l.push(_>0?1:0,f)}for(let d=0;d<4;d++){let f=d*2;c.push(f,f+1,f+2,f+1,f+3,f+2)}let h=new gt;return h.setAttribute("position",new $e(r,3)),h.setAttribute("color",new $e(o,3)),h.setAttribute("normal",new $e(a,3)),h.setAttribute("uv",new $e(l,2)),h.setIndex(c),h}function Qy(n,e){let t=new Ge({vertexColors:!0,side:Ft,roughness:1});t.onBeforeCompile=f=>{f.uniforms.uTime=e.uTime,f.vertexShader=f.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;`).replace("#include <begin_vertex>",`#include <begin_vertex>
        float bladeT = position.y / 0.55;
        float sway = sin(uTime * 1.6 + instanceMatrix[3][0] * 0.35 + instanceMatrix[3][2] * 0.27) * 0.6 + sin(uTime * 2.9 + instanceMatrix[3][2] * 0.7 + instanceMatrix[3][0] * 0.11) * 0.3;
        transformed.x += sway * 0.13 * bladeT * bladeT;`)};let i=9e3,s=new Yn(jy(),t,i),r=Et(11),o=new ot,a=new N,l=new Nt,c=new N,h=new N(0,1,0),d=0;for(;d<i;){let f=(r()-.5)*124,u=(r()-.5)*86;if(Ls(f,u,.5))continue;a.set(f,0,u),l.setFromAxisAngle(h,r()*Vi);let m=.7+r()*.9;c.set(m,m*(.8+r()*.6),m),o.compose(a,l,c),s.setMatrixAt(d,o),d++}s.receiveShadow=!0,s.frustumCulled=!1,n.add(s)}function eS(n){let e=new Re(.085,7,6),t=new Ge({roughness:.8}),i=700,s=new Yn(e,t,i),r=Et(23),o=["#ff7eb6","#ffd166","#ffffff","#c58cff","#ff9f66","#fff4a8"].map(c=>new De(c)),a=new ot,l=0;for(;l<i;){let c=(r()-.5)*120,h=(r()-.5)*82,d=o[Math.floor(r()*o.length)],f=2+Math.floor(r()*5);for(let u=0;u<f&&l<i;u++){let m=c+(r()-.5)*2.4,g=h+(r()-.5)*2.4;Ls(m,g,.5)||(a.makeTranslation(m,.2+r()*.15,g),s.setMatrixAt(l,a),s.setColorAt(l,d),l++)}}n.add(s)}function tS(n){let e=new $(new wn(1,48),new Ge({color:"#d3c19a",roughness:1}));e.rotation.x=-Math.PI/2,e.position.set(St.x,.015,St.z),e.scale.set(St.rx+1,St.rz+1,1),n.add(e);let t=new $(new wn(1,48),new bs({color:"#3f9fda",roughness:.08,metalness:.05,clearcoat:1,clearcoatRoughness:.1}));t.rotation.x=-Math.PI/2,t.position.set(St.x,.03,St.z),t.scale.set(St.rx,St.rz,1),n.add(t);let i=new Ge({color:"#3f9a3a",roughness:.9}),s=Et(61);for(let r=0;r<5;r++){let o=new $(new wn(.42+s()*.25,18,.3,Vi-.6),i);o.rotation.x=-Math.PI/2,o.rotation.z=s()*Vi;let a=s()*Vi,l=.35+s()*.45;o.position.set(St.x+Math.cos(a)*St.rx*l,.045,St.z+Math.sin(a)*St.rz*l),n.add(o)}}function nS(n){let e=new Ge({color:"#6f4a2c",roughness:1}),t=["#3e8f3a","#4ca046","#2f7a2e","#5aae4f"].map(r=>new Ge({color:r,roughness:.9})),i=Et(31),s=[[-57,-28],[-56,0],[-57,18],[56,-24],[57,6],[56,20],[-40,-44],[-18,-46],[0,-44],[48,-42],[-52,-40],[60,-36],[34,-46]];for(let[r,o]of s){let a=new Pe,l=2.6+i()*1.8,c=new $(new Qe(.22,.42,l,9),e);c.position.y=l/2,c.castShadow=!0,a.add(c);let h=4+Math.floor(i()*3);for(let d=0;d<h;d++){let f=1.5+i()*1.5,u=new $(new Vo(f,2),t[Math.floor(i()*t.length)]),m=i()*Vi,g=d===0?0:.9+i()*1.2;u.position.set(Math.cos(m)*g,l+f*.55+(d===0?.8:i()*1.2),Math.sin(m)*g),u.castShadow=!0,a.add(u)}a.position.set(r,0,o),a.rotation.y=i()*Vi,n.add(a)}}function iS(n){let e=new Ge({color:"#9a9a92",roughness:1}),t=Et(41),i=[[-12,-8],[30,-26],[8,-28],[-40,-4],[40,-12],[-2,-16],[20,-6]];for(let[s,r]of i){let o=new $(new ko(.5+t()*.7,1),e);o.position.set(s,.2,r),o.scale.set(1+t()*.6,.6+t()*.4,1+t()*.6),o.rotation.set(t(),t(),t()),o.castShadow=!0,o.receiveShadow=!0,n.add(o)}}function sS(n){let e=new Ge({color:"#9c6f3a",roughness:.95}),t=3,i=[],s=[],r=new N(0,1,0);for(let l of nn){let{x0:c,x1:h,z0:d,z1:f}=l.rect,u=[{from:[c,d],to:[h,d]},{from:[c,f],to:[h,f]},{from:[c,d],to:[c,f]},{from:[h,d],to:[h,f]}];for(let m of u){let g=m.to[0]-m.from[0],_=m.to[1]-m.from[1],p=Math.hypot(g,_),S=Math.max(1,Math.round(p/t)),x=p/S,E=Math.atan2(_,g),D=new Nt().setFromAxisAngle(r,-E);for(let w=0;w<=S;w++){let O=w/S;if(i.push(new ot().makeTranslation(m.from[0]+g*O,.57,m.from[1]+_*O)),w===S)continue;let U=m.from[0]+g*(O+.5/S),T=m.from[1]+_*(O+.5/S);for(let y of[.45,.85])s.push(new ot().compose(new N(U,y,T),D,new N(x/t,1,1)))}}}let o=new Yn(new at(.2,1.15,.2),e,i.length);i.forEach((l,c)=>o.setMatrixAt(c,l));let a=new Yn(new at(t,.09,.07),e,s.length);s.forEach((l,c)=>a.setMatrixAt(c,l)),o.castShadow=!0,a.castShadow=!0,n.add(o,a)}function rS(n){let e=new Map,t=new Ge({color:"#8a6238",roughness:1});for(let i of nn){let s=document.createElement("canvas");s.width=512,s.height=176;let r=new Kn(s);r.colorSpace=At;let o={canvas:s,texture:r,name:i.name,count:0};xr(o);let a=new Pe,l=new $(new at(6.4,2.2,.18),[t,t,t,t,new Ge({map:r,roughness:.9}),t]);l.position.y=2.6,l.castShadow=!0,a.add(l);for(let c of[-2.6,2.6]){let h=new $(new at(.22,2.4,.22),t);h.position.set(c,1.2,-.12),a.add(h)}a.position.set(i.rect.x0+3.9,0,i.rect.z1+1.35),n.add(a),e.set(i.id,o)}return e}function oS(n){let e=new Ge({color:"#ffffff",roughness:1,emissive:"#ffffff",emissiveIntensity:.3}),t=Et(53),i=[];for(let s=0;s<14;s++){let r=new Pe,o=4+Math.floor(t()*4);for(let a=0;a<o;a++){let l=1.8+t()*2.2,c=new $(new Re(l,16,12),e);c.position.set(a*2.4-o,t()*.8,(t()-.5)*2.2),c.scale.y=.72,r.add(c)}r.position.set((t()-.5)*200,26+t()*12,-40-t()*80),r.userData.speed=.35+t()*.5,n.add(r),i.push(r)}return{clouds:i,material:e}}function aS(n){n.background=new De("#a9d8f5"),n.fog=new Oo("#bfe0f5",130,280);let e=new $(new Re(7,20,20),new Ct({color:"#fff1a8",fog:!1}));e.position.set(90,80,-120),n.add(e);let t=new $(new Re(5,20,20),new Ct({color:"#e8ecf5",fog:!1}));t.visible=!1,n.add(t);let i=new Yo("#cfe9ff","#4f8a3a",.95);n.add(i);let s=new Zo("#fff4dc",2.2);s.position.set(40,60,30),s.castShadow=!0,s.shadow.mapSize.set(2048,2048),s.shadow.camera.left=-75,s.shadow.camera.right=75,s.shadow.camera.top=75,s.shadow.camera.bottom=-75,s.shadow.camera.near=5,s.shadow.camera.far=200,s.shadow.bias=-8e-4,s.shadow.normalBias=.02,n.add(s);let r=new $o("#ffffff",.22);return n.add(r),{sun:e,moon:t,light:s,hemisphere:i,ambient:r}}function cS(n){let e=new Ge({color:"#a83a2e",roughness:.9}),t=new Ge({color:"#f2ede4",roughness:.9}),i=new Ge({color:"#4a3630",roughness:.95}),s=new Ge({color:"#3a2320",roughness:1}),r=new Pe,o=15,a=10,l=6,c=new Ge({color:"#5a3a28",roughness:1}),h=.4,d=(L,B,Z,G,se,K,ge)=>{let pe=[e,e,e,e,e,e];pe[ge]=c;let Se=new $(new at(L,B,Z),pe);Se.position.set(G,se,K),Se.castShadow=!0,Se.receiveShadow=!0,r.add(Se)};d(h,l,a,-o/2+h/2,l/2,0,0),d(h,l,a,o/2-h/2,l/2,0,1),d(o,l,h,0,l/2,-a/2+h/2,4);let f=(o-ln)/2;d(f,l,h,-(ln/2+f/2),l/2,a/2-h/2,5),d(f,l,h,ln/2+f/2,l/2,a/2-h/2,5),d(ln,l-Jn,h,0,Jn+(l-Jn)/2,a/2-h/2,5);let u=new $(new Xn(o-h,a-h),c);u.rotation.x=-Math.PI/2,u.position.y=.04,u.receiveShadow=!0,r.add(u);let m=new dr;m.moveTo(-o/2,l),m.lineTo(o/2,l),m.lineTo(0,l+4.2),m.closePath();let g=new $(new Go(m,{depth:a,bevelEnabled:!1}),e);g.position.z=-a/2,g.castShadow=!0,r.add(g);let _=Math.atan2(4.2,o/2),p=Math.hypot(4.2,o/2)+.6;for(let L of[-1,1]){let B=new $(new at(p,.28,a+1),i);B.position.set(L*o/4,l+2.15,0),B.rotation.z=-L*_,B.castShadow=!0,r.add(B)}let S=Kf({barn:r,width:o,depth:a,wall:l,dark:s,trim:t}),x=new $(new at(5,.3,.14),t);x.position.set(0,4.5,a/2+.2),r.add(x);let E=new $(new at(1.6,1.6,.2),t);E.position.set(0,l+1.6,a/2+.05),r.add(E);let D=new $(new at(1.2,1.2,.22),s);D.position.set(0,l+1.6,a/2+.06),r.add(D);let w=new Pe,O=new Ge({color:ua.body,roughness:.85}),U=new $(new Re(.42,16,12),O);U.scale.set(1.15,1,.95),w.add(U);let T=new $(new Qe(.2,.17,.22,12),new Ge({color:"#e69a94",roughness:.8}));T.rotation.x=Math.PI/2,T.position.set(0,-.08,.42),w.add(T);for(let L of[-1,1]){let B=new $(new Re(.04,6,5),new Ge({color:"#7a3a3a"}));B.position.set(L*.07,-.08,.53),w.add(B);let Z=new $(new Re(.06,8,6),new Ge({color:ua.eyes,roughness:.4}));Z.position.set(L*.17,.08,.36),w.add(Z);let G=new $(new Yt(.14,.3,4),O);G.position.set(L*.3,.42,0),G.rotation.z=L*-.5,w.add(G)}let y=new $(new Qe(.42,.5,.5,12),new Ge({color:"#2b2b2b",roughness:.9}));y.position.y=-.6,w.add(y),w.traverse(L=>{L.userData.critterID=ua.id}),w.position.set(0,l+1.6-1.7,a/2-.4),r.add(w);for(let L of[-1,1]){let B=new $(new at(.35,l,.35),t);B.position.set(L*o/2,l/2,a/2),r.add(B)}return r.position.set(20,0,-48),r.rotation.y=-.12,n.add(r),{pork:w,party:S,windowY:l+1.6,hiddenY:l+1.6-1.7};let P=new Ge({color:"#d9b45e",roughness:1}),F=new Qe(1,1,1.7,18);F.rotateZ(Math.PI/2);for(let[L,B,Z,G]of[[7,1,-42,.2],[4.6,1,-42.6,-.3],[5.8,2.7,-42.3,0],[36,1,-44,1.2]]){let se=new $(F,P);se.position.set(L,B,Z),se.rotation.y=G,se.castShadow=!0,n.add(se)}}function Zf(n){let e={uTime:{value:0}},t=aS(n);Jy(n),Qy(n,e),eS(n),tS(n),nS(n),iS(n),sS(n);let i=cS(n);qf(n);let s=rS(n),r=Et(777),o=90+r()*120,a=-1,l=m=>{if(a<0){if(m<o)return;a=m}let g=m-a,_=g<1?g:g<6?1:g<7?7-g:-1;if(_<0){a=-1,o=m+240+r()*360,i.pork.position.y=i.hiddenY;return}let p=_*_*(3-2*_);i.pork.position.y=i.hiddenY+(i.windowY-i.hiddenY)*p,i.pork.rotation.y=g>1&&g<6?Math.sin((g-1)*1.6)*.45:0},c=new N,{clouds:h,material:d}=oS(n),f=lS(n),u=Yf({scene:n,...t,stars:f,clouds:h,cloudMaterial:d});return{signs:s,clouds:h,sky:u,porkPosition(){return i.pork.getWorldPosition(c).clone().add(new N(0,.7,0))},party:i.party,tick(m,g){e.uTime.value=m,u.tick(m,g),l(m),i.party.tick(m,g)}}}function lS(n){let e=Et(97),t=900,i=new Float32Array(t*3);for(let a=0;a<t;a++){let l=(5+e()*80)*Math.PI/180,c=e()*Vi;i.set([Math.sin(c)*Math.cos(l)*320,Math.sin(l)*320,-Math.cos(c)*Math.cos(l)*320],a*3)}let s=new gt;s.setAttribute("position",new bt(i,3));let r=new qn({color:"#ffffff",size:1.6,sizeAttenuation:!0,transparent:!0,opacity:0,depthWrite:!1,fog:!1}),o=new pi(s,r);return o.frustumCulled=!1,n.add(o),o}var yn=(n,e,t,i,s,r)=>({position:new N(n,e,t),target:new N(i,s,r)}),$f=45,Jf=5;function vr(n,e){let t=cf(n),{rect:i}=nn.find(h=>h.id===n),s=n==="merged",r=s?46:26,o=s?26:15,a=e*.55,l=e*-.35,c=i.z1+(s?8:4);return{hold:s?26:20,from:yn(t.x+Math.sin(a)*r,o,c+Math.cos(a)*r*.8,t.x,1,t.z),to:yn(t.x+Math.sin(l)*r*.85,o*.85,c+Math.cos(l)*r*.7,t.x,1,t.z-2)}}function hS(){return[{hold:28,from:yn(-30,44,88,0,1,0),to:yn(30,40,84,0,1,-4)},vr("draft",1),vr("awaiting",-1),{hold:30,from:yn(-58,6,40,-20,2,10),to:yn(58,7,40,20,2,10)},vr("changes",1),vr("ready",-1),vr("merged",1),{hold:24,from:yn(-20,14,-2,20,5,-48),to:yn(30,18,8,20,5,-48)},{hold:26,from:yn(60,38,70,0,1,0),to:yn(-40,46,90,0,1,2)}]}function jf(n,e){let t=hS(),i=!1,s=-1,r="transition",o=0,a=0,l=yn(0,0,0,0,0,0),c=d=>d*d*(3-2*d),h=d=>{s=d%t.length,r="transition",o=0,l.position.copy(n.position),l.target.copy(e.target)};return{get enabled(){return i},setEnabled(d){i=d,a=d?$f:0,s=-1},interrupt(){a=0,s=-1},tick(d){if(!i)return!1;if(a<$f)return a+=d,!1;s<0&&h(Math.floor(Math.random()*t.length));let f=t[s];if(o+=d,r==="transition"){let u=c(Math.min(1,o/Jf));n.position.lerpVectors(l.position,f.from.position,u),e.target.lerpVectors(l.target,f.from.target,u),o>=Jf&&(r="hold",o=0)}else{let u=c(Math.min(1,o/f.hold));n.position.lerpVectors(f.from.position,f.to.position,u),e.target.lerpVectors(f.from.target,f.to.target,u),o>=f.hold&&h(s+1)}return n.lookAt(e.target),!0}}}var uS=900,ep=10,_a=1.2,Qf=.7,dS=7.8,fS=ep,pS=ep+.6,mS=9;function tp(n){let e=uS,t=e,i,s=c=>c*c*(3-2*c),r=c=>{!i||i.stage===c||(i.stage=c,n.onStage(c))},o=c=>{i={t:0,stage:void 0,forced:c,falls:new Map},r("title")},a=()=>{if(i){for(let c of n.cows())c.parts.group.position.y=0,c.parts.group.rotation.x=0,c.parts.group.rotation.z=0;i.falls.clear(),r("restore")}},l=()=>{i&&(r(void 0),i=void 0,t=e)};return{setEvery(c){e=Math.max(0,c),t=e},trigger(){i||o(!0)},active:()=>!!i,tick(c,h){if(!i){if(!h||e<=0)return;t-=c,t<=0&&o(!1);return}if(!h&&!i.forced&&i.stage!=="restore"){a(),l();return}i.t+=c;let d=i.t;if(d>=pS){l();return}if(d>=fS){i.stage!=="restore"&&a();return}if(d>=dS?r("fade"):d>=_a&&r("flip"),d<_a)return;let f=Math.PI*s(Math.min(1,(d-_a)/Qf));n.camera.lookAt(n.target),n.camera.rotateZ(f);let u=_a+Qf*.6;for(let m of n.cows()){let g=i.falls.get(m);g||(g={start:Math.max(d,u+m.rand()*1.6),spinX:(m.rand()-.5)*2.4,spinZ:(m.rand()-.5)*2.4},i.falls.set(m,g));let _=d-g.start;if(_<=0)continue;let p=m.parts.group;p.position.y=.5*mS*_*_,p.rotation.x=g.spinX*_,p.rotation.z=g.spinZ*_}}}}var Ns=Math.PI*2,jn=34,ga=11,_S=8,np=10,ip=400,br=n=>n*n*(3-2*n);function Mh(n,e,t){let i=(e-n+Math.PI)%Ns-Math.PI;return i<-Math.PI&&(i+=Ns),n+i*Math.min(1,t)}function Ea(n,e,t=1.8){let{rect:i}=Er(n);for(let s=0;s<20;s++){let r=i.x0+t+e()*(i.x1-i.x0-t*2),o=i.z0+t+e()*(i.z1-i.z0-t*2);if(!Ls(r,o))return{x:r,z:o}}return{x:(i.x0+i.x1)/2,z:(i.z0+i.z1)/2}}function sp(n,e){let t=new Po({canvas:n,antialias:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)),t.outputColorSpace=At,t.toneMapping=eh,t.toneMappingExposure=1.05,t.shadowMap.enabled=!0,t.shadowMap.type=Ql;let i=new Uo,s=Zf(i),r=Nf();i.add(r.group);let o=Df();i.add(o.group);let a=0,l=np,c=Math.floor(Math.random()*np),h=()=>l>0&&a++%l===c%l?"ufo":"hand",d=wf(i),f=new Gt(42,1,.1,500);f.position.set(0,42,80);let u=new oa(f,n);u.target.set(0,.8,2),u.enableDamping=!0,u.dampingFactor=.08,u.minDistance=6,u.maxDistance=140,u.maxPolarAngle=Math.PI*.47,u.enablePan=!0,u.update();let m=new Pe;i.add(m);let g=new Map,_,p,S=!1,x=[],E,D=new Yn(new wn(1,24),new Ct({color:"#000000",transparent:!0,opacity:.17,depthWrite:!1}),ip);D.frustumCulled=!1,D.count=0,i.add(D);let w=new $(new Wo(1.05,1.24,48),new Ct({color:"#ffd166",transparent:!0,opacity:.9,side:Ft,depthWrite:!1}));w.rotation.x=-Math.PI/2,w.position.y=.035,w.visible=!1,i.add(w);let O=new le(2,2),U=!1,T={x:0,y:0},y=new jo,P,F,L=!1,B=jf(f,u),Z=tp({camera:f,target:u.target,cows:()=>g.values(),onStage:R=>e.onUpsidedown?.(R)});u.addEventListener("start",()=>{L=!0,B.interrupt()});let G=()=>{if(L)return;let R=54,k=na.degToRad(f.fov/2),b=Math.min(u.maxDistance,Math.max(70,R/(Math.tan(k)*f.aspect))),z=f.position.clone().sub(u.target).normalize();f.position.copy(u.target).addScaledVector(z,b),u.update()},se=()=>{let R=n.parentElement,k=Math.max(1,R?.clientWidth??n.clientWidth),b=Math.max(1,R?.clientHeight??n.clientHeight);t.setSize(k,b,!1),f.aspect=k/b,f.updateProjectionMatrix(),G()};se();let K=new ResizeObserver(()=>se());n.parentElement&&K.observe(n.parentElement);let ge=R=>{let k=n.getBoundingClientRect();O.set((R.clientX-k.left)/k.width*2-1,-((R.clientY-k.top)/k.height)*2+1),T={x:R.clientX,y:R.clientY},U=!0},pe=R=>ge(R),Se=()=>{U=!1,P!==void 0&&(P=void 0,n.style.cursor="",e.onHover(void 0,T.x,T.y))},ve=R=>{ge(R),F={x:R.clientX,y:R.clientY,at:performance.now()}},tt=R=>{if(!F)return;let k=Math.hypot(R.clientX-F.x,R.clientY-F.y),b=performance.now()-F.at<450;F=void 0,!(k>6||!b)&&(ge(R),e.onSelect(ae()))},ee=R=>{ge(R);let k=ae();k?.kind==="cow"&&e.onOpen(k.id)};n.addEventListener("pointermove",pe),n.addEventListener("pointerleave",Se),n.addEventListener("pointerdown",ve),n.addEventListener("pointerup",tt),n.addEventListener("dblclick",ee);function ae(){y.setFromCamera(O,f);let R=y.intersectObjects([m,d.root],!0);for(let k of R){let b=k.object.userData.cowID;if(b){let V=g.get(b);return V&&!V.hidden&&!V.burning?{kind:"cow",id:b}:void 0}let z=k.object.userData.critterID;if(z)return{kind:"critter",id:z}}}function _e(R){let{rect:k}=Er(R.pen);for(let b=0;b<12;b++){let z=R.rand()*Ns,V=3+R.rand()*8,Y=Math.max(k.x0+1.8,Math.min(k.x1-1.8,R.x+Math.sin(z)*V)),te=Math.max(k.z0+1.8,Math.min(k.z1-1.8,R.z+Math.cos(z)*V));if(!Ls(Y,te))return{x:Y,z:te}}return Ea(R.pen,R.rand)}function me(R){let k=!!p&&!p.has(R.spec.author);if(k!==R.dimmed){R.dimmed=k;for(let b of R.parts.materials)b.color.setScalar(k?.42:1)}}function Ne(R,k){let b=Et(R.seed^2654435769),z=Mf(R),{x:V,z:Y}=Ea(R.pen,b),te={spec:R,parts:z,pen:R.pen,x:V,z:Y,heading:b()*Ns,target:{x:V,z:Y},mode:b()<.5?"graze":"idle",timer:1+b()*6,walkPhase:b()*Ns,phase:b()*Ns,lift:0,graze:0,selected:R.id===_,carried:!1,hidden:k,leaving:!1,dimmed:!1,rand:b};return z.group.visible=!k,z.group.position.set(V,0,Y),z.group.rotation.y=te.heading,m.add(z.group),g.set(R.id,te),me(te),te}function Ve(R){R.burning&&(R.parts.group.remove(R.burning.fire.group),Of(R.burning.fire),R.burning=void 0),m.remove(R.parts.group),yh(R.parts),g.delete(R.spec.id)}function ze(R,k,b){let z=R.parts;z.legs.forEach((V,Y)=>{V.rotation.x=Math.sin(k*2.3+Y*1.3+R.phase)*.3*b,V.rotation.z=Math.sin(k*1.9+Y*.8)*.14*b}),z.rig.rotation.x=-.14*b,z.head.rotation.x=.12*b,z.head.rotation.y=Math.sin(k*.9+R.phase)*.15*b,z.tail.rotation.x=Math.sin(k*3+R.phase)*.35}function Je(R,k){let b=R.parts,z=R.mode==="graze"?1:0;R.graze+=(z-R.graze)*Math.min(1,k*3);let V=br(R.graze);return b.head.position.set(b.headRest.x,b.headRest.y-.36*V,b.headRest.z+.12*V),V}let oe=[];function de(R,k,b){let z=R.burning,V=R.parts,Y=R.spec.breed.size;z.t+=k;let te=z.t,ue=Math.min(1,te/.5),We=Math.min(1,Math.max(0,(te-.4)/1.8)),Ye=Math.min(1,Math.max(0,(te-2.4)/.8)),st=Math.min(1,Math.max(0,(te-3.1)/.5)),et=ue*(1-.6*Ye)*(1-st);Pf(z.fire,b,k,et,te>.7&&te<3.3,Y,R.rand);for(let Ut of V.materials)Ut.color.setScalar(1-.85*We),Ut.emissive.set("#ff6a00"),Ut.emissiveIntensity=.45*et*(1-.55*We)*(.7+.3*Math.sin(b*17));let Ht=(1-Ye)*ue;if(V.rig.position.x=Math.sin(b*31)*.04*Ht,V.rig.position.y=-Ye*.9*Y+Math.abs(Math.sin(b*23))*.05*Ht,V.rig.scale.set(Y*(1+.15*Ye),Y*(1-.65*Ye),Y),V.rig.rotation.z=Ye*.35,V.legs.forEach((Ut,Bs)=>{Ut.rotation.x=Math.sin(b*19+Bs*1.7)*.35*Ht+Ye*(Bs<2?1.1:-1.1)}),V.head.rotation.x=-.6*Ht+.8*Ye,V.tail.rotation.z=Math.sin(b*25)*.6*Ht,V.group.position.set(R.x,0,R.z),te>=Sh){let Ut=Uf(R.x,R.z,Y,b);i.add(Ut.mesh),oe.push(Ut),Ve(R)}}function H(R,k,b){let z=R.parts;if(R.hidden)return;if(R.burning)return de(R,k,b);let V=R.spec.breed.size;if(R.carried){ze(R,b,1),z.group.position.set(R.x,0,R.z),z.group.rotation.y=R.heading;return}if(R.spec.queued&&!R.selected){R.lift=Math.min(1,R.lift+k*.8);let te=br(R.lift);z.rig.position.y=te*(1.4+V*.3)+Math.sin(b*1.4+R.phase)*.12*te,z.rig.rotation.x=-.05*te,R.heading+=k*.9*te,ze(R,b,te*.6),R.mode="idle",Je(R,k),z.group.position.set(R.x,0,R.z),z.group.rotation.y=R.heading;return}R.lift=R.selected?Math.min(1,R.lift+k*1.5):Math.max(0,R.lift-k*1.3);let Y=br(R.lift);if(R.lift>.02){if(z.rig.position.y=Y*(2.3+V*.5)+(R.selected?Math.sin(b*1.7+R.phase)*.08:0),ze(R,b,Y),R.mode="idle",Je(R,k),R.selected){let te=Math.atan2(f.position.x-R.x,f.position.z-R.z);R.heading=Mh(R.heading,te,k*1.2)}z.group.position.set(R.x,0,R.z),z.group.rotation.y=R.heading;return}if(z.rig.position.y=0,z.rig.rotation.x=0,R.timer-=k,R.mode==="walk"){let te=R.target.x-R.x,ue=R.target.z-R.z;if(Math.hypot(te,ue)<.5||R.timer<=0)R.mode=R.rand()<.72?"graze":"idle",R.timer=3+R.rand()*7;else{R.heading=Mh(R.heading,Math.atan2(te,ue),k*2.2);let Ye=1.15*(.85+V*.15);R.x+=Math.sin(R.heading)*Ye*k,R.z+=Math.cos(R.heading)*Ye*k,R.walkPhase+=k*7.5;let st=Math.sin(R.walkPhase)*.5;z.legs[0].rotation.x=st,z.legs[3].rotation.x=st,z.legs[1].rotation.x=-st,z.legs[2].rotation.x=-st,z.rig.position.y=Math.abs(Math.sin(R.walkPhase))*.035,z.head.rotation.x=.08+Math.sin(R.walkPhase)*.05,z.head.rotation.y=0,z.tail.rotation.z=Math.sin(b*2.2+R.phase)*.2}}else if(R.mode==="graze"){z.head.rotation.x+=(.95-z.head.rotation.x)*Math.min(1,k*3),z.head.rotation.y=Math.sin(b*2.6+R.phase)*.06,z.tail.rotation.z=Math.sin(b*1.6+R.phase)*.25;for(let te of z.legs)te.rotation.x*=1-Math.min(1,k*6);R.timer<=0&&(R.mode="walk",R.target=_e(R),R.timer=5+R.rand()*8)}else{z.head.rotation.x+=(0-z.head.rotation.x)*Math.min(1,k*3),z.head.rotation.y=Math.sin(b*.7+R.phase)*.45,z.tail.rotation.z=Math.sin(b*1.4+R.phase)*.25;for(let te of z.legs)te.rotation.x*=1-Math.min(1,k*6);R.timer<=0&&(R.mode="walk",R.target=_e(R),R.timer=5+R.rand()*8)}Je(R,k),Ie(R),z.group.position.set(R.x,0,R.z),z.group.rotation.y=R.heading}function Ie(R){let{rect:k}=Er(R.pen);if(R.x=Math.max(k.x0+1.2,Math.min(k.x1-1.2,R.x)),R.z=Math.max(k.z0+1.2,Math.min(k.z1-1.2,R.z)),!Ls(R.x,R.z,1.2))return;let b=(R.x-St.x)/(St.rx+1.4),z=(R.z-St.z)/(St.rz+1.4),V=Math.hypot(b,z)||.001;R.x=St.x+b/V*(St.rx+1.4),R.z=St.z+z/V*(St.rz+1.4),R.mode==="walk"&&(R.target=_e(R))}function he(){let R=[...g.values()].filter(k=>!k.hidden&&!k.carried&&!k.burning);for(let k=0;k<R.length;k++)for(let b=k+1;b<R.length;b++){let z=R[k],V=R[b];if(z.pen!==V.pen)continue;let Y=V.x-z.x,te=V.z-z.z,ue=(z.spec.breed.size+V.spec.breed.size)*1.05,We=Math.hypot(Y,te)||.001;if(We>=ue)continue;let Ye=(ue-We)/2*.5,st=Y/We,et=te/We;z.lift<.02&&(z.x-=st*Ye,z.z-=et*Ye),V.lift<.02&&(V.x+=st*Ye,V.z+=et*Ye)}}let Me=new ot,fe=new Nt().setFromAxisAngle(new N(1,0,0),-Math.PI/2),Fe=new N,Te=new N;function I(){let R=0;for(let b of g.values()){if(R>=ip)break;let z=b.spec.breed.size,V=b.hidden?0:b.carried?.55:b.burning?Math.max(0,1-b.burning.t/Sh):1-br(b.lift)*.35;Fe.set(b.x,.02,b.z),Te.setScalar(.95*z*V),Me.compose(Fe,fe,Te),D.setMatrixAt(R++,Me)}D.count=R,D.instanceMatrix.needsUpdate=!0;let k=_?g.get(_):void 0;w.visible=!!k&&!k.hidden&&!k.carried,k&&(w.position.set(k.x,.035,k.z),w.scale.setScalar(k.spec.breed.size))}let M={descend:1.1,grab:.35,lift:.8,travel:2,lower:.8,release:.35,ascend:1,"carry-up":1.4,"carry-down":1.4},q=()=>E?.vehicle==="ufo"?o.group:r.group;function ne(R,k,b){E?.vehicle==="ufo"?o.group.position.set(R,k+ma,b):r.group.position.set(R,k,b)}let v=()=>{let R=q().position;return{x:R.x,y:E?.vehicle==="ufo"?R.y-ma:R.y,z:R.z}};function C(R){R.carried=!0,R.selected=!1,R.lift=0;let k=v();R.x=k.x,R.z=k.z,R.parts.rig.position.y=Math.max(0,k.y-ha(R.spec.breed.size)),E?.vehicle==="ufo"&&(R.heading+=.9*ie)}let ie=0;function Q(){for(;!E&&x.length;){let R=x.shift(),k=g.get(R.id);if(k){if(R.kind==="move"){if(k.pendingPen!==R.to)continue;let b=Ea(R.to,k.rand);E={transfer:R,phase:"descend",vehicle:h(),t:0,from:{x:k.x,z:k.z},to:b,cow:k},ne(k.x,jn,k.z),Us(r,0)}else if(R.kind==="arrive"){let b={x:k.x,z:k.z};E={transfer:R,phase:"carry-down",vehicle:h(),t:0,from:b,to:b,cow:k},ne(b.x,jn,b.z),Us(r,1),k.hidden=!1,k.parts.group.visible=!0,C(k),e.onCarry?.(k.spec.id)}else{if(!k.leaving)continue;E={transfer:R,phase:"descend",vehicle:h(),t:0,from:{x:k.x,z:k.z},to:{x:k.x,z:k.z},cow:k},ne(k.x,jn,k.z),Us(r,0)}r.group.visible=E.vehicle==="hand",o.group.visible=E.vehicle==="ufo"}}}function ce(){r.group.visible=!1,o.group.visible=!1,E=void 0,Q()}function Ae(R,k){if(!E)return;ie=R;let b=E,z=b.cow,V=z.spec.breed.size,Y=ha(V);b.t+=R;let te=Math.min(1,b.t/M[b.phase]),ue=br(te);if(b.vehicle==="ufo"){let st=b.phase==="grab"?ue:b.phase==="release"?1-ue:b.phase==="descend"||b.phase==="ascend"||b.phase==="carry-down"||b.phase==="carry-up"?.35:1;Hf(o,k,o.group.position.y-.7,st)}switch(b.phase){case"descend":ne(b.from.x,jn+(Y-jn)*ue,b.from.z);break;case"grab":Us(r,ue),te>=1&&(C(z),e.onCarry?.(z.spec.id));break;case"lift":ne(b.from.x,Y+(ga-Y)*ue,b.from.z);break;case"travel":{let st=b.from.x+(b.to.x-b.from.x)*ue,et=b.from.z+(b.to.z-b.from.z)*ue;ne(st,ga+Math.sin(te*Math.PI)*3,et),z.heading=Mh(z.heading,Math.atan2(b.to.x-b.from.x,b.to.z-b.from.z),R*2);break}case"lower":ne(b.to.x,ga+(Y-ga)*ue,b.to.z);break;case"release":Us(r,1-ue),te>=1&&(z.carried=!1,z.x=b.to.x,z.z=b.to.z,z.parts.rig.position.y=0,b.transfer.kind==="move"&&(z.pen=b.transfer.to,z.pendingPen=void 0),z.mode="idle",z.timer=1.5+z.rand()*3,z.target=_e(z));break;case"ascend":{let st=v();ne(st.x,Y+(jn-Y)*ue,st.z);break}case"carry-up":if(ne(b.from.x,Y+(jn+6-Y)*ue,b.from.z),te>=1){Ve(z),ce();return}break;case"carry-down":ne(b.to.x,jn+(Y-jn)*ue,b.to.z);break}if(z.carried&&C(z),te<1)return;b.t=0;let Ye=(b.transfer.kind==="move"?{descend:"grab",grab:"lift",lift:"travel",travel:"lower",lower:"release",release:"ascend",ascend:"done"}:b.transfer.kind==="arrive"?{"carry-down":"release",release:"ascend",ascend:"done"}:{descend:"grab",grab:"carry-up"})[b.phase];if(!Ye||Ye==="done"){ce();return}if(Ye==="travel"){let st=Math.hypot(b.to.x-b.from.x,b.to.z-b.from.z);M.travel=Math.min(3,Math.max(1.1,st/16))}b.phase=Ye}let re=new Jo,ye=0,Ce=0,ke=new N;function we(){Ce=requestAnimationFrame(we);let R=Math.min(.05,re.getDelta()),k=re.elapsedTime;ye++,Ae(R,k);for(let z of g.values())H(z,R,k);ye%3===0&&g.size>1&&he(),d.tick(R,k,f);for(let z of[...oe])Lf(z,k)||(i.remove(z.mesh),z.mesh.geometry.dispose(),z.mesh.material.dispose(),oe.splice(oe.indexOf(z),1));I(),s.tick(k,R);for(let z of s.clouds)z.position.x+=z.userData.speed*R,z.position.x>120&&(z.position.x=-120);let b=B.tick(R,k);if(b||u.update(),Z.tick(R,b),U&&ye%2===0){let z=ae();(z?.id!==P?.id||z?.kind!==P?.kind)&&(P=z,n.style.cursor=z?"pointer":"",e.onHover(z,T.x,T.y))}t.render(i,f)}we();function nt(R){let k=new Map;for(let b of R)k.set(b.pen,(k.get(b.pen)??0)+1);for(let[b,z]of s.signs){let V=k.get(b)??0;z.count!==V&&(z.count=V,xr(z))}}return{setCows(R,k){let b=new Map(R.map(Y=>[Y.id,Y])),z=[];for(let[Y,te]of g)!b.has(Y)&&!te.leaving&&z.push({kind:"depart",id:Y});for(let Y of R){let te=g.get(Y.id);if(!te)z.push({kind:"arrive",id:Y.id});else{if(te.burning)continue;te.leaving=!1,te.spec=Y,te.pen!==Y.pen&&te.pendingPen!==Y.pen&&z.push({kind:"move",id:Y.id,to:Y.pen})}}let V=k&&S&&z.length>0&&z.length<=_S;for(let Y of z)if(Y.kind==="depart"){let te=g.get(Y.id);V&&!te.hidden?(te.leaving=!0,x.push(Y)):(E?.cow===te&&ce(),Ve(te))}else if(Y.kind==="arrive")Ne(b.get(Y.id),V),V&&x.push(Y);else{let te=g.get(Y.id);if(V||E?.cow===te)te.pendingPen=Y.to,x.push(Y);else{te.pen=Y.to,te.pendingPen=void 0;let ue=Ea(Y.to,te.rand);te.x=ue.x,te.z=ue.z,te.target=ue}}S=!0,nt(R);for(let Y of g.values())me(Y);Q()},setSign(R,k){let b=s.signs.get(R);!b||b.name===k||(b.name=k,xr(b))},select(R){_=R;for(let k of g.values())k.selected=k.spec.id===R&&!k.carried&&!k.burning},burn(R){let k=g.get(R);if(!k||k.hidden||k.burning)return!1;E?.cow===k&&ce(),k.carried=!1,k.selected=!1,k.lift=0,k.leaving=!0,k.pendingPen=void 0;let b=If(k.spec.breed.size,ha(k.spec.breed.size)*.95,k.rand);return k.parts.group.add(b.group),k.burning={t:0,fire:b},e.onBurn?.(R),!0},setFilter(R){p=R;for(let k of g.values())me(k)},screenPosition(R){let k=g.get(R);if(k){if(k.hidden)return;ke.set(k.x,k.parts.rig.position.y+Sf(k.spec.breed.size),k.z)}else if(R==="john-pork")ke.copy(s.porkPosition());else{let b=d.position(R);if(!b)return;ke.set(b.x,b.y,b.z)}if(ke.project(f),!(ke.z>1))return{x:(ke.x+1)/2*n.clientWidth,y:(1-ke.y)/2*n.clientHeight}},poke(R){return d.poke(R)},setWolves(R){d.setWolves(R.map(vf))},setUfoOdds(R){l=Math.max(0,Math.floor(R))},setSky(R){s.sky.set(R)},setTour(R){B.setEnabled(R)},setParty(R){s.party.set(R)},setUpsidedownEvery(R){Z.setEvery(R)},upsidedownNow(){Z.trigger()},setCamera(R,k){L=!0,f.position.set(...R),u.target.set(...k),u.update()},focus(R,k=14){let b=g.get(R),z=b?{x:b.x,y:b.parts.rig.position.y+.9*b.spec.breed.size,z:b.z}:d.position(R);if(!z)return!1;L=!0;let V=f.position.clone().sub(u.target).normalize();return u.target.set(z.x,z.y*.6,z.z),f.position.copy(u.target).addScaledVector(V,Math.max(u.minDistance,k)),u.update(),!0},dispose(){cancelAnimationFrame(Ce),K.disconnect(),n.removeEventListener("pointermove",pe),n.removeEventListener("pointerleave",Se),n.removeEventListener("pointerdown",ve),n.removeEventListener("pointerup",tt),n.removeEventListener("dblclick",ee),u.dispose(),d.dispose(),s.sky.dispose();for(let R of oe)R.mesh.geometry.dispose(),R.mesh.material.dispose();for(let R of g.values())yh(R.parts);g.clear(),i.traverse(R=>{let k=R;k.geometry&&k.geometry.dispose()}),t.dispose()}}}var rp=[{id:"hereford",name:"Hereford",body:"#a3492b",patch:"#f6f1e6",pattern:"whiteface",horns:"short",ears:"up",size:1,muzzle:"#e8c9b8"},{id:"belted-galloway",name:"Belted Galloway",body:"#1c1b1b",patch:"#f3efe4",pattern:"belt",horns:"none",shaggy:!0,ears:"up",size:.95,muzzle:"#2a2727"},{id:"brahman",name:"Brahman",body:"#c9c7c2",pattern:"solid",horns:"short",hump:!0,ears:"droop",size:1.05,muzzle:"#4a4442"},{id:"angus",name:"Angus",body:"#151515",pattern:"solid",horns:"none",ears:"up",size:1,muzzle:"#2b2727"},{id:"holstein",name:"Holstein",body:"#f5f2ec",patch:"#171717",pattern:"patches",horns:"none",ears:"up",size:1.05,muzzle:"#d9a8a0",dairy:!0},{id:"jersey",name:"Jersey",body:"#c58a4b",pattern:"solid",horns:"none",ears:"up",size:.9,muzzle:"#3a2a22",dairy:!0},{id:"highland",name:"Highland",body:"#c8722f",pattern:"solid",horns:"long",shaggy:!0,ears:"up",size:.95,muzzle:"#7a4a2c"},{id:"guernsey",name:"Guernsey",body:"#f3e6cd",patch:"#c8873c",pattern:"patches",horns:"none",ears:"up",size:1,muzzle:"#d8b09a",dairy:!0},{id:"texas-longhorn",name:"Texas Longhorn",body:"#8b5a3c",patch:"#f0e6d8",pattern:"roan",horns:"huge",ears:"up",size:1.05,muzzle:"#5a3a2a"},{id:"charolais",name:"Charolais",body:"#efe4cf",pattern:"solid",horns:"short",ears:"up",size:1.15,muzzle:"#d8b8a0"},{id:"simmental",name:"Simmental",body:"#f4efe6",patch:"#b5572e",pattern:"patches",horns:"short",ears:"up",size:1.1,muzzle:"#e0b8a8"},{id:"limousin",name:"Limousin",body:"#c98b4a",pattern:"solid",horns:"none",ears:"up",size:1.05,muzzle:"#e0c2a0"},{id:"ayrshire",name:"Ayrshire",body:"#f4efe6",patch:"#8e3b2a",pattern:"patches",horns:"long",ears:"up",size:1,muzzle:"#d8a898",dairy:!0},{id:"dexter",name:"Dexter",body:"#241b18",pattern:"solid",horns:"short",ears:"up",size:.7,muzzle:"#3a2a24"},{id:"wagyu",name:"Wagyu",body:"#101011",pattern:"solid",horns:"short",ears:"up",size:1,muzzle:"#2a2626"},{id:"zebu",name:"Zebu",body:"#d8d2c8",pattern:"solid",horns:"short",hump:!0,ears:"droop",size:.8,muzzle:"#5a5250"},{id:"galloway",name:"Galloway",body:"#1f1f1f",pattern:"solid",horns:"none",shaggy:!0,ears:"up",size:.95,muzzle:"#333030"},{id:"shorthorn",name:"Shorthorn",body:"#b45a3c",patch:"#f4ece2",pattern:"roan",horns:"short",ears:"up",size:1.05,muzzle:"#e8c0b0"},{id:"brown-swiss",name:"Brown Swiss",body:"#8f8073",pattern:"solid",horns:"none",ears:"up",size:1.1,muzzle:"#d8cfc4",dairy:!0},{id:"chianina",name:"Chianina",body:"#f7f4ee",pattern:"solid",horns:"short",ears:"up",size:1.25,muzzle:"#3a3535"},{id:"watusi",name:"Ankole-Watusi",body:"#7a3b2a",patch:"#f2e8dc",pattern:"patches",horns:"lyre",ears:"up",size:1.1,muzzle:"#4a2a20"},{id:"pinzgauer",name:"Pinzgauer",body:"#8a4a34",patch:"#f4efe6",pattern:"backstripe",horns:"short",ears:"up",size:1.05,muzzle:"#e0b8a8"},{id:"dutch-belted",name:"Dutch Belted",body:"#1c1c1c",patch:"#f5f2ec",pattern:"belt",horns:"none",ears:"up",size:1,muzzle:"#2c2828",dairy:!0},{id:"gloucester",name:"Gloucester",body:"#3a2a24",patch:"#f4efe6",pattern:"backstripe",horns:"long",ears:"up",size:1,muzzle:"#4a3a34"},{id:"red-poll",name:"Red Poll",body:"#9c3f2c",pattern:"solid",horns:"none",ears:"up",size:.95,muzzle:"#d8a090"},{id:"normande",name:"Normande",body:"#f2ece2",patch:"#7b4a37",pattern:"patches",horns:"short",ears:"up",size:1.05,muzzle:"#d8b0a0",dairy:!0},{id:"murray-grey",name:"Murray Grey",body:"#9a9aa0",pattern:"solid",horns:"none",ears:"up",size:1,muzzle:"#3a3a40"},{id:"white-park",name:"White Park",body:"#f6f4ef",patch:"#1a1a1a",pattern:"solid",horns:"long",ears:"up",size:1.05,muzzle:"#1a1a1a"},{id:"speckle-park",name:"Speckle Park",body:"#f4f1ec",patch:"#1e1e1e",pattern:"roan",horns:"none",ears:"up",size:1,muzzle:"#2a2a2a"},{id:"nguni",name:"Nguni",body:"#f4efe4",patch:"#3a2a22",pattern:"nguni",horns:"long",ears:"up",size:.95,muzzle:"#3a2a22"},{id:"nguni-red",name:"Nguni",body:"#efe6d6",patch:"#8e4a2c",pattern:"nguni",horns:"long",ears:"up",size:.95,muzzle:"#5a3a2a"},{id:"fleckvieh",name:"Fleckvieh",body:"#f6efe4",patch:"#c96a3f",pattern:"patches",horns:"none",ears:"up",size:1.1,muzzle:"#e4bcac",dairy:!0}];function vh(n){return rp[En(`${n.repo}#${n.number}`)%rp.length]}var op=n=>En(`${n.number}:${n.repo}`);var ap=`query Pasture($open: String!, $merged: String!) {
  open: search(query: $open, type: ISSUE, first: 100) {
    issueCount pageInfo { hasNextPage }
    nodes { ... on PullRequest {
      number title url isDraft reviewDecision mergeStateStatus
      repository { nameWithOwner } author { login }
      reviewThreads(first: 100) { nodes { isResolved } pageInfo { hasNextPage } }
      commits(last: 1) { nodes { commit { statusCheckRollup { state } } } }
    } }
  }
  merged: search(query: $merged, type: ISSUE, first: 100) {
    issueCount pageInfo { hasNextPage }
    nodes { ... on PullRequest { number title url mergedAt repository { nameWithOwner } author { login } } }
  }
}`;function gS(n){let e=n.repository.nameWithOwner,t=n.reviewThreads,i=t?.nodes.filter(a=>!a.isResolved).length??0,s=n.commits?.nodes[0]?.commit.statusCheckRollup?.state,r=n.mergedAt?"merged":n.isDraft?"draft":n.reviewDecision==="CHANGES_REQUESTED"?"changes":n.reviewDecision==="APPROVED"&&n.mergeStateStatus==="CLEAN"&&t&&!t.pageInfo.hasNextPage&&i===0&&(!s||s==="SUCCESS")?"ready":"awaiting",o=n.mergedAt?`Merged ${new Date(n.mergedAt).toLocaleString()}`:[n.reviewDecision?.replaceAll("_"," ").toLowerCase()??"review pending",`merge: ${(n.mergeStateStatus??"unknown").toLowerCase()}`,s?`checks: ${s.toLowerCase()}`:"no reported checks",t?.pageInfo.hasNextPage?"review threads incomplete":`${i} unresolved threads`].join(" \xB7 ");return{id:`${e}#${n.number}`,repo:e,number:n.number,title:n.title,url:n.url,author:n.author?.login??"unknown",pen:r,detail:o}}function cp(n){let e=JSON.parse(n);if(e.errors?.length||!e.data?.open||!e.data?.merged)throw new Error(e.errors?.map(o=>o.message).join("; ")||"GitHub returned incomplete data");let{open:t,merged:i}=e.data,s=[...t.nodes,...i.nodes].filter(o=>o?.repository&&o.number&&o.url).map(gS).slice(0,150),r=t.pageInfo.hasNextPage||i.pageInfo.hasNextPage||t.issueCount+i.issueCount>150;return{cows:s,notice:r?`Showing ${s.length} of ${t.issueCount+i.issueCount} PRs; GitHub search or field limit reached.`:`${t.issueCount} open \xB7 ${i.issueCount} merged in the last 7 days`}}var hn=n=>document.getElementById(n),Ta=Ja(),Hs=hn("status"),xa=hn("tip"),ES=hn("detail"),Qn=new Map,Ei,Sa=!1,lp,Fs=0,Ds=!1,ya=!1,xi=sp(hn("scene"),{onHover(n){let e=n?.kind==="cow"?Qn.get(n.id):void 0;xa.hidden=!e,xa.textContent=e?`${e.title} \xB7 ${e.id} \xB7 ${e.detail}`:""},onSelect(n){if(n?.kind==="critter"){let e=xi.poke(n.id);e&&(xa.hidden=!1,xa.textContent=e);return}Wi(n?.id)},onOpen(n){up(n)}}),hp=Vf(new Date);xi.setSky({altitude:hp.altitude,azimuth:hp.azimuth,weather:null});function Wi(n){Ei=n,xi.select(n);let e=n?Qn.get(n):void 0;ES.hidden=!e,e&&(hn("title").textContent=e.title,hn("meta").textContent=`${e.id} \xB7 ${e.author} \xB7 ${e.pen}`,hn("explanation").textContent=e.detail)}async function up(n){let e=n?Qn.get(n):void 0;e&&await Ta.openUrl(e.url).catch(()=>{Hs.textContent="Could not open the PR in OpenChamber."})}async function bh(){if(!Sa)return;let n=++Fs;Hs.textContent=Ds?"Refreshing GitHub\u2026":"Loading your pull requests\u2026";let e=new Date(Date.now()-7*864e5).toISOString().slice(0,10);try{let t=await Ta.request({method:"POST",path:"/graphql",body:JSON.stringify({query:ap,variables:{open:"is:pr is:open author:@me sort:updated-desc",merged:`is:pr is:merged author:@me merged:>=${e} sort:updated-desc`}})});if(n!==Fs)return;if(t.status!==200)throw new Error(`GitHub returned HTTP ${t.status}`);let i=cp(t.body);Qn.clear();for(let r of i.cows)Qn.set(r.id,r);let s=lf(i.cows.map(r=>r.author));xi.setCows(i.cows.map(r=>({id:r.id,breed:vh(r),seed:op(r),pen:r.pen,author:r.author,collar:hf(s.get(r.author)??""),queued:!1})),Ds),Ei&&!Qn.has(Ei)?Wi(void 0):Ei&&Wi(Ei),Ds=!0,Hs.textContent=i.notice}catch(t){if(n!==Fs)return;Hs.textContent=`${Ds?"Refresh failed; showing the last successful herd. ":"Could not load GitHub. "}${t instanceof Error?t.message:"Please check your connection."}`}}hn("refresh").onclick=()=>void bh();hn("tour").onclick=n=>{ya=!ya,xi.setTour(ya),n.currentTarget.setAttribute("aria-pressed",String(ya))};hn("down").onclick=()=>Wi(void 0);hn("open").onclick=()=>void up(Ei);hn("moo").onclick=()=>{let n=Ei?Qn.get(Ei):void 0;if(!n)return;let e=new Audio("moo.mp3");e.preservesPitch=!1,e.playbackRate=Math.min(1.5,Math.max(.7,1.05/Math.max(.6,vh(n).size))),e.play().catch(()=>{Hs.textContent="Sound could not be played in this panel."})};window.addEventListener("keydown",n=>{n.key==="Escape"&&Wi(void 0)});Ta.onConnection(n=>{let e=JSON.stringify(n);if(lp!==e){if(lp=e,Fs++,Sa&&n.connected&&(Qn.clear(),xi.setCows([],!1),Wi(void 0),Ds=!1),Sa=n.connected,!Sa){Fs++,Qn.clear(),xi.setCows([],!1),Wi(void 0),Ds=!1,Hs.textContent="Connect a GitHub token in Settings \u2192 Integrations \u2192 Pasture GitHub.";return}bh()}});var xS=window.setInterval(()=>void bh(),6e4);window.addEventListener("pagehide",()=>{Fs++,clearInterval(xS),xi.dispose(),Ta.dispose()},{once:!0});})();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
