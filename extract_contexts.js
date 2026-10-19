const fs = require('fs');

const file = process.env.LOCALAPPDATA + '/Google/Chrome/User Data/Default/Local Extension Settings/flclmdooeejicfjkkigfeenfedkolfda/000036.log';
const fd = fs.openSync(file, 'r');
const buf = Buffer.alloc(10 * 1024 * 1024);
const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
fs.closeSync(fd);

const str = buf.slice(0, bytesRead).toString('utf8');

// Match all contexts
const matches = [...str.matchAll(/"context"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g)];
console.log('Total context matches:', matches.length);
matches.forEach((m, idx) => {
    console.log(`[${idx}]`, m[1]);
});
