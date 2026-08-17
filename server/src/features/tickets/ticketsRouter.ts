import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';

const router = Router();

// GET /api/tickets/lookup?query=...
router.get('/lookup', async (req, res, next) => {
  try {
    const rawQuery = ((req.query.query as string) || '').trim();
    if (!rawQuery) {
      res.status(400).json({ error: 'QUERY_REQUIRED', message: 'Please enter your registered email address or ticket number.' });
      return;
    }

    const query = rawQuery.toLowerCase();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);

    // 1. Try Registrations Table
    let dbQuery = supabase
      .from('registrations')
      .select('id, full_name, email, ticket_number, organization, role, payment_status, checked_in, checked_in_at, order_id, created_at');

    if (isUuid) {
      dbQuery = dbQuery.or(`id.eq.${query},order_id.eq.${query}`);
    } else {
      dbQuery = dbQuery.or(`email.ilike.${query},ticket_number.ilike.${query}`);
    }

    let { data: regs, error } = await dbQuery.limit(5);

    if (error) {
      console.warn('[Cert Lookup] Registration query error, falling back:', error.message);
    }

    // 2. If no registration found directly, check Orders table by primary_email or ID
    if (!regs || regs.length === 0) {
      let orderQuery = supabase
        .from('orders')
        .select('id, primary_email, payment_status')
        .limit(1);

      if (isUuid) {
        orderQuery = orderQuery.eq('id', query);
      } else {
        orderQuery = orderQuery.ilike('primary_email', query);
      }

      const { data: orders } = await orderQuery;
      if (orders && orders.length > 0) {
        const orderId = orders[0].id;
        const { data: orderRegs } = await supabase
          .from('registrations')
          .select('id, full_name, email, ticket_number, organization, role, payment_status, checked_in, checked_in_at, order_id, created_at')
          .eq('order_id', orderId);

        if (orderRegs && orderRegs.length > 0) {
          regs = orderRegs;
        }
      }
    }

    // 3. If found in registrations, return verified certificate record
    if (regs && regs.length > 0) {
      // Pick best matching registration (checked-in or paid preferred, or first valid)
      const validReg =
        regs.find(r => r.checked_in === true || r.checked_in_at != null) ||
        regs.find(r => r.payment_status && r.payment_status.toUpperCase() === 'PAID') ||
        regs.find(r => Boolean(r.ticket_number)) ||
        regs[0];

      const ticketNum =
        validReg.ticket_number ||
        `SCD-${validReg.id.replace(/-/g, '').slice(0, 6).toUpperCase()}-26`;

      res.json({
        verified: true,
        id: validReg.id,
        full_name: validReg.full_name || 'Attendee',
        email: validReg.email || query,
        ticket_number: ticketNum,
        role: 'ATTENDEE',
        checked_in: Boolean(validReg.checked_in || validReg.checked_in_at),
      });
      return;
    }

    // 4. Check Volunteer Applications
    const { data: volunteers } = await supabase
      .from('volunteer_applications')
      .select('id, full_name, email')
      .ilike('email', query)
      .limit(1);

    if (volunteers && volunteers.length > 0) {
      const v = volunteers[0];
      res.json({
        verified: true,
        id: v.id,
        full_name: v.full_name,
        email: v.email,
        ticket_number: `SCD-VOL-${v.id.replace(/-/g, '').slice(0, 6).toUpperCase()}-26`,
        role: 'VOLUNTEER',
        checked_in: true,
      });
      return;
    }

    // 5. Check Speaker Applications
    const { data: speakers } = await supabase
      .from('speaker_applications')
      .select('id, full_name, email')
      .ilike('email', query)
      .limit(1);

    if (speakers && speakers.length > 0) {
      const s = speakers[0];
      res.json({
        verified: true,
        id: s.id,
        full_name: s.full_name,
        email: s.email,
        ticket_number: `SCD-SPK-${s.id.replace(/-/g, '').slice(0, 6).toUpperCase()}-26`,
        role: 'SPEAKER',
        checked_in: true,
      });
      return;
    }

    // 6. Check Community Partners
    const { data: partners } = await supabase
      .from('community_partners')
      .select('id, organizer_name, organizer_email')
      .ilike('organizer_email', query)
      .limit(1);

    if (partners && partners.length > 0) {
      const p = partners[0];
      res.json({
        verified: true,
        id: p.id,
        full_name: p.organizer_name,
        email: p.organizer_email,
        ticket_number: `SCD-ORG-${p.id.replace(/-/g, '').slice(0, 6).toUpperCase()}-26`,
        role: 'COMMUNITY BUILDER',
        checked_in: true,
      });
      return;
    }

    // If not found in any table
    res.status(404).json({
      error: 'NO_PASS_FOUND',
      message: 'No event registration found for this email address or ticket number. Please make sure you entered the complete, exact registered email address.',
    });
  } catch (err) {
    console.error('[Cert Lookup Error]', err);
    next(err);
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try to find the registration by ID first
    let { data: reg } = await supabase
      .from('registrations')
      .select('*, pass_types(name, badge_color)')
      .eq('id', id)
      .single();

    // If not found by registration ID, it might be an order ID.
    // Fetch the primary registration for this order.
    if (!reg) {
      const { data: orderRegs } = await supabase
        .from('registrations')
        .select('*, pass_types(name, badge_color)')
        .eq('order_id', id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (orderRegs && orderRegs.length > 0) {
        reg = orderRegs[0];
      }
    }

    if (!reg) {
      // Check if the order exists but has no registrations yet
      const { data: order } = await supabase.from('orders').select('payment_status').eq('id', id).single();
      if (order) {
        res.json({ payment_status: order.payment_status });
        return;
      }
      res.status(404).json({ error: 'TICKET_NOT_FOUND' });
      return;
    }

    // Return the registration details
    res.json({
      ...reg,
      payment_status: reg.payment_status,
      pass_types: reg.pass_types
    });
  } catch (err) {
    next(err);
  }
});

export default router;
