
export enum AppStatus {
  PENDING = 'PENDING', // Aguardando Avaliação
  IN_REPAIR = 'IN_REPAIR', // Em Manutenção
  WAITING_PARTS = 'WAITING_PARTS', // Aguardando Peças
  READY = 'READY', // Pronto para Retirada
  COMPLETED = 'COMPLETED', // Entregue/Finalizado
  CANCELLED = 'CANCELLED', // Devolvido sem Reparo
  APPROVED = 'APPROVED'
}

export interface OSDetails {
  equipmentType: string; // notebook, celular, etc
  brand: string;
  deviceModel: string;
  serialNumber: string; // IMEI ou Serial
  reportedDefect: string;
  technicalDiagnosis?: string;
  defectCategory?: 'Software' | 'Hardware' | 'Elétrico' | 'Outros';
  accessoriesIncluded: string[]; // Carregador, capa, etc
  visualCondition: string; // Riscos, tela quebrada
  devicePassword?: string;
  devicePattern?: string; // Stringified sequence or grid data
  internalNotes?: string;
  externalNotes?: string;
}

export interface OSHistory {
  date: string;
  status: AppStatus;
  notes: string;
  technicianName?: string;
}

export interface Quote {
  id: string;
  userId?: string; // Owner ID
  clientId: string;
  technicianId?: string;
  items: QuoteItem[];
  status: AppStatus;
  total: number;
  createdAt: string;
  description: string;
  technicalDetails?: OSDetails; // Novos detalhes técnicos
  history?: OSHistory[];
}

export interface Notification {
  id: string;
  userId?: string; // Owner ID
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface Session {
  id: string;
  device: string;
  ip: string;
  time: string;
  status: 'Ativa' | 'Encerrada';
}

export interface Product {
  id: string;
  userId?: string; // Owner ID
  code: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  provider?: string;
}

export interface Service {
  id: string;
  userId?: string; // Owner ID
  name: string;
  category: string;
  price: number;
  estimatedTime: string;
  warranty: number;
  description: string;
}

export interface UserAccount {
  id: string;
  userId?: string; // Owner ID (who created this user)
  username: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Tecnico' | 'Vendedor' | 'Master';
  active: boolean;
  lastLogin?: string;
  permissions: Module[];
  password?: string;
  twoFactorEnabled?: boolean;
  preferences?: {
    notifications: {
      email_sales: boolean;
      email_quotes: boolean;
      push_stock: boolean;
      push_system: boolean;
    };
  };
}

export interface Client {
  id: string;
  userId?: string; // Owner ID
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  whatsapp: string;
  birthDate?: string;
  address: {
    zip: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  notes?: string;
  credit?: number; // Crédito disponível
  createdAt: string;
}

export interface Technician {
  id: string;
  userId?: string; // Owner ID
  name: string;
  cpf: string;
  specialty: string;
  commissionRate: number;
  phone: string;
  email: string;
  active: boolean;
  admissionDate: string;
}

export interface PaymentMethod {
  id: string;
  userId?: string; // Owner ID
  name: string;
  active: boolean;
}

export interface QuoteItem {
  productId?: string;
  serviceId?: string;
  comboId?: string;
  quantity: number;
  price: number;
  type: 'product' | 'service' | 'combo' | 'offer';
}

export interface Combo {
  id: string;
  userId?: string;
  name: string;
  description: string;
  items: { productId?: string; serviceId?: string; quantity: number }[];
  price: number;
}

export interface Offer {
  id: string;
  userId?: string;
  name: string;
  productId?: string;
  serviceId?: string;
  price: number;
  originalPrice: number;
  expiresAt?: string;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface Sale {
  id: string;
  userId?: string; // Owner ID
  quoteId?: string;
  clientId: string;
  items: QuoteItem[];
  total: number;
  paymentMethod: string;
  date: string;
  discount?: number;
  creditUsed?: number;
  technicalDetails?: OSDetails;
}

export interface Purchase {
  id: string;
  userId?: string; // Owner ID
  supplierId: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  date: string;
}

export interface Company {
  userId?: string; // Owner ID
  name: string;
  tradeName?: string;
  cnpj: string;
  stateRegistration?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  licenseType: 'Gratuito' | 'Bronze' | 'Prata' | 'Ouro' | 'Vitalício';
  licenseStatus: 'Ativo' | 'Bloqueado' | 'Aguardando Pagamento' | 'Pendente';
  licenseExpiresAt: string;
  maxUsers: number;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
  };
  systemName?: string;
  password?: string; // Senha para abrir caixa
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Closure {
  id: string;
  userId?: string;
  date: string;
  revenue: number;
  expense: number;
  balance: number;
  transactions: number;
  status: 'open' | 'closed';
}

export type Module =
  | 'dashboard'
  | 'sales'
  | 'purchases'
  | 'inventory'
  | 'reports'
  | 'quotes'
  | 'company'
  | 'registration'
  | 'settings'
  | 'finance'
  | 'help'
  | 'ai-assistant'
  | 'marketing'
  | 'management';
