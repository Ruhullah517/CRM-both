import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function AdobeCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      // Send the code to your backend to exchange for access_token
      axios
        .post('https://crm-backend-0v14.onrender.com/api/adobe/exchange-token', {
          code,
          redirectUri: 'http://localhost:5173/adobe/callback',
        })
        .then((res) => {
          console.log('Adobe token saved:', res.data);
          alert('Adobe Sign connected successfully!');
          navigate('/settings'); // Or wherever you want to go after success
        })
        .catch((err) => {
          console.error('Error exchanging token', err);
          alert('Failed to connect Adobe Sign.');
        });
    }
  }, [searchParams, navigate]);

  return <p>Connecting to Adobe Sign...</p>;
}
