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
const node_fetch_1 = __importDefault(require("node-fetch"));
const get_fetch_url_1 = require("../utils/get-fetch-url");
const { FB_APP_ID, FB_APP_SECRET } = process.env;
const FB_ACCESS_TOKEN_URL = 'https://graph.facebook.com/oauth/access_token';
const FB_INSPECT_TOKEN_URL = 'https://graph.facebook.com/debug_token';
const FB_USER_PROFILE_URL = 'https://graph.facebook.com/v3.2';
const authResponseCache = {};
const getUsername = (userId, appAccessToken) => __awaiter(this, void 0, void 0, function* () {
    const params = {
        access_token: appAccessToken
    };
    try {
        const userProfileResponse = yield node_fetch_1.default(get_fetch_url_1.getFetchUrl(`${FB_USER_PROFILE_URL}/${userId}`, params));
        const userProfileDataResponse = yield userProfileResponse.json();
        if (userProfileResponse.status >= 400 &&
            userProfileResponse.status < 600) {
            throw new Error(JSON.stringify({
                params,
                userProfileDataResponse
            }));
        }
        return userProfileDataResponse.name;
    }
    catch (e) {
        console.error(e);
        throw e;
    }
});
exports.obtainAppToken = () => __awaiter(this, void 0, void 0, function* () {
    const params = {
        client_id: FB_APP_ID,
        client_secret: FB_APP_SECRET,
        grant_type: 'client_credentials'
    };
    try {
        const url = get_fetch_url_1.getFetchUrl(FB_ACCESS_TOKEN_URL, params);
        const response = yield node_fetch_1.default(url);
        const responseData = yield response.json();
        if (response.status >= 400 && response.status < 600) {
            throw new Error(JSON.stringify({
                params,
                responseData
            }));
        }
        return responseData.access_token;
    }
    catch (e) {
        console.error(e);
        throw e;
    }
});
exports.loginUser = (userAuthToken, appAccessToken) => __awaiter(this, void 0, void 0, function* () {
    const cachedAuthToken = authResponseCache[userAuthToken];
    if (cachedAuthToken) {
        console.log(`${cachedAuthToken.id} was validated through cache`);
        return Promise.resolve(cachedAuthToken);
    }
    const params = {
        input_token: userAuthToken,
        access_token: appAccessToken
    };
    try {
        const url = get_fetch_url_1.getFetchUrl(FB_INSPECT_TOKEN_URL, params);
        const tokenResponse = yield node_fetch_1.default(url);
        const tokenDataResponse = yield tokenResponse.json();
        if (tokenDataResponse.status >= 400 &&
            tokenDataResponse.status < 600) {
            throw new Error(JSON.stringify({
                params,
                tokenDataResponse
            }));
        }
        const id = tokenDataResponse.data.user_id;
        const name = yield getUsername(tokenDataResponse.data.user_id, appAccessToken);
        const authResponse = {
            isValid: tokenDataResponse.data.is_valid,
            id,
            name,
            expiryDate: new Date(tokenDataResponse.data.expires_at * 1000)
        };
        authResponseCache[userAuthToken] = authResponse;
        return authResponse;
    }
    catch (e) {
        console.error(e);
        throw e;
    }
});
//# sourceMappingURL=facebook-service.js.map