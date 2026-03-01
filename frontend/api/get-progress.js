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
        const { subject } = req.body || {};
        const key = subject
            ? `user:${userId}:progress:${subject}`
            : `user:${userId}:progress:terapeutica`;

        const response = await fetch(`${KV_URL}/get/${key}`, {
            headers: { Authorization: `Bearer ${KV_TOKEN}` }
        });
        const data = await response.json();

        if (data.result) {
            return res.status(200).json(JSON.parse(data.result));
        }
        return res.status(200).json({ correct: [], incorrect: [] });
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
