// Renders every cards/*.html to png/<name>.png. Size comes from a "card-size: WxH" comment, default 1080x1080.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
(async () => {
  const dir = path.join(__dirname, 'cards'), out = path.join(__dirname, 'png');
  fs.mkdirSync(out, { recursive: true });
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.html')) : [];
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const f of files) {
    const src = path.join(dir, f);
    const m = fs.readFileSync(src, 'utf8').match(/card-size:\s*(\d+)x(\d+)/);
    const width = m ? +m[1] : 1080, height = m ? +m[2] : 1080;
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto('file://' + src, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(out, f.replace(/\.html$/, '.png')) });
    await page.close();
    console.log('rendered', f, width + 'x' + height);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
