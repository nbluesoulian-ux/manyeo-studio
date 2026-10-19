const fs = require('fs');

const file = process.env.LOCALAPPDATA + '/Google/Chrome/User Data/Default/Local Extension Settings/flclmdooeejicfjkkigfeenfedkolfda/000036.log';
const fd = fs.openSync(file, 'r');
const buf = Buffer.alloc(10 * 1024 * 1024);
const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
fs.closeSync(fd);

const str = buf.slice(0, bytesRead).toString('utf8');
const key = 'yoink_queue';

let lastIdx = str.lastIndexOf(key);
console.log('lastIdx:', lastIdx);

while (lastIdx !== -1) {
    const chunk = str.slice(lastIdx, lastIdx + 10000);
    const jsonStart = chunk.indexOf('{');
    if (jsonStart !== -1) {
        let depth = 0;
        let jsonEnd = -1;
        for (let i = jsonStart; i < chunk.length; i++) {
            if (chunk[i] === '{') depth++;
            else if (chunk[i] === '}') {
                depth--;
                if (depth === 0) {
                    jsonEnd = i + 1;
                    break;
                }
            }
        }
        if (jsonEnd !== -1) {
            try {
                const parsed = JSON.parse(chunk.slice(jsonStart, jsonEnd));
                fs.writeFileSync('new_yoink.json', JSON.stringify(parsed, null, 2), 'utf8');
                console.log('Successfully written new_yoink.json');
                break;
            } catch(e) {
                console.log('Parse error at', lastIdx, e.message);
            }
        }
    }
    lastIdx = str.lastIndexOf(key, lastIdx - 1);
}
