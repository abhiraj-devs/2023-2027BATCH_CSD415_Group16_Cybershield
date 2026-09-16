const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-zinc-800': 'bg-zinc-200 dark:bg-zinc-800',
  'hover:bg-zinc-800': 'hover:bg-zinc-200 dark:hover:bg-zinc-800',
  'border-zinc-700': 'border-zinc-300 dark:border-zinc-700'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  for (const [find, replace] of Object.entries(replacements)) {
    const regex = new RegExp(`(?<!dark:)${find}`, 'g');
    content = content.replace(regex, replace);
  }
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Replaced themes in ' + files.length + ' files again');
