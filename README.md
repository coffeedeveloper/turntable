# 抽奖转盘

由于每个抽奖活动的样式都会不一样，因此这个插件只实现了绘画转盘及转盘转动的模块。
点击抽奖按钮，和抽奖转盘的外框则自行实现，可以参考`examples`里面的例子。



**支持IE9以上版本浏览器**

#### 示例

![示例](http://
oap12gnk8.bkt.clouddn.com/turntable-example.png)
- [默认方式转盘](http://example.coffeedeveloper.com/turntable/examples/frame.html)
- [transition方式转盘](http:///example.coffeedeveloper.com/turntable/examples/transition.html)

#### 接口说明
```javascript
var turntable = new Turntable({
  size: 320, //转盘尺寸，默认为320
  textSpace: 15, //奖品名称距离转盘边距，默认为15
  imgSpace: 50, //奖品图片距离转盘边距，默认为50
  speed: 5, //触发start事件后，转盘开始转动的速度，数字必须能给360整除
  fastSpeed: 10, //转盘进入高速转动的速度，数字必须能够给360整除
  slowSpeed: 5, //转盘从高速转动降下来的速度，数字必须能够给360整除
  speedUp: 2000, //多少毫秒后进入高速转动
  speedDown: 2000, //触发stop事件后，多少毫秒进入缓速
  values: [], //奖品对象，根据传多少个奖品对象，自动生成相应数量的转盘抽奖内容
  container: document.getElementById('id') //转盘的容器，如果设置了之后，new Turntable的时候会自动填充内容
});
```

#### 新增支持`transition`方式

```javascript
var turntabl = new Turntable({
  type: 'transition', //转盘转动类型
  size: 320, //转盘尺寸，默认为320
  textSpace: 15, //奖品名称距离转盘边距，默认为15
  imgSpace: 50, //奖品图片距离转盘边距，默认为50
  speed: 5, //transition动画持续多长时间，秒为单位
  ring: 8, //转动多少圈后到达终点，越大转速越快
  values: [], //奖品对象，根据传多少个奖品对象，自动生成相应数量的转盘抽奖内容
  container: document.getElementById('id') //转盘的容器，如果设置了之后，new Turntable的时候会自动填充内容
});
```

#### turntable的奖品对象说明

```javascript
var turntable = new Turntable({
  values: [
    {
      id: 1, //奖品id，可以重复（比如：谢谢参与就可以有n个，中奖后会随即选择一个转动到该位置
      name: '一等奖', //奖品名称
      img: {
        src: 'gift.png', //奖品图片路径
        width: 50, //奖品图片宽度，请根据实际情况去设置，避免太大
        height: 50, //奖品图片高度，请根据实际情况去设置，避免太大，与宽度等比率缩放
      },
      bg: '#ccc', //该奖品的在转盘中的扇形背景颜色
      fill: '#000' //奖品名称的文字颜色
    }
  ]
});
```

#### turntable事件说明

##### draw
将转盘实例化到容器当中，如果设置`container`属性，则不需要调用该方法

```javascript
turntable.draw(document.getElementById('container'));
```

#### start（非transition方式的抽奖）
开始抽奖（开始转动转盘）

```javascript
turntable.start();
```

#### stop（非transition方式的抽奖）
抽奖结束（停止转动转盘）

```javascript
//id 中奖的奖品id，对应初始化选项里面的values的奖品对象的id
//callback 转盘滚动结束后，触发回调
turntable.stop(id, function(data) {
  console.log(data); //对应在values里面的礼品对象
});
```

#### goto（只能用于transition方式的抽奖）
跳转到指定的id的奖品，在请求后台取得中奖奖品id后，就滚动到对应的奖品

```javascript
//id 中奖的奖品id，对应初始化选项里面的values的奖品对象的id
//callback 转盘滚动结束后，触发回调
turntable.goto(id, function(data) {
  console.log(data); //对应在values里面的礼品对象
});
```
