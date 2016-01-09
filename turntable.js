;(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define('Turntable', [], function() {
      return (root.Turntable = factory());
    });
  } else {
    root.Turntable = factory();
  }
})(this, function(options) {
  function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
      var arg = arguments[i];
      for (var p in arg) {
        target[p] = arg[p];
      }
    }
    return target;
  }

  function createSvgEle(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
  }

  function setAttrs(ele, attrs) {
    for (var t in attrs) {
      if (t == 'href') {
        ele.setAttributeNS('http://www.w3.org/1999/xlink', t, attrs[t]);
      } else {
        ele.setAttribute(t, attrs[t]);
      }
    }
    return ele;
  }

  function getPathPoint(oPoint, degree) {
    return {
      x: oPoint.x + oPoint.r * Math.cos(degree * (Math.PI / 180)),
      y: oPoint.y + oPoint.r * Math.sin(degree * (Math.PI / 180)),
      degree: degree
    }
  }

  function getPointsDistance(oPoint, tPoint) {
    return Math.sqrt(Math.pow(tPoint.x - oPoint.x, 2) + Math.pow(tPoint.y - oPoint.y, 2));
  }

  function movePoint(oPoint, tPoint, dis, len) {
    var x = -1 * ((dis * (tPoint.x - oPoint.x) / len - tPoint.x));
    var y = -1 * ((dis * (tPoint.y - oPoint.y) / len - tPoint.y));
    return {
      x: x,
      y: y
    }
  }

  function random(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  /*
  {
    id: 0,
    name: '',
    img: {
      src: '',
      width: 0,
      height: 0
    },
    bg: '',
    color: '',
  }
   */
  var defaults = {
    size: 320,
    textSpace: 15,
    imgSpace: 50,
    speed: 5,
    fastSpeed: 10,
    slowSpeed: 5,
    speedUp: 2000,
    speedDown: 2000,
    values: []
  };

  function Turntable(options) {
    this.opts = extend({}, defaults, options);
    if (!this.opts.values) {
      throw Error('values必须要有值');
      return;
    }

    //圆心
    this.center = {
      x: this.opts.size / 2,
      y: this.opts.size / 2,
      r: this.opts.size / 2
    };

    //圆的x轴坐标
    this.startPoint = {
      x: this.opts.size,
      y: this.opts.size / 2
    };

    this.values = this.opts.values;
    this.count = this.opts.values.length;
    this.degree = 360 / this.count;

    this.container = null;
    this.svg = null;

    if (this.opts.container) {
      this.draw(this.opts.container);
    }
  }

  Turntable.fn = Turntable.prototype = {
    getValueIndexById: function(id) {
      var r = [];

      this.values.map(function(d, i) {
        if (d.id == id) r.push(i);
      });

      if (r.length == 1) return r[0];

      return r[random(0, r.length-1)];
    },

    getValueDegreeByIndex: function(index) {
      return this.values[index].degree;
    },

    turning: function() {
      this.turnTotal += this.turnBase;
      if (this.turnTotal >= 360 || this.turnTotal <= -360 ) this.turnTotal = 0;

      this.svg.style.transform = 'rotate(' + -this.turnTotal + 'deg)';
    },

    turned: function() {
      if (this.turnTotal >= 360 || this.turnTotal <= -360 ) this.turnTotal = 0;
      this.turnTotal += this.turnBase;
      if (parseInt(this.turnTotal, 10) == parseInt(this.turnEndDegree)) {
        cancelAnimationFrame(this.animation);
        this.svg.style.transform = 'rotate(' + -this.turnTotal + 'deg)';
        this.turnCallback(this.opts.values[this.index]);
        return false;
      }

      this.svg.style.transform = 'rotate(' + -this.turnTotal + 'deg)';
      return true;
    },

    turn: function() {
      this.animation = requestAnimationFrame(function() {
        if (!this.isTurnStop) {
          this.turning();
          this.turn();
        } else {
          if (this.turned()) {
            this.turn();
          }
        }
      }.bind(this));
    },

    start: function() {
      this.turnBase = this.opts.speed;
      this.turnTotal = 0;
      this.isTurnStop = false;
      this.index = null;
      this.turn();

      setTimeout(function() {
        this.turnBase = this.opts.fastSpeed;
      }.bind(this), this.opts.speedUp);
    },

    stop: function(id, cb) {
      this.index = this.getValueIndexById(id);
      this.turnEndDegree = this.getValueDegreeByIndex(this.index);
      this.turnBase = this.opts.slowSpeed;
      if (typeof cb !== 'function') cb = function(){};
      this.turnCallback = cb;

      setTimeout(function() {
        this.turnBase = 1;
        this.isTurnStop = true;
      }.bind(this), this.opts.speedDown);
    },

    goto: function(i) {
      if (i < this.values.length) {
        this.svg.style.transform = 'rotate(' + -this.values[i].degree + 'deg)';
      }
    },

    refresh: function() {
      this.draw(this.container);
    },

    draw: function(container) {
      var that = this;
      this.container = container;

      var svg = setAttrs(createSvgEle('svg'), {
        width: this.opts.size,
        height: this.opts.size,
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink'
      });

      var degree = this.degree;
      var pathStartPoint = this.startPoint;
      var pathEndPoint = getPathPoint(this.center, degree);

      for (var i = 0; i < this.values.length; i++) {
        var info = this.values[i];

        if (i == 0) {
          info.degree = 90 + this.degree / 2;
        } else {
          info.degree = this.values[i-1].degree + this.degree;
        }

        if (info.degree >= 360) info.degree = info.degree - 360;

        var g = createSvgEle('g');

        var pathM = [];
        pathM.push('M' + this.center.x + ', ' + this.center.y);
        pathM.push('L' + pathStartPoint.x + ', ' + pathStartPoint.y);
        pathM.push('A' + this.center.x + ', ' + this.center.y);
        pathM.push('1 0, 1');
        pathM.push(pathEndPoint.x + ', ' + pathEndPoint.y);
        pathM.push('z');
        var path = setAttrs(createSvgEle('path'), {
          fill: info.bg,
          d: pathM.join(' ')
        });
        g.appendChild(path);

        var fanCenterPoint = {
          x: (pathEndPoint.x + pathStartPoint.x) / 2,
          y: (pathEndPoint.y + pathStartPoint.y) / 2
        };
        var centerDistance = getPointsDistance(fanCenterPoint, this.center);

        var textDegree = 180 - ((360 - this.degree * 2) / 2) / 2;
        var textPoint = movePoint(this.center, fanCenterPoint, this.opts.textSpace, centerDistance);
        var textTransform = [];
        textTransform.push('rotate(');
        textTransform.push(textDegree + this.degree * i);
        textTransform.push(', ' + textPoint.x);
        textTransform.push(', ' + textPoint.y);
        textTransform.push(')');
        var text = setAttrs(createSvgEle('text'), {
          x: textPoint.x,
          y: textPoint.y,
          'text-anchor': 'middle',
          fill: info.color,
          transform: textTransform.join('')
        });
        text.appendChild(document.createTextNode(info.name));
        g.appendChild(text);

        if (info.img) {
          var imgPoint = movePoint(this.center, fanCenterPoint, this.opts.imgSpace, centerDistance);
          var imgTransform = [];
          imgTransform.push('rotate(');
          imgTransform.push(textDegree + this.degree * i);
          imgTransform.push(', ' + imgPoint.x);
          imgTransform.push(', ' + imgPoint.y);
          imgTransform.push(') ');
          imgTransform.push('translate(')
          imgTransform.push(-1 * (info.img.width / 2));
          imgTransform.push(', ');
          imgTransform.push(-1 * (info.img.height / 2));
          imgTransform.push(')');
          var img = setAttrs(createSvgEle('image'), {
            width: info.img.width,
            height: info.img.height,
            href: info.img.src,
            x: imgPoint.x,
            y: imgPoint.y,
            transform: imgTransform.join('')
          });
          g.appendChild(img);
        }

        svg.appendChild(g);

        pathStartPoint = pathEndPoint;
        pathEndPoint = getPathPoint(this.center, this.degree + this.degree * (i + 1));
      }

      container.appendChild(svg);
      this.svg = svg;
    }
  };

  return Turntable;
});
