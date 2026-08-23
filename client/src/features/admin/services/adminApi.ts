import { api } from '../../../lib/api';

const getHeaders = () => ({
  'X-Admin-Key': sessionStorage.getItem('scd_admin_key') || '',
});

export const adminApi = {
  verify: (key: string) => api.get('/api/admin/verify', { headers: { 'X-Admin-Key': key } }),
  getPasses: () => api.get('/api/admin/passes', { headers: getHeaders() }),
  getStats: () => api.get('/api/admin/stats', { headers: getHeaders() }),
  getSpeakers: () => api.get('/api/admin/speakers', { headers: getHeaders() }),
  getPartners: () => api.get('/api/admin/partners', { headers: getHeaders() }),
  getSponsors: () => api.get('/api/admin/sponsors', { headers: getHeaders() }),
  getVolunteers: () => api.get('/api/admin/volunteers', { headers: getHeaders() }),
  getMpds: () => api.get('/api/admin/mpds', { headers: getHeaders() }),
  updateApplicationStatus: (type: 'speaker' | 'partner' | 'sponsor' | 'volunteer' | 'mpd', id: string, status: string) =>
    api.put(`/api/admin/applications/${type}/${id}/status`, { status }, { headers: getHeaders() }),

  getRegistrations: (filters: {
    pass_slug?: string;
    payment_status?: string;
    checked_in?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/api/admin/registrations', { headers: getHeaders(), params: filters }),

  exportCSV: () => api.get('/api/admin/export-csv', {
    headers: getHeaders(),
    responseType: 'blob',
  }),

  exportVolunteers: () => api.get('/api/admin/export-volunteers', {
    headers: getHeaders(),
    responseType: 'blob',
  }),

  exportMpds: () => api.get('/api/admin/export-mpds', {
    headers: getHeaders(),
    responseType: 'blob',
  }),

  exportSpeakers: () => api.get('/api/admin/export-speakers', {
    headers: getHeaders(),
    responseType: 'blob',
  }),

  exportSponsors: () => api.get('/api/admin/export-sponsors', {
    headers: getHeaders(),
    responseType: 'blob',
  }),

  exportPartners: () => api.get('/api/admin/export-partners', {
    headers: getHeaders(),
    responseType: 'blob',
  }),

  updatePassType: (id: string, data: Record<string, any>) =>
    api.put(`/api/admin/passes/${id}`, data, { headers: getHeaders() }),

  createPassType: (data: Record<string, any>) =>
    api.post('/api/admin/passes', data, { headers: getHeaders() }),

  getReferralLeaderboard: () =>
    api.get('/api/admin/referral-leaderboard', { headers: getHeaders() }),

  getReferralDetails: () =>
    api.get('/api/admin/referral-details', { headers: getHeaders() }),

  sendShoutout: (data: {
    mimeMessage?: string;
    subject?: string;
    html?: string;
    recipientSource?: 'csv' | 'database_all' | 'database_paid' | 'database_all_contacts';
    recipients?: Array<{ email: string; name?: string }>;
    provider?: 'mailtrap' | 'resend';
  }) => api.post('/api/admin/shoutout', data, { headers: getHeaders() }),

  generateOfflinePass: (data: {
    pass_type_id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    organization: string;
    received_by?: string;
  }) => api.post('/api/admin/generate-pass', data, { headers: getHeaders() }),

  getFeedback: () =>
    api.get('/api/admin/feedback', { headers: getHeaders() }),

  exportFeedback: () =>
    api.get('/api/admin/export-feedback', {
      headers: getHeaders(),
      responseType: 'blob',
    }),

  deleteFeedback: (id: string) =>
    api.delete(`/api/admin/feedback/${id}`, { headers: getHeaders() }),

  // Merch Orders Management
  getMerchOrders: (filters?: {
    search?: string;
    payment_status?: string;
    status?: string;
    delivery_option_id?: string;
    product_id?: string;
    page?: number;
    limit?: number;
  }) => api.get('/api/admin/merch-orders', { headers: getHeaders(), params: filters }),

  updateMerchOrderStatus: (id: string, data: { status?: string; expected_delivery_date?: string; notes?: string }) =>
    api.put(`/api/admin/merch-orders/${id}/status`, data, { headers: getHeaders() }),

  exportMerchOrders: () =>
    api.get('/api/admin/export-merch-orders', {
      headers: getHeaders(),
      responseType: 'blob',
    }),

  deleteMerchOrder: (id: string) =>
    api.delete(`/api/admin/merch-orders/${id}`, { headers: getHeaders() }),

  getMerchStats: () => api.get('/api/admin/merch-stats', { headers: getHeaders() }),

  updateMerchInventory: (inventory: Record<string, number>) =>
    api.put('/api/admin/merch-inventory', { inventory }, { headers: getHeaders() }),
};
