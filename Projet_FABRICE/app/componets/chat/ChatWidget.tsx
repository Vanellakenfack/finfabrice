'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { RootState } from '../../Data';
import { chatService, ChatMessage, Conversation } from '../../../services/chatService';
import { getEcho } from '../../../lib/echo';

const STORAGE_KEY = 'chat_guest_token';
const HIDDEN_PATHS = ['/Dashbord', '/fournisseur', '/acheteur', '/login', '/register', '/verification'];

type FormView = 'new' | 'recover';
type Step = 'form' | 'chat';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWidget() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading } = useSelector((state: RootState) => state.auth);

  // Tous les hooks doivent être déclarés avant tout return conditionnel
  const [open, setOpen]               = useState(false);
  const [step, setStep]               = useState<Step>('form');
  const [formView, setFormView]       = useState<FormView>('new');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [input, setInput]             = useState('');
  const [sending, setSending]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [unread, setUnread]           = useState(0);

  // Champs formulaire
  const [guestName, setGuestName]     = useState('');
  const [guestEmail, setGuestEmail]   = useState('');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverError, setRecoverError] = useState('');

  const bottomRef  = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  // Ouvrir le chat depuis n'importe quel bouton externe (ex: page produit)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('openChat', handler);
    return () => window.removeEventListener('openChat', handler);
  }, []);

  // Rejoindre le canal Reverb
  const subscribeToChannel = useCallback((token: string) => {
    try {
      const echo = getEcho();
      channelRef.current?.unsubscribe?.();
      channelRef.current = echo.channel(`chat.${token}`)
        .listen('.message.sent', (data: any) => {
          if (data.is_admin) {
            setMessages(prev => prev.find(m => m.id === data.id) ? prev : [...prev, data]);
            setUnread(n => n + 1);
          }
        });
    } catch {}
  }, []);

  // Charger une conversation et passer en mode chat (messages déjà inclus dans la réponse)
  const loadConversation = useCallback((conv: Conversation) => {
    if (conv.token) localStorage.setItem(STORAGE_KEY, conv.token);
    setConversation(conv);
    setMessages(conv.messages ?? []);
    subscribeToChannel(conv.token);
    setStep('chat');
  }, [subscribeToChannel]);

  // Vérification automatique à l'ouverture du widget
  useEffect(() => {
    if (!open || step === 'chat') return;

    const savedToken = localStorage.getItem(STORAGE_KEY);

    // CAS 1 — Visiteur sans token → formulaire immédiat, pas besoin d'attendre l'auth
    if (!savedToken && !isAuthenticated) {
      setStep('form');
      return;
    }

    // Pour les cas suivants on attend que l'auth soit chargée
    if (authLoading) return;

    // CAS 2 — Utilisateur connecté : démarrer directement, sans formulaire
    if (isAuthenticated && user) {
      setLoading(true);
      chatService.start({ guest_name: user.name, guest_email: user.email })
        .then(loadConversation)
        .catch(() => setStep('form'))
        .finally(() => setLoading(false));
      return;
    }

    // CAS 3 — Invité avec token localStorage : reprendre la conversation
    if (savedToken) {
      setLoading(true);
      chatService.start({ guest_token: savedToken })
        .then(loadConversation)
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
          setStep('form');
        })
        .finally(() => setLoading(false));
      return;
    }

    setStep('form');
  }, [open, isAuthenticated, authLoading]);

  // Nouvelle conversation (formulaire)
  const startNewChat = async () => {
    if (!guestName.trim()) return;
    setLoading(true);
    try {
      const conv = await chatService.start({ guest_name: guestName, guest_email: guestEmail });
      loadConversation(conv);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // Retrouver par email
  const recoverByEmail = async () => {
    if (!recoverEmail.trim()) return;
    setLoading(true);
    setRecoverError('');
    try {
      const conv = await chatService.findByEmail(recoverEmail);
      loadConversation(conv);
    } catch {
      setRecoverError('Aucune conversation trouvée pour cet email.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      const msg = await chatService.sendMessage(conversation.token, content);
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const resetChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    channelRef.current?.unsubscribe?.();
    setConversation(null);
    setMessages([]);
    setStep('form');
    setFormView('new');
    setGuestName('');
    setGuestEmail('');
    setRecoverEmail('');
    setRecoverError('');
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400';

  // Masquer sur les pages admin/vendeur — après tous les hooks
  if (HIDDEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Fenêtre de chat */}
      {open && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: 500 }}>

          {/* Header */}
          <div className="bg-orange-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-black text-sm">
                💬
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">Support EliteShop</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full" />
                  <p className="text-orange-100 text-[10px]">
                    {step === 'chat' && conversation?.status === 'open' ? 'En ligne' : 'Réponse rapide'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {step === 'chat' && (
                <button onClick={resetChat} title="Nouvelle conversation"
                  className="text-white/60 hover:text-white text-xs transition">↺</button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition text-xl leading-none">&times;</button>
            </div>
          </div>

          {/* Spinner : uniquement quand un appel API est en cours */}
          {(loading && step !== 'form') && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm">Chargement de votre conversation...</p>
            </div>
          )}

          {/* Formulaire */}
          {step === 'form' && !loading && (
            <div className="flex-1 flex flex-col p-5 overflow-y-auto">
              {/* Tabs new / recover */}
              <div className="flex rounded-xl border border-gray-200 mb-5 overflow-hidden">
                <button onClick={() => setFormView('new')}
                  className={`flex-1 py-2 text-xs font-bold transition ${formView === 'new' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Nouvelle conversation
                </button>
                <button onClick={() => setFormView('recover')}
                  className={`flex-1 py-2 text-xs font-bold transition ${formView === 'recover' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Retrouver ma conversation
                </button>
              </div>

              {formView === 'new' ? (
                <div className="flex flex-col gap-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">👋</div>
                    <p className="font-bold text-gray-800">Bonjour !</p>
                    <p className="text-xs text-gray-500 mt-1">Laissez votre prénom pour commencer.</p>
                  </div>
                  <input value={guestName} onChange={e => setGuestName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && startNewChat()}
                    placeholder="Votre prénom *" className={inputCls} />
                  <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                    type="email" placeholder="Votre email (pour retrouver la conv. plus tard)"
                    className={inputCls} />
                  <p className="text-[10px] text-gray-400 -mt-2">
                    💡 Entrez votre email pour retrouver votre conversation depuis n'importe quel appareil.
                  </p>
                  <button onClick={startNewChat} disabled={!guestName.trim() || loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-sm">
                    {loading ? 'Démarrage...' : 'Commencer le chat'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="font-bold text-gray-800">Retrouver ma conversation</p>
                    <p className="text-xs text-gray-500 mt-1">Entrez l'email utilisé lors de votre précédente conversation.</p>
                  </div>
                  <input value={recoverEmail} onChange={e => { setRecoverEmail(e.target.value); setRecoverError(''); }}
                    onKeyDown={e => e.key === 'Enter' && recoverByEmail()}
                    type="email" placeholder="Votre email *" className={inputCls} />
                  {recoverError && (
                    <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{recoverError}</p>
                  )}
                  <button onClick={recoverByEmail} disabled={!recoverEmail.trim() || loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-sm">
                    {loading ? 'Recherche...' : 'Retrouver ma conversation'}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">
                    Votre conversation sera restaurée avec tout l'historique.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {step === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm mt-8">
                    <p>Envoyez votre premier message !</p>
                    <p className="text-xs mt-1">Notre équipe vous répond rapidement.</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                    {msg.is_admin && (
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs mr-1.5 mt-auto flex-shrink-0">S</div>
                    )}
                    <div className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm ${
                      msg.is_admin
                        ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
                        : 'bg-orange-500 text-white rounded-tr-sm'
                    }`}>
                      <p className="break-words leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.is_admin ? 'text-gray-400' : 'text-orange-100'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {conversation?.status === 'closed' ? (
                <div className="px-4 py-4 bg-gray-50 border-t text-center flex-shrink-0">
                  <p className="text-sm text-gray-500 mb-2">Conversation fermée par le support.</p>
                  <button onClick={resetChat} className="text-xs text-orange-500 hover:underline font-bold">
                    Démarrer une nouvelle conversation
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-100 p-3 flex gap-2 flex-shrink-0">
                  <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                    placeholder="Écrivez un message… (Entrée pour envoyer)" rows={1}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-orange-400"
                    style={{ maxHeight: 80 }} />
                  <button onClick={sendMessage} disabled={!input.trim() || sending}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-3 py-2 transition disabled:opacity-50 flex-shrink-0">
                    {sending
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    }
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Bouton flottant */}
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all active:scale-95 relative pl-4 pr-5 py-3">
        <div className="relative flex-shrink-0">
          {open
            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
          }
          {unread > 0 && !open && (
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
        <span className="text-sm font-bold leading-none">
          {open ? 'Fermer' : unread > 0 ? `${unread} nouveau${unread > 1 ? 'x' : ''}` : 'Besoin d\'aide ?'}
        </span>
      </button>
    </div>
  );
}
