/*
  原型用的假数据（唯一一份）。所有页面只从这里取数，保证各页数字一致。
  结构对齐 docs/2-架构设计.md 的数据表：departments、projects、ai_employees、members、tasks、runs、approvals、executions、
  products（含采购资料）、inbound_batches（在途）、trial_rounds（测款轮次）、usage_daily、metrics_daily。
  前端接真实接口时，用接口返回同样结构的数据替换这里即可。

  演示故事（2026-11-19 周四，沙特时间 17:00）。每日巡检 15:00（下午 3 点看前一天的数据）：
  - 15:00 通过 noon 接口拉数据；15:05 小投复盘（云屿商店 14 条、星帆商店 阿联酋 4 条）；15:06 小补出补货计划；15:07 小测出测款复盘；15:10 小巡推日报。
  - 15:30 决策层批了星帆商店 阿联酋 4 条，小投执行中。
  - 16:20 张三初审 云屿商店  14 条：8 条在运营权限内直批（小投执行中），4 条超出权限提交决策层，2 条先不动。
  - 等拍板（决策层是拍板人；测款那件王五也能定）：云屿商店 4 条广告调整、补货申请 3 个商品（小补）、测款 H052 停止投入还是追加预算（小测）。
*/
window.OS_DATA = (() => {
  const BE = 2.40;
  return {
    meta: {today: '11/19 周四', date: '2026-11-19', week: '11/13–11/19', month: '11/1–11/19', now: '17:00', synced: '17:00', tz: '沙特',
      dataSource: 'noon 官方接口 · 每小时同步', dailyAt: '15:00'},
    // 叫「中心」（2026-11-22 定；代码里仍是 departments）
    terms: {dept: '中心'},
    breakEven: BE,

    people: {
      // 最上面一层叫「决策层」：不写头衔，也不写人名；要决策层定的事写「等决策层拍板」；对登录的人说「你」
      boss: {id: 'boss', name: '决策层', title: '', role: '决策层'},
      members: [
        {id: 'm-zs', name: '张三', role: '运营', store: 'sa', duty: '负责 云屿商店 和 月砂商店（沙特）：初审建议、维护商品资料和在途、跟进补货', now: '初审完 云屿商店 14 条：直批 8 条，4 条交决策层'},
        {id: 'm-ls', name: '李四', role: '运营', store: 'ae', duty: '负责 星帆商店（阿联酋、沙特）：初审建议、核对小投的执行结果', now: '核对 星帆商店 阿联酋的执行结果'},
        {id: 'm-zl', name: '赵六', role: '采购', store: null, duty: '核实采购量、报价和供应商，下采购单，更新在途', now: '等补货申请批下来'},
        {id: 'm-ww', name: '王五', role: '主管', store: null, duty: '跨境电商中心主管：确认测款标准、看各店结果、带新人；决策层授权他拍板单笔 SAR 5,000 以内的补货申请和测款停止、追加', now: '确认了 2 个新品的测款标准'},
      ],
    },

    centers: [
      {id: 'commerce', name: '跨境电商中心', short: '跨境电商', icon: '商', color: 'var(--dept-commerce)', on: true, stores: ['sa', 'ae'],
        ai: ['xiaodao', 'xiaoxuan', 'xiaojia', 'xiaotou', 'xiaoce', 'xiaobu'], members: ['m-zs', 'm-ls', 'm-zl', 'm-ww']},
      {id: 'media', name: '自媒体运营中心', short: '自媒体', icon: '媒', color: 'var(--dept-media)', on: false, later: '未接入'},
      {id: 'web', name: '海外建站中心', short: '建站', icon: '站', color: 'var(--dept-web)', on: false, later: '未接入'},
    ],

    // 三家店（公开演示）：云屿商店 只做沙特；星帆商店 做阿联酋和沙特；月砂商店 有沙特站。按「店铺 · 站点」分开记，账号、数据、币种都不混。
    // 沙特站用 SAR，阿联酋站用 AED；不同币种不相加（合计分开写）。
    stores: [
      {id: 'sa', brand: '云屿商店', site: '沙特', name: '云屿商店 · 沙特', cur: 'SAR', owner: 'm-zs', flag: ['4 条等决策层拍板', 'wait'],
        today: {sales: 4410, spend: 980, roas: 3.40}, week: {sales: 31400, salesD: '+11%', spend: 6280, spendD: '+5%', roas: 3.40, spark: [3.0, 3.2, 3.1, 3.3, 3.2, 3.35, 3.4]},
        todo: {ads: '14 条 · 张三直批 8 · 等决策层 4', stock: 2, trial: '3 个在测 · 1 个达标 · 1 个未达标', bad: 2}},
      {id: 'ae', brand: '星帆商店', site: '阿联酋', name: '星帆商店 · 阿联酋', cur: 'AED', owner: 'm-ls', flag: ['降价执行中', 'ok'],
        today: {sales: 1610, spend: 260, roas: 2.60}, week: {sales: 9950, salesD: '+2%', spend: 2410, spendD: '+1%', roas: 2.60, spark: [2.9, 2.8, 2.75, 2.7, 2.65, 2.6, 2.6]},
        todo: {ads: '4 条 · 决策层 15:30 已批 · 执行中', stock: 1, trial: '2 个在测 · 1 个未达标 · 1 个资料不足', bad: 1}},
      {id: 'sa2', brand: '星帆商店', site: '沙特', name: '星帆商店 · 沙特', cur: 'SAR', owner: 'm-ls', flag: ['正常', 'ok'],
        today: {sales: 990, spend: 130, roas: 3.10}, week: {sales: 6800, salesD: '+6%', spend: 1450, spendD: '+3%', roas: 3.10, spark: [2.9, 3.0, 3.05, 3.0, 3.1, 3.05, 3.1]},
        todo: {ads: '5 条 · 李四初审中', stock: 0, trial: '1 个在测', bad: 0}},
      {id: 'sa3', brand: '月砂商店', site: '沙特', name: '月砂商店 · 沙特', cur: 'SAR', owner: 'm-zs', flag: ['ROAS 低于保本', 'err'],
        today: {sales: 620, spend: 130, roas: 2.30}, week: {sales: 3150, salesD: '+24%', spend: 960, spendD: '+18%', roas: 2.30, spark: [2.6, 2.5, 2.45, 2.4, 2.35, 2.3, 2.3]},
        todo: {ads: '3 条 · 张三初审中', stock: 0, trial: '2 个在测 · 新店', bad: 1}},
    ],

    kpi: {
      today: {lab: '今天', range: '11/19 截至 17:00', sales: 6020, salesD: '+5.1%', cmp: '较昨天同时段', spend: 1240, spendD: '+2.0%', roas: 3.18, spark: [2.6, 2.9, 3.3, 3.1, 3.0, 3.2, 3.18], orders: 186, aed: {sales: 1610, spend: 260}},
      week: {lab: '本周', range: '11/13–11/19', sales: 41350, salesD: '+7.8%', cmp: '较上周', spend: 8690, spendD: '+4.1%', roas: 3.20, spark: [2.9, 3.05, 2.98, 3.1, 3.0, 3.12, 3.2], orders: 1288, aed: {sales: 9950, spend: 2410}},
      month: {lab: '本月', range: '11/1–11/19', sales: 156200, salesD: '+12.4%', cmp: '较上月同期', spend: 34600, spendD: '+9.6%', roas: 3.08, spark: [2.7, 2.8, 2.95, 2.9, 3.0, 3.05, 3.08], orders: 4870, aed: {sales: 37400, spend: 8300}},
    },

    // AI 员工：全部一期上线（2026-11-20 定）。小巡在最前（巡查所有人）；其余小导打头（新人先找它），再按业务流程：小选（选品）→ 小架（上架）→ 小投（广告）→ 小测（测款）→ 小补（补货）
    ai: [
      {id: 'xiaoxun', name: '小巡', role: '巡查和日报', img: 'avatar-xiaoxun.webp', status: 'on', owner: 'boss', scenes: ['每小时巡查', '日报', '周报', '月报'],
        desc: '每天 15:10 出日报；每小时巡查 AI 员工、成员和店铺数据；紧急的事直接用企业微信通知这件事的拍板人。',
        schedule: '每天 15:10 日报 · 每小时巡查', model: 'gpt-6', skill: '平台内置（巡查规则、日报模板）', budget: '每天 ¥2',
        week: {runs: 175, cost: 7.10}, last: '17:00 巡查', next: '18:00 巡查'},
      {id: 'xiaodao', name: '小导', role: '向导', img: 'avatar-xiaodao.webp', status: 'on', owner: 'm-ww', page: '05f-小导工作台.html', scenes: ['日常问答', '找助手', '新人带教'],
        desc: '带新人上手 noon，告诉你一件事该找哪个助手、要准备什么，回答运营名词和日常问题。',
        schedule: '随问随答 · 每周一 10:00 提醒新人学习进度', model: 'gpt-6-mini', skill: 'resources/noon/skills/noon-guide @ e83f12a', budget: '每天 ¥3',
        week: {runs: 26, cost: 1.40, adopt: '—'}, last: '16:48 回答李四', next: '11/24 周一 10:00 提醒',
        now: {task: '回答李四：自动广告和手动广告怎么搭', by: '李四提问', step: 1, steps: ['查团队规则和案例', '写回答', '注明来源']}},
      {id: 'xiaoxuan', name: '小选', role: '选品', img: 'avatar-xiaoxuan.webp', status: 'on', owner: 'm-zs', page: '05e-小选工作台.html', scenes: ['算利润', '清货价', '候选商品'],
        desc: '按 noon 沙特 FBN 的佣金、费用、头程算利润、保本价、建议售价和清货价，出能改的毛利测算页；数字都由脚本算，做不做一个品由主管定。',
        schedule: '每周日 10:00 重算在售商品的利润', model: 'gpt-6-mini', skill: 'resources/noon/skills/noon-pick @ 4a91d3e', budget: '单次 ¥0.5 · 每天 ¥3',
        week: {runs: 11, cost: 0.90, adopt: '—'}, last: '16:30 算完 H098', next: '11/22 周日 10:00 重算',
        now: {task: '算 H096 便携榨汁杯的利润', by: '王五问：能不能做', step: 1, steps: ['读供货页、尺寸和重量', '查类目佣金和 FBN 费', '算保本价、建议售价']}},
      {id: 'xiaojia', name: '小架', role: '上架', img: 'avatar-xiaojia.webp', status: 'on', owner: 'm-zs', page: '05d-小架工作台.html', scenes: ['写 listing', '商品图', 'A+ 内容', '视频', '上架前检查'],
        desc: '写英文和阿语的标题、五点卖点、描述，排 7 张商品图、A+ 和视频，上架前检查；只出草稿，上架要拍板，批准后通过接口上架。',
        schedule: '每天 15:12 检查在售 listing', model: 'gpt-6', skill: 'resources/noon/skills/noon-listing @ 7c2e4b0', budget: '单次 ¥3 · 每天 ¥20',
        week: {runs: 14, cost: 6.80, adopt: '92%'}, last: '16:10 出图 6 张', next: '明天 15:12 检查 listing',
        now: {task: '优化 H039-2 水杯的 listing（白色星期五前换图）', by: '链接管理诊断：场景图少于 2 张', step: 2, steps: ['读现在的 listing 和商品资料', '改英文、阿语标题和卖点', '换 7 张商品图', '上架前检查']}},
      {id: 'xiaotou', name: '小投', role: '广告', img: 'avatar-xiaotou.webp', status: 'on', owner: 'm-zs', page: '05-小投工作台.html', scenes: ['广告复盘', '投前算账', '定时'],
        desc: '看广告数据，告诉你哪些词该加、该降、该停，拍板后通过接口替你改；新广告上线前帮你算账。',
        schedule: '每天 15:05 广告复盘（4 个站点）', model: 'gpt-6', skill: 'resources/noon/skills/noon-ads @ 3f2a91c', budget: '单次 ¥2 · 每天 ¥10',
        week: {runs: 23, cost: 8.40, adopt: '84%'}, last: '16:24 执行中', next: '明天 15:05 复盘',
        now: {task: '执行 12 条已批的调整', by: '决策层批 4 条 · 张三批 8 条', step: 2, steps: ['通过 noon 接口拉最新出价', '按批准的结果改出价', '否定 2 个词、停 1 个', '核对是否生效']}},
      {id: 'xiaoce', name: '小测', role: '测款', img: 'avatar-xiaoce.webp', status: 'on', owner: 'm-zs', page: '05b-小测工作台.html', scenes: ['测款计划', '测款复盘'],
        desc: '新品开测前定本轮标准；到了复盘日，按销量、退货、广告花费和单件毛利下结论，达标的交给小补做补货评估。',
        schedule: '每天 15:07 测款复盘（到复盘日的商品）', model: 'gpt-6', skill: 'resources/noon/skills/noon-trial @ 9b04e1a', budget: '单次 ¥1 · 每天 ¥5',
        week: {runs: 9, cost: 2.20, adopt: '—'}, last: '15:07 复盘 4 个商品', next: '明天 15:07',
        now: {task: '写 H052 吸管杯停止投入的理由', by: '复盘结论：评估停止投入', step: 1, steps: ['读本轮标准和实际数字', '整理两轮对比', '写给拍板人的理由']}},
      {id: 'xiaobu', name: '小补', role: '补货', img: 'avatar-xiaobu.webp', status: 'on', owner: 'm-zl', page: '05c-小补工作台.html', scenes: ['补货计划', '在途', '消息草稿'],
        desc: '算每个商品还能卖几天、要补多少、最晚哪天下单，出补货申请草稿；给工厂、货代写催交期和询价的消息草稿（只出草稿，不发送）。',
        schedule: '每天 15:06 补货计划', model: 'gpt-6', skill: 'resources/noon/skills/noon-restock @ 51c7d20', budget: '单次 ¥1 · 每天 ¥5',
        week: {runs: 8, cost: 1.60, adopt: '—'}, last: '15:06 补货计划', next: '明天 15:06',
        now: {task: '给筋膜枪工厂写催交期草稿', by: '补货申请等决策层拍板', step: 1, steps: ['读补货申请和起订量', '写询价和交期的消息草稿', '交给赵六确认后自己发']}}
    ],

    // 谁能批什么（初稿，需求文档第四节）。拍板人 = 这件事归谁定：按下面的规则算出来，通知只发给拍板人和跟进人
    authority: {
      ops: ['单条出价改动不超过 10%', '否定没出单的词', '停掉没出单的', '没货先停', '转给别的 AI 员工'],
      lead: ['补货申请、测款停止或追加，单笔不超过 SAR 5,000（决策层授权）'],
      founder: ['出价改动超过 10%', '加预算、加新词', '补货申请、测款停止或追加（超过主管授权的）', '投放位置加价', '上新、停整个店铺的广告'],
    },

    // 小补：补货计划（脚本 restock-plan 算，数字可追溯）
    restock: {
      at: '15:06', cover: '库存 + 已确认且在全周期内可售的在途',
      rows: [
        {sku: 'H061', name: '筋膜枪 X2', store: 'sa', stock: 132, d7: 22, d14: 20, d30: 18, inbound: 0, days: 6, cycle: 25, safety: 110, moq: 200, carton: 50, qty: 400, lastOrder: '已过', lastOrderNote: '应在 11/13 前下单', unit: 18.5, status: '建议补'},
        {sku: 'H044', name: '儿童水杯 500ml', store: 'sa', stock: 72, d7: 9, d14: 8, d30: 8, inbound: 100, days: 8, cycle: 20, safety: 60, moq: 100, carton: 50, qty: 150, lastOrder: '11/24', lastOrderNote: '还有 5 天', unit: 6.4, status: '建议补'},
        {sku: 'H072', name: '磁力积木 64 片', store: 'ae', stock: 126, d7: 14, d14: 13, d30: 12, inbound: 0, days: 9, cycle: 22, safety: 90, moq: 200, carton: 40, qty: 200, lastOrder: '11/21', lastOrderNote: '还有 2 天', unit: 7.2, status: '建议补'},
        {sku: 'H039', name: '运动水壶 1L', store: 'sa', stock: 58, d7: 3, d14: 3, d30: 2, inbound: 0, days: 19, cycle: 24, safety: 40, moq: 100, carton: 25, qty: null, lastOrder: '—', unit: 9.8, status: '补货评估', note: '小测：达到本轮标准，进入补货评估；按测款期日销算还能卖 19 天，先不补，7 天后再算'},
        {sku: 'H088', name: '手机支架 S1', store: 'sa', stock: 40, d7: 5, d14: 4, d30: 4, inbound: 0, days: 8, cycle: null, safety: null, moq: null, carton: null, qty: null, lastOrder: '—', unit: null, status: '待核实', note: '缺采购价、起订量、全周期，先不给数量'},
      ],
      inbound: [
        {po: 'PO-1108', name: '儿童水杯 500ml', store: 'sa', left: 100, ready: '11/28', status: '已确认', by: '赵六 11/18'},
        {po: 'PO-1112', name: 'H021 保温杯 600ml', store: 'sa', left: 300, ready: '12/03', status: '不确定', by: '赵六 11/16', note: '工厂说可能延到 12/10'},
        {po: 'PO-1104', name: '磁力积木 64 片', store: 'ae', left: 0, ready: '—', status: '已取消', by: '赵六 11/10'},
      ],
      drafts: [
        {to: '筋膜枪工厂（深圳·陈经理）', why: '筋膜枪 X2 已过最晚下单日', text: '陈经理您好，筋膜枪 X2 我们想补 400 件（8 箱），麻烦确认：1. 现在下单最快哪天能出货？2. 单价是否还是 18.5 元？3. 能否先发 200 件？谢谢！'},
        {to: '货代（迪拜·李）', why: 'H021 在途可能延期', text: '李总好，PO-1112 那批 H021 保温杯 300 件，工厂说可能延到 12/10 出货，麻烦帮看下 12 月中旬能否赶上利雅得 FBN 入仓，最晚哪天交到你们仓库？'},
      ],
    },

    // 小测：测款轮次（脚本 trial-review 判断）。结论只有四种（原文照抄）；第 3 种的下一步是「先调整」或「评估停止投入」，停止投入、追加预算要拍板（主管授权内王五可定，超出的决策层定）
    trials: [
      {sku: 'H039', name: '运动水壶 1L', store: 'sa', round: 1, start: '11/05', review: '11/19', std: {days: 14, orders: 30, margin: 18, ret: 5}, act: {days: 14, orders: 41, margin: 22, ret: 2.4}, budget: 600, spent: 540,
        verdict: '达到本轮标准，进入补货评估', k: 'ok', next: '已自动交小补做补货评估（不等于批准采购）', confirm: '王五 11/05'},
      {sku: 'H091', name: '折叠水杯', store: 'sa', round: 1, start: '11/12', review: '11/26', std: {days: 14, orders: 30, margin: 18, ret: 5}, act: {days: 7, orders: 12, margin: 20, ret: 0}, budget: 600, spent: 260,
        verdict: '继续观察，暂不判定', k: 'wait', next: '才 7 天、12 单，样本不够；11/26 再复盘', confirm: '王五 11/12'},
      {sku: 'H052', name: '吸管杯', store: 'sa', round: 2, start: '11/05', review: '11/19', std: {days: 14, orders: 20, margin: 15, ret: 5}, act: {days: 14, orders: 9, margin: 6, ret: 7}, budget: 400, spent: 410,
        verdict: '未达本轮标准，先调整或评估停止投入', k: 'err', step: '评估停止投入', next: '等拍板（王五或决策层）：停止投入还是追加预算', confirm: '王五 11/05'},
      {sku: 'H095', name: '硅胶杯盖', store: 'ae', round: 1, start: '11/10', review: '11/19', std: {days: 9, orders: 15, margin: 18, ret: 5}, act: {days: 9, orders: 8, margin: 24, ret: 0}, budget: 300, spent: 120,
        verdict: '未达本轮标准，先调整或评估停止投入', k: 'err', step: '先调整', next: '利润率够、展示太少：交小投加价 10%（运营权限内），再测 7 天', confirm: '王五 11/10'},
      {sku: 'H097', name: '儿童保温杯', store: 'ae', round: 1, start: '11/08', review: '11/19', std: {days: 10, orders: 20, margin: 18, ret: 5}, act: {days: 11, orders: 23, margin: null, ret: 3}, budget: 500, spent: 380,
        verdict: '资料或标准不足，暂不判定', k: 'off', next: '缺单件毛利：张三在商品库补上后重判', confirm: '王五 11/08'},
    ],

    // 等拍板的事。decider = 拍板人（谁都能批时列多个，谁先批都算）；页面「等你拍板」只列当前登录的人是拍板人的
    approvals: {
      pending: [
        {id: 'A-1119-07', kind: '广告调整', title: '云屿商店 4 条广告调整', why: '超出运营权限 · 调整幅度超出主管授权', store: 'sa', from: '张三 16:20 初审后提交', ai: 'xiaotou', time: '16:20', decider: ['boss'],
          amount: '涉及近 7 天花费 SAR 362', owners: ['小投 · 通过接口执行'],
          items: [
            {k: 'water bottle', o: '定向词 · SP-水杯-广泛', t: '降价', a: '降 20%：0.85 → 0.68', sp: 310, or: 4, ro: 0.80, why: 'ROAS 0.80，保本 2.40；一次调整不超过 20%'},
            {k: 'SP-水杯-精准 · Top of search', o: '投放位置', t: '位置', a: '加价降一半：50% → 25%', sp: 0, or: 0, ro: 2.10, why: '这个位置明显更贵，ROAS 2.10 低于保本'},
            {k: 'kids water bottle', o: '搜索词 · SP-自动', t: '加新词', a: '手动定向、词组匹配；自动广告里精确否定它', sp: 52, or: 3, ro: 7.54, why: '出了 3 单、ROAS 7.54，单独开出来'},
            {k: 'SP-吸管杯-精准', o: '广告 · 每天预算 SAR 50', t: '预算', a: '加预算到 SAR 80', sp: 0, or: 0, ro: 5.20, why: '每天下午预算就花完，ROAS 5.20'},
          ]},
        {id: 'A-1119-08', kind: '补货申请', title: '补货申请 · 3 个商品', why: '要花钱 · 超过 SAR 5,000', store: 'sa', from: '小补 15:06 · 赵六核过报价', ai: 'xiaobu', time: '15:06', decider: ['boss'],
          amount: '采购金额 SAR 9,800（只算采购单价 × 件数）', owners: ['赵六 · 下采购单、更新在途', '张三 · 下采购单、更新在途'],
          items: [
            {k: '筋膜枪 X2', o: '云屿商店 · 沙特 · 还能卖 6 天 · 全周期 25 天', t: '补货', a: '补 400 件（8 箱）× SAR 18.5 = SAR 7,400', sp: 0, why: '最晚下单日已过（应在 11/13 前），越早下越好'},
            {k: '儿童水杯 500ml', o: '云屿商店 · 沙特 · 还能卖 8 天 · 在途 100 件 11/28 可售', t: '补货', a: '补 150 件（3 箱）× SAR 6.4 = SAR 960', sp: 0, why: '最晚下单日 11/24'},
            {k: '磁力积木 64 片', o: '星帆商店 · 阿联酋 · 还能卖 9 天 · 全周期 22 天', t: '补货', a: '补 200 件（5 箱）× SAR 7.2 = SAR 1,440', sp: 0, why: '最晚下单日 11/21'},
          ]},
        {id: 'A-1119-09', kind: '测款', title: '吸管杯 H052：停止投入还是追加预算', why: '两轮都没达到本轮标准', store: 'sa', from: '小测 15:07 复盘', ai: 'xiaoce', time: '15:07', decider: ['m-ww', 'boss'],
          amount: '本轮已花 SAR 410 / 预算 SAR 400', owners: ['小投 · 停掉吸管杯的广告', '张三 · 追加 SAR 300 再测一轮'],
          decide: [['停止投入', '小投 · 停掉吸管杯的广告，剩下的库存清货'], ['追加 SAR 300 再测一轮', '张三 · 开第 3 轮，标准不变']],
          items: [
            {k: '第 2 轮 · 14 天', o: '本轮标准：≥20 单 · 利润率 ≥15% · 退货率 ≤5%', t: '停止', a: '实际 9 单 · 利润率 6% · 退货率 7%', sp: 0, why: '第 1 轮也只有 11 单；小测建议停止投入，库存 60 件按清货价处理'},
          ]},
      ],
      done: [
        {id: 'A-1119-03', title: '星帆商店 阿联酋 4 条广告调整', who: '决策层', time: '15:30', result: '通过', owner: '小投 · 执行中'},
        {id: 'A-1118-05', title: '云屿商店 10 条广告调整', who: '决策层', time: '昨天 15:40', result: '通过', owner: '小投 · 已生效'},
        {id: 'A-1118-06', title: '云屿商店 加预算 SAR 30 → 60', who: '决策层', time: '昨天 15:40', result: '退回', owner: '「先观察两天」'},
      ],
      opsApproved: [{who: '张三', time: '16:20', title: '云屿商店 8 条广告调整', note: '出价改动 ≤10%、否定、停、没货先停、转小架', owner: '小投 · 执行中'}],
    },

    executions: [
      {id: 'E-1119-21', time: '16:24', store: 'sa', op: '改出价', target: 'gym bottle', before: '0.70', after: '0.63', status: '已生效', by: '张三直批'},
      {id: 'E-1119-22', time: '16:24', store: 'sa', op: '改出价', target: '1l bottle', before: '0.55', after: '0.50', status: '已生效', by: '张三直批'},
      {id: 'E-1119-23', time: '16:25', store: 'sa', op: '否定（精确）', target: 'baby bottle', before: '—', after: '已否定', status: '已生效', by: '张三直批'},
      {id: 'E-1119-24', time: '16:25', store: 'sa', op: '否定（精确）', target: 'glass bottle', before: '—', after: '已否定', status: '执行中', by: '张三直批'},
      {id: 'E-1119-25', time: '16:25', store: 'sa', op: '暂停商品广告', target: 'H021 保温杯 600ml', before: '开', after: '停', status: '执行中', by: '张三直批'},
      {id: 'E-1119-11', time: '15:32', store: 'ae', op: '改出价', target: 'magnetic tiles', before: '0.80', after: '0.64', status: '已生效', by: '决策层'},
      {id: 'E-1119-12', time: '15:32', store: 'ae', op: '改出价', target: 'fidget toys', before: '0.62', after: '0.56', status: '已生效', by: '决策层'},
      {id: 'E-1119-13', time: '15:33', store: 'ae', op: '否定（精确）', target: 'cable', before: '—', after: '已否定', status: '已生效', by: '决策层'},
      {id: 'E-1119-14', time: '15:33', store: 'ae', op: '改出价', target: 'pop it', before: '0.50', after: '0.55', status: '已撤回', by: '决策层', undo: '李四 16:02 撤回：活动期间先不加'},
    ],

    tasks: [
      {id: 'T-1119-01', name: '广告复盘', store: 'sa', ai: 'xiaotou', owner: 'm-zs', status: '待拍板', sub: '14 条：直批 8 · 等决策层 4 · 不动 2', time: '今天 15:05', run: 'R-20261119-003'},
      {id: 'T-1119-02', name: '执行已批的调整', store: 'sa', ai: 'xiaotou', owner: 'm-zs', status: '执行中', sub: '8 条 · 已生效 3/8', time: '今天 16:24', run: 'R-20261119-009'},
      {id: 'T-1119-03', name: '补货计划', store: 'sa', ai: 'xiaobu', owner: 'm-zl', status: '待拍板', sub: '补货申请 3 个商品 · SAR 9,800 · 1 个待核实', time: '今天 15:06'},
      {id: 'T-1119-10', name: '测款复盘', store: 'sa', ai: 'xiaoce', owner: 'm-zs', status: '待拍板', sub: '5 个商品：达标 1 · 继续观察 1 · 未达标 2 · 资料不足 1', time: '今天 15:07'},
      {id: 'T-1119-04', name: '执行已批的调整', store: 'ae', ai: 'xiaotou', owner: 'm-ls', status: '执行中', sub: '4 条 · 已生效 3 · 撤回 1', time: '今天 15:32', run: 'R-20261119-006'},
      {id: 'T-1119-11', name: '优化 listing · H039-2 水杯', store: 'sa', ai: 'xiaojia', owner: 'm-zs', status: '执行中', sub: '文案改好了，7 张商品图做了 6 张', time: '今天 16:10'},
      {id: 'T-1119-12', name: '算利润 · H096 便携榨汁杯', store: 'sa', ai: 'xiaoxuan', owner: 'm-ww', status: '已完成', sub: '毛估利润 26.8% · 保本价 SAR 48.4 · 到 25% 要卖 SAR 67.0', time: '今天 16:30'},
      {id: 'T-1119-13', name: '回答：自动广告和手动广告怎么搭', store: null, ai: 'xiaodao', owner: 'm-ls', status: '已完成', sub: '注明了来源：团队规则 · 广告结构', time: '今天 16:48'},
      {id: 'T-1119-05', name: '每日日报', store: null, ai: 'xiaoxun', owner: 'boss', status: '已完成', sub: '已推送企业微信', time: '今天 15:10'},
      {id: 'T-1119-06', name: '每小时巡查', store: null, ai: 'xiaoxun', owner: 'boss', status: '已完成', sub: '没有要紧的事', time: '今天 17:00'},
      {id: 'T-1118-04', name: '投前算账 · H039-2 水杯', store: 'sa', ai: 'xiaotou', owner: 'm-zs', status: '已完成', sub: '保本 ROAS 2.40', time: '昨天 17:20'},
      {id: 'T-1118-01', name: '广告复盘', store: 'sa', ai: 'xiaotou', owner: 'm-zs', status: '已完成', sub: '10 条已生效 · ROAS 2.98 → 3.19', time: '昨天 15:05'},
      {id: 'T-1117-02', name: '广告复盘', store: 'ae', ai: 'xiaotou', owner: 'm-ls', status: '失败', sub: '接口超时，已自动重试成功', time: '11/17 15:05'},
    ],

    runs: {
      'R-20261119-003': {id: 'R-20261119-003', name: '广告复盘', store: 'sa', ai: 'xiaotou', by: '每日巡检', status: '待拍板', start: '15:05:02', took: '38 秒',
        steps: [['拉取数据', '342 行 · 11/12–11/18 · noon 接口', '2 秒'], ['按规则计算', '14 条建议 · 20 个观察/低量', '3 秒'], ['看搜索词、写总结', '判断 9 个搜索词 · gpt-6', '31 秒'], ['生成复盘页', '带上判断重出页面', '2 秒']],
        usage: {model: 'gpt-6', input: 18240, output: 2110, cost: 0.42},
        artifacts: [['建议表.json', '14 条'], ['复盘页.html', '可预览'], ['原始数据.json', 'R2 留底']],
        log: ['15:05:02 开始：每日巡检发起 · 云屿商店 · 沙特 · 11/12–11/18', '15:05:04 拉取数据：广告 6 张表，342 行，搜索词花费占 96%', '15:05:07 计算：没货 1 · 停 1 · 降价 4 · 位置 1 · 否定 3 · 加新词 1 · 加价 1 · 预算 1 · 修商品页 1',
          '15:05:38 模型：判断 9 个搜索词相关性，写总结（18,240 → 2,110 tokens，¥0.42）', '15:05:40 完成：进入「待我处理」（张三）', '16:20:11 张三初审：直批 8 条，提交决策层 4 条，2 条先不动']},
    },

    usage: {
      today: {total: 32.40, platform: 5.10, members: 27.30},
      week: {total: 196.80, platform: 19.30, members: 177.50},
      month: {total: 402.60, platform: 38.40, members: 364.20},
      budget: {month: 800, left: 397, pct: 50},   // 本月 AI 预算：已用 ¥402.60，剩 ¥397
      trend: [21, 24, 26, 22, 28, 31, 27, 25, 29, 33, 30, 26, 24, 28, 31, 35, 29, 27, 32.4],
      byMember: [['张三', 11.60], ['李四', 9.30], ['王五', 4.20], ['赵六', 2.20]],
      byAI: [['小投', 3.10], ['小巡', 1.00], ['小测', 0.60], ['小补', 0.40]],
      byModel: [['gpt-6', 30.20], ['gpt-6-mini', 2.20]],
      source: 'sub2api · 最后同步 17:00 · 外部工具的用量没有统计',
    },

    // 定时任务（P20）。chain 是今天 15:00 每日巡检这条流水线（前一步没跑完，后面的等着）；list 是所有定时。代码：schedules
    schedules: {
      chain: [
        {t: '15:00', ai: null, name: '拉数据', res: 'noon 接口 · 云屿商店 342 行，其余 3 个站点 186 行', took: '2 秒'},
        {t: '15:05', ai: 'xiaotou', name: '广告复盘', res: '云屿商店 14 条、星帆商店 阿联酋 4 条建议', took: '38 秒'},
        {t: '15:06', ai: 'xiaobu', name: '补货计划', res: '补货申请 3 个商品 · 待核实 1 个', took: '21 秒'},
        {t: '15:07', ai: 'xiaoce', name: '测款复盘', res: '5 个商品 · 达标 1 个', took: '26 秒'},
        {t: '15:10', ai: 'xiaoxun', name: '写日报', res: '已推送企业微信', took: '12 秒'},
      ],
      list: [
        {id: 'S-01', ai: null, name: '拉数据', what: '通过 noon 接口拉前一天的广告、销售、库存', when: '每天 15:00', store: '4 个站点', next: '明天 15:00', last: '今天 15:00 · 528 行 · 2 秒', log: ['今天 15:00 · 528 行 · 2 秒', '昨天 15:00 · 514 行 · 2 秒'], owner: 'm-ww', on: true, fail: '接口出错：在工作群提醒负责的运营，上传后台导出的文件，传完接着跑'},
        {id: 'S-02', ai: 'xiaotou', name: '广告复盘', what: '看前 7 天的广告数据，出调整建议，交负责的运营初审', when: '每天 15:05', store: '云屿商店 · 沙特', next: '明天 15:05', last: '今天 15:05 · 14 条建议', log: ['今天 15:05 · 14 条建议，张三 16:20 初审', '昨天 15:05 · 10 条，已拍板，小投已全部执行'], fail: '接口出错：工作群提醒 @张三 上传后台导出的文件，传完自动复盘', owner: 'm-zs', on: true, page: '05-小投工作台.html'},
        {id: 'S-03', ai: 'xiaotou', name: '广告复盘', what: '同上', when: '每天 15:05', store: '星帆商店 · 阿联酋', next: '明天 15:05', last: '今天 15:05 · 4 条建议 · 已批，执行中', log: ['今天 15:05 · 4 条建议，决策层 15:30 已批，执行中', '昨天 15:05 · 3 条，李四直批'], fail: '接口出错：工作群提醒 @李四 上传后台导出的文件，传完自动复盘', owner: 'm-ls', on: true, page: '05-小投工作台.html'},
        {id: 'S-04', ai: 'xiaobu', name: '补货计划', what: '算还能卖几天、补多少、最晚哪天下单，出补货申请草稿', when: '每天 15:06', store: '4 个站点', next: '明天 15:06', last: '今天 15:06 · 补货申请 3 个商品', log: ['今天 15:06 · 补货申请 3 个商品，待核实 1 个', '昨天 15:06 · 没有要补的'], fail: '缺采购资料的商品不给数量，进「待核实」，提醒 @赵六 补', owner: 'm-zl', on: true, page: '05c-小补工作台.html'},
        {id: 'S-05', ai: 'xiaoce', name: '测款复盘', what: '只看到了复盘日的测款商品，按本轮标准下结论', when: '每天 15:07', store: '4 个站点', next: '明天 15:07', last: '今天 15:07 · 5 个商品', log: ['今天 15:07 · 5 个商品，达到本轮标准 1 个', '昨天 15:07 · 没有到复盘日的商品，跳过'], fail: '缺单件毛利的商品写「资料或标准不足」，提醒 @张三 补', owner: 'm-zs', on: true, page: '05b-小测工作台.html'},
        {id: 'S-06', ai: 'xiaoxun', name: '日报', what: '写日报，推到企业微信工作群', when: '每天 15:10', store: '全部', next: '明天 15:10', last: '今天 15:10 · 已推送', log: ['今天 15:10 · 已推送企业微信', '昨天 15:10 · 已推送企业微信'], fail: '数据没拉到：15:40 再写一次，先在群里说一声', owner: 'boss', on: true, page: '15-日报.html'},
        {id: 'S-07', ai: 'xiaoxun', name: '每小时巡查', what: '看 AI 员工、成员跟进和店铺数据；紧急的发企业微信给拍板人', when: '每小时整点', store: '全部', next: '18:00', last: '17:00 · 没有要紧的事', log: ['17:00 · 没有要紧的事', '16:00 · 提醒张三初审 云屿商店  14 条'], owner: 'boss', on: true},
        {id: 'S-08', ai: 'xiaoxun', name: '周报', what: '写本周周报（沙特一周到周四）', when: '每周四 15:10', store: '全部', next: '11/26 15:10', last: '今天 15:10 · 已推送', log: ['今天 15:10 · 已推送', '11/12 15:10 · 已推送'], owner: 'boss', on: true, page: '15-日报.html'},
        {id: 'S-09', ai: 'xiaoxun', name: '月报', what: '写上个月的完整月报', when: '每月 1 日 15:10', store: '全部', next: '12/1 15:10', last: '11/1 15:10 · 已推送', log: ['11/1 15:10 · 已推送', '10/1 15:10 · 已推送'], owner: 'boss', on: true, page: '15-日报.html'},
        {id: 'S-10', ai: 'xiaojia', name: '在售 listing 检查', what: '按 noon 的要求查主图白底、图片张数、阿语标题、违禁词', when: '每天 15:12', store: '4 个站点', next: '明天 15:12', log: ['今天 15:12 · 4 条 listing，2 条要改', '昨天 15:12 · 没有新问题'], fail: '店铺接口读不到 listing：跳过，下次再查', owner: 'm-zs', on: true, page: '05d-小架工作台.html'},
        {id: 'S-11', ai: 'xiaoxuan', name: '重算利润', what: '按最新费率重算在售商品的利润，利润率掉到 10% 以下的提醒负责人', when: '每周日 10:00', store: '云屿商店 · 沙特', next: '11/22 10:00', log: ['11/16 10:00 · 6 个在售商品，费率没变', '11/9 10:00 · H052 利润率降到 6%，已提醒王五'], fail: '费率表读不到：用上次的费率算，并标出来', owner: 'm-ww', on: true, page: '05e-小选工作台.html'},
        {id: 'S-12', ai: 'xiaodao', name: '新人学习提醒', what: '提醒在带的新人这周该学哪一步，顺便问卡在哪', when: '每周一 10:00', store: '全部', next: '11/24 10:00', log: ['11/17 10:00 · 没有在带的新人', '11/10 10:00 · 提醒赵六第 3 步：补货表'], owner: 'm-ww', on: true, page: '05f-小导工作台.html'},
      ],
    },

    // ---------- 管理后台用（P16）：结构对齐 usage_daily、ai_employees、skills、audit_logs ----------
    admin: {
      // 模型：来自 sub2api，平台只读；倍率、价格在 sub2api 里改
      models: [
        {name: 'gpt-6', via: 'sub2api 网关', rate: '1.00×', tags: ['推理', '图片识别'], users: '小投、小测、小补、小巡、成员', share: 88},
        {name: 'gpt-6-mini', via: 'sub2api 网关', rate: '0.20×', tags: ['便宜', '快'], users: '成员（简单问答）', share: 12},
      ],
      modelStats: {calls: [412, '+6%'], input: ['1.86M', '+4%'], output: ['0.21M', '+2%'], tpm: '4.1K', rpm: '2.3', cache: '38%', latency: '6.8 秒', first: '1.2 秒', success: '99.3%'},
      // 技能：从团队技能库 noon-commerce-teamai 同步，平台不改技能本身
      skills: [
        {name: 'noon-ads', ai: 'xiaotou', scenes: '广告复盘、投前算账', ver: '3f2a91c', synced: '11/19 09:12', scripts: 'ads-review.mjs、pre-launch.mjs'},
        {name: 'noon-trial', ai: 'xiaoce', scenes: '测款计划、测款复盘', ver: '9b04e1a', synced: '11/19 09:12', scripts: 'trial-review.mjs'},
        {name: 'noon-restock', ai: 'xiaobu', scenes: '补货计划、消息草稿', ver: '51c7d20', synced: '11/19 09:12', scripts: 'restock-plan.mjs'},
        {name: '巡查和日报', ai: 'xiaoxun', scenes: '每小时巡查、日报、紧急通知', ver: '平台内置', synced: '—', scripts: '—'},
      ],
      // 本月用量（¥）：成员和 AI 员工各自用了多少；合计 = usage.month。首期不给成员设上限
      budgets: {
        members: [['m-zs', 146.2, 200], ['m-ls', 118.5, 200], ['m-ww', 61.3, 150], ['m-zl', 38.2, 100]],
        ai: [['xiaotou', 21.4], ['xiaoxun', 9.6], ['xiaoce', 4.3], ['xiaobu', 3.1]],
        reset: '每月 1 日 00:00 重置', next: '2026/12/01 00:00',
      },
      // 费用明细（只增不改）
      ledger: [
        ['17:00', 'xiaoxun', '每小时巡查', 'gpt-6-mini', 3120, 240, 0.01],
        ['16:24', 'xiaotou', '执行 12 条已批的调整', '—', 0, 0, 0],
        ['16:02', 'm-zs', '个人使用 · 写 listing', 'gpt-6', 22400, 3100, 0.61],
        ['15:10', 'xiaoxun', '日报', 'gpt-6', 9800, 1200, 0.21],
        ['15:07', 'xiaoce', '测款复盘 5 个商品', 'gpt-6', 11300, 1600, 0.26],
        ['15:06', 'xiaobu', '补货计划 · 消息草稿 2 条', 'gpt-6', 8400, 1300, 0.19],
        ['15:05', 'xiaotou', '广告复盘 · 云屿商店 · 沙特', 'gpt-6', 18240, 2110, 0.42],
        ['15:05', 'xiaotou', '广告复盘 · 星帆商店 · 阿联酋', 'gpt-6', 9100, 980, 0.20],
        ['14:40', 'm-ls', '个人使用 · 翻译阿语', 'gpt-6', 15200, 4100, 0.48],
      ],
      // 操作记录：谁在什么时候做了什么（拍板、撤回、改权限、改设置、登录）
      ops: [
        ['16:20', 'm-zs', '初审', '云屿商店 14 条：直批 8 条，提交 4 条', '成功', '网页'],
        ['16:02', 'm-ls', '撤回', '撤回执行 E-1119-14「pop it 改出价」：活动期间先不加', '成功', '网页'],
        ['15:32', 'xiaotou', '执行', '星帆商店 阿联酋 4 条已批的调整（noon 接口）', '3 条成功 · 1 条已撤回', '接口'],
        ['15:30', 'boss', '拍板', '通过「星帆商店 阿联酋 4 条广告调整」，交给小投', '成功', '企业微信'],
        ['11/18 18:40', 'm-ww', '改设置', '运营单条出价改动上限 15% → 10%', '成功', '网页'],
        ['11/18 10:12', 'm-ww', '改设置', '新增成员 赵六（采购）', '成功', '网页'],
        ['11/18 09:01', 'm-ls', '登录', '登录失败：密码不对', '失败', '网页'],
      ],
    },

    report: {
      title: '日报', lab: '今天', cmp: '较前天', date: '11/19 周四', at: '15:10', by: 'xiaoxun', range: '看昨天 11/18 的数据',
      ai: '昨天 AI 费用 ¥31.20：平台 AI 员工 ¥3.90，成员个人使用 ¥27.30。本月预算还剩 ¥397。',
      heads: ['昨天批了什么 · 效果', '今天要处理的', '要留意'],
      headline: '昨天销售 SAR 5,860，比前天多 4%；广告 ROAS 3.19，比前天 +0.21。筋膜枪 X2 只够卖 6 天，已过最晚下单日，补货申请等你批。',
      kpis: [['昨天销售', 'SAR 5,860', '+4.0%'], ['广告花费', 'SAR 1,215', '+1.2%'], ['ROAS', '3.19', '+0.21'], ['AI 费用', '¥31.20', '-3%']],
      done: [['云屿商店 10 条广告调整', '决策层批 · 小投执行', 'ROAS 2.98 → 3.19'], ['星帆商店 阿联酋否定 3 个词', '李四直批 · 小投执行', '花费 -AED 41/天']],
      todo: [['补货申请 · 3 个商品', '等决策层拍板'], ['吸管杯 H052 停止投入还是追加预算', '等王五或决策层拍板'], ['云屿商店 14 条广告建议', '张三初审'], ['星帆商店 阿联酋 4 条广告建议', '等决策层拍板']],
      watch: ['筋膜枪 X2 只够卖 6 天，最晚下单日已过', '运动水壶 1L 达到本轮标准，已进入小补的补货评估', '儿童保温杯缺单件毛利，测款资料不足、暂不判定', '星帆商店 阿联酋 2 个广告组 ROAS 低于保本，今天建议降价'],
    },

    // 周报（每周四 15:10，沙特一周到周四）、月报（本月至今；每月 1 日出上个月的完整月报）
    reports: {
      week: {title: '周报', lab: '本周', cmp: '较上周', date: '11/13–11/19', at: '11/19 15:10', range: '本周（周五到周四）',
        headline: '本周销售 SAR 41,350（沙特三站），比上周多 8%，阿联酋 AED 9,950 另算；ROAS 3.20，在保本线 2.40 之上。云屿商店 往上走（3.40），星帆商店 阿联酋一路往下（2.60），新店 月砂商店 2.30 还在保本线下，已批降价。',
        kpis: [['本周销售', 'SAR 41,350', '+7.8%'], ['广告花费', 'SAR 8,690', '+4.1%'], ['ROAS', '3.20', '+0.15'], ['AI 费用', '¥196.80', '+6%']],
        heads: ['本周批了什么 · 效果', '还没处理的', '要留意'],
        done: [['云屿商店 10 条广告调整', '决策层批 · 小投执行', 'ROAS 2.98 → 3.19'], ['星帆商店 阿联酋 4 条降价', '决策层批 · 小投执行', '3 条生效 · 1 条撤回'], ['张三直批 8 条', '运营权限内 · 小投执行', '16:24 起生效']],
        todo: [['补货申请 · 3 个商品', '等决策层拍板'], ['吸管杯 H052 停止投入还是追加预算', '等王五或决策层拍板'], ['云屿商店 4 条广告调整', '等决策层拍板']],
        watch: ['星帆商店 阿联酋站 ROAS 7 天从 2.90 掉到 2.60，已经接近保本', '筋膜枪 X2 已过最晚下单日，越早批越好', '运动水壶 1L 测款达到本轮标准，已进入补货评估', '本周 AI 费用比上周多 6%，主要是成员个人使用'],
        ai: '本周 AI 费用 ¥196.80：平台 AI 员工 ¥19.30，成员个人使用 ¥177.50。本月预算还剩 ¥397。'},
      month: {title: '月报', lab: '本月', cmp: '较上月同期', date: '11/1–11/19', at: '本月至今 · 11/19 15:10', range: '本月至今；12/1 出 11 月的完整月报',
        headline: '本月至今销售 SAR 156,200，比上月同期多 12%；广告花费 SAR 34,600，ROAS 3.08，高于保本 0.68，广告带来约 SAR 106,600。',
        kpis: [['本月销售', 'SAR 156,200', '+12.4%'], ['广告花费', 'SAR 34,600', '+9.6%'], ['ROAS', '3.08', '+0.06'], ['AI 费用', '¥402.60', '预算剩 ¥397']],
        heads: ['本月拍了什么 · 效果', '还没处理的', '要留意'],
        done: [['拍板 41 件', '决策层 29 · 王五 4 · 运营直批 8', '执行 126 条 · 撤回 3 条'], ['测款复盘 5 个', '达标 1 · 继续观察 1 · 未达标 2 · 资料不足 1', '运动水壶进入补货评估'], ['补货', '下了 2 次采购单', '在途 400 件']],
        todo: [['补货申请 · 3 个商品', '等决策层拍板'], ['吸管杯 H052 停止投入还是追加预算', '等王五或决策层拍板'], ['云屿商店 4 条广告调整', '等决策层拍板']],
        watch: ['星帆商店 阿联酋站 ROAS 连续两周往下走', '3 个商品只够卖 10 天内', 'AI 费用按现在的速度，月底约 ¥660，在预算 ¥800 以内'],
        ai: '本月 AI 费用 ¥402.60：平台 AI 员工 ¥38.40，成员个人使用 ¥364.20。预算 ¥800，还剩 ¥397。'},
    },

    ticker: [
      ['小巡', '17:00 巡查 6 位 AI 员工、4 位成员、4 个店铺站点 · 没有要紧的事'],
      ['小投', '正在执行 12 条已批的调整'],
      ['小补', '15:06 补货计划 · 补货申请 3 个商品等决策层拍板'],
      ['小测', '15:07 测款复盘 · 运动水壶达到本轮标准，进入补货评估'],
      ['张三', '16:20 初审 云屿商店  14 条 · 直批 8 条，4 条提交决策层'],
      ['小巡', '15:10 日报已推送到企业微信'],
    ],
  };
})();
