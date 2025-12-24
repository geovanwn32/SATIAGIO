
import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, AlertTriangle, FileDown, X, Save, Tag, Box, AlertCircle, Package, DollarSign, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Product } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { StatCard } from './StatCard';

interface InventoryProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCharts, setShowCharts] = useState(true);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', code: '', brand: '', model: '', category: 'Peças', unit: 'un', costPrice: 0, salePrice: 0, stock: 0, minStock: 5
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Statistics & Charts Data ---
  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStock = products.filter(p => p.stock <= p.minStock).length;
    const totalValueCost = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
    const totalValueSale = products.reduce((acc, p) => acc + (p.stock * p.salePrice), 0);

    return { totalItems, totalStock, lowStock, totalValueCost, totalValueSale };
  }, [products]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  }, [products]);

  const valueData = useMemo(() => {
    // Top 5 products by total value
    return [...products]
      .map(p => ({ name: p.name.substring(0, 15), value: p.stock * p.costPrice }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [products]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];


  const handleOpenAdd = () => {
    setErrors({});
    setEditingProduct(null);
    setFormData({
      name: '', code: `P${Date.now().toString().slice(-4)}`, brand: '', model: '', category: 'Peças', unit: 'un', costPrice: 0, salePrice: 0, stock: 0, minStock: 5
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setErrors({});
    setEditingProduct(p);
    setFormData(p);
    setShowModal(true);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Descrição é obrigatória";
    if (!formData.code?.trim()) newErrors.code = "Código é obrigatório";
    if ((formData.salePrice || 0) <= 0) newErrors.salePrice = "Preço de venda inválido";
    if ((formData.costPrice || 0) < 0) newErrors.costPrice = "Custo não pode ser negativo";
    if ((formData.stock || 0) < 0) newErrors.stock = "Estoque inválido";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...formData } as Product);
    } else {
      onAddProduct({ ...formData, id: Date.now().toString() } as Product);
    }
    setShowModal(false);
  };

  const ErrorLabel = ({ field }: { field: string }) => errors[field] ? (
    <span className="text-[10px] text-red-500 font-bold flex items-center mt-1">
      <AlertCircle size={10} className="mr-1" /> {errors[field]}
    </span>
  ) : null;

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">

      {/* Dashboard / Analytics Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <StatCard
            title="Valor em Estoque (Custo)"
            value={`R$ ${stats.totalValueCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<DollarSign className="text-emerald-600" />}
            color="bg-emerald-50"
          />
          <StatCard
            title="Itens Cadastrados"
            value={stats.totalItems}
            icon={<Package className="text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Estoque Baixo"
            value={stats.lowStock}
            icon={<AlertTriangle className="text-amber-600" />}
            color="bg-amber-50"
          />
          <StatCard
            title="Potencial de Venda"
            value={`R$ ${stats.totalValueSale.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<BarChart3 className="text-purple-600" />}
            color="bg-purple-50"
          />

          {/* Charts Row */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-80">
            <h4 className="text-sm font-bold text-slate-700 mb-4">Distribuição por Categoria</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-80">
            <h4 className="text-sm font-bold text-slate-700 mb-4">Top 5 Produtos (Maior Valor em Estoque)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} interval={0} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1 relative">
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-12 py-8 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="font-black text-slate-800 text-2xl tracking-tight uppercase">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de Inventário</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm"><X size={24} /></button>
              </div>
              <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição Comercial *</label>
                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={`w-full p-4 bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold`} placeholder="Ex: Tela LCD Compatível iPhone 11" />
                    <ErrorLabel field="name" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Marca</label>
                    <input value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Ex: Apple" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Modelo / Referência</label>
                    <input value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Ex: A2111" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Código Interno *</label>
                    <input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className={`w-full p-4 bg-slate-50 border ${errors.code ? 'border-red-500' : 'border-slate-200'} rounded-2xl outline-none`} />
                    <ErrorLabel field="code" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none">
                      <option>Peças</option>
                      <option>Acessórios</option>
                      <option>Insumos</option>
                      <option>Equipamentos</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Custo Aquisição (R$)</label>
                    <input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })} className={`w-full p-4 bg-slate-50 border ${errors.costPrice ? 'border-red-500' : 'border-slate-200'} rounded-2xl outline-none`} />
                    <ErrorLabel field="costPrice" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preço de Venda (R$) *</label>
                    <input type="number" step="0.01" value={formData.salePrice} onChange={e => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })} className={`w-full p-4 bg-blue-50 border ${errors.salePrice ? 'border-red-500' : 'border-blue-100'} rounded-2xl outline-none font-bold text-blue-700`} />
                    <ErrorLabel field="salePrice" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estoque Inicial</label>
                    <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className={`w-full p-4 bg-slate-50 border ${errors.stock ? 'border-red-500' : 'border-slate-200'} rounded-2xl outline-none`} />
                    <ErrorLabel field="stock" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Alerta Mínimo</label>
                    <input type="number" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
                  </div>
                </div>
              </div>
              <div className="p-10 bg-slate-50 border-t border-gray-100 flex justify-end space-x-4">
                <button onClick={() => setShowModal(false)} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-200 rounded-2xl transition-all uppercase text-xs tracking-widest">Cancelar</button>
                <button onClick={handleSave} className="px-12 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center space-x-2">
                  <Save size={18} />
                  <span>{editingProduct ? 'Salvar' : 'Cadastrar'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-8 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 flex-1 relative max-w-2xl">
            <button onClick={() => setShowCharts(!showCharts)} className={`p-4 rounded-[2rem] transition-all shadow-sm ${showCharts ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white border border-slate-100 text-slate-400 hover:text-blue-500'}`}>
              <BarChart3 size={20} />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input type="text" placeholder="Filtrar produtos por código, marca..." className="pl-14 pr-6 py-4 w-full border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-slate-50/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <button onClick={handleOpenAdd} className="flex items-center space-x-3 px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
            <Plus size={20} />
            <span>Novo Produto</span>
          </button>
        </div>

        <div className="overflow-x-auto flex-1 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Status</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Código</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">Categ.</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-32">Custo</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-32">Venda</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32">Estoque</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-40">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-10 py-20 text-center text-slate-400 italic font-medium">
                    Nenhum produto encontrado no inventário.
                  </td>
                </tr>
              )}
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= product.minStock;
                const isOutOfStock = product.stock === 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-10 py-5">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wide">
                          Esgotado
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-wide">
                          Baixo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wide">
                          Ok
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">{product.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{product.brand || 'N/I'} • {product.model || 'N/I'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {product.code}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-center">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-right">
                      <span className="font-medium text-slate-400 text-xs">
                        R$ {product.costPrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-right">
                      <span className="font-black text-emerald-600 text-sm">
                        R$ {product.salePrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-center">
                      <div className={`font-black text-sm ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-slate-700'}`}>
                        {product.stock} <span className="text-[10px] text-slate-400 font-bold">{product.unit}</span>
                      </div>
                    </td>
                    <td className="px-10 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-3 bg-white text-blue-500 hover:bg-blue-50 border border-slate-100 rounded-2xl shadow-sm transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => confirm("Tem certeza que deseja excluir este produto?") && onDeleteProduct(product.id)}
                          className="p-3 bg-white text-red-400 hover:bg-red-50 border border-slate-100 rounded-2xl shadow-sm transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
