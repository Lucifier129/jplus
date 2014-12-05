/* jplus 2014-12-04 */
!function(t,n){function e(t){return function(){return Function.prototype.call.apply(t,arguments)}}function r(t){return function(n){return null==n?n:d(n)==="[object "+t+"]"}}function i(e,r,i,o){if(e==n||!j(r))return e;var s,u=e.length;if(u===+u&&u>0&&!o){for(var a=0;u>a;a+=1)if(s=r.call(i||t,e[a],a,e),s!==n)return s;return e}for(var f in e)if(y(e,f)&&(s=r.call(i||t,e[f],f,e),s!==n))return s;return e}function o(){var t,n=arguments[0];if("boolean"==typeof n&&(t=n,n=arguments[1]),"object"!=typeof n&&!j(n))return n;var e=g(arguments,t?2:1);return i(e,function(e){"object"==typeof e&&i(e,function(e,r){if(t&&"object"==typeof e){var i=n[r];return n[r]="object"==typeof i?i:{},o(t,n[r],e)}n[r]=e})}),n}function s(t){if(!w(t))return!1;var n,e,r=t.length;if(r>1){for(n=d(t[0]),e=r-1;e>=0;e--)if(d(t[e])!==n)return!1;return!0}return!1}function u(n,e,r){return n[w(e)?"apply":"call"](r||t,e)}function a(t){var n;return j(t)?(n=A(t.prototype),n=t.apply(n,g(arguments,1))||n):n="object"==typeof t?t:{},n}function f(e){var r=f.instance,a=f.alias,c={};return i(e,function(t,e){var f,h=r[e];h===n&&e in a&&(h=r[e=a[e]]),j(h)?s(t)?(c[e]=[],i(t,function(t){f=u(h,t,r),f!==n&&c[e].push(f)})):(f=u(h,t,r),f!==n&&(c[e]=f)):"object"==typeof h&&"object"==typeof t?o(h,t):r[e]=t},t,!0),c}function c(){var e=a.apply(t,arguments),r=A(c.alias);return o(function(t){if(t===n)return e;var o;return f.instance=e,f.alias=r,w(t)?(o=[],i(t,function(t){"object"==typeof t&&o.push(f(t))})):"object"==typeof t&&(o=f(t)),o},{alias:r})}function h(t){return t+Math.random().toString(36).substr(2)}function l(t){if(!C.ES5&&t in q)throw Error("If you want to support IE6/7/8. The property name ["+t+"] can not be observed, "+"because DOM has the same property name. "+"You can use the [jQuery.ES5 = true] to ignore IE6/7/8.")}function p(t){this.$startNode=t,this.viewModel={}}function v(t,n){this.dataModel=t,this.viewModel=n}var _=Object.prototype,d=e(_.toString),y=e(_.hasOwnProperty),g=e(Array.prototype.slice),b=r("Object"),m=r("String"),j=r("Function"),w=Array.isArray||r("Array");if(!String.prototype.trim){var O=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;String.prototype.trim=function(){return this.replace(O,"")}}var x={keys:Object.keys||function(t){if(!b(t))return[];var n=[];for(var e in t)y(t,e)&&n.push(e);return n},values:function(t){for(var n=this.keys(t),e=n.length,r=Array(e),i=0;e>i;i+=1)r[i]=t[n[i]];return r},invert:function(t){for(var n={},e=this.keys(t),r=0,i=e.len;i>r;r++)n[t[e[r]]]=e[r];return n},parse:function(t){if(!m(t))return{};var n={},e=t.trim().split(";");return i(e,function(t){t=t.trim().split(":"),2>t.length||(n[t[1].trim()]=t[0].trim())}),n}},A=Object.create||function(t){var n=function(){};return n.prototype=t,new n};c.alias=A({extend:function(t){return o(this,t)},each:function(t){return i(this,t)},keys:function(){return x.keys(this)},values:function(){return x.values(this)},invert:function(){return x.invert(this)},parse:function(t){return this.extend(x.parse(t))}});var E=function(t){return setTimeout(t,4)},M=function(t,n,e,r){if(t===n)return 0!==t||1/t===1/n;if(null==t||null==n)return t===n;var i=d(t);if(i!==d(n))return!1;switch(i){case"[object RegExp]":case"[object String]":return""+t==""+n;case"[object Number]":return+t!==+t?+n!==+n:0===+t?1/+t===1/n:+t===+n;case"[object Date]":case"[object Boolean]":return+t===+n}var o="[object Array]"===i;if(!o){if("object"!=typeof t||"object"!=typeof n)return!1;var s=t.constructor,u=n.constructor;if(s!==u&&!(j(s)&&s instanceof s&&j(u)&&u instanceof u)&&"constructor"in t&&"constructor"in n)return!1}for(var a=e.length;a--;)if(e[a]===t)return r[a]===n;e.push(t),r.push(n);var f,c;if(o){if(f=t.length,c=f===n.length)for(;f--&&(c=M(t[f],n[f],e,r)););}else{var h,l=x.keys(t);if(f=l.length,c=x.keys(n).length===f)for(;f--&&(h=l[f],c=y(n,h)&&M(t[h],n[h],e,r)););}return e.pop(),r.pop(),c};x.isEqual=function(t,n){return M(t,n,[],[])};var S,$=document,k=$.getElementsByTagName("head")[0],q=$.createComment("Kill IE6/7/8"),F=/\[native code\]/;Array.prototype.indexOf||(Array.prototype.indexOf=function(t){for(var n=this.length-1;n>=0;n--)if(this[n]===t)return n;return-1});var N;F.test(Object.defineProperty)&&F.test(Object.create)?N=Object.defineProperty:F.test(Object.prototype.__defineSetter__)&&(N=function(t,n,e){t.__defineGetter__(n,e.get),t.__defineSetter__(n,e.set)});var V;N?(S=!0,V=function(t,n){function e(){i(t.__events__[n],function(e){i(e,function(e){e.call(t,s,n,u)})}),u="object"==typeof s?w(s)?s.concat():o(!0,{},s):s,r=!1}if(!(n in t.__events__)){var r,s=t[n],u="object"==typeof s?w(s)?s.concat():o(!0,{},s):s;N(t,n,{get:function(){return s},set:function(t){s=t,r||x.isEqual(t,u)||(r=!0,E(e))}})}}):"onpropertychange"in k&&(V=function(t){function n(n,s){var u=e[n],a=t[n];x.isEqual(a,u)||(i(s,function(e){i(e,function(e){e.call(t,a,n,u)})}),e[n]="object"==typeof a?w(a)?a.concat():o(!0,{},a):a,r[n]=!1)}if(!t.onpropertychange){var e={},r={};t.each(function(t,n){e[n]=b(t)?o(!0,{},t):w(t)?t.concat():t}),t.onpropertychange=function(t){t=t||window.event;var e=t.propertyName,i=this.__events__;if(e in i){if(r[e])return;r[e]=!0,E(function(){n(e,i[e])})}}}});var I={_add:function(t,n,e){return l(t),V(this,t),e=e||h("observer"),this.__events__[t]=this.__events__[t]||{},this.__events__[t][e]=this.__events__[t][e]||[],this.__events__[t][e].push(n),this},on:function(){var t,n=this,e=g(arguments),r=e.length;if(1===r)b(t=e[0])?i(t,function(t,e){n.on(e,t)}):j(t)&&this.each(function(e,r){n._add(r,t,"__all__")});else if(2===r){if(!j(e[1]))return this;if(m(t=e[0])){var o=t.indexOf(".");0>=o?this._add(t,e[1]):this._add(t.substr(0,o),e[1],t.substr(o+1))}else w(t)&&i(t,function(t){n.on(t,e[1])})}return this},_bang:function(t,n,e){var r=this,o=r[t];i(this.__events__[t][e]||[],function(e){e.call(r,n,t,o)})},trigger:function(t,n){var e,r=this;return t?(m(t)?(e=t.indexOf("."),e>0?this._bang(t.substr(0,e),n,t.substr(e+1)):e?i(this.__events__[t]||[],function(e,i){r._bang(t,n,i)}):(t=t.substr(1),i(this.__events__,function(e,o){i(e,function(e,i){i===t&&r._bang(o,n,i)})}))):w(t)&&i(t,function(t){r.trigger(t,n)}),this):this},_remove:function(t,n,e){var r=this.__events__[t][e]||[],i=r.indexOf(n);return-1!==i&&r.splice(i,1),this},off:function(){var t,n,e=this,r=g(arguments),o=r.length;if(o){if(1===o)j(t=r[0])?i(this.__events__,function(n,r){i(n,function(n,i){e._remove(r,t,i)})}):m(t)&&(n=t.indexOf("."),0>=n?this.__events__[t]={}:delete this.__events__[t.substr(0,n)][t.substr(n+1)]);else if(2===o){if(!j(r[1]))return this.off(r[0]),this;m(t=r[0])?(n=t.indexOf("."),0>=n?i(this.__events__[t],function(n,i){e._remove(t,r[1],i)}):this._remove(t.substr(0,n),r[1],t.substr(n+1))):w(t)&&i(t,function(t){e.off(t,r[1])})}}else this.__events__={};return this},offAll:function(){var t=this;return i(this.__events__,function(n,e){t.off([e,"__all__"].join("."))}),this},each:function(t){var n=this;if(this.nodeName)for(var e in this)-1!==n.filter.indexOf(e)||e in q||t.call(n,this[e],e);else i(this,function(e,r){-1===n.filter.indexOf(r)&&t.call(n,e,r)});return this},extend:function(){return o.apply(t,[this].concat(g(arguments)))},once:function(t,n){function e(){n.apply(r,arguments),r.off(t)}var r=this;return t+=".once",this.on(t,e)},tie:function(t,n){if(!j(n))return this;if(w(t)){var e=this,r=t.length,o=[],s=[],u=function(u,a){0>o.indexOf(a)?(o.push(a),o.length===r&&(i(t,function(t,n){t=t.split(".")[0],s[n]=e[t]}),n.apply(e,s))):o.length>=r&&(o.length=0,o.push(a))};return this.on(t,u)}return m(t)?this.on(t,n):this}};I.bind=I.on,I.unbind=I.off,I.fire=I.trigger,I.filter=x.keys(I).concat(["__events__","filter"]);var C=S?function(t,n){if(!b(t))return{};var e=o(A(I),t,{__events__:{}});return b(n)||j(n)?e.on(n):e}:function(t,n){if(!b(t))return{};var e=o(k.appendChild($.createComment("[object Object]")),I,t,{__events__:{}});return b(n)||j(n)?e.on(n):e};C.ES5=!1,C.fn=I;var P=window.jQuery||window.Zepto;if(P===n)return j(t.define)&&(define.amd||define.cmd)?define({agent:c,observe:C}):(t.agent=c,t.observe=C,t.$$===n&&(t.$$=c)),n;P.agent=c,P.observe=C;var T=P.plus={attr:"js",filterAttr:["noscan","app"],viewModel:[]},B=e(Array.prototype.push);p.prototype={filter:function(t){var n=[],e=this.$startNode;return i(T.filterAttr,function(t){n.push.apply(n,g(e.find("["+t+"]"+" ["+T.attr+"]")))}),t.filter(function(){return-1===P.inArray(this,n)})},parse:function(t){var n=this.viewModel;return i(x.parse(t.attr(T.attr)),function(e,r){var i=n[r]=n[r]||{};i.instance?B(i.instance,t[0]):(e=e.split("-"),i.method=e[0],i.params=e[1]?[e[1]]:[],i.instance=t,i.lastValue=null)}),this},scan:function(){var t=this;return this.parse(this.$startNode).filter(this.$startNode.find("["+T.attr+"]")).each(function(){t.parse(P(this))}),this},rescan:function(){return this.viewModel={},this.scan()},get:function(){return this.viewModel}},P.fn.scanView=function(t){var n,e=this[0],r=e.vmIndex,i="number"==typeof r;return i?(n=T.viewModel[r],t?n.rescan().get():n.get()):(n=new p(this),T.viewModel[e.vmIndex=T.viewModel.length]=n,n.scan().get())};var D=P.fn;v.prototype={refresh:function(){var t=this,n=this.viewModel;i(this.dataModel,function(e,r){r in n&&t.render(n[r],e)})},render:function(t,n){if(!x.isEqual(n,t.lastValue)){t.lastValue="object"==typeof n?w(n)?n.concat():o(!0,{},n):n;var e=t.instance,r=t.method,u=t.params,a=t.method in D;if(a)if(s(n)){var f=e.eq(0).clone(),c=[];r=D[r],i(n,function(t,n){var i=e.eq(n);i.length||(i=f.clone(),c.push(i.get(0))),r.apply(i,u.concat(t))}),c.length&&(e.eq(-1).after(c),c.push.apply(e,c))}else D[r].apply(e,u.concat(n));else{if(!j(n))return;r=n,u=this.dataModel[t.method],r.apply(e,[].concat(u||[]))}}}},P.fn.refresh=function(t){var n=this;return b(t)?new v(t,this.scanView()).refresh():w(t)&&i(t,function(t,e){new v(t,n.eq(e).scanView()).refresh()}),this},o(P.fn,{render:function(t){function n(t,n){var i=r[n];j(i)&&i[w(t)?"apply":"call"](e,t)}var e=this,r=P.fn;return b(t)?i(t,n):w(t)&&i(t,function(t){b(t)&&i(t,n)}),this},listen:function(t){var n=this;return n.refresh(t),P.observe(t,function(t,e){var r={};r[e]=t,n.refresh(r)})}}),P.define=function(t,e){var r,i=P(t);return i.length?(r={},r=e(r)||r,i.listen(r)):n},P.render=function(t){return P("[render]").each(function(){var n,e=P(this),r=e.attr("render");r in t&&b(n=t[r])&&e.render(n)}),this};var Q={vmodel:{},ready:function(t){var n=this;return P(document).ready(function(){t.call(n.$scan())}),this},$scan:function(){var t=this;return P("[app]").each(function(){var n=P(this),e=n.attr("app"),r=!1;t.vmodel[e]=n.scanView(),t.on(e+".module",function(t,e){!r&&b(t)&&(r=!0,this[e]=n.listen(t),r=!1)})}),this}};P.module=P.observe(Q)}(this);