jPlus
=====

## 关于 jplus

不再喜欢「选择dom元素-进行操作」的编程风格？

开始讨厌长长的链式调用？

想用前端MV*框架，难以抛弃的jQuery库却成了阻碍？

试试jPlust提供的新选择——jQuery 多态编程风格

jQuery中的MV*模式

## 用法

首先必须引入 jQuery，再引入 jplus，即可在浏览器端正常使用。

```html
<script type="text/javascript" src="jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="jplus.js"></script>
```


## API说明

###$.fn.render(api)

`render`方法接受一个对象作为参数`type: {{ object }}‘;

其`key`为`$.fn`中存在的任意方法（包括`render`自身）;

其`value'的值将作为'key'所对应的方法的参数,如果`$.fn[key]`接受多个参数，写成数组形式即可

```javascript
$('body').render({
	text: '$.fn.text 方法将该段文字载入body中',
	css: ['background', '#f00']
});
```