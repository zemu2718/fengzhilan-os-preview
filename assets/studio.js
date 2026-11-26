/*
  作图（P18）、视频（P19）共用的外壳和工具页。
  每个页面只写配置：左菜单、工具清单（名字、说明、示例图、参数）、自定义页面。
  前端对应：<StudioLayout nav>、<ToolCard>、<ToolPage tool>（左参数、右结果，参数按 fields 渲染）、<InspireGrid>。
  网址片段：#home、#tools 这类是页面；#t/工具编号 是某个工具。
*/
window.STUDIO = (() => {
  const {$, $$, icon, toast, drawer, img} = OS;
  const C = f => `img/create/${f}.webp`;
  const SVG = {
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-5v-6h-4v6H5a1 1 0 01-1-1z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9V16h7v-2.1A6 6 0 0012 3z"/>',
    box: '<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
    pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
    drop: '<path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
    flame: '<path d="M12 21a6 6 0 006-6c0-4-3-6-4-9-1 2-2 3-4 4 0-2-1-3-1-3-2 2-3 4-3 7a6 6 0 006 7z"/>',
    wand: '<path d="M4 20L16 8M14 4v2M18 8h2M17 5l1.5-1.5M19 11l1.5 1.5"/>',
    eraser: '<path d="M16 3l5 5-11 11H5l-2-2z"/><path d="M9 21h12"/>',
    palette: '<path d="M12 3a9 9 0 100 18c1.1 0 1.5-.8 1.5-1.5 0-1.5 1-2 2-2H18a3 3 0 003-3A9 9 0 0012 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="11" r="1"/>',
    crop: '<path d="M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/>',
    shirt: '<path d="M8 3l4 2 4-2 5 4-3 3-2-1v12H8V9L6 10 3 7z"/>',
    person: '<circle cx="12" cy="6" r="3"/><path d="M8 21v-6l-2-4 6-2 6 2-2 4v6"/>',
    text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/>',
  };
  const ic = (n, s = 16) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG[n] || SVG.sparkle}</svg>`;
  let CFG;

  // ---------- 工具卡 ----------
  function card(id, mini = false){
    const t = CFG.tools[id]; if (!t) return '';
    const d = t.demo || {};
    const pair = d.in && d.out ? `<span class="pair"><img src="${C(d.in[0])}" alt="" style="${d.inStyle || ''}"><img src="${C(d.out[0])}" alt="">${mini ? '' : `<span class="ar">${icon('arrow', 12)}</span>`}</span>`
      : `<span class="pair ic">${ic(t.icon || 'sparkle', 30)}</span>`;
    const tag = t.tag ? `<span class="tg ${t.tag === 'NEW' ? 'new' : t.tag === '去视频' ? 'go' : ''}">${t.tag}</span>` : '';
    return `<div class="tc" tabindex="0" data-tool="${id}">${mini ? `<span class="pair ic">${ic(t.icon || 'sparkle', 18)}</span>` : pair}<div><b>${t.name}${tag}</b><p>${t.desc}</p></div></div>`;
  }
  function bindCards(root = document){
    $$('[data-tool]', root).forEach(el => el.onclick = el.onkeydown = e => { if (e.type === 'keydown' && e.key !== 'Enter') return; open(el.dataset.tool); });
  }
  function open(id){
    const t = CFG.tools[id];
    if (t && t.href) { location.href = t.href; return; }
    location.hash = 't/' + id;
  }

  // ---------- 灵感：做同款 ----------
  const inspire = list => `<div class="masonry">${list.map(([pic, src, tags = [], ar]) => `<div class="ins" tabindex="0"><img src="${C(pic)}" alt="" ${ar ? `style="aspect-ratio:${ar};object-fit:cover"` : ''}>
      ${tags.length ? `<div class="meta">${tags.map(x => `<span>${x}</span>`).join('')}</div>` : ''}
      ${src ? `<span class="src"><img src="${C(src)}" alt=""></span>` : ''}<button class="btn sm main same" data-same="${pic}">做同款</button></div>`).join('')}</div>`;
  function bindSame(root = document){
    $$('[data-same]', root).forEach(b => b.onclick = e => { e.stopPropagation(); toast('已带上参考图', '换成你的商品图，就能做同款。'); open(CFG.sameTool); });
  }

  // ---------- 工具页：左参数、右结果 ----------
  function field(f, i){
    const L = `<div class="l">${f.l}${f.small ? `<small>${f.small}</small>` : ''}${f.r ? `<span class="r">${f.r}</span>` : ''}</div>`;
    switch (f.t){
      case 'upload': return `<div class="fld">${L}${f.picked ? `<div class="picked">${f.picked.map(p => `<span class="thumb"><img src="${C(p)}" alt=""></span>`).join('')}<span class="add" title="再加一张">${icon('plus', 16)}</span></div>`
        : `<div class="drop"><span class="ic">${ic(f.video ? 'video' : 'upload', 20)}</span><b>${f.video ? '上传视频' : '上传图片'}</b>${f.hint || (f.video ? 'MP4 / MOV，100MB 以内，可截取 5–30 秒' : '从商品库选，或上传；最多 9 张')}</div>`}
        ${f.lib ? `<button class="chip" style="margin-top:8px">${ic('box', 14)}从商品库选</button>` : ''}</div>`;
      case 'link': return `<div class="fld">${L}<div class="linkin">${icon('arrow', 14)}<input placeholder="${f.ph}"><button class="btn sm">${f.btn || '分析'}</button></div>${f.or ? `<div class="or">${f.or}</div>` : ''}</div>`;
      case 'text': return `<div class="fld">${L}<div class="ta"><textarea placeholder="${f.ph}"></textarea><div class="tb">${(f.tools || []).map(x => `<button class="chip" style="height:26px;font-size:12px">${x}</button>`).join('')}<span class="sp"></span>0 / ${f.max || 1600}</div></div></div>`;
      case 'seg': return `<div class="fld">${L}<div class="segf" data-seg>${f.opts.map((o, j) => `<button class="${j === (f.on ?? 0) ? 'on' : ''}">${o}</button>`).join('')}</div></div>`;
      case 'select': return `<div class="fld">${L}<select class="select">${f.opts.map(o => `<option>${o}</option>`).join('')}</select></div>`;
      case 'two': return `<div class="fld">${L}<div class="grid g2" style="gap:8px">${f.opts.map(o => `<select class="select">${o.map(x => `<option>${x}</option>`).join('')}</select>`).join('')}</div></div>`;
      case 'toggle': return `<div class="fld"><div class="l">${f.l}${f.small ? `<small>${f.small}</small>` : ''}<span class="r"><button class="switch${f.on ? ' on' : ''}" role="switch" aria-checked="${!!f.on}" aria-label="${f.l}"></button></span></div></div>`;
      case 'chips': return `<div class="fld">${L}<div class="row" style="gap:6px;flex-wrap:wrap" data-chips>${f.opts.map((o, j) => `<button class="chip${j === (f.on ?? -1) ? ' on' : ''}">${o}</button>`).join('')}</div></div>`;
      case 'styles': return `<div class="fld">${L}<div class="styles" data-styles>${f.opts.map(([n, d, k], j) => `<button class="${j === 0 ? 'on' : ''}"><span class="pv" style="background-image:url(${C('product')})">${wmPreview(k)}</span><b>${n}</b><span>${d}</span></button>`).join('')}</div></div>`;
      case 'note': return `<div class="fld"><div class="note">${f.text}</div></div>`;
    }
    return '';
  }
  const wmPreview = k => k === 'tile' ? Array.from({length: 6}, (_, i) => `<i style="left:${(i % 3) * 34}%;top:${Math.floor(i / 3) * 45 + 10}%;transform:rotate(-24deg)">风之岚</i>`).join('')
    : k === 'corner' ? '<i style="right:6px;top:6px">风之岚</i>' : k === 'dots' ? '<i style="left:8px;bottom:6px;letter-spacing:2px;opacity:.6">· · 风之岚 · ·</i>' : '<i style="right:6px;bottom:6px">风之岚 →</i>';

  function toolPage(id){
    const t = CFG.tools[id];
    const d = t.demo || {};
    const B = $('#std-body');
    B.innerHTML = `<div class="crumb"><a href="#${CFG.toolsPage || 'home'}">${CFG.title}</a> / ${t.groupName || ''}${t.groupName ? ' / ' : ''}${t.name}</div>
      <div class="tool"><aside class="panel" aria-label="${t.name}参数"><div class="in">
          ${t.modes ? `<div class="segf" data-seg style="margin-bottom:var(--sp-4)">${t.modes.map((m, j) => `<button class="${j ? '' : 'on'}">${m}</button>`).join('')}</div>` : ''}
          ${(t.fields || []).map(field).join('')}</div>
        <div class="f"><button class="btn main" id="gen">${ic('wand', 16)}${t.btn || '立即生成'}${t.cost && t.cost !== '0' ? ` · 约 ¥${t.cost}${t.unit ? '/' + t.unit : ''}` : ''}</button><p>${t.costNote || '做好的先进创作历史；用到 listing 上要拍板。费用记在 AI 用量里'}</p></div></aside>
        <section class="res"><div class="tabs" role="tablist"><button class="on" data-rt="out">生成结果</button><button data-rt="case">优秀案例</button></div><div class="stage" id="stage"></div></section></div>`;
    const stage = $('#stage');
    const intro = () => {
      if (!d.custom && !d.in) { stage.innerHTML = `<div class="empty"><span class="pair ic" style="width:96px;height:96px;border-radius:24px;display:grid;place-items:center;color:var(--brand-hi);background:var(--surface-2)">${ic(t.icon || 'sparkle', 40)}</span><h3>${t.lead || t.desc}</h3><p>上传图片后，左边填好参数，点「立即生成」。</p></div>`; return; }
      stage.innerHTML = d.custom ? d.custom() : `<h3>${t.lead || t.desc}</h3><div class="compare">${d.in.map((p, i) => `<figure style="--ar:${d.ar || 1}"><img src="${C(p)}" alt="" style="${i === 0 && d.inStyle ? d.inStyle : ''}"><figcaption>${(d.labels || ['原图'])[i] || '原图'}</figcaption>${d.wmIn ? '' : ''}</figure>`).join('')}
          <span class="ar">${icon('arrow', 26)}</span>
          <figure style="--ar:${d.ar || 1}"><img src="${C(d.out[0])}" alt="">${d.video ? `<span class="play"><span>${icon('play', 16)}</span></span>` : ''}${d.wm ? `<span class="wm">${Array.from({length: 12}, (_, i) => `<i style="left:${(i % 3) * 36 - 6}%;top:${Math.floor(i / 3) * 26 + 4}%">风之岚旗舰店</i>`).join('')}</span>` : ''}<figcaption>${d.outLabel || (d.video ? '生成的视频' : '生成结果')}</figcaption></figure></div>
        <button class="btn" id="same">${icon('refresh', 14)}用这个例子做同款</button>`;
      const s = $('#same'); if (s) s.onclick = () => toast('已填好示例参数', '换成你的商品就能生成。');
    };
    intro();
    $$('.res .tabs button').forEach(b => b.onclick = () => { $$('.res .tabs button').forEach(x => x.classList.toggle('on', x === b));
      if (b.dataset.rt === 'out') intro(); else { stage.style.justifyContent = 'flex-start'; stage.innerHTML = inspire((t.cases || CFG.cases).map(p => [p, null, [], d.video ? '2/3' : null])); bindSame(stage); } });
    $$('[data-seg]').forEach(g => $$('button', g).forEach(b => b.onclick = () => $$('button', g).forEach(x => x.classList.toggle('on', x === b))));
    $$('[data-chips] .chip, [data-styles] button').forEach(b => b.onclick = () => { const g = b.parentElement; if (g.matches('[data-styles]')) $$('button', g).forEach(x => x.classList.toggle('on', x === b)); else b.classList.toggle('on'); });
    $('#gen').onclick = () => {
      stage.style.justifyContent = 'center';
      stage.innerHTML = `<div class="busy"><img src="img/avatar-xiaojia.webp" alt=""><b>小架在做${d.video ? '视频' : ''}…</b><span class="t3">${t.wait || (d.video ? '大约 2–3 分钟，可以先去做别的，做好了会提醒你' : '大约 30 秒')}</span><div class="prog"><i style="width:6%"></i></div><button class="btn sm ghost" id="stop">停下</button></div>`;
      let p = 6; const timer = setInterval(() => { p = Math.min(100, p + 19); const i = $('.busy .prog i'); if (i) i.style.width = p + '%';
        if (p >= 100) { clearInterval(timer); done(); } }, 500);
      $('#stop').onclick = () => { clearInterval(timer); intro(); toast('已停下', '这次不计费。', 'err'); };
    };
    const done = () => {
      const outs = t.outs || d.out;
      stage.innerHTML = `<div class="row" style="width:100%"><b>做好了 ${outs.length} ${d.video ? '条' : '张'}</b><span class="t3 fs-12" style="margin-left:8px">已放进创作历史</span><span class="sp"></span><button class="btn sm">${icon('refresh', 14)}再来一批</button></div>
        <div class="outs" style="--ar:${d.ar || 1}">${outs.map(p => `<figure><img src="${C(p)}" alt="">${d.video ? `<span class="play"><span>${icon('play', 16)}</span></span>` : ''}<span class="act"><button class="btn sm">下载</button><button class="btn sm main" data-keep>选进商品库</button></span></figure>`).join('')}</div>
        <p class="hint">选进商品库后，小架上架时会用；上架要拍板。</p>`;
      $$('[data-keep]').forEach(b => b.onclick = () => toast('已选进商品库', 'H039-2 水杯 500ml 多了一张图。'));
    };
    window.scrollTo({top: 0});
  }

  // ---------- 外壳 ----------
  function nav(cur){
    $('#std-nav').innerHTML = `<div class="ttl"><img src="img/avatar-xiaojia.webp" alt=""><div><b>${CFG.title}</b><span>小架 · 在岗</span></div></div>` +
      CFG.nav.map(([g, items]) => (g ? `<div class="g">${g}</div>` : '') + items.map(([id, l, i, n]) => {
        const href = id.startsWith('http') || id.endsWith('.html') || id.includes('.html#') ? id : '#' + id;
        return `<a href="${href}" class="${id === cur ? 'on' : ''}" ${id === cur ? 'aria-current="page"' : ''}><span class="ic">${ic(i)}</span>${l}${n ? `<span class="new">${n}</span>` : ''}</a>`; }).join('')).join('') +
      (CFG.jump ? `<a class="jump" href="${CFG.jump[0]}"><span class="ic">${ic(CFG.jump[2])}</span>${CFG.jump[1]}<span class="new" style="background:var(--surface-3);color:var(--text-2)">${icon('arrow', 11)}</span></a>` : '');
  }
  function route(state){
    const h = decodeURIComponent(location.hash.slice(1)) || CFG.home;
    const B = $('#std-body');
    B.style.removeProperty('--x');
    if (h.startsWith('t/') && CFG.tools[h.slice(2)]) { nav(h); toolPage(h.slice(2)); return; }
    const pg = CFG.pages[h] ? h : CFG.home;
    nav(pg);
    B.innerHTML = CFG.pages[pg](state);
    bindCards(B); bindSame(B);
    $$('[data-seg]', B).forEach(g => $$('button', g).forEach(b => b.onclick = () => { if (b.dataset.href) { location.href = b.dataset.href; return; } $$('button', g).forEach(x => x.classList.toggle('on', x === b)); }));
    if (CFG.after && CFG.after[pg]) CFG.after[pg]();
  }
  function mount(cfg){
    CFG = cfg;
    $('#page').innerHTML = `<div class="std"><nav class="std-nav" id="std-nav" aria-label="${cfg.title}菜单"></nav><section class="std-body" id="std-body"></section></div>`;
    let st = '正常';
    window.addEventListener('hashchange', () => route(st));
    OS.demo({onState: s => { st = s; route(s); }});
  }
  return {mount, card, bindCards, inspire, ic, C, open};
})();
