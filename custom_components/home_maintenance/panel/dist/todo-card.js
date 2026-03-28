var bt=Object.defineProperty;var wt=Object.getOwnPropertyDescriptor;var _=(r,t,e,s)=>{for(var o=s>1?void 0:s?wt(t,e):t,n=r.length-1,i;n>=0;n--)(i=r[n])&&(o=(s?i(t,e,o):i(o))||o);return s&&o&&bt(t,e,o),o};var I=globalThis,F=I.ShadowRoot&&(I.ShadyCSS===void 0||I.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Y=Symbol(),rt=new WeakMap,P=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==Y)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(F&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=rt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&rt.set(e,t))}return t}toString(){return this.cssText}},nt=r=>new P(typeof r=="string"?r:r+"",void 0,Y),K=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,o,n)=>s+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+r[n+1],r[0]);return new P(e,r,Y)},at=(r,t)=>{if(F)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),o=I.litNonce;o!==void 0&&s.setAttribute("nonce",o),s.textContent=e.cssText,r.appendChild(s)}},G=F?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return nt(e)})(r):r;var{is:At,defineProperty:kt,getOwnPropertyDescriptor:St,getOwnPropertyNames:Et,getOwnPropertySymbols:Ct,getPrototypeOf:Tt}=Object,$=globalThis,ct=$.trustedTypes,Pt=ct?ct.emptyScript:"",Dt=$.reactiveElementPolyfillSupport,D=(r,t)=>r,U={toAttribute(r,t){switch(t){case Boolean:r=r?Pt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},B=(r,t)=>!At(r,t),lt={attribute:!0,type:String,converter:U,reflect:!1,useDefault:!1,hasChanged:B};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),$.litPropertyMetadata??($.litPropertyMetadata=new WeakMap);var v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=lt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),o=this.getPropertyDescriptor(t,s,e);o!==void 0&&kt(this.prototype,t,o)}}static getPropertyDescriptor(t,e,s){let{get:o,set:n}=St(this.prototype,t)??{get(){return this[e]},set(i){this[e]=i}};return{get:o,set(i){let c=o?.call(this);n?.call(this,i),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??lt}static _$Ei(){if(this.hasOwnProperty(D("elementProperties")))return;let t=Tt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(D("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(D("properties"))){let e=this.properties,s=[...Et(e),...Ct(e)];for(let o of s)this.createProperty(o,e[o])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,o]of e)this.elementProperties.set(s,o)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let o=this._$Eu(e,s);o!==void 0&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let o of s)e.unshift(G(o))}else t!==void 0&&e.push(G(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return at(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,s);if(o!==void 0&&s.reflect===!0){let n=(s.converter?.toAttribute!==void 0?s.converter:U).toAttribute(e,s.type);this._$Em=t,n==null?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(t,e){let s=this.constructor,o=s._$Eh.get(t);if(o!==void 0&&this._$Em!==o){let n=s.getPropertyOptions(o),i=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:U;this._$Em=o;let c=i.fromAttribute(e,n.type);this[o]=c??this._$Ej?.get(o)??c,this._$Em=null}}requestUpdate(t,e,s,o=!1,n){if(t!==void 0){let i=this.constructor;if(o===!1&&(n=this[t]),s??(s=i.getPropertyOptions(t)),!((s.hasChanged??B)(n,e)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:o,wrapped:n},i){s&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,i??e??this[t]),n!==!0||i!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),o===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[o,n]of this._$Ep)this[o]=n;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[o,n]of s){let{wrapped:i}=n,c=this[o];i!==!0||this._$AL.has(o)||c===void 0||this.C(o,void 0,n,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[D("elementProperties")]=new Map,v[D("finalized")]=new Map,Dt?.({ReactiveElement:v}),($.reactiveElementVersions??($.reactiveElementVersions=[])).push("2.1.2");var N=globalThis,dt=r=>r,V=N.trustedTypes,ht=V?V.createPolicy("lit-html",{createHTML:r=>r}):void 0,_t="$lit$",x=`lit$${Math.random().toFixed(9).slice(2)}$`,vt="?"+x,Ut=`<${vt}>`,S=document,R=()=>S.createComment(""),M=r=>r===null||typeof r!="object"&&typeof r!="function",ot=Array.isArray,Ot=r=>ot(r)||typeof r?.[Symbol.iterator]=="function",J=`[ 	
\f\r]`,O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,pt=/-->/g,ut=/>/g,A=RegExp(`>|${J}(?:([^\\s"'>=/]+)(${J}*=${J}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),mt=/'/g,gt=/"/g,yt=/^(?:script|style|textarea|title)$/i,it=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),u=it(1),Vt=it(2),Wt=it(3),E=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),ft=new WeakMap,k=S.createTreeWalker(S,129);function $t(r,t){if(!ot(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return ht!==void 0?ht.createHTML(t):t}var Nt=(r,t)=>{let e=r.length-1,s=[],o,n=t===2?"<svg>":t===3?"<math>":"",i=O;for(let c=0;c<e;c++){let a=r[c],p,l,h=-1,m=0;for(;m<a.length&&(i.lastIndex=m,l=i.exec(a),l!==null);)m=i.lastIndex,i===O?l[1]==="!--"?i=pt:l[1]!==void 0?i=ut:l[2]!==void 0?(yt.test(l[2])&&(o=RegExp("</"+l[2],"g")),i=A):l[3]!==void 0&&(i=A):i===A?l[0]===">"?(i=o??O,h=-1):l[1]===void 0?h=-2:(h=i.lastIndex-l[2].length,p=l[1],i=l[3]===void 0?A:l[3]==='"'?gt:mt):i===gt||i===mt?i=A:i===pt||i===ut?i=O:(i=A,o=void 0);let g=i===A&&r[c+1].startsWith("/>")?" ":"";n+=i===O?a+Ut:h>=0?(s.push(p),a.slice(0,h)+_t+a.slice(h)+x+g):a+x+(h===-2?c:g)}return[$t(r,n+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},H=class r{constructor({strings:t,_$litType$:e},s){let o;this.parts=[];let n=0,i=0,c=t.length-1,a=this.parts,[p,l]=Nt(t,e);if(this.el=r.createElement(p,s),k.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(o=k.nextNode())!==null&&a.length<c;){if(o.nodeType===1){if(o.hasAttributes())for(let h of o.getAttributeNames())if(h.endsWith(_t)){let m=l[i++],g=o.getAttribute(h).split(x),w=/([.?@])?(.*)/.exec(m);a.push({type:1,index:n,name:w[2],strings:g,ctor:w[1]==="."?X:w[1]==="?"?tt:w[1]==="@"?et:T}),o.removeAttribute(h)}else h.startsWith(x)&&(a.push({type:6,index:n}),o.removeAttribute(h));if(yt.test(o.tagName)){let h=o.textContent.split(x),m=h.length-1;if(m>0){o.textContent=V?V.emptyScript:"";for(let g=0;g<m;g++)o.append(h[g],R()),k.nextNode(),a.push({type:2,index:++n});o.append(h[m],R())}}}else if(o.nodeType===8)if(o.data===vt)a.push({type:2,index:n});else{let h=-1;for(;(h=o.data.indexOf(x,h+1))!==-1;)a.push({type:7,index:n}),h+=x.length-1}n++}}static createElement(t,e){let s=S.createElement("template");return s.innerHTML=t,s}};function C(r,t,e=r,s){if(t===E)return t;let o=s!==void 0?e._$Co?.[s]:e._$Cl,n=M(t)?void 0:t._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),n===void 0?o=void 0:(o=new n(r),o._$AT(r,e,s)),s!==void 0?(e._$Co??(e._$Co=[]))[s]=o:e._$Cl=o),o!==void 0&&(t=C(r,o._$AS(r,t.values),o,s)),t}var Z=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,o=(t?.creationScope??S).importNode(e,!0);k.currentNode=o;let n=k.nextNode(),i=0,c=0,a=s[0];for(;a!==void 0;){if(i===a.index){let p;a.type===2?p=new z(n,n.nextSibling,this,t):a.type===1?p=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(p=new st(n,this,t)),this._$AV.push(p),a=s[++c]}i!==a?.index&&(n=k.nextNode(),i++)}return k.currentNode=S,o}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},z=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,o){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=C(this,t,e),M(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==E&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ot(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&M(this._$AH)?this._$AA.nextSibling.data=t:this.T(S.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,o=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=H.createElement($t(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===o)this._$AH.p(e);else{let n=new Z(o,this),i=n.u(this.options);n.p(e),this.T(i),this._$AH=n}}_$AC(t){let e=ft.get(t.strings);return e===void 0&&ft.set(t.strings,e=new H(t)),e}k(t){ot(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,o=0;for(let n of t)o===e.length?e.push(s=new r(this.O(R()),this.O(R()),this,this.options)):s=e[o],s._$AI(n),o++;o<e.length&&(this._$AR(s&&s._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=dt(t).nextSibling;dt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},T=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,o,n){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(t,e=this,s,o){let n=this.strings,i=!1;if(n===void 0)t=C(this,t,e,0),i=!M(t)||t!==this._$AH&&t!==E,i&&(this._$AH=t);else{let c=t,a,p;for(t=n[0],a=0;a<n.length-1;a++)p=C(this,c[s+a],e,a),p===E&&(p=this._$AH[a]),i||(i=!M(p)||p!==this._$AH[a]),p===d?t=d:t!==d&&(t+=(p??"")+n[a+1]),this._$AH[a]=p}i&&!o&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},X=class extends T{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}},tt=class extends T{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}},et=class extends T{constructor(t,e,s,o,n){super(t,e,s,o,n),this.type=5}_$AI(t,e=this){if((t=C(this,t,e,0)??d)===E)return;let s=this._$AH,o=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==d&&(s===d||o);o&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},st=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){C(this,t)}};var Rt=N.litHtmlPolyfillSupport;Rt?.(H,z),(N.litHtmlVersions??(N.litHtmlVersions=[])).push("3.3.2");var xt=(r,t,e)=>{let s=e?.renderBefore??t,o=s._$litPart$;if(o===void 0){let n=e?.renderBefore??null;s._$litPart$=o=new z(t.insertBefore(R(),n),n,void 0,e??{})}return o._$AI(r),o};var L=globalThis,y=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;let t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=xt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return E}};y._$litElement$=!0,y.finalized=!0,L.litElementHydrateSupport?.({LitElement:y});var Mt=L.litElementPolyfillSupport;Mt?.({LitElement:y});(L.litElementVersions??(L.litElementVersions=[])).push("4.2.2");var Ht={attribute:!0,type:String,converter:U,reflect:!1,hasChanged:B},zt=(r=Ht,t,e)=>{let{kind:s,metadata:o}=e,n=globalThis.litPropertyMetadata.get(o);if(n===void 0&&globalThis.litPropertyMetadata.set(o,n=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),n.set(e.name,r),s==="accessor"){let{name:i}=e;return{set(c){let a=t.get.call(this);t.set.call(this,c),this.requestUpdate(i,a,r,!0,c)},init(c){return c!==void 0&&this.C(i,void 0,r,c),c}}}if(s==="setter"){let{name:i}=e;return function(c){let a=this[i];t.call(this,c),this.requestUpdate(i,a,r,!0,c)}}throw Error("Unsupported decorator location: "+s)};function j(r){return(t,e)=>typeof e=="object"?zt(r,t,e):((s,o,n)=>{let i=o.hasOwnProperty(n);return o.constructor.createProperty(n,s),i?Object.getOwnPropertyDescriptor(o,n):void 0})(r,t,e)}function b(r){return j({...r,state:!0,attribute:!1})}var Q={title:"Home Maintenance",due_soon_days:14,max_items:0,show_search:!0},Lt=14,f=class extends y{constructor(){super(...arguments);this._config=Q;this._tasks=[];this._completing=new Set;this._expandedTasks=new Set;this._searchQuery="";this._assigneeFilter="";this._connected=!1}setConfig(e){this._config={...Q,...e}}static getConfigElement(){return document.createElement("home-maintenance-todo-card-editor")}static getStubConfig(){return{title:"Home Maintenance",due_soon_days:14}}getCardSize(){return 3+this._tasks.length}connectedCallback(){super.connectedCallback(),this._connected=!0,this._loadTasks(),this._refreshInterval=window.setInterval(()=>this._loadTasks(),6e4)}disconnectedCallback(){super.disconnectedCallback(),this._connected=!1,this._refreshInterval&&(clearInterval(this._refreshInterval),this._refreshInterval=void 0)}updated(e){e.has("hass")&&this._tasks.length===0&&this._loadTasks()}async _loadTasks(){if(!(!this.hass||!this._connected))try{this._tasks=await this.hass.callWS({type:"home_maintenance/get_tasks"})}catch{}}_computeTask(e){let s=new Date;s.setHours(0,0,0,0);let o;if(e.schedule_type==="fixed_date"&&e.next_due_date){let[l]=e.next_due_date.split("T"),[h,m,g]=l.split("-").map(Number);o=new Date(h,m-1,g)}else{let[l]=e.last_performed.split("T"),[h,m,g]=l.split("-").map(Number);switch(o=new Date(h,m-1,g),e.interval_type){case"days":o.setDate(o.getDate()+e.interval_value);break;case"weeks":o.setDate(o.getDate()+e.interval_value*7);break;case"months":o.setMonth(o.getMonth()+e.interval_value);break;case"years":o.setFullYear(o.getFullYear()+e.interval_value);break}}o.setHours(0,0,0,0);let n=o.getTime()-s.getTime(),i=Math.ceil(n/(1e3*60*60*24)),c=this._config.due_soon_days??Lt,a;i<=0?a="overdue":i<=c?a="due_soon":a="upcoming";let p=!1;if(e.last_performed){let[l]=e.last_performed.split("T"),[h,m,g]=l.split("-").map(Number),w=new Date(h,m-1,g);w.setHours(0,0,0,0),p=w.getTime()===s.getTime()}return{raw:e,nextDue:o,daysUntilDue:i,status:a,completedToday:p}}get _filteredTasks(){let e=this._tasks.map(s=>this._computeTask(s));if(this._searchQuery.trim()){let s=this._searchQuery.toLowerCase();e=e.filter(o=>o.raw.title.toLowerCase().includes(s)||o.raw.notes&&o.raw.notes.toLowerCase().includes(s)||o.raw.assigned_to&&this._getPersonName(o.raw.assigned_to).toLowerCase().includes(s))}return this._assigneeFilter&&(e=e.filter(s=>s.raw.assigned_to===this._assigneeFilter)),e}_groupTasks(e){let s=[],o=[],n=[];for(let c of e)c.status==="overdue"?s.push(c):c.status==="due_soon"?o.push(c):n.push(c);let i=(c,a)=>c.nextDue.getTime()-a.nextDue.getTime();return s.sort(i),o.sort(i),n.sort(i),{overdue:s,due_soon:o,upcoming:n}}get _uniqueAssignees(){let e=new Set;for(let s of this._tasks)s.assigned_to?.trim()&&e.add(s.assigned_to.trim());return Array.from(e).sort()}_formatDaysLabel(e){if(e===0)return"Due today";if(e<0){let s=Math.abs(e);return s===1?"1 day overdue":`${s} days overdue`}return e===1?"Due in 1 day":`${e} days left`}_formatDate(e){let s=e.getMonth()+1,o=e.getDate(),n=e.getFullYear();return`${s}/${o}/${n}`}_formatHistoryDate(e){let[s]=e.split("T"),[o,n,i]=s.split("-").map(Number);return`${n}/${i}/${o}`}_getPersonName(e){return!this.hass||!e?e||"":this.hass.states[e]?.attributes?.friendly_name||e.replace("person.","")}_getIntervalLabel(e){if(e.schedule_type==="fixed_date")return"Fixed date"+(e.annual_recurrence?" (Annual)":"");let s=e.interval_value,o=e.interval_type,i=s===1?o.slice(0,-1):o;return`${s} ${i.charAt(0).toUpperCase()+i.slice(1)}`}async _completeTask(e){if(this._completing.has(e))return;let s=new Set(this._completing);s.add(e),this._completing=s;try{await this.hass.callWS({type:"home_maintenance/complete_task",task_id:e}),await this._loadTasks()}catch(n){console.error("Failed to complete task:",n)}let o=new Set(this._completing);o.delete(e),this._completing=o}async _removeTask(e){if(confirm("Remove this task?"))try{await this.hass.callWS({type:"home_maintenance/remove_task",task_id:e}),await this._loadTasks()}catch(s){console.error("Failed to remove task:",s)}}_toggleExpand(e){let s=new Set(this._expandedTasks);s.has(e)?s.delete(e):s.add(e),this._expandedTasks=s}_openPanel(){window.location.href="/home-maintenance"}render(){if(!this.hass)return u``;let e=this._filteredTasks,s=this._groupTasks(e),o=this._config.max_items??0,n=this._config.show_search??!0,i=[...s.overdue,...s.due_soon,...s.upcoming];o>0&&(i=i.slice(0,o));let c=i.filter(l=>l.status==="overdue"),a=i.filter(l=>l.status==="due_soon"),p=i.filter(l=>l.status==="upcoming");return u`
            <ha-card>
                ${this._config.title?u`
                    <div class="card-header">
                        <span class="title">${this._config.title}</span>
                        <ha-icon-button
                            class="panel-link"
                            @click=${this._openPanel}
                            title="Open full panel"
                        >
                            <ha-icon icon="mdi:open-in-new"></ha-icon>
                        </ha-icon-button>
                    </div>
                `:d}

                ${n?u`
                    <div class="filter-bar">
                        <div class="search-box">
                            <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
                            <input
                                type="text"
                                .value=${this._searchQuery}
                                @input=${l=>this._searchQuery=l.target.value}
                                placeholder="Search tasks..."
                            />
                            ${this._searchQuery?u`
                                <ha-icon-button @click=${()=>this._searchQuery=""}>
                                    <ha-icon icon="mdi:close"></ha-icon>
                                </ha-icon-button>
                            `:d}
                        </div>
                        ${this._uniqueAssignees.length>0?u`
                            <select
                                class="assignee-filter"
                                .value=${this._assigneeFilter}
                                @change=${l=>this._assigneeFilter=l.target.value}
                            >
                                <option value="">All assignees</option>
                                ${this._uniqueAssignees.map(l=>u`
                                    <option value=${l} ?selected=${this._assigneeFilter===l}>${this._getPersonName(l)}</option>
                                `)}
                            </select>
                        `:d}
                    </div>
                `:d}

                <div class="task-list">
                    ${c.length>0?u`
                        <div class="group-header group-overdue">
                            <span class="group-dot dot-overdue"></span>
                            OVERDUE
                            <span class="group-count">(${c.length})</span>
                        </div>
                        ${c.map(l=>this._renderTaskCard(l))}
                    `:d}

                    ${a.length>0?u`
                        <div class="group-header group-due-soon">
                            <span class="group-dot dot-due-soon"></span>
                            DUE SOON
                            <span class="group-count">(${a.length})</span>
                        </div>
                        ${a.map(l=>this._renderTaskCard(l))}
                    `:d}

                    ${p.length>0?u`
                        <div class="group-header group-upcoming">
                            <span class="group-dot dot-upcoming"></span>
                            UPCOMING
                            <span class="group-count">(${p.length})</span>
                        </div>
                        ${p.map(l=>this._renderTaskCard(l))}
                    `:d}

                    ${i.length===0?u`
                        <div class="empty">No tasks found</div>
                    `:d}
                </div>
            </ha-card>
        `}_renderTaskCard(e){let s=e.raw,o=this._expandedTasks.has(s.id),n=this._completing.has(s.id);return u`
            <div class="task-card ${e.status} ${n?"completing":""} ${e.completedToday?"done-today":""}">
                <div class="task-card-main" @click=${()=>this._toggleExpand(s.id)}>
                    <div class="task-left">
                        ${e.completedToday?u`
                            <ha-icon class="task-icon done-check" icon="mdi:check-circle"></ha-icon>
                        `:s.icon?u`<ha-icon class="task-icon" .icon=${s.icon}></ha-icon>`:d}
                        <div class="task-info">
                            <div class="task-title">${s.title}${e.completedToday?u`<span class="done-badge">Done</span>`:d}</div>
                            <div class="task-meta">
                                <span class="task-interval">${this._getIntervalLabel(s)}</span>
                                ${s.assigned_to?u`
                                    <span class="task-assignee">${this._getPersonName(s.assigned_to)}</span>
                                `:d}
                            </div>
                        </div>
                    </div>
                    <div class="task-right">
                        <div class="task-due-info">
                            <span class="due-date">${this._formatDate(e.nextDue)}</span>
                            <span class="due-days ${e.status}">${this._formatDaysLabel(e.daysUntilDue)}</span>
                        </div>
                        <div class="task-actions">
                            <ha-icon-button
                                @click=${i=>{i.stopPropagation(),this._completeTask(s.id)}}
                                title="Complete"
                                ?disabled=${n}
                            >
                                <ha-icon icon="mdi:check-circle-outline"></ha-icon>
                            </ha-icon-button>
                            <ha-icon-button
                                @click=${i=>{i.stopPropagation(),this._openPanel()}}
                                title="Edit"
                            >
                                <ha-icon icon="mdi:pencil"></ha-icon>
                            </ha-icon-button>
                            <ha-icon-button
                                @click=${i=>{i.stopPropagation(),this._removeTask(s.id)}}
                                title="Remove"
                            >
                                <ha-icon icon="mdi:delete"></ha-icon>
                            </ha-icon-button>
                            <ha-icon-button
                                @click=${i=>{i.stopPropagation(),this._toggleExpand(s.id)}}
                            >
                                <ha-icon icon=${o?"mdi:chevron-up":"mdi:chevron-down"}></ha-icon>
                            </ha-icon-button>
                        </div>
                    </div>
                </div>

                ${o?u`
                    <div class="task-expanded">
                        ${s.notes?u`
                            <div class="task-section">
                                <div class="section-label">Notes</div>
                                <div class="section-content notes-content">${s.notes}</div>
                            </div>
                        `:d}

                        <div class="task-section">
                            <div class="section-label">Last Performed</div>
                            <div class="section-content">
                                ${s.last_performed?this._formatHistoryDate(s.last_performed):"-"}
                            </div>
                        </div>

                        ${s.completion_history&&s.completion_history.length>0?u`
                            <div class="task-section">
                                <div class="section-label">Completion History</div>
                                <div class="history-list">
                                    ${s.completion_history.slice().reverse().map(i=>u`
                                        <div class="history-item">
                                            <span class="history-date">${this._formatHistoryDate(i.timestamp)}</span>
                                            ${i.completed_by?u`
                                                <span class="history-who">${i.completed_by}</span>
                                            `:d}
                                            ${i.note?u`
                                                <span class="history-note">${i.note}</span>
                                            `:d}
                                        </div>
                                    `)}
                                </div>
                            </div>
                        `:d}
                    </div>
                `:d}
            </div>
        `}};f.styles=K`
        :host {
            --todo-overdue: var(--error-color, #db4437);
            --todo-due-soon: var(--warning-color, #ffa726);
            --todo-upcoming: var(--success-color, #43a047);
        }

        ha-card {
            overflow: hidden;
        }

        /* Header */
        .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 8px 0 16px;
        }

        .card-header .title {
            font-size: 18px;
            font-weight: 500;
            color: var(--primary-text-color);
        }

        .panel-link {
            --mdc-icon-button-size: 36px;
            color: var(--secondary-text-color);
        }

        /* Filter bar */
        .filter-bar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px 0;
            flex-wrap: wrap;
        }

        .search-box {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 150px;
            background: var(--secondary-background-color);
            border: 1px solid var(--divider-color);
            border-radius: 8px;
            padding: 4px 10px;
        }

        .search-icon {
            color: var(--secondary-text-color);
            margin-right: 6px;
            --mdc-icon-size: 20px;
            flex-shrink: 0;
        }

        .search-box input {
            border: none;
            outline: none;
            background: transparent;
            color: var(--primary-text-color);
            font-size: 14px;
            flex: 1;
            padding: 6px 0;
        }

        .search-box input::placeholder {
            color: var(--secondary-text-color);
        }

        .search-box ha-icon-button {
            --mdc-icon-button-size: 28px;
            color: var(--secondary-text-color);
        }

        .assignee-filter {
            background: var(--secondary-background-color);
            border: 1px solid var(--divider-color);
            border-radius: 8px;
            padding: 8px 10px;
            color: var(--primary-text-color);
            font-size: 13px;
        }

        /* Task list */
        .task-list {
            padding: 8px 0 12px;
        }

        /* Group headers */
        .group-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.5px;
            padding: 12px 16px 6px;
        }

        .group-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .dot-overdue { background: var(--todo-overdue); }
        .dot-due-soon { background: var(--todo-due-soon); }
        .dot-upcoming { background: var(--todo-upcoming); }

        .group-overdue { color: var(--todo-overdue); }
        .group-due-soon { color: var(--todo-due-soon); }
        .group-upcoming { color: var(--todo-upcoming); }

        .group-count {
            font-weight: 400;
            opacity: 0.7;
        }

        /* Task cards */
        .task-card {
            background: var(--card-background-color, var(--ha-card-background, white));
            border-radius: 12px;
            margin: 6px 12px;
            border-left: 4px solid transparent;
            box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0,0,0,0.14));
            overflow: hidden;
            transition: box-shadow 0.2s ease, opacity 0.3s ease;
        }

        .task-card:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .task-card.overdue { border-left-color: var(--todo-overdue); }
        .task-card.due_soon { border-left-color: var(--todo-due-soon); }
        .task-card.upcoming { border-left-color: var(--todo-upcoming); }

        .task-card.completing { opacity: 0.4; }

        .task-card.done-today {
            opacity: 0.55;
            border-left-color: var(--secondary-text-color) !important;
        }

        .task-card.done-today .task-title {
            text-decoration: line-through;
            color: var(--secondary-text-color);
        }

        .done-check {
            color: var(--todo-upcoming) !important;
        }

        .done-badge {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            background: var(--todo-upcoming);
            color: var(--text-primary-color, white);
            border-radius: 4px;
            padding: 1px 6px;
            margin-left: 8px;
            text-decoration: none;
            display: inline-block;
            vertical-align: middle;
            letter-spacing: 0.3px;
        }

        .task-card-main {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 6px 10px 14px;
            cursor: pointer;
            gap: 8px;
        }

        .task-left {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            min-width: 0;
        }

        .task-icon {
            flex-shrink: 0;
            color: var(--secondary-text-color);
            --mdc-icon-size: 24px;
        }

        .task-info {
            min-width: 0;
            flex: 1;
        }

        .task-title {
            font-size: 15px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .task-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--secondary-text-color);
            margin-top: 2px;
        }

        .task-assignee {
            background: var(--primary-color);
            color: var(--text-primary-color, white);
            border-radius: 10px;
            padding: 1px 8px;
            font-size: 11px;
            font-weight: 500;
        }

        .task-right {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }

        .task-due-info {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            white-space: nowrap;
        }

        .due-date {
            font-size: 13px;
            color: var(--secondary-text-color);
        }

        .due-days {
            font-size: 12px;
            font-weight: 600;
        }

        .due-days.overdue { color: var(--todo-overdue); }
        .due-days.due_soon { color: var(--todo-due-soon); }
        .due-days.upcoming { color: var(--todo-upcoming); }

        .task-actions {
            display: flex;
            align-items: center;
        }

        .task-actions ha-icon-button {
            --mdc-icon-button-size: 34px;
            color: var(--secondary-text-color);
        }

        /* Expanded section */
        .task-expanded {
            padding: 0 14px 14px;
            border-top: 1px solid var(--divider-color);
        }

        .task-section {
            margin-top: 10px;
        }

        .section-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--secondary-text-color);
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .section-content {
            font-size: 14px;
        }

        .notes-content {
            white-space: pre-wrap;
            background: var(--secondary-background-color);
            border-radius: 8px;
            padding: 8px 12px;
        }

        .history-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .history-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            padding: 3px 0;
            border-bottom: 1px solid var(--divider-color);
        }

        .history-item:last-child { border-bottom: none; }
        .history-date { color: var(--secondary-text-color); flex-shrink: 0; }
        .history-who { font-weight: 500; }
        .history-note { color: var(--secondary-text-color); font-style: italic; }

        /* Empty state */
        .empty {
            text-align: center;
            padding: 32px 16px;
            color: var(--secondary-text-color);
            font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 600px) {
            .task-card-main {
                flex-wrap: wrap;
            }

            .task-right {
                width: 100%;
                justify-content: space-between;
            }

            .task-actions ha-icon-button {
                --mdc-icon-button-size: 30px;
            }

            .filter-bar {
                flex-direction: column;
                align-items: stretch;
            }

            .search-box {
                min-width: unset;
            }
        }
    `,_([j({attribute:!1})],f.prototype,"hass",2),_([b()],f.prototype,"_config",2),_([b()],f.prototype,"_tasks",2),_([b()],f.prototype,"_completing",2),_([b()],f.prototype,"_expandedTasks",2),_([b()],f.prototype,"_searchQuery",2),_([b()],f.prototype,"_assigneeFilter",2);var q=class extends y{constructor(){super(...arguments);this._config=Q}setConfig(e){this._config={...Q,...e}}_valueChanged(e,s){this._config={...this._config,[e]:s},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}render(){return u`
            <div style="padding: 16px;">
                <ha-textfield
                    label="Title"
                    .value=${this._config.title??""}
                    @input=${e=>this._valueChanged("title",e.target.value)}
                    style="width: 100%; margin-bottom: 12px;"
                ></ha-textfield>

                <ha-textfield
                    label="Due Soon Days (threshold)"
                    type="number"
                    .value=${String(this._config.due_soon_days??14)}
                    @input=${e=>this._valueChanged("due_soon_days",parseInt(e.target.value)||14)}
                    style="width: 100%; margin-bottom: 12px;"
                ></ha-textfield>

                <ha-textfield
                    label="Max Items (0 = no limit)"
                    type="number"
                    .value=${String(this._config.max_items??0)}
                    @input=${e=>this._valueChanged("max_items",parseInt(e.target.value)||0)}
                    style="width: 100%; margin-bottom: 12px;"
                ></ha-textfield>

                <ha-formfield label="Show Search Bar">
                    <ha-switch
                        .checked=${this._config.show_search??!0}
                        @change=${e=>this._valueChanged("show_search",e.target.checked)}
                    ></ha-switch>
                </ha-formfield>
            </div>
        `}};_([j({attribute:!1})],q.prototype,"hass",2),_([b()],q.prototype,"_config",2);customElements.define("home-maintenance-todo-card",f);customElements.define("home-maintenance-todo-card-editor",q);window.customCards=window.customCards||[];window.customCards.push({type:"home-maintenance-todo-card",name:"Home Maintenance Todo",description:"A dashboard card mirroring the Home Maintenance panel with grouped tasks, actions, and expandable details",preview:!0});
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
