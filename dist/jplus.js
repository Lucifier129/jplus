/* jplus 2014-12-05 */
!function(t,e){function n(t){return function(){return Function.prototype.call.apply(t,arguments)}}function r(t){return function(e){return null==e?e:d(e)==="[object "+t+"]"}}function i(n,r,i,o){if(n==e||!j(r))return n;var s,u=n.length;if(u===+u&&u>0&&!o){for(var a=0;u>a;a+=1)if(s=r.call(i||t,n[a],a,n),s!==e)return s;return n}for(var f in n)if(y(n,f)&&(s=r.call(i||t,n[f],f,n),s!==e))return s;return n}function o(){var t,e=arguments[0];if("boolean"==typeof e&&(t=e,e=arguments[1]),"object"!=typeof e&&!j(e))return e;var n=g(arguments,t?2:1);return i(n,function(n){"object"==typeof n&&i(n,function(n,r){if(t&&"object"==typeof n){var i=e[r];return e[r]="object"==typeof i?i:{},o(t,e[r],n)}e[r]=n})}),e}function s(t){if(!w(t))return!1;var e,n,r=t.length;if(r>1){for(e=d(t[0]),n=r-1;n>=0;n--)if(d(t[n])!==e)return!1;return!0}return!1}function u(e,n,r){return e[w(n)?"apply":"call"](r||t,n)}function a(t){var e;return j(t)?(e=A(t.prototype),e=t.apply(e,g(arguments,1))||e):e="object"==typeof t?t:{},e}function f(n){var r=f.instance,a=f.alias,c={};return i(n,function(t,n){var f,h=r[n];h===e&&n in a&&(h=r[n=a[n]]),j(h)?s(t)?(c[n]=[],i(t,function(t){f=u(h,t,r),f!==e&&c[n].push(f)})):(f=u(h,t,r),f!==e&&(c[n]=f)):"object"==typeof h&&"object"==typeof t?o(h,t):r[n]=t},t,!0),c}function c(){var n=a.apply(t,arguments),r=A(c.alias);return o(function(t){if(t===e)return n;var o;return f.instance=n,f.alias=r,w(t)?(o=[],i(t,function(t){"object"==typeof t&&o.push(f(t))})):"object"==typeof t&&(o=f(t)),o},{alias:r})}function h(t){return t+Math.random().toString(36).substr(2)}function l(t){if(!C.ES5&&t in k)throw Error("If you want to support IE6/7/8. The property name ["+t+"] can not be observed, "+"because DOM has the same property name. "+"You can use the [observe.ES5 = true] to ignore IE6/7/8.")}function v(t){this.$startNode=t,this.viewModel={}}function p(t,e){this.dataModel=t,this.viewModel=e}var _=Object.prototype,d=n(_.toString),y=n(_.hasOwnProperty),g=n(Array.prototype.slice),b=r("Object"),m=r("String"),j=r("Function"),w=Array.isArray||r("Array");if(!String.prototype.trim){var O=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;String.prototype.trim=function(){return this.replace(O,"")}}var x={keys:Object.keys||function(t){if(!b(t))return[];var e=[];for(var n in t)y(t,n)&&e.push(n);return e},values:function(t){for(var e=this.keys(t),n=e.length,r=Array(n),i=0;n>i;i+=1)r[i]=t[e[i]];return r},invert:function(t){for(var e={},n=this.keys(t),r=0,i=n.len;i>r;r++)e[t[n[r]]]=n[r];return e},parse:function(t){if(!m(t))return{};var e={},n=t.trim().split(";");return i(n,function(t){t=t.trim().split(":"),2>t.length||(e[t[1].trim()]=t[0].trim())}),e}},A=Object.create||function(t){var e=function(){};return e.prototype=t,new e};c.alias=A({extend:function(t){return o(this,t)},each:function(t){return i(this,t)},keys:function(){return x.keys(this)},values:function(){return x.values(this)},invert:function(){return x.invert(this)},parse:function(t){return this.extend(x.parse(t))}});var E=function(t){return setTimeout(t,4)},M=function(t,e,n,r){if(t===e)return 0!==t||1/t===1/e;if(null==t||null==e)return t===e;var i=d(t);if(i!==d(e))return!1;switch(i){case"[object RegExp]":case"[object String]":return""+t==""+e;case"[object Number]":return+t!==+t?+e!==+e:0===+t?1/+t===1/e:+t===+e;case"[object Date]":case"[object Boolean]":return+t===+e}var o="[object Array]"===i;if(!o){if("object"!=typeof t||"object"!=typeof e)return!1;var s=t.constructor,u=e.constructor;if(s!==u&&!(j(s)&&s instanceof s&&j(u)&&u instanceof u)&&"constructor"in t&&"constructor"in e)return!1}for(var a=n.length;a--;)if(n[a]===t)return r[a]===e;n.push(t),r.push(e);var f,c;if(o){if(f=t.length,c=f===e.length)for(;f--&&(c=M(t[f],e[f],n,r)););}else{var h,l=x.keys(t);if(f=l.length,c=x.keys(e).length===f)for(;f--&&(h=l[f],c=y(e,h)&&M(t[h],e[h],n,r)););}return n.pop(),r.pop(),c};x.isEqual=function(t,e){return M(t,e,[],[])};var N,S=document,$=S.getElementsByTagName("head")[0],k=S.createComment("Kill IE6/7/8"),F=/\[native code\]/;Array.prototype.indexOf||(Array.prototype.indexOf=function(t){for(var e=this.length-1;e>=0;e--)if(this[e]===t)return e;return-1});var V;F.test(Object.defineProperty)&&F.test(Object.create)?V=Object.defineProperty:F.test(Object.prototype.__defineSetter__)&&(V=function(t,e,n){t.__defineGetter__(e,n.get),t.__defineSetter__(e,n.set)});var I;V?(N=!0,I=function(t,e){function n(){i(t.__events__[e],function(n){i(n,function(n){n.call(t,s,e,u)})}),u="object"==typeof s?w(s)?s.concat():o(!0,{},s):s,r=!1}if(!(e in t.__events__)){var r,s=t[e],u="object"==typeof s?w(s)?s.concat():o(!0,{},s):s;V(t,e,{get:function(){return s},set:function(t){s=t,r||x.isEqual(t,u)||(r=!0,E(n))}})}}):"onpropertychange"in $&&(I=function(t){function e(e,s){var u=n[e],a=t[e];x.isEqual(a,u)||(i(s,function(n){i(n,function(n){n.call(t,a,e,u)})}),n[e]="object"==typeof a?w(a)?a.concat():o(!0,{},a):a,r[e]=!1)}if(!t.onpropertychange){var n={},r={};t.each(function(t,e){n[e]=b(t)?o(!0,{},t):w(t)?t.concat():t}),t.onpropertychange=function(t){t=t||window.event;var n=t.propertyName,i=this.__events__;if(n in i){if(r[n])return;r[n]=!0,E(function(){e(n,i[n])})}}}});var q={_add:function(t,e,n){return l(t),I(this,t),n=n||h("observer"),this.__events__[t]=this.__events__[t]||{},this.__events__[t][n]=this.__events__[t][n]||[],this.__events__[t][n].push(e),this},on:function(){var t,e=this,n=g(arguments),r=n.length;if(1===r)b(t=n[0])?i(t,function(t,n){e.on(n,t)}):j(t)&&this.each(function(n,r){e._add(r,t,"__all__")});else if(2===r){if(!j(n[1]))return this;if(m(t=n[0])){var o=t.indexOf(".");0>=o?this._add(t,n[1]):this._add(t.substr(0,o),n[1],t.substr(o+1))}else w(t)&&i(t,function(t){e.on(t,n[1])})}return this},_bang:function(t,e,n){var r=this,o=r[t];i(this.__events__[t][n]||[],function(n){n.call(r,e,t,o)})},trigger:function(t,e){var n,r=this;return t?(m(t)?(n=t.indexOf("."),n>0?this._bang(t.substr(0,n),e,t.substr(n+1)):n?i(this.__events__[t]||[],function(n,i){r._bang(t,e,i)}):(t=t.substr(1),i(this.__events__,function(n,o){i(n,function(n,i){i===t&&r._bang(o,e,i)})}))):w(t)&&i(t,function(t){r.trigger(t,e)}),this):this},_remove:function(t,e,n){var r=this.__events__[t][n]||[],i=r.indexOf(e);return-1!==i&&r.splice(i,1),this},off:function(){var t,e,n=this,r=g(arguments),o=r.length;if(o){if(1===o)j(t=r[0])?i(this.__events__,function(e,r){i(e,function(e,i){n._remove(r,t,i)})}):m(t)&&(e=t.indexOf("."),0>=e?this.__events__[t]={}:delete this.__events__[t.substr(0,e)][t.substr(e+1)]);else if(2===o){if(!j(r[1]))return this.off(r[0]),this;m(t=r[0])?(e=t.indexOf("."),0>=e?i(this.__events__[t],function(e,i){n._remove(t,r[1],i)}):this._remove(t.substr(0,e),r[1],t.substr(e+1))):w(t)&&i(t,function(t){n.off(t,r[1])})}}else this.__events__={};return this},offAll:function(){var t=this;return i(this.__events__,function(e,n){t.off([n,"__all__"].join("."))}),this},each:function(t){var e=this;if(this.nodeName)for(var n in this)-1!==e.filter.indexOf(n)||n in k||t.call(e,this[n],n);else i(this,function(n,r){-1===e.filter.indexOf(r)&&t.call(e,n,r)});return this},extend:function(){return o.apply(t,[this].concat(g(arguments)))},once:function(t,e){function n(){e.apply(r,arguments),r.off(t)}var r=this;return t+=".once",this.on(t,n)},tie:function(t,e){if(!j(e))return this;if(w(t)){var n=this,r=t.length,o=[],s=[],u=function(u,a){0>o.indexOf(a)?(o.push(a),o.length===r&&(i(t,function(t,e){t=t.split(".")[0],s[e]=n[t]}),e.apply(n,s))):o.length>=r&&(o.length=0,o.push(a))};return this.on(t,u)}return m(t)?this.on(t,e):this}};q.bind=q.on,q.unbind=q.off,q.fire=q.trigger,q.filter=x.keys(q).concat(["__events__","filter"]);var C=N?function(t,e){if(!b(t))return{};var n=o(A(q),t,{__events__:{}});return b(e)||j(e)?n.on(e):n}:function(t,e){if(!b(t))return{};var n=o($.appendChild(S.createComment("[object Object]")),q,t,{__events__:{}});return b(e)||j(e)?n.on(e):n};C.ES5=!1,C.fn=q;var B=window.jQuery||window.Zepto;if(B===e)return j(t.define)&&(define.amd||define.cmd)?define({agent:c,observe:C}):(t.agent=c,t.observe=C,t.$$===e&&(t.$$=c)),e;B.agent=c,B.observe=C;var D=B.plus={attr:"js",filterAttr:["noscan","app"],viewModel:[]},P=n(Array.prototype.push);v.prototype={filter:function(t){var e=[],n=this.$startNode[0],r=n.id=n.id||"filter_id_for_scaner";return i(D.filterAttr,function(t){var n=B([r,"["+t+"]","["+D.attr+"]"].join(" "));e.push.apply(e,g(n))}),"filter_id_for_scaner"===r&&(n.removeAttribute?n.removeAttribute("id"):n.id=""),t.filter(function(){return-1===e.indexOf(this)})},parse:function(t){var e=this.viewModel;return i(x.parse(t.attr(D.attr)),function(n,r){var i=e[r]=e[r]||{};i.instance?P(i.instance,t[0]):(n=n.split("-"),i.method=n[0],i.params=n[1]?[n[1]]:[],i.instance=t,i.lastValue=null)}),this},scan:function(){var t=this;return this.parse(this.$startNode).filter(this.$startNode.find("["+D.attr+"]")).each(function(){var e=B(this);e.prevObject=e.context=null,t.parse(e)}),this},rescan:function(){return this.viewModel={},this.scan()},get:function(){return this.viewModel}},B.fn.scanView=function(t){var e,n=this[0],r=n.vmIndex,i="number"==typeof r;return i?(e=D.viewModel[r],t?e.rescan().get():e.get()):(e=new v(this),D.viewModel[n.vmIndex=D.viewModel.length]=e,e.scan().get())};var T=B.fn;p.prototype={refresh:function(){var t=this.viewModel,e=this.dataModel;for(var n in e)n in t&&this.render(t[n],e[n])},render:function(t,e){if(!x.isEqual(e,t.lastValue)){t.lastValue="object"==typeof e?w(e)?e.concat():o(!0,{},e):e;var n=t.instance,r=t.method,i=t.params;if(t.method in T)if(s(e)){var u,a=n[0].cloneNode(!0),f=S.createDocumentFragment(),c=n.length;r=T[r];for(var h=0,l=e.length;l>h;h++)c>h?u=B(n[h]):(u=B(a.cloneNode(!0)),P(n,f.appendChild(u[0]))),r.apply(u,i.concat(e[h]));if(f.childNodes.length){var v,p=n[c-1];(v=p.nextSibling)?p.parentNode.insertBefore(f,v):p.parentNode.appendChild(f)}a=f=null}else T[r].apply(n,i.concat(e));else{if(!j(e))return;r=e,i=this.dataModel[t.method],r.apply(n,[].concat(i||[]))}}}},B.fn.refresh=function(t){var e=this;return b(t)?new p(t,this.scanView()).refresh():w(t)&&i(t,function(t,n){new p(t,e.eq(n).scanView()).refresh()}),this},o(B.fn,{render:function(t){function e(t,e){var i=r[e];j(i)&&i[w(t)?"apply":"call"](n,t)}var n=this,r=B.fn;return b(t)?i(t,e):w(t)&&i(t,function(t){b(t)&&i(t,e)}),this},listen:function(t){var e=this;return e.refresh(t),B.observe(t,function(t,n){var r={};r[n]=t,e.refresh(r)})}}),B.define=function(t,n){var r,i=B(t);return i.length?(r={},r=n(r)||r,i.listen(r)):e},B.render=function(t){return B("[render]").each(function(){var e,n=B(this),r=n.attr("render");r in t&&b(e=t[r])&&n.render(e)}),this};var G={vmodel:{},ready:function(t){var e=this;return B(document).ready(function(){t.call(e.$scan())}),this},$scan:function(){var t=this;return B("[app]").each(function(){var e=B(this),n=e.attr("app"),r=!1;t.vmodel[n]=e.scanView(),t.on(n+".module",function(t,n){!r&&b(t)&&(r=!0,this[n]=e.listen(t),r=!1)})}),this}};B.module=B.observe(G)}(this);