export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'Server configuration error' });

  try {
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session_id)}`,
      {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      }
    );

    if (!response.ok) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    const session = await response.json();

    if (session.payment_status === 'paid') {
      return res.status(200).json({
        paid: true,
        customer_email: session.customer_details?.email || null,
        customer_name: session.customer_details?.name || null,
        amount: session.amount_total,
        currency: session.currency,
      });
    }

    return res.status(200).json({ paid: false });
  } catch (err) {
    console.error('Verify error:', err.message);
    return res.status(400).json({ error: 'Verification failed' });
  }
}
