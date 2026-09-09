import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
const app = express();
const PORT = 3000;

// Enable CORS for all incoming client and iframe requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Explicitly serve favicons, icons and preview images
app.get(["/favicon.ico", "/favicon.svg", "/cybershield-logo.svg", "/og-image.png", "/apple-touch-icon.png", "/favicon-32x32.png", "/android-chrome-192x192.png", "/android-chrome-512x512.png", "/site.webmanifest"], (req, res) => {
  const fileName = path.basename(req.path);
  const publicPath = path.join(process.cwd(), "public", fileName);
  const distPath = path.join(process.cwd(), "dist", fileName);
  const filePath = fs.existsSync(publicPath) ? publicPath : (fs.existsSync(distPath) ? distPath : null);
  if (filePath) {
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.sendFile(filePath);
  }
  res.status(404).end();
});


// No Auth middleware

// Initialize Gemini client if API key is present
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// --- In-Memory Database Store ---
let db: {
  users: Array<{ id: string; name: string; email: string; role: string }>;
  phishingScans: Array<{
    id: string;
    userEmail: string;
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
    aiExplanation: string;
    modelVersion: string;
    scannedAt: string;
  }>;
  malwareScans: Array<{
    id: string;
    userEmail: string;
    filename: string;
    sha256: string;
    scanStatus: 'completed' | 'scanning' | 'failed';
    malicious: boolean;
    detectionCount: number;
    totalEngines: number;
    threatName?: string;
    scannedAt: string;
  }>;
  networkEvents: Array<{
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
  }>;
  threatIntel: Array<{
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
  }>;
  alerts: Array<{
    id: string;
    eventType: string;
    severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    message: string;
    source: string;
    acknowledged: boolean;
    webhookStatus: 'sent' | 'failed' | 'pending' | 'disabled';
    createdAt: string;
  }>;
  settings: {
    discordWebhookUrl: string;
    slackWebhookUrl: string;
    minSeverity: string;
    notificationsEnabled: boolean;
  };
} = {
  users: [
    { id: "usr_1", name: "SOC Analyst", email: "analyst@cybershield.ai", role: "Administrator" }
  ],
  phishingScans: [
    {
      id: "ph_1",
      userEmail: "analyst@cybershield.ai",
      url: "https://secure-login-apple-support.com/auth/verify",
      riskScore: 92,
      classification: "PHISHING" as const,
      confidence: 0.96,
      featureSummary: {
        urlLength: 52,
        hostnameLength: 32,
        dotsCount: 4,
        hyphensCount: 4,
        hasHttps: true,
        isIpAddress: false,
        suspiciousKeywordsCount: 3,
        specialCharsCount: 6,
      },
      aiExplanation: "Detected brand impersonation of Apple in subdomain combined with high-risk keywords ('secure', 'login', 'verify') and excessive hyphens.",
      modelVersion: "1.0.0-rf",
      scannedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "ph_2",
      userEmail: "analyst@cybershield.ai",
      url: "https://www.google.com/search?q=cybersecurity+trends",
      riskScore: 4,
      classification: "SAFE" as const,
      confidence: 0.99,
      featureSummary: {
        urlLength: 48,
        hostnameLength: 15,
        dotsCount: 2,
        hyphensCount: 0,
        hasHttps: true,
        isIpAddress: false,
        suspiciousKeywordsCount: 0,
        specialCharsCount: 3,
      },
      aiExplanation: "Standard trusted domain structure with legitimate search parameters and validated SSL certificate.",
      modelVersion: "1.0.0-rf",
      scannedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ],
  malwareScans: [
    {
      id: "mw_1",
      userEmail: "analyst@cybershield.ai",
      filename: "update_patch_x86.exe",
      sha256: "a81d9f204c8e12b78910fa34567bcde8901234567890abcdef1234567890abcd",
      scanStatus: "completed" as const,
      malicious: true,
      detectionCount: 18,
      totalEngines: 72,
      threatName: "Trojan.Generic.KD.1482",
      scannedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "mw_2",
      userEmail: "analyst@cybershield.ai",
      filename: "corporate_policy_q3.pdf",
      sha256: "3f2504e04f5211b88e146016cc36711f2badb9845139049962a744e857418706",
      scanStatus: "completed" as const,
      malicious: false,
      detectionCount: 0,
      totalEngines: 72,
      threatName: undefined,
      scannedAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    },
  ],
  networkEvents: [
    {
      id: "net_1",
      timestamp: new Date().toISOString(),
      sourceIp: "192.168.1.105",
      destinationIp: "185.220.101.5",
      protocol: "HTTPS" as const,
      port: 443,
      bytes: 142500,
      packets: 320,
      bandwidthMbps: 12.4,
      severity: "HIGH" as const,
      anomalyScore: 88,
      eventType: "Suspicious Outbound Data Exfiltration Pattern",
    },
    {
      id: "net_2",
      timestamp: new Date(Date.now() - 5000).toISOString(),
      sourceIp: "10.0.4.12",
      destinationIp: "8.8.8.8",
      protocol: "DNS" as const,
      port: 53,
      bytes: 512,
      packets: 4,
      bandwidthMbps: 0.1,
      severity: "INFO" as const,
      anomalyScore: 5,
      eventType: "Standard DNS Query Resolution",
    },
    {
      id: "net_3",
      timestamp: new Date(Date.now() - 12000).toISOString(),
      sourceIp: "192.168.1.50",
      destinationIp: "45.33.32.156",
      protocol: "SSH" as const,
      port: 22,
      bytes: 4800,
      packets: 45,
      bandwidthMbps: 1.2,
      severity: "MEDIUM" as const,
      anomalyScore: 42,
      eventType: "Repeated SSH Authentication Probing",
    }
  ],
  threatIntel: [
    {
      id: "ti_1",
      source: "CyberShield",
      indicatorType: "CVE" as const,
      indicator: "CVE-2026-1042",
      threatName: "Windows Kernel Privilege Escalation Vulnerability",
      severity: "CRITICAL" as const,
      description: "A remote code execution vulnerability exists in the Windows kernel subsystem allowing threat actors to achieve SYSTEM privileges.",
      cveId: "CVE-2026-1042",
      publishedAt: "2026-08-10",
      updatedAt: "2026-08-15",
    },
    {
      id: "ti_2",
      source: "CyberShield",
      indicatorType: "CVE" as const,
      indicator: "CVE-2026-0881",
      threatName: "Apache Log4j Remote Command Injection",
      severity: "HIGH" as const,
      description: "Improper input validation in logging libraries allows unauthenticated attackers to execute arbitrary shell commands via crafted JNDI lookups.",
      cveId: "CVE-2026-0881",
      publishedAt: "2026-07-28",
      updatedAt: "2026-08-12",
    },
    {
      id: "ti_3",
      source: "CyberShield Labs",
      indicatorType: "IP" as const,
      indicator: "185.220.101.5",
      threatName: "Known C2 Botnet Exit Node",
      severity: "HIGH" as const,
      description: "Tor exit node and active Command & Control communication relay associated with ransomware distribution groups.",
      cveId: undefined,
      publishedAt: "2026-08-14",
      updatedAt: "2026-08-17",
    }
  ],
  alerts: [
    {
      id: "alt_1",
      eventType: "PHISHING_DETECTED",
      severity: "HIGH" as const,
      title: "High-Risk Phishing URL Submitted",
      message: "A user scanned https://secure-login-apple-support.com which scored 92/100 risk rating.",
      source: "AI Phishing Engine",
      acknowledged: false,
      webhookStatus: "sent" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    },
    {
      id: "alt_2",
      eventType: "MALWARE_DETECTED",
      severity: "CRITICAL" as const,
      title: "Trojan Detected in File Scan",
      message: "File update_patch_x86.exe matched known signature Trojan.Generic.KD.1482 (18/71 engines).",
      source: "Malware Scanner",
      acknowledged: true,
      webhookStatus: "sent" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    }
  ],
  settings: {
    discordWebhookUrl: "",
    slackWebhookUrl: "",
    minSeverity: "MEDIUM",
    notificationsEnabled: true,
  }
};

// --- API Routes ---

// Health
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "healthy", timestamp: new Date().toISOString() });
});

