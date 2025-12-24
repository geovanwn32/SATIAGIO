import React from 'react';
import { Receipt } from 'lucide-react';
import { Company } from '../types';

interface PDFReportTemplateProps {
    company: Company;
    title: string;
    period?: string;
    columns: string[];
    data: any[][];
    totalValue?: number;
    totalLabel?: string;
}

export const PDFReportTemplate: React.FC<PDFReportTemplateProps> = ({
    company,
    title,
    period,
    columns,
    data,
    totalValue,
    totalLabel
}) => {
    return (
        <div id="report-template" className="bg-white p-16 w-[210mm] min-h-[297mm] mx-auto shadow-none font-sans text-slate-900 border border-slate-50">
            {/* Minimalist Corporate Header */}
            <div className="flex justify-between items-start mb-16 pb-12 border-b border-slate-200">
                <div className="flex gap-10">
                    {company.logo ? (
                        <img src={company.logo} alt="Logo" className="h-20 w-auto object-contain grayscale brightness-50" />
                    ) : (
                        <div className="h-16 w-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300">
                            <Receipt size={32} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{company.tradeName || company.name}</h1>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest space-y-1">
                            <p className="flex items-center">{company.address}</p>
                            <p>CNPJ: {company.cnpj} {company.stateRegistration && `• IE: ${company.stateRegistration}`}</p>
                            <div className="flex items-center space-x-6 pt-1">
                                {company.phone && <span>Fone: {company.phone}</span>}
                                {company.email && <span>Email: {company.email}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-right space-y-4">
                    <div className="inline-block px-5 py-2 border-l-4 border-slate-900 font-black text-slate-900 text-xs tracking-widest uppercase">
                        Visão Estratégica
                    </div>
                    <div className="pt-4 space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Identificação</p>
                        <p className="text-lg font-black text-slate-900 tracking-tight leading-none">#REP-{Date.now().toString().slice(-6)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Processamento</p>
                        <p className="text-[11px] font-bold text-slate-600 leading-none">{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                    </div>
                </div>
            </div>

            {/* Title & Period: Elegant & Spaced */}
            <div className="mb-12">
                <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-4">{title}</h2>
                {period && (
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                        <span className="w-8 h-px bg-slate-200 mr-4"></span>
                        {period}
                    </div>
                )}
            </div>

            {/* Table: Minimalist Line-based design */}
            <div className="mb-16">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-900 text-[10px] font-black uppercase tracking-widest border-y border-slate-900">
                            {columns.map((col, i) => (
                                <th key={i} className={`px-2 py-5 ${i === columns.length - 1 ? 'text-right' : 'text-left'}`}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, rI) => (
                            <tr key={rI} className="group transition-colors">
                                {row.map((cell, cI) => (
                                    <td key={cI} className={`px-2 py-5 text-sm ${cI === row.length - 1 ? 'text-right font-black text-slate-900' : 'text-left font-bold text-slate-600'}`}>
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-2 py-24 text-center text-slate-300 font-medium uppercase text-xs tracking-widest italic">
                                    Base de dados vazia para o critério selecionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Totals Section: Clean and Integrated */}
            {totalValue !== undefined && (
                <div className="flex justify-end gap-12 mb-16">
                    <div className="w-96 text-right space-y-2 border-t-2 border-slate-900 pt-6">
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest leading-none">{totalLabel || 'Consolidado'}</p>
                        <p className="text-4xl font-black tracking-tighter italic text-slate-900">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            )}

            {/* Footer: Institutional */}
            <div className="mt-auto pt-16 border-t border-slate-100 grid grid-cols-2 gap-20">
                <div className="space-y-4">
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
                        Este documento contém inteligência de negócio sensível e deve ser tratado com a devida confidencialidade corporativa.
                    </p>
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <Receipt size={12} className="text-slate-300" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">SATI AGIO Professional Intelligence</span>
                    </div>
                </div>
                <div className="text-right space-y-4">
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                        Processado por via eletrônica conforme diretrizes da LGPD (Lei 13.709/2018).
                    </p>
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter italic">
                        © {new Date().getFullYear()} SATI AGIO Business Control
                    </p>
                </div>
            </div>
        </div>
    );
};
