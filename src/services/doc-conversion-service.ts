import fs from 'fs';
import pdf from 'html-pdf';
import stream = require('stream');
import util from 'util';
import uuidv4 from 'uuid';
import { IDoc } from '../types';
import { renderDoc } from './doc-render-service';

const pandoc = require('pandoc-aws-lambda-binary');

const css = fs.readFileSync('./css/document.css', 'utf-8');
const writeFileAsync = util.promisify(fs.writeFile);

export const docToPdf = (doc: IDoc): Promise<fs.ReadStream> => {
    const html = renderDoc(doc, css);
    return new Promise((resolve, reject) => {
        pdf.create(html, {
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
            } else {
                return resolve(result);
            }
        });
    });
};

export const docToWord = async (
    doc: IDoc
): Promise<fs.ReadStream> => {
    const html = renderDoc(doc, css);
    const srcFileName = `${uuidv4()}.html`;
    const destFileName = `${uuidv4()}.docx`;

    await writeFileAsync(`/tmp/${srcFileName}`, html);
    await pandoc(`/tmp/${srcFileName}`, `/tmp/${destFileName}`);

    return fs.createReadStream(`/tmp/${destFileName}`);
};
