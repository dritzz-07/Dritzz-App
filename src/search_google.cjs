const https = require('https');
https.get('https://duckduckgo.com/html/?q=pexels+video+black+car+wash', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const matches = data.match(/https?:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/g);
        if (matches) {
            console.log(matches.filter(m => m.includes('pexels')).join('\n'));
        }
    });
});
