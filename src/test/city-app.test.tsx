import { act, cleanup, configure, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { DISTRICTS } from "@/city/data/districts";
import { characterAlt, characterImage } from "@/city/character";
import { STORAGE_ACCOUNTS, expectedAction, recommendTier, COST_RESOURCES } from "@/city/missions/logic";
import { STORAGE_KEY } from "@/city/state/game-state";

vi.mock("@emailjs/browser", () => ({ default: { send: vi.fn() } }));
vi.setConfig({ testTimeout: 60000 });
configure({ asyncUtilTimeout: 10000 });

const mockMedia = (reduced: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduced : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
};

const stored = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");

const openMap = async () => {
  fireEvent.click(await screen.findByRole("button", { name: /Enter Saran City/ }));
  return await screen.findByRole("heading", { name: "Choose a district" });
};

const enterDistrict = async (name: string) => {
  const marker = await screen.findByRole("button", { name: new RegExp(`^${name}, district`) });
  fireEvent.click(marker);
  return await screen.findByRole("heading", { level: 1, name });
};

const loaded = async () => {
  await waitFor(() => expect(screen.queryByText("Loading mission...")).not.toBeInTheDocument());
};

const startMission = async (title: string, index = 0) => {
  fireEvent.click(screen.getAllByRole("button", { name: /Start mission|Replay mission/ })[index]);
  const heading = await screen.findByRole("heading", { level: 1, name: title });
  await loaded();
  return heading;
};

beforeEach(() => {
  mockMedia(true);
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("start screen", () => {
  it("opens on the cinematic title with every required menu option and Recruiter Mode", async () => {
    mockMedia(false);
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1, name: "SARAN CITY" })).toBeInTheDocument();
    expect(screen.getByText("SARAN.OS PRESENTS")).toBeInTheDocument();
    expect(screen.getByText("THE ENGINEERING CHRONICLES")).toBeInTheDocument();
    expect(screen.getByText(/Every system has a story. Explore mine./)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: characterAlt }).getAttribute("src")).toBe(characterImage);
    expect(screen.getByRole("button", { name: /Skip intro/ })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Recruiter Mode/ }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Skip intro/ }));
    expect(screen.getAllByRole("button", { name: /Recruiter Mode/ })).toHaveLength(1);
    const menu = screen.getByRole("navigation", { name: "Main menu" });
    expect(within(menu).getByRole("button", { name: /Start your journey/ })).toBeInTheDocument();
    expect(within(menu).getByRole("button", { name: /Enter Saran City/ })).toBeInTheDocument();
    expect(within(menu).getByRole("button", { name: /Recruiter Mode/ })).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: /Download resume/ })).toHaveAttribute("href", "/resume.pdf");
    expect(screen.queryByText(/sound settings/i)).not.toBeInTheDocument();
    expect(stored().introSeen).toBe(true);
  });

  it("goes through the player profile to the map", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /Start your journey/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "SARAN S." })).toBeInTheDocument();
    expect(screen.getByText("DATA PLATFORM ENGINEER | AI & CLOUD")).toBeInTheDocument();
    expect(screen.getByText(/CHENNAI, INDIA/)).toBeInTheDocument();
    ["Azure Data Engineering", "Databricks", "Microsoft Fabric", "Cloud Platform Engineering", "Infrastructure Automation", "AI Engineering"].forEach((item) => expect(screen.getByText(item)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Enter Saran City/ }));
    expect(await screen.findByRole("heading", { name: "Choose a district" })).toBeInTheDocument();
  });
});

describe("world map and districts", () => {
  it("shows six district markers and the persistent navigation", async () => {
    render(<App />);
    await openMap();
    DISTRICTS.forEach((district) => expect(screen.getByRole("button", { name: new RegExp(`^${district.name}, district ${district.number}`) })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Recruiter Mode/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download resume" })).toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByRole("button", { name: /^Data Docks, district/ }));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Mission: BUILD THE DATA PIPELINE");
  });

  it("navigates into every district, shows its content, and discovers it once", async () => {
    render(<App />);
    await openMap();
    for (const district of DISTRICTS) {
      await enterDistrict(district.name);
      district.specialties.forEach((item) => expect(screen.getAllByText(item).length).toBeGreaterThan(0));
      expect(screen.getByRole("heading", { name: `Mission: ${district.missionHeadline}` })).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /View case study|Read again/ }).length).toBe(district.projectIds.length);
      fireEvent.click(screen.getAllByRole("button", { name: "Map" })[0]);
      await screen.findByRole("heading", { name: "Choose a district" });
    }
    expect(stored().discovered).toHaveLength(6);
    expect(screen.getByText(/6 of 6 discovered/)).toBeInTheDocument();
  });

  it("opens a real case study from a district and awards XP once", async () => {
    render(<App />);
    await openMap();
    await enterDistrict("Operations HQ");
    fireEvent.click(screen.getByRole("button", { name: /View case study/ }));
    expect(await screen.findByRole("dialog")).toHaveAccessibleName("Operational Health & Cost Intelligence");
    expect(stored().projects).toEqual(["operational-health"]);
  });
});

