import React, { useState } from 'react';
import { Send, User as UserIcon, Sparkles } from 'lucide-react';
import { sendCopilotChat } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const CopilotPage: React.FC = () => {

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Based on current risk assessments, the highest priority assets are:\n1. Government Hospital (High risk - potential coastal flood path & access risk)\n2. Shelter 3 (High risk - high population surge load)\n3. Bridge 2 (Medium risk - potential water level overflow)',
      timestamp: 'Just now'
    }
  ]);

  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const suggestedQuestions = [
    "Which infrastructure requires immediate preparation?",
    "What areas have the highest population exposure?",
    "Why is Zone A classified high-risk?",
    "Which hospitals may lose accessibility, and why?",
    "Generate an emergency action plan.",
    "Create a Telugu warning message."
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setIsReplying(true);

    const apiPayload = updatedMessages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    const res = await sendCopilotChat(apiPayload, {});

    const botMsg: Message = {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: res.reply || 'Analysis completed.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMsg]);
    setIsReplying(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <span>Gemini Disaster Copilot</span>
        </h1>
        <p className="text-xs text-slate-500">Ask questions, get insights, take action</p>
      </div>

      {/* Suggested Questions Grid / Chips matching Mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 text-left transition-all shadow-sm flex items-center space-x-2"
          >
            <span className="text-blue-600 text-sm font-bold">?</span>
            <span className="line-clamp-2">{q}</span>
          </button>
        ))}
      </div>

      {/* Main Chat Conversation Container (White Card) */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 overflow-y-auto space-y-4 shadow-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`
                max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-2
                ${msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'}
              `}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
              <div className="text-[10px] opacity-60 text-right font-sans pt-1">{msg.timestamp}</div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isReplying && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
            <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
            <span>Gemini Copilot generating response...</span>
          </div>
        )}
      </div>

      {/* Bottom Text Input Bar matching Mockup */}
      <div className="flex items-center space-x-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about the current cyclone situation..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
        />
        <button
          onClick={() => handleSend()}
          disabled={isReplying}
          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

