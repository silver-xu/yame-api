import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import cors = require('cors');
import express from 'express';
import fs from 'fs';
import pdf from 'html-pdf';
import util from 'util';
import uuidv4 from 'uuid';
import { resolvers } from './data/resolvers';
import schema from './data/schema';
import { renderDoc } from './services/doc-render-service';
import {
    downloadPdfAsStream,
    downloadWordAsStream,
    getDocForUser
} from './services/doc-service';
import {
    loginUser,
    obtainAppToken
} from './services/facebook-service';
import { UserType } from './types';
import { registerUserProfile } from './utils/dynamo';
import { downloadStreamFromS3 } from './utils/s3';
import { normalizeStrForUrl } from './utils/string';

const pandoc = require('pandoc-aws-lambda-binary');

export const createApp = async () => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));

    const readFileAsync = util.promisify(fs.readFile);
    const writeFileAsync = util.promisify(fs.writeFile);
    const css = await readFileAsync('./css/document.css', 'utf-8');

    const fbAppAccessToken = await obtainAppToken();

    const server = new ApolloServer({
        schema,
        resolvers,
        context: async ({ req }) => {
            const token = req.headers.authorization;
            if (token) {
                if (token.startsWith('fb-')) {
                    const authToken = token.substring(3);

                    const facebookAuthResponse = await loginUser(
                        authToken,
                        fbAppAccessToken
                    );

                    const facebookUser = {
                        id: facebookAuthResponse.id,
                        userType: UserType.Facebook,
                        authToken,
                        name: normalizeStrForUrl(
                            facebookAuthResponse.name
                        )
                    };

                    await registerUserProfile({
                        id: facebookUser.id,
                        username: facebookUser.name,
                        userType: UserType.Facebook
                    });

                    return { user: facebookUser };
                } else {
                    await registerUserProfile({
                        id: token,
                        username: token,
                        userType: UserType.Anonymous
                    });

                    const anonymousUser = {
                        id: token,
                        userType: UserType.Anonymous,
                        authToken: token
                    };
                    return { user: anonymousUser };
                }
            }
        }
    });

    app.get('/ping', (req, res) => res.send('pong'));

    app.get('/parse/:userId/:docId', async (req, res) => {
        const { userId, docId } = req.params;
        const doc = await getDocForUser(userId, docId);

        const html = renderDoc(doc, css);
        res.send(html);
    });

    app.get('/convert/pdf/:userId/:docId', async (req, res) => {
        const { userId, docId } = req.params;
        const doc = await getDocForUser(userId, docId);

        const html = renderDoc(doc, css);
        res.setHeader('Content-type', 'application/pdf');

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${doc.docName}.pdf"`
        );
        pdf.create(html, {
            format: 'A4',
            border: '20px',
            footer: {
                height: '20px',
                contents: `<span class="footer">${doc.docName}
                }</span>`
            }
        }).toStream((err, stream) => {
            if (err) {
                console.error(err);
            }
            stream.pipe(res);
        });
    });

    app.get('/convert/word/:userId/:docId', async (req, res) => {
        const { userId, docId } = req.params;
        const doc = await getDocForUser(userId, docId);

        const html = renderDoc(doc, css);
        const srcFileName = `${uuidv4()}.html`;
        const destFileName = `${uuidv4()}.docx`;

        await writeFileAsync(`/tmp/${srcFileName}`, html);
        await pandoc(`/tmp/${srcFileName}`, `/tmp/${destFileName}`);

        res.setHeader(
            'Content-type',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${doc.docName}.docx"`
        );

        fs.createReadStream(`/tmp/${destFileName}`).pipe(res);
    });

    app.get('/download/pdf/:userId/:docId', async (req, res) => {
        const { userId, docId } = req.params;
        const doc = await getDocForUser(userId, docId);
        if (doc.generatePdf) {
            res.setHeader('Content-type', 'application/pdf');

            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${doc.docName}.pdf"`
            );
            downloadPdfAsStream(userId, docId).pipe(res);
        } else {
            res.sendStatus(401);
        }
    });

    app.get('/download/word/:userId/:docId', async (req, res) => {
        const { userId, docId } = req.params;
        const doc = await getDocForUser(userId, docId);
        if (doc.generatePdf) {
            res.setHeader(
                'Content-type',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            );

            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${doc.docName}.docx"`
            );
            downloadWordAsStream(userId, docId).pipe(res);
        } else {
            res.sendStatus(401);
        }
    });

    server.applyMiddleware({ app });

    return app;
};
