import React from 'react';
import { X, Zap, Percent, UserPlus, Tag, CreditCard } from 'lucide-react';

interface QuickActionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyDiscount?: (percentage: number) => void;
    onAddFrequentClient?: () => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
    isOpen,
    onClose,
    onApplyDiscount,
    onAddFrequentClient
}) => {
    if (!isOpen) return null;

    const quickActions = [
        {
            icon: <Percent size={24} />,
            label: 'Desconto 5%',
            color: 'from-blue-500 to-blue-600',
            action: () => onApplyDiscount?.(5),
        },
        {
            icon: <Percent size={24} />,
            label: 'Desconto 10%',
            color: 'from-purple-500 to-purple-600',
            action: () => onApplyDiscount?.(10),
        },
        {
            icon: <Percent size={24} />,
            label: 'Desconto 15%',
            color: 'from-pink-500 to-pink-600',
            action: () => onApplyDiscount?.(15),
        },
        {
            icon: <UserPlus size={24} />,
            label: 'Cliente Frequente',
            color: 'from-emerald-500 to-emerald-600',
            action: () => onAddFrequentClient?.(),
        },
        {
            icon: <Tag size={24} />,
            label: 'Aplicar Cupom',
            color: 'from-orange-500 to-orange-600',
            action: () => console.log('Aplicar cupom'),
        },
        {
            icon: <CreditCard size={24} />,
            label: 'Parcelar Compra',
            color: 'from-indigo-500 to-indigo-600',
            action: () => console.log('Parcelar'),
        },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-[500px] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Zap size={20} />
                            </div>
                            <span className="font-black text-lg uppercase tracking-wider">Ações Rápidas</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Aplique descontos e ações com um clique</p>
                </div>

                {/* Actions Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    action.action();
                                    onClose();
                                }}
                                className={`bg-gradient-to-br ${action.color} hover:shadow-xl text-white p-6 rounded-2xl transition-all active:scale-95 group relative overflow-hidden`}
                            >
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative flex flex-col items-center justify-center space-y-3">
                                    <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                                        {action.icon}
                                    </div>
                                    <span className="font-black text-sm uppercase text-center leading-tight">
                                        {action.label}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Keyboard Shortcuts Info */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                        <p className="text-xs font-bold text-slate-600 uppercase mb-2">💡 Dica</p>
                        <p className="text-xs text-slate-500">
                            Use <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">F1</kbd> a <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">F6</kbd> para atalhos rápidos
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
