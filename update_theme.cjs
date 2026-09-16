const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-\\[#111111\\]': 'bg-white dark:bg-[#111111]',
  'bg-\\[#030303\\]': 'bg-zinc-50 dark:bg-[#030303]',
  'bg-\\[#050505\\]': 'bg-zinc-100 dark:bg-[#050505]',
  'bg-\\[#080808\\]': 'bg-white dark:bg-[#080808]',
  'text-zinc-100': 'text-zinc-900 dark:text-zinc-100',
  'text-zinc-200': 'text-zinc-800 dark:text-zinc-200',
  'text-zinc-300': 'text-zinc-700 dark:text-zinc-300',
  'text-zinc-400': 'text-zinc-600 dark:text-zinc-400',
  'bg-zinc-900': 'bg-zinc-100 dark:bg-zinc-900',
  'bg-zinc-950': 'bg-zinc-50 dark:bg-zinc-950',
  'border-zinc-800': 'border-zinc-200 dark:border-zinc-800',
  'border-zinc-900': 'border-zinc-300 dark:border-zinc-900'
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
    // Only replace if it doesn't already have dark: prefix next to it
    // A simple global replace using regex to avoid double-replacing
    const regex = new RegExp(`(?<!dark:)${find.replace(/\[/g, '\\[').replace(/\]/g, '\\]')}`, 'g');
    content = content.replace(regex, replace);
  }
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Replaced themes in ' + files.length + ' files');
