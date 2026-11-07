import { 
  DashboardSummary, 
  SecurityAlert, 
  NetworkEvent, 
  ThreatItem, 
  PhishingScan, 
  MalwareScan, 
  VulnerabilityAsset, 
  CrowdsourcedThreat,
  QuickScanResult
} from "../types";

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = `Request failed (${res.status})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error?.message) errorMsg = parsed.error.message;
      else if (parsed.message) errorMsg = parsed.message;
    } catch {}
    throw new Error(errorMsg);
  }

  const json = await res.json();
  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }
  return json as T;
}

// Dashboard
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return safeFetchJson<DashboardSummary>("/api/dashboard/summary");
}

// Alerts
export async function fetchAlerts(): Promise<SecurityAlert[]> {
  return safeFetchJson<SecurityAlert[]>("/api/alerts");
}

export async function acknowledgeAlert(id: string): Promise<SecurityAlert> {
  return safeFetchJson<SecurityAlert>(`/api/alerts/${id}/acknowledge`, { method: "POST" });
}

// Network Telemetry
export async function fetchNetworkEvents(): Promise<NetworkEvent[]> {
  return safeFetchJson<NetworkEvent[]>("/api/network/events");
}

export async function fetchNetworkSummary(): Promise<any> {
  return safeFetchJson<any>("/api/network/summary");
}

export async function runSpeedTestPing(): Promise<{ ping: number }> {
  return safeFetchJson<{ ping: number }>("/api/speedtest/ping");
}

export async function runSpeedTestDownload(): Promise<{ download: number }> {
  return safeFetchJson<{ download: number }>("/api/speedtest/download");
}

export async function runSpeedTestUpload(sizeKb: number = 256): Promise<{ upload: number }> {
  return safeFetchJson<{ upload: number }>("/api/speedtest/upload", {
    method: "POST",
    body: JSON.stringify({ sizeKb }),
  });
}

// Threat Intel
export async function fetchThreatIntel(): Promise<ThreatItem[]> {
  return safeFetchJson<ThreatItem[]>("/api/threat-intel");
}

export async function refreshThreatIntel(): Promise<ThreatItem[]> {
  return safeFetchJson<ThreatItem[]>("/api/threat-intel/refresh", { method: "POST" });
}

export async function getVirusTotalStatus(): Promise<any> {
  return safeFetchJson<any>("/api/threat-intel/virustotal-status");
}

// Phishing Detection
export async function analyzePhishingUrl(url: string, userEmail?: string): Promise<PhishingScan> {
  return safeFetchJson<PhishingScan>("/api/phishing/analyze", {
    method: "POST",
    body: JSON.stringify({ url, userEmail }),
  });
}

export async function fetchPhishingHistory(email?: string): Promise<PhishingScan[]> {
  const query = email ? `?userEmail=${encodeURIComponent(email)}` : "";
  return safeFetchJson<PhishingScan[]>(`/api/phishing/history${query}`);
}

export async function fetchPhishGuardStatus(): Promise<any> {
  return safeFetchJson<any>("/api/phishing/engine-status");
}

export async function fetchCrowdsourcedThreats(): Promise<CrowdsourcedThreat[]> {
  return safeFetchJson<CrowdsourcedThreat[]>("/api/phishing/crowdsourced");
}

export async function verifyCrowdsourcedThreat(id: string): Promise<any> {
  return safeFetchJson<any>(`/api/phishing/crowdsourced/${id}/verify`, { method: "POST" });
}

export async function discardCrowdsourcedThreat(id: string): Promise<any> {
  return safeFetchJson<any>(`/api/phishing/crowdsourced/${id}/discard`, { method: "POST" });
}

// Malware Analysis
export async function scanMalwareFile(
  filename: string,
  sha256: string,
  fileContent?: string,
  userEmail?: string
): Promise<MalwareScan> {
  return safeFetchJson<MalwareScan>("/api/malware/scan", {
    method: "POST",
    body: JSON.stringify({ filename, sha256, fileContent, userEmail }),
  });
}

export async function fetchMalwareHistory(email?: string): Promise<MalwareScan[]> {
  const query = email ? `?userEmail=${encodeURIComponent(email)}` : "";
  return safeFetchJson<MalwareScan[]>(`/api/malware/history${query}`);
}

// Vulnerability Scanner
export async function runVulnerabilityScan(): Promise<VulnerabilityAsset[]> {
  return safeFetchJson<VulnerabilityAsset[]>("/api/vulnerability/scan", { method: "POST" });
}

// Settings & Webhooks
export async function fetchSettings(): Promise<any> {
  return safeFetchJson<any>("/api/settings");
}

export async function updateSettings(settings: any): Promise<any> {
  return safeFetchJson<any>("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

export async function testWebhook(platform: "DISCORD" | "SLACK", webhookUrl: string): Promise<any> {
  return safeFetchJson<any>("/api/alerts/test-webhook", {
    method: "POST",
    body: JSON.stringify({ platform, webhookUrl }),
  });
}

// Authentication server endpoints
export async function registerWithServerApi(name: string, email: string, password: string): Promise<any> {
  return safeFetchJson<any>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginWithServerApi(email: string, password: string): Promise<any> {
  return safeFetchJson<any>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function sendAuthOtp(
  email: string,
  purpose: string = "login"
): Promise<{ message: string; otpCode?: string; expiresInSeconds: number }> {
  return safeFetchJson<{ message: string; otpCode?: string; expiresInSeconds: number }>(
    "/api/auth/send-otp",
    {
      method: "POST",
      body: JSON.stringify({ email, purpose }),
    }
  );
}

export async function verifyAuthOtp(
  email: string,
  otpCode: string,
  purpose: string = "login"
): Promise<{ message: string; token?: string; user?: any; verified: boolean }> {
  return safeFetchJson<{ message: string; token?: string; user?: any; verified: boolean }>(
    "/api/auth/verify-otp",
    {
      method: "POST",
      body: JSON.stringify({ email, otpCode, purpose }),
    }
  );
}

export async function deleteAccountApi(email: string): Promise<any> {
  return safeFetchJson<any>("/api/auth/delete-account", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Quick Scan
export async function runQuickScan(query: string, typeHint?: string): Promise<QuickScanResult> {
  return safeFetchJson<QuickScanResult>("/api/quick-scan", {
    method: "POST",
    body: JSON.stringify({ query, typeHint }),
  });
}

// Clear History & Cache
export async function clearAllHistory(): Promise<any> {
  return safeFetchJson<any>("/api/history", { method: "DELETE" });
}

