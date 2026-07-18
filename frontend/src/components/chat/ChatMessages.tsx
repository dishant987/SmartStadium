import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import Markdown from "react-markdown";
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import type { ChatMessage } from "@/types";

interface Props {
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;
  error: string | null;
  onRegenerate?: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button onClick={handleCopy} className="rounded-data p-1.5 text-text-muted transition-colors hover:bg-pitch-raised hover:text-text-secondary" title="Copy" aria-label="Copy response">
      {copied ? <Check size={14} className="text-pitch-green-500" /> : <Copy size={14} />}
    </button>
  );
}

function MessageActions({ content, isAssistant, onRegenerate }: { content: string; isAssistant: boolean; onRegenerate?: () => void }) {
  const [liked, setLiked] = useState<boolean | null>(null);
  return (
    <div className="mt-2 flex items-center gap-1 opacity-0 focus-within:opacity-100 transition-opacity group-hover:opacity-100">
      <CopyButton text={content} />
      {isAssistant && (
        <>
          <button onClick={() => setLiked(liked === true ? null : true)} className={`rounded-data p-1.5 transition-colors hover:bg-pitch-raised ${liked === true ? "text-pitch-green-500" : "text-text-muted hover:text-text-secondary"}`} title="Good response" aria-label="Good response">
            <ThumbsUp size={14} />
          </button>
          <button onClick={() => setLiked(liked === false ? null : false)} className={`rounded-data p-1.5 transition-colors hover:bg-pitch-raised ${liked === false ? "text-alert-red" : "text-text-muted hover:text-text-secondary"}`} title="Poor response" aria-label="Poor response">
            <ThumbsDown size={14} />
          </button>
          {onRegenerate && (
            <button onClick={onRegenerate} className="rounded-data p-1.5 text-text-muted transition-colors hover:bg-pitch-raised hover:text-text-secondary" title="Regenerate" aria-label="Regenerate response">
              <RotateCcw size={14} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

interface MdProps { href?: string; children?: ReactNode; className?: string; }

const mdComponents = {
  a: ({ href, children }: MdProps) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-floodlight-300 underline underline-offset-2 decoration-floodlight-300/40 hover:decoration-floodlight-300 transition-colors">{children}</a>
  ),
  p: ({ children }: MdProps) => <p className="mb-3 last:mb-0 leading-[1.7]">{children}</p>,
  ul: ({ children }: MdProps) => <ul className="mb-3 list-disc pl-5 space-y-1">{children}</ul>,
  ol: ({ children }: MdProps) => <ol className="mb-3 list-decimal pl-5 space-y-1">{children}</ol>,
  li: ({ children }: MdProps) => <li className="leading-[1.7]">{children}</li>,
  strong: ({ children }: MdProps) => <strong className="font-semibold text-text-primary">{children}</strong>,
  em: ({ children }: MdProps) => <em className="italic text-text-muted">{children}</em>,
  h1: ({ children }: MdProps) => <h1 className="text-lg font-bold text-text-primary font-display mb-2 mt-4">{children}</h1>,
  h2: ({ children }: MdProps) => <h2 className="text-base font-bold text-text-primary font-display mb-2 mt-3">{children}</h2>,
  h3: ({ children }: MdProps) => <h3 className="text-sm font-bold text-floodlight-300 font-display mb-1 mt-3">{children}</h3>,
  code: ({ children, className }: MdProps) => {
    const isBlock = className?.includes("language-");
    return isBlock
      ? <code className="block my-2 rounded-fan bg-pitch-night border border-border p-3 text-sm text-text-secondary overflow-x-auto font-mono">{children}</code>
      : <code className="rounded bg-pitch-raised px-1.5 py-0.5 text-sm text-floodlight-200 font-mono">{children}</code>;
  },
  pre: ({ children }: MdProps) => <pre className="my-2">{children}</pre>,
  blockquote: ({ children }: MdProps) => <blockquote className="border-l-2 border-floodlight-300/30 pl-3 italic text-text-muted my-2">{children}</blockquote>,
  hr: () => <hr className="border-border my-4" />,
  table: ({ children }: MdProps) => <div className="overflow-x-auto my-3"><table className="w-full text-sm border border-border rounded-fan overflow-hidden">{children}</table></div>,
  th: ({ children }: MdProps) => <th className="border border-border bg-pitch-raised px-3 py-2 text-left text-text-primary font-semibold">{children}</th>,
  td: ({ children }: MdProps) => <td className="border border-border px-3 py-2 text-text-secondary">{children}</td>,
};

export function ChatMessages({ messages, streamingText, isStreaming, error, onRegenerate }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const noMessages = messages.length === 0 && !isStreaming && !error;

  return (
    <div className="flex-1 overflow-y-auto" role="log" aria-live="polite" aria-label="Chat messages" ref={liveRef}>
      {noMessages ? null : (
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
          {messages.map((m) => (
            <div key={m.id} className={`group flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%]">
                {m.role === "user" ? (
                  <div className="rounded-fan bg-floodlight-300 px-4 py-3 text-[15px] text-pitch-night leading-[1.6] whitespace-pre-wrap font-ui">
                    {m.content}
                  </div>
                ) : (
                  <div>
                    <div className="text-[15px] text-text-primary font-ui">
                      <Markdown components={mdComponents}>{m.content}</Markdown>
                    </div>
                    <MessageActions content={m.content} isAssistant={true} onRegenerate={onRegenerate} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isStreaming && streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="text-[15px] text-text-primary font-ui" aria-label="Assistant is typing a response">
                  <Markdown components={mdComponents}>{streamingText}</Markdown>
                  <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-floodlight-300 align-middle" />
                </div>
              </div>
            </div>
          )}

          {isStreaming && !streamingText && (
            <div className="flex justify-start" role="status" aria-label="Assistant is thinking">
              <div className="flex items-center gap-3 rounded-fan bg-pitch-surface px-4 py-3 border border-border">
                <span className="text-sm text-text-muted font-ui">Thinking</span>
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-floodlight-300" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-floodlight-300" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-floodlight-300" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-fan border border-alert-red/30 bg-alert-red/10 px-4 py-3 text-sm text-alert-red font-ui" role="alert">
              {error}
            </div>
          )}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
