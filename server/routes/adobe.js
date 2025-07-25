const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const REDIRECT_URI = 'https://crm-backend-0v14.onrender.com/api/adobe/callback';

// Step 1: Redirect to Adobe Sign
router.get('/auth', (req, res) => {
    const authURL = `https://secure.sg1.adobesign.com/public/oauth?redirect_uri=${REDIRECT_URI}&response_type=code&client_id=${CLIENT_ID}&scope=user_login:self+agreement_send:account`;
    res.redirect(authURL);
});

// Step 2: Handle callback and exchange code for access_token
router.get('/callback', async (req, res) => {
    const code = req.query.code;

    try {
        const response = await axios.post('https://api.sg1.adobesign.com/oauth/token', null, {
            params: {
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token } = response.data;
        // Save token to DB or session as needed

        res.json({ message: 'Adobe Sign connected successfully', access_token, refresh_token });
    } catch (err) {
        console.error('Error exchanging code for token:', err.response?.data || err.message);
        res.status(500).json({ error: 'Token exchange failed' });
    }
});

// POST /api/adobe/exchange-token (for frontend to call with code)
router.post('/exchange-token', async (req, res) => {
    const { code, redirectUri } = req.body;

    try {
        const response = await axios.post('https://api.adobesign.com/oauth/token', null, {
            params: {
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;

        // TODO: Save tokens to DB (under a single settings/config table or collection)
        console.log('Adobe Sign Access Token:', access_token);

        res.status(200).json({ message: 'Adobe Sign connected successfully', access_token, refresh_token, expires_in });
    } catch (err) {
        console.error('Adobe token exchange failed:', err.response?.data || err.message);
        res.status(500).json({ error: 'Token exchange failed' });
    }
});


module.exports = router;
