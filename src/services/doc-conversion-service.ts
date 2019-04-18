import fs from 'fs';
import pdf from 'html-pdf';
import util from 'util';
import uuidv4 from 'uuid';
import { IDoc } from '../types';
import { getStringFromS3 } from '../utils/s3';
import { renderDoc } from './doc-render-service';

const pandoc = require('pandoc-aws-lambda-binary');

const BUCKET = process.env.BUCKET || '';
const writeFileAsync = util.promisify(fs.writeFile);

let cssCache: string = null;

export const getCss = async (): Promise<string> => {
    if (!cssCache) {
        const css = await getStringFromS3(BUCKET, 'document.css');
        cssCache = css;
    }

    return cssCache;
};

export const docToPdf = async (doc: IDoc): Promise<fs.ReadStream> => {
    const html = renderDoc(doc, await getCss());
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
    const html = renderDoc(doc, await getCss());
    const srcFileName = `${uuidv4()}.html`;
    const destFileName = `${uuidv4()}.docx`;

    await writeFileAsync(`/tmp/${srcFileName}`, html);
    await pandoc(`/tmp/${srcFileName}`, `/tmp/${destFileName}`);

    return fs.createReadStream(`/tmp/${destFileName}`);
};
