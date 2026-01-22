// API route para autenticación con Accounts
export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const crypto = require('crypto');

  function toBase64Url(input) {
    const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  function fromBase64Url(input) {
    const padded = input.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = padded.length % 4 ? 4 - (padded.length % 4) : 0;
    return Buffer.from(padded + '='.repeat(padLength), 'base64').toString('utf8');
  }

  function verifyAccountsToken(token, secret) {
    const [body, signature] = token.split('.');
    if (!body || !signature) return null;
    
    const expected = toBase64Url(
      crypto.createHmac('sha256', secret).update(body).digest()
    );
    
    if (expected !== signature) return null;
    
    try {
      const payload = JSON.parse(fromBase64Url(body));
      if (!payload?.email || !payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    const secret = process.env.ACCOUNTS_EMBED_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Configuración faltante' });
    }

    // Paso 1: Validar el token
    const payload = verifyAccountsToken(token, secret);
    if (!payload) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Paso 2: Verificar que el usuario tiene acceso
    // Por ahora solo daeiman@gmail.com tiene acceso
    // TODO: Vincular con la base de datos del CRM
    const ALLOWED_EMAILS = ['daeiman@gmail.com'];
    if (!ALLOWED_EMAILS.includes(payload.email)) {
      return res.status(403).json({ error: 'Usuario no tiene acceso a esta aplicación' });
    }

    // Paso 3: Usuario autenticado y autorizado
    return res.json({
      authenticated: true,
      user: {
        email: payload.email,
        name: payload.name,
        isAdmin: payload.isAdmin
      }
    });
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
