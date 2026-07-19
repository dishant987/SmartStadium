import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";

vi.mock("@/services/apiClient", () => ({ apiClient: vi.fn(), apiStream: vi.fn() }));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: qc }, children);
};

describe("Card", () => {
  it("renders data variant and fan variant", () => {
    render(<Card variant="data">data</Card>);
    render(<Card variant="fan">fan</Card>);
    expect(screen.getByText("data")).toBeInTheDocument();
    expect(screen.getByText("fan")).toBeInTheDocument();
  });
  it("applies custom className", () => {
    const { container } = render(<Card className="custom">x</Card>);
    expect(container.firstChild).toHaveClass("custom");
  });
});

describe("Spinner", () => {
  it("renders and accepts className", () => {
    const { container } = render(<Spinner className="h-8 w-8" />);
    expect(container.firstChild).toHaveClass("h-8", "w-8");
  });
});

describe("Badge", () => {
  it("renders with variants", () => {
    render(<Badge variant="success">ok</Badge>);
    render(<Badge variant="warning">warn</Badge>);
    render(<Badge variant="error">err</Badge>);
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});

describe("useNavRoute", () => {
  it("useRoute hook can be invoked", async () => {
    const { useRoute } = await import("@/hooks/useNavRoute");
    const { result } = renderHook(() => useRoute("z1", "z3", false), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});

describe("useIncidents", () => {
  it("useReportIncident mutation is creatable", async () => {
    const { useReportIncident } = await import("@/hooks/useIncidents");
    const { result } = renderHook(() => useReportIncident(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
    expect(result.current.mutate).toBeDefined();
  });
});

describe("markdownComponents", () => {
  it("all component functions are callable", async () => {
    const { mdComponents } = await import("@/components/ui/markdownComponents");
    const { container: c1 } = render(React.createElement(mdComponents.p!, {}, "para"));
    expect(c1.textContent).toBe("para");
    const { container: c2 } = render(React.createElement(mdComponents.strong!, {}, "bold"));
    expect(c2.textContent).toBe("bold");
    const { container: c3 } = render(React.createElement(mdComponents.li!, {}, "item"));
    expect(c3.textContent).toBe("item");
  });
});
