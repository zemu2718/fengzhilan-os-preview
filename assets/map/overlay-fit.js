// 叠加层（流光、细节、热区）的盒子比舞台大得多，让图层边缘落在画面外。
// 图层边缘落在可见区域里时，浏览器重绘这块图层会在边上闪出 1px 竖线。
// 内容仍按 900 × 506.5 的中间构图坐标画；这里换算 viewBox / 画布坐标，保证位置不变。
(() => {
  const BOX = {x0: -.175, x1: 1.175, y0: -.1, y1: 1.1};      // 与 CSS 里 .overlay-box 的 left/top/width/height 一致
  // WebGL 底图四周留边后整体放大了 1/.9865（横）、1/.982（竖），叠加层跟着放大
  const scale = () => document.body.classList.contains('gl')
    ? {sx: 1.0137, sy: 1.0183, ox: .00685, oy: .00915}
    : {sx: 1, sy: 1, ox: 0, oy: 0};
  // h：该图层原来的 viewBox 高度（900 × h）
  window.overlayView = (h = 506.5) => {
    const s = scale();
    return {
      x: (BOX.x0 + s.ox) * 900 / s.sx, w: (BOX.x1 - BOX.x0) * 900 / s.sx,
      y: (BOX.y0 + s.oy) * h / s.sy, h: (BOX.y1 - BOX.y0) * h / s.sy,
    };
  };
  const svgs = [...document.querySelectorAll('svg.overlay-box')];
  svgs.forEach(svg => { svg.dataset.vh = svg.viewBox.baseVal.height; });
  function fit() {
    svgs.forEach(svg => {
      const v = overlayView(+svg.dataset.vh), box = `${v.x} ${v.y} ${v.w} ${v.h}`;
      if (svg.getAttribute('viewBox') !== box) svg.setAttribute('viewBox', box);   // 没变就不动，免得整层 SVG 重画
    });
  }
  fit();
  new MutationObserver(fit).observe(document.body, {attributes: true, attributeFilter: ['class']});
})();