describe("Recruiter Mode", () => {
  it("is available on every screen and shows the full portfolio", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /Recruiter Mode/ }));
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("I build data platforms.");
    expect(screen.getByRole("link", { name: "Download Resume" })).toHaveAttribute("href", "/resume.pdf");
    expect(screen.getByRole("heading", { name: /Work I can/ })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Contact Saran" })).toBeInTheDocument();
    expect(screen.getByText("Microsoft Certified: Azure Administrator Associate (AZ-104)")).toBeInTheDocument();
    expect(window.location.search).toBe("?mode=recruiter");
  });

  it("opens directly from the URL without playing the game", async () => {
    window.history.replaceState(null, "", "/?mode=recruiter");
    render(<App />);
    expect(await screen.findByRole("link", { name: "Download Resume" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "SARAN CITY" })).not.toBeInTheDocument();
  });

  it("keeps the player's place when switching modes and back", async () => {
    render(<App />);
    await openMap();
    await enterDistrict("Cloud Heights");
    fireEvent.click(screen.getByRole("button", { name: /Recruiter Mode/ }));
    await screen.findByRole("link", { name: "Download Resume" });
    fireEvent.click(screen.getByRole("button", { name: /Explore Saran City/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Cloud Heights" })).toBeInTheDocument();
    expect(window.location.search).toBe("");
  });
});

describe("missions", () => {
  it("Mission 01: builds the pipeline by connecting components in order", async () => {
    render(<App />);
    await openMap();
    await enterDistrict("Data Docks");
    await startMission("Build the Data Pipeline");
    const connect = (from: string, to: string) => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${from}`) }));
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^Connect from ${from}`) }));
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${to}`) }));
    };
    connect("Source Systems", "Azure Databricks");
    expect(screen.getAllByText(/feeds Azure Data Factory next/).length).toBeGreaterThan(0);
    connect("Source Systems", "Azure Data Factory");
    connect("Azure Data Factory", "ADLS Gen2");
    connect("ADLS Gen2", "Azure Databricks");
    connect("Azure Databricks", "Delta Lake");
    expect(screen.queryByText(/Pipeline complete/)).not.toBeInTheDocument();
    connect("Delta Lake", "Microsoft Fabric");
    expect(await screen.findByText(/Pipeline complete/)).toBeInTheDocument();
    await waitFor(() => expect(stored().missions).toContain("pipeline"));
    expect(screen.getByText("MISSION COMPLETE")).toBeInTheDocument();
    expect(await screen.findByText("Data Explorer")).toBeInTheDocument();
  });

  it("Mission 02: finds the unallocated cost without calling it a saving", async () => {
    render(<App />);
    await openMap();
    await enterDistrict("Operations HQ");
    await startMission("Investigate the Platform");
    expect(screen.getByText(/not a saving/)).toBeInTheDocument();
    COST_RESOURCES.filter((resource) => !resource.product).forEach((resource) => {
      const row = screen.getByText(resource.id).closest("tr") as HTMLElement;
      fireEvent.click(within(row).getByRole("button", { name: "Flag" }));
    });
    ["Source data", "SQL processing", "Cost mapping"].forEach((step) => fireEvent.click(screen.getByRole("button", { name: new RegExp(step) })));
    fireEvent.click(screen.getByLabelText(/renamed and the product mapping/));
    fireEvent.click(screen.getByLabelText(/Shared platform services/));
    fireEvent.click(screen.getByLabelText(/without a product tag/));
    fireEvent.click(screen.getByLabelText(/A saving was realized/));
    fireEvent.click(screen.getByRole("button", { name: "Submit findings" }));
    expect(screen.getByText(/Check the selected causes/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/A saving was realized/));
    fireEvent.click(screen.getByRole("button", { name: "Submit findings" }));
    await waitFor(() => expect(stored().missions).toContain("cost"));
    expect(screen.getByText(/Nothing here is a saving/)).toBeInTheDocument();
  });

  it("Mission 03: needs verification, then validates the supported hypothesis", async () => {
    render(<App />);
    await openMap();
    await enterDistrict("Neon AI Labs");
    await startMission("AI Incident Intelligence");
    fireEvent.click(screen.getByRole("button", { name: /Telemetry/, current: false }));
    fireEvent.click(screen.getAllByRole("button", { name: /AuthorizationPermissionMismatch on \/bronze\/orders/ })[0]);
    fireEvent.click(screen.getByRole("button", { name: /KQL analysis/ }));
    fireEvent.click(screen.getAllByRole("button", { name: "Run query" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Run query" })[1]);
    fireEvent.click(screen.getByRole("button", { name: /AI hypotheses/ }));
    expect(screen.getByText(/unverified and need an engineer/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Validate/ }));
    fireEvent.click(screen.getByLabelText(/throttling requests/));
    fireEvent.click(screen.getByRole("button", { name: "Validate hypothesis" }));
    expect(screen.getByText(/contradict this hypothesis/)).toBeInTheDocument();
    expect(stored().missions ?? []).not.toContain("incident");
    fireEvent.click(screen.getByLabelText(/role assignment change/));
    fireEvent.click(screen.getByRole("button", { name: "Validate hypothesis" }));
    await waitFor(() => expect(stored().missions).toContain("incident"));
    expect(screen.getByText(/confirmed against the raw logs/)).toBeInTheDocument();
  });

  it("Mission 04: assesses synthetic storage accounts", async () => {
    render(<App />);
    await openMap();
    await enterDistrict("Cloud Heights");
    await startMission("Azure Storage Modernization");
    const check = screen.getByRole("button", { name: "Check assessment" });
    expect(check).toBeDisabled();
    STORAGE_ACCOUNTS.forEach((account) => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(account.name) }));
      fireEvent.change(screen.getByLabelText(`Tier for ${account.name}`), { target: { value: "Hot" } });
      fireEvent.change(screen.getByLabelText(`Modernization for ${account.name}`), { target: { value: "Keep as is" } });
    });
    fireEvent.click(check);
    expect(screen.getByText(/Some rows need another look/)).toBeInTheDocument();
    STORAGE_ACCOUNTS.forEach((account) => {
      fireEvent.change(screen.getByLabelText(`Tier for ${account.name}`), { target: { value: recommendTier(account.daysSinceAccess) } });
      fireEvent.change(screen.getByLabelText(`Modernization for ${account.name}`), { target: { value: expectedAction(account) } });
    });
    fireEvent.click(check);
    await waitFor(() => expect(stored().missions).toContain("storage"));
    expect(screen.getByText(/Assessment confirmed/)).toBeInTheDocument();
  });

  it("Mission 05: runs the PIM workflow and produces an audit report", async () => {
    render(<App />);
    await openMap();
    await enterDistrict("Automation Works");
    await startMission("PIM Automation");
    ["User identity", "Authentication", "Eligible assignments", "Role discovery", "Activation workflow", "Audit report"].forEach((stage) => {
      fireEvent.click(within(screen.getByRole("list", { name: "Workflow stages" })).getByRole("button", { name: new RegExp(stage) }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Request activation" }));
    expect(screen.getByText(/justification of at least 12 characters/)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Why is this access needed?"), { target: { value: "Investigate a failed pipeline run" } });
    fireEvent.click(screen.getByRole("button", { name: "Request activation" }));
    expect(screen.getByText(/Activated: Within policy/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Generate report" }));
    await waitFor(() => expect(stored().missions).toContain("pim"));
    expect(screen.getByText("Blocked")).toBeInTheDocument();
    expect(screen.getByText("Activated")).toBeInTheDocument();
  });

  it("Mission 06: traces authorized and failing requests", async () => {
    render(<App />);
    await openMap();
    await enterDistrict("Neon AI Labs");
    await startMission("Copilot and MCP", 1);
    fireEvent.click(screen.getByRole("button", { name: "Send request" }));
    expect(await screen.findByText(/Request succeeded/)).toBeInTheDocument();
    expect(stored().missions ?? []).not.toContain("mcp");
    fireEvent.click(screen.getByLabelText(/Missing scope/));
    fireEvent.click(screen.getByRole("button", { name: "Send request" }));
    expect(await screen.findByText(/Request stopped: 403/)).toBeInTheDocument();
    await waitFor(() => expect(stored().missions).toContain("mcp"));
  });

  it("HQ: reading the whole dossier completes the mission and the journey badge needs everything", async () => {
    render(<App />);
    await openMap();
    await enterDistrict("Saran's Headquarters");
    await startMission("Meet the Engineer");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("How I work");
    ["Experience", "Credentials", "Contact"].forEach((tab) => fireEvent.click(screen.getByRole("tab", { name: tab })));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("saransivakumar.work@gmail.com");
    await waitFor(() => expect(stored().missions).toContain("engineer"));
    expect(screen.queryByText("ENGINEERING JOURNEY COMPLETE")).not.toBeInTheDocument();
  });
});

describe("progress", () => {
  it("persists across reloads and resets on request", async () => {
    const first = render(<App />);
    await openMap();
    await enterDistrict("Operations HQ");
    await waitFor(() => expect(stored().discovered).toEqual(["operations-hq"]));
    first.unmount();

    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /Enter Saran City/ }));
    await screen.findByRole("heading", { name: "Choose a district" });
    expect(screen.getByText(/1 of 6 discovered/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Progress:/ }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/not a measure of professional skill/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Reset progress" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Yes, reset" }));
    await waitFor(() => expect(stored().discovered).toEqual([]));
    act(() => undefined);
  });
});
