import https from 'https';

const options = {
  hostname: 'unsplash.com',
  path: '/s/photos/pressure-washer',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/photo-[a-zA-Z0-9\-]+/g);
    if(matches) {
       console.log(Array.from(new Set(matches)).slice(0, 10));
    } else {
       console.log('no match');
    }
  });
});
req.end();
