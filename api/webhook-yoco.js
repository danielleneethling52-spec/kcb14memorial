import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const event = req.body;

        // ⚠️ You must confirm event type from Yoco dashboard logs
        if (event.type !== 'payment.succeeded') {
            return res.status(200).json({ received: true });
        }

        const payment = event.data;

        const amount = payment.amountInCents;
        const email = payment.customer?.email || null;
        const name = payment.customer?.name || 'Anonymous';
        const product = payment.metadata?.product || 'Unknown';

        // 1. Save order
        const { data: order, error } = await supabase
            .from('orders')
            .insert([
                {
                    name,
                    email,
                    amount,
                    product,
                    status: 'paid',
                    yoco_id: payment.id
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // 2. Generate raffle ticket
        const ticketNumber = Math.floor(100000 + Math.random() * 900000);

        await supabase.from('raffle_tickets').insert([
            {
                order_id: order.id,
                ticket_number: ticketNumber
            }
        ]);

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
