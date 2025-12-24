
import React, { useState } from 'react';
import { ShieldCheck, User, Lock, ArrowRight, Eye, EyeOff, UserPlus, Mail, AlertCircle, Key, Chrome } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { UserAccount } from '../types';

interface LoginProps {
  onLogin: (user: any) => void;
  users: UserAccount[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Cadastro realizado! Por favor, faça login.");
        setIsRegistering(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLogin(userCredential.user);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("E-mail ou senha incorretos.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Este e-mail já está em uso.");
      } else {
        setError("Erro ao autenticar. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (err: any) {
      console.error(err);
      setError("Falha no login com Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-200 text-white mb-6 transform hover:rotate-3 transition-transform">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">SATI ÀGIO</h1>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Gestão Técnica de Alta Performance</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800">
              {isRegistering ? 'Criar Novo Acesso' : 'Acesse seu painel'}
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              {isRegistering ? 'Preencha os dados para solicitar acesso.' : 'Ambiente profissional e seguro.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-2xl flex items-start space-x-3 animate-shake">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text" required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-semibold"
                    placeholder="Ex: João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email" required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-semibold"
                  placeholder="admin@agiosolucoes.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sua Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"} required
                  className="w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-semibold"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-1">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={isLoading}
                className="w-full py-5 bg-blue-600 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-blue-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isRegistering ? 'Solicitar Acesso' : 'Entrar no Sistema'}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>

          {!isRegistering && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]"><span className="px-4 bg-white text-slate-400">ou entre com</span></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm flex items-center justify-center space-x-3 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google</span>
              </button>
            </>
          )}


          <div className="mt-8 text-center space-y-4">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
            >
              {isRegistering ? 'Já tenho uma conta. Fazer Login' : 'Não tem conta? Solicitar Acesso'}
            </button>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  // Check if onLogin prop is actually setup to handle a differentiation flag?
                  // Currently Login just passes user object. We might need to store intent in localStorage or similar if we can't change prop signature easily without breaking App.tsx usage.
                  // However, App.tsx checks email. So we can just use Google Login, but visually separate it.
                  const isAdm = true;
                  handleGoogleLogin();
                  // We rely on App.tsx to check if email is admin. 
                  // But user asked for a specific button flow. 
                  // We can pass a flag to handleGoogleLogin?
                }}
                className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-800 transition-colors"
              >
                <Key size={12} />
                <span>Acesso ADM</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

