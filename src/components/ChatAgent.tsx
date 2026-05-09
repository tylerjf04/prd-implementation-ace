import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, Loader2, Paperclip, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

const WEBHOOK_URL =
  "https://n8n.tamfco.com/webhook/9d6e4efc-3123-4f45-813a-4d631cb89675";

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  imageBase64?: string;
}

const WELCOME: Message = {
  id: "welcome",
  role: "agent",
  text: "Hey! I'm your NutriCoach 🥗 Ask me anything about your macros, meal ideas, or hitting your goals.",
};

function normalizeMarkdown(raw: string): string {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/(?<!\n)\n(?!\n)/g, "  \n");
}

async function sendToWebhook(
  message: string,
  userId: string | null,
  sessionId: string,
  imageBase64: string | null,
): Promise<string> {
  const body: Record<string, unknown> = { message, userId, sessionId };
  if (imageBase64) body.image = imageBase64.split(",")[1] ?? imageBase64;

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Webhook error ${res.status}`);

  const text = await res.text();
  try {
    const json = JSON.parse(text);
    const raw =
      json.message ??
      json.reply ??
      json.response ??
      json.output ??
      json.text ??
      (typeof json === "string" ? json : JSON.stringify(json));
    return normalizeMarkdown(raw);
  } catch {
    return normalizeMarkdown(text);
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ChatAgent({ userId }: { userId: string | null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await readFileAsBase64(file);
    setPendingImage(base64);
    e.target.value = "";
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && !pendingImage) || loading) return;

    const imageToSend = pendingImage;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      imageBase64: imageToSend ?? undefined,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPendingImage(null);
    setLoading(true);

    try {
      const reply = await sendToWebhook(text, userId, sessionId.current, imageToSend);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "agent", text: reply },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "agent",
          text: "Sorry, I couldn't reach the server right now. Try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-[5.5rem] right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-glow">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-sunset px-4 py-3 text-primary-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-none">NutriCoach</p>
              <p className="mt-0.5 text-[11px] opacity-75">Powered by AI</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-white/20 transition"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto p-4 scrollbar-hide">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-gradient-sunset text-primary-foreground rounded-br-sm"
                      : "border border-border bg-muted text-foreground rounded-bl-sm",
                  )}
                >
                  {m.imageBase64 && (
                    <img
                      src={m.imageBase64}
                      alt="attachment"
                      className="mb-1.5 max-h-40 w-full rounded-xl object-cover"
                    />
                  )}
                  {m.role === "user" ? (
                    m.text
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkBreaks]}
                      components={{
                        p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        h1: ({ children }) => <p className="font-bold text-base mb-1">{children}</p>,
                        h2: ({ children }) => <p className="font-bold mb-1">{children}</p>,
                        h3: ({ children }) => <p className="font-semibold mb-0.5">{children}</p>,
                        ul: ({ children }) => <ul className="my-1 ml-4 list-disc space-y-0.5">{children}</ul>,
                        ol: ({ children }) => <ol className="my-1 ml-4 list-decimal space-y-0.5">{children}</ol>,
                        li: ({ children }) => <li className="leading-snug">{children}</li>,
                        code: ({ children }) => <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-xs">{children}</code>,
                        hr: () => <hr className="my-2 border-border/40" />,
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-muted px-3.5 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Thinking…</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Image preview */}
          {pendingImage && (
            <div className="relative mx-3 mb-1">
              <img
                src={pendingImage}
                alt="pending"
                className="h-20 w-20 rounded-xl object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => setPendingImage(null)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background shadow"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-border/60 bg-background/60 px-3 py-2.5"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted disabled:opacity-40"
              aria-label="Attach image"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              disabled={loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted disabled:opacity-40"
              aria-label="Take photo"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your macros…"
              disabled={loading}
              className="input flex-1 py-2 text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={(!input.trim() && !pendingImage) || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-sunset text-primary-foreground shadow-glow transition disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating toggle button — only shown when chat is closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open NutriCoach"
          className="fixed bottom-[5.5rem] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-sunset text-primary-foreground shadow-glow transition-transform active:scale-95"
        >
          <MessageCircle className="h-6 w-6" strokeWidth={2.5} />
        </button>
      )}
    </>
  );
}
