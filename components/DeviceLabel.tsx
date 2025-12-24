
import React from 'react';
import { Company, Client, Quote } from '../types';
import { Smartphone, User, Hash, AlertCircle } from 'lucide-react';

interface DeviceLabelProps {
    company: Company;
    quote: Quote;
    client: Client | undefined;
}

export const DeviceLabel: React.FC<DeviceLabelProps> = ({ company, quote, client }) => {
    return (
        <div className="device-label-container bg-white p-3 w-[80mm] h-[40mm] border-2 border-slate-900 rounded-lg flex flex-col justify-between font-sans text-slate-900 select-none mx-auto shadow-sm print:shadow-none print:border-2 print:m-0 box-border overflow-hidden">
            {/* Top Header */}
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-1 shrink-0">
                <div className="flex items-center space-x-1.5 overflow-hidden">
                    <Hash size={16} className="text-blue-600 stroke-[3] shrink-0" />
                    <span className="text-xl font-black tracking-tighter truncate">#{quote.id}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">{new Date(quote.createdAt).toLocaleDateString('pt-BR')}</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tight leading-tight">SATI AGIO Protocol</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 py-1 space-y-1 overflow-hidden">
                <div className="flex items-center space-x-2">
                    <User size={12} className="text-slate-400 shrink-0" />
                    <span className="text-[13px] font-black uppercase truncate leading-none">{client?.name || 'CONSUMIDOR N/I'}</span>
                </div>

                <div className="flex items-center space-x-2">
                    <Smartphone size={12} className="text-slate-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-black text-slate-800 leading-tight uppercase truncate">
                            {quote.technicalDetails?.brand} {quote.technicalDetails?.deviceModel}
                        </span>
                        {quote.technicalDetails?.serialNumber && (
                            <span className="text-[8px] font-mono font-bold text-slate-500 truncate">
                                SN: {quote.technicalDetails.serialNumber}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-start space-x-2">
                    <AlertCircle size={10} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-[8px] text-slate-500 font-bold leading-tight line-clamp-2 uppercase italic">
                        DEFEITO: {quote.technicalDetails?.reportedDefect || 'EM ANÁLISE TÉCNICA'}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-dashed border-slate-400 pt-1 flex justify-between items-end shrink-0">
                <div className="max-w-[50%] min-w-0">
                    <span className="text-[10px] font-black text-blue-600 block truncate uppercase leading-tight">{company.tradeName || company.name}</span>
                    <span className="text-[7px] font-bold text-slate-400 block uppercase leading-tight">Qualidade & Reparo em Tecnologia</span>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-2">
                    <div className="inline-block bg-slate-900 text-white px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest mb-0.5 whitespace-nowrap">ESTRITAMENTE PRIVADO</div>
                    <span className="text-[6px] font-bold text-slate-300">GENESIS CONTROL SYSTEM</span>
                </div>
            </div>
        </div>
    );
};
