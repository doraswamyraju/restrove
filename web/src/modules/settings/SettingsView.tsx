import React, { useState } from 'react';
import { 
  Printer, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  Sliders, 
  FileText, 
  Save
} from 'lucide-react';
import chaiWalaLogoImg from '../assets/chai-wala-logo.jpg';

export const SettingsView: React.FC = () => {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [outletName, setOutletName] = useState('Chai Wala Original');
  const [branchAddress, setBranchAddress] = useState('Shop #4, Near Clock Tower, Tirupati, AP');
  const [fssaiNumber, setFssaiNumber] = useState('10123028000451');
  const [gstNumber, setGstNumber] = useState('37AAAAA0000A1Z5');
  const [footerMessage, setFooterMessage] = useState('Thank you for visiting! Have a fresh cutting chai day ☕');
  const [autoPrintKOT, setAutoPrintKOT] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Cafeteria &amp; Thermal Printer Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure thermal receipt templates, 58mm/80mm print profiles, and business credentials.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#2E7D32]/20"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Settings Saved!' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Main Grid: Form Left, Thermal Receipt Preview Right */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-6">
          {/* Printer Profile */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Printer className="w-5 h-5 text-[#2E7D32]" />
              <h3 className="font-extrabold text-slate-900 text-sm">Thermal Printer Configuration</h3>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Paper Roll Width</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaperWidth('80mm')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    paperWidth === '80mm'
                      ? 'border-[#2E7D32] bg-emerald-50 text-[#2E7D32] shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-extrabold">80 mm (3-inch)</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Counter POS Standard</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaperWidth('58mm')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    paperWidth === '58mm'
                      ? 'border-[#2E7D32] bg-emerald-50 text-[#2E7D32] shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-extrabold">58 mm (2-inch)</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Portable Bluetooth Printer</div>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPrintKOT}
                  onChange={(e) => setAutoPrintKOT(e.target.checked)}
                  className="rounded text-[#2E7D32] focus:ring-[#2E7D32] w-4 h-4"
                />
                <span>Auto-print Counter Token on order completion</span>
              </label>
            </div>
          </div>

          {/* Business & Tax Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#2E7D32]" />
              <h3 className="font-extrabold text-slate-900 text-sm">Receipt Header &amp; Compliance</h3>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Outlet / Business Name</label>
              <input
                type="text"
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Address &amp; Phone Line</label>
              <input
                type="text"
                value={branchAddress}
                onChange={(e) => setBranchAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">FSSAI License #</label>
                <input
                  type="text"
                  value={fssaiNumber}
                  onChange={(e) => setFssaiNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Receipt Footer Note</label>
              <textarea
                rows={2}
                value={footerMessage}
                onChange={(e) => setFooterMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
              />
            </div>
          </div>
        </div>

        {/* Live Thermal Receipt Simulator */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
            Live {paperWidth} Thermal Receipt Preview
          </span>

          <div className={`bg-white p-5 border border-slate-300 rounded-md shadow-lg font-mono text-xs text-slate-900 leading-tight transition-all ${
            paperWidth === '80mm' ? 'w-80' : 'w-64'
          }`}>
            {/* Header with Chai Wala Logo */}
            <div className="text-center mb-3">
              <img src={chaiWalaLogoImg} alt="Chai Wala" className="h-10 mx-auto object-contain mb-1" />
              <div className="font-extrabold text-sm">{outletName}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{branchAddress}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">FSSAI: {fssaiNumber} | GST: {gstNumber}</div>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2" />

            {/* Token Highlight */}
            <div className="text-center py-1 bg-slate-100 rounded my-1">
              <span className="text-[11px] font-bold">TOKEN #</span>
              <div className="text-xl font-black">#T-1482</div>
            </div>

            <div className="text-[10px] text-slate-500 flex justify-between my-1">
              <span>Date: 02-Nov-2026</span>
              <span>Time: 12:42 PM</span>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2" />

            {/* Line Items */}
            <div className="space-y-1 text-[11px]">
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

            <div className="border-t border-dashed border-slate-400 my-2" />

            {/* Calculations */}
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>150.00</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>7.50</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-300">
                <span>TOTAL</span>
                <span>₹157.50</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-0.5">
                Paid via: <span className="font-bold">UPI QR Payment</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-400 my-3" />

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-600">
              <p>{footerMessage}</p>
              <div className="mt-2 text-[9px] text-slate-400">
                --- Powered by Restrove POS ---
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
