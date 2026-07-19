import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/services/apiClient";

vi.mock("@/services/apiClient", () => ({
  apiClient: vi.fn(),
  apiStream: vi.fn(),
}));

const mockData = { id: "1" };
beforeEach(() => { vi.mocked(apiClient).mockReset(); vi.mocked(apiClient).mockResolvedValue(mockData); });

describe("apiClient", () => {
  it("is mockable", async () => {
    const res = await apiClient("/test");
    expect(res).toEqual(mockData);
  });
});

describe("crowdDensity", () => {
  it("fetchCrowdDensity calls /ops/crowd-density", async () => {
    const { fetchCrowdDensity } = await import("@/services/crowdDensity");
    const res = await fetchCrowdDensity();
    expect(apiClient).toHaveBeenCalledWith("/ops/crowd-density");
    expect(res).toEqual(mockData);
  });
});

describe("recommendations", () => {
  it("fetchRecommendations calls /ops/recommendations", async () => {
    const { fetchRecommendations } = await import("@/services/recommendations");
    const res = await fetchRecommendations();
    expect(apiClient).toHaveBeenCalledWith("/ops/recommendations");
    expect(res).toEqual(mockData);
  });
});

describe("incidents", () => {
  it("fetchIncidents calls /ops/incidents", async () => {
    const { fetchIncidents } = await import("@/services/incidents");
    await fetchIncidents();
    expect(apiClient).toHaveBeenCalledWith("/ops/incidents");
  });

  it("reportIncident POSTs to /ops/incidents", async () => {
    const { reportIncident } = await import("@/services/incidents");
    await reportIncident({ severity: "high", category: "test", description: "x", location: "z1" });
    expect(apiClient).toHaveBeenCalledWith("/ops/incidents", { method: "POST", body: JSON.stringify({ severity: "high", category: "test", description: "x", location: "z1" }) });
  });
});

describe("navigation", () => {
  it("fetchVenueMap calls /nav/venue-map", async () => {
    const { fetchVenueMap } = await import("@/services/navigation");
    await fetchVenueMap();
    expect(apiClient).toHaveBeenCalledWith("/nav/venue-map");
  });

  it("fetchRoute POSTs to /nav/route", async () => {
    const { fetchRoute } = await import("@/services/navigation");
    await fetchRoute("z1", "z2", true);
    expect(apiClient).toHaveBeenCalledWith("/nav/route", { method: "POST", body: JSON.stringify({ from_zone: "z1", to_zone: "z2", accessible: true }) });
  });
});

describe("wayfinding", () => {
  it("fetchWayfinding POSTs to /nav/wayfinding", async () => {
    const { fetchWayfinding } = await import("@/services/wayfinding");
    await fetchWayfinding({ from_zone: "z1", to_zone: "z2", accessible: true, wheelchair: false, language: "en" });
    expect(apiClient).toHaveBeenCalledWith("/nav/wayfinding", { method: "POST", body: JSON.stringify({ from_zone: "z1", to_zone: "z2", accessible: true, wheelchair: false, language: "en" }) });
  });
});

describe("sustainability", () => {
  it("fetchStations calls /sustainability/stations", async () => {
    const { fetchStations } = await import("@/services/sustainability");
    await fetchStations();
    expect(apiClient).toHaveBeenCalledWith("/sustainability/stations");
  });

  it("fetchTip calls /sustainability/tip", async () => {
    const { fetchTip } = await import("@/services/sustainability");
    await fetchTip();
    expect(apiClient).toHaveBeenCalledWith("/sustainability/tip");
  });
});

describe("transport", () => {
  it("fetchTransportStatus calls /transport/status", async () => {
    const { fetchTransportStatus } = await import("@/services/transport");
    await fetchTransportStatus();
    expect(apiClient).toHaveBeenCalledWith("/transport/status");
  });
});

describe("waitTimes", () => {
  it("fetchWaitTimes POSTs to /ops/wait-times", async () => {
    const { fetchWaitTimes } = await import("@/services/waitTimes");
    await fetchWaitTimes({ zone: "z1", match_minute: 30, match_status: "first_half" });
    expect(apiClient).toHaveBeenCalledWith("/ops/wait-times", { method: "POST", body: JSON.stringify({ zone: "z1", match_minute: 30, match_status: "first_half" }) });
  });
});

describe("analytics", () => {
  it("fetchPostMatchAnalytics calls /analytics/post-match", async () => {
    const { fetchPostMatchAnalytics } = await import("@/services/analytics");
    await fetchPostMatchAnalytics();
    expect(apiClient).toHaveBeenCalledWith("/analytics/post-match");
  });
});

