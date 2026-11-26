/*
  原型共用脚本：外壳（顶栏、中心侧栏）、轻提示、确认弹窗、抽屉、格式化、走势小图、数字滚动、演示条。
  前端对应：TopBar、CenterSidebar、Toast、ConfirmDialog、Drawer、formatMoney、Sparkline、useCountUp。
  演示条（切换状态、身份）只在原型里，前端不做。
*/
window.OS = (() => {
  const D = window.OS_DATA;
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const q = new URLSearchParams(location.search);

  // ---------- 格式化 ----------
  const fmt = (n, dec = 0) => Number(n).toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  const money = (n, cur = 'SAR', dec = 0) => `${cur} ${fmt(n, dec)}`;
  const yuan = n => `¥${fmt(n, 2)}`;
  const ai = id => D.ai.find(a => a.id === id);
  const member = id => D.people.members.find(m => m.id === id) || (id === 'boss' ? D.people.boss : null);
  const store = id => D.stores.find(s => s.id === id);
  const img = f => `img/${f}`;

  // ---------- 图标（Lucide 风格，线宽 1.5；前端换成 lucide-react 同名图标） ----------
  const P = {
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', shrink: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12.5l4.5 4.5L19 7"/>', chev: '<path d="M6 9l6 6 6-6"/>', right: '<path d="M9 6l6 6-6 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>', undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
    refresh: '<path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 4v7h-7"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
    db: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    bell: '<path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 003.4 0"/>', wecom: '<path d="M4 5h16v11H9l-5 4z"/>',
    pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>', key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.4-6 8-6s6.5 2 8 6"/>', play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  };
  const icon = (n, size = 16) => `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

  // ---------- 走势小图：虚线是保本线 ----------
  function spark(vals, {be = D.breakEven, w = 200, h = 26, color = 'var(--brand-hi)', cls = 'spark'} = {}){
    const lo = Math.min(...vals, be ?? Infinity) - .1, hi = Math.max(...vals) + .1;
    const X = i => i / (vals.length - 1) * w, Y = v => h - (v - lo) / (hi - lo) * h;
    const line = be == null ? '' : `<line x1="0" x2="${w}" y1="${Y(be)}" y2="${Y(be)}" stroke="var(--text-3)" stroke-dasharray="2 4" vector-effect="non-scaling-stroke"/>`;
    return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${line}
      <path pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:spk 1.2s var(--ease) .3s forwards" d="${vals.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
  }
  document.head.insertAdjacentHTML('beforeend', '<style>@keyframes spk{to{stroke-dashoffset:0}}</style>');

  // ---------- 指标卡 ----------
  const kpi = ({l, v, pre = '', d = '', sp = null, cls = ''}) =>
    `<div class="kpi ${cls}"><div class="l">${l}</div><div class="v num">${pre ? `<small>${pre}</small>` : ''}${v}</div>${sp ? spark(sp) : `<div class="d num">${d}</div>`}</div>`;
  const delta = (cmp, x, good = true) => `${cmp} <span class="${good ? 'up' : ''}">${x}</span>`;
  const st = (text, kind) => `<span class="st ${kind}">${text}</span>`;
  const TASK_ST = {'待执行': 'off', '执行中': 'run', '待初审': 'wait', '待拍板': 'wait', '跟进中': 'wait', '已完成': 'ok', '已生效': 'ok', '失败': 'err', '已退回': 'off', '已撤回': 'off'};
  const taskSt = s => st(s, TASK_ST[s] || 'off');

  // ---------- 数字滚动（600ms） ----------
  // 「减少动态效果」：数字不滚、页面不平滑滚动（CSS 那边 base.css 已经停掉所有动画和过渡）。前端对应一个 useReducedMotion
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { const raw = Element.prototype.scrollIntoView; Element.prototype.scrollIntoView = function(o){ return raw.call(this, o && typeof o === 'object' ? {...o, behavior: 'auto'} : o); }; }
  function countUp(scope = document){
    if (reduced) return;
    $$('.kpi .v', scope).forEach(el => {
      const node = [...el.childNodes].reverse().find(n => n.nodeType === 3 && /\d/.test(n.textContent)); if (!node) return;
      const m = node.textContent.trim().match(/^([+-]?)([\d,]*\.?\d+)(.*)$/); if (!m) return;
      const target = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, comma = m[2].includes(','), t0 = performance.now();
      const f = v => m[1] + (comma ? fmt(v, dec) : v.toFixed(dec)) + m[3];
      (function step(now){ const u = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - u, 3); node.textContent = f(target * e); if (u < 1) requestAnimationFrame(step); })(t0);
    });
  }

  // ---------- 身份：决策层 / 主管 / 运营（演示用） ----------
  const role = q.get('as') || document.body.dataset.as || 'boss';
  const who = role === 'boss' ? D.people.boss : member(role);
  // 当前登录的人是拍板人的事
  const mine = () => D.approvals.pending.filter(a => (a.decider || ['boss']).includes(role));
  const deciderName = a => (a.decider || ['boss']).map(id => member(id).name).join(' 或 ');
  const withAs = href => role === (document.body.dataset.as || 'boss') ? href : href + (href.includes('?') ? '&' : '?') + 'as=' + role;

  // ---------- 顶栏 ----------
  const NAV = [['03-组织树.html', '组织树', 'org'], ['02-地图.html', '地图', 'map'], '|',
    ['08-等你拍板.html', '等你拍板', 'approvals'], ['10-任务.html', '任务', 'tasks'], ['15-日报.html', '日报', 'report'],
    ['18-作图.html', '作图', 'image'], ['19-视频.html', '视频', 'video'], ['12-AI员工.html', 'AI 员工', 'ai'], ['14-资源核心.html', '资源核心', 'core']];
  function topbar(active){
    const pending = mine().length;
    const opsTodo = 14;
    const onDuty = D.ai.filter(a => a.status === 'on').length;
    // 一个人只有一个「要我动手」的入口：决策层、主管是「等你拍板」，运营是「待我处理」（AI 员工的建议先到运营初审）
    const ops = who.role === '运营';
    const todo = ops ? {href: `05-小投工作台.html?as=${role}#done`, label: '待我处理', n: opsTodo, tip: '运营初审'} : {href: '08-等你拍板.html', label: '等你拍板', n: pending, tip: '等你拍板'};
    const stat = `<a class="stat keep m-only" href="${withAs(todo.href)}" title="${todo.tip}">${todo.label} <span class="badge num js-badge">${todo.n}</span></a>`;
    const navItem = n => n[2] === 'approvals'
      ? `<a href="${withAs(todo.href)}" class="${n[2] === active ? 'on' : ''}" title="${todo.tip}">${todo.label}<span class="badge num js-badge" id="top-badge">${todo.n}</span></a>`
      : `<a href="${withAs(n[0])}" class="${n[2] === active ? 'on' : ''}">${n[1]}</a>`;
    return `<header class="top">
      <a class="brand" href="index.html" title="总入口">风之岚<small>OS</small></a>
      <nav class="nav" aria-label="主导航">${NAV.map(n => n === '|' ? '<span class="sep"></span>' : navItem(n)).join('')}</nav>
      <span class="sp"></span>
      <a class="newtask" href="${withAs('17-新任务.html')}" ${active === 'new' ? 'aria-current="page"' : ''}>${icon('plus', 14)}新任务</a>
      ${stat}
      <span class="stat d-only"><span class="dot live"></span>AI 员工 <b class="num">${onDuty}/${D.ai.length}</b> 在岗</span>
      <span class="stat d-only"><b class="num js-clock">${D.meta.now}</b> ${D.meta.tz}</span>
      <div class="me" tabindex="0" aria-label="${who.name}">${who.id === 'boss' ? icon('user', 16) : who.name.slice(0, 2)}
        <div class="me-menu"><div class="who">${who.id === 'boss' ? who.name : `${who.name} · ${who.role}`}</div>
          <a href="16-管理后台.html">管理后台</a><a href="#" class="js-theme">${document.documentElement.dataset.theme === 'light' ? '换回深色' : '换成浅色'}</a><a href="?as=boss">切换成决策层（演示）</a><a href="?as=m-ww">切换成王五 · 主管（演示）</a><a href="?as=m-zs">切换成张三 · 运营（演示）</a><a href="01-登录.html">退出</a></div></div>
    </header>`;
  }

  // ---------- 中心侧栏 ----------
  const ICON = {
    overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-20 12 12)"/></svg>',
    bench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
    tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M3 10h5"/></svg>',
    ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="9" r="4"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    exec: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h10M10 6l6 6-6 6"/><path d="M20 4v16"/></svg>',
  };
  function sidebar(active){
    const c = D.centers[0];
    const a = (href, key, label, extra = '') => `<a class="item ${key === active ? 'on' : ''}" href="${withAs(href)}">${label}${extra}</a>`;
    return `<aside class="side" aria-label="${c.name}">
      <div class="side-dept"><span class="ico">${c.icon}</span><div><b>${c.name}</b><span>3 家店 · 沙特 / 阿联酋</span></div></div>
      ${a('04-中心概览.html', 'overview', ICON.overview + '概览')}
      ${a('05-小投工作台.html#home', 'bench', ICON.bench + '工作台')}
      ${D.ai.filter(x => x.id !== 'xiaoxun').map(x => x.status === 'on'
        ? a(x.page, x.id, `<img src="${img(x.img)}" alt="">${x.name} · ${x.role}`)
        : `<a class="item sub lock" title="${x.later}上线"><img src="${img(x.img)}" alt="">${x.name} · ${x.role}<span class="tag" style="--k:var(--off)">${x.later}</span></a>`).join('').replace(/class="item /g, 'class="item sub ')}
      <div class="side-g">${D.terms.dept}</div>
      ${a('10-任务.html?center=commerce', 'tasks', ICON.tasks + '任务', `<span class="tag num" style="margin-left:auto">${D.tasks.filter(t => !['已完成', '已撤回'].includes(t.status)).length}</span>`)}
      ${a('20-定时任务.html', 'sched', ICON.clock + '定时任务')}
      ${a('11-运行详情.html?run=R-20261119-003', 'runs', ICON.exec + '运行和执行记录')}
      ${a('12-AI员工.html', 'ai', ICON.ai + 'AI 员工')}
    </aside>`;
  }

  // 只挂顶栏（地图、组织树、小投工作台这些自己排版的页面用）。overlay：浮在全屏内容上
  function mountTop(active = '', {overlay = false} = {}){
    document.body.insertAdjacentHTML('afterbegin', topbar(active));
    const top = $('header.top'); if (overlay) top.classList.add('overlay');
    const me = $('.me', top); me.onclick = e => { e.stopPropagation(); me.classList.toggle('open'); };
    bindTheme(top);
    document.addEventListener('click', () => me.classList.remove('open'));
    clock();
    return top;
  }
  // 深色 / 浅色（试看）：记在本机；地图、登录页整张是插画，始终深色
  function bindTheme(top){
    const t = $('.js-theme', top); if (!t) return;
    t.onclick = e => { e.preventDefault();
      const H = document.documentElement, next = H.dataset.theme === 'light' ? 'dark' : 'light';
      H.dataset.theme = next; try { localStorage.setItem('os-theme', next); } catch (_) {}
      t.textContent = next === 'light' ? '换回深色' : '换成浅色';
      if (H.hasAttribute('data-theme-lock')) toast('这一页始终是深色', '地图和登录页是整张插画，其他页面已换成' + (next === 'light' ? '浅色' : '深色'));
    };
  }
  function shell({active = '', side = null} = {}){
    const main = $('main');
    document.body.insertAdjacentHTML('afterbegin', topbar(active));
    const wrap = document.createElement('div'); wrap.className = 'layout' + (side ? '' : ' no-side');
    main.before(wrap); if (side) wrap.insertAdjacentHTML('beforeend', sidebar(side)); wrap.append(main);
    // AI 员工工作台：通栏横幅挪到侧栏和内容上面，最左一格放所在的中心
    const band = $('.wbband', main);
    if (band) { wrap.before(band); const c = D.centers[0];
      band.querySelector('.pb-bg').insertAdjacentHTML('afterend', `<a class="wb-center" href="${withAs('04-中心概览.html')}"><span class="ico">${c.icon}</span><div><b>${c.name}</b><span>3 家店 · 沙特 / 阿联酋</span></div></a>`); }
    document.body.insertAdjacentHTML('beforeend', '<div class="toasts" aria-live="polite"></div><div class="scrim"></div>');
    const me = $('.me'); me.onclick = e => { e.stopPropagation(); me.classList.toggle('open'); };
    bindTheme($('header.top'));
    document.addEventListener('click', () => me.classList.remove('open'));
    clock();
  }

  // 沙特时间（演示固定在 17:00，加 ?live 显示真实时间）
  function clock(){ if (!q.has('live')) return; const t = () => { const d = new Date(Date.now() + (180 + new Date().getTimezoneOffset()) * 60000);
    $$('.js-clock').forEach(e => e.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')); }; t(); setInterval(t, 30000); }

  // ---------- 轻提示、确认弹窗、抽屉 ----------
  function toast(title, msg = '', kind = 'ok'){
    const box = $('.toasts') || document.body.appendChild(Object.assign(document.createElement('div'), {className: 'toasts'}));
    const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = `<b>${title}</b>${msg}`;
    box.append(t); setTimeout(() => t.remove(), 3000);
  }
  function confirm({title, msg = '', ok = '确认', danger = false}){
    return new Promise(res => {
      const scrim = $('.scrim'), m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog');
      m.innerHTML = `<h3>${title}</h3><p>${msg}</p><div class="acts"><button class="btn ghost" data-r="0">取消</button><button class="btn ${danger ? 'danger' : 'main'}" data-r="1">${ok}</button></div>`;
      document.body.append(m); requestAnimationFrame(() => { m.classList.add('on'); scrim.classList.add('on'); });
      const done = v => { m.classList.remove('on'); scrim.classList.remove('on'); setTimeout(() => m.remove(), 250); res(v); };
      m.onclick = e => { if (e.target.dataset.r) done(e.target.dataset.r === '1'); };
      scrim.onclick = () => done(false); m.querySelector('[data-r="1"]').focus();
    });
  }
  function drawer({sub = '', title = '', body = '', foot = ''}){
    let d = $('.drawer');
    if (!d){ d = document.createElement('aside'); d.className = 'drawer'; d.setAttribute('aria-label', '详情'); document.body.append(d); }
    d.innerHTML = `<div class="drawer-h"><div><h2>${title}</h2>${sub ? `<div class="sub">${sub}</div>` : ''}</div><button class="x" aria-label="关闭">${icon('x', 18)}</button></div>
      <div class="drawer-b">${body}</div>${foot ? `<div class="drawer-f">${foot}</div>` : ''}`;
    const scrim = $('.scrim'); requestAnimationFrame(() => { d.classList.add('on'); scrim.classList.add('on'); });
    const close = () => { d.classList.remove('on'); scrim.classList.remove('on'); };
    d.querySelector('.x').onclick = close; scrim.onclick = close;
    addEventListener('keydown', function esc(e){ if (e.key === 'Escape'){ close(); removeEventListener('keydown', esc); } });
    return {el: d, close};
  }

  // ---------- 演示条：切换状态（正常 / 加载中 / 没有数据 / 出错） ----------
  function demo({states = ['正常', '加载中', '没有数据', '出错'], onState, extra = ''} = {}){
    const cur = q.get('state') || states[0];
    const bar = document.createElement('div'); bar.className = 'demo' + (q.has('demo') ? '' : ' min');  // 默认收起，不挡内容；网址加 ?demo 展开
    bar.innerHTML = `演示 <div class="seg" role="group" aria-label="页面状态">${states.map(s => `<button class="${s === cur ? 'on' : ''}">${s}</button>`).join('')}</div>${extra}<button class="x" title="收起">${icon('chev', 14)}</button>`;
    document.body.append(bar);
    bar.querySelector('.x').onclick = () => bar.classList.toggle('min');
    bar.querySelectorAll('.seg button').forEach(b => b.onclick = () => {
      bar.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b)); onState && onState(b.textContent);
    });
    onState && onState(cur);
  }
  // 通用的三种非正常状态
  const states = {
    loading: (rows = 3) => `<div class="grid" style="gap:12px">${'<div class="skel" style="height:72px"></div>'.repeat(rows)}</div>`,
    empty: ({img: im = 'empty-task.webp', title = '还没有内容', text = '', act = ''} = {}) => `<div class="empty"><img src="${img(im)}" alt=""><h3>${title}</h3><p>${text}</p>${act ? `<div class="acts">${act}</div>` : ''}</div>`,
    error: ({what = '没拿到数据', why = 'noon 接口超时', next = '<button class="btn sm" onclick="location.reload()">重试</button>'} = {}) =>
      `<div class="errbar"><b>${what}</b><span class="t2">${why}。已经自动重试 2 次；还不行请联系王五（主管）。</span><span class="acts">${next}</span></div>`,
  };

  // 开关：<button class="switch on" role="switch" aria-checked="true">，点一下切换并发 change 事件
  document.addEventListener('click', e => { const sw = e.target.closest('.switch'); if (!sw || sw.disabled) return;
    const on = sw.classList.toggle('on'); sw.setAttribute('aria-checked', on); sw.dispatchEvent(new Event('change', {bubbles: true})); });

  // ---------- 定时任务（P20 汇总页和各工作台的「定时」页签共用）----------
  const schedWho = id => id ? `<img src="${img(ai(id).img)}" alt="">` : `<span class="sch-sys">${icon('db', 16)}</span>`;
  const canEdit = () => who.role !== '运营';
  // 今天 15:00 这条流水线。fail：第几步失败（演示「出错」用），后面的步骤显示「等上一步」
  function schedChain({fail = -1, only = null} = {}){
    const C = D.schedules.chain;
    return `<ol class="chain">${C.map((c, i) => { const k = fail < 0 || i < fail ? 'done' : i === fail ? 'fail' : 'wait';
      return `<li class="${k}${only ? (c.ai === only ? ' mine' : c.ai !== null ? ' dim' : '') : ''}"><span class="ch-t num">${c.t}</span><span class="ch-dot">${k === 'done' ? icon('check', 12) : k === 'fail' ? icon('x', 12) : ''}</span>
        <span class="ch-who">${schedWho(c.ai)}<b>${c.ai ? ai(c.ai).name : '平台'} · ${c.name}</b></span>
        <span class="ch-res">${k === 'done' ? `${c.res} · ${c.took}` : k === 'fail' ? 'noon 接口超时；已在工作群提醒张三、李四上传后台导出的文件' : '等上一步'}</span></li>`; }).join('')}</ol>`;
  }
  // 定时卡片：做什么、失败时怎么办、几点跑 / 下次、最近两次、负责人、开关和改时间（运营只能看）
  function schedList(onlyAi = null){
    const L = D.schedules.list.filter(s => !onlyAi || s.ai === onlyAi);
    return `<div class="sch-list">${L.map(s => `<div class="sch-row${s.on ? '' : ' off'}" data-sid="${s.id}">
        <span class="sch-av">${schedWho(s.ai)}</span>
        <div class="sch-m"><b>${s.ai ? ai(s.ai).name : '平台'} · ${s.name}${s.store !== '全部' ? `<span class="st-tag">${s.store}</span>` : ''}</b><span>${s.what}</span>${s.fail ? `<span class="fail">${s.fail}</span>` : ''}</div>
        <div class="sch-when"><b class="num">${s.when}</b><span>下次 ${s.next}</span></div>
        <div class="sch-log">${(s.log || [s.last]).map(l => `<span>${l}</span>`).join('')}<span class="who">负责 ${member(s.owner).name}</span></div>
        <div class="sch-act">${canEdit() ? `<button class="switch${s.on ? ' on' : ''}" role="switch" aria-checked="${s.on}" aria-label="暂停或开启：${s.name}" data-sw="${s.id}"></button><button class="edit" data-edit="${s.id}">改时间</button>`
          : `<span class="lock" title="只有主管和决策层能改">${icon('lock', 12)} 只能看</span>`}</div></div>`).join('')}</div>`;
  }
  // 一个 AI 员工工作台里的「定时」页签（小投、小测、小补同一个样子）
  function schedTab(aiId, note){
    const A = ai(aiId);
    return `<div class="sch-wrap"><section class="card pad sch-box"><div class="sch-h"><h3>今天 15:00 的每日巡检</h3><a href="20-定时任务.html">看全部定时任务 →</a></div>${schedChain({only: aiId})}</section>
      <section class="card pad sch-box" style="margin-top:var(--sp-4)"><div class="sch-h"><h3>${A.name}的定时</h3><span class="sch-perm">${canEdit() ? '可以改时间、暂停；改动记进操作记录' : '你是运营，只能看；主管和决策层能改'}</span></div>${schedList(aiId)}
        <p class="sch-note">${note}</p></section></div>`;
  }
  function bindSched(root = document){
    $$('[data-sw]', root).forEach(b => b.addEventListener('change', () => { b.closest('.sch-row').classList.toggle('off', !b.classList.contains('on')); toast(b.classList.contains('on') ? '已开启' : '已暂停', `改动记进操作记录：${who.name} · 17:05`); }));
    $$('[data-edit]', root).forEach(b => b.onclick = () => { const s = D.schedules.list.find(x => x.id === b.dataset.edit);
      const d = drawer({sub: s.id, title: `改时间 · ${s.ai ? ai(s.ai).name : '平台'} · ${s.name}`, body: `
        <label class="field"><span>什么时候跑</span><input class="input num" value="${s.when}"></label>
        <p class="hint">每日巡检是一条流水线：拉数据 15:00 → 小投 15:05 → 小补 15:06 → 小测 15:07 → 小巡 15:10。改了前面的，后面的会提醒你一起顺延。</p>
        <p class="hint">改时间、暂停都记进操作记录。</p>`, foot: '<span class="sp"></span><button class="btn main" id="sv">保存</button>'});
      $('#sv').onclick = () => { d.close(); toast('已保存', `改动记进操作记录：${who.name} · 17:05`); }; });
  }

  // ---------- 全屏（地图、组织树、资源核心、日报这些拿来看全局、投大屏的页面才开）----------
  // 顶栏右边一个按钮，键盘 F 也行；全屏时收起顶栏和演示控件，右上角留一个半透明的「退出全屏」
  function fullscreen(){
    const top = $('header.top'); if (!top || $('.fsbtn', top)) return;
    const btn = document.createElement('button'); btn.className = 'fsbtn'; btn.type = 'button';
    const anchor = $('.stat.keep', top) || $('.me', top); top.insertBefore(btn, anchor);
    const exit = document.createElement('button'); exit.className = 'fs-exit'; exit.type = 'button'; exit.innerHTML = `${icon('shrink', 14)}退出全屏 · Esc`;
    document.body.append(exit);
    const sync = () => { const f = !!document.fullscreenElement; document.body.classList.toggle('fs', f);
      btn.innerHTML = icon(f ? 'shrink' : 'expand', 16); btn.title = f ? '退出全屏（F）' : '全屏看（F），适合投屏开会'; btn.setAttribute('aria-label', btn.title);
      window.dispatchEvent(new Event('resize')); };
    const toggle = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {});
    btn.onclick = toggle; exit.onclick = toggle;
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('keydown', e => { if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey && !e.altKey && !e.target.closest('input,textarea,select,[contenteditable]')) { e.preventDefault(); toggle(); } });
    sync();
  }

  // 店铺选择框：可以搜索，「我负责的」放最上面，其余按店铺分组（站点在组里）。店铺再多也不用一直翻下拉
  function storePick(anchor, {sel, onPick} = {}){
    document.querySelector('.spick')?.remove();
    const el = document.createElement('div'); el.className = 'spick'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', '选店铺');
    const mine = D.stores.filter(s => s.owner === who.id);
    const item = s => `<button data-id="${s.id}" class="${s.id === sel ? 'on' : ''}"><i style="--k:var(--${s.flag[1] === 'err' ? 'error' : s.flag[1]})"></i><span>${s.name}</span><small>${s.cur}</small>${s.id === sel ? icon('check', 14) : ''}</button>`;
    const list = q => { const L = D.stores.filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()));
      if (!L.length) return '<p class="none">没有符合的店铺</p>';
      const M = q ? [] : mine;
      return (M.length ? `<div class="g">我负责的</div>${M.map(item).join('')}` : '') +
        [...new Set(L.map(s => s.brand))].map(b => `<div class="g">${b}</div>${L.filter(s => s.brand === b).map(item).join('')}`).join(''); };
    el.innerHTML = `<input class="input" placeholder="搜索店铺或站点" aria-label="搜索店铺或站点"><div class="ls">${list('')}</div>`;
    document.body.append(el);
    const r = anchor.getBoundingClientRect(); el.style.left = Math.min(r.left, innerWidth - el.offsetWidth - 12) + 'px'; el.style.top = (r.bottom + 8) + 'px';
    const inp = $('input', el), ls = $('.ls', el), close = () => { el.remove(); document.removeEventListener('pointerdown', out, true); document.removeEventListener('keydown', esc); };
    const bind = () => $$('button', ls).forEach(b => b.onclick = () => { close(); onPick && onPick(D.stores.find(s => s.id === b.dataset.id)); });
    const out = e => { if (!el.contains(e.target) && !anchor.contains(e.target)) close(); }, esc = e => { if (e.key === 'Escape') close(); };
    inp.oninput = () => { ls.innerHTML = list(inp.value.trim()); bind(); };
    bind(); inp.focus();
    setTimeout(() => { document.addEventListener('pointerdown', out, true); document.addEventListener('keydown', esc); }, 0);
  }

  // AI 员工的总结条：六个工作台第一屏统一（样式在 wbband.css 的 .wsay）。不放头像：做成从横幅头像说出来的气泡
  // 可以收起，不能关掉：收起后留一行（名字、时间、前半句、按钮），点一下展开。按「AI 员工 + 这次总结的时间」记住，出了新总结自动展开
  const sayKey = (id, time) => `wsay:${id}:${time}`;
  const sayMin = k => { try { return localStorage.getItem(k) === 'min'; } catch (e) { return false; } };
  const say = (id, time, html, right = '') => { const A = ai(id), k = sayKey(id, time), min = sayMin(k);
    return `<section class="wsay${min ? ' min' : ''}" data-k="${k}" aria-label="${A.name}的总结"><div class="tx"><div class="from"><i></i>${A.name}的总结 · ${time}</div><p>${html}</p></div>${right ? `<div class="side-r">${right}</div>` : ''}
      <button class="ws-fold" aria-expanded="${!min}" title="${min ? '展开总结' : '收起总结'}" aria-label="${min ? '展开总结' : '收起总结'}">${icon('chev', 14)}</button></section>`; };
  document.addEventListener('click', e => {
    const w = e.target.closest('.wsay'); if (!w) return;
    const btn = e.target.closest('.ws-fold');
    if (!btn && !(w.classList.contains('min') && !e.target.closest('a,button'))) return;   // 收起时点这一行任意空白处也能展开
    const min = w.classList.toggle('min'), b = $('.ws-fold', w);
    b.setAttribute('aria-expanded', !min); b.title = b.ariaLabel = min ? '展开总结' : '收起总结';
    try { min ? localStorage.setItem(w.dataset.k, 'min') : localStorage.removeItem(w.dataset.k); } catch (err) {}
  });

  return {storePick, say, schedTab, fullscreen, schedChain, schedList, bindSched, mountTop, mine, deciderName, D, $, $$, q, icon, fmt, money, yuan, ai, member, store, img, spark, kpi, delta, st, taskSt, countUp, shell, toast, confirm, drawer, demo, states, role, who, withAs};
})();