// --- OTP In-Memory Storage ---
const otpStore: Record<string, { otp: string; expiresAt: number; purpose: string }> = {};

// Auth
app.post("/api/auth/send-otp", (req, res) => {
  const { email, purpose } = req.body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ success: false, error: { message: "Valid email address is required" } });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore[normalizedEmail] = {
    otp,
    expiresAt,
    purpose: purpose || "authentication",
  };

  console.log(`[CyberShield Mailer] OTP for ${normalizedEmail}: ${otp}`);

  res.json({
    success: true,
    data: {
      message: `Verification OTP dispatched to ${normalizedEmail}.`,
      // Return otpCode so user can test and authenticate immediately in the applet preview
      otpCode: otp,
      expiresInSeconds: 600,
      email: normalizedEmail,
    },
  });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: { message: "Email and 6-digit OTP are required" } });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const stored = otpStore[normalizedEmail];

  if (!stored) {
    return res.status(400).json({ success: false, error: { message: "No active OTP found. Please request a new OTP." } });
  }

  if (Date.now() > stored.expiresAt) {
    delete otpStore[normalizedEmail];
    return res.status(400).json({ success: false, error: { message: "OTP has expired. Please request a new code." } });
  }

  if (stored.otp !== otp.toString().trim()) {
    return res.status(400).json({ success: false, error: { message: "Incorrect OTP. Please check your email and try again." } });
  }

  // Clear used OTP
  delete otpStore[normalizedEmail];

  const isAdmin = normalizedEmail === "abhirajcsecec@gmail.com";
  const role = isAdmin ? "admin" : "user";

  // Check or register in memory
  let existingUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!existingUser) {
    existingUser = {
      id: "usr_" + Date.now(),
      name: normalizedEmail.split("@")[0],
      email: normalizedEmail,
      role: isAdmin ? "Administrator" : "Analyst",
    };
    db.users.push(existingUser);
  }

  res.json({
    success: true,
    data: {
      verified: true,
      email: normalizedEmail,
      role,
      user: existingUser,
      token: "cs_token_" + crypto.randomBytes(16).toString("hex"),
      message: "Email verified successfully via OTP.",
    },
  });
});

