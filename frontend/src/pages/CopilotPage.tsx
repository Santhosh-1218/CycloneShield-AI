import React, { useState } from 'react';
import { Send, User as UserIcon, Sparkles } from 'lucide-react';
import { sendCopilotChat } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const CopilotPage: React.FC = () => {
  const { location } = useLocation();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Welcome! I am the CycloneShield AI Copilot for ${location.city}, ${location.state}.\n\nBased on current risk models:\n1. Coastal exposure is evaluated for low-lying zones.\n2. Evacuation shelters and hospitals are mapped via OpenStreetMap.\n3. Regional emergency directives can be generated on demand.`,
      timestamp: 'Just now'
    }
  ]);

  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const suggestedQuestions = [
    `What is the weather status in ${location.city}?`,
    "Is there any active cyclone near this area?",
    "Which nearby evacuation shelters are available?",
    "Will heavy rainfall cause coastal waterlogging?",
    "Explain the hazard calculation formula.",
    "Generate a district emergency action directive."
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

    try {
      const res = await sendCopilotChat(apiPayload, {
        lat: location.latitude,
        lon: location.longitude,
        locationName: location.city
      });

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.reply || 'Operational analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to reach Gemini AI backend. Please verify network connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="h-[calc(100vh-9rem)] flex flex-col space-y-4 text-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 border border-[#E5E5E5] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-[#111111] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#16A34A]" />
              <span>AI Disaster Intelligence Copilot</span>
            </h1>
            <Badge status="MODELLED">AI ADVISORY</Badge>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            {location.city}, {location.state} • Gemini / Groq LLM Decision Support
          </p>
        </div>
      </div>

      {/* Suggested Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 shrink-0">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="p-2.5 rounded-xl bg-white border border-[#E5E5E5] hover:border-[#16A34A] hover:bg-[#F0FDF4] text-xs font-semibold text-[#111111] text-left transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <span className="text-[#16A34A] font-bold text-sm">?</span>
            <span className="line-clamp-1">{q}</span>
          </button>
        ))}
      </div>

      {/* Main Conversation Container */}
      <Card className="flex-1 overflow-y-auto space-y-4" padding="md">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-[#16A34A] flex items-center justify-center text-white shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`
                max-w-xl rounded-xl p-3.5 text-xs leading-relaxed space-y-1.5
                ${msg.sender === 'user' 
                  ? 'bg-[#16A34A] text-white rounded-tr-none font-medium' 
                  : 'bg-[#F8FAFC] border border-[#E5E5E5] text-[#111111] rounded-tl-none'}
              `}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
              <div className="text-[10px] opacity-70 text-right pt-0.5">{msg.timestamp}</div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-[#111111] text-white flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isReplying && (
          <div className="flex items-center gap-2 text-xs text-[#666666] italic">
            <Sparkles className="w-4 h-4 animate-spin text-[#16A34A]" />
            <span>AI Copilot generating synthesis...</span>
          </div>
        )}
      </Card>

      {/* Bottom Text Input Bar */}
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask about weather, cyclone risk, or shelters in ${location.city}...`}
          className="flex-1 bg-white border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent shadow-xs"
        />
        <Button
          variant="primary"
          size="md"
          onClick={() => handleSend()}
          disabled={isReplying}
          icon={<Send className="w-4 h-4" />}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
