const fs = require('fs');
const content = fs.readFileSync('work/index.html', 'utf8');
const start = content.indexOf('<div id="footer-section"');
console.log('Start index:', start);
if (start !== -1) {
    // Look at surrounding 1500 chars
    console.log(content.slice(start, start + 2500));
}
