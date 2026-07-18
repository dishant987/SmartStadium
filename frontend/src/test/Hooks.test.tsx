import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock the apiClient service
vi.mock("@/services/apiClient", () => ({
  apiClient: vi.fn(),
}));

import { apiClient } from "@/services/apiClient";
import { useCrowdDensity } from "@/hooks/useCrowdDensity";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useStations, useSustainabilityTip } from "@/hooks/useSustainability";

// Create a wrapper helper for TanStack query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("React Hooks Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useCrowdDensity fetches and returns crowd density data", async () => {
    const mockData = [
      { id: "z1", name: "Main Stand", density: 0.72, capacity: 25000 },
    ];
    vi.mocked(apiClient).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCrowdDensity(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient).toHaveBeenCalledWith("/ops/crowd-density");
  });

  it("useRecommendations fetches and returns decision support data", async () => {
    const mockData = [
      { id: "rec-1", type: "crowd", title: "Open Gate D", description: "High density", priority: "high" },
    ];
    vi.mocked(apiClient).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRecommendations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient).toHaveBeenCalledWith("/ops/recommendations");
  });

  it("useStations fetches recycling stations list", async () => {
    const mockData = {
      stations: [{ id: "rs1", location: "Gate A", types: ["plastic"] }],
    };
    vi.mocked(apiClient).mockResolvedValue(mockData);

    const { result } = renderHook(() => useStations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient).toHaveBeenCalledWith("/sustainability/stations");
  });

  it("useSustainabilityTip fetches the green eco-tips", async () => {
    const mockData = { tip: "Use reusable bottle", source: "static" };
    vi.mocked(apiClient).mockResolvedValue(mockData);

    const { result } = renderHook(() => useSustainabilityTip(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(apiClient).toHaveBeenCalledWith("/sustainability/tip");
  });
});
