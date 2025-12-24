
import React, { useState } from 'react';
import { Menu, X, User, LogOut, ChevronRight, BellRing, Settings, Info, CheckCircle2, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { MENU_ITEMS } from '../constants';
import { Module, Company, Notification, UserAccount } from '../types';

interface LayoutProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
  onLogout: () => void;
  company: Company;
  user: UserAccount | null; // Added user prop
  onMarkRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onDeleteAllNotifications: () => void;
  onClearAll: () => void;
  userPermissions: Module[];
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeModule, onModuleChange, onLogout, company, user, notifications,
  onMarkRead, onDeleteNotification, onDeleteAllNotifications, onClearAll, userPermissions, children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
      case 'error': return <XCircle className="text-red-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Mantido igual para brevidade */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 transition-all duration-300 flex flex-col z-30 relative`}>
        <div className={`p-4 flex flex-col items-center text-white border-b border-slate-800 ${sidebarOpen ? 'min-h-32' : 'h-20'} shrink-0 justify-center transition-all duration-300`}>
          <div className="flex flex-col items-center min-w-0 w-full relative">
            {/* Logo Section */}
            <div className="relative">
              {company.logo ? (
                <img src={company.logo} alt="Logo" className={`${sidebarOpen ? 'w-12 h-12 mb-3' : 'w-10 h-10'} object-contain rounded-xl bg-white p-1 shadow-2xl transition-all duration-300`} />
              ) : (
                <div className={`${sidebarOpen ? 'w-12 h-12 text-xl mb-3' : 'w-10 h-10 text-sm'} rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shrink-0 shadow-lg transition-all duration-300`}>
                  {company.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Labels Section */}
            {sidebarOpen && (
              <div className="text-center animate-in fade-in slide-in-from-top-2 duration-500 w-full overflow-hidden">
                <h1 className="font-black text-xs tracking-tight truncate leading-tight uppercase text-slate-100 mb-1">
                  {company.tradeName || company.name}
                </h1>
                <div className="flex items-center justify-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[8px] text-blue-400 font-black tracking-widest uppercase">
                    {company.licenseType || 'SATI v1.0'}
                  </span>
                </div>
              </div>
            )}

            {/* Toggle Button Inside */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`absolute ${sidebarOpen ? '-top-2 -right-2' : '-top-2 -right-2'} p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors`}
            >
              {sidebarOpen ? <ChevronRight size={16} className="rotate-180" /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        <nav className="flex-1 mt-4 space-y-1 px-3">
          {MENU_ITEMS.map((item) => userPermissions.includes(item.id) && (
            <button key={item.id} onClick={() => onModuleChange(item.id)} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeModule === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              {item.icon} {sidebarOpen && <span className="ml-3 font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center p-3 text-red-400 hover:bg-red-900/20 rounded-lg">
            <LogOut size={20} /> {sidebarOpen && <span className="ml-3 text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {company.tradeName || company.name || MENU_ITEMS.find(m => m.id === activeModule)?.label}
            </h2>
            {(company.tradeName || company.name) && (
              <span className="hidden md:inline-flex ml-3 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                {MENU_ITEMS.find(m => m.id === activeModule)?.label}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-6 relative">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full transition-all relative ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <BellRing size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Notificações</h4>
                      <div className="flex items-center space-x-3">
                        <button onClick={onClearAll} className="text-[10px] text-blue-600 font-bold hover:underline">Lidas</button>
                        <button onClick={onDeleteAllNotifications} className="text-[9px] text-red-500 font-bold hover:bg-red-50 p-1 px-2 rounded-lg transition-colors flex items-center">
                          <Trash2 size={12} className="mr-1" /> Limpar
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 italic text-xs">Sem novas mensagens.</div>
                      ) : notifications.map(note => (
                        <div
                          key={note.id}
                          onClick={() => onMarkRead(note.id)}
                          className={`p-4 border-b border-slate-50 cursor-pointer transition-colors flex items-start space-x-3 ${note.read ? 'opacity-50' : 'bg-blue-50/20 hover:bg-blue-50/40'}`}
                        >
                          <div className="mt-1">{getIcon(note.type)}</div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800">{note.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{note.message}</p>
                            <p className="text-[9px] text-slate-400 mt-2 font-medium">{note.time}</p>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            {!note.read && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm"></div>}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNotification(note.id);
                              }}
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Excluir notificação"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-3 pl-6 border-l border-gray-100 group cursor-pointer relative">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-slate-800 leading-tight">{user?.fullName || 'Usuário'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'Visitante'}</p>
              </div>
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-slate-200 group-hover:bg-blue-600 transition-colors">
                {user?.fullName?.charAt(0) || 'U'}
              </div>

              {/* Simple dropdown on hover/click could go here, for now relying on Sidebar Logout */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="p-3 border-b border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conta</p>
                </div>
                <button onClick={onLogout} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-bold flex items-center"><LogOut size={16} className="mr-2" /> Sair</button>
              </div>
            </div>
          </div>
        </header>

        <div id="main-content-area" className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {children}
        </div>
      </main>
    </div>
  );
};
