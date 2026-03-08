export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id', verified: false });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'Server configuration error', verified: false });

  try {
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session_id)}`,
      { headers: { 'Authorization': `Bearer ${key}` } }
    );

    if (!response.ok) {
      return res.status(400).json({ error: 'Invalid session', verified: false });
    }

    const session = await response.json();

    if (session.payment_status === 'paid') {
      return res.status(200).json({
        verified: true,
        customer_email: session.customer_details?.email || null,
        customer_name: session.customer_details?.name || null,
        products: [
          { id: '01', title: 'Maintenance Triage SOP', file: '01-maintenance-triage-sop.html', type: 'SOP' },
          { id: '02', title: 'Move-In/Move-Out Inspection Checklist', file: '02-move-in-move-out-checklist.html', type: 'Template' },
          { id: '03', title: 'Monthly Owner Report Template', file: '03-owner-reporting-template.html', type: 'Template' },
          { id: '04', title: 'Owner Onboarding Playbook (30 Steps)', file: '04-owner-onboarding-playbook.html', type: 'Playbook' },
          { id: '05', title: 'Tenant Screening SOP', file: '05-tenant-screening-sop.html', type: 'SOP' },
          { id: '06', title: 'Fee Structure Calculator', file: '06-fee-structure-calculator.html', type: 'Calculator' },
          { id: '07', title: 'Hiring & Job Description Kit', file: '07-hiring-kit.html', type: 'Kit' },
          { id: '08', title: 'New Employee Onboarding Plan', file: '08-employee-onboarding.html', type: 'Plan' },
          { id: '09', title: '47 Email Templates', file: '09-email-templates.html', type: 'Templates' },
          { id: '10', title: 'Vendor Management SOP', file: '10-vendor-management-sop.html', type: 'SOP' },
          { id: '11', title: 'Rent Collection Playbook', file: '11-rent-collection-playbook.html', type: 'Playbook' },
          { id: '12', title: 'Property Inspection Templates', file: '12-property-inspection-templates.html', type: 'Templates' },
          { id: '13', title: 'Growth Financial Model', file: '13-growth-financial-model.html', type: 'Model' },
          { id: '14', title: 'Owner Acquisition Scripts', file: '14-owner-acquisition-scripts.html', type: 'Scripts' },
          { id: '15', title: 'KPI Dashboard Template', file: '15-kpi-dashboard.html', type: 'Dashboard' }
        ]
      });
    }

    return res.status(403).json({ verified: false, error: 'Payment not completed' });
  } catch (err) {
    console.error('Access verify error:', err.message);
    return res.status(400).json({ error: 'Verification failed', verified: false });
  }
}
