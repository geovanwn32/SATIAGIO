
import React, { useState } from 'react';
import { Camera, Smartphone, Monitor, Download, Layout as LayoutIcon, Eye, Trash2, CheckCircle, FileText, BarChart, DollarSign, Package } from 'lucide-react';
import html2canvas from 'html2canvas';

interface PortfolioProps {
    company: any;
    user: any;
}

export const Portfolio: React.FC<PortfolioProps> = ({ company, user }) => {
    const [activeTab, setActiveTab] = useState<'screenshots' | 'mockups'>('screenshots');
    const [isCapturing, setIsCapturing] = useState(false);

    const captureFullBleed = async () => {
        setIsCapturing(true);
        // Give time for the UI to settle
        await new Promise(resolve => setTimeout(resolve, 500));

        const element = document.getElementById('main-content-area');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Retína quality
                useCORS: true,
                backgroundColor: '#f8fafc',
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `sati-agio-screenshot-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Error capturing screenshot:', err);
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                    <Camera size={200} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl font-black tracking-tight mb-4">Central de Marketing & Portfolio</h1>
                    <p className="text-indigo-100 text-lg font-medium opacity-80 leading-relaxed">
                        Gere materiais de divulgação de alta qualidade diretamente do seu sistema.
                        Capture telas, crie mockups e anuncie o seu SATI AGIO com profissionalismo.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center">
                            <Camera className="mr-2 text-indigo-500" size={20} /> Ferramentas de Captura
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={captureFullBleed}
                                disabled={isCapturing}
                                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-2xl transition-all group"
                            >
                                <div className="flex items-center">
                                    <Monitor className="text-slate-400 group-hover:text-indigo-600 mr-3" size={18} />
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">Tela Inteira (PNG)</span>
                                </div>
                                <Download size={16} className="text-slate-300 group-hover:text-indigo-400" />
                            </button>

                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2 pt-2">Dica Profissional</p>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                    Para melhores resultados, navegue até a página que deseja capturar, verifique se os dados estão corretos e use o botão acima.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Estatísticas do App</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter mb-1">Status</p>
                                <p className="text-sm font-black text-emerald-700">Ready to Sell</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                                <p className="text-[10px] font-black uppercase text-blue-600 tracking-tighter mb-1">Platform</p>
                                <p className="text-sm font-black text-blue-700">Web & Mobile</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <button
                            onClick={() => setActiveTab('screenshots')}
                            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'screenshots' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'}`}
                        >
                            Exemplos de Portfolio
                        </button>
                    </div>

                    {activeTab === 'screenshots' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Card 1: Dashboard */}
                            <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-2xl transition-all duration-500">
                                <div className="h-48 bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 flex items-center justify-center relative">
                                    <BarChart className="text-white/20 absolute -bottom-4 -right-4" size={120} />
                                    <LayoutIcon className="text-white" size={48} />
                                </div>
                                <div className="p-6">
                                    <h4 className="text-lg font-black text-slate-800 mb-1">Painel Administrativo</h4>
                                    <p className="text-sm text-slate-500 font-medium mb-4">Visão geral financeira e operacional em tempo real.</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase">Gradients</span>
                                        <span className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase">Charts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: POS */}
                            <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-2xl transition-all duration-500">
                                <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex items-center justify-center relative">
                                    <Package className="text-white/20 absolute -bottom-4 -right-4" size={120} />
                                    <DollarSign className="text-emerald-400" size={48} />
                                </div>
                                <div className="p-6">
                                    <h4 className="text-lg font-black text-slate-800 mb-1">PDV Profissional</h4>
                                    <p className="text-sm text-slate-500 font-medium mb-4">Ponto de venda ágil com catálogo de produtos e serviços.</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase">Dark Theme</span>
                                        <span className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase">Inventory Grid</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: OS */}
                            <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-2xl transition-all duration-500">
                                <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 p-6 flex items-center justify-center relative">
                                    <FileText className="text-white/20 absolute -bottom-4 -right-4" size={120} />
                                    <CheckCircle className="text-white" size={48} />
                                </div>
                                <div className="p-6">
                                    <h4 className="text-lg font-black text-slate-800 mb-1">Ordens de Serviço</h4>
                                    <p className="text-sm text-slate-500 font-medium mb-4">Controle total de manutenções e reparos técnicos.</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase">Technical OS</span>
                                        <span className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase">Printable PDF</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Finance */}
                            <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-2xl transition-all duration-500">
                                <div className="h-48 bg-gradient-to-br from-amber-400 to-orange-600 p-6 flex items-center justify-center relative">
                                    <DollarSign className="text-white/20 absolute -bottom-4 -right-4" size={120} />
                                    <BarChart className="text-white" size={48} />
                                </div>
                                <div className="p-6">
                                    <h4 className="text-lg font-black text-slate-800 mb-1">Gestão Financeira</h4>
                                    <p className="text-sm text-slate-500 font-medium mb-4">Controle de caixa, fluxo de caixa e relatórios mensais.</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase">Cash Control</span>
                                        <span className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase">Analytics</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isCapturing && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 animate-in zoom-in-95">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-lg font-black text-slate-800 uppercase tracking-widest">Processando Captura...</p>
                        <p className="text-sm text-slate-400">Gerando imagem de alta resolução.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
