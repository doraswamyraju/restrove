import React, { useState } from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  settings?: any;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  settings = {}
}) => {
  const [printFormat, setPrintFormat] = useState<'80mm' | '58mm' | 'a4'>(
    settings.paperWidth === '58mm' ? '58mm' : '80mm'
  );

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const outletName = settings.outletName || 'CHAI WALA ORIGINAL';
  const branchAddress = settings.branchAddress || 'Shop #4, Near Clock Tower, Tirupati, AP';
  const gstNumber = settings.gstNumber || '37AAAAA0000A1Z5';
  const fssaiNumber = settings.fssaiNumber || '10123028000451';
  const footerMessage = settings.footerMessage || 'Thank you for visiting! Have a fresh cutting chai day ☕';
  const showGst = settings.showGstBreakdown !== 'false';

  const items = order.items || [];
  const subtotal = Number(order.subtotal || order.amount * (showGst ? 0.95 : 1));
  const taxAmount = showGst ? Number(order.taxAmount || order.amount * 0.05) : 0;
  const totalAmount = Number(order.amount || subtotal + taxAmount);

  const printWidthCss = printFormat === '58mm' ? '48mm' : printFormat === 'a4' ? '180mm' : '72mm';

  return (
    <>
      {/* On-screen Preview Dialog */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header Bar */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Printer className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider">Thermal Bill Preview</span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Paper Format Selector Bar */}
          <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500 text-[11px]">Paper Profile:</span>
            <div className="flex space-x-1">
              {[
                { id: '80mm', label: '3" Thermal (80mm)' },
                { id: '58mm', label: '2" Thermal (58mm)' },
                { id: 'a4', label: 'Standard A4' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPrintFormat(f.id as any)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                    printFormat === f.id
                      ? 'bg-[#1C3F32] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Printable Ticket Preview */}
          <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-slate-800 bg-[#FCFBF7] flex justify-center">
            <div className={`transition-all ${printFormat === '58mm' ? 'w-56' : printFormat === 'a4' ? 'w-full' : 'w-72'}`}>
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h3 className="font-black text-sm tracking-wide">{outletName}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{branchAddress}</p>
                <div className="text-[10px] text-slate-500 mt-1">
                  {showGst && <span>GSTIN: {gstNumber} • </span>}
                  <span>FSSAI: {fssaiNumber}</span>
                </div>
              </div>

              {/* Token & Order Metadata */}
              <div className="py-2.5 border-b border-dashed border-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">TOKEN NUMBER</span>
                  <span className="font-black text-base text-slate-900">{order.orderNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">{order.serviceType}</span>
                  <span className="text-[11px] font-bold text-slate-700">{order.time || 'Just now'}</span>
                </div>
              </div>

              {/* Customer Details */}
              {(order.customerName || order.customerPhone) && (
                <div className="py-1.5 border-b border-dashed border-slate-300 text-[11px] text-slate-600">
                  <span>Guest: </span>
                  <span className="font-bold text-slate-900">{order.customerName}</span>
                  {order.customerPhone && <span className="ml-1 text-slate-500">({order.customerPhone})</span>}
                </div>
              )}

              {/* Line Items Table */}
              <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Item</span>
                  <span>Qty × Rate</span>
                  <span>Amount</span>
                </div>
                {items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 truncate max-w-[130px]">{it.name}</span>
                    <span className="text-slate-500 text-[11px]">{it.qty} × ₹{it.rate}</span>
                    <span className="font-black text-slate-900">₹{(it.qty * it.rate).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Financials */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {showGst && (
                  <div className="flex justify-between text-slate-500">
                    <span>GST (5%)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL PAID</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 pt-0.5">
                  <span>Payment Mode</span>
                  <span className="font-bold">{order.paymentMethod} (PAID)</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-3 text-[10px] text-slate-500 italic">
                {footerMessage}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-3 bg-white border-t border-slate-200 flex space-x-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-black flex items-center justify-center space-x-1.5 shadow-md shadow-[#2E7D32]/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print {printFormat === 'a4' ? 'A4 Invoice' : `${printFormat} Receipt`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden DOM for Window Print - Adapts automatically to Thermal Roll or A4 */}
      <div id="thermal-print-area" className="hidden">
        <div style={{ fontFamily: 'monospace', fontSize: '11px', width: printWidthCss, margin: '0 auto', padding: '0 2mm' }}>
          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{outletName}</div>
            <div style={{ fontSize: '10px' }}>{branchAddress}</div>
            {showGst && <div style={{ fontSize: '9px' }}>GSTIN: {gstNumber}</div>}
            <div style={{ fontSize: '9px' }}>FSSAI: {fssaiNumber}</div>
          </div>
          <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
            <span>TOKEN: {order.orderNumber}</span>
            <span>{order.serviceType}</span>
          </div>
          <div style={{ fontSize: '10px' }}>
            Date: {new Date(order.createdAt || Date.now()).toLocaleDateString()} {order.time || ''}
          </div>
          {order.customerName && (
            <div style={{ fontSize: '10px' }}>Customer: {order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ''}</div>
          )}
          <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
          <table style={{ width: '100%', fontSize: '10px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ padding: '2px 0' }}>Item</th>
                <th style={{ textAlign: 'center', padding: '2px 0' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '2px 0' }}>Rate</th>
                <th style={{ textAlign: 'right', padding: '2px 0' }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any, i: number) => (
                <tr key={i}>
                  <td style={{ padding: '2px 0' }}>{it.name}</td>
                  <td style={{ textAlign: 'center', padding: '2px 0' }}>{it.qty}</td>
                  <td style={{ textAlign: 'right', padding: '2px 0' }}>{it.rate}</td>
                  <td style={{ textAlign: 'right', padding: '2px 0' }}>{(it.qty * it.rate).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {showGst && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span>GST (5%):</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', borderTop: '1px solid #000', paddingTop: '2px' }}>
            <span>TOTAL:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '2px' }}>
            <span>Mode:</span>
            <span>{order.paymentMethod} (PAID)</span>
          </div>
          <div style={{ borderTop: '1px dashed #000', margin: '6px 0 4px 0' }} />
          <div style={{ textAlign: 'center', fontSize: '9px' }}>
            {footerMessage}
          </div>
        </div>
      </div>
    </>
  );
};
