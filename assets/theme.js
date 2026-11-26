// 主题和字体：放在 <head> 里同步加载，页面画出来之前就定好，不闪。
// 选过的记在本机（localStorage）；网址 ?theme=light|dark、?font=misans|harmony|system 优先。
// 地图、登录页 <html data-theme-lock> 始终深色。字体 2026-11-22 定为 MiSans；harmony、system 只给字体对比页（00b）换着看。
(function(){
  var H = document.documentElement, q = new URLSearchParams(location.search);
  function pick(k, ok){ var v = q.get(k); try { if (v) localStorage.setItem('os-' + k, v); else v = localStorage.getItem('os-' + k); } catch (e) {} return ok.indexOf(v) >= 0 ? v : null; }
  var t = pick('theme', ['light', 'dark']); if (t) H.dataset.theme = t;
  var f = pick('font', ['misans', 'harmony', 'system']) || 'misans';
  if (f !== 'misans') H.dataset.font = f;
  if (f !== 'system') document.write('<link rel="stylesheet" href="assets/fonts-' + (f === 'harmony' ? 'harmonyos' : 'misans') + '.css">');
})();
