const tween = {
  linear: (t, b, c, d) => c*t/d + b,
  easeInQuart: (t, b, c, d) => c * (t /= d) * t * t * t + b,
  easeOutQuart: (t, b, c, d) => -c * ((t=t/d-1)*t*t*t - 1) + b,
};

const extend = (target, ...args) => {
  for (let arg of args) {
    for (let p in arg) {
      target[p] = arg[p];
    }
  }
  return target;
};

const createSvgEle = name => document.createElementNS('http://www.w3.org/2000/svg', name);

const setAttrs = (ele, attrs) => {
  for (let t in attrs) {
    if (t == 'href') ele.setAttributeNS('http://www.w3.org/1999/xlink', t, attrs[t]);
    else ele.setAttribute(t, attrs[t]);
  }

  return ele;
};

const getPathPoint = (oPoint, degree) => {
  return {
    x: oPoint.x + oPoint.r * Math.cos(degree * (Math.PI / 180)),
    y: oPoint.y + oPoint.r * Math.sin(degree * (Math.PI / 180)),
    degree,
  }
};

const getPointsDistance = (o, t) => Math.sqrt(Math.pow(t.x - o.x, 2) + Math.pow(t.y - o.y, 2));

const movePoint = (oPoint, tPoint, dis, len) => {
  let x = -1 * ((dis * (tPoint.x - oPoint.x) / len - tPoint.x));
  let y = -1 * ((dis * (tPoint.y - oPoint.y) / len - tPoint.y));
  return { x, y };
}

const random = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

const defaults = {
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

export default class Turntable {
  constructor(options) {
    this.opts = extend({}, defaults, options);
    if (!this.opts.values) {
      throw Error('values必须要有值');
      return;
    }

    let half = this.opts.size / 2;
    this.center = {
      x: half,
      y: half,
      r: half,
    };

    //圆的x轴坐标
    this.startPoint = {
      x: this.opts.size,
      y: half,
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

  getValueIndexById(id) {
    let r = this.values.filter(d => d.id == id).map((d, i) => i);

    return r[random(0, r.length - 1)];
  }

  getValueDegreeByIndex(index) {
    return this.values[index].degree;
  }

  turning() {
    this.turnTotal += this.turnBase;
    if (this.turnTotal >= 360 || this.turnTotal <= -360 ) this.turnTotal = 0;

    this.svg.style.transform = 'rotate(' + -this.turnTotal + 'deg)';
  }

  turned() {
    if (this.turnTotal >= 360 || this.turnTotal <= -360 ) this.turnTotal = 0;
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

  turn() {
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
  }

  start() {
    if (this.isTurning) return;
    this.turnBase = this.opts.speed;
    this.turnTotal = 0;
    this.isTurnStop = false;
    this.index = null;
    this.isTurning = true;
    this.turn();

    setTimeout(function() {
      this.turnBase = this.opts.fastSpeed;
    }.bind(this), this.opts.speedUp);
  }

  stop(id, cb) {
    this.index = this.getValueIndexById(id);
    this.turnEndDegree = this.getValueDegreeByIndex(this.index);
    this.turnBase = this.opts.slowSpeed;
    if (typeof cb !== 'function') cb = function(){};
    this.turnCallback = cb;

    setTimeout(function() {
      this.turnBase = 1;
      this.isTurnStop = true;
    }.bind(this), this.opts.speedDown);
  }

  goto(i) {
    if (i < this.values.length) {
      this.svg.style.transform = 'rotate(' + -this.values[i].degree + 'deg)';
    }
  }

  refresh() {
    this.draw(this.container);
  }

  draw(container) {
    var that = this;
    this.container = container;

    let svg = setAttrs(createSvgEle('svg'), {
      width: this.opts.size,
      height: this.opts.size,
      xmlns: 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink'
    });

    let degree = this.degree;
    let pathStartPoint = this.startPoint;
    let pathEndPoint = getPathPoint(this.center, degree);

    this.values.map((info, i) => {
      info.degree = i == 0 ? 90 + this.degree / 2 : this.values[i-1].degree + this.degree;
      if (info.degree >= 360) info.degree = info.degree - 360;

      let g = createSvgEle('g');

      let path = setAttrs(createSvgEle('path'), {
        fill: info.bg,
        d: `
          M${this.center.x}, ${this.center.y}
          L${pathStartPoint.x}, ${pathStartPoint.y}
          A${this.center.x}, ${this.center.y}
          1 0, 1
          ${pathEndPoint.x}, ${pathEndPoint.y}
          z
        `
      });

      g.appendChild(path);

      let fanCenterPoint = {
        x: (pathEndPoint.x + pathStartPoint.x) / 2,
        y: (pathEndPoint.y + pathStartPoint.y) / 2
      };

      let centerDistance = getPointsDistance(fanCenterPoint, this.center);

      let textDegree = 180 - ((360 - this.degree * 2) / 2) / 2;
      let textPoint = movePoint(this.center, fanCenterPoint, this.opts.textSpace, centerDistance);
      let rotate = textDegree + this.degree * i;

      let text = setAttrs(createSvgEle('text'), {
        x: textPoint.x,
        y: textPoint.y,
        'text-anchor': 'middle',
        fill: info.color,
        transform: `rotate(${rotate}, ${textPoint.x}, ${textPoint.y})`
      });
      text.appendChild(document.createTextNode(info.name));

      g.appendChild(text);

      if (info.img) {
        var imgPoint = movePoint(this.center, fanCenterPoint, this.opts.imgSpace, centerDistance);
        var img = setAttrs(createSvgEle('image'), {
          width: info.img.width,
          height: info.img.height,
          href: info.img.src,
          x: imgPoint.x,
          y: imgPoint.y,
          transform: `rotate(${rotate}, ${imgPoint.x}, ${imgPoint.y}) translate(${-(info.img.width / 2)}, ${-(info.img.height / 2)})`
        });
        g.appendChild(img);
      }

      svg.appendChild(g);

      pathStartPoint = pathEndPoint;
      pathEndPoint = getPathPoint(this.center, this.degree + this.degree * (i + 1));
    });

    container.appendChild(svg);
    this.svg = svg;
  }
}
