import { useState, useRef, useEffect } from 'react';
import api from '../api/clinet.ts';
import { useCart } from '../context/CartContext';

interface Recommendation { id: number; reason: string; }
interface ChatMessage {
  type: 'user' | 'bot';
  text?: string;
  reply?: string;
  recommendations?: Recommendation[];
}
interface MenuItem { id: number; name: string; price: number; category: string; }

const CHIPS = [
  { label: 'Something light 🥗', q: 'Something light, not too heavy' },
  { label: 'Vegetarian 🌿', q: "I'm vegetarian, what do you recommend?" },
  { label: 'Spicy 🔥', q: 'I love spicy food, what do you have?' },
  { label: 'Under ₹150', q: 'Something good under ₹150' },
];

export default function AskAadhya({ menuItems }: { menuItems: MenuItem[] }) {
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const openChat = () => {
    setOpen(true);
    if (!greeted) {
      setGreeted(true);
      setMessages([{ type: 'bot', reply: "Hi! I'm Aadhya 👋 Tell me what you're in the mood for!" }]);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text }]);
    setLoading(true);
    try {
      const res = await api.post('/api/ai/ask', { message: text });
      setMessages(prev => [...prev, { type: 'bot', reply: res.data.reply, recommendations: res.data.recommendations }]);
    } catch {
      setMessages(prev => [...prev, { type: 'bot', reply: "Sorry, couldn't think that through — try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item: MenuItem) => {
    addItem({ menu_item_id: item.id, name: item.name, price: item.price });
    setAddedIds(prev => new Set(prev).add(item.id));
    setToast(`${item.name} added!`);
    setTimeout(() => setToast(''), 2000);
  };

  return (
    <>
      {!open && (
        <button onClick={openChat} className="aw-launcher" style={{ marginRight: '16px' }}>
        <img
        src="/aadhyalogo.png"
        alt="Hotel Aadhya"
        style={{
          color: '#fff',
          height: '24px',
        }}
      /> 
        </button>
      )}

      {open && (
        <div className="aw-panel">
          <div className="aw-header">
            <div className="aw-avatar"><img
        src="/aadhyalogo.png"
        alt="Hotel Aadhya"
        style={{
          color: '#fff',
          height: '24px',
        }}
      /> </div>
            <div>
              <div className="aw-header-name">Ask Aadhya</div>
              <div className="aw-header-sub">YOUR PERSONAL FOOD GUIDE</div>
            </div>
            <button className="aw-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="aw-messages" ref={scrollRef}>
            {messages.map((m, i) =>
              m.type === 'user' ? (
                <div key={i} className="aw-msg user">{m.text}</div>
              ) : (
                <div key={i} className="aw-msg bot">
                  <div>{m.reply}</div>
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="aw-rec-list">
                      {m.recommendations.map(rec => {
                        const item = menuItems.find(mi => mi.id === rec.id);
                        if (!item) return null;
                        const added = addedIds.has(item.id);
                        return (
                          <div key={item.id} className="aw-rec">
                            <div className="aw-rec-info">
                              <div className="aw-rec-name">{item.name}</div>
                              <div className="aw-rec-reason">{rec.reason}</div>
                            </div>
                            <div className="aw-rec-right">
                              <div className="aw-rec-price">₹{item.price}</div>
                              <button
                                className={`aw-rec-add ${added ? 'aw-added' : ''}`}
                                onClick={() => handleAdd(item)}
                                disabled={added}
                              >
                                {added ? '✓' : '+'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            )}
            {loading && (
              <div className="aw-typing"><span /><span /><span /></div>
            )}
          </div>

          <div className="aw-chips">
            {CHIPS.map(c => (
              <button key={c.label} className="aw-chip" onClick={() => handleSend(c.q)}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="aw-input-row">
            <input
              className="aw-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend(input)}
              placeholder="What are you craving?"
            />
            <button className="aw-send" onClick={() => handleSend(input)} disabled={loading}>➤</button>
          </div>

          {toast && <div className="aw-toast">{toast}</div>}
        </div>
      )}

      <style>{`
        .aw-launcher {
          position: fixed; bottom: 140px; right: 18px; z-index: 50;
          background: #dc5b00; color: #fff; border: none;
         font-weight: 600; font-size: 14px; cursor: pointer;padding: 12px;
          box-shadow: 0 6px 18px rgba(220,91,0,0.4);
          border-radius: 30px 30px 10px 30px;
        }
        .aw-panel {
          position: fixed; bottom: 16px; right: 16px; z-index: 50;
          width: 360px; max-height: 72vh;
          background: #fff8f0; border: 1px solid #f0ddc8; border-radius: 16px;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 10px 30px rgba(43,26,18,0.2);
        }
        .aw-header {
          background: #dc5b00; padding: 14px 16px;
          display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        }
        .aw-avatar {
          width: 34px; height: 34px; border-radius: 50%; background: #dc5b00; display: flex; align-items: center; justify-content: center;
          display: flex; align-items: center; justify-content: center; font-size: 17px;
        }
        .aw-header-name { font-size: 15px; font-weight: 700; color: #fff; }
        .aw-header-sub { font-size: 10px; color: #ffe8d6; letter-spacing: 0.5px; }
        .aw-close {
          margin-left: auto; background: rgba(255,255,255,0.2); border: none;
          color: #fff; width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
        }
        .aw-messages {
          flex: 1; overflow-y: auto; padding: 14px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .aw-msg {
          max-width: 85%; padding: 10px 13px; border-radius: 14px;
          font-size: 13.5px; line-height: 1.45;
        }
        .aw-msg.bot {
          background: #fff; border: 1px solid #f0ddc8;
          align-self: flex-start; border-bottom-left-radius: 4px;
        }
        .aw-msg.user {
          background: #dc5b00; color: #fff;
          align-self: flex-end; border-bottom-right-radius: 4px;
        }
        .aw-typing {
          display: flex; gap: 4px; padding: 12px 14px;
          background: #fff; border: 1px solid #f0ddc8;
          border-radius: 14px; align-self: flex-start; width: fit-content;
        }
        .aw-typing span {
          width: 6px; height: 6px; border-radius: 50%; background: #dc5b00;
          animation: aw-bounce 1.2s infinite;
        }
        .aw-typing span:nth-child(2) { animation-delay: 0.15s; }
        .aw-typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes aw-bounce {
          0%,60%,100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .aw-rec-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .aw-rec {
          background: #fff8f0; border: 1px dashed #f0ddc8;
          border-radius: 8px; padding: 10px 12px;
          display: flex; align-items: center; gap: 10px;
        }
        .aw-rec-info { flex: 1; min-width: 0; }
        .aw-rec-name { font-weight: 600; font-size: 13px; color: #2b1a12; }
        .aw-rec-reason { font-size: 11px; color: #8a6f5c; margin-top: 2px; }
        .aw-rec-right { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
        .aw-rec-price { font-weight: 700; font-size: 13px; color: #b94c00; }
        .aw-rec-add {
          background: #2b1a12; color: #fff; border: none;
          border-radius: 6px; width: 32px; height: 28px;
          font-size: 16px; font-weight: 700; cursor: pointer;
        }
        .aw-rec-add.aw-added { background: #5ea862; }
        .aw-chips {
          display: flex; flex-wrap: wrap; gap: 6px;
          padding: 0 14px 10px; flex-shrink: 0;
        }
        .aw-chip {
          background: #fff; border: 1px solid #dc5b00; color: #b94c00;
          border-radius: 999px; padding: 6px 12px; font-size: 12px; cursor: pointer;
        }
        .aw-input-row {
          display: flex; gap: 8px; padding: 12px 14px;
          border-top: 1px solid #f0ddc8; background: #fff; flex-shrink: 0;
        }
        .aw-input {
          flex: 1; border: 1px solid #f0ddc8; border-radius: 999px;
          padding: 9px 15px; font-size: 13px; outline: none;
          background: #fff; color: #2b1a12; min-height: 38px;
        }
        .aw-input:focus { border-color: #dc5b00; }
        .aw-send {
          background: #dc5b00; border: none; color: #fff;
          width: 38px; height: 38px; border-radius: 50%; cursor: pointer; font-size: 15px;
        }
        .aw-send:disabled { opacity: 0.5; }
        .aw-toast {
          position: absolute; bottom: 70px; left: 50%; transform: translateX(-50%);
          background: #2b1a12; color: #fff; padding: 7px 16px;
          border-radius: 999px; font-size: 12px; white-space: nowrap;
        }
        @media (max-width: 480px) {
            .aw-panel { left: 12px; right: 12px; bottom: 12px; width: auto; }
            .aw-launcher { bottom: 140px; right: 12px; }
            }
      `}</style>
    </>
  );
}