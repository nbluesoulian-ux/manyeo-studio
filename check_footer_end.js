const fs = require('fs');
const content = fs.readFileSync('work/index.html', 'utf8');
const start = content.indexOf('<div id="footer-section"');
const end = content.indexOf('<div id="scroll-nav-section"');
console.log('footer-section to scroll-nav-section:');
console.log(content.slice(start, end));
console.log('--- After scroll-nav-section ---');
console.log(content.slice(end, end + 1000));
