
import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
  FileDown,
  Printer,
  X,
  PieChart,
  Target,
  Trophy,
  Calendar,
  Users,
  Building
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Sale, Purchase, Product, Company, Client, Quote } from '../types';
import { PDFReportTemplate } from './PDFReportTemplate';
import html2canvas from 'html2canvas';

interface ReportsProps {
  sales: Sale[];
  purchases: Purchase[];
  products: Product[];
  clients: Client[];
  quotes?: Quote[];
  company: Company;
}

export const Reports: React.FC<ReportsProps> = ({ sales, purchases, products, clients, quotes, company }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'strategy' | 'reports'>('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportConfig, setReportConfig] = useState<{
    title: string;
    period: string;
    columns: string[];
    data: (string | number)[][];
    totalLabel?: string;
    totalValue?: number;
  } | null>(null);

  const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
  const totalPurchases = purchases.reduce((acc, p) => acc + p.total, 0);
  const profit = totalSales - totalPurchases;
  const stockValue = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);

  // ... (rest of memo hooks same) ...

  const monthlySalesData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    const totalsByMonth: Record<string, number> = months.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {} as Record<string, number>);

    sales.forEach(sale => {
      const date = new Date(sale.date);
      if (date.getFullYear() === currentYear) {
        const monthName = months[date.getMonth()];
        totalsByMonth[monthName] += sale.total;
      }
    });

    return months.map(month => ({ name: month, total: totalsByMonth[month] }));
  }, [sales]);

  const abcData = useMemo(() => {
    const sorted = [...products].sort((a, b) => (b.salePrice * b.stock) - (a.salePrice * a.stock));
    return sorted.slice(0, 5);
  }, [products]);

  const renderModal = () => {
    if (!activeModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-black text-slate-800 text-xl uppercase tracking-tight">{activeModal}</h3>
            <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={24} /></button>
          </div>
          <div className="p-10 space-y-6">
            {activeModal.includes("ABC") && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 font-medium">Produtos com maior representatividade financeira no estoque atual:</p>
                {abcData.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</span>
                      <span className="font-bold text-slate-800">{p.name}</span>
                    </div>
                    <span className="font-black text-slate-900">R$ {(p.salePrice * p.stock).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            {activeModal.includes("Custos") && (
              <div className="text-center py-10">
                <TrendingDown size={48} className="mx-auto text-red-400 mb-4" />
                <p className="font-bold text-slate-800">Custo Total de Aquisição acumulado: R$ {totalPurchases.toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-2">Dados baseados em todos os pedidos de compra processados.</p>
              </div>
            )}
            {activeModal.includes("Desempenho") && (
              <div className="space-y-4">
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Melhor Vendedor</p>
                    <p className="text-xl font-black text-slate-900">Equipe Àgio</p>
                  </div>
                  <Trophy className="text-blue-600" size={32} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Taxa de Conversão</p>
                    <p className="text-lg font-black text-emerald-600">
                      {quotes && quotes.length > 0
                        ? `${((quotes.filter(q => q.status === 'APPROVED').length / quotes.length) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Orçamentos Totais</p>
                    <p className="text-lg font-black text-slate-800">{quotes?.length || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Report Generation Functions
  const generateSalesReport = () => {
    const filtered = sales.filter(s => {
      if (!startDate && !endDate) return true;
      const saleDate = new Date(s.date);
      if (startDate && new Date(startDate) > saleDate) return false;
      if (endDate && new Date(endDate) < saleDate) return false;
      return true;
    });

    const csv = 'ID,Data,Cliente,Total,Forma de Pagamento\n' +
      filtered.map(s => {
        const clientName = clients.find(c => c.id === s.clientId)?.name || 'Consumidor Final';
        return `${s.id},${s.date},${clientName},${s.total},${s.paymentMethod}`;
      }).join('\n');

    downloadCSV(csv, `relatorio-vendas-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const generatePurchasesReport = () => {
    const filtered = purchases.filter(p => {
      if (!startDate && !endDate) return true;
      const purchaseDate = new Date(p.date);
      if (startDate && new Date(startDate) > purchaseDate) return false;
      if (endDate && new Date(endDate) < purchaseDate) return false;
      return true;
    });

    const csv = 'ID,Data,Fornecedor,Total\n' +
      filtered.map(p => `${p.id},${p.date},${p.supplierId},${p.total}`).join('\n');

    downloadCSV(csv, `relatorio-compras-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const generateInventoryReport = () => {
    const csv = 'Código,Nome,Estoque,Preço Custo,Preço Venda,Valor Total\n' +
      products.map(p => `${p.code},${p.name},${p.stock},${p.costPrice},${p.salePrice},${p.stock * p.costPrice}`).join('\n');

    downloadCSV(csv, `relatorio-estoque-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const generateRegistrationsReport = () => {
    const csv = 'Nome,Documento,Telefone,Cidade/UF\n' +
      clients.map(c => `${c.name},"${c.document || ''}","${c.phone || ''}","${c.city || ''}/${c.state || ''}"`).join('\n');

    downloadCSV(csv, `relatorio-clientes-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Professional PDF Generation using Template + html2canvas
  const generatePDFVersion = async (config: {
    title: string;
    period: string;
    columns: string[];
    data: (string | number)[][];
    totalLabel?: string;
    totalValue?: number;
    filename: string;
  }) => {
    setReportConfig(config);

    // Wait for the DOM to update with the new config
    setTimeout(async () => {
      const element = document.getElementById('report-template-container');
      if (!element) return;

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(config.filename);
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Falha ao gerar o PDF profissional. Verifique os dados e tente novamente.');
      } finally {
        setReportConfig(null);
      }
    }, 500);
  };

  const generateSalesPDF = () => {
    const filtered = sales.filter(s => {
      if (!startDate && !endDate) return true;
      const saleDate = new Date(s.date);
      if (startDate && new Date(startDate) > saleDate) return false;
      if (endDate && new Date(endDate) < saleDate) return false;
      return true;
    });

    generatePDFVersion({
      title: 'Relatório Executivo de Vendas',
      period: `Período: ${startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'Início'} até ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Hoje'}`,
      columns: ['Protocolo ID', 'Data do Evento', 'Cliente Responsável', 'Forma de Pagto', 'Total Líquido'],
      data: filtered.map(s => [
        `#${s.id.slice(-6).toUpperCase()}`,
        new Date(s.date).toLocaleDateString('pt-BR'),
        clients.find(c => c.id === s.clientId)?.name || 'Consumidor Final',
        s.paymentMethod,
        `R$ ${s.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]),
      totalLabel: 'Valor Total Bruto Comercializado',
      totalValue: filtered.reduce((acc, s) => acc + s.total, 0),
      filename: `relatorio-vendas-${new Date().toISOString().split('T')[0]}.pdf`
    });
  };

  const generatePurchasesPDF = () => {
    const filtered = purchases.filter(p => {
      if (!startDate && !endDate) return true;
      const purchaseDate = new Date(p.date);
      if (startDate && new Date(startDate) > purchaseDate) return false;
      if (endDate && new Date(endDate) < purchaseDate) return false;
      return true;
    });

    generatePDFVersion({
      title: 'Relatório de Aquisições e Compras',
      period: `Período: ${startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'Início'} até ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Hoje'}`,
      columns: ['Protocolo ID', 'Data Compra', 'Identificação Fornecedor', 'Valor de Custo'],
      data: filtered.map(p => [
        `#${p.id.slice(-6).toUpperCase()}`,
        new Date(p.date).toLocaleDateString('pt-BR'),
        p.supplierId || 'Fornecedor N/I',
        `R$ ${p.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]),
      totalLabel: 'Custo Total de Aquisições',
      totalValue: filtered.reduce((acc, p) => acc + p.total, 0),
      filename: `relatorio-compras-${new Date().toISOString().split('T')[0]}.pdf`
    });
  };

  const generateInventoryPDF = () => {
    generatePDFVersion({
      title: 'Relatório de Posição de Estoque',
      period: `Situação do Inventário em ${new Date().toLocaleDateString('pt-BR')}`,
      columns: ['Cod Int', 'Nomenclatura do Produto', 'Saldo Físico', 'Valor Unit. Custo', 'Valor Total Ativo'],
      data: products.map(p => [
        p.code.substring(0, 10),
        p.name,
        `${p.stock} Unid`,
        `R$ ${p.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${(p.stock * p.costPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]),
      totalLabel: 'Valor Total Ativo em Estoque',
      totalValue: products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0),
      filename: `relatorio-estoque-${new Date().toISOString().split('T')[0]}.pdf`
    });
  };

  const generateRegistrationsPDF = () => {
    generatePDFVersion({
      title: 'Relatório de Base de Clientes',
      period: `Emitido em: ${new Date().toLocaleDateString('pt-BR')}`,
      columns: ['Nomenclatura Completa', 'CPF/CNPJ Identificado', 'Contato Principal', 'Localidade (Cidade/UF)'],
      data: clients.map(c => [
        c.name,
        c.document || 'N/I',
        c.phone || 'Sem Contato',
        `${c.city || 'N/I'}/${c.state || 'N/I'}`
      ]),
      filename: `relatorio-clientes-${new Date().toISOString().split('T')[0]}.pdf`
    });
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><TrendingUp size={24} /></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Vendas Totais</p>
                <p className="text-2xl font-black text-gray-900">R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4"><TrendingDown size={24} /></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Compras Totais</p>
                <p className="text-2xl font-black text-gray-900">R$ {totalPurchases.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Package size={24} /></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Valoração Estoque</p>
                <p className="text-2xl font-black text-gray-900">R$ {stockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className={`w-12 h-12 ${profit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} rounded-xl flex items-center justify-center mb-4`}><DollarSign size={24} /></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo Bruto</p>
                <p className="text-2xl font-black text-gray-900">R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-[450px]">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center text-lg"><BarChart3 className="mr-2 text-blue-600" size={22} /> Faturamento Mensal</h4>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      case 'strategy':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center"><BarChart3 className="mr-2 text-blue-600" size={20} /> Análise Estratégica</h4>
              <div className="space-y-4">
                {[
                  { title: "Curva ABC de Vendas", desc: "Produtos com maior saída e representatividade financeira.", icon: <ShoppingCart className="text-blue-500" /> },
                  { title: "Custos de Aquisição", desc: "Análise histórica de preços pagos por insumos.", icon: <Truck className="text-amber-500" /> },
                  { title: "Desempenho da Equipe", desc: "Taxas de conversão e volume de orçamentos.", icon: <Target className="text-indigo-500" /> },
                ].map((item, i) => (
                  <div key={i} onClick={() => setActiveModal(item.title)} className="flex items-center justify-between p-4 border border-gray-50 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
                    <div className="flex items-center space-x-4">
                      <div className="p-2.5 bg-white shadow-sm border border-gray-100 rounded-lg group-hover:scale-110 transition-transform">{item.icon}</div>
                      <div>
                        <p className="font-bold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                    <FileDown size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-8 text-white">
              <h4 className="font-bold text-blue-400 text-sm uppercase tracking-widest mb-6">Metas da Empresa</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2"><span>EFICIÊNCIA</span><span className="text-emerald-400">85%</span></div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[85%]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2"><span>CONVERSÃO</span><span className="text-blue-400">48%</span></div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[48%]"></div></div>
                </div>
              </div>
              <button className="w-full mt-10 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all text-sm">Exportar Inteligência (CSV)</button>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            {/* Period Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="mr-2 text-blue-600" size={20} />
                Selecionar Período
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Data Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Data Fim</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all uppercase text-sm"
                  >
                    Limpar Filtro
                  </button>
                </div>
              </div>
              {startDate && endDate && (
                <p className="text-sm text-slate-600 mt-4">
                  📅 Período selecionado: <span className="font-bold">{new Date(startDate).toLocaleDateString('pt-BR')}</span> até <span className="font-bold">{new Date(endDate).toLocaleDateString('pt-BR')}</span>
                </p>
              )}
            </div>

            {/* Report Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales Report */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp size={32} />
                  </div>
                  <FileDown size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-black text-2xl mb-2 uppercase tracking-wider">Relatório de Vendas</h3>
                <p className="text-emerald-100 text-sm mb-4">Exportar todas as vendas do período selecionado</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={generateSalesPDF}
                    className="bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <Printer size={14} />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={generateSalesReport}
                    className="bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <FileDown size={14} />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Purchases Report */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                    <ShoppingCart size={32} />
                  </div>
                  <FileDown size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-black text-2xl mb-2 uppercase tracking-wider">Relatório de Compras</h3>
                <p className="text-red-100 text-sm mb-4">Exportar todas as compras do período selecionado</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={generatePurchasesPDF}
                    className="bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <Printer size={14} />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={generatePurchasesReport}
                    className="bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <FileDown size={14} />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Inventory Report */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Package size={32} />
                  </div>
                  <FileDown size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-black text-2xl mb-2 uppercase tracking-wider">Relatório de Estoque</h3>
                <p className="text-blue-100 text-sm mb-4">Exportar situação atual do inventário</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={generateInventoryPDF}
                    className="bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <Printer size={14} />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={generateInventoryReport}
                    className="bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <FileDown size={14} />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Registrations Report */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Users size={32} />
                  </div>
                  <FileDown size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-black text-2xl mb-2 uppercase tracking-wider">Relatório de Cadastros</h3>
                <p className="text-purple-100 text-sm mb-4">Exportar lista de clientes e fornecedores</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={generateRegistrationsPDF}
                    className="bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <Printer size={14} />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={generateRegistrationsReport}
                    className="bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <FileDown size={14} />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-10 text-center text-slate-400">Selecione uma categoria de relatório.</div>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {renderModal()}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-gray-800">Relatórios Estratégicos</h3>
          <p className="text-slate-500 text-sm">Visualize o desempenho do seu negócio.</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          {[
            { key: 'overview', label: 'Visão Geral' },
            { key: 'strategy', label: 'Estratégia & Metas' },
            { key: 'reports', label: 'Relatórios Periódicos' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.key ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {renderContent()}

      {/* Professional PDF template for Export - Must have size for html2canvas to work */}
      <div
        id="report-template-container"
        className="fixed top-0 left-0 pointer-events-none z-[-100] bg-white translate-x-[-100%]"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {reportConfig && (
          <PDFReportTemplate
            company={company}
            title={reportConfig.title}
            period={reportConfig.period}
            columns={reportConfig.columns}
            data={reportConfig.data}
            totalLabel={reportConfig.totalLabel}
            totalValue={reportConfig.totalValue}
          />
        )}
      </div>

    </div>
  );
};
