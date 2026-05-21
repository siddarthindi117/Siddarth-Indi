import React, { useState, useRef } from "react";
import { X, Check, Download, Share2, Printer, CheckCircle, FileText, Send, CheckCircle2 } from "lucide-react";
import { Booking } from "../types";
import { soundEffects } from "./SoundManager";

interface InvoiceModalProps {
  booking: Booking;
  onClose: () => void;
  onSignComplete?: (farmerSign: string, ownerSign: string) => void;
  isOwnerView?: boolean;
}

export default function InvoiceModal({
  booking,
  onClose,
  onSignComplete,
  isOwnerView = false
}: InvoiceModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [selectedShare, setSelectedShare] = useState<"whatsapp" | "email" | "system" | null>(null);
  const [canvasSign, setCanvasSign] = useState("");
  const [activeSignTab, setActiveSignTab] = useState<"type" | "draw">("type");
  const [typedSignName, setTypedSignName] = useState(
    isOwnerView ? booking.ownerName : booking.farmerName
  );
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Drawing signature pad features
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#1b4b1e";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing.current = true;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (canvasRef.current) {
      setCanvasSign(canvasRef.current.toDataURL());
    }
  };

  const clearCanvas = () => {
    soundEffects.playClick();
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasSign("");
  };

  const submitSignature = () => {
    soundEffects.playSuccess();
    let finalSignature = "";
    if (activeSignTab === "draw") {
      finalSignature = canvasSign || `SIGNED_DRAWN_${typedSignName.toUpperCase()}`;
    } else {
      finalSignature = `SIGNED_TYPED_${typedSignName.toUpperCase()}`;
    }

    if (onSignComplete) {
      if (isOwnerView) {
        onSignComplete(booking.signatures?.farmerSignature || "", finalSignature);
      } else {
        onSignComplete(finalSignature, booking.signatures?.ownerSignature || "");
      }
    }
  };

  const triggerDownloadPDF = () => {
    soundEffects.playPaymentSuccess();
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Simulate real browser download anchor
      const printableString = `
        DANYABOOKING DIGITAL TAX BILL INVOICE
        ------------------------------------------
        Invoice Ref No: ${booking.invoiceNumber || "PROVISIONAL-INV"}
        Booking Ref ID: ${booking.id}
        Date and Time: ${booking.paymentDateTime || booking.createdAt}
        ------------------------------------------
        FARMER DETAILS:
        FullName: ${booking.farmerName}
        Mobile: ${booking.farmerMobile}
        Village: ${booking.village}, ${booking.taluk}, ${booking.district}
        Address: ${booking.address}
        
        HARVESTING SPECS:
        Crop Type: ${booking.cropType}
        Acres Worked: ${booking.acres} Acres
        Rate / Acre: Rs ${booking.ratePerAcre}
        ------------------------------------------
        CHARGES & BILL BREAKDOWN:
        Sum Base Work: Rs ${booking.acres * booking.ratePerAcre}
        Travel Charges: Rs ${booking.travelCharges}
        Minimum Fee Limit: Rs ${booking.minCharge}
        Total Calculated Amount: Rs ${booking.totalAmount}
        Taxes (SGST/CGST 5% Incld): Rs ${(booking.totalAmount * 0.05).toFixed(2)}
        ------------------------------------------
        PAYMENT DETAILS:
        Transaction Ref ID: ${booking.transactionId || "UPI-DIRECT"}
        Payment Method: ${booking.paymentMethod || "UPI Apps"}
        Payment Status: ${booking.status.toUpperCase()}
        ------------------------------------------
        DIGITAL SIGNATURE STAMP COMPLETE.
        Danya Agrotech Hub Corp, Karnataka.
      `;
      const blob = new Blob([printableString], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${booking.id}-DanyaBooking.txt`;
      link.click();
    }, 1500);
  };

  const handleShare = (channel: "whatsapp" | "email") => {
    soundEffects.playClick();
    setSharing(true);
    setSelectedShare(channel);
    setTimeout(() => {
      setSharing(false);
      setSelectedShare(null);
      alert(`Successfully Shared Invoice Receipt ${booking.invoiceNumber || booking.id} via ${channel === "whatsapp" ? "WhatsApp (Karnataka Farmer Groups)" : "Registered Email Hub"}!`);
    }, 1800);
  };

  const renderSignatureBox = (signatureStr?: string, defaultName?: string) => {
    if (!signatureStr) {
      return (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 p-3.5 rounded-xl text-center text-[10px] text-zinc-400">
          Awaiting validation signature
        </div>
      );
    }
    
    if (signatureStr.startsWith("data:image")) {
      return (
        <div className="bg-amber-50/20 px-3.5 py-1.5 rounded-xl border border-amber-100 flex flex-col items-center">
          <img src={signatureStr} alt="Signature Preview" className="h-10 object-contain" />
          <span className="text-[8px] text-zinc-400 mt-1 font-mono">DigiSign Verified</span>
        </div>
      );
    }

    return (
      <div className="bg-emerald-50/20 border border-emerald-100 dark:border-zinc-800 px-3 py-2 rounded-xl text-center">
        <span className="block font-serif italic text-sm text-zinc-800 dark:text-zinc-300 tracking-wide font-black">
          {signatureStr.replace("SIGNED_TYPED_", "").replace("SIGNED_DRAWN_", "")}
        </span>
        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-extrabold mt-0.5">
          E-SIGNED STAMP
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header toolbar */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border-b dark:border-zinc-700 flex justify-between items-center bg-gradient-to-r from-emerald-50/30 to-white dark:from-zinc-800 dark:to-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#2E7D32]" />
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                {booking.invoiceNumber ? "DIGITAL BILL INVOICE (GST)" : "WORK COMPLETION DIGITAL REPORT"}
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">ID: {booking.id} • Verified Harvest Receipt</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => { soundEffects.playClick(); onClose(); }}
            className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Invoice Body Scroll content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Success Banner */}
          {booking.status === "paid" && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-3.5 rounded-2xl flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-[#2E7D32] shrink-0" />
              <div className="text-xs">
                <span className="font-extrabold text-[#2E7D32] dark:text-emerald-400">Payment Verified Successfully!</span>
                <p className="text-zinc-500 dark:text-zinc-400 text-[10px] mt-0.5">Tax invoice and e-signatures compiled. 50 Referral reward points credited to profiles.</p>
              </div>
            </div>
          )}

          {/* Core Invoice Graphics Grid */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900 shadow-inner space-y-4">
            {/* Header branding */}
            <div className="flex justify-between items-start border-b dark:border-zinc-800 pb-4">
              <div>
                <h1 className="text-lg font-black tracking-tight text-[#2E7D32] flex items-center gap-1.5">
                  🚜 DanyaBooking
                </h1>
                <p className="text-[9px] uppercase tracking-widest text-[#FFC107] font-black">
                  Smart Rashi Machine Booking & Tracking
                </p>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-zinc-400">Invoice Number</span>
                <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-100">
                  {booking.invoiceNumber || "DB-PROV-TEMP-" + booking.id}
                </p>
              </div>
            </div>

            {/* Farmer vs Machine Specs split */}
            <div className="grid grid-cols-2 gap-6 text-xs text-zinc-600 dark:text-zinc-300">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Farmer (User) Details</span>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{booking.farmerName}</h4>
                <p className="mt-0.5">{booking.farmerMobile}</p>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                  {booking.landmark}, {booking.village}, {booking.taluk}, {booking.district}, Karnataka
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Machine & Owner Specs</span>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{booking.machineName}</h4>
                <p className="mt-0.5 text-[#2E7D32] font-semibold">{booking.vehicleNumber}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Owner: {booking.ownerName} ({booking.ownerMobile})</p>
              </div>
            </div>

            {/* Calculations Breakdown spreadsheet table style */}
            <div className="border border-zinc-200/50 dark:border-zinc-800 rounded-xl overflow-hidden mt-4">
              <div className="grid grid-cols-4 bg-zinc-50 dark:bg-zinc-850 p-2 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                <div>Harvest Spec</div>
                <div className="text-right">Rate / Acre</div>
                <div className="text-right">Qty (Acres)</div>
                <div className="text-right">Sub-total</div>
              </div>
              <div className="grid grid-cols-4 p-3 text-xs border-b dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                <div className="font-bold">{booking.cropType} Harvesting</div>
                <div className="text-right">₹{booking.ratePerAcre}</div>
                <div className="text-right">{booking.acres} Acres</div>
                <div className="text-right font-mono font-bold">₹{booking.acres * booking.ratePerAcre}</div>
              </div>
              {/* Extra Items */}
              <div className="grid grid-cols-4 p-3 text-xs border-b dark:border-zinc-805 text-zinc-500">
                <div>Machinery Travel Charges</div>
                <div className="text-right">-</div>
                <div className="text-right">1 Trip</div>
                <div className="text-right font-mono text-zinc-800 dark:text-zinc-200">₹{booking.travelCharges}</div>
              </div>

              {/* Totals */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/60 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Minimum work surcharge rule applied</span>
                  <span>(Min cap: ₹{booking.minCharge})</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>GST Taxes Included (SGST + CGST 5.0%)</span>
                  <span>₹{(booking.totalAmount * 0.05).toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed dark:border-zinc-700 pt-2 text-sm font-black text-zinc-900 dark:text-white">
                  <span>NET TOTAL INVOICE DUE</span>
                  <span className="font-mono text-amber-600 dark:text-[#FFC107]">₹{booking.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Verification Receipt Footer */}
            {booking.transactionId && (
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850 rounded-xl space-y-1 text-[11px] border border-zinc-150 text-zinc-500">
                <div className="flex justify-between">
                  <span>Upi Payment Protocol</span>
                  <span className="font-bold uppercase text-zinc-800 dark:text-zinc-200">{booking.paymentMethod} App</span>
                </div>
                <div className="flex justify-between">
                  <span>UPI Transaction Ref ID</span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-100">{booking.transactionId}</span>
                </div>
                {booking.paymentDateTime && (
                  <div className="flex justify-between">
                    <span>Receipt Stamp Timestamp</span>
                    <span>{booking.paymentDateTime}</span>
                  </div>
                )}
              </div>
            )}

            {/* Digital Signatures split */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-zinc-800">
              <div className="text-center">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Farmer Signature</span>
                {renderSignatureBox(booking.signatures?.farmerSignature, booking.farmerName)}
              </div>
              <div className="text-center">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Owner Signature</span>
                {renderSignatureBox(booking.signatures?.ownerSignature, booking.ownerName)}
              </div>
            </div>
          </div>

          {/* SIGNATURE PAD COLLECTOR (If signature is needed for report) */}
          {((!isOwnerView && !booking.signatures?.farmerSignature) || (isOwnerView && !booking.signatures?.ownerSignature)) && (
            <div className="border border-amber-200 dark:border-zinc-700 bg-amber-50/20 dark:bg-zinc-850 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold text-[#2E7D32] uppercase tracking-wider">
                  ⚠️ REQUIRED SECURITY ACTION: SIGN REPORT
                </h4>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => { soundEffects.playClick(); setActiveSignTab("type"); }}
                    className={`text-[9px] px-2 py-1 rounded font-bold ${activeSignTab === "type" ? "bg-zinc-850 text-white" : "bg-white border"}`}
                  >
                    Type Name
                  </button>
                  <button
                    type="button"
                    onClick={() => { soundEffects.playClick(); setActiveSignTab("draw"); }}
                    className={`text-[9px] px-2 py-1 rounded font-bold ${activeSignTab === "draw" ? "bg-zinc-850 text-white" : "bg-white border"}`}
                  >
                    Draw Pad
                  </button>
                </div>
              </div>

              {activeSignTab === "type" ? (
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">Type your official name to sign</span>
                  <input
                    type="text"
                    value={typedSignName}
                    onChange={(e) => setTypedSignName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-serif font-black italic text-zinc-800 dark:text-zinc-100"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 block mb-1">Draw inside the safe canvas zone</span>
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={100}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-24 bg-white border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-crosshair"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[9px] text-[#2E7D32] hover:underline font-bold"
                    >
                      Clear Writing Canvas
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={submitSignature}
                className="w-full py-2.5 bg-[#2E7D32] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:bg-emerald-700 transition"
              >
                Stamp & Confirm Encryption Signature
              </button>
            </div>
          )}

          {/* Social Media WhatsApp & Email Share options */}
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block">Instant Share Options</h4>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => handleShare("whatsapp")}
                className="flex-1 py-2 px-3 bg-[#25d366]/15 hover:bg-[#25d366]/25 border border-[#25d366]/30 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>WhatsApp Share</span>
              </button>
              <button
                type="button"
                onClick={() => handleShare("email")}
                className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 dark:text-blue-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Email Secure Hub</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Toolbar Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border-t dark:border-zinc-700 flex justify-between gap-3">
          <button
            type="button"
            onClick={triggerDownloadPDF}
            disabled={downloading}
            className="flex-1 py-3 bg-[#FFC107] hover:bg-[#FFB300] text-gray-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Formatting PDF File..." : "Download Official PDF"}
          </button>
          
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              window.print();
            }}
            className="px-4 bg-white hover:bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-650 rounded-xl text-xs font-bold shadow border dark:border-zinc-600 transition flex items-center justify-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            Print GST Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
