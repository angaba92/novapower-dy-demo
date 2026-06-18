import { motion } from 'framer-motion';
import { Loader2, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useShoppingMuse, type MuseResponse } from '../hooks/useShoppingMuse';
import { useConfig } from '../context/ConfigContext';

// [DY INTEGRATION] Side panel for DY Shopping Muse / Agent Assistant.
// Mirrors src/components/MuseChatOverlay.tsx from sinsay_v2 — same chat
// affordances, same widget rendering, NovaPower copy.

interface MuseChatOverlayProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  widgets?: MuseResponse['widgets'];
}

const STARTER_PROMPTS = [
  'Help me pick a green energy plan',
  'I work from home — best fiber + mobile bundle?',
  'I just bought an EV — what should I get?',
  'Reduce my electricity bill',
];

export default function MuseChatOverlay({ onClose }: MuseChatOverlayProps) {
  const { config } = useConfig();
  const muse = useShoppingMuse();
  const [chatId, setChatId] = useState<string | undefined>();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi, I'm NovaBot — powered by Dynamic Yield Shopping Muse. Tell me about your home and I'll suggest the best NovaPower plans for you.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || muse.isPending) return;
    setMessages((p) => [...p, { id: Math.random().toString(36).slice(2), role: 'user', text: t }]);
    setDraft('');
    muse.mutate(
      { text: t, chatId },
      {
        onSuccess: (r) => {
          setChatId(r.chatId ?? undefined);
          setMessages((p) => [
            ...p,
            { id: Math.random().toString(36).slice(2), role: 'assistant', text: r.assistant || '…', widgets: r.widgets ?? [] },
          ]);
        },
        onError: (err) => {
          setMessages((p) => [
            ...p,
            { id: Math.random().toString(36).slice(2), role: 'assistant', text: `⚠ ${err.message}` },
          ]);
        },
      },
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-200"
    >
      <header className="flex items-center justify-between p-4 border-b border-gray-200 gradient-hero text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h2 className="font-semibold">NovaBot · Shopping Muse</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-[#f5faff]">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={
                'inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ' +
                (m.role === 'user'
                  ? 'bg-[#0a4ea8] text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 rounded-bl-sm')
              }
            >
              {m.text}
            </div>
            {m.widgets && m.widgets.length > 0 && (
              <div className="mt-2 space-y-3 text-left">
                {m.widgets.map((w, idx) => (
                  <div key={idx}>
                    {w.title && (
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{w.title}</div>
                    )}
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                      {(w.slots ?? []).slice(0, 12).map((slot, i) => {
                        const data = (slot.productData ?? {}) as Record<string, any>;
                        const img =
                          data.image_url || data.image_url_small || data.imageUrl || '';
                        const name = data.name || data.productName || slot.sku || 'Plan';
                        const price =
                          typeof data.price === 'number' ? data.price.toFixed(2).replace('.', ',') : data.price;
                        return (
                          <a
                            key={i}
                            href={data.url || `/plan/${slot.sku}`}
                            className="shrink-0 w-36 rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-[#0a4ea8]/40"
                          >
                            {img && <img src={img} alt={name} className="w-full h-24 object-cover" loading="lazy" />}
                            <div className="p-2">
                              <div className="text-[12px] font-semibold leading-tight line-clamp-2">{name}</div>
                              {price && (
                                <div className="text-[12px] font-bold text-[#062f66] mt-1">
                                  {price} {config.currency}/mo
                                </div>
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {muse.isPending && (
          <div className="text-left">
            <div className="inline-block bg-white border border-gray-200 rounded-2xl px-3 py-2 text-sm">
              <Loader2 className="w-4 h-4 inline animate-spin mr-1" />
              NovaBot is thinking…
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 bg-[#f5faff]">
          {STARTER_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => send(p)}
              className="text-xs px-3 py-1.5 rounded-full border border-[#0a4ea8] text-[#0a4ea8] hover:bg-[#e9f2ff]"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 250))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            rows={1}
            placeholder="Ask about plans, savings, or your home…"
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4ea8]/30"
          />
          <button type="submit" disabled={muse.isPending || !draft.trim()} className="btn-primary px-4">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-1 text-[10px] text-gray-400 text-right">{draft.length}/250</p>
      </form>
    </motion.aside>
  );
}
