import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';

const router = Router();

// GET /api/tickets/lookup?query=...
router.get('/lookup', async (req, res, next) => {
  try {
    const query = ((req.query.query as string) || '').trim().toLowerCase();
    if (!query) {
      res.status(400).json({ error: 'QUERY_REQUIRED', message: 'Please enter your registered email address or ticket number.' });
      return;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);

    let dbQuery = supabase
      .from('registrations')
      .select('id, full_name, email, ticket_number, organization, role, payment_status, checked_in, checked_in_at, created_at, pass_types(name, badge_color)');

    if (isUuid) {
      dbQuery = dbQuery.or(`id.eq.${query},order_id.eq.${query}`);
    } else {
      // Exact complete match only (no partial % wildcards)
      dbQuery = dbQuery.or(`email.ilike.${query},ticket_number.ilike.${query}`);
    }

    const { data: regs, error } = await dbQuery.limit(5);

    if (error) {
      console.error('[Cert Lookup Error]', error);
      res.status(500).json({ error: 'LOOKUP_FAILED', message: 'Failed to search registrations.' });
      return;
    }

    if (!regs || regs.length === 0) {
      res.status(404).json({ error: 'NO_PASS_FOUND', message: 'No event pass found for this email address or ticket number.' });
      return;
    }

    // Find if there is a paid & checked-in registration
    const isPaid = (status?: string) => status && status.toUpperCase() === 'PAID';
    const isCheckedIn = (r: any) => r.checked_in === true || Boolean(r.checked_in_at);

    const checkedInReg = regs.find(r => isPaid(r.payment_status) && isCheckedIn(r));
    
    if (checkedInReg) {
      const passName = Array.isArray((checkedInReg as any).pass_types)
        ? (checkedInReg as any).pass_types[0]?.name
        : (checkedInReg as any).pass_types?.name;

      res.json({
        verified: true,
        id: checkedInReg.id,
        full_name: checkedInReg.full_name,
        email: checkedInReg.email,
        ticket_number: checkedInReg.ticket_number,
        role: 'ATTENDEE',
        checked_in: true,
      });
      return;
    }

    // If there is a paid pass but not checked in
    const paidReg = regs.find(r => isPaid(r.payment_status));
    if (paidReg) {
      res.status(403).json({
        error: 'NOT_CHECKED_IN',
        message: 'Event pass found, but you were not checked in at the event venue. Certificates of Participation are exclusively available to attendees who were checked in.',
      });
      return;
    }

    // Otherwise payment pending or invalid
    res.status(403).json({
      error: 'PAYMENT_PENDING',
      message: 'Event pass payment is not marked as completed.',
    });
  } catch (err) {
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
