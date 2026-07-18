import { useState, useRef, useEffect, type FormEvent } from "react";
import { Send, Square, Paperclip } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
  centered?: boolean;
  defaultValue?: string;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled, centered, defaultValue }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
      textareaRef.current?.focus();
    }
  }, [defaultValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`w-full ${centered ? "max-w-2xl mx-auto" : ""}`}>
      <form onSubmit={handleSubmit} className="relative rounded-fan border border-border bg-pitch-surface shadow-data transition-colors focus-within:border-floodlight-300/30">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message StadiumSense..."
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] text-text-primary placeholder-text-muted outline-none font-ui disabled:opacity-50"
          style={{ minHeight: "44px", maxHeight: "200px" }}
        />
        <div className="flex items-center justify-between px-3 pb-2.5">
          <div className="flex items-center gap-1">
            <button type="button" className="rounded-data p-1.5 text-text-muted transition-colors hover:bg-pitch-raised hover:text-text-secondary" title="Attach file" aria-label="Attach file">
              <Paperclip size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex h-8 w-8 items-center justify-center rounded-data bg-alert-red text-white transition-colors hover:bg-red-600"
                title="Stop generating"
                aria-label="Stop generating"
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={disabled || !value.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-data bg-floodlight-300 text-pitch-night transition-colors hover:bg-floodlight-200 disabled:opacity-30 disabled:hover:bg-floodlight-300"
                title="Send"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
