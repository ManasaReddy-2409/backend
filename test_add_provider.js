(async ()=> {
  try {
    const base='http://localhost:5000';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@helpmeout.local';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    const loginRes = await fetch(base + '/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPass })
    });
    const loginJson = await loginRes.json();
    console.log('Login:', loginRes.status, loginJson);
    if (!loginJson.token) {
      console.error('No token received, cannot continue');
      process.exit(1);
    }

    const token = loginJson.token;
    const createRes = await fetch(base + '/api/admin/providers', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + token },
      body: JSON.stringify({
        businessName: 'Test Biz',
        phone: '9999999999',
        serviceCategory: 'plumbing',
        experience: 2,
        skills: 'pipes',
        status: 'active'
      })
    });
    const text = await createRes.text();
    console.log('Create provider response status:', createRes.status);
    console.log('Create provider response body (first 1000 chars):\n', text.slice(0,1000));
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
