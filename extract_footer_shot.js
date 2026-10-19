const fs = require('fs');

const file = process.env.LOCALAPPDATA + '/Google/Chrome/User Data/Default/Local Extension Settings/flclmdooeejicfjkkigfeenfedkolfda/000036.log';
const fd = fs.openSync(file, 'r');
const buf = Buffer.alloc(10 * 1024 * 1024);
const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
fs.closeSync(fd);

const str = buf.slice(0, bytesRead).toString('utf8');
const target = 'works에 이 푸터 부분 필요 없으니 지워줘';
const idx = str.indexOf(target);
console.log('Target index:', idx);

if (idx !== -1) {
    const shotKey = '"screenshot":"';
    const shotStart = str.indexOf(shotKey, idx);
    if (shotStart !== -1) {
        const startPos = shotStart + shotKey.length;
        const shotEnd = str.indexOf('"', startPos);
        const b64 = str.substring(startPos, shotEnd);
        fs.writeFileSync('footer_screenshot.png', Buffer.from(b64, 'base64'));
        console.log('Saved footer_screenshot.png, size:', b64.length);
    }
}
