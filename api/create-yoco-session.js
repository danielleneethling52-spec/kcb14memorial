export default async function handler(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, productName } = req.body;

        const response = await fetch('https://online.yoco.com/v1/charges/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Secret-Key': process.env.YOCO_SECRET_KEY
            },
            body: JSON.stringify({
                amountInCents: amount,
                currency: 'ZAR',
                metadata: {
                    productName
                }
            })
        });

        const data = await response.json();

        console.log('YOCO RESPONSE:', data);

        if (!response.ok) {
            return res.status(400).json({
                error: 'Yoco error',
                details: data
            });
        }

        return res.status(200).json({
            redirectUrl: data.redirectUrl || null,
            raw: data
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
}
