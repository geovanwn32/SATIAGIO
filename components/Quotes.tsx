
import React, { useState, useMemo } from 'react';
import { Plus, Search, Eye, Trash2, Printer, ArrowLeft, X, ClipboardCheck, User, Box, Wrench, Smartphone, Save, Download, Edit2, BarChart3, Receipt, CheckCircle, Clock, AlertTriangle, XCircle, KeyRound, Grid3X3, Tag } from 'lucide-react';
import { Quote, AppStatus, Client, Product, Technician, QuoteItem, Sale, Service, Company } from '../types';
import { ReceiptLayout } from './ReceiptLayout';
import { DeviceLabel } from './DeviceLabel';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { StatCard } from './StatCard';

interface QuotesProps {
  quotes: Quote[];
  clients: Client[];
  products: Product[];
  services: Service[];
  technicians: Technician[];
  company: Company;
  triggerNewOS?: boolean;
  onModalClose?: () => void;
  onAddQuote: (quote: Quote) => void;
  onUpdateQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
  onConvertToSale: (sale: Sale) => void;
}

export const Quotes: React.FC<QuotesProps> = ({ quotes, clients, products, services, technicians, company, triggerNewOS, onModalClose, onAddQuote, onUpdateQuote, onDeleteQuote, onConvertToSale }) => {
  const [view, setView] = useState<'list' | 'details'>('list');
  // ... rest of state

  React.useEffect(() => {
    if (triggerNewOS) {
      setShowAddModal(true);
      if (onModalClose) onModalClose();
    }
  }, [triggerNewOS]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCatalog, setActiveCatalog] = useState<'products' | 'services'>('products');
  const [isEditing, setIsEditing] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedQuoteForLabel, setSelectedQuoteForLabel] = useState<Quote | null>(null);

  const [newOS, setNewOS] = useState<Partial<Quote>>({
    clientId: '',
    technicianId: '',
    description: '',
    status: AppStatus.PENDING,
    items: [],
    technicalDetails: {
      equipmentType: '',
      brand: '',
      deviceModel: '',
      serialNumber: '',
      reportedDefect: '',
      technicalDiagnosis: '',
      defectCategory: 'Outros',
      accessoriesIncluded: [],
      visualCondition: 'Bom estado',
      internalNotes: '',
      externalNotes: ''
    },
    history: []
  });

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalQuotes = quotes.length;
    const pendingQuotes = quotes.filter(q => q.status === AppStatus.PENDING).length;
    const approvedQuotes = quotes.filter(q => q.status === AppStatus.APPROVED || q.status === AppStatus.COMPLETED).length;
    const totalValue = quotes.reduce((acc, q) => acc + q.total, 0);
    const conversionRate = totalQuotes > 0 ? ((approvedQuotes / totalQuotes) * 100).toFixed(1) : '0';

    return { totalQuotes, pendingQuotes, approvedQuotes, totalValue, conversionRate };
  }, [quotes]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    quotes.forEach(q => counts[q.status] = (counts[q.status] || 0) + 1);

    const labels: Record<string, string> = {
      [AppStatus.PENDING]: 'Pendente',
      [AppStatus.IN_REPAIR]: 'Em Reparo',
      [AppStatus.WAITING_PARTS]: 'Aguardando Peças',
      [AppStatus.READY]: 'Pronto',
      [AppStatus.COMPLETED]: 'Concluído',
      [AppStatus.CANCELLED]: 'Cancelado',
      [AppStatus.APPROVED]: 'Aprovado'
    };

    return Object.keys(counts).map(k => ({ name: labels[k] || k, value: counts[k] }));
  }, [quotes]);

  const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#64748b', '#ef4444', '#059669'];

  const getStatusLabel = (status: AppStatus) => {
    const labels: Record<string, { label: string, color: string }> = {
      [AppStatus.PENDING]: { label: 'Aguardando Avaliação', color: 'bg-amber-100 text-amber-700' },
      [AppStatus.IN_REPAIR]: { label: 'Em Manutenção', color: 'bg-blue-100 text-blue-700' },
      [AppStatus.WAITING_PARTS]: { label: 'Aguardando Peças', color: 'bg-purple-100 text-purple-700' },
      [AppStatus.READY]: { label: 'Pronto para Retirada', color: 'bg-emerald-100 text-emerald-700' },
      [AppStatus.COMPLETED]: { label: 'Entregue', color: 'bg-slate-100 text-slate-700' },
      [AppStatus.CANCELLED]: { label: 'Sem Reparo', color: 'bg-red-100 text-red-700' },
      [AppStatus.APPROVED]: { label: 'Aprovado', color: 'bg-emerald-50 text-emerald-600' }
    };
    return labels[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const handleAddItem = (id: string, type: 'product' | 'service') => {
    const itemSource = type === 'product' ? products : services;
    const found = itemSource.find(i => i.id === id);
    if (!found) return;

    const existing = (newOS.items || []).find(i =>
      type === 'product' ? i.productId === id : i.serviceId === id
    );

    if (existing) {
      setNewOS({
        ...newOS,
        items: (newOS.items || []).map(i =>
          (type === 'product' ? i.productId === id : i.serviceId === id)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      });
    } else {
      const newItem: QuoteItem = {
        productId: type === 'product' ? id : undefined,
        serviceId: type === 'service' ? id : undefined,
        quantity: 1,
        price: type === 'product' ? (found as Product).salePrice : (found as Service).price,
        type
      };
      setNewOS({
        ...newOS,
        items: [...(newOS.items || []), newItem]
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    setNewOS({
      ...newOS,
      items: (newOS.items || []).filter((_, i) => i !== index)
    });
  };

  const handleSaveOS = () => {
    if (!newOS.clientId || !newOS.technicalDetails?.deviceModel) {
      alert("Preencha ao menos o cliente e o modelo do aparelho.");
      return;
    }

    const total = (newOS.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Add history log if status changed or new
    const currentOS = quotes.find(q => q.id === newOS.id);
    const history: any[] = [...(newOS.history || [])];
    if (!currentOS || currentOS.status !== newOS.status) {
      history.push({
        date: new Date().toISOString(),
        status: newOS.status,
        notes: isEditing ? `Status alterado para ${newOS.status}` : 'Abertura de O.S.',
        technicianName: technicians.find(t => t.id === newOS.technicianId)?.name || 'Sistema'
      });
    }

    const quoteData: Quote = {
      ...newOS,
      id: isEditing && newOS.id ? newOS.id : `OS${Date.now().toString().slice(-6)}`,
      total,
      createdAt: isEditing && newOS.createdAt ? newOS.createdAt : new Date().toISOString(),
      history
    } as Quote;

    if (isEditing) {
      onUpdateQuote(quoteData);
    } else {
      onAddQuote(quoteData);
    }

    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setIsEditing(false);
    setNewOS({
      clientId: '',
      technicianId: '',
      description: '',
      status: AppStatus.PENDING,
      items: [],
      technicalDetails: {
        equipmentType: '',
        brand: '',
        deviceModel: '',
        serialNumber: '',
        reportedDefect: '',
        technicalDiagnosis: '',
        defectCategory: 'Outros',
        accessoriesIncluded: [],
        visualCondition: 'Bom estado',
        internalNotes: '',
        externalNotes: ''
      },
      history: []
    });
  };

  const handleEdit = (quote: Quote) => {
    setNewOS(JSON.parse(JSON.stringify(quote))); // Deep copy to avoid mutation reference issues
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handlePrintLabel = (quote: Quote) => {
    setSelectedQuoteForLabel(quote);
    setShowLabelModal(true);
  };

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
      pdf.save(`orcamento-${selectedQuote?.id || 'doc'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const renderDetails = (os: Quote) => {
    const client = clients.find(c => c.id === os.clientId);

    const sendWhatsApp = () => {
      const phoneNumber = client?.whatsapp || client?.phone;
      if (!phoneNumber) return alert('Telefone/WhatsApp não cadastrado');

      const itemsList = os.items.map(item => {
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
        `Informamos que a sua Ordem de Serviço nº ${os.id}, referente ao equipamento ${os.technicalDetails?.brand || ''} ${os.technicalDetails?.deviceModel || 'equipamento'}, encontra-se atualmente com o status *${getStatusLabel(os.status).label}*.\n\n` +
        `*Itens do Orçamento:*\n` +
        `${itemsList}\n` +
        `*Total: R$ ${os.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n` +
        `Nossa equipe técnica já está realizando os procedimentos necessários para diagnóstico e reparo. Assim que houver qualquer atualização no andamento do serviço, entraremos em contato imediatamente.\n\n` +
        `Em caso de dúvidas ou necessidade de mais informações, permanecemos à disposição por nossos canais de atendimento.\n\n` +
        `Atenciosamente,\n` +
        `${company.tradeName || company.name}`
      );

      window.open(`https://wa.me/55${phoneNumber.replace(/\D/g, '')}?text=${message}`);
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
        <div className="flex items-center justify-between print:hidden bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <button onClick={() => { setSelectedQuote(null); setView('list'); }} className="flex items-center text-slate-400 hover:text-slate-800 transition-colors font-black uppercase text-[10px] tracking-[0.2em]">
            <ArrowLeft size={20} className="mr-2" />
            <span>VOLTAR PARA LISTA</span>
          </button>
          <div className="flex items-center space-x-3">
            <button onClick={sendWhatsApp} className="flex items-center space-x-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-100 transition-colors border border-emerald-100">
              <Smartphone size={16} />
              <span>WHATSAPP</span>
            </button>
            <button
              onClick={() => {
                handleEdit(os);
                setView('list');
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <Edit2 size={16} />
              <span>EDITAR O.S.</span>
            </button>
            <button onClick={() => handlePrintLabel(os)} className="flex items-center space-x-2 px-6 py-3 bg-amber-50 text-amber-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-amber-100 transition-colors border border-amber-100">
              <Tag size={16} />
              <span>ETIQUETA</span>
            </button>
            <button onClick={() => window.print()} className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">
              <Printer size={16} />
              <span>IMPRIMIR</span>
            </button>
            <button onClick={downloadPDF} className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">
              <Download size={16} />
              <span>BAIXAR PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          {/* Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Detalhes do Atendimento</p>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{os.technicalDetails?.equipmentType} {os.technicalDetails?.brand}</h2>
                  <p className="text-lg font-bold text-slate-500">{os.technicalDetails?.deviceModel}</p>
                </div>
                <span className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm ${getStatusLabel(os.status).color}`}>
                  {getStatusLabel(os.status).label}
                </span>
              </div>

              {(os.technicalDetails?.devicePassword || os.technicalDetails?.devicePattern) && (
                <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-8">
                  {os.technicalDetails.devicePassword && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center"><KeyRound size={14} className="mr-2" /> Senha do Dispositivo</h4>
                      <p className="text-lg font-black text-slate-800 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">{os.technicalDetails.devicePassword}</p>
                    </div>
                  )}
                  {os.technicalDetails.devicePattern && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center"><Grid3X3 size={14} className="mr-2" /> Padrão de Desbloqueio</h4>
                      <div className="inline-grid grid-cols-3 gap-2 p-3 bg-slate-900 rounded-2xl shadow-inner border border-slate-800">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(idx => {
                          const dots = os.technicalDetails!.devicePattern!.split(',');
                          const isSelected = dots.includes(idx.toString());
                          const order = dots.indexOf(idx.toString()) + 1;
                          return (
                            <div key={idx} className={`w-8 h-8 rounded-full flex items-center justify-center relative transition-all duration-500 ${isSelected ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}>
                              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-600'}`} />
                              {isSelected && <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-blue-600 text-[8px] font-black rounded-full flex items-center justify-center shadow-sm">{order}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center"><AlertTriangle size={14} className="mr-2" /> Defeito Relatado</h4>
                  <p className="text-sm text-slate-700 font-medium bg-slate-50 p-4 rounded-2xl">{os.technicalDetails?.reportedDefect || 'Não relatado'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center"><Wrench size={14} className="mr-2" /> Diagnóstico Técnico</h4>
                  <p className="text-sm text-blue-800 font-bold bg-blue-50/50 p-4 rounded-2xl border border-blue-100">{os.technicalDetails?.technicalDiagnosis || 'Em análise técnica...'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* History Column */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center"><Clock size={16} className="mr-2" /> Linha do Tempo</h4>
            <div className="flex-1 space-y-6 overflow-y-auto max-h-[350px] pr-2 scrollbar-hide">
              {os.history?.slice().reverse().map((h, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-slate-100 last:border-0 pb-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow-sm" />
                  <p className="text-[10px] font-black text-slate-400">{new Date(h.date).toLocaleString('pt-BR')}</p>
                  <p className="text-xs font-black text-slate-700 mt-1 uppercase tracking-wider">{getStatusLabel(h.status).label}</p>
                  <p className="text-[10px] text-slate-500 mt-1 italic">{h.notes}</p>
                </div>
              ))}
              {(!os.history || os.history.length === 0) && (
                <p className="text-xs text-slate-400 italic">Sem histórico registrado.</p>
              )}
            </div>
          </div>
        </div>

        <div className="printable-content bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
          {/* Visual mark for OS */}
          <div className="absolute top-10 right-10 opacity-10 rotate-12 pointer-events-none select-none">
            <h1 className="text-6xl font-black text-slate-900">ORDEM DE SERVIÇO</h1>
            <p className="text-2xl font-black text-center border-t border-slate-900 mt-2">#{os.id}</p>
          </div>

          <ReceiptLayout
            company={company}
            client={client}
            items={os.items}
            paymentMethod="Aguardando Conclusão"
            date={os.createdAt}
            total={os.total}
            saleId={os.id.toUpperCase()}
            products={products}
            services={services}
            type="quote"
            className={showLabelModal ? 'print:hidden' : 'printable-content'}
          />

          {os.technicalDetails?.technicalDiagnosis && (
            <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-200">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Laudo Técnico Oficial</h5>
              <p className="text-sm font-bold text-slate-800 leading-relaxed font-mono">{os.technicalDetails.technicalDiagnosis}</p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-12 pt-12 border-t border-dashed border-slate-200">
            <div className="text-center">
              <div className="h-px bg-slate-400 w-full mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase">{company.name}</p>
            </div>
            <div className="text-center">
              <div className="h-px bg-slate-400 w-full mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client?.name || 'Assinatura do Cliente'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative animate-in fade-in duration-500">
      {view === 'details' && selectedQuote ? renderDetails(selectedQuote) : (
        <>
          {/* KPI Section */}
          {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <StatCard title="Total em Orçamentos" value={`R$ ${stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Receipt className="text-blue-600" />} color="bg-blue-50" />
              <StatCard title="Aguardando Aprovação" value={stats.pendingQuotes} icon={<Clock className="text-amber-600" />} color="bg-amber-50" />
              <StatCard title="Taxa de Aprovação" value={`${stats.conversionRate}%`} icon={<CheckCircle className="text-emerald-600" />} color="bg-emerald-50" />

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status das O.S.</h4>
                  <div className="h-24 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}


          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-[1500px] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
                <div className="px-12 py-8 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="font-black text-slate-800 text-2xl tracking-tighter uppercase">{isEditing ? 'Editar Orçamento' : 'Abertura de Chamado Técnico'}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">SATI Protocolo Digital</p>
                  </div>
                  <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-3 hover:bg-white rounded-full text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                  <div className="w-1/2 p-12 overflow-y-auto space-y-10 border-r border-slate-50">
                    <section className="space-y-6">
                      <h4 className="flex items-center text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]"><User className="mr-3" size={16} /> Identificação e Responsabilidade</h4>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Cliente</label>
                          <select value={newOS.clientId} onChange={e => setNewOS({ ...newOS, clientId: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 focus:bg-white focus:border-blue-400 transition-all">
                            <option value="">Buscar Cliente...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Técnico Designado</label>
                          <select value={newOS.technicianId} onChange={e => setNewOS({ ...newOS, technicianId: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700">
                            <option value="">Selecione...</option>
                            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Status Inicial</label>
                          <select value={newOS.status} onChange={e => setNewOS({ ...newOS, status: e.target.value as AppStatus })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-blue-600">
                            {Object.keys(AppStatus).map((status) => (
                              <option key={status} value={status}>{getStatusLabel(status as AppStatus).label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h4 className="flex items-center text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]"><Smartphone className="mr-3" size={16} /> Equipamento & Detalhes Físicos</h4>
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tipo / Aparelho</label>
                          <input placeholder="Ex: Celular, Tablet" value={newOS.technicalDetails?.equipmentType} onChange={e => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, equipmentType: e.target.value } })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:bg-white transition-all" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Marca / Fabricante</label>
                          <input placeholder="Ex: Apple, Samsung" value={newOS.technicalDetails?.brand} onChange={e => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, brand: e.target.value } })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:bg-white transition-all" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">IMEI / Nº Serial</label>
                          <input placeholder="S/N ou IMEI" value={newOS.technicalDetails?.serialNumber} onChange={e => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, serialNumber: e.target.value } })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-mono text-xs focus:bg-white transition-all" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Modelo Específico</label>
                          <input placeholder="Ex: iPhone 14 Pro Max Silver 256GB" value={newOS.technicalDetails?.deviceModel} onChange={e => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, deviceModel: e.target.value } })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-800 placeholder:font-normal focus:bg-white transition-all" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Estado Físico</label>
                          <select value={newOS.technicalDetails?.visualCondition} onChange={e => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, visualCondition: e.target.value } })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold">
                            <option>Perfeito estado</option>
                            <option>Riscos superficiais</option>
                            <option>Tela quebrada/trincada</option>
                            <option>Com sinais de queda</option>
                            <option>Oxidado/Contato com água</option>
                          </select>
                        </div>
                      </div>
                    </section>
                    <div className="col-span-2 pt-4 border-t border-slate-100">
                      <h4 className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest mb-6"><KeyRound className="mr-2" size={16} /> Segurança do Dispositivo</h4>
                      <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Senha Alfanumérica / PIN</label>
                          <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                              placeholder="Digite a senha ou PIN..."
                              value={newOS.technicalDetails?.devicePassword || ''}
                              onChange={e => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, devicePassword: e.target.value } })}
                              className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase ml-1 italic">* Caso não possua senha, deixe em branco.</p>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Padrão de Desenho (Pattern)</label>
                          <div className="flex items-start space-x-8">
                            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900 rounded-[2rem] shadow-xl border-4 border-slate-800">
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                                const pattern = newOS.technicalDetails?.devicePattern || '';
                                const dots = pattern ? pattern.split(',') : [];
                                const isSelected = dots.includes(idx.toString());
                                const order = dots.indexOf(idx.toString()) + 1;

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      const newDots = isSelected
                                        ? dots.filter(d => d !== idx.toString())
                                        : [...dots, idx.toString()];
                                      setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, devicePattern: newDots.join(',') } });
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative ${isSelected
                                      ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110'
                                      : 'bg-slate-700 hover:bg-slate-600'
                                      }`}
                                  >
                                    <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-500'}`} />
                                    {isSelected && (
                                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-blue-600 text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                                        {order}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex-1 space-y-3 pt-2">
                              <button
                                type="button"
                                onClick={() => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, devicePattern: '' } })}
                                className="text-[10px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest underline decoration-2 underline-offset-4 transition-colors"
                              >
                                Limpar Desenho
                              </button>
                              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Toque nos pontos na ordem do desenho para registrar o padrão de desbloqueio.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 pt-4 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Defeito Informado pelo Cliente</label>
                      <textarea placeholder="Relato do cliente..." rows={3} value={newOS.technicalDetails?.reportedDefect} onChange={e => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, reportedDefect: e.target.value } })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm" />
                    </div>

                    <div className="col-span-2 pt-4 border-t border-slate-100">
                      <h4 className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest mb-4"><Wrench className="mr-2" size={16} /> Diagnóstico Técnico</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Diagnóstico do Técnico</label>
                          <textarea placeholder="O que foi identificado no laboratório..." rows={2} value={newOS.technicalDetails?.technicalDiagnosis} onChange={e => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, technicalDiagnosis: e.target.value } })} className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-2xl outline-none text-sm font-medium" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Categoria do Defeito</label>
                          <select value={newOS.technicalDetails?.defectCategory} onChange={e => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, defectCategory: e.target.value as any } })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none">
                            <option value="Software">Software</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Elétrico">Elétrico</option>
                            <option value="Outros">Outros</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Observações Internas (Privado)</label>
                        <textarea placeholder="Apenas para equipe..." rows={2} value={newOS.technicalDetails?.internalNotes} onChange={e => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, internalNotes: e.target.value } })} className="w-full p-4 bg-amber-50/30 border border-amber-100 rounded-2xl outline-none text-[10px] italic" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Observações Externas (Em Laudo)</label>
                        <textarea placeholder="Será visível no comprovante..." rows={2} value={newOS.technicalDetails?.externalNotes} onChange={e => setNewOS({ ...newOS, technicalDetails: { ...newOS.technicalDetails!, externalNotes: e.target.value } })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-[10px]" />
                      </div>
                    </div>
                  </div>

                  <div className="w-1/2 bg-slate-50 p-12 flex flex-col">
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-200 mb-8">
                      <button onClick={() => setActiveCatalog('products')} className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCatalog === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
                        <Box size={14} /><span>Peças</span>
                      </button>
                      <button onClick={() => setActiveCatalog('services')} className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCatalog === 'services' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
                        <Wrench size={14} /><span>Serviços</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3">
                      {(activeCatalog === 'products' ? products : services).map(item => (
                        <button key={item.id} onClick={() => handleAddItem(item.id, activeCatalog === 'products' ? 'product' : 'service')} className="w-full p-5 bg-white rounded-3xl border border-slate-100 flex items-center justify-between hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50/50 transition-all text-left group">
                          <div>
                            <p className="text-sm font-black text-slate-800 group-hover:text-blue-600">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">R$ {(item as any).salePrice || (item as any).price}</p>
                          </div>
                          <Plus size={20} className="text-slate-300 group-hover:text-blue-600" />
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-200">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4">Itens Selecionados ({newOS.items?.length})</h4>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {newOS.items?.map((item, i) => {
                          const label = item.type === 'product' ? products.find(p => p.id === item.productId)?.name : services.find(s => s.id === item.serviceId)?.name;
                          return (
                            <div key={i} className="group flex items-center justify-between text-xs font-bold text-slate-600 bg-white p-3 rounded-xl border border-slate-100 hover:border-red-200 transition-all">
                              <span>{label}</span>
                              <div className="flex items-center space-x-3">
                                <span className="text-blue-600">R$ {item.price}</span>
                                <button
                                  onClick={() => handleRemoveItem(i)}
                                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Remover Item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-12 bg-white border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total Previsto</p>
                    <p className="text-4xl font-black text-slate-900">R$ {newOS.items?.reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex space-x-4">
                    <button onClick={() => { setShowAddModal(false); resetForm(); }} className="px-10 py-5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all uppercase text-xs tracking-widest">Cancelar</button>
                    <button onClick={handleSaveOS} className="px-14 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 flex items-center space-x-3 active:scale-95 transition-all">
                      {isEditing ? <Save size={20} /> : <ClipboardCheck size={20} />}
                      <span>{isEditing ? 'Salvar Alterações' : 'Emitir Ordem de Serviço'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
          }

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2 flex-1 max-w-xl">
              <button onClick={() => setShowCharts(!showCharts)} className={`p-4 rounded-[2rem] transition-all shadow-sm ${showCharts ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white border border-slate-100 text-slate-400 hover:text-blue-500'}`}>
                <BarChart3 size={20} />
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input type="text" placeholder="Filtrar Ordens por Cliente ou Modelo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-slate-900" />
              </div>
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-3 px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
              <Plus size={20} /><span>Nova Ordem de Serviço</span>
            </button>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-10 py-6">Protocolo</th>
                  <th className="px-10 py-6">Equipamento</th>
                  <th className="px-10 py-6">Cliente</th>
                  <th className="px-10 py-6">Status da OS</th>
                  <th className="px-10 py-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {quotes.filter(q => (clients.find(c => c.id === q.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) || q.technicalDetails?.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()))).map(os => (
                  <tr key={os.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6 font-black text-blue-600 text-xs">#{os.id}</td>
                    <td className="px-10 py-6">
                      <p className="font-bold text-slate-800">{os.technicalDetails?.deviceModel || 'N/I'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{os.technicalDetails?.serialNumber || 'SEM SERIAL'}</p>
                    </td>
                    <td className="px-10 py-6 font-black text-slate-700 text-sm">{clients.find(c => c.id === os.clientId)?.name || 'Cliente Removido'}</td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusLabel(os.status).color}`}>
                        {getStatusLabel(os.status).label}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handlePrintLabel(os)} className="p-3 bg-white text-amber-500 hover:bg-amber-50 border border-slate-100 rounded-2xl shadow-sm transition-all" title="Etiqueta de Aparelho"><Tag size={18} /></button>
                        <button onClick={() => handleEdit(os)} className="p-3 bg-white text-blue-500 hover:bg-blue-50 border border-slate-100 rounded-2xl shadow-sm transition-all" title="Editar"><Edit2 size={18} /></button>
                        <button onClick={() => { setSelectedQuote(os); setView('details'); }} className="p-3 bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 rounded-2xl shadow-sm transition-all" title="Ver Recibo"><Eye size={18} /></button>
                        <button onClick={() => confirm("Remover OS permanentemente?") && onDeleteQuote(os.id)} className="p-3 bg-white text-red-400 hover:bg-red-50 border border-slate-100 rounded-2xl shadow-sm transition-all" title="Excluir"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr><td colSpan={5} className="px-10 py-20 text-center text-slate-400 italic font-medium">Nenhuma ordem de serviço pendente ou em manutenção.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showLabelModal && selectedQuoteForLabel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          {/* Modal UI (Hidden on Print) */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full space-y-8 animate-in zoom-in-95 duration-200 print:hidden">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-800 text-xl tracking-tighter uppercase italic">Etiqueta de Controle</h3>
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-0.5">Identificação de Equipamento</p>
              </div>
              <button onClick={() => setShowLabelModal(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>

            <div className="flex justify-center border-4 border-slate-50 p-6 rounded-[2rem] bg-slate-50/20 shadow-inner">
              {/* Preview version (Not the one that prints) */}
              <div className="scale-75 origin-center">
                <DeviceLabel
                  company={company}
                  quote={selectedQuoteForLabel}
                  client={clients.find(c => c.id === selectedQuoteForLabel.clientId)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => window.print()}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 flex items-center justify-center space-x-3 active:scale-95 transition-all"
              >
                <Printer size={20} />
                <span>IMPRIMIR ETIQUETA</span>
              </button>
              <div className="text-center space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Formato Otimizado: 80mm x 40mm</p>
                <p className="text-[8px] text-slate-300 font-medium uppercase tracking-tighter">Compatível com impressoras térmicas padrão</p>
              </div>
            </div>
          </div>

          {/* Actual Printable Label (Absolute positioned via CSS in index.css) */}
          <div className="printable-label hidden print:flex">
            <DeviceLabel
              company={company}
              quote={selectedQuoteForLabel}
              client={clients.find(c => c.id === selectedQuoteForLabel.clientId)}
            />
          </div>
        </div>
      )}
    </div >
  );
};
