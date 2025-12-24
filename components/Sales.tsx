
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Filter, ArrowUpRight, DollarSign, ArrowLeft, Trash2, CheckCircle, FileDown, Eye, Edit2, Printer, Minus, Box, Monitor, Wallet, Download, User, Menu, LogOut, Grid, List, DoorOpen, Calculator, ClipboardList, Smartphone } from 'lucide-react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Sale, Client, Product, Company, Service, QuoteItem, PaymentMethod, UserAccount, Combo, Offer } from '../types';
import { ReceiptLayout } from './ReceiptLayout';
import { CalculatorModal } from './CalculatorModal';
import { SideMenu } from './SideMenu';
import { QuickActionsModal } from './QuickActionsModal';

interface SalesProps {
  sales: Sale[];
  clients: Client[];
  products: Product[];
  services: Service[];
  paymentMethods: PaymentMethod[]; // Adicionado
  company: Company;
  onNewOS?: () => void;
  onSaveSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onUpdateSale: (sale: Sale) => void;
  user: UserAccount | null;
  combos: Combo[];
  offers: Offer[];
}


export const Sales: React.FC<SalesProps> = ({
  sales,
  clients,
  products,
  services,
  paymentMethods,
  company,
  onNewOS,
  onSaveSale,
  onDeleteSale,
  onUpdateSale,
  user,
  combos = [],
  offers = []
}) => {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [cart, setCart] = useState<QuoteItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [isEditing, setIsEditing] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [activeCatalog, setActiveCatalog] = useState<'products' | 'services' | 'combos' | 'offers'>('products');
  const [showPreview, setShowPreview] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [creditUsed, setCreditUsed] = useState<number>(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isServiceOrder, setIsServiceOrder] = useState(false);
  const [techDetails, setTechDetails] = useState({
    deviceModel: '',
    serialNumber: '',
    reportedDefect: '',
    accessoriesIncluded: [] as string[],
    visualCondition: 'Bom estado'
  });

  const totalFaturamento = sales.reduce((acc, curr) => acc + curr.total, 0);



  const downloadPDF = async () => {
    const element = document.querySelector('.printable-content') as HTMLElement;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`recibo-${selectedSale?.id || 'venda'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const handleAddItem = (id: string, type: 'product' | 'service' | 'combo' | 'offer') => {
    let itemSource: any[] = [];
    if (type === 'product') itemSource = products;
    else if (type === 'service') itemSource = services;
    else if (type === 'combo') itemSource = combos;
    else if (type === 'offer') itemSource = offers;

    const found = itemSource.find(i => i.id === id);
    if (!found) return;

    const existingIdx = cart.findIndex(item => {
      if (type === 'product') return item.productId === id;
      if (type === 'service') return item.serviceId === id;
      if (type === 'combo') return item.comboId === id;
      return false; // Offers don't stack by ID usually or are treated as unique
    });

    if (existingIdx >= 0 && type !== 'offer') {
      updateQuantity(existingIdx, 1);
    } else {
      const newItem: QuoteItem = {
        productId: type === 'product' ? id : (type === 'offer' ? (found as Offer).productId : undefined),
        serviceId: type === 'service' ? id : (type === 'offer' ? (found as Offer).serviceId : undefined),
        comboId: type === 'combo' ? id : undefined,
        quantity: 1,
        price: (found as any).salePrice || (found as any).price || (found as any).discountPrice,
        type
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    setCart(newCart);
  };

  const handleRemoveItem = (index: number) => {
    console.log('Removing item at index:', index);
    const newCart = cart.filter((_, i) => i !== index);
    console.log('New cart:', newCart);
    setCart(newCart);
  };

  const handleDeleteSale = (saleId: string) => {
    const confirmed = window.confirm("Deseja realmente excluir esta venda?");
    if (confirmed) {
      console.log('Deleting sale:', saleId);
      onDeleteSale(saleId);
    }
  };

  const handleSave = () => {
    if (!selectedClientId || cart.length === 0) {
      alert("Selecione um cliente e ao menos um item.");
      return;
    }

    // Helper to get local date (YYYY-MM-DD)
    const getLocalDate = () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const saleData: Sale = {
      id: isEditing && selectedSale ? selectedSale.id : `s${Date.now()}`,
      clientId: selectedClientId,
      items: cart,
      total: Math.max(0, cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) - discount - creditUsed),
      paymentMethod,
      date: isEditing && selectedSale ? selectedSale.date : getLocalDate(),
      discount,
      creditUsed,
      technicalDetails: isServiceOrder ? techDetails : undefined
    };

    if (isEditing) {
      onUpdateSale(saleData);
    } else {
      onSaveSale(saleData);
    }

    resetForm();
  };

  const resetForm = () => {
    setView('list');
    setCart([]);
    setSelectedClientId('');
    setIsEditing(false);
    setSelectedSale(null);
    setCatalogSearch('');
    setDiscount(0);
    setCreditUsed(0);
    setIsServiceOrder(false);
    setTechDetails({
      deviceModel: '',
      serialNumber: '',
      reportedDefect: '',
      accessoriesIncluded: [],
      visualCondition: 'Bom estado'
    });
  };

  const filteredCatalogProducts = products.filter(p =>
    p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const filteredCatalogServices = services.filter(s =>
    s.name.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const filteredCatalogCombos = combos.filter(c =>
    c.name.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const filteredCatalogOffers = offers.filter(o =>
    o.name.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  if (view === 'form') {
    const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartTotal = Math.max(0, subTotal - discount - creditUsed);
    const activePaymentMethods = paymentMethods.filter(pm => pm.active);
    const selectedClient = clients.find(c => c.id === selectedClientId);

    if (showPreview) {
      const client = clients.find(c => c.id === selectedClientId);
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between print:hidden">
            <button onClick={() => setShowPreview(false)} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft size={20} className="mr-2" />
              <span className="font-semibold">Voltar e Editar</span>
            </button>
            <div className="flex items-center space-x-3">
              <button onClick={() => window.print()} className="flex items-center space-x-2 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">
                <Printer size={16} />
                <span>Imprimir</span>
              </button>
              <button onClick={downloadPDF} className="flex items-center space-x-2 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">
                <Download size={16} />
                <span>Baixar PDF</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
              >
                <CheckCircle size={16} />
                <span>Confirmar e Finalizar</span>
              </button>
            </div>
          </div>

          <ReceiptLayout
            company={company}
            client={client}
            items={cart}
            paymentMethod={paymentMethod}
            date={new Date().toISOString()}
            total={cartTotal}
            saleId={`PREVIEW`}
            products={products}
            services={services}
            discount={discount}
            creditUsed={creditUsed}
            combos={combos}
            offers={offers}
          />
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 z-50 flex flex-col font-sans">
        {/* Professional Header - Dark Theme */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 h-16 flex items-center justify-between px-6 shrink-0 shadow-2xl border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <button onClick={resetForm} className="text-slate-400 hover:text-white transition-all p-2 rounded-lg hover:bg-white/10 active:scale-95"><ArrowLeft size={20} /></button>
            <div className="h-8 w-px bg-slate-700" />
            <div className="flex items-center space-x-3">
              {company.logo ? (
                <img src={company.logo} alt="Logo" className="h-10 w-10 object-contain rounded-lg bg-white p-0.5 shadow-sm" />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">
                  {company.name ? company.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div className="flex flex-col justify-center">
                <span className="font-black text-white tracking-wider text-base uppercase leading-none">{company.name}</span>
                <span className="text-[10px] text-emerald-400 font-bold tracking-wide mt-1">Soluções Administrativas</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-end mr-4 border-r border-slate-700 pr-6">
              <span className="text-white font-bold text-sm">{currentTime.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <span className="text-xs text-slate-400 font-mono">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <button onClick={() => setShowCalculator(true)} className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg" title="Calculadora"><Calculator size={20} /></button>
              <button onClick={() => setShowMenu(true)} className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg" title="Menu"><Menu size={20} /></button>
              <div className="h-6 w-px bg-slate-700" />
              <button className="flex items-center space-x-2 hover:bg-white/5 px-3 py-2 rounded-lg transition-colors group">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-blue-500/20">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-black text-white leading-none uppercase">{user?.fullName || 'Operador'}</p>
                  <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1">{user?.role || 'Vendas'}</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* LEFT COLUMN: Cart & Transaction Details (Now on Left as per request) */}
          <div className="w-[40%] bg-white flex flex-col shadow-xl z-10 border-r border-slate-200">
            {/* Main Content Area: Branding or Cart List */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
              {cart.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center opacity-10 select-none pointer-events-none">
                  <h1 className="text-8xl font-black text-slate-900 tracking-tighter">PDV</h1>
                  <p className="text-2xl font-bold uppercase tracking-[1em] text-slate-800 mt-4">SATI ÁGIO</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {cart.map((item, idx) => {
                    let label = '';
                    if (item.type === 'product') label = products.find(p => p.id === item.productId)?.name || 'Produto';
                    else if (item.type === 'service') label = services.find(s => s.id === item.serviceId)?.name || 'Serviço';
                    else if (item.type === 'combo') label = combos.find(c => c.id === item.comboId)?.name || 'Combo';
                    else if (item.type === 'offer') label = offers.find(o => (o.productId === item.productId || o.serviceId === item.serviceId))?.name || 'Oferta';

                    return (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 border-b border-slate-100 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm line-clamp-1">{label}</p>
                          <p className="text-xs text-slate-500">{item.quantity} x R$ {item.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">R$ {(item.quantity * item.price).toFixed(2)}</p>
                          <div className="flex items-center justify-end space-x-1 mt-1">
                            <button onClick={() => updateQuantity(idx, -1)} className="p-1 text-slate-400 hover:text-slate-600"><Minus size={14} /></button>
                            <button onClick={() => updateQuantity(idx, 1)} className="p-1 text-slate-400 hover:text-slate-600"><Plus size={14} /></button>
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-red-300 hover:text-red-500 cursor-pointer"
                              type="button"
                              title="Remover Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bottom Transaction Panel */}
            <div className="bg-white border-t border-slate-200 p-4 space-y-3">
              {/* Inputs for Client/Discount (Compact) */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold p-2 outline-none focus:border-blue-500"
                >
                  <option value="">Consumidor Final</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold p-2 outline-none focus:border-blue-500"
                >
                  {activePaymentMethods.map(pm => <option key={pm.id} value={pm.name}>{pm.name}</option>)}
                  {activePaymentMethods.length === 0 && <option value="Pix">Pix</option>}
                </select>
              </div>

              {isServiceOrder && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 space-y-2 mb-2">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center">
                    <Smartphone size={12} className="mr-1" /> Detalhes do Aparelho
                  </h5>
                  <input
                    placeholder="Modelo (Ex: iPhone 11)"
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                    value={techDetails.deviceModel}
                    onChange={e => setTechDetails({ ...techDetails, deviceModel: e.target.value })}
                  />
                  <div className="flex space-x-2">
                    <input
                      placeholder="Serial/IMEI"
                      className="w-1/2 p-2 bg-white border border-blue-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                      value={techDetails.serialNumber}
                      onChange={e => setTechDetails({ ...techDetails, serialNumber: e.target.value })}
                    />
                    <select
                      className="w-1/2 p-2 bg-white border border-blue-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                      value={techDetails.visualCondition}
                      onChange={e => setTechDetails({ ...techDetails, visualCondition: e.target.value })}
                    >
                      <option>Bom estado</option>
                      <option>Riscos leves</option>
                      <option>Tela trincada</option>
                      <option>Carcaça danificada</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Defeito relatado..."
                    rows={2}
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 resize-none"
                    value={techDetails.reportedDefect}
                    onChange={e => setTechDetails({ ...techDetails, reportedDefect: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-1 py-2 border-t border-b border-slate-100">
                <div className="flex justify-between text-xs text-slate-500 font-bold uppercase">
                  <span>Subtotal</span>
                  <span>R$ {subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-bold uppercase items-center">
                  <span>Desconto</span>
                  <div className="flex items-center w-24 border-b border-dotted border-slate-300">
                    <span className="mr-1">R$</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={e => setDiscount(Number(e.target.value))}
                      className="w-full text-right outline-none bg-transparent"
                    />
                  </div>
                </div>
                {creditUsed > 0 && (
                  <div className="flex justify-between text-xs text-blue-500 font-bold uppercase">
                    <span>Crédito</span>
                    <span>- R$ {creditUsed.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-slate-400 uppercase">Total</span>
                <span className="text-5xl font-black text-slate-800 tracking-tighter">
                  <span className="text-lg align-top mr-1 font-bold">R$</span>
                  {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="bg-slate-100 p-2 flex justify-between items-center shrink-0 border-t border-slate-200">
              <div className="flex space-x-4 pl-2">
                <button onClick={() => setShowQuickActions(true)} className="flex flex-col items-center text-slate-500 hover:text-blue-600 transition-colors group" title="Ações Rápidas">
                  <Menu size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">Ações</span>
                </button>
                <button onClick={() => document.querySelector<HTMLSelectElement>('select')?.focus()} className="flex flex-col items-center text-slate-500 hover:text-blue-600 transition-colors group" title="Selecionar Cliente">
                  <User size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">Cliente</span>
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={cart.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-bold uppercase tracking-widest text-xs shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
                >
                  Finalizar (F5)
                </button>
              </div>
            </div>
          </div>


          {/* RIGHT COLUMN: Catalog Grid (Now on Right as per request) */}
          <div className="flex-1 flex flex-col bg-slate-100 p-4 overflow-hidden">
            {/* Category Tabs */}
            <div className="grid grid-cols-4 gap-2 mb-4 shrink-0 h-16">
              <button
                onClick={() => setActiveCatalog('products')}
                className={`uppercase font-black text-xs tracking-widest transition-all h-full border-b-4 ${activeCatalog === 'products' ? 'bg-[#2563eb] text-white border-[#1e40af] shadow-lg transform -translate-y-1' : 'bg-white text-slate-400 border-slate-300 hover:bg-slate-50'}`}
              >
                Produtos
              </button>
              <button
                onClick={() => setActiveCatalog('services')}
                className={`uppercase font-black text-xs tracking-widest transition-all h-full border-b-4 ${activeCatalog === 'services' ? 'bg-[#2563eb] text-white border-[#1e40af] shadow-lg transform -translate-y-1' : 'bg-white text-slate-400 border-slate-300 hover:bg-slate-50'}`}
              >
                Serviços
              </button>
              <button
                onClick={() => setActiveCatalog('combos')}
                className={`uppercase font-black text-xs tracking-widest transition-all h-full border-b-4 ${activeCatalog === 'combos' ? 'bg-[#2563eb] text-white border-[#1e40af] shadow-lg transform -translate-y-1' : 'bg-white text-slate-400 border-slate-300 hover:bg-slate-50'}`}
              >
                Combos
              </button>
              <button
                onClick={() => setActiveCatalog('offers')}
                className={`uppercase font-black text-xs tracking-widest transition-all h-full border-b-4 ${activeCatalog === 'offers' ? 'bg-[#2563eb] text-white border-[#1e40af] shadow-lg transform -translate-y-1' : 'bg-white text-slate-400 border-slate-300 hover:bg-slate-50'}`}
              >
                Ofertas
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar item..."
                value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 shadow-sm outline-none text-slate-900 font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase placeholder:normal-case"
                autoFocus
              />
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {activeCatalog === 'products' ? (
                  filteredCatalogProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleAddItem(p.id, 'product')}
                      className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all p-3 text-left relative group overflow-hidden h-32 flex flex-col justify-between"
                    >
                      {/* Blue Accent Line */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-blue-500 transition-colors" />

                      <div className="pl-3">
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">#{p.code}</span>
                        <span className="font-bold text-slate-700 leading-tight block line-clamp-2 group-hover:text-blue-700">{p.name}</span>
                      </div>
                      <div className="pl-3 mt-2">
                        <span className="block text-lg font-black text-slate-900 group-hover:text-blue-700">R$ {p.salePrice.toFixed(2)}</span>
                      </div>
                    </button>
                  ))
                ) : activeCatalog === 'services' ? (
                  filteredCatalogServices.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleAddItem(s.id, 'service')}
                      className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all p-3 text-left relative group overflow-hidden h-32 flex flex-col justify-between"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-blue-500 transition-colors" />
                      <div className="pl-3">
                        <span className="font-bold text-slate-700 leading-tight block line-clamp-2 group-hover:text-blue-700">{s.name}</span>
                      </div>
                      <div className="pl-3 mt-2">
                        <span className="block text-lg font-black text-slate-900 group-hover:text-blue-700">R$ {s.price.toFixed(2)}</span>
                      </div>
                    </button>
                  ))
                ) : activeCatalog === 'combos' ? (
                  filteredCatalogCombos.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleAddItem(c.id, 'combo')}
                      className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all p-3 text-left relative group overflow-hidden h-32 flex flex-col justify-between"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-blue-500 transition-colors" />
                      <div className="pl-3">
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">COMBO</span>
                        <span className="font-bold text-slate-700 leading-tight block line-clamp-2 group-hover:text-blue-700">{c.name}</span>
                        <p className="text-[9px] text-slate-400 mt-1 line-clamp-1">{c.description}</p>
                      </div>
                      <div className="pl-3 mt-2">
                        <span className="block text-lg font-black text-slate-900 group-hover:text-blue-700">R$ {c.price.toFixed(2)}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  filteredCatalogOffers.map(o => (
                    <button
                      key={o.id}
                      onClick={() => handleAddItem(o.id, 'offer')}
                      className="bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-500 hover:ring-1 hover:ring-orange-500 transition-all p-3 text-left relative group overflow-hidden h-32 flex flex-col justify-between"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-orange-500 transition-colors" />
                      <div className="pl-3">
                        <span className="text-[10px] font-black text-orange-500 block mb-1 flex items-center"><Plus size={10} className="mr-1" /> OFERTA</span>
                        <span className="font-bold text-slate-700 leading-tight block line-clamp-2 group-hover:text-orange-700">{o.name}</span>
                      </div>
                      <div className="pl-3 mt-2">
                        <span className="block text-[10px] text-slate-400 line-through">R$ {o.originalPrice.toFixed(2)}</span>
                        <span className="block text-lg font-black text-orange-600">R$ {o.price.toFixed(2)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <CalculatorModal
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
          onTransferToDiscount={(value) => {
            setDiscount(value);
            setShowCalculator(false);
          }}
        />
        <SideMenu
          isOpen={showMenu}
          onClose={() => setShowMenu(false)}
          onLogout={resetForm}
        />
        <QuickActionsModal
          isOpen={showQuickActions}
          onClose={() => setShowQuickActions(false)}
          onApplyDiscount={(percentage) => {
            const discountAmount = subTotal * (percentage / 100);
            setDiscount(discountAmount);
          }}
          onAddFrequentClient={() => {
            // Future implementation: show frequent clients modal
            console.log('Add frequent client');
          }}
        />
      </div>
    );

  }


  if (view === 'details' && selectedSale) {
    const client = clients.find(c => c.id === selectedSale.clientId);
    const sendWhatsApp = () => {
      const phoneNumber = client?.whatsapp || client?.phone;
      if (!phoneNumber) return alert('Telefone/WhatsApp não cadastrado');

      const isOS = !!selectedSale.technicalDetails;
      const deviceLabel = selectedSale.technicalDetails ? `${selectedSale.technicalDetails.brand || ''} ${selectedSale.technicalDetails.deviceModel}` : 'itens da venda';

      const itemsList = selectedSale.items.map(item => {
        let name = "";
        if (item.type === 'product') {
          name = products.find(p => p.id === item.productId)?.name || "Produto";
        } else if (item.type === 'service') {
          name = services.find(s => s.id === item.serviceId)?.name || "Serviço";
        }
        return `• ${name} (${item.quantity}x): R$ ${(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      }).join('\n');

      const message = encodeURIComponent(
        `Olá, ${client.name}.\n\n` +
        `Informamos que a sua ${isOS ? 'Ordem de Serviço' : 'venda'} nº ${selectedSale.id.toUpperCase().replace('S', '')}, referente ao ${isOS ? 'equipamento ' + deviceLabel : deviceLabel}, encontra-se finalizada.\n\n` +
        `*Detalhes da Compra:*\n` +
        `${itemsList}\n` +
        `*Total: R$ ${selectedSale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*.\n\n` +
        `Nossa equipe permanece à disposição para qualquer dúvida ou necessidade de mais informações através de nossos canais de atendimento.\n\n` +
        `Atenciosamente,\n` +
        `${company.tradeName || company.name}`
      );

      window.open(`https://wa.me/55${phoneNumber.replace(/\D/g, '')}?text=${message}`);
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => { setSelectedSale(null); setView('list'); }} className="flex items-center text-slate-400 hover:text-slate-800 transition-colors font-black uppercase text-[10px] tracking-[0.2em]">
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-semibold">VOLTAR PARA LISTA</span>
          </button>
          <div className="flex items-center space-x-3">
            <button onClick={sendWhatsApp} className="flex items-center space-x-2 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-100 transition-colors border border-emerald-100">
              <Smartphone size={16} />
              <span>WHATSAPP</span>
            </button>
            <button
              onClick={() => {
                setCart(selectedSale.items);
                setSelectedClientId(selectedSale.clientId);
                setPaymentMethod(selectedSale.paymentMethod);
                setIsEditing(true);
                setView('form');
              }}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <Edit2 size={16} />
              <span>{selectedSale.technicalDetails ? 'EDITAR O.S.' : 'EDITAR VENDA'}</span>
            </button>
            <button onClick={() => window.print()} className="flex items-center space-x-2 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">
              <Printer size={16} />
              <span>IMPRIMIR</span>
            </button>
            <button onClick={downloadPDF} className="flex items-center space-x-2 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">
              <Download size={16} />
              <span>BAIXAR PDF</span>
            </button>
          </div>
        </div>

        <ReceiptLayout
          company={company}
          client={client}
          items={selectedSale.items}
          paymentMethod={selectedSale.paymentMethod}
          date={selectedSale.date}
          total={selectedSale.total}
          saleId={selectedSale.id.toUpperCase().replace('S', '')}
          products={products}
          services={services}
          discount={selectedSale.discount}
          creditUsed={selectedSale.creditUsed}
          combos={combos}
          offers={offers}
        />
      </div>
    );
  }

  // List View remains the same...
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Vendas Realizadas</p>
            <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Faturamento Total</p>
            <p className="text-2xl font-bold text-gray-900">R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Ticket Médio</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {(sales.length > 0 ? totalFaturamento / sales.length : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente ou código de venda..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 font-medium shadow-sm"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                resetForm();
                setView('form');
                setActiveCatalog('services');
                setIsServiceOrder(true);
              }}
              className="hidden md:flex items-center space-x-2 px-6 py-4 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <ClipboardList size={18} />
              <span>Nova Ordem de Serviço</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setView('form');
              }}
              className="flex items-center space-x-3 px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95"
            >
              <Plus size={20} />
              <span>Nova Venda</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Pagamento</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">Nenhuma venda registrada ainda.</td>
                </tr>
              )}
              {sales.map(sale => {
                const client = clients.find(c => c.id === sale.clientId);
                return (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 font-mono text-xs text-gray-400">#{sale.id.toUpperCase().slice(-6)}</td>
                    <td className="px-8 py-5 font-black text-slate-800">{client?.name || 'Cliente Avulso'}</td>
                    <td className="px-8 py-5 text-slate-600 font-medium">
                      {new Date(sale.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center w-fit">
                        <Wallet size={10} className="mr-1 opacity-50" />
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-slate-900">
                      R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => { setSelectedSale(sale); setView('details'); }} className="p-3 bg-white text-blue-500 hover:bg-blue-50 border border-slate-100 rounded-2xl shadow-sm transition-all" title="Visualizar Detalhes"><Eye size={18} /></button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-3 bg-white text-red-500 hover:bg-red-50 hover:text-red-500 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition-all cursor-pointer"
                          type="button"
                          title="Excluir Venda"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
