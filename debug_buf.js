const fs = require('fs');

const file = process.env.LOCALAPPDATA + '/Google/Chrome/User Data/Default/Local Extension Settings/flclmdooeejicfjkkigfeenfedkolfda/000036.log';
const fd = fs.openSync(file, 'r');
const buf = Buffer.alloc(10 * 1024 * 1024);
const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
fs.closeSync(fd);

const key = 'yoink_queue';
const idx = buf.lastIndexOf(Buffer.from(key));
console.log('last index of Buffer yoink_queue:', idx);

if (idx !== -1) {
    const slice = buf.slice(idx, idx + 1500);
    console.log('HEX preview:', slice.slice(0, 50).toString('hex'));
    console.log('UTF-8 preview:', slice.toString('utf8').slice(0, 500));
}
