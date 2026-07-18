import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
// Mock the apiClient service
vi.mock("@/services/apiClient", () => ({
  apiClient: vi.fn(),
}));

import { apiClient } from "@/services/apiClient";
import { AccessibilityPanel } from "@/components/accessibility/AccessibilityPanel";

describe("AccessibilityPanel Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props and fetches elevator statuses", async () => {
    const mockElevators = [
      { elevator_id: "e1", elevator_name: "Elevator North", status: "operational", note: "Operational" },
      { elevator_id: "e2", elevator_name: "Elevator South", status: "out_of_service", note: "Out of service" },
    ];
    vi.mocked(apiClient).mockResolvedValue(mockElevators);

    const onToggle = vi.fn();
    const onToggleText = vi.fn();

    render(
      <AccessibilityPanel
        accessibleMode={false}
        onToggle={onToggle}
        largeText={false}
        onToggleText={onToggleText}
      />
    );

    // Checks header
    expect(screen.getByText("Accessibility")).toBeInTheDocument();

    // Wait for the mock API data to render
    await waitFor(() => {
      expect(screen.getByText("Elevator North")).toBeInTheDocument();
    });
    expect(screen.getByText("Elevator South")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("Out")).toBeInTheDocument();
  });

  it("calls trigger callbacks on button clicks", async () => {
    vi.mocked(apiClient).mockResolvedValue([]);

    const onToggle = vi.fn();
    const onToggleText = vi.fn();

    render(
      <AccessibilityPanel
        accessibleMode={false}
        onToggle={onToggle}
        largeText={false}
        onToggleText={onToggleText}
      />
    );

    const routesBtn = screen.getByRole("button", { name: /Routes/i });
    const textBtn = screen.getByRole("button", { name: /Text/i });

    await userEvent.click(routesBtn);
    expect(onToggle).toHaveBeenCalledOnce();

    await userEvent.click(textBtn);
    expect(onToggleText).toHaveBeenCalledOnce();
  });

  it("loads AI route on request", async () => {
    vi.mocked(apiClient).mockImplementation(async (path) => {
      if (path === "/accessibility/status") {
        return [];
      }
      if (path === "/accessibility/ai-route") {
        return {
          from_name: "Parking Lot A",
          to_name: "Main Stand",
          steps: [],
          total_distance_m: 200,
          estimated_time_min: 3,
          ai_summary: "Take the direct ramp and Elevator A1 for step-free access.",
          warnings: ["None"],
        };
      }
      return [];
    });

    render(
      <AccessibilityPanel
        accessibleMode={true}
        onToggle={vi.fn()}
        largeText={false}
        onToggleText={vi.fn()}
      />
    );

    const aiBtn = await screen.findByRole("button", { name: /AI route from Lot A/i });
    await userEvent.click(aiBtn);

    // AI summary should show up
    await waitFor(() => {
      expect(screen.getByText("Take the direct ramp and Elevator A1 for step-free access.")).toBeInTheDocument();
    });
    expect(screen.getByText("200m · 3 min")).toBeInTheDocument();
  });
});
