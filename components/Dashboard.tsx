
import React, { useMemo, useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { StatCard } from './StatCard';
import { TrendingUp, TrendingDown, Users, Package, FileText, AlertCircle, Wallet, Target, Calendar, Clock, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { Sale, Quote, Product, Client, Company, Purchase, UserAccount } from '../types';

interface DashboardProps {
  sales: Sale[];
  quotes: Quote[];
  products: Product[];
  clients: Client[];
  company: Company | null;
  purchases: Purchase[];
  user: UserAccount | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ sales, quotes, products, clients, company, purchases, user }) => {
  // Helper: Get local date string YYYY-MM-DD
  const getLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = getLocalDate(currentTime);
  const currentMonthStr = String(currentTime.getMonth() + 1).padStart(2, '0');

  // --- KPI CALCULATIONS ---

  // 1. Total Revenue (All time or Month? Let's do Month for relevance)
  const currentMonthSales = sales.filter(s => s.date.split('-')[1] === currentMonthStr);
  const monthlyRevenue = currentMonthSales.reduce((acc, s) => acc + s.total, 0);

  // 2. Net Profit (Month)
  const currentMonthPurchases = purchases.filter(p => p.date.split('-')[1] === currentMonthStr);
  const monthlyExpenses = currentMonthPurchases.reduce((acc, p) => acc + p.total, 0);
  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  // 3. Ticket Average (All time for stability, or Month)
  const avgTicket = currentMonthSales.length > 0 ? monthlyRevenue / currentMonthSales.length : 0;

  // 4. Pending Quotes
  const pendingQuotes = quotes.filter(q => q.status === 'PENDING').length;
  const approvedQuotes = quotes.filter(q => q.status === 'APPROVED').length;
  const conversionRate = quotes.length > 0 ? (approvedQuotes / quotes.length) * 100 : 0;

  // --- CHART DATA PREPARATION ---

  // Chart 1: Revenue vs Expenses (Last 7 Days)
  const areaChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return getLocalDate(d);
    });

    return last7Days.map(date => {
      const daySales = sales.filter(s => s.date === date).reduce((acc, s) => acc + s.total, 0);
      const dayExpenses = purchases.filter(p => p.date === date).reduce((acc, p) => acc + p.total, 0);
      const dayName = new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' });
      return {
        name: dayName,
        Receita: daySales,
        Despesa: dayExpenses,
        Lucro: daySales - dayExpenses
      };
    });
  }, [sales, purchases]);

  // Chart 2: Payment Methods (Donut)
  const paymentMethodData = useMemo(() => {
    const counts: Record<string, number> = {};
    currentMonthSales.forEach(s => {
      counts[s.paymentMethod] = (counts[s.paymentMethod] || 0) + s.total;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [currentMonthSales]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  // --- WELCOME HEADER ---
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{greeting}, {user?.fullName || 'Equipe'}!</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Aqui está o resumo financeiro e operacional de hoje.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <Calendar className="text-slate-400" size={18} />
            <span className="text-sm font-bold text-slate-700">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-900 rounded-xl shadow-lg shadow-slate-200">
            <Clock className="text-emerald-400" size={18} />
            <span className="text-sm font-bold text-white">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Revenue */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest bg-emerald-700/30 px-2 py-1 rounded-full">Mensal</span>
            </div>
            <p className="text-sm text-emerald-100 font-medium">Faturamento Líquido</p>
            <h3 className="text-3xl font-black mt-1">R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <div className="flex items-center mt-4 text-xs font-bold text-emerald-100">
              <span className="bg-white/20 px-2 py-0.5 rounded mr-2 flex items-center">
                <ArrowUp size={12} className="mr-1" /> +12%
              </span>
              <span>vs mês anterior</span>
            </div>
          </div>
        </div>

        {/* Card 2: Profit */}
        <StatCard
          title="Lucro Operacional (Mês)"
          value={`R$ ${monthlyProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<Wallet className="text-blue-600" />}
          color="bg-blue-50"
          subtext={`${((monthlyProfit / (monthlyRevenue || 1)) * 100).toFixed(1)}% de margem`}
        />

        {/* Card 3: Pending Quotes */}
        <StatCard
          title="Orçamentos Pendentes"
          value={pendingQuotes}
          icon={<FileText className="text-amber-600" />}
          color="bg-amber-50"
          subtext={`${pendingQuotes > 0 ? 'Ação necessária' : 'Tudo em dia'}`}
        />

        {/* Card 4: Ticket Average */}
        <StatCard
          title="Ticket Médio"
          value={`R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<Target className="text-purple-600" />}
          color="bg-purple-50"
          subtext="Por venda realizada"
        />
      </div>

      {/* Main Charts Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Financial Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-blue-500" /> Fluxo Financeiro
              </h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Comparativo de Receitas vs Despesas (7 dias)</p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} tickFormatter={(value) => `k${value / 1000}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" name="Receitas" dataKey="Receita" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" name="Despesas" dataKey="Despesa" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Payment Methods (Pie Chart) or Top Products */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-black text-xl text-slate-800 mb-1">Meios de Pagamento</h3>
          <p className="text-sm text-slate-400 font-medium mb-6">Distribuição das vendas do mês</p>

          <div className="flex-1 min-h-[250px] relative">
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={6} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => `R$ ${val.toFixed(2)}`}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                <PieChart size={48} className="mb-2 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-widest">Sem dados no período</p>
              </div>
            )}
          </div>

          {/* Mini Insight */}
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Método Favorito</p>
            <p className="text-lg font-black text-slate-800">
              {paymentMethodData.length > 0
                ? paymentMethodData.sort((a, b) => b.value - a.value)[0].name
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Quotes List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center">
              <FileText className="mr-2 text-indigo-500" size={20} /> Últimos Orçamentos
            </h3>
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">{quotes.length} Total</span>
          </div>
          <div className="p-2">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                {quotes.slice(0, 5).map(q => {
                  const client = clients.find(c => c.id === q.clientId);
                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-10 rounded-full ${q.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{client?.name || 'Cliente'}</p>
                            <p className="text-xs text-slate-400 font-mono">#{q.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-black text-slate-800 text-sm">R$ {q.total.toFixed(2)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{new Date(q.createdAt).toLocaleDateString('pt-BR')}</p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/30">
            <h3 className="font-bold text-slate-800 flex items-center">
              <AlertCircle className="mr-2 text-red-500" size={20} /> Alertas de Estoque
            </h3>
          </div>
          <div className="p-2 flex-1 overflow-y-auto max-h-[300px]">
            {products.filter(p => p.stock <= p.minStock).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-50">
                <Package size={48} className="text-emerald-500 mb-2" />
                <p className="font-bold text-slate-600">Estoque Saudável!</p>
                <p className="text-xs text-slate-400">Nenhum produto abaixo do mínimo.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-100">
                  {products.filter(p => p.stock <= p.minStock).slice(0, 5).map(p => (
                    <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-400 font-mono">CODE: {p.code}</p>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Atual</span>
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-black">{p.stock} un</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {products.filter(p => p.stock <= p.minStock).length > 5 && (
            <div className="p-3 bg-slate-50 text-center text-xs font-bold text-slate-500 uppercase tracking-widest border-t border-slate-100">
              + {products.filter(p => p.stock <= p.minStock).length - 5} produtos em alerta
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
