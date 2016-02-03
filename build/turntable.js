(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('Turntable', ['module', 'exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.Turntable = mod.exports;
  }
})(this, function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var tween = {
    linear: function linear(t, b, c, d) {
      return c * t / d + b;
    },
    easeInQuart: function easeInQuart(t, b, c, d) {
      return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function easeOutQuart(t, b, c, d) {
      return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    }
  };

  var extend = function extend(target) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var arg = _step.value;

        for (var p in arg) {
          target[p] = arg[p];
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return target;
  };

  var createSvgEle = function createSvgEle(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
  };

  var setAttrs = function setAttrs(ele, attrs) {
    for (var t in attrs) {
      if (t == 'href') ele.setAttributeNS('http://www.w3.org/1999/xlink', t, attrs[t]);else ele.setAttribute(t, attrs[t]);
    }

    return ele;
  };

  var getPathPoint = function getPathPoint(oPoint, degree) {
    return {
      x: oPoint.x + oPoint.r * Math.cos(degree * (Math.PI / 180)),
      y: oPoint.y + oPoint.r * Math.sin(degree * (Math.PI / 180)),
      degree: degree
    };
  };

  var getPointsDistance = function getPointsDistance(o, t) {
    return Math.sqrt(Math.pow(t.x - o.x, 2) + Math.pow(t.y - o.y, 2));
  };

  var movePoint = function movePoint(oPoint, tPoint, dis, len) {
    var x = -1 * (dis * (tPoint.x - oPoint.x) / len - tPoint.x);
    var y = -1 * (dis * (tPoint.y - oPoint.y) / len - tPoint.y);
    return {
      x: x,
      y: y
    };
  };

  var random = function random(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  };

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

  var Turntable = function () {
    function Turntable(options) {
      _classCallCheck(this, Turntable);

      this.opts = extend({}, defaults, options);

      if (!this.opts.values) {
        throw Error('values必须要有值');
        return;
      }

      var half = this.opts.size / 2;
      this.center = {
        x: half,
        y: half,
        r: half
      };
      this.startPoint = {
        x: this.opts.size,
        y: half
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

    _createClass(Turntable, [{
      key: 'getValueIndexById',
      value: function getValueIndexById(id) {
        var r = this.values.filter(function (d) {
          return d.id == id;
        }).map(function (d, i) {
          return i;
        });
        return r[random(0, r.length - 1)];
      }
    }, {
      key: 'getValueDegreeByIndex',
      value: function getValueDegreeByIndex(index) {
        return this.values[index].degree;
      }
    }, {
      key: 'turning',
      value: function turning() {
        this.turnTotal += this.turnBase;
        if (this.turnTotal >= 360 || this.turnTotal <= -360) this.turnTotal = 0;
        this.svg.style.transform = 'rotate(' + -this.turnTotal + 'deg)';
      }
    }, {
      key: 'turned',
      value: function turned() {
        if (this.turnTotal >= 360 || this.turnTotal <= -360) this.turnTotal = 0;
        this.turnTotal += this.turnBase;

        if (parseInt(this.turnTotal, 10) == parseInt(this.turnEndDegree)) {
          cancelAnimationFrame(this.animation);
          this.svg.style.transform = 'rotate(' + -this.turnTotal + 'deg)';
          this.isTurning = false;
          this.turnCallback(this.opts.values[this.index]);
          return false;
        }

        this.svg.style.transform = 'rotate(' + -this.turnTotal + 'deg)';
        return true;
      }
    }, {
      key: 'turn',
      value: function turn() {
        this.animation = requestAnimationFrame(function () {
          if (!this.isTurnStop) {
            this.turning();
            this.turn();
          } else {
            if (this.turned()) {
              this.turn();
            }
          }
        }.bind(this));
      }
    }, {
      key: 'start',
      value: function start() {
        if (this.isTurning) return;
        this.turnBase = this.opts.speed;
        this.turnTotal = 0;
        this.isTurnStop = false;
        this.index = null;
        this.isTurning = true;
        this.turn();
        setTimeout(function () {
          this.turnBase = this.opts.fastSpeed;
        }.bind(this), this.opts.speedUp);
      }
    }, {
      key: 'stop',
      value: function stop(id, cb) {
        this.index = this.getValueIndexById(id);
        this.turnEndDegree = this.getValueDegreeByIndex(this.index);
        this.turnBase = this.opts.slowSpeed;
        if (typeof cb !== 'function') cb = function cb() {};
        this.turnCallback = cb;
        setTimeout(function () {
          this.turnBase = 1;
          this.isTurnStop = true;
        }.bind(this), this.opts.speedDown);
      }
    }, {
      key: 'goto',
      value: function goto(i) {
        if (i < this.values.length) {
          this.svg.style.transform = 'rotate(' + -this.values[i].degree + 'deg)';
        }
      }
    }, {
      key: 'refresh',
      value: function refresh() {
        this.draw(this.container);
      }
    }, {
      key: 'draw',
      value: function draw(container) {
        var _this = this;

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
        this.values.map(function (info, i) {
          info.degree = i == 0 ? 90 + _this.degree / 2 : _this.values[i - 1].degree + _this.degree;
          if (info.degree >= 360) info.degree = info.degree - 360;
          var g = createSvgEle('g');
          var path = setAttrs(createSvgEle('path'), {
            fill: info.bg,
            d: '\n          M' + _this.center.x + ', ' + _this.center.y + '\n          L' + pathStartPoint.x + ', ' + pathStartPoint.y + '\n          A' + _this.center.x + ', ' + _this.center.y + '\n          1 0, 1\n          ' + pathEndPoint.x + ', ' + pathEndPoint.y + '\n          z\n        '
          });
          g.appendChild(path);
          var fanCenterPoint = {
            x: (pathEndPoint.x + pathStartPoint.x) / 2,
            y: (pathEndPoint.y + pathStartPoint.y) / 2
          };
          var centerDistance = getPointsDistance(fanCenterPoint, _this.center);
          var textDegree = 180 - (360 - _this.degree * 2) / 2 / 2;
          var textPoint = movePoint(_this.center, fanCenterPoint, _this.opts.textSpace, centerDistance);
          var rotate = textDegree + _this.degree * i;
          var text = setAttrs(createSvgEle('text'), {
            x: textPoint.x,
            y: textPoint.y,
            'text-anchor': 'middle',
            fill: info.color,
            transform: 'rotate(' + rotate + ', ' + textPoint.x + ', ' + textPoint.y + ')'
          });
          text.appendChild(document.createTextNode(info.name));
          g.appendChild(text);

          if (info.img) {
            var imgPoint = movePoint(_this.center, fanCenterPoint, _this.opts.imgSpace, centerDistance);
            var img = setAttrs(createSvgEle('image'), {
              width: info.img.width,
              height: info.img.height,
              href: info.img.src,
              x: imgPoint.x,
              y: imgPoint.y,
              transform: 'rotate(' + rotate + ', ' + imgPoint.x + ', ' + imgPoint.y + ') translate(' + -(info.img.width / 2) + ', ' + -(info.img.height / 2) + ')'
            });
            g.appendChild(img);
          }

          svg.appendChild(g);
          pathStartPoint = pathEndPoint;
          pathEndPoint = getPathPoint(_this.center, _this.degree + _this.degree * (i + 1));
        });
        container.appendChild(svg);
        this.svg = svg;
      }
    }]);

    return Turntable;
  }();

  exports.default = Turntable;
  module.exports = exports['default'];
});
