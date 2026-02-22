export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        // Upstash Redis REST URL and Token from Environment Variables
        const KV_URL = process.env.KV_REST_API_URL;
        const KV_TOKEN = process.env.KV_REST_API_TOKEN;

        if (!KV_URL || !KV_TOKEN) {
            return res.status(500).json({ error: 'KV Database completely missing' });
        }

        // Hash user combo to create a unified key
        const key = `user_state_${Buffer.from(username + ':' + password).toString('base64')}`;

        try {
            const response = await fetch(`${KV_URL}/get/${key}`, {
                headers: {
                    Authorization: `Bearer ${KV_TOKEN}`
                }
            });
            const data = await response.json();

            if (data.result) {
                // Exists, return it
                return res.status(200).json(JSON.parse(data.result));
            } else {
                // Does not exist, return empty progress to start fresh
                return res.status(200).json({ correct: [], incorrect: [] });
            }
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
}
