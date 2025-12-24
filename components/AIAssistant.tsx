
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Send, Image as ImageIcon, Wand2, Loader2, Bot, User, Trash2, Camera, Download, AlertCircle } from 'lucide-react';
import { Product, Sale, Quote } from '../types';

interface AIAssistantProps {
  products: Product[];
  sales: Sale[];
  quotes: Quote[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ products, sales, quotes }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'editor'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou o Àgio AI. Como posso ajudar com sua assistência técnica hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editorPrompt, setEditorPrompt] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Initialize from props or local storage
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('GEMINI_API_KEY') || process.env.API_KEY || '');
  const [showKeyInput, setShowKeyInput] = useState(!apiKey);

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Chat com gemini-2.5-flash-lite-latest (Baixa Latência)
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    if (!apiKey) {
      alert("Por favor, configure sua chave de API do Google Gemini nas configurações ou abaixo.");
      setShowKeyInput(true);
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const context = `
        Você é o Àgio AI, assistente inteligente do sistema SATI (Sistema de Assistência Técnica Integrado).
        Dados atuais do sistema para consulta rápida:
        - Total de produtos no estoque: ${products.length}
        - Total de vendas realizadas: ${sales.length}
        - Total de orçamentos/OS abertas: ${quotes.length}
        Responda de forma profissional, curta e prestativa em Português Brasileiro.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite-preview-02-05',
        contents: `${context}\nUsuário: ${userMessage}`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text() || 'Desculpe, não consegui processar sua solicitação.' }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMsg = 'Ocorreu um erro ao conectar com a IA.';
      if (error.message?.includes('API key')) {
        errorMsg = 'Chave de API inválida ou expirada. Por favor verifique sua chave.';
        setShowKeyInput(true);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('GEMINI_API_KEY', key);
    setShowKeyInput(false);
  };

  // Editor de Imagens com gemini-2.5-flash-image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = async () => {
    if (!selectedImage || !editorPrompt.trim() || isProcessingImage) return;

    setIsProcessingImage(true);
    const base64Data = selectedImage.split(',')[1];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: `Edite esta imagem seguindo este comando: ${editorPrompt}. Retorne apenas a imagem editada.`,
            },
          ],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setEditedImage(`data:image/png;base64,${part.inlineData.data}`);
        } else if (part.text) {
          console.log('AI Message during image edit:', part.text);
        }
      }
    } catch (error) {
      console.error('Image edit error:', error);
      alert('Erro ao processar imagem. Verifique se o comando é válido para edição.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Àgio AI</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Inteligência Artificial de Alta Performance</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeTab === 'editor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Wand2 size={16} /><span>Editor de Imagem</span>
          </button>
        </div>
      </div>

      {showKeyInput && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <AlertCircle size={20} className="text-amber-500" />
            <div>
              <p className="text-sm font-bold text-amber-800">Chave de API Necessária</p>
              <p className="text-xs text-amber-600">Para usar o Àgio AI, você precisa de uma chave válida do Google Gemini.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="password"
              placeholder="Cole sua API Key aqui..."
              className="px-4 py-2 rounded-xl border border-amber-200 text-xs font-mono w-64 focus:outline-none focus:border-amber-400"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button onClick={() => saveApiKey(apiKey)} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors">Salvar</button>
          </div>
        </div>
      )}

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {activeTab === 'chat' ? (
          <>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex items-start space-x-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-600'}`}>
                      {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    <div className={`p-5 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Bot size={20} /></div>
                    <div className="bg-slate-50 p-5 rounded-3xl rounded-tl-none border border-slate-100 flex space-x-1">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="p-8 border-t border-slate-50 bg-slate-50/30">
              <div className="relative">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Pergunte algo sobre o sistema ou peça conselhos de gestão..."
                  className="w-full pl-6 pr-16 py-5 bg-white border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-800 shadow-sm"
                />
                <button type="submit" disabled={isTyping || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100">
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] h-80 flex flex-col items-center justify-center p-8 relative group overflow-hidden">
                  {selectedImage ? (
                    <>
                      <img src={selectedImage} alt="Original" className="w-full h-full object-contain rounded-2xl" />
                      <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                    </>
                  ) : (
                    <div className="text-center space-y-4" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center text-slate-400 mx-auto group-hover:text-blue-600 group-hover:scale-110 transition-all cursor-pointer">
                        <Camera size={32} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase tracking-tighter text-lg">Carregar Imagem</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Fotos de aparelhos ou produtos</p>
                      </div>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                    <Wand2 size={14} className="mr-2 text-blue-500" /> Comando de Edição por Texto
                  </label>
                  <textarea
                    value={editorPrompt}
                    onChange={e => setEditorPrompt(e.target.value)}
                    placeholder="Ex: 'Adicione um filtro retrô', 'Remova o fundo', 'Coloque em uma bancada de eletrônica'..."
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[120px] font-bold text-slate-800"
                  />
                  <button
                    onClick={handleEditImage}
                    disabled={!selectedImage || !editorPrompt.trim() || isProcessingImage}
                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 disabled:opacity-50"
                  >
                    {isProcessingImage ? <Loader2 size={24} className="animate-spin" /> : <><Sparkles size={20} /><span>Gerar Edição Inteligente</span></>}
                  </button>
                </div>

                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-3">
                  <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-widest">
                    Utilize o Gemini 2.5 Flash Image para edições rápidas e contextuais. Tente ser específico nos comandos para melhores resultados.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 rounded-[2.5rem] h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">
                  <div className="absolute top-8 left-8">
                    <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">Resultado IA</span>
                  </div>

                  {editedImage ? (
                    <div className="w-full h-full flex flex-col items-center">
                      <img src={editedImage} alt="Editada" className="w-full h-full object-contain rounded-2xl animate-in fade-in zoom-in-95 duration-500" />
                      <a href={editedImage} download="agio-ai-edit.png" className="mt-6 flex items-center space-x-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white text-xs font-black uppercase tracking-widest border border-white/10 transition-all">
                        <Download size={16} /><span>Baixar Imagem</span>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4 opacity-40 group-hover:opacity-60 transition-opacity">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                        <Bot size={40} className="text-white" />
                      </div>
                      <p className="text-white/60 font-black uppercase tracking-widest text-xs">Aguardando processamento...</p>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
