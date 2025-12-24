
import React from 'react';
import { Company, Client, QuoteItem, Product, Service, Combo, Offer } from '../types';
import { MapPin, Phone, Mail, Globe, Receipt, Clock } from 'lucide-react';

interface ReceiptLayoutProps {
    company: Company;
    client: Client | undefined;
    items: QuoteItem[];
    paymentMethod: string;
    date: string;
    total: number;
    saleId: string;
    products: Product[];
    services: Service[];
    discount?: number;
    creditUsed?: number;
    type?: 'sale' | 'quote' | 'purchase';
    supplierName?: string;
    combos?: Combo[];
    offers?: Offer[];
    className?: string;
}

export const ReceiptLayout: React.FC<ReceiptLayoutProps> = ({
    company,
    client,
    items,
    paymentMethod,
    date,
    total,
    saleId,
    products,
    services,
    discount,
    creditUsed,
    type = 'sale',
    supplierName,
    combos = [],
    offers = [],
    className = 'printable-content'
}) => {
    const getTitle = () => {
        if (type === 'quote') return 'ORÇAMENTO';
        if (type === 'purchase') return 'PEDIDO DE COMPRA';
        return 'RECIBO DE VENDA';
    };

    const getPrimaryColor = () => {
        if (type === 'quote') return 'text-blue-600 border-blue-600';
        if (type === 'purchase') return 'text-purple-600 border-purple-600';
        return 'text-emerald-600 border-emerald-600';
    };

    return (
        <div className={`${className} bg-white p-12 max-w-4xl mx-auto shadow-none font-sans text-slate-900 print:p-0`}>
            {/* Header: Minimalist & Clean */}
            <div className="flex justify-between items-start mb-12 pb-10 border-b border-slate-200">
                <div className="flex gap-8">
                    {company.logo ? (
                        <img src={company.logo} alt="Logo" className="h-20 w-auto object-contain grayscale brightness-50 contrast-125" />
                    ) : (
                        <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                            <Receipt size={32} />
                        </div>
                    )}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{company.tradeName || company.name}</h1>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest space-y-0.5">
                            <p className="flex items-center">{company.address}</p>
                            <p>CNPJ: {company.cnpj} {company.stateRegistration && `• IE: ${company.stateRegistration}`}</p>
                            <p>{company.phone} {company.email && `• ${company.email}`}</p>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className={`text-xs font-black tracking-[0.3em] uppercase mb-4 px-4 py-1.5 border-l-4 ${getPrimaryColor().split(' ')[1].replace('border-', 'border-')}`}>
                        {getTitle()}
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Protocolo Identificador</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">#{saleId}</p>
                    </div>
                    <div className="mt-2">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Data de Emissão</p>
                        <p className="text-xs font-bold text-slate-600">{new Date(date).toLocaleDateString('pt-BR')} às {new Date(date).toLocaleTimeString('pt-BR')}</p>
                    </div>
                </div>
            </div>

            {/* Entities: More Whitespace, No heavy blocks */}
            <div className="grid grid-cols-2 gap-16 mb-12 px-2">
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                        {type === 'purchase' ? 'Dados do Fornecedor' : 'Informações do Cliente'}
                    </h3>
                    <div className="space-y-1">
                        <p className="text-lg font-black text-slate-900 tracking-tight leading-tight">{type === 'purchase' ? supplierName : (client?.name || 'Venda Balcão / Consumidor')}</p>
                        {(client?.cpfCnpj) && <p className="text-[11px] text-slate-500 font-bold">Documento: {client.cpfCnpj}</p>}
                        {client?.address && (
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-2 italic">
                                {client.address.street}, {client.address.number} • {client.address.neighborhood}<br />
                                {client.address.city}/{client.address.state}
                            </p>
                        )}
                        {client?.phone && <p className="text-[10px] text-slate-600 font-bold mt-2">Fone: {client.phone}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Resumo Técnico</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-l border-slate-100 pl-6">
                        <div>
                            <p className="text-[9px] font-bold text-slate-300 uppercase">Pagamento</p>
                            <p className="text-sm font-black text-slate-700">{paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-300 uppercase">Volume</p>
                            <p className="text-sm font-black text-slate-700">{items.length} Item(s)</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[9px] font-bold text-slate-300 uppercase">Situação</p>
                            <p className="text-sm font-black text-emerald-600 uppercase">Concluído / Válido</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items: Clean Line Border Table */}
            <div className="mb-12 border-y border-slate-900 px-1">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-900 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                            <th className="py-4">Descrição do Serviço / Produto</th>
                            <th className="py-4 text-center">Qtde</th>
                            <th className="py-4 text-right">Unitário</th>
                            <th className="py-4 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item, idx) => {
                            let label = 'Item';
                            if (item.type === 'product') label = products.find(p => p.id === item.productId)?.name || 'Produto';
                            else if (item.type === 'service') label = services.find(s => s.id === item.serviceId)?.name || 'Serviço';
                            else if (item.type === 'combo') label = combos.find(c => c.id === item.comboId)?.name || 'Combo';
                            else if (item.type === 'offer') label = offers.find(o => (o.productId === item.productId || o.serviceId === item.serviceId))?.name || 'Oferta';

                            return (
                                <tr key={idx}>
                                    <td className="py-4">
                                        <p className="font-bold text-slate-800 text-sm tracking-tight">{label}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{item.type === 'service' ? 'Mão de obra especializada' : 'Componente / Hardware'}</p>
                                    </td>
                                    <td className="py-4 text-center text-sm font-bold text-slate-500">{item.quantity}</td>
                                    <td className="py-4 text-right text-sm font-medium text-slate-500">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="py-4 text-right text-sm font-black text-slate-900">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Totals Section: High Contrast Minimal */}
            <div className="flex justify-between items-start gap-12 mb-16">
                <div className="flex-1 text-[9px] text-slate-400 font-bold border-l-2 border-slate-100 pl-4 space-y-1">
                    <p className="uppercase text-slate-500 font-black mb-2 tracking-widest">Informações Legais & Garantia</p>
                    <p>• Validade deste documento: 10 dias.</p>
                    <p>• Garantia legal vinculada ao Código de Defesa do Consumidor.</p>
                    <p>• Este documento é um comprovante interno de prestação de serviços/vendas.</p>
                </div>

                <div className="w-64 space-y-3">
                    <div className="space-y-1.5 px-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Subtotal Bruto</span>
                            <span className="text-slate-600">R$ {items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {discount && discount > 0 && (
                            <div className="flex justify-between items-center text-[10px] font-black text-red-500 uppercase tracking-widest">
                                <span>(-) Desconto</span>
                                <span>R$ {discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        {creditUsed && creditUsed > 0 && (
                            <div className="flex justify-between items-center text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                <span>(-) Créditos</span>
                                <span>R$ {creditUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                    </div>
                    <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-end">
                        <span className="text-xs font-black uppercase tracking-[0.2em] mb-1">Total Geral</span>
                        <span className="text-3xl font-black tracking-tight">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Signature Area: Clean lines */}
            <div className="grid grid-cols-2 gap-20 py-8 border-t border-slate-200 mt-20">
                <div className="text-center">
                    <div className="border-t border-slate-300 w-full mb-2"></div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{company.name}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">Reponsável / Emissor</p>
                </div>
                <div className="text-center">
                    <div className="border-t border-slate-300 w-full mb-2"></div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{client?.name || 'Cliente Responsável'}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">Declaro ciência e aceite</p>
                </div>
            </div>

            <div className="text-center pt-8 border-t border-slate-50 opacity-40">
                <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.5em]">CONTROLE INTERNO SATI AGIO</p>
            </div>
        </div>
    );
};
