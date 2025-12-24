import React from 'react';
import { ArrowLeft, Calculator, Menu, User, Wallet, ArrowUpRight, ShoppingBag, Minus, Plus, Trash2, Box, Monitor, Search } from 'lucide-react';

interface SalesProfessionalProps {
    resetForm: () => void;
    cart: any[];
    selectedClientId: string;
    setSelectedClientId: (id: string) => void;
    clients: any[];
    subTotal: number;
    discount: number;
    setDiscount: (value: number) => void;
    cartTotal: number;
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
    activeCatalog: 'products' | 'services';
    setActiveCatalog: (catalog: 'products' | 'services') => void;
    catalogSearch: string;
    setCatalogSearch: (search: string) => void;
    activePaymentMethods: any[];
    filteredCatalogProducts: any[];
    filteredCatalogServices: any[];
    products: any[];
    services: any[];
    updateQuantity: (idx: number, delta: number) => void;
    handleRemoveItem: (idx: number) => void;
    handleSave: () => void;
    handleAddItem: (id: string, type: 'product' | 'service') => void;
}

// Professional POS Design Component
export const SalesProfessional: React.FC<SalesProfessionalProps> = ({
    resetForm,
    cart,
    selectedClientId,
    setSelectedClientId,
    clients,
    subTotal,
    discount,
    setDiscount,
    cartTotal,
    paymentMethod,
    setPaymentMethod,
    activeCatalog,
    setActiveCatalog,
    catalogSearch,
    setCatalogSearch,
    activePaymentMethods,
    filteredCatalogProducts,
    filteredCatalogServices,
    products,
    services,
    updateQuantity,
    handleRemoveItem,
    handleSave,
    handleAddItem,
}) => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 z-50 flex flex-col font-sans">
            {/* Professional Header - Dark Theme */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 h-16 flex items-center justify-between px-6 shrink-0 shadow-2xl border-b border-slate-700">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={resetForm}
                        className="text-slate-400 hover:text-white transition-all p-2 rounded-lg hover:bg-white/10 active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-8 w-px bg-slate-700" />
                    <div className="flex flex-col justify-center">
                        <span className="font-black text-white tracking-wider text-base uppercase">PDV</span>
                        <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">SATI ÁGIO • Sistema Integrado</span>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-end mr-4 border-r border-slate-700 pr-6">
                        <span className="text-white font-bold text-sm">{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        <span className="text-xs text-slate-400 font-mono">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-400">
                        <button className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg" title="Calculadora">
                            <Calculator size={20} />
                        </button>
                        <button className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg" title="Menu">
                            <Menu size={20} />
                        </button>
                        <div className="h-6 w-px bg-slate-700" />
                        <button className="flex items-center space-x-2 hover:bg-white/5 px-3 py-2 rounded-lg transition-colors group">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-blue-500/20">
                                GS
                            </div>
                            <span className="text-sm font-semibold text-white hidden lg:block">Operador</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Receipt-Style Cart Panel */}
                <div className="w-[420px] bg-white flex flex-col shadow-2xl relative">
                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-50 to-white rounded-bl-[3rem] z-10 opacity-50" />

                    {/* Cart Header */}
                    <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white relative z-20">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-black text-slate-800 uppercase text-sm tracking-wider">Cupom Fiscal</h3>
                            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-lg shadow-emerald-500/30">
                                Em Aberto
                            </span>
                        </div>
                        {selectedClientId ? (
                            <div className="flex items-center text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <User size={16} className="text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold text-slate-800 block truncate">{clients.find(c => c.id === selectedClientId)?.name}</span>
                                    <span className="text-xs text-slate-400">Cliente Identificado</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 italic p-3 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                                Consumidor Final
                            </div>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto bg-white relative">
                        {cart.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 select-none">
                                <ShoppingBag size={80} className="text-slate-300 mb-6" />
                                <p className="text-base font-black text-slate-400 uppercase tracking-widest">Carrinho Vazio</p>
                                <p className="text-xs text-slate-300 mt-2">Adicione produtos para iniciar</p>
                            </div>
                        ) : (
                            <div className="p-3 space-y-2">
                                {cart.map((item, idx) => {
                                    const label = item.type === 'product' ? products.find(p => p.id === item.productId)?.name : services.find(s => s.id === item.serviceId)?.name;
                                    return (
                                        <div key={idx} className="group relative bg-slate-50 hover:bg-blue-50 rounded-xl p-4 border border-slate-100 hover:border-blue-200 transition-all hover:shadow-md">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-bold text-slate-800 line-clamp-2 w-[70%] leading-snug">{label}</span>
                                                <span className="text-base font-black text-slate-900">R$ {(item.quantity * item.price).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-xs text-slate-500 font-mono">
                                                    {item.quantity} × R$ {item.price.toFixed(2)}
                                                </div>
                                                <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => updateQuantity(idx, -1)} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-l-lg transition-colors">
                                                        <Minus size={14} />
                                                    </button>
                                                    <button onClick={() => updateQuantity(idx, 1)} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
                                                        <Plus size={14} />
                                                    </button>
                                                    <div className="w-px h-4 bg-slate-200" />
                                                    <button onClick={() => handleRemoveItem(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-r-lg transition-colors">
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

                    {/* Totals Section - Premium Dark */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.4)] relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-slate-600 rounded-full" />

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span className="font-semibold">Subtotal</span>
                                <span className="font-mono">R$ {subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate-400">
                                <span className="font-semibold">Desconto</span>
                                <div className="flex items-center bg-slate-800/50 rounded-lg px-3 py-1 border border-slate-700">
                                    <span className="text-slate-500 mr-1 text-xs">R$</span>
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={e => setDiscount(Number(e.target.value))}
                                        className="w-20 bg-transparent text-right outline-none text-white font-mono text-sm"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-6 pt-5 border-t border-slate-700">
                            <div>
                                <span className="block text-xs font-bold uppercase text-slate-500 tracking-widest mb-2">Total a Pagar</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                        <Wallet size={16} className="text-emerald-400" />
                                    </div>
                                    <span className="text-emerald-400 font-bold text-sm uppercase tracking-wide">{paymentMethod}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-5xl font-black tracking-tighter text-white">
                                    <span className="text-xl align-top mr-1 opacity-60 font-semibold">R$</span>
                                    {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            <button
                                onClick={() => setSelectedClientId('')}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl p-3 flex flex-col items-center justify-center transition-all active:scale-95 border border-slate-700"
                                title="Cliente"
                            >
                                <User size={20} />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={cart.length === 0}
                                className="col-span-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl p-4 font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-900/50 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:from-slate-700 disabled:to-slate-700"
                            >
                                <span>Finalizar Venda</span>
                                <ArrowUpRight size={20} className="animate-pulse" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Modern Product Grid */}
                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                    {/* Top Action Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 shrink-0">
                        {/* Category Tabs */}
                        <div className="bg-white p-1.5 rounded-xl shadow-lg inline-flex border border-slate-200">
                            <button
                                onClick={() => setActiveCatalog('products')}
                                className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeCatalog === 'products' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Box size={16} />
                                    <span>Produtos</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveCatalog('services')}
                                className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeCatalog === 'services' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Monitor size={16} />
                                    <span>Serviços</span>
                                </div>
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex items-center space-x-3 flex-1 max-w-2xl">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar produtos ou serviços..."
                                    value={catalogSearch}
                                    onChange={e => setCatalogSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 shadow-sm rounded-xl outline-none text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-normal focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    autoFocus
                                />
                            </div>

                            <select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="py-3.5 pl-4 pr-10 bg-white border-2 border-slate-200 shadow-sm rounded-xl outline-none text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer hover:bg-slate-50 transition-all"
                            >
                                <option value="">Cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>

                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="py-3.5 pl-4 pr-10 bg-white border-2 border-slate-200 shadow-sm rounded-xl outline-none text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer hover:bg-slate-50 transition-all"
                            >
                                {activePaymentMethods.map(pm => <option key={pm.id} value={pm.name}>{pm.name}</option>)}
                                {activePaymentMethods.length === 0 && <option value="Pix">Pix</option>}
                            </select>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-10">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {activeCatalog === 'products' ? (
                                filteredCatalogProducts.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleAddItem(p.id, 'product')}
                                        className="bg-white rounded-2xl p-5 shadow-md hover:shadow-2xl hover:-translate-y-2 hover:ring-4 hover:ring-blue-500/20 transition-all duration-300 text-left group flex flex-col justify-between h-[200px] border-2 border-transparent hover:border-blue-500"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-xl group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:scale-110 duration-300">
                                                <Box size={24} />
                                            </div>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-mono font-bold group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                                {p.code}
                                            </span>
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">{p.name}</p>
                                            <p className="text-xs text-slate-400 font-semibold">Estoque: <span className="text-slate-600">{p.stock}</span></p>
                                        </div>

                                        <div className="pt-3 border-t-2 border-slate-100 group-hover:border-blue-200 flex items-end justify-between transition-colors">
                                            <span className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                                                R$ {p.salePrice.toFixed(2)}
                                            </span>
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:scale-110 shadow-sm">
                                                <Plus size={20} className="font-bold" />
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                filteredCatalogServices.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleAddItem(s.id, 'service')}
                                        className="bg-white rounded-2xl p-5 shadow-md hover:shadow-2xl hover:-translate-y-2 hover:ring-4 hover:ring-purple-500/20 transition-all duration-300 text-left group flex flex-col justify-between h-[200px] border-2 border-transparent hover:border-purple-500"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 rounded-xl group-hover:from-purple-600 group-hover:to-purple-700 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:scale-110 duration-300">
                                                <Monitor size={24} />
                                            </div>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-mono font-bold group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
                                                SERV
                                            </span>
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-purple-700 transition-colors">{s.name}</p>
                                            <p className="text-xs text-slate-400 font-semibold">Garantia: <span className="text-slate-600">{s.warranty} dias</span></p>
                                        </div>

                                        <div className="pt-3 border-t-2 border-slate-100 group-hover:border-purple-200 flex items-end justify-between transition-colors">
                                            <span className="text-xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                                                R$ {s.price.toFixed(2)}
                                            </span>
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all group-hover:scale-110 shadow-sm">
                                                <Plus size={20} className="font-bold" />
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
