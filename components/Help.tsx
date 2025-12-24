
import React, { useState } from 'react';
import { 
  HelpCircle, PlayCircle, BookOpen, MessageCircle, FileQuestion, 
  Search, ExternalLink, Mail, Phone, ChevronDown, ChevronUp, 
  Sparkles, FileText, Zap, ShieldCheck, LifeBuoy, X
} from 'lucide-react';

export const Help: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);

  const categories = [
    { title: 'Primeiros Passos', icon: <PlayCircle className="text-blue-500" />, items: [{ label: 'Cadastro de Produtos', id: 'tut1' }, { label: 'Configuração Empresa', id: 'tut2' }] },
    { title: 'Gestão Financeira', icon: <BookOpen className="text-emerald-500" />, items: [{ label: 'Fluxo de Caixa', id: 'tut3' }, { label: 'Relatórios PDF', id: 'tut4' }] },
    { title: 'Suporte Técnico', icon: <FileQuestion className="text-amber-500" />, items: [{ label: 'Impressora Térmica', id: 'tut5' }, { label: 'Recuperação de Senha', id: 'tut6' }] },
  ];

  const faqs = [
    { q: "O sistema funciona sem internet?", a: "Sim, os dados ficam em cache local e sincronizam quando a rede retorna." },
    { q: "Como funciona a comissão?", a: "Definida no cadastro do técnico, calculada sobre serviços faturados." },
    { q: "Posso exportar p/ Excel?", a: "Sim, via relatórios ou aba de configurações avançadas." }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    alert(`Buscando por: "${searchQuery}" em nossa base de conhecimento...`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      {activeTutorial && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
           <div className="bg-white rounded-[3rem] p-12 max-w-2xl w-full relative">
              <button onClick={() => setActiveTutorial(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24}/></button>
              <h3 className="text-2xl font-black text-slate-900 mb-6">Guia: {activeTutorial}</h3>
              <div className="space-y-4 text-slate-600">
                 <p className="font-medium">1. Acesse o módulo correspondente no menu lateral.</p>
                 <p className="font-medium">2. Clique no botão de "Novo Registro" no canto superior direito.</p>
                 <p className="font-medium">3. Preencha todos os campos obrigatórios marcados com asterisco (*).</p>
                 <p className="font-medium">4. Salve e verifique se o registro aparece na listagem principal.</p>
              </div>
              <button onClick={() => setActiveTutorial(null)} className="mt-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Entendi, vamos lá!</button>
           </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="relative z-10 md:max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-600/30 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"><Zap size={12}/><span>Suporte Inteligente Ativo</span></div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tighter">Central de Inteligência Àgio</h2>
          <form onSubmit={handleSearch} className="mt-10 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              type="text" 
              placeholder="Ex: Como gerar nota fiscal?" 
              className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:bg-white focus:text-slate-900 outline-none transition-all placeholder:text-slate-600 text-lg"
            />
          </form>
        </div>
        <div className="hidden lg:block relative mr-8 opacity-40"><LifeBuoy size={120} className="animate-spin-slow" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">{cat.icon}</div>
              <h3 className="font-black text-slate-900 text-xl mb-4">{cat.title}</h3>
              <ul className="space-y-4">
                {cat.items.map((item, idx) => (
                  <li key={idx} onClick={() => setActiveTutorial(item.label)} className="flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 cursor-pointer group/item transition-all">
                    <div className="w-2 h-2 bg-slate-200 rounded-full mr-3 group-hover/item:bg-blue-500"></div>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white md:col-span-2 flex items-center justify-between shadow-xl shadow-emerald-100">
            <div>
              <div className="flex items-center space-x-2 mb-4"><Sparkles size={20} className="text-emerald-200" /><span className="text-[10px] font-black uppercase tracking-widest">Lançamento</span></div>
              <h4 className="text-2xl font-black mb-2">Relatórios Customizados v2.5</h4>
              <p className="text-emerald-100 text-sm max-w-sm mb-6">Acesse as novas métricas na aba de Relatórios agora mesmo.</p>
              <button className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold text-xs uppercase">Ver Novidades</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h4 className="font-black text-slate-900 text-lg mb-6 flex items-center"><FileText className="mr-2 text-blue-600" size={20}/> FAQ</h4>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-slate-50 last:border-0 pb-4">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between text-left">
                    <span className={`text-sm font-bold ${openFaq === i ? 'text-blue-600' : 'text-slate-700'}`}>{faq.q}</span>
                    {openFaq === i ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                  </button>
                  {openFaq === i && <p className="mt-3 text-xs text-slate-500 leading-relaxed">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem] space-y-4">
            <h4 className="text-lg font-black text-slate-900">Suporte Realtime</h4>
            <a href="https://wa.me/5562998554529" target="_blank" rel="noreferrer" className="flex items-center space-x-3 w-full p-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-lg">
              <Phone size={14} /><span>Suporte via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
