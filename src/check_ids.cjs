const https = require('https');
https.get('https://images.unsplash.com/photo-1544829099-b9a0c07fad1a', res => console.log('1', res.statusCode));
https.get('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2', res => console.log('2', res.statusCode));
https.get('https://images.unsplash.com/photo-1621528641951-31cf9bd084ae', res => console.log('3', res.statusCode));
https.get('https://images.unsplash.com/photo-1601362840469-51e4d8d58785', res => console.log('4', res.statusCode));
