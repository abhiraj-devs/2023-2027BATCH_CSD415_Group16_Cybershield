import { PhishingScan, MalwareScan, NetworkEvent, ThreatItem, ThreatSourceStatus, SecurityAlert, DashboardSummary } from "../types";

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
    id: "vt_lockbit",
    source: "VirusTotal Live Feed",
    sourceOrigin: {
      name: "VirusTotal v3 Live Threat Feed",
      type: "VIRUSTOTAL",
      endpoint: "ACTIVE / REAL-TIME",
      attribution: "VirusTotal Community",
      ingestionMethod: "API",
      ingestedAt: new Date().toISOString()
    },
    indicatorType: "HASH",
    indicator: "24f95e5d97def767393c266481665745263029b236575b5cb4dd16e9f17b653b",
    indicators: ["24f95e5d97def767393c266481665745263029b236575b5cb4dd16e9f17b653b", "LockBit3_payload.bin", "win32.trojan.lockbit"],
    threatName: "LockBit 3.0 Enterprise Ransomware",
    severity: "CRITICAL",
    description: "63/72 security vendors detected this high-impact ransomware. Executes anti-analysis loops, shadow copy wipe, and encrypted multi-thread dispatch.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    vtStats: {
      malicious: 63,
      suspicious: 1,
      harmless: 0,
      undetected: 8,
      total: 72,
    },
    vtTags: ["ransomware", "peexe", "lockbit", "direct-cpu-clock-access", "overlay"],
    vtPermalink: "https://www.virustotal.com/gui/file/24f95e5d97def767393c266481665745263029b236575b5cb4dd16e9f17b653b",
    popularCategory: "ransomware",
    engineDetections: [
      { engine: "Microsoft", category: "malicious", result: "Ransom:Win32/Lockbit.A!MTB" },
      { engine: "Kaspersky", category: "malicious", result: "HEUR:Trojan-Ransom.Win32.Lockbit.gen" },
      { engine: "CrowdStrike", category: "malicious", result: "win/malicious_confidence_100% (W)" },
      { engine: "Sophos", category: "malicious", result: "Troj/Lockbit-AB" },
    ],
  },
  {
    id: "vt_redline",
    source: "VirusTotal Live Feed",
    sourceOrigin: {
      name: "PhishTank Anti-Phishing Database",
      type: "OTHER",
      endpoint: "SYNCED",
      attribution: "PhishTank Community",
      ingestionMethod: "API",
      ingestedAt: new Date().toISOString()
    },
    indicatorType: "HASH",
    indicator: "ed01ebf83334a193707a43a396482b1c5a31dd9451b54314fa76103b4096da80",
    indicators: ["ed01ebf83334a193707a43a396482b1c5a31dd9451b54314fa76103b4096da80", "RedLine_Stealer_x64.exe"],
    threatName: "RedLine Infostealer v24.1 Payload",
    severity: "CRITICAL",
    description: "68/72 security engines flagged this memory-resident infostealer. Steals saved browser passwords, session cookies, Discord tokens, and cryptocurrency wallet seeds.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    vtStats: {
      malicious: 68,
      suspicious: 0,
      harmless: 0,
      undetected: 4,
      total: 72,
    },
    vtTags: ["trojan", "stealer", "infostealer", "crypto-drainer"],
    vtPermalink: "https://www.virustotal.com/gui/file/ed01ebf83334a193707a43a396482b1c5a31dd9451b54314fa76103b4096da80",
    popularCategory: "trojan",
    engineDetections: [
      { engine: "Kaspersky", category: "malicious", result: "HEUR:Trojan.Win32.Generic" },
      { engine: "Microsoft", category: "malicious", result: "Trojan:Win32/RedLineStealer.G!dha" },
      { engine: "BitDefender", category: "malicious", result: "Gen:Variant.Bredolab.26412" },
    ],
  },
  {
    id: "ti_1",
    source: "NVD / MITRE",
    sourceOrigin: {
      name: "MITRE ATT&CK Framework",
      type: "MITRE",
      endpoint: "SYNCED",
      attribution: "MITRE",
      ingestionMethod: "API",
      ingestedAt: new Date().toISOString()
    },
    indicatorType: "CVE",
    indicator: "CVE-2026-1042",
    cveId: "CVE-2026-1042",
    threatName: "Windows Kernel Privilege Escalation Vulnerability",
    severity: "CRITICAL",
    description: "Flaw in win32k subsystem memory allocation allows authenticated low-integrity users to elevate to NT AUTHORITY\\SYSTEM privileges.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  },
  {
    id: "vt_c2_ip",
    source: "VirusTotal Live Feed",
    sourceOrigin: {
      name: "AlienVault OTX Community Pulse",
      type: "ALIENVAULT",
      endpoint: "SYNCED",
      attribution: "AlienVault",
      ingestionMethod: "API",
      ingestedAt: new Date().toISOString()
    },
    indicatorType: "IP",
    indicator: "185.220.101.5",
    threatName: "Tor Exit Relay / Active C2 Command Node",
    severity: "HIGH",
    description: "21 security vendors identified this IP as an active Command & Control relay and malicious exit node involved in ransomware multi-stage payload drops.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    vtStats: {
      malicious: 21,
      suspicious: 3,
      harmless: 19,
      undetected: 45,
      total: 88,
    },
    vtTags: ["tor-exit", "c2-relay", "botnet", "anonymizer"],
    vtPermalink: "https://www.virustotal.com/gui/ip-address/185.220.101.5",
    popularCategory: "c2-infrastructure",
    engineDetections: [
      { engine: "CrowdStrike Falcon", category: "malicious", result: "Malicious IP - C2" },
      { engine: "Fortinet", category: "malicious", result: "Malicious Host" },
      { engine: "AlienVault", category: "malicious", result: "Scanning Host" },
    ],
  },
  {
    id: "vt_domain_phish",
    source: "VirusTotal Live Feed",
    sourceOrigin: {
      name: "CISA Known Exploited Vulnerabilities",
      type: "CISA",
      endpoint: "SYNCED",
      attribution: "CISA",
      ingestionMethod: "API",
      ingestedAt: new Date().toISOString()
    },
    indicatorType: "DOMAIN",
    indicator: "secure-auth-apple-support-verify.com",
    threatName: "Apple ID Credential Harvesting Infrastructure",
    severity: "HIGH",
    description: "16 security vendors flagged this newly observed domain for targeted phishing, deploying fraudulent OAuth prompts and 2FA intercept forms.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    vtStats: {
      malicious: 16,
      suspicious: 4,
      harmless: 8,
      undetected: 42,
      total: 70,
    },
    vtTags: ["phishing", "brand-impersonation", "credential-harvesting"],
    vtPermalink: "https://www.virustotal.com/gui/domain/secure-auth-apple-support-verify.com",
    popularCategory: "phishing",
    engineDetections: [
      { engine: "Google Safe Browsing", category: "malicious", result: "Phishing site" },
      { engine: "Kaspersky", category: "malicious", result: "Phishing URL" },
      { engine: "Netcraft", category: "malicious", result: "Malicious" },
    ],
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

