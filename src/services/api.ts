import { PhishingScan, MalwareScan, NetworkEvent, ThreatItem, SecurityAlert, DashboardSummary } from "../types";

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const url = "/api/dashboard/summary";
  console.log("Fetching dashboard summary from:", url);
  const res = await fetch(url, { headers: getHeaders() });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON for dashboard summary. Response body:", text);
    throw new Error("Invalid JSON response from server");
  }
  if (!json.success) throw new Error(json.error?.message || "Failed to fetch dashboard summary");
  return json.data;
}

export async function analyzePhishingUrl(url: string): Promise<PhishingScan> {
  const res = await fetch("/api/phishing/analyze", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ url }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Phishing analysis failed");
  return json.data;
}

export async function fetchPhishingHistory(): Promise<PhishingScan[]> {
  const res = await fetch("/api/phishing/history", { headers: getHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to fetch history");
  return json.data;
}

export async function scanMalwareFile(filename: string, fileContent?: string): Promise<MalwareScan> {
  const res = await fetch("/api/malware/scan", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ filename, fileContent }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Malware scan failed");
  return json.data;
}

export async function fetchMalwareHistory(): Promise<MalwareScan[]> {
  const res = await fetch("/api/malware/history", { headers: getHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to fetch malware history");
  return json.data;
}

export async function fetchNetworkEvents(): Promise<NetworkEvent[]> {
  const url = "/api/network/events";
  console.log("Fetching network events from:", url);
  try {
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const text = await res.text();
    console.log("Network events response text:", text);
    const json = JSON.parse(text);
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch network events");
    return json.data;
  } catch (err) {
    console.error("Error in fetchNetworkEvents:", err);
    throw err;
  }
}

export async function fetchNetworkSummary(): Promise<any> {
  const res = await fetch("/api/network/summary", { headers: getHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to fetch network summary");
  return json.data;
}

export async function fetchThreatIntel(): Promise<ThreatItem[]> {
  const res = await fetch("/api/threat-intelligence", { headers: getHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to fetch threat intelligence");
  return json.data;
}

export async function refreshThreatIntel(): Promise<ThreatItem[]> {
  const res = await fetch("/api/threat-intelligence/refresh", { method: "POST", headers: getHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to refresh threat intel");
  return json.data;
}

export async function fetchAlerts(): Promise<SecurityAlert[]> {
  const res = await fetch("/api/alerts", { headers: getHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to fetch alerts");
  return json.data;
}

export async function acknowledgeAlert(id: string): Promise<SecurityAlert> {
  const res = await fetch(`/api/alerts/${id}/acknowledge`, { method: "POST", headers: getHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to acknowledge alert");
  return json.data;
}

export async function fetchSettings(): Promise<any> {
  const res = await fetch("/api/settings", { headers: getHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to fetch settings");
  return json.data;
}

export async function updateSettings(settings: any): Promise<any> {
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(settings),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to update settings");
  return json.data;
}

export async function testWebhook(provider: string, webhookUrl: string): Promise<any> {
  const res = await fetch("/api/webhooks/test", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ provider, webhookUrl }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Webhook test failed");
  return json;
}

export async function runVulnerabilityScan(): Promise<any> {
  const res = await fetch("/api/vulnerability/scan", {
    method: "POST",
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Vulnerability scan failed");
  return json.data;
}

export async function clearAllHistory(): Promise<any> {
  const res = await fetch("/api/history", {
    method: "DELETE",
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to clear history");
  return json.data;
}
