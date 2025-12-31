(async ()=>{
  try{
    const base='http://localhost:6000';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@helpmeout.local';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    const loginRes = await fetch(base + '/api/admin/login', {
      method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ email: adminEmail, password: adminPass })
    });
    const login = await loginRes.json();
    const token = login.token;
    if(!token) throw new Error('No token');

    const userId = process.argv[2];
    if(!userId) {
      console.log('Usage: node test_user_admin.js <userId>');
      process.exit(0);
    }

    const upd = await fetch(base + '/api/admin/users/' + userId, {
      method:'PUT', headers:{'content-type':'application/json','authorization':'Bearer '+token}, body: JSON.stringify({ name: 'Updated Name' })
    });
    console.log('Update status', upd.status, await upd.text());

    const del = await fetch(base + '/api/admin/users/' + userId, {
      method:'DELETE', headers:{'authorization':'Bearer '+token}
    });
    console.log('Delete status', del.status, await del.text());
  }catch(err){console.error(err)}
})();
