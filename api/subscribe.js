// Vercel Serverless Function — newsletter/lead capture with Slack notification

const SUPABASE_URL = 'https://gfibxfvaggsuhpbnvxnp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmaWJ4ZnZhZ2dzdWhwYm52eG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc0MjI0NSwiZXhwIjoyMDg4MzE4MjQ1fQ.5O97DKP9uuZTJ2uYuroNx3UDOcigz3oqryq8y5qC_fc';
const SLACK_WEBHOOK = process.env.SLACK_LEAD_WEBHOOK;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, source, company, doors } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const leadSource = source || 'newsletter';

    try {
        // Store in Supabase
        await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=ignore-duplicates'
            },
            body: JSON.stringify({
                email: cleanEmail,
                source: leadSource,
                metadata: JSON.stringify({ company: company || null, doors: doors || null })
            })
        });

        // Notify Slack (non-blocking)
        if (SLACK_WEBHOOK) {
            fetch(SLACK_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `🏢 New ScaleDoors lead!\n*Email:* ${cleanEmail}\n*Source:* ${leadSource}${company ? `\n*Company:* ${company}` : ''}${doors ? `\n*Doors:* ${doors}` : ''}`
                })
            }).catch(() => {});
        }

        console.log(`[SUBSCRIBE] ${cleanEmail} from ${leadSource}`);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(`[SUBSCRIBE] Error: ${error.message}`);
        return res.status(200).json({ success: true });
    }
}