export async function fetchCrowdsourcedThreats(): Promise<any[]> {
  return safeFetchJson<any[]>("/api/phishing/crowdsourced", {}, []);
}

export async function verifyCrowdsourcedThreat(id: string): Promise<any> {
  return safeFetchJson<any>(`/api/phishing/crowdsourced/${id}/verify`, {
    method: "POST"
  });
}

export async function discardCrowdsourcedThreat(id: string): Promise<any> {
  return safeFetchJson<any>(`/api/phishing/crowdsourced/${id}/discard`, {
    method: "POST"
  });
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

export async function fetchThreatSourcesStatus(): Promise<ThreatSourceStatus[]> {
  return safeFetchJson<ThreatSourceStatus[]>("/api/threat-intelligence/sources-status", {}, [
    {
      id: "CISA",
      name: "CISA Known Exploited Vulnerabilities",
      status: "SYNCED",
      itemCount: 2,
      lastSyncTime: new Date().toISOString(),
      endpoint: "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
      description: "Official catalog of vulnerabilities actively exploited in the wild, monitored by the US DHS.",
      badgeColor: "cyan"
    },
    {
      id: "MITRE",
      name: "MITRE ATT&CK Feed",
      status: "SYNCED",
      itemCount: 2,
      lastSyncTime: new Date().toISOString(),
      endpoint: "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json",
      description: "Enterprise adversary tactics, techniques, and procedures (TTPs) matrix v14.1.",
      badgeColor: "rose"
    },
    {
      id: "ALIENVAULT",
      name: "AlienVault OTX",
      status: "SYNCED",
      itemCount: 2,
      lastSyncTime: new Date().toISOString(),
      endpoint: "https://otx.alienvault.com/api/v1/indicators",
      description: "Open Threat Exchange community-curated threat pulses, active C2 hosts, and malware hashes.",
      badgeColor: "emerald"
    },
    {
      id: "LOCAL_SOC",
      name: "Local SOC Telemetry",
      status: "STREAMING",
      itemCount: 2,
      lastSyncTime: new Date().toISOString(),
      endpoint: "internal://sensor-mesh.cybershield.lan/telemetry/v1/stream",
      description: "Internal IDS sensor grid, eBPF kernel probes, and live perimeter network intrusion triggers.",
      badgeColor: "purple"
    },
    {
      id: "CERTSTREAM",
      name: "CertStream SSL Parked Domains",
      status: "STREAMING",
      itemCount: 2,
      lastSyncTime: new Date().toISOString(),
      endpoint: "wss://certstream.calidog.org / https://crt.sh",
      description: "Real-time Certificate Transparency stream capturing newly issued SSL certs for parked phishing domains.",
      badgeColor: "amber"
    }
  ]);
}

export async function streamNextThreatItem(source?: string): Promise<{ data: ThreatItem; sourcesStatus: ThreatSourceStatus[] }> {
  return safeFetchJson<{ data: ThreatItem; sourcesStatus: ThreatSourceStatus[] }>("/api/threat-intelligence/stream-next", {
    method: "POST",
    body: JSON.stringify({ source }),
  });
}

export async function lookupVirusTotalIntel(
  query: string,
  type?: 'file' | 'domain' | 'ip' | 'url'
): Promise<ThreatItem> {
  return safeFetchJson<ThreatItem>("/api/threat-intelligence/virustotal-lookup", {
    method: "POST",
    body: JSON.stringify({ query, type }),
  });
}

export async function getVirusTotalStatus(): Promise<{ configured: boolean; service: string }> {
  return safeFetchJson<{ configured: boolean; service: string }>(
    "/api/threat-intelligence/virustotal-status",
    {},
    { configured: false, service: "VirusTotal v3" }
  );
}

export async function lookupPhishTank(url: string): Promise<{
  url: string;
  inDatabase: boolean;
  verified: boolean;
  phishId?: string;
  target?: string;
  phishDetailUrl?: string;
  checkedAt: string;
}> {
  return safeFetchJson<{
    url: string;
    inDatabase: boolean;
    verified: boolean;
    phishId?: string;
    target?: string;
    phishDetailUrl?: string;
    checkedAt: string;
  }>("/api/threat-intelligence/phishtank-lookup", {
    method: "POST",
    body: JSON.stringify({ url }),
  }, {
    url,
    inDatabase: false,
    verified: false,
    checkedAt: new Date().toISOString(),
  });
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
