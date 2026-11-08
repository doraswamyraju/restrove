import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  CheckCircle2, 
  Save, 
  QrCode, 
  Smartphone, 
  ExternalLink, 
  Copy,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { getSettings, saveSettings, API_URL } from '../../services/api';
import chaiWalaLogoImg from '../../assets/chai-wala-logo.jpg';

export const SettingsView: React.FC = () => {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [outletName, setOutletName] = useState('Chai Wala Original');
  const [branchAddress, setBranchAddress] = useState('Shop #4, Near Clock Tower, Tirupati, AP');
  const [fssaiNumber, setFssaiNumber] = useState('10123028000451');
  const [gstNumber, setGstNumber] = useState('37AAAAA0000A1Z5');
  const [showGstBreakdown, setShowGstBreakdown] = useState<'true' | 'false'>('false');
  const [footerMessage, setFooterMessage] = useState('Thank you for visiting! Have a fresh cutting chai day ☕');
  const [autoPrintToken, setAutoPrintToken] = useState('true');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState<any>(null);

  // Digital Menu URL
  const digitalMenuUrl = 'https://restrove.sriddha.com/#/digital-menu';

  useEffect(() => {
    getSettings().then((s) => {
      if (s) {
        setOutletName(s.outletName || 'Chai Wala Original');
        setBranchAddress(s.branchAddress || 'Shop #4, Near Clock Tower, Tirupati, AP');
        setFssaiNumber(s.fssaiNumber || '10123028000451');
        setGstNumber(s.gstNumber || '37AAAAA0000A1Z5');
        setShowGstBreakdown(s.showGstBreakdown === 'true' ? 'true' : 'false');
        setPaperWidth(s.paperWidth === '58mm' ? '58mm' : '80mm');
        setFooterMessage(s.footerMessage || 'Thank you for visiting! Have a fresh cutting chai day ☕');
        setAutoPrintToken(s.autoPrintToken || 'true');
      }
    });

    // Fetch vendor validity & software status
    fetch(`${API_URL}/licenses/check/chaiwala-original`)
      .then((r) => r.json())
      .then((lic) => setLicenseInfo(lic))
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({
      outletName,
      branchAddress,
      fssaiNumber,
      gstNumber,
      showGstBreakdown,
      paperWidth,
      footerMessage,
      autoPrintToken
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2200);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(digitalMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Cafeteria, Thermal Printer &amp; Digital QR Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configured in SQLite database: 58mm/80mm profiles, customer invoice template, and table QR menu card.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#2E7D32]/20"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Settings Saved to DB!' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Software Validity & License Badge */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Software License &amp; Validity
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                licenseInfo?.available
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {licenseInfo?.available ? '● Active License' : '● Inactive / Suspended'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Vendor / Outlet</span>
                <span className="font-black text-slate-800">{licenseInfo?.outletName || 'Chai Wala Original'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Subscription Plan</span>
                <span className="font-black text-emerald-800">{licenseInfo?.planName || 'Enterprise Cafeteria'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" /> Valid Until
                </span>
                <span className="font-black text-slate-900">{licenseInfo?.expiresAt || '2027-12-31'}</span>
              </div>
            </div>
          </div>

          {/* Digital QR Menu Card Section */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-[#2E7D32]" />
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Digital Menu Card &amp; QR Table Ordering
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                Live Online
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Customers can scan this QR code on cafeteria tables to view the live digital menu card and place orders directly.
            </p>

            <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={digitalMenuUrl}
                className="flex-1 bg-transparent text-xs font-bold text-slate-700 outline-none"
              />
              <button
                onClick={copyUrl}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Thermal Printer Profile */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <Printer className="w-5 h-5 text-[#2E7D32]" />
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Thermal Printer Configuration
              </h3>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Paper Roll Width</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaperWidth('80mm')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    paperWidth === '80mm'
                      ? 'border-[#2E7D32] bg-emerald-50 text-[#2E7D32] shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-black">80 mm (3-inch Standard)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Kitchen &amp; Counter POS</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaperWidth('58mm')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    paperWidth === '58mm'
                      ? 'border-[#2E7D32] bg-emerald-50 text-[#2E7D32] shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-black">58 mm (2-inch Compact)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Portable Bluetooth Token</div>
                </button>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPrintToken === 'true'}
                  onChange={(e) => setAutoPrintToken(e.target.checked ? 'true' : 'false')}
                  className="rounded text-[#2E7D32] focus:ring-[#2E7D32] w-4 h-4"
                />
                <span>Auto-trigger token printing on checkout</span>
              </label>
            </div>
          </div>

          {/* Business & Tax Details */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Cafeteria Invoice Details
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Outlet Name</label>
              <input
                type="text"
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Address &amp; Phone Line</label>
              <input
                type="text"
                value={branchAddress}
                onChange={(e) => setBranchAddress(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">FSSAI License #</label>
                <input
                  type="text"
                  value={fssaiNumber}
                  onChange={(e) => setFssaiNumber(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                />
              </div>
            </div>

            {/* GST Disclosure Status */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70 flex items-center justify-between">
              <div>
                <label className="text-xs font-black text-emerald-950 block">
                  Tax Setting: Flat Composition Pricing (Zero GST)
                </label>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  GST is strictly disabled across POS, Digital Menu, Invoices and Thermal Prints.
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                Active
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Footer Message</label>
              <input
                type="text"
                value={footerMessage}
                onChange={(e) => setFooterMessage(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Thermal Simulator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
            Simulated {paperWidth} Live Thermal Token Receipt
          </span>

          <div className={`bg-white p-4 border border-slate-300 rounded-md shadow-lg font-mono text-xs text-slate-900 leading-tight transition-all ${
            paperWidth === '80mm' ? 'w-72' : 'w-56'
          }`}>
            <div className="text-center mb-2">
              <img src={chaiWalaLogoImg} alt="Chai Wala" className="h-8 mx-auto object-contain mb-1" />
              <div className="font-extrabold text-xs">{outletName}</div>
              <div className="text-[9px] text-slate-500">{branchAddress}</div>
              <div className="text-[8px] text-slate-400 mt-0.5">FSSAI: {fssaiNumber}</div>
            </div>

            <div className="border-t border-dashed border-slate-400 my-1.5" />

            {/* Token */}
            <div className="text-center py-1 bg-slate-100 rounded">
              <span className="text-[10px] font-bold">TOKEN NUMBER</span>
              <div className="text-xl font-black">#T-1482</div>
            </div>

            <div className="text-[9px] text-slate-500 flex justify-between my-1">
              <span>Date: 02-Nov-2026</span>
              <span>Time: 12:42 PM</span>
            </div>

            <div className="border-t border-dashed border-slate-400 my-1.5" />

            {/* Items */}
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between font-bold">
                <span>ITEM</span>
                <span>QTY x RATE</span>
                <span>AMT</span>
              </div>
              <div className="flex justify-between">
                <span>Irani Dum Chai</span>
                <span>2 x 20</span>
                <span>40.00</span>
              </div>
              <div className="flex justify-between">
                <span>Classic Maska Bun</span>
                <span>2 x 35</span>
                <span>70.00</span>
              </div>
              <div className="flex justify-between">
                <span>Aloo Samosa (2 pcs)</span>
                <span>1 x 40</span>
                <span>40.00</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-400 my-1.5" />

            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>150.00</span>
              </div>
              <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-slate-300">
                <span>TOTAL</span>
                <span>₹150.00</span>
              </div>
              <div className="text-[9px] text-slate-500 pt-0.5">
                Paid via: <span className="font-bold">UPI / Customer Wallet</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2" />

            <div className="text-center text-[9px] text-slate-600">
              <p>{footerMessage}</p>
              <div className="mt-1.5 text-[8px] text-slate-400">
                --- Powered by Restrove POS ---
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
