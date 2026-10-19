const fs = require('fs');
const path = require('path');

const dir = process.env.LOCALAPPDATA + '/Google/Chrome/User Data/Default/Local Extension Settings/flclmdooeejicfjkkigfeenfedkolfda';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

const results = [];
const key = 'yoink_queue';

for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
        const str = fs.readFileSync(fullPath, 'utf8');
        let pos = 0;
        while (true) {
            const idx = str.indexOf(key, pos);
            if (idx === -1) break;
            pos = idx + key.length;

            const jsonStart = str.indexOf('{', idx);
            if (jsonStart !== -1 && jsonStart < idx + 100) {
                let depth = 0;
                let jsonEnd = -1;
                for (let i = jsonStart; i < Math.min(str.length, jsonStart + 8000); i++) {
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
                        results.push({
                            file,
                            savedAt: parsed.savedAt,
                            date: parsed.savedAt ? new Date(parsed.savedAt).toISOString() : 'none',
                            itemsCount: parsed.items?.length,
                            items: parsed.items?.map(it => ({
                                id: it.id,
                                context: it.context,
                                type: it.selectionType,
                                region: it.elementData?.region,
                                selector: it.elementData?.selector
                            }))
                        });
                    } catch(e) {}
                }
            }
        }
    } catch(e) {
        // file lock or error
    }
}

// Sort by savedAt
results.sort((a, b) => (a.savedAt || 0) - (b.savedAt || 0));

console.log('Total queue records found:', results.length);
results.slice(-8).forEach((r, i) => {
    console.log(`\n--- Record ${i + 1} (${r.file}, savedAt: ${r.date}) ---`);
    console.log(JSON.stringify(r, null, 2));
});