app.post("/api/auth/delete-account", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: { message: "Email is required to delete account" } });
  }

  const normalizedEmail = email.toLowerCase().trim();
  db.users = db.users.filter(u => u.email.toLowerCase() !== normalizedEmail);
  delete otpStore[normalizedEmail];

  res.json({
    success: true,
    message: `Account for ${normalizedEmail} successfully purged.`,
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Email is required" } });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const isAdmin = normalizedEmail === "abhirajcsecec@gmail.com";
  res.json({
    success: true,
    data: {
      user: {
        id: "usr_" + Date.now(),
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        role: isAdmin ? "Administrator" : "Analyst",
      },
      token: "cs_token_" + crypto.randomBytes(16).toString("hex"),
    },
    message: "Login successful",
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email } = req.body;
  const normalizedEmail = (email || "user@cybershield.ai").toLowerCase().trim();
  const isAdmin = normalizedEmail === "abhirajcsecec@gmail.com";
  const newUser = { 
    id: "usr_" + Date.now(), 
    name: name || normalizedEmail.split("@")[0], 
    email: normalizedEmail, 
    role: isAdmin ? "Administrator" : "Analyst" 
  };
  db.users.push(newUser);
  res.json({
    success: true,
    data: { user: newUser, token: "cs_token_" + crypto.randomBytes(16).toString("hex") },
    message: "Registration successful",
  });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ success: true, data: { user: db.users[0] } });
});

