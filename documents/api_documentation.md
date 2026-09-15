# CyberShield AI Platform - API Documentation

## Base URL
`/api/v1`

## Authentication
All API endpoints require a Bearer token in the Authorization header.
`Authorization: Bearer <token>`

---

## 1. Phishing Detection Module

### `POST /analyze/phishing`
Analyzes a URL or email content for phishing indicators.

**Request Body:**
```json
{
  "url": "https://suspicious-link.com/login",
  "emailContent": "(optional) raw email body"
}
```

**Response:**
```json
{
  "classification": "PHISHING",
  "riskScore": 92,
  "confidence": 0.95,
  "featureSummary": {
    "urlLength": 35,
    "hasHttps": true,
    "suspiciousKeywordsCount": 2,
    "isIpAddress": false
  },
  "aiExplanation": "Brand impersonation detected with malicious redirect logic."
}
```

---

## 2. Malware Forensics Engine (72+ Entity Extraction)

### `POST /analyze/malware`
Submits a file hash for comprehensive static/dynamic entity extraction.

**Request Body:**
```json
{
  "filename": "invoice_update.exe",
  "hash": "44d88612fea8a8f36de82e1278abb02f"
}
```

**Response:**
```json
{
  "status": "MALICIOUS",
  "detectionCount": 65,
  "totalEngines": 72,
  "threatLabel": "Trojan.Ransom.WannaCry",
  "hapMemory": {
    "hiddenPid": "4092 (svchost.exe)",
    "c2Socket": "ESTABLISHED",
    "decryptionKey": "OBFUSCATED"
  },
  "reportSummary": "Critical ransomware behavior identified across 65 out of 72 engines."
}
```

---

## 3. Network Telemetry Dashboard

### `GET /telemetry/live`
Retrieves real-time packet flow and system performance metrics. (Also available via WebSocket at `wss://api.cybershield.local/telemetry/stream`)

**Response:**
```json
{
  "throughput": { "tx": "452 MB/s", "rx": "812 MB/s" },
  "activeConnections": 1205,
  "anomalies": [
    { "type": "DATA_EXFIL", "source": "192.168.1.55", "severity": "HIGH" }
  ]
}
```

---

## 4. Threat Intelligence Aggregation

### `GET /threat-intel/feed`
Retrieves the aggregated threat feed from multiple providers (MISP, Shodan, etc.)

**Query Parameters:**
- `severity` (optional)
- `type` (optional)

**Response:**
```json
[
  {
    "id": "ti-9901",
    "indicator": "185.12.33.90",
    "type": "IP_ADDRESS",
    "severity": "CRITICAL",
    "source": "abuse.ch",
    "tags": ["c2", "cobalt-strike"]
  }
]
```

---

## 5. Security Alerts System

### `GET /alerts`
Fetch active security alerts with rule-based deduplication applied.

### `POST /alerts/{id}/acknowledge`
Acknowledge an alert to remove it from the active critical queue.

---

## 6. Audit Logging

### `GET /audit/logs`
Retrieves immutable system logs mapping to user activities and detections. Role `ADMIN` required.
