export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password, correct, incorrect } = req.body;

        const KV_URL = process.env.KV_REST_API_URL;
        const KV_TOKEN = process.env.KV_REST_API_TOKEN;

        if (!KV_URL || !KV_TOKEN) {
            return res.status(500).json({ error: 'KV Database missing' });
        }

        const key = `user_state_${Buffer.from(username + ':' + password).toString('base64')}`;
        const value = JSON.stringify({ correct, incorrect });

        try {
            const response = await fetch(`${KV_URL}/set/${key}/${encodeURIComponent(value)}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${KV_TOKEN}`
                }
            });
            const data = await response.json();
            return res.status(200).json({ success: true, result: data.result });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
}

