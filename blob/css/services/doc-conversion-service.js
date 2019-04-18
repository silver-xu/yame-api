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
const html_pdf_1 = __importDefault(require("html-pdf"));
const util_1 = __importDefault(require("util"));
const uuid_1 = __importDefault(require("uuid"));
const s3_1 = require("../utils/s3");
const doc_render_service_1 = require("./doc-render-service");
const pandoc = require('pandoc-aws-lambda-binary');
const BUCKET = process.env.BUCKET || '';
const writeFileAsync = util_1.default.promisify(fs_1.default.writeFile);
let cssCache = null;
exports.getCss = () => __awaiter(this, void 0, void 0, function* () {
    if (!cssCache) {
        const css = yield s3_1.getStringFromS3(BUCKET, 'document.css');
        cssCache = css;
    }
    return cssCache;
});
exports.docToPdf = (doc) => __awaiter(this, void 0, void 0, function* () {
    const html = doc_render_service_1.renderDoc(doc, yield exports.getCss());
    return new Promise((resolve, reject) => {
        html_pdf_1.default.create(html, {
            format: 'A4',
            border: '20px',
            footer: {
                height: '20px',
                contents: `<span class="footer">${doc.docName}
        }</span>`
            }
        }).toStream((err, result) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(result);
            }
        });
    });
});
exports.docToWord = (doc) => __awaiter(this, void 0, void 0, function* () {
    const html = doc_render_service_1.renderDoc(doc, yield exports.getCss());
    const srcFileName = `${uuid_1.default()}.html`;
    const destFileName = `${uuid_1.default()}.docx`;
    yield writeFileAsync(`/tmp/${srcFileName}`, html);
    yield pandoc(`/tmp/${srcFileName}`, `/tmp/${destFileName}`);
    return fs_1.default.createReadStream(`/tmp/${destFileName}`);
});
//# sourceMappingURL=doc-conversion-service.js.map