import axios from "axios";
import { generateApiResponse } from "./utilities.service.js";
import { StatusCodes } from "http-status-codes";

/**
 * Function to fetch user info from Google OAuth2 API
 * @param {string} accessToken - Dynamic access token
 * @returns {Promise<Object>} - User information
 */
export async function getGoogleUserInfo(accessToken, res) {
    const url = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userInfo = response.data;
        console.log('User Info:', userInfo);

        return userInfo;
    } catch (error) {
        console.error('Error fetching user info:', error.response?.data || error.message);
        return res.status(401).json(error.response?.data || error.message);

        // return generateApiResponse(
        //     res, StatusCodes.UNAUTHORIZED, false,
        //     "Error while login with google!",
        //     { error: error.response?.data || error.message }
        // )
    }
}