import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

// 源店名从指定版本的演示数据读取，公开仓库只记录站点对应的虚构店名。
const aliasesBySite = new Map([
  ['sa', '云屿商店'],
  ['ae', '星帆商店'],
  ['sa2', '星帆商店'],
  ['sa3', '月砂商店'],
]);
const preview = fileURLToPath(new URL('../', import.meta.url));
const [source, revision = 'HEAD'] = process.argv.slice(2);
if (!source) throw new Error('请指定已纳入 Git 的原型目录，可在目录后指定提交号。');
const git = (...args) => execFileSync('git', args, { cwd: resolve(source), maxBuffer: 64 * 1024 * 1024 });
const prefix = git('rev-parse', '--show-prefix').toString().trim().replace(/\/$/, '');
const tree = git('rev-parse', '--verify', '--end-of-options', revision + ':' + prefix).toString().trim();
const read = (name) => git('cat-file', 'blob', tree + ':' + name);
const isPreviewFile = (name) => /^[^./][^/]*\.html$/.test(name)
  || /^assets\/(?!fonts\/).+\.(?:js|css|json)$/.test(name)
  || /^img\/.+\.(?:webp|svg|jpe?g|png)$/.test(name)
  || name === 'tools/fetch-fonts.sh';

const context = { window: {} };
runInNewContext(read('assets/data.js').toString(), context, { timeout: 1000 });
const aliases = new Map();
for (const { id, brand } of context.window.OS_DATA.stores) {
  const alias = aliasesBySite.get(id);
  if (!brand || !alias || (aliases.has(brand) && aliases.get(brand) !== alias)) {
    throw new Error('请检查站点 ' + id + ' 的虚构店名。');
  }
  aliases.set(brand, alias);
}

function publicText(name, text) {
  for (const [brand, alias] of aliases) text = text.replaceAll(brand, alias);
  if (name === 'assets/data.js') text = text.replace('本地 TeamAI 资料', '公开演示');
  if (name.endsWith('.html')) text = text.replace(/placeholder="name@[^"]+"/g, 'placeholder="name@example.com"');
  if (name === 'index.html') {
    text = text.replaceAll('风之岚 OS · UI 确认', '风之岚 OS · UI 预览')
      .replace(/(<header class="hd">[\s\S]*?<p>)[\s\S]*?(<\/p>)/, '$1从下方选择页面，体验组织树、地图和 AI 员工工作台。店名为虚构名称，经营数字均为演示数据。$2')
      .replace(/\n  <section class="grp"><h2>还要决策层定的[\s\S]*?<\/section>/, '')
      .replace(/\n  <p class="hint">探索稿在[\s\S]*?<\/p>/, '');
  }
  if (name === '01-登录.html') {
    text = text.replace(/<p class="lead">[^<]*<\/p>/, '<p class="lead">演示账号已填好，点「登录」即可进入组织树。</p>')
      .replace('autocomplete="email" placeholder="name@example.com"', 'autocomplete="off" value="demo@example.com"')
      .replace('autocomplete="current-password"', 'autocomplete="off" value="preview"');
  }
  return text;
}

const files = new Map();
for (const name of git('ls-tree', '--full-tree', '-r', '-z', '--name-only', tree).toString().split('\0').filter(isPreviewFile)) {
  const sourceBytes = read(name);
  const content = /\.(html|js|css|json|svg|sh)$/.test(name)
    ? Buffer.from(publicText(name, sourceBytes.toString()))
    : sourceBytes;
  const searchable = (name + '\n' + content.toString()).toLowerCase();
  for (const brand of aliases.keys()) {
    if (searchable.includes(brand.toLowerCase())) throw new Error(name + ' 中有未替换的店名。');
  }
  files.set(name, content);
}
if (!files.has('index.html')) throw new Error('指定版本缺少原型首页。');

// 先准备完整副本，再写文件。同步时只清理旧版本已跟踪的预览文件。
for (const [name, content] of files) {
  const path = join(preview, name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: preview }).toString().split('\0');
for (const name of tracked.filter(isPreviewFile)) {
  if (!files.has(name)) rmSync(join(preview, name), { force: true });
}
console.log('已导出 ' + files.size + ' 个文件，使用 ' + aliases.size + ' 个虚构店名。');
