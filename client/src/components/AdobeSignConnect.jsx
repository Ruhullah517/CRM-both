import React from 'react';

const AdobeSignConnect = () => {
    const CLIENT_ID = 'ats-2d31a55f-feaf-4b56-ba7b-2b3a89f4d86f';
    const REDIRECT_URI = 'http://backendcrm.blackfostercarersalliance.co.uk/adobe/callback'; // your frontend URL
    const STATE = 'your-unique-state-value'; // you can also generate dynamically

    const handleConnect = () => {
        const authUrl = `https://secure.na1.echosign.com/public/oauth?redirect_uri=${encodeURIComponent(
            REDIRECT_URI
        )}&response_type=code&client_id=${CLIENT_ID}&scope=user_login:self+agreement_send:account&state=${STATE}`;

        window.location.href = authUrl;
    };

    return (
        <div className="p-4 border rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Adobe Sign Integration</h2>
            <p className="mb-4 text-sm text-gray-600">
                Connect your CRM to Adobe Sign to enable electronic signature workflows.
            </p>
            <button
                onClick={handleConnect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
                Connect to Adobe Sign
            </button>
        </div>
    );
};

export default AdobeSignConnect;
