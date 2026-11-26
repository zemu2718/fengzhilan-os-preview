(() => {
  const stage = document.querySelector('[data-flow-stage]');
  const canvas = stage.querySelector('.flow-canvas');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const island = stage.querySelector('.island-glow');
  const parcels = [...stage.querySelectorAll('.shipment')];
  const belt = stage.querySelector('#belt-route');
  const beltLength = belt.getTotalLength();
  let beltPosition = .08;
  let focused = false;
  let view = {x: 0, y: 0, w: 900, h: 506.5};
  function drawParcels() {
    parcels.forEach((parcel, index) => {
      const u = (beltPosition + index / parcels.length) % 1;
      const point = belt.getPointAtLength(u * beltLength);
      const scale = .72 + .35 * (point.y - 303) / 80;
      parcel.setAttribute('transform', `translate(${point.x} ${point.y}) scale(${scale})`);
      parcel.setAttribute('opacity', Math.min(1, u / .024, (1 - u) / .024));
    });
  }
  const speed = 83; // 中景速度，单位为构图像素/秒
  const gaps = [1.2, .8, 1.35, 1.65, 1.05];
  let cycle = 0;
  const arcs = [...stage.querySelectorAll('#currents path')].map((path, i) => {
    const length = path.getTotalLength();
    const count = Math.ceil(length);
    const points = Array.from({length: count + 1}, (_, j) => path.getPointAtLength(j * length / count));
    const start = cycle;
    const mid = points[Math.floor(count / 2)];
    const duration = length / (speed * (.81 + .39 * mid.y / 506.5));
    cycle += duration + gaps[i];
    return {points, start, duration};
  });

  function sample(points, fraction) {
    const offset = Math.max(0, Math.min(1, fraction)) * (points.length - 1);
    const index = Math.min(Math.floor(offset), points.length - 2);
    const a = points[index], b = points[index + 1], t = offset - index;
    return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
  }

  function dot(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  function drawArc(arc, time) {
    const t = time - arc.start;
    const tail = .48;
    if (t <= 0 || t >= arc.duration + tail) return;
    const point = sample(arc.points, t / arc.duration);
    const depth = .65 + .65 * point.y / 506.5;
    // 光头和尾迹先后穿过同一个岛沿，淡出取决于各自的位置。
    const visibility = age => {
      const u = Math.max(0, Math.min(1, age / .23, (arc.duration - age) / .25));
      return u * u * (3 - 2 * u);
    };
    const count = 24;
    let prev = sample(arc.points, (t - tail) / arc.duration);
    ctx.lineCap = 'round';
    for (let i = 1; i <= count; i++) {
      const u = i / count;
      const age = t - tail * (1 - u);
      const next = sample(arc.points, age / arc.duration);
      const opacity = .85 * u * u * visibility(age);
      if (opacity > .003) {
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(next.x, next.y);
        ctx.lineWidth = (.28 + 1.35 * u) * depth;
        ctx.strokeStyle = 'rgba(255,207,126,' + opacity + ')';
        ctx.stroke();
      }
      prev = next;
    }
    const fade = visibility(t);
    if (!fade) return;
    const radius = 8 * depth;
    const halo = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
    halo.addColorStop(0, 'rgba(255,228,154,' + (.77 * fade) + ')');
    halo.addColorStop(.32, 'rgba(255,185,87,' + (.32 * fade) + ')');
    halo.addColorStop(1, 'rgba(255,173,65,0)');
    dot(point.x, point.y, radius, halo);
    dot(point.x, point.y, 1.55 * depth, 'rgba(255,250,217,' + fade + ')');
  }

  let elapsed = .72;
  let last = null;
  let frame = 0;
  function paint(now) {
    const storm = document.body.classList.contains('w-storm');
    const delta = last === null ? 0 : (now - last) / 1000 * (storm ? .62 : 1);
    const zooming = document.body.classList.contains('zooming');
    if (!focused) elapsed += delta;
    last = now;
    const t = elapsed % cycle;
    // 推近后画布是隐藏的：清空一次就不再每帧清画
    if (!focused || !cleared) { ctx.clearRect(view.x, view.y, view.w, view.h); cleared = focused; }
    if (!focused) for (const arc of arcs) drawArc(arc, t);

    // 流光抵达电商岛时，仓库前庭短暂映亮。
    const age = t - arcs[3].start - arcs[3].duration + .22;
    const attack = Math.min(1, Math.max(0, age / .38));
    const decay = Math.min(1, Math.max(0, (age - .38) / 1.15));
    const response = Math.sin(attack * Math.PI / 2) ** 2 * Math.cos(decay * Math.PI / 2) ** 2;
    island.style.opacity = .12 + .68 * response;
    // 镜头推拉期间传送带暂停，少一层每帧重绘
    if (!zooming) { beltPosition = (beltPosition + delta * (.052 + (focused ? 0 : .022 * response))) % 1; drawParcels(); }
    frame = requestAnimationFrame(paint);
  }

  let cleared = false, sizeKey = '';
  // 尺寸或坐标换算真的变了才重建画布：推近、拉远等状态切换时重建一块几千像素的画布，会卡一下
  function sync() {
    const scale = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * scale)), h = Math.max(1, Math.round(canvas.clientHeight * scale));
    // 画布盒子比构图大（见 overlay-fit.js），这里把构图坐标映射到画布上
    const v = window.overlayView ? overlayView(506.5) : {x: 0, y: 0, w: 900, h: 506.5};
    const key = [w, h, v.x, v.y, v.w, v.h].join();
    if (key !== sizeKey) {
      sizeKey = key; view = v;
      canvas.width = w; canvas.height = h;
      const kx = w / view.w, ky = h / view.h;
      ctx.setTransform(kx, 0, 0, ky, -view.x * kx, -view.y * ky);
      cleared = false;
    }
    focused = document.body.classList.contains('focus');
    if (document.hidden || reduce.matches) { cancelAnimationFrame(frame); frame = 0; last = null; island.style.opacity = ''; drawParcels(); return; }
    if (location.hash.includes('still')) {
      elapsed = .72; drawParcels();
      ctx.clearRect(view.x, view.y, view.w, view.h);
      if (!focused) for (const arc of arcs) drawArc(arc, elapsed);
    } else if (!frame) {
      last = null;
      frame = requestAnimationFrame(paint);
    }
  }
  if (ctx) {
    new ResizeObserver(sync).observe(stage);
    document.addEventListener('visibilitychange', sync);
    reduce.addEventListener('change', sync);
    new MutationObserver(sync).observe(document.body, {attributes: true, attributeFilter: ['class']});
    sync();
  }
})();
