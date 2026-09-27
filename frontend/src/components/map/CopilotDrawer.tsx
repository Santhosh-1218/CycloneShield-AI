import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Loader2, User, Sparkles } from 'lucide-react';
import { sendCopilotChat } from '../../services/api';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  contextData?: any;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  contextData
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I am CycloneShield AI Copilot. I analyze real-time meteorological observations, satellite inundation indicators, and OSM infrastructure exposure to provide data-backed decision support. How can I assist your disaster monitoring operations?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendPrompt = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const res = await sendCopilotChat(newMessages, contextData);

    if (res && res.reply) {
      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } else {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Unable to reach CycloneShield AI service. Please verify backend server status.' }
      ]);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border-l border-slate-700/90 text-slate-100 flex flex-col shadow-2xl z-50 select-none">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-1.5">
              <span>CycloneShield AI Copilot</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </h3>
            <p className="text-[11px] text-slate-400">Data-backed Emergency Response Assistant</p>
          </div>
        </div>

        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`p-2 rounded-xl text-xs shrink-0 ${
              m.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-cyan-950/60 border border-cyan-800/60 text-cyan-400'
            }`}>
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-400 flex items-center space-x-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Analyzing live data context & formulating advice...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Copilot e.g. Why is Kakinada high risk?"
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold transition-all shadow-md shadow-cyan-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
