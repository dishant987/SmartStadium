import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ToastContainer } from "@/components/ui/Toast";
import { ToastProvider, useToast } from "@/context/ToastContext";

function ToastDisplay({ id, message, type }: { id: string; message: string; type: string }) {
  const { removeToast } = useToast();
  return (
    <div>
      <span>{message}</span>
      <button onClick={() => removeToast(id)}>x</button>
    </div>
  );
}

function TestHarness() {
  const { addToast } = useToast();
  return <button onClick={() => addToast("From hook", "info")}>Show Toast</button>;
}

describe("ToastContainer", () => {
  it("renders within ToastProvider", () => {
    render(
      <ToastProvider>
        <TestHarness />
        <ToastContainer />
      </ToastProvider>
    );
    expect(screen.getByText("Show Toast")).toBeInTheDocument();
  });

  it("can add and display toasts", async () => {
    render(
      <ToastProvider>
        <TestHarness />
        <ToastContainer />
      </ToastProvider>
    );
    await userEvent.click(screen.getByText("Show Toast"));
    expect(screen.getByText("From hook")).toBeInTheDocument();
  });
});