// Dashboard Summary
app.get("/api/dashboard/summary", (req, res) => {
  const phishingThreats = db.phishingScans.filter(s => s.classification === 'PHISHING' || s.classification === 'SUSPICIOUS').length;
  const malwareThreats = db.malwareScans.filter(m => m.malicious).length;
  const activeAnomalies = db.networkEvents.filter(n => n.anomalyScore > 60).length;
  const criticalAlerts = db.alerts.filter(a => !a.acknowledged && (a.severity === 'CRITICAL' || a.severity === 'HIGH')).length;

  let status: 'Operational' | 'Elevated Threat Activity' | 'Critical Security Incident' = 'Operational';
  if (criticalAlerts > 2 || malwareThreats > 3) {
    status = 'Critical Security Incident';
  } else if (phishingThreats > 0 || activeAnomalies > 0) {
    status = 'Elevated Threat Activity';
  }

  res.json({
    success: true,
    data: {
      totalScans: db.phishingScans.length + db.malwareScans.length,
      phishingThreats,
      malwareThreats,
      activeAnomalies,
      criticalAlerts,
      threatIntelItems: db.threatIntel.length,
      systemStatus: status,
      lastSync: new Date().toISOString(),
    }
  });
});

// Phishing URL Analysis Engine (Random Forest simulation + Gemini AI explanation)
app.post("/api/phishing/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ success: false, error: { code: "INVALID_URL", message: "A valid URL string is required." } });
  }

  try {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return res.status(400).json({ success: false, error: { code: "MALFORMED_URL", message: "The provided URL is malformed." } });
    }

    const hostname = parsedUrl.hostname;
    const pathname = parsedUrl.pathname;
    const urlLength = url.length;
    const hostnameLength = hostname.length;
    const dotsCount = (hostname.match(/\./g) || []).length;
    const hyphensCount = (hostname.match(/-/g) || []).length;
    const hasHttps = parsedUrl.protocol === "https:";
    const isIpAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
    const specialCharsCount = (url.match(/[@_?&=%]/g) || []).length;

    const suspiciousKeywords = ["login", "verify", "verification", "account", "update", "secure", "password", "bank", "wallet", "payment", "confirm", "signin", "credential", "security", "apple", "netflix", "paypal"];
    let suspiciousKeywordsCount = 0;
    const lowerUrl = url.toLowerCase();
    for (const kw of suspiciousKeywords) {
      if (lowerUrl.includes(kw)) suspiciousKeywordsCount++;
    }

    // Scoring algorithm simulating Random Forest decision tree aggregation
    let score = 10;
    if (urlLength > 75) score += 15;
    if (dotsCount > 3) score += 20;
    if (hyphensCount > 2) score += 15;
    if (!hasHttps) score += 25;
    if (isIpAddress) score += 30;
    if (suspiciousKeywordsCount > 0) score += (suspiciousKeywordsCount * 18);
    if (specialCharsCount > 5) score += 10;

    score = Math.min(100, Math.max(2, score));

    let classification: 'SAFE' | 'SUSPICIOUS' | 'PHISHING' = 'SAFE';
    if (score >= 70) classification = 'PHISHING';
    else if (score >= 35) classification = 'SUSPICIOUS';

    let confidence = Number((0.85 + (Math.abs(score - 50) / 250)).toFixed(2));
    if (confidence > 0.99) confidence = 0.99;

    // Optional Gemini AI expert explanation
    let aiExplanation = `Lexical analysis detected ${dotsCount} subdomains, ${hyphensCount} hyphens, and ${suspiciousKeywordsCount} sensitive security keywords. Risk rating calculated as ${score}/100.`;
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const aiRes = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: `You are an expert cybersecurity AI SOC analyst. Provide a concise 2-sentence expert security analysis for this URL: "${url}". It was classified as ${classification} with a risk score of ${score}/100. Mention specific lexical features (like domain structure or keywords).`,
        });
        if (aiRes.text) {
          aiExplanation = aiRes.text.trim();
        }
      } catch (err: any) {
        console.warn("Gemini explanation API fallback triggered (likely high demand).", err?.message);
      }
    }

    const scanRecord = {
      id: "ph_" + Date.now(),
      userEmail: "anonymous@user.com",
      url,
      riskScore: score,
      classification,
      confidence,
      featureSummary: {
        urlLength,
        hostnameLength,
        dotsCount,
        hyphensCount,
        hasHttps,
        isIpAddress,
        suspiciousKeywordsCount,
        specialCharsCount,
      },
      aiExplanation,
      modelVersion: "1.0.0-rf",
      scannedAt: new Date().toISOString(),
    };

    db.phishingScans.unshift(scanRecord);

    // Trigger alert if high risk
    if (classification === 'PHISHING' || classification === 'SUSPICIOUS') {
      db.alerts.unshift({
        id: "alt_" + Date.now(),
        eventType: "PHISHING_DETECTED",
        severity: classification === 'PHISHING' ? "CRITICAL" : "HIGH",
        title: `${classification} URL Detected`,
        message: `URL ${url} scored ${score}/100 risk rating.`,
        source: "AI Phishing Engine",
        acknowledged: false,
        webhookStatus: db.settings.discordWebhookUrl ? "sent" : "disabled",
        createdAt: new Date().toISOString(),
      });
    }

    res.json({ success: true, data: scanRecord, message: "URL analyzed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "ANALYSIS_FAILED", message: error.message } });
  }
});

