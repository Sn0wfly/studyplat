import { verifyToken } from '@clerk/backend';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const KV_URL = process.env.KV_REST_API_URL;
    const KV_TOKEN = process.env.KV_REST_API_TOKEN;

    if (!KV_URL || !KV_TOKEN) {
        return res.status(500).json({ error: 'KV Database missing' });
    }

    try {
        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });
        const userId = payload.sub;
        const { subject, correct, incorrect } = req.body;
        const key = subject
            ? `user:${userId}:progress:${subject}`
            : `user:${userId}:progress:terapeutica`;

        const value = JSON.stringify({ correct, incorrect });

        const response = await fetch(`${KV_URL}/set/${key}/${encodeURIComponent(value)}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${KV_TOKEN}` }
        });
        const data = await response.json();
        return res.status(200).json({ success: true, result: data.result });
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
