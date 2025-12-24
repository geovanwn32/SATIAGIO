import React, { useState } from 'react';
import { Truck, Plus, Search, Filter, TrendingDown, ClipboardList, ArrowLeft, Save, Trash2, FileDown, Eye, Edit2, Printer, Minus, Box, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReceiptLayout } from './ReceiptLayout';


import { Purchase, Product, Company } from '../types';

interface PurchasesProps {
  purchases: Purchase[];
  products: Product[];
  company: Company;
  onSavePurchase: (purchase: Purchase) => void;
  onDeletePurchase: (id: string) => void;
  onUpdatePurchase: (purchase: Purchase) => void;
}

export const Purchases: React.FC<PurchasesProps> = ({ purchases, products, company, onSavePurchase, onDeletePurchase, onUpdatePurchase }) => {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; price: number }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  const totalGasto = purchases.reduce((acc, curr) => acc + curr.total, 0);

  const handleAddItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingIdx = items.findIndex(item => item.productId === productId);
    if (existingIdx >= 0) {
      updateQuantity(existingIdx, 1);
    } else {
      setItems([...items, { productId, quantity: 1, price: product.costPrice }]);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!supplier || items.length === 0) {
      alert("Informe o fornecedor e adicione itens.");
      return;
    }

    const purchaseData: Purchase = {
      id: isEditing && selectedPurchase ? selectedPurchase.id : `p${Date.now()}`,
      supplierId: supplier,
      items,
      total: items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
      date: isEditing && selectedPurchase ? selectedPurchase.date : new Date().toISOString().split('T')[0]
    };

    if (isEditing) {
      onUpdatePurchase(purchaseData);
    } else {
      onSavePurchase(purchaseData);
    }

    resetForm();
  };

  const resetForm = () => {
    setView('list');
    setItems([]);
    setSupplier('');
    setIsEditing(false);
    setSelectedPurchase(null);
    setCatalogSearch('');
  };

  const filteredCatalog = products.filter(p =>
    p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  if (view === 'form') {
    const purchaseTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <button onClick={resetForm} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-semibold">Voltar para Compras</span>
          </button>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{isEditing ? 'Editar Pedido de Compra' : 'Nova Entrada de Insumos'}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <div className="lg:col-span-2 flex flex-col space-y-6 overflow-hidden">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm shrink-0">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Fornecedor / Distribuidor *</label>
              <input
                type="text"
                placeholder="Ex: Apple Distribuidora, Samsung Parts..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all text-slate-900 font-bold"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <Box size={14} className="mr-2" /> Selecionar Peças do Catálogo
                </h4>
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="text"
                    placeholder="Filtrar catálogo..."
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {filteredCatalog.length > 0 ? filteredCatalog.map(p => (
                  <div key={p.id} className="p-4 bg-slate-50 border border-transparent hover:border-slate-200 rounded-2xl flex items-center justify-between transition-all group">
                    <div>
                      <p className="text-sm font-black text-slate-800">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Custo: R$ {p.costPrice.toFixed(2)} | Estoque Atual: {p.stock}</p>
                    </div>
                    <button
                      onClick={() => handleAddItem(p.id)}
                      className="p-2 bg-white text-slate-600 rounded-xl shadow-sm border border-slate-100 hover:bg-slate-900 hover:text-white transition-all"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )) : <p className="text-center py-10 text-slate-400 text-xs italic">Nenhum produto localizado.</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <h3 className="font-black text-slate-800 text-lg mb-6">Carrinho de Entrada</h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <Truck size={48} />
                  <p className="text-xs font-bold uppercase tracking-widest mt-2">Nenhum item adicionado</p>
                </div>
              )}
              {items.map((item, idx) => {
                const p = products.find(prod => prod.id === item.productId);
                return (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-black text-slate-800 flex-1 leading-tight">{p?.name}</p>
                      <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-600 ml-2"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1">
                        <button onClick={() => updateQuantity(idx, -1)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><Minus size={14} /></button>
                        <span className="px-3 text-xs font-black text-slate-800">{item.quantity}</span>
                        <button onClick={() => updateQuantity(idx, 1)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><Plus size={14} /></button>
                      </div>
                      <p className="text-sm font-black text-slate-900">R$ {(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-8 mt-6 border-t border-gray-100 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Investimento Total</span>
                <span className="text-3xl font-black text-slate-900">R$ {purchaseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <button
                onClick={handleSave}
                disabled={items.length === 0}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                <Save size={20} />
                <span>{isEditing ? 'Atualizar Pedido' : 'Confirmar Entrada'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      pdf.save(`pedido-compra-${selectedPurchase?.id || 'doc'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  if (view === 'details' && selectedPurchase) {
    // Map purchase items to QuoteItem format for the layout
    const layoutItems: any[] = selectedPurchase.items.map(item => ({
      ...item,
      type: 'product'
    }));

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => { setSelectedPurchase(null); setView('list'); }} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-semibold">Voltar para Compras</span>
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
              onClick={() => {
                setItems(selectedPurchase.items);
                setSupplier(selectedPurchase.supplierId || '');
                setIsEditing(true);
                setView('form');
              }}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-colors"
            >
              <Edit2 size={16} />
              <span>Editar Pedido</span>
            </button>
          </div>
        </div>

        <ReceiptLayout
          company={company}
          client={undefined}
          items={layoutItems}
          paymentMethod="À Vista/Prazo"
          date={selectedPurchase.date}
          total={selectedPurchase.total}
          saleId={selectedPurchase.id.toUpperCase()}
          products={products}
          services={[]}
          type="purchase"
          supplierName={selectedPurchase.supplierId}
        />

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center text-amber-800 text-xs font-bold uppercase tracking-widest">
          Visualização de Pedido de Compra
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Custo Total de Compras</p>
            <p className="text-2xl font-bold text-gray-900">R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Pedidos Emitidos</p>
            <p className="text-2xl font-bold text-gray-900">{purchases.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por fornecedor or código..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                resetForm();
                setView('form');
              }}
              className="flex items-center space-x-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-100"
            >
              <Plus size={18} />
              <span>Nova Compra</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5">Fornecedor</th>
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">Nenhuma compra registrada ainda.</td>
                </tr>
              )}
              {purchases.map(purchase => (
                <tr key={purchase.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 font-mono text-xs text-gray-400">#{purchase.id.toUpperCase().slice(-6)}</td>
                  <td className="px-8 py-5 font-black text-slate-800">{purchase.supplierId}</td>
                  <td className="px-8 py-5 text-slate-600 font-medium">
                    {new Date(purchase.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900">
                    R$ {purchase.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => { setSelectedPurchase(purchase); setView('details'); }}
                        className="p-3 bg-white text-blue-500 hover:bg-blue-50 border border-slate-100 rounded-2xl shadow-sm transition-all"
                        title="Visualizar Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setItems(purchase.items);
                          setSupplier(purchase.supplierId || '');
                          setSelectedPurchase(purchase);
                          setIsEditing(true);
                          setView('form');
                        }}
                        className="p-3 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all"
                        title="Editar Compra"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Deseja realmente excluir este pedido de compra?")) {
                            onDeletePurchase(purchase.id);
                          }
                        }}
                        className="p-3 bg-white text-red-500 hover:bg-red-50 hover:text-red-500 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition-all cursor-pointer"
                        title="Excluir Pedido"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
