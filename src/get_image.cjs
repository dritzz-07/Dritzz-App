const https = require('https');
https.get('https://lexica.art/api/v1/search?q=car+pressure+washer+foam+dark+aesthetic', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        console.log(json.images.slice(0, 3).map(img => img.src).join('\n'));
    } catch(e) { console.log(e) }
  });
});
