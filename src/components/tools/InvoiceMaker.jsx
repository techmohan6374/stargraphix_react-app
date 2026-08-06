import { useState, useEffect, useRef } from 'react';
import Icon from '../icons/Icons';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function InvoiceMaker() {
  // Predefined primary colors for theme mapping
  const themes = [
    { name: 'Indigo Sleek', hex: '#4f46e5' },
    { name: 'Emerald Clean', hex: '#059669' },
    { name: 'Teal Modern', hex: '#0d9488' },
    { name: 'Rose Creative', hex: '#e11d48' },
    { name: 'Charcoal Bold', hex: '#374151' }
  ];

  const templates = [
    { id: 'modern', name: 'Modern Split' },
    { id: 'classic', name: 'Classic Letterhead' },
    { id: 'minimalist', name: 'Minimalist' }
  ];

  // Invoice State variables
  const [invoiceNo, setInvoiceNo] = useState('SG-2026-0089');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  
  const [companyName, setCompanyName] = useState('Star Graphix');
  const [companyEmail, setCompanyEmail] = useState('billing@stargraphix.com');
  const [companyAddress, setCompanyAddress] = useState('12 Market St, Salem, TN, IN');
  const [companyPhone, setCompanyPhone] = useState('+91 98765 43210');
  
  const [clientName, setClientName] = useState('Salem Textiles Ltd.');
  const [clientEmail, setClientEmail] = useState('accounts@salemtextiles.com');
  const [clientAddress, setClientAddress] = useState('45 Industrial Area, Salem, TN, IN');
  
  const [logo, setLogo] = useState(null);
  const [items, setItems] = useState([
    { id: 1, desc: 'Premium Label Vector Design (CODE128)', qty: 2, rate: 1200, tax: 18 },
    { id: 2, desc: 'QR Overlay Branding Mockups', qty: 1, rate: 850, tax: 18 }
  ]);
  
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [notes, setNotes] = useState('Thank you for choosing Star Graphix! Please process the payment within 15 days.');
  const [paymentDetails, setPaymentDetails] = useState('Bank Name: State Bank of India\nA/C No: 987654321098\nIFSC: SBIN0004561\nUPI: stargraphix@upi');

  const [activeTheme, setActiveTheme] = useState(themes[0].hex);
  const [activeTemplate, setActiveTemplate] = useState('modern');
  const [currency, setCurrency] = useState('₹');

  const previewRef = useRef(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('invoice_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setInvoiceNo(draft.invoiceNo || 'SG-2026-0089');
        setCompanyName(draft.companyName || 'Star Graphix');
        setCompanyEmail(draft.companyEmail || 'billing@stargraphix.com');
        setCompanyAddress(draft.companyAddress || '12 Market St, Salem, TN, IN');
        setCompanyPhone(draft.companyPhone || '+91 98765 43210');
        setClientName(draft.clientName || 'Salem Textiles Ltd.');
        setClientEmail(draft.clientEmail || 'accounts@salemtextiles.com');
        setClientAddress(draft.clientAddress || '45 Industrial Area, Salem, TN, IN');
        setItems(draft.items || []);
        setDiscount(draft.discount || 0);
        setShipping(draft.shipping || 0);
        setNotes(draft.notes || '');
        setPaymentDetails(draft.paymentDetails || '');
        setActiveTheme(draft.activeTheme || themes[0].hex);
        setActiveTemplate(draft.activeTemplate || 'modern');
        setCurrency(draft.currency || '₹');
      } catch (e) {
        // error parsing draft
      }
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = () => {
    const draft = {
      invoiceNo, date, dueDate, companyName, companyEmail, companyAddress, companyPhone,
      clientName, clientEmail, clientAddress, items, discount, shipping, notes, paymentDetails,
      activeTheme, activeTemplate, currency
    };
    localStorage.setItem('invoice_draft', JSON.stringify(draft));
    toast.success('Invoice draft saved locally!');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Line Items calculations
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      desc: 'New Service Item',
      qty: 1,
      rate: 100,
      tax: 18
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let parsed = value;
        if (field === 'qty') parsed = parseInt(value) || 0;
        if (field === 'rate') parsed = parseFloat(value) || 0;
        if (field === 'tax') parsed = parseFloat(value) || 0;
        return { ...item, [field]: parsed };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, curr) => acc + (curr.qty * curr.rate), 0);
  };

  const calculateTaxes = () => {
    return items.reduce((acc, curr) => acc + (curr.qty * curr.rate * (curr.tax / 100)), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxes = calculateTaxes();
    const discountAmt = subtotal * (discount / 100);
    return subtotal + taxes + parseFloat(shipping || 0) - discountAmt;
  };

  // Export PDF using html2canvas & jsPDF
  const exportPDF = async () => {
    const element = previewRef.current;
    if (!element) return;

    toast.loading('Compiling print layout & generating PDF...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution scale
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 Width in mm
      const pageHeight = 297; // A4 Height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`stargraphix_invoice_${invoiceNo}.pdf`);
      
      toast.dismiss();
      toast.success('Invoice PDF downloaded!');
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error('Error generating PDF file.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <Icon name="FileText" size={18} />
            </span>
            Professional Invoice Maker
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Build, brand, and generate customized billing sheets. Customize colors, add tax schedules, and download vector PDF records.
          </p>
        </div>

        <div className="flex gap-2 self-start md:self-auto">
          <button
            onClick={saveDraft}
            className="border border-gray-250 hover:bg-gray-100 bg-white px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Icon name="Check" size={14} /> Save Draft
          </button>
          
          <button
            onClick={exportPDF}
            className="btn-primary py-2.5 px-4 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-md hover:shadow-lg transition-transform"
          >
            <Icon name="Download" size={14} /> Export to PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Form Editor Controls */}
        <div className="lg:col-span-6 bg-gray-50 border border-gray-200 rounded-3xl p-6 flex flex-col gap-6 max-h-[750px] overflow-y-auto">
          
          {/* Template & Accent Theme Customizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Invoice Style</label>
              <select
                value={activeTemplate}
                onChange={(e) => setActiveTemplate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Accent Theme</label>
              <div className="flex items-center gap-2 mt-1">
                {themes.map(t => (
                  <button
                    key={t.hex}
                    onClick={() => setActiveTheme(t.hex)}
                    className="w-6 h-6 rounded-full border-2 transition-transform duration-200 relative flex items-center justify-center hover:scale-110"
                    style={{
                      backgroundColor: t.hex,
                      borderColor: activeTheme === t.hex ? '#000000' : 'transparent'
                    }}
                    title={t.name}
                  >
                    {activeTheme === t.hex && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Invoice ID & Dates */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Invoice Meta</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500">Invoice No.</label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500">Issue Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Company Details (Sender) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Sender Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500">Sender Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500">Brand Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-xs mt-1 block"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500">Email Address</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500">Contact Number</label>
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500">Street Address</label>
              <textarea
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                rows="2"
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Client Details (Recipient) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Client Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500">Client Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500">Shipping / Street Address</label>
              <textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                rows="2"
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Line Items List */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Line Items</h4>
              <button
                onClick={addItem}
                className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-150 text-indigo-600 text-[10px] font-bold transition-colors flex items-center gap-1"
              >
                <Icon name="Plus" size={10} /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-indigo-600 font-bold">Item #{index + 1}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <Icon name="Trash" size={12} />
                    </button>
                  </div>
                  <div>
                    <label className="text-[9px] font-semibold text-gray-400">Description</label>
                    <input
                      type="text"
                      value={item.desc}
                      onChange={(e) => updateItem(item.id, 'desc', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs rounded py-1 px-2 mt-0.5 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] font-semibold text-gray-400">Rate ({currency})</label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs rounded py-1 px-2 mt-0.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold text-gray-400">Quantity</label>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs rounded py-1 px-2 mt-0.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold text-gray-400">GST / Tax %</label>
                      <input
                        type="number"
                        value={item.tax}
                        onChange={(e) => updateItem(item.id, 'tax', e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs rounded py-1 px-2 mt-0.5 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Adjustments & General Settings */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Adjustments</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500">Currency Symbol</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none"
                >
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500">Discount %</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500">Shipping ({currency})</label>
                <input
                  type="number"
                  value={shipping}
                  onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Terms & Footnotes */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Notes & Bank Information</h4>
            <div>
              <label className="text-[10px] font-bold text-gray-500">Payment Accounts Info</label>
              <textarea
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                rows="3"
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none resize-none font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500">Terms / Footnotes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg py-1.5 px-2 mt-1 focus:outline-none resize-none"
              />
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Live Printable Preview (A4 Aspect Ratio Sheet) */}
        <div className="lg:col-span-6 flex flex-col gap-4 items-center">
          
          {/* Workspace label */}
          <div className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-xs text-gray-600">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Real-Time PDF Canvas</span>
            <span>A4 Size (Portrait)</span>
          </div>

          {/* Letterhead Frame */}
          <div className="w-full overflow-x-auto max-w-[540px] shadow-lg rounded-2xl border border-gray-200">
            
            <div
              ref={previewRef}
              className="bg-white p-8 md:p-12 w-[595px] min-h-[842px] relative font-outfit select-none flex flex-col justify-between"
              style={{
                boxSizing: 'border-box'
              }}
            >
              <div>
                
                {/* TEMPLATE MODERN HEADER */}
                {activeTemplate === 'modern' && (
                  <div className="flex justify-between items-start border-b-2 pb-6 mb-8" style={{ borderBottomColor: activeTheme }}>
                    <div>
                      {logo ? (
                        <img src={logo} alt="Logo" className="max-w-[120px] max-h-[60px] object-contain mb-3" />
                      ) : (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-lg" style={{ backgroundColor: activeTheme }}>S</span>
                          <span className="text-xl font-black text-gray-900 tracking-tight">{companyName}</span>
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 whitespace-pre-line">{companyAddress}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{companyEmail} • {companyPhone}</p>
                    </div>

                    <div className="text-right">
                      <h1 className="text-3xl font-black tracking-tight" style={{ color: activeTheme }}>INVOICE</h1>
                      <p className="text-xs font-bold text-gray-700 mt-1">#{invoiceNo}</p>
                      <div className="text-[10px] text-gray-400 space-y-0.5 mt-4">
                        <p>Date: <span className="font-semibold text-gray-700">{date}</span></p>
                        <p>Due Date: <span className="font-semibold text-gray-700">{dueDate}</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE CLASSIC HEADER */}
                {activeTemplate === 'classic' && (
                  <div className="flex flex-col border-b pb-6 mb-8 border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      {logo ? (
                        <img src={logo} alt="Logo" className="max-w-[120px] max-h-[60px] object-contain" />
                      ) : (
                        <h2 className="text-2xl font-black tracking-tight text-gray-800 uppercase">{companyName}</h2>
                      )}
                      <h1 className="text-2xl font-bold tracking-widest text-gray-400 uppercase">TAX INVOICE</h1>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="text-gray-500 text-[10px] leading-relaxed">
                        <span className="font-bold text-gray-700 uppercase block mb-1">From</span>
                        {companyAddress}
                        <p className="mt-1">{companyEmail} • {companyPhone}</p>
                      </div>
                      <div className="text-right text-[10px] space-y-0.5 text-gray-500">
                        <p>Invoice No: <span className="font-bold text-gray-800">#{invoiceNo}</span></p>
                        <p>Issue Date: <span className="font-bold text-gray-800">{date}</span></p>
                        <p>Due Date: <span className="font-bold text-gray-800">{dueDate}</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE MINIMALIST HEADER */}
                {activeTemplate === 'minimalist' && (
                  <div className="flex justify-between items-start pb-6 mb-8 border-b border-gray-150">
                    <div>
                      <h1 className="text-xl font-bold text-gray-800 tracking-tight">{companyName}</h1>
                      <p className="text-[10px] text-gray-400 mt-1">{companyEmail}</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-sm font-bold text-gray-500">INVOICE #{invoiceNo}</h2>
                      <p className="text-[10px] text-gray-400 mt-1">Due: {dueDate}</p>
                    </div>
                  </div>
                )}

                {/* RECIPIENT CLIENT BILLING */}
                <div className="grid grid-cols-2 gap-8 mb-8 text-[11px]">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Billed To:</span>
                    <h3 className="font-bold text-gray-800 text-xs mb-1">{clientName}</h3>
                    <p className="text-gray-500 leading-relaxed whitespace-pre-line">{clientAddress}</p>
                    <p className="text-gray-400 mt-1">{clientEmail}</p>
                  </div>
                </div>

                {/* LINE ITEMS TABLE */}
                <table className="w-full text-left text-[11px] mb-8">
                  <thead>
                    <tr className="border-b border-gray-250 text-gray-400 uppercase text-[9px] font-bold">
                      <th className="py-2.5 w-[50%]">Item Description</th>
                      <th className="py-2.5 text-right w-[12%]">Rate</th>
                      <th className="py-2.5 text-center w-[12%]">Qty</th>
                      <th className="py-2.5 text-center w-[10%]">GST</th>
                      <th className="py-2.5 text-right w-[16%]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const total = item.qty * item.rate;
                      return (
                        <tr key={item.id} className="border-b border-gray-100 text-gray-700">
                          <td className="py-3 font-semibold">{item.desc}</td>
                          <td className="py-3 text-right">{currency}{item.rate.toLocaleString()}</td>
                          <td className="py-3 text-center">{item.qty}</td>
                          <td className="py-3 text-center text-gray-400">{item.tax}%</td>
                          <td className="py-3 text-right font-bold">{currency}{(total + (total * (item.tax / 100))).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* PAYMENT SUMMARY GRID */}
                <div className="grid grid-cols-12 gap-4 text-xs">
                  
                  {/* Left: Notes & Bank Info */}
                  <div className="col-span-7 pr-4">
                    {paymentDetails && (
                      <div className="mb-4">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Bank Payment Details:</span>
                        <p className="text-[10px] text-gray-500 leading-relaxed font-mono whitespace-pre-line bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                          {paymentDetails}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Balance Subtotal / Taxes */}
                  <div className="col-span-5 text-right space-y-1.5 text-[11px] text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-gray-800">{currency}{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax / GST Amt:</span>
                      <span className="font-semibold text-gray-800">{currency}{calculateTaxes().toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount}%):</span>
                        <span>-{currency}{(calculateSubtotal() * (discount / 100)).toLocaleString()}</span>
                      </div>
                    )}
                    {shipping > 0 && (
                      <div className="flex justify-between">
                        <span>Shipping/Delivery:</span>
                        <span>+{currency}{shipping.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-black text-gray-900">
                      <span>Total Due:</span>
                      <span style={{ color: activeTheme }}>{currency}{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* FOOTER STATEMENT */}
              {notes && (
                <div className="border-t border-gray-150 pt-4 mt-8 text-[10px] text-center text-gray-400 leading-relaxed">
                  {notes}
                </div>
              )}

            </div>

          </div>

          <div className="text-[10px] text-gray-400 font-medium">
            Click "Export to PDF" to save a high-resolution vector PDF representation of this sheet.
          </div>

        </div>

      </div>

    </div>
  );
}