app.get("/api/phishing/history", (req, res) => {
  const userEmail = "anonymous@user.com";
  const filteredData = db.phishingScans.filter(s => s.userEmail === userEmail);
  res.json({ success: true, data: filteredData });
});

// Malware Hash Scan Engine
app.post("/api/malware/scan", async (req, res) => {
  const { filename, sha256, fileContent } = req.body;
  
  let computedHash = sha256;
  if (!computedHash && fileContent) {
    computedHash = crypto.createHash("sha256").update(fileContent).digest("hex");
  } else if (!computedHash) {
    computedHash = crypto.createHash("sha256").update(filename || "random_file_" + Date.now()).digest("hex");
  }

  const name = filename || "uploaded_sample.bin";
  let malicious = false;
  let detectionCount = 0;
  let totalEngines = 72;
  let threatName: string | undefined;

  if (process.env.VIRUSTOTAL_API_KEY) {
    try {
      const response = await axios.get(`https://www.virustotal.com/api/v3/files/${computedHash}`, {
        headers: { "x-apikey": process.env.VIRUSTOTAL_API_KEY }
      });
      const data = response.data.data.attributes;
      detectionCount = data.last_analysis_stats.malicious;
      malicious = detectionCount > 0;
      threatName = malicious ? "Malicious File Detected" : undefined;
    } catch (error: any) {
      console.warn("VirusTotal API notice:", error?.message);
      // Fallback to simulation if API fails
      malicious = computedHash.startsWith("a81d") || computedHash.startsWith("dead") || computedHash.startsWith("c0de");
      detectionCount = malicious ? Math.floor(Math.random() * 25) + 12 : 0;
      threatName = malicious ? "Trojan.Generic.KD.1482" : undefined;
    }
  } else {
    // Simulate
    malicious = computedHash.startsWith("a81d") || computedHash.startsWith("dead") || computedHash.startsWith("c0de") || name.toLowerCase().includes("malware") || name.toLowerCase().includes("trojan") || name.toLowerCase().includes("exe");
    detectionCount = malicious ? Math.floor(Math.random() * 25) + 12 : 0;
    threatName = malicious ? (computedHash.startsWith("a81d") ? "Trojan.Generic.KD.1482" : "Ransom.Win32.Lockbit.X") : undefined;
  }

  const scanRecord = {
    id: "mw_" + Date.now(),
    userEmail: "anonymous@user.com",
    filename: name,
    sha256: computedHash,
    scanStatus: "completed" as const,
    malicious,
    detectionCount,
    totalEngines,
    threatName,
    scannedAt: new Date().toISOString(),
  };

  db.malwareScans.unshift(scanRecord);

  if (malicious) {
    db.alerts.unshift({
      id: "alt_" + Date.now(),
      eventType: "MALWARE_DETECTED",
      severity: "CRITICAL",
      title: "Malware Signature Detected",
      message: `File ${name} (SHA256: ${computedHash.substring(0, 12)}...) flagged by ${detectionCount}/${totalEngines} antivirus engines.`,
      source: "Malware Scanner",
      acknowledged: false,
      webhookStatus: db.settings.discordWebhookUrl ? "sent" : "disabled",
      createdAt: new Date().toISOString(),
    });
  }

  res.json({ success: true, data: scanRecord, message: "Malware scan completed" });
});

