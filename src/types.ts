export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DualEngineResult {
  engine1: {
    name: string;
    endpoint: string;
    isPhishing: boolean;
    probability: number;
    features: {
      DomainLength?: number;
      IsDomainIP?: number;
      IsHTTPS?: number;
      NoOfSubDomain?: number;
      [key: string]: any;
    };
    status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
    latencyMs?: number;
  };
  engine2: {
    name: string;
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
  dualEngine?: DualEngineResult;
}

export interface MalwareScan {
  id: string;
  filename: string;
  fileName?: string;
  sha256: string;
  fileHash?: string;
  scanStatus: 'completed' | 'scanning' | 'failed';
  status?: string;
  malicious: boolean;
  detectionCount: number;
  totalEngines: number;
  enginesDetected?: number;
  enginesTotal?: number;
  detectionRatio?: number;
  threatName?: string;
  threatLabel?: string;
  reportSummary?: string;
  hfimRgb?: {
    r: string;
    g: string;
    b: string;
  };
  hapMemory?: {
    hiddenPid?: string;
    c2Socket?: string;
    decryptionKey?: string;
  };
  staticAnalysis?: {
    entropy: string;
    fileType: string;
    extractedStrings: string[];
  };
  dynamicAnalysis?: {
    networkConnections: string[];
    droppedFiles: string[];
    apiCalls: string[];
  };
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
  sourceOrigin?: {
    name: string;
    type: 'CISA' | 'MITRE' | 'ALIENVAULT' | 'LOCAL_SOC' | 'CERTSTREAM' | 'VIRUSTOTAL' | 'OTHER';
    endpoint: string;
    externalUrl?: string;
    attribution: string;
    ingestionMethod: string;
    ingestedAt: string;
    rawId?: string;
  };
  indicatorType: 'CVE' | 'IP' | 'DOMAIN' | 'HASH' | 'URL';
  indicator: string;
  indicators?: string[];
  threatName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  cveId?: string;
  publishedAt: string;
  updatedAt: string;
  vtStats?: {
    malicious: number;
    suspicious: number;
    harmless: number;
    undetected: number;
    total: number;
  };
  vtTags?: string[];
  vtPermalink?: string;
  popularCategory?: string;
  engineDetections?: Array<{ engine: string; category: string; result: string }>;
  cisaDetails?: {
    vendorProject?: string;
    product?: string;
    requiredAction?: string;
    knownRansomwareCampaignUse?: string;
  };
  mitreDetails?: {
    techniqueId?: string;
    tactic?: string;
    platforms?: string[];
    adversaryGroups?: string[];
  };
  certStreamDetails?: {
    issuer?: string;
    certTransparencyLog?: string;
    sanDomains?: string[];
    suspicionReason?: string;
  };
  localSocDetails?: {
    sensorNode?: string;
    detectionRule?: string;
    destinationIp?: string;
    port?: number;
  };
}

export interface ThreatSourceStatus {
  id: 'CISA' | 'MITRE' | 'ALIENVAULT' | 'LOCAL_SOC' | 'CERTSTREAM';
  name: string;
  status: 'SYNCED' | 'STREAMING' | 'UPDATING' | 'ERROR';
  itemCount: number;
  lastSyncTime: string;
  endpoint: string;
  description: string;
  badgeColor: string;
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
  timestamp?: string;
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

export interface CrowdsourcedThreat {
  id: string;
  url: string;
  reportedBy: string;
  reportedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'DISCARDED';
}

export interface QuickScanResult {
  id: string;
  inputType: 'URL' | 'HASH_MD5' | 'HASH_SHA1' | 'HASH_SHA256' | 'IP' | 'DOMAIN';
  query: string;
  normalizedQuery: string;
  verdict: 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN' | 'UNKNOWN';
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  threatName?: string;
  riskScore: number;
  confidence: number;
  analysisSummary: string;
  enginesDetected: number;
  enginesTotal: number;
  tags: string[];
  vendorDetections?: Array<{ engine: string; category: string; result: string }>;
  details: {
    urlFeatures?: {
      hasHttps: boolean;
      dotsCount: number;
      hyphensCount: number;
      suspiciousKeywordsCount: number;
      isIpAddress: boolean;
    };
    phishTankMatch?: boolean;
    hashDetails?: {
      algorithm: string;
      entropy?: string;
      suggestedFamily?: string;
    };
  };
  scannedAt: string;
}
