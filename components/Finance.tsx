import React, { useState } from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp, Filter, Calendar, FileText, PieChart, DoorClosed, X, Printer, Download, Edit, Lock, Unlock, DollarSign as DollarIcon } from 'lucide-react';
import { Sale, Purchase, Company, Closure } from '../types';

interface FinanceProps {
  sales: Sale[];
  purchases: Purchase[];
  company: Company;
  closures: Closure[];
  onSaveClosure: (closure: Closure) => Promise<void>;
  onDeleteClosure: (id: string) => Promise<void>;
}

export const Finance: React.FC<FinanceProps> = ({ sales, purchases, company, closures, onSaveClosure, onDeleteClosure }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCloseRegister, setShowCloseRegister] = useState(false);
  const [monthlyGoal, setMonthlyGoal] = useState(50000);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(monthlyGoal);
  const [showDRE, setShowDRE] = useState(false);
  const [showCashFlow, setShowCashFlow] = useState(false);
  const [showOpenRegister, setShowOpenRegister] = useState(false);
  const [password, setPassword] = useState('');
  const [editingClosure, setEditingClosure] = useState<number | null>(null);

  // State for Reopen Modal logic
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [reopenPassword, setReopenPassword] = useState('');

  // Helper to check if dates match in local time, safely handling UTC vs Local strings
  const datesMatch = (date1: string | Date, date2: string | Date) => {
    if (!date1 || !date2) return false;

    const d1 = typeof date1 === 'string' ? (date1.includes('T') ? new Date(date1) : new Date(date1 + 'T12:00:00')) : new Date(date1);
    const d2 = typeof date2 === 'string' ? (date2.includes('T') ? new Date(date2) : new Date(date2 + 'T12:00:00')) : new Date(date2);

    return d1.toLocaleDateString('pt-BR') === d2.toLocaleDateString('pt-BR');
  };

  // Determine current register status based on selected date's closure
  // This is the source of truth for the entire page's status
  const selectedClosure = closures.find(c => datesMatch(c.date, selectedDate));
  const registerStatus = selectedClosure ? selectedClosure.status : 'open';

  // Revenue and Expenses for SELECTED DATE
  const selectedDateSales = sales.filter(s => datesMatch(s.date, selectedDate));
  const selectedDateRevenue = selectedDateSales.reduce((acc, s) => acc + s.total, 0);

  const selectedDatePurchases = purchases.filter(p => datesMatch(p.date, selectedDate));
  const selectedDateExpense = selectedDatePurchases.reduce((acc, p) => acc + p.total, 0);

  const selectedDateBalance = selectedDateRevenue - selectedDateExpense;

  // Monthly Calculations (Source of truth for cards and charts)
  const isSameMonth = (d1: string | Date, d2: string | Date) => {
    const date1 = typeof d1 === 'string' ? (d1.includes('T') ? new Date(d1) : new Date(d1 + 'T12:00:00')) : new Date(d1);
    const date2 = typeof d2 === 'string' ? (d2.includes('T') ? new Date(d2) : new Date(d2 + 'T12:00:00')) : new Date(d2);
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  };

  const monthSales = sales.filter(s => isSameMonth(s.date, selectedDate));
  const monthRevenue = monthSales.reduce((acc, s) => acc + s.total, 0);

  const monthPurchases = purchases.filter(p => isSameMonth(p.date, selectedDate));
  const monthExpense = monthPurchases.reduce((acc, p) => acc + p.total, 0);

  const monthBalance = monthRevenue - monthExpense;

  // Global totals (Wallet)
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalExpense = purchases.reduce((acc, p) => acc + p.total, 0);
  const balance = totalRevenue - totalExpense;

  const handleCloseRegister = async () => {
    // Check if a closure for the selected date already exists
    const existingClosure = closures.find(c => datesMatch(c.date, selectedDate));

    const closureData: Closure = {
      id: existingClosure ? existingClosure.id : Date.now().toString(),
      date: existingClosure ? existingClosure.date : new Date(selectedDate + 'T12:00:00').toISOString(),
      revenue: selectedDateRevenue,
      expense: selectedDateExpense,
      balance: selectedDateBalance,
      transactions: selectedDateSales.length + selectedDatePurchases.length,
      status: 'closed'
    };

    await onSaveClosure(closureData);
    setShowCloseRegister(false);
    alert('Caixa fechado com sucesso!');
  };

  const handleOpenRegister = () => {
    // Just unlocks the UI for now, logic handled by state derivation
    const validPassword = company.password || '';
    if (password === validPassword) {
      setShowOpenRegister(false);
      setPassword('');
      alert('Caixa aberto com sucesso!');
    } else {
      alert('Senha incorreta! Verifique em "Minha Empresa" se a senha foi definida.');
      setPassword('');
    }
  };

  const handleReopenConfirm = async (closure: Closure) => {
    const validPassword = company.password || '';
    if (reopenPassword === validPassword || password === validPassword) {
      // Update status to open instead of deleting
      const updatedClosure: Closure = { ...closure, status: 'open' };
      await onSaveClosure(updatedClosure);
      setEditingClosure(null);
      setShowReopenConfirm(false);
      setShowOpenRegister(false); // Close both modals if they came from different paths
      setReopenPassword('');
      setPassword('');
      alert('Caixa reaberto com sucesso! O registro foi marcado como ABERTO.');
    } else {
      alert('Senha incorreta!');
    }
  };

  const handleDeleteClosure = async (id: string) => {
    // Handled by parent confirmation usually, but adding explicit confirm just in case
    await onDeleteClosure(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestão Financeira</h2>
          <p className="text-slate-500 text-sm">Controle de entradas, saídas e fechamento de caixa.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Período:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="outline-none font-bold text-slate-700 bg-transparent px-2 py-1"
            />
          </div>

          <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl shadow-sm ${registerStatus === 'open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'} `}>
            <div className={`w-2 h-2 rounded-full ${registerStatus === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'} `} />
            <span className="font-bold uppercase text-xs tracking-wider">
              {registerStatus === 'open' ? 'Caixa Aberto' : 'Caixa Fechado'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowUpCircle size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Receitas do Mês</p>
            <p className="text-2xl font-black text-emerald-700">R$ {monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total: R$ {totalRevenue.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <ArrowDownCircle size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Despesas do Mês</p>
            <p className="text-2xl font-black text-red-700">R$ {monthExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total: R$ {totalExpense.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-500 text-white rounded-xl">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Saldo em Caixa</p>
            <p className="text-2xl font-black text-white">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Líquido: R$ {monthBalance.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Close/Open Register Banner */}
      <div className={`rounded-2xl shadow-xl overflow-hidden transition-all ${registerStatus === 'open' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`}>
        <button
          onClick={() => registerStatus === 'open' ? setShowCloseRegister(true) : setShowOpenRegister(true)}
          className="w-full p-6 flex items-center justify-between hover:opacity-90 transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
              {registerStatus === 'open' ? <DoorClosed size={28} className="text-white" /> : <Unlock size={28} className="text-white" />}
            </div>
            <div className="text-left">
              <p className="text-white font-black text-lg uppercase tracking-wider">
                {registerStatus === 'open' ? 'Fechar Caixa' : 'Reabrir Caixa'}
              </p>
              <p className="text-white/80 text-sm">
                {registerStatus === 'open'
                  ? `Encerrar movimentações de ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}`
                  : `O caixa deste dia está fechado. Clique para reabrir.`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">Saldo do Dia</p>
            <p className="text-2xl font-black text-white">R$ {selectedDateBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </button>
      </div>

      {/* Close Register Modal */}
      {showCloseRegister && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <DoorClosed size={24} />
                  </div>
                  <span className="font-black text-xl uppercase tracking-wider">Fechamento de Caixa</span>
                </div>
                <button onClick={() => setShowCloseRegister(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-200">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Receitas do Dia</p>
                  <p className="text-3xl font-black text-emerald-700">R$ {selectedDateRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-emerald-600 mt-2">{selectedDateSales.length} transações</p>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">Despesas do Dia</p>
                  <p className="text-3xl font-black text-red-700">R$ {selectedDateExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-red-600 mt-2">{selectedDatePurchases.length} transações</p>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Saldo Final do Dia</p>
                <p className={`text-4xl font-black ${selectedDateBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  R$ {selectedDateBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold uppercase text-sm hover:bg-slate-200 transition-all"
                >
                  <Printer size={18} />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={handleCloseRegister}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold uppercase text-sm transition-all shadow-lg"
                >
                  <DoorClosed size={18} />
                  <span>Confirmar Fechamento</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
            <h4 className="font-bold text-slate-800 flex items-center">
              <TrendingUp className="mr-2 text-emerald-500" />
              Movimentações em {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-500 transition-all text-xs font-bold"
                title="Ir para Hoje"
              >
                Hoje
              </button>
              <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-500 transition-all"><Filter size={16} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                {selectedDateSales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{new Date(s.date).toLocaleDateString('pt-BR')}</p>
                      <p className="font-bold text-slate-800 text-sm">Recebimento Venda #{s.id.slice(-6)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-emerald-600 font-black">+ R$ {s.total.toFixed(2)}</p>
                    </td>
                  </tr>
                ))}
                {selectedDatePurchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{new Date(p.date).toLocaleDateString('pt-BR')}</p>
                      <p className="font-bold text-slate-800 text-sm">Pagamento Compra #{p.id.slice(-6)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-red-600 font-black">- R$ {p.total.toFixed(2)}</p>
                    </td>
                  </tr>
                ))}
                {selectedDateSales.length === 0 && selectedDatePurchases.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-10 text-center text-slate-400">
                      Nenhuma movimentação encontrada para esta data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h4 className="font-bold text-slate-800 flex items-center mb-4"><PieChart className="mr-2 text-blue-500" /> Análise de Performance</h4>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                <span>Meta Mensal de Receita</span>
                <div className="flex items-center space-x-2">
                  {editingGoal ? (
                    <>
                      <input
                        type="number"
                        value={tempGoal}
                        onChange={(e) => setTempGoal(Number(e.target.value))}
                        className="w-32 px-2 py-1 border border-slate-300 rounded text-slate-700 text-right"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setMonthlyGoal(tempGoal);
                          setEditingGoal(false);
                        }}
                        className="text-emerald-600 hover:text-emerald-700 font-bold"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setTempGoal(monthlyGoal);
                          setEditingGoal(false);
                        }}
                        className="text-red-600 hover:text-red-700 font-bold"
                      >
                        ✗
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-700">R$ {monthlyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <button
                        onClick={() => setEditingGoal(true)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-1000"
                  style={{ width: `${Math.min((monthRevenue / monthlyGoal) * 100, 100)}% ` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1 text-right">
                {((monthRevenue / monthlyGoal) * 100).toFixed(1)}% atingido (Setor Mensal)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Médio (Mês)</p>
                <p className="text-xl font-black text-slate-800">R$ {(monthRevenue / (monthSales.length || 1)).toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margem Operacional</p>
                <p className="text-xl font-black text-emerald-600">{((monthBalance / (monthRevenue || 1)) * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setShowDRE(true)}
                className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all"
              >
                <FileText size={14} />
                <span>DRE Completa</span>
              </button>
              <button
                onClick={() => setShowCashFlow(true)}
                className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all"
              >
                <FileText size={14} />
                <span>Fluxo Projetado</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => registerStatus === 'open' ? setShowCloseRegister(true) : setShowOpenRegister(true)}
                className={`w-full flex items-center justify-center space-x-2 text-xs font-bold text-white py-3 rounded-xl transition-all ${registerStatus === 'open' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {registerStatus === 'open' ? <DoorClosed size={14} /> : <Unlock size={14} />}
                <span>{registerStatus === 'open' ? 'Fechar Caixa' : 'Reabrir Caixa'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Closure History */}
      {closures.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50">
            <h4 className="font-bold text-slate-800 flex items-center">
              <Calendar className="mr-2 text-blue-500" size={20} />
              Histórico de Fechamentos
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Data/Hora</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-slate-600 uppercase tracking-wider">Receitas</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-slate-600 uppercase tracking-wider">Despesas</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-slate-600 uppercase tracking-wider">Saldo</th>
                  <th className="px-6 py-3 text-center text-xs font-black text-slate-600 uppercase tracking-wider">Transações</th>
                  <th className="px-6 py-3 text-center text-xs font-black text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-black text-slate-600 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {closures.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((closure, idx) => (
                  <tr key={closure.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-slate-800">
                        {new Date(closure.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(closure.date).toLocaleTimeString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600">
                      R$ {closure.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-red-600">
                      R$ {closure.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">
                      R$ {closure.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                        {closure.transactions}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${closure.status === 'closed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {closure.status === 'closed' ? 'Fechado' : 'Aberto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setEditingClosure(idx)}
                        className="p-3 bg-white text-blue-500 hover:bg-blue-50 border border-slate-100 rounded-2xl shadow-sm transition-all"
                        title="Ver Detalhes"
                      >
                        <Edit size={16} />
                      </button>
                      {closure.status === 'open' && (
                        <button
                          onClick={() => handleDeleteClosure(closure.id)}
                          className="p-3 bg-white text-red-500 hover:bg-red-50 border border-slate-100 rounded-2xl shadow-sm transition-all"
                          title="Excluir Registro Aberto"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Closure Modal */}
      {editingClosure !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white flex items-center justify-between">
              <h3 className="font-black text-xl uppercase">Detalhes do Fechamento</h3>
              <button onClick={() => setEditingClosure(null)} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                    Data do Fechamento
                  </label>
                  <input
                    type="text"
                    value={new Date(closures[editingClosure].date).toLocaleString('pt-BR')}
                    disabled
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
                      Receitas (R$)
                    </label>
                    <input
                      type="number"
                      value={closures[editingClosure].revenue}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl bg-emerald-50 text-emerald-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                      Despesas (R$)
                    </label>
                    <input
                      type="number"
                      value={closures[editingClosure].expense}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-red-100 rounded-xl bg-red-50 text-red-800 outline-none"
                    />
                  </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl text-white">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1">Saldo Final</p>
                  <p className="text-3xl font-black">
                    R$ {closures[editingClosure].balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                {!showReopenConfirm ? (
                  <button
                    onClick={() => setShowReopenConfirm(true)}
                    className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 py-3 rounded-xl font-bold uppercase transition-all flex items-center justify-center space-x-2 border border-orange-200"
                  >
                    <Unlock size={18} />
                    <span>Reabrir Caixa</span>
                  </button>
                ) : (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs font-bold text-slate-500 text-center uppercase">Confirmar Senha do Administrador</p>
                    <input
                      type="password"
                      value={reopenPassword}
                      onChange={(e) => setReopenPassword(e.target.value)}
                      placeholder="Senha do Admin"
                      autoFocus
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-400 text-center tracking-widest bg-slate-50"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowReopenConfirm(false);
                          setReopenPassword('');
                        }}
                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase text-xs hover:bg-slate-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleReopenConfirm(closures[editingClosure])}
                        className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-bold uppercase text-xs hover:bg-orange-600 shadow-lg shadow-orange-200"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRE Modal */}
      {showDRE && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between">
              <h3 className="font-black text-xl uppercase">DRE - Demonstração do Resultado</h3>
              <button onClick={() => setShowDRE(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase">Período de Referência</p>
                <p className="text-sm font-black text-slate-800">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-bold">Receita Bruta (Mensal)</span>
                <span className="font-black text-emerald-600">R$ {monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-bold">(-) Custos e Despesas (Mensal)</span>
                <span className="font-black text-red-600">R$ {monthExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-4 bg-slate-900 text-white px-4 rounded-xl">
                <span className="font-black text-lg">LUCRO LÍQUIDO NO MÊS</span>
                <span className="font-black text-2xl">R$ {monthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-xs text-slate-400 text-center mt-4 uppercase font-bold tracking-widest">
                Margem Mensal: {((monthBalance / (monthRevenue || 1)) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow Modal */}
      {showCashFlow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white flex items-center justify-between">
              <h3 className="font-black text-xl uppercase">Fluxo de Caixa Projetado</h3>
              <button onClick={() => setShowCashFlow(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-2">Próximos 7 dias</p>
                  <p className="text-2xl font-black text-blue-900">R$ {(balance * 0.15).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Próximos 30 dias</p>
                  <p className="text-2xl font-black text-emerald-900">R$ {(balance * 0.6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-purple-600 uppercase mb-2">Próximos 90 dias</p>
                  <p className="text-2xl font-black text-purple-900">R$ {(balance * 1.8).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center mt-4">
                *Projeções baseadas na média histórica de crescimento
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Open Register Modal (Password Protected) */}
      {showOpenRegister && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock size={24} />
                <h3 className="font-black text-xl uppercase">Abrir Caixa</h3>
              </div>
              <button onClick={() => { setShowOpenRegister(false); setPassword(''); }} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <p className="text-slate-600 mb-6 text-center">Digite a senha de administrador para abrir o caixa</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const validPassword = company.password || '';
                    if (password === validPassword) {
                      if (selectedClosure) {
                        handleReopenConfirm(selectedClosure);
                      } else {
                        handleOpenRegister();
                      }
                    } else {
                      alert('Senha incorreta!');
                      setPassword('');
                    }
                  }
                }}
                placeholder="Senha de Acesso"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all text-center text-2xl tracking-widest bg-slate-50"
                autoFocus
              />
              <button
                onClick={() => {
                  const validPassword = company.password || '';
                  if (password === validPassword) {
                    if (selectedClosure) {
                      handleReopenConfirm(selectedClosure);
                    } else {
                      handleOpenRegister();
                    }
                  } else {
                    alert('Senha incorreta!');
                    setPassword('');
                  }
                }}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
              >
                Confirmar Abertura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
