import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Plus,
  Trash2,
  ChevronLeft,
  Bot,
  User,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useListAnthropicConversations,
  useCreateAnthropicConversation,
  useGetAnthropicConversation,
  useDeleteAnthropicConversation,
  getListAnthropicConversationsQueryKey,
  getGetAnthropicConversationQueryKey,
} from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL || "/";

export function AgentAssist() {
  const [open, setOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversationsList, refetch: refetchConversations } =
    useListAnthropicConversations({
      query: { queryKey: getListAnthropicConversationsQueryKey(), enabled: open },
    });

  const { data: activeConv, refetch: refetchActiveConv } =
    useGetAnthropicConversation(activeConvId!, {
      query: { queryKey: getGetAnthropicConversationQueryKey(activeConvId!), enabled: !!activeConvId },
    });

  const createConv = useCreateAnthropicConversation();
  const deleteConv = useDeleteAnthropicConversation();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, streamingContent, scrollToBottom]);

  useEffect(() => {
    if (open && activeConvId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, activeConvId]);

  const handleNewConversation = async () => {
    const now = new Date();
    const title = `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const conv = await createConv.mutateAsync({ data: { title } });
    setActiveConvId(conv.id);
    refetchConversations();
  };

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConv.mutateAsync({ id });
    if (activeConvId === id) {
      setActiveConvId(null);
    }
    refetchConversations();
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConvId || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    await refetchActiveConv();

    try {
      const response = await fetch(
        `${BASE}api/anthropic/conversations/${activeConvId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: userMessage }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to send message");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                break;
              }
              if (data.content) {
                accumulated += data.content;
                setStreamingContent(accumulated);
              }
              if (data.error) {
                console.error("Stream error:", data.error);
              }
            } catch {
            }
          }
        }
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      refetchActiveConv();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const conversations = conversationsList || [];
  const activeMessages = activeConv?.messages || [];

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
          open
            ? "neu-btn text-white"
            : "neu-btn-primary text-white"
        )}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        style={!open ? { animation: 'neu-glow 3s ease-in-out infinite' } : undefined}
      >
        {open ? (
          <X size={22} />
        ) : (
          <div className="relative">
            <MessageCircle size={22} />
            <Sparkles
              size={10}
              className="absolute -top-1.5 -right-1.5 text-yellow-300"
              style={{ filter: 'drop-shadow(0 0 3px rgba(253,224,71,0.5))' }}
            />
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.93 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-[100] w-[400px] h-[560px] flex flex-col overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(180deg, hsl(240 8% 6%) 0%, hsl(240 6% 4.5%) 100%)',
              boxShadow: '12px 12px 32px rgba(0,0,0,0.6), -12px -12px 32px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="h-14 px-4 flex items-center gap-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}>
              {activeConvId ? (
                <>
                  <motion.button
                    onClick={() => setActiveConvId(null)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft size={18} />
                  </motion.button>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Bot size={18} className="text-blue-400 shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.4))' }} />
                    <span className="text-sm font-medium text-white truncate">
                      {activeConv?.title || "Agent Assist"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Bot size={20} className="text-blue-400" style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.4))' }} />
                  <span className="text-sm font-semibold text-white flex-1">
                    Agent Assist
                  </span>
                  <motion.button
                    onClick={handleNewConversation}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                    title="New conversation"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus size={18} />
                  </motion.button>
                </>
              )}
            </div>

            {!activeConvId ? (
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(145deg, rgba(59,130,246,0.1), rgba(59,130,246,0.03))',
                        boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(59,130,246,0.03), 0 0 20px rgba(59,130,246,0.08)',
                        border: '1px solid rgba(59,130,246,0.12)',
                      }}
                    >
                      <Bot size={28} className="text-blue-400" style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white mb-1">
                        Medicare Agent Assist
                      </p>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        Get help with plan details, compliance questions,
                        objection handling, and sales scripts.
                      </p>
                    </div>
                    <motion.button
                      onClick={handleNewConversation}
                      className="px-5 py-2.5 text-white text-sm font-medium rounded-xl neu-btn-primary"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Start a conversation
                    </motion.button>
                  </div>
                ) : (
                  <div className="p-2.5 space-y-1">
                    {conversations.map((conv, i) => (
                      <motion.div
                        key={conv.id}
                        onClick={() => setActiveConvId(conv.id)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group neu-nav-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <MessageCircle
                          size={16}
                          className="text-zinc-600 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-300 truncate">
                            {conv.title}
                          </p>
                          <p className="text-xs text-zinc-700">
                            {new Date(conv.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <motion.button
                          onClick={(e) =>
                            handleDeleteConversation(conv.id, e)
                          }
                          className="p-1 rounded opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                          whileTap={{ scale: 0.85 }}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                  {activeMessages.length === 0 && !streamingContent && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                      <Sparkles size={24} className="text-blue-400" style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))' }} />
                      <p className="text-xs text-zinc-600 max-w-[240px]">
                        Ask me about Medicare plans, compliance, objection
                        handling, or sales scripts.
                      </p>
                    </div>
                  )}

                  {activeMessages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      className={cn(
                        "flex gap-2.5",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.25 }}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            background: 'linear-gradient(145deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
                            boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2), 0 0 6px rgba(59,130,246,0.1)',
                            border: '1px solid rgba(59,130,246,0.1)',
                          }}
                        >
                          <Bot size={14} className="text-blue-400" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[280px] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap",
                          msg.role === "user"
                            ? "neu-chat-bubble-user text-white rounded-br-md"
                            : "neu-chat-bubble-ai text-zinc-300 rounded-bl-md"
                        )}
                      >
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 neu-raised-sm">
                          <User size={14} className="text-zinc-500" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {streamingContent && (
                    <motion.div
                      className="flex gap-2.5 justify-start"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: 'linear-gradient(145deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
                          boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2), 0 0 6px rgba(59,130,246,0.1)',
                          border: '1px solid rgba(59,130,246,0.1)',
                        }}
                      >
                        <Bot size={14} className="text-blue-400" />
                      </div>
                      <div className="max-w-[280px] px-3.5 py-2.5 rounded-xl rounded-bl-md text-sm leading-relaxed neu-chat-bubble-ai text-zinc-300 whitespace-pre-wrap">
                        {streamingContent}
                        <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse rounded-full" style={{ boxShadow: '0 0 4px rgba(59,130,246,0.6)' }} />
                      </div>
                    </motion.div>
                  )}

                  {isStreaming && !streamingContent && (
                    <motion.div
                      className="flex gap-2.5 justify-start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: 'linear-gradient(145deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
                          boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2), 0 0 6px rgba(59,130,246,0.1)',
                          border: '1px solid rgba(59,130,246,0.1)',
                        }}
                      >
                        <Bot size={14} className="text-blue-400" />
                      </div>
                      <div className="px-3.5 py-2.5 rounded-xl rounded-bl-md neu-chat-bubble-ai">
                        <Loader2
                          size={16}
                          className="text-blue-400 animate-spin"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)' }}>
                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about Medicare, compliance..."
                      className="flex-1 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none max-h-24 rounded-xl neu-input"
                      rows={1}
                      disabled={isStreaming}
                    />
                    <motion.button
                      onClick={handleSend}
                      disabled={!input.trim() || isStreaming}
                      className="p-2.5 text-white rounded-xl shrink-0 transition-all"
                      style={!input.trim() || isStreaming ? {
                        background: 'hsl(240 6% 8%)',
                        boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.03)',
                        color: 'rgb(63 63 70)',
                      } : {
                        background: 'linear-gradient(145deg, #4388f8, #2563eb)',
                        boxShadow: '3px 3px 8px rgba(37,99,235,0.25), -2px -2px 6px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.12)',
                        border: '1px solid rgba(59,130,246,0.3)',
                      }}
                      whileHover={input.trim() && !isStreaming ? { scale: 1.05 } : {}}
                      whileTap={input.trim() && !isStreaming ? { scale: 0.93 } : {}}
                    >
                      <Send size={16} />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