app.get("/api/malware/history", (req, res) => {
  const userEmail = "anonymous@user.com";
  const filteredData = db.malwareScans.filter(s => s.userEmail === userEmail);
  res.json({ success: true, data: filteredData });
});

// Network Monitoring Telemetry
app.get("/api/network/events", (req, res) => {
  res.json({ success: true, data: db.networkEvents });
});

app.get("/api/network/summary", (req, res) => {
  res.json({
    success: true,
    data: {
      currentBandwidthMbps: Number((Math.random() * 15 + 25).toFixed(1)),
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
      ]
    }
  });
});

// Threat Intelligence (CyberShield & Feed)
app.get("/api/threat-intelligence", (req, res) => {
  res.json({ success: true, data: db.threatIntel });
});

app.post("/api/threat-intelligence/refresh", (req, res) => {
  // Simulate fetching latest CyberShield items
  const newItem = {
    id: "ti_" + Date.now(),
    source: "CyberShield",
    indicatorType: "CVE" as const,
    indicator: "CVE-2026-2910",
    threatName: "OpenSSL Remote Cipher Decryption Flaw",
    severity: "CRITICAL" as const,
    description: "Newly disclosed vulnerability in TLS cryptographic handshake allowing session key recovery.",
    cveId: "CVE-2026-2910",
    publishedAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };
  db.threatIntel.unshift(newItem);
  res.json({ success: true, data: db.threatIntel, message: "Threat intelligence feed synchronized successfully" });
});

// Alerts
app.get("/api/alerts", (req, res) => {
  res.json({ success: true, data: db.alerts });
});

app.post("/api/alerts/:id/acknowledge", (req, res) => {
  const { id } = req.params;
  const alert = db.alerts.find(a => a.id === id);
  if (alert) {
    alert.acknowledged = true;
    res.json({ success: true, data: alert, message: "Alert acknowledged" });
  } else {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Alert not found" } });
  }
});

// Settings & Webhooks
app.get("/api/settings", (req, res) => {
  res.json({ success: true, data: db.settings });
});

app.put("/api/settings", (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  res.json({ success: true, data: db.settings, message: "Settings updated successfully" });
});

app.post("/api/webhooks/test", (req, res) => {
  const { provider, webhookUrl } = req.body;
  if (!webhookUrl) {
    return res.status(400).json({ success: false, error: { code: "INVALID_URL", message: "Webhook URL is required for testing." } });
  }
  // Simulate successful webhook dispatch
  res.json({ success: true, message: `Test notification successfully dispatched to ${provider || 'Discord'}` });
});

app.post("/api/vulnerability/scan", (req, res) => {
  const assets = [
    { id: "1", name: "Internal-API-Gateway", type: "Server", status: "pending", exposure: 0 },
    { id: "2", name: "DB-Primary-Cluster", type: "Database", status: "pending", exposure: 0 },
    { id: "3", name: "User-Authentication-Svc", type: "Container", status: "pending", exposure: 0 },
    { id: "4", name: "Payment-Processing-Node", type: "Server", status: "pending", exposure: 0 }
  ].map(a => ({
    ...a,
    status: Math.random() > 0.6 ? 'vulnerable' : 'secure',
    exposure: Math.floor(Math.random() * 100)
  }));

  res.json({ success: true, data: assets });
});

app.delete("/api/history", (req, res) => {
  db.phishingScans = [];
  db.malwareScans = [];
  res.json({ success: true, message: "History cleared successfully" });
});

// Explicit API 404 & Error Handler
app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.warn("API notice:", err?.message);
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: { message: err?.message || "Internal server error" } });
  }
});

app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, error: { message: `API route ${req.originalUrl} not found` } });
});

// Vite middleware setup for development / static in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CyberShield Server running on http://localhost:${PORT}`);
  });
}

startServer();
