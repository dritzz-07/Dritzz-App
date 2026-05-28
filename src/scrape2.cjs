const https = require('https');

const options = {
  hostname: 'unsplash.com',
  path: '/s/photos/car-foam-wash',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Match URLs like https://images.unsplash.com/photo-xxxxx
    const matches = data.match(/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+/g);
    if(matches) {
       console.log(Array.from(new Set(matches)).slice(0, 15));
    } else {
       console.log('no match');
    }
  });
});
req.end();
