import { IFacebookAuthResponse } from '../types';
import { getFetchUrl } from '../utils/get-fetch-url';

const APP_ID = '330164834292470';
const APP_SECRET = '42949536913299795249c3404d0e1c5a';
const FB_ACCESS_TOKEN_URL = 'https://graph.facebook.com/oauth/access_token';
const FB_INSPECT_TOKEN_URL = 'https://graph.facebook.com/debug_token';
const FB_GRAPHAPI_URL =
    'https://graph.facebook.com/v3.2//?access_token=EAAEsSH2qUvYBAFBNQrWcTyhngiWYtIvJbvdTMgx5PwL8LJl01gfbrSoN6ZCPWElU4soRwZA3EeT3Di1PqXCc0PGQRsyFwpLt9puTEm0WRicTmcM4hvy103VpwPnNOwZAqeTQ7Tpu5ZCOgGgcVpNiTZATTyaPtYVwtalrCWmSgsZBzoC06QEsDXPsg9QOzj3E0ZD"';

const obtainAppToken = async () => {
    const params = {
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: 'client_credentials'
    };

    const response = await fetch(getFetchUrl(FB_ACCESS_TOKEN_URL, params));
    const responseData = JSON.parse(await response.json());

    return responseData.access_token;
};

const getUserFromAuthtoken = async (
    authToken: string,
    appToken: string
): Promise<IFacebookAuthResponse> => {
    const params = {
        input_token: authToken,
        access_token: appToken
    };

    const tokenResponse = await fetch(
        getFetchUrl(FB_INSPECT_TOKEN_URL, params)
    );
    const tokenDataResponse = JSON.parse(await tokenResponse.json());

    const userResponse = await fetch(
        getFetchUrl(FB_GRAPHAPI_URL, {
            access_token: authToken
        })
    );

    const userDataResponse = JSON.parse(await userResponse.json());

    return {
        isValid: tokenDataResponse.data.is_valid,
        userId: tokenDataResponse.data.user_id,
        expiryDate: new Date(tokenDataResponse.data.expires_at * 1000),
        username: userDataResponse.name
    };
};
