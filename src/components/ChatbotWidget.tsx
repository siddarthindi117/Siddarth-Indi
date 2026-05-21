import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Volume2, Mic, Check, Languages, HelpCircle } from "lucide-react";
import { ChatMessage } from "../types";
import { soundEffects } from "./SoundManager";

interface ChatbotWidgetProps {
  currentRole: string;
}

export default function ChatbotWidget({ currentRole }: ChatbotWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "wel-1",
      sender: "bot",
      text: "Namaskara! I am Danya AI, your smart agricultural tracker. How can I support your harvest operations today in Karnataka?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        "What is the rate for Togari?",
        "Nearest machine available?",
        "How to book a machine?",
        "Show my invoice."
      ]
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"English" | "Kannada" | "Hindi">("English");
  const [loading, setLoading] = useState(false);
  const [voicePlaybackActive, setVoicePlaybackActive] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    soundEffects.playClick();
    setInputText("");
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot/dialog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, language: selectedLanguage })
      });
      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.text || "Sorry, I had an issue processing that query. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Auto-attach suggestions depending on context
      if (textToSend.toLowerCase().includes("rate") || textToSend.toLowerCase().includes("price") || textToSend.toLowerCase().includes("ಬೆಲೆ")) {
        botMsg.suggestions = ["Nearest machine available?", "How to book machine?"];
      } else if (textToSend.toLowerCase().includes("book") || textToSend.toLowerCase().includes("बुकिंग")) {
        botMsg.suggestions = ["What crops are supported?", "How is payment verified?"];
      } else {
        botMsg.suggestions = ["What crops are supported?", "Show my invoice."];
      }

      setMessages(prev => [...prev, botMsg]);
      soundEffects.playNotification();

      // Trigger automatic TTS if user likes voice narration
      triggerSpeechSynthesis(botMsg.text);

    } catch (err) {
      console.error("Chat dialog failed", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerSpeechSynthesis = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any current speaking
    window.speechSynthesis.cancel();
    
    // Create voice utterance
    const utterance = new SpeechSynthesisUtterance(text.replace(/[\*\#\_]/g, ""));
    
    // Determine language accent code
    if (selectedLanguage === "Kannada") {
      utterance.lang = "kn-IN";
    } else if (selectedLanguage === "Hindi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-IN";
    }

    utterance.onstart = () => setVoicePlaybackActive(text);
    utterance.onend = () => setVoicePlaybackActive(null);
    utterance.onerror = () => setVoicePlaybackActive(null);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopVoiceSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setVoicePlaybackActive(null);
    }
  };

  const getLangBadge = (lang: string) => {
    if (selectedLanguage === lang) {
      return "bg-[#2E7D32] text-white";
    }
    return "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700";
  };

  return (
    <div id="danya-ai-chatbot" className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[380px]">
      {/* Bot Header */}
      <div className="p-4 bg-[#F1F8E9] dark:bg-zinc-800/80 border-b border-[#2E7D32]/10 dark:border-zinc-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 bg-[#2E7D32] rounded-full flex items-center justify-center shadow-inner">
            <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Danya AI</span>
              <span className="text-[9px] bg-[#2E7D32]/10 dark:bg-emerald-500/10 text-[#2E7D32] dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded leading-none">AGENT</span>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Kannada, English & Hindi</p>
          </div>
        </div>

        {/* Multi-language Selector Badges */}
        <div className="flex gap-1 items-center">
          <Languages className="h-3.5 w-3.5 text-zinc-400 mr-0.5" />
          {(["English", "Kannada", "Hindi"] as const).map(lang => (
            <button
              key={lang}
              onClick={() => {
                soundEffects.playClick();
                setSelectedLanguage(lang);
              }}
              className={`text-[9px] font-bold px-2 py-1 rounded transition-colors ${getLangBadge(lang)}`}
            >
              {lang === "Kannada" ? "ಕನ್ನಡ" : lang === "Hindi" ? "हिंदी" : "EN"}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50/40 dark:bg-zinc-900/40">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "self-end items-end ml-auto" : "self-start items-start"}`}
          >
            <div
              className={`p-3 rounded-2xl text-[12.5px] leading-relaxed shadow-sm border ${
                msg.sender === "user"
                  ? "bg-[#2E7D32] text-white border-emerald-700 rounded-tr-none"
                  : "bg-white text-zinc-800 dark:bg-zinc-850 dark:text-zinc-100 border-zinc-200/50 dark:border-zinc-700 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-line text-sm">{msg.text}</div>
              
              {msg.sender === "bot" && (
                <div className="mt-2 flex items-center justify-between border-t border-zinc-150/40 pt-1.5">
                  <span className="text-[9px] text-zinc-400 font-semibold">{msg.timestamp}</span>
                  {voicePlaybackActive === msg.text ? (
                    <button
                      onClick={stopVoiceSpeech}
                      className="flex items-center gap-0.5 text-[9px] font-bold text-red-600 dark:text-red-400 hover:opacity-80 transition"
                    >
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                      Stop Voice
                    </button>
                  ) : (
                    <button
                      onClick={() => triggerSpeechSynthesis(msg.text)}
                      className="flex items-center gap-1 text-[9px] font-bold text-[#2E7D32] dark:text-emerald-400 hover:underline transition"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Read Aloud
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Suggestions for next input */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {msg.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(s)}
                    className="bg-white dark:bg-zinc-800 text-[#2E7D32] dark:text-emerald-400 dark:border-zinc-700 hover:text-white hover:bg-[#2E7D32] dark:hover:bg-emerald-600 rounded-full border border-zinc-200 text-[10px] px-2.5 py-1 tracking-wide font-medium transition cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-zinc-100 dark:bg-zinc-800 rounded-xl p-3 flex items-center gap-1.5 border border-zinc-200/50 dark:border-zinc-700">
            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-200"></div>
            <span className="text-[10px] text-zinc-400 font-semibold ml-1">Danya is analyzing...</span>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          placeholder="Ask about Godhi rates, nearest machine, invoices..."
          className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#2E7D32] focus:border-[#2E7D32] dark:text-white"
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={loading || !inputText.trim()}
          className="p-2.5 bg-[#2E7D32] text-white rounded-xl shadow-md hover:bg-emerald-700 hover:scale-105 active:scale-95 disabled:opacity-50 transition cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
