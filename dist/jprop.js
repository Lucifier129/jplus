/* jplus 2014-11-01 */
(function(t){"use strict";function e(t,e){this.elem=t,this.callback=e,this.data={start:{},move:{}}}var n=document.createElement("div").style,r=["","-webkit-","-moz-","-ms-","-o-"],i=r.length,o=t.camelCase;t.css3fix=function(t){for(var e,a=0;i>a;a+=1)if(e=o(r[a]+t),e in n)return e;return!1};var a="ontouchstart"in document,s=a?{start:"touchstart",move:"touchmove",end:"touchend"}:{start:"mousedown",move:"mousemove",end:"mouseup"},c=function(t){return c="touches"in t?function(t){var e=t.touches[0];return{x:e.clientX,y:e.clientY}}:function(t){return{x:t.clientX,y:t.clientY}},c(t)},u=document.addEventListener?function(t,e,n){t.addEventListener(e,n,!1)}:function(t,e,n){t.attachEvent("on"+e,n)},l=document.removeEventListener?function(t,e,n){t.removeEventListener(e,n)}:function(t,e,n){t.detachEvent("on"+e,n)},f="function"==typeof window.setImmediate?function(t){window.setImmediate(t)}:function(t){window.setTimeout(t,0)};e.prototype={eventType:s,init:function(){return this.addSwipe()},addSwipe:function(){var t=this;return this.START=function(e){t.start.call(t,e)},u(this.elem,this.eventType.start,this.START),this},removeSwipe:function(){return l(this.elem,this.eventType.start,this.START),this},addEvent:function(e,n){return"string"==typeof e&&t.isFunction(n)&&(this.callback[e]=n),this},addDocEvent:function(){var t=this;this.MOVE=function(e){t.move.call(t,e)},this.END=function(e){t.end.call(t,e)},u(document,this.eventType.move,this.MOVE),u(document,this.eventType.end,this.END)},removeDocEvent:function(){l(document,this.eventType.move,this.MOVE),l(document,this.eventType.end,this.END)},preventDefault:function(t){"preventDefault"in(t=t||window.event)?t.preventDefault():t.returnValue=!1},start:function(t){var e=this,n=e.elem,r=e.data,i=e.callback,o=c(t);e.preventDefault(t),r.start.x=r.move.x=o.x,r.start.y=r.move.y=o.y,r.start.timeStamp=+new Date,r.start.begin=!0,r.start.dir=function(t,e){var n=Math.atan2(Math.abs(t),Math.abs(e))*(180/Math.PI);return r.start.dir=function(){return n},n},"start"in i&&i.start.call(n,t,r.start),f(function(){e.addDocEvent()})},move:function(t){var e=this.data,n=this.elem,r=this.callback,i=c(t);this.preventDefault(t),e.move.dir=e.start.dir(i.y-e.start.y,i.x-e.start.x),e.move.x=i.x-e.move.x,e.move.y=i.y-e.move.y,"move"in r&&r.move.call(n,t,e.move),e.move.x=i.x,e.move.y=i.y},end:function(t){var e=this.data,n=this.elem,r=this.callback;if(this.preventDefault(t),this.removeDocEvent(),e.start.begin=!1,e.end={x:e.move.x-e.start.x,y:e.move.y-e.start.y,t:+new Date-e.start.timeStamp,dir:{},stop:!1},220>e.end.t&&Math.max(Math.abs(e.end.x),Math.abs(e.end.y))>10){e.move.dir>30?e.end.dir[e.end.y>0?"down":"up"]=1:e.end.dir[e.end.x>0?"right":"left"]=1;for(var i in e.end.dir)i in r&&(e.end.stop=!0,r[i].call(n,t,e.end))}else if(200>e.end.t&&10>Math.max(Math.abs(e.end.x),Math.abs(e.end.y))){if("tap"in r){if(a){var o=t.target;"A"===o.nodeName?setTimeout(function(){o.click()},0):"A"===o.parentNode.nodeName&&setTimeout(function(){o.parentNode.click()},0)}r.tap.call(n,t,e)}}else!e.end.stop&&"end"in r&&r.end.call(n,t,e.end,e.move)}},t.fn.swipe=function(n){return n&&t.isPlainObject(n)?this.each(function(){t(this).data("swipe",new e(this,n).init())}):this};var h,d,p=t.css3fix("transform"),m=t.css3fix("transition");p&&m?(h={speed:400,className:"transi-for-swipeshow",setX:function(t,e){t.style[p]="translateX("+e+"px)"},setY:function(t,e){t.style[p]="translateY("+e+"px)"},animateX:function(e,n,r){t(e).addClass(h.className),h.setX(e,n),setTimeout(r,h.speed)},animateY:function(e,n,r){t(e).addClass(h.className),h.setY(e,n),setTimeout(r,h.speed)}},d=document.createElement("style"),d.type="text/css",d.innerHTML=".transi-for-swipeshow { -webkit-transition: all .4s ease-out; -moz-transition: all .4s ease-out; transition: all .4s ease-out;}",document.getElementsByTagName("head")[0].appendChild(d)):h={speed:400,setX:function(t,e){t.style.marginLeft=e+"px"},setY:function(t,e){t.style.marginTop=e+"px"},animateX:function(e,n,r){t(e).animate({marginLeft:n},h.speed,r)},animateY:function(e,n,r){t(e).animate({marginTop:n},h.speed,r)}},t.offsetMethod=h,t.fn.swipeshow=function(e){var n={dir:"x",className:"cur",speed:3e3,auto:!0,type:"click"};t.extend(n,e),n.dir=n.dir.toUpperCase();var r,i,o=this,a=h["set"+n.dir],s=h["animate"+n.dir],c=o.parent(),u=o.children(),l=u.length,f=c.width(),d=c.height(),p=c.css("position"),v=/x/i.test(n.dir),y=[],g=!0;if(1>=l)return this;2===l&&(u.each(function(){o.append(t(this).clone(!0))}),u=o.children(),l=4,i=!0),u.each(function(){y.push(t(this))}),r=v?f:d,e=n.opts?t(n.opts).children():null,c.css({position:/absolute|fixed|relative/.test(p)?c.css("position"):"relative",overflow:"hidden"}),u.css({"float":"left",width:f,height:d}),o.css({position:"absolute",top:0,left:0,width:v?f*l:f,height:v?d:d*l}).on("click","a",function(t){g?t.preventDefault():g=!0});var b,$,w=0,x=0,_=0,O=o[0],N=!0,E=null,k={check:function(t){var e=t-w;return t>w?(_-=e,_=0>_?_+l:_):w>t&&(_=(_-e)%l),w=t,x=w*r,this},callback:function(){var t=!1;0===w?(w=-1,o.children().last().prependTo(o),t=!0):w===1-l&&(w=2-l,o.children().first().appendTo(o),t=!0),t&&(x=w*r,a(m?o.removeClass(h.className)[0]:O,x)),N=!0},slide:function(){return N=!1,s(O,x,this.callback),e&&(i?e.removeClass(n.className).eq(_%2).add(e.eq(_)).addClass(n.className):e.eq(_).addClass(n.className).siblings().removeClass(n.className)),n.callback&&n.callback.call(o,i?_%2:_),this},normal:function(){N&&k.check(Math.round(x/r)).slide()},next:function(){return N?(k.check(w-1).slide(),this):this},prev:function(){N&&k.check(w+1).slide()}}.check(0).slide(),T=n.dir.toLowerCase();return o.swipe({tap:function(){g=!1,k.normal()},start:function(){N&&o.removeClass(h.className)},move:function(t,e){N&&(x+=e[T],a(O,x))},end:k.normal,up:v?k.normal:k.next,down:v?k.normal:k.prev,left:v?k.next:k.normal,right:v?k.prev:k.normal}),e&&n.type&&($=e.parent().on(n.type,e.get(0).nodeName.toLowerCase(),function(){N&&k.check(-y[t(this).index()].index()).slide()})),n.auto&&(b=function(t){t.preventDefault(),"mouseenter"===t.type?clearTimeout(E):k.loop()},k.loop=function(){E=setTimeout(function(){k.next().loop()},n.speed)},c.on("mouseenter mouseleave",b).data("hover",!0),$&&!$.parent().data("hover")&&$.on("mouseenter mouseleave",b),k.loop()),n.next&&(n.next=t(n.next),n.next.on("click",k.next),b&&(n.next.parent().data("hover")||n.next.on("mouseenter mouseleave",b))),n.prev&&(n.prev=t(n.prev),n.prev.on("click",k.prev),b&&(n.prev.parent().data("hover")||n.prev.on("mouseenter mouseleave",b))),this}})(window.jQuery||window.Zepto);