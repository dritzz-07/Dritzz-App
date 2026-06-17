const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx').concat(glob.sync('src/*.tsx'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/blue-400/g, 'zinc-300');
  content = content.replace(/blue-500/g, 'zinc-400');
  content = content.replace(/blue-600/g, 'zinc-500');
  content = content.replace(/emerald-400/g, 'zinc-300');
  content = content.replace(/emerald-500/g, 'zinc-400');
  content = content.replace(/emerald-600/g, 'zinc-500');
  content = content.replace(/purple-400/g, 'zinc-400');
  content = content.replace(/purple-500/g, 'zinc-500');
  content = content.replace(/teal-400/g, 'zinc-300');
  content = content.replace(/rose-500/g, 'zinc-400');
  content = content.replace(/amber-500/g, 'zinc-300');
  fs.writeFileSync(file, content);
});
