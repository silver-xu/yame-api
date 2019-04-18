"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const awsServerlessExpress = __importStar(require("aws-serverless-express"));
const app_1 = require("./app");
process.env.FONTCONFIG_PATH = '/var/task/fonts';
exports.handler = (event, context) => __awaiter(this, void 0, void 0, function* () {
    try {
        const app = yield app_1.createApp();
        const binaryMimeTypes = [
            'application/octet-stream',
            'font/eot',
            'font/opentype',
            'font/otf',
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);
        const proxy = awsServerlessExpress.proxy(server, event, context);
        return new Promise(() => proxy);
    }
    catch (err) {
        return new Promise(() => {
            throw err;
        });
    }
});
//# sourceMappingURL=handler.js.map