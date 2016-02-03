let start = 0;
let during = 5 * 60;
let init = parseInt(this.svg.style.transform
            .replace('rotate(', '')
            .replace('deg)', '') || 0, 10);
let end = init + (360 * 8);

let s = () => {
  start++;
  let r = tween.easeInQuart(start, init, end - init, during);
  this.svg.style.transform = 'rotate(' + r + 'deg)';
  if (start < during) requestAnimationFrame(s);
  else {
    start = 0;
    init = parseInt(this.svg.style.transform
            .replace('rotate(', '')
            .replace('deg)', ''), 10);
    end = init + (360 * 8);
    requestAnimationFrame(p);
  }
};

let p = () => {
  start++;
  let r = tween.linear(start, init, end - init, during);
  this.svg.style.transform = 'rotate(' + r + 'deg)';
  if (start < during) requestAnimationFrame(p);
};

s();
