const https = require('https');

https.get('https://api.pexels.com/videos/search?query=black+car+wash&per_page=15', {
  headers: {
    'Authorization': '563492ad6f917000010000012ced1b8dbcb644fcb7f6fa2bf79a9ccb'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.videos && json.videos.length > 0) {
        // Find a suitable file
        const video = json.videos[0];
        const file = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];
        console.log(file.link);
      } else {
        console.log("No videos found.");
        console.log(data);
      }
    } catch(e) {
      console.log("Error:", e.message);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
