export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified?: boolean;
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

export interface NetworkEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  protocol: 'TCP' | 'UDP' | 'HTTPS' | 'DNS' | 'SSH' | 'ICMP';
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
  sourceOrigin: {
    name: string;
    type: string;
    endpoint: string;
    externalUrl?: string;
    attribution: string;
    ingestionMethod: string;
    ingestedAt: string;
    rawId?: string;
  };
  indicatorType: 'CVE' | 'IP' | 'DOMAIN' | 'HASH';
  indicator: string;
  indicators: string[];
  threatName: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  publishedAt: string;
  updatedAt: string;
  vtStats?: {
    malicious: number;
    suspicious: number;
    harmless: number;
    undetected: number;
    total: number;
  };
  localSocDetails?: {
    sensorNode?: string;
    detectionRule?: string;
    destinationIp?: string;
    port?: number;
  };
  certStreamDetails?: {
    issuer?: string;
    certTransparencyLog?: string;
    sanDomains?: string[];
    suspicionReason?: string;
  };
}

export interface PhishingFeatureSummary {
  urlLength: number;
  hostnameLength: number;
  dotsCount: number;
  hyphensCount: number;
  hasHttps: boolean;
  isIpAddress: boolean;
  suspiciousKeywordsCount: number;
  specialCharsCount: number;
}

export interface DualEngineData {
  engine1: {
    name: string;
    endpoint: string;
    isPhishing: boolean;
    probability: number;
    features: Record<string, any>;
    status: string;
    latencyMs?: number;
  };
  engine2: {
    name: string;
    riskScore: number;
    classification: 'SAFE' | 'SUSPICIOUS' | 'PHISHING';
    confidence: number;
    featureSummary: PhishingFeatureSummary;
  };
  consensus: {
    agreement: 'FULL_AGREEMENT' | 'DISAGREEMENT' | 'PARTIAL';
    finalVerdict: 'CONFIRMED_PHISHING' | 'SUSPICIOUS' | 'VERIFIED_SAFE';
    combinedScore: number;
    confidence: number;
    description: string;
  };
}

export interface PhishingScan {
  id: string;
  userEmail: string;
  url: string;
  riskScore: number;
  classification: 'SAFE' | 'SUSPICIOUS' | 'PHISHING';
  confidence: number;
  featureSummary: PhishingFeatureSummary;
  aiExplanation: string;
  modelVersion: string;
  scannedAt: string;
  dualEngine?: DualEngineData;
}

export interface MalwareScan {
  id: string;
  userEmail: string;
  filename: string;
  sha256: string;
  scanStatus: 'completed' | 'scanning' | 'queued';
  malicious: boolean;
  detectionCount: number;
  totalEngines: number;
  threatName?: string;
  scannedAt: string;
}

export interface VulnerabilityAsset {
  id: string;
  name: string;
  type: 'Gateway' | 'Database' | 'Container' | 'VM';
  status: 'pending' | 'scanning' | 'vulnerable' | 'secure';
  exposure: number;
  cveList?: string[];
  lastScanned?: string;
}

export interface CrowdsourcedThreat {
  id: string;
  url: string;
  reportedBy: string;
  reportedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'DISCARDED';
}

export interface QuickScanResult {
  id: string;
  inputType: 'URL' | 'HASH_MD5' | 'HASH_SHA1' | 'HASH_SHA256' | 'IP' | 'DOMAIN' | string;
  query: string;
  normalizedQuery?: string;
  verdict: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' | 'PHISHING' | string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  threatName?: string;
  riskScore: number;
  confidence: number;
  analysisSummary: string;
  enginesDetected: number;
  enginesTotal: number;
  tags?: string[];
  vendorDetections?: Array<{ engine: string; category: string; result: string }>;
  details?: any;
  scannedAt: string;
}

