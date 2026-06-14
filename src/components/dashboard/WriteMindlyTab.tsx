import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  MicOff,
  Trash2,
  AlertCircle,
  Loader2,
  Heart,
  ShieldCheck
} from "lucide-react";
import api from "../../services/api";

interface Message {
  sender: "user" | "model";
  text: string;
  timestamp: Date;
}

export function WriteMindlyTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [remainingPercent, setRemainingPercent] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  // Initialize Speech Recognition support check
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      setIsSpeechSupported(true);
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        // Auto-stop if they don't say anything for 5 seconds initially
        silenceTimerRef.current = setTimeout(() => {
          rec.stop();
        }, 5000);
      };

      rec.onresult = (event: any) => {
        // Clear silence timer immediately whenever speech/results are detected
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }

        if (finalTranscript) {
          setInputValue((prev) => {
            const trimmedPrev = prev.trim();
            const trimmedNew = finalTranscript.trim();
            return trimmedPrev ? trimmedPrev + " " + trimmedNew : trimmedNew;
          });
        }

        // Wait 3 seconds of complete silence before stopping the microphone
        silenceTimerRef.current = setTimeout(() => {
          rec.stop();
        }, 3000);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Initialize Session on mount
  useEffect(() => {
    // Generate UUID for the temporary session
    const tempSessionId = "wm-" + Math.random().toString(36).substring(2) + "-" + Date.now().toString(36);
    setSessionId(tempSessionId);

    // Copywriting configuration check
    const hasUsed = localStorage.getItem("hasUsedWriteMindly") === "true";
    const initialText = hasUsed
      ? "What's on your mind today? Even \"I don't know\" is a fine place to start."
      : "Blank page, no pressure. Start with whatever's loudest in your head right now.";

    setMessages([
      {
        sender: "model",
        text: initialText,
        timestamp: new Date()
      }
    ]);

    localStorage.setItem("hasUsedWriteMindly", "true");

    // Fetch initial session limits
    const fetchSessionLimits = async () => {
      try {
        const response = await api.get(`/chat/session/${tempSessionId}`);
        if (response.data) {
          setRemainingPercent(response.data.remainingPercent);
        }
      } catch (err) {
        console.error("Failed to initialize WriteMindly session limits:", err);
      }
    };
    fetchSessionLimits();

    return () => {
      // Clean up recording if running
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Send Message function
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue.trim();
    setInputValue("");

    const newMessages: Message[] = [
      ...messages,
      { sender: "user", text: userMessageText, timestamp: new Date() }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Map state messages to request format (ignoring initial prompt)
      const chatHistory = messages.slice(1).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await api.post("/chat/message", {
        sessionId,
        message: userMessageText,
        history: chatHistory
      });

      if (response.data) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "model",
            text: response.data.response,
            timestamp: new Date()
          }
        ]);
        setRemainingPercent(response.data.remainingPercent);
      }
    } catch (err) {
      console.error("WriteMindly chat request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "model",
          text: "I couldn't reach the server. Let's take a deep breath together. Reconnect and try again in a bit.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Microphone Speech-to-Text
  const handleToggleRecord = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Speech Recognition failed to start:", e);
      }
    }
  };

  // End and Reset Session
  const handleEndSession = async () => {
    if (window.confirm("Are you sure you want to end this session? All chat history will be permanently deleted.")) {
      try {
        await api.delete(`/chat/session/${sessionId}`);
      } catch (err) {
        console.error("Failed to delete session on backend:", err);
      }

      // Generate a new temporary session ID
      const newTempSessionId = "wm-" + Math.random().toString(36).substring(2) + "-" + Date.now().toString(36);
      setSessionId(newTempSessionId);
      setRemainingPercent(100);
      setInputValue("");

      setMessages([
        {
          sender: "model",
          text: "Blank page, no pressure. What's loudest in your head right now?",
          timestamp: new Date()
        }
      ]);
    }
  };

  // SVG Gauge variables
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (remainingPercent / 100) * circumference;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden font-sans">
      {/* 1. Header Area */}
      <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-plum/10 text-plum flex items-center justify-center shadow-inner shrink-0">
            <Heart className="h-5 w-5 fill-current animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 font-serif leading-none">WriteMindly</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Temporary, fully private AI companion.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Circular Context Gauge */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-100 shadow-sm select-none">
            <div className="relative h-9 w-9 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  className={`transition-all duration-500 ${
                    remainingPercent > 50
                      ? "stroke-plum"
                      : remainingPercent > 20
                      ? "stroke-amber-500"
                      : "stroke-rose-500"
                  }`}
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[9px] font-black text-slate-700">{remainingPercent}%</span>
            </div>
            <div className="hidden sm:block text-left text-[10px] leading-tight">
              <p className="font-extrabold text-slate-900 uppercase">Context Left</p>
              <p className="font-semibold text-slate-400">Remaining capacity</p>
            </div>
          </div>

          {/* End Session Button */}
          <button
            onClick={handleEndSession}
            title="End Session & Destroy History"
            className="flex items-center gap-1.5 bg-rose-50 border border-rose-200/50 hover:bg-rose-100 hover:border-rose-300 text-rose-600 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End Session</span>
          </button>
        </div>
      </header>

      {/* 2. Chat History Viewport */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-slate-50/20 to-white relative">
        {/* Anonymity Banner */}
        <div className="max-w-xl mx-auto bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-slate-600 select-none shadow-sm animate-fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-slate-900 mb-0.5">Completely Private & Session-Only</p>
            <p className="font-medium text-slate-500">
              The content of your messages is processed in memory and never logged or written to the database. Leaving this page or ending the session permanently wipes your history.
            </p>
          </div>
        </div>

        {/* Message Log */}
        <div className="max-w-3xl mx-auto flex flex-col gap-4 font-sans text-sm">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3.5 max-w-[85%] sm:max-w-[70%] font-medium leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-plum text-white rounded-tr-none"
                        : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/40"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1.5 text-right font-semibold select-none ${
                        isUser ? "text-white/60" : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* AI Generation Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-slate-100 border border-slate-200/40 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 text-plum animate-spin" />
                <span className="text-xs font-bold text-slate-500 select-none animate-pulse">
                  Companion is typing...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* 3. Session Limit Warnings */}
      {remainingPercent <= 0 && (
        <div className="bg-amber-50 border-y border-amber-200/50 px-6 py-2 flex items-center justify-center gap-2 select-none shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
          <span className="text-xs font-extrabold text-amber-800">
            Context capacity fully reached. Serving fallback messages for the remainder of this session.
          </span>
        </div>
      )}

      {/* 4. Chat Typing Input Bar */}
      <footer className="px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3 relative items-center">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={
                isRecording
                  ? "Listening... Speak your mind clearly."
                  : "Type whatever is loudest in your head..."
              }
              className="w-full pl-5 pr-14 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-plum focus:ring-2 focus:ring-plum/10 text-sm font-medium bg-white placeholder-slate-400/90 transition-all shadow-inner disabled:bg-slate-100/50"
            />

            {/* Speech to text Mic Button */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={handleToggleRecord}
                disabled={isLoading}
                className={`absolute right-4 p-2 rounded-xl transition-all cursor-pointer border-none flex items-center justify-center outline-none ${
                  isRecording
                    ? "bg-rose-500 text-white scale-110 shadow-lg shadow-rose-500/20 animate-pulse"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Send Message Button */}
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-plum hover:bg-plum/95 text-white p-4 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-plum/15 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none shrink-0 cursor-pointer border-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
}
