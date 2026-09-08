export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface PhishingScan {
  id: string;
  url: string;
  riskScore: number;
  classification: 'SAFE' | 'SUSPICIOUS' | 'PHISHING';
  confidence: number;
  featureSummary: {
    urlLength: number;
    hostnameLength: number;
    dotsCount: number;
    hyphensCount: number;
    hasHttps: boolean;
    isIpAddress: boolean;
    suspiciousKeywordsCount: number;
    specialCharsCount: number;
  };
  aiExplanation?: string;
  modelVersion: string;
  scannedAt: string;
}

export interface MalwareScan {
  id: string;
  filename: string;
  sha256: string;
  scanStatus: 'completed' | 'scanning' | 'failed';
  malicious: boolean;
  detectionCount: number;
  totalEngines: number;
  threatName?: string;
  scannedAt: string;
}

export interface NetworkEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'DNS' | 'SSH' | 'FTP';
  port: number;
  bytes: number;
  packets: number;
  bandwidthMbps: number;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  anomalyScore: number;
  eventType: string;
}

export interface ThreatItem {
  id: string;
  source: string;
  indicatorType: 'CVE' | 'IP' | 'DOMAIN' | 'HASH' | 'URL';
  indicator: string;
  threatName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  cveId?: string;
  publishedAt: string;
  updatedAt: string;
}

export interface SecurityAlert {
  id: string;
  eventType: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  source: string;
  acknowledged: boolean;
  webhookStatus: 'sent' | 'failed' | 'pending' | 'disabled';
  createdAt: string;
}

export interface DashboardSummary {
  totalScans: number;
  phishingThreats: number;
  malwareThreats: number;
  activeAnomalies: number;
  criticalAlerts: number;
  threatIntelItems: number;
  systemStatus: 'Operational' | 'Elevated Threat Activity' | 'Critical Security Incident';
  lastSync: string;
}

export interface VulnerabilityAsset {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'scanning' | 'vulnerable' | 'secure';
  exposure: number;
}
