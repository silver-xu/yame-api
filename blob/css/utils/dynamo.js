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
const dynamoDb = new aws_sdk_1.default.DynamoDB.DocumentClient({
    region: 'ap-southeast-2'
});
const DOC_PERMALINKS_TABLE = process.env.DOC_PERMALINKS_TABLE || '';
const USER_PROFILE_TABLE = process.env.USER_PROFILE_TABLE || '';
exports.putObjectToDynamo = (object, tableName) => __awaiter(this, void 0, void 0, function* () {
    const dynamoParams = {
        TableName: tableName,
        Item: object
    };
    return dynamoDb.put(dynamoParams).promise();
});
exports.updateDocPermalink = (docPermalink) => __awaiter(this, void 0, void 0, function* () {
    yield exports.putObjectToDynamo(docPermalink, DOC_PERMALINKS_TABLE);
});
exports.getDocPermalink = (id) => __awaiter(this, void 0, void 0, function* () {
    const dynamoParams = {
        TableName: DOC_PERMALINKS_TABLE,
        ProjectionExpression: 'id, userId, permalink',
        KeyConditionExpression: 'id = :did',
        ExpressionAttributeValues: {
            ':did': id
        }
    };
    const result = yield dynamoDb.query(dynamoParams).promise();
    const item = result.Items.length > 0 ? result.Items[0] : null;
    return item;
});
exports.createDocPermalinkIfNotExists = (docPermalink) => __awaiter(this, void 0, void 0, function* () {
    if (!(yield exports.getDocPermalink(docPermalink.id))) {
        yield exports.updateDocPermalink(docPermalink);
    }
});
exports.getDocPermalinkByPermalink = (userId, permalink) => __awaiter(this, void 0, void 0, function* () {
    const dynamoParams = {
        TableName: DOC_PERMALINKS_TABLE,
        IndexName: 'userIdPermalinkIndex',
        ProjectionExpression: 'id, userId, permalink',
        KeyConditionExpression: 'userId = :uid and permalink = :plink',
        ExpressionAttributeValues: {
            ':uid': userId,
            ':plink': permalink
        }
    };
    const result = yield dynamoDb.query(dynamoParams).promise();
    return (result.Items &&
        result.Items.length > 0 &&
        result.Items[0]);
});
exports.getUserProfileByName = (name) => __awaiter(this, void 0, void 0, function* () {
    const dynamoParams = {
        TableName: USER_PROFILE_TABLE,
        IndexName: 'nameIndex',
        ProjectionExpression: 'id, username, userType',
        KeyConditionExpression: 'username = :uname',
        ExpressionAttributeValues: {
            ':uname': name
        }
    };
    const result = yield dynamoDb.query(dynamoParams).promise();
    const item = result.Items.length > 0 ? result.Items[0] : null;
    return item;
});
exports.getUserProfileById = (id) => __awaiter(this, void 0, void 0, function* () {
    const dynamoParams = {
        TableName: USER_PROFILE_TABLE,
        ProjectionExpression: 'id, username, userType',
        KeyConditionExpression: 'id = :uid',
        ExpressionAttributeValues: {
            ':uid': id
        }
    };
    const result = yield dynamoDb.query(dynamoParams).promise();
    const item = result.Items.length > 0 ? result.Items[0] : null;
    return item;
});
exports.registerUserProfile = (userProfile) => __awaiter(this, void 0, void 0, function* () {
    try {
        const existingUserProfile = yield exports.getUserProfileById(userProfile.id);
        if (!existingUserProfile) {
            yield exports.putObjectToDynamo(userProfile, USER_PROFILE_TABLE);
        }
    }
    catch (err) {
        console.error(err);
    }
});
//# sourceMappingURL=dynamo.js.map