import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  MicOff,
  Trash2,
  Loader2,
  Heart,
  ShieldCheck
} from "lucide-react";
import api from "../../services/api";
import { Button, ConfirmSheet, IconButton, Input } from "../ui";
import { scrollToElement } from "../../lib/a11y";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  const fetchSessionLimits = async (id: string) => {
    try {
      const response = await api.get(`/chat/session/${id}`);
      if (response.data) {
        setRemainingPercent(response.data.remainingPercent);
      }
    } catch (err) {
      console.error("Failed to read WriteMindly session limits:", err);
    }
  };

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

    fetchSessionLimits(tempSessionId);

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
    scrollToElement(chatEndRef.current);
  }, [messages, isLoading]);

  // Send Message function
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue.trim();
    setInputValue("");
    setError(null);

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
      setMessages((prev) => prev.slice(0, -1));
      setInputValue(userMessageText);
      setError("We couldn't reach the server, so that message didn't send. Your words are still in the box — try again in a moment.");
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
  const endSession = async () => {
    try {
      await api.delete(`/chat/session/${sessionId}`);
    } catch (err) {
      console.error("Failed to delete session on backend:", err);
    }

    // Generate a new temporary session ID
    const newTempSessionId = "wm-" + Math.random().toString(36).substring(2) + "-" + Date.now().toString(36);
    setSessionId(newTempSessionId);
    await fetchSessionLimits(newTempSessionId);
    setInputValue("");

    setMessages([
      {
        sender: "model",
        text: "Blank page, no pressure. What's loudest in your head right now?",
        timestamp: new Date()
      }
    ]);
  };

  // SVG Gauge variables
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (remainingPercent / 100) * circumference;

  return (
    <div className="flex flex-col h-[calc(100dvh-12rem)] min-h-[500px] bg-card rounded-3xl border border-ink-100 shadow-sm overflow-hidden">
      {/* 1. Header Area */}
      <header className="px-6 py-4 border-b border-ink-100 flex items-center justify-between shrink-0 bg-paper-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-plum-100 text-plum-600 flex items-center justify-center shadow-inner shrink-0">
            <Heart className="h-5 w-5 fill-current" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-ink-900 font-display leading-none">WriteMindly</h2>
            <p className="text-xs text-ink-500 font-medium mt-1">Temporary, fully private AI companion.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Circular Context Gauge */}
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-2xl border border-ink-100 shadow-sm select-none">
            <span className="sr-only">{remainingPercent}% of today's messages left. Resets tomorrow.</span>
            <div className="relative h-9 w-9 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90" aria-hidden="true">
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  className="stroke-ink-100"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  className={`transition-all duration-500 ${
                    remainingPercent > 50
                      ? "stroke-plum-500"
                      : remainingPercent > 20
                      ? "stroke-gold-500"
                      : "stroke-coral-500"
                  }`}
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span aria-hidden="true" className="absolute text-2xs font-black text-ink-700">{remainingPercent}%</span>
            </div>
            <div className="hidden sm:block text-left text-2xs leading-tight">
              <p className="font-extrabold text-ink-900 uppercase">Messages left</p>
              <p className="font-semibold text-ink-400">Resets tomorrow</p>
            </div>
          </div>

          {/* End Session Button */}
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<Trash2 />}
            onClick={() => setConfirmOpen(true)}
            aria-label="End session"
            className="text-coral-600 hover:bg-coral-50"
          >
            <span className="hidden sm:inline">End session</span>
          </Button>
        </div>
      </header>

      {/* 2. Chat History Viewport */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-paper-2/40 to-card relative">
        {/* Anonymity Banner */}
        <div className="max-w-xl mx-auto bg-paper-2 border border-ink-100 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-ink-600 select-none shadow-sm">
          <ShieldCheck className="w-5 h-5 text-sage-600 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-black text-ink-900 mb-0.5">What happens to what you write here</p>
            <p className="font-medium text-ink-500">
              What you type is sent to our AI provider so it can reply, and we do not save the words themselves — not in a log, not in the database. We do save one row per message, with the date, the time and your account, so we can apply a daily limit. Staff can see that record and it never contains anything you wrote. Ending the session clears this screen; it does not delete those rows.
            </p>
          </div>
        </div>

        {/* Message Log */}
        <div
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          className="max-w-3xl mx-auto flex flex-col gap-4 text-sm"
        >
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
                        ? "bg-plum-500 text-plum-50 rounded-tr-none"
                        : "bg-paper-2 text-ink-800 rounded-tl-none border border-ink-200/40"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-2xs mt-1.5 text-right font-semibold select-none ${
                        isUser ? "text-plum-100" : "text-ink-400"
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
              <div className="bg-paper-2 border border-ink-200/40 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 text-plum-600 animate-spin" />
                <span className="text-xs font-bold text-ink-500 select-none">
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
        <div className="bg-gold-50 border-y border-gold-200/50 px-6 py-2 flex items-center justify-center gap-2 select-none shrink-0">
          <span className="text-xs font-extrabold text-gold-800">
            You've used all of today's messages. Anything you write now gets a short standard reply, and your full allowance is back tomorrow.
          </span>
        </div>
      )}

      {/* 4. Chat Typing Input Bar */}
      <footer className="px-6 py-4 border-t border-ink-100 shrink-0 bg-paper-2">
        <p role="status" aria-live="polite" className="min-h-5 text-center text-xs font-medium text-danger mb-2">
          {error}
        </p>
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3 relative items-center">
          <div className="flex-1">
            <Input
              label="Your message"
              hideLabel
              className="text-base"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={
                isRecording
                  ? "Listening... Speak your mind clearly."
                  : "Type whatever is loudest in your head..."
              }
              trailing={
                isSpeechSupported ? (
                  <IconButton
                    size="sm"
                    label={isRecording ? "Stop voice input" : "Start voice input"}
                    aria-pressed={isRecording}
                    disabled={isLoading}
                    onClick={handleToggleRecord}
                    variant={isRecording ? "danger" : "ghost"}
                    icon={isRecording ? <MicOff /> : <Mic />}
                  />
                ) : undefined
              }
            />
          </div>

          {/* Send Message Button */}
          <IconButton
            label="Send message"
            variant="primary"
            size="md"
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            icon={<Send />}
          />
        </form>
      </footer>

      <ConfirmSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={endSession}
        title="End this session?"
        description="This clears the conversation from your screen and starts a fresh one. It does not delete the daily message count described at the top of this page, and it does not give you more messages for today."
        confirmLabel="End session"
        destructive
      />
    </div>
  );
}
