/* jplus 2014-10-14 */
(function(t,e){"use strict";function n(t){return i(r(t))}function r(t){var e=j(t).match(x);return w(e,function(t,n){var r=e[t]=j(n).match(N);r[0]=j(r[0]),r[1]&&(r[1]=j(r[1])),-1!==r[0].indexOf("-")&&(r[0]=j(r[0]).match(A))})}function i(e){var n={};return w(e,function(){var e=this;switch(!0){case 1===e.length:n[e[0]]={};break;case b(e[0]):n[e[1]]={method:e[0][0],args:e[0].slice(1)};break;case e[0]in t.fn:n[e[1]]={method:e[0],args:v};break;default:n[e[0]]={}}}),n}function o(t){return new o.init(t)}function s(t,e){if(!e(t))for(t=t.firstChild;t;)s(t,e),t=t.nextSibling}function a(){var e=S(t.fn);return e.length=0,e}function u(e){if(!b(e))return!1;var n,r,i=e.length;if(i>1){for(n=t.type(e[0]),r=i-1;r>=0;r--)if(t.type(e[r])!==n)return!1;return!0}return!1}function c(){function t(e,n){var o;if(isNaN(e)&&isNaN(n)&&"number"==typeof e&&"number"==typeof n)return!0;if(e===n)return!0;if("function"==typeof e&&"function"==typeof n||e instanceof Date&&n instanceof Date||e instanceof RegExp&&n instanceof RegExp||e instanceof String&&n instanceof String||e instanceof Number&&n instanceof Number)return""+e==""+n;if(!(e instanceof Object&&n instanceof Object))return!1;if(e.isPrototypeOf(n)||n.isPrototypeOf(e))return!1;if(e.constructor!==n.constructor)return!1;if(e.prototype!==n.prototype)return!1;if(P(e,r)>-1||P(n,i)>-1)return!1;for(o in n){if(n.hasOwnProperty(o)!==e.hasOwnProperty(o))return!1;if(typeof n[o]!=typeof e[o])return!1}for(o in e){if(n.hasOwnProperty(o)!==e.hasOwnProperty(o))return!1;if(typeof n[o]!=typeof e[o])return!1;switch(typeof e[o]){case"object":case"function":if(r.push(e),i.push(n),!t(e[o],n[o]))return!1;r.pop(),i.pop();break;default:if(e[o]!==n[o])return!1}}return!0}var e,n,r,i;if(1>arguments.length)return!0;for(e=1,n=arguments.length;n>e;e++)if(r=[],i=[],!t(arguments[0],arguments[e]))return!1;return!0}function f(t){g(t)&&V(this,t)}function l(t){return setTimeout(t,4)}function h(){return Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2)}function p(t,e,n){var r=e.split(".");return e=r[0],r=r[1],e in t.$$setters||(t.$$setters[e]={},M(t,e,function(t,e,n){var r=this;w(r.$$setters[e],function(){this.call(r,t,e,n)})})),t.$$setters[e][r||"observe"+h()]=n,t}function d(e){if(!t.ES5&&e in I)throw Error("If you want to support IE6/7/8. The property name ["+e+"] can not be observed, "+"because DOM has the same property name. "+"You can use the [jQuery.ES5 = true] to ignore IE6/7/8.")}var v=[],$=v.push,y=v.slice,m=Object.prototype.toString,g=function(t){return null==t?t:"[object Object]"===m.call(t)},b=Array.isArray||function(t){return"[object Array]"===m.call(t)},_=function(t){return"[object Function]"===m.call(t)},O=function(t){return"[object String]"===m.call(t)},j=t.trim,w=t.each,V=t.extend,P=t.inArray,S=Object.create||function(t){var e=function(){};return e.prototype=t,new e},x=/[^;]+/g,N=/[^:]+/g,A=/[^-]+/g;o.init=function(t){this[0]=t},o.fn=o.init.prototype=o.prototype=V(S(t.fn),{rescan:function(){return this.clean().collect()},collect:function(t){var e=this;return s(t||this[0],function(t){return e.getAttr(t)}),this},clean:function(t){var e,n;for(n in this)this.hasOwnProperty(n)&&(e=this[n],e.removeAttr&&e.removeAttr("js"),t&&delete this[n]);return this},getAttr:function(r){if(!/text/.test(r.nodeName)){var i=this,o=t(r),s=o.attr("js");return s&&w(n(s),function(t){var e=i.hasOwnProperty(t)&&i[t];e||(e=i[t]=a(),V(e,this)),e[e.length++]=r}),o.attr("noscan")!==e&&o.attr("app")&&r!==i[0]?!0:e}}}),t.fn.getVM=function(t){var e;return(t||!(e=this.data("vmodel")))&&(e=this.data("vmodel",o(this[0]).collect()).data("vmodel")),e},t.compare=c,f.prototype={each:w,extend:function(t){return V(this,t).refresh()},refresh:function(){var t=this;return t.each(t.model,function(e,n){e in t.vmodel&&t.render(e,n)}),t},render:function(e,n){var r,i,o,s=this.model,a=(this.oldModel,this.vmodel),f=a[e],l=f.method,h=f.args,p=l in t.fn,d=b(n),y=d?u(n):!1;if(!c(f.oldValue,n)){switch(f.oldValue=n,!0){case p&&d&&y:o=[],r=[],i=f.eq(0),p=t.fn[l],w(n,function(t){var e=f.eq(t);e.length||(e=i.clone(!0,!0),r.push(e[0])),o.push(p.apply(e,h.concat(this)))}),r.length&&(f.eq(-1).after(r),$.apply(f,r));break;case p:o=t.fn[l].apply(f,h.concat(n));break;default:l=n,h=l.args||v,h=b(h)?h:[h],y=u(h),w(f,function(e){l.apply(t(this),y?h[e]:h)})}"listen"===l&&(s[e]=o)}}};var E=new f;t.fn.refresh=function(t){return E.extend({model:t,vmodel:this.getVM()}),this};var M,k,C=document,G=C.getElementsByTagName("head")[0],I=C.createComment("Kill IE6/7/8"),q=/\[native code\]/,D="undefined",T={defineProperty:q.test(Object.defineProperty)&&q.test(Object.create)&&Object.defineProperty,__defineSetter__:q.test(Object.prototype.__defineSetter__)&&Object.prototype.__defineSetter__,__defineGetter__:q.test(Object.prototype.__defineGetter__)&&Object.prototype.__defineGetter__};!T.defineProperty&&T.__defineSetter__&&(T.defineProperty=function(t,e,n){T.__defineGetter__.call(t,e,n.get),T.__defineSetter__.call(t,e,n.set)}),T.defineProperty?(k=!0,M=function(t,e,n){var r=t[e]||D,i=!0,o=function(){n.call(t,r,e,t.$$oldValues[e]),t.$$oldValues[e]=r,i=!0,o=function(){var o=t.$$oldValues[e];i=!0,c(o,r)||(n.call(t,r,e,o),t.$$oldValues[e]=r)}};delete t[e],T.defineProperty(t,e,{get:function(){return r},set:function(t){r=t,i&&(i=!1,l(o))}})}):"onpropertychange"in G&&(M=function(t,n,r){var i;t.onpropertychange||(i={},t.onpropertychange=function(t){var n=this,o=(t||window.event).propertyName;if(o in this.$$setters)return i[o]===e?(i[o]=!0,r.call(n,n[o],o,n.$$oldValues[o]),n.$$oldValues[o]=n[o],e):(i[o]&&(i[o]=!1,l(function(){var t=n.$$oldValues[o];i[o]=!0,c(t,n[o])||(r.call(n,n[o],o,t),n.$$oldValues[o]=n[o])})),e)})});var Q={$$proto:{add:function(t,e){return this[t]=e||D,this.$$oldValues[t]="$.observe"+h(),this},remove:function(t){return delete this.$$oldValues[t],"onpropertychange"in this&&this.nodeName!==e?this.removeAttribute(t):delete this[t],this},on:function(){var t=this,e=y.call(arguments);return 1===e.length?(e=e[0],g(e)?w(e,function(e,n){d(e),p(t,e,n)}):_(e)&&t.each(function(n){d(n),p(t,n,e)})):2===e.length&&O(e[0])&&_(e[1])&&(d(e[0]),p(t,e[0],e[1])),this},off:function(){var t=this,e=y.call(arguments);return 0===e.length?w(t.$$setters,function(e){t.$$setters[e]={}}):e.length>=1&&w(e,function(){var e,n,r=this.indexOf(".");0===r?(n=this.substr(1),w(t.$$setters,function(){n in this&&delete this[n]})):r>0?(e=this.substr(0,r),n=this.substr(r+1),n in t.$$setters[e]&&delete t.$$setters[e][n]):this in t.$$setters&&(t.$$setters[this]={})}),this},each:function(t){var e=this;return w(e.$$oldValues,function(n){t.call(e,n,e[n])}),this},extend:function(){return V.apply(null,[this].concat(y.call(arguments)))}},init:k?function(t){var e=S(this.$$proto),n=e.$$oldValues={};e.$$setters={};for(var r in t)t.hasOwnProperty(r)&&(n[r]=e[r]=t[r]);return e}:function(t){var e=G.appendChild(C.createComment("[object Object]")),n=e.$$oldValues={};V(e,this.$$proto).$$setters={};for(var r in t)t.hasOwnProperty(r)&&(n[r]=e[r]=t[r]);return e}};t.observe=function(t,e){var n;return g(t)?(n=Q.init(t),g(e)||_(e)?n.on(e):n):null},V(t.fn,{render:function(e){if(g(e)){var n=this,r=t.fn;return w(e,function(t,e){var i=r[t];i&&i[b(e)?"apply":"call"](n,e)}),this}},listen:function(e){var n=this;return n.refresh(e),t.observe(e).on(function(t,e){var r={};r[e]=t,n.refresh(r)})}}),t.define=function(e,n){var r,i=t(e);if(i.length)return r={},r=n(r)||r,i.listen(r)};var R={vmodel:{},ready:function(e){var n=this;return t(document).ready(function(){e.call(n.$scan())}),this},$scan:function(){var e=this;return t("[app]").each(function(){var n=t(this),r=n.attr("app"),i=!1;e.vmodel[r]=n.getVM(),e.on(r+".module",function(t,e){!i&&g(t)&&(i=!0,this[e]=n.listen(t),i=!1)})}),this}};t.module=V(t.observe({}),R)})(window.jQuery||window.Zepto);