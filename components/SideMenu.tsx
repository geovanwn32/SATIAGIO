import React from 'react';
import { X, LogOut, Clock, Settings, Keyboard, BarChart3, DollarSign } from 'lucide-react';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout?: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onLogout }) => {
    if (!isOpen) return null;

    const menuItems = [
        {
            icon: <Clock size={20} />,
            label: 'Histórico do Dia',
            description: 'Ver vendas realizadas hoje',
            action: () => console.log('Ver histórico'),
        },
        {
            icon: <DollarSign size={20} />,
            label: 'Fechar Caixa',
            description: 'Encerrar o caixa do dia',
            action: () => console.log('Fechar caixa'),
        },
        {
            icon: <BarChart3 size={20} />,
            label: 'Relatórios',
            description: 'Visualizar relatórios de vendas',
            action: () => console.log('Relatórios'),
        },
        {
            icon: <Keyboard size={20} />,
            label: 'Atalhos de Teclado',
            description: 'Ver comandos rápidos',
            action: () => console.log('Atalhos'),
        },
        {
            icon: <Settings size={20} />,
            label: 'Configurações',
            description: 'Ajustes do PDV',
            action: () => console.log('Configurações'),
        },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Menu Sidebar */}
            <div className="fixed right-0 top-0 h-full w-[380px] bg-white shadow-2xl z-[100] animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-black text-xl uppercase tracking-wider">Menu PDV</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={22} />
                        </button>
                    </div>
                    <p className="text-xs text-slate-400">Acesso rápido às funcionalidades</p>
                </div>

                {/* Menu Items */}
                <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-220px)]">
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                item.action();
                                onClose();
                            }}
                            className="w-full bg-slate-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-500 rounded-xl p-4 text-left transition-all group"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white group-hover:bg-blue-100 rounded-lg text-slate-600 group-hover:text-blue-600 transition-colors">
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800 group-hover:text-blue-700 mb-1">{item.label}</p>
                                    <p className="text-xs text-slate-500">{item.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-100 border-t border-slate-200">
                    <button
                        onClick={() => {
                            if (onLogout) onLogout();
                            onClose();
                        }}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black uppercase text-sm py-4 rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center space-x-2"
                    >
                        <LogOut size={20} />
                        <span>Sair do PDV</span>
                    </button>
                </div>
            </div>
        </>
    );
};
