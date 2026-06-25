const fs = require('fs');
const file = 'public/logo.svg';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/fill="#[A-Fa-f0-9]+"/g, 'fill="#000000"');
fs.writeFileSync(file, content);
console.log('Done SVG replace');
