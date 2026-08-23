import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  Download,
  ShoppingBag,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  X,
  Copy,
  Check,
  Package,
  Layers,
  Settings2,
  Save
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { supabase } from '../../../lib/supabase';

export function MerchOrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    payment_status: '',
    status: '',
    product_id: '',
    delivery_option_id: ''
  });

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newExpectedDeliveryDate, setNewExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Real-time Inventory State & Stock Editor
  const [merchStats, setMerchStats] = useState<any | null>(null);
  const [isEditingInventory, setIsEditingInventory] = useState(false);
  const [inventoryForm, setInventoryForm] = useState<Record<string, number>>({
    'bag': 150,
    'welcome-kit': 150,
    'combo': 200
  });
  const [inventorySaving, setInventorySaving] = useState(false);

  const limit = 30;

  const fetchInventory = useCallback(() => {
    adminApi
      .getMerchStats()
      .then((res) => {
        setMerchStats(res.data);
        if (res.data.by_product) {
          const formMap: Record<string, number> = {};
          res.data.by_product.forEach((p: any) => {
            formMap[p.id] = p.capacity;
          });
          setInventoryForm(formMap);
        }
      })
      .catch((err) => console.error('Failed to load merch inventory:', err));
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    adminApi
      .getMerchOrders({ ...filters, page, limit })
      .then((res) => {
        setOrders(res.data.orders || []);
        setTotal(res.data.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load merch orders:', err);
        setLoading(false);
      });
  }, [filters, page]);

  useEffect(() => {
    fetchData();
    fetchInventory();

    const channel = supabase
      .channel('merch_orders_admin_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'merch_orders' },
        () => {
          fetchData();
          fetchInventory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, fetchInventory]);

  const handleOpenDetail = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'PENDING');
    setNewExpectedDeliveryDate(order.expected_delivery_date || '');
    setNotes(order.notes || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setStatusUpdating(true);
    try {
      await adminApi.updateMerchOrderStatus(selectedOrder.id, {
        status: newStatus,
        expected_delivery_date: newExpectedDeliveryDate.trim() || undefined,
        notes: notes.trim() || undefined
      });
      setSelectedOrder(null);
      fetchData();
      fetchInventory();
    } catch (err) {
      console.error('Failed to update merch order status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSaveInventory = async () => {
    setInventorySaving(true);
    try {
      await adminApi.updateMerchInventory(inventoryForm);
      setIsEditingInventory(false);
      fetchInventory();
    } catch (err) {
      console.error('Failed to update inventory limits:', err);
    } finally {
      setInventorySaving(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await adminApi.exportMerchOrders();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scd-merch-orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export merch orders CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      {/* Real-time Inventory Count & Stock Management Card */}
      {merchStats && (
        <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5 mb-4">
            <div className="flex items-center gap-2.5">
              <Layers size={18} className="text-aws-orange shrink-0" />
              <div>
                <h3 className="font-sans font-black italic text-sm sm:text-base uppercase tracking-tight text-white">
                  Merchandise Inventory &amp; Stock Count
                </h3>
                <span className="font-mono text-[10px] text-white/40 uppercase block sm:inline">
                  Allocated: {merchStats.total_capacity} Units • Remaining: {merchStats.remaining_inventory} Units
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingInventory(true)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white rounded-lg font-mono text-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
            >
              <Settings2 size={13} className="text-aws-orange" />
              <span>Adjust Stock Limits</span>
            </button>
          </div>

          {/* Product stock cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {merchStats.by_product?.map((item: any) => {
              const isLow = item.remaining <= 15 && item.remaining > 0;
              const isOut = item.remaining === 0;
              const pct = item.capacity > 0 ? Math.min(100, Math.round((item.sold / item.capacity) * 100)) : 0;
              const revFormatted = Number(item.revenue || 0) % 1 !== 0 
                ? Number(item.revenue || 0).toFixed(2) 
                : Number(item.revenue || 0).toLocaleString();

              return (
                <div key={item.id} className="p-4 bg-black/60 border border-white/10 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-sans font-bold text-xs text-white">
                        {item.title}
                      </span>
                      {isOut ? (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[9px] font-mono font-bold shrink-0 uppercase">
                          Sold Out
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[9px] font-mono font-bold flex items-center gap-1 shrink-0 uppercase">
                          <AlertTriangle size={10} /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-mono font-bold shrink-0 uppercase">
                          {item.remaining} Left
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-white/50 mb-1.5">
                      <span>Sold: <strong className="text-white">{item.sold}</strong>/{item.capacity}</span>
                      <span className="font-bold text-white">{pct}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-aws-orange' : 'bg-emerald-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2.5 border-t border-white/5 font-mono">
                    <div>
                      <p className="text-base font-bold text-white">{item.sold}</p>
                      <p className="text-[9px] text-white/40 uppercase">Sold</p>
                    </div>
                    <div>
                      <p className={`text-base font-bold ${isLow ? 'text-amber-400' : isOut ? 'text-red-400' : 'text-purple-400'}`}>
                        {item.remaining}
                      </p>
                      <p className="text-[9px] text-white/40 uppercase">Stock Left</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-emerald-400">₹{revFormatted}</p>
                      <p className="text-[9px] text-white/40 uppercase">Revenue</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Adjust Inventory Stock Modal */}
      {isEditingInventory && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setIsEditingInventory(false)}
        >
          <div
            className="bg-[#0e0e0e] border border-white/15 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl text-left my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-[10px] text-aws-orange uppercase font-bold tracking-widest">
                  STOCK CONFIGURATION
                </span>
                <h3 className="font-sans font-black italic text-lg uppercase tracking-tight text-white">
                  Adjust Inventory Limits
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingInventory(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-white/60 uppercase text-[10px] mb-1">
                  SCD Official Bag + Bottle Stock:
                </label>
                <input
                  type="number"
                  min={0}
                  value={inventoryForm['bag'] ?? 150}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, bag: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-lg text-white font-mono focus:border-aws-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/60 uppercase text-[10px] mb-1">
                  SCD Official Welcome Kit Stock:
                </label>
                <input
                  type="number"
                  min={0}
                  value={inventoryForm['welcome-kit'] ?? 150}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, 'welcome-kit': Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-lg text-white font-mono focus:border-aws-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/60 uppercase text-[10px] mb-1">
                  Bag + Welcome Kit Combo Stock:
                </label>
                <input
                  type="number"
                  min={0}
                  value={inventoryForm['combo'] ?? 200}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, combo: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-lg text-white font-mono focus:border-aws-orange focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditingInventory(false)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInventory}
                disabled={inventorySaving}
                className="px-4 py-2 bg-aws-orange hover:bg-white text-black font-mono text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {inventorySaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                <span>Save Limits</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar: Search, Filters & Export (Fully Mobile Responsive Grid) */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              value={filters.search}
              onChange={(e) => {
                setFilters((f) => ({ ...f, search: e.target.value }));
                setPage(1);
              }}
              placeholder="Search Ref, Name, Email, Phone..."
              className="w-full bg-[#141414] border border-white/10 pl-9 pr-3 py-2 text-xs text-white font-mono placeholder:text-white/30 focus:border-aws-orange focus:outline-none rounded-lg"
            />
          </div>

          {/* Payment Status Filter */}
          <select
            value={filters.payment_status}
            onChange={(e) => {
              setFilters((f) => ({ ...f, payment_status: e.target.value }));
              setPage(1);
            }}
            className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs text-white font-mono focus:border-aws-orange focus:outline-none rounded-lg"
          >
            <option value="">All Payments</option>
            <option value="PAID">Paid Only (✓)</option>
            <option value="PENDING">Pending (⏳)</option>
            <option value="FAILED">Failed (✕)</option>
          </select>

          {/* Fulfillment Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters((f) => ({ ...f, status: e.target.value }));
              setPage(1);
            }}
            className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs text-white font-mono focus:border-aws-orange focus:outline-none rounded-lg"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="PAID">Paid / Queued</option>
            <option value="PROCESSING">Processing / Packaging</option>
            <option value="DISPATCHED">Dispatched / Shipped</option>
            <option value="DELIVERED">Delivered / Picked Up</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Product Filter */}
          <select
            value={filters.product_id}
            onChange={(e) => {
              setFilters((f) => ({ ...f, product_id: e.target.value }));
              setPage(1);
            }}
            className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs text-white font-mono focus:border-aws-orange focus:outline-none rounded-lg"
          >
            <option value="">All Products</option>
            <option value="combo">Combo Pack (₹349)</option>
            <option value="bag">Bag Only (₹199)</option>
            <option value="welcome-kit">Welcome Kit (₹179)</option>
          </select>
        </div>

        {/* Action Controls & Results Counter */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
          <span className="font-mono text-[11px] text-white/40">
            Found <strong className="text-white">{total}</strong> orders
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-white/80 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={exporting || orders.length === 0}
              className="px-3.5 py-1.5 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Export CSV</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE RESPONSIVE CARD LIST (Visible on Mobile & Tablet: < lg)          */}
      {/* ========================================================================= */}
      <div className="block lg:hidden space-y-3">
        {loading ? (
          <div className="p-12 text-center text-white/40 bg-[#0a0a0a] border border-white/5 rounded-xl">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-aws-orange" />
            <span className="font-mono text-xs">Loading merchandise orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-white/40 bg-[#0a0a0a] border border-white/5 rounded-xl">
            <ShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
            <span className="font-mono text-xs">No merchandise orders found matching filters.</span>
          </div>
        ) : (
          orders.map((o) => {
            const isPaid = o.payment_status === 'PAID';
            return (
              <div
                key={o.id}
                className="p-4 bg-[#0e0e0e] border border-white/10 rounded-xl space-y-3 shadow-lg font-mono text-xs"
              >
                {/* Header: Order Ref + Status */}
                <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-aws-orange text-sm">{o.order_ref}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(o.order_ref, o.id)}
                        className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                        title="Copy Order Ref"
                      >
                        {copiedId === o.id ? (
                          <Check size={11} className="text-emerald-400" />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>
                    <span className="text-[10px] text-white/40 block">
                      {new Date(o.created_at).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isPaid
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : o.payment_status === 'FAILED'
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {isPaid ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                    <span>{o.payment_status || 'PENDING'}</span>
                  </span>
                </div>

                {/* Customer Details */}
                <div className="space-y-1 text-white/80">
                  <div className="flex justify-between">
                    <span className="text-white/40">Customer:</span>
                    <span className="font-bold text-white text-right">{o.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Contact:</span>
                    <a
                      href={`tel:${o.customer_phone}`}
                      className="text-aws-orange hover:underline"
                    >
                      {o.customer_phone}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Item:</span>
                    <span className="text-white text-right truncate max-w-[200px]">
                      {o.product_title} (Qty: {o.quantity})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Delivery:</span>
                    <span className="text-white/70 text-right truncate max-w-[200px]">
                      {o.delivery_option_name} ({o.city})
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-white/40">Total Amount:</span>
                    <div className="text-right">
                      <span className="font-sans font-black italic text-base text-white">
                        ₹{o.total_amount} INR
                      </span>
                      {o.promo_code && (
                        <span className="text-[9px] text-emerald-400 block font-bold">
                          🏷️ {o.promo_code} (-₹{o.discount_amount})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fulfillment Status & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        o.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : o.status === 'DISPATCHED'
                          ? 'bg-sky-500/20 text-sky-300'
                          : o.status === 'PROCESSING'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      <Package size={10} />
                      <span>{o.status || 'PENDING'}</span>
                    </span>
                    <span className="text-[9px] text-aws-orange">
                      Est: {o.expected_delivery_date ? new Date(o.expected_delivery_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '5 Days'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/order/${o.order_ref}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                      title="Tracking Link"
                    >
                      <ExternalLink size={13} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(o)}
                      className="px-3 py-1.5 bg-aws-orange hover:bg-white text-black font-mono text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP TABLE VIEW (Visible on Large Screens: >= lg)                    */}
      {/* ========================================================================= */}
      <div className="hidden lg:block border border-white/10 bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[1150px] text-left font-mono text-xs text-white/80">
            <thead className="bg-[#111] text-white/40 uppercase tracking-widest text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 w-[160px]">Order Ref</th>
                <th className="py-3.5 px-4 w-[220px]">Customer Details</th>
                <th className="py-3.5 px-4 w-[210px]">Item &amp; Qty</th>
                <th className="py-3.5 px-4 w-[190px]">Delivery Mode</th>
                <th className="py-3.5 px-4 w-[120px]">Amount</th>
                <th className="py-3.5 px-4 w-[130px]">Payment</th>
                <th className="py-3.5 px-4 w-[140px]">Fulfillment</th>
                <th className="py-3.5 px-6 text-right w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-white/40">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-aws-orange" />
                    <span>Loading merchandise orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-white/40">
                    <ShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
                    <span>No merchandise orders found matching filters.</span>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isPaid = o.payment_status === 'PAID';
                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Order Ref & Date */}
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-aws-orange font-bold">{o.order_ref}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(o.order_ref, o.id)}
                            className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors cursor-pointer"
                            title="Copy Order Ref"
                          >
                            {copiedId === o.id ? (
                              <Check size={11} className="text-emerald-400" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-white/40 block font-normal mt-0.5">
                          {new Date(o.created_at).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block text-xs">
                          {o.customer_name}
                        </span>
                        <span className="text-[11px] text-white/60 block truncate max-w-[200px]">
                          {o.customer_email}
                        </span>
                        <a
                          href={`tel:${o.customer_phone}`}
                          className="text-[10px] text-aws-orange hover:underline font-mono"
                        >
                          {o.customer_phone}
                        </a>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4 max-w-[210px]">
                        <span className="font-bold text-white block text-xs leading-snug">
                          {o.product_title}
                        </span>
                        <span className="text-[11px] text-white/50 block mt-0.5">
                          Qty: <strong className="text-white">{o.quantity}</strong> × ₹{o.unit_price}
                        </span>
                      </td>

                      {/* Delivery Mode */}
                      <td className="py-3.5 px-4 max-w-[190px]">
                        <span className="text-white/90 block text-[11px] leading-tight font-medium">
                          {o.delivery_option_name}
                        </span>
                        <span className="text-[10px] text-white/40 block mt-0.5">
                          {o.city}, {o.state}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-sans font-black italic text-sm text-white">
                          ₹{o.total_amount}
                        </span>
                        {o.promo_code ? (
                          <span className="text-[9px] text-emerald-400 block uppercase font-bold font-mono mt-0.5">
                            🏷️ {o.promo_code} (-₹{o.discount_amount})
                          </span>
                        ) : (
                          <span className="text-[9px] text-white/40 block uppercase">INR</span>
                        )}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : o.payment_status === 'FAILED'
                              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                              : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          <span>{o.payment_status || 'PENDING'}</span>
                        </span>
                        {o.razorpay_payment_id && (
                          <span className="text-[9px] text-white/40 block font-mono mt-1 truncate max-w-[110px]" title={o.razorpay_payment_id}>
                            {o.razorpay_payment_id}
                          </span>
                        )}
                      </td>

                      {/* Fulfillment & Expected Delivery */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                            o.status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : o.status === 'DISPATCHED'
                              ? 'bg-sky-500/20 text-sky-300'
                              : o.status === 'PROCESSING'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-white/10 text-white/60'
                          }`}
                        >
                          <Package size={11} />
                          <span>{o.status || 'PENDING'}</span>
                        </span>
                        <span className="text-[10px] text-aws-orange block font-mono mt-1 font-semibold">
                          Est: {o.expected_delivery_date ? new Date(o.expected_delivery_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'In 5 Days'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/order/${o.order_ref}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                            title="Open Public Tracking Page"
                          >
                            <ExternalLink size={13} />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleOpenDetail(o)}
                            className="px-3 py-1.5 bg-aws-orange hover:bg-white text-black font-mono text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Pagination Footer */}
      <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/60">
        <div>
          Showing <span className="text-white font-bold">{orders.length}</span> of{' '}
          <span className="text-white font-bold">{total}</span> total merch orders
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1 bg-white/5 rounded-lg text-white">
            Page {page} of {Math.max(1, Math.ceil(total / limit))}
          </span>
          <button
            type="button"
            disabled={page >= Math.ceil(total / limit) || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Order Detail & Status Update Modal (Fully Responsive for All Screen Sizes) */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[#0e0e0e] border border-white/15 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 relative shadow-2xl text-left space-y-4 sm:space-y-5 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-[10px] text-aws-orange uppercase font-bold tracking-widest">
                  MANAGE MERCH ORDER
                </span>
                <h3 className="font-sans font-black italic text-lg sm:text-xl uppercase tracking-tight text-white">
                  {selectedOrder.order_ref}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer & Item Overview */}
            <div className="p-3.5 sm:p-4 bg-black/60 border border-white/10 rounded-xl font-mono text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                <span className="text-white/40">Customer:</span>
                <span className="text-white font-bold">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                <span className="text-white/40">Email:</span>
                <span className="text-white break-all">{selectedOrder.customer_email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                <span className="text-white/40">Phone:</span>
                <span className="text-aws-orange font-bold">{selectedOrder.customer_phone}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                <span className="text-white/40">Item:</span>
                <span className="text-white font-bold">{selectedOrder.product_title}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                <span className="text-white/40">Quantity:</span>
                <span className="text-white">{selectedOrder.quantity} Unit(s)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                <span className="text-white/40">Total Amount:</span>
                <span className="text-aws-orange font-sans font-black italic text-sm">
                  ₹{selectedOrder.total_amount} INR
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                <span className="text-white/40">Delivery Address:</span>
                <span className="text-white text-left sm:text-right max-w-full sm:max-w-[320px] break-words">
                  {selectedOrder.delivery_address}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 pt-2 border-t border-white/5">
                <span className="text-white/40">Payment Status:</span>
                <span
                  className={`inline-flex items-center gap-1 font-bold font-mono px-2 py-0.5 rounded text-[11px] uppercase self-start sm:self-auto ${
                    selectedOrder.payment_status === 'PAID'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {selectedOrder.payment_status === 'PAID'
                    ? 'PAID (Razorpay Verified ✓)'
                    : selectedOrder.payment_status || 'PENDING'}
                </span>
              </div>
              {selectedOrder.razorpay_payment_id && (
                <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 pt-1">
                  <span className="text-white/40">Razorpay Payment ID:</span>
                  <span className="text-emerald-400 font-mono break-all">{selectedOrder.razorpay_payment_id}</span>
                </div>
              )}
            </div>

            {/* Status & Expected Delivery Date Update Form */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 px-3 py-2 rounded-lg font-mono text-xs text-white focus:border-aws-orange focus:outline-none"
                  >
                    <option value="PENDING">PENDING (Unpaid / Placed)</option>
                    <option value="PAID">PAID (Queued for packaging)</option>
                    <option value="PROCESSING">PROCESSING (Packing in progress)</option>
                    <option value="DISPATCHED">DISPATCHED (Out for delivery / Campus pickup ready)</option>
                    <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={newExpectedDeliveryDate}
                    onChange={(e) => setNewExpectedDeliveryDate(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 px-3 py-2 rounded-lg font-mono text-xs text-white focus:border-aws-orange focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-white/60 mb-1">
                  Admin Internal Notes / Tracking Details
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Dispatched via DTDC tracking #123456 or ready at SVKM desk"
                  className="w-full bg-black/60 border border-white/15 p-2.5 rounded-lg font-mono text-xs text-white focus:border-aws-orange focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-white/10">
              <a
                href={`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hi ${selectedOrder.customer_name}! Following up from AWS SCD Dhule 2026 team regarding your merch order ${selectedOrder.order_ref}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>WhatsApp Customer</span>
                <ExternalLink size={12} />
              </a>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-mono text-white/60 hover:text-white transition-colors cursor-pointer flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={statusUpdating}
                  className="px-5 py-2 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 flex-1 sm:flex-none"
                >
                  {statusUpdating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Updates</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

