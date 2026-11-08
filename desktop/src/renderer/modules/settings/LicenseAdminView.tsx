import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Power, 
  Edit3, 
  Plus, 
  Save, 
  X,
  Store,
  Layers,
  Clock
} from 'lucide-react';
import { API_URL } from '../../services/api';

interface License {
  id: string;
  tenant_slug: string;
  outlet_name: string;
  status: 'active' | 'suspended' | 'expired';
  plan_name: string;
  expires_at: string;
  max_terminals: number;
  allowed_modules: string;
  admin_notes?: string;
  created_at: string;
}

export const LicenseAdminView: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLicense, setEditingLicense] = useState<Partial<License> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/licenses`);
      const data = await res.json();
      setLicenses(data.licenses || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLicense?.tenant_slug || !editingLicense?.outlet_name || !editingLicense?.expires_at) {
      alert('Please fill Tenant Slug, Outlet Name and Expiry Date.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/licenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLicense)
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Software license updated successfully.');
        setTimeout(() => setMsg(''), 3000);
        setIsModalOpen(false);
        setEditingLicense(null);
        loadLicenses();
      } else {
        alert(data.error || 'Failed to update license.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleStatus = async (lic: License) => {
    const nextStatus = lic.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`${API_URL}/licenses/${lic.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadLicenses();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#F8FAFC] overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#1C3F32] text-amber-300 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Software Availability &amp; License Admin</h1>
            <p className="text-xs text-slate-500 font-semibold">
              Manage validity periods, service availability, and module permissions for all client versions.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingLicense({
              status: 'active',
              plan_name: 'Standard Unit',
              expires_at: '2027-12-31',
              max_terminals: 5,
              allowed_modules: 'pos,orders,wallet,menu,inventory,reports,settings,digital_menu'
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#1C3F32] hover:bg-[#142E25] text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md shadow-emerald-900/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Outlet License</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Outlets License Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {licenses.map((lic) => {
          const today = new Date().toISOString().split('T')[0];
          const isExpired = lic.expires_at < today;
          const isSuspended = lic.status === 'suspended';

          return (
            <div 
              key={lic.id} 
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all relative overflow-hidden ${
                isSuspended ? 'border-amber-300 bg-amber-50/20' : isExpired ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 hover:shadow-md'
              }`}
            >
              {/* Status Pill */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isSuspended
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : isExpired
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-amber-500' : isExpired ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  {isSuspended ? 'Suspended' : isExpired ? 'Expired' : 'Active & Licensed'}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setEditingLicense(lic);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                    title="Edit Expiry & Settings"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleStatus(lic)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      lic.status === 'active' 
                        ? 'hover:bg-rose-50 text-slate-400 hover:text-rose-600' 
                        : 'hover:bg-emerald-50 text-amber-600 hover:text-emerald-700'
                    }`}
                    title={lic.status === 'active' ? 'Suspend Outlet' : 'Activate Outlet'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Outlet Info */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-extrabold text-sm text-slate-900">{lic.outlet_name}</h3>
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  Slug: <span className="font-mono text-slate-700 font-bold">{lic.tenant_slug}</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  Plan: <span className="font-bold text-[#1C3F32]">{lic.plan_name}</span>
                </div>
              </div>

              {/* Expiry Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Expiry Date:
                  </span>
                  <span className={`font-black ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                    {lic.expires_at}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Max POS Terminals:</span>
                  <span className="font-bold text-slate-700">{lic.max_terminals} Terminals</span>
                </div>
              </div>

              {lic.admin_notes && (
                <p className="mt-3 text-[10px] text-slate-400 italic">
                  Note: {lic.admin_notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#1C3F32] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-amber-300" />
                <h3 className="font-black text-sm">
                  {editingLicense?.id ? 'Edit Software License' : 'New Outlet Software License'}
                </h3>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingLicense(null); }} 
                className="text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Outlet / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chai Wala Original"
                  value={editingLicense?.outlet_name || ''}
                  onChange={(e) => setEditingLicense({ ...editingLicense, outlet_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:border-[#2E7D32] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Tenant Slug (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. chaiwala-original"
                  value={editingLicense?.tenant_slug || ''}
                  onChange={(e) => setEditingLicense({ ...editingLicense, tenant_slug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:border-[#2E7D32] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Plan</label>
                  <input
                    type="text"
                    value={editingLicense?.plan_name || 'Standard Unit'}
                    onChange={(e) => setEditingLicense({ ...editingLicense, plan_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:border-[#2E7D32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
                  <select
                    value={editingLicense?.status || 'active'}
                    onChange={(e) => setEditingLicense({ ...editingLicense, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:border-[#2E7D32] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Software Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={editingLicense?.expires_at || ''}
                    onChange={(e) => setEditingLicense({ ...editingLicense, expires_at: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:border-[#2E7D32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Max Terminals</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingLicense?.max_terminals || 5}
                    onChange={(e) => setEditingLicense({ ...editingLicense, max_terminals: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:border-[#2E7D32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Admin Notes</label>
                <input
                  type="text"
                  placeholder="Billing terms, contact person, or notes"
                  value={editingLicense?.admin_notes || ''}
                  onChange={(e) => setEditingLicense({ ...editingLicense, admin_notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:border-[#2E7D32] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingLicense(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1C3F32] hover:bg-[#142E25] text-white font-black flex items-center justify-center space-x-1 shadow-md shadow-emerald-900/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save License</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

