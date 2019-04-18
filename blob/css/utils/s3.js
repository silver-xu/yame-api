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
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3 = new aws_sdk_1.default.S3();
exports.getStringFromS3 = (bucket, key) => __awaiter(this, void 0, void 0, function* () {
    const response = yield s3
        .getObject({
        Bucket: bucket,
        Key: key
    })
        .promise();
    return response.Body.toString('utf-8');
});
exports.getObjectFromS3 = (bucket, key) => __awaiter(this, void 0, void 0, function* () {
    const response = yield s3
        .getObject({
        Bucket: bucket,
        Key: key
    })
        .promise();
    const stringifiedData = response.Body.toString('utf-8');
    return JSON.parse(stringifiedData);
});
exports.listKeysFromS3 = (bucket, prefix) => __awaiter(this, void 0, void 0, function* () {
    const response = yield s3
        .listObjectsV2({
        Bucket: bucket,
        Prefix: prefix
    })
        .promise();
    return response.Contents.filter(content => !content.Key.endsWith('/')).map(content => content.Key);
});
exports.putObjectToS3 = (bucket, key, obj) => {
    const body = JSON.stringify(obj);
    return s3
        .putObject({
        Bucket: bucket,
        Key: key,
        Body: body
    })
        .promise();
};
exports.putStreamToS3 = (bucket, key, body) => {
    return s3
        .upload({
        Bucket: bucket,
        Key: key,
        Body: body
    })
        .promise();
};
exports.deleteObjectFromS3 = (bucket, key) => {
    return s3
        .deleteObject({
        Bucket: bucket,
        Key: key
    })
        .promise();
};
exports.downloadStreamFromS3 = (bucket, key) => {
    return s3
        .getObject({ Bucket: bucket, Key: key })
        .createReadStream();
};
//# sourceMappingURL=s3.js.map