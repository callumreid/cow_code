(()=>{var st="openchamber.sdk";var ao="data-oc-scrolling",cc=`
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
:hover, [${ao}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${ao}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${ao}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${ao}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function lc(n){let e=n.documentElement;if(e.hasAttribute("data-oc-scrollbar-activity"))return;e.setAttribute("data-oc-scrollbar-activity","");let t=new WeakMap;n.addEventListener("scroll",i=>{let s=i.target===n?e:i.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let r=t.get(s);r!==void 0&&clearTimeout(r),t.set(s,setTimeout(()=>{t.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Pm=`(${lc.toString()})(document);`;var Dh=n=>{let e=[],t=0,i=0;return{push:s=>{for(e.push(s),i+=s.length;i-t>n&&e.length>1;){let r=e.shift();i-=r?.length??0,t=0}},pull:s=>{let r=0;for(;r<s.length&&e.length>0;){let o=e[0],a=Math.min(s.length-r,o.length-t);s.set(o.subarray(t,t+a),r),r+=a,t+=a,t>=o.length&&(e.shift(),i-=o.length,t=0)}s.fill(0,r)},clear:()=>{e.length=0,t=0,i=0},get size(){return i-t}}};var Bh=/^[a-z][a-z0-9-]{0,39}$/;var kh=n=>Object(n)===n&&!Array.isArray(n),uc=(n,e)=>Object.keys(n).every(t=>e.includes(t)),Hh=n=>String(n)===n&&n.length>=1&&n.length<=60,Fh=n=>String(n)===n&&n.length>=1&&n.length<=80,zh=n=>{if(!Array.isArray(n)||n.length>4)return!1;let e=new Set;for(let t of n){if(!kh(t)||!Bh.test(t.id)||!Hh(t.label)||t.disabled!==void 0&&t.disabled!==!0&&t.disabled!==!1||e.has(t.id))return!1;if(e.add(t.id),t.kind==="button"){if(!uc(t,["kind","id","label","disabled"]))return!1;continue}if(t.kind!=="select"||!uc(t,["kind","id","label","value","options","disabled"])||!Fh(t.value)||!Array.isArray(t.options)||t.options.length<1||t.options.length>16)return!1;let i=new Set;for(let s of t.options){if(!kh(s)||!uc(s,["value","label"])||!Fh(s.value)||!Hh(s.label)||i.has(s.value))return!1;i.add(s.value)}if(!i.has(t.value))return!1}return!0};var Um=1024*1024;var Gh=["{id}","{segment}","{segments+}"];var sv=new Set(Gh);var Vh=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var ov=new Set(Vh);var hc=n=>"bytes"in n?n.bytes.byteLength:n.content.length,Wh=(n,e)=>{if(n.path!==e.path||n.readOnly!==e.readOnly)return!1;if(n.encoding==="text"||e.encoding==="text")return n.encoding==="text"&&e.encoding==="text"&&n.content===e.content;if(n.bytes.byteLength!==e.bytes.byteLength)return!1;for(let t=0;t<n.bytes.byteLength;t+=1)if(n.bytes[t]!==e.bytes[t])return!1;return!0};var Xh=/^[A-Za-z0-9_-]{1,80}$/;var $h=["left","right","top","bottom"];var qh=(n,e=0,t={remaining:16e3})=>{if(--t.remaining<0||e>=32)return!1;if(n===null)return!0;let i=Array.isArray(n)?n:Object(n)===n?Object.values(n):[];for(let s of i)if(!qh(s,e+1,t))return!1;return!0},dc=n=>{if(n===null||n===!0||n===!1)return!0;if(Array.isArray(n))return Object.keys(n).every(e=>/^(0|[1-9]\d*)$/.test(e)&&Number(e)<n.length)&&n.every(dc);if(Object(n)===n){let e=Object.getPrototypeOf(n);return(e===null||e===Object.prototype)&&Object.values(n).every(dc)}return String(n)===n||Number.isFinite(n)},fc=n=>{try{return String(n.id)!==n.id||!Xh.test(n.id)||!Number.isFinite(n.anchor.x)||Math.abs(n.anchor.x)>1e5||!Number.isFinite(n.anchor.y)||Math.abs(n.anchor.y)>1e5||!Number.isFinite(n.anchor.width)||!Number.isFinite(n.anchor.height)||n.anchor.width<=0||n.anchor.height<=0||n.anchor.width>1e5||n.anchor.height>1e5||!Number.isInteger(n.width)||n.width<160||n.width>640||!Number.isInteger(n.height)||n.height<48||n.height>480||n.side!==void 0&&!$h.includes(n.side)||n.focus!==void 0&&n.focus!==!0&&n.focus!==!1||!qh(n.data)||!dc(n.data)?!1:JSON.stringify(n.data).length<=16e3}catch{return!1}};var mc=2e3;var Kh=["file","directory","other","missing"],gc=n=>!!(n&&"sessionId"in n),_c=n=>!!(n&&"sent"in n&&!("sessionId"in n));var Zh=/^[0-9a-f]{7,64}$/i,Ec=n=>Zh.test(n),co=500,lo=32e3,Jh=16e3,jh=128,Qh=200,ed=2e3,td=16e3,nd=80,id=200,sd=16e3;var rd=2e3;var xc=2e4,uo=1024,ho=2e6;var fo=64e3,po=8e3,yc=4e3;var Sc=96e4,Lm=60*6e4;var od=999,ad=1e4,pr=500,cd=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],ld=["stopped","starting","ready","failed"],Nm=new Set(cd),ud=n=>Nm.has(n),hd=n=>n&&ud(n)?n:"HOST_REJECTED",ds=n=>n===void 0?!1:n===null||n===!0||n===!1||String(n)===n?!0:Number(n)===n?Number.isFinite(n):Array.isArray(n)?n.every(ds):Object(n)===n?Object.values(n).every(ds):!1,dd=n=>ds(n)&&JSON.stringify(n).length<=sd,Yh=n=>n?.trim().slice(0,id)??"",fs=n=>{let e=n.id.trim().slice(0,jh),t=n.title.trim().slice(0,Qh),i=n.url.trim().slice(0,ed),s=n.text?.trim().slice(0,td),r=n.author?.trim().slice(0,nd),o=n.kind==="pull"?"pull":"issue",a={providerId:n.providerId.trim(),id:e,title:t||e,url:i,kind:o};if(s&&(a.text=s),r&&(a.author=r),o==="pull"){let l=Yh(n.branches?.head),c=Yh(n.branches?.base);l&&c&&(a.branches={head:l,base:c})}return dd(n.data)&&(a.data=n.data),a},Tc=n=>{let e=fs(n);return n.projectId&&(e.projectId=n.projectId),n.navigation&&(e.navigation=n.navigation),n.worktree&&(e.worktree=n.worktree),e},vc=n=>{let e={text:n.text.trim().slice(0,Jh)};return n.send&&(e.send=!0),e},Mc=n=>n===null||!Number.isFinite(n)?null:Math.min(od,Math.max(0,Math.round(n))),bc=n=>Number.isFinite(n)?Math.min(ad,Math.max(0,Math.ceil(n))):0;var ps=n=>n.length>0&&n.length<=uo&&!n.includes("\0")&&!n.includes("\\");var mo=n=>!n.startsWith("/")||n.includes("\0")||n.includes("\\")||n.includes("://")||n.length>rd?!1:!n.split("/").some(t=>t==="."||t===".."),Dm=new Set(ld),Ac=n=>!!(n&&"status"in n&&Dm.has(String(n.status))&&!("body"in n)),go=n=>!!(n&&"status"in n&&"body"in n&&Number.isInteger(n.status)),wc=n=>!!(n&&"content"in n&&String(n.content)===n.content),Rc=n=>!!(n&&"written"in n&&n.written===!0),Cc=n=>!!(n&&"entries"in n&&Array.isArray(n.entries)),km=new Set(Kh),Ic=n=>!!(n&&"kind"in n&&"size"in n&&km.has(String(n.kind))&&Number.isFinite(n.size)),Pc=n=>!!(n&&"text"in n&&String(n.text)===n.text&&!("status"in n)),Hm=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),Fm=n=>Object(n)===n?n:null,pc=n=>String(n)===n&&n.length>0,Bm=n=>{if(!pc(n.id))return null;if(n.ok===!0){let e={channel:st,v:1,type:"result",id:n.id,ok:!0};return Object(n.payload)===n.payload&&(e.payload=n.payload),e}return n.ok===!1&&pc(n.error)?{channel:st,v:1,type:"result",id:n.id,ok:!1,error:n.error,code:hd(pc(n.code)?n.code:void 0)}:null},Oc=n=>{let e=Fm(n);return!e||e.channel!==st||e.v!==1?null:e.type==="result"?Bm(e):!Hm.has(String(e.type))||Object(e.payload)!==e.payload?null:e};var fd=n=>"key"in n&&"metaKey"in n&&"ctrlKey"in n,zm=n=>(n.metaKey||n.ctrlKey)&&!n.altKey&&!n.shiftKey&&n.key.toLowerCase()==="s",Be=class extends Error{code;constructor(e,t){super(t),this.name="HostRequestError",this.code=e}},pd=()=>Promise.reject(new Be("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),_o=()=>Promise.reject(new Be("BAD_PATH",`File path must be 1 to ${uo} characters without NUL or backslash.`)),Eo=n=>{if(n!==void 0){if(Object(n)!==n||Array.isArray(n)||n.scope!==void 0&&n.scope!=="instance"&&n.scope!=="device")throw new Be("HOST_REJECTED",'Storage scope must be "instance" or "device".');return n.scope==="device"?"device":void 0}},$e=n=>(n.value+=1,`oc-${n.value}`),kc=(n={})=>{let e=n.target??("window"in globalThis?window:null);if(!e)throw new Be("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let t=n.acceptSource??(M=>M===e.parent),i=n.requestTimeoutMs??xc,s=new Set,r=new Set,o=new Set,a=new Set,l=new Set,c=new Set,u=new Set,h=new Set,f=new Set,d=new Set,m=new Set,_=new Set,g=[],p=null,S=null,x=new Set,E=new Set,D=null,R=null,O=!1,U=new Map,T=new Map,y=new Map,P=!1,H={value:0},L=null,F=null,K=!1,G=!1,se=null,Y=null,Ee=M=>M?{sessionId:M.id,phase:M.busy?"started":"completed"}:null,me=M=>{e.parent.postMessage(M,"*")},Te=()=>{P||e.parent===e||_.size===0||L?.features?.lateGenerateResults!==!0||me({channel:st,v:1,type:"generate-late-listen"})},be=(M,C)=>{for(let ie of M)try{ie(C)}catch(Q){console.error(Q)}},nt=M=>{if(!(M instanceof MessageEvent)||!t(M.source))return;let C=Oc(M.data);if(!C)return;if(C.type==="workspace"){let Q=T.get(C.payload.subscriptionId);Q&&be([Q],C.payload.snapshot);return}if(C.type==="shells"){let Q=y.get(C.payload.subscriptionId);Q&&be([Q],C.payload.snapshot);return}if(C.type==="microphone-audio"){Y?.queue.push(C.payload.samples);return}if(C.type==="microphone-ended"){let Q=Y;if(!Q)return;Y=null,Q.release(),be(Q.endedListeners,C.payload.reason);return}if(C.type==="ready"){L=C.payload,F=Ee(C.payload.session),be(s,C.payload),be(r,C.payload.directory),be(o,C.payload.session),F&&be(a,F),be(l,C.payload.connection),be(c,C.payload.settings),be(u,C.payload.item),C.payload.block&&be(h,C.payload.block),Te();return}if(C.type==="service-event"){be(f,C.payload);return}if(C.type==="generate-late"){_.size===0?g.push(C.payload):be(_,C.payload);return}if(C.type==="directory"){L&&(L={...L,directory:C.payload.directory}),be(r,C.payload.directory);return}if(C.type==="session"){L&&(L={...L,session:C.payload.session}),C.payload.session?F?.sessionId!==C.payload.session.id&&(F=Ee(C.payload.session)):F=null,be(o,C.payload.session);return}if(C.type==="session-lifecycle"){F=C.payload,be(a,C.payload);return}if(C.type==="connection"){L&&(L={...L,connection:C.payload.connection}),be(l,C.payload.connection);return}if(C.type==="settings"){L&&(L={...L,settings:C.payload.settings}),be(c,C.payload.settings);return}if(C.type==="item"){L&&(L={...L,item:C.payload.item}),be(u,C.payload.item);return}if(C.type==="status-control-event"){be(d,C.payload);return}if(C.type==="popover-closed"){be(m,C.payload);return}if(C.type==="action"){let Q=we=>{P||me({channel:st,v:1,type:"action-result",id:C.id,payload:we})},ce=S;if(!ce){Q({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>ce(C.payload)).then(()=>Q({ok:!0}),we=>{let re=(we instanceof Error?we.message:String(we)).trim();Q({ok:!1,error:(re||"Action failed.").slice(0,pr)})});return}if(C.type==="file-open"){let Q=C.payload;if(R&&Wh(R,Q))return;R=Q,be(x,C.payload);return}if(C.type==="file-saved"){be(E,C.payload.version);return}if(C.type==="file-snapshot"){let Q=re=>{P||me({channel:st,v:1,type:"file-snapshot-result",id:C.id,payload:re})},ce=re=>Q({error:(re.trim()||"Could not read the edited file.").slice(0,pr)}),we=D;if(!we){ce("This extension does not edit files.");return}Promise.resolve().then(()=>we(C.payload.purpose)).then(re=>{if(hc(re)>2e7){ce(`The file is over ${2e7} ${"bytes"in re?"bytes":"characters"}.`);return}if(re.version.length>256){ce(`The snapshot version is over ${256} characters.`);return}Q({snapshot:"bytes"in re?{bytes:re.bytes,version:re.version}:{content:re.content,version:re.version}})},re=>ce(re instanceof Error?re.message:String(re)));return}if(C.type==="resolve"){let Q=we=>{me({channel:st,v:1,type:"resolve-result",id:C.id,payload:we})},ce=p;if(!ce){Q({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>ce(C.payload)).then(we=>Q({item:we?fs(we):null}),we=>{let re=(we instanceof Error?we.message:String(we)).trim();Q({error:(re||"Command failed.").slice(0,pr)})});return}let ie=U.get(C.id);if(ie){if(clearTimeout(ie.timer),U.delete(C.id),C.ok){ie.resolve(C.payload);return}ie.reject(new Be(C.code,C.error))}};e.addEventListener("message",nt),me({channel:st,v:1,type:"hello"});let ee=(M,C=i)=>P||e.parent===e?Promise.reject(new Be("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((ie,Q)=>{let ce=setTimeout(()=>{U.delete(M.id),Q(new Be("HOST_TIMEOUT","Host did not answer in time."))},C);U.set(M.id,{resolve:ie,reject:Q,timer:ce}),me(M)}),ae=M=>ee(M).then(()=>{}),_e={channel:st,v:1},ge=M=>{!P&&e.parent!==e&&me(M)},De=()=>ge({..._e,type:"file-save"}),We=()=>{!P&&e.parent!==e&&me({..._e,type:"microphone-close",id:$e(H)})},ze=async()=>{if(Y)throw new Be("HOST_REJECTED","The microphone is already open in this frame.");if(L?.features?.microphone!==!0)throw new Be("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let M=globalThis.AudioContext;if(typeof M!="function")throw new Be("UNSUPPORTED","This frame has no Web Audio.");let C=new M;if(C.sampleRate<8e3||C.sampleRate>192e3)throw C.close().catch(()=>{}),new Be("UNSUPPORTED",`Audio at ${C.sampleRate} Hz is not supported.`);let ie=C.state==="suspended"?C.resume().catch(()=>{}):void 0,Q=Dh(Math.round(C.sampleRate/4)),ce=C.createScriptProcessor(1024,1,1);ce.onaudioprocess=Ie=>Q.pull(Ie.outputBuffer.getChannelData(0));let we=C.createMediaStreamDestination();ce.connect(we);let re=new Set,Se={queue:Q,endedListeners:re,release:()=>{ce.onaudioprocess=null,ce.disconnect(),Q.clear();for(let Ie of we.stream.getTracks())Ie.stop();C.close().catch(()=>{})}};Y=Se;try{let Ie=await ee({..._e,type:"microphone-open",id:$e(H),payload:{sampleRate:C.sampleRate}},12e4);if(!Ie||!("opened"in Ie)||Ie.opened!==!0)throw new Be("HOST_REJECTED","Host did not open the microphone.");if(await ie,Y!==Se)throw new Be("DISCONNECTED","The microphone closed while it was opening.")}catch(Ie){throw Y===Se&&(Y=null),Se.release(),We(),Ie}return{stream:we.stream,close:()=>{Y===Se&&(Y=null,Se.release(),We())},onEnded:Ie=>(re.add(Ie),()=>{re.delete(Ie)})}},je=M=>{!fd(M)||!zm(M)||(M.preventDefault(),De())},oe=M=>{!fd(M)||M.key!=="Escape"||L?.surface!=="popover"||!L.popover||(M.preventDefault(),q(L.popover.id,"escape").catch(()=>{}))},fe=()=>{let M=L?.surface==="popover"?L.popover:void 0;if(!M)return;let C=K||G;se!==C&&(se=C,ne(M.id,C).catch(()=>{}))},k=()=>{L?.surface!=="popover"||K||(K=!0,fe())},Pe=M=>{L?.surface!=="popover"||M.relatedTarget!==null||!K||(K=!1,fe())},ue=()=>{L?.surface!=="popover"||G||(G=!0,fe())},Me=()=>{L?.surface!=="popover"||!G||(G=!1,fe())},pe=(M,C=1024)=>{if(!M.trim()||M.length>C)throw new Be("HOST_REJECTED",`Identity must contain 1 to ${C} characters.`)},Fe=async M=>{M.kind!=="projects"&&pe(M.projectId);let C=await ee({..._e,type:"workspace-read",id:$e(H),payload:M});if(!C||!("kind"in C)||!("state"in C)||C.kind!==M.kind)throw new Be("HOST_REJECTED","Host did not return workspace data.");return C},ve=async(M,C)=>{M.kind!=="projects"&&pe(M.projectId);let ie=$e(H);T.set(ie,C);try{await ae({..._e,type:"workspace-subscribe",id:$e(H),payload:{subscriptionId:ie,query:M}})}catch(Q){throw T.delete(ie),P||me({..._e,type:"workspace-unsubscribe",id:$e(H),payload:{subscriptionId:ie}}),Q}return()=>{!T.delete(ie)||P||me({..._e,type:"workspace-unsubscribe",id:$e(H),payload:{subscriptionId:ie}})}},I=async(M,C)=>{M.kind==="session"&&pe(M.sessionId),M.kind==="project"&&pe(M.projectId);let ie=$e(H);y.set(ie,C);try{await ae({..._e,type:"shells-subscribe",id:$e(H),payload:{subscriptionId:ie,scope:M}})}catch(Q){throw y.delete(ie),P||me({..._e,type:"shells-unsubscribe",id:$e(H),payload:{subscriptionId:ie}}),Q}return()=>{!y.delete(ie)||P||me({..._e,type:"shells-unsubscribe",id:$e(H),payload:{subscriptionId:ie}})}},v=async M=>{if("key"in M&&(M.key.length===0||M.key.length>128))throw new Be("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(M.op==="set"&&!ds(M.value))throw new Be("HOST_REJECTED","Storage values must be JSON.");if(M.op==="set"&&new TextEncoder().encode(JSON.stringify(M.value)).length>65536)throw new Be("HOST_REJECTED","Storage value exceeds 64 KiB.");if(M.scope==="device"&&L?.features?.deviceStorage!==!0)throw new Be("UNSUPPORTED","This host does not support device storage.");let C=await ee({..._e,type:"storage",id:$e(H),payload:M});if(!C||!("storage"in C)||C.op!==M.op)throw new Be("HOST_REJECTED","Host did not return storage data.");return C},q=(M,C)=>L?.features?.popovers!==!0&&!(L?.surface==="popover"&&L.popover?.id===M)?Promise.reject(new Be("UNSUPPORTED","This host does not support popovers.")):ae({..._e,type:"popover-close",id:$e(H),payload:C?{id:M,reason:C}:{id:M}}),ne=(M,C)=>L?.features?.popovers!==!0&&!(L?.surface==="popover"&&L.popover?.id===M)?Promise.reject(new Be("UNSUPPORTED","This host does not support popovers.")):ae({..._e,type:"popover-anchor",id:$e(H),payload:{id:M,active:C}});return e.addEventListener("keydown",oe,!0),e.addEventListener("pointerover",k),e.addEventListener("pointermove",k),e.addEventListener("pointerout",Pe),e.addEventListener("focus",ue),e.addEventListener("blur",Me),{onAction:M=>(S=M,()=>{S===M&&(S=null)}),listProjects:async()=>{let M=await Fe({kind:"projects"});if(M.kind!=="projects")throw new Be("HOST_REJECTED","Expected projects.");return M},listWorktrees:async M=>{let C=await Fe({kind:"worktrees",projectId:M});if(C.kind!=="worktrees")throw new Be("HOST_REJECTED","Expected worktrees.");return C},listSessions:async M=>{let C=await Fe({kind:"sessions",projectId:M});if(C.kind!=="sessions")throw new Be("HOST_REJECTED","Expected sessions.");return C},onProjects:M=>ve({kind:"projects"},C=>{C.kind==="projects"&&M(C)}),onWorktrees:(M,C)=>ve({kind:"worktrees",projectId:M},ie=>{ie.kind==="worktrees"&&C(ie)}),onSessions:(M,C)=>ve({kind:"sessions",projectId:M},ie=>{ie.kind==="sessions"&&C(ie)}),onRunningShells:(M,C)=>I(M,C),readShellOutput:async(M,C)=>{pe(M,128);let ie=C?.cursor;if(ie!==void 0&&(!Number.isInteger(ie)||ie<0))throw new Be("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let Q=C?.tailBytes;if(Q!==void 0&&(!Number.isInteger(Q)||Q<1||Q>65536))throw new Be("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let we=await ee({..._e,type:"shell-output",id:$e(H),payload:{shellId:M,cursor:ie,tailBytes:Q}});if(!we||typeof we.output!="string"||!Number.isFinite(we.cursor))throw new Be("HOST_REJECTED","Host did not return shell output.");return we},stopShell:async M=>{if(pe(M,128),(await ee({..._e,type:"shell-stop",id:$e(H),payload:{shellId:M}}))?.stopped!==!0)throw new Be("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async M=>{pe(M),await ae({..._e,type:"open-session",id:$e(H),payload:{sessionId:M}})},storage:{get:async(M,C)=>{let ie=Eo(C),Q={op:"get",key:M};ie&&(Q.scope=ie);let ce=await v(Q);return ce.op==="get"&&ce.found?ce.value:void 0},set:async(M,C,ie)=>{let Q=Eo(ie),ce={op:"set",key:M,value:C};Q&&(ce.scope=Q),await v(ce)},delete:async(M,C)=>{let ie=Eo(C),Q={op:"delete",key:M};ie&&(Q.scope=ie),await v(Q)},keys:async M=>{let C=Eo(M),ie={op:"keys"};C&&(ie.scope=C);let Q=await v(ie);if(Q.op!=="keys")throw new Be("HOST_REJECTED","Expected storage keys.");return Q.keys}},onReady:M=>(s.add(M),L&&M(L),()=>{s.delete(M)}),onDirectory:M=>(r.add(M),L&&M(L.directory),()=>{r.delete(M)}),onSession:M=>(o.add(M),L&&M(L.session),()=>{o.delete(M)}),onSessionLifecycle:M=>(a.add(M),F&&M(F),()=>{a.delete(M)}),onConnection:M=>(l.add(M),L&&M(L.connection),()=>{l.delete(M)}),onSettings:M=>(c.add(M),L&&M(L.settings),()=>{c.delete(M)}),onItem:M=>(u.add(M),L&&M(L.item),()=>{u.delete(M)}),onBlock:M=>(h.add(M),L?.block&&M(L.block),()=>{h.delete(M)}),onServiceEvent:M=>(f.add(M),()=>{f.delete(M)}),onStatusControl:M=>(d.add(M),()=>{d.delete(M)}),onPopoverClosed:M=>(m.add(M),()=>{m.delete(M)}),setStatusControls:M=>L?.features?.statusControls!==!0?Promise.reject(new Be("UNSUPPORTED","This host does not support status controls.")):zh(M)?ae({..._e,type:"status-controls",id:$e(H),payload:{controls:M}}):Promise.reject(new Be("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:M=>L?.features?.popovers!==!0?Promise.reject(new Be("UNSUPPORTED","This host does not support popovers.")):fc(M)?ae({..._e,type:"popover-open",id:$e(H),payload:M}):Promise.reject(new Be("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:q,setPopoverAnchorActive:ne,onResolve:M=>(p=M,()=>{p===M&&(p=null)}),toast:M=>{let C=M.message.trim();return!C||C.length>co?Promise.reject(new Be("HOST_REJECTED",`Toast message must contain 1 to ${co} characters.`)):M.copy&&M.copy!==!0&&(!M.copy.text.length||M.copy.text.length>lo)?Promise.reject(new Be("HOST_REJECTED",`Toast copy text must contain 1 to ${lo} characters.`)):ae({channel:st,v:1,type:"toast",id:$e(H),payload:{...M,message:C}})},openUrl:M=>ae({channel:st,v:1,type:"open-url",id:$e(H),payload:{url:M}}),openCommit:M=>Ec(M)?ae({channel:st,v:1,type:"open-commit",id:$e(H),payload:{sha:M}}):Promise.reject(new Be("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:M=>ae({channel:st,v:1,type:"block-answer",id:$e(H),payload:{text:M.trim().slice(0,mc)}}),openSurface:M=>ae({channel:st,v:1,type:"open-surface",id:$e(H),payload:{surfaceId:M}}),writeClipboard:M=>ae({channel:st,v:1,type:"clipboard-write",id:$e(H),payload:{text:M}}),compose:M=>ae({channel:st,v:1,type:"compose",id:$e(H),payload:M}),attach:M=>ae({channel:st,v:1,type:"attach",id:$e(H),payload:fs(M)}),startSession:async M=>{M.projectId!==void 0&&pe(M.projectId);let C=M.worktree;C&&C!==!0&&(C.kind==="existing"?pe(C.directory):(C.name!==void 0&&pe(C.name,200),C.baseBranch!==void 0&&pe(C.baseBranch,200)));let ie=await ee({channel:st,v:1,type:"start-session",id:$e(H),payload:Tc(M)},n.requestTimeoutMs??18e4);if(!gc(ie))throw new Be("HOST_REJECTED","Host did not return a session.");return ie},prompt:M=>ee({channel:st,v:1,type:"prompt",id:$e(H),payload:vc(M)}).then(C=>{if(!_c(C))throw new Be("HOST_REJECTED","Host did not return a prompt result.");return C}),sessionLink:M=>ae({channel:st,v:1,type:"session-link",id:$e(H),payload:fs(M)}),close:()=>ae({channel:st,v:1,type:"close",id:$e(H)}),oauthStart:()=>ae({channel:st,v:1,type:"oauth-start",id:$e(H)}),oauthDisconnect:()=>ae({channel:st,v:1,type:"oauth-disconnect",id:$e(H)}),request:M=>(mo(M.path)?ee({channel:st,v:1,type:"request",id:$e(H),payload:M}):pd()).then(C=>{if(!go(C))throw new Be("HOST_REJECTED","Host request result was empty.");return C}),serviceRequest:M=>(mo(M.path)?ee({channel:st,v:1,type:"service-request",id:$e(H),payload:M}):pd()).then(C=>{if(!go(C))throw new Be("HOST_REJECTED","Host service request result was empty.");return C}),serviceStatus:()=>ee({channel:st,v:1,type:"service-status",id:$e(H)}).then(M=>{if(!Ac(M))throw new Be("HOST_REJECTED","Host did not return service status.");return M}),readFile:M=>(ps(M)?ee({channel:st,v:1,type:"file-read",id:$e(H),payload:{path:M}}):_o()).then(C=>{if(!wc(C))throw new Be("HOST_REJECTED","Host did not return file content.");return C}),writeFile:(M,C)=>ps(M)?C.length>ho?Promise.reject(new Be("FILE_TOO_LARGE",`Content is over ${ho} characters.`)):ee({channel:st,v:1,type:"file-write",id:$e(H),payload:{path:M,content:C}}).then(ie=>{if(!Rc(ie))throw new Be("HOST_REJECTED","Host did not confirm the write.");return ie}):_o(),listDir:M=>(ps(M)?ee({channel:st,v:1,type:"file-list",id:$e(H),payload:{path:M}}):_o()).then(C=>{if(!Cc(C))throw new Be("HOST_REJECTED","Host did not return directory entries.");return C}),stat:M=>(ps(M)?ee({channel:st,v:1,type:"file-stat",id:$e(H),payload:{path:M}}):_o()).then(C=>{if(!Ic(C))throw new Be("HOST_REJECTED","Host did not return file status.");return C}),generate:M=>{let C=M.prompt.trim(),ie=M.system?.trim();if(C.length===0||C.length>fo)return Promise.reject(new Be("HOST_REJECTED",`Prompt must be 1 to ${fo} characters.`));if(ie!==void 0&&(ie.length===0||ie.length>po))return Promise.reject(new Be("HOST_REJECTED",`System prompt must be 1 to ${po} characters.`));let Q=M.maxOutputTokens===void 0?void 0:Math.min(yc,Math.max(1,Math.floor(M.maxOutputTokens)));if(Q!==void 0&&!Number.isFinite(Q))return Promise.reject(new Be("HOST_REJECTED","maxOutputTokens must be a number."));let ce={prompt:C};return ie!==void 0&&(ce.system=ie),Q!==void 0&&(ce.maxOutputTokens=Q),ee({channel:st,v:1,type:"generate",id:$e(H),payload:ce},n.requestTimeoutMs??Sc).then(we=>{if(!Pc(we))throw new Be("HOST_REJECTED","Host did not return generated text.");return we})},onLateGenerateResult:M=>{_.add(M);for(let C of g.splice(0))be([M],C);return Te(),()=>{_.delete(M)}},openMicrophone:ze,setBadge:M=>ae({channel:st,v:1,type:"badge",id:$e(H),payload:{count:Mc(M)}}),setHeight:M=>ae({channel:st,v:1,type:"resize",id:$e(H),payload:{height:bc(M)}}),onFileOpen:M=>(x.add(M),O||(O=!0,e.addEventListener("keydown",je,!0)),R&&M(R),()=>{x.delete(M)}),onFileSnapshot:M=>(D=M,()=>{D===M&&(D=null)}),onFileSaved:M=>(E.add(M),()=>{E.delete(M)}),reportFileChange:M=>ge({..._e,type:"file-change",payload:{dirty:M.dirty,edited:M.edited}}),requestFileSave:De,reportFileUnsupported:()=>ge({..._e,type:"file-unsupported"}),dispose:()=>{for(let M of T.keys())me({..._e,type:"workspace-unsubscribe",id:$e(H),payload:{subscriptionId:M}});T.clear();for(let M of y.keys())me({..._e,type:"shells-unsubscribe",id:$e(H),payload:{subscriptionId:M}});y.clear(),Y&&(We(),Y.release(),Y=null),P=!0,p=null,S=null,D=null,x.clear(),E.clear(),O&&e.removeEventListener("keydown",je,!0),e.removeEventListener("message",nt),e.removeEventListener("keydown",oe,!0),e.removeEventListener("pointerover",k),e.removeEventListener("pointermove",k),e.removeEventListener("pointerout",Pe),e.removeEventListener("focus",ue),e.removeEventListener("blur",Me);for(let M of U.values())clearTimeout(M.timer),M.reject(new Be("HOST_UNAVAILABLE","Host client was disposed."));U.clear(),s.clear(),r.clear(),o.clear(),a.clear(),l.clear(),c.clear(),u.clear(),h.clear(),f.clear(),d.clear(),m.clear(),_.clear(),g.length=0}}};var yd=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var vv=new Set(yd);var Gm=10*6e4;var Vm=10*6e4;var Wm=10*6e4;var Xm=10*6e4;var Sd=["none","agent","user"];var bv=new Set(Sd);var $m=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],qm=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Td=(n,e)=>{e.style.colorScheme=n.mode;for(let[t,i]of $m)e.style.setProperty(t,n.tokens[i]);for(let[t,i,s]of qm){let r=n.tokens[s]??"";e.style.setProperty(t,r),e.style.setProperty(i,r)}e.style.setProperty("font-family",n.tokens.font),e.style.setProperty("font-size",n.tokens.fontSize??"0.875rem"),e.style.setProperty("line-height","1.45"),e.style.setProperty("color",n.tokens.foreground)},Hc=(n,e)=>{Td(n.theme,e),e.dataset&&(e.dataset.ocSurface=n.surface,e.dataset.ocTheme=n.theme.mode)};var Ym={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},vt=(n,e)=>`var(--${n}, var(--oc-${Ym[n]}, ${e}))`,Vn=vt("surface-background","transparent"),yo=vt("surface-elevated","transparent"),ms=vt("surface-elevated-foreground","inherit"),ln=vt("surface-foreground","inherit"),wt=vt("surface-muted-foreground","gray"),Km=vt("surface-muted","transparent"),ki=vt("interactive-border","currentColor"),nn=vt("interactive-hover","transparent"),Hi=vt("interactive-active","transparent"),Fc=vt("interactive-selection","transparent"),Bc=vt("interactive-selection-foreground","inherit"),Gn=vt("primary","currentColor"),zc=vt("primary-text","inherit"),Gc=vt("error-text","inherit"),Zm=vt("font-sans","inherit"),Vc=vt("font-mono","monospace"),Ad=vt("radius","9px"),Wc=`calc(${Ad} - 2px)`,vd=`calc(${Ad} - 4px)`,Rt=(n,e,t="transparent")=>`color-mix(in srgb, ${n} ${e}%, ${t})`,Md=`background-image: linear-gradient(${nn}, ${nn});`,Xc=(n,e="0.5px")=>`box-shadow: inset 0 0 0 ${e} ${n}, var(--oc-sdk-field-lift);`,$c="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",bd="box-shadow: var(--oc-sdk-lit);",qc=`inset 0 0.5px 0 0 ${Rt(ln,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Jm=`
:root {
  --oc-sdk-edge: ${Rt(ln,16)};
  --oc-sdk-field-bg: ${yo};
  --oc-sdk-raised-bg: ${Vn};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${Rt(ln,14)};
  --oc-sdk-field-bg: ${Rt(Vn,50,yo)};
  --oc-sdk-raised-bg: ${yo};
  --oc-sdk-field-lift: ${qc};
  --oc-sdk-raised-lift: ${qc};
  --oc-sdk-lit: ${qc};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,xo=n=>{let e=vt(`status-${n}`,"currentColor");return`
.oc-sdk[data-tone="${n}"], .oc-sdk [data-tone="${n}"] { --oc-sdk-tone: ${e}; --oc-sdk-tone-text: ${vt(`${n}-text`,"inherit")}; }`},de=n=>`calc(${n}rem / 14)`,jm=`
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: ${de(8)}; height: ${de(32)}; padding: 0 ${de(12)}; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: ${de(6)}; height: ${de(28)}; padding: 0 ${de(10)}; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: ${de(4)}; height: ${de(24)}; padding: 0 ${de(8)}; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: ${de(14)}; height: ${de(14)}; }

.oc-sdk-field { display: flex; flex-direction: column; gap: ${de(4)}; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: ${de(32)}; padding: 0 ${de(10)}; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: ${de(8)} ${de(10)}; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: ${de(34)}; padding-right: ${de(34)}; }
.oc-sdk-search-icon { position: absolute; left: ${de(11)}; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: ${de(6)}; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: ${de(24)}; height: ${de(24)}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: ${de(4)}; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: ${de(6)}; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: ${de(28)}; padding: 0 ${de(10)}; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: ${de(2)}; min-width: ${de(160)}; max-width: calc(100vw - ${de(16)}); max-height: min(${de(320)}, calc(100vh - ${de(16)})); overflow: auto; padding: ${de(4)}; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: ${de(2)} ${de(2)} ${de(4)}; }
.oc-sdk-popup-search .oc-sdk-input { height: ${de(28)}; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: ${de(8)}; width: 100%; padding: ${de(6)} ${de(8)}; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: ${de(14)}; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: ${de(8)}; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: ${de(8)}; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: ${de(14)}; height: ${de(14)}; margin-top: ${de(3)}; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: ${de(36)}; height: ${de(20)}; --oc-sdk-thumb-travel: ${de(16)}; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: ${de(2)}; left: ${de(2)}; width: ${de(16)}; height: ${de(16)}; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: ${de(2)}; padding: ${de(2)}; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: ${de(6)}; height: ${de(28)}; padding: 0 ${de(10)}; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: ${de(1)} ${de(6)}; font-size: ${de(11)}; font-weight: 500; line-height: ${de(16)}; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: ${de(8)}; width: 100%; padding: ${de(6)} ${de(8)}; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: ${de(64)}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: ${de(16)} ${de(8)}; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${de(4)}; padding: ${de(40)} ${de(16)}; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: ${de(12)}; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: ${de(8)}; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: ${de(16)}; height: ${de(16)}; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: ${de(12)}; height: ${de(12)}; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: ${de(12)}; padding: ${de(8)} ${de(12)}; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: ${de(2)}; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: ${de(8)}; width: 100%; margin: ${de(8)} 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: ${de(4)} 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: ${de(4)}; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: ${de(6)}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: ${de(2)}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: ${de(8)} 0; }

/* Under a finger the controls reach the app's touch sizes: rows and options 44px like its sheets, every other
   control at least 36px. Inputs keep 16px text, below which iOS zooms the page on focus. */
@media (pointer: coarse) {
  .oc-sdk-btn, .oc-sdk-input { height: ${de(40)}; }
  .oc-sdk-btn[data-size="sm"], .oc-sdk-btn[data-size="xs"], .oc-sdk-trigger, .oc-sdk-tab, .oc-sdk-popup-search .oc-sdk-input { height: ${de(36)}; }
  .oc-sdk-input, .oc-sdk-popup-search .oc-sdk-input { font-size: max(16px, 0.875rem); }
  .oc-sdk-search-clear { width: ${de(36)}; height: ${de(36)}; right: 0; }
  .oc-sdk-row, .oc-sdk-option { min-height: ${de(44)}; }
  .oc-sdk-check { min-height: ${de(36)}; padding: ${de(8)} 0; }
}
`,wd=`${Jm}
.oc-sdk { color: ${ln}; font-family: ${Zm}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Md} }
.oc-sdk-mono { font-family: ${Vc}; }
.oc-sdk-muted { color: ${wt}; }
${xo("success")}${xo("warning")}${xo("error")}${xo("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${Gn}; --oc-sdk-tone-text: ${zc}; }

.oc-sdk-btn { border-radius: ${Wc}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${vd}; }
.oc-sdk-btn[data-variant="default"] { color: ${zc}; background: ${Rt(Gn,10,Vn)}; border-color: ${Rt(Gn,12)}; ${bd} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${Rt(Gn,16,Vn)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${Rt(Gn,22,Vn)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Km}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${nn}, ${nn}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Hi}, ${Hi}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${ms}; ${$c} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${nn}, ${nn}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Hi}, ${Hi}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${nn}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Hi}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${vt("status-error","red")}; color: ${Gc}; background: ${Rt("var(--oc-sdk-tone)",7,Vn)}; border-color: ${Rt("var(--oc-sdk-tone)",12)}; ${bd} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${Rt("var(--oc-sdk-tone)",9,Vn)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${Rt("var(--oc-sdk-tone)",11,Vn)}; box-shadow: none; }

.oc-sdk-field-note { color: ${wt}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Gc}; }
.oc-sdk-input { border-radius: ${Wc}; background: var(--oc-sdk-field-bg); color: ${ms}; ${Xc("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${wt}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${nn}, ${nn}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Xc(Rt(ln,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Xc(vt("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Vc}; }

.oc-sdk-search-icon { color: ${wt}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${Gn}; }
.oc-sdk-search-clear { border-radius: ${vd}; color: ${wt}; }
.oc-sdk-search-clear:hover { background: ${nn}; color: ${ln}; }

.oc-sdk-trigger { border-radius: ${Wc}; background: var(--oc-sdk-raised-bg); color: ${ms}; ${$c} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${nn}, ${nn}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Hi}, ${Hi}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${wt}; }
.oc-sdk-trigger-chevron { color: ${wt}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${ms}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${yo}; background-clip: padding-box; color: ${ms}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${nn}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Fc}; color: ${Bc}; }
.oc-sdk-option-check { color: ${ln}; }
.oc-sdk-option[data-destructive="true"] { color: ${Gc}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${Rt(vt("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${wt}; }
.oc-sdk-popup-empty { color: ${wt}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${ki}; border-radius: 4px; color: ${ln}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${Rt(ln,60,ki)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${ki}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${Vn}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${Gn}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Md} }
.oc-sdk-check-desc { color: ${wt}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${Rt(ln,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${wt}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${ln}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Bc}; background: ${Fc}; border-color: ${ki}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${ms}; background: var(--oc-sdk-raised-bg); ${$c} }
.oc-sdk-tab-count { color: ${wt}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${Rt(ln,6)}; color: ${wt}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${Rt("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${nn}; }
.oc-sdk-row[aria-selected="true"] { background: ${Fc}; color: ${Bc}; }
.oc-sdk-row-lead { font-family: ${Vc}; color: ${wt}; }
.oc-sdk-row-sub { color: ${wt}; }
.oc-sdk-row-meta { color: ${wt}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${wt}; }

.oc-sdk-empty-body { color: ${wt}; }

.oc-sdk-spinner { color: ${wt}; }
.oc-sdk-spinner-ring { border-color: ${ki}; border-top-color: ${Gn}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${Rt("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${wt}; }

.oc-sdk-separator { color: ${wt}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${Rt(ki,40)}; }

.oc-sdk-progress-label { color: ${wt}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${Rt(ln,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${Gn}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${vt("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${vt("success-text","inherit")}; }

.oc-sdk-text a { color: ${zc}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${Rt(ki,60)}; }
`,$t=`
${cc}
${jm}
${wd}`;var Rd="oc-sdk-ui-style",gs=n=>{for(;n.firstChild;)n.removeChild(n.firstChild)},qt=n=>{let e=document.getElementById(Rd);if(e instanceof HTMLStyleElement){e.textContent!==n&&(e.textContent=n);return}lc(document);let t=document.createElement("style");t.id=Rd,t.textContent=n,document.head.appendChild(t)},Nt=(n,e)=>{let t=document.createElement(n);return e&&(t.className=e),t},gi=n=>{let e=Nt("button",n);return e.type="button",e};var _s=(n,e="vertical")=>{let[t,i]=e==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return n.key===t||n.ctrlKey&&n.key.toLowerCase()==="n"?"next":n.key===i||n.ctrlKey&&n.key.toLowerCase()==="p"?"previous":n.key==="Home"?"first":n.key==="End"?"last":null},Es=(n,e,t)=>{let i=n.filter(l=>!l.disabled);if(i.length===0)return null;let s=i[0],r=i[i.length-1];if(t==="first"||!s||!r)return s?.id??null;if(t==="last")return r.id;let o=i.findIndex(l=>l.id===e);return o===-1?t==="next"?s.id:r.id:i[Math.min(i.length-1,Math.max(0,o+(t==="next"?1:-1)))]?.id??null};var Yc=(n,e)=>{qt($t);let t=e,i=Nt("div","oc-sdk oc-sdk-tabs");i.setAttribute("role","tablist"),n.append(i);let s=()=>{gs(i),i.dataset.track=t.trackBackground?"true":"false";for(let o of t.items){let a=gi("oc-sdk-tab");a.setAttribute("role","tab");let l=o.id===t.activeId;a.setAttribute("aria-selected",l?"true":"false"),a.tabIndex=l?0:-1,a.dataset.id=o.id;let c=Nt("span");if(c.textContent=o.label,a.append(c),o.count!==void 0){let u=Nt("span","oc-sdk-tab-count");u.textContent=String(o.count),a.append(u)}a.addEventListener("click",()=>{o.id!==t.activeId&&t.onChange(o.id)}),i.append(a)}},r=o=>{let a=_s(o,"horizontal");if(!a)return;let l=Es(t.items,t.activeId,a);if(l&&l!==t.activeId){o.preventDefault(),t.onChange(l);let c=i.querySelector(`[data-id="${CSS.escape(l)}"]`);c instanceof HTMLElement&&c.focus()}};return i.addEventListener("keydown",r),s(),{update:o=>{t={...t,...o},s()},dispose:()=>{i.removeEventListener("keydown",r),i.remove()}}};var ts={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},ns={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},ig=0,Cd=1,sg=2;var Wf=1,Ju=2,Zn=3,Ai=0,sn=1,Wt=2,Mi=0,ks=1,ei=2,Id=3,Pd=4,rg=5,$i=100,og=101,ag=102,cg=103,lg=104,ug=200,hg=201,dg=202,fg=203,Cl=204,Il=205,pg=206,mg=207,gg=208,_g=209,Eg=210,xg=211,yg=212,Sg=213,Tg=214,Pl=0,Ol=1,Ul=2,zs=3,Ll=4,Nl=5,Dl=6,kl=7,Xf=0,vg=1,Mg=2,bi=0,bg=1,Ag=2,wg=3,ju=4,Rg=5,Cg=6,Ig=7;var $f=300,Gs=301,Vs=302,Hl=303,Fl=304,Da=306,Ws=1e3,Jn=1001,Bl=1002,dn=1003,Pg=1004;var To=1005;var Un=1006,Zc=1007;var Ki=1008;var ti=1009,qf=1010,Yf=1011,Pr=1012,Qu=1013,Zi=1014,Ln=1015,Wr=1016,eh=1017,th=1018,Xs=1020,Kf=35902,Zf=1021,Jf=1022,An=1023,jf=1024,Qf=1025,Hs=1026,$s=1027,nh=1028,ih=1029,ep=1030,sh=1031;var rh=1033,Zo=33776,Jo=33777,jo=33778,Qo=33779,zl=35840,Gl=35841,Vl=35842,Wl=35843,Xl=36196,$l=37492,ql=37496,Yl=37808,Kl=37809,Zl=37810,Jl=37811,jl=37812,Ql=37813,eu=37814,tu=37815,nu=37816,iu=37817,su=37818,ru=37819,ou=37820,au=37821,ea=36492,cu=36494,lu=36495,tp=36283,uu=36284,hu=36285,du=36286;var ta=2300,fu=2301,Jc=2302,Od=2400,Ud=2401,Ld=2402;var Og=3200,Ug=3201;var np=0,Lg=1,vi="",Pt="srgb",js="srgb-linear",ka="linear",pt="srgb";var xs=7680;var Nd=519,Ng=512,Dg=513,kg=514,ip=515,Hg=516,Fg=517,Bg=518,zg=519,Dd=35044;var kd="300 es",jn=2e3,na=2001,ni=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let s=this._listeners[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let i=this._listeners[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},Yt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Hd=1234567,br=Math.PI/180,Or=180/Math.PI;function is(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Yt[n&255]+Yt[n>>8&255]+Yt[n>>16&255]+Yt[n>>24&255]+"-"+Yt[e&255]+Yt[e>>8&255]+"-"+Yt[e>>16&15|64]+Yt[e>>24&255]+"-"+Yt[t&63|128]+Yt[t>>8&255]+"-"+Yt[t>>16&255]+Yt[t>>24&255]+Yt[i&255]+Yt[i>>8&255]+Yt[i>>16&255]+Yt[i>>24&255]).toLowerCase()}function Ut(n,e,t){return Math.max(e,Math.min(t,n))}function oh(n,e){return(n%e+e)%e}function Gg(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function Vg(n,e,t){return n!==e?(t-n)/(e-n):0}function Ar(n,e,t){return(1-t)*n+t*e}function Wg(n,e,t,i){return Ar(n,e,1-Math.exp(-t*i))}function Xg(n,e=1){return e-Math.abs(oh(n,e*2)-e)}function $g(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function qg(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function Yg(n,e){return n+Math.floor(Math.random()*(e-n+1))}function Kg(n,e){return n+Math.random()*(e-n)}function Zg(n){return n*(.5-Math.random())}function Jg(n){n!==void 0&&(Hd=n);let e=Hd+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function jg(n){return n*br}function Qg(n){return n*Or}function e0(n){return(n&n-1)===0&&n!==0}function t0(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function n0(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function i0(n,e,t,i,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+i)/2),u=o((e+i)/2),h=r((e-i)/2),f=o((e-i)/2),d=r((i-e)/2),m=o((i-e)/2);switch(s){case"XYX":n.set(a*u,l*h,l*f,a*c);break;case"YZY":n.set(l*f,a*u,l*h,a*c);break;case"ZXZ":n.set(l*h,l*f,a*u,a*c);break;case"XZX":n.set(a*u,l*m,l*d,a*c);break;case"YXY":n.set(l*d,a*u,l*m,a*c);break;case"ZYZ":n.set(l*m,l*d,a*u,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Ls(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function jt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var Ha={DEG2RAD:br,RAD2DEG:Or,generateUUID:is,clamp:Ut,euclideanModulo:oh,mapLinear:Gg,inverseLerp:Vg,lerp:Ar,damp:Wg,pingpong:Xg,smoothstep:$g,smootherstep:qg,randInt:Yg,randFloat:Kg,randFloatSpread:Zg,seededRandom:Jg,degToRad:jg,radToDeg:Qg,isPowerOfTwo:e0,ceilPowerOfTwo:t0,floorPowerOfTwo:n0,setQuaternionFromProperEuler:i0,normalize:jt,denormalize:Ls},le=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ut(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ze=class n{constructor(e,t,i,s,r,o,a,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],h=i[7],f=i[2],d=i[5],m=i[8],_=s[0],g=s[3],p=s[6],S=s[1],x=s[4],E=s[7],D=s[2],R=s[5],O=s[8];return r[0]=o*_+a*S+l*D,r[3]=o*g+a*x+l*R,r[6]=o*p+a*E+l*O,r[1]=c*_+u*S+h*D,r[4]=c*g+u*x+h*R,r[7]=c*p+u*E+h*O,r[2]=f*_+d*S+m*D,r[5]=f*g+d*x+m*R,r[8]=f*p+d*E+m*O,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*r*u+i*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,f=a*l-u*r,d=c*r-o*l,m=t*h+i*f+s*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/m;return e[0]=h*_,e[1]=(s*c-u*i)*_,e[2]=(a*i-s*o)*_,e[3]=f*_,e[4]=(u*t-s*l)*_,e[5]=(s*r-a*t)*_,e[6]=d*_,e[7]=(i*l-c*t)*_,e[8]=(o*t-i*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(jc.makeScale(e,t)),this}rotate(e){return this.premultiply(jc.makeRotation(-e)),this}translate(e,t){return this.premultiply(jc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},jc=new Ze;function sp(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function ia(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function s0(){let n=ia("canvas");return n.style.display="block",n}var Fd={};function vr(n){n in Fd||(Fd[n]=!0,console.warn(n))}function r0(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}function o0(n){let e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function a0(n){let e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var lt={enabled:!0,workingColorSpace:js,spaces:{},convert:function(n,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===pt&&(n.r=Qn(n.r),n.g=Qn(n.g),n.b=Qn(n.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(n.applyMatrix3(this.spaces[e].toXYZ),n.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===pt&&(n.r=Fs(n.r),n.g=Fs(n.g),n.b=Fs(n.b))),n},fromWorkingColorSpace:function(n,e){return this.convert(n,this.workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===vi?ka:this.spaces[n].transfer},getLuminanceCoefficients:function(n,e=this.workingColorSpace){return n.fromArray(this.spaces[e].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,e,t){return n.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace}};function Qn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Fs(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Bd=[.64,.33,.3,.6,.15,.06],zd=[.2126,.7152,.0722],Gd=[.3127,.329],Vd=new Ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Wd=new Ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);lt.define({[js]:{primaries:Bd,whitePoint:Gd,transfer:ka,toXYZ:Vd,fromXYZ:Wd,luminanceCoefficients:zd,workingColorSpaceConfig:{unpackColorSpace:Pt},outputColorSpaceConfig:{drawingBufferColorSpace:Pt}},[Pt]:{primaries:Bd,whitePoint:Gd,transfer:pt,toXYZ:Vd,fromXYZ:Wd,luminanceCoefficients:zd,outputColorSpaceConfig:{drawingBufferColorSpace:Pt}}});var ys,pu=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{ys===void 0&&(ys=ia("canvas")),ys.width=e.width,ys.height=e.height;let i=ys.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=ys}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ia("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Qn(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Qn(t[i]/255)*255):t[i]=Qn(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},c0=0,sa=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:c0++}),this.uuid=is(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Qc(s[o].image)):r.push(Qc(s[o]))}else r=Qc(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function Qc(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?pu.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var l0=0,rn=class n extends ni{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Jn,s=Jn,r=Un,o=Ki,a=An,l=ti,c=n.DEFAULT_ANISOTROPY,u=vi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:l0++}),this.uuid=is(),this.name="",this.source=new sa(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new le(0,0),this.repeat=new le(1,1),this.center=new le(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==$f)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ws:e.x=e.x-Math.floor(e.x);break;case Jn:e.x=e.x<0?0:1;break;case Bl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ws:e.y=e.y-Math.floor(e.y);break;case Jn:e.y=e.y<0?0:1;break;case Bl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};rn.DEFAULT_IMAGE=null;rn.DEFAULT_MAPPING=$f;rn.DEFAULT_ANISOTROPY=1;var mt=class n{constructor(e=0,t=0,i=0,s=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,l=e.elements,c=l[0],u=l[4],h=l[8],f=l[1],d=l[5],m=l[9],_=l[2],g=l[6],p=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-_)<.01&&Math.abs(m-g)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+_)<.1&&Math.abs(m+g)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,E=(d+1)/2,D=(p+1)/2,R=(u+f)/4,O=(h+_)/4,U=(m+g)/4;return x>E&&x>D?x<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(x),s=R/i,r=O/i):E>D?E<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(E),i=R/s,r=U/s):D<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(D),i=O/r,s=U/r),this.set(i,s,r,t),this}let S=Math.sqrt((g-m)*(g-m)+(h-_)*(h-_)+(f-u)*(f-u));return Math.abs(S)<.001&&(S=1),this.x=(g-m)/S,this.y=(h-_)/S,this.z=(f-u)/S,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},mu=class extends ni{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new mt(0,0,e,t),this.scissorTest=!1,this.viewport=new mt(0,0,e,t);let s={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Un,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);let r=new rn(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);r.flipY=!1,r.generateMipmaps=i.generateMipmaps,r.internalFormat=i.internalFormat,this.textures=[];let o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,s=e.textures.length;i<s;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new sa(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},ii=class extends mu{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},ra=class extends rn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=dn,this.minFilter=dn,this.wrapR=Jn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var gu=class extends rn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=dn,this.minFilter=dn,this.wrapR=Jn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var zt=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],u=i[s+2],h=i[s+3],f=r[o+0],d=r[o+1],m=r[o+2],_=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=f,e[t+1]=d,e[t+2]=m,e[t+3]=_;return}if(h!==_||l!==f||c!==d||u!==m){let g=1-a,p=l*f+c*d+u*m+h*_,S=p>=0?1:-1,x=1-p*p;if(x>Number.EPSILON){let D=Math.sqrt(x),R=Math.atan2(D,p*S);g=Math.sin(g*R)/D,a=Math.sin(a*R)/D}let E=a*S;if(l=l*g+f*E,c=c*g+d*E,u=u*g+m*E,h=h*g+_*E,g===1-a){let D=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=D,c*=D,u*=D,h*=D}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,s,r,o){let a=i[s],l=i[s+1],c=i[s+2],u=i[s+3],h=r[o],f=r[o+1],d=r[o+2],m=r[o+3];return e[t]=a*m+u*h+l*d-c*f,e[t+1]=l*m+u*f+c*h-a*d,e[t+2]=c*m+u*d+a*f-l*h,e[t+3]=u*m-a*h-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(s/2),h=a(r/2),f=l(i/2),d=l(s/2),m=l(r/2);switch(o){case"XYZ":this._x=f*u*h+c*d*m,this._y=c*d*h-f*u*m,this._z=c*u*m+f*d*h,this._w=c*u*h-f*d*m;break;case"YXZ":this._x=f*u*h+c*d*m,this._y=c*d*h-f*u*m,this._z=c*u*m-f*d*h,this._w=c*u*h+f*d*m;break;case"ZXY":this._x=f*u*h-c*d*m,this._y=c*d*h+f*u*m,this._z=c*u*m+f*d*h,this._w=c*u*h-f*d*m;break;case"ZYX":this._x=f*u*h-c*d*m,this._y=c*d*h+f*u*m,this._z=c*u*m-f*d*h,this._w=c*u*h+f*d*m;break;case"YZX":this._x=f*u*h+c*d*m,this._y=c*d*h+f*u*m,this._z=c*u*m-f*d*h,this._w=c*u*h-f*d*m;break;case"XZY":this._x=f*u*h-c*d*m,this._y=c*d*h-f*u*m,this._z=c*u*m+f*d*h,this._w=c*u*h+f*d*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],f=i+a+h;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(u-l)*d,this._y=(r-c)*d,this._z=(o-s)*d}else if(i>a&&i>h){let d=2*Math.sqrt(1+i-a-h);this._w=(u-l)/d,this._x=.25*d,this._y=(s+o)/d,this._z=(r+c)/d}else if(a>h){let d=2*Math.sqrt(1+a-i-h);this._w=(r-c)/d,this._x=(s+o)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+h-i-a);this._w=(o-s)/d,this._x=(r+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ut(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-i*c,this._z=r*u+o*c+i*l-s*a,this._w=o*u-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+i*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let d=1-t;return this._w=d*o+t*this._w,this._x=d*i+t*this._x,this._y=d*s+t*this._y,this._z=d*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,f=Math.sin(t*u)/c;return this._w=o*h+this._w*f,this._x=i*h+this._x*f,this._y=s*h+this._y*f,this._z=r*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},N=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Xd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Xd.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),u=2*(a*t-r*s),h=2*(r*i-o*t);return this.x=t+l*c+o*h-a*u,this.y=i+l*u+a*c-r*h,this.z=s+l*h+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return el.copy(this).projectOnVector(e),this.sub(el)}reflect(e){return this.sub(el.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ut(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},el=new N,Xd=new zt,si=class{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Tn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Tn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Tn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Tn):Tn.fromBufferAttribute(r,o),Tn.applyMatrix4(e.matrixWorld),this.expandByPoint(Tn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),vo.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),vo.copy(i.boundingBox)),vo.applyMatrix4(e.matrixWorld),this.union(vo)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Tn),Tn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(gr),Mo.subVectors(this.max,gr),Ss.subVectors(e.a,gr),Ts.subVectors(e.b,gr),vs.subVectors(e.c,gr),_i.subVectors(Ts,Ss),Ei.subVectors(vs,Ts),Fi.subVectors(Ss,vs);let t=[0,-_i.z,_i.y,0,-Ei.z,Ei.y,0,-Fi.z,Fi.y,_i.z,0,-_i.x,Ei.z,0,-Ei.x,Fi.z,0,-Fi.x,-_i.y,_i.x,0,-Ei.y,Ei.x,0,-Fi.y,Fi.x,0];return!tl(t,Ss,Ts,vs,Mo)||(t=[1,0,0,0,1,0,0,0,1],!tl(t,Ss,Ts,vs,Mo))?!1:(bo.crossVectors(_i,Ei),t=[bo.x,bo.y,bo.z],tl(t,Ss,Ts,vs,Mo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Tn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Tn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Xn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Xn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Xn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Xn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Xn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Xn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Xn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Xn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Xn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Xn=[new N,new N,new N,new N,new N,new N,new N,new N],Tn=new N,vo=new si,Ss=new N,Ts=new N,vs=new N,_i=new N,Ei=new N,Fi=new N,gr=new N,Mo=new N,bo=new N,Bi=new N;function tl(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){Bi.fromArray(n,r);let a=s.x*Math.abs(Bi.x)+s.y*Math.abs(Bi.y)+s.z*Math.abs(Bi.z),l=e.dot(Bi),c=t.dot(Bi),u=i.dot(Bi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var u0=new si,_r=new N,nl=new N,wi=class{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):u0.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;_r.subVectors(e,this.center);let t=_r.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(_r,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(nl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(_r.copy(e.center).add(nl)),this.expandByPoint(_r.copy(e.center).sub(nl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},$n=new N,il=new N,Ao=new N,xi=new N,sl=new N,wo=new N,rl=new N,Ji=class{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,$n)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=$n.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):($n.copy(this.origin).addScaledVector(this.direction,t),$n.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){il.copy(e).add(t).multiplyScalar(.5),Ao.copy(t).sub(e).normalize(),xi.copy(this.origin).sub(il);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Ao),a=xi.dot(this.direction),l=-xi.dot(Ao),c=xi.lengthSq(),u=Math.abs(1-o*o),h,f,d,m;if(u>0)if(h=o*l-a,f=o*a-l,m=r*u,h>=0)if(f>=-m)if(f<=m){let _=1/u;h*=_,f*=_,d=h*(h+o*f+2*a)+f*(o*h+f+2*l)+c}else f=r,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f=-r,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f<=-m?(h=Math.max(0,-(-o*r+a)),f=h>0?-r:Math.min(Math.max(-r,-l),r),d=-h*h+f*(f+2*l)+c):f<=m?(h=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(h=Math.max(0,-(o*r+a)),f=h>0?r:Math.min(Math.max(-r,-l),r),d=-h*h+f*(f+2*l)+c);else f=o>0?-r:r,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(il).addScaledVector(Ao,f),d}intersectSphere(e,t){$n.subVectors(e.center,this.origin);let i=$n.dot(this.direction),s=$n.dot($n)-i*i,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(i=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(i=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),u>=0?(r=(e.min.y-f.y)*u,o=(e.max.y-f.y)*u):(r=(e.max.y-f.y)*u,o=(e.min.y-f.y)*u),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(a=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,$n)!==null}intersectTriangle(e,t,i,s,r){sl.subVectors(t,e),wo.subVectors(i,e),rl.crossVectors(sl,wo);let o=this.direction.dot(rl),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;xi.subVectors(this.origin,e);let l=a*this.direction.dot(wo.crossVectors(xi,wo));if(l<0)return null;let c=a*this.direction.dot(sl.cross(xi));if(c<0||l+c>o)return null;let u=-a*xi.dot(rl);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},at=class n{constructor(e,t,i,s,r,o,a,l,c,u,h,f,d,m,_,g){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,u,h,f,d,m,_,g)}set(e,t,i,s,r,o,a,l,c,u,h,f,d,m,_,g){let p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=f,p[3]=d,p[7]=m,p[11]=_,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,s=1/Ms.setFromMatrixColumn(e,0).length(),r=1/Ms.setFromMatrixColumn(e,1).length(),o=1/Ms.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let f=o*u,d=o*h,m=a*u,_=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=d+m*c,t[5]=f-_*c,t[9]=-a*l,t[2]=_-f*c,t[6]=m+d*c,t[10]=o*l}else if(e.order==="YXZ"){let f=l*u,d=l*h,m=c*u,_=c*h;t[0]=f+_*a,t[4]=m*a-d,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=d*a-m,t[6]=_+f*a,t[10]=o*l}else if(e.order==="ZXY"){let f=l*u,d=l*h,m=c*u,_=c*h;t[0]=f-_*a,t[4]=-o*h,t[8]=m+d*a,t[1]=d+m*a,t[5]=o*u,t[9]=_-f*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let f=o*u,d=o*h,m=a*u,_=a*h;t[0]=l*u,t[4]=m*c-d,t[8]=f*c+_,t[1]=l*h,t[5]=_*c+f,t[9]=d*c-m,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let f=o*l,d=o*c,m=a*l,_=a*c;t[0]=l*u,t[4]=_-f*h,t[8]=m*h+d,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=d*h+m,t[10]=f-_*h}else if(e.order==="XZY"){let f=o*l,d=o*c,m=a*l,_=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=f*h+_,t[5]=o*u,t[9]=d*h-m,t[2]=m*h-d,t[6]=a*u,t[10]=_*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(h0,e,d0)}lookAt(e,t,i){let s=this.elements;return un.subVectors(e,t),un.lengthSq()===0&&(un.z=1),un.normalize(),yi.crossVectors(i,un),yi.lengthSq()===0&&(Math.abs(i.z)===1?un.x+=1e-4:un.z+=1e-4,un.normalize(),yi.crossVectors(i,un)),yi.normalize(),Ro.crossVectors(un,yi),s[0]=yi.x,s[4]=Ro.x,s[8]=un.x,s[1]=yi.y,s[5]=Ro.y,s[9]=un.y,s[2]=yi.z,s[6]=Ro.z,s[10]=un.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],h=i[5],f=i[9],d=i[13],m=i[2],_=i[6],g=i[10],p=i[14],S=i[3],x=i[7],E=i[11],D=i[15],R=s[0],O=s[4],U=s[8],T=s[12],y=s[1],P=s[5],H=s[9],L=s[13],F=s[2],K=s[6],G=s[10],se=s[14],Y=s[3],Ee=s[7],me=s[11],Te=s[15];return r[0]=o*R+a*y+l*F+c*Y,r[4]=o*O+a*P+l*K+c*Ee,r[8]=o*U+a*H+l*G+c*me,r[12]=o*T+a*L+l*se+c*Te,r[1]=u*R+h*y+f*F+d*Y,r[5]=u*O+h*P+f*K+d*Ee,r[9]=u*U+h*H+f*G+d*me,r[13]=u*T+h*L+f*se+d*Te,r[2]=m*R+_*y+g*F+p*Y,r[6]=m*O+_*P+g*K+p*Ee,r[10]=m*U+_*H+g*G+p*me,r[14]=m*T+_*L+g*se+p*Te,r[3]=S*R+x*y+E*F+D*Y,r[7]=S*O+x*P+E*K+D*Ee,r[11]=S*U+x*H+E*G+D*me,r[15]=S*T+x*L+E*se+D*Te,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],f=e[10],d=e[14],m=e[3],_=e[7],g=e[11],p=e[15];return m*(+r*l*h-s*c*h-r*a*f+i*c*f+s*a*d-i*l*d)+_*(+t*l*d-t*c*f+r*o*f-s*o*d+s*c*u-r*l*u)+g*(+t*c*h-t*a*d-r*o*h+i*o*d+r*a*u-i*c*u)+p*(-s*a*u-t*l*h+t*a*f+s*o*h-i*o*f+i*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],f=e[10],d=e[11],m=e[12],_=e[13],g=e[14],p=e[15],S=h*g*c-_*f*c+_*l*d-a*g*d-h*l*p+a*f*p,x=m*f*c-u*g*c-m*l*d+o*g*d+u*l*p-o*f*p,E=u*_*c-m*h*c+m*a*d-o*_*d-u*a*p+o*h*p,D=m*h*l-u*_*l-m*a*f+o*_*f+u*a*g-o*h*g,R=t*S+i*x+s*E+r*D;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/R;return e[0]=S*O,e[1]=(_*f*r-h*g*r-_*s*d+i*g*d+h*s*p-i*f*p)*O,e[2]=(a*g*r-_*l*r+_*s*c-i*g*c-a*s*p+i*l*p)*O,e[3]=(h*l*r-a*f*r-h*s*c+i*f*c+a*s*d-i*l*d)*O,e[4]=x*O,e[5]=(u*g*r-m*f*r+m*s*d-t*g*d-u*s*p+t*f*p)*O,e[6]=(m*l*r-o*g*r-m*s*c+t*g*c+o*s*p-t*l*p)*O,e[7]=(o*f*r-u*l*r+u*s*c-t*f*c-o*s*d+t*l*d)*O,e[8]=E*O,e[9]=(m*h*r-u*_*r-m*i*d+t*_*d+u*i*p-t*h*p)*O,e[10]=(o*_*r-m*a*r+m*i*c-t*_*c-o*i*p+t*a*p)*O,e[11]=(u*a*r-o*h*r-u*i*c+t*h*c+o*i*d-t*a*d)*O,e[12]=D*O,e[13]=(u*_*s-m*h*s+m*i*f-t*_*f-u*i*g+t*h*g)*O,e[14]=(m*a*s-o*_*s-m*i*l+t*_*l+o*i*g-t*a*g)*O,e[15]=(o*h*s-u*a*s+u*i*l-t*h*l-o*i*f+t*a*f)*O,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+i,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,h=a+a,f=r*c,d=r*u,m=r*h,_=o*u,g=o*h,p=a*h,S=l*c,x=l*u,E=l*h,D=i.x,R=i.y,O=i.z;return s[0]=(1-(_+p))*D,s[1]=(d+E)*D,s[2]=(m-x)*D,s[3]=0,s[4]=(d-E)*R,s[5]=(1-(f+p))*R,s[6]=(g+S)*R,s[7]=0,s[8]=(m+x)*O,s[9]=(g-S)*O,s[10]=(1-(f+_))*O,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements,r=Ms.set(s[0],s[1],s[2]).length(),o=Ms.set(s[4],s[5],s[6]).length(),a=Ms.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],vn.copy(this);let c=1/r,u=1/o,h=1/a;return vn.elements[0]*=c,vn.elements[1]*=c,vn.elements[2]*=c,vn.elements[4]*=u,vn.elements[5]*=u,vn.elements[6]*=u,vn.elements[8]*=h,vn.elements[9]*=h,vn.elements[10]*=h,t.setFromRotationMatrix(vn),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=jn){let l=this.elements,c=2*r/(t-e),u=2*r/(i-s),h=(t+e)/(t-e),f=(i+s)/(i-s),d,m;if(a===jn)d=-(o+r)/(o-r),m=-2*o*r/(o-r);else if(a===na)d=-o/(o-r),m=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=jn){let l=this.elements,c=1/(t-e),u=1/(i-s),h=1/(o-r),f=(t+e)*c,d=(i+s)*u,m,_;if(a===jn)m=(o+r)*h,_=-2*h;else if(a===na)m=r*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=_,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Ms=new N,vn=new at,h0=new N(0,0,0),d0=new N(1,1,1),yi=new N,Ro=new N,un=new N,$d=new at,qd=new zt,Nn=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],h=s[2],f=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(Ut(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ut(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ut(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ut(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ut(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-Ut(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return $d.makeRotationFromQuaternion(e),this.setFromRotationMatrix($d,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return qd.setFromEuler(this),this.setFromQuaternion(qd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Nn.DEFAULT_ORDER="XYZ";var Ur=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},f0=0,Yd=new N,bs=new zt,qn=new at,Co=new N,Er=new N,p0=new N,m0=new zt,Kd=new N(1,0,0),Zd=new N(0,1,0),Jd=new N(0,0,1),jd={type:"added"},g0={type:"removed"},As={type:"childadded",child:null},ol={type:"childremoved",child:null},Jt=class n extends ni{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:f0++}),this.uuid=is(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new N,t=new Nn,i=new zt,s=new N(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new at},normalMatrix:{value:new Ze}}),this.matrix=new at,this.matrixWorld=new at,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ur,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return bs.setFromAxisAngle(e,t),this.quaternion.multiply(bs),this}rotateOnWorldAxis(e,t){return bs.setFromAxisAngle(e,t),this.quaternion.premultiply(bs),this}rotateX(e){return this.rotateOnAxis(Kd,e)}rotateY(e){return this.rotateOnAxis(Zd,e)}rotateZ(e){return this.rotateOnAxis(Jd,e)}translateOnAxis(e,t){return Yd.copy(e).applyQuaternion(this.quaternion),this.position.add(Yd.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Kd,e)}translateY(e){return this.translateOnAxis(Zd,e)}translateZ(e){return this.translateOnAxis(Jd,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(qn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Co.copy(e):Co.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Er.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?qn.lookAt(Er,Co,this.up):qn.lookAt(Co,Er,this.up),this.quaternion.setFromRotationMatrix(qn),s&&(qn.extractRotation(s.matrixWorld),bs.setFromRotationMatrix(qn),this.quaternion.premultiply(bs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(jd),As.child=e,this.dispatchEvent(As),As.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(g0),ol.child=e,this.dispatchEvent(ol),ol.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),qn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),qn.multiply(e.parent.matrixWorld)),e.applyMatrix4(qn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(jd),As.child=e,this.dispatchEvent(As),As.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Er,e,p0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Er,m0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),f=o(e.skeletons),d=o(e.animations),m=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),d.length>0&&(i.animations=d),m.length>0&&(i.nodes=m)}return i.object=s,i;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};Jt.DEFAULT_UP=new N(0,1,0);Jt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Jt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Mn=new N,Yn=new N,al=new N,Kn=new N,ws=new N,Rs=new N,Qd=new N,cl=new N,ll=new N,ul=new N,hl=new mt,dl=new mt,fl=new mt,qi=class n{constructor(e=new N,t=new N,i=new N){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Mn.subVectors(e,t),s.cross(Mn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Mn.subVectors(s,t),Yn.subVectors(i,t),al.subVectors(e,t);let o=Mn.dot(Mn),a=Mn.dot(Yn),l=Mn.dot(al),c=Yn.dot(Yn),u=Yn.dot(al),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;let f=1/h,d=(c*l-a*u)*f,m=(o*u-a*l)*f;return r.set(1-d-m,m,d)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Kn)===null?!1:Kn.x>=0&&Kn.y>=0&&Kn.x+Kn.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,Kn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Kn.x),l.addScaledVector(o,Kn.y),l.addScaledVector(a,Kn.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return hl.setScalar(0),dl.setScalar(0),fl.setScalar(0),hl.fromBufferAttribute(e,t),dl.fromBufferAttribute(e,i),fl.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(hl,r.x),o.addScaledVector(dl,r.y),o.addScaledVector(fl,r.z),o}static isFrontFacing(e,t,i,s){return Mn.subVectors(i,t),Yn.subVectors(e,t),Mn.cross(Yn).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Mn.subVectors(this.c,this.b),Yn.subVectors(this.a,this.b),Mn.cross(Yn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,o,a;ws.subVectors(s,i),Rs.subVectors(r,i),cl.subVectors(e,i);let l=ws.dot(cl),c=Rs.dot(cl);if(l<=0&&c<=0)return t.copy(i);ll.subVectors(e,s);let u=ws.dot(ll),h=Rs.dot(ll);if(u>=0&&h<=u)return t.copy(s);let f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector(ws,o);ul.subVectors(e,r);let d=ws.dot(ul),m=Rs.dot(ul);if(m>=0&&d<=m)return t.copy(r);let _=d*c-l*m;if(_<=0&&c>=0&&m<=0)return a=c/(c-m),t.copy(i).addScaledVector(Rs,a);let g=u*m-d*h;if(g<=0&&h-u>=0&&d-m>=0)return Qd.subVectors(r,s),a=(h-u)/(h-u+(d-m)),t.copy(s).addScaledVector(Qd,a);let p=1/(g+_+f);return o=_*p,a=f*p,t.copy(i).addScaledVector(ws,o).addScaledVector(Rs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},rp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Si={h:0,s:0,l:0},Io={h:0,s:0,l:0};function pl(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var ke=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Pt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,lt.toWorkingColorSpace(this,t),this}setRGB(e,t,i,s=lt.workingColorSpace){return this.r=e,this.g=t,this.b=i,lt.toWorkingColorSpace(this,s),this}setHSL(e,t,i,s=lt.workingColorSpace){if(e=oh(e,1),t=Ut(t,0,1),i=Ut(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=pl(o,r,e+1/3),this.g=pl(o,r,e),this.b=pl(o,r,e-1/3)}return lt.toWorkingColorSpace(this,s),this}setStyle(e,t=Pt){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Pt){let i=rp[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Qn(e.r),this.g=Qn(e.g),this.b=Qn(e.b),this}copyLinearToSRGB(e){return this.r=Fs(e.r),this.g=Fs(e.g),this.b=Fs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Pt){return lt.fromWorkingColorSpace(Kt.copy(this),e),Math.round(Ut(Kt.r*255,0,255))*65536+Math.round(Ut(Kt.g*255,0,255))*256+Math.round(Ut(Kt.b*255,0,255))}getHexString(e=Pt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=lt.workingColorSpace){lt.fromWorkingColorSpace(Kt.copy(this),t);let i=Kt.r,s=Kt.g,r=Kt.b,o=Math.max(i,s,r),a=Math.min(i,s,r),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case i:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-i)/h+2;break;case r:l=(i-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=lt.workingColorSpace){return lt.fromWorkingColorSpace(Kt.copy(this),t),e.r=Kt.r,e.g=Kt.g,e.b=Kt.b,e}getStyle(e=Pt){lt.fromWorkingColorSpace(Kt.copy(this),e);let t=Kt.r,i=Kt.g,s=Kt.b;return e!==Pt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Si),this.setHSL(Si.h+e,Si.s+t,Si.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Si),e.getHSL(Io);let i=Ar(Si.h,Io.h,t),s=Ar(Si.s,Io.s,t),r=Ar(Si.l,Io.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Kt=new ke;ke.NAMES=rp;var _0=0,Ri=class extends ni{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_0++}),this.uuid=is(),this.name="",this.blending=ks,this.side=Ai,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Cl,this.blendDst=Il,this.blendEquation=$i,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ke(0,0,0),this.blendAlpha=0,this.depthFunc=zs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Nd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=xs,this.stencilZFail=xs,this.stencilZPass=xs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ks&&(i.blending=this.blending),this.side!==Ai&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Cl&&(i.blendSrc=this.blendSrc),this.blendDst!==Il&&(i.blendDst=this.blendDst),this.blendEquation!==$i&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==zs&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Nd&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==xs&&(i.stencilFail=this.stencilFail),this.stencilZFail!==xs&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==xs&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},Lt=class extends Ri{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Nn,this.combine=Xf,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Ot=new N,Po=new le,Ct=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Dd,this.updateRanges=[],this.gpuType=Ln,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Po.fromBufferAttribute(this,t),Po.applyMatrix3(e),this.setXY(t,Po.x,Po.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix3(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix4(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.applyNormalMatrix(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.transformDirection(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Ls(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=jt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ls(t,this.array)),t}setX(e,t){return this.normalized&&(t=jt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ls(t,this.array)),t}setY(e,t){return this.normalized&&(t=jt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ls(t,this.array)),t}setZ(e,t){return this.normalized&&(t=jt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ls(t,this.array)),t}setW(e,t){return this.normalized&&(t=jt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=jt(t,this.array),i=jt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=jt(t,this.array),i=jt(i,this.array),s=jt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=jt(t,this.array),i=jt(i,this.array),s=jt(s,this.array),r=jt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Dd&&(e.usage=this.usage),e}};var oa=class extends Ct{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var aa=class extends Ct{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var Je=class extends Ct{constructor(e,t,i){super(new Float32Array(e),t,i)}},E0=0,_n=new at,ml=new Jt,Cs=new N,hn=new si,xr=new si,Bt=new N,Et=class n extends ni{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:E0++}),this.uuid=is(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(sp(e)?aa:oa)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Ze().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return _n.makeRotationFromQuaternion(e),this.applyMatrix4(_n),this}rotateX(e){return _n.makeRotationX(e),this.applyMatrix4(_n),this}rotateY(e){return _n.makeRotationY(e),this.applyMatrix4(_n),this}rotateZ(e){return _n.makeRotationZ(e),this.applyMatrix4(_n),this}translate(e,t,i){return _n.makeTranslation(e,t,i),this.applyMatrix4(_n),this}scale(e,t,i){return _n.makeScale(e,t,i),this.applyMatrix4(_n),this}lookAt(e){return ml.lookAt(e),ml.updateMatrix(),this.applyMatrix4(ml.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Cs).negate(),this.translate(Cs.x,Cs.y,Cs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Je(i,3))}else{for(let i=0,s=t.count;i<s;i++){let r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new si);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];hn.setFromBufferAttribute(r),this.morphTargetsRelative?(Bt.addVectors(this.boundingBox.min,hn.min),this.boundingBox.expandByPoint(Bt),Bt.addVectors(this.boundingBox.max,hn.max),this.boundingBox.expandByPoint(Bt)):(this.boundingBox.expandByPoint(hn.min),this.boundingBox.expandByPoint(hn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new wi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){let i=this.boundingSphere.center;if(hn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];xr.setFromBufferAttribute(a),this.morphTargetsRelative?(Bt.addVectors(hn.min,xr.min),hn.expandByPoint(Bt),Bt.addVectors(hn.max,xr.max),hn.expandByPoint(Bt)):(hn.expandByPoint(xr.min),hn.expandByPoint(xr.max))}hn.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Bt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Bt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Bt.fromBufferAttribute(a,c),l&&(Cs.fromBufferAttribute(e,c),Bt.add(Cs)),s=Math.max(s,i.distanceToSquared(Bt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ct(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let U=0;U<i.count;U++)a[U]=new N,l[U]=new N;let c=new N,u=new N,h=new N,f=new le,d=new le,m=new le,_=new N,g=new N;function p(U,T,y){c.fromBufferAttribute(i,U),u.fromBufferAttribute(i,T),h.fromBufferAttribute(i,y),f.fromBufferAttribute(r,U),d.fromBufferAttribute(r,T),m.fromBufferAttribute(r,y),u.sub(c),h.sub(c),d.sub(f),m.sub(f);let P=1/(d.x*m.y-m.x*d.y);isFinite(P)&&(_.copy(u).multiplyScalar(m.y).addScaledVector(h,-d.y).multiplyScalar(P),g.copy(h).multiplyScalar(d.x).addScaledVector(u,-m.x).multiplyScalar(P),a[U].add(_),a[T].add(_),a[y].add(_),l[U].add(g),l[T].add(g),l[y].add(g))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let U=0,T=S.length;U<T;++U){let y=S[U],P=y.start,H=y.count;for(let L=P,F=P+H;L<F;L+=3)p(e.getX(L+0),e.getX(L+1),e.getX(L+2))}let x=new N,E=new N,D=new N,R=new N;function O(U){D.fromBufferAttribute(s,U),R.copy(D);let T=a[U];x.copy(T),x.sub(D.multiplyScalar(D.dot(T))).normalize(),E.crossVectors(R,T);let P=E.dot(l[U])<0?-1:1;o.setXYZW(U,x.x,x.y,x.z,P)}for(let U=0,T=S.length;U<T;++U){let y=S[U],P=y.start,H=y.count;for(let L=P,F=P+H;L<F;L+=3)O(e.getX(L+0)),O(e.getX(L+1)),O(e.getX(L+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Ct(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,d=i.count;f<d;f++)i.setXYZ(f,0,0,0);let s=new N,r=new N,o=new N,a=new N,l=new N,c=new N,u=new N,h=new N;if(e)for(let f=0,d=e.count;f<d;f+=3){let m=e.getX(f+0),_=e.getX(f+1),g=e.getX(f+2);s.fromBufferAttribute(t,m),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,g),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(i,m),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,g),a.add(u),l.add(u),c.add(u),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Bt.fromBufferAttribute(e,t),Bt.normalize(),e.setXYZ(t,Bt.x,Bt.y,Bt.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,f=new c.constructor(l.length*u),d=0,m=0;for(let _=0,g=l.length;_<g;_++){a.isInterleavedBufferAttribute?d=l[_]*a.data.stride+a.offset:d=l[_]*u;for(let p=0;p<u;p++)f[m++]=c[d++]}return new Ct(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,i);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let u=0,h=c.length;u<h;u++){let f=c[u],d=e(f,i);l.push(d)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){let d=c[h];u.push(d.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone(t));let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],h=r[c];for(let f=0,d=h.length;f<d;f++)u.push(h[f].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},ef=new at,zi=new Ji,Oo=new wi,tf=new N,Uo=new N,Lo=new N,No=new N,gl=new N,Do=new N,nf=new N,ko=new N,Z=class extends Jt{constructor(e=new Et,t=new Lt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Do.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=a[l],h=r[l];u!==0&&(gl.fromBufferAttribute(h,e),o?Do.addScaledVector(gl,u):Do.addScaledVector(gl.sub(t),u))}t.add(Do)}return t}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Oo.copy(i.boundingSphere),Oo.applyMatrix4(r),zi.copy(e.ray).recast(e.near),!(Oo.containsPoint(zi.origin)===!1&&(zi.intersectSphere(Oo,tf)===null||zi.origin.distanceToSquared(tf)>(e.far-e.near)**2))&&(ef.copy(r).invert(),zi.copy(e.ray).applyMatrix4(ef),!(i.boundingBox!==null&&zi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,zi)))}_computeIntersections(e,t,i){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,f=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,_=f.length;m<_;m++){let g=f[m],p=o[g.materialIndex],S=Math.max(g.start,d.start),x=Math.min(a.count,Math.min(g.start+g.count,d.start+d.count));for(let E=S,D=x;E<D;E+=3){let R=a.getX(E),O=a.getX(E+1),U=a.getX(E+2);s=Ho(this,p,e,i,c,u,h,R,O,U),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let m=Math.max(0,d.start),_=Math.min(a.count,d.start+d.count);for(let g=m,p=_;g<p;g+=3){let S=a.getX(g),x=a.getX(g+1),E=a.getX(g+2);s=Ho(this,o,e,i,c,u,h,S,x,E),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,_=f.length;m<_;m++){let g=f[m],p=o[g.materialIndex],S=Math.max(g.start,d.start),x=Math.min(l.count,Math.min(g.start+g.count,d.start+d.count));for(let E=S,D=x;E<D;E+=3){let R=E,O=E+1,U=E+2;s=Ho(this,p,e,i,c,u,h,R,O,U),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let m=Math.max(0,d.start),_=Math.min(l.count,d.start+d.count);for(let g=m,p=_;g<p;g+=3){let S=g,x=g+1,E=g+2;s=Ho(this,o,e,i,c,u,h,S,x,E),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}};function x0(n,e,t,i,s,r,o,a){let l;if(e.side===sn?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===Ai,a),l===null)return null;ko.copy(a),ko.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(ko);return c<t.near||c>t.far?null:{distance:c,point:ko.clone(),object:n}}function Ho(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,Uo),n.getVertexPosition(l,Lo),n.getVertexPosition(c,No);let u=x0(n,e,t,i,Uo,Lo,No,nf);if(u){let h=new N;qi.getBarycoord(nf,Uo,Lo,No,h),s&&(u.uv=qi.getInterpolatedAttribute(s,a,l,c,h,new le)),r&&(u.uv1=qi.getInterpolatedAttribute(r,a,l,c,h,new le)),o&&(u.normal=qi.getInterpolatedAttribute(o,a,l,c,h,new N),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let f={a,b:l,c,normal:new N,materialIndex:0};qi.getNormal(Uo,Lo,No,f.normal),u.face=f,u.barycoord=h}return u}var ct=class n extends Et{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],u=[],h=[],f=0,d=0;m("z","y","x",-1,-1,i,t,e,o,r,0),m("z","y","x",1,-1,i,t,-e,o,r,1),m("x","z","y",1,1,e,i,t,s,o,2),m("x","z","y",1,-1,e,i,-t,s,o,3),m("x","y","z",1,-1,e,t,i,s,r,4),m("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new Je(c,3)),this.setAttribute("normal",new Je(u,3)),this.setAttribute("uv",new Je(h,2));function m(_,g,p,S,x,E,D,R,O,U,T){let y=E/O,P=D/U,H=E/2,L=D/2,F=R/2,K=O+1,G=U+1,se=0,Y=0,Ee=new N;for(let me=0;me<G;me++){let Te=me*P-L;for(let be=0;be<K;be++){let nt=be*y-H;Ee[_]=nt*S,Ee[g]=Te*x,Ee[p]=F,c.push(Ee.x,Ee.y,Ee.z),Ee[_]=0,Ee[g]=0,Ee[p]=R>0?1:-1,u.push(Ee.x,Ee.y,Ee.z),h.push(be/O),h.push(1-me/U),se+=1}}for(let me=0;me<U;me++)for(let Te=0;Te<O;Te++){let be=f+Te+K*me,nt=f+Te+K*(me+1),ee=f+(Te+1)+K*(me+1),ae=f+(Te+1)+K*me;l.push(be,nt,ae),l.push(nt,ee,ae),Y+=6}a.addGroup(d,Y,T),d+=Y,f+=se}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function qs(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function Qt(n){let e={};for(let t=0;t<n.length;t++){let i=qs(n[t]);for(let s in i)e[s]=i[s]}return e}function y0(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function op(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:lt.workingColorSpace}var S0={clone:qs,merge:Qt},T0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,v0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Dn=class extends Ri{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=T0,this.fragmentShader=v0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=qs(e.uniforms),this.uniformsGroups=y0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},ca=class extends Jt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new at,this.projectionMatrix=new at,this.projectionMatrixInverse=new at,this.coordinateSystem=jn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Ti=new N,sf=new le,rf=new le,Zt=class extends ca{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Or*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(br*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Or*2*Math.atan(Math.tan(br*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Ti.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ti.x,Ti.y).multiplyScalar(-e/Ti.z),Ti.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ti.x,Ti.y).multiplyScalar(-e/Ti.z)}getViewSize(e,t){return this.getViewBounds(e,sf,rf),t.subVectors(rf,sf)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(br*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Is=-90,Ps=1,_u=class extends Jt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Zt(Is,Ps,e,t);s.layers=this.layers,this.add(s);let r=new Zt(Is,Ps,e,t);r.layers=this.layers,this.add(r);let o=new Zt(Is,Ps,e,t);o.layers=this.layers,this.add(o);let a=new Zt(Is,Ps,e,t);a.layers=this.layers,this.add(a);let l=new Zt(Is,Ps,e,t);l.layers=this.layers,this.add(l);let c=new Zt(Is,Ps,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===jn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===na)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,s),e.render(t,u),e.setRenderTarget(h,f,d),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},la=class extends rn{constructor(e,t,i,s,r,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:Gs,super(e,t,i,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Eu=class extends ii{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new la(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Un}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ct(5,5,5),r=new Dn({name:"CubemapFromEquirect",uniforms:qs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:sn,blending:Mi});r.uniforms.tEquirect.value=t;let o=new Z(s,r),a=t.minFilter;return t.minFilter===Ki&&(t.minFilter=Un),new _u(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,s){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}},_l=new N,M0=new N,b0=new Ze,bn=class{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=_l.subVectors(i,t).cross(M0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(_l),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||b0.getNormalMatrix(e),s=this.coplanarPoint(_l).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Gi=new wi,Fo=new N,Lr=class{constructor(e=new bn,t=new bn,i=new bn,s=new bn,r=new bn,o=new bn){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=jn){let i=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],u=s[5],h=s[6],f=s[7],d=s[8],m=s[9],_=s[10],g=s[11],p=s[12],S=s[13],x=s[14],E=s[15];if(i[0].setComponents(l-r,f-c,g-d,E-p).normalize(),i[1].setComponents(l+r,f+c,g+d,E+p).normalize(),i[2].setComponents(l+o,f+u,g+m,E+S).normalize(),i[3].setComponents(l-o,f-u,g-m,E-S).normalize(),i[4].setComponents(l-a,f-h,g-_,E-x).normalize(),t===jn)i[5].setComponents(l+a,f+h,g+_,E+x).normalize();else if(t===na)i[5].setComponents(a,h,_,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Gi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Gi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Gi)}intersectsSprite(e){return Gi.center.set(0,0,0),Gi.radius=.7071067811865476,Gi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Gi)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(Fo.x=s.normal.x>0?e.max.x:e.min.x,Fo.y=s.normal.y>0?e.max.y:e.min.y,Fo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Fo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function ap(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function A0(n){let e=new WeakMap;function t(a,l){let c=a.array,u=a.usage,h=c.byteLength,f=n.createBuffer();n.bindBuffer(l,f),n.bufferData(l,c,u),a.onUploadCallback();let d;if(c instanceof Float32Array)d=n.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?d=n.HALF_FLOAT:d=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=n.SHORT;else if(c instanceof Uint32Array)d=n.UNSIGNED_INT;else if(c instanceof Int32Array)d=n.INT;else if(c instanceof Int8Array)d=n.BYTE;else if(c instanceof Uint8Array)d=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,l,c){let u=l.array,h=l.updateRanges;if(n.bindBuffer(c,a),h.length===0)n.bufferSubData(c,0,u);else{h.sort((d,m)=>d.start-m.start);let f=0;for(let d=1;d<h.length;d++){let m=h[f],_=h[d];_.start<=m.start+m.count+1?m.count=Math.max(m.count,_.start+_.count-m.start):(++f,h[f]=_)}h.length=f+1;for(let d=0,m=h.length;d<m;d++){let _=h[d];n.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var ri=class n extends Et{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,u=l+1,h=e/a,f=t/l,d=[],m=[],_=[],g=[];for(let p=0;p<u;p++){let S=p*f-o;for(let x=0;x<c;x++){let E=x*h-r;m.push(E,-S,0),_.push(0,0,1),g.push(x/a),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let S=0;S<a;S++){let x=S+c*p,E=S+c*(p+1),D=S+1+c*(p+1),R=S+1+c*p;d.push(x,E,R),d.push(E,D,R)}this.setIndex(d),this.setAttribute("position",new Je(m,3)),this.setAttribute("normal",new Je(_,3)),this.setAttribute("uv",new Je(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},w0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,R0=`#ifdef USE_ALPHAHASH
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
#endif`,C0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,I0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,P0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,O0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,U0=`#ifdef USE_AOMAP
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
#endif`,L0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,N0=`#ifdef USE_BATCHING
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
#endif`,D0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,k0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,H0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,F0=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,B0=`#ifdef USE_IRIDESCENCE
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
#endif`,z0=`#ifdef USE_BUMPMAP
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
#endif`,G0=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,V0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,W0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,X0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,$0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,q0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Y0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,K0=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Z0=`#define PI 3.141592653589793
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
} // validated`,J0=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,j0=`vec3 transformedNormal = objectNormal;
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
#endif`,Q0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,e_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,t_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,n_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,i_="gl_FragColor = linearToOutputTexel( gl_FragColor );",s_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,r_=`#ifdef USE_ENVMAP
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
#endif`,o_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif

#endif`,a_=`#ifdef USE_ENVMAP
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
#endif`,c_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,l_=`#ifdef USE_ENVMAP
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
#endif`,u_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,h_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,d_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,f_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,p_=`#ifdef USE_GRADIENTMAP
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
}`,m_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,g_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,__=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,E_=`uniform bool receiveShadow;
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
#endif`,x_=`#ifdef USE_ENVMAP
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
#endif`,y_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,S_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,T_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,v_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,M_=`PhysicalMaterial material;
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
#endif`,b_=`struct PhysicalMaterial {
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
}`,A_=`
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
#endif`,w_=`#if defined( RE_IndirectDiffuse )
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
#endif`,R_=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,C_=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,I_=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,P_=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,O_=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,U_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,L_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,N_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,D_=`#if defined( USE_POINTS_UV )
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
#endif`,k_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,H_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,F_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,B_=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,z_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,G_=`#ifdef USE_MORPHTARGETS
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
#endif`,V_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,W_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,X_=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,$_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,q_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Y_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,K_=`#ifdef USE_NORMALMAP
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
#endif`,Z_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,J_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,j_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Q_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,eE=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,tE=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,nE=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,iE=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,sE=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,rE=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,oE=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,aE=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,cE=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,lE=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,uE=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,hE=`float getShadowMask() {
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
}`,dE=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,fE=`#ifdef USE_SKINNING
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
#endif`,pE=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,mE=`#ifdef USE_SKINNING
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
#endif`,gE=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,_E=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,EE=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,xE=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,yE=`#ifdef USE_TRANSMISSION
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
#endif`,SE=`#ifdef USE_TRANSMISSION
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
#endif`,TE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,vE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ME=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,bE=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,AE=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,wE=`uniform sampler2D t2D;
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
}`,RE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,CE=`#ifdef ENVMAP_TYPE_CUBE
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
}`,IE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,PE=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,OE=`#include <common>
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
}`,UE=`#if DEPTH_PACKING == 3200
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
}`,LE=`#define DISTANCE
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
}`,NE=`#define DISTANCE
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
}`,DE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,kE=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,HE=`uniform float scale;
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
}`,FE=`uniform vec3 diffuse;
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
}`,BE=`#include <common>
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
}`,zE=`uniform vec3 diffuse;
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
}`,GE=`#define LAMBERT
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
}`,VE=`#define LAMBERT
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
}`,WE=`#define MATCAP
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
}`,XE=`#define MATCAP
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
}`,$E=`#define NORMAL
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
}`,qE=`#define NORMAL
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
}`,YE=`#define PHONG
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
}`,KE=`#define PHONG
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
}`,ZE=`#define STANDARD
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
}`,JE=`#define STANDARD
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
}`,jE=`#define TOON
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
}`,QE=`#define TOON
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
}`,ex=`uniform float size;
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
}`,tx=`uniform vec3 diffuse;
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
}`,nx=`#include <common>
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
}`,ix=`uniform vec3 color;
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
}`,sx=`uniform float rotation;
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
}`,rx=`uniform vec3 diffuse;
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
}`,Qe={alphahash_fragment:w0,alphahash_pars_fragment:R0,alphamap_fragment:C0,alphamap_pars_fragment:I0,alphatest_fragment:P0,alphatest_pars_fragment:O0,aomap_fragment:U0,aomap_pars_fragment:L0,batching_pars_vertex:N0,batching_vertex:D0,begin_vertex:k0,beginnormal_vertex:H0,bsdfs:F0,iridescence_fragment:B0,bumpmap_pars_fragment:z0,clipping_planes_fragment:G0,clipping_planes_pars_fragment:V0,clipping_planes_pars_vertex:W0,clipping_planes_vertex:X0,color_fragment:$0,color_pars_fragment:q0,color_pars_vertex:Y0,color_vertex:K0,common:Z0,cube_uv_reflection_fragment:J0,defaultnormal_vertex:j0,displacementmap_pars_vertex:Q0,displacementmap_vertex:e_,emissivemap_fragment:t_,emissivemap_pars_fragment:n_,colorspace_fragment:i_,colorspace_pars_fragment:s_,envmap_fragment:r_,envmap_common_pars_fragment:o_,envmap_pars_fragment:a_,envmap_pars_vertex:c_,envmap_physical_pars_fragment:x_,envmap_vertex:l_,fog_vertex:u_,fog_pars_vertex:h_,fog_fragment:d_,fog_pars_fragment:f_,gradientmap_pars_fragment:p_,lightmap_pars_fragment:m_,lights_lambert_fragment:g_,lights_lambert_pars_fragment:__,lights_pars_begin:E_,lights_toon_fragment:y_,lights_toon_pars_fragment:S_,lights_phong_fragment:T_,lights_phong_pars_fragment:v_,lights_physical_fragment:M_,lights_physical_pars_fragment:b_,lights_fragment_begin:A_,lights_fragment_maps:w_,lights_fragment_end:R_,logdepthbuf_fragment:C_,logdepthbuf_pars_fragment:I_,logdepthbuf_pars_vertex:P_,logdepthbuf_vertex:O_,map_fragment:U_,map_pars_fragment:L_,map_particle_fragment:N_,map_particle_pars_fragment:D_,metalnessmap_fragment:k_,metalnessmap_pars_fragment:H_,morphinstance_vertex:F_,morphcolor_vertex:B_,morphnormal_vertex:z_,morphtarget_pars_vertex:G_,morphtarget_vertex:V_,normal_fragment_begin:W_,normal_fragment_maps:X_,normal_pars_fragment:$_,normal_pars_vertex:q_,normal_vertex:Y_,normalmap_pars_fragment:K_,clearcoat_normal_fragment_begin:Z_,clearcoat_normal_fragment_maps:J_,clearcoat_pars_fragment:j_,iridescence_pars_fragment:Q_,opaque_fragment:eE,packing:tE,premultiplied_alpha_fragment:nE,project_vertex:iE,dithering_fragment:sE,dithering_pars_fragment:rE,roughnessmap_fragment:oE,roughnessmap_pars_fragment:aE,shadowmap_pars_fragment:cE,shadowmap_pars_vertex:lE,shadowmap_vertex:uE,shadowmask_pars_fragment:hE,skinbase_vertex:dE,skinning_pars_vertex:fE,skinning_vertex:pE,skinnormal_vertex:mE,specularmap_fragment:gE,specularmap_pars_fragment:_E,tonemapping_fragment:EE,tonemapping_pars_fragment:xE,transmission_fragment:yE,transmission_pars_fragment:SE,uv_pars_fragment:TE,uv_pars_vertex:vE,uv_vertex:ME,worldpos_vertex:bE,background_vert:AE,background_frag:wE,backgroundCube_vert:RE,backgroundCube_frag:CE,cube_vert:IE,cube_frag:PE,depth_vert:OE,depth_frag:UE,distanceRGBA_vert:LE,distanceRGBA_frag:NE,equirect_vert:DE,equirect_frag:kE,linedashed_vert:HE,linedashed_frag:FE,meshbasic_vert:BE,meshbasic_frag:zE,meshlambert_vert:GE,meshlambert_frag:VE,meshmatcap_vert:WE,meshmatcap_frag:XE,meshnormal_vert:$E,meshnormal_frag:qE,meshphong_vert:YE,meshphong_frag:KE,meshphysical_vert:ZE,meshphysical_frag:JE,meshtoon_vert:jE,meshtoon_frag:QE,points_vert:ex,points_frag:tx,shadow_vert:nx,shadow_frag:ix,sprite_vert:sx,sprite_frag:rx},ye={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ze},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ze}},envmap:{envMap:{value:null},envMapRotation:{value:new Ze},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ze},normalScale:{value:new le(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0},uvTransform:{value:new Ze}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new le(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ze},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0}}},On={basic:{uniforms:Qt([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.fog]),vertexShader:Qe.meshbasic_vert,fragmentShader:Qe.meshbasic_frag},lambert:{uniforms:Qt([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,ye.lights,{emissive:{value:new ke(0)}}]),vertexShader:Qe.meshlambert_vert,fragmentShader:Qe.meshlambert_frag},phong:{uniforms:Qt([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,ye.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30}}]),vertexShader:Qe.meshphong_vert,fragmentShader:Qe.meshphong_frag},standard:{uniforms:Qt([ye.common,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.roughnessmap,ye.metalnessmap,ye.fog,ye.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag},toon:{uniforms:Qt([ye.common,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.gradientmap,ye.fog,ye.lights,{emissive:{value:new ke(0)}}]),vertexShader:Qe.meshtoon_vert,fragmentShader:Qe.meshtoon_frag},matcap:{uniforms:Qt([ye.common,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,{matcap:{value:null}}]),vertexShader:Qe.meshmatcap_vert,fragmentShader:Qe.meshmatcap_frag},points:{uniforms:Qt([ye.points,ye.fog]),vertexShader:Qe.points_vert,fragmentShader:Qe.points_frag},dashed:{uniforms:Qt([ye.common,ye.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qe.linedashed_vert,fragmentShader:Qe.linedashed_frag},depth:{uniforms:Qt([ye.common,ye.displacementmap]),vertexShader:Qe.depth_vert,fragmentShader:Qe.depth_frag},normal:{uniforms:Qt([ye.common,ye.bumpmap,ye.normalmap,ye.displacementmap,{opacity:{value:1}}]),vertexShader:Qe.meshnormal_vert,fragmentShader:Qe.meshnormal_frag},sprite:{uniforms:Qt([ye.sprite,ye.fog]),vertexShader:Qe.sprite_vert,fragmentShader:Qe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qe.background_vert,fragmentShader:Qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ze}},vertexShader:Qe.backgroundCube_vert,fragmentShader:Qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qe.cube_vert,fragmentShader:Qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qe.equirect_vert,fragmentShader:Qe.equirect_frag},distanceRGBA:{uniforms:Qt([ye.common,ye.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qe.distanceRGBA_vert,fragmentShader:Qe.distanceRGBA_frag},shadow:{uniforms:Qt([ye.lights,ye.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:Qe.shadow_vert,fragmentShader:Qe.shadow_frag}};On.physical={uniforms:Qt([On.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ze},clearcoatNormalScale:{value:new le(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ze},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ze},transmissionSamplerSize:{value:new le},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ze},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ze},anisotropyVector:{value:new le},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ze}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag};var Bo={r:0,b:0,g:0},Vi=new Nn,ox=new at;function ax(n,e,t,i,s,r,o){let a=new ke(0),l=r===!0?0:1,c,u,h=null,f=0,d=null;function m(S){let x=S.isScene===!0?S.background:null;return x&&x.isTexture&&(x=(S.backgroundBlurriness>0?t:e).get(x)),x}function _(S){let x=!1,E=m(S);E===null?p(a,l):E&&E.isColor&&(p(E,1),x=!0);let D=n.xr.getEnvironmentBlendMode();D==="additive"?i.buffers.color.setClear(0,0,0,1,o):D==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||x)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function g(S,x){let E=m(x);E&&(E.isCubeTexture||E.mapping===Da)?(u===void 0&&(u=new Z(new ct(1,1,1),new Dn({name:"BackgroundCubeMaterial",uniforms:qs(On.backgroundCube.uniforms),vertexShader:On.backgroundCube.vertexShader,fragmentShader:On.backgroundCube.fragmentShader,side:sn,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(D,R,O){this.matrixWorld.copyPosition(O.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),Vi.copy(x.backgroundRotation),Vi.x*=-1,Vi.y*=-1,Vi.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(Vi.y*=-1,Vi.z*=-1),u.material.uniforms.envMap.value=E,u.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(ox.makeRotationFromEuler(Vi)),u.material.toneMapped=lt.getTransfer(E.colorSpace)!==pt,(h!==E||f!==E.version||d!==n.toneMapping)&&(u.material.needsUpdate=!0,h=E,f=E.version,d=n.toneMapping),u.layers.enableAll(),S.unshift(u,u.geometry,u.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new Z(new ri(2,2),new Dn({name:"BackgroundMaterial",uniforms:qs(On.background.uniforms),vertexShader:On.background.vertexShader,fragmentShader:On.background.fragmentShader,side:Ai,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=lt.getTransfer(E.colorSpace)!==pt,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(h!==E||f!==E.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,h=E,f=E.version,d=n.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null))}function p(S,x){S.getRGB(Bo,op(n)),i.buffers.color.setClear(Bo.r,Bo.g,Bo.b,x,o)}return{getClearColor:function(){return a},setClearColor:function(S,x=1){a.set(S),l=x,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(S){l=S,p(a,l)},render:_,addToRenderList:g}}function cx(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=f(null),r=s,o=!1;function a(y,P,H,L,F){let K=!1,G=h(L,H,P);r!==G&&(r=G,c(r.object)),K=d(y,L,H,F),K&&m(y,L,H,F),F!==null&&e.update(F,n.ELEMENT_ARRAY_BUFFER),(K||o)&&(o=!1,E(y,P,H,L),F!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(F).buffer))}function l(){return n.createVertexArray()}function c(y){return n.bindVertexArray(y)}function u(y){return n.deleteVertexArray(y)}function h(y,P,H){let L=H.wireframe===!0,F=i[y.id];F===void 0&&(F={},i[y.id]=F);let K=F[P.id];K===void 0&&(K={},F[P.id]=K);let G=K[L];return G===void 0&&(G=f(l()),K[L]=G),G}function f(y){let P=[],H=[],L=[];for(let F=0;F<t;F++)P[F]=0,H[F]=0,L[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:H,attributeDivisors:L,object:y,attributes:{},index:null}}function d(y,P,H,L){let F=r.attributes,K=P.attributes,G=0,se=H.getAttributes();for(let Y in se)if(se[Y].location>=0){let me=F[Y],Te=K[Y];if(Te===void 0&&(Y==="instanceMatrix"&&y.instanceMatrix&&(Te=y.instanceMatrix),Y==="instanceColor"&&y.instanceColor&&(Te=y.instanceColor)),me===void 0||me.attribute!==Te||Te&&me.data!==Te.data)return!0;G++}return r.attributesNum!==G||r.index!==L}function m(y,P,H,L){let F={},K=P.attributes,G=0,se=H.getAttributes();for(let Y in se)if(se[Y].location>=0){let me=K[Y];me===void 0&&(Y==="instanceMatrix"&&y.instanceMatrix&&(me=y.instanceMatrix),Y==="instanceColor"&&y.instanceColor&&(me=y.instanceColor));let Te={};Te.attribute=me,me&&me.data&&(Te.data=me.data),F[Y]=Te,G++}r.attributes=F,r.attributesNum=G,r.index=L}function _(){let y=r.newAttributes;for(let P=0,H=y.length;P<H;P++)y[P]=0}function g(y){p(y,0)}function p(y,P){let H=r.newAttributes,L=r.enabledAttributes,F=r.attributeDivisors;H[y]=1,L[y]===0&&(n.enableVertexAttribArray(y),L[y]=1),F[y]!==P&&(n.vertexAttribDivisor(y,P),F[y]=P)}function S(){let y=r.newAttributes,P=r.enabledAttributes;for(let H=0,L=P.length;H<L;H++)P[H]!==y[H]&&(n.disableVertexAttribArray(H),P[H]=0)}function x(y,P,H,L,F,K,G){G===!0?n.vertexAttribIPointer(y,P,H,F,K):n.vertexAttribPointer(y,P,H,L,F,K)}function E(y,P,H,L){_();let F=L.attributes,K=H.getAttributes(),G=P.defaultAttributeValues;for(let se in K){let Y=K[se];if(Y.location>=0){let Ee=F[se];if(Ee===void 0&&(se==="instanceMatrix"&&y.instanceMatrix&&(Ee=y.instanceMatrix),se==="instanceColor"&&y.instanceColor&&(Ee=y.instanceColor)),Ee!==void 0){let me=Ee.normalized,Te=Ee.itemSize,be=e.get(Ee);if(be===void 0)continue;let nt=be.buffer,ee=be.type,ae=be.bytesPerElement,_e=ee===n.INT||ee===n.UNSIGNED_INT||Ee.gpuType===Qu;if(Ee.isInterleavedBufferAttribute){let ge=Ee.data,De=ge.stride,We=Ee.offset;if(ge.isInstancedInterleavedBuffer){for(let ze=0;ze<Y.locationSize;ze++)p(Y.location+ze,ge.meshPerAttribute);y.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let ze=0;ze<Y.locationSize;ze++)g(Y.location+ze);n.bindBuffer(n.ARRAY_BUFFER,nt);for(let ze=0;ze<Y.locationSize;ze++)x(Y.location+ze,Te/Y.locationSize,ee,me,De*ae,(We+Te/Y.locationSize*ze)*ae,_e)}else{if(Ee.isInstancedBufferAttribute){for(let ge=0;ge<Y.locationSize;ge++)p(Y.location+ge,Ee.meshPerAttribute);y.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=Ee.meshPerAttribute*Ee.count)}else for(let ge=0;ge<Y.locationSize;ge++)g(Y.location+ge);n.bindBuffer(n.ARRAY_BUFFER,nt);for(let ge=0;ge<Y.locationSize;ge++)x(Y.location+ge,Te/Y.locationSize,ee,me,Te*ae,Te/Y.locationSize*ge*ae,_e)}}else if(G!==void 0){let me=G[se];if(me!==void 0)switch(me.length){case 2:n.vertexAttrib2fv(Y.location,me);break;case 3:n.vertexAttrib3fv(Y.location,me);break;case 4:n.vertexAttrib4fv(Y.location,me);break;default:n.vertexAttrib1fv(Y.location,me)}}}}S()}function D(){U();for(let y in i){let P=i[y];for(let H in P){let L=P[H];for(let F in L)u(L[F].object),delete L[F];delete P[H]}delete i[y]}}function R(y){if(i[y.id]===void 0)return;let P=i[y.id];for(let H in P){let L=P[H];for(let F in L)u(L[F].object),delete L[F];delete P[H]}delete i[y.id]}function O(y){for(let P in i){let H=i[P];if(H[y.id]===void 0)continue;let L=H[y.id];for(let F in L)u(L[F].object),delete L[F];delete H[y.id]}}function U(){T(),o=!0,r!==s&&(r=s,c(r.object))}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:U,resetDefaultState:T,dispose:D,releaseStatesOfGeometry:R,releaseStatesOfProgram:O,initAttributes:_,enableAttribute:g,disableUnusedAttributes:S}}function lx(n,e,t){let i;function s(c){i=c}function r(c,u){n.drawArrays(i,c,u),t.update(u,i,1)}function o(c,u,h){h!==0&&(n.drawArraysInstanced(i,c,u,h),t.update(u,i,h))}function a(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,h);let d=0;for(let m=0;m<h;m++)d+=u[m];t.update(d,i,1)}function l(c,u,h,f){if(h===0)return;let d=e.get("WEBGL_multi_draw");if(d===null)for(let m=0;m<c.length;m++)o(c[m],u[m],f[m]);else{d.multiDrawArraysInstancedWEBGL(i,c,0,u,0,f,0,h);let m=0;for(let _=0;_<h;_++)m+=u[_]*f[_];t.update(m,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function ux(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let O=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(O.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(O){return!(O!==An&&i.convert(O)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(O){let U=O===Wr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(O!==ti&&i.convert(O)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&O!==Ln&&!U)}function l(O){if(O==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";O="mediump"}return O==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=t.logarithmicDepthBuffer===!0,f=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),d=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),S=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),x=n.getParameter(n.MAX_VARYING_VECTORS),E=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),D=m>0,R=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:f,maxTextures:d,maxVertexTextures:m,maxTextureSize:_,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:S,maxVaryings:x,maxFragmentUniforms:E,vertexTextures:D,maxSamples:R}}function hx(n){let e=this,t=null,i=0,s=!1,r=!1,o=new bn,a=new Ze,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let d=h.length!==0||f||i!==0||s;return s=f,i=h.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,d){let m=h.clippingPlanes,_=h.clipIntersection,g=h.clipShadows,p=n.get(h);if(!s||m===null||m.length===0||r&&!g)r?u(null):c();else{let S=r?0:i,x=S*4,E=p.clippingState||null;l.value=E,E=u(m,f,x,d);for(let D=0;D!==x;++D)E[D]=t[D];p.clippingState=E,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,f,d,m){let _=h!==null?h.length:0,g=null;if(_!==0){if(g=l.value,m!==!0||g===null){let p=d+_*4,S=f.matrixWorldInverse;a.getNormalMatrix(S),(g===null||g.length<p)&&(g=new Float32Array(p));for(let x=0,E=d;x!==_;++x,E+=4)o.copy(h[x]).applyMatrix4(S,a),o.normal.toArray(g,E),g[E+3]=o.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,g}}function dx(n){let e=new WeakMap;function t(o,a){return a===Hl?o.mapping=Gs:a===Fl&&(o.mapping=Vs),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===Hl||a===Fl)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Eu(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}var ua=class extends ca{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ns=4,of=[.125,.215,.35,.446,.526,.582],Yi=20,El=new ua,af=new ke,xl=null,yl=0,Sl=0,Tl=!1,Xi=(1+Math.sqrt(5))/2,Os=1/Xi,cf=[new N(-Xi,Os,0),new N(Xi,Os,0),new N(-Os,0,Xi),new N(Os,0,Xi),new N(0,Xi,-Os),new N(0,Xi,Os),new N(-1,1,-1),new N(1,1,-1),new N(-1,1,1),new N(1,1,1)],ha=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100){xl=this._renderer.getRenderTarget(),yl=this._renderer.getActiveCubeFace(),Sl=this._renderer.getActiveMipmapLevel(),Tl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,i,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=hf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=uf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(xl,yl,Sl),this._renderer.xr.enabled=Tl,e.scissorTest=!1,zo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Gs||e.mapping===Vs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),xl=this._renderer.getRenderTarget(),yl=this._renderer.getActiveCubeFace(),Sl=this._renderer.getActiveMipmapLevel(),Tl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Un,minFilter:Un,generateMipmaps:!1,type:Wr,format:An,colorSpace:js,depthBuffer:!1},s=lf(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=lf(e,t,i);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=fx(r)),this._blurMaterial=px(r,e,t)}return s}_compileMaterial(e){let t=new Z(this._lodPlanes[0],e);this._renderer.compile(t,El)}_sceneToCubeUV(e,t,i,s){let a=new Zt(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,f=u.toneMapping;u.getClearColor(af),u.toneMapping=bi,u.autoClear=!1;let d=new Lt({name:"PMREM.Background",side:sn,depthWrite:!1,depthTest:!1}),m=new Z(new ct,d),_=!1,g=e.background;g?g.isColor&&(d.color.copy(g),e.background=null,_=!0):(d.color.copy(af),_=!0);for(let p=0;p<6;p++){let S=p%3;S===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):S===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));let x=this._cubeSize;zo(s,S*x,p>2?x:0,x,x),u.setRenderTarget(s),_&&u.render(m,a),u.render(e,a)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=f,u.autoClear=h,e.background=g}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===Gs||e.mapping===Vs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=hf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=uf());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new Z(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;zo(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,El)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=cf[(s-r-1)%cf.length];this._blur(e,r-1,r,o,a)}t.autoClear=i}_blur(e,t,i,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new Z(this._lodPlanes[s],c),f=c.uniforms,d=this._sizeLods[i]-1,m=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*Yi-1),_=r/m,g=isFinite(r)?1+Math.floor(u*_):Yi;g>Yi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Yi}`);let p=[],S=0;for(let O=0;O<Yi;++O){let U=O/_,T=Math.exp(-U*U/2);p.push(T),O===0?S+=T:O<g&&(S+=2*T)}for(let O=0;O<p.length;O++)p[O]=p[O]/S;f.envMap.value=e.texture,f.samples.value=g,f.weights.value=p,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:x}=this;f.dTheta.value=m,f.mipInt.value=x-i;let E=this._sizeLods[s],D=3*E*(s>x-Ns?s-x+Ns:0),R=4*(this._cubeSize-E);zo(t,D,R,3*E,2*E),l.setRenderTarget(t),l.render(h,El)}};function fx(n){let e=[],t=[],i=[],s=n,r=n-Ns+1+of.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>n-Ns?l=of[o-n+Ns-1]:o===0&&(l=0),i.push(l);let c=1/(a-2),u=-c,h=1+c,f=[u,u,h,u,h,h,u,u,h,h,u,h],d=6,m=6,_=3,g=2,p=1,S=new Float32Array(_*m*d),x=new Float32Array(g*m*d),E=new Float32Array(p*m*d);for(let R=0;R<d;R++){let O=R%3*2/3-1,U=R>2?0:-1,T=[O,U,0,O+2/3,U,0,O+2/3,U+1,0,O,U,0,O+2/3,U+1,0,O,U+1,0];S.set(T,_*m*R),x.set(f,g*m*R);let y=[R,R,R,R,R,R];E.set(y,p*m*R)}let D=new Et;D.setAttribute("position",new Ct(S,_)),D.setAttribute("uv",new Ct(x,g)),D.setAttribute("faceIndex",new Ct(E,p)),e.push(D),s>Ns&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function lf(n,e,t){let i=new ii(n,e,t);return i.texture.mapping=Da,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function zo(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function px(n,e,t){let i=new Float32Array(Yi),s=new N(0,1,0);return new Dn({name:"SphericalGaussianBlur",defines:{n:Yi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ah(),fragmentShader:`

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
		`,blending:Mi,depthTest:!1,depthWrite:!1})}function uf(){return new Dn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ah(),fragmentShader:`

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
		`,blending:Mi,depthTest:!1,depthWrite:!1})}function hf(){return new Dn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ah(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Mi,depthTest:!1,depthWrite:!1})}function ah(){return`

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
	`}function mx(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===Hl||l===Fl,u=l===Gs||l===Vs;if(c||u){let h=e.get(a),f=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new ha(n)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let d=a.image;return c&&d&&d.height>0||u&&d&&s(d)?(t===null&&(t=new ha(n)),h=c?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function gx(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&vr("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function _x(n,e,t,i){let s={},r=new WeakMap;function o(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let m in f.attributes)e.remove(f.attributes[m]);for(let m in f.morphAttributes){let _=f.morphAttributes[m];for(let g=0,p=_.length;g<p;g++)e.remove(_[g])}f.removeEventListener("dispose",o),delete s[f.id];let d=r.get(f);d&&(e.remove(d),r.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(h,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function l(h){let f=h.attributes;for(let m in f)e.update(f[m],n.ARRAY_BUFFER);let d=h.morphAttributes;for(let m in d){let _=d[m];for(let g=0,p=_.length;g<p;g++)e.update(_[g],n.ARRAY_BUFFER)}}function c(h){let f=[],d=h.index,m=h.attributes.position,_=0;if(d!==null){let S=d.array;_=d.version;for(let x=0,E=S.length;x<E;x+=3){let D=S[x+0],R=S[x+1],O=S[x+2];f.push(D,R,R,O,O,D)}}else if(m!==void 0){let S=m.array;_=m.version;for(let x=0,E=S.length/3-1;x<E;x+=3){let D=x+0,R=x+1,O=x+2;f.push(D,R,R,O,O,D)}}else return;let g=new(sp(f)?aa:oa)(f,1);g.version=_;let p=r.get(h);p&&e.remove(p),r.set(h,g)}function u(h){let f=r.get(h);if(f){let d=h.index;d!==null&&f.version<d.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function Ex(n,e,t){let i;function s(f){i=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,d){n.drawElements(i,d,r,f*o),t.update(d,i,1)}function c(f,d,m){m!==0&&(n.drawElementsInstanced(i,d,r,f*o,m),t.update(d,i,m))}function u(f,d,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,f,0,m);let g=0;for(let p=0;p<m;p++)g+=d[p];t.update(g,i,1)}function h(f,d,m,_){if(m===0)return;let g=e.get("WEBGL_multi_draw");if(g===null)for(let p=0;p<f.length;p++)c(f[p]/o,d[p],_[p]);else{g.multiDrawElementsInstancedWEBGL(i,d,0,r,f,0,_,0,m);let p=0;for(let S=0;S<m;S++)p+=d[S]*_[S];t.update(p,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function xx(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function yx(n,e,t){let i=new WeakMap,s=new mt;function r(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,f=i.get(a);if(f===void 0||f.count!==h){let T=function(){O.dispose(),i.delete(a),a.removeEventListener("dispose",T)};f!==void 0&&f.texture.dispose();let d=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],S=a.morphAttributes.color||[],x=0;d===!0&&(x=1),m===!0&&(x=2),_===!0&&(x=3);let E=a.attributes.position.count*x,D=1;E>e.maxTextureSize&&(D=Math.ceil(E/e.maxTextureSize),E=e.maxTextureSize);let R=new Float32Array(E*D*4*h),O=new ra(R,E,D,h);O.type=Ln,O.needsUpdate=!0;let U=x*4;for(let y=0;y<h;y++){let P=g[y],H=p[y],L=S[y],F=E*D*4*y;for(let K=0;K<P.count;K++){let G=K*U;d===!0&&(s.fromBufferAttribute(P,K),R[F+G+0]=s.x,R[F+G+1]=s.y,R[F+G+2]=s.z,R[F+G+3]=0),m===!0&&(s.fromBufferAttribute(H,K),R[F+G+4]=s.x,R[F+G+5]=s.y,R[F+G+6]=s.z,R[F+G+7]=0),_===!0&&(s.fromBufferAttribute(L,K),R[F+G+8]=s.x,R[F+G+9]=s.y,R[F+G+10]=s.z,R[F+G+11]=L.itemSize===4?s.w:1)}}f={count:h,texture:O,size:new le(E,D)},i.set(a,f),a.addEventListener("dispose",T)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let d=0;for(let _=0;_<c.length;_++)d+=c[_];let m=a.morphTargetsRelative?1:1-d;l.getUniforms().setValue(n,"morphTargetBaseInfluence",m),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:r}}function Sx(n,e,t,i){let s=new WeakMap;function r(l){let c=i.render.frame,u=l.geometry,h=e.get(l,u);if(s.get(h)!==c&&(e.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return h}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}var da=class extends rn{constructor(e,t,i,s,r,o,a,l,c,u=Hs){if(u!==Hs&&u!==$s)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===Hs&&(i=Zi),i===void 0&&u===$s&&(i=Xs),super(null,s,r,o,a,l,u,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:dn,this.minFilter=l!==void 0?l:dn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},cp=new rn,df=new da(1,1),lp=new ra,up=new gu,hp=new la,ff=[],pf=[],mf=new Float32Array(16),gf=new Float32Array(9),_f=new Float32Array(4);function Qs(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=ff[s];if(r===void 0&&(r=new Float32Array(s),ff[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Dt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function kt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Fa(n,e){let t=pf[e];t===void 0&&(t=new Int32Array(e),pf[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Tx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function vx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;n.uniform2fv(this.addr,e),kt(t,e)}}function Mx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Dt(t,e))return;n.uniform3fv(this.addr,e),kt(t,e)}}function bx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;n.uniform4fv(this.addr,e),kt(t,e)}}function Ax(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Dt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),kt(t,e)}else{if(Dt(t,i))return;_f.set(i),n.uniformMatrix2fv(this.addr,!1,_f),kt(t,i)}}function wx(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Dt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),kt(t,e)}else{if(Dt(t,i))return;gf.set(i),n.uniformMatrix3fv(this.addr,!1,gf),kt(t,i)}}function Rx(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Dt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),kt(t,e)}else{if(Dt(t,i))return;mf.set(i),n.uniformMatrix4fv(this.addr,!1,mf),kt(t,i)}}function Cx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Ix(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;n.uniform2iv(this.addr,e),kt(t,e)}}function Px(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Dt(t,e))return;n.uniform3iv(this.addr,e),kt(t,e)}}function Ox(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;n.uniform4iv(this.addr,e),kt(t,e)}}function Ux(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Lx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;n.uniform2uiv(this.addr,e),kt(t,e)}}function Nx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Dt(t,e))return;n.uniform3uiv(this.addr,e),kt(t,e)}}function Dx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;n.uniform4uiv(this.addr,e),kt(t,e)}}function kx(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(df.compareFunction=ip,r=df):r=cp,t.setTexture2D(e||r,s)}function Hx(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||up,s)}function Fx(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||hp,s)}function Bx(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||lp,s)}function zx(n){switch(n){case 5126:return Tx;case 35664:return vx;case 35665:return Mx;case 35666:return bx;case 35674:return Ax;case 35675:return wx;case 35676:return Rx;case 5124:case 35670:return Cx;case 35667:case 35671:return Ix;case 35668:case 35672:return Px;case 35669:case 35673:return Ox;case 5125:return Ux;case 36294:return Lx;case 36295:return Nx;case 36296:return Dx;case 35678:case 36198:case 36298:case 36306:case 35682:return kx;case 35679:case 36299:case 36307:return Hx;case 35680:case 36300:case 36308:case 36293:return Fx;case 36289:case 36303:case 36311:case 36292:return Bx}}function Gx(n,e){n.uniform1fv(this.addr,e)}function Vx(n,e){let t=Qs(e,this.size,2);n.uniform2fv(this.addr,t)}function Wx(n,e){let t=Qs(e,this.size,3);n.uniform3fv(this.addr,t)}function Xx(n,e){let t=Qs(e,this.size,4);n.uniform4fv(this.addr,t)}function $x(n,e){let t=Qs(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function qx(n,e){let t=Qs(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Yx(n,e){let t=Qs(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Kx(n,e){n.uniform1iv(this.addr,e)}function Zx(n,e){n.uniform2iv(this.addr,e)}function Jx(n,e){n.uniform3iv(this.addr,e)}function jx(n,e){n.uniform4iv(this.addr,e)}function Qx(n,e){n.uniform1uiv(this.addr,e)}function ey(n,e){n.uniform2uiv(this.addr,e)}function ty(n,e){n.uniform3uiv(this.addr,e)}function ny(n,e){n.uniform4uiv(this.addr,e)}function iy(n,e,t){let i=this.cache,s=e.length,r=Fa(t,s);Dt(i,r)||(n.uniform1iv(this.addr,r),kt(i,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||cp,r[o])}function sy(n,e,t){let i=this.cache,s=e.length,r=Fa(t,s);Dt(i,r)||(n.uniform1iv(this.addr,r),kt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||up,r[o])}function ry(n,e,t){let i=this.cache,s=e.length,r=Fa(t,s);Dt(i,r)||(n.uniform1iv(this.addr,r),kt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||hp,r[o])}function oy(n,e,t){let i=this.cache,s=e.length,r=Fa(t,s);Dt(i,r)||(n.uniform1iv(this.addr,r),kt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||lp,r[o])}function ay(n){switch(n){case 5126:return Gx;case 35664:return Vx;case 35665:return Wx;case 35666:return Xx;case 35674:return $x;case 35675:return qx;case 35676:return Yx;case 5124:case 35670:return Kx;case 35667:case 35671:return Zx;case 35668:case 35672:return Jx;case 35669:case 35673:return jx;case 5125:return Qx;case 36294:return ey;case 36295:return ty;case 36296:return ny;case 35678:case 36198:case 36298:case 36306:case 35682:return iy;case 35679:case 36299:case 36307:return sy;case 35680:case 36300:case 36308:case 36293:return ry;case 36289:case 36303:case 36311:case 36292:return oy}}var xu=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=zx(t.type)}},yu=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ay(t.type)}},Su=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],i)}}},vl=/(\w+)(\])?(\[|\.)?/g;function Ef(n,e){n.seq.push(e),n.map[e.id]=e}function cy(n,e,t){let i=n.name,s=i.length;for(vl.lastIndex=0;;){let r=vl.exec(i),o=vl.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Ef(t,c===void 0?new xu(a,n,e):new yu(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new Su(a),Ef(t,h)),t=h}}}var Bs=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);cy(r,o,this)}}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&i.push(o)}return i}};function xf(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var ly=37297,uy=0;function hy(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}var yf=new Ze;function dy(n){lt._getMatrix(yf,lt.workingColorSpace,n);let e=`mat3( ${yf.elements.map(t=>t.toFixed(4))} )`;switch(lt.getTransfer(n)){case ka:return[e,"LinearTransferOETF"];case pt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Sf(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),s=n.getShaderInfoLog(e).trim();if(i&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+hy(n.getShaderSource(e),o)}else return s}function fy(n,e){let t=dy(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function py(n,e){let t;switch(e){case bg:t="Linear";break;case Ag:t="Reinhard";break;case wg:t="Cineon";break;case ju:t="ACESFilmic";break;case Cg:t="AgX";break;case Ig:t="Neutral";break;case Rg:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Go=new N;function my(){lt.getLuminanceCoefficients(Go);let n=Go.x.toFixed(4),e=Go.y.toFixed(4),t=Go.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function gy(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Mr).join(`
`)}function _y(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Ey(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),o=r.name,a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Mr(n){return n!==""}function Tf(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function vf(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var xy=/^[ \t]*#include +<([\w\d./]+)>/gm;function Tu(n){return n.replace(xy,Sy)}var yy=new Map;function Sy(n,e){let t=Qe[e];if(t===void 0){let i=yy.get(e);if(i!==void 0)t=Qe[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Tu(t)}var Ty=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Mf(n){return n.replace(Ty,vy)}function vy(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function bf(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}function My(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Wf?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Ju?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Zn&&(e="SHADOWMAP_TYPE_VSM"),e}function by(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Gs:case Vs:e="ENVMAP_TYPE_CUBE";break;case Da:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Ay(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Vs:e="ENVMAP_MODE_REFRACTION";break}return e}function wy(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Xf:e="ENVMAP_BLENDING_MULTIPLY";break;case vg:e="ENVMAP_BLENDING_MIX";break;case Mg:e="ENVMAP_BLENDING_ADD";break}return e}function Ry(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Cy(n,e,t,i){let s=n.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=My(t),c=by(t),u=Ay(t),h=wy(t),f=Ry(t),d=gy(t),m=_y(r),_=s.createProgram(),g,p,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Mr).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Mr).join(`
`),p.length>0&&(p+=`
`)):(g=[bf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Mr).join(`
`),p=[bf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==bi?"#define TONE_MAPPING":"",t.toneMapping!==bi?Qe.tonemapping_pars_fragment:"",t.toneMapping!==bi?py("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Qe.colorspace_pars_fragment,fy("linearToOutputTexel",t.outputColorSpace),my(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Mr).join(`
`)),o=Tu(o),o=Tf(o,t),o=vf(o,t),a=Tu(a),a=Tf(a,t),a=vf(a,t),o=Mf(o),a=Mf(a),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,g=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===kd?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===kd?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let x=S+g+o,E=S+p+a,D=xf(s,s.VERTEX_SHADER,x),R=xf(s,s.FRAGMENT_SHADER,E);s.attachShader(_,D),s.attachShader(_,R),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function O(P){if(n.debug.checkShaderErrors){let H=s.getProgramInfoLog(_).trim(),L=s.getShaderInfoLog(D).trim(),F=s.getShaderInfoLog(R).trim(),K=!0,G=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(K=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,_,D,R);else{let se=Sf(s,D,"vertex"),Y=Sf(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+H+`
`+se+`
`+Y)}else H!==""?console.warn("THREE.WebGLProgram: Program Info Log:",H):(L===""||F==="")&&(G=!1);G&&(P.diagnostics={runnable:K,programLog:H,vertexShader:{log:L,prefix:g},fragmentShader:{log:F,prefix:p}})}s.deleteShader(D),s.deleteShader(R),U=new Bs(s,_),T=Ey(s,_)}let U;this.getUniforms=function(){return U===void 0&&O(this),U};let T;this.getAttributes=function(){return T===void 0&&O(this),T};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(_,ly)),y},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=uy++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=D,this.fragmentShader=R,this}var Iy=0,vu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Mu(e),t.set(e,i)),i}},Mu=class{constructor(e){this.id=Iy++,this.code=e,this.usedTimes=0}};function Py(n,e,t,i,s,r,o){let a=new Ur,l=new vu,c=new Set,u=[],h=s.logarithmicDepthBuffer,f=s.vertexTextures,d=s.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(T){return c.add(T),T===0?"uv":`uv${T}`}function g(T,y,P,H,L){let F=H.fog,K=L.geometry,G=T.isMeshStandardMaterial?H.environment:null,se=(T.isMeshStandardMaterial?t:e).get(T.envMap||G),Y=se&&se.mapping===Da?se.image.height:null,Ee=m[T.type];T.precision!==null&&(d=s.getMaxPrecision(T.precision),d!==T.precision&&console.warn("THREE.WebGLProgram.getParameters:",T.precision,"not supported, using",d,"instead."));let me=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Te=me!==void 0?me.length:0,be=0;K.morphAttributes.position!==void 0&&(be=1),K.morphAttributes.normal!==void 0&&(be=2),K.morphAttributes.color!==void 0&&(be=3);let nt,ee,ae,_e;if(Ee){let tt=On[Ee];nt=tt.vertexShader,ee=tt.fragmentShader}else nt=T.vertexShader,ee=T.fragmentShader,l.update(T),ae=l.getVertexShaderID(T),_e=l.getFragmentShaderID(T);let ge=n.getRenderTarget(),De=n.state.buffers.depth.getReversed(),We=L.isInstancedMesh===!0,ze=L.isBatchedMesh===!0,je=!!T.map,oe=!!T.matcap,fe=!!se,k=!!T.aoMap,Pe=!!T.lightMap,ue=!!T.bumpMap,Me=!!T.normalMap,pe=!!T.displacementMap,Fe=!!T.emissiveMap,ve=!!T.metalnessMap,I=!!T.roughnessMap,v=T.anisotropy>0,q=T.clearcoat>0,ne=T.dispersion>0,M=T.iridescence>0,C=T.sheen>0,ie=T.transmission>0,Q=v&&!!T.anisotropyMap,ce=q&&!!T.clearcoatMap,we=q&&!!T.clearcoatNormalMap,re=q&&!!T.clearcoatRoughnessMap,Se=M&&!!T.iridescenceMap,Ie=M&&!!T.iridescenceThicknessMap,Ge=C&&!!T.sheenColorMap,Ce=C&&!!T.sheenRoughnessMap,it=!!T.specularMap,w=!!T.specularColorMap,z=!!T.specularIntensityMap,b=ie&&!!T.transmissionMap,B=ie&&!!T.thicknessMap,V=!!T.gradientMap,$=!!T.alphaMap,te=T.alphaTest>0,he=!!T.alphaHash,Xe=!!T.extensions,qe=bi;T.toneMapped&&(ge===null||ge.isXRRenderTarget===!0)&&(qe=n.toneMapping);let rt={shaderID:Ee,shaderType:T.type,shaderName:T.name,vertexShader:nt,fragmentShader:ee,defines:T.defines,customVertexShaderID:ae,customFragmentShaderID:_e,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:d,batching:ze,batchingColor:ze&&L._colorsTexture!==null,instancing:We,instancingColor:We&&L.instanceColor!==null,instancingMorph:We&&L.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ge===null?n.outputColorSpace:ge.isXRRenderTarget===!0?ge.texture.colorSpace:js,alphaToCoverage:!!T.alphaToCoverage,map:je,matcap:oe,envMap:fe,envMapMode:fe&&se.mapping,envMapCubeUVHeight:Y,aoMap:k,lightMap:Pe,bumpMap:ue,normalMap:Me,displacementMap:f&&pe,emissiveMap:Fe,normalMapObjectSpace:Me&&T.normalMapType===Lg,normalMapTangentSpace:Me&&T.normalMapType===np,metalnessMap:ve,roughnessMap:I,anisotropy:v,anisotropyMap:Q,clearcoat:q,clearcoatMap:ce,clearcoatNormalMap:we,clearcoatRoughnessMap:re,dispersion:ne,iridescence:M,iridescenceMap:Se,iridescenceThicknessMap:Ie,sheen:C,sheenColorMap:Ge,sheenRoughnessMap:Ce,specularMap:it,specularColorMap:w,specularIntensityMap:z,transmission:ie,transmissionMap:b,thicknessMap:B,gradientMap:V,opaque:T.transparent===!1&&T.blending===ks&&T.alphaToCoverage===!1,alphaMap:$,alphaTest:te,alphaHash:he,combine:T.combine,mapUv:je&&_(T.map.channel),aoMapUv:k&&_(T.aoMap.channel),lightMapUv:Pe&&_(T.lightMap.channel),bumpMapUv:ue&&_(T.bumpMap.channel),normalMapUv:Me&&_(T.normalMap.channel),displacementMapUv:pe&&_(T.displacementMap.channel),emissiveMapUv:Fe&&_(T.emissiveMap.channel),metalnessMapUv:ve&&_(T.metalnessMap.channel),roughnessMapUv:I&&_(T.roughnessMap.channel),anisotropyMapUv:Q&&_(T.anisotropyMap.channel),clearcoatMapUv:ce&&_(T.clearcoatMap.channel),clearcoatNormalMapUv:we&&_(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:re&&_(T.clearcoatRoughnessMap.channel),iridescenceMapUv:Se&&_(T.iridescenceMap.channel),iridescenceThicknessMapUv:Ie&&_(T.iridescenceThicknessMap.channel),sheenColorMapUv:Ge&&_(T.sheenColorMap.channel),sheenRoughnessMapUv:Ce&&_(T.sheenRoughnessMap.channel),specularMapUv:it&&_(T.specularMap.channel),specularColorMapUv:w&&_(T.specularColorMap.channel),specularIntensityMapUv:z&&_(T.specularIntensityMap.channel),transmissionMapUv:b&&_(T.transmissionMap.channel),thicknessMapUv:B&&_(T.thicknessMap.channel),alphaMapUv:$&&_(T.alphaMap.channel),vertexTangents:!!K.attributes.tangent&&(Me||v),vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!K.attributes.uv&&(je||$),fog:!!F,useFog:T.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:T.flatShading===!0,sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:De,skinning:L.isSkinnedMesh===!0,morphTargets:K.morphAttributes.position!==void 0,morphNormals:K.morphAttributes.normal!==void 0,morphColors:K.morphAttributes.color!==void 0,morphTargetsCount:Te,morphTextureStride:be,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:T.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:qe,decodeVideoTexture:je&&T.map.isVideoTexture===!0&&lt.getTransfer(T.map.colorSpace)===pt,decodeVideoTextureEmissive:Fe&&T.emissiveMap.isVideoTexture===!0&&lt.getTransfer(T.emissiveMap.colorSpace)===pt,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===Wt,flipSided:T.side===sn,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:Xe&&T.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Xe&&T.extensions.multiDraw===!0||ze)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return rt.vertexUv1s=c.has(1),rt.vertexUv2s=c.has(2),rt.vertexUv3s=c.has(3),c.clear(),rt}function p(T){let y=[];if(T.shaderID?y.push(T.shaderID):(y.push(T.customVertexShaderID),y.push(T.customFragmentShaderID)),T.defines!==void 0)for(let P in T.defines)y.push(P),y.push(T.defines[P]);return T.isRawShaderMaterial===!1&&(S(y,T),x(y,T),y.push(n.outputColorSpace)),y.push(T.customProgramCacheKey),y.join()}function S(T,y){T.push(y.precision),T.push(y.outputColorSpace),T.push(y.envMapMode),T.push(y.envMapCubeUVHeight),T.push(y.mapUv),T.push(y.alphaMapUv),T.push(y.lightMapUv),T.push(y.aoMapUv),T.push(y.bumpMapUv),T.push(y.normalMapUv),T.push(y.displacementMapUv),T.push(y.emissiveMapUv),T.push(y.metalnessMapUv),T.push(y.roughnessMapUv),T.push(y.anisotropyMapUv),T.push(y.clearcoatMapUv),T.push(y.clearcoatNormalMapUv),T.push(y.clearcoatRoughnessMapUv),T.push(y.iridescenceMapUv),T.push(y.iridescenceThicknessMapUv),T.push(y.sheenColorMapUv),T.push(y.sheenRoughnessMapUv),T.push(y.specularMapUv),T.push(y.specularColorMapUv),T.push(y.specularIntensityMapUv),T.push(y.transmissionMapUv),T.push(y.thicknessMapUv),T.push(y.combine),T.push(y.fogExp2),T.push(y.sizeAttenuation),T.push(y.morphTargetsCount),T.push(y.morphAttributeCount),T.push(y.numDirLights),T.push(y.numPointLights),T.push(y.numSpotLights),T.push(y.numSpotLightMaps),T.push(y.numHemiLights),T.push(y.numRectAreaLights),T.push(y.numDirLightShadows),T.push(y.numPointLightShadows),T.push(y.numSpotLightShadows),T.push(y.numSpotLightShadowsWithMaps),T.push(y.numLightProbes),T.push(y.shadowMapType),T.push(y.toneMapping),T.push(y.numClippingPlanes),T.push(y.numClipIntersection),T.push(y.depthPacking)}function x(T,y){a.disableAll(),y.supportsVertexTextures&&a.enable(0),y.instancing&&a.enable(1),y.instancingColor&&a.enable(2),y.instancingMorph&&a.enable(3),y.matcap&&a.enable(4),y.envMap&&a.enable(5),y.normalMapObjectSpace&&a.enable(6),y.normalMapTangentSpace&&a.enable(7),y.clearcoat&&a.enable(8),y.iridescence&&a.enable(9),y.alphaTest&&a.enable(10),y.vertexColors&&a.enable(11),y.vertexAlphas&&a.enable(12),y.vertexUv1s&&a.enable(13),y.vertexUv2s&&a.enable(14),y.vertexUv3s&&a.enable(15),y.vertexTangents&&a.enable(16),y.anisotropy&&a.enable(17),y.alphaHash&&a.enable(18),y.batching&&a.enable(19),y.dispersion&&a.enable(20),y.batchingColor&&a.enable(21),T.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reverseDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),T.push(a.mask)}function E(T){let y=m[T.type],P;if(y){let H=On[y];P=S0.clone(H.uniforms)}else P=T.uniforms;return P}function D(T,y){let P;for(let H=0,L=u.length;H<L;H++){let F=u[H];if(F.cacheKey===y){P=F,++P.usedTimes;break}}return P===void 0&&(P=new Cy(n,y,T,r),u.push(P)),P}function R(T){if(--T.usedTimes===0){let y=u.indexOf(T);u[y]=u[u.length-1],u.pop(),T.destroy()}}function O(T){l.remove(T)}function U(){l.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:E,acquireProgram:D,releaseProgram:R,releaseShaderCache:O,programs:u,dispose:U}}function Oy(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function Uy(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Af(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function wf(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(h,f,d,m,_,g){let p=n[e];return p===void 0?(p={id:h.id,object:h,geometry:f,material:d,groupOrder:m,renderOrder:h.renderOrder,z:_,group:g},n[e]=p):(p.id=h.id,p.object=h,p.geometry=f,p.material=d,p.groupOrder=m,p.renderOrder=h.renderOrder,p.z=_,p.group=g),e++,p}function a(h,f,d,m,_,g){let p=o(h,f,d,m,_,g);d.transmission>0?i.push(p):d.transparent===!0?s.push(p):t.push(p)}function l(h,f,d,m,_,g){let p=o(h,f,d,m,_,g);d.transmission>0?i.unshift(p):d.transparent===!0?s.unshift(p):t.unshift(p)}function c(h,f){t.length>1&&t.sort(h||Uy),i.length>1&&i.sort(f||Af),s.length>1&&s.sort(f||Af)}function u(){for(let h=e,f=n.length;h<f;h++){let d=n[h];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function Ly(){let n=new WeakMap;function e(i,s){let r=n.get(i),o;return r===void 0?(o=new wf,n.set(i,[o])):s>=r.length?(o=new wf,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function Ny(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new N,color:new ke};break;case"SpotLight":t={position:new N,direction:new N,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":t={color:new ke,position:new N,halfWidth:new N,halfHeight:new N};break}return n[e.id]=t,t}}}function Dy(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new le};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new le};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new le,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var ky=0;function Hy(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function Fy(n){let e=new Ny,t=Dy(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new N);let s=new N,r=new at,o=new at;function a(c){let u=0,h=0,f=0;for(let T=0;T<9;T++)i.probe[T].set(0,0,0);let d=0,m=0,_=0,g=0,p=0,S=0,x=0,E=0,D=0,R=0,O=0;c.sort(Hy);for(let T=0,y=c.length;T<y;T++){let P=c[T],H=P.color,L=P.intensity,F=P.distance,K=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=H.r*L,h+=H.g*L,f+=H.b*L;else if(P.isLightProbe){for(let G=0;G<9;G++)i.probe[G].addScaledVector(P.sh.coefficients[G],L);O++}else if(P.isDirectionalLight){let G=e.get(P);if(G.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let se=P.shadow,Y=t.get(P);Y.shadowIntensity=se.intensity,Y.shadowBias=se.bias,Y.shadowNormalBias=se.normalBias,Y.shadowRadius=se.radius,Y.shadowMapSize=se.mapSize,i.directionalShadow[d]=Y,i.directionalShadowMap[d]=K,i.directionalShadowMatrix[d]=P.shadow.matrix,S++}i.directional[d]=G,d++}else if(P.isSpotLight){let G=e.get(P);G.position.setFromMatrixPosition(P.matrixWorld),G.color.copy(H).multiplyScalar(L),G.distance=F,G.coneCos=Math.cos(P.angle),G.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),G.decay=P.decay,i.spot[_]=G;let se=P.shadow;if(P.map&&(i.spotLightMap[D]=P.map,D++,se.updateMatrices(P),P.castShadow&&R++),i.spotLightMatrix[_]=se.matrix,P.castShadow){let Y=t.get(P);Y.shadowIntensity=se.intensity,Y.shadowBias=se.bias,Y.shadowNormalBias=se.normalBias,Y.shadowRadius=se.radius,Y.shadowMapSize=se.mapSize,i.spotShadow[_]=Y,i.spotShadowMap[_]=K,E++}_++}else if(P.isRectAreaLight){let G=e.get(P);G.color.copy(H).multiplyScalar(L),G.halfWidth.set(P.width*.5,0,0),G.halfHeight.set(0,P.height*.5,0),i.rectArea[g]=G,g++}else if(P.isPointLight){let G=e.get(P);if(G.color.copy(P.color).multiplyScalar(P.intensity),G.distance=P.distance,G.decay=P.decay,P.castShadow){let se=P.shadow,Y=t.get(P);Y.shadowIntensity=se.intensity,Y.shadowBias=se.bias,Y.shadowNormalBias=se.normalBias,Y.shadowRadius=se.radius,Y.shadowMapSize=se.mapSize,Y.shadowCameraNear=se.camera.near,Y.shadowCameraFar=se.camera.far,i.pointShadow[m]=Y,i.pointShadowMap[m]=K,i.pointShadowMatrix[m]=P.shadow.matrix,x++}i.point[m]=G,m++}else if(P.isHemisphereLight){let G=e.get(P);G.skyColor.copy(P.color).multiplyScalar(L),G.groundColor.copy(P.groundColor).multiplyScalar(L),i.hemi[p]=G,p++}}g>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ye.LTC_FLOAT_1,i.rectAreaLTC2=ye.LTC_FLOAT_2):(i.rectAreaLTC1=ye.LTC_HALF_1,i.rectAreaLTC2=ye.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=f;let U=i.hash;(U.directionalLength!==d||U.pointLength!==m||U.spotLength!==_||U.rectAreaLength!==g||U.hemiLength!==p||U.numDirectionalShadows!==S||U.numPointShadows!==x||U.numSpotShadows!==E||U.numSpotMaps!==D||U.numLightProbes!==O)&&(i.directional.length=d,i.spot.length=_,i.rectArea.length=g,i.point.length=m,i.hemi.length=p,i.directionalShadow.length=S,i.directionalShadowMap.length=S,i.pointShadow.length=x,i.pointShadowMap.length=x,i.spotShadow.length=E,i.spotShadowMap.length=E,i.directionalShadowMatrix.length=S,i.pointShadowMatrix.length=x,i.spotLightMatrix.length=E+D-R,i.spotLightMap.length=D,i.numSpotLightShadowsWithMaps=R,i.numLightProbes=O,U.directionalLength=d,U.pointLength=m,U.spotLength=_,U.rectAreaLength=g,U.hemiLength=p,U.numDirectionalShadows=S,U.numPointShadows=x,U.numSpotShadows=E,U.numSpotMaps=D,U.numLightProbes=O,i.version=ky++)}function l(c,u){let h=0,f=0,d=0,m=0,_=0,g=u.matrixWorldInverse;for(let p=0,S=c.length;p<S;p++){let x=c[p];if(x.isDirectionalLight){let E=i.directional[h];E.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),h++}else if(x.isSpotLight){let E=i.spot[d];E.position.setFromMatrixPosition(x.matrixWorld),E.position.applyMatrix4(g),E.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),d++}else if(x.isRectAreaLight){let E=i.rectArea[m];E.position.setFromMatrixPosition(x.matrixWorld),E.position.applyMatrix4(g),o.identity(),r.copy(x.matrixWorld),r.premultiply(g),o.extractRotation(r),E.halfWidth.set(x.width*.5,0,0),E.halfHeight.set(0,x.height*.5,0),E.halfWidth.applyMatrix4(o),E.halfHeight.applyMatrix4(o),m++}else if(x.isPointLight){let E=i.point[f];E.position.setFromMatrixPosition(x.matrixWorld),E.position.applyMatrix4(g),f++}else if(x.isHemisphereLight){let E=i.hemi[_];E.direction.setFromMatrixPosition(x.matrixWorld),E.direction.transformDirection(g),_++}}}return{setup:a,setupView:l,state:i}}function Rf(n){let e=new Fy(n),t=[],i=[];function s(u){c.camera=u,t.length=0,i.length=0}function r(u){t.push(u)}function o(u){i.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}let c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function By(n){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Rf(n),e.set(s,[a])):r>=o.length?(a=new Rf(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var bu=class extends Ri{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Og,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Au=class extends Ri{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},zy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Gy=`uniform sampler2D shadow_pass;
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
}`;function Vy(n,e,t){let i=new Lr,s=new le,r=new le,o=new mt,a=new bu({depthPacking:Ug}),l=new Au,c={},u=t.maxTextureSize,h={[Ai]:sn,[sn]:Ai,[Wt]:Wt},f=new Dn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new le},radius:{value:4}},vertexShader:zy,fragmentShader:Gy}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let m=new Et;m.setAttribute("position",new Ct(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Z(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Wf;let p=this.type;this.render=function(R,O,U){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||R.length===0)return;let T=n.getRenderTarget(),y=n.getActiveCubeFace(),P=n.getActiveMipmapLevel(),H=n.state;H.setBlending(Mi),H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);let L=p!==Zn&&this.type===Zn,F=p===Zn&&this.type!==Zn;for(let K=0,G=R.length;K<G;K++){let se=R[K],Y=se.shadow;if(Y===void 0){console.warn("THREE.WebGLShadowMap:",se,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;s.copy(Y.mapSize);let Ee=Y.getFrameExtents();if(s.multiply(Ee),r.copy(Y.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/Ee.x),s.x=r.x*Ee.x,Y.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/Ee.y),s.y=r.y*Ee.y,Y.mapSize.y=r.y)),Y.map===null||L===!0||F===!0){let Te=this.type!==Zn?{minFilter:dn,magFilter:dn}:{};Y.map!==null&&Y.map.dispose(),Y.map=new ii(s.x,s.y,Te),Y.map.texture.name=se.name+".shadowMap",Y.camera.updateProjectionMatrix()}n.setRenderTarget(Y.map),n.clear();let me=Y.getViewportCount();for(let Te=0;Te<me;Te++){let be=Y.getViewport(Te);o.set(r.x*be.x,r.y*be.y,r.x*be.z,r.y*be.w),H.viewport(o),Y.updateMatrices(se,Te),i=Y.getFrustum(),E(O,U,Y.camera,se,this.type)}Y.isPointLightShadow!==!0&&this.type===Zn&&S(Y,U),Y.needsUpdate=!1}p=this.type,g.needsUpdate=!1,n.setRenderTarget(T,y,P)};function S(R,O){let U=e.update(_);f.defines.VSM_SAMPLES!==R.blurSamples&&(f.defines.VSM_SAMPLES=R.blurSamples,d.defines.VSM_SAMPLES=R.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new ii(s.x,s.y)),f.uniforms.shadow_pass.value=R.map.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,n.setRenderTarget(R.mapPass),n.clear(),n.renderBufferDirect(O,null,U,f,_,null),d.uniforms.shadow_pass.value=R.mapPass.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,n.setRenderTarget(R.map),n.clear(),n.renderBufferDirect(O,null,U,d,_,null)}function x(R,O,U,T){let y=null,P=U.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(P!==void 0)y=P;else if(y=U.isPointLight===!0?l:a,n.localClippingEnabled&&O.clipShadows===!0&&Array.isArray(O.clippingPlanes)&&O.clippingPlanes.length!==0||O.displacementMap&&O.displacementScale!==0||O.alphaMap&&O.alphaTest>0||O.map&&O.alphaTest>0){let H=y.uuid,L=O.uuid,F=c[H];F===void 0&&(F={},c[H]=F);let K=F[L];K===void 0&&(K=y.clone(),F[L]=K,O.addEventListener("dispose",D)),y=K}if(y.visible=O.visible,y.wireframe=O.wireframe,T===Zn?y.side=O.shadowSide!==null?O.shadowSide:O.side:y.side=O.shadowSide!==null?O.shadowSide:h[O.side],y.alphaMap=O.alphaMap,y.alphaTest=O.alphaTest,y.map=O.map,y.clipShadows=O.clipShadows,y.clippingPlanes=O.clippingPlanes,y.clipIntersection=O.clipIntersection,y.displacementMap=O.displacementMap,y.displacementScale=O.displacementScale,y.displacementBias=O.displacementBias,y.wireframeLinewidth=O.wireframeLinewidth,y.linewidth=O.linewidth,U.isPointLight===!0&&y.isMeshDistanceMaterial===!0){let H=n.properties.get(y);H.light=U}return y}function E(R,O,U,T,y){if(R.visible===!1)return;if(R.layers.test(O.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&y===Zn)&&(!R.frustumCulled||i.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse,R.matrixWorld);let L=e.update(R),F=R.material;if(Array.isArray(F)){let K=L.groups;for(let G=0,se=K.length;G<se;G++){let Y=K[G],Ee=F[Y.materialIndex];if(Ee&&Ee.visible){let me=x(R,Ee,T,y);R.onBeforeShadow(n,R,O,U,L,me,Y),n.renderBufferDirect(U,null,L,me,R,Y),R.onAfterShadow(n,R,O,U,L,me,Y)}}}else if(F.visible){let K=x(R,F,T,y);R.onBeforeShadow(n,R,O,U,L,K,null),n.renderBufferDirect(U,null,L,K,R,null),R.onAfterShadow(n,R,O,U,L,K,null)}}let H=R.children;for(let L=0,F=H.length;L<F;L++)E(H[L],O,U,T,y)}function D(R){R.target.removeEventListener("dispose",D);for(let U in c){let T=c[U],y=R.target.uuid;y in T&&(T[y].dispose(),delete T[y])}}}var Wy={[Pl]:Ol,[Ul]:Dl,[Ll]:kl,[zs]:Nl,[Ol]:Pl,[Dl]:Ul,[kl]:Ll,[Nl]:zs};function Xy(n,e){function t(){let b=!1,B=new mt,V=null,$=new mt(0,0,0,0);return{setMask:function(te){V!==te&&!b&&(n.colorMask(te,te,te,te),V=te)},setLocked:function(te){b=te},setClear:function(te,he,Xe,qe,rt){rt===!0&&(te*=qe,he*=qe,Xe*=qe),B.set(te,he,Xe,qe),$.equals(B)===!1&&(n.clearColor(te,he,Xe,qe),$.copy(B))},reset:function(){b=!1,V=null,$.set(-1,0,0,0)}}}function i(){let b=!1,B=!1,V=null,$=null,te=null;return{setReversed:function(he){if(B!==he){let Xe=e.get("EXT_clip_control");B?Xe.clipControlEXT(Xe.LOWER_LEFT_EXT,Xe.ZERO_TO_ONE_EXT):Xe.clipControlEXT(Xe.LOWER_LEFT_EXT,Xe.NEGATIVE_ONE_TO_ONE_EXT);let qe=te;te=null,this.setClear(qe)}B=he},getReversed:function(){return B},setTest:function(he){he?ge(n.DEPTH_TEST):De(n.DEPTH_TEST)},setMask:function(he){V!==he&&!b&&(n.depthMask(he),V=he)},setFunc:function(he){if(B&&(he=Wy[he]),$!==he){switch(he){case Pl:n.depthFunc(n.NEVER);break;case Ol:n.depthFunc(n.ALWAYS);break;case Ul:n.depthFunc(n.LESS);break;case zs:n.depthFunc(n.LEQUAL);break;case Ll:n.depthFunc(n.EQUAL);break;case Nl:n.depthFunc(n.GEQUAL);break;case Dl:n.depthFunc(n.GREATER);break;case kl:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}$=he}},setLocked:function(he){b=he},setClear:function(he){te!==he&&(B&&(he=1-he),n.clearDepth(he),te=he)},reset:function(){b=!1,V=null,$=null,te=null,B=!1}}}function s(){let b=!1,B=null,V=null,$=null,te=null,he=null,Xe=null,qe=null,rt=null;return{setTest:function(tt){b||(tt?ge(n.STENCIL_TEST):De(n.STENCIL_TEST))},setMask:function(tt){B!==tt&&!b&&(n.stencilMask(tt),B=tt)},setFunc:function(tt,Vt,Ft){(V!==tt||$!==Vt||te!==Ft)&&(n.stencilFunc(tt,Vt,Ft),V=tt,$=Vt,te=Ft)},setOp:function(tt,Vt,Ft){(he!==tt||Xe!==Vt||qe!==Ft)&&(n.stencilOp(tt,Vt,Ft),he=tt,Xe=Vt,qe=Ft)},setLocked:function(tt){b=tt},setClear:function(tt){rt!==tt&&(n.clearStencil(tt),rt=tt)},reset:function(){b=!1,B=null,V=null,$=null,te=null,he=null,Xe=null,qe=null,rt=null}}}let r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap,u={},h={},f=new WeakMap,d=[],m=null,_=!1,g=null,p=null,S=null,x=null,E=null,D=null,R=null,O=new ke(0,0,0),U=0,T=!1,y=null,P=null,H=null,L=null,F=null,K=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),G=!1,se=0,Y=n.getParameter(n.VERSION);Y.indexOf("WebGL")!==-1?(se=parseFloat(/^WebGL (\d)/.exec(Y)[1]),G=se>=1):Y.indexOf("OpenGL ES")!==-1&&(se=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),G=se>=2);let Ee=null,me={},Te=n.getParameter(n.SCISSOR_BOX),be=n.getParameter(n.VIEWPORT),nt=new mt().fromArray(Te),ee=new mt().fromArray(be);function ae(b,B,V,$){let te=new Uint8Array(4),he=n.createTexture();n.bindTexture(b,he),n.texParameteri(b,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(b,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Xe=0;Xe<V;Xe++)b===n.TEXTURE_3D||b===n.TEXTURE_2D_ARRAY?n.texImage3D(B,0,n.RGBA,1,1,$,0,n.RGBA,n.UNSIGNED_BYTE,te):n.texImage2D(B+Xe,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,te);return he}let _e={};_e[n.TEXTURE_2D]=ae(n.TEXTURE_2D,n.TEXTURE_2D,1),_e[n.TEXTURE_CUBE_MAP]=ae(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),_e[n.TEXTURE_2D_ARRAY]=ae(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),_e[n.TEXTURE_3D]=ae(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ge(n.DEPTH_TEST),o.setFunc(zs),ue(!1),Me(Cd),ge(n.CULL_FACE),k(Mi);function ge(b){u[b]!==!0&&(n.enable(b),u[b]=!0)}function De(b){u[b]!==!1&&(n.disable(b),u[b]=!1)}function We(b,B){return h[b]!==B?(n.bindFramebuffer(b,B),h[b]=B,b===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=B),b===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=B),!0):!1}function ze(b,B){let V=d,$=!1;if(b){V=f.get(B),V===void 0&&(V=[],f.set(B,V));let te=b.textures;if(V.length!==te.length||V[0]!==n.COLOR_ATTACHMENT0){for(let he=0,Xe=te.length;he<Xe;he++)V[he]=n.COLOR_ATTACHMENT0+he;V.length=te.length,$=!0}}else V[0]!==n.BACK&&(V[0]=n.BACK,$=!0);$&&n.drawBuffers(V)}function je(b){return m!==b?(n.useProgram(b),m=b,!0):!1}let oe={[$i]:n.FUNC_ADD,[og]:n.FUNC_SUBTRACT,[ag]:n.FUNC_REVERSE_SUBTRACT};oe[cg]=n.MIN,oe[lg]=n.MAX;let fe={[ug]:n.ZERO,[hg]:n.ONE,[dg]:n.SRC_COLOR,[Cl]:n.SRC_ALPHA,[Eg]:n.SRC_ALPHA_SATURATE,[gg]:n.DST_COLOR,[pg]:n.DST_ALPHA,[fg]:n.ONE_MINUS_SRC_COLOR,[Il]:n.ONE_MINUS_SRC_ALPHA,[_g]:n.ONE_MINUS_DST_COLOR,[mg]:n.ONE_MINUS_DST_ALPHA,[xg]:n.CONSTANT_COLOR,[yg]:n.ONE_MINUS_CONSTANT_COLOR,[Sg]:n.CONSTANT_ALPHA,[Tg]:n.ONE_MINUS_CONSTANT_ALPHA};function k(b,B,V,$,te,he,Xe,qe,rt,tt){if(b===Mi){_===!0&&(De(n.BLEND),_=!1);return}if(_===!1&&(ge(n.BLEND),_=!0),b!==rg){if(b!==g||tt!==T){if((p!==$i||E!==$i)&&(n.blendEquation(n.FUNC_ADD),p=$i,E=$i),tt)switch(b){case ks:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case ei:n.blendFunc(n.ONE,n.ONE);break;case Id:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Pd:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",b);break}else switch(b){case ks:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case ei:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Id:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Pd:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",b);break}S=null,x=null,D=null,R=null,O.set(0,0,0),U=0,g=b,T=tt}return}te=te||B,he=he||V,Xe=Xe||$,(B!==p||te!==E)&&(n.blendEquationSeparate(oe[B],oe[te]),p=B,E=te),(V!==S||$!==x||he!==D||Xe!==R)&&(n.blendFuncSeparate(fe[V],fe[$],fe[he],fe[Xe]),S=V,x=$,D=he,R=Xe),(qe.equals(O)===!1||rt!==U)&&(n.blendColor(qe.r,qe.g,qe.b,rt),O.copy(qe),U=rt),g=b,T=!1}function Pe(b,B){b.side===Wt?De(n.CULL_FACE):ge(n.CULL_FACE);let V=b.side===sn;B&&(V=!V),ue(V),b.blending===ks&&b.transparent===!1?k(Mi):k(b.blending,b.blendEquation,b.blendSrc,b.blendDst,b.blendEquationAlpha,b.blendSrcAlpha,b.blendDstAlpha,b.blendColor,b.blendAlpha,b.premultipliedAlpha),o.setFunc(b.depthFunc),o.setTest(b.depthTest),o.setMask(b.depthWrite),r.setMask(b.colorWrite);let $=b.stencilWrite;a.setTest($),$&&(a.setMask(b.stencilWriteMask),a.setFunc(b.stencilFunc,b.stencilRef,b.stencilFuncMask),a.setOp(b.stencilFail,b.stencilZFail,b.stencilZPass)),Fe(b.polygonOffset,b.polygonOffsetFactor,b.polygonOffsetUnits),b.alphaToCoverage===!0?ge(n.SAMPLE_ALPHA_TO_COVERAGE):De(n.SAMPLE_ALPHA_TO_COVERAGE)}function ue(b){y!==b&&(b?n.frontFace(n.CW):n.frontFace(n.CCW),y=b)}function Me(b){b!==ig?(ge(n.CULL_FACE),b!==P&&(b===Cd?n.cullFace(n.BACK):b===sg?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):De(n.CULL_FACE),P=b}function pe(b){b!==H&&(G&&n.lineWidth(b),H=b)}function Fe(b,B,V){b?(ge(n.POLYGON_OFFSET_FILL),(L!==B||F!==V)&&(n.polygonOffset(B,V),L=B,F=V)):De(n.POLYGON_OFFSET_FILL)}function ve(b){b?ge(n.SCISSOR_TEST):De(n.SCISSOR_TEST)}function I(b){b===void 0&&(b=n.TEXTURE0+K-1),Ee!==b&&(n.activeTexture(b),Ee=b)}function v(b,B,V){V===void 0&&(Ee===null?V=n.TEXTURE0+K-1:V=Ee);let $=me[V];$===void 0&&($={type:void 0,texture:void 0},me[V]=$),($.type!==b||$.texture!==B)&&(Ee!==V&&(n.activeTexture(V),Ee=V),n.bindTexture(b,B||_e[b]),$.type=b,$.texture=B)}function q(){let b=me[Ee];b!==void 0&&b.type!==void 0&&(n.bindTexture(b.type,null),b.type=void 0,b.texture=void 0)}function ne(){try{n.compressedTexImage2D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function M(){try{n.compressedTexImage3D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function C(){try{n.texSubImage2D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function ie(){try{n.texSubImage3D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Q(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function ce(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function we(){try{n.texStorage2D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function re(){try{n.texStorage3D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Se(){try{n.texImage2D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Ie(){try{n.texImage3D.apply(n,arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Ge(b){nt.equals(b)===!1&&(n.scissor(b.x,b.y,b.z,b.w),nt.copy(b))}function Ce(b){ee.equals(b)===!1&&(n.viewport(b.x,b.y,b.z,b.w),ee.copy(b))}function it(b,B){let V=c.get(B);V===void 0&&(V=new WeakMap,c.set(B,V));let $=V.get(b);$===void 0&&($=n.getUniformBlockIndex(B,b.name),V.set(b,$))}function w(b,B){let $=c.get(B).get(b);l.get(B)!==$&&(n.uniformBlockBinding(B,$,b.__bindingPointIndex),l.set(B,$))}function z(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),u={},Ee=null,me={},h={},f=new WeakMap,d=[],m=null,_=!1,g=null,p=null,S=null,x=null,E=null,D=null,R=null,O=new ke(0,0,0),U=0,T=!1,y=null,P=null,H=null,L=null,F=null,nt.set(0,0,n.canvas.width,n.canvas.height),ee.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ge,disable:De,bindFramebuffer:We,drawBuffers:ze,useProgram:je,setBlending:k,setMaterial:Pe,setFlipSided:ue,setCullFace:Me,setLineWidth:pe,setPolygonOffset:Fe,setScissorTest:ve,activeTexture:I,bindTexture:v,unbindTexture:q,compressedTexImage2D:ne,compressedTexImage3D:M,texImage2D:Se,texImage3D:Ie,updateUBOMapping:it,uniformBlockBinding:w,texStorage2D:we,texStorage3D:re,texSubImage2D:C,texSubImage3D:ie,compressedTexSubImage2D:Q,compressedTexSubImage3D:ce,scissor:Ge,viewport:Ce,reset:z}}function Cf(n,e,t,i){let s=$y(i);switch(t){case Zf:return n*e;case jf:return n*e;case Qf:return n*e*2;case nh:return n*e/s.components*s.byteLength;case ih:return n*e/s.components*s.byteLength;case ep:return n*e*2/s.components*s.byteLength;case sh:return n*e*2/s.components*s.byteLength;case Jf:return n*e*3/s.components*s.byteLength;case An:return n*e*4/s.components*s.byteLength;case rh:return n*e*4/s.components*s.byteLength;case Zo:case Jo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case jo:case Qo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Gl:case Wl:return Math.max(n,16)*Math.max(e,8)/4;case zl:case Vl:return Math.max(n,8)*Math.max(e,8)/2;case Xl:case $l:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case ql:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Yl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Kl:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Zl:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Jl:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case jl:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Ql:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case eu:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case tu:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case nu:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case iu:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case su:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case ru:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case ou:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case au:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case ea:case cu:case lu:return Math.ceil(n/4)*Math.ceil(e/4)*16;case tp:case uu:return Math.ceil(n/4)*Math.ceil(e/4)*8;case hu:case du:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function $y(n){switch(n){case ti:case qf:return{byteLength:1,components:1};case Pr:case Yf:case Wr:return{byteLength:2,components:1};case eh:case th:return{byteLength:2,components:4};case Zi:case Qu:case Ln:return{byteLength:4,components:1};case Kf:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function qy(n,e,t,i,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new le,u=new WeakMap,h,f=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(I,v){return d?new OffscreenCanvas(I,v):ia("canvas")}function _(I,v,q){let ne=1,M=ve(I);if((M.width>q||M.height>q)&&(ne=q/Math.max(M.width,M.height)),ne<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let C=Math.floor(ne*M.width),ie=Math.floor(ne*M.height);h===void 0&&(h=m(C,ie));let Q=v?m(C,ie):h;return Q.width=C,Q.height=ie,Q.getContext("2d").drawImage(I,0,0,C,ie),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+M.width+"x"+M.height+") to ("+C+"x"+ie+")."),Q}else return"data"in I&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+M.width+"x"+M.height+")."),I;return I}function g(I){return I.generateMipmaps}function p(I){n.generateMipmap(I)}function S(I){return I.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?n.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function x(I,v,q,ne,M=!1){if(I!==null){if(n[I]!==void 0)return n[I];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let C=v;if(v===n.RED&&(q===n.FLOAT&&(C=n.R32F),q===n.HALF_FLOAT&&(C=n.R16F),q===n.UNSIGNED_BYTE&&(C=n.R8)),v===n.RED_INTEGER&&(q===n.UNSIGNED_BYTE&&(C=n.R8UI),q===n.UNSIGNED_SHORT&&(C=n.R16UI),q===n.UNSIGNED_INT&&(C=n.R32UI),q===n.BYTE&&(C=n.R8I),q===n.SHORT&&(C=n.R16I),q===n.INT&&(C=n.R32I)),v===n.RG&&(q===n.FLOAT&&(C=n.RG32F),q===n.HALF_FLOAT&&(C=n.RG16F),q===n.UNSIGNED_BYTE&&(C=n.RG8)),v===n.RG_INTEGER&&(q===n.UNSIGNED_BYTE&&(C=n.RG8UI),q===n.UNSIGNED_SHORT&&(C=n.RG16UI),q===n.UNSIGNED_INT&&(C=n.RG32UI),q===n.BYTE&&(C=n.RG8I),q===n.SHORT&&(C=n.RG16I),q===n.INT&&(C=n.RG32I)),v===n.RGB_INTEGER&&(q===n.UNSIGNED_BYTE&&(C=n.RGB8UI),q===n.UNSIGNED_SHORT&&(C=n.RGB16UI),q===n.UNSIGNED_INT&&(C=n.RGB32UI),q===n.BYTE&&(C=n.RGB8I),q===n.SHORT&&(C=n.RGB16I),q===n.INT&&(C=n.RGB32I)),v===n.RGBA_INTEGER&&(q===n.UNSIGNED_BYTE&&(C=n.RGBA8UI),q===n.UNSIGNED_SHORT&&(C=n.RGBA16UI),q===n.UNSIGNED_INT&&(C=n.RGBA32UI),q===n.BYTE&&(C=n.RGBA8I),q===n.SHORT&&(C=n.RGBA16I),q===n.INT&&(C=n.RGBA32I)),v===n.RGB&&q===n.UNSIGNED_INT_5_9_9_9_REV&&(C=n.RGB9_E5),v===n.RGBA){let ie=M?ka:lt.getTransfer(ne);q===n.FLOAT&&(C=n.RGBA32F),q===n.HALF_FLOAT&&(C=n.RGBA16F),q===n.UNSIGNED_BYTE&&(C=ie===pt?n.SRGB8_ALPHA8:n.RGBA8),q===n.UNSIGNED_SHORT_4_4_4_4&&(C=n.RGBA4),q===n.UNSIGNED_SHORT_5_5_5_1&&(C=n.RGB5_A1)}return(C===n.R16F||C===n.R32F||C===n.RG16F||C===n.RG32F||C===n.RGBA16F||C===n.RGBA32F)&&e.get("EXT_color_buffer_float"),C}function E(I,v){let q;return I?v===null||v===Zi||v===Xs?q=n.DEPTH24_STENCIL8:v===Ln?q=n.DEPTH32F_STENCIL8:v===Pr&&(q=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Zi||v===Xs?q=n.DEPTH_COMPONENT24:v===Ln?q=n.DEPTH_COMPONENT32F:v===Pr&&(q=n.DEPTH_COMPONENT16),q}function D(I,v){return g(I)===!0||I.isFramebufferTexture&&I.minFilter!==dn&&I.minFilter!==Un?Math.log2(Math.max(v.width,v.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?v.mipmaps.length:1}function R(I){let v=I.target;v.removeEventListener("dispose",R),U(v),v.isVideoTexture&&u.delete(v)}function O(I){let v=I.target;v.removeEventListener("dispose",O),y(v)}function U(I){let v=i.get(I);if(v.__webglInit===void 0)return;let q=I.source,ne=f.get(q);if(ne){let M=ne[v.__cacheKey];M.usedTimes--,M.usedTimes===0&&T(I),Object.keys(ne).length===0&&f.delete(q)}i.remove(I)}function T(I){let v=i.get(I);n.deleteTexture(v.__webglTexture);let q=I.source,ne=f.get(q);delete ne[v.__cacheKey],o.memory.textures--}function y(I){let v=i.get(I);if(I.depthTexture&&(I.depthTexture.dispose(),i.remove(I.depthTexture)),I.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(v.__webglFramebuffer[ne]))for(let M=0;M<v.__webglFramebuffer[ne].length;M++)n.deleteFramebuffer(v.__webglFramebuffer[ne][M]);else n.deleteFramebuffer(v.__webglFramebuffer[ne]);v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer[ne])}else{if(Array.isArray(v.__webglFramebuffer))for(let ne=0;ne<v.__webglFramebuffer.length;ne++)n.deleteFramebuffer(v.__webglFramebuffer[ne]);else n.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&n.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let ne=0;ne<v.__webglColorRenderbuffer.length;ne++)v.__webglColorRenderbuffer[ne]&&n.deleteRenderbuffer(v.__webglColorRenderbuffer[ne]);v.__webglDepthRenderbuffer&&n.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let q=I.textures;for(let ne=0,M=q.length;ne<M;ne++){let C=i.get(q[ne]);C.__webglTexture&&(n.deleteTexture(C.__webglTexture),o.memory.textures--),i.remove(q[ne])}i.remove(I)}let P=0;function H(){P=0}function L(){let I=P;return I>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+I+" texture units while this GPU supports only "+s.maxTextures),P+=1,I}function F(I){let v=[];return v.push(I.wrapS),v.push(I.wrapT),v.push(I.wrapR||0),v.push(I.magFilter),v.push(I.minFilter),v.push(I.anisotropy),v.push(I.internalFormat),v.push(I.format),v.push(I.type),v.push(I.generateMipmaps),v.push(I.premultiplyAlpha),v.push(I.flipY),v.push(I.unpackAlignment),v.push(I.colorSpace),v.join()}function K(I,v){let q=i.get(I);if(I.isVideoTexture&&pe(I),I.isRenderTargetTexture===!1&&I.version>0&&q.__version!==I.version){let ne=I.image;if(ne===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ne.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ee(q,I,v);return}}t.bindTexture(n.TEXTURE_2D,q.__webglTexture,n.TEXTURE0+v)}function G(I,v){let q=i.get(I);if(I.version>0&&q.__version!==I.version){ee(q,I,v);return}t.bindTexture(n.TEXTURE_2D_ARRAY,q.__webglTexture,n.TEXTURE0+v)}function se(I,v){let q=i.get(I);if(I.version>0&&q.__version!==I.version){ee(q,I,v);return}t.bindTexture(n.TEXTURE_3D,q.__webglTexture,n.TEXTURE0+v)}function Y(I,v){let q=i.get(I);if(I.version>0&&q.__version!==I.version){ae(q,I,v);return}t.bindTexture(n.TEXTURE_CUBE_MAP,q.__webglTexture,n.TEXTURE0+v)}let Ee={[Ws]:n.REPEAT,[Jn]:n.CLAMP_TO_EDGE,[Bl]:n.MIRRORED_REPEAT},me={[dn]:n.NEAREST,[Pg]:n.NEAREST_MIPMAP_NEAREST,[To]:n.NEAREST_MIPMAP_LINEAR,[Un]:n.LINEAR,[Zc]:n.LINEAR_MIPMAP_NEAREST,[Ki]:n.LINEAR_MIPMAP_LINEAR},Te={[Ng]:n.NEVER,[zg]:n.ALWAYS,[Dg]:n.LESS,[ip]:n.LEQUAL,[kg]:n.EQUAL,[Bg]:n.GEQUAL,[Hg]:n.GREATER,[Fg]:n.NOTEQUAL};function be(I,v){if(v.type===Ln&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Un||v.magFilter===Zc||v.magFilter===To||v.magFilter===Ki||v.minFilter===Un||v.minFilter===Zc||v.minFilter===To||v.minFilter===Ki)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(I,n.TEXTURE_WRAP_S,Ee[v.wrapS]),n.texParameteri(I,n.TEXTURE_WRAP_T,Ee[v.wrapT]),(I===n.TEXTURE_3D||I===n.TEXTURE_2D_ARRAY)&&n.texParameteri(I,n.TEXTURE_WRAP_R,Ee[v.wrapR]),n.texParameteri(I,n.TEXTURE_MAG_FILTER,me[v.magFilter]),n.texParameteri(I,n.TEXTURE_MIN_FILTER,me[v.minFilter]),v.compareFunction&&(n.texParameteri(I,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(I,n.TEXTURE_COMPARE_FUNC,Te[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===dn||v.minFilter!==To&&v.minFilter!==Ki||v.type===Ln&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||i.get(v).__currentAnisotropy){let q=e.get("EXT_texture_filter_anisotropic");n.texParameterf(I,q.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),i.get(v).__currentAnisotropy=v.anisotropy}}}function nt(I,v){let q=!1;I.__webglInit===void 0&&(I.__webglInit=!0,v.addEventListener("dispose",R));let ne=v.source,M=f.get(ne);M===void 0&&(M={},f.set(ne,M));let C=F(v);if(C!==I.__cacheKey){M[C]===void 0&&(M[C]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,q=!0),M[C].usedTimes++;let ie=M[I.__cacheKey];ie!==void 0&&(M[I.__cacheKey].usedTimes--,ie.usedTimes===0&&T(v)),I.__cacheKey=C,I.__webglTexture=M[C].texture}return q}function ee(I,v,q){let ne=n.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(ne=n.TEXTURE_2D_ARRAY),v.isData3DTexture&&(ne=n.TEXTURE_3D);let M=nt(I,v),C=v.source;t.bindTexture(ne,I.__webglTexture,n.TEXTURE0+q);let ie=i.get(C);if(C.version!==ie.__version||M===!0){t.activeTexture(n.TEXTURE0+q);let Q=lt.getPrimaries(lt.workingColorSpace),ce=v.colorSpace===vi?null:lt.getPrimaries(v.colorSpace),we=v.colorSpace===vi||Q===ce?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,we);let re=_(v.image,!1,s.maxTextureSize);re=Fe(v,re);let Se=r.convert(v.format,v.colorSpace),Ie=r.convert(v.type),Ge=x(v.internalFormat,Se,Ie,v.colorSpace,v.isVideoTexture);be(ne,v);let Ce,it=v.mipmaps,w=v.isVideoTexture!==!0,z=ie.__version===void 0||M===!0,b=C.dataReady,B=D(v,re);if(v.isDepthTexture)Ge=E(v.format===$s,v.type),z&&(w?t.texStorage2D(n.TEXTURE_2D,1,Ge,re.width,re.height):t.texImage2D(n.TEXTURE_2D,0,Ge,re.width,re.height,0,Se,Ie,null));else if(v.isDataTexture)if(it.length>0){w&&z&&t.texStorage2D(n.TEXTURE_2D,B,Ge,it[0].width,it[0].height);for(let V=0,$=it.length;V<$;V++)Ce=it[V],w?b&&t.texSubImage2D(n.TEXTURE_2D,V,0,0,Ce.width,Ce.height,Se,Ie,Ce.data):t.texImage2D(n.TEXTURE_2D,V,Ge,Ce.width,Ce.height,0,Se,Ie,Ce.data);v.generateMipmaps=!1}else w?(z&&t.texStorage2D(n.TEXTURE_2D,B,Ge,re.width,re.height),b&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,re.width,re.height,Se,Ie,re.data)):t.texImage2D(n.TEXTURE_2D,0,Ge,re.width,re.height,0,Se,Ie,re.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){w&&z&&t.texStorage3D(n.TEXTURE_2D_ARRAY,B,Ge,it[0].width,it[0].height,re.depth);for(let V=0,$=it.length;V<$;V++)if(Ce=it[V],v.format!==An)if(Se!==null)if(w){if(b)if(v.layerUpdates.size>0){let te=Cf(Ce.width,Ce.height,v.format,v.type);for(let he of v.layerUpdates){let Xe=Ce.data.subarray(he*te/Ce.data.BYTES_PER_ELEMENT,(he+1)*te/Ce.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,V,0,0,he,Ce.width,Ce.height,1,Se,Xe)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,V,0,0,0,Ce.width,Ce.height,re.depth,Se,Ce.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,V,Ge,Ce.width,Ce.height,re.depth,0,Ce.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else w?b&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,V,0,0,0,Ce.width,Ce.height,re.depth,Se,Ie,Ce.data):t.texImage3D(n.TEXTURE_2D_ARRAY,V,Ge,Ce.width,Ce.height,re.depth,0,Se,Ie,Ce.data)}else{w&&z&&t.texStorage2D(n.TEXTURE_2D,B,Ge,it[0].width,it[0].height);for(let V=0,$=it.length;V<$;V++)Ce=it[V],v.format!==An?Se!==null?w?b&&t.compressedTexSubImage2D(n.TEXTURE_2D,V,0,0,Ce.width,Ce.height,Se,Ce.data):t.compressedTexImage2D(n.TEXTURE_2D,V,Ge,Ce.width,Ce.height,0,Ce.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):w?b&&t.texSubImage2D(n.TEXTURE_2D,V,0,0,Ce.width,Ce.height,Se,Ie,Ce.data):t.texImage2D(n.TEXTURE_2D,V,Ge,Ce.width,Ce.height,0,Se,Ie,Ce.data)}else if(v.isDataArrayTexture)if(w){if(z&&t.texStorage3D(n.TEXTURE_2D_ARRAY,B,Ge,re.width,re.height,re.depth),b)if(v.layerUpdates.size>0){let V=Cf(re.width,re.height,v.format,v.type);for(let $ of v.layerUpdates){let te=re.data.subarray($*V/re.data.BYTES_PER_ELEMENT,($+1)*V/re.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,$,re.width,re.height,1,Se,Ie,te)}v.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,re.width,re.height,re.depth,Se,Ie,re.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Ge,re.width,re.height,re.depth,0,Se,Ie,re.data);else if(v.isData3DTexture)w?(z&&t.texStorage3D(n.TEXTURE_3D,B,Ge,re.width,re.height,re.depth),b&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,re.width,re.height,re.depth,Se,Ie,re.data)):t.texImage3D(n.TEXTURE_3D,0,Ge,re.width,re.height,re.depth,0,Se,Ie,re.data);else if(v.isFramebufferTexture){if(z)if(w)t.texStorage2D(n.TEXTURE_2D,B,Ge,re.width,re.height);else{let V=re.width,$=re.height;for(let te=0;te<B;te++)t.texImage2D(n.TEXTURE_2D,te,Ge,V,$,0,Se,Ie,null),V>>=1,$>>=1}}else if(it.length>0){if(w&&z){let V=ve(it[0]);t.texStorage2D(n.TEXTURE_2D,B,Ge,V.width,V.height)}for(let V=0,$=it.length;V<$;V++)Ce=it[V],w?b&&t.texSubImage2D(n.TEXTURE_2D,V,0,0,Se,Ie,Ce):t.texImage2D(n.TEXTURE_2D,V,Ge,Se,Ie,Ce);v.generateMipmaps=!1}else if(w){if(z){let V=ve(re);t.texStorage2D(n.TEXTURE_2D,B,Ge,V.width,V.height)}b&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Se,Ie,re)}else t.texImage2D(n.TEXTURE_2D,0,Ge,Se,Ie,re);g(v)&&p(ne),ie.__version=C.version,v.onUpdate&&v.onUpdate(v)}I.__version=v.version}function ae(I,v,q){if(v.image.length!==6)return;let ne=nt(I,v),M=v.source;t.bindTexture(n.TEXTURE_CUBE_MAP,I.__webglTexture,n.TEXTURE0+q);let C=i.get(M);if(M.version!==C.__version||ne===!0){t.activeTexture(n.TEXTURE0+q);let ie=lt.getPrimaries(lt.workingColorSpace),Q=v.colorSpace===vi?null:lt.getPrimaries(v.colorSpace),ce=v.colorSpace===vi||ie===Q?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ce);let we=v.isCompressedTexture||v.image[0].isCompressedTexture,re=v.image[0]&&v.image[0].isDataTexture,Se=[];for(let $=0;$<6;$++)!we&&!re?Se[$]=_(v.image[$],!0,s.maxCubemapSize):Se[$]=re?v.image[$].image:v.image[$],Se[$]=Fe(v,Se[$]);let Ie=Se[0],Ge=r.convert(v.format,v.colorSpace),Ce=r.convert(v.type),it=x(v.internalFormat,Ge,Ce,v.colorSpace),w=v.isVideoTexture!==!0,z=C.__version===void 0||ne===!0,b=M.dataReady,B=D(v,Ie);be(n.TEXTURE_CUBE_MAP,v);let V;if(we){w&&z&&t.texStorage2D(n.TEXTURE_CUBE_MAP,B,it,Ie.width,Ie.height);for(let $=0;$<6;$++){V=Se[$].mipmaps;for(let te=0;te<V.length;te++){let he=V[te];v.format!==An?Ge!==null?w?b&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,te,0,0,he.width,he.height,Ge,he.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,te,it,he.width,he.height,0,he.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):w?b&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,te,0,0,he.width,he.height,Ge,Ce,he.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,te,it,he.width,he.height,0,Ge,Ce,he.data)}}}else{if(V=v.mipmaps,w&&z){V.length>0&&B++;let $=ve(Se[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,B,it,$.width,$.height)}for(let $=0;$<6;$++)if(re){w?b&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,Se[$].width,Se[$].height,Ge,Ce,Se[$].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,it,Se[$].width,Se[$].height,0,Ge,Ce,Se[$].data);for(let te=0;te<V.length;te++){let Xe=V[te].image[$].image;w?b&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,te+1,0,0,Xe.width,Xe.height,Ge,Ce,Xe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,te+1,it,Xe.width,Xe.height,0,Ge,Ce,Xe.data)}}else{w?b&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,Ge,Ce,Se[$]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,it,Ge,Ce,Se[$]);for(let te=0;te<V.length;te++){let he=V[te];w?b&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,te+1,0,0,Ge,Ce,he.image[$]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,te+1,it,Ge,Ce,he.image[$])}}}g(v)&&p(n.TEXTURE_CUBE_MAP),C.__version=M.version,v.onUpdate&&v.onUpdate(v)}I.__version=v.version}function _e(I,v,q,ne,M,C){let ie=r.convert(q.format,q.colorSpace),Q=r.convert(q.type),ce=x(q.internalFormat,ie,Q,q.colorSpace),we=i.get(v),re=i.get(q);if(re.__renderTarget=v,!we.__hasExternalTextures){let Se=Math.max(1,v.width>>C),Ie=Math.max(1,v.height>>C);M===n.TEXTURE_3D||M===n.TEXTURE_2D_ARRAY?t.texImage3D(M,C,ce,Se,Ie,v.depth,0,ie,Q,null):t.texImage2D(M,C,ce,Se,Ie,0,ie,Q,null)}t.bindFramebuffer(n.FRAMEBUFFER,I),Me(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ne,M,re.__webglTexture,0,ue(v)):(M===n.TEXTURE_2D||M>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&M<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,ne,M,re.__webglTexture,C),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ge(I,v,q){if(n.bindRenderbuffer(n.RENDERBUFFER,I),v.depthBuffer){let ne=v.depthTexture,M=ne&&ne.isDepthTexture?ne.type:null,C=E(v.stencilBuffer,M),ie=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Q=ue(v);Me(v)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Q,C,v.width,v.height):q?n.renderbufferStorageMultisample(n.RENDERBUFFER,Q,C,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,C,v.width,v.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ie,n.RENDERBUFFER,I)}else{let ne=v.textures;for(let M=0;M<ne.length;M++){let C=ne[M],ie=r.convert(C.format,C.colorSpace),Q=r.convert(C.type),ce=x(C.internalFormat,ie,Q,C.colorSpace),we=ue(v);q&&Me(v)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,we,ce,v.width,v.height):Me(v)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,we,ce,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,ce,v.width,v.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function De(I,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,I),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let ne=i.get(v.depthTexture);ne.__renderTarget=v,(!ne.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),K(v.depthTexture,0);let M=ne.__webglTexture,C=ue(v);if(v.depthTexture.format===Hs)Me(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,M,0,C):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,M,0);else if(v.depthTexture.format===$s)Me(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,M,0,C):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,M,0);else throw new Error("Unknown depthTexture format")}function We(I){let v=i.get(I),q=I.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==I.depthTexture){let ne=I.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),ne){let M=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,ne.removeEventListener("dispose",M)};ne.addEventListener("dispose",M),v.__depthDisposeCallback=M}v.__boundDepthTexture=ne}if(I.depthTexture&&!v.__autoAllocateDepthBuffer){if(q)throw new Error("target.depthTexture not supported in Cube render targets");De(v.__webglFramebuffer,I)}else if(q){v.__webglDepthbuffer=[];for(let ne=0;ne<6;ne++)if(t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[ne]),v.__webglDepthbuffer[ne]===void 0)v.__webglDepthbuffer[ne]=n.createRenderbuffer(),ge(v.__webglDepthbuffer[ne],I,!1);else{let M=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,C=v.__webglDepthbuffer[ne];n.bindRenderbuffer(n.RENDERBUFFER,C),n.framebufferRenderbuffer(n.FRAMEBUFFER,M,n.RENDERBUFFER,C)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=n.createRenderbuffer(),ge(v.__webglDepthbuffer,I,!1);else{let ne=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,M=v.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,M),n.framebufferRenderbuffer(n.FRAMEBUFFER,ne,n.RENDERBUFFER,M)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function ze(I,v,q){let ne=i.get(I);v!==void 0&&_e(ne.__webglFramebuffer,I,I.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),q!==void 0&&We(I)}function je(I){let v=I.texture,q=i.get(I),ne=i.get(v);I.addEventListener("dispose",O);let M=I.textures,C=I.isWebGLCubeRenderTarget===!0,ie=M.length>1;if(ie||(ne.__webglTexture===void 0&&(ne.__webglTexture=n.createTexture()),ne.__version=v.version,o.memory.textures++),C){q.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(v.mipmaps&&v.mipmaps.length>0){q.__webglFramebuffer[Q]=[];for(let ce=0;ce<v.mipmaps.length;ce++)q.__webglFramebuffer[Q][ce]=n.createFramebuffer()}else q.__webglFramebuffer[Q]=n.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){q.__webglFramebuffer=[];for(let Q=0;Q<v.mipmaps.length;Q++)q.__webglFramebuffer[Q]=n.createFramebuffer()}else q.__webglFramebuffer=n.createFramebuffer();if(ie)for(let Q=0,ce=M.length;Q<ce;Q++){let we=i.get(M[Q]);we.__webglTexture===void 0&&(we.__webglTexture=n.createTexture(),o.memory.textures++)}if(I.samples>0&&Me(I)===!1){q.__webglMultisampledFramebuffer=n.createFramebuffer(),q.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,q.__webglMultisampledFramebuffer);for(let Q=0;Q<M.length;Q++){let ce=M[Q];q.__webglColorRenderbuffer[Q]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,q.__webglColorRenderbuffer[Q]);let we=r.convert(ce.format,ce.colorSpace),re=r.convert(ce.type),Se=x(ce.internalFormat,we,re,ce.colorSpace,I.isXRRenderTarget===!0),Ie=ue(I);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ie,Se,I.width,I.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Q,n.RENDERBUFFER,q.__webglColorRenderbuffer[Q])}n.bindRenderbuffer(n.RENDERBUFFER,null),I.depthBuffer&&(q.__webglDepthRenderbuffer=n.createRenderbuffer(),ge(q.__webglDepthRenderbuffer,I,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(C){t.bindTexture(n.TEXTURE_CUBE_MAP,ne.__webglTexture),be(n.TEXTURE_CUBE_MAP,v);for(let Q=0;Q<6;Q++)if(v.mipmaps&&v.mipmaps.length>0)for(let ce=0;ce<v.mipmaps.length;ce++)_e(q.__webglFramebuffer[Q][ce],I,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ce);else _e(q.__webglFramebuffer[Q],I,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);g(v)&&p(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ie){for(let Q=0,ce=M.length;Q<ce;Q++){let we=M[Q],re=i.get(we);t.bindTexture(n.TEXTURE_2D,re.__webglTexture),be(n.TEXTURE_2D,we),_e(q.__webglFramebuffer,I,we,n.COLOR_ATTACHMENT0+Q,n.TEXTURE_2D,0),g(we)&&p(n.TEXTURE_2D)}t.unbindTexture()}else{let Q=n.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(Q=I.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Q,ne.__webglTexture),be(Q,v),v.mipmaps&&v.mipmaps.length>0)for(let ce=0;ce<v.mipmaps.length;ce++)_e(q.__webglFramebuffer[ce],I,v,n.COLOR_ATTACHMENT0,Q,ce);else _e(q.__webglFramebuffer,I,v,n.COLOR_ATTACHMENT0,Q,0);g(v)&&p(Q),t.unbindTexture()}I.depthBuffer&&We(I)}function oe(I){let v=I.textures;for(let q=0,ne=v.length;q<ne;q++){let M=v[q];if(g(M)){let C=S(I),ie=i.get(M).__webglTexture;t.bindTexture(C,ie),p(C),t.unbindTexture()}}}let fe=[],k=[];function Pe(I){if(I.samples>0){if(Me(I)===!1){let v=I.textures,q=I.width,ne=I.height,M=n.COLOR_BUFFER_BIT,C=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=i.get(I),Q=v.length>1;if(Q)for(let ce=0;ce<v.length;ce++)t.bindFramebuffer(n.FRAMEBUFFER,ie.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,ie.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,ie.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ie.__webglFramebuffer);for(let ce=0;ce<v.length;ce++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(M|=n.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(M|=n.STENCIL_BUFFER_BIT)),Q){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ie.__webglColorRenderbuffer[ce]);let we=i.get(v[ce]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,we,0)}n.blitFramebuffer(0,0,q,ne,0,0,q,ne,M,n.NEAREST),l===!0&&(fe.length=0,k.length=0,fe.push(n.COLOR_ATTACHMENT0+ce),I.depthBuffer&&I.resolveDepthBuffer===!1&&(fe.push(C),k.push(C),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,k)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,fe))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Q)for(let ce=0;ce<v.length;ce++){t.bindFramebuffer(n.FRAMEBUFFER,ie.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.RENDERBUFFER,ie.__webglColorRenderbuffer[ce]);let we=i.get(v[ce]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,ie.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.TEXTURE_2D,we,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ie.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.resolveDepthBuffer===!1&&l){let v=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[v])}}}function ue(I){return Math.min(s.maxSamples,I.samples)}function Me(I){let v=i.get(I);return I.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function pe(I){let v=o.render.frame;u.get(I)!==v&&(u.set(I,v),I.update())}function Fe(I,v){let q=I.colorSpace,ne=I.format,M=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||q!==js&&q!==vi&&(lt.getTransfer(q)===pt?(ne!==An||M!==ti)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",q)),v}function ve(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(c.width=I.naturalWidth||I.width,c.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(c.width=I.displayWidth,c.height=I.displayHeight):(c.width=I.width,c.height=I.height),c}this.allocateTextureUnit=L,this.resetTextureUnits=H,this.setTexture2D=K,this.setTexture2DArray=G,this.setTexture3D=se,this.setTextureCube=Y,this.rebindTextures=ze,this.setupRenderTarget=je,this.updateRenderTargetMipmap=oe,this.updateMultisampleRenderTarget=Pe,this.setupDepthRenderbuffer=We,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=Me}function Yy(n,e){function t(i,s=vi){let r,o=lt.getTransfer(s);if(i===ti)return n.UNSIGNED_BYTE;if(i===eh)return n.UNSIGNED_SHORT_4_4_4_4;if(i===th)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Kf)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===qf)return n.BYTE;if(i===Yf)return n.SHORT;if(i===Pr)return n.UNSIGNED_SHORT;if(i===Qu)return n.INT;if(i===Zi)return n.UNSIGNED_INT;if(i===Ln)return n.FLOAT;if(i===Wr)return n.HALF_FLOAT;if(i===Zf)return n.ALPHA;if(i===Jf)return n.RGB;if(i===An)return n.RGBA;if(i===jf)return n.LUMINANCE;if(i===Qf)return n.LUMINANCE_ALPHA;if(i===Hs)return n.DEPTH_COMPONENT;if(i===$s)return n.DEPTH_STENCIL;if(i===nh)return n.RED;if(i===ih)return n.RED_INTEGER;if(i===ep)return n.RG;if(i===sh)return n.RG_INTEGER;if(i===rh)return n.RGBA_INTEGER;if(i===Zo||i===Jo||i===jo||i===Qo)if(o===pt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Zo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Jo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===jo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Qo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Zo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Jo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===jo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Qo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===zl||i===Gl||i===Vl||i===Wl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===zl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Gl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Vl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Wl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Xl||i===$l||i===ql)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Xl||i===$l)return o===pt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===ql)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Yl||i===Kl||i===Zl||i===Jl||i===jl||i===Ql||i===eu||i===tu||i===nu||i===iu||i===su||i===ru||i===ou||i===au)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Yl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Kl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Zl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Jl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===jl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ql)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===eu)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===tu)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===nu)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===iu)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===su)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===ru)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===ou)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===au)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===ea||i===cu||i===lu)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===ea)return o===pt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===cu)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===lu)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===tp||i===uu||i===hu||i===du)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===ea)return r.COMPRESSED_RED_RGTC1_EXT;if(i===uu)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===hu)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===du)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Xs?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var wu=class extends Zt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Oe=class extends Jt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Ky={type:"move"},wr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Oe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Oe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Oe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let g=t.getJointPose(_,i),p=this._getHandJoint(c,_);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),d=.02,m=.005;c.inputState.pinching&&f>d+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Ky)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Oe;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},Zy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Jy=`
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

}`,Ru=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){let s=new rn,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Dn({vertexShader:Zy,fragmentShader:Jy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Z(new ri(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Cu=class extends ni{constructor(e,t){super();let i=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,f=null,d=null,m=null,_=new Ru,g=t.getContextAttributes(),p=null,S=null,x=[],E=[],D=new le,R=null,O=new Zt;O.viewport=new mt;let U=new Zt;U.viewport=new mt;let T=[O,U],y=new wu,P=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ee){let ae=x[ee];return ae===void 0&&(ae=new wr,x[ee]=ae),ae.getTargetRaySpace()},this.getControllerGrip=function(ee){let ae=x[ee];return ae===void 0&&(ae=new wr,x[ee]=ae),ae.getGripSpace()},this.getHand=function(ee){let ae=x[ee];return ae===void 0&&(ae=new wr,x[ee]=ae),ae.getHandSpace()};function L(ee){let ae=E.indexOf(ee.inputSource);if(ae===-1)return;let _e=x[ae];_e!==void 0&&(_e.update(ee.inputSource,ee.frame,c||o),_e.dispatchEvent({type:ee.type,data:ee.inputSource}))}function F(){s.removeEventListener("select",L),s.removeEventListener("selectstart",L),s.removeEventListener("selectend",L),s.removeEventListener("squeeze",L),s.removeEventListener("squeezestart",L),s.removeEventListener("squeezeend",L),s.removeEventListener("end",F),s.removeEventListener("inputsourceschange",K);for(let ee=0;ee<x.length;ee++){let ae=E[ee];ae!==null&&(E[ee]=null,x[ee].disconnect(ae))}P=null,H=null,_.reset(),e.setRenderTarget(p),d=null,f=null,h=null,s=null,S=null,nt.stop(),i.isPresenting=!1,e.setPixelRatio(R),e.setSize(D.width,D.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ee){r=ee,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ee){a=ee,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(ee){c=ee},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(ee){if(s=ee,s!==null){if(p=e.getRenderTarget(),s.addEventListener("select",L),s.addEventListener("selectstart",L),s.addEventListener("selectend",L),s.addEventListener("squeeze",L),s.addEventListener("squeezestart",L),s.addEventListener("squeezeend",L),s.addEventListener("end",F),s.addEventListener("inputsourceschange",K),g.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(D),s.renderState.layers===void 0){let ae={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,ae),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),S=new ii(d.framebufferWidth,d.framebufferHeight,{format:An,type:ti,colorSpace:e.outputColorSpace,stencilBuffer:g.stencil})}else{let ae=null,_e=null,ge=null;g.depth&&(ge=g.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ae=g.stencil?$s:Hs,_e=g.stencil?Xs:Zi);let De={colorFormat:t.RGBA8,depthFormat:ge,scaleFactor:r};h=new XRWebGLBinding(s,t),f=h.createProjectionLayer(De),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new ii(f.textureWidth,f.textureHeight,{format:An,type:ti,depthTexture:new da(f.textureWidth,f.textureHeight,_e,void 0,void 0,void 0,void 0,void 0,void 0,ae),stencilBuffer:g.stencil,colorSpace:e.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),nt.setContext(s),nt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function K(ee){for(let ae=0;ae<ee.removed.length;ae++){let _e=ee.removed[ae],ge=E.indexOf(_e);ge>=0&&(E[ge]=null,x[ge].disconnect(_e))}for(let ae=0;ae<ee.added.length;ae++){let _e=ee.added[ae],ge=E.indexOf(_e);if(ge===-1){for(let We=0;We<x.length;We++)if(We>=E.length){E.push(_e),ge=We;break}else if(E[We]===null){E[We]=_e,ge=We;break}if(ge===-1)break}let De=x[ge];De&&De.connect(_e)}}let G=new N,se=new N;function Y(ee,ae,_e){G.setFromMatrixPosition(ae.matrixWorld),se.setFromMatrixPosition(_e.matrixWorld);let ge=G.distanceTo(se),De=ae.projectionMatrix.elements,We=_e.projectionMatrix.elements,ze=De[14]/(De[10]-1),je=De[14]/(De[10]+1),oe=(De[9]+1)/De[5],fe=(De[9]-1)/De[5],k=(De[8]-1)/De[0],Pe=(We[8]+1)/We[0],ue=ze*k,Me=ze*Pe,pe=ge/(-k+Pe),Fe=pe*-k;if(ae.matrixWorld.decompose(ee.position,ee.quaternion,ee.scale),ee.translateX(Fe),ee.translateZ(pe),ee.matrixWorld.compose(ee.position,ee.quaternion,ee.scale),ee.matrixWorldInverse.copy(ee.matrixWorld).invert(),De[10]===-1)ee.projectionMatrix.copy(ae.projectionMatrix),ee.projectionMatrixInverse.copy(ae.projectionMatrixInverse);else{let ve=ze+pe,I=je+pe,v=ue-Fe,q=Me+(ge-Fe),ne=oe*je/I*ve,M=fe*je/I*ve;ee.projectionMatrix.makePerspective(v,q,ne,M,ve,I),ee.projectionMatrixInverse.copy(ee.projectionMatrix).invert()}}function Ee(ee,ae){ae===null?ee.matrixWorld.copy(ee.matrix):ee.matrixWorld.multiplyMatrices(ae.matrixWorld,ee.matrix),ee.matrixWorldInverse.copy(ee.matrixWorld).invert()}this.updateCamera=function(ee){if(s===null)return;let ae=ee.near,_e=ee.far;_.texture!==null&&(_.depthNear>0&&(ae=_.depthNear),_.depthFar>0&&(_e=_.depthFar)),y.near=U.near=O.near=ae,y.far=U.far=O.far=_e,(P!==y.near||H!==y.far)&&(s.updateRenderState({depthNear:y.near,depthFar:y.far}),P=y.near,H=y.far),O.layers.mask=ee.layers.mask|2,U.layers.mask=ee.layers.mask|4,y.layers.mask=O.layers.mask|U.layers.mask;let ge=ee.parent,De=y.cameras;Ee(y,ge);for(let We=0;We<De.length;We++)Ee(De[We],ge);De.length===2?Y(y,O,U):y.projectionMatrix.copy(O.projectionMatrix),me(ee,y,ge)};function me(ee,ae,_e){_e===null?ee.matrix.copy(ae.matrixWorld):(ee.matrix.copy(_e.matrixWorld),ee.matrix.invert(),ee.matrix.multiply(ae.matrixWorld)),ee.matrix.decompose(ee.position,ee.quaternion,ee.scale),ee.updateMatrixWorld(!0),ee.projectionMatrix.copy(ae.projectionMatrix),ee.projectionMatrixInverse.copy(ae.projectionMatrixInverse),ee.isPerspectiveCamera&&(ee.fov=Or*2*Math.atan(1/ee.projectionMatrix.elements[5]),ee.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(ee){l=ee,f!==null&&(f.fixedFoveation=ee),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=ee)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(y)};let Te=null;function be(ee,ae){if(u=ae.getViewerPose(c||o),m=ae,u!==null){let _e=u.views;d!==null&&(e.setRenderTargetFramebuffer(S,d.framebuffer),e.setRenderTarget(S));let ge=!1;_e.length!==y.cameras.length&&(y.cameras.length=0,ge=!0);for(let We=0;We<_e.length;We++){let ze=_e[We],je=null;if(d!==null)je=d.getViewport(ze);else{let fe=h.getViewSubImage(f,ze);je=fe.viewport,We===0&&(e.setRenderTargetTextures(S,fe.colorTexture,f.ignoreDepthValues?void 0:fe.depthStencilTexture),e.setRenderTarget(S))}let oe=T[We];oe===void 0&&(oe=new Zt,oe.layers.enable(We),oe.viewport=new mt,T[We]=oe),oe.matrix.fromArray(ze.transform.matrix),oe.matrix.decompose(oe.position,oe.quaternion,oe.scale),oe.projectionMatrix.fromArray(ze.projectionMatrix),oe.projectionMatrixInverse.copy(oe.projectionMatrix).invert(),oe.viewport.set(je.x,je.y,je.width,je.height),We===0&&(y.matrix.copy(oe.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),ge===!0&&y.cameras.push(oe)}let De=s.enabledFeatures;if(De&&De.includes("depth-sensing")){let We=h.getDepthInformation(_e[0]);We&&We.isValid&&We.texture&&_.init(e,We,s.renderState)}}for(let _e=0;_e<x.length;_e++){let ge=E[_e],De=x[_e];ge!==null&&De!==void 0&&De.update(ge,ae,c||o)}Te&&Te(ee,ae),ae.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ae}),m=null}let nt=new ap;nt.setAnimationLoop(be),this.setAnimationLoop=function(ee){Te=ee},this.dispose=function(){}}},Wi=new Nn,jy=new at;function Qy(n,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function i(g,p){p.color.getRGB(g.fogColor.value,op(n)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,S,x,E){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(g,p):p.isMeshToonMaterial?(r(g,p),h(g,p)):p.isMeshPhongMaterial?(r(g,p),u(g,p)):p.isMeshStandardMaterial?(r(g,p),f(g,p),p.isMeshPhysicalMaterial&&d(g,p,E)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),_(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(o(g,p),p.isLineDashedMaterial&&a(g,p)):p.isPointsMaterial?l(g,p,S,x):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===sn&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===sn&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let S=e.get(p),x=S.envMap,E=S.envMapRotation;x&&(g.envMap.value=x,Wi.copy(E),Wi.x*=-1,Wi.y*=-1,Wi.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Wi.y*=-1,Wi.z*=-1),g.envMapRotation.value.setFromMatrix4(jy.makeRotationFromEuler(Wi)),g.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function o(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function a(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,S,x){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*S,g.scale.value=x*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function u(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function h(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function f(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function d(g,p,S){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===sn&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=S.texture,g.transmissionSamplerSize.value.set(S.width,S.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function _(g,p){let S=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(S.matrixWorld),g.nearDistance.value=S.shadow.camera.near,g.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function eS(n,e,t,i){let s={},r={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,x){let E=x.program;i.uniformBlockBinding(S,E)}function c(S,x){let E=s[S.id];E===void 0&&(m(S),E=u(S),s[S.id]=E,S.addEventListener("dispose",g));let D=x.program;i.updateUBOMapping(S,D);let R=e.render.frame;r[S.id]!==R&&(f(S),r[S.id]=R)}function u(S){let x=h();S.__bindingPointIndex=x;let E=n.createBuffer(),D=S.__size,R=S.usage;return n.bindBuffer(n.UNIFORM_BUFFER,E),n.bufferData(n.UNIFORM_BUFFER,D,R),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,x,E),E}function h(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(S){let x=s[S.id],E=S.uniforms,D=S.__cache;n.bindBuffer(n.UNIFORM_BUFFER,x);for(let R=0,O=E.length;R<O;R++){let U=Array.isArray(E[R])?E[R]:[E[R]];for(let T=0,y=U.length;T<y;T++){let P=U[T];if(d(P,R,T,D)===!0){let H=P.__offset,L=Array.isArray(P.value)?P.value:[P.value],F=0;for(let K=0;K<L.length;K++){let G=L[K],se=_(G);typeof G=="number"||typeof G=="boolean"?(P.__data[0]=G,n.bufferSubData(n.UNIFORM_BUFFER,H+F,P.__data)):G.isMatrix3?(P.__data[0]=G.elements[0],P.__data[1]=G.elements[1],P.__data[2]=G.elements[2],P.__data[3]=0,P.__data[4]=G.elements[3],P.__data[5]=G.elements[4],P.__data[6]=G.elements[5],P.__data[7]=0,P.__data[8]=G.elements[6],P.__data[9]=G.elements[7],P.__data[10]=G.elements[8],P.__data[11]=0):(G.toArray(P.__data,F),F+=se.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,H,P.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(S,x,E,D){let R=S.value,O=x+"_"+E;if(D[O]===void 0)return typeof R=="number"||typeof R=="boolean"?D[O]=R:D[O]=R.clone(),!0;{let U=D[O];if(typeof R=="number"||typeof R=="boolean"){if(U!==R)return D[O]=R,!0}else if(U.equals(R)===!1)return U.copy(R),!0}return!1}function m(S){let x=S.uniforms,E=0,D=16;for(let O=0,U=x.length;O<U;O++){let T=Array.isArray(x[O])?x[O]:[x[O]];for(let y=0,P=T.length;y<P;y++){let H=T[y],L=Array.isArray(H.value)?H.value:[H.value];for(let F=0,K=L.length;F<K;F++){let G=L[F],se=_(G),Y=E%D,Ee=Y%se.boundary,me=Y+Ee;E+=Ee,me!==0&&D-me<se.storage&&(E+=D-me),H.__data=new Float32Array(se.storage/Float32Array.BYTES_PER_ELEMENT),H.__offset=E,E+=se.storage}}}let R=E%D;return R>0&&(E+=D-R),S.__size=E,S.__cache={},this}function _(S){let x={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(x.boundary=4,x.storage=4):S.isVector2?(x.boundary=8,x.storage=8):S.isVector3||S.isColor?(x.boundary=16,x.storage=12):S.isVector4?(x.boundary=16,x.storage=16):S.isMatrix3?(x.boundary=48,x.storage=48):S.isMatrix4?(x.boundary=64,x.storage=64):S.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",S),x}function g(S){let x=S.target;x.removeEventListener("dispose",g);let E=o.indexOf(x.__bindingPointIndex);o.splice(E,1),n.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function p(){for(let S in s)n.deleteBuffer(s[S]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}var fa=class{constructor(e={}){let{canvas:t=s0(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let d;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=i.getContextAttributes().alpha}else d=o;let m=new Uint32Array(4),_=new Int32Array(4),g=null,p=null,S=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Pt,this.toneMapping=bi,this.toneMappingExposure=1;let E=this,D=!1,R=0,O=0,U=null,T=-1,y=null,P=new mt,H=new mt,L=null,F=new ke(0),K=0,G=t.width,se=t.height,Y=1,Ee=null,me=null,Te=new mt(0,0,G,se),be=new mt(0,0,G,se),nt=!1,ee=new Lr,ae=!1,_e=!1,ge=new at,De=new at,We=new N,ze=new mt,je={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},oe=!1;function fe(){return U===null?Y:1}let k=i;function Pe(A,W){return t.getContext(A,W)}try{let A={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",$,!1),t.addEventListener("webglcontextrestored",te,!1),t.addEventListener("webglcontextcreationerror",he,!1),k===null){let W="webgl2";if(k=Pe(W,A),k===null)throw Pe(W)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let ue,Me,pe,Fe,ve,I,v,q,ne,M,C,ie,Q,ce,we,re,Se,Ie,Ge,Ce,it,w,z,b;function B(){ue=new gx(k),ue.init(),w=new Yy(k,ue),Me=new ux(k,ue,e,w),pe=new Xy(k,ue),Me.reverseDepthBuffer&&f&&pe.buffers.depth.setReversed(!0),Fe=new xx(k),ve=new Oy,I=new qy(k,ue,pe,ve,Me,w,Fe),v=new dx(E),q=new mx(E),ne=new A0(k),z=new cx(k,ne),M=new _x(k,ne,Fe,z),C=new Sx(k,M,ne,Fe),Ge=new yx(k,Me,I),re=new hx(ve),ie=new Py(E,v,q,ue,Me,z,re),Q=new Qy(E,ve),ce=new Ly,we=new By(ue),Ie=new ax(E,v,q,pe,C,d,l),Se=new Vy(E,C,Me),b=new eS(k,Fe,Me,pe),Ce=new lx(k,ue,Fe),it=new Ex(k,ue,Fe),Fe.programs=ie.programs,E.capabilities=Me,E.extensions=ue,E.properties=ve,E.renderLists=ce,E.shadowMap=Se,E.state=pe,E.info=Fe}B();let V=new Cu(E,k);this.xr=V,this.getContext=function(){return k},this.getContextAttributes=function(){return k.getContextAttributes()},this.forceContextLoss=function(){let A=ue.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=ue.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(A){A!==void 0&&(Y=A,this.setSize(G,se,!1))},this.getSize=function(A){return A.set(G,se)},this.setSize=function(A,W,J=!0){if(V.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}G=A,se=W,t.width=Math.floor(A*Y),t.height=Math.floor(W*Y),J===!0&&(t.style.width=A+"px",t.style.height=W+"px"),this.setViewport(0,0,A,W)},this.getDrawingBufferSize=function(A){return A.set(G*Y,se*Y).floor()},this.setDrawingBufferSize=function(A,W,J){G=A,se=W,Y=J,t.width=Math.floor(A*J),t.height=Math.floor(W*J),this.setViewport(0,0,A,W)},this.getCurrentViewport=function(A){return A.copy(P)},this.getViewport=function(A){return A.copy(Te)},this.setViewport=function(A,W,J,j){A.isVector4?Te.set(A.x,A.y,A.z,A.w):Te.set(A,W,J,j),pe.viewport(P.copy(Te).multiplyScalar(Y).round())},this.getScissor=function(A){return A.copy(be)},this.setScissor=function(A,W,J,j){A.isVector4?be.set(A.x,A.y,A.z,A.w):be.set(A,W,J,j),pe.scissor(H.copy(be).multiplyScalar(Y).round())},this.getScissorTest=function(){return nt},this.setScissorTest=function(A){pe.setScissorTest(nt=A)},this.setOpaqueSort=function(A){Ee=A},this.setTransparentSort=function(A){me=A},this.getClearColor=function(A){return A.copy(Ie.getClearColor())},this.setClearColor=function(){Ie.setClearColor.apply(Ie,arguments)},this.getClearAlpha=function(){return Ie.getClearAlpha()},this.setClearAlpha=function(){Ie.setClearAlpha.apply(Ie,arguments)},this.clear=function(A=!0,W=!0,J=!0){let j=0;if(A){let X=!1;if(U!==null){let xe=U.texture.format;X=xe===rh||xe===sh||xe===ih}if(X){let xe=U.texture.type,Ae=xe===ti||xe===Zi||xe===Pr||xe===Xs||xe===eh||xe===th,Ue=Ie.getClearColor(),Le=Ie.getClearAlpha(),Ye=Ue.r,Ke=Ue.g,Ne=Ue.b;Ae?(m[0]=Ye,m[1]=Ke,m[2]=Ne,m[3]=Le,k.clearBufferuiv(k.COLOR,0,m)):(_[0]=Ye,_[1]=Ke,_[2]=Ne,_[3]=Le,k.clearBufferiv(k.COLOR,0,_))}else j|=k.COLOR_BUFFER_BIT}W&&(j|=k.DEPTH_BUFFER_BIT),J&&(j|=k.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",$,!1),t.removeEventListener("webglcontextrestored",te,!1),t.removeEventListener("webglcontextcreationerror",he,!1),ce.dispose(),we.dispose(),ve.dispose(),v.dispose(),q.dispose(),C.dispose(),z.dispose(),b.dispose(),ie.dispose(),V.dispose(),V.removeEventListener("sessionstart",hr),V.removeEventListener("sessionend",Ch),Di.stop()};function $(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function te(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;let A=Fe.autoReset,W=Se.enabled,J=Se.autoUpdate,j=Se.needsUpdate,X=Se.type;B(),Fe.autoReset=A,Se.enabled=W,Se.autoUpdate=J,Se.needsUpdate=j,Se.type=X}function he(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function Xe(A){let W=A.target;W.removeEventListener("dispose",Xe),qe(W)}function qe(A){rt(A),ve.remove(A)}function rt(A){let W=ve.get(A).programs;W!==void 0&&(W.forEach(function(J){ie.releaseProgram(J)}),A.isShaderMaterial&&ie.releaseShaderCache(A))}this.renderBufferDirect=function(A,W,J,j,X,xe){W===null&&(W=je);let Ae=X.isMesh&&X.matrixWorld.determinant()<0,Ue=Rm(A,W,J,j,X);pe.setMaterial(j,Ae);let Le=J.index,Ye=1;if(j.wireframe===!0){if(Le=M.getWireframeAttribute(J),Le===void 0)return;Ye=2}let Ke=J.drawRange,Ne=J.attributes.position,ut=Ke.start*Ye,_t=(Ke.start+Ke.count)*Ye;xe!==null&&(ut=Math.max(ut,xe.start*Ye),_t=Math.min(_t,(xe.start+xe.count)*Ye)),Le!==null?(ut=Math.max(ut,0),_t=Math.min(_t,Le.count)):Ne!=null&&(ut=Math.max(ut,0),_t=Math.min(_t,Ne.count));let yt=_t-ut;if(yt<0||yt===1/0)return;z.setup(X,j,Ue,J,Le);let tn,dt=Ce;if(Le!==null&&(tn=ne.get(Le),dt=it,dt.setIndex(tn)),X.isMesh)j.wireframe===!0?(pe.setLineWidth(j.wireframeLinewidth*fe()),dt.setMode(k.LINES)):dt.setMode(k.TRIANGLES);else if(X.isLine){let He=j.linewidth;He===void 0&&(He=1),pe.setLineWidth(He*fe()),X.isLineSegments?dt.setMode(k.LINES):X.isLineLoop?dt.setMode(k.LINE_LOOP):dt.setMode(k.LINE_STRIP)}else X.isPoints?dt.setMode(k.POINTS):X.isSprite&&dt.setMode(k.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)dt.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(ue.get("WEBGL_multi_draw"))dt.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let He=X._multiDrawStarts,zn=X._multiDrawCounts,ft=X._multiDrawCount,Sn=Le?ne.get(Le).bytesPerElement:1,hs=ve.get(j).currentProgram.getUniforms();for(let cn=0;cn<ft;cn++)hs.setValue(k,"_gl_DrawID",cn),dt.render(He[cn]/Sn,zn[cn])}else if(X.isInstancedMesh)dt.renderInstances(ut,yt,X.count);else if(J.isInstancedBufferGeometry){let He=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,zn=Math.min(J.instanceCount,He);dt.renderInstances(ut,yt,zn)}else dt.render(ut,yt)};function tt(A,W,J){A.transparent===!0&&A.side===Wt&&A.forceSinglePass===!1?(A.side=sn,A.needsUpdate=!0,oo(A,W,J),A.side=Ai,A.needsUpdate=!0,oo(A,W,J),A.side=Wt):oo(A,W,J)}this.compile=function(A,W,J=null){J===null&&(J=A),p=we.get(J),p.init(W),x.push(p),J.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(p.pushLight(X),X.castShadow&&p.pushShadow(X))}),A!==J&&A.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(p.pushLight(X),X.castShadow&&p.pushShadow(X))}),p.setupLights();let j=new Set;return A.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let xe=X.material;if(xe)if(Array.isArray(xe))for(let Ae=0;Ae<xe.length;Ae++){let Ue=xe[Ae];tt(Ue,J,X),j.add(Ue)}else tt(xe,J,X),j.add(xe)}),x.pop(),p=null,j},this.compileAsync=function(A,W,J=null){let j=this.compile(A,W,J);return new Promise(X=>{function xe(){if(j.forEach(function(Ae){ve.get(Ae).currentProgram.isReady()&&j.delete(Ae)}),j.size===0){X(A);return}setTimeout(xe,10)}ue.get("KHR_parallel_shader_compile")!==null?xe():setTimeout(xe,10)})};let Vt=null;function Ft(A){Vt&&Vt(A)}function hr(){Di.stop()}function Ch(){Di.start()}let Di=new ap;Di.setAnimationLoop(Ft),typeof self<"u"&&Di.setContext(self),this.setAnimationLoop=function(A){Vt=A,V.setAnimationLoop(A),A===null?Di.stop():Di.start()},V.addEventListener("sessionstart",hr),V.addEventListener("sessionend",Ch),this.render=function(A,W){if(W!==void 0&&W.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),V.enabled===!0&&V.isPresenting===!0&&(V.cameraAutoUpdate===!0&&V.updateCamera(W),W=V.getCamera()),A.isScene===!0&&A.onBeforeRender(E,A,W,U),p=we.get(A,x.length),p.init(W),x.push(p),De.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),ee.setFromProjectionMatrix(De),_e=this.localClippingEnabled,ae=re.init(this.clippingPlanes,_e),g=ce.get(A,S.length),g.init(),S.push(g),V.enabled===!0&&V.isPresenting===!0){let xe=E.xr.getDepthSensingMesh();xe!==null&&ac(xe,W,-1/0,E.sortObjects)}ac(A,W,0,E.sortObjects),g.finish(),E.sortObjects===!0&&g.sort(Ee,me),oe=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,oe&&Ie.addToRenderList(g,A),this.info.render.frame++,ae===!0&&re.beginShadows();let J=p.state.shadowsArray;Se.render(J,A,W),ae===!0&&re.endShadows(),this.info.autoReset===!0&&this.info.reset();let j=g.opaque,X=g.transmissive;if(p.setupLights(),W.isArrayCamera){let xe=W.cameras;if(X.length>0)for(let Ae=0,Ue=xe.length;Ae<Ue;Ae++){let Le=xe[Ae];Ph(j,X,A,Le)}oe&&Ie.render(A);for(let Ae=0,Ue=xe.length;Ae<Ue;Ae++){let Le=xe[Ae];Ih(g,A,Le,Le.viewport)}}else X.length>0&&Ph(j,X,A,W),oe&&Ie.render(A),Ih(g,A,W);U!==null&&(I.updateMultisampleRenderTarget(U),I.updateRenderTargetMipmap(U)),A.isScene===!0&&A.onAfterRender(E,A,W),z.resetDefaultState(),T=-1,y=null,x.pop(),x.length>0?(p=x[x.length-1],ae===!0&&re.setGlobalState(E.clippingPlanes,p.state.camera)):p=null,S.pop(),S.length>0?g=S[S.length-1]:g=null};function ac(A,W,J,j){if(A.visible===!1)return;if(A.layers.test(W.layers)){if(A.isGroup)J=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(W);else if(A.isLight)p.pushLight(A),A.castShadow&&p.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||ee.intersectsSprite(A)){j&&ze.setFromMatrixPosition(A.matrixWorld).applyMatrix4(De);let Ae=C.update(A),Ue=A.material;Ue.visible&&g.push(A,Ae,Ue,J,ze.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||ee.intersectsObject(A))){let Ae=C.update(A),Ue=A.material;if(j&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),ze.copy(A.boundingSphere.center)):(Ae.boundingSphere===null&&Ae.computeBoundingSphere(),ze.copy(Ae.boundingSphere.center)),ze.applyMatrix4(A.matrixWorld).applyMatrix4(De)),Array.isArray(Ue)){let Le=Ae.groups;for(let Ye=0,Ke=Le.length;Ye<Ke;Ye++){let Ne=Le[Ye],ut=Ue[Ne.materialIndex];ut&&ut.visible&&g.push(A,Ae,ut,J,ze.z,Ne)}}else Ue.visible&&g.push(A,Ae,Ue,J,ze.z,null)}}let xe=A.children;for(let Ae=0,Ue=xe.length;Ae<Ue;Ae++)ac(xe[Ae],W,J,j)}function Ih(A,W,J,j){let X=A.opaque,xe=A.transmissive,Ae=A.transparent;p.setupLightsView(J),ae===!0&&re.setGlobalState(E.clippingPlanes,J),j&&pe.viewport(P.copy(j)),X.length>0&&ro(X,W,J),xe.length>0&&ro(xe,W,J),Ae.length>0&&ro(Ae,W,J),pe.buffers.depth.setTest(!0),pe.buffers.depth.setMask(!0),pe.buffers.color.setMask(!0),pe.setPolygonOffset(!1)}function Ph(A,W,J,j){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[j.id]===void 0&&(p.state.transmissionRenderTarget[j.id]=new ii(1,1,{generateMipmaps:!0,type:ue.has("EXT_color_buffer_half_float")||ue.has("EXT_color_buffer_float")?Wr:ti,minFilter:Ki,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:lt.workingColorSpace}));let xe=p.state.transmissionRenderTarget[j.id],Ae=j.viewport||P;xe.setSize(Ae.z,Ae.w);let Ue=E.getRenderTarget();E.setRenderTarget(xe),E.getClearColor(F),K=E.getClearAlpha(),K<1&&E.setClearColor(16777215,.5),E.clear(),oe&&Ie.render(J);let Le=E.toneMapping;E.toneMapping=bi;let Ye=j.viewport;if(j.viewport!==void 0&&(j.viewport=void 0),p.setupLightsView(j),ae===!0&&re.setGlobalState(E.clippingPlanes,j),ro(A,J,j),I.updateMultisampleRenderTarget(xe),I.updateRenderTargetMipmap(xe),ue.has("WEBGL_multisampled_render_to_texture")===!1){let Ke=!1;for(let Ne=0,ut=W.length;Ne<ut;Ne++){let _t=W[Ne],yt=_t.object,tn=_t.geometry,dt=_t.material,He=_t.group;if(dt.side===Wt&&yt.layers.test(j.layers)){let zn=dt.side;dt.side=sn,dt.needsUpdate=!0,Oh(yt,J,j,tn,dt,He),dt.side=zn,dt.needsUpdate=!0,Ke=!0}}Ke===!0&&(I.updateMultisampleRenderTarget(xe),I.updateRenderTargetMipmap(xe))}E.setRenderTarget(Ue),E.setClearColor(F,K),Ye!==void 0&&(j.viewport=Ye),E.toneMapping=Le}function ro(A,W,J){let j=W.isScene===!0?W.overrideMaterial:null;for(let X=0,xe=A.length;X<xe;X++){let Ae=A[X],Ue=Ae.object,Le=Ae.geometry,Ye=j===null?Ae.material:j,Ke=Ae.group;Ue.layers.test(J.layers)&&Oh(Ue,W,J,Le,Ye,Ke)}}function Oh(A,W,J,j,X,xe){A.onBeforeRender(E,W,J,j,X,xe),A.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),X.onBeforeRender(E,W,J,j,A,xe),X.transparent===!0&&X.side===Wt&&X.forceSinglePass===!1?(X.side=sn,X.needsUpdate=!0,E.renderBufferDirect(J,W,j,X,A,xe),X.side=Ai,X.needsUpdate=!0,E.renderBufferDirect(J,W,j,X,A,xe),X.side=Wt):E.renderBufferDirect(J,W,j,X,A,xe),A.onAfterRender(E,W,J,j,X,xe)}function oo(A,W,J){W.isScene!==!0&&(W=je);let j=ve.get(A),X=p.state.lights,xe=p.state.shadowsArray,Ae=X.state.version,Ue=ie.getParameters(A,X.state,xe,W,J),Le=ie.getProgramCacheKey(Ue),Ye=j.programs;j.environment=A.isMeshStandardMaterial?W.environment:null,j.fog=W.fog,j.envMap=(A.isMeshStandardMaterial?q:v).get(A.envMap||j.environment),j.envMapRotation=j.environment!==null&&A.envMap===null?W.environmentRotation:A.envMapRotation,Ye===void 0&&(A.addEventListener("dispose",Xe),Ye=new Map,j.programs=Ye);let Ke=Ye.get(Le);if(Ke!==void 0){if(j.currentProgram===Ke&&j.lightsStateVersion===Ae)return Lh(A,Ue),Ke}else Ue.uniforms=ie.getUniforms(A),A.onBeforeCompile(Ue,E),Ke=ie.acquireProgram(Ue,Le),Ye.set(Le,Ke),j.uniforms=Ue.uniforms;let Ne=j.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Ne.clippingPlanes=re.uniform),Lh(A,Ue),j.needsLights=Im(A),j.lightsStateVersion=Ae,j.needsLights&&(Ne.ambientLightColor.value=X.state.ambient,Ne.lightProbe.value=X.state.probe,Ne.directionalLights.value=X.state.directional,Ne.directionalLightShadows.value=X.state.directionalShadow,Ne.spotLights.value=X.state.spot,Ne.spotLightShadows.value=X.state.spotShadow,Ne.rectAreaLights.value=X.state.rectArea,Ne.ltc_1.value=X.state.rectAreaLTC1,Ne.ltc_2.value=X.state.rectAreaLTC2,Ne.pointLights.value=X.state.point,Ne.pointLightShadows.value=X.state.pointShadow,Ne.hemisphereLights.value=X.state.hemi,Ne.directionalShadowMap.value=X.state.directionalShadowMap,Ne.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Ne.spotShadowMap.value=X.state.spotShadowMap,Ne.spotLightMatrix.value=X.state.spotLightMatrix,Ne.spotLightMap.value=X.state.spotLightMap,Ne.pointShadowMap.value=X.state.pointShadowMap,Ne.pointShadowMatrix.value=X.state.pointShadowMatrix),j.currentProgram=Ke,j.uniformsList=null,Ke}function Uh(A){if(A.uniformsList===null){let W=A.currentProgram.getUniforms();A.uniformsList=Bs.seqWithValue(W.seq,A.uniforms)}return A.uniformsList}function Lh(A,W){let J=ve.get(A);J.outputColorSpace=W.outputColorSpace,J.batching=W.batching,J.batchingColor=W.batchingColor,J.instancing=W.instancing,J.instancingColor=W.instancingColor,J.instancingMorph=W.instancingMorph,J.skinning=W.skinning,J.morphTargets=W.morphTargets,J.morphNormals=W.morphNormals,J.morphColors=W.morphColors,J.morphTargetsCount=W.morphTargetsCount,J.numClippingPlanes=W.numClippingPlanes,J.numIntersection=W.numClipIntersection,J.vertexAlphas=W.vertexAlphas,J.vertexTangents=W.vertexTangents,J.toneMapping=W.toneMapping}function Rm(A,W,J,j,X){W.isScene!==!0&&(W=je),I.resetTextureUnits();let xe=W.fog,Ae=j.isMeshStandardMaterial?W.environment:null,Ue=U===null?E.outputColorSpace:U.isXRRenderTarget===!0?U.texture.colorSpace:js,Le=(j.isMeshStandardMaterial?q:v).get(j.envMap||Ae),Ye=j.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,Ke=!!J.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),Ne=!!J.morphAttributes.position,ut=!!J.morphAttributes.normal,_t=!!J.morphAttributes.color,yt=bi;j.toneMapped&&(U===null||U.isXRRenderTarget===!0)&&(yt=E.toneMapping);let tn=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,dt=tn!==void 0?tn.length:0,He=ve.get(j),zn=p.state.lights;if(ae===!0&&(_e===!0||A!==y)){let gn=A===y&&j.id===T;re.setState(j,A,gn)}let ft=!1;j.version===He.__version?(He.needsLights&&He.lightsStateVersion!==zn.state.version||He.outputColorSpace!==Ue||X.isBatchedMesh&&He.batching===!1||!X.isBatchedMesh&&He.batching===!0||X.isBatchedMesh&&He.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&He.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&He.instancing===!1||!X.isInstancedMesh&&He.instancing===!0||X.isSkinnedMesh&&He.skinning===!1||!X.isSkinnedMesh&&He.skinning===!0||X.isInstancedMesh&&He.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&He.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&He.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&He.instancingMorph===!1&&X.morphTexture!==null||He.envMap!==Le||j.fog===!0&&He.fog!==xe||He.numClippingPlanes!==void 0&&(He.numClippingPlanes!==re.numPlanes||He.numIntersection!==re.numIntersection)||He.vertexAlphas!==Ye||He.vertexTangents!==Ke||He.morphTargets!==Ne||He.morphNormals!==ut||He.morphColors!==_t||He.toneMapping!==yt||He.morphTargetsCount!==dt)&&(ft=!0):(ft=!0,He.__version=j.version);let Sn=He.currentProgram;ft===!0&&(Sn=oo(j,W,X));let hs=!1,cn=!1,dr=!1,St=Sn.getUniforms(),Pn=He.uniforms;if(pe.useProgram(Sn.program)&&(hs=!0,cn=!0,dr=!0),j.id!==T&&(T=j.id,cn=!0),hs||y!==A){pe.buffers.depth.getReversed()?(ge.copy(A.projectionMatrix),o0(ge),a0(ge),St.setValue(k,"projectionMatrix",ge)):St.setValue(k,"projectionMatrix",A.projectionMatrix),St.setValue(k,"viewMatrix",A.matrixWorldInverse);let pi=St.map.cameraPosition;pi!==void 0&&pi.setValue(k,We.setFromMatrixPosition(A.matrixWorld)),Me.logarithmicDepthBuffer&&St.setValue(k,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&St.setValue(k,"isOrthographic",A.isOrthographicCamera===!0),y!==A&&(y=A,cn=!0,dr=!0)}if(X.isSkinnedMesh){St.setOptional(k,X,"bindMatrix"),St.setOptional(k,X,"bindMatrixInverse");let gn=X.skeleton;gn&&(gn.boneTexture===null&&gn.computeBoneTexture(),St.setValue(k,"boneTexture",gn.boneTexture,I))}X.isBatchedMesh&&(St.setOptional(k,X,"batchingTexture"),St.setValue(k,"batchingTexture",X._matricesTexture,I),St.setOptional(k,X,"batchingIdTexture"),St.setValue(k,"batchingIdTexture",X._indirectTexture,I),St.setOptional(k,X,"batchingColorTexture"),X._colorsTexture!==null&&St.setValue(k,"batchingColorTexture",X._colorsTexture,I));let fr=J.morphAttributes;if((fr.position!==void 0||fr.normal!==void 0||fr.color!==void 0)&&Ge.update(X,J,Sn),(cn||He.receiveShadow!==X.receiveShadow)&&(He.receiveShadow=X.receiveShadow,St.setValue(k,"receiveShadow",X.receiveShadow)),j.isMeshGouraudMaterial&&j.envMap!==null&&(Pn.envMap.value=Le,Pn.flipEnvMap.value=Le.isCubeTexture&&Le.isRenderTargetTexture===!1?-1:1),j.isMeshStandardMaterial&&j.envMap===null&&W.environment!==null&&(Pn.envMapIntensity.value=W.environmentIntensity),cn&&(St.setValue(k,"toneMappingExposure",E.toneMappingExposure),He.needsLights&&Cm(Pn,dr),xe&&j.fog===!0&&Q.refreshFogUniforms(Pn,xe),Q.refreshMaterialUniforms(Pn,j,Y,se,p.state.transmissionRenderTarget[A.id]),Bs.upload(k,Uh(He),Pn,I)),j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(Bs.upload(k,Uh(He),Pn,I),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&St.setValue(k,"center",X.center),St.setValue(k,"modelViewMatrix",X.modelViewMatrix),St.setValue(k,"normalMatrix",X.normalMatrix),St.setValue(k,"modelMatrix",X.matrixWorld),j.isShaderMaterial||j.isRawShaderMaterial){let gn=j.uniformsGroups;for(let pi=0,mi=gn.length;pi<mi;pi++){let Nh=gn[pi];b.update(Nh,Sn),b.bind(Nh,Sn)}}return Sn}function Cm(A,W){A.ambientLightColor.needsUpdate=W,A.lightProbe.needsUpdate=W,A.directionalLights.needsUpdate=W,A.directionalLightShadows.needsUpdate=W,A.pointLights.needsUpdate=W,A.pointLightShadows.needsUpdate=W,A.spotLights.needsUpdate=W,A.spotLightShadows.needsUpdate=W,A.rectAreaLights.needsUpdate=W,A.hemisphereLights.needsUpdate=W}function Im(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return O},this.getRenderTarget=function(){return U},this.setRenderTargetTextures=function(A,W,J){ve.get(A.texture).__webglTexture=W,ve.get(A.depthTexture).__webglTexture=J;let j=ve.get(A);j.__hasExternalTextures=!0,j.__autoAllocateDepthBuffer=J===void 0,j.__autoAllocateDepthBuffer||ue.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),j.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(A,W){let J=ve.get(A);J.__webglFramebuffer=W,J.__useDefaultFramebuffer=W===void 0},this.setRenderTarget=function(A,W=0,J=0){U=A,R=W,O=J;let j=!0,X=null,xe=!1,Ae=!1;if(A){let Le=ve.get(A);if(Le.__useDefaultFramebuffer!==void 0)pe.bindFramebuffer(k.FRAMEBUFFER,null),j=!1;else if(Le.__webglFramebuffer===void 0)I.setupRenderTarget(A);else if(Le.__hasExternalTextures)I.rebindTextures(A,ve.get(A.texture).__webglTexture,ve.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let Ne=A.depthTexture;if(Le.__boundDepthTexture!==Ne){if(Ne!==null&&ve.has(Ne)&&(A.width!==Ne.image.width||A.height!==Ne.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");I.setupDepthRenderbuffer(A)}}let Ye=A.texture;(Ye.isData3DTexture||Ye.isDataArrayTexture||Ye.isCompressedArrayTexture)&&(Ae=!0);let Ke=ve.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Ke[W])?X=Ke[W][J]:X=Ke[W],xe=!0):A.samples>0&&I.useMultisampledRTT(A)===!1?X=ve.get(A).__webglMultisampledFramebuffer:Array.isArray(Ke)?X=Ke[J]:X=Ke,P.copy(A.viewport),H.copy(A.scissor),L=A.scissorTest}else P.copy(Te).multiplyScalar(Y).floor(),H.copy(be).multiplyScalar(Y).floor(),L=nt;if(pe.bindFramebuffer(k.FRAMEBUFFER,X)&&j&&pe.drawBuffers(A,X),pe.viewport(P),pe.scissor(H),pe.setScissorTest(L),xe){let Le=ve.get(A.texture);k.framebufferTexture2D(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_CUBE_MAP_POSITIVE_X+W,Le.__webglTexture,J)}else if(Ae){let Le=ve.get(A.texture),Ye=W||0;k.framebufferTextureLayer(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,Le.__webglTexture,J||0,Ye)}T=-1},this.readRenderTargetPixels=function(A,W,J,j,X,xe,Ae){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ue=ve.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Ae!==void 0&&(Ue=Ue[Ae]),Ue){pe.bindFramebuffer(k.FRAMEBUFFER,Ue);try{let Le=A.texture,Ye=Le.format,Ke=Le.type;if(!Me.textureFormatReadable(Ye)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Me.textureTypeReadable(Ke)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=A.width-j&&J>=0&&J<=A.height-X&&k.readPixels(W,J,j,X,w.convert(Ye),w.convert(Ke),xe)}finally{let Le=U!==null?ve.get(U).__webglFramebuffer:null;pe.bindFramebuffer(k.FRAMEBUFFER,Le)}}},this.readRenderTargetPixelsAsync=async function(A,W,J,j,X,xe,Ae){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ue=ve.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Ae!==void 0&&(Ue=Ue[Ae]),Ue){let Le=A.texture,Ye=Le.format,Ke=Le.type;if(!Me.textureFormatReadable(Ye))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Me.textureTypeReadable(Ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(W>=0&&W<=A.width-j&&J>=0&&J<=A.height-X){pe.bindFramebuffer(k.FRAMEBUFFER,Ue);let Ne=k.createBuffer();k.bindBuffer(k.PIXEL_PACK_BUFFER,Ne),k.bufferData(k.PIXEL_PACK_BUFFER,xe.byteLength,k.STREAM_READ),k.readPixels(W,J,j,X,w.convert(Ye),w.convert(Ke),0);let ut=U!==null?ve.get(U).__webglFramebuffer:null;pe.bindFramebuffer(k.FRAMEBUFFER,ut);let _t=k.fenceSync(k.SYNC_GPU_COMMANDS_COMPLETE,0);return k.flush(),await r0(k,_t,4),k.bindBuffer(k.PIXEL_PACK_BUFFER,Ne),k.getBufferSubData(k.PIXEL_PACK_BUFFER,0,xe),k.deleteBuffer(Ne),k.deleteSync(_t),xe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(A,W=null,J=0){A.isTexture!==!0&&(vr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),W=arguments[0]||null,A=arguments[1]);let j=Math.pow(2,-J),X=Math.floor(A.image.width*j),xe=Math.floor(A.image.height*j),Ae=W!==null?W.x:0,Ue=W!==null?W.y:0;I.setTexture2D(A,0),k.copyTexSubImage2D(k.TEXTURE_2D,J,0,0,Ae,Ue,X,xe),pe.unbindTexture()},this.copyTextureToTexture=function(A,W,J=null,j=null,X=0){A.isTexture!==!0&&(vr("WebGLRenderer: copyTextureToTexture function signature has changed."),j=arguments[0]||null,A=arguments[1],W=arguments[2],X=arguments[3]||0,J=null);let xe,Ae,Ue,Le,Ye,Ke,Ne,ut,_t,yt=A.isCompressedTexture?A.mipmaps[X]:A.image;J!==null?(xe=J.max.x-J.min.x,Ae=J.max.y-J.min.y,Ue=J.isBox3?J.max.z-J.min.z:1,Le=J.min.x,Ye=J.min.y,Ke=J.isBox3?J.min.z:0):(xe=yt.width,Ae=yt.height,Ue=yt.depth||1,Le=0,Ye=0,Ke=0),j!==null?(Ne=j.x,ut=j.y,_t=j.z):(Ne=0,ut=0,_t=0);let tn=w.convert(W.format),dt=w.convert(W.type),He;W.isData3DTexture?(I.setTexture3D(W,0),He=k.TEXTURE_3D):W.isDataArrayTexture||W.isCompressedArrayTexture?(I.setTexture2DArray(W,0),He=k.TEXTURE_2D_ARRAY):(I.setTexture2D(W,0),He=k.TEXTURE_2D),k.pixelStorei(k.UNPACK_FLIP_Y_WEBGL,W.flipY),k.pixelStorei(k.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),k.pixelStorei(k.UNPACK_ALIGNMENT,W.unpackAlignment);let zn=k.getParameter(k.UNPACK_ROW_LENGTH),ft=k.getParameter(k.UNPACK_IMAGE_HEIGHT),Sn=k.getParameter(k.UNPACK_SKIP_PIXELS),hs=k.getParameter(k.UNPACK_SKIP_ROWS),cn=k.getParameter(k.UNPACK_SKIP_IMAGES);k.pixelStorei(k.UNPACK_ROW_LENGTH,yt.width),k.pixelStorei(k.UNPACK_IMAGE_HEIGHT,yt.height),k.pixelStorei(k.UNPACK_SKIP_PIXELS,Le),k.pixelStorei(k.UNPACK_SKIP_ROWS,Ye),k.pixelStorei(k.UNPACK_SKIP_IMAGES,Ke);let dr=A.isDataArrayTexture||A.isData3DTexture,St=W.isDataArrayTexture||W.isData3DTexture;if(A.isRenderTargetTexture||A.isDepthTexture){let Pn=ve.get(A),fr=ve.get(W),gn=ve.get(Pn.__renderTarget),pi=ve.get(fr.__renderTarget);pe.bindFramebuffer(k.READ_FRAMEBUFFER,gn.__webglFramebuffer),pe.bindFramebuffer(k.DRAW_FRAMEBUFFER,pi.__webglFramebuffer);for(let mi=0;mi<Ue;mi++)dr&&k.framebufferTextureLayer(k.READ_FRAMEBUFFER,k.COLOR_ATTACHMENT0,ve.get(A).__webglTexture,X,Ke+mi),A.isDepthTexture?(St&&k.framebufferTextureLayer(k.DRAW_FRAMEBUFFER,k.COLOR_ATTACHMENT0,ve.get(W).__webglTexture,X,_t+mi),k.blitFramebuffer(Le,Ye,xe,Ae,Ne,ut,xe,Ae,k.DEPTH_BUFFER_BIT,k.NEAREST)):St?k.copyTexSubImage3D(He,X,Ne,ut,_t+mi,Le,Ye,xe,Ae):k.copyTexSubImage2D(He,X,Ne,ut,_t+mi,Le,Ye,xe,Ae);pe.bindFramebuffer(k.READ_FRAMEBUFFER,null),pe.bindFramebuffer(k.DRAW_FRAMEBUFFER,null)}else St?A.isDataTexture||A.isData3DTexture?k.texSubImage3D(He,X,Ne,ut,_t,xe,Ae,Ue,tn,dt,yt.data):W.isCompressedArrayTexture?k.compressedTexSubImage3D(He,X,Ne,ut,_t,xe,Ae,Ue,tn,yt.data):k.texSubImage3D(He,X,Ne,ut,_t,xe,Ae,Ue,tn,dt,yt):A.isDataTexture?k.texSubImage2D(k.TEXTURE_2D,X,Ne,ut,xe,Ae,tn,dt,yt.data):A.isCompressedTexture?k.compressedTexSubImage2D(k.TEXTURE_2D,X,Ne,ut,yt.width,yt.height,tn,yt.data):k.texSubImage2D(k.TEXTURE_2D,X,Ne,ut,xe,Ae,tn,dt,yt);k.pixelStorei(k.UNPACK_ROW_LENGTH,zn),k.pixelStorei(k.UNPACK_IMAGE_HEIGHT,ft),k.pixelStorei(k.UNPACK_SKIP_PIXELS,Sn),k.pixelStorei(k.UNPACK_SKIP_ROWS,hs),k.pixelStorei(k.UNPACK_SKIP_IMAGES,cn),X===0&&W.generateMipmaps&&k.generateMipmap(He),pe.unbindTexture()},this.copyTextureToTexture3D=function(A,W,J=null,j=null,X=0){return A.isTexture!==!0&&(vr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),J=arguments[0]||null,j=arguments[1]||null,A=arguments[2],W=arguments[3],X=arguments[4]||0),vr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(A,W,J,j,X)},this.initRenderTarget=function(A){ve.get(A).__webglFramebuffer===void 0&&I.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?I.setTextureCube(A,0):A.isData3DTexture?I.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?I.setTexture2DArray(A,0):I.setTexture2D(A,0),pe.unbindTexture()},this.resetState=function(){R=0,O=0,U=null,pe.reset(),z.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return jn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorspace=lt._getDrawingBufferColorSpace(e),t.unpackColorSpace=lt._getUnpackColorSpace()}};var pa=class n{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new ke(e),this.near=t,this.far=i}clone(){return new n(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},ma=class extends Jt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Nn,this.environmentIntensity=1,this.environmentRotation=new Nn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var Iu=class extends rn{constructor(e=null,t=1,i=1,s,r,o,a,l,c=dn,u=dn,h,f){super(null,o,a,l,c,u,s,r,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Nr=class extends Ct{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Us=new at,If=new at,Vo=[],Pf=new si,tS=new at,yr=new Z,Sr=new wi,oi=class extends Z{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Nr(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,tS)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new si),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Us),Pf.copy(e.boundingBox).applyMatrix4(Us),this.boundingBox.union(Pf)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new wi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Us),Sr.copy(e.boundingSphere).applyMatrix4(Us),this.boundingSphere.union(Sr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,o=e*r+1;for(let a=0;a<i.length;a++)i[a]=s[o+a]}raycast(e,t){let i=this.matrixWorld,s=this.count;if(yr.geometry=this.geometry,yr.material=this.material,yr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Sr.copy(this.boundingSphere),Sr.applyMatrix4(i),e.ray.intersectsSphere(Sr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Us),If.multiplyMatrices(i,Us),yr.matrixWorld=If,yr.raycast(e,Vo);for(let o=0,a=Vo.length;o<a;o++){let l=Vo[o];l.instanceId=r,l.object=this,t.push(l)}Vo.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Nr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new Iu(new Float32Array(s*this.count),s,this.count,nh,Ln));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var ai=class extends Ri{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new ke(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Of=new at,Pu=new Ji,Wo=new wi,Xo=new N,Ci=class extends Jt{constructor(e=new Et,t=new ai){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Wo.copy(i.boundingSphere),Wo.applyMatrix4(s),Wo.radius+=r,e.ray.intersectsSphere(Wo)===!1)return;Of.copy(s).invert(),Pu.copy(e.ray).applyMatrix4(Of);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,h=i.attributes.position;if(c!==null){let f=Math.max(0,o.start),d=Math.min(c.count,o.start+o.count);for(let m=f,_=d;m<_;m++){let g=c.getX(m);Xo.fromBufferAttribute(h,g),Uf(Xo,g,l,s,e,t,this)}}else{let f=Math.max(0,o.start),d=Math.min(h.count,o.start+o.count);for(let m=f,_=d;m<_;m++)Xo.fromBufferAttribute(h,m),Uf(Xo,m,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Uf(n,e,t,i,s,r,o){let a=Pu.distanceSqToPoint(n);if(a<t){let l=new N;Pu.closestPointToPoint(n,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var ci=class extends rn{constructor(e,t,i,s,r,o,a,l,c){super(e,t,i,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},En=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let i=this.getLengths(),s=0,r=i.length,o;t?o=t:o=e*i[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=i[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===o)return s/(r-1);let u=i[s],f=i[s+1]-u,d=(o-u)/f;return(s+d)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new le:new N);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){let i=new N,s=[],r=[],o=[],a=new N,l=new at;for(let d=0;d<=e;d++){let m=d/e;s[d]=this.getTangentAt(m,new N)}r[0]=new N,o[0]=new N;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),f=Math.abs(s[0].z);u<=c&&(c=u,i.set(1,0,0)),h<=c&&(c=h,i.set(0,1,0)),f<=c&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(s[d-1],s[d]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(Ut(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(a,m))}o[d].crossVectors(s[d],r[d])}if(t===!0){let d=Math.acos(Ut(r[0].dot(r[e]),-1,1));d/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(d=-d);for(let m=1;m<=e;m++)r[m].applyMatrix4(l.makeRotationAxis(s[m],d*m)),o[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Dr=class extends En{constructor(e=0,t=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new le){let i=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*u-d*h+this.aX,c=f*h+d*u+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ou=class extends Dr{constructor(e,t,i,s,r,o){super(e,t,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function ch(){let n=0,e=0,t=0,i=0;function s(r,o,a,l){n=r,e=a,t=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,u,h){let f=(o-r)/c-(a-r)/(c+u)+(a-o)/u,d=(a-o)/u-(l-o)/(u+h)+(l-a)/h;f*=u,d*=u,s(o,a,f,d)},calc:function(r){let o=r*r,a=o*r;return n+e*r+t*o+i*a}}}var $o=new N,Ml=new ch,bl=new ch,Al=new ch,kn=class extends En{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new N){let i=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,u;this.closed||a>0?c=s[(a-1)%r]:($o.subVectors(s[0],s[1]).add(s[0]),c=$o);let h=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:($o.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=$o),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(h),d),_=Math.pow(h.distanceToSquared(f),d),g=Math.pow(f.distanceToSquared(u),d);_<1e-4&&(_=1),m<1e-4&&(m=_),g<1e-4&&(g=_),Ml.initNonuniformCatmullRom(c.x,h.x,f.x,u.x,m,_,g),bl.initNonuniformCatmullRom(c.y,h.y,f.y,u.y,m,_,g),Al.initNonuniformCatmullRom(c.z,h.z,f.z,u.z,m,_,g)}else this.curveType==="catmullrom"&&(Ml.initCatmullRom(c.x,h.x,f.x,u.x,this.tension),bl.initCatmullRom(c.y,h.y,f.y,u.y,this.tension),Al.initCatmullRom(c.z,h.z,f.z,u.z,this.tension));return i.set(Ml.calc(l),bl.calc(l),Al.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new N().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Lf(n,e,t,i,s){let r=(i-e)*.5,o=(s-t)*.5,a=n*n,l=n*a;return(2*t-2*i+r+o)*l+(-3*t+3*i-2*r-o)*a+r*n+t}function nS(n,e){let t=1-n;return t*t*e}function iS(n,e){return 2*(1-n)*n*e}function sS(n,e){return n*n*e}function Rr(n,e,t,i){return nS(n,e)+iS(n,t)+sS(n,i)}function rS(n,e){let t=1-n;return t*t*t*e}function oS(n,e){let t=1-n;return 3*t*t*n*e}function aS(n,e){return 3*(1-n)*n*n*e}function cS(n,e){return n*n*n*e}function Cr(n,e,t,i,s){return rS(n,e)+oS(n,t)+aS(n,i)+cS(n,s)}var ga=class extends En{constructor(e=new le,t=new le,i=new le,s=new le){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new le){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Cr(e,s.x,r.x,o.x,a.x),Cr(e,s.y,r.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Uu=class extends En{constructor(e=new N,t=new N,i=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new N){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Cr(e,s.x,r.x,o.x,a.x),Cr(e,s.y,r.y,o.y,a.y),Cr(e,s.z,r.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},_a=class extends En{constructor(e=new le,t=new le){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new le){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new le){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Lu=class extends En{constructor(e=new N,t=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new N){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new N){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ea=class extends En{constructor(e=new le,t=new le,i=new le){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new le){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Rr(e,s.x,r.x,o.x),Rr(e,s.y,r.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},xa=class extends En{constructor(e=new N,t=new N,i=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new N){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Rr(e,s.x,r.x,o.x),Rr(e,s.y,r.y,o.y),Rr(e,s.z,r.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ya=class extends En{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new le){let i=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],u=s[o>s.length-2?s.length-1:o+1],h=s[o>s.length-3?s.length-1:o+2];return i.set(Lf(a,l.x,c.x,u.x,h.x),Lf(a,l.y,c.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new le().fromArray(s))}return this}},Sa=Object.freeze({__proto__:null,ArcCurve:Ou,CatmullRomCurve3:kn,CubicBezierCurve:ga,CubicBezierCurve3:Uu,EllipseCurve:Dr,LineCurve:_a,LineCurve3:Lu,QuadraticBezierCurve:Ea,QuadraticBezierCurve3:xa,SplineCurve:ya}),Nu=class extends En{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Sa[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let o=s[r]-i,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(new Sa[s.type]().fromJSON(s))}return this}},kr=class extends Nu{constructor(e){super(),this.type="Path",this.currentPoint=new le,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new _a(this.currentPoint.clone(),new le(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){let r=new Ea(this.currentPoint.clone(),new le(e,t),new le(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,o){let a=new ga(this.currentPoint.clone(),new le(e,t),new le(i,s),new le(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new ya(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,s,r,o),this}absarc(e,t,i,s,r,o){return this.absellipse(e,t,i,i,s,r,o),this}ellipse(e,t,i,s,r,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,i,s,r,o,a,l),this}absellipse(e,t,i,s,r,o,a,l){let c=new Dr(e,t,i,s,r,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Hr=class n extends Et{constructor(e=[new le(0,-.5),new le(.5,0),new le(0,.5)],t=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:s},t=Math.floor(t),s=Ut(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],u=1/t,h=new N,f=new le,d=new N,m=new N,_=new N,g=0,p=0;for(let S=0;S<=e.length-1;S++)switch(S){case 0:g=e[S+1].x-e[S].x,p=e[S+1].y-e[S].y,d.x=p*1,d.y=-g,d.z=p*0,_.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case e.length-1:l.push(_.x,_.y,_.z);break;default:g=e[S+1].x-e[S].x,p=e[S+1].y-e[S].y,d.x=p*1,d.y=-g,d.z=p*0,m.copy(d),d.x+=_.x,d.y+=_.y,d.z+=_.z,d.normalize(),l.push(d.x,d.y,d.z),_.copy(m)}for(let S=0;S<=t;S++){let x=i+S*u*s,E=Math.sin(x),D=Math.cos(x);for(let R=0;R<=e.length-1;R++){h.x=e[R].x*E,h.y=e[R].y,h.z=e[R].x*D,o.push(h.x,h.y,h.z),f.x=S/t,f.y=R/(e.length-1),a.push(f.x,f.y);let O=l[3*R+0]*E,U=l[3*R+1],T=l[3*R+0]*D;c.push(O,U,T)}}for(let S=0;S<t;S++)for(let x=0;x<e.length-1;x++){let E=x+S*e.length,D=E,R=E+e.length,O=E+e.length+1,U=E+1;r.push(D,R,U),r.push(O,U,R)}this.setIndex(r),this.setAttribute("position",new Je(o,3)),this.setAttribute("uv",new Je(a,2)),this.setAttribute("normal",new Je(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.points,e.segments,e.phiStart,e.phiLength)}},Xt=class n extends Hr{constructor(e=1,t=1,i=4,s=8){let r=new kr;r.absarc(0,-t/2,e,Math.PI*1.5,0),r.absarc(0,t/2,e,0,Math.PI*.5),super(r.getPoints(i),s),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:i,radialSegments:s}}static fromJSON(e){return new n(e.radius,e.length,e.capSegments,e.radialSegments)}},Hn=class n extends Et{constructor(e=1,t=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:s},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new N,u=new le;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,f=3;h<=t;h++,f+=3){let d=i+h/t*s;c.x=e*Math.cos(d),c.y=e*Math.sin(d),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[f]/e+1)/2,u.y=(o[f+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new Je(o,3)),this.setAttribute("normal",new Je(a,3)),this.setAttribute("uv",new Je(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}},et=class n extends Et{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],f=[],d=[],m=0,_=[],g=i/2,p=0;S(),o===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(u),this.setAttribute("position",new Je(h,3)),this.setAttribute("normal",new Je(f,3)),this.setAttribute("uv",new Je(d,2));function S(){let E=new N,D=new N,R=0,O=(t-e)/i;for(let U=0;U<=r;U++){let T=[],y=U/r,P=y*(t-e)+e;for(let H=0;H<=s;H++){let L=H/s,F=L*l+a,K=Math.sin(F),G=Math.cos(F);D.x=P*K,D.y=-y*i+g,D.z=P*G,h.push(D.x,D.y,D.z),E.set(K,O,G).normalize(),f.push(E.x,E.y,E.z),d.push(L,1-y),T.push(m++)}_.push(T)}for(let U=0;U<s;U++)for(let T=0;T<r;T++){let y=_[T][U],P=_[T+1][U],H=_[T+1][U+1],L=_[T][U+1];(e>0||T!==0)&&(u.push(y,P,L),R+=3),(t>0||T!==r-1)&&(u.push(P,H,L),R+=3)}c.addGroup(p,R,0),p+=R}function x(E){let D=m,R=new le,O=new N,U=0,T=E===!0?e:t,y=E===!0?1:-1;for(let H=1;H<=s;H++)h.push(0,g*y,0),f.push(0,y,0),d.push(.5,.5),m++;let P=m;for(let H=0;H<=s;H++){let F=H/s*l+a,K=Math.cos(F),G=Math.sin(F);O.x=T*G,O.y=g*y,O.z=T*K,h.push(O.x,O.y,O.z),f.push(0,y,0),R.x=K*.5+.5,R.y=G*.5*y+.5,d.push(R.x,R.y),m++}for(let H=0;H<s;H++){let L=D+H,F=P+H;E===!0?u.push(F,F+1,L):u.push(F+1,F,L),U+=3}c.addGroup(p,U,E===!0?1:2),p+=U}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},en=class n extends et{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Ta=class n extends Et{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};let r=[],o=[];a(s),c(i),u(),this.setAttribute("position",new Je(r,3)),this.setAttribute("normal",new Je(r.slice(),3)),this.setAttribute("uv",new Je(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(S){let x=new N,E=new N,D=new N;for(let R=0;R<t.length;R+=3)d(t[R+0],x),d(t[R+1],E),d(t[R+2],D),l(x,E,D,S)}function l(S,x,E,D){let R=D+1,O=[];for(let U=0;U<=R;U++){O[U]=[];let T=S.clone().lerp(E,U/R),y=x.clone().lerp(E,U/R),P=R-U;for(let H=0;H<=P;H++)H===0&&U===R?O[U][H]=T:O[U][H]=T.clone().lerp(y,H/P)}for(let U=0;U<R;U++)for(let T=0;T<2*(R-U)-1;T++){let y=Math.floor(T/2);T%2===0?(f(O[U][y+1]),f(O[U+1][y]),f(O[U][y])):(f(O[U][y+1]),f(O[U+1][y+1]),f(O[U+1][y]))}}function c(S){let x=new N;for(let E=0;E<r.length;E+=3)x.x=r[E+0],x.y=r[E+1],x.z=r[E+2],x.normalize().multiplyScalar(S),r[E+0]=x.x,r[E+1]=x.y,r[E+2]=x.z}function u(){let S=new N;for(let x=0;x<r.length;x+=3){S.x=r[x+0],S.y=r[x+1],S.z=r[x+2];let E=g(S)/2/Math.PI+.5,D=p(S)/Math.PI+.5;o.push(E,1-D)}m(),h()}function h(){for(let S=0;S<o.length;S+=6){let x=o[S+0],E=o[S+2],D=o[S+4],R=Math.max(x,E,D),O=Math.min(x,E,D);R>.9&&O<.1&&(x<.2&&(o[S+0]+=1),E<.2&&(o[S+2]+=1),D<.2&&(o[S+4]+=1))}}function f(S){r.push(S.x,S.y,S.z)}function d(S,x){let E=S*3;x.x=e[E+0],x.y=e[E+1],x.z=e[E+2]}function m(){let S=new N,x=new N,E=new N,D=new N,R=new le,O=new le,U=new le;for(let T=0,y=0;T<r.length;T+=9,y+=6){S.set(r[T+0],r[T+1],r[T+2]),x.set(r[T+3],r[T+4],r[T+5]),E.set(r[T+6],r[T+7],r[T+8]),R.set(o[y+0],o[y+1]),O.set(o[y+2],o[y+3]),U.set(o[y+4],o[y+5]),D.copy(S).add(x).add(E).divideScalar(3);let P=g(D);_(R,y+0,S,P),_(O,y+2,x,P),_(U,y+4,E,P)}}function _(S,x,E,D){D<0&&S.x===1&&(o[x]=S.x-1),E.x===0&&E.z===0&&(o[x]=D/2/Math.PI+.5)}function g(S){return Math.atan2(S.z,-S.x)}function p(S){return Math.atan2(-S.y,Math.sqrt(S.x*S.x+S.z*S.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.details)}},va=class n extends Ta{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,s=1/i,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-i,0,-s,i,0,s,-i,0,s,i,-s,-i,0,-s,i,0,s,-i,0,s,i,0,-i,0,-s,i,0,-s,-i,0,s,i,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var Fr=class extends kr{constructor(e){super(e),this.uuid=is(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(new kr().fromJSON(s))}return this}},lS={triangulate:function(n,e,t=2){let i=e&&e.length,s=i?e[0]*t:n.length,r=dp(n,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c,u,h,f,d;if(i&&(r=pS(n,e,r,t)),n.length>80*t){a=c=n[0],l=u=n[1];for(let m=t;m<s;m+=t)h=n[m],f=n[m+1],h<a&&(a=h),f<l&&(l=f),h>c&&(c=h),f>u&&(u=f);d=Math.max(c-a,u-l),d=d!==0?32767/d:0}return Br(r,o,t,a,l,d,0),o}};function dp(n,e,t,i,s){let r,o;if(s===bS(n,e,t,i)>0)for(r=e;r<t;r+=i)o=Nf(r,n[r],n[r+1],o);else for(r=t-i;r>=e;r-=i)o=Nf(r,n[r],n[r+1],o);return o&&Ba(o,o.next)&&(Gr(o),o=o.next),o}function ji(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(Ba(t,t.next)||bt(t.prev,t,t.next)===0)){if(Gr(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Br(n,e,t,i,s,r,o){if(!n)return;!o&&r&&xS(n,i,s,r);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,r?hS(n,i,s,r):uS(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),Gr(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=dS(ji(n),e,t),Br(n,e,t,i,s,r,2)):o===2&&fS(n,e,t,i,s,r):Br(ji(n),e,t,i,s,r,1);break}}}function uS(n){let e=n.prev,t=n,i=n.next;if(bt(e,t,i)>=0)return!1;let s=e.x,r=t.x,o=i.x,a=e.y,l=t.y,c=i.y,u=s<r?s<o?s:o:r<o?r:o,h=a<l?a<c?a:c:l<c?l:c,f=s>r?s>o?s:o:r>o?r:o,d=a>l?a>c?a:c:l>c?l:c,m=i.next;for(;m!==e;){if(m.x>=u&&m.x<=f&&m.y>=h&&m.y<=d&&Ds(s,a,r,l,o,c,m.x,m.y)&&bt(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function hS(n,e,t,i){let s=n.prev,r=n,o=n.next;if(bt(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,u=s.y,h=r.y,f=o.y,d=a<l?a<c?a:c:l<c?l:c,m=u<h?u<f?u:f:h<f?h:f,_=a>l?a>c?a:c:l>c?l:c,g=u>h?u>f?u:f:h>f?h:f,p=Du(d,m,e,t,i),S=Du(_,g,e,t,i),x=n.prevZ,E=n.nextZ;for(;x&&x.z>=p&&E&&E.z<=S;){if(x.x>=d&&x.x<=_&&x.y>=m&&x.y<=g&&x!==s&&x!==o&&Ds(a,u,l,h,c,f,x.x,x.y)&&bt(x.prev,x,x.next)>=0||(x=x.prevZ,E.x>=d&&E.x<=_&&E.y>=m&&E.y<=g&&E!==s&&E!==o&&Ds(a,u,l,h,c,f,E.x,E.y)&&bt(E.prev,E,E.next)>=0))return!1;E=E.nextZ}for(;x&&x.z>=p;){if(x.x>=d&&x.x<=_&&x.y>=m&&x.y<=g&&x!==s&&x!==o&&Ds(a,u,l,h,c,f,x.x,x.y)&&bt(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;E&&E.z<=S;){if(E.x>=d&&E.x<=_&&E.y>=m&&E.y<=g&&E!==s&&E!==o&&Ds(a,u,l,h,c,f,E.x,E.y)&&bt(E.prev,E,E.next)>=0)return!1;E=E.nextZ}return!0}function dS(n,e,t){let i=n;do{let s=i.prev,r=i.next.next;!Ba(s,r)&&fp(s,i,i.next,r)&&zr(s,r)&&zr(r,s)&&(e.push(s.i/t|0),e.push(i.i/t|0),e.push(r.i/t|0),Gr(i),Gr(i.next),i=n=r),i=i.next}while(i!==n);return ji(i)}function fS(n,e,t,i,s,r){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&TS(o,a)){let l=pp(o,a);o=ji(o,o.next),l=ji(l,l.next),Br(o,e,t,i,s,r,0),Br(l,e,t,i,s,r,0);return}a=a.next}o=o.next}while(o!==n)}function pS(n,e,t,i){let s=[],r,o,a,l,c;for(r=0,o=e.length;r<o;r++)a=e[r]*i,l=r<o-1?e[r+1]*i:n.length,c=dp(n,a,l,i,!1),c===c.next&&(c.steiner=!0),s.push(SS(c));for(s.sort(mS),r=0;r<s.length;r++)t=gS(s[r],t);return t}function mS(n,e){return n.x-e.x}function gS(n,e){let t=_S(n,e);if(!t)return e;let i=pp(t,n);return ji(i,i.next),ji(t,t.next)}function _S(n,e){let t=e,i=-1/0,s,r=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let f=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=r&&f>i&&(i=f,s=t.x<t.next.x?t:t.next,f===r))return s}t=t.next}while(t!==e);if(!s)return null;let a=s,l=s.x,c=s.y,u=1/0,h;t=s;do r>=t.x&&t.x>=l&&r!==t.x&&Ds(o<c?r:i,o,l,c,o<c?i:r,o,t.x,t.y)&&(h=Math.abs(o-t.y)/(r-t.x),zr(t,n)&&(h<u||h===u&&(t.x>s.x||t.x===s.x&&ES(s,t)))&&(s=t,u=h)),t=t.next;while(t!==a);return s}function ES(n,e){return bt(n.prev,n,e.prev)<0&&bt(e.next,n,n.next)<0}function xS(n,e,t,i){let s=n;do s.z===0&&(s.z=Du(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,yS(s)}function yS(n){let e,t,i,s,r,o,a,l,c=1;do{for(t=n,n=null,r=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(s=t,t=t.nextZ,a--):(s=i,i=i.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;t=i}r.nextZ=null,c*=2}while(o>1);return n}function Du(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function SS(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function Ds(n,e,t,i,s,r,o,a){return(s-o)*(e-a)>=(n-o)*(r-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(i-a)}function TS(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!vS(n,e)&&(zr(n,e)&&zr(e,n)&&MS(n,e)&&(bt(n.prev,n,e.prev)||bt(n,e.prev,e))||Ba(n,e)&&bt(n.prev,n,n.next)>0&&bt(e.prev,e,e.next)>0)}function bt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function Ba(n,e){return n.x===e.x&&n.y===e.y}function fp(n,e,t,i){let s=Yo(bt(n,e,t)),r=Yo(bt(n,e,i)),o=Yo(bt(t,i,n)),a=Yo(bt(t,i,e));return!!(s!==r&&o!==a||s===0&&qo(n,t,e)||r===0&&qo(n,i,e)||o===0&&qo(t,n,i)||a===0&&qo(t,e,i))}function qo(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Yo(n){return n>0?1:n<0?-1:0}function vS(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&fp(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function zr(n,e){return bt(n.prev,n,n.next)<0?bt(n,e,n.next)>=0&&bt(n,n.prev,e)>=0:bt(n,e,n.prev)<0||bt(n,n.next,e)<0}function MS(n,e){let t=n,i=!1,s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function pp(n,e){let t=new ku(n.i,n.x,n.y),i=new ku(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function Nf(n,e,t,i){let s=new ku(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function Gr(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function ku(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function bS(n,e,t,i){let s=0;for(let r=e,o=t-i;r<t;r+=i)s+=(n[o]-n[r])*(n[r+1]+n[o+1]),o=r;return s}var Ir=class n{static area(e){let t=e.length,i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],s=[],r=[];Df(e),kf(i,e);let o=e.length;t.forEach(Df);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,kf(i,t[l]);let a=lS.triangulate(i,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function Df(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function kf(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var Ma=class n extends Et{constructor(e=new Fr([new le(.5,.5),new le(-.5,.5),new le(-.5,-.5),new le(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new Je(s,3)),this.setAttribute("uv",new Je(r,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,m=t.bevelSize!==void 0?t.bevelSize:d-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,S=t.UVGenerator!==void 0?t.UVGenerator:AS,x,E=!1,D,R,O,U;p&&(x=p.getSpacedPoints(u),E=!0,f=!1,D=p.computeFrenetFrames(u,!1),R=new N,O=new N,U=new N),f||(g=0,d=0,m=0,_=0);let T=a.extractPoints(c),y=T.shape,P=T.holes;if(!Ir.isClockWise(y)){y=y.reverse();for(let oe=0,fe=P.length;oe<fe;oe++){let k=P[oe];Ir.isClockWise(k)&&(P[oe]=k.reverse())}}let L=Ir.triangulateShape(y,P),F=y;for(let oe=0,fe=P.length;oe<fe;oe++){let k=P[oe];y=y.concat(k)}function K(oe,fe,k){return fe||console.error("THREE.ExtrudeGeometry: vec does not exist"),oe.clone().addScaledVector(fe,k)}let G=y.length,se=L.length;function Y(oe,fe,k){let Pe,ue,Me,pe=oe.x-fe.x,Fe=oe.y-fe.y,ve=k.x-oe.x,I=k.y-oe.y,v=pe*pe+Fe*Fe,q=pe*I-Fe*ve;if(Math.abs(q)>Number.EPSILON){let ne=Math.sqrt(v),M=Math.sqrt(ve*ve+I*I),C=fe.x-Fe/ne,ie=fe.y+pe/ne,Q=k.x-I/M,ce=k.y+ve/M,we=((Q-C)*I-(ce-ie)*ve)/(pe*I-Fe*ve);Pe=C+pe*we-oe.x,ue=ie+Fe*we-oe.y;let re=Pe*Pe+ue*ue;if(re<=2)return new le(Pe,ue);Me=Math.sqrt(re/2)}else{let ne=!1;pe>Number.EPSILON?ve>Number.EPSILON&&(ne=!0):pe<-Number.EPSILON?ve<-Number.EPSILON&&(ne=!0):Math.sign(Fe)===Math.sign(I)&&(ne=!0),ne?(Pe=-Fe,ue=pe,Me=Math.sqrt(v)):(Pe=pe,ue=Fe,Me=Math.sqrt(v/2))}return new le(Pe/Me,ue/Me)}let Ee=[];for(let oe=0,fe=F.length,k=fe-1,Pe=oe+1;oe<fe;oe++,k++,Pe++)k===fe&&(k=0),Pe===fe&&(Pe=0),Ee[oe]=Y(F[oe],F[k],F[Pe]);let me=[],Te,be=Ee.concat();for(let oe=0,fe=P.length;oe<fe;oe++){let k=P[oe];Te=[];for(let Pe=0,ue=k.length,Me=ue-1,pe=Pe+1;Pe<ue;Pe++,Me++,pe++)Me===ue&&(Me=0),pe===ue&&(pe=0),Te[Pe]=Y(k[Pe],k[Me],k[pe]);me.push(Te),be=be.concat(Te)}for(let oe=0;oe<g;oe++){let fe=oe/g,k=d*Math.cos(fe*Math.PI/2),Pe=m*Math.sin(fe*Math.PI/2)+_;for(let ue=0,Me=F.length;ue<Me;ue++){let pe=K(F[ue],Ee[ue],Pe);ge(pe.x,pe.y,-k)}for(let ue=0,Me=P.length;ue<Me;ue++){let pe=P[ue];Te=me[ue];for(let Fe=0,ve=pe.length;Fe<ve;Fe++){let I=K(pe[Fe],Te[Fe],Pe);ge(I.x,I.y,-k)}}}let nt=m+_;for(let oe=0;oe<G;oe++){let fe=f?K(y[oe],be[oe],nt):y[oe];E?(O.copy(D.normals[0]).multiplyScalar(fe.x),R.copy(D.binormals[0]).multiplyScalar(fe.y),U.copy(x[0]).add(O).add(R),ge(U.x,U.y,U.z)):ge(fe.x,fe.y,0)}for(let oe=1;oe<=u;oe++)for(let fe=0;fe<G;fe++){let k=f?K(y[fe],be[fe],nt):y[fe];E?(O.copy(D.normals[oe]).multiplyScalar(k.x),R.copy(D.binormals[oe]).multiplyScalar(k.y),U.copy(x[oe]).add(O).add(R),ge(U.x,U.y,U.z)):ge(k.x,k.y,h/u*oe)}for(let oe=g-1;oe>=0;oe--){let fe=oe/g,k=d*Math.cos(fe*Math.PI/2),Pe=m*Math.sin(fe*Math.PI/2)+_;for(let ue=0,Me=F.length;ue<Me;ue++){let pe=K(F[ue],Ee[ue],Pe);ge(pe.x,pe.y,h+k)}for(let ue=0,Me=P.length;ue<Me;ue++){let pe=P[ue];Te=me[ue];for(let Fe=0,ve=pe.length;Fe<ve;Fe++){let I=K(pe[Fe],Te[Fe],Pe);E?ge(I.x,I.y+x[u-1].y,x[u-1].x+k):ge(I.x,I.y,h+k)}}}ee(),ae();function ee(){let oe=s.length/3;if(f){let fe=0,k=G*fe;for(let Pe=0;Pe<se;Pe++){let ue=L[Pe];De(ue[2]+k,ue[1]+k,ue[0]+k)}fe=u+g*2,k=G*fe;for(let Pe=0;Pe<se;Pe++){let ue=L[Pe];De(ue[0]+k,ue[1]+k,ue[2]+k)}}else{for(let fe=0;fe<se;fe++){let k=L[fe];De(k[2],k[1],k[0])}for(let fe=0;fe<se;fe++){let k=L[fe];De(k[0]+G*u,k[1]+G*u,k[2]+G*u)}}i.addGroup(oe,s.length/3-oe,0)}function ae(){let oe=s.length/3,fe=0;_e(F,fe),fe+=F.length;for(let k=0,Pe=P.length;k<Pe;k++){let ue=P[k];_e(ue,fe),fe+=ue.length}i.addGroup(oe,s.length/3-oe,1)}function _e(oe,fe){let k=oe.length;for(;--k>=0;){let Pe=k,ue=k-1;ue<0&&(ue=oe.length-1);for(let Me=0,pe=u+g*2;Me<pe;Me++){let Fe=G*Me,ve=G*(Me+1),I=fe+Pe+Fe,v=fe+ue+Fe,q=fe+ue+ve,ne=fe+Pe+ve;We(I,v,q,ne)}}}function ge(oe,fe,k){l.push(oe),l.push(fe),l.push(k)}function De(oe,fe,k){ze(oe),ze(fe),ze(k);let Pe=s.length/3,ue=S.generateTopUV(i,s,Pe-3,Pe-2,Pe-1);je(ue[0]),je(ue[1]),je(ue[2])}function We(oe,fe,k,Pe){ze(oe),ze(fe),ze(Pe),ze(fe),ze(k),ze(Pe);let ue=s.length/3,Me=S.generateSideWallUV(i,s,ue-6,ue-3,ue-2,ue-1);je(Me[0]),je(Me[1]),je(Me[3]),je(Me[1]),je(Me[2]),je(Me[3])}function ze(oe){s.push(l[oe*3+0]),s.push(l[oe*3+1]),s.push(l[oe*3+2])}function je(oe){r.push(oe.x),r.push(oe.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return wS(t,i,e)}static fromJSON(e,t){let i=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];i.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Sa[s.type]().fromJSON(s)),new n(i,e.options)}},AS={generateTopUV:function(n,e,t,i,s){let r=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],c=e[s*3],u=e[s*3+1];return[new le(r,o),new le(a,l),new le(c,u)]},generateSideWallUV:function(n,e,t,i,s,r){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[i*3],u=e[i*3+1],h=e[i*3+2],f=e[s*3],d=e[s*3+1],m=e[s*3+2],_=e[r*3],g=e[r*3+1],p=e[r*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new le(o,1-l),new le(c,1-h),new le(f,1-m),new le(_,1-p)]:[new le(a,1-l),new le(u,1-h),new le(d,1-m),new le(g,1-p)]}};function wS(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var ba=class n extends Ta{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var Aa=class n extends Et{constructor(e=.5,t=1,i=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:o},i=Math.max(3,i),s=Math.max(1,s);let a=[],l=[],c=[],u=[],h=e,f=(t-e)/s,d=new N,m=new le;for(let _=0;_<=s;_++){for(let g=0;g<=i;g++){let p=r+g/i*o;d.x=h*Math.cos(p),d.y=h*Math.sin(p),l.push(d.x,d.y,d.z),c.push(0,0,1),m.x=(d.x/t+1)/2,m.y=(d.y/t+1)/2,u.push(m.x,m.y)}h+=f}for(let _=0;_<s;_++){let g=_*(i+1);for(let p=0;p<i;p++){let S=p+g,x=S,E=S+i+1,D=S+i+2,R=S+1;a.push(x,E,R),a.push(E,D,R)}}this.setIndex(a),this.setAttribute("position",new Je(l,3)),this.setAttribute("normal",new Je(c,3)),this.setAttribute("uv",new Je(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var Re=class n extends Et{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new N,f=new N,d=[],m=[],_=[],g=[];for(let p=0;p<=i;p++){let S=[],x=p/i,E=0;p===0&&o===0?E=.5/t:p===i&&l===Math.PI&&(E=-.5/t);for(let D=0;D<=t;D++){let R=D/t;h.x=-e*Math.cos(s+R*r)*Math.sin(o+x*a),h.y=e*Math.cos(o+x*a),h.z=e*Math.sin(s+R*r)*Math.sin(o+x*a),m.push(h.x,h.y,h.z),f.copy(h).normalize(),_.push(f.x,f.y,f.z),g.push(R+E,1-x),S.push(c++)}u.push(S)}for(let p=0;p<i;p++)for(let S=0;S<t;S++){let x=u[p][S+1],E=u[p][S],D=u[p+1][S],R=u[p+1][S+1];(p!==0||o>0)&&d.push(x,E,R),(p!==i-1||l<Math.PI)&&d.push(E,D,R)}this.setIndex(d),this.setAttribute("position",new Je(m,3)),this.setAttribute("normal",new Je(_,3)),this.setAttribute("uv",new Je(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Ys=class n extends Et{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);let o=[],a=[],l=[],c=[],u=new N,h=new N,f=new N;for(let d=0;d<=i;d++)for(let m=0;m<=s;m++){let _=m/s*r,g=d/i*Math.PI*2;h.x=(e+t*Math.cos(g))*Math.cos(_),h.y=(e+t*Math.cos(g))*Math.sin(_),h.z=t*Math.sin(g),a.push(h.x,h.y,h.z),u.x=e*Math.cos(_),u.y=e*Math.sin(_),f.subVectors(h,u).normalize(),l.push(f.x,f.y,f.z),c.push(m/s),c.push(d/i)}for(let d=1;d<=i;d++)for(let m=1;m<=s;m++){let _=(s+1)*d+m-1,g=(s+1)*(d-1)+m-1,p=(s+1)*(d-1)+m,S=(s+1)*d+m;o.push(_,g,S),o.push(g,p,S)}this.setIndex(o),this.setAttribute("position",new Je(a,3)),this.setAttribute("normal",new Je(l,3)),this.setAttribute("uv",new Je(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var li=class n extends Et{constructor(e=new xa(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),t=64,i=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:s,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new N,l=new N,c=new le,u=new N,h=[],f=[],d=[],m=[];_(),this.setIndex(m),this.setAttribute("position",new Je(h,3)),this.setAttribute("normal",new Je(f,3)),this.setAttribute("uv",new Je(d,2));function _(){for(let x=0;x<t;x++)g(x);g(r===!1?t:0),S(),p()}function g(x){u=e.getPointAt(x/t,u);let E=o.normals[x],D=o.binormals[x];for(let R=0;R<=s;R++){let O=R/s*Math.PI*2,U=Math.sin(O),T=-Math.cos(O);l.x=T*E.x+U*D.x,l.y=T*E.y+U*D.y,l.z=T*E.z+U*D.z,l.normalize(),f.push(l.x,l.y,l.z),a.x=u.x+i*l.x,a.y=u.y+i*l.y,a.z=u.z+i*l.z,h.push(a.x,a.y,a.z)}}function p(){for(let x=1;x<=t;x++)for(let E=1;E<=s;E++){let D=(s+1)*(x-1)+(E-1),R=(s+1)*x+(E-1),O=(s+1)*x+E,U=(s+1)*(x-1)+E;m.push(D,R,U),m.push(R,O,U)}}function S(){for(let x=0;x<=t;x++)for(let E=0;E<=s;E++)c.x=x/t,c.y=E/s,d.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new n(new Sa[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var Ve=class extends Ri{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new ke(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=np,this.normalScale=new le(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Nn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Ks=class extends Ve{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new le(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ut(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ke(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ke(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ke(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};function Ko(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function RS(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var Zs=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break e}o=i,i=0;break t}break n}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Hu=class extends Zs{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Od,endingEnd:Od}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ud:r=e,a=2*t-i;break;case Ld:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Ud:o=e,l=2*i-t;break;case Ld:o=1,l=i+s[1]-s[0];break;default:o=e-1,l=t}let c=(i-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,d=this._weightNext,m=(i-t)/(s-t),_=m*m,g=_*m,p=-f*g+2*f*_-f*m,S=(1+f)*g+(-1.5-2*f)*_+(-.5+f)*m+1,x=(-1-d)*g+(1.5+d)*_+.5*m,E=d*g-d*_;for(let D=0;D!==a;++D)r[D]=p*o[u+D]+S*o[c+D]+x*o[l+D]+E*o[h+D];return r}},Fu=class extends Zs{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(i-t)/(s-t),h=1-u;for(let f=0;f!==a;++f)r[f]=o[c+f]*h+o[l+f]*u;return r}},Bu=class extends Zs{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},wn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ko(t,this.TimeBufferType),this.values=Ko(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Ko(e.times,Array),values:Ko(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Bu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Fu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Hu(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case ta:t=this.InterpolantFactoryMethodDiscrete;break;case fu:t=this.InterpolantFactoryMethodLinear;break;case Jc:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ta;case this.InterpolantFactoryMethodLinear:return fu;case this.InterpolantFactoryMethodSmooth:return Jc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){let i=this.times,s=i.length,r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&RS(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Jc,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(s)l=!0;else{let h=a*i,f=h-i,d=h+i;for(let m=0;m!==i;++m){let _=t[h+m];if(_!==t[f+m]||_!==t[d+m]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*i,f=o*i;for(let d=0;d!==i;++d)t[f+d]=t[h+d]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};wn.prototype.TimeBufferType=Float32Array;wn.prototype.ValueBufferType=Float32Array;wn.prototype.DefaultInterpolation=fu;var Qi=class extends wn{constructor(e,t,i){super(e,t,i)}};Qi.prototype.ValueTypeName="bool";Qi.prototype.ValueBufferType=Array;Qi.prototype.DefaultInterpolation=ta;Qi.prototype.InterpolantFactoryMethodLinear=void 0;Qi.prototype.InterpolantFactoryMethodSmooth=void 0;var zu=class extends wn{};zu.prototype.ValueTypeName="color";var Gu=class extends wn{};Gu.prototype.ValueTypeName="number";var Vu=class extends Zs{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(s-t),c=e*a;for(let u=c+a;c!==u;c+=4)zt.slerpFlat(r,0,o,c-a,o,c,l);return r}},wa=class extends wn{InterpolantFactoryMethodLinear(e){return new Vu(this.times,this.values,this.getValueSize(),e)}};wa.prototype.ValueTypeName="quaternion";wa.prototype.InterpolantFactoryMethodSmooth=void 0;var es=class extends wn{constructor(e,t,i){super(e,t,i)}};es.prototype.ValueTypeName="string";es.prototype.ValueBufferType=Array;es.prototype.DefaultInterpolation=ta;es.prototype.InterpolantFactoryMethodLinear=void 0;es.prototype.InterpolantFactoryMethodSmooth=void 0;var Wu=class extends wn{};Wu.prototype.ValueTypeName="vector";var Xu=class{constructor(e,t,i){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=c.length;h<f;h+=2){let d=c[h],m=c[h+1];if(d.global&&(d.lastIndex=0),d.test(u))return m}return null}}},CS=new Xu,$u=class{constructor(e){this.manager=e!==void 0?e:CS,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};$u.DEFAULT_MATERIAL_NAME="__DEFAULT";var Js=class extends Jt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ke(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Ra=class extends Js{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Jt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ke(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},wl=new at,Hf=new N,Ff=new N,Ca=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new le(512,512),this.map=null,this.mapPass=null,this.matrix=new at,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Lr,this._frameExtents=new le(1,1),this._viewportCount=1,this._viewports=[new mt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;Hf.setFromMatrixPosition(e.matrixWorld),t.position.copy(Hf),Ff.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ff),t.updateMatrixWorld(),wl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(wl),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(wl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Bf=new at,Tr=new N,Rl=new N,qu=class extends Ca{constructor(){super(new Zt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new le(4,2),this._viewportCount=6,this._viewports=[new mt(2,1,1,1),new mt(0,1,1,1),new mt(3,1,1,1),new mt(1,1,1,1),new mt(3,0,1,1),new mt(1,0,1,1)],this._cubeDirections=[new N(1,0,0),new N(-1,0,0),new N(0,0,1),new N(0,0,-1),new N(0,1,0),new N(0,-1,0)],this._cubeUps=[new N(0,1,0),new N(0,1,0),new N(0,1,0),new N(0,1,0),new N(0,0,1),new N(0,0,-1)]}updateMatrices(e,t=0){let i=this.camera,s=this.matrix,r=e.distance||i.far;r!==i.far&&(i.far=r,i.updateProjectionMatrix()),Tr.setFromMatrixPosition(e.matrixWorld),i.position.copy(Tr),Rl.copy(i.position),Rl.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(Rl),i.updateMatrixWorld(),s.makeTranslation(-Tr.x,-Tr.y,-Tr.z),Bf.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Bf)}},Ia=class extends Js{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new qu}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Yu=class extends Ca{constructor(){super(new ua(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Pa=class extends Js{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Jt.DEFAULT_UP),this.updateMatrix(),this.target=new Jt,this.shadow=new Yu}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Oa=class extends Js{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var Ua=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=zf(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=zf();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};function zf(){return performance.now()}var lh="\\[\\]\\.:\\/",IS=new RegExp("["+lh+"]","g"),uh="[^"+lh+"]",PS="[^"+lh.replace("\\.","")+"]",OS=/((?:WC+[\/:])*)/.source.replace("WC",uh),US=/(WCOD+)?/.source.replace("WCOD",PS),LS=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",uh),NS=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",uh),DS=new RegExp("^"+OS+US+LS+NS+"$"),kS=["material","materials","bones","map"],Ku=class{constructor(e,t,i){let s=i||Mt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},Mt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(IS,"")}static parseTrackName(e){let t=DS.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);kS.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Mt.Composite=Ku;Mt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Mt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Mt.prototype.GetterByBindingType=[Mt.prototype._getValue_direct,Mt.prototype._getValue_array,Mt.prototype._getValue_arrayElement,Mt.prototype._getValue_toArray];Mt.prototype.SetterByBindingTypeAndVersioning=[[Mt.prototype._setValue_direct,Mt.prototype._setValue_direct_setNeedsUpdate,Mt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_array,Mt.prototype._setValue_array_setNeedsUpdate,Mt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_arrayElement,Mt.prototype._setValue_arrayElement_setNeedsUpdate,Mt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_fromArray,Mt.prototype._setValue_fromArray_setNeedsUpdate,Mt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var mP=new Float32Array(1);var Gf=new at,La=class{constructor(e,t,i=0,s=1/0){this.ray=new Ji(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new Ur,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Gf.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Gf),this}intersectObject(e,t=!0,i=[]){return Zu(e,this,i,t),i.sort(Vf),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)Zu(e[s],this,i,t);return i.sort(Vf),i}};function Vf(n,e){return n.distance-e.distance}function Zu(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let o=0,a=r.length;o<a;o++)Zu(r[o],e,t,!0)}}var Vr=class{constructor(e=1,t=0,i=0){return this.radius=e,this.phi=t,this.theta=i,this}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(Ut(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Na=class extends ni{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");var mp={type:"change"},dh={type:"start"},_p={type:"end"},za=new Ji,gp=new bn,HS=Math.cos(70*Ha.DEG2RAD),Ht=new N,on=2*Math.PI,gt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},hh=1e-6,Ga=class extends Na{constructor(e,t=null){super(e,t),this.state=gt.NONE,this.enabled=!0,this.target=new N,this.cursor=new N,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:ts.ROTATE,MIDDLE:ts.DOLLY,RIGHT:ts.PAN},this.touches={ONE:ns.ROTATE,TWO:ns.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new N,this._lastQuaternion=new zt,this._lastTargetPosition=new N,this._quat=new zt().setFromUnitVectors(e.up,new N(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Vr,this._sphericalDelta=new Vr,this._scale=1,this._panOffset=new N,this._rotateStart=new le,this._rotateEnd=new le,this._rotateDelta=new le,this._panStart=new le,this._panEnd=new le,this._panDelta=new le,this._dollyStart=new le,this._dollyEnd=new le,this._dollyDelta=new le,this._dollyDirection=new N,this._mouse=new le,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=BS.bind(this),this._onPointerDown=FS.bind(this),this._onPointerUp=zS.bind(this),this._onContextMenu=YS.bind(this),this._onMouseWheel=WS.bind(this),this._onKeyDown=XS.bind(this),this._onTouchStart=$S.bind(this),this._onTouchMove=qS.bind(this),this._onMouseDown=GS.bind(this),this._onMouseMove=VS.bind(this),this._interceptControlDown=KS.bind(this),this._interceptControlUp=ZS.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(mp),this.update(),this.state=gt.NONE}update(e=null){let t=this.object.position;Ht.copy(t).sub(this.target),Ht.applyQuaternion(this._quat),this._spherical.setFromVector3(Ht),this.autoRotate&&this.state===gt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=on:i>Math.PI&&(i-=on),s<-Math.PI?s+=on:s>Math.PI&&(s-=on),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Ht.setFromSpherical(this._spherical),Ht.applyQuaternion(this._quatInverse),t.copy(this.target).add(Ht),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Ht.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new N(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new N(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Ht.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(za.origin.copy(this.object.position),za.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(za.direction))<HS?this.object.lookAt(this.target):(gp.setFromNormalAndCoplanarPoint(this.object.up,this.target),za.intersectPlane(gp,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>hh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>hh||this._lastTargetPosition.distanceToSquared(this.target)>hh?(this.dispatchEvent(mp),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?on/60*this.autoRotateSpeed*e:on/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Ht.setFromMatrixColumn(t,0),Ht.multiplyScalar(-e),this._panOffset.add(Ht)}_panUp(e,t){this.screenSpacePanning===!0?Ht.setFromMatrixColumn(t,1):(Ht.setFromMatrixColumn(t,0),Ht.crossVectors(this.object.up,Ht)),Ht.multiplyScalar(e),this._panOffset.add(Ht)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Ht.copy(s).sub(this.target);let r=Ht.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,o=i.width,a=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(on*this._rotateDelta.x/t.clientHeight),this._rotateUp(on*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(on*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(-on*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(on*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(-on*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(on*this._rotateDelta.x/t.clientHeight),this._rotateUp(on*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new le,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function FS(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n)))}function BS(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function zS(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(_p),this.state=gt.NONE;break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function GS(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case ts.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=gt.DOLLY;break;case ts.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=gt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=gt.ROTATE}break;case ts.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=gt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=gt.PAN}break;default:this.state=gt.NONE}this.state!==gt.NONE&&this.dispatchEvent(dh)}function VS(n){switch(this.state){case gt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case gt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case gt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function WS(n){this.enabled===!1||this.enableZoom===!1||this.state!==gt.NONE||(n.preventDefault(),this.dispatchEvent(dh),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(_p))}function XS(n){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(n)}function $S(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case ns.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=gt.TOUCH_ROTATE;break;case ns.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=gt.TOUCH_PAN;break;default:this.state=gt.NONE}break;case 2:switch(this.touches.TWO){case ns.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=gt.TOUCH_DOLLY_PAN;break;case ns.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=gt.TOUCH_DOLLY_ROTATE;break;default:this.state=gt.NONE}break;default:this.state=gt.NONE}this.state!==gt.NONE&&this.dispatchEvent(dh)}function qS(n){switch(this._trackPointer(n),this.state){case gt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case gt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case gt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case gt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=gt.NONE}}function YS(n){this.enabled!==!1&&n.preventDefault()}function KS(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function ZS(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Rn(n){let e=2166136261;for(let t=0;t<n.length;t++)e^=n.charCodeAt(t),e=Math.imul(e,16777619)>>>0;return e>>>0}function xt(n){let e=n>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}var fn=[{id:"draft",name:"Drafts",rect:{x0:-46,x1:-24,z0:6,z1:28}},{id:"awaiting",name:"Awaiting review",rect:{x0:-22.6,x1:-.6,z0:6,z1:28}},{id:"changes",name:"Changes requested",rect:{x0:.8,x1:22.8,z0:6,z1:28}},{id:"ready",name:"Ready to merge",rect:{x0:24.2,x1:46.2,z0:6,z1:28}},{id:"merged",name:"Merged",rect:{x0:-46,x1:46.2,z0:-34,z1:3}}];function Xr(n){return fn.find(e=>e.id===n)??fn[fn.length-1]}function Ep(n){let{rect:e}=Xr(n);return{x:(e.x0+e.x1)/2,z:(e.z0+e.z1)/2}}var ss=["#e5484d","#f76b15","#ffc53d","#8e4ec6","#0090ff","#12a594","#e93d82","#00a2c7","#3e63dd","#d6409f","#f4f4f4","#8d6e63","#ff8fab","#7dd3fc","#a3e635","#1c1c1c"];function xp(n){let e=[...new Set(n)].sort(),t=new Set,i=new Map;for(let s of e){let r=Rn(s)%ss.length;for(let o=0;o<ss.length&&t.has(r);o++)r=(r+1)%ss.length;t.add(r),i.set(s,ss[r])}return i}var yp=n=>Math.max(0,ss.indexOf(n));var Ii=512,Wa=256,fh=16,rs=32,er=Ii/rs,Va=Math.PI*2,ht={muzzle:0,dark:1,horn:2,white:3,brass:4,udder:5,body:6,face:7,hoof:8,nose:9,tuft:10,hornTip:11,brassDark:12},ph=n=>er+n;function Mp(n){let e=n%er,t=Math.floor(n/er),i=(e+.5)/er,s=Wa+fh+t*rs+rs/2;return[i,1-s/Ii]}var mh=1-Wa/Ii;function Sp(n,e,t,i){let s=[],r=6+Math.floor(n()*5);for(let o=0;o<r;o++)s.push({x:e+(n()-.5)*i*.9,y:t+(n()-.5)*i*.55,rx:i*(.28+n()*.34),ry:i*(.2+n()*.3),rot:n()*Math.PI});return s}function Tp(n,e,t,i){n.fillStyle=e;for(let s of t)n.beginPath(),n.ellipse(s.x+i,s.y,s.rx,s.ry,s.rot,0,Va),n.fill()}function JS(n,e,t){let i=Ii,s=Wa;n.fillStyle=e.body,n.fillRect(0,0,i,s+fh);let r=e.patch??e.body,o=c=>{for(let u of[-i,0,i])c(u)};if(e.pattern==="patches"){let c=6+Math.floor(t()*5);for(let u=0;u<c;u++){let h=Sp(t,t()*i,t()*s,55+t()*80);o(f=>Tp(n,r,h,f))}}else if(e.pattern==="belt"){let c=s*.36,u=s*.6,h=n.createLinearGradient(0,c-10,0,u+10);h.addColorStop(0,"rgba(0,0,0,0)"),h.addColorStop(.08,r),h.addColorStop(.92,r),h.addColorStop(1,"rgba(0,0,0,0)"),n.fillStyle=h,n.fillRect(0,c-10,i,u-c+20)}else if(e.pattern==="backstripe")n.fillStyle=r,n.fillRect(i*.43,0,i*.14,s),n.fillRect(0,0,i*.05,s),n.fillRect(i*.95,0,i*.05,s);else if(e.pattern==="roan"){for(let c=0;c<520;c++){n.globalAlpha=.45+t()*.55,n.fillStyle=r;let u=t()*i,h=t()*s,f=1.5+t()*5;o(d=>{n.beginPath(),n.arc(u+d,h,f,0,Va),n.fill()})}n.globalAlpha=1}else if(e.pattern==="nguni"){let c=3+Math.floor(t()*3),u=[];for(let h=0;h<c;h++){let f=t()*i,d=t()*s;u.push([f,d]);let m=Sp(t,f,d,70+t()*90);o(_=>Tp(n,r,m,_))}for(let h=0;h<900;h++){let[f,d]=u[Math.floor(t()*u.length)],m=t()<.65,_=m?f+(t()-.5)*220:t()*i,g=m?d+(t()-.5)*140:t()*s,p=1.5+t()*(m?9:4);n.globalAlpha=.7+t()*.3,n.fillStyle=r,o(S=>{n.beginPath(),n.ellipse(_+S,g,p,p*(.6+t()*.6),t()*Math.PI,0,Va),n.fill()})}n.globalAlpha=1}else if(e.pattern==="whiteface")for(let[c,u]of[[0,i*.07],[i*.93,i*.07]]){let h=n.createLinearGradient(c,0,c+u,0);h.addColorStop(0,c===0?r:"rgba(0,0,0,0)"),h.addColorStop(1,c===0?"rgba(0,0,0,0)":r),n.fillStyle=h,n.fillRect(c,0,u,s)}n.globalAlpha=e.shaggy?.14:.07;let a=e.shaggy?3200:1800;for(let c=0;c<a;c++)n.fillStyle=t()>.5?"#000000":"#ffffff",n.fillRect(t()*i,t()*s,e.shaggy?2:1,3+t()*(e.shaggy?10:5));n.globalAlpha=1;let l=n.createLinearGradient(0,0,i,0);l.addColorStop(0,"rgba(0,0,0,0.32)"),l.addColorStop(.2,"rgba(0,0,0,0.06)"),l.addColorStop(.5,"rgba(255,255,255,0.05)"),l.addColorStop(.8,"rgba(0,0,0,0.06)"),l.addColorStop(1,"rgba(0,0,0,0.32)"),n.fillStyle=l,n.fillRect(0,0,i,s)}function an(n,e,t){let i=e%er,s=Math.floor(e/er);n.fillStyle=t,n.fillRect(i*rs,Wa+fh+s*rs,rs,rs)}function jS(n,e){let t=new ke(n);return t.multiplyScalar(1-e),`#${t.getHexString()}`}function QS(n){let e=document.createElement("canvas");e.width=Ii,e.height=Ii;let t=e.getContext("2d");t.fillStyle=n.body,t.fillRect(0,0,Ii,Ii),JS(t,n,xt(Rn(n.id)));let i=new ke(n.body).getHSL({h:0,s:0,l:0}).l>.5;an(t,ht.muzzle,n.muzzle),an(t,ht.dark,"#1d1917"),an(t,ht.horn,i?"#d9ccb4":"#e6dac3"),an(t,ht.white,"#ffffff"),an(t,ht.brass,"#d4a63a"),an(t,ht.udder,"#efb8ae"),an(t,ht.body,n.body),an(t,ht.face,n.pattern==="whiteface"?n.patch??n.body:n.body),an(t,ht.hoof,"#2a221f"),an(t,ht.nose,jS(n.muzzle,.45)),an(t,ht.tuft,i?"#3a312c":"#15120f"),an(t,ht.hornTip,"#3d342c"),an(t,ht.brassDark,"#8a6a1f"),ss.forEach((r,o)=>an(t,ph(o),r));let s=new ci(e);return s.colorSpace=Pt,s.wrapS=Ws,s.wrapT=Jn,s.anisotropy=4,s}var vp=new Map;function bp(n){let e=vp.get(n.id);return e||(e=QS(n),vp.set(n.id,e)),e}function Ap(){let n=document.createElement("canvas");n.width=1024,n.height=1024;let e=n.getContext("2d"),t=xt(7);e.fillStyle="#5fae4a",e.fillRect(0,0,1024,1024);let i=["#56a443","#6ab854","#4f9c3f","#73bf5a","#62ab4b","#7cc463"];for(let r=0;r<700;r++)e.fillStyle=i[Math.floor(t()*i.length)],e.globalAlpha=.25+t()*.35,e.beginPath(),e.ellipse(t()*1024,t()*1024,18+t()*70,10+t()*40,t()*Math.PI,0,Va),e.fill();e.globalAlpha=.22;for(let r=0;r<9e3;r++)e.fillStyle=t()>.5?"#3f8a33":"#9ad77c",e.fillRect(t()*1024,t()*1024,2,3+t()*5);e.globalAlpha=1;let s=new ci(n);return s.colorSpace=Pt,s.wrapS=s.wrapT=Ws,s.repeat.set(7,7),s.anisotropy=8,s}function $r(n){let e=n.canvas.getContext("2d"),{width:t,height:i}=n.canvas;e.fillStyle="#c9a26b",e.fillRect(0,0,t,i);let s=xt(Rn(n.name));e.strokeStyle="rgba(120, 80, 40, 0.18)",e.lineWidth=2;for(let r=0;r<26;r++){let o=s()*i;e.beginPath(),e.moveTo(0,o),e.bezierCurveTo(t*.3,o+(s()-.5)*18,t*.7,o+(s()-.5)*18,t,o+(s()-.5)*10),e.stroke()}e.strokeStyle="#8a6238",e.lineWidth=14,e.strokeRect(7,7,t-14,i-14),e.fillStyle="#3b2a1a",e.textAlign="center",e.textBaseline="middle",e.font="bold 58px 'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif",e.fillText(n.name,t/2,i*.38,t-60),e.font="600 40px 'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif",e.fillText(`${n.count} cow${n.count===1?"":"s"}`,t/2,i*.74),n.texture.needsUpdate=!0}function Rp(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),r={},o={},a=n[0].morphTargetsRelative,l=new Et,c=0;for(let u=0;u<n.length;++u){let h=n[u],f=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let d in h.attributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(h.attributes[d]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let d in h.morphAttributes){if(!s.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[d]===void 0&&(o[d]=[]),o[d].push(h.morphAttributes[d])}if(e){let d;if(t)d=h.index.count;else if(h.attributes.position!==void 0)d=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,u),c+=d}}if(t){let u=0,h=[];for(let f=0;f<n.length;++f){let d=n[f].index;for(let m=0;m<d.count;++m)h.push(d.getX(m)+u);u+=n[f].attributes.position.count}l.setIndex(h)}for(let u in r){let h=wp(r[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let f=0;f<h;++f){let d=[];for(let _=0;_<o[u].length;++_)d.push(o[u][_][f]);let m=wp(d);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(m)}}return l}function wp(n){let e,t,i,s=-1,r=0;for(let c=0;c<n.length;++c){let u=n[c];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=u.normalized),i!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=u.count*t}let o=new e(r),a=new Ct(o,t,i),l=0;for(let c=0;c<n.length;++c){let u=n[c];if(u.isInterleavedBufferAttribute){let h=l/t;for(let f=0,d=u.count;f<d;f++)for(let m=0;m<t;m++){let _=u.getComponent(f,m);a.setComponent(f+h,m,_)}}else o.set(u.array,l);l+=u.count*t}return s!==void 0&&(a.gpuType=s),a}var qr=1.7,Ip=.6,gh=.93,Cn=gh+Ip*.78,$a=n=>(Cn+Ip*.9)*n,Pp=n=>(Cn+1.05)*n;function Gt(n,e){let[t,i]=Mp(e),s=n.attributes.uv;for(let r=0;r<s.count;r++)s.setXY(r,t,i);return n}function tr(n,e,t=1,i=0){let s=n.attributes.uv;for(let r=0;r<s.count;r++){let o=Math.min(1,Math.max(0,s.getY(r)*t+i));s.setXY(r,s.getX(r)+e,mh+o*(1-mh))}return n}function Op(n,e){let t=new zt().setFromUnitVectors(new N(0,1,0),e.clone().normalize());return n.applyQuaternion(t)}function Cp(n){let t=[[0,0],[.3,.015],[.47,.07],[.55,.17],[.585,.32],[.6,.5],[.595,.66],[.565,.8],[.49,.92],[.32,.98],[0,1]].map(([r,o])=>new le(r,o*qr)),i=new Hr(t,30);i.rotateX(Math.PI/2),i.translate(0,0,-qr/2);let s=i.attributes.position;for(let r=0;r<s.count;r++){let o=s.getY(r),a=s.getZ(r),l=o>0?o*.86:o*1.08;o<0&&a>.2&&(l-=(a-.2)*.06),s.setY(r,l)}return i.computeVertexNormals(),i.translate(0,Cn,0),tr(i,n)}function _h(){let n=new N(0,Cn+.16,qr/2-.14),e=new N(0,Cn+.5,qr/2+.36),t=e.clone().sub(n),i=t.length();return{base:n,tip:e,direction:t.normalize(),length:i}}function eT(n){let{base:e,direction:t,length:i}=_h(),s=new et(.21,.34,i+.2,16,1,!1);return s.translate(0,(i+.2)/2-.1,0),Op(s,t),s.translate(e.x,e.y,e.z),tr(s,n,.35,.6)}function tT(n){let{base:e,direction:t,length:i}=_h(),s=new et(.33,.345,.15,22,1,!0);Op(s,t);let r=e.clone().addScaledVector(t,i*.5);s.translate(r.x,r.y,r.z),Gt(s,ph(n));let o=new et(.062,.095,.15,4,1,!1);o.rotateY(Math.PI/4),o.translate(0,r.y-.42,r.z+.12),Gt(o,ht.brass);let a=new Ys(.032,.011,6,12);a.translate(0,r.y-.33,r.z+.12),Gt(a,ht.brassDark);let l=new Re(.02,6,5);return l.translate(0,r.y-.51,r.z+.12),Gt(l,ht.brassDark),[s,o,a,l]}function nT(n){let e=new Re(.34,16,12);return e.scale(.95,.85,1.3),e.translate(0,Cn+.4,.42),tr(e,n)}function iT(n){let e=new Re(.16,12,8);return e.scale(.75,1.5,1.6),e.translate(0,Cn-.42,.72),tr(e,n)}function sT(){let n=new Re(.27,14,10);n.scale(1.1,.7,1.05),n.translate(0,Cn-.56,-.42),Gt(n,ht.udder);let e=[-.1,.1].map(t=>{let i=new Xt(.028,.08,4,8);return i.translate(t,Cn-.76,-.42),Gt(i,ht.udder)});return[n,...e]}var rT={short:{points:[[.2,.32,-.02],[.36,.4,.03],[.47,.52,.16],[.5,.66,.3]],base:.075,tip:.022},long:{points:[[.2,.32,-.02],[.5,.45,.02],[.78,.7,.12],[.9,1.05,.3]],base:.08,tip:.02},huge:{points:[[.2,.3,-.02],[.7,.4,.02],[1.35,.5,.12],[1.85,.72,.36]],base:.09,tip:.022},lyre:{points:[[.2,.32,-.02],[.55,.65,0],[.85,1.25,.08],[.95,1.85,.25]],base:.16,tip:.04}};function oT(n,e){let t=rT[n],i=new kn(t.points.map(([u,h,f])=>new N(u*e,h,f))),s=16,r=9,o=new li(i,s,t.base,r,!1),a=o.attributes.position;for(let u=0;u<=s;u++){let h=u/s,f=i.getPointAt(h),d=(t.base+(t.tip-t.base)*Math.pow(h,.85))/t.base;for(let m=0;m<=r;m++){let _=u*(r+1)+m;a.setXYZ(_,f.x+(a.getX(_)-f.x)*d,f.y+(a.getY(_)-f.y)*d,f.z+(a.getZ(_)-f.z)*d)}}o.computeVertexNormals(),Gt(o,ht.horn);let l=i.getPointAt(1),c=new Re(t.tip*1.05,8,6);return c.translate(l.x,l.y,l.z),Gt(c,ht.hornTip),[o,c]}function aT(n,e){let t=[],i=n.pattern==="patches"||n.pattern==="roan"||n.pattern==="solid"||n.pattern==="nguni",s=a=>n.pattern==="whiteface"?Gt(a,ht.face):i?tr(a,e+.37,.5,.25):Gt(a,ht.body),r=new Re(.3,22,16);r.scale(1.2,1.05,1.55),r.translate(0,.06,.12),t.push(s(r));let o=new Xt(.19,.24,6,16);o.rotateX(Math.PI/2),o.translate(0,-.08,.5),t.push(Gt(o,ht.muzzle));for(let a of[-1,1]){let l=new Re(.032,8,6);l.scale(1,.8,1),l.translate(a*.085,-.06,.735),t.push(Gt(l,ht.nose));let c=new Re(.078,12,10);c.translate(a*.31,.1,.22),t.push(Gt(c,ht.dark));let u=new Re(.024,8,6);u.translate(a*.35,.135,.265),t.push(Gt(u,ht.white));let h=new Re(.16,12,8);n.ears==="droop"?(h.scale(1.6,.3,.7),h.translate(a*.2,0,0),h.rotateZ(a*-1.1),h.translate(a*.3,.16,-.05)):(h.scale(1.35,.32,.75),h.translate(a*.14,0,0),h.rotateZ(a*.45),h.translate(a*.3,.2,-.05)),t.push(s(h)),n.horns!=="none"&&t.push(...oT(n.horns,a))}if(n.shaggy){let a=new Re(.2,14,10);a.scale(1.5,.55,1.05),a.translate(0,.3,.2),t.push(s(a))}return t}function cT(n,e){let t=n.pattern==="belt"||n.pattern==="backstripe",i=l=>t?Gt(l,ht.body):tr(l,e+.12,.3,.1),s=new et(.115,.095,.47,12);s.translate(0,-.235,0);let r=new Re(.1,10,8);r.translate(0,-.47,0);let o=new et(.09,.075,.38,12);o.translate(0,-.66,.012);let a=new et(.095,.11,.1,12);return a.translate(0,-gh+.05,.012),[i(s),i(r),i(o),Gt(a,ht.hoof)]}function lT(){let n=new kn([new N(0,0,0),new N(0,-.22,-.1),new N(0,-.5,-.1),new N(0,-.72,-.03)]),e=new li(n,10,.036,7,!1);Gt(e,ht.body);let t=new Re(.078,10,8);return t.scale(1,1.5,1),t.translate(0,-.8,-.02),Gt(t,ht.tuft),[e,t]}function Xa(n){let e=Rp(n,!1);for(let t of n)t.dispose();if(!e)throw new Error("could not merge cow parts");return e}function Up(n){let e=n.breed,i=xt(n.seed)(),s=new Ve({map:bp(e),roughness:.92,metalness:0}),r=new Oe,o=new Oe;o.scale.setScalar(e.size),r.add(o);let a=[],l=(m,_)=>{let g=new Z(m,s);return g.castShadow=_,g.userData.cowID=n.id,a.push(g),g},c=[Cp(i),eT(i),...tT(n.collar)];if(e.shaggy){let m=Cp(i+.5);m.scale(1.05,1.05,1.01),m.translate(0,-Cn*.05,0),c.push(m)}e.hump&&c.push(nT(i),iT(i)),e.dairy&&c.push(...sT()),o.add(l(Xa(c),!0));let{tip:u}=_h(),h=new Oe;h.position.copy(u),h.add(l(Xa(aT(e,i)),!0)),o.add(h);let f=[];for(let[m,_]of[[-.26,.52],[.26,.52],[-.27,-.56],[.27,-.56]]){let g=new Oe;g.position.set(m,gh,_),g.add(l(Xa(cT(e,i)),!1)),o.add(g),f.push(g)}let d=new Oe;return d.position.set(0,Cn+.3,-qr/2-.02),d.add(l(Xa(lT()),!1)),o.add(d),{group:r,rig:o,head:h,headRest:u.clone(),legs:f,tail:d,meshes:a,materials:[s]}}function Eh(n){for(let e of n.meshes)e.geometry.dispose();for(let e of n.materials)e.dispose()}var uT="wolf:",hT=n=>`${uT}${n.id}`;function Lp(n){return{id:hT(n),name:"Wolf",kind:"wolf",blurb:n.name,body:"#5d6166",patch:"#a8abae",eyes:"#e8c34a",size:.9,ears:"point",legs:"regular",speed:6}}var Yr="kobi",Np=[{id:Yr,name:"Kobi",kind:"farmer",blurb:"The farmer. Walks the fences. Do not click.",body:"#1c1c1c",eyes:"#1d1917",size:1,ears:"up",legs:"regular",speed:1.6},{id:"moon",name:"Moon",kind:"dog",blurb:"Kobi's queen. Blue coat, blue eyes, does NOT want to go on a walk.",body:"#5b5652",eyes:"#a9bcc8",size:.9,ears:"floppy",legs:"regular",speed:3.4,follows:Yr},{id:"bean",name:"Bean",kind:"dog",blurb:"Best dog in the office. Sits like a person. Famous for the bean lean.",body:"#e6d7bd",patch:"#f7f2ea",eyes:"#4a2e1c",size:.76,ears:"up",legs:"regular",speed:3,follows:Yr},{id:"waffles",name:"Waffles",kind:"dog",blurb:"Mallory's prince. Cocker spaniel, 21 pounds, every photo a renaissance painting.",body:"#e2cba0",patch:"#efe0c2",eyes:"#2b1d14",size:.52,ears:"long",legs:"regular",speed:3.6,fluffy:!0},{id:"felix",name:"Felix",kind:"cat",blurb:"Office cat, north corner. Profoundly masculine.",body:"#141414",eyes:"#7bd389",size:.58,ears:"point",legs:"regular",speed:2.8},{id:"haru",name:"Haru",kind:"cat",blurb:"Office cat, south corner. It's her desk now.",body:"#181818",eyes:"#f0c419",size:.52,ears:"point",legs:"regular",speed:3.2}],qa={id:"john-pork",name:"John Pork",kind:"pig",blurb:"John Pork is calling. Do not answer.",body:"#f2b7b0",eyes:"#1d1917",size:1,ears:"up",legs:"regular",speed:0};var Ya=["Get back to work.","Those PRs won't review themselves.","I'm not paying you to click on me.","Cows to move. Comments to resolve. Chop chop.","Ship it. Then we'll talk.","You've got three unresolved threads and you're poking a farmer?","Queues are lookin' healthy. Your PR isn't."];var Ka=5,Pi=(()=>{let n=Math.min(...fn.map(o=>o.rect.x0))-Ka,e=Math.max(...fn.map(o=>o.rect.x1))+Ka,t=Math.min(...fn.map(o=>o.rect.z0))-Ka,i=Math.max(...fn.map(o=>o.rect.z1))+Ka,s=e-n,r=i-t;return{x0:n,x1:e,z0:t,z1:i,width:s,depth:r,length:2*(s+r)}})(),Fn=n=>(n%Pi.length+Pi.length)%Pi.length;function Za(n,e=0){let{x0:t,x1:i,z0:s,z1:r,width:o,depth:a}=Pi,l=Fn(n);return l<o?{x:t+l,z:r+e,heading:Math.atan2(1,0),side:"front"}:(l-=o,l<a?{x:i+e,z:r-l,heading:Math.atan2(0,-1),side:"right"}:(l-=a,l<o?{x:i-l,z:s-e,heading:Math.atan2(-1,0),side:"back"}:(l-=o,{x:t-e,z:s+l,heading:Math.atan2(0,1),side:"left"})))}function Dp(n){switch(n){case"front":return Math.atan2(0,-1);case"right":return Math.atan2(-1,0);case"back":return Math.atan2(0,1);default:return Math.atan2(1,0)}}var nr=Math.PI*2,At=(n,e=.9)=>new Ve({color:n,roughness:e,metalness:0}),kp=(n,e)=>Fn(e-n+Pi.length/2)-Pi.length/2;function os(n,e,t){let i=(e-n+Math.PI)%nr-Math.PI;return i<-Math.PI&&(i+=nr),n+i*Math.min(1,t)}function ui(n){return n.castShadow=!0,n}function dT(n){let e=new Oe,t=new Oe;t.scale.setScalar(n.size),e.add(t);let i=At(n.body),s=At(n.patch??n.body),r=At("#1d1917",.7),o=n.legs==="short"?.42:.72,a=o+.34,l=ui(new Z(new Xt(.42,n.legs==="short"?1.25:1.05,6,14),i));if(l.rotation.x=Math.PI/2,l.position.y=a,n.fluffy&&l.scale.set(1.2,1.2,1),t.add(l),n.fluffy){let p=new Z(new Re(.5,12,10),i);p.scale.set(1.05,.7,1.15),p.position.set(0,a-.28,-.05),t.add(p)}if(n.patch){let p=new Z(new Re(.3,12,10),s);p.scale.set(1,.85,.6),p.position.set(0,a-.14,.62),t.add(p)}let c=new Oe;c.position.set(0,a+.36,.82),t.add(c);let u=ui(new Z(new Re(.38,16,12),i));if(n.fluffy&&u.scale.set(1.15,1.15,1.05),c.add(u),n.fluffy){let p=new Z(new Re(.24,10,8),i);p.scale.set(1.1,.7,1),p.position.set(0,.32,-.02),c.add(p)}let h=new Z(new ct(.34,.26,.36),n.patch?s:i);h.position.set(0,-.1,.38),c.add(h);let f=new Z(new Re(.075,8,6),r);f.position.set(0,-.03,.57),c.add(f);for(let p of[-1,1]){let S=new Z(new Re(.07,8,6),At(n.eyes,.4));S.position.set(p*.16,.1,.3),c.add(S);let x=new Z(new Re(.19,10,8),i);n.ears==="long"?(x.scale.set(.75,1.7,.55),x.position.set(p*.4,-.12,-.04),x.rotation.z=p*.18):n.ears==="floppy"?(x.scale.set(.55,1,.35),x.position.set(p*.36,-.02,-.02),x.rotation.z=p*.35):(x.scale.set(.5,.95,.35),x.position.set(p*.26,.4,-.06),x.rotation.z=p*-.45,x.rotation.x=-.35),c.add(x)}let d=[];for(let[p,S]of[[-.2,.4],[.2,.4],[-.2,-.42],[.2,-.42]]){let x=new Oe;x.position.set(p,o,S);let E=new Z(new et(.09,.08,o,8),i);E.position.y=-o/2,x.add(E);let D=new Z(new Re(.1,8,6),n.patch?s:i);D.position.set(0,-o+.04,.04),x.add(D),t.add(x),d.push(x)}let m=new Oe;m.position.set(0,a+.22,-.62);let _=n.fluffy?.3:.6,g=new Z(new et(.04,.06,_,6),i);return g.position.set(0,_*.36,-_*.27),g.rotation.x=-.75,m.add(g),t.add(m),{group:e,rig:t,head:c,legs:d,arms:[],tail:m,brows:[],top:a+.95}}function fT(n){let e=new Oe,t=new Oe;t.scale.setScalar(n.size),e.add(t);let i=At(n.body,.85),s=At("#d98a8a"),r=.55,o=r+.3,a=ui(new Z(new Xt(.34,1.05,6,14),i));a.rotation.x=Math.PI/2,a.position.y=o,t.add(a);let l=new Oe;l.position.set(0,o+.3,.74),t.add(l),l.add(ui(new Z(new Re(.34,16,12),i)));let c=new Z(new Re(.16,10,8),i);c.scale.set(1.2,.7,.8),c.position.set(0,-.1,.26),l.add(c);let u=new Z(new Re(.04,6,5),s);u.position.set(0,-.05,.38),l.add(u);for(let m of[-1,1]){let _=new Z(new Re(.075,10,8),At(n.eyes,.3));_.position.set(m*.14,.07,.27),l.add(_);let g=new Z(new Re(.03,6,5),At("#111111",.3));g.scale.set(.5,1.4,1),g.position.set(m*.14,.07,.335),l.add(g);let p=new Z(new en(.13,.3,4),i);p.position.set(m*.19,.36,-.02),p.rotation.z=m*-.35,p.rotation.y=Math.PI/4,l.add(p)}let h=[];for(let[m,_]of[[-.16,.36],[.16,.36],[-.16,-.38],[.16,-.38]]){let g=new Oe;g.position.set(m,r,_);let p=new Z(new et(.07,.06,r,8),i);p.position.y=-r/2,g.add(p),t.add(g),h.push(g)}let f=new Oe;f.position.set(0,o+.12,-.55);let d=new kn([new N(0,0,0),new N(0,.3,-.35),new N(0,.75,-.45),new N(0,1,-.25)]);return f.add(new Z(new li(d,10,.045,6,!1),i)),t.add(f),{group:e,rig:t,head:l,legs:h,arms:[],tail:f,brows:[],top:o+.9}}function pT(n){let e=new Oe,t=new Oe;t.scale.setScalar(n.size),e.add(t);let i=At(n.body,.95),s=At(n.patch??n.body,.95),r=At("#141414",.6),o=.82,a=o+.36,l=ui(new Z(new Xt(.38,1.35,6,14),i));l.rotation.x=Math.PI/2,l.position.y=a,t.add(l);let c=new Z(new Xt(.26,1,4,10),s);c.rotation.x=Math.PI/2,c.position.set(0,a-.2,.05),t.add(c);let u=new Z(new Re(.44,12,10),i);u.scale.set(1.05,.95,.8),u.position.set(0,a+.08,.62),t.add(u);let h=new Oe;h.position.set(0,a+.34,1),t.add(h),h.add(ui(new Z(new Re(.33,16,12),i)));let f=new Z(new ct(.24,.2,.5),i);f.position.set(0,-.08,.42),h.add(f);let d=new Z(new ct(.2,.1,.42),s);d.position.set(0,-.17,.38),h.add(d);let m=new Z(new Re(.06,8,6),r);m.position.set(0,-.02,.68),h.add(m);for(let x of[-1,1]){let E=new Z(new Re(.06,8,6),At(n.eyes,.3));E.position.set(x*.15,.1,.25),h.add(E);let D=new Z(new Re(.028,6,5),r);D.position.set(x*.15,.1,.305),h.add(D);let R=new Z(new en(.12,.34,5),i);R.position.set(x*.18,.36,-.06),R.rotation.z=x*-.3,h.add(R)}let _=[];for(let[x,E]of[[-.2,.5],[.2,.5],[-.2,-.52],[.2,-.52]]){let D=new Oe;D.position.set(x,o,E);let R=new Z(new et(.085,.07,o,8),i);R.position.y=-o/2,D.add(R);let O=new Z(new Re(.09,8,6),r);O.position.set(0,-o+.04,.04),D.add(O),t.add(D),_.push(D)}let g=new Oe;g.position.set(0,a+.12,-.75);let p=new Z(new Xt(.1,.55,4,8),i);p.position.set(0,-.28,-.22),p.rotation.x=.7,g.add(p);let S=new Z(new Re(.09,8,6),s);return S.position.set(0,-.55,-.42),g.add(S),t.add(g),{group:e,rig:t,head:h,legs:_,arms:[],tail:g,brows:[],top:a+.95}}function mT(n){let e=new Oe,t=new Oe;e.add(t);let i=At(n.body),s=At("#6b4a2d"),r=At("#111111",.6),o=At("#e8b892"),a=At("#d9b660",1),l=At("#1d1917",.7),c=At("#8a6238",1),u=At("#9aa0a6",.4),h=[];for(let y of[-1,1]){let P=new Oe;P.position.set(y*.17,1.02,0);let H=ui(new Z(new et(.14,.12,1,10),s));H.position.y=-.5,P.add(H);let L=new Z(new ct(.26,.16,.44),r);L.position.set(0,-.96,.08),P.add(L),t.add(P),h.push(P)}let f=ui(new Z(new Xt(.36,.55,6,14),i));f.position.y=1.55,t.add(f);let d=new Z(new Re(.3,12,10),i);d.scale.set(1.1,.6,.8),d.position.set(0,1.98,-.16),t.add(d);let m=[];for(let y of[-1,1]){let P=new Oe;P.position.set(y*.46,1.86,0);let H=new Z(new Xt(.11,.62,4,10),i);H.position.y=-.42,P.add(H);let L=new Z(new Re(.11,8,6),o);if(L.position.y=-.86,P.add(L),y>0){let F=new Oe;F.position.set(.05,-.86,.05);let K=new Z(new et(.03,.03,2.1,6),c);K.position.y=.35,F.add(K);for(let se of[-.11,0,.11]){let Y=new Z(new et(.014,.008,.36,5),u);Y.position.set(se,1.58,0),F.add(Y)}let G=new Z(new ct(.28,.04,.04),u);G.position.y=1.4,F.add(G),P.add(F)}t.add(P),m.push(P)}let _=new Oe;_.position.set(0,2.28,0),t.add(_),_.add(ui(new Z(new Re(.31,16,12),o)));let g=[];for(let y of[-1,1]){let P=new Z(new Re(.045,8,6),l);P.position.set(y*.11,.04,.28),_.add(P);let H=new Z(new ct(.13,.03,.03),l);H.position.set(y*.11,.14,.28),_.add(H),g.push(H)}let p=new Z(new ct(.14,.025,.03),l);p.position.set(0,-.12,.29),_.add(p);let S=new Z(new Ys(.075,.014,6,12,Math.PI),l);S.position.set(0,-.17,.29),S.visible=!1,_.add(S);let x=At("#161616",.8),E=new Z(new Re(.33,16,12,0,nr,0,Math.PI/2),x);E.position.y=.06,_.add(E);let D=new Z(new et(.335,.335,.06,16),x);D.position.y=.06,_.add(D);let R=new Z(new ct(.34,.03,.3),x);R.position.set(0,.05,.4),R.rotation.x=.12,_.add(R);let O=new Z(new ct(.14,.1,.02),At("#d9d4c7",.7));O.position.set(0,.2,.31),_.add(O);let U=new Z(new Re(.12,10,8),l);U.scale.set(1.1,.7,.6),U.position.set(0,-.22,.24),_.add(U);let T=new Z(new Re(.29,14,10,0,nr,Math.PI*.62,Math.PI*.2),At("#3a2f28",.9));return T.position.y=.04,T.scale.set(1.03,1.03,1.03),_.add(T),{group:e,rig:t,head:_,legs:h,arms:m,brows:g,smile:p,frown:S,top:2.85}}function Hp(n){let e=new Oe;n.add(e);let t=new Map,i=-1;function s(c,u){let h=xt(Rn(c.id)),f=c.kind==="dog"?dT(c):c.kind==="cat"?fT(c):c.kind==="wolf"?pT(c):mT(c);f.rig.traverse(_=>{_.userData.critterID=c.id}),e.add(f.group);let d=c.kind==="wolf",m={spec:c,parts:f,s:Fn(Pi.length/6*u+h()*8),dir:h()<.5?1:-1,offset:(d?1.8:.6)+h()*(d?1.6:1.4),offsetTarget:0,speed:c.speed,cruise:c.speed,mode:"go",timer:2+h()*6,phase:h()*nr,gait:h()*nr,heading:0,hop:0,grump:0,gap:0,whim:0,chaseUntil:0,x:0,z:0,rand:h};return m.offsetTarget=m.offset,c.kind==="farmer"&&(m.dir=1),t.set(c.id,m),a(m,0),m.heading=Za(m.s).heading+(m.dir>0?0:Math.PI),f.group.position.set(m.x,0,m.z),f.group.rotation.y=m.heading,m}function r(c){let u=t.get(c);u&&(e.remove(u.parts.group),u.parts.group.traverse(h=>{let f=h;f.geometry&&f.geometry.dispose();let d=f.material;if(d)for(let m of Array.isArray(d)?d:[d])m.dispose()}),t.delete(c))}Np.forEach((c,u)=>s(c,u));let o=0;for(let c of t.values()){if(!c.spec.follows)continue;let u=t.get(c.spec.follows);u&&(c.gap=2.6+o*2.2,o++,c.s=Fn(u.s-u.dir*c.gap),c.dir=u.dir,c.offset=u.offset+.8+o*.5,c.offsetTarget=c.offset)}function a(c,u){let h=Za(c.s,c.offset);return c.x=h.x,c.z=h.z,c.dir>0?h.heading:h.heading+Math.PI}function l(c,u,h,f){let{parts:d,spec:m}=c;if(c.timer-=u,c.hop=Math.max(0,c.hop-u*2.2),c.rand()<u*.3&&(c.offsetTarget=m.kind==="wolf"?1.6+c.rand()*2:.5+c.rand()*(m.kind==="farmer"?1:2.2)),c.offset+=(c.offsetTarget-c.offset)*Math.min(1,u*.8),c.mode==="flee"){c.speed=m.speed*2.6,c.s=Fn(c.s+c.dir*c.speed*u),c.offsetTarget=3.5;let S=a(c,u);c.heading=os(c.heading,S,u*6),c.gait+=u*16;let x=Math.sin(c.gait)*.8;d.legs[0].rotation.x=x,d.legs[3].rotation.x=x,d.legs[1].rotation.x=-x,d.legs[2].rotation.x=-x,d.rig.position.y=Math.abs(Math.sin(c.gait))*.14,d.tail&&(d.tail.rotation.x=.9);let E=Math.max(0,Math.min(1,c.timer/1.2));d.rig.scale.setScalar(m.size*(.4+.6*E)),d.group.position.set(c.x,0,c.z),d.group.rotation.y=c.heading,c.timer<=0&&r(m.id);return}let _=c.chasing?t.get(c.chasing):void 0;if(c.chasing&&(!_||h>c.chaseUntil)&&(c.chasing=void 0,c.mode="go",c.timer=1),_&&c.chasing){c.mode="chase";let S=kp(c.s,_.s);c.speed=m.speed*2.6,c.dir=S>=0?1:-1,c.s=Fn(c.s+c.dir*Math.min(Math.abs(S)-1.5>0?c.speed*u:0,Math.abs(S))),c.offset+=(_.offset-c.offset)*Math.min(1,u*2);let x=a(c,u);c.heading=os(c.heading,x,u*6),c.gait+=u*14;let E=Math.sin(c.gait)*.75;d.legs[0].rotation.x=E,d.legs[3].rotation.x=E,d.legs[1].rotation.x=-E,d.legs[2].rotation.x=-E,d.rig.position.y=Math.abs(Math.sin(c.gait))*.12,d.head.rotation.x=Math.sin(h*12)*.12,d.tail&&(d.tail.rotation.y=Math.sin(h*22)*.5),d.group.position.set(c.x,0,c.z),d.group.rotation.y=c.heading;return}let g=m.follows?t.get(m.follows):void 0;if(g&&c.mode!=="grumpy"){c.timer<=0&&(c.whim=c.rand()<.3?-(2+c.rand()*4):(c.rand()-.5)*2,c.timer=2+c.rand()*5);let S=Fn(g.s-g.dir*(c.gap+c.whim)),x=kp(c.s,S),E=Math.abs(x),D=g.mode!=="go";if(E>(D?.6:.35)){c.mode="go";let R=Math.min(m.speed*2.4,.9+E*1.4);c.speed+=(R-c.speed)*Math.min(1,u*3);let O=Math.sign(x)*Math.min(E,c.speed*u);c.s=Fn(c.s+O),c.dir=x>=0?1:-1;let U=a(c,u);c.heading=os(c.heading,U,u*5),c.gait+=u*(4+c.speed*2.2);let T=Math.sin(c.gait)*.6;d.legs[0].rotation.x=T,d.legs[3].rotation.x=T,d.legs[1].rotation.x=-T,d.legs[2].rotation.x=-T,d.rig.position.y=Math.abs(Math.sin(c.gait))*(.05+c.speed*.02),d.head.rotation.x=Math.sin(c.gait)*.08,d.head.rotation.y=Math.sin(h*1.3+c.phase)*.2}else{c.mode="rest",c.speed=0,a(c,u);let R=Math.atan2(g.x-c.x,g.z-c.z);c.heading=os(c.heading,R,u*3);for(let O of d.legs)O.rotation.x*=1-Math.min(1,u*6);d.rig.position.y+=(0-d.rig.position.y)*Math.min(1,u*6),d.rig.rotation.z=m.id==="bean"?Math.sin(h*.6+c.phase)*.12:0,d.head.rotation.x+=(-.1-d.head.rotation.x)*Math.min(1,u*3),d.head.rotation.y=Math.sin(h*.9+c.phase)*.4}}else if(c.mode==="go"){c.speed+=(c.cruise-c.speed)*Math.min(1,u*1.5),c.s=Fn(c.s+c.dir*c.speed*u);let S=a(c,u);c.heading=os(c.heading,S,u*4),c.gait+=u*(m.kind==="farmer"?5.5:4+c.speed*2.2);let x=Math.sin(c.gait)*(m.kind==="farmer"?.45:.6);if(m.kind==="farmer")d.legs[0].rotation.x=x,d.legs[1].rotation.x=-x,d.arms[0].rotation.x=-x*.6,d.arms[1].rotation.x=x*.25,d.rig.position.y=Math.abs(Math.sin(c.gait))*.03,d.head.rotation.y=Math.sin(h*.8+c.phase)*.25;else{d.legs[0].rotation.x=x,d.legs[3].rotation.x=x,d.legs[1].rotation.x=-x,d.legs[2].rotation.x=-x;let E=m.kind==="dog"?.06+c.speed*.02:.03;d.rig.position.y=Math.abs(Math.sin(c.gait))*E,d.head.rotation.x=Math.sin(c.gait)*.08,d.head.rotation.y=Math.sin(h*1.3+c.phase)*.2}if(c.timer<=0){let E=c.rand();m.kind==="farmer"?(c.mode="inspect",c.timer=3+c.rand()*4):E<.35?(c.mode="rest",c.timer=1.5+c.rand()*4):E<.6?(c.cruise=m.speed*(1.8+c.rand()),c.timer=1.5+c.rand()*2):E<.75?(c.dir=c.dir>0?-1:1,c.cruise=m.speed,c.timer=2+c.rand()*5):(c.cruise=m.speed*(.6+c.rand()*.6),c.timer=3+c.rand()*6)}}else{c.speed=0;for(let S of d.legs)S.rotation.x*=1-Math.min(1,u*6);for(let S of d.arms)S.rotation.x*=1-Math.min(1,u*6);if(d.rig.position.y+=(0-d.rig.position.y)*Math.min(1,u*6),c.mode==="inspect"){let S=Za(c.s).side;c.heading=os(c.heading,Dp(S),u*3),d.head.rotation.y=Math.sin(h*.9+c.phase)*.5}else if(c.mode==="grumpy"){let S=Math.atan2(f.position.x-c.x,f.position.z-c.z);c.heading=os(c.heading,S,u*5),d.head.rotation.y=0,d.head.rotation.x=-.08}else m.kind==="wolf"?(d.head.rotation.x+=(-.85-d.head.rotation.x)*Math.min(1,u*4),d.head.rotation.y=0):(d.head.rotation.x+=(m.kind==="cat"?.15:-.1-d.head.rotation.x)*Math.min(1,u*3),d.head.rotation.y=Math.sin(h*.7+c.phase)*.5);c.timer<=0&&(c.mode="go",c.cruise=m.speed,c.timer=(m.kind==="farmer"?8:3)+c.rand()*8,d.head.rotation.x=0)}if(c.grump=c.mode==="grumpy"?Math.min(1,c.grump+u*6):Math.max(0,c.grump-u*3),d.brows.length&&(d.brows[0].rotation.z=-.55*c.grump,d.brows[1].rotation.z=.55*c.grump,d.brows[0].position.y=.14-.05*c.grump,d.brows[1].position.y=.14-.05*c.grump,d.smile&&(d.smile.visible=c.grump<.5),d.frown&&(d.frown.visible=c.grump>=.5),c.mode==="grumpy"?(d.arms[0].rotation.x=-1.3*c.grump,d.arms[1].rotation.x=-1.3*c.grump,d.arms[0].rotation.z=.9*c.grump,d.arms[1].rotation.z=-.9*c.grump):(d.arms[0].rotation.z*=1-Math.min(1,u*6),d.arms[1].rotation.z*=1-Math.min(1,u*6))),d.tail){let S=m.kind==="dog"?Math.sin(h*(c.mode==="go"?16:9)+c.phase)*.55:Math.sin(h*1.8+c.phase)*.35;d.tail.rotation.y=S,m.kind==="cat"&&(d.tail.rotation.x=Math.sin(h*1.1+c.phase)*.15)}let p=Math.sin(Math.min(1,c.hop)*Math.PI)*(m.kind==="farmer"?0:.9);d.group.position.set(c.x,p,c.z),d.group.rotation.y=c.heading}return{root:e,tick(c,u,h){for(let f of t.values())l(f,c,u,h)},setWolves(c){let u=new Map(c.map(d=>[d.id,d])),h=["bean","moon"].map(d=>t.get(d)).filter(d=>!!d&&!d.chasing);for(let[d,m]of t){if(m.spec.kind!=="wolf"||u.has(d)||m.mode==="flee")continue;m.mode="flee",m.timer=5;let _=h.shift();_&&(_.chasing=d,_.chaseUntil=Number.POSITIVE_INFINITY,_.hop=1)}let f=0;for(let d of c)t.has(d.id)||s(d,f),f++},poke(c){let u=t.get(c);if(u){if(u.spec.id===Yr){u.mode="grumpy",u.timer=4.5;let h=Math.floor(u.rand()*Ya.length);return h===i&&(h=(h+1)%Ya.length),i=h,Ya[h]}u.hop=1,u.mode!=="go"&&(u.mode="go",u.timer=3+u.rand()*4),u.cruise=u.spec.speed*2}},position(c){let u=t.get(c);if(u)return{x:u.x,y:u.parts.top*u.spec.size+u.parts.group.position.y,z:u.z}},dispose(){n.remove(e),e.traverse(c=>{let u=c;u.geometry&&u.geometry.dispose();let h=u.material;if(h)for(let f of Array.isArray(h)?h:[h])f.dispose()})}}}var xh=3.6,Fp=25,gT=(n,e)=>new Lt({color:n,transparent:!0,opacity:e,depthWrite:!1,blending:ei});function Bp(n,e,t){let i=new Oe,s=[],r=[["#ff2d12",.55,1],["#ff8a1f",.8,.72],["#ffe066",.95,.42]];for(let a=0;a<9;a++){let l=(t()-.5)*.9*n,c=(t()-.5)*1.6*n,u=e*(.7+t()*.5);for(let[h,f,d]of r){let m=new Z(new en(.22*n*d,.95*n*d,7),gT(h,f));m.position.set(l,u,c),i.add(m),s.push({mesh:m,phase:t()*Math.PI*2,base:u})}}let o=new Ve({color:"#5a5652",transparent:!0,opacity:.55,roughness:1,depthWrite:!1});return{group:i,tongues:s,puffs:[],smokeMaterial:o,lastPuff:-1}}function zp(n,e,t,i,s,r,o){n.group.visible=i>.02;for(let a of n.tongues){let l=.75+.35*Math.sin(e*13+a.phase)+.2*Math.sin(e*29+a.phase*1.7);a.mesh.scale.set(i*(.8+.2*l),i*l,i*(.8+.2*l)),a.mesh.position.y=a.base+Math.sin(e*9+a.phase)*.06*r,a.mesh.rotation.z=Math.sin(e*7+a.phase)*.18,a.mesh.rotation.x=Math.cos(e*6+a.phase)*.14}if(s&&e-n.lastPuff>.28){n.lastPuff=e;let a=new Z(new Re(.22*r,8,6),n.smokeMaterial);a.position.set((o()-.5)*.6*r,r*1.3,(o()-.5)*.8*r),n.group.add(a),n.puffs.push({mesh:a,born:e,drift:(o()-.5)*.6})}for(let a of[...n.puffs]){let l=e-a.born;if(l>2.6){n.group.remove(a.mesh),a.mesh.geometry.dispose(),n.puffs.splice(n.puffs.indexOf(a),1);continue}a.mesh.position.y+=t*(1.1+l*.4)*r,a.mesh.position.x+=t*a.drift;let c=1+l*1.1;a.mesh.scale.setScalar(c)}n.smokeMaterial.opacity=.5}function Gp(n){for(let e of n.tongues)e.mesh.geometry.dispose(),e.mesh.material.dispose();for(let e of n.puffs)e.mesh.geometry.dispose();n.smokeMaterial.dispose()}function Vp(n,e,t,i){let s=new Z(new Hn(1.1*t,20),new Lt({color:"#1a1410",transparent:!0,opacity:.55,depthWrite:!1}));return s.rotation.x=-Math.PI/2,s.position.set(n,.025,e),{mesh:s,born:i}}function Wp(n,e){let t=e-n.born,i=n.mesh.material;return i.opacity=.55*Math.max(0,1-t/Fp),t<Fp}function Xp(){let n=new Ve({color:"#f2c9a8",roughness:.85}),e=new Oe,t=new Z(new Xt(.95,1.2,6,14),n);t.rotation.x=Math.PI/2,t.scale.set(1.1,.42,1),t.castShadow=!0,e.add(t);let i=new Z(new et(1.15,1.05,3.2,16),new Ve({color:"#f7f5ef",roughness:.9}));i.position.set(0,1.8,-.6),e.add(i);let s=new Z(new et(1.25,1.25,.5,16),new Ve({color:"#3b5bdb",roughness:.8}));s.position.set(0,.45,-.6),e.add(s);let r=[];for(let l=0;l<4;l++){let c=new Oe;c.position.set(-.78+l*.52,-.05,1.1);let u=new Z(new Xt(.24,1.2,4,10),n);u.rotation.x=Math.PI/2,u.position.z=.7,u.castShadow=!0,c.add(u),e.add(c),r.push(c)}let o=new Oe;o.position.set(1.15,-.05,.1);let a=new Z(new Xt(.27,1,4,10),n);return a.rotation.z=-Math.PI/2,a.position.x=.6,a.castShadow=!0,o.add(a),e.add(o),e.scale.setScalar(2.1),e.visible=!1,{group:e,fingers:r,thumb:o}}function ir(n,e){for(let t of n.fingers)t.rotation.x=.25+e*1.05;n.thumb.rotation.z=-.1-e*.9}var Ja=7;function $p(){let n=new Oe,e=new Ve({color:"#c9ced6",roughness:.35,metalness:.85}),t=new Ve({color:"#5a6070",roughness:.5,metalness:.7}),i=new Z(new Re(3.2,28,10),e);i.scale.set(1,.22,1),i.castShadow=!0,n.add(i);let s=new Z(new et(1.6,1.1,.5,20),t);s.position.y=-.5,n.add(s);let r=new Z(new Re(1.35,20,12,0,Math.PI*2,0,Math.PI/2),new Ks({color:"#8fd8ff",roughness:.05,metalness:0,transmission:.6,transparent:!0,opacity:.85,thickness:.5}));r.position.y=.55,n.add(r);let o=new Z(new Re(.42,12,10),new Ve({color:"#7fd66b",roughness:.8}));o.scale.set(.8,1.1,.8),o.position.y=.85,n.add(o);for(let u of[-1,1]){let h=new Z(new Re(.11,8,6),new Lt({color:"#111111"}));h.scale.set(.7,1.4,.6),h.position.set(u*.16,1.02,.34),n.add(h)}let a=[];for(let u=0;u<12;u++){let h=u/12*Math.PI*2,f=new Z(new Re(.16,8,6),new Lt({color:"#ffd166"}));f.position.set(Math.cos(h)*2.55,-.18,Math.sin(h)*2.55),n.add(f),a.push(f)}let l=new Lt({color:"#9ef7c8",transparent:!0,opacity:0,depthWrite:!1,side:Wt,blending:ei}),c=new Z(new en(2.4,1,24,1,!0),l);return c.geometry.translate(0,-.5,0),c.position.y=-.7,n.add(c),n.visible=!1,{group:n,beam:c,beamMaterial:l,lights:a,disc:i,hover:Ja}}function qp(n,e,t,i){n.group.rotation.y=e*.6,n.lights.forEach((s,r)=>{let o=(Math.sin(e*6-r*.55)+1)/2;s.material.color.setHSL(.13,1,.45+o*.35)}),n.beam.scale.set(1,Math.max(.01,t),1),n.beamMaterial.opacity=.32*i*(.85+.15*Math.sin(e*9)),n.beam.visible=i>.01,n.beam.rotation.y=-n.group.rotation.y}var Yp={name:"San Francisco",lat:37.7749,lon:-122.4194,timeZone:"America/Los_Angeles"},pn=Math.PI/180;function Qp(n,e=Yp.lat,t=Yp.lon){let i=n.getTime(),r=(i/864e5+24405875e-1-2451545)/36525,o=(280.46646+r*(36000.76983+r*3032e-7))%360,l=(357.52911+r*(35999.05029-1537e-7*r))*pn,c=Math.sin(l)*(1.914602-r*(.004817+14e-6*r))+Math.sin(2*l)*(.019993-101e-6*r)+Math.sin(3*l)*289e-6,u=o+c,h=125.04-1934.136*r,f=u-.00569-.00478*Math.sin(h*pn),m=23+(26+(21.448-r*(46.815+r*(59e-5-r*.001813)))/60)/60+.00256*Math.cos(h*pn),_=Math.asin(Math.sin(m*pn)*Math.sin(f*pn)),g=Math.tan(m/2*pn)**2,p=.016708634-r*(42037e-9+1267e-10*r),S=4*(180/Math.PI)*(g*Math.sin(2*o*pn)-2*p*Math.sin(l)+4*p*g*Math.sin(l)*Math.cos(2*o*pn)-.5*g*g*Math.sin(4*o*pn)-1.25*p*p*Math.sin(2*l)),D=((i%864e5/6e4+S+4*t)%1440+1440)%1440/4-180;D<-180&&(D+=360);let R=e*pn,O=D*pn,U=Math.sin(R)*Math.sin(_)+Math.cos(R)*Math.cos(_)*Math.cos(O),T=Math.acos(Math.max(-1,Math.min(1,U))),y,P=Math.cos(R)*Math.sin(T);if(Math.abs(P)<1e-9)y=180;else{let H=(Math.sin(R)*Math.cos(T)-Math.sin(_))/P;y=Math.acos(Math.max(-1,Math.min(1,H)))/pn,y=D>0?(y+180)%360:(540-y)%360}return{altitude:90-T/pn,azimuth:y}}var Kr=(n,e,t)=>[n[0]+(e[0]-n[0])*t,n[1]+(e[1]-n[1])*t,n[2]+(e[2]-n[2])*t],Oi=([n,e,t])=>`#${[n,e,t].map(i=>Math.round(Math.max(0,Math.min(255,i))).toString(16).padStart(2,"0")).join("")}`,Kp=[11,18,42],Zp=[58,63,122],Jp=[243,168,106],_T=[169,216,245],jp=[24,30,58],yh=[255,196,136],ET=[191,224,245];function em(n){let e=i=>Math.max(0,Math.min(1,i));if(n<=-12)return{sky:Oi(Kp),horizon:Oi(jp),sunColor:"#9fb4ff",sunIntensity:.12,ambient:.12,stars:1};if(n<=0){let i=e((n+12)/12);return{sky:Oi(Kr(Kp,Zp,i)),horizon:Oi(Kr(jp,yh,i*.8)),sunColor:"#ff9a5c",sunIntensity:.12+.5*i,ambient:.12+.18*i,stars:1-i}}if(n<=10){let i=e(n/10);return{sky:Oi(Kr(Zp,Jp,i)),horizon:Oi(yh),sunColor:"#ffb070",sunIntensity:.6+1*i,ambient:.3+.25*i,stars:0}}let t=e((n-10)/30);return{sky:Oi(Kr(Jp,_T,t)),horizon:Oi(Kr(yh,ET,t)),sunColor:t<1?"#ffe0b8":"#fff4dc",sunIntensity:1.6+.6*t,ambient:.55+.4*t,stars:0}}var xT=210;function tm(n,e,t=xT){let i=n*Math.PI/180,s=e*Math.PI/180;return new N(Math.sin(s)*Math.cos(i)*t,Math.sin(i)*t,-Math.cos(s)*Math.cos(i)*t)}function yT(n){let t=new Float32Array(7800),i=new Float32Array(2600),s=xt(131);for(let l=0;l<2600;l++)t.set([(s()-.5)*140,s()*40,(s()-.5)*100+4],l*3),i[l]=.7+s()*.6;let r=new Et;r.setAttribute("position",new Ct(t,3));let o=new ai({color:"#cfe3ff",size:.35,sizeAttenuation:!0,transparent:!0,opacity:0,depthWrite:!1}),a=new Ci(r,o);return a.frustumCulled=!1,a.visible=!1,n.add(a),{points:a,velocities:i,material:o,kind:"none"}}function nm(n){let{scene:e,sun:t,moon:i,light:s,hemisphere:r,ambient:o,stars:a,clouds:l,cloudMaterial:c}=n,u=yT(e),h=e.fog,f=e.background,d={altitude:45,azimuth:180,weather:null},m=1,_=0,g=0,p=()=>{let S=em(d.altitude),x=d.weather,E=x?.cloudCover??.15,D=x?Math.max(E*.55,x.precipitation!=="none"?.6:0,x.fog?.5:0):0,R=new ke(S.sky),O=new ke(S.horizon),U=new ke(d.altitude>0?"#8b949c":"#151a26");R.lerp(U,D),O.lerp(U,D*.8),f.copy(R),h.color.copy(O),h.near=x?.fog?30:130,h.far=x?.fog?120:280;let T=tm(d.altitude,d.azimuth);t.position.copy(T),t.visible=d.altitude>-3,t.material.color.set(d.altitude<8?"#ffb86b":"#fff1a8");let y=tm(Math.max(15,-d.altitude),(d.azimuth+180)%360);i.position.copy(y),i.visible=d.altitude<2;let P=d.altitude>-2?T:y;s.position.copy(P.clone().normalize().multiplyScalar(90)),s.position.y=Math.max(s.position.y,12),s.color.set(S.sunColor),s.intensity=S.sunIntensity*(1-D*.7),r.intensity=S.ambient*(1-D*.3),r.color.copy(R).lerp(new ke("#ffffff"),.3),o.intensity=.12+S.ambient*.18,a.material.opacity=S.stars*(1-E);let H=Math.round(2+E*(l.length-2));l.forEach((K,G)=>{K.visible=G<H});let L=new ke(d.altitude>0?"#ffffff":"#3a3f52").lerp(new ke(d.altitude>0?"#8e959e":"#22262f"),D);c.color.copy(L),c.emissive.copy(L),c.emissiveIntensity=d.altitude>0?.3*(1-D):.05;let F=x?.precipitation??"none";g=F==="none"?0:Math.min(1,.35+(x?.intensity??0)*.5),u.kind=F,u.material.color.set(F==="snow"?"#ffffff":"#cfe3ff"),u.material.size=F==="snow"?.55:.35,m=.5+(x?.windKph??0)/20};return{set(S){d=S,p()},tick(S,x){if(_+=(g-_)*Math.min(1,x*.8),u.points.visible=_>.01,u.material.opacity=.75*_,!u.points.visible)return;let E=u.points.geometry.attributes.position,D=u.kind==="snow"?4:42,R=u.kind==="snow"?1.6:.4;for(let O=0;O<E.count;O++){let U=E.getY(O)-D*u.velocities[O]*x,T=E.getX(O)+Math.sin(S*1.3+O)*R*x+m*x*(u.kind==="snow"?.6:2);U<0&&(U=38+Math.random()*4,T=(Math.random()-.5)*140),T>72&&(T=-72),E.setXY(O,T,U)}E.needsUpdate=!0},dispose(){u.points.geometry.dispose(),u.material.dispose()}}}function im(n){let e=new Oe,t=xt(415),i=new Z(new ri(700,90),new Ve({color:"#3b7fb5",roughness:.25,metalness:.1}));i.rotation.x=-Math.PI/2,i.position.set(0,.05,-200),e.add(i);let s=new Ve({color:"#6b8a5c",roughness:1});for(let[U,T,y,P]of[[-260,-290,220,40],[-60,-300,260,34],[170,-295,240,44],[-200,-250,80,22]]){let H=new Z(new Re(1,20,12),s);H.scale.set(y/2,P,y/3),H.position.set(U,-2,T),e.add(H)}let r=new Ve({color:"#8fa6bb",roughness:.4,metalness:.5}),o=new Ve({color:"#c9c4b8",roughness:.9}),a=new Ve({color:"#e8e4dc",roughness:.9}),l=new Oe;for(let U=0;U<34;U++){let T=5+t()*9,y=10+t()*30,P=new Z(new ct(T,y,T),t()<.5?r:o);P.position.set((t()-.5)*150,y/2,(t()-.5)*40),l.add(P)}let c=new Z(new et(4.6,6,78,18),r);c.position.set(12,39,-6),l.add(c);let u=new Z(new et(3.6,4.6,6,18),new Ve({color:"#dfe8f0",roughness:.3,emissive:"#9fc7ff",emissiveIntensity:.25}));u.position.set(12,81,-6),l.add(u);let h=new Z(new en(7,62,4),a);h.rotation.y=Math.PI/4,h.position.set(-22,31,4),l.add(h);let f=new Z(new et(.4,.9,12,6),a);f.position.set(-22,66,4),l.add(f);let d=new Z(new Re(16,16,10),s);d.scale.set(1.6,.55,1.2),d.position.set(-62,0,8),l.add(d);let m=new Z(new et(2.2,2.6,22,14),a);m.position.set(-62,19,8),l.add(m),l.position.set(70,0,-262),e.add(l);let _=new Z(new Re(40,18,12),s);_.scale.set(1.5,.45,1),_.position.set(-30,-4,-270),e.add(_);let g=new Ve({color:"#d9d4cb",roughness:.6});for(let U of[-5,0,5]){let T=new Z(new et(.5,1,50,6),g);T.position.set(-30+U,39,-270),e.add(T)}for(let U of[40,52,62]){let T=new Z(new ct(14,.8,.8),g);T.position.set(-30,U,-270),e.add(T)}let p=new Ve({color:"#c0472b",roughness:.7}),S=new Oe,x=150,E=16,D=62,R=new Z(new ct(x+60,1.6,8),p);R.position.y=E,S.add(R);for(let U of[-x/2,x/2]){for(let T of[-3,3]){let y=new Z(new ct(3,D,2.4),p);y.position.set(U,D/2,T),S.add(y)}for(let T of[E+14,E+30,D-4]){let y=new Z(new ct(3.4,2.6,8.4),p);y.position.set(U,T,0),S.add(y)}}let O=(U,T,y,P,H)=>{let L=[];for(let F=0;F<=24;F++){let K=F/24,G=U+(T-U)*K,se=y+(P-y)*K-Math.sin(K*Math.PI)*H;L.push(new N(G,se,0))}return L};for(let U of[-3.6,3.6])for(let[T,y,P,H,L]of[[-x/2,x/2,D,D,D-E-4],[-x/2-30,-x/2,E+2,D,0],[x/2,x/2+30,D,E+2,0]]){let F=new Z(new li(new kn(O(T,y,P,H,L)),32,.45,5,!1),p);F.position.z=U,S.add(F);for(let K=1;K<24;K+=2){let G=O(T,y,P,H,L)[K];if(G.y-E<2)continue;let se=new Z(new et(.16,.16,G.y-E,4),p);se.position.set(G.x,E+(G.y-E)/2,U),S.add(se)}}return S.position.set(-150,0,-235),S.rotation.y=.35,e.add(S),e.traverse(U=>{let T=U;T.isMesh&&(T.castShadow=!1,T.receiveShadow=!1)}),n.add(e),e}var yn=4.6,hi=4.4,Zr=["#ff4fd8","#4fe3ff","#ffe14f","#7dff5a","#ff7a4f","#b14fff"];function ST(){let n=document.createElement("canvas");n.width=128,n.height=64;let e=n.getContext("2d"),t=xt(88);e.fillStyle="#1a1c22",e.fillRect(0,0,128,64);for(let s=0;s<64;s+=4)for(let r=0;r<128;r+=4)e.fillStyle=`hsl(${205+t()*30}, 18%, ${50+t()*45}%)`,e.fillRect(r,s,3.3,3.3);let i=new ci(n);return i.colorSpace=Pt,i}function sm(n){let{barn:e,width:t,depth:i,wall:s,dark:r,trim:o}=n,a=xt(2026),l=[];for(let L of[-1,1]){let F=new Oe;F.position.set(L*yn/2,0,i/2+.1);let K=new Z(new ct(yn/2,hi,.16),r);K.position.set(-L*yn/4,hi/2,0),K.castShadow=!0,F.add(K);let G=new Z(new ct(Math.hypot(yn/2,hi)-.6,.28,.1),o);G.position.set(-L*yn/4,hi/2,.13),G.rotation.z=-L*Math.atan2(hi,yn/2),F.add(G),e.add(F),l.push(F)}let c=new Oe;c.visible=!1,e.add(c);let u=new N(0,s-1.1,-.4),h=new Z(new et(.03,.03,1,6),new Ve({color:"#8a8a8a"}));h.position.set(u.x,u.y+1.05,u.z),c.add(h);let f=ST(),d=new Z(new Re(.62,24,16),new Ve({map:f,metalness:.9,roughness:.3,emissive:"#ffffff",emissiveMap:f,emissiveIntensity:.4}));d.position.copy(u),c.add(d);let m=new Oe;m.position.copy(u),c.add(m);let _=[];Zr.slice(0,5).forEach((L,F)=>{let K=new en(1.4,6,18,1,!0);K.translate(0,-3,0);let G=new Lt({color:L,transparent:!0,opacity:.2,depthWrite:!1,side:Wt,blending:ei}),se=new Z(K,G);se.rotation.x=.55+F%2*.25;let Y=new Oe;Y.rotation.y=F/5*Math.PI*2,Y.add(se),m.add(Y),_.push(G)});let g=new Ia("#ffffff",0,40,2);g.position.copy(u),c.add(g);let p=280,S=new Float32Array(p*3),x=new Float32Array(p*3),E=[],D=new Float32Array(p),R=0;for(;R<p;){let L=(a()-.5)*(t-1),F=-i/2+.5+a()*(i+9);if(F>i/2&&Math.abs(L)>yn/2+(F-i/2)*.55)continue;S.set([L,.09,F],R*3);let G=new ke(Zr[Math.floor(a()*Zr.length)]);E.push(G),x.set([G.r,G.g,G.b],R*3),D[R]=a()*Math.PI*2,R++}let O=new Et;O.setAttribute("position",new Ct(S,3));let U=new Ct(x,3);O.setAttribute("color",U);let T=new Ci(O,new ai({size:.42,vertexColors:!0,transparent:!0,opacity:.85,depthWrite:!1,blending:ei,sizeAttenuation:!0}));c.add(T);let y=[];for(let L=0;L<=14;L++){let F=new ke(Zr[L%Zr.length]),K=new Lt({color:F}),G=new Z(new Re(.15,8,6),K);G.position.set(-7+L,s+.25-Math.abs(Math.sin(L*.9))*.22,i/2+.45),c.add(G),y.push({material:K,base:F})}let P=0,H=0;return{set(L){P=L?1:0,L&&(c.visible=!0)},on:()=>P===1,tick(L,F){H+=(P-H)*Math.min(1,F*1.6),P===0&&H<.01&&(H=0,c.visible=!1);let K=H*H*(3-2*H);if(l[0].rotation.y=-K*1.9,l[1].rotation.y=K*1.9,!!c.visible){d.rotation.y=L*.9,m.rotation.y=L*.55,g.intensity=140*K,g.color.setHSL(L*.1%1,.9,.6),_.forEach((G,se)=>{G.opacity=K*(.14+.1*(.5+.5*Math.sin(L*3+se)))}),T.material.opacity=.9*K;for(let G=0;G<p;G++){let se=.25+.75*(.5+.5*Math.sin(L*4+D[G]));U.setXYZ(G,E[G].r*se,E[G].g*se,E[G].b*se)}U.needsUpdate=!0,y.forEach(({material:G,base:se},Y)=>{G.color.copy(se).multiplyScalar(.3+.7*(.5+.5*Math.sin(L*5-Y*.7)))})}}}}var as=Math.PI*2,Tt={x:-30,z:-19,rx:6,rz:4};function sr(n,e,t=1.5){let i=(n-Tt.x)/(Tt.rx+t),s=(e-Tt.z)/(Tt.rz+t);return i*i+s*s<1}function TT(n){let e=new Z(new ri(360,360),new Ve({map:Ap(),roughness:1,metalness:0}));e.rotation.x=-Math.PI/2,e.receiveShadow=!0,n.add(e)}function vT(){let i=new ke("#5aa848"),s=new ke("#b6ec98"),r=[],o=[],a=[],l=[],c=[];for(let h=0;h<=4;h++){let f=h/4,d=.07*(1-f)/2+.003,m=f*f*.14,_=i.clone().lerp(s,f);for(let g of[-d,d])r.push(g,f*.55,m),o.push(_.r,_.g,_.b),a.push(0,1,0),l.push(g>0?1:0,f)}for(let h=0;h<4;h++){let f=h*2;c.push(f,f+1,f+2,f+1,f+3,f+2)}let u=new Et;return u.setAttribute("position",new Je(r,3)),u.setAttribute("color",new Je(o,3)),u.setAttribute("normal",new Je(a,3)),u.setAttribute("uv",new Je(l,2)),u.setIndex(c),u}function MT(n,e){let t=new Ve({vertexColors:!0,side:Wt,roughness:1});t.onBeforeCompile=f=>{f.uniforms.uTime=e.uTime,f.vertexShader=f.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;`).replace("#include <begin_vertex>",`#include <begin_vertex>
        float bladeT = position.y / 0.55;
        float sway = sin(uTime * 1.6 + instanceMatrix[3][0] * 0.35 + instanceMatrix[3][2] * 0.27) * 0.6 + sin(uTime * 2.9 + instanceMatrix[3][2] * 0.7 + instanceMatrix[3][0] * 0.11) * 0.3;
        transformed.x += sway * 0.13 * bladeT * bladeT;`)};let i=9e3,s=new oi(vT(),t,i),r=xt(11),o=new at,a=new N,l=new zt,c=new N,u=new N(0,1,0),h=0;for(;h<i;){let f=(r()-.5)*124,d=(r()-.5)*86;if(sr(f,d,.5))continue;a.set(f,0,d),l.setFromAxisAngle(u,r()*as);let m=.7+r()*.9;c.set(m,m*(.8+r()*.6),m),o.compose(a,l,c),s.setMatrixAt(h,o),h++}s.receiveShadow=!0,s.frustumCulled=!1,n.add(s)}function bT(n){let e=new Re(.085,7,6),t=new Ve({roughness:.8}),i=700,s=new oi(e,t,i),r=xt(23),o=["#ff7eb6","#ffd166","#ffffff","#c58cff","#ff9f66","#fff4a8"].map(c=>new ke(c)),a=new at,l=0;for(;l<i;){let c=(r()-.5)*120,u=(r()-.5)*82,h=o[Math.floor(r()*o.length)],f=2+Math.floor(r()*5);for(let d=0;d<f&&l<i;d++){let m=c+(r()-.5)*2.4,_=u+(r()-.5)*2.4;sr(m,_,.5)||(a.makeTranslation(m,.2+r()*.15,_),s.setMatrixAt(l,a),s.setColorAt(l,h),l++)}}n.add(s)}function AT(n){let e=new Z(new Hn(1,48),new Ve({color:"#d3c19a",roughness:1}));e.rotation.x=-Math.PI/2,e.position.set(Tt.x,.015,Tt.z),e.scale.set(Tt.rx+1,Tt.rz+1,1),n.add(e);let t=new Z(new Hn(1,48),new Ks({color:"#3f9fda",roughness:.08,metalness:.05,clearcoat:1,clearcoatRoughness:.1}));t.rotation.x=-Math.PI/2,t.position.set(Tt.x,.03,Tt.z),t.scale.set(Tt.rx,Tt.rz,1),n.add(t);let i=new Ve({color:"#3f9a3a",roughness:.9}),s=xt(61);for(let r=0;r<5;r++){let o=new Z(new Hn(.42+s()*.25,18,.3,as-.6),i);o.rotation.x=-Math.PI/2,o.rotation.z=s()*as;let a=s()*as,l=.35+s()*.45;o.position.set(Tt.x+Math.cos(a)*Tt.rx*l,.045,Tt.z+Math.sin(a)*Tt.rz*l),n.add(o)}}function wT(n){let e=new Ve({color:"#6f4a2c",roughness:1}),t=["#3e8f3a","#4ca046","#2f7a2e","#5aae4f"].map(r=>new Ve({color:r,roughness:.9})),i=xt(31),s=[[-57,-28],[-56,0],[-57,18],[56,-24],[57,6],[56,20],[-40,-44],[-18,-46],[0,-44],[48,-42],[-52,-40],[60,-36],[34,-46]];for(let[r,o]of s){let a=new Oe,l=2.6+i()*1.8,c=new Z(new et(.22,.42,l,9),e);c.position.y=l/2,c.castShadow=!0,a.add(c);let u=4+Math.floor(i()*3);for(let h=0;h<u;h++){let f=1.5+i()*1.5,d=new Z(new ba(f,2),t[Math.floor(i()*t.length)]),m=i()*as,_=h===0?0:.9+i()*1.2;d.position.set(Math.cos(m)*_,l+f*.55+(h===0?.8:i()*1.2),Math.sin(m)*_),d.castShadow=!0,a.add(d)}a.position.set(r,0,o),a.rotation.y=i()*as,n.add(a)}}function RT(n){let e=new Ve({color:"#9a9a92",roughness:1}),t=xt(41),i=[[-12,-8],[30,-26],[8,-28],[-40,-4],[40,-12],[-2,-16],[20,-6]];for(let[s,r]of i){let o=new Z(new va(.5+t()*.7,1),e);o.position.set(s,.2,r),o.scale.set(1+t()*.6,.6+t()*.4,1+t()*.6),o.rotation.set(t(),t(),t()),o.castShadow=!0,o.receiveShadow=!0,n.add(o)}}function CT(n){let e=new Ve({color:"#9c6f3a",roughness:.95}),t=3,i=[],s=[],r=new N(0,1,0);for(let l of fn){let{x0:c,x1:u,z0:h,z1:f}=l.rect,d=[{from:[c,h],to:[u,h]},{from:[c,f],to:[u,f]},{from:[c,h],to:[c,f]},{from:[u,h],to:[u,f]}];for(let m of d){let _=m.to[0]-m.from[0],g=m.to[1]-m.from[1],p=Math.hypot(_,g),S=Math.max(1,Math.round(p/t)),x=p/S,E=Math.atan2(g,_),D=new zt().setFromAxisAngle(r,-E);for(let R=0;R<=S;R++){let O=R/S;if(i.push(new at().makeTranslation(m.from[0]+_*O,.57,m.from[1]+g*O)),R===S)continue;let U=m.from[0]+_*(O+.5/S),T=m.from[1]+g*(O+.5/S);for(let y of[.45,.85])s.push(new at().compose(new N(U,y,T),D,new N(x/t,1,1)))}}}let o=new oi(new ct(.2,1.15,.2),e,i.length);i.forEach((l,c)=>o.setMatrixAt(c,l));let a=new oi(new ct(t,.09,.07),e,s.length);s.forEach((l,c)=>a.setMatrixAt(c,l)),o.castShadow=!0,a.castShadow=!0,n.add(o,a)}function IT(n){let e=new Map,t=new Ve({color:"#8a6238",roughness:1});for(let i of fn){let s=document.createElement("canvas");s.width=512,s.height=176;let r=new ci(s);r.colorSpace=Pt;let o={canvas:s,texture:r,name:i.name,count:0};$r(o);let a=new Oe,l=new Z(new ct(6.4,2.2,.18),[t,t,t,t,new Ve({map:r,roughness:.9}),t]);l.position.y=2.6,l.castShadow=!0,a.add(l);for(let c of[-2.6,2.6]){let u=new Z(new ct(.22,2.4,.22),t);u.position.set(c,1.2,-.12),a.add(u)}a.position.set(i.rect.x0+3.9,0,i.rect.z1+1.35),n.add(a),e.set(i.id,o)}return e}function PT(n){let e=new Ve({color:"#ffffff",roughness:1,emissive:"#ffffff",emissiveIntensity:.3}),t=xt(53),i=[];for(let s=0;s<14;s++){let r=new Oe,o=4+Math.floor(t()*4);for(let a=0;a<o;a++){let l=1.8+t()*2.2,c=new Z(new Re(l,16,12),e);c.position.set(a*2.4-o,t()*.8,(t()-.5)*2.2),c.scale.y=.72,r.add(c)}r.position.set((t()-.5)*200,26+t()*12,-40-t()*80),r.userData.speed=.35+t()*.5,n.add(r),i.push(r)}return{clouds:i,material:e}}function OT(n){n.background=new ke("#a9d8f5"),n.fog=new pa("#bfe0f5",130,280);let e=new Z(new Re(7,20,20),new Lt({color:"#fff1a8",fog:!1}));e.position.set(90,80,-120),n.add(e);let t=new Z(new Re(5,20,20),new Lt({color:"#e8ecf5",fog:!1}));t.visible=!1,n.add(t);let i=new Ra("#cfe9ff","#4f8a3a",.95);n.add(i);let s=new Pa("#fff4dc",2.2);s.position.set(40,60,30),s.castShadow=!0,s.shadow.mapSize.set(2048,2048),s.shadow.camera.left=-75,s.shadow.camera.right=75,s.shadow.camera.top=75,s.shadow.camera.bottom=-75,s.shadow.camera.near=5,s.shadow.camera.far=200,s.shadow.bias=-8e-4,s.shadow.normalBias=.02,n.add(s);let r=new Oa("#ffffff",.22);return n.add(r),{sun:e,moon:t,light:s,hemisphere:i,ambient:r}}function UT(n){let e=new Ve({color:"#a83a2e",roughness:.9}),t=new Ve({color:"#f2ede4",roughness:.9}),i=new Ve({color:"#4a3630",roughness:.95}),s=new Ve({color:"#3a2320",roughness:1}),r=new Oe,o=15,a=10,l=6,c=new Ve({color:"#5a3a28",roughness:1}),u=.4,h=(L,F,K,G,se,Y,Ee)=>{let me=[e,e,e,e,e,e];me[Ee]=c;let Te=new Z(new ct(L,F,K),me);Te.position.set(G,se,Y),Te.castShadow=!0,Te.receiveShadow=!0,r.add(Te)};h(u,l,a,-o/2+u/2,l/2,0,0),h(u,l,a,o/2-u/2,l/2,0,1),h(o,l,u,0,l/2,-a/2+u/2,4);let f=(o-yn)/2;h(f,l,u,-(yn/2+f/2),l/2,a/2-u/2,5),h(f,l,u,yn/2+f/2,l/2,a/2-u/2,5),h(yn,l-hi,u,0,hi+(l-hi)/2,a/2-u/2,5);let d=new Z(new ri(o-u,a-u),c);d.rotation.x=-Math.PI/2,d.position.y=.04,d.receiveShadow=!0,r.add(d);let m=new Fr;m.moveTo(-o/2,l),m.lineTo(o/2,l),m.lineTo(0,l+4.2),m.closePath();let _=new Z(new Ma(m,{depth:a,bevelEnabled:!1}),e);_.position.z=-a/2,_.castShadow=!0,r.add(_);let g=Math.atan2(4.2,o/2),p=Math.hypot(4.2,o/2)+.6;for(let L of[-1,1]){let F=new Z(new ct(p,.28,a+1),i);F.position.set(L*o/4,l+2.15,0),F.rotation.z=-L*g,F.castShadow=!0,r.add(F)}let S=sm({barn:r,width:o,depth:a,wall:l,dark:s,trim:t}),x=new Z(new ct(5,.3,.14),t);x.position.set(0,4.5,a/2+.2),r.add(x);let E=new Z(new ct(1.6,1.6,.2),t);E.position.set(0,l+1.6,a/2+.05),r.add(E);let D=new Z(new ct(1.2,1.2,.22),s);D.position.set(0,l+1.6,a/2+.06),r.add(D);let R=new Oe,O=new Ve({color:qa.body,roughness:.85}),U=new Z(new Re(.42,16,12),O);U.scale.set(1.15,1,.95),R.add(U);let T=new Z(new et(.2,.17,.22,12),new Ve({color:"#e69a94",roughness:.8}));T.rotation.x=Math.PI/2,T.position.set(0,-.08,.42),R.add(T);for(let L of[-1,1]){let F=new Z(new Re(.04,6,5),new Ve({color:"#7a3a3a"}));F.position.set(L*.07,-.08,.53),R.add(F);let K=new Z(new Re(.06,8,6),new Ve({color:qa.eyes,roughness:.4}));K.position.set(L*.17,.08,.36),R.add(K);let G=new Z(new en(.14,.3,4),O);G.position.set(L*.3,.42,0),G.rotation.z=L*-.5,R.add(G)}let y=new Z(new et(.42,.5,.5,12),new Ve({color:"#2b2b2b",roughness:.9}));y.position.y=-.6,R.add(y),R.traverse(L=>{L.userData.critterID=qa.id}),R.position.set(0,l+1.6-1.7,a/2-.4),r.add(R);for(let L of[-1,1]){let F=new Z(new ct(.35,l,.35),t);F.position.set(L*o/2,l/2,a/2),r.add(F)}return r.position.set(20,0,-48),r.rotation.y=-.12,n.add(r),{pork:R,party:S,windowY:l+1.6,hiddenY:l+1.6-1.7};let P=new Ve({color:"#d9b45e",roughness:1}),H=new et(1,1,1.7,18);H.rotateZ(Math.PI/2);for(let[L,F,K,G]of[[7,1,-42,.2],[4.6,1,-42.6,-.3],[5.8,2.7,-42.3,0],[36,1,-44,1.2]]){let se=new Z(H,P);se.position.set(L,F,K),se.rotation.y=G,se.castShadow=!0,n.add(se)}}function rm(n){let e={uTime:{value:0}},t=OT(n);TT(n),MT(n,e),bT(n),AT(n),wT(n),RT(n),CT(n);let i=UT(n);im(n);let s=IT(n),r=xt(777),o=90+r()*120,a=-1,l=m=>{if(a<0){if(m<o)return;a=m}let _=m-a,g=_<1?_:_<6?1:_<7?7-_:-1;if(g<0){a=-1,o=m+240+r()*360,i.pork.position.y=i.hiddenY;return}let p=g*g*(3-2*g);i.pork.position.y=i.hiddenY+(i.windowY-i.hiddenY)*p,i.pork.rotation.y=_>1&&_<6?Math.sin((_-1)*1.6)*.45:0},c=new N,{clouds:u,material:h}=PT(n),f=LT(n),d=nm({scene:n,...t,stars:f,clouds:u,cloudMaterial:h});return{signs:s,clouds:u,sky:d,porkPosition(){return i.pork.getWorldPosition(c).clone().add(new N(0,.7,0))},party:i.party,tick(m,_){e.uTime.value=m,d.tick(m,_),l(m),i.party.tick(m,_)}}}function LT(n){let e=xt(97),t=900,i=new Float32Array(t*3);for(let a=0;a<t;a++){let l=(5+e()*80)*Math.PI/180,c=e()*as;i.set([Math.sin(c)*Math.cos(l)*320,Math.sin(l)*320,-Math.cos(c)*Math.cos(l)*320],a*3)}let s=new Et;s.setAttribute("position",new Ct(i,3));let r=new ai({color:"#ffffff",size:1.6,sizeAttenuation:!0,transparent:!0,opacity:0,depthWrite:!1,fog:!1}),o=new Ci(s,r);return o.frustumCulled=!1,n.add(o),o}var In=(n,e,t,i,s,r)=>({position:new N(n,e,t),target:new N(i,s,r)}),om=45,am=5;function Jr(n,e){let t=Ep(n),{rect:i}=fn.find(u=>u.id===n),s=n==="merged",r=s?46:26,o=s?26:15,a=e*.55,l=e*-.35,c=i.z1+(s?8:4);return{hold:s?26:20,from:In(t.x+Math.sin(a)*r,o,c+Math.cos(a)*r*.8,t.x,1,t.z),to:In(t.x+Math.sin(l)*r*.85,o*.85,c+Math.cos(l)*r*.7,t.x,1,t.z-2)}}function NT(){return[{hold:28,from:In(-30,44,88,0,1,0),to:In(30,40,84,0,1,-4)},Jr("draft",1),Jr("awaiting",-1),{hold:30,from:In(-58,6,40,-20,2,10),to:In(58,7,40,20,2,10)},Jr("changes",1),Jr("ready",-1),Jr("merged",1),{hold:24,from:In(-20,14,-2,20,5,-48),to:In(30,18,8,20,5,-48)},{hold:26,from:In(60,38,70,0,1,0),to:In(-40,46,90,0,1,2)}]}function cm(n,e){let t=NT(),i=!1,s=-1,r="transition",o=0,a=0,l=In(0,0,0,0,0,0),c=h=>h*h*(3-2*h),u=h=>{s=h%t.length,r="transition",o=0,l.position.copy(n.position),l.target.copy(e.target)};return{get enabled(){return i},setEnabled(h){i=h,a=h?om:0,s=-1},interrupt(){a=0,s=-1},tick(h){if(!i)return!1;if(a<om)return a+=h,!1;s<0&&u(Math.floor(Math.random()*t.length));let f=t[s];if(o+=h,r==="transition"){let d=c(Math.min(1,o/am));n.position.lerpVectors(l.position,f.from.position,d),e.target.lerpVectors(l.target,f.from.target,d),o>=am&&(r="hold",o=0)}else{let d=c(Math.min(1,o/f.hold));n.position.lerpVectors(f.from.position,f.to.position,d),e.target.lerpVectors(f.from.target,f.to.target,d),o>=f.hold&&u(s+1)}return n.lookAt(e.target),!0}}}var DT=900,um=10,ja=1.2,lm=.7,kT=7.8,HT=um,FT=um+.6,BT=9;function hm(n){let e=DT,t=e,i,s=c=>c*c*(3-2*c),r=c=>{!i||i.stage===c||(i.stage=c,n.onStage(c))},o=c=>{i={t:0,stage:void 0,forced:c,falls:new Map},r("title")},a=()=>{if(i){for(let c of n.cows())c.parts.group.position.y=0,c.parts.group.rotation.x=0,c.parts.group.rotation.z=0;i.falls.clear(),r("restore")}},l=()=>{i&&(r(void 0),i=void 0,t=e)};return{setEvery(c){e=Math.max(0,c),t=e},trigger(){i||o(!0)},active:()=>!!i,tick(c,u){if(!i){if(!u||e<=0)return;t-=c,t<=0&&o(!1);return}if(!u&&!i.forced&&i.stage!=="restore"){a(),l();return}i.t+=c;let h=i.t;if(h>=FT){l();return}if(h>=HT){i.stage!=="restore"&&a();return}if(h>=kT?r("fade"):h>=ja&&r("flip"),h<ja)return;let f=Math.PI*s(Math.min(1,(h-ja)/lm));n.camera.lookAt(n.target),n.camera.rotateZ(f);let d=ja+lm*.6;for(let m of n.cows()){let _=i.falls.get(m);_||(_={start:Math.max(h,d+m.rand()*1.6),spinX:(m.rand()-.5)*2.4,spinZ:(m.rand()-.5)*2.4},i.falls.set(m,_));let g=h-_.start;if(g<=0)continue;let p=m.parts.group;p.position.y=.5*BT*g*g,p.rotation.x=_.spinX*g,p.rotation.z=_.spinZ*g}}}}var rr=Math.PI*2,di=34,Qa=11,zT=8,dm=10,fm=400,jr=n=>n*n*(3-2*n);function Sh(n,e,t){let i=(e-n+Math.PI)%rr-Math.PI;return i<-Math.PI&&(i+=rr),n+i*Math.min(1,t)}function ec(n,e,t=1.8){let{rect:i}=Xr(n);for(let s=0;s<20;s++){let r=i.x0+t+e()*(i.x1-i.x0-t*2),o=i.z0+t+e()*(i.z1-i.z0-t*2);if(!sr(r,o))return{x:r,z:o}}return{x:(i.x0+i.x1)/2,z:(i.z0+i.z1)/2}}function pm(n,e){let t=new fa({canvas:n,antialias:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)),t.outputColorSpace=Pt,t.toneMapping=ju,t.toneMappingExposure=1.05,t.shadowMap.enabled=!0,t.shadowMap.type=Ju;let i=new ma,s=rm(i),r=Xp();i.add(r.group);let o=$p();i.add(o.group);let a=0,l=dm,c=Math.floor(Math.random()*dm),u=()=>l>0&&a++%l===c%l?"ufo":"hand",h=Hp(i),f=new Zt(42,1,.1,500);f.position.set(0,42,80);let d=new Ga(f,n);d.target.set(0,.8,2),d.enableDamping=!0,d.dampingFactor=.08,d.minDistance=6,d.maxDistance=140,d.maxPolarAngle=Math.PI*.47,d.enablePan=!0,d.update();let m=new Oe;i.add(m);let _=new Map,g,p,S=!1,x=[],E,D=new oi(new Hn(1,24),new Lt({color:"#000000",transparent:!0,opacity:.17,depthWrite:!1}),fm);D.frustumCulled=!1,D.count=0,i.add(D);let R=new Z(new Aa(1.05,1.24,48),new Lt({color:"#ffd166",transparent:!0,opacity:.9,side:Wt,depthWrite:!1}));R.rotation.x=-Math.PI/2,R.position.y=.035,R.visible=!1,i.add(R);let O=new le(2,2),U=!1,T={x:0,y:0},y=new La,P,H,L=!1,F=cm(f,d),K=hm({camera:f,target:d.target,cows:()=>_.values(),onStage:w=>e.onUpsidedown?.(w)});d.addEventListener("start",()=>{L=!0,F.interrupt()});let G=()=>{if(L)return;let w=54,z=Ha.degToRad(f.fov/2),b=Math.min(d.maxDistance,Math.max(70,w/(Math.tan(z)*f.aspect))),B=f.position.clone().sub(d.target).normalize();f.position.copy(d.target).addScaledVector(B,b),d.update()},se=()=>{let w=n.parentElement,z=Math.max(1,w?.clientWidth??n.clientWidth),b=Math.max(1,w?.clientHeight??n.clientHeight);t.setSize(z,b,!1),f.aspect=z/b,f.updateProjectionMatrix(),G()};se();let Y=new ResizeObserver(()=>se());n.parentElement&&Y.observe(n.parentElement);let Ee=w=>{let z=n.getBoundingClientRect();O.set((w.clientX-z.left)/z.width*2-1,-((w.clientY-z.top)/z.height)*2+1),T={x:w.clientX,y:w.clientY},U=!0},me=w=>Ee(w),Te=()=>{U=!1,P!==void 0&&(P=void 0,n.style.cursor="",e.onHover(void 0,T.x,T.y))},be=w=>{Ee(w),H={x:w.clientX,y:w.clientY,at:performance.now()}},nt=w=>{if(!H)return;let z=Math.hypot(w.clientX-H.x,w.clientY-H.y),b=performance.now()-H.at<450;H=void 0,!(z>6||!b)&&(Ee(w),e.onSelect(ae()))},ee=w=>{Ee(w);let z=ae();z?.kind==="cow"&&e.onOpen(z.id)};n.addEventListener("pointermove",me),n.addEventListener("pointerleave",Te),n.addEventListener("pointerdown",be),n.addEventListener("pointerup",nt),n.addEventListener("dblclick",ee);function ae(){y.setFromCamera(O,f);let w=y.intersectObjects([m,h.root],!0);for(let z of w){let b=z.object.userData.cowID;if(b){let V=_.get(b);return V&&!V.hidden&&!V.burning?{kind:"cow",id:b}:void 0}let B=z.object.userData.critterID;if(B)return{kind:"critter",id:B}}}function _e(w){let{rect:z}=Xr(w.pen);for(let b=0;b<12;b++){let B=w.rand()*rr,V=3+w.rand()*8,$=Math.max(z.x0+1.8,Math.min(z.x1-1.8,w.x+Math.sin(B)*V)),te=Math.max(z.z0+1.8,Math.min(z.z1-1.8,w.z+Math.cos(B)*V));if(!sr($,te))return{x:$,z:te}}return ec(w.pen,w.rand)}function ge(w){let z=!!p&&!p.has(w.spec.author);if(z!==w.dimmed){w.dimmed=z;for(let b of w.parts.materials)b.color.setScalar(z?.42:1)}}function De(w,z){let b=xt(w.seed^2654435769),B=Up(w),{x:V,z:$}=ec(w.pen,b),te={spec:w,parts:B,pen:w.pen,x:V,z:$,heading:b()*rr,target:{x:V,z:$},mode:b()<.5?"graze":"idle",timer:1+b()*6,walkPhase:b()*rr,phase:b()*rr,lift:0,graze:0,selected:w.id===g,carried:!1,hidden:z,leaving:!1,dimmed:!1,rand:b};return B.group.visible=!z,B.group.position.set(V,0,$),B.group.rotation.y=te.heading,m.add(B.group),_.set(w.id,te),ge(te),te}function We(w){w.burning&&(w.parts.group.remove(w.burning.fire.group),Gp(w.burning.fire),w.burning=void 0),m.remove(w.parts.group),Eh(w.parts),_.delete(w.spec.id)}function ze(w,z,b){let B=w.parts;B.legs.forEach((V,$)=>{V.rotation.x=Math.sin(z*2.3+$*1.3+w.phase)*.3*b,V.rotation.z=Math.sin(z*1.9+$*.8)*.14*b}),B.rig.rotation.x=-.14*b,B.head.rotation.x=.12*b,B.head.rotation.y=Math.sin(z*.9+w.phase)*.15*b,B.tail.rotation.x=Math.sin(z*3+w.phase)*.35}function je(w,z){let b=w.parts,B=w.mode==="graze"?1:0;w.graze+=(B-w.graze)*Math.min(1,z*3);let V=jr(w.graze);return b.head.position.set(b.headRest.x,b.headRest.y-.36*V,b.headRest.z+.12*V),V}let oe=[];function fe(w,z,b){let B=w.burning,V=w.parts,$=w.spec.breed.size;B.t+=z;let te=B.t,he=Math.min(1,te/.5),Xe=Math.min(1,Math.max(0,(te-.4)/1.8)),qe=Math.min(1,Math.max(0,(te-2.4)/.8)),rt=Math.min(1,Math.max(0,(te-3.1)/.5)),tt=he*(1-.6*qe)*(1-rt);zp(B.fire,b,z,tt,te>.7&&te<3.3,$,w.rand);for(let Ft of V.materials)Ft.color.setScalar(1-.85*Xe),Ft.emissive.set("#ff6a00"),Ft.emissiveIntensity=.45*tt*(1-.55*Xe)*(.7+.3*Math.sin(b*17));let Vt=(1-qe)*he;if(V.rig.position.x=Math.sin(b*31)*.04*Vt,V.rig.position.y=-qe*.9*$+Math.abs(Math.sin(b*23))*.05*Vt,V.rig.scale.set($*(1+.15*qe),$*(1-.65*qe),$),V.rig.rotation.z=qe*.35,V.legs.forEach((Ft,hr)=>{Ft.rotation.x=Math.sin(b*19+hr*1.7)*.35*Vt+qe*(hr<2?1.1:-1.1)}),V.head.rotation.x=-.6*Vt+.8*qe,V.tail.rotation.z=Math.sin(b*25)*.6*Vt,V.group.position.set(w.x,0,w.z),te>=xh){let Ft=Vp(w.x,w.z,$,b);i.add(Ft.mesh),oe.push(Ft),We(w)}}function k(w,z,b){let B=w.parts;if(w.hidden)return;if(w.burning)return fe(w,z,b);let V=w.spec.breed.size;if(w.carried){ze(w,b,1),B.group.position.set(w.x,0,w.z),B.group.rotation.y=w.heading;return}if(w.spec.queued&&!w.selected){w.lift=Math.min(1,w.lift+z*.8);let te=jr(w.lift);B.rig.position.y=te*(1.4+V*.3)+Math.sin(b*1.4+w.phase)*.12*te,B.rig.rotation.x=-.05*te,w.heading+=z*.9*te,ze(w,b,te*.6),w.mode="idle",je(w,z),B.group.position.set(w.x,0,w.z),B.group.rotation.y=w.heading;return}w.lift=w.selected?Math.min(1,w.lift+z*1.5):Math.max(0,w.lift-z*1.3);let $=jr(w.lift);if(w.lift>.02){if(B.rig.position.y=$*(2.3+V*.5)+(w.selected?Math.sin(b*1.7+w.phase)*.08:0),ze(w,b,$),w.mode="idle",je(w,z),w.selected){let te=Math.atan2(f.position.x-w.x,f.position.z-w.z);w.heading=Sh(w.heading,te,z*1.2)}B.group.position.set(w.x,0,w.z),B.group.rotation.y=w.heading;return}if(B.rig.position.y=0,B.rig.rotation.x=0,w.timer-=z,w.mode==="walk"){let te=w.target.x-w.x,he=w.target.z-w.z;if(Math.hypot(te,he)<.5||w.timer<=0)w.mode=w.rand()<.72?"graze":"idle",w.timer=3+w.rand()*7;else{w.heading=Sh(w.heading,Math.atan2(te,he),z*2.2);let qe=1.15*(.85+V*.15);w.x+=Math.sin(w.heading)*qe*z,w.z+=Math.cos(w.heading)*qe*z,w.walkPhase+=z*7.5;let rt=Math.sin(w.walkPhase)*.5;B.legs[0].rotation.x=rt,B.legs[3].rotation.x=rt,B.legs[1].rotation.x=-rt,B.legs[2].rotation.x=-rt,B.rig.position.y=Math.abs(Math.sin(w.walkPhase))*.035,B.head.rotation.x=.08+Math.sin(w.walkPhase)*.05,B.head.rotation.y=0,B.tail.rotation.z=Math.sin(b*2.2+w.phase)*.2}}else if(w.mode==="graze"){B.head.rotation.x+=(.95-B.head.rotation.x)*Math.min(1,z*3),B.head.rotation.y=Math.sin(b*2.6+w.phase)*.06,B.tail.rotation.z=Math.sin(b*1.6+w.phase)*.25;for(let te of B.legs)te.rotation.x*=1-Math.min(1,z*6);w.timer<=0&&(w.mode="walk",w.target=_e(w),w.timer=5+w.rand()*8)}else{B.head.rotation.x+=(0-B.head.rotation.x)*Math.min(1,z*3),B.head.rotation.y=Math.sin(b*.7+w.phase)*.45,B.tail.rotation.z=Math.sin(b*1.4+w.phase)*.25;for(let te of B.legs)te.rotation.x*=1-Math.min(1,z*6);w.timer<=0&&(w.mode="walk",w.target=_e(w),w.timer=5+w.rand()*8)}je(w,z),Pe(w),B.group.position.set(w.x,0,w.z),B.group.rotation.y=w.heading}function Pe(w){let{rect:z}=Xr(w.pen);if(w.x=Math.max(z.x0+1.2,Math.min(z.x1-1.2,w.x)),w.z=Math.max(z.z0+1.2,Math.min(z.z1-1.2,w.z)),!sr(w.x,w.z,1.2))return;let b=(w.x-Tt.x)/(Tt.rx+1.4),B=(w.z-Tt.z)/(Tt.rz+1.4),V=Math.hypot(b,B)||.001;w.x=Tt.x+b/V*(Tt.rx+1.4),w.z=Tt.z+B/V*(Tt.rz+1.4),w.mode==="walk"&&(w.target=_e(w))}function ue(){let w=[..._.values()].filter(z=>!z.hidden&&!z.carried&&!z.burning);for(let z=0;z<w.length;z++)for(let b=z+1;b<w.length;b++){let B=w[z],V=w[b];if(B.pen!==V.pen)continue;let $=V.x-B.x,te=V.z-B.z,he=(B.spec.breed.size+V.spec.breed.size)*1.05,Xe=Math.hypot($,te)||.001;if(Xe>=he)continue;let qe=(he-Xe)/2*.5,rt=$/Xe,tt=te/Xe;B.lift<.02&&(B.x-=rt*qe,B.z-=tt*qe),V.lift<.02&&(V.x+=rt*qe,V.z+=tt*qe)}}let Me=new at,pe=new zt().setFromAxisAngle(new N(1,0,0),-Math.PI/2),Fe=new N,ve=new N;function I(){let w=0;for(let b of _.values()){if(w>=fm)break;let B=b.spec.breed.size,V=b.hidden?0:b.carried?.55:b.burning?Math.max(0,1-b.burning.t/xh):1-jr(b.lift)*.35;Fe.set(b.x,.02,b.z),ve.setScalar(.95*B*V),Me.compose(Fe,pe,ve),D.setMatrixAt(w++,Me)}D.count=w,D.instanceMatrix.needsUpdate=!0;let z=g?_.get(g):void 0;R.visible=!!z&&!z.hidden&&!z.carried,z&&(R.position.set(z.x,.035,z.z),R.scale.setScalar(z.spec.breed.size))}let v={descend:1.1,grab:.35,lift:.8,travel:2,lower:.8,release:.35,ascend:1,"carry-up":1.4,"carry-down":1.4},q=()=>E?.vehicle==="ufo"?o.group:r.group;function ne(w,z,b){E?.vehicle==="ufo"?o.group.position.set(w,z+Ja,b):r.group.position.set(w,z,b)}let M=()=>{let w=q().position;return{x:w.x,y:E?.vehicle==="ufo"?w.y-Ja:w.y,z:w.z}};function C(w){w.carried=!0,w.selected=!1,w.lift=0;let z=M();w.x=z.x,w.z=z.z,w.parts.rig.position.y=Math.max(0,z.y-$a(w.spec.breed.size)),E?.vehicle==="ufo"&&(w.heading+=.9*ie)}let ie=0;function Q(){for(;!E&&x.length;){let w=x.shift(),z=_.get(w.id);if(z){if(w.kind==="move"){if(z.pendingPen!==w.to)continue;let b=ec(w.to,z.rand);E={transfer:w,phase:"descend",vehicle:u(),t:0,from:{x:z.x,z:z.z},to:b,cow:z},ne(z.x,di,z.z),ir(r,0)}else if(w.kind==="arrive"){let b={x:z.x,z:z.z};E={transfer:w,phase:"carry-down",vehicle:u(),t:0,from:b,to:b,cow:z},ne(b.x,di,b.z),ir(r,1),z.hidden=!1,z.parts.group.visible=!0,C(z),e.onCarry?.(z.spec.id)}else{if(!z.leaving)continue;E={transfer:w,phase:"descend",vehicle:u(),t:0,from:{x:z.x,z:z.z},to:{x:z.x,z:z.z},cow:z},ne(z.x,di,z.z),ir(r,0)}r.group.visible=E.vehicle==="hand",o.group.visible=E.vehicle==="ufo"}}}function ce(){r.group.visible=!1,o.group.visible=!1,E=void 0,Q()}function we(w,z){if(!E)return;ie=w;let b=E,B=b.cow,V=B.spec.breed.size,$=$a(V);b.t+=w;let te=Math.min(1,b.t/v[b.phase]),he=jr(te);if(b.vehicle==="ufo"){let rt=b.phase==="grab"?he:b.phase==="release"?1-he:b.phase==="descend"||b.phase==="ascend"||b.phase==="carry-down"||b.phase==="carry-up"?.35:1;qp(o,z,o.group.position.y-.7,rt)}switch(b.phase){case"descend":ne(b.from.x,di+($-di)*he,b.from.z);break;case"grab":ir(r,he),te>=1&&(C(B),e.onCarry?.(B.spec.id));break;case"lift":ne(b.from.x,$+(Qa-$)*he,b.from.z);break;case"travel":{let rt=b.from.x+(b.to.x-b.from.x)*he,tt=b.from.z+(b.to.z-b.from.z)*he;ne(rt,Qa+Math.sin(te*Math.PI)*3,tt),B.heading=Sh(B.heading,Math.atan2(b.to.x-b.from.x,b.to.z-b.from.z),w*2);break}case"lower":ne(b.to.x,Qa+($-Qa)*he,b.to.z);break;case"release":ir(r,1-he),te>=1&&(B.carried=!1,B.x=b.to.x,B.z=b.to.z,B.parts.rig.position.y=0,b.transfer.kind==="move"&&(B.pen=b.transfer.to,B.pendingPen=void 0),B.mode="idle",B.timer=1.5+B.rand()*3,B.target=_e(B));break;case"ascend":{let rt=M();ne(rt.x,$+(di-$)*he,rt.z);break}case"carry-up":if(ne(b.from.x,$+(di+6-$)*he,b.from.z),te>=1){We(B),ce();return}break;case"carry-down":ne(b.to.x,di+($-di)*he,b.to.z);break}if(B.carried&&C(B),te<1)return;b.t=0;let qe=(b.transfer.kind==="move"?{descend:"grab",grab:"lift",lift:"travel",travel:"lower",lower:"release",release:"ascend",ascend:"done"}:b.transfer.kind==="arrive"?{"carry-down":"release",release:"ascend",ascend:"done"}:{descend:"grab",grab:"carry-up"})[b.phase];if(!qe||qe==="done"){ce();return}if(qe==="travel"){let rt=Math.hypot(b.to.x-b.from.x,b.to.z-b.from.z);v.travel=Math.min(3,Math.max(1.1,rt/16))}b.phase=qe}let re=new Ua,Se=0,Ie=0,Ge=new N;function Ce(){Ie=requestAnimationFrame(Ce);let w=Math.min(.05,re.getDelta()),z=re.elapsedTime;Se++,we(w,z);for(let B of _.values())k(B,w,z);Se%3===0&&_.size>1&&ue(),h.tick(w,z,f);for(let B of[...oe])Wp(B,z)||(i.remove(B.mesh),B.mesh.geometry.dispose(),B.mesh.material.dispose(),oe.splice(oe.indexOf(B),1));I(),s.tick(z,w);for(let B of s.clouds)B.position.x+=B.userData.speed*w,B.position.x>120&&(B.position.x=-120);let b=F.tick(w,z);if(b||d.update(),K.tick(w,b),U&&Se%2===0){let B=ae();(B?.id!==P?.id||B?.kind!==P?.kind)&&(P=B,n.style.cursor=B?"pointer":"",e.onHover(B,T.x,T.y))}t.render(i,f)}Ce();function it(w){let z=new Map;for(let b of w)z.set(b.pen,(z.get(b.pen)??0)+1);for(let[b,B]of s.signs){let V=z.get(b)??0;B.count!==V&&(B.count=V,$r(B))}}return{setCows(w,z){let b=new Map(w.map($=>[$.id,$])),B=[];for(let[$,te]of _)!b.has($)&&!te.leaving&&B.push({kind:"depart",id:$});for(let $ of w){let te=_.get($.id);if(!te)B.push({kind:"arrive",id:$.id});else{if(te.burning)continue;te.leaving=!1,te.spec=$,te.pen!==$.pen&&te.pendingPen!==$.pen&&B.push({kind:"move",id:$.id,to:$.pen})}}let V=z&&S&&B.length>0&&B.length<=zT;for(let $ of B)if($.kind==="depart"){let te=_.get($.id);V&&!te.hidden?(te.leaving=!0,x.push($)):(E?.cow===te&&ce(),We(te))}else if($.kind==="arrive")De(b.get($.id),V),V&&x.push($);else{let te=_.get($.id);if(V||E?.cow===te)te.pendingPen=$.to,x.push($);else{te.pen=$.to,te.pendingPen=void 0;let he=ec($.to,te.rand);te.x=he.x,te.z=he.z,te.target=he}}S=!0,it(w);for(let $ of _.values())ge($);Q()},setSign(w,z){let b=s.signs.get(w);!b||b.name===z||(b.name=z,$r(b))},select(w){g=w;for(let z of _.values())z.selected=z.spec.id===w&&!z.carried&&!z.burning},burn(w){let z=_.get(w);if(!z||z.hidden||z.burning)return!1;E?.cow===z&&ce(),z.carried=!1,z.selected=!1,z.lift=0,z.leaving=!0,z.pendingPen=void 0;let b=Bp(z.spec.breed.size,$a(z.spec.breed.size)*.95,z.rand);return z.parts.group.add(b.group),z.burning={t:0,fire:b},e.onBurn?.(w),!0},setFilter(w){p=w;for(let z of _.values())ge(z)},screenPosition(w){let z=_.get(w);if(z){if(z.hidden)return;Ge.set(z.x,z.parts.rig.position.y+Pp(z.spec.breed.size),z.z)}else if(w==="john-pork")Ge.copy(s.porkPosition());else{let b=h.position(w);if(!b)return;Ge.set(b.x,b.y,b.z)}if(Ge.project(f),!(Ge.z>1))return{x:(Ge.x+1)/2*n.clientWidth,y:(1-Ge.y)/2*n.clientHeight}},poke(w){return h.poke(w)},setWolves(w){h.setWolves(w.map(Lp))},setUfoOdds(w){l=Math.max(0,Math.floor(w))},setSky(w){s.sky.set(w)},setTour(w){F.setEnabled(w)},setParty(w){s.party.set(w)},setUpsidedownEvery(w){K.setEvery(w)},upsidedownNow(){K.trigger()},setCamera(w,z){L=!0,f.position.set(...w),d.target.set(...z),d.update()},focus(w,z=14){let b=_.get(w),B=b?{x:b.x,y:b.parts.rig.position.y+.9*b.spec.breed.size,z:b.z}:h.position(w);if(!B)return!1;L=!0;let V=f.position.clone().sub(d.target).normalize();return d.target.set(B.x,B.y*.6,B.z),f.position.copy(d.target).addScaledVector(V,Math.max(d.minDistance,z)),d.update(),!0},dispose(){cancelAnimationFrame(Ie),Y.disconnect(),n.removeEventListener("pointermove",me),n.removeEventListener("pointerleave",Te),n.removeEventListener("pointerdown",be),n.removeEventListener("pointerup",nt),n.removeEventListener("dblclick",ee),d.dispose(),h.dispose(),s.sky.dispose();for(let w of oe)w.mesh.geometry.dispose(),w.mesh.material.dispose();for(let w of _.values())Eh(w.parts);_.clear(),i.traverse(w=>{let z=w;z.geometry&&z.geometry.dispose()}),t.dispose()}}}var mm=[{id:"hereford",name:"Hereford",body:"#a3492b",patch:"#f6f1e6",pattern:"whiteface",horns:"short",ears:"up",size:1,muzzle:"#e8c9b8"},{id:"belted-galloway",name:"Belted Galloway",body:"#1c1b1b",patch:"#f3efe4",pattern:"belt",horns:"none",shaggy:!0,ears:"up",size:.95,muzzle:"#2a2727"},{id:"brahman",name:"Brahman",body:"#c9c7c2",pattern:"solid",horns:"short",hump:!0,ears:"droop",size:1.05,muzzle:"#4a4442"},{id:"angus",name:"Angus",body:"#151515",pattern:"solid",horns:"none",ears:"up",size:1,muzzle:"#2b2727"},{id:"holstein",name:"Holstein",body:"#f5f2ec",patch:"#171717",pattern:"patches",horns:"none",ears:"up",size:1.05,muzzle:"#d9a8a0",dairy:!0},{id:"jersey",name:"Jersey",body:"#c58a4b",pattern:"solid",horns:"none",ears:"up",size:.9,muzzle:"#3a2a22",dairy:!0},{id:"highland",name:"Highland",body:"#c8722f",pattern:"solid",horns:"long",shaggy:!0,ears:"up",size:.95,muzzle:"#7a4a2c"},{id:"guernsey",name:"Guernsey",body:"#f3e6cd",patch:"#c8873c",pattern:"patches",horns:"none",ears:"up",size:1,muzzle:"#d8b09a",dairy:!0},{id:"texas-longhorn",name:"Texas Longhorn",body:"#8b5a3c",patch:"#f0e6d8",pattern:"roan",horns:"huge",ears:"up",size:1.05,muzzle:"#5a3a2a"},{id:"charolais",name:"Charolais",body:"#efe4cf",pattern:"solid",horns:"short",ears:"up",size:1.15,muzzle:"#d8b8a0"},{id:"simmental",name:"Simmental",body:"#f4efe6",patch:"#b5572e",pattern:"patches",horns:"short",ears:"up",size:1.1,muzzle:"#e0b8a8"},{id:"limousin",name:"Limousin",body:"#c98b4a",pattern:"solid",horns:"none",ears:"up",size:1.05,muzzle:"#e0c2a0"},{id:"ayrshire",name:"Ayrshire",body:"#f4efe6",patch:"#8e3b2a",pattern:"patches",horns:"long",ears:"up",size:1,muzzle:"#d8a898",dairy:!0},{id:"dexter",name:"Dexter",body:"#241b18",pattern:"solid",horns:"short",ears:"up",size:.7,muzzle:"#3a2a24"},{id:"wagyu",name:"Wagyu",body:"#101011",pattern:"solid",horns:"short",ears:"up",size:1,muzzle:"#2a2626"},{id:"zebu",name:"Zebu",body:"#d8d2c8",pattern:"solid",horns:"short",hump:!0,ears:"droop",size:.8,muzzle:"#5a5250"},{id:"galloway",name:"Galloway",body:"#1f1f1f",pattern:"solid",horns:"none",shaggy:!0,ears:"up",size:.95,muzzle:"#333030"},{id:"shorthorn",name:"Shorthorn",body:"#b45a3c",patch:"#f4ece2",pattern:"roan",horns:"short",ears:"up",size:1.05,muzzle:"#e8c0b0"},{id:"brown-swiss",name:"Brown Swiss",body:"#8f8073",pattern:"solid",horns:"none",ears:"up",size:1.1,muzzle:"#d8cfc4",dairy:!0},{id:"chianina",name:"Chianina",body:"#f7f4ee",pattern:"solid",horns:"short",ears:"up",size:1.25,muzzle:"#3a3535"},{id:"watusi",name:"Ankole-Watusi",body:"#7a3b2a",patch:"#f2e8dc",pattern:"patches",horns:"lyre",ears:"up",size:1.1,muzzle:"#4a2a20"},{id:"pinzgauer",name:"Pinzgauer",body:"#8a4a34",patch:"#f4efe6",pattern:"backstripe",horns:"short",ears:"up",size:1.05,muzzle:"#e0b8a8"},{id:"dutch-belted",name:"Dutch Belted",body:"#1c1c1c",patch:"#f5f2ec",pattern:"belt",horns:"none",ears:"up",size:1,muzzle:"#2c2828",dairy:!0},{id:"gloucester",name:"Gloucester",body:"#3a2a24",patch:"#f4efe6",pattern:"backstripe",horns:"long",ears:"up",size:1,muzzle:"#4a3a34"},{id:"red-poll",name:"Red Poll",body:"#9c3f2c",pattern:"solid",horns:"none",ears:"up",size:.95,muzzle:"#d8a090"},{id:"normande",name:"Normande",body:"#f2ece2",patch:"#7b4a37",pattern:"patches",horns:"short",ears:"up",size:1.05,muzzle:"#d8b0a0",dairy:!0},{id:"murray-grey",name:"Murray Grey",body:"#9a9aa0",pattern:"solid",horns:"none",ears:"up",size:1,muzzle:"#3a3a40"},{id:"white-park",name:"White Park",body:"#f6f4ef",patch:"#1a1a1a",pattern:"solid",horns:"long",ears:"up",size:1.05,muzzle:"#1a1a1a"},{id:"speckle-park",name:"Speckle Park",body:"#f4f1ec",patch:"#1e1e1e",pattern:"roan",horns:"none",ears:"up",size:1,muzzle:"#2a2a2a"},{id:"nguni",name:"Nguni",body:"#f4efe4",patch:"#3a2a22",pattern:"nguni",horns:"long",ears:"up",size:.95,muzzle:"#3a2a22"},{id:"nguni-red",name:"Nguni",body:"#efe6d6",patch:"#8e4a2c",pattern:"nguni",horns:"long",ears:"up",size:.95,muzzle:"#5a3a2a"},{id:"fleckvieh",name:"Fleckvieh",body:"#f6efe4",patch:"#c96a3f",pattern:"patches",horns:"none",ears:"up",size:1.1,muzzle:"#e4bcac",dairy:!0}];function Th(n){return mm[Rn(`${n.repo}#${n.number}`)%mm.length]}var gm=n=>Rn(`${n.number}:${n.repo}`);var GT=`query PastureOpen($query: String!, $cursor: String) {
  prs: search(query: $query, type: ISSUE, first: 100, after: $cursor) {
    issueCount pageInfo { hasNextPage endCursor }
    nodes { ... on PullRequest {
      number title url isDraft createdAt updatedAt reviewDecision mergeStateStatus
      isInMergeQueue mergeQueueEntry { position }
      repository { nameWithOwner isArchived } author { login }
      reviewRequests(first: 10) { totalCount }
      latestReviews(first: 10) { nodes { state submittedAt } }
      timelineItems(last: 5, itemTypes: [REVIEW_REQUESTED_EVENT]) {
        nodes { ... on ReviewRequestedEvent { createdAt } }
      }
      reviewThreads(first: 100) { nodes { isResolved } pageInfo { hasNextPage } }
      commits(last: 1) { nodes { commit { committedDate statusCheckRollup { state } } } }
    } }
  }
}`,VT=`query PastureMerged($query: String!, $cursor: String) {
  prs: search(query: $query, type: ISSUE, first: 100, after: $cursor) {
    issueCount pageInfo { hasNextPage endCursor }
    nodes { ... on PullRequest {
      number title url updatedAt mergedAt repository { nameWithOwner isArchived } author { login }
    } }
  }
}`;function WT(n){let e=n.repository.nameWithOwner,t=n.reviewThreads,i=t?.nodes.filter(g=>!g.isResolved).length??0,s=!t||t.pageInfo.hasNextPage,r=n.commits?.nodes[0]?.commit.statusCheckRollup?.state,o=r==="FAILURE"||r==="ERROR",a=r==="PENDING"||r==="EXPECTED",l=!!n.isInMergeQueue||!!n.mergeQueueEntry,c=(n.latestReviews?.nodes??[]).filter(g=>g.state==="CHANGES_REQUESTED").map(g=>Date.parse(g.submittedAt)||0),u=Math.max(0,...c),h=Math.max(0,...(n.timelineItems?.nodes??[]).map(g=>Date.parse(g.createdAt??"")||0)),f=Date.parse(n.commits?.nodes[0]?.commit.committedDate??"")||0,d=u>0&&(h>u||!!n.reviewRequests?.totalCount&&f>u),m=[l?n.mergeQueueEntry?.position?`Queue #${n.mergeQueueEntry.position}`:"In merge queue":"",o?"Checks failing":a?"Checks running":r==="SUCCESS"?"Checks passed":"No reported checks",n.reviewDecision==="APPROVED"?"Approved":n.reviewDecision==="CHANGES_REQUESTED"?"Changes requested":n.reviewDecision==="REVIEW_REQUIRED"?"Needs approval":"No review decision reported",t?i?`${i} unresolved`:"No unresolved comments in loaded threads":"Review threads unavailable",s?"Review threads incomplete":"",n.mergeStateStatus==="BEHIND"?"Behind base":n.mergeStateStatus==="DIRTY"?"Merge conflicts":""].filter(Boolean),_=n.mergedAt?{pen:"merged",label:"Merged",tone:"muted"}:n.isDraft?{pen:"draft",label:"Draft",tone:"muted"}:l?{pen:"ready",label:"In merge queue",tone:"success"}:n.reviewDecision==="CHANGES_REQUESTED"?{pen:"changes",label:d?"Re-review requested":"Changes requested",tone:"error"}:o?{pen:"awaiting",label:"Checks failing",tone:"error"}:i?{pen:"awaiting",label:"Unresolved comments",tone:"warning"}:s?{pen:"awaiting",label:"Review details incomplete",tone:"warning"}:a?{pen:"awaiting",label:"Checks running",tone:"warning"}:n.mergeStateStatus==="DIRTY"?{pen:"awaiting",label:"Merge conflicts",tone:"error"}:n.mergeStateStatus==="BEHIND"?{pen:"awaiting",label:"Behind base",tone:"warning"}:n.reviewDecision!=="APPROVED"?{pen:"awaiting",label:"Awaiting review",tone:"warning"}:n.mergeStateStatus==="CLEAN"&&(!r||r==="SUCCESS")?{pen:"ready",label:"Ready to merge",tone:"success"}:n.mergeStateStatus==="BLOCKED"?{pen:"awaiting",label:"Merge blocked",tone:"warning"}:{pen:"awaiting",label:"Merge status unavailable",tone:"warning"};return{id:`${e}#${n.number}`,repo:e,number:n.number,title:n.title,url:n.url,author:n.author?.login??"unknown",pen:_.pen,label:_.label,tone:_.tone,detail:n.mergedAt?`Merged ${new Date(n.mergedAt).toLocaleString()}`:m.join(" \xB7 "),updatedAt:n.updatedAt??n.mergedAt??"",mergedAt:n.mergedAt??void 0,queued:l}}async function tc(n,e,t=!1){let i=new Map,s=new Set,r=null,o=0,a=!1;for(let l=0;l<10;l++){let c=await n(t?VT:GT,{query:e,cursor:r});if(c.status!==200)throw new Error(`GitHub returned HTTP ${c.status}`);let u=JSON.parse(c.body);if(u.errors?.length)throw new Error(u.errors.map(f=>f.message).join("; "));let h=u.data?.prs;if(!h||!Array.isArray(h.nodes)||!h.pageInfo||typeof h.issueCount!="number")throw new Error("GitHub returned incomplete search data");o=h.issueCount;for(let f of h.nodes){if(!f?.repository?.nameWithOwner||!f.number||!f.url||!f.title){a=!0;continue}if(f.repository.isArchived)continue;let d=WT(f);i.set(d.id,d)}if(!h.pageInfo.hasNextPage)return{pulls:[...i.values()],total:o,incomplete:a||o>1e3};if(r=h.pageInfo.endCursor,!r||s.has(r))throw new Error("GitHub did not provide the next search page");s.add(r)}return{pulls:[...i.values()],total:o,incomplete:!0}}function _m(n){let e=new Map;for(let t of n)e.set(t.repo,[...e.get(t.repo)??[],t]);return[...e.entries()].sort(([t],[i])=>t.localeCompare(i)).map(([t,i])=>({repo:t,pulls:i.sort((s,r)=>(r.mergedAt??r.updatedAt).localeCompare(s.mergedAt??s.updatedAt)||r.number-s.number)}))}var It=n=>document.getElementById(n),io=kc(),ar=It("status"),nc=It("tip"),XT=It("detail"),lr=It("history"),Ni=new Map,ym=15*6e4,Li,fi=!1,Em,rc=0,or=0,sc=!1,ic=!1,Bn="pasture",mn,to,Ui,cr=!1,Qr=!1,cs="",Mh=0,wh=0,Sm=0,ls="",no="",vh=!1,eo=!1,Tm=Yc(It("view-tabs"),{items:[{id:"pasture",label:"Pasture"},{id:"list",label:"PR list"}],activeId:Bn,trackBackground:!0,onChange(n){Bn=n,Tm.update({activeId:Bn}),It("field").hidden=Bn!=="pasture",It("field-help").hidden=Bn!=="pasture",It("tour").hidden=Bn!=="pasture",It("list").hidden=Bn!=="list",Rh()}});io.onReady(n=>Hc(n,document.documentElement));var us=pm(It("scene"),{onHover(n){let e=n?.kind==="cow"?Ni.get(n.id):void 0;nc.hidden=!e,nc.textContent=e?`${e.title} \xB7 ${e.id} \xB7 ${e.detail}`:""},onSelect(n){if(n?.kind==="critter"){let e=us.poke(n.id);e&&(nc.hidden=!1,nc.textContent=e);return}ur(n?.id)},onOpen(n){vm(n)}}),xm=Qp(new Date);us.setSky({altitude:xm.altitude,azimuth:xm.azimuth,weather:null});function ur(n){Li=n,us.select(n);let e=n?Ni.get(n):void 0;XT.hidden=!e,e&&(It("title").textContent=e.title,It("meta").textContent=`${e.id} \xB7 ${e.author} \xB7 ${e.pen}`,It("explanation").textContent=e.detail)}async function vm(n){let e=n?Ni.get(n):void 0;e&&await Mm(e)}async function Mm(n){await io.openUrl(n.url).catch(()=>{ar.textContent="Could not open the PR in OpenChamber."})}var bh=async(n,e)=>io.request({method:"POST",path:"/graphql",body:JSON.stringify({query:n,variables:e})});function bm(n){return new Date(Date.now()-n*864e5).toISOString().slice(0,10)}function Rh(){if(!fi){ar.textContent="Connect a GitHub token in Settings \u2192 Integrations \u2192 Pasture GitHub.";return}if(!mn){ar.textContent=ls||"Loading your pull requests\u2026";return}let n=[ls?`Open PR refresh failed; showing the last successful results. ${ls}`:`${mn.pulls.length} open \xB7 updated ${new Date(Sm).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}`,mn.incomplete?"Some open PRs could not be loaded; GitHub search may be limited.":"",Bn==="pasture"&&no?`Recent merges could not be refreshed. ${no}`:"",Bn==="pasture"&&to?.incomplete?"Some recent merges could not be loaded.":"",Bn==="pasture"&&mn.pulls.length+(to?.pulls.length??0)>150?"The field shows up to 150 cows; the PR list shows open PRs separately.":""].filter(Boolean);ar.textContent=n.join(" \xB7 ")}function $T(n){let e=Date.now()-Date.parse(n);return Number.isFinite(e)?e<6e4?"just now":e<36e5?`${Math.floor(e/6e4)}m ago`:e<864e5?`${Math.floor(e/36e5)}h ago`:`${Math.floor(e/864e5)}d ago`:""}function Am(n,e,t){let i=document.activeElement instanceof HTMLElement&&n.contains(document.activeElement)?document.activeElement.dataset.prId:void 0;if(n.replaceChildren(),!e.length){let s=document.createElement("p");s.className="empty",s.textContent=t,n.append(s);return}for(let s of _m(e)){let r=document.createElement("section");r.className="repo";let o=document.createElement("h3");o.className="repo-heading",o.textContent=s.repo;let a=document.createElement("span");a.className="repo-count",a.textContent=String(s.pulls.length),o.append(a);let l=document.createElement("div");l.className="rows";for(let c of s.pulls){let u=document.createElement("button");u.type="button",u.className="pr-row",u.dataset.prId=c.id,u.addEventListener("click",()=>void Mm(c));let h=document.createElement("span");h.className="pr-state",h.dataset.tone=c.tone,h.textContent=c.label;let f=document.createElement("span");f.className="pr-main";let d=document.createElement("span");d.className="pr-name";let m=document.createElement("span");m.className="pr-number",m.textContent=`#${c.number}`,d.append(m,document.createTextNode(c.title));let _=document.createElement("span");_.className="pr-detail",_.textContent=c.detail,f.append(d,_);let g=document.createElement("span");g.className="pr-time",g.textContent=$T(c.mergedAt??c.updatedAt),(c.mergedAt??c.updatedAt)&&(g.title=new Date(c.mergedAt??c.updatedAt).toLocaleString()),u.append(h,f,g),l.append(u)}r.append(o,l),n.append(r)}i&&[...n.querySelectorAll(".pr-row")].find(s=>s.dataset.prId===i)?.focus({preventScroll:!0})}function wm(){It("open-count").textContent=mn?`${mn.pulls.length} open \xB7 newest updates first`:"",Am(It("open-list"),mn?.pulls??[],fi?ls&&!mn?"Could not load your PRs. Use Refresh to try again.":mn?"No open pull requests.":"Loading your pull requests\u2026":"Connect Pasture GitHub in Settings \u2192 Integrations to see your PRs.")}function Ah(){It("history-count").textContent=cr?" \xB7 refreshing\u2026":Ui?` \xB7 ${Ui.pulls.length}`:"";let n=It("history-list");Am(n,Ui?.pulls??[],cr?"Loading recent merges\u2026":cs?`Could not load recent merges. ${cs} Use Refresh to try again.`:"No pull requests merged in the last 30 days.");let e=[cs&&Ui?`Refresh failed; showing the last successful results. ${cs}`:"",Ui?.incomplete?"Some merges could not be loaded; GitHub search may be limited.":""].filter(Boolean).join(" ");if(e){let t=document.createElement("p");t.className="empty",t.textContent=e,n.prepend(t)}}async function oc(){if(!fi)return;if(vh){eo=!0;return}vh=!0;let n=++rc;ar.textContent=sc?"Refreshing GitHub\u2026":"Loading your pull requests\u2026";try{let[e,t]=await Promise.allSettled([tc(bh,"is:pr is:open author:@me archived:false sort:updated-desc"),tc(bh,`is:pr is:merged author:@me merged:>=${bm(7)} sort:updated-desc`,!0)]);if(n!==rc)return;if(e.status==="fulfilled"?(mn=e.value,Sm=Date.now(),ls=""):ls=e.reason instanceof Error?e.reason.message:"Please check your connection.",t.status==="fulfilled"?(to=t.value,no=""):no=t.reason instanceof Error?t.reason.message:"Please check your connection.",mn){let i=[...mn.pulls,...to?.pulls??[]].slice(0,150);Ni.clear();for(let r of i)Ni.set(r.id,r);let s=xp(i.map(r=>r.author));us.setCows(i.map(r=>({id:r.id,breed:Th(r),seed:gm(r),pen:r.pen,author:r.author,collar:yp(s.get(r.author)??""),queued:r.queued})),sc),Li&&!Ni.has(Li)?ur(void 0):Li&&ur(Li),sc=!0}Rh(),wm()}finally{vh=!1,eo&&fi&&(eo=!1,oc())}}async function so(n=!1){if(!fi||Ui&&!n&&Date.now()-Mh<ym)return;if(cr){n&&(Qr=!0);return}let e=++or;cr=!0,wh=Date.now(),cs="",Ah();try{let i=await tc(bh,`is:pr is:merged author:@me merged:>=${bm(30)} sort:updated-desc`,!0);if(e!==or)return;Ui=i,Mh=Date.now()}catch(i){if(e!==or)return;cs=i instanceof Error?i.message:"Please check your connection."}if(e!==or)return;cr=!1,Ah();let t=Qr;Qr=!1,t&&fi&&lr.open&&so(!0)}It("refresh").onclick=()=>{oc(),lr.open&&so(!0)};lr.addEventListener("toggle",()=>{lr.open&&so()});It("tour").onclick=n=>{ic=!ic,us.setTour(ic),n.currentTarget.setAttribute("aria-pressed",String(ic))};It("down").onclick=()=>ur(void 0);It("open").onclick=()=>void vm(Li);It("moo").onclick=()=>{let n=Li?Ni.get(Li):void 0;if(!n)return;let e=new Audio("moo.mp3");e.preservesPitch=!1,e.playbackRate=Math.min(1.5,Math.max(.7,1.05/Math.max(.6,Th(n).size))),e.play().catch(()=>{ar.textContent="Sound could not be played in this panel."})};window.addEventListener("keydown",n=>{n.key==="Escape"&&ur(void 0)});io.onConnection(n=>{let e=JSON.stringify(n);Em!==e&&(Em=e,rc++,or++,fi=n.connected,Ni.clear(),us.setCows([],!1),ur(void 0),sc=!1,mn=void 0,to=void 0,Ui=void 0,cr=!1,Qr=!1,cs="",Mh=0,wh=0,ls="",no="",eo=!1,Rh(),wm(),Ah(),fi&&(oc(),lr.open&&so()))});var qT=window.setInterval(()=>{oc(),lr.open&&Date.now()-wh>=ym&&so(!0)},6e4);window.addEventListener("pagehide",()=>{fi=!1,eo=!1,Qr=!1,rc++,or++,clearInterval(qT),us.dispose(),Tm.dispose(),io.dispose()},{once:!0});})();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
