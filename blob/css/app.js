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
const apollo_server_express_1 = require("apollo-server-express");
const body_parser_1 = __importDefault(require("body-parser"));
const cors = require("cors");
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const html_pdf_1 = __importDefault(require("html-pdf"));
const util_1 = __importDefault(require("util"));
const uuid_1 = __importDefault(require("uuid"));
const resolvers_1 = require("./data/resolvers");
const schema_1 = __importDefault(require("./data/schema"));
const doc_render_service_1 = require("./services/doc-render-service");
const doc_service_1 = require("./services/doc-service");
const facebook_service_1 = require("./services/facebook-service");
const types_1 = require("./types");
const dynamo_1 = require("./utils/dynamo");
const string_1 = require("./utils/string");
const doc_conversion_service_1 = require("./services/doc-conversion-service");
const pandoc = require('pandoc-aws-lambda-binary');
exports.createApp = () => __awaiter(this, void 0, void 0, function* () {
    const app = express_1.default();
    app.use(cors());
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.static('public'));
    const readFileAsync = util_1.default.promisify(fs_1.default.readFile);
    const writeFileAsync = util_1.default.promisify(fs_1.default.writeFile);
    const fbAppAccessToken = yield facebook_service_1.obtainAppToken();
    const server = new apollo_server_express_1.ApolloServer({
        schema: schema_1.default,
        resolvers: resolvers_1.resolvers,
        context: ({ req }) => __awaiter(this, void 0, void 0, function* () {
            const token = req.headers.authorization;
            if (token) {
                if (token.startsWith('fb-')) {
                    const authToken = token.substring(3);
                    const facebookAuthResponse = yield facebook_service_1.loginUser(authToken, fbAppAccessToken);
                    const facebookUser = {
                        id: facebookAuthResponse.id,
                        userType: types_1.UserType.Facebook,
                        authToken,
                        name: string_1.normalizeStrForUrl(facebookAuthResponse.name)
                    };
                    yield dynamo_1.registerUserProfile({
                        id: facebookUser.id,
                        username: facebookUser.name,
                        userType: types_1.UserType.Facebook
                    });
                    return { user: facebookUser };
                }
                else {
                    yield dynamo_1.registerUserProfile({
                        id: token,
                        username: token,
                        userType: types_1.UserType.Anonymous
                    });
                    const anonymousUser = {
                        id: token,
                        userType: types_1.UserType.Anonymous,
                        authToken: token
                    };
                    return { user: anonymousUser };
                }
            }
        })
    });
    app.get('/ping', (req, res) => res.send('pong'));
    app.get('/parse/:userId/:docId', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { userId, docId } = req.params;
        const doc = yield doc_service_1.getDocForUser(userId, docId);
        const html = doc_render_service_1.renderDoc(doc, yield doc_conversion_service_1.getCss());
        res.send(html);
    }));
    app.get('/convert/pdf/:userId/:docId', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { userId, docId } = req.params;
        const doc = yield doc_service_1.getDocForUser(userId, docId);
        const html = doc_render_service_1.renderDoc(doc, yield doc_conversion_service_1.getCss());
        res.setHeader('Content-type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${doc.docName}.pdf"`);
        html_pdf_1.default.create(html, {
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
    }));
    app.get('/convert/word/:userId/:docId', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { userId, docId } = req.params;
        const doc = yield doc_service_1.getDocForUser(userId, docId);
        const html = doc_render_service_1.renderDoc(doc, yield doc_conversion_service_1.getCss());
        const srcFileName = `${uuid_1.default()}.html`;
        const destFileName = `${uuid_1.default()}.docx`;
        yield writeFileAsync(`/tmp/${srcFileName}`, html);
        yield pandoc(`/tmp/${srcFileName}`, `/tmp/${destFileName}`);
        res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${doc.docName}.docx"`);
        fs_1.default.createReadStream(`/tmp/${destFileName}`).pipe(res);
    }));
    app.get('/download/pdf/:userId/:docId', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { userId, docId } = req.params;
        const doc = yield doc_service_1.getPublishedDocByIds(userId, docId);
        if (doc.generatePdf) {
            res.setHeader('Content-type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${doc.docName}.pdf"`);
            res.setHeader('isBase64Encoded', 'true');
            doc_service_1.downloadPdfAsStream(userId, docId).pipe(res);
        }
        else {
            res.sendStatus(401);
        }
    }));
    app.get('/download/word/:userId/:docId', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { userId, docId } = req.params;
        const doc = yield doc_service_1.getPublishedDocByIds(userId, docId);
        if (doc.generatePdf) {
            res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${doc.docName}.docx"`);
            doc_service_1.downloadWordAsStream(userId, docId).pipe(res);
        }
        else {
            res.sendStatus(401);
        }
    }));
    server.applyMiddleware({ app });
    return app;
});
//# sourceMappingURL=app.js.map