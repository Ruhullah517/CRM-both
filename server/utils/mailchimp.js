const fetch = require('node-fetch');

function getConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY || '';
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID || '';
  const dc = apiKey.split('-')[1];
  if (!apiKey || !dc || !audienceId) {
    throw new Error('MAILCHIMP_API_KEY and MAILCHIMP_AUDIENCE_ID must be set');
  }
  return { apiKey, audienceId, dc };
}

async function subscribe(email, mergeFields = {}, tags = []) {
  const { apiKey, audienceId, dc } = getConfig();
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `apikey ${apiKey}`,
    },
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed',
      merge_fields: mergeFields,
      tags,
    }),
  });
  const data = await res.json();
  if (!res.ok && data.title !== 'Member Exists') {
    const msg = data.detail || 'Mailchimp subscribe failed';
    throw new Error(msg);
  }
  return data;
}

module.exports = { subscribe };