describe("pa", () => {
  it("createPAAnnouncement POSTs to /pa/announce", async () => {
    const { createPAAnnouncement } = await import("@/services/pa");
    await createPAAnnouncement({ type: "general", severity: "low", message: "test", gate: "A", languages: ["en"], broadcast: false });
    expect(apiClient).toHaveBeenCalledWith("/pa/announce", { method: "POST", body: JSON.stringify({ type: "general", severity: "low", message: "test", gate: "A", languages: ["en"], broadcast: false }) });
  });

  it("fetchPALog calls /pa/log", async () => {
    const { fetchPALog } = await import("@/services/pa");
    await fetchPALog();
    expect(apiClient).toHaveBeenCalledWith("/pa/log");
  });
});

describe("chat", () => {
  it("fetchSessions calls /chat/sessions", async () => {
    const { fetchSessions } = await import("@/services/chat");
    await fetchSessions();
    expect(apiClient).toHaveBeenCalledWith("/chat/sessions");
  });

  it("fetchSessionMessages calls /chat/sessions/:id/messages", async () => {
    const { fetchSessionMessages } = await import("@/services/chat");
    await fetchSessionMessages("s1");
    expect(apiClient).toHaveBeenCalledWith("/chat/sessions/s1/messages");
  });

  it("createSession POSTs to /chat/sessions", async () => {
    const { createSession } = await import("@/services/chat");
    await createSession();
    expect(apiClient).toHaveBeenCalledWith("/chat/sessions", { method: "POST" });
  });

  it("deleteSession DELETEs /chat/sessions/:id", async () => {
    const { deleteSession } = await import("@/services/chat");
    await deleteSession("s1");
    expect(apiClient).toHaveBeenCalledWith("/chat/sessions/s1", { method: "DELETE" });
  });

  it("sendMessage POSTs to /chat", async () => {
    const { sendMessage } = await import("@/services/chat");
    await sendMessage("s1", "hello");
    expect(apiClient).toHaveBeenCalledWith("/chat", { method: "POST", body: JSON.stringify({ session_id: "s1", message: "hello" }) });
  });
});

describe("volunteer", () => {
  it("fetchVolunteerDashboard calls /volunteer/dashboard", async () => {
    const { fetchVolunteerDashboard } = await import("@/services/volunteer");
    await fetchVolunteerDashboard();
    expect(apiClient).toHaveBeenCalledWith("/volunteer/dashboard");
  });

  it("fetchVolunteers calls /volunteer/volunteers", async () => {
    const { fetchVolunteers } = await import("@/services/volunteer");
    await fetchVolunteers();
    expect(apiClient).toHaveBeenCalledWith("/volunteer/volunteers");
  });

  it("fetchVolunteers with role adds query param", async () => {
    const { fetchVolunteers } = await import("@/services/volunteer");
    await fetchVolunteers("gate_ops");
    expect(apiClient).toHaveBeenCalledWith("/volunteer/volunteers?role=gate_ops");
  });

  it("createVolunteer POSTs to /volunteer/volunteers", async () => {
    const { createVolunteer } = await import("@/services/volunteer");
    await createVolunteer({ name: "A", role: "gate_ops" });
    expect(apiClient).toHaveBeenCalledWith("/volunteer/volunteers", { method: "POST", body: JSON.stringify({ name: "A", role: "gate_ops" }) });
  });

  it("updateVolunteerStatus PATCHes /volunteer/volunteers/:id", async () => {
    const { updateVolunteerStatus } = await import("@/services/volunteer");
    await updateVolunteerStatus("v1", { status: "on_shift" });
    expect(apiClient).toHaveBeenCalledWith("/volunteer/volunteers/v1", { method: "PATCH", body: JSON.stringify({ status: "on_shift" }) });
  });

  it("fetchTasks calls /volunteer/tasks", async () => {
    const { fetchTasks } = await import("@/services/volunteer");
    await fetchTasks();
    expect(apiClient).toHaveBeenCalledWith("/volunteer/tasks");
  });

  it("updateTask PATCHes /volunteer/tasks/:id", async () => {
    const { updateTask } = await import("@/services/volunteer");
    await updateTask("t1", { status: "completed" });
    expect(apiClient).toHaveBeenCalledWith("/volunteer/tasks/t1", { method: "PATCH", body: JSON.stringify({ status: "completed" }) });
  });
});
