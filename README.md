# 抽奖转盘

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
  values: [] //奖品对象，根据传多少个奖品对象，自动生成相应数量的转盘抽奖内容
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
将转盘实例化到容器当中

```javascript
turntable.draw(document.getElementById('container'));
```

#### start
开始抽奖

```javascript
turntable.start();
```

#### end
抽奖结束

```javascript
//id 中奖的奖品id，对应初始化选项里面的values的奖品对象的id
//callback 转盘滚动结束后，触发回调
turntable.end(id, function(data) {
  console.log(data); //对应在values里面的礼品对象
});
```
