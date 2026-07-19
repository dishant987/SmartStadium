import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/services/apiClient", () => ({ apiClient: vi.fn(), apiStream: vi.fn() }));
vi.mock("@/services/volunteer", () => ({ fetchVolunteerDashboard: vi.fn(), createVolunteer: vi.fn(), updateVolunteerStatus: vi.fn(), updateTask: vi.fn() }));
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
vi.mock("@/components/evacuation/SimulationCanvas", () => ({ SimulationCanvas: () => <div data-testid="sim-canvas" /> }));
vi.mock("@/components/evacuation/ControlPanel", () => ({ ControlPanel: () => <div data-testid="control-panel" /> }));
vi.mock("@/components/evacuation/EnvironmentPanel", () => ({ EnvironmentPanel: () => <div data-testid="env-panel" /> }));
vi.mock("@/components/evacuation/MetricsPanel", () => ({ MetricsPanel: () => <div data-testid="metrics-panel" /> }));
vi.mock("@/components/evacuation/ResponderLog", () => ({ ResponderLog: () => <div data-testid="responder-log" /> }));
vi.mock("@/components/ui/Badge", () => ({ Badge: ({ children }: any) => <span data-testid="badge">{children}</span> }));
vi.mock("@/components/ui/Button", () => ({ Button: ({ children, onClick, disabled, type }: any) => <button data-testid="button" onClick={onClick} disabled={disabled} type={type || "button"}>{children}</button> }));
vi.mock("@/components/ui/Input", () => ({ Input: ({ label, placeholder, value, onChange, type }: any) => <div><label>{label}</label><input data-testid="input" placeholder={placeholder} value={value} onChange={onChange} type={type || "text"} /></div> }));
vi.mock("@/components/ui/Card", () => ({ Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div> }));
vi.mock("@/components/ui/Spinner", () => ({ Spinner: () => <span data-testid="spinner" /> }));
vi.mock("@/components/ui/Skeleton", () => ({ Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className} /> }));

import { apiClient } from "@/services/apiClient";
import { fetchVolunteerDashboard } from "@/services/volunteer";

let currentAuth: any = { user: { id: "1", name: "Test User", email: "test@test.com" }, loading: false, login: vi.fn(), register: vi.fn(), logout: vi.fn() };
vi.mock("@/context/AuthContext", () => ({ AuthProvider: ({ children }: any) => children, useAuth: () => currentAuth }));
vi.mock("@/hooks/useChatSessions", () => ({ useChatSessions: () => ({ data: [], isLoading: false }), useSessionMessages: () => ({ data: [], isLoading: false }), useCreateSession: () => ({ mutateAsync: vi.fn() }), useDeleteSession: () => ({ mutate: vi.fn() }) }));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function wrap(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  currentAuth = { user: { id: "1", name: "Test User", email: "test@test.com" }, loading: false, login: vi.fn(), register: vi.fn(), logout: vi.fn() };
});

describe("Pages", () => {
  it("Landing renders hero section", async () => {
    const { Landing } = await import("@/pages/Landing");
    wrap(<Landing />);
    expect(screen.getByText(/FIFA World Cup 2026/i)).toBeInTheDocument();
  });

  it("LoginPage renders login form when no user", async () => {
    currentAuth = { user: null, loading: false, login: vi.fn(), register: vi.fn(), logout: vi.fn() };
    const { LoginPage } = await import("@/pages/LoginPage");
    wrap(<LoginPage />);
    expect(screen.getByPlaceholderText("you@domain.com")).toBeInTheDocument();
  });

  it("ProfilePage renders user info", async () => {
    const { ProfilePage } = await import("@/pages/ProfilePage");
    wrap(<ProfilePage />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@test.com")).toBeInTheDocument();
  });

  it("WayfindingPage renders zone selection", async () => {
    vi.mocked(apiClient).mockResolvedValue({ steps: [], total_distance_m: 0, accessible: false, from_name: "", to_name: "", estimated_time_min: 0, accessibility_summary: "", wheelchair_alternative: "" });
    const { WayfindingPage } = await import("@/pages/WayfindingPage");
    wrap(<WayfindingPage />);
    expect(screen.getByText("Smart Wayfinding")).toBeInTheDocument();
  });

  it("PAPage renders broadcast form", async () => {
    vi.mocked(apiClient).mockResolvedValue({ announcements: [], total: 0 });
    const { PAPage } = await import("@/pages/PAPage");
    wrap(<PAPage />);
    expect(screen.getByText("Emergency PA System")).toBeInTheDocument();
  });

  it("AnalyticsPage renders with data", async () => {
    vi.mocked(apiClient).mockResolvedValue({
      match_name: "FIFA Final", date: "2026-07-19", metrics: [], peak_times: [], gate_stats: [],
      narrative: { executive_summary: "Great match", crowd_analysis: "", gate_performance: "", transit_impact: "", recommendations: [] },
      crowd_timeline: [],
    });
    const { AnalyticsPage } = await import("@/pages/AnalyticsPage");
    wrap(<AnalyticsPage />);
    await waitFor(() => expect(screen.getByText("FIFA Final")).toBeInTheDocument());
  });

  it("VolunteerPage renders dashboard", async () => {
    vi.mocked(fetchVolunteerDashboard).mockResolvedValue({ total: 10, on_shift: 5, available: 3, active_tasks: 2, volunteers: [], tasks: [] });
    const { VolunteerPage } = await import("@/pages/VolunteerPage");
    wrap(<VolunteerPage />);
    await waitFor(() => expect(screen.getByText("10")).toBeInTheDocument());
  });

  it("VolunteerRegisterPage renders registration form", async () => {
    const { VolunteerRegisterPage } = await import("@/pages/VolunteerRegisterPage");
    wrap(<VolunteerRegisterPage />);
    expect(screen.getByPlaceholderText(/Alex Johnson/i)).toBeInTheDocument();
  });

  it("EvacuationPage renders simulator", async () => {
    const { EvacuationPage } = await import("@/pages/EvacuationPage");
    wrap(<EvacuationPage />);
    expect(screen.getByText("Crowd Evacuation Simulator")).toBeInTheDocument();
  });

  it("ChatPage renders chat UI", async () => {
    vi.mocked(apiClient).mockResolvedValue([]);
    const { ChatPage } = await import("@/pages/ChatPage");
    wrap(<ChatPage />);
    expect(screen.getByText(/How can I assist/i)).toBeInTheDocument();
  });
});
