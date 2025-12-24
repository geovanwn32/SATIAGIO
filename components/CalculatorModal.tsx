import React, { useState } from 'react';
import { X, Delete, Calculator as CalcIcon } from 'lucide-react';

interface CalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTransferToDiscount?: (value: number) => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose, onTransferToDiscount }) => {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);

    if (!isOpen) return null;

    const handleNumber = (num: string) => {
        if (display === '0') {
            setDisplay(num);
        } else {
            setDisplay(display + num);
        }
    };

    const handleDecimal = () => {
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const handleOperation = (op: string) => {
        const currentValue = parseFloat(display);

        if (previousValue !== null && operation) {
            calculate();
        } else {
            setPreviousValue(currentValue);
        }

        setOperation(op);
        setDisplay('0');
    };

    const calculate = () => {
        if (previousValue === null || operation === null) return;

        const current = parseFloat(display);
        let result = 0;

        switch (operation) {
            case '+':
                result = previousValue + current;
                break;
            case '-':
                result = previousValue - current;
                break;
            case '×':
                result = previousValue * current;
                break;
            case '÷':
                result = current !== 0 ? previousValue / current : 0;
                break;
        }

        const historyEntry = `${previousValue} ${operation} ${current} = ${result.toFixed(2)}`;
        setHistory([historyEntry, ...history.slice(0, 4)]);

        setDisplay(result.toString());
        setPreviousValue(null);
        setOperation(null);
    };

    const clear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
    };

    const backspace = () => {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1));
        } else {
            setDisplay('0');
        }
    };

    const handleTransfer = () => {
        const value = parseFloat(display);
        if (!isNaN(value) && onTransferToDiscount) {
            onTransferToDiscount(value);
            onClose();
        }
    };

    const buttons = [
        ['7', '8', '9', '÷'],
        ['4', '5', '6', '×'],
        ['1', '2', '3', '-'],
        ['0', '.', '=', '+']
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-[400px] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <CalcIcon size={20} />
                            </div>
                            <span className="font-black text-lg uppercase tracking-wider">Calculadora</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Display */}
                    <div className="bg-slate-950/50 rounded-xl p-4 font-mono text-right border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1 h-4">
                            {previousValue !== null && operation && `${previousValue} ${operation}`}
                        </div>
                        <div className="text-3xl font-bold break-all">{display}</div>
                    </div>
                </div>

                {/* History */}
                {history.length > 0 && (
                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Histórico</p>
                        <div className="space-y-1">
                            {history.map((entry, idx) => (
                                <p key={idx} className="text-xs font-mono text-slate-600">{entry}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="p-6">
                    <div className="grid grid-cols-4 gap-3 mb-3">
                        <button
                            onClick={clear}
                            className="col-span-2 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-sm py-4 rounded-xl transition-all active:scale-95 shadow-lg"
                        >
                            Clear
                        </button>
                        <button
                            onClick={backspace}
                            className="col-span-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                        >
                            <Delete size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        {buttons.map((row, rowIdx) => (
                            <React.Fragment key={rowIdx}>
                                {row.map((btn) => {
                                    const isOperation = ['÷', '×', '-', '+', '='].includes(btn);
                                    const isEquals = btn === '=';

                                    return (
                                        <button
                                            key={btn}
                                            onClick={() => {
                                                if (btn === '=') calculate();
                                                else if (isOperation) handleOperation(btn);
                                                else if (btn === '.') handleDecimal();
                                                else handleNumber(btn);
                                            }}
                                            className={`py-5 rounded-xl font-black text-lg transition-all active:scale-95 shadow-md ${isEquals
                                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                                                    : isOperation
                                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                                }`}
                                        >
                                            {btn}
                                        </button>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Transfer to Discount Button */}
                    {onTransferToDiscount && (
                        <button
                            onClick={handleTransfer}
                            className="w-full mt-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-black uppercase text-sm py-4 rounded-xl transition-all active:scale-95 shadow-lg"
                        >
                            Usar como Desconto
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
