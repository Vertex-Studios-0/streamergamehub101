import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const authHeader = req.headers['authorization'];
    const systemSecret = process.env.ADMIN_SECRET;

    if (!systemSecret) {
        return res.status(500).json({ error: 'System administration token environment variable is unconfigured.' });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication challenge needed.' });
    }

    const extractedToken = authHeader.split(' ')[1];
    if (extractedToken !== systemSecret) {
        return res.status(401).json({ error: 'Access Denied. Invalid Authorization token context.' });
    }

    try {
        const structuralLogs = await kv.get('hub_events') || [];
        return res.status(200).json(structuralLogs);
    } catch (dbError) {
        return res.status(500).json({ error: 'Could not fetch database records securely.' });
    }
}
