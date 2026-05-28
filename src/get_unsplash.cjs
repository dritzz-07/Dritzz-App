const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://unsplash.com/s/photos/black-car-wash', { waitUntil: 'networkidle2' });
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img[src*="images.unsplash.com/photo-"]'))
      .map(img => img.src)
      .filter(src => src.includes('photo-'))
      .slice(0, 10);
  });
  console.log(JSON.stringify(images, null, 2));
  await browser.close();
})();
