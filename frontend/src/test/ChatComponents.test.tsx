import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import type { ChatMessage, ChatSession } from "@/types";

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
}

const mockSessions: ChatSession[] = [
  { id: "s1", title: "First chat", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "s2", title: "Second chat", updatedAt: "2026-01-02T00:00:00Z" },
];

const mockMessages: ChatMessage[] = [
  { id: "m1", sessionId: "s1", role: "user", content: "Hello", createdAt: "2026-01-01T00:00:00Z" },
  { id: "m2", sessionId: "s1", role: "assistant", content: "Hi there!", createdAt: "2026-01-01T00:00:01Z" },
];

describe("ChatInput", () => {
  it("renders textarea with placeholder", () => {
    render(<ChatInput onSend={() => {}} onStop={() => {}} isStreaming={false} disabled={false} />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText("Message Spectra...")).toBeInTheDocument();
  });

  it("calls onSend when Enter is pressed", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} onStop={() => {}} isStreaming={false} disabled={false} />, { wrapper: Wrapper });
    const textarea = screen.getByPlaceholderText("Message Spectra...");
    fireEvent.change(textarea, { target: { value: "Test message" } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("Test message");
  });

  it("renders stop button when streaming", () => {
    render(<ChatInput onSend={() => {}} onStop={() => {}} isStreaming={true} disabled={false} />, { wrapper: Wrapper });
    expect(screen.getByLabelText("Stop generating")).toBeInTheDocument();
  });

  it("disables input when disabled prop is true", () => {
    render(<ChatInput onSend={() => {}} onStop={() => {}} isStreaming={false} disabled={true} />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText("Message Spectra...")).toBeDisabled();
  });
});

describe("ChatMessages", () => {
  it("renders user and assistant messages", () => {
    render(
      <ChatMessages messages={mockMessages} streamingText="" isStreaming={false} error={null} />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("renders streaming text with cursor", () => {
    render(
      <ChatMessages messages={[]} streamingText="partial response" isStreaming={true} error={null} />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText("partial response")).toBeInTheDocument();
  });

  it("renders error with role=alert", () => {
    render(
      <ChatMessages messages={[]} streamingText="" isStreaming={false} error="Something went wrong" />,
      { wrapper: Wrapper }
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("has log role and aria-live", () => {
    const { container } = render(
      <ChatMessages messages={mockMessages} streamingText="" isStreaming={false} error={null} />,
      { wrapper: Wrapper }
    );
    expect(container.querySelector("[role='log']")).toHaveAttribute("aria-live", "polite");
  });
});

describe("ChatSidebar", () => {
  it("renders session titles", () => {
    render(
      <ChatSidebar
        sessions={mockSessions}
        activeSessionId="s1"
        isLoading={false}
        onSelect={() => {}}
        onNew={() => {}}
        onDelete={() => {}}
      />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText("First chat")).toBeInTheDocument();
    expect(screen.getByText("Second chat")).toBeInTheDocument();
  });

  it("renders new chat button", () => {
    render(
      <ChatSidebar
        sessions={[]}
        activeSessionId={null}
        isLoading={false}
        onSelect={() => {}}
        onNew={() => {}}
        onDelete={() => {}}
      />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText("New chat")).toBeInTheDocument();
  });

  it("renders empty state when no sessions", () => {
    render(
      <ChatSidebar
        sessions={[]}
        activeSessionId={null}
        isLoading={false}
        onSelect={() => {}}
        onNew={() => {}}
        onDelete={() => {}}
      />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
  });

  it("calls onNew when new chat is clicked", () => {
    const onNew = vi.fn();
    render(
      <ChatSidebar
        sessions={[]}
        activeSessionId={null}
        isLoading={false}
        onSelect={() => {}}
        onNew={onNew}
        onDelete={() => {}}
      />,
      { wrapper: Wrapper }
    );
    fireEvent.click(screen.getByText("New chat"));
    expect(onNew).toHaveBeenCalled();
  });
});
