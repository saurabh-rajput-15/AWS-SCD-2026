import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  DollarSign,
  Users,
  MapPin,
  ShoppingBag,
  Ticket,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Layers,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Edit2,
  Save,
  X,
  Loader2,
  Check
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { supabase } from '../../../lib/supabase';

interface PassStats {
  total_sold: number;
  total_revenue: number;
  total_checked_in: number;
  by_pass_type: Array<{
    slug: string;
    name: string;
    sold: number;
    capacity: number;
    revenue: number;
    checked_in: number;
  }>;
}

interface MerchStats {
  total_revenue: number;
  total_orders: number;
  total_units_sold: number;
  total_capacity: number;
  remaining_inventory: number;
  delivery_fees_collected: number;
  by_product: Array<{
    id: string;
    title: string;
    sold: number;
    capacity: number;
    remaining: number;
    revenue: number;
  }>;
  fulfillment_breakdown: Record<string, number>;
  delivery_mode_breakdown: Record<string, number>;
}

export function TelemetryCards() {
  const [activeView, setActiveView] = useState<'passes' | 'merch'>('passes');
  const [passStats, setPassStats] = useState<PassStats | null>(null);
  const [merchStats, setMerchStats] = useState<MerchStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Inventory adjustment state directly from Overview
  const [isEditingInventory, setIsEditingInventory] = useState(false);
  const [inventoryForm, setInventoryForm] = useState<Record<string, number>>({
    bag: 150,
    'welcome-kit': 150,
    combo: 200
  });
  const [inventorySaving, setInventorySaving] = useState(false);
  const [inventoryFeedback, setInventoryFeedback] = useState<{ error?: string; success?: string } | null>(null);

  const fetchPassStats = () => {
    adminApi
      .getStats()
      .then((res) => {
        setPassStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load pass telemetry:', err);
        setLoading(false);
      });
  };

  const fetchMerchStats = () => {
    adminApi
      .getMerchStats()
      .then((res) => {
        setMerchStats(res.data);
        if (res.data?.by_product) {
          const form: Record<string, number> = {};
          res.data.by_product.forEach((p: any) => {
            form[p.id] = p.capacity;
          });
          setInventoryForm(form);
        }
      })
      .catch((err) => {
        console.error('Failed to load merch telemetry:', err);
      });
  };

  const handleOpenEditInventory = () => {
    if (merchStats?.by_product) {
      const form: Record<string, number> = {
        bag: 150,
        'welcome-kit': 150,
        combo: 200
      };
      merchStats.by_product.forEach((p) => {
        form[p.id] = p.capacity;
      });
      setInventoryForm(form);
    }
    setInventoryFeedback(null);
    setIsEditingInventory(true);
  };

  const handleSaveInventory = async () => {
    setInventorySaving(true);
    setInventoryFeedback(null);
    try {
      await adminApi.updateMerchInventory(inventoryForm);
      setInventoryFeedback({ success: 'Inventory stock limits updated in database!' });
      fetchMerchStats();
      setTimeout(() => {
        setIsEditingInventory(false);
        setInventoryFeedback(null);
      }, 1200);
    } catch (err: any) {
      console.error('Failed to update inventory:', err);
      setInventoryFeedback({
        error: err.response?.data?.error || 'Failed to update inventory. Please try again.'
      });
    } finally {
      setInventorySaving(false);
    }
  };


  const fetchAllStats = () => {
    fetchPassStats();
    fetchMerchStats();
  };

  useEffect(() => {
    fetchAllStats();
    
    // Interval update
    const interval = setInterval(fetchAllStats, 45000);

    const channel = supabase
      .channel('telemetry_live_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, fetchPassStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchPassStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'merch_orders' }, fetchMerchStats)
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading && !passStats && !merchStats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#111] border border-white/5 p-5 animate-pulse rounded-xl">
            <div className="h-3 w-16 bg-white/10 rounded mb-3" />
            <div className="h-8 w-20 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  function formatCurrency(amount: number): string {
    const num = Number(amount) || 0;
    return num % 1 !== 0 ? num.toFixed(2) : num.toLocaleString();
  }

  // Pass Calculations
  const totalPassCapacity = passStats?.by_pass_type?.reduce((a, b) => a + b.capacity, 0) || 0;
  const mainPassCards = [
    { label: 'Passes Sold', value: passStats?.total_sold || 0, icon: Ticket, color: 'text-aws-orange' },
    { label: 'Pass Revenue', value: `₹${formatCurrency(passStats?.total_revenue || 0)}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Checked In', value: passStats?.total_checked_in || 0, icon: MapPin, color: 'text-blue-400' },
    { label: 'Seats Left', value: Math.max(0, totalPassCapacity - (passStats?.total_sold || 0)), icon: Users, color: 'text-purple-400' },
  ];

  // Merch Calculations
  const mainMerchCards = [
    { label: 'Merch Revenue', value: `₹${formatCurrency(merchStats?.total_revenue || 0)}`, icon: DollarSign, color: 'text-aws-orange' },
    { label: 'Paid Orders', value: merchStats?.total_orders || 0, icon: ShoppingBag, color: 'text-emerald-400' },
    { label: 'Units Sold', value: merchStats?.total_units_sold || 0, icon: Package, color: 'text-sky-400' },
    { label: 'Remaining Stock', value: merchStats?.remaining_inventory || 0, icon: Layers, color: 'text-purple-400' },
  ];


  return (
    <div className="space-y-6">
      {/* Top Overview Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111] border border-white/5 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 p-1 bg-black/60 border border-white/10 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveView('passes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeView === 'passes'
                ? 'bg-aws-orange text-black shadow-[0_0_15px_rgba(255,153,0,0.3)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Ticket size={14} />
            <span>Passes &amp; Registrations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('merch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeView === 'merch'
                ? 'bg-aws-orange text-black shadow-[0_0_15px_rgba(255,153,0,0.3)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Merchandise Sales &amp; Stock</span>
          </button>
        </div>

        <button
          type="button"
          onClick={fetchAllStats}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white font-mono text-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={12} />
          <span>Live Refresh</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: PASSES & REGISTRATIONS TELEMETRY                                   */}
      {/* ========================================================================= */}
      {activeView === 'passes' && (
        <div className="space-y-6">
          {/* Main pass stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {mainPassCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#111] border border-white/5 p-5 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  <card.icon size={14} className={card.color} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {card.label}
                  </span>
                </div>
                <p className={`font-sans font-black italic text-2xl ${card.color}`}>
                  {card.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Per pass type breakdown cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {passStats?.by_pass_type?.map((pt, i) => (
              <div key={i} className="bg-[#111] border border-white/5 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-sans font-bold text-sm text-white">{pt.name}</h4>
                  <span className="font-mono text-[10px] text-white/30 uppercase">{pt.slug}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/5 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-aws-orange transition-all"
                    style={{ width: `${Math.min(100, (pt.sold / (pt.capacity || 1)) * 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                  <div>
                    <p className="text-lg font-bold text-white">{pt.sold}</p>
                    <p className="text-[9px] text-white/30 uppercase">Sold</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white/50">{pt.capacity}</p>
                    <p className="text-[9px] text-white/30 uppercase">Capacity</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-400">₹{formatCurrency(pt.revenue)}</p>
                    <p className="text-[9px] text-white/30 uppercase">Revenue</p>
                  </div>
                </div>
              </div>

            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: MERCHANDISE SALES & INVENTORY TELEMETRY                           */}
      {/* ========================================================================= */}
      {activeView === 'merch' && (
        <div className="space-y-6">
          {/* Header Toolbar for Merch View */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#111] border border-white/5 rounded-xl">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <ShoppingBag size={14} className="text-aws-orange" />
                <h3 className="font-sans font-black italic text-base uppercase text-white tracking-wide">
                  Merchandise Realtime Sales &amp; Stock
                </h3>
              </div>
              <span className="font-mono text-[10px] text-white/40">
                Live DB Stock Capacity: <strong className="text-white">{merchStats?.total_capacity || 0} Units</strong> • Remaining: <strong className="text-emerald-400">{merchStats?.remaining_inventory || 0} Units</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenEditInventory}
                className="px-3.5 py-2 bg-aws-orange hover:bg-white text-black font-mono text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,153,0,0.2)] cursor-pointer"
              >
                <Sliders size={13} />
                <span>Update Stock Limits</span>
              </button>
            </div>
          </div>

          {/* Main merch stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {mainMerchCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#111] border border-white/5 p-5 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  <card.icon size={14} className={card.color} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {card.label}
                  </span>
                </div>
                <p className={`font-sans font-black italic text-2xl ${card.color}`}>
                  {card.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Product Stock & Sales Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {merchStats?.by_product?.map((item, i) => {
              const isLowStock = item.remaining <= 15 && item.remaining > 0;
              const isSoldOut = item.remaining === 0;
              const percentSold = item.capacity > 0 ? Math.min(100, Math.round((item.sold / item.capacity) * 100)) : 0;

              return (
                <div key={i} className="bg-[#111] border border-white/5 p-5 rounded-xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <h4 className="font-sans font-bold text-sm text-white truncate">
                          {item.title}
                        </h4>
                        <button
                          type="button"
                          onClick={handleOpenEditInventory}
                          className="p-1 hover:bg-white/10 text-white/40 hover:text-aws-orange rounded transition-colors"
                          title="Edit Stock Limit"
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                      {isSoldOut ? (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[9px] font-mono font-bold uppercase shrink-0">
                          Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1 shrink-0">
                          <AlertTriangle size={10} /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-mono font-bold uppercase shrink-0">
                          In Stock
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-1.5">
                      <span>Inventory Sold: {item.sold}/{item.capacity}</span>
                      <span className="font-bold text-white">{percentSold}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          percentSold >= 90 ? 'bg-red-500' : percentSold >= 60 ? 'bg-aws-orange' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${percentSold}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/5 font-mono">
                    <div>
                      <p className="text-lg font-bold text-white">{item.sold}</p>
                      <p className="text-[9px] text-white/30 uppercase">Sold</p>
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${item.remaining <= 10 ? 'text-amber-400' : 'text-purple-400'}`}>
                        {item.remaining}
                      </p>
                      <p className="text-[9px] text-white/30 uppercase">Stock Left</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-400">₹{formatCurrency(item.revenue)}</p>
                      <p className="text-[9px] text-white/30 uppercase">Revenue</p>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

          {/* Fulfillment Status Pipeline Summary */}
          {merchStats?.fulfillment_breakdown && (
            <div className="bg-[#111] border border-white/5 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-aws-orange" />
                  <h4 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
                    Merchandise Fulfillment Pipeline
                  </h4>
                </div>
                <span className="font-mono text-[10px] text-white/40">
                  Total Active Orders: {merchStats.total_orders}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock size={14} className="text-amber-400" />
                    <span>Paid (In Queue)</span>
                  </div>
                  <span className="font-bold text-white text-sm">
                    {merchStats.fulfillment_breakdown['PAID'] || 0}
                  </span>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/60">
                    <Package size={14} className="text-purple-400" />
                    <span>Processing</span>
                  </div>
                  <span className="font-bold text-white text-sm">
                    {merchStats.fulfillment_breakdown['PROCESSING'] || 0}
                  </span>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/60">
                    <Truck size={14} className="text-sky-400" />
                    <span>Dispatched</span>
                  </div>
                  <span className="font-bold text-white text-sm">
                    {merchStats.fulfillment_breakdown['DISPATCHED'] || 0}
                  </span>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/60">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Delivered</span>
                  </div>
                  <span className="font-bold text-white text-sm">
                    {merchStats.fulfillment_breakdown['DELIVERED'] || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Adjust Inventory Stock Modal from Overview Dashboard */}
      {isEditingInventory && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsEditingInventory(false)}
        >
          <div
            className="bg-[#0e0e0e] border border-white/15 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-[10px] text-aws-orange uppercase font-bold tracking-widest">
                  DATABASE STOCK CONFIGURATION
                </span>
                <h3 className="font-sans font-black italic text-lg uppercase tracking-tight text-white">
                  Update Merchandise Inventory
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingInventory(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {inventoryFeedback?.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-mono text-xs flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>{inventoryFeedback.error}</span>
              </div>
            )}

            {inventoryFeedback?.success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-mono text-xs flex items-center gap-2">
                <Check size={14} />
                <span>{inventoryFeedback.success}</span>
              </div>
            )}

            <div className="space-y-4 font-mono text-xs">
              {/* Bag + Bottle */}
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-white/80">
                  <label className="uppercase text-[11px] font-bold text-white">
                    SCD Official Bag + Bottle
                  </label>
                  <span className="text-[10px] text-white/40">
                    Sold: {merchStats?.by_product?.find(p => p.id === 'bag')?.sold || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={inventoryForm['bag'] ?? 150}
                    onChange={(e) =>
                      setInventoryForm({
                        ...inventoryForm,
                        bag: Math.max(0, Number(e.target.value))
                      })
                    }
                    className="w-full bg-black/60 border border-white/15 px-3 py-2 rounded-lg text-white font-mono focus:border-aws-orange focus:outline-none"
                  />
                  <span className="text-[10px] text-white/40 uppercase whitespace-nowrap">Units</span>
                </div>
                <div className="text-[10px] text-white/50 flex justify-between">
                  <span>Live Remaining:</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.max(
                      0,
                      (inventoryForm['bag'] ?? 150) -
                        (merchStats?.by_product?.find(p => p.id === 'bag')?.sold || 0)
                    )} Units
                  </span>
                </div>
              </div>

              {/* Welcome Kit */}
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-white/80">
                  <label className="uppercase text-[11px] font-bold text-white">
                    SCD Official Welcome Kit
                  </label>
                  <span className="text-[10px] text-white/40">
                    Sold: {merchStats?.by_product?.find(p => p.id === 'welcome-kit')?.sold || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={inventoryForm['welcome-kit'] ?? 150}
                    onChange={(e) =>
                      setInventoryForm({
                        ...inventoryForm,
                        'welcome-kit': Math.max(0, Number(e.target.value))
                      })
                    }
                    className="w-full bg-black/60 border border-white/15 px-3 py-2 rounded-lg text-white font-mono focus:border-aws-orange focus:outline-none"
                  />
                  <span className="text-[10px] text-white/40 uppercase whitespace-nowrap">Units</span>
                </div>
                <div className="text-[10px] text-white/50 flex justify-between">
                  <span>Live Remaining:</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.max(
                      0,
                      (inventoryForm['welcome-kit'] ?? 150) -
                        (merchStats?.by_product?.find(p => p.id === 'welcome-kit')?.sold || 0)
                    )} Units
                  </span>
                </div>
              </div>

              {/* Combo Pack */}
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-white/80">
                  <label className="uppercase text-[11px] font-bold text-white">
                    Bag + Welcome Kit Combo
                  </label>
                  <span className="text-[10px] text-white/40">
                    Sold: {merchStats?.by_product?.find(p => p.id === 'combo')?.sold || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={inventoryForm['combo'] ?? 200}
                    onChange={(e) =>
                      setInventoryForm({
                        ...inventoryForm,
                        combo: Math.max(0, Number(e.target.value))
                      })
                    }
                    className="w-full bg-black/60 border border-white/15 px-3 py-2 rounded-lg text-white font-mono focus:border-aws-orange focus:outline-none"
                  />
                  <span className="text-[10px] text-white/40 uppercase whitespace-nowrap">Units</span>
                </div>
                <div className="text-[10px] text-white/50 flex justify-between">
                  <span>Live Remaining:</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.max(
                      0,
                      (inventoryForm['combo'] ?? 200) -
                        (merchStats?.by_product?.find(p => p.id === 'combo')?.sold || 0)
                    )} Units
                  </span>
                </div>
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
                {inventorySaving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                <span>Save Stock Limits</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

