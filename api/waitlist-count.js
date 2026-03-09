// Returns the current waitlist count

const SUPABASE_URL = 'https://gfibxfvaggsuhpbnvxnp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?select=id`, {
            method: 'HEAD',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'count=exact'
            }
        });

        const count = response.headers.get('content-range')?.split('/')[1] || '0';
        return res.status(200).json({ count: parseInt(count) });
    } catch (error) {
        return res.status(200).json({ count: 0 });
    }
}
