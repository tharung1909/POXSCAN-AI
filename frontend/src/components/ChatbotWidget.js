import React, { useState, useRef, useEffect } from "react";

const RESPONSES = {
  symptoms:
    "Common monkeypox symptoms include fever (38–40°C), headache, muscle aches, and a distinctive skin rash that progresses from flat lesions to raised bumps and blisters. Symptoms typically appear 5–21 days after exposure.",
  prevention:
    "To prevent monkeypox: avoid close contact with infected individuals, practice good hand hygiene, avoid touching skin lesions, use PPE when caring for patients, and get vaccinated if eligible (JYNNEOS or ACAM2000).",
  upload:
    "To upload an image: go to the Prediction page, click the upload area or drag-and-drop your image. Supported formats: JPG, PNG. The AI will analyse it using 3 deep learning models and show a confidence score with a Grad-CAM heatmap.",
  gradcam:
    "Grad-CAM (Gradient-weighted Class Activation Mapping) highlights which regions of your image the AI focused on. Red/yellow = high attention areas, blue/cyan = low attention. It makes the AI's decision transparent and explainable.",
  default:
    "That's a great question! For accurate medical advice, please consult a healthcare professional. I can help you navigate PoxScan AI or provide general monkeypox information.",
};

function getResponse(text) {
  const t = text.toLowerCase();
  if (t.includes("symptom") || t.includes("sign") || t.includes("fever"))
    return RESPONSES.symptoms;
  if (t.includes("prevent") || t.includes("avoid") || t.includes("vaccin"))
    return RESPONSES.prevention;
  if (t.includes("upload") || t.includes("image") || t.includes("predict"))
    return RESPONSES.upload;
  if (t.includes("grad") || t.includes("cam") || t.includes("heatmap") || t.includes("explai"))
    return RESPONSES.gradcam;
  return RESPONSES.default;
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const CHIPS = [
  "What are monkeypox symptoms?",
  "How to prevent monkeypox?",
  "How do I upload an image?",
  "What is Grad-CAM?",
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm <strong>PoxBot</strong> — your AI health assistant. I can help with monkeypox info, symptoms, prevention, or how to use PoxScan AI.",
      isUser: false,
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), text, isUser: true, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: getResponse(text), isUser: false, time: getTime() },
      ]);
    }, 900 + Math.random() * 400);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([
      { id: Date.now(), text: "Chat cleared. How can I help you?", isUser: false, time: getTime() },
    ]);
  };

  return (
    <>
      <style>{`
        .poxbot-fab {
          position: fixed; bottom: 24px; right: 24px; z-index: 1000;
          width: 54px; height: 54px; border-radius: 50%;
          background: #0ea5a0; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(14,165,160,0.4);
          transition: transform 0.2s, background 0.2s;
        }
        .poxbot-fab:hover { transform: scale(1.08); background: #0b8a85; }
        .poxbot-fab svg { width: 24px; height: 24px; color: #fff; }

        .poxbot-window {
          position: fixed; bottom: 88px; right: 24px; z-index: 999;
          width: 370px; background: #ffffff;
          border: 0.5px solid rgba(0,0,0,0.1);
          border-radius: 20px;
          display: flex; flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.14);
          animation: poxbotSlideUp 0.25s cubic-bezier(.22,.68,0,1.2) forwards;
          max-height: 520px;
        }
        @keyframes poxbotSlideUp {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .poxbot-header {
          background: #0ea5a0; padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
        }
        .poxbot-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.4);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .poxbot-header-info { flex: 1; }
        .poxbot-header-info h3 { color: #fff; font-size: 15px; font-weight: 500; margin: 0; }
        .poxbot-status { display: flex; align-items: center; gap: 5px; margin-top: 2px; }
        .poxbot-status-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #4ade80;
          animation: poxbotPulse 2s infinite;
        }
        @keyframes poxbotPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .poxbot-status span { color: rgba(255,255,255,0.85); font-size: 12px; }
        .poxbot-header-actions { display: flex; gap: 6px; }
        .poxbot-header-btn {
          background: rgba(255,255,255,0.15); border: none; cursor: pointer;
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; transition: background 0.15s;
        }
        .poxbot-header-btn:hover { background: rgba(255,255,255,0.28); }

        .poxbot-body {
          flex: 1; overflow-y: auto; padding: 16px;
          display: flex; flex-direction: column; gap: 10px;
          background: #f4f7fb; max-height: 300px; scroll-behavior: smooth;
        }
        .poxbot-body::-webkit-scrollbar { width: 4px; }
        .poxbot-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }

        .poxbot-msg { display: flex; gap: 8px; align-items: flex-end; }
        .poxbot-msg.user { flex-direction: row-reverse; }
        .poxbot-msg-avatar {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: #0ea5a0; display: flex; align-items: center; justify-content: center;
        }
        .poxbot-msg.user .poxbot-msg-avatar { background: #e2e8f0; }
        .poxbot-msg-wrap { display: flex; flex-direction: column; max-width: 78%; }
        .poxbot-msg.user .poxbot-msg-wrap { align-items: flex-end; }
        .poxbot-bubble {
          padding: 10px 13px; border-radius: 16px; border-bottom-left-radius: 4px;
          font-size: 13.5px; line-height: 1.55;
          background: #ffffff; color: #1a1a1a;
          border: 0.5px solid rgba(0,0,0,0.08);
        }
        .poxbot-msg.user .poxbot-bubble {
          background: #0ea5a0; color: #fff; border: none;
          border-bottom-right-radius: 4px; border-bottom-left-radius: 16px;
        }
        .poxbot-time { font-size: 10px; color: #94a3b8; margin-top: 3px; }
        .poxbot-msg.user .poxbot-time { text-align: right; }

        .poxbot-typing { display: flex; gap: 4px; align-items: center; padding: 4px 2px; }
        .poxbot-typing span {
          width: 7px; height: 7px; border-radius: 50%; background: #0ea5a0;
          animation: poxbotBounce 1.2s infinite; display: inline-block;
        }
        .poxbot-typing span:nth-child(2) { animation-delay: 0.2s; }
        .poxbot-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes poxbotBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

        .poxbot-chips {
          padding: 10px 14px 0; display: flex; flex-wrap: wrap; gap: 6px;
          background: #ffffff; border-top: 0.5px solid rgba(0,0,0,0.08);
        }
        .poxbot-chip {
          padding: 5px 11px; border-radius: 20px; font-size: 12px;
          background: #e0f5f4; color: #0b8a85;
          border: 0.5px solid rgba(14,165,160,0.2); cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        .poxbot-chip:hover { background: rgba(14,165,160,0.2); transform: scale(1.03); }

        .poxbot-footer {
          padding: 10px 14px 14px; background: #ffffff;
          display: flex; gap: 8px; align-items: center;
        }
        .poxbot-input {
          flex: 1; border: 0.5px solid rgba(0,0,0,0.12); border-radius: 22px;
          padding: 9px 14px; font-size: 13.5px; outline: none;
          background: #f4f7fb; color: #1a1a1a;
          transition: border-color 0.15s; resize: none;
          min-height: 38px; max-height: 90px; font-family: inherit;
        }
        .poxbot-input:focus { border-color: #0ea5a0; }
        .poxbot-send {
          width: 38px; height: 38px; border-radius: 50%;
          background: #0ea5a0; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, transform 0.1s; flex-shrink: 0;
        }
        .poxbot-send:hover { background: #0b8a85; transform: scale(1.05); }
        .poxbot-badge-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 7px; }
        .poxbot-badge {
          padding: 3px 9px; border-radius: 12px; font-size: 11px; font-weight: 500;
          background: #e0f5f4; color: #0b8a85;
          border: 0.5px solid rgba(14,165,160,0.25);
        }
      `}</style>

      {/* FAB Button */}
      <button className="poxbot-fab" onClick={() => setOpen((o) => !o)} aria-label="Toggle PoxBot">
        {open ? (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="poxbot-window">
          {/* Header */}
          <div className="poxbot-header">
            <div className="poxbot-avatar">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.8 2m0 0l-1.8-2m1.8 2v4.5M5 14.5l-1.8 2m0 0l1.8 2m-1.8-2v4.5" />
              </svg>
            </div>
            <div className="poxbot-header-info">
              <h3>PoxBot</h3>
              <div className="poxbot-status">
                <div className="poxbot-status-dot" />
                <span>Online · AI health assistant</span>
              </div>
            </div>
            <div className="poxbot-header-actions">
              <button className="poxbot-header-btn" onClick={clearChat} title="Clear chat">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button className="poxbot-header-btn" onClick={() => setOpen(false)} title="Close">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="poxbot-body" ref={bodyRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`poxbot-msg${msg.isUser ? " user" : ""}`}>
                <div className="poxbot-msg-avatar">
                  {msg.isUser ? (
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.8 2m0 0l-1.8-2m1.8 2v4.5M5 14.5l-1.8 2m0 0l1.8 2m-1.8-2v4.5" />
                    </svg>
                  )}
                </div>
                <div className="poxbot-msg-wrap">
                  <div
                    className="poxbot-bubble"
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                  {!msg.isUser && msg.id === 1 && (
                    <div className="poxbot-badge-row">
                      <span className="poxbot-badge">Medical info</span>
                      <span className="poxbot-badge">AI guidance</span>
                    </div>
                  )}
                  <div className="poxbot-time">{msg.time}</div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="poxbot-msg">
                <div className="poxbot-msg-avatar">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.8 2m0 0l-1.8-2m1.8 2v4.5M5 14.5l-1.8 2m0 0l1.8 2m-1.8-2v4.5" />
                  </svg>
                </div>
                <div className="poxbot-msg-wrap">
                  <div className="poxbot-bubble">
                    <div className="poxbot-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Chips */}
          <div className="poxbot-chips">
            {CHIPS.map((chip) => (
              <button key={chip} className="poxbot-chip" onClick={() => sendMessage(chip)}>
                {chip}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="poxbot-footer">
            <textarea
              className="poxbot-input"
              placeholder="Ask me anything..."
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="poxbot-send" onClick={() => sendMessage(input)} aria-label="Send">
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
