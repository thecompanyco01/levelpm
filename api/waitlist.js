// Vercel Serverless Function — stores waitlist emails in Supabase

const SUPABASE_URL = 'https://gfibxfvaggsuhpbnvxnp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, source } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
    }

    try {
        // Insert into Supabase (upsert to handle duplicates)
        const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=ignore-duplicates'
            },
            body: JSON.stringify({
                email: email.toLowerCase().trim(),
                source: source || 'landing-page'
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`[WAITLIST] Supabase error: ${err}`);
            // Still return success to user — we don't want to show errors
            return res.status(200).json({ success: true, message: 'Added to waitlist' });
        }

        console.log(`[WAITLIST] ${email} signed up from ${source || 'landing-page'}`);
        return res.status(200).json({ success: true, message: 'Added to waitlist' });
    } catch (error) {
        console.error(`[WAITLIST] Error: ${error.message}`);
        // Fail gracefully
        return res.status(200).json({ success: true, message: 'Added to waitlist' });
    }
}
