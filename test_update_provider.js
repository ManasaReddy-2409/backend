/* Simple test to update a provider (PUT) */
(async () => {
  try {
    const base = 'http://localhost:5000';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@helpmeout.local';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    const loginRes = await fetch(base + '/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPass }),
    });
    const loginJson = await loginRes.json();
    const token = loginJson.token;
    if (!token) throw new Error('No token');

    // Replace with a real provider id from your DB
    const providerId = process.argv[2];
    if (!providerId) throw new Error('Usage: node test_update_provider.js <providerId>');

    const res = await fetch(base + '/api/admin/providers/' + providerId, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ businessName: 'Updated Name via Test' }),
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch (err) {
    console.error(err);
  }
})();
