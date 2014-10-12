jPlus
=====

不再喜欢「选择dom元素-进行操作」的编程风格？

开始讨厌长长的链式调用？

想用前端MV*框架，难以抛弃的jQuery库却成了阻碍？

试试jPlust提供的新选择——`jQuery 多态编程风格`

jQuery中的MV*模式

## 用法

引入 jQuery，再引入 jplus，即可在浏览器端正常使用。

```html
<script type="text/javascript" src="jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="jplus.js"></script>
```


## API说明

###$.fn.render(api)

该方法的作用是，将部分链式调用拆分成key-value的形式；

`render`方法接受一个对象作为参数；

其`key`为`$.fn`中存在的任意方法名（包括`render`自身）；

其`value`的值将作为`key`所对应的方法的参数,如果`$.fn[key]`接受多个参数，则写成数组形式；

```javascript
$('body').render({
	text: '$.fn.text 方法将该段文字载入body中',
	css: ['background', '#f00']
});
```

针对`$('body')`的所有`$.fn[key]`操作，它们的参数都由`$.fn.render`集中处理；

<a href="http://jsbin.com/jelerejafete/1/edit" target="_blank">`$.fn.render`的在线demo</a>

###$.fn.refresh(model)

该方法的作用是，管理一个区域的参数，需要配合`html`代码，如下所示：

```html
<html>
<body>
	<div class="wrap" js="css-textAlign: align;">
		<ul js="css-color: color;">
			<li js="text: txt;"></li>
			<li js="txt; animate: anim;"></li>
			<li js="txt; render: data;"></li>
		</ul>
	</div>
</body>
</html>
```

`html`中`js`属性的书写格式与`CSS`一样，属性名与`render`方法一样，都来自`$.fn`但并不把具体的值写在上面，而是写一个自定义的变量名，具体的值在 `javascript`按需选择，按需改变；

`refresh`只管理一个区域，接受一个对象作为参数；

其`key`为上述`html`代码里自定义的变量名，其`value`值将作为相对应的`$.fn`属性名的参数

```javascript
$('body').refresh({

	align: 'center',

	color: 'green',

	txt: [1,2,3,4,5,6,7,8,9,0],

	anim: [{
		textIndent: '100px',
		lineHeight: '100px'
	}, 1000],

	data: {
		html: '<span js="text: txt1"></span><span js="text: txt2"></span><span js="text: txt3"></span>',
		refresh: {
			txt1:'span1',
			txt2:'span2',
			txt3:'span3'
		}
	},

	func: function() {
		this.css('color', '#f00');
	}
});

//可多次使用
setTimeout(function() {
  console.log($('body').getVM());
  $('body').refresh({
    align:'right',
    color:'blue',
    txt:'change'
  });
}, 1000);
```
当多个`dom`拥有同一个`js`属性，如上面的`text:txt`，那么第二个开始text可以省略，只需要写txt即可；

此时，`txt`属性若为数组，且`length`大于等于2，且所有项都是同一数据类型，数组的项将依次作为参数传入`$.fn.text`方法,否则所有`dom`操作接受的参数都一样；

当数组的`length`大于当前被`txt`标识的`dom`的个数时，将以第一个被txt标识的`dom`为模板，自动生成和添加到最后一个被txt标识的`dom`的后面，即自带repeat效果；

如果数组的`length`小于当前被`txt`标识的`dom`个数，则只刷新前length个`dom`；

`refresh`可嵌套使用，即它也可以被写在`html`标签的`js`属性中作为属性名；

当它与可嵌套的`render`方法配合使用时，相当于自带模板引擎，而且不需要破坏`html`代码的纯粹性；

在模板字符串中添加js属性，然后调用`refresh`刷新当前dom区域即可；

`refresh`可多次使用，以便动态更新`dom`区域;

ps:`html`标签中如果出现了`noscan`或`app`属性，该标签的子元素将只由它的`refresh`或`listen`方法来管理，该标签的父元素的`refresh`不扫描该标签子元素的js属性；如此切割分配区域

<a href="http://jsbin.com/yoxezuzefepa/1/edit" target="_blank">`$.fn.refresh`的在线demo</a>

###$.fn.listen

该方法的作用时，返回一个被侦听的对象，当其属性变化时，自动调用`refresh`方法

沿用上面的`html`代码，`listen`方法的使用方式如下：

```javascript
var model = {

	align: 'center',

	color: 'green',
    //自带repeat，如果数组的length大于目前的目标dom数量，则自动添加
	txt: [1,2,3,4,5,6,7,8,9,0],

	anim: [{
		textIndent: '100px',
		lineHeight: '100px'
	}, 1000],

	data: {
		html: '<span js="text: txt1"></span><span js="text: txt2"></span><span js="text: txt3"></span>',
		refresh: {
			txt1:'span1',
			txt2:'span2',
			txt3:'span3'
		}
	},

	func: function() {
		this.css('color', '#f00');
	}
};

model = $('body').listen(model);

//可多次使用
setTimeout(function() {

model.extend({
    align:'right',
    color:'blue',
    txt:'change'
  });

}, 1000);
```

