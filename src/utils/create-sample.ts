import fs from 'fs';
const { gzip, ungzip } = require('node-gzip');
import promisify = require('promisify-node');
const doc = {
    id: 'd61af891-13c8-4eeb-b767-d5d7425b59d2',
    docName: 'Sample MD',
    content:
        '# Welcome to Markdown Editing.\r\n\r\n This content is created by [Yame Editor](https://yame.io). Please replace "it" with yours.',
    lastModified: '2019-02-21T00:00:00Z'
};

const defaultDoc = {
    namePrefix: 'Default Doc',
    defaultContent:
        '# Welcome to Markdown Editing.\r\n\r\n This content is created by [Yame Editor](https://yame.io). \r\nPlease replace it with yours.'
};

const meta = {
    currentDocId: 'd61af891-13c8-4eeb-b767-d5d7425b59d2'
};

(async () => {
    const fsWriteFile = promisify(fs.writeFile);
    const docBody = JSON.stringify(doc);
    const defaultDocBody = JSON.stringify(defaultDoc);
    const metaBody = JSON.stringify(meta);

    await fsWriteFile(`${doc.id}.json`, docBody);
    await fsWriteFile('default.json', defaultDocBody);
    await fsWriteFile('meta.json', metaBody);
})();
