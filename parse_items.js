const fs = require('fs');

const file = process.env.LOCALAPPDATA + '/Google/Chrome/User Data/Default/Local Extension Settings/flclmdooeejicfjkkigfeenfedkolfda/000036.log';
const fd = fs.openSync(file, 'r');
const buf = Buffer.alloc(10 * 1024 * 1024);
const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
fs.closeSync(fd);

const str = buf.slice(0, bytesRead).toString('utf8');
const key = 'yoink_queue';

let pos = 0;
while (true) {
    const idx = str.indexOf(key, pos);
    if (idx === -1) break;
    pos = idx + key.length;

    const jsonStart = str.indexOf('{', idx);
    if (jsonStart !== -1 && jsonStart < idx + 20) {
        let depth = 0;
        let jsonEnd = -1;
        for (let i = jsonStart; i < str.length; i++) {
            if (str[i] === '{') depth++;
            else if (str[i] === '}') {
                depth--;
                if (depth === 0) {
                    jsonEnd = i + 1;
                    break;
                }
            }
        }
        if (jsonEnd !== -1) {
            try {
                const parsed = JSON.parse(str.slice(jsonStart, jsonEnd));
                console.log('SavedAt:', parsed.savedAt, 'Items:', parsed.items?.length);
                parsed.items?.forEach(it => {
                    console.log('  - Context:', it.context);
                    console.log('    Type:', it.selectionType, 'Region:', it.elementData?.region);
                    console.log('    Selector:', it.elementData?.selector);
                });
            } catch(e) {
                console.log('Error parsing JSON:', e.message);
            }
        }
    }
}