使用`listen`方法时，自定义的变量名范围将受到约束，不建议与`dom`元素的原生属性（如data、title、style）重复，否则会抛出错误；

`listen`返回的对象拥有`extend`和`each`方法，作用于`$.extend`和`$.each`类似，请用该对象自带的这两个方法，不要以其他形式遍历该对象；

<a href="http://jsbin.com/codudajiginu/1/edit" target="_blank">`$.fn.listen`的在线demo</a>

###$.define(selector, callback)

`$.define`是`$.fn.listen`的静态方法版本，放回值也一样，都是受侦听的对象；

它接受两个参数，其一为`jQuery`选择器，指定要管理的区域，第二参数为函数类型；

沿袭上面的例子，`$.define`用法如下：

```javascript

var model = $.define('body', function($scope) {
	$.extend($scope, {

		align: 'center',

		color: 'green',
	    //自带repeat，如果数组的length大于目前的目标dom数量，则自动添加
		txt: [1,2,3,4,5,6,7,8,9,0],

		anim: [{
			textIndent: '100px',
			lineHeight: '100px'
		}, 1000],

		data1: {
			html: '<span js="text: txt1"></span><span js="text: txt2"></span><span js="text: txt3"></span>',
			refresh: {
				txt1:'span1',
				txt2:'span2',
				txt3:'span3'
			}
		},

		func: function() {
			this.css('color', '#f00');
		}
	});
});

//可多次使用
setTimeout(function() {

model.extend({
    align:'right',
    color:'blue',
    txt:'change'
  });

}, 1000);
```

除了操作传入的参数$scope外，直接返回一个对象也可以

<a href="http://jsbin.com/xejivunekope/1/edit" target="_blank">`$.define`的在线demo</a>

###$.module

`$.module`是一个被侦听的对象，它可以管理整个页面的所有`app`区域

上述例子的`html`代码要新增一些内容：

```html
<body app="global">
  <div class="wrap" js="css-textAlign: align;">
    <ul js="css-color: color;">
      <li js="text: txt;"></li>
      <li js="txt; animate: anim;"></li>
      <li js="txt; render: data1;"></li>
    </ul>
  </div>
</body>
```

```javascript
	$.module.ready(function() {
		`this.global = {

			align: 'center',

			color: 'green',
				//自带repeat，如果数组的length大于目前的目标dom数量，则自动添加
				txt: [1,2,3,4,5,6,7,8,9,0],

				anim: [{
					textIndent: '100px',
					lineHeight: '100px'
				}, 1000],

				data1: {
					html: '<span js="text: txt1"></span><span js="text: txt2"></span><span js="text: txt3"></span>',
					refresh: {
						txt1:'span1',
						txt2:'span2',
						txt3:'span3'
					}
				},

				func: function() {
					this.css('color', '#f00');
				}
			};


			setTimeout(function() {
				$.module.global.extend({
				    align:'right',
				    color:'blue',
				    txt:'change'
				  });
			}, 1000)
		});
```

`$.module.ready`方法将在`$(document).ready(fn)`的基础上，扫描页面所有`app`区域；

将`model`数据赋值给它的属性，自动生成一个`listen`后的对象，刷新视图，此后不断'extend'数据即可

<a href="http://jsbin.com/bapeqomenila/1/edit" target="_blank">`$.module`的在线demo</a>


###$.observe

该静态方法用以侦听对象的属性变化，事件触发做了异步处理，过滤掉了相同的值，以及短时间内反复重置某个属性时，只取最后一个更新的值

`$.observe`方法返回的对象拥有四个方法，`on`方法添加事件，`off`方法解除事件，`each`遍历对象，`extend`拓展对象

```javascript
	var obj = $.observe({});

	obj.on('test', function(value, propName, oldValue) {
		//this值指向obj
		document.body.innerHTML += [].slice.call(arguments).join(' ') + '<br>';
	});

	obj.on('test.nameSpace1', function(value, propName, oldValue) {
		//支持命名空间
		document.body.innerHTML += 'nameSpace1' + [].slice.call(arguments).join(' ') + '<br>';
	});

	obj.on('test.nameSpace2', function(value, propName, oldValue) {
		//支持命名空间
		document.body.innerHTML += 'nameSpace2' + [].slice.call(arguments).join(' ') + '<br>';
	});

	obj.each(function(key, value) {
		document.body.innerHTML += key + ':' + value + '<br>';
	});

	obj.extend({
		test: 'extend'
	});

	obj.off('.nameSpace2');

	obj.test = 'change';

```
<a href="http://jsbin.com/bapeqomenila/1/edit" target="_blank">`$.module`的在线demo</a>


##补充说明

`jPlus`的核心是`render`和`refresh`方法，其他方法都是在`$.observe`的支持下提供的不同风格；

充分领会`refresh`的用法，已能带来`jQuery`编程风格上的极大不同；

希望`jPlus`确实能帮助到开发者使用`jQuery`时有更好的体验；

`jPlus`提供的一切方法，都支持IE6+;

请多多反馈不足之处，以便改进。




