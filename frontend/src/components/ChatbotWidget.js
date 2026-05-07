import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatAPI } from '../services/api';

const SUGGESTIONS = [
  'What are monkeypox symptoms?',
  'How to prevent monkeypox?',
  'How do I upload an image?',
  'What is Grad-CAM?',
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! I'm PoxBot 🤖 — your AI health assistant. I can help with monkeypox info, symptoms, prevention, or how to use PoxScan AI.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(m => [...m, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatAPI.send(msg);
      setMessages(m => [...m, { from: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(m => [...m, { from: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        style={styles.fab}
        className={open ? '' : 'animate-pulse-glow'}
      >
        {open ? '✕' : '🤖'}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            style={styles.panel}
            className="glass-bright"
          >
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.botAvatar}>🤖</div>
              <div>
                <div style={styles.botName}>PoxBot</div>
                <div style={styles.botStatus}><span style={{ color: '#34d399' }}>●</span> Online</div>
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messages}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <div style={{ ...styles.bubble, ...(m.from === 'user' ? styles.userBubble : styles.botBubble) }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={styles.botBubble}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0,1,2].map(i => (
                        <div
                          key={i}
                          style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: 'var(--cyan)',
                            animation: `float 1s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div style={styles.suggestions}>
                {SUGGESTIONS.map(s => (
                  <button key={s} style={styles.suggestion} onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={styles.inputRow}>
              <input
                className="input"
                style={{ flex: 1, padding: '9px 12px', fontSize: 13 }}
                placeholder="Ask me anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
              />
              <button
                style={styles.sendBtn}
                onClick={() => send()}
                disabled={!input.trim() || loading}
              >
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: 28,
    right: 28,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
    border: 'none',
    cursor: 'pointer',
    fontSize: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    boxShadow: '0 4px 24px rgba(56,189,248,0.4)',
    color: '#060b18',
    fontWeight: 700,
  },
  panel: {
    position: 'fixed',
    bottom: 96,
    right: 28,
    width: 340,
    maxHeight: 500,
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
    borderBottom: '1px solid rgba(56,189,248,0.1)',
    background: 'rgba(56,189,248,0.05)',
  },
  botAvatar: {
    width: 36, height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18,
  },
  botName: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' },
  botStatus: { fontSize: 11, color: 'var(--text-muted)', marginTop: 1 },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minHeight: 200,
    maxHeight: 260,
  },
  bubble: {
    maxWidth: '82%',
    padding: '9px 13px',
    borderRadius: 14,
    fontSize: 13,
    lineHeight: 1.5,
  },
  userBubble: {
    background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
    color: '#060b18',
    fontWeight: 500,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--text-primary)',
    borderBottomLeftRadius: 4,
    border: '1px solid rgba(56,189,248,0.1)',
  },
  suggestions: {
    padding: '4px 12px 8px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestion: {
    background: 'rgba(56,189,248,0.08)',
    border: '1px solid rgba(56,189,248,0.2)',
    borderRadius: 20,
    padding: '4px 10px',
    fontSize: 11,
    color: 'var(--cyan)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.2s',
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px',
    borderTop: '1px solid rgba(56,189,248,0.08)',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
    border: 'none',
    cursor: 'pointer',
    color: '#060b18',
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
    transition: 'all 0.2s',
  },
};
