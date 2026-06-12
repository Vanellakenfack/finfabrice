'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { chatService, AdminConversation, ChatMessage } from '../../../services/chatService';
import { getEcho } from '../../../lib/echo';
import toast from 'react-hot-toast';

function timeAgo(iso: string | null) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'À l\'instant';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
  return new Date(iso).toLocaleDateString('fr-FR');
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminChatInbox() {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const echoChannelRef = useRef<any>(null);

  const selected = conversations.find(c => c.id === selectedId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Charger conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.adminGetConversations();
      setConversations(data);
    } catch {
      toast.error('Impossible de charger les conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Écouter tous les nouveaux messages via canal admin
  useEffect(() => {
    try {
      const echo = getEcho();
      echoChannelRef.current = echo.channel('chat.admin')
        .listen('.message.sent', (data: any) => {
          // Mettre à jour la liste des conversations
          setConversations(prev => prev.map(c => {
            if (c.id !== data.conversation_id) return c;
            return {
              ...c,
              last_message: data.content,
              last_message_at: data.created_at,
              unread_admin: data.is_admin ? c.unread_admin : (c.id === selectedId ? 0 : c.unread_admin + 1),
            };
          }).sort((a, b) =>
            (b.last_message_at ?? '').localeCompare(a.last_message_at ?? '')
          ));

          // Si c'est la conversation sélectionnée, ajouter le message
          if (data.conversation_id === selectedId) {
            setMessages(prev => prev.find(m => m.id === data.id) ? prev : [...prev, data]);
          }

          // Si la conversation n'est pas encore dans la liste, recharger
          if (!conversations.find(c => c.id === data.conversation_id)) {
            loadConversations();
          }
        });
    } catch {}

    return () => {
      echoChannelRef.current?.unsubscribe?.();
    };
  }, [selectedId, loadConversations]);

  // Charger messages de la conversation sélectionnée
  useEffect(() => {
    if (!selectedId) return;
    chatService.adminGetMessages(selectedId)
      .then(msgs => {
        setMessages(msgs);
        // Réinitialiser non-lus
        setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, unread_admin: 0 } : c));
      })
      .catch(() => toast.error('Impossible de charger les messages'));
  }, [selectedId]);

  const sendReply = async () => {
    if (!input.trim() || !selectedId || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      const msg = await chatService.adminReply(selectedId, content);
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      setConversations(prev => prev.map(c =>
        c.id === selectedId ? { ...c, last_message: msg.content, last_message_at: msg.created_at } : c
      ));
    } catch {
      toast.error('Erreur lors de l\'envoi');
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const closeConv = async (id: number) => {
    await toast.promise(chatService.adminClose(id), {
      loading: 'Fermeture...',
      success: 'Conversation fermée',
      error: 'Erreur',
    });
    setConversations(prev => prev.map(c => c.id === id ? { ...c, status: 'closed' } : c));
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  const totalUnread = conversations.reduce((s, c) => s + c.unread_admin, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex" style={{ height: 620 }}>
      {/* Liste des conversations */}
      <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-gray-800 text-sm">Conversations</h2>
          {totalUnread > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <p className="text-3xl mb-2">💬</p>
              Aucune conversation
            </div>
          ) : conversations.map(conv => (
            <button key={conv.id} onClick={() => setSelectedId(conv.id)}
              className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 ${
                selectedId === conv.id ? 'bg-orange-50 border-r-2 border-r-orange-500' : ''
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                  {conv.display_name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900 truncate">{conv.display_name}</p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{timeAgo(conv.last_message_at)}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{conv.last_message ?? 'Aucun message'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pl-9">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  conv.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>{conv.status === 'open' ? 'Ouvert' : 'Fermé'}</span>
                {conv.unread_admin > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {conv.unread_admin}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone de messages */}
      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="text-5xl">💬</div>
            <p className="font-medium text-sm">Sélectionnez une conversation</p>
          </div>
        ) : (
          <>
            {/* Header conversation */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <p className="font-black text-gray-800">{selected.display_name}</p>
                {selected.display_email && (
                  <p className="text-xs text-gray-400">{selected.display_email}</p>
                )}
              </div>
              {selected.status === 'open' && (
                <button onClick={() => closeConv(selected.id)}
                  className="text-xs text-gray-400 hover:text-red-500 font-medium border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition">
                  Fermer
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10">
                  Aucun message dans cette conversation.
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                  {!msg.is_admin && (
                    <div className="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-auto mr-2">
                      {selected.display_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    msg.is_admin
                      ? 'bg-orange-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    <p className="break-words leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.is_admin ? 'text-orange-100' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Saisie */}
            {selected.status === 'closed' ? (
              <div className="px-5 py-3 bg-gray-50 border-t text-center text-sm text-gray-500 flex-shrink-0">
                Conversation fermée
              </div>
            ) : (
              <div className="border-t border-gray-100 p-4 flex gap-3 flex-shrink-0">
                <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder="Répondre au client... (Entrée pour envoyer)" rows={1}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-orange-400"
                  style={{ maxHeight: 100 }} />
                <button onClick={sendReply} disabled={!input.trim() || sending}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2.5 font-bold text-sm transition disabled:opacity-50 flex items-center gap-2 flex-shrink-0">
                  {sending
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                  }
                  Envoyer
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
