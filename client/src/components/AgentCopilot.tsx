import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTION_CHIPS = [
  "What's a PINK score?",
  "How does pricing work?",
  "I need a custom build",
];

export default function AgentCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayedReply, setDisplayedReply] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingIndexRef = useRef(0);
  const fullReplyRef = useRef("");

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedReply]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping) return;

    const full = fullReplyRef.current;
    if (typingIndexRef.current >= full.length) {
      // Finished typing — commit the message
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
      setDisplayedReply("");
      return;
    }

    const timer = setTimeout(() => {
      typingIndexRef.current += 1;
      setDisplayedReply(full.slice(0, typingIndexRef.current));
    }, 12);

    return () => clearTimeout(timer);
  }, [isTyping, displayedReply]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("./api/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: updatedMessages,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.error || "Something went wrong." },
          ]);
        } else {
          // Start typewriter
          fullReplyRef.current = data.reply || "No response.";
          typingIndexRef.current = 0;
          setDisplayedReply("");
          setIsTyping(true);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Connection error. Try again." },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          style={{ backgroundColor: "#f5c842" }}
          aria-label="Open Factorizer Copilot"
        >
          <MessageCircle className="w-6 h-6 text-[#06080e]" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10"
          style={{
            width: 400,
            height: 500,
            backgroundColor: "#06080e",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: "#f5c842" }}
              />
              <span className="text-sm font-semibold text-white tracking-wide">
                Factorizer Copilot
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/50 hover:text-white transition-colors"
              aria-label="Close Copilot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {/* Suggestion Chips — before first message */}
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center gap-3 pt-8">
                <p className="text-xs text-white/40 mb-2 uppercase tracking-widest">
                  Ask anything
                </p>
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm rounded-full border border-[#f5c842]/30 text-[#f5c842] hover:bg-[#f5c842]/10 transition-colors disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Rendered Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "rounded-br-md text-[#06080e] font-medium"
                      : "rounded-bl-md text-white bg-white/5"
                  }`}
                  style={
                    msg.role === "user"
                      ? { backgroundColor: "#f5c842" }
                      : undefined
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typewriter in-progress */}
            {isTyping && displayedReply && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md text-sm leading-relaxed text-white bg-white/5 whitespace-pre-wrap">
                  {displayedReply}
                  <span className="inline-block w-1 h-4 ml-0.5 bg-[#f5c842] animate-pulse align-text-bottom" />
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-md text-sm text-white/50 bg-white/5">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f5c842] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f5c842] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f5c842] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Factorizer..."
                disabled={isLoading || isTyping}
                className="flex-1 bg-white/5 text-white text-sm rounded-xl px-4 py-2.5 outline-none border border-white/10 focus:border-[#f5c842]/50 transition-colors placeholder:text-white/25 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading || isTyping}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
                style={{ backgroundColor: "#f5c842" }}
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-[#06080e]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
