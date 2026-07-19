import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/services/apiClient", () => ({ apiClient: vi.fn(), apiStream: vi.fn() }));
vi.mock("@/components/navigation/Navbar", () => ({ Navbar: () => <nav data-testid="navbar">Navbar</nav> }));
vi.mock("@/components/navigation/Footer", () => ({ Footer: () => <footer data-testid="footer">Footer</footer> }));
vi.mock("@/components/interactive/InteractiveFootball", () => ({ InteractiveFootball: () => <div data-testid="football">Football</div> }));
vi.mock("@/components/dashboard/CrowdDensityWidget", () => ({ CrowdDensityWidget: () => <div data-testid="crowd-density" /> }));
vi.mock("@/components/dashboard/IncidentFeed", () => ({ IncidentFeed: () => <div data-testid="incident-feed" /> }));
vi.mock("@/components/dashboard/DecisionSupportPanel", () => ({ DecisionSupportPanel: () => <div data-testid="decision-support" /> }));
vi.mock("@/components/navigation/VenueMap", () => ({ VenueMap: () => <div data-testid="venue-map" /> }));
vi.mock("@/components/transport/TransitWidget", () => ({ TransitWidget: () => <div data-testid="transit-widget" /> }));
vi.mock("@/components/accessibility/AccessibilityPanel", () => ({ AccessibilityPanel: () => <div data-testid="accessibility" /> }));
vi.mock("@/components/sustainability/SustainabilityWidget", () => ({ SustainabilityWidget: () => <div data-testid="sustainability" /> }));
vi.mock("@/components/waittimes/WaitTimeWidget", () => ({ WaitTimeWidget: () => <div data-testid="wait-time" /> }));
vi.mock("@/components/chat/ChatSidebar", () => ({ ChatSidebar: () => <div data-testid="chat-sidebar" /> }));
vi.mock("@/components/chat/ChatMessages", () => ({ ChatMessages: () => <div data-testid="chat-messages" /> }));
vi.mock("@/components/chat/ChatInput", () => ({ ChatInput: () => <div data-testid="chat-input" /> }));
vi.mock("@/context/AuthContext", () => ({ AuthProvider: ({ children }: any) => children, useAuth: () => ({ user: null, loading: false }) }));

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
function wrap(ui: React.ReactElement) {
  return render(<QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>);
}

describe("Edge cases", () => {
  it("Landing renders without auth", async () => {
    const { Landing } = await import("@/pages/Landing");
    wrap(<Landing />);
    await waitFor(() => expect(screen.getByText(/FIFA World Cup 2026/i)).toBeInTheDocument());
  });

  it("Login page renders", async () => {
    const { LoginPage } = await import("@/pages/LoginPage");
    wrap(<LoginPage />);
    expect(screen.getByPlaceholderText("you@domain.com")).toBeInTheDocument();
  });

  it("Check for skip navigation link", async () => {
    const App = (await import("@/App")).default;
    render(App());
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });
});
