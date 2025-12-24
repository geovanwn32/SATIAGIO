
import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  FileText,
  Building2,
  UserPlus,
  Settings,
  HelpCircle,
  Truck,
  Wallet,
  Sparkles,
  Camera
} from 'lucide-react';
import { Module, Company } from './types';

export const MENU_ITEMS = [
  { id: 'dashboard' as Module, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'ai-assistant' as Module, label: 'Àgio AI', icon: <Sparkles size={20} className="text-blue-500" /> },
  { id: 'sales' as Module, label: 'Vendas', icon: <ShoppingCart size={20} /> },
  { id: 'purchases' as Module, label: 'Compras', icon: <Truck size={20} /> },
  { id: 'inventory' as Module, label: 'Estoque', icon: <Package size={20} /> },
  { id: 'quotes' as Module, label: 'Orçamentos', icon: <FileText size={20} /> },
  { id: 'finance' as Module, label: 'Financeiro', icon: <Wallet size={20} /> },
  { id: 'reports' as Module, label: 'Relatórios', icon: <BarChart3 size={20} /> },
  { id: 'registration' as Module, label: 'Cadastro', icon: <UserPlus size={20} /> },
  { id: 'company' as Module, label: 'Minha Empresa', icon: <Building2 size={20} /> },
  { id: 'settings' as Module, label: 'Configuração', icon: <Settings size={20} /> },
  { id: 'management' as Module, label: 'Gerenciamento', icon: <Building2 size={20} className="text-purple-500" /> },
  { id: 'marketing' as Module, label: 'Marketing/Portfolio', icon: <Camera size={20} className="text-indigo-500" /> },
  { id: 'help' as Module, label: 'Ajuda', icon: <HelpCircle size={20} /> },
];

export const MOCK_COMPANY: Company = {
  name: 'Minha Assistência Técnica',
  cnpj: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  // Adicionados campos obrigatórios da interface Company para evitar erros de tipagem
  licenseType: 'Gratuito',
  licenseStatus: 'Ativo',
  licenseExpiresAt: '2026-01-01',
  maxUsers: 5,
  socialMedia: {
    instagram: '',
    facebook: ''
  }
};
