const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../design/whale-pet');
const out = process.env.WHALE_PET_OUTPUT_DIR || path.join(root, 'v02-glossy');
const source = path.join(root, 'reference/whale-original.png');
const labels = {
  Idle: '待机',
  Blink: '眨眼',
  Happy: '开心',
  Thinking: '思考',
  Sleep: '睡眠',
  Reading: '阅读',
};
const svgs = JSON.parse(fs.readFileSync(path.join(out, 'svg-states.json'), 'utf8'));
const original = fs.readFileSync(source).toString('base64');
const previous = fs.readFileSync(path.join(root, 'reference/whale-pet-v01-flat.svg'), 'utf8');
function scoped(svg, prefix) {
  return svg
    .replace(/id="([^"]+)"/g, (_, id) => 'id="' + prefix + id + '"')
    .replace(/url\(#([^)]+)\)/g, (_, id) => 'url(#' + prefix + id + ')');
}
const cards = Object.keys(labels)
  .map(
    (s, i) =>
      '<article class="state"><div class="art">' +
      scoped(svgs[s], 'state-' + s + '-') +
      '</div><h3>' +
      s +
      ' <span>' +
      labels[s] +
      '</span></h3></article>',
  )
  .join('');
const html =
  '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Whale Pet V0.2 · 轮廓与立体材质修订</title><style>' +
  '*{box-sizing:border-box}body{margin:0;font-family:Arial,"Microsoft YaHei",sans-serif;background:#F1F5FB;color:#172333}main{max-width:1440px;margin:auto;padding:46px 52px}.eyebrow{font-size:12px;letter-spacing:2px;font-weight:700;color:#1844C9}h1{font-size:42px;letter-spacing:-1px;margin:22px 0 14px}.intro{font-size:17px;line-height:1.8;color:#657589;margin:0 0 32px}.compare{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.panel{background:white;border-radius:20px;padding:22px}.panel.good{box-shadow:0 0 0 2px #1E55D1}.image{height:330px;display:flex;align-items:center;justify-content:center}.image svg,.image img{width:330px;max-width:100%;height:330px;object-fit:contain}.panel h2{font-size:19px;margin:16px 0 10px}.panel p{font-size:13px;line-height:1.8;color:#657589;margin:0}.notes{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;padding:29px 6px}.notes h3{font-size:16px;margin:0 0 8px}.notes p{font-size:13px;line-height:1.8;color:#657589;margin:0}.section-title{font-size:25px;margin:8px 0 18px}.states{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}.state{background:white;border-radius:18px;padding:10px 15px 20px}.art{height:180px;display:flex;align-items:center}.art svg{width:100%;height:auto}.state h3{font-size:17px;margin:4px 0}.state h3 span{font-size:12px;display:block;color:#657589;margin-top:8px;font-weight:400}.detail{font-size:12px;line-height:1.9;color:#657589;margin-top:27px}.actions{display:flex;gap:12px;margin-top:20px}a{color:#1844C9;text-decoration:none;font-size:13px}.actions a{border:1px solid #d5e0f0;background:white;padding:11px 16px;border-radius:10px}@media(max-width:900px){.states{grid-template-columns:repeat(3,1fr)}.compare{grid-template-columns:1fr}.notes{grid-template-columns:1fr}main{padding:32px 24px}h1{font-size:32px}}@media(max-width:520px){.states{grid-template-columns:repeat(2,1fr)}.image{height:300px}}' +
  '</style></head><body><main><div class="eyebrow">WHALE PET / V0.2 / REFERENCE-MATCHED</div><h1>保留原来的轮廓，也保留原来的立体感。</h1><p class="intro">按参考图重新提取外轮廓和尾鳍内孔，保留渐变、高光、暗边与玻璃珠眼睛。</p><section class="compare">' +
  '<article class="panel"><div class="image"><img src="data:image/png;base64,' +
  original +
  '" alt="用户提供的原图"></div><h2>01 · 你的原图</h2><p>宽厚的深蓝主体、渐细的尾根<br>青蓝喷水与明显的胶质高光</p></article>' +
  '<article class="panel"><div class="image">' +
  scoped(previous, 'before-') +
  '</div><h2>02 · 上一版</h2><p>线宽与弧度被过度简化<br>高光、暗边和阴影被去掉</p></article>' +
  '<article class="panel good"><div class="image">' +
  scoped(svgs.Idle, 'after-') +
  '</div><h2>03 · 本次修订</h2><p>从原图边界拟合可编辑轮廓<br>保留原图材质，恢复厚度与明暗</p></article></section>' +
  '<section class="notes"><div><h3>身体 · 不再用统一粗描边替代</h3><p>恢复头部宽弧、右侧垂直开口与平稳的腹部底线，保留内外边界之间的厚薄变化。</p></div><div><h3>尾巴 · 恢复真实的连接与内孔</h3><p>按原图保留尾根弧度、叶状上翘尾鳍和倾斜内孔，避免变成等宽圆环。</p></div><div><h3>质感 · 保留高光的方向和层次</h3><p>青色边缘高光、深蓝内侧暗边、玻璃珠眼睛与柔和投影共同恢复原图体积感。</p></div></section>' +
  '<h2 class="section-title">六种状态，共用校正后的身体轮廓。</h2><section class="states">' +
  cards +
  '</section>' +
  '<p class="detail">交付形式：可编辑的矢量轮廓 + 原图 PNG 材质填充，SVG 保持 body / tail / spout / eye / expression 分层。此版本并非纯矢量渐变重绘。<br>SVG 背景透明；投影为重建效果，与原图不保证逐像素相同。Figma 当前尚未同步本次修订。</p><div class="actions"><a href="whale-pet-idle.svg">查看修订 SVG ↗</a><a href="whale-pet-editable-contours.svg">查看独立矢量轮廓 ↗</a><a href="https://www.figma.com/design/aWj8wKmVFVCfLjJfddQwgf">打开现有 Figma ↗</a></div></main></body></html>';
fs.writeFileSync(path.join(out, 'comparison.html'), html);
const sheetCards = Object.keys(labels)
  .map((s, i) => {
    const art = scoped(svgs[s], 'sheet-' + s + '-').replace(
      'width="512" height="512"',
      'x="24" y="12" width="366" height="366"',
    );
    return (
      '<g transform="translate(' +
      (64 + (i % 3) * 444) +
      ' ' +
      (215 + Math.floor(i / 3) * 470) +
      ')"><rect width="416" height="440" rx="22" fill="white"/>' +
      art +
      '<text x="28" y="407" font-size="23" font-weight="700" fill="#172333">' +
      String(i + 1).padStart(2, '0') +
      ' / ' +
      s +
      ' · ' +
      labels[s] +
      '</text></g>'
    );
  })
  .join('');
const sheet =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1270" viewBox="0 0 1440 1270"><rect width="1440" height="1270" fill="#F1F5FB"/><g font-family="Arial,Microsoft YaHei,sans-serif"><text x="64" y="68" font-size="14" font-weight="700" letter-spacing="2" fill="#1844C9">WHALE PET / V0.2 / ORIGINAL GLOSS</text><text x="64" y="133" font-size="46" font-weight="700" fill="#172333">Same whale. Original character.</text><text x="64" y="179" font-size="20" fill="#63758A">按原图校正轮廓 · 保留立体材质 · 六种表情状态</text>' +
  sheetCards +
  '<text x="64" y="1210" font-size="16" fill="#63758A">可编辑矢量轮廓 + 原图材质填充；阴影重建。当前为本地修订稿，尚未同步 Figma。</text></g></svg>';
fs.writeFileSync(path.join(out, 'whale-pet-character-sheet.svg'), sheet);
(async () => {
  const browser = await chromium.launch(
    process.env.WHALE_PET_CHROME_PATH
      ? { executablePath: process.env.WHALE_PET_CHROME_PATH, headless: true }
      : { channel: 'chrome', headless: true },
  );
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    await page.goto(pathToFileURL(path.join(out, 'comparison.html')).href);
    await page.screenshot({ path: path.join(out, 'comparison.png'), fullPage: true });
    const metrics = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      viewport: innerWidth,
      states: document.querySelectorAll('.state').length,
    }));
    await page.setViewportSize({ width: 1440, height: 1270 });
    await page.setContent(
      '<html><head><style>html,body{margin:0}svg{display:block}</style></head><body>' +
        sheet +
        '</body></html>',
    );
    await page.screenshot({
      path: path.join(out, 'whale-pet-character-sheet.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 512, height: 512 });
    for (const state of Object.keys(labels)) {
      await page.setContent(
        '<html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>' +
          svgs[state] +
          '</body></html>',
      );
      await page.screenshot({
        path: path.join(out, 'whale-pet-' + state.toLowerCase() + '.png'),
        omitBackground: true,
      });
    }
    await page.setViewportSize({ width: 1254, height: 1254 });
    const silhouette = fs
      .readFileSync(path.join(out, 'whale-pet-editable-contours.svg'), 'utf8')
      .replace('width="512" height="512"', 'width="1254" height="1254"');
    await page.setContent(
      '<html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>' +
        silhouette +
        '</body></html>',
    );
    await page.screenshot({
      path: path.join(out, 'traced-contours-1254.png'),
      omitBackground: true,
    });
    console.log(JSON.stringify(metrics));
  } finally {
    await browser.close();
  }
})();
