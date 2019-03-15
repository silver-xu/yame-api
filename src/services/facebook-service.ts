import fetch from 'node-fetch';
import { IFacebookAuthResponse } from '../types';
import { getFetchUrl } from '../utils/get-fetch-url';

const APP_ID = '566204683881459';
const APP_SECRET = '2dc8e362f8a9025f82008b1ea495c24c';

const FB_ACCESS_TOKEN_URL =
    'https://graph.facebook.com/oauth/access_token';
const FB_INSPECT_TOKEN_URL = 'https://graph.facebook.com/debug_token';
const FB_USER_PROFILE_URL = 'https://graph.facebook.com/v3.2';

const authResponseCache: {
    [authToken: string]: IFacebookAuthResponse;
} = {};

export const obtainAppToken = async () => {
    const params = {
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: 'client_credentials'
    };

    const response = await fetch(
        getFetchUrl(FB_ACCESS_TOKEN_URL, params)
    );
    const responseData = await response.json();

    return responseData.access_token;
};

export const loginUser = async (
    userAuthToken: string,
    appAccessToken: string
): Promise<IFacebookAuthResponse> => {
    const cachedAuthToken = authResponseCache[userAuthToken];

    if (cachedAuthToken) {
        console.log(
            `${cachedAuthToken.id} was validated through cache`
        );
        return Promise.resolve(cachedAuthToken);
    }

    const params = {
        input_token: userAuthToken,
        access_token: appAccessToken
    };

    const tokenResponse = await fetch(
        getFetchUrl(FB_INSPECT_TOKEN_URL, params)
    );
    const tokenDataResponse = await tokenResponse.json();

    const id = tokenDataResponse.data.user_id;
    const name = await getUsername(
        tokenDataResponse.data.user_id,
        appAccessToken
    );

    const authResponse = {
        isValid: tokenDataResponse.data.is_valid,
        id,
        name,
        expiryDate: new Date(tokenDataResponse.data.expires_at * 1000)
    };

    authResponseCache[userAuthToken] = authResponse;
    return authResponse;
};

export const getUsername = async (
    userId: string,
    appAccessToken: string
): Promise<string> => {
    const params = {
        access_token: appAccessToken
    };

    const userProfileResponse = await fetch(
        getFetchUrl(`${FB_USER_PROFILE_URL}/${userId}`, params)
    );

    const userProfileDataResponse = await userProfileResponse.json();
    return userProfileDataResponse.name;
};
