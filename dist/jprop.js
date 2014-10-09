/* jplus 2014-10-09 */
(function(t){"use strict";function e(t,e){this.elem=t,this.callback=e,this.data={start:{},move:{}}}var n=document.createElement("div").style,r=["","-webkit-","-moz-","-ms-","-o-"],i=r.length,o=t.camelCase;t.css3fix=function(t){for(var e,s=0;i>s;s+=1)if(e=o(r[s]+t),e in n)return e;return!1};var s="ontouchstart"in document,a=s?{start:"touchstart",move:"touchmove",end:"touchend"}:{start:"mousedown",move:"mousemove",end:"mouseup"},c=function(t){return c="touches"in t?function(t){var e=t.touches[0];return{x:e.clientX,y:e.clientY}}:function(t){return{x:t.clientX,y:t.clientY}},c(t)},u=document.addEventListener?function(t,e,n){t.addEventListener(e,n,!1)}:function(t,e,n){t.attachEvent("on"+e,n)},f=document.removeEventListener?function(t,e,n){t.removeEventListener(e,n)}:function(t,e,n){t.detachEvent("on"+e,n)},l="function"==typeof window.setImmediate?function(t){window.setImmediate(t)}:function(t){window.setTimeout(t,0)};e.prototype={eventType:a,init:function(){return this.addSwipe()},addSwipe:function(){var t=this;return this.START=function(e){t.start.call(t,e)},u(this.elem,this.eventType.start,this.START),this},removeSwipe:function(){return f(this.elem,this.eventType.start,this.START),this},addEvent:function(e,n){return"string"==typeof e&&t.isFunction(n)&&(this.callback[e]=n),this},addDocEvent:function(){var t=this;this.MOVE=function(e){t.move.call(t,e)},this.END=function(e){t.end.call(t,e)},u(document,this.eventType.move,this.MOVE),u(document,this.eventType.end,this.END)},removeDocEvent:function(){f(document,this.eventType.move,this.MOVE),f(document,this.eventType.end,this.END)},preventDefault:function(t){"preventDefault"in(t=t||window.event)?t.preventDefault():t.returnValue=!1},start:function(t){var e=this,n=e.elem,r=e.data,i=e.callback,o=c(t);e.preventDefault(t),r.start.x=r.move.x=o.x,r.start.y=r.move.y=o.y,r.start.timeStamp=+new Date,r.start.begin=!0,r.start.dir=function(t,e){var n=Math.atan2(Math.abs(t),Math.abs(e))*(180/Math.PI);return r.start.dir=function(){return n},n},"start"in i&&i.start.call(n,t,r.start),l(function(){e.addDocEvent()})},move:function(t){var e=this.data,n=this.elem,r=this.callback,i=c(t);this.preventDefault(t),e.move.dir=e.start.dir(i.y-e.start.y,i.x-e.start.x),e.move.x=i.x-e.move.x,e.move.y=i.y-e.move.y,"move"in r&&r.move.call(n,t,e.move),e.move.x=i.x,e.move.y=i.y},end:function(t){var e=this.data,n=this.elem,r=this.callback;if(this.preventDefault(t),this.removeDocEvent(),e.start.begin=!1,e.end={x:e.move.x-e.start.x,y:e.move.y-e.start.y,t:+new Date-e.start.timeStamp,dir:{},stop:!1},220>e.end.t&&Math.max(Math.abs(e.end.x),Math.abs(e.end.y))>10){e.move.dir>30?e.end.dir[e.end.y>0?"down":"up"]=1:e.end.dir[e.end.x>0?"right":"left"]=1;for(var i in e.end.dir)i in r&&(e.end.stop=!0,r[i].call(n,t,e.end))}else if(200>e.end.t&&10>Math.max(Math.abs(e.end.x),Math.abs(e.end.y))){if("tap"in r){if(s){var o=t.target;"A"===o.nodeName?setTimeout(function(){o.click()},0):"A"===o.parentNode.nodeName&&setTimeout(function(){o.parentNode.click()},0)}r.tap.call(n,t,e)}}else!e.end.stop&&"end"in r&&r.end.call(n,t,e.end,e.move)}},t.fn.swipe=function(n){return n&&t.isPlainObject(n)?this.each(function(){t(this).data("swipe",new e(this,n).init())}):this};var h,d,p=t.css3fix("transform"),m=t.css3fix("transition");p&&m?(h={setX:function(t,e){t.style[p]="translateX("+e+"px)"},setY:function(t,e){t.style[p]="translateY("+e+"px)"},animateX:function(e,n,r){t(e).addClass("transi-for-swipeshow"),h.setX(e,n),setTimeout(r,400)},animateY:function(e,n,r){t(e).addClass("transi-for-swipeshow"),h.setY(e,n),setTimeout(r,400)}},d=document.createElement("style"),d.type="text/css",d.innerHTML=".transi-for-swipeshow { -webkit-transition: all .4s ease-out; -moz-transition: all .4s ease-out; transition: all .4s ease-out;}",document.getElementsByTagName("head")[0].appendChild(d)):h={setX:function(t,e){t.style.marginLeft=e+"px"},setY:function(t,e){t.style.marginTop=e+"px"},animateX:function(e,n,r){t(e).animate({marginLeft:n},400,r)},animateY:function(e,n,r){t(e).animate({marginTop:n},400,r)}},t.fn.swipeshow=function(e){var n={dir:"x",className:"cur",speed:3e3,auto:!0,type:"click"};t.extend(n,e),n.dir=n.dir.toUpperCase();var r,i,o=this,s=h["set"+n.dir],a=h["animate"+n.dir],c=o.parent(),u=o.children(),f=u.length,l=c.width(),d=c.height(),p=c.css("position"),v=/x/i.test(n.dir),y=[],g=!0;if(1>=f)return this;2===f&&(u.each(function(){o.append(t(this).clone(!0))}),u=o.children(),f=4,i=!0),u.each(function(){y.push(t(this))}),r=v?l:d,e=n.opts?t(n.opts).children():null,c.css({position:/absolute|fixed|relative/.test(p)?c.css("position"):"relative",overflow:"hidden"}),u.css({"float":"left",width:l,height:d}),o.css({position:"absolute",top:0,left:0,width:v?l*f:l,height:v?d:d*f}).on("click","a",function(t){g?t.preventDefault():g=!0});var b,x,w=0,$=0,_=0,k=o[0],O=!0,E=null,T={check:function(t){var e=t-w;return t>w?(_-=e,_=0>_?_+f:_):w>t&&(_=(_-e)%f),w=t,$=w*r,this},callback:function(){var t=!1;0===w?(w=-1,o.children().last().prependTo(o),t=!0):w===1-f&&(w=2-f,o.children().first().appendTo(o),t=!0),t&&($=w*r,s(m?o.removeClass("transi-for-swipeshow")[0]:k,$)),O=!0},slide:function(){return O=!1,a(k,$,this.callback),e&&(i?e.removeClass(n.className).eq(_%2).add(e.eq(_)).addClass(n.className):e.eq(_).addClass(n.className).siblings().removeClass(n.className)),this},normal:function(){O&&(T.check(Math.round($/r)).slide(),n.callback&&n.callback.call(o,i?_%2:_))},next:function(){return O?(T.check(w-1).slide(),n.callback&&n.callback.call(o,i?_%2:_),this):this},prev:function(){O&&(T.check(w+1).slide(),n.callback&&n.callback.call(o,i?_%2:_))}}.check(0).slide();return o.swipe({tap:function(){g=!1,T.normal()},start:function(){O&&o.removeClass("transi-for-swipeshow")},move:function(t,e){O&&($+=e[n.dir.toLowerCase()],s(k,$))},end:T.normal,up:v?T.normal:T.next,down:v?T.normal:T.prev,left:v?T.next:T.normal,right:v?T.prev:T.normal}),e&&n.type&&(x=e.parent().on(n.type,e.get(0).nodeName.toLowerCase(),function(){O&&T.check(-y[t(this).index()].index()).slide()})),n.auto&&(b=function(t){t.preventDefault(),"mouseenter"===t.type?clearTimeout(E):T.loop()},T.loop=function(){E=setTimeout(function(){T.next().loop()},n.speed)},c.on("mouseenter mouseleave",b).data("hover",!0),x&&!x.parent().data("hover")&&x.on("mouseenter mouseleave",b),T.loop()),n.next&&(n.next=t(n.next),n.next.on("click",T.next),b&&n.next.parent().data("hover")||n.next.on("mouseenter mouseleave",b)),n.prev&&(n.prev=t(n.prev),n.prev.on("click",T.prev),b&&n.prev.parent().data("hover")||n.prev.on("mouseenter mouseleave",b)),this}})(jQuery||Zepto);