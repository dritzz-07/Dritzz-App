const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx').concat(glob.sync('src/*.tsx'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from-blue/g, 'from-zinc');
  content = content.replace(/bg-blue/g, 'bg-zinc');
  content = content.replace(/text-blue/g, 'text-zinc');
  content = content.replace(/border-blue/g, 'border-zinc');
  content = content.replace(/\bblue\b/g, 'zinc');
  fs.writeFileSync(file, content);
});
