"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const { gzip, ungzip } = require('node-gzip');
const promisify = require("promisify-node");
const doc = {
    id: 'd61af891-13c8-4eeb-b767-d5d7425b59d2',
    docName: 'Sample MD',
    content: '# Welcome to Markdown Editing.\r\n\r\n This content is created by [Yame Editor](https://yame.io). Please replace "it" with yours.',
    lastModified: '2019-02-21T00:00:00Z'
};
const defaultDoc = {
    namePrefix: 'Default Doc',
    defaultContent: '# Welcome to Markdown Editing.\r\n\r\n This content is created by [Yame Editor](https://yame.io). \r\nPlease replace it with yours.'
};
const meta = {
    currentDocId: 'd61af891-13c8-4eeb-b767-d5d7425b59d2'
};
(() => __awaiter(this, void 0, void 0, function* () {
    const fsWriteFile = promisify(fs_1.default.writeFile);
    const docBody = JSON.stringify(doc);
    const defaultDocBody = JSON.stringify(defaultDoc);
    const metaBody = JSON.stringify(meta);
    yield fsWriteFile(`${doc.id}.json`, docBody);
    yield fsWriteFile('default.json', defaultDocBody);
    yield fsWriteFile('meta.json', metaBody);
}))();
//# sourceMappingURL=create-sample.js.map