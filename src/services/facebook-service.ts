import fetch from 'node-fetch';
import { IFacebookAuthResponse } from '../types';
import { getFetchUrl } from '../utils/get-fetch-url';

const { FB_APP_ID, FB_APP_SECRET } = process.env;

const FB_ACCESS_TOKEN_URL =
    'https://graph.facebook.com/oauth/access_token';
const FB_INSPECT_TOKEN_URL = 'https://graph.facebook.com/debug_token';
const FB_USER_PROFILE_URL = 'https://graph.facebook.com/v3.2';

const authResponseCache: {
    [authToken: string]: IFacebookAuthResponse;
} = {};

const getUsername = async (
    userId: string,
    appAccessToken: string
): Promise<string> => {
    const params = {
        access_token: appAccessToken
    };

    try {
        const userProfileResponse = await fetch(
            getFetchUrl(`${FB_USER_PROFILE_URL}/${userId}`, params)
        );

        const userProfileDataResponse = await userProfileResponse.json();

        if (
            userProfileResponse.status >= 400 &&
            userProfileResponse.status < 600
        ) {
            throw new Error(
                JSON.stringify({
                    params,
                    userProfileDataResponse
                })
            );
        }
        return userProfileDataResponse.name;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const obtainAppToken = async () => {
    const params = {
        client_id: FB_APP_ID,
        client_secret: FB_APP_SECRET,
        grant_type: 'client_credentials'
    };

    try {
        const url = getFetchUrl(FB_ACCESS_TOKEN_URL, params);
        const response = await fetch(url);

        const responseData = await response.json();

        if (response.status >= 400 && response.status < 600) {
            throw new Error(
                JSON.stringify({
                    params,
                    responseData
                })
            );
        }

        return responseData.access_token;
    } catch (e) {
        console.error(e);
        throw e;
    }
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

    try {
        const url = getFetchUrl(FB_INSPECT_TOKEN_URL, params);
        const tokenResponse = await fetch(url);

        const tokenDataResponse = await tokenResponse.json();

        if (
            tokenDataResponse.status >= 400 &&
            tokenDataResponse.status < 600
        ) {
            throw new Error(
                JSON.stringify({
                    params,
                    tokenDataResponse
                })
            );
        }

        const id = tokenDataResponse.data.user_id;

        const name = await getUsername(
            tokenDataResponse.data.user_id,
            appAccessToken
        );

        const authResponse = {
            isValid: tokenDataResponse.data.is_valid,
            id,
            name,
            expiryDate: new Date(
                tokenDataResponse.data.expires_at * 1000
            )
        };

        authResponseCache[userAuthToken] = authResponse;
        return authResponse;
    } catch (e) {
        console.error(e);
        throw e;
    }
};
