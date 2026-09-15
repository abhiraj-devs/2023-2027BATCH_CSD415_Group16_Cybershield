import { PhishingScan, MalwareScan, NetworkEvent, ThreatItem, SecurityAlert, DashboardSummary } from "../types";

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

// Fallback seed datasets used if network or container has a transient outage or cold start
const fallbackDashboardSummary: DashboardSummary = {
  totalScans: 4,
  phishingThreats: 1,
  malwareThreats: 1,
  activeAnomalies: 1,
  criticalAlerts: 1,
  threatIntelItems: 3,
  systemStatus: "Elevated Threat Activity",
  lastSync: new Date().toISOString(),
};

const fallbackAlerts: SecurityAlert[] = [
  {
    id: "alt_1",
    eventType: "High Risk Phishing Target Detected",
    severity: "HIGH",
    title: "Executive Phishing Campaign Target",
    message: "High-probability credential harvester detected spoofing enterprise identity SSO login.",
    source: "RandomForest-URL-Classifier",
    acknowledged: false,
    webhookStatus: "sent",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "alt_2",
    eventType: "Trojan Binary Hash Matched",
    severity: "CRITICAL",
    title: "Known Ransomware Signature in File Upload",
    message: "Hash match with WannaCry cryptor payload detected in incoming file upload scan.",
    source: "VirusTotal / Threat Intelligence API",
    acknowledged: false,
    webhookStatus: "sent",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "alt_3",
    eventType: "Suspicious Egress Volume Spike",
    severity: "MEDIUM",
    title: "Anomaly: High Outbound Traffic via HTTPS",
    message: "Outbound host 192.168.1.105 transferring 142.5 KB to untrusted Tor exit node.",
    source: "Network-Telemetry-Engine",
    acknowledged: true,
    webhookStatus: "disabled",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

const fallbackNetworkEvents: NetworkEvent[] = [
  {
    id: "net_1",
    timestamp: new Date().toISOString(),
    sourceIp: "192.168.1.105",
    destinationIp: "185.220.101.5",
    protocol: "HTTPS",
    port: 443,
    bytes: 142500,
    packets: 320,
    bandwidthMbps: 12.4,
    severity: "HIGH",
    anomalyScore: 88,
    eventType: "Suspicious Outbound Data Exfiltration Pattern",
  },
  {
    id: "net_2",
    timestamp: new Date(Date.now() - 5000).toISOString(),
    sourceIp: "10.0.4.12",
    destinationIp: "8.8.8.8",
    protocol: "DNS",
    port: 53,
    bytes: 512,
    packets: 4,
    bandwidthMbps: 0.1,
    severity: "INFO",
    anomalyScore: 5,
    eventType: "Standard DNS Query Resolution",
  },
  {
    id: "net_3",
    timestamp: new Date(Date.now() - 12000).toISOString(),
    sourceIp: "192.168.1.50",
    destinationIp: "45.33.32.156",
    protocol: "SSH",
    port: 22,
    bytes: 4800,
    packets: 45,
    bandwidthMbps: 1.2,
    severity: "MEDIUM",
    anomalyScore: 42,
    eventType: "Repeated SSH Authentication Probing",
  },
  {
    id: "net_4",
    timestamp: new Date(Date.now() - 25000).toISOString(),
    sourceIp: "192.168.1.88",
    destinationIp: "104.244.42.1",
    protocol: "HTTPS",
    port: 443,
    bytes: 65400,
    packets: 110,
    bandwidthMbps: 4.8,
    severity: "INFO",
    anomalyScore: 12,
    eventType: "Regular API Gateway Heartbeat",
  },
];

const fallbackNetworkSummary = {
  currentBandwidthMbps: 28.4,
  averageBandwidthMbps: 22.8,
  peakBandwidthMbps: 84.5,
  activeConnections: 1420,
  packetLossRate: "0.02%",
  protocols: [
    { protocol: "HTTPS", count: 850, percentage: 60 },
    { protocol: "HTTP", count: 210, percentage: 15 },
    { protocol: "DNS", count: 180, percentage: 13 },
    { protocol: "SSH", count: 90, percentage: 7 },
    { protocol: "Other", count: 70, percentage: 5 },
  ],
};

const fallbackThreatIntel: ThreatItem[] = [
  {
    id: "ti_1",
    source: "CyberShield AI",
    indicatorType: "CVE",
    indicator: "CVE-2026-1184",
    threatName: "Linux eBPF Kernel Memory Escalation",
    severity: "CRITICAL",
    description: "Flaw in verification subsystem allows arbitrary ring 0 execution via crafted bytecode filters.",
    cveId: "CVE-2026-1184",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  },
  {
    id: "ti_2",
    source: "US-CERT / CISA",
    indicatorType: "IP",
    indicator: "185.220.101.5",
    threatName: "Cobalt Strike Team Server C2",
    severity: "HIGH",
    description: "Observed actively commanding multi-stage infostealers and credential dumping tools.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  },
  {
    id: "ti_3",
    source: "ThreatConnect",
    indicatorType: "HASH",
    indicator: "7a5e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e",
    threatName: "RedLine Stealer v24.1 Payload",
    severity: "CRITICAL",
    description: "Browser cookie extraction and cryptocurrency wallet drainer distributed via malvertising.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  },
];

/**
 * Resilient JSON fetcher with automated retry and fallback capability.
 * Prevents intermittent network dropouts or container restarts from throwing unhandled errors.
 */
async function safeFetchJson<T>(
  url: string,
  options?: RequestInit,
  fallback?: T,
  retries = 1
): Promise<T> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        ...options,
        headers: {
          ...getHeaders(),
          ...(options?.headers || {}),
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response");
      }

      if (!json.success && json.error) {
        throw new Error(json.error.message || `Request to ${url} unsuccessful`);
      }

      return json.data !== undefined ? json.data : (json as unknown as T);
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        // Wait briefly before retrying
        await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
      }
    }
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw lastError || new Error(`Failed to request ${url}`);
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return safeFetchJson<DashboardSummary>("/api/dashboard/summary", {}, fallbackDashboardSummary);
}

export async function analyzePhishingUrl(url: string): Promise<PhishingScan> {
  return safeFetchJson<PhishingScan>("/api/phishing/analyze", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function fetchPhishingHistory(): Promise<PhishingScan[]> {
  return safeFetchJson<PhishingScan[]>("/api/phishing/history", {}, []);
}

export async function scanMalwareFile(filename: string, sha256?: string, fileContent?: string): Promise<MalwareScan> {
  return safeFetchJson<MalwareScan>("/api/malware/scan", {
    method: "POST",
    body: JSON.stringify({ filename, sha256, fileContent }),
  });
}

export async function fetchMalwareHistory(): Promise<MalwareScan[]> {
  return safeFetchJson<MalwareScan[]>("/api/malware/history", {}, []);
}

export async function fetchNetworkEvents(): Promise<NetworkEvent[]> {
  return safeFetchJson<NetworkEvent[]>("/api/network/events", {}, fallbackNetworkEvents);
}

export async function fetchNetworkSummary(): Promise<any> {
  return safeFetchJson<any>("/api/network/summary", {}, fallbackNetworkSummary);
}

export async function fetchThreatIntel(): Promise<ThreatItem[]> {
  return safeFetchJson<ThreatItem[]>("/api/threat-intelligence", {}, fallbackThreatIntel);
}

export async function refreshThreatIntel(): Promise<ThreatItem[]> {
  return safeFetchJson<ThreatItem[]>("/api/threat-intelligence/refresh", { method: "POST" }, fallbackThreatIntel);
}

export async function fetchAlerts(): Promise<SecurityAlert[]> {
  return safeFetchJson<SecurityAlert[]>("/api/alerts", {}, fallbackAlerts);
}

export async function acknowledgeAlert(id: string): Promise<SecurityAlert> {
  return safeFetchJson<SecurityAlert>(`/api/alerts/${id}/acknowledge`, { method: "POST" });
}

export async function fetchSettings(): Promise<any> {
  return safeFetchJson<any>("/api/settings", {}, {
    discordWebhookUrl: "",
    slackWebhookUrl: "",
    minSeverity: "HIGH",
    notificationsEnabled: false,
  });
}

export async function updateSettings(settings: any): Promise<any> {
  return safeFetchJson<any>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

export async function testWebhook(provider: string, webhookUrl: string): Promise<any> {
  return safeFetchJson<any>("/api/webhooks/test", {
    method: "POST",
    body: JSON.stringify({ provider, webhookUrl }),
  });
}

export async function runVulnerabilityScan(): Promise<any> {
  return safeFetchJson<any>("/api/vulnerability/scan", {
    method: "POST",
  });
}

export async function clearAllHistory(): Promise<any> {
  return safeFetchJson<any>("/api/history", {
    method: "DELETE",
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
  otp: string
): Promise<{ verified: boolean; email: string; role: string; user: any; token: string }> {
  return safeFetchJson<{ verified: boolean; email: string; role: string; user: any; token: string }>(
    "/api/auth/verify-otp",
    {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }
  );
}

export async function deleteAccountApi(email: string): Promise<any> {
  return safeFetchJson<any>("/api/auth/delete-account", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
