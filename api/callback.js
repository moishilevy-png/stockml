export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No se recibió el código de autorización');
  }

  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: '1864770524455888',
      client_secret: 'ZlrlOSWZhyIBVPijpJHdJR6vT4o3nrnP',
      code: code,
      redirect_uri: 'https://stockml-fawn.vercel.app/auth/callback'
    })
  });

  const data = await response.json();

  if (data.access_token) {
    res.redirect(`/?token=${data.access_token}&user_id=${data.user_id}`);
  } else {
    res.status(400).json({ error: 'Auth failed', details: data });
  }
}
```

Guardá, luego en la terminal:
```
git add .
git commit -m "auth callback"
git push