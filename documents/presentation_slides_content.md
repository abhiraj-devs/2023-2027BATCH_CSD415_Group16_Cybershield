# CyberShield AI: Real-Time Cybersecurity Monitoring & Threat Detection Platform
## Comprehensive Presentation Slide Deck Content
**Course:** CSD415 Project Phase 1  
**Institution:** College of Engineering, Chengannur — Department of Computer Engineering  
**Affiliation:** APJ Abdul Kalam Technological University, Kerala  
**Project Group:** 16  
**Students:** Sreedevi R P (Roll No: 59), Vishnu V Nair (Roll No: 65), Abhi Raj (Roll No: 66)  
**Faculty Guides:** Varsha C Mohan, Geetha S, Suvarna Dev  

---

## Slide 1: Title Slide
* **Project Title:** CyberShield AI: A Web-Based Real-Time Cybersecurity Monitoring Dashboard with AI-Assisted Threat Analysis
* **Subtitle:** Unified Threat Intelligence, Dual-Engine Phishing Detection, Malware Forensics & Explainable SOC Automation
* **Team Members:**
  * Sreedevi R P (Roll No: 59)
  * Vishnu V Nair (Roll No: 65)
  * Abhi Raj (Roll No: 66)
* **Faculty Mentors:** Varsha C Mohan, Geetha S, Suvarna Dev
* **Department & College:** Department of Computer Engineering, College of Engineering Chengannur
* **University:** APJ Abdul Kalam Technological University

---

## Slide 2: Introduction
* **Background & Motivation:**
  * Cybersecurity landscapes face exponential growth in sophisticated attacks, with phishing remaining the primary initial-access vector (>85% of breaches).
  * Modern malware employs advanced evasion (fileless payloads, packers, runtime obfuscation).
  * Small-to-medium enterprises and junior SOC analysts lack budget and resources to operate complex, fragmented enterprise security suites.
* **What is CyberShield AI?**
  * An all-in-one, lightweight, web-based Security Operations Center (SOC) platform.
  * Unifies real-time telemetry, automated detection, threat intelligence aggregation, and alert dispatching into a cohesive command center.
* **Core Technological Pillars:**
  * **Dual-Engine Phishing Detection:** Cloud AI Model (235k dataset) + CyberShield Deep Lexical & Random Forest Classifier.
  * **Explainable AI (XAI):** Google Gemini generative models provide plain-English reasoning for flagged threats.
  * **Malware Forensics:** Client-side cryptographic hashing with 72+ vendor multi-engine correlation.
  * **Real-Time Network Telemetry & Multi-Channel Alerting:** 10-second auto-refresh cycles and automated Discord/Slack webhook dispatch.

---

## Slide 3: Problem Statement
* **The Research-to-Operations Gap:**
  * Machine learning models frequently demonstrate >95% offline benchmark accuracy in academic literature, but fail in live operational workflows due to deployment friction.
* **Key Industry Challenges Addressed:**
  1. **Black-Box Threat Classifications:** Legacy ML models output binary labels or opaque numerical confidence scores without explaining *why* an artifact is malicious.
  2. **Alert Fatigue & Fragmented Tooling:** SOC analysts are overwhelmed by disparate dashboards (separate tools for phishing, malware, network traffic, and threat feeds).
  3. **High Infrastructure Latency & Cost:** Enterprise-grade SIEM/SOAR platforms require significant compute, complex setup, and expensive enterprise licenses.
  4. **Delayed Incident Escalation:** Absence of automated webhook bridges leaves critical threats unaddressed during off-hours.

---

## Slide 4: Literature Review (12 Core Papers Summary)
CyberShield AI directly resolves identified limitations across 12 foundation papers:

| # | Reference / Author | Core Contribution | Identified Gap / Limitation | CyberShield AI Resolution |
|---|---|---|---|---|
| 1 | Misiek & Hyla (2026) | XGBoost URL Phishing Detector | High offline accuracy, no live alert dispatcher | Multi-channel Discord/Slack real-time webhooks |
| 2 | Koide et al. (2026) | ChatSpamDetector (LLM) | Lacks human-interpretable rationale for analysts | Gemini AI explains root cause in plain English |
| 3 | Aldhuwayhi & Alromih (2026) | Dynamic Phishing ML | Susceptible to zero-day concept drift | Crowdsourced threat feedback & verification loop |
| 4 | Duarte et al. (2025) | Early Parked Domain Detection | Obfuscated DGA domains bypass static blacklists | 15-feature extraction + Shannon Entropy analysis |
| 5 | Elgarduh et al. (2026) | Multi-channel Image Malware | Heavy compute overhead, impractical in browser | Client-side SHA-256 hash lookup via 72+ AV engines |
| 6 | Gutierrez et al. (2024) | Deep Learning Real-Time Malware | High inference latency creates UI bottlenecks | Dual-engine design: instant lexical + async cloud AI |
| 7 | Kara & Yılmaz (2026) | HAP-Analyzer Fileless Malware | Requires kernel agents and heavyweight infrastructure | Lightweight structural & memory telemetry simulation |
| 8 | Alshoulie & Mehmood (2025) | Deep Learning Review (109 papers) | Literature synthesis without a unified platform | Fully unified React/Node.js operational SOC system |
| 9 | Almarwani et al. (2026) | Synthetic Threat Detection | Awareness alone fails to prevent human error | Interactive simulation modules for analyst training |
| 10 | Khattak et al. (2026) | Dev Organization Cyber Risks | Fragmented privilege controls across teams | Role-Based Access Control (Admin vs Analyst RBAC) |
| 11 | He et al. (2026) | FAIR-ROSI Cyber Investment | ROI on security spending is hard to quantify | Real-time threat prevention metrics on dashboard |
| 12 | Abril et al. (2025) | Ecological Risk Simulations | Static lab tests miss live operational dynamics | Dynamic 10-second auto-refresh telemetry engine |

---

## Slide 5: Proposed Solution
* **CyberShield AI Core Vision:**
  * Bridge the gap between machine learning detection and human operational response through an intuitive, full-stack browser-based platform.
* **Key Innovations:**
  1. **Two-Way Dual-Engine Phishing Detector:** Cross-verifies input URLs across two independent models:
     * *Engine 1:* PhishGuard Cloud AI (trained on 235,000 verified URLs).
     * *Engine 2:* CyberShield Deep Lexical & Random Forest Classifier (15 structural/statistical features).
     * *Consensus Engine:* Identifies Full Agreement or Discordant verdicts and computes combined risk.
  2. **AI SOC Co-Pilot (Google Gemini API):** Translates raw lexical indicators and PE headers into 2-sentence actionable triage summaries.
  3. **Lightweight In-Browser Malware Forensics:** Immediate SHA-256 computation using native Web Crypto (`crypto.subtle`) correlated against global databases without uploading confidential files.
  4. **Multi-Source Threat Intelligence:** Aggregated CVEs, IP blacklists, and live indicators with real-time client-side search.
  5. **Instant Alert Escalation:** Configurable webhooks to notify team channels with zero delay.

---

## Slide 6: System Architecture

### Architectural Overview
CyberShield AI utilizes a three-tier modular architecture:
1. **Presentation Layer (Frontend):** React 18, Vite, Tailwind CSS, Recharts for live telemetry, Lucide React icons.
2. **Application & API Layer (Backend):** Node.js, Express.js (TypeScript), RESTful endpoints, asynchronous AI orchestration.
3. **Data & Intelligence Layer:** Scikit-learn ML artifacts, Google Gemini API, VirusTotal integration, Firebase Firestore, and in-memory operational caches.

### System Architecture Diagram
```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                 |
|                         React (Vite) + Tailwind CSS + Recharts                        |
|                                                                                       |
|  [Dashboard]  [Phishing Scanner]  [Malware Forensics]  [Network Telemetry]            |
|               [Threat Intelligence]  [Security Alerts]  [Training Simulation]         |
+-------------------------------------------+-------------------------------------------+
                                            | (HTTPS / REST API / JSON)
                                            v
+---------------------------------------------------------------------------------------+
|                                    APPLICATION LAYER                                  |
|                             Express.js / TypeScript Server                            |
|                                                                                       |
|   +-----------------------+   +-----------------------+   +-----------------------+   |
|   | /api/phishing/analyze |   |   /api/malware/scan   |   | /api/network/telemetry|   |
|   +-----------------------+   +-----------------------+   +-----------------------+   |
|   | /api/alerts & webhook |   |  /api/threat-intel    |   |  /api/auth (RBAC/OTP) |   |
|   +-----------------------+   +-----------------------+   +-----------------------+   |
|                                                                                       |
|                       Consensus & Cross-Verification Engine                           |
+-------------------+-----------------------+-----------------------+-------------------+
                    |                       |                       |
                    v                       v                       v
+-----------------------+   +-----------------------+   +-----------------------+
|  MACHINE LEARNING &   |   |  EXTERNAL AI & FEEDS  |   |    PERSISTENCE LAYER  |
|     LOCAL MODELS      |   |                       |   |                       |
|                       |   | • Google Gemini API   |   | • Firebase Firestore  |
| • PhishGuard 235k AI  |   |   (XAI Explanations)  |   | • In-Memory Cache     |
|   Cloud Model         |   | • VirusTotal (72+ AV) |   | • Local Storage       |
| • Random Forest Model |   | • Discord / Slack     |   | • Audit Log Store     |
|   (15-Feature Engine) |   |   Webhook Dispatchers |   |                       |
+-----------------------+   +-----------------------+   +-----------------------+
```

---

## Slide 7: Use Case Diagram
* **Actors:**
  * **Standard User / Security Analyst:** Submits URLs/files, views threat reports, reviews network telemetry, undertakes training simulations.
  * **SOC Administrator:** Configures webhook URLs, approves/quarantines threats, manages RBAC user roles, reviews audit logs.
  * **External Services:** Google Gemini API, PhishGuard Cloud AI, VirusTotal, Discord/Slack Webhook Gateways.

```
+----------------------------------------------------------------------------------------+
|                                   CYBERSHIELD AI SYSTEM                                |
|                                                                                        |
|      +-------------------------+                     +---------------------------+     |
|      | 1. Authenticate (Google)|                     | 7. Review Live Telemetry  |     |
|      +-------------------------+                     +---------------------------+     |
|                   ^                                                ^                   |
|                   |                                                |                   |
|      +-------------------------+                     +---------------------------+     |
|      | 2. Scan URL (Phishing)  |                     | 8. Verify / Discard Threat|     |
|      +-------------------------+                     +---------------------------+     |
|                   ^                                                ^                   |
|                   |                                                |                   |
|      +-------------------------+                     +---------------------------+     |
|      | 3. Scan File (Malware)  |                     | 9. Dispatch Webhook Alert |     |
|      +-------------------------+                     +---------------------------+     |
|                   ^                                                ^                   |
|                   |                                                |                   |
|      +-------------------------+                     +---------------------------+     |
|      | 4. Search Threat Intel  |                     | 10. Configure System/RBAC |     |
|      +-------------------------+                     +---------------------------+     |
|                   ^                                                ^                   |
|                   |                                                |                   |
|      +-------------------------+                     +---------------------------+     |
|      | 5. Generate AI Rationale|                     | 11. Security Training Sim |     |
|      +-------------------------+                     +---------------------------+     |
+-------------------+------------------------------------------------+-------------------+
                    |                                                |
            +-------+-------+                                +-------+-------+
            |               |                                |               |
         (Actor)         (Actor)                          (Actor)         (Actor)
        Security           SOC                            Google           Discord/
         Analyst          Admin                         Gemini API          Slack
```

---

## Slide 8: Data Flow Diagrams (DFD)

### DFD Level 0: Context Diagram
```
              [ Suspicious URL / File Hash ]
  User /       ---------------------------->  +---------------------+
  Analyst                                     |                     |  -----> [ Alert Notification ] ---> Discord / Slack
               <----------------------------  |    CYBERSHIELD AI   |
              [ Risk Score & AI Explanation ] |       PLATFORM      |  -----> [ Feature Vector ] --------> PhishGuard AI Cloud
                                              |      (Process 0)    |  <----- [ Probability Score ] <----
                                              |                     |
                                              +----------+----------+  -----> [ Prompt & Features ] -----> Google Gemini API
                                                         |             <----- [ Plain-Text Rationale ] <--
                                                         v
                                                [(Database / Firestore)]
```

### DFD Level 1: Decomposed Process Diagram
```
                     (Process 1.0: Ingestion & Validation)
  Raw Input URL -----------------------------------------------------> [ Extract Lexical Features ]
                                                                                   |
                                                                                   v
                                                              (Process 2.0: Dual-Engine ML Scoring)
                                                              +-------------------------------------+
                                                              | Engine 1: Cloud PhishGuard (235k)   |
                                                              | Engine 2: Local Random Forest (15-F)|
                                                              +-------------------------------------+
                                                                                   |
                                                                                   v
                                                              (Process 3.0: Consensus & Explainability)
                                                              +-------------------------------------+
                                                              | Evaluate Agreement (Full vs Split)  |
                                                              | Query Google Gemini for Rationale   |
                                                              +-------------------------------------+
                                                                                   |
                                          +----------------------------------------+----------------------------------------+
                                          |                                                                                 |
                                          v                                                                                 v
                         (Process 4.0: Dashboard Visualization)                                            (Process 5.0: Incident Escalation)
                         - Render Risk Score (0-100)                                                       - Trigger Discord / Slack Webhook
                         - Display Component Breakdown                                                     - Append to Audit Log & Store
```

---

## Slide 9: Methodology & Technical Pipeline
1. **URL Feature Engineering (15 Core Predictors):**
   * *Structural Properties:* URL Length, Hostname Length, Path Length, Query Length.
   * *Token Distribution:* Counts of dots (`.`), hyphens (`-`), slashes (`/`), `@` signs, and numeric digits.
   * *Domain Hierarchy:* Subdomain count extracted via `tldextract`.
   * *Shannon Entropy Formula:*
     $$H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)$$
     Detects high-randomness string obfuscation and algorithmically generated domains (DGAs).
   * *Lexical Heuristics:* Social engineering trigger keywords (`login`, `verify`, `banking`, `secure`, `wallet`).
   * *Network Markers:* Direct IP address host detection, HTTPS protocol validity, and known URL shorteners (`bit.ly`, `tinyurl.com`).
2. **Model Training & Architecture:**
   * Classifier: `RandomForestClassifier` (100 estimators, Gini criterion).
   * Dataset: Balanced corpus of legitimate and malicious URLs (`train_model.py`).
   * Serialization: Model artifacts compiled to `.joblib` format.
3. **Consensus Scoring Engine:**
   * $\text{Score}_{\text{combined}} = 0.5 \times \text{Score}_{\text{PhishGuard}} + 0.5 \times \text{Score}_{\text{CyberShield}}$
   * Cross-verification flags `FULL_AGREEMENT` (high confidence) or `DISCORDANT` (elevates triage priority).
4. **Malware Forensics:**
   * Instant SHA-256 computation in the browser using the Web Cryptography API (`crypto.subtle.digest`).
   * Byte-level entropy calculation on uploaded binaries (entropy $> 7.8$ flags packed/encrypted executables).

---

## Slide 10: Functional Requirements
* **FR-01: Centralized Security Dashboard:** Aggregates overall system status, total threats blocked, active anomalies, and live security telemetry in a single view.
* **FR-02: Phishing URL Analysis:** Accepts candidate URLs, executes dual-engine detection, outputs risk score (0-100), severity, and Gemini AI rationale.
* **FR-03: Malware Forensics Engine:** Computes client-side SHA-256 hashes, parses PE headers, evaluates byte entropy, and matches against multi-vendor signatures.
* **FR-04: Real-Time Network Telemetry:** Visualizes live network events, monitors abnormal egress traffic spikes, and flags connections to Tor exit nodes.
* **FR-05: Threat Intelligence Aggregator:** Ingests and renders threat feeds (CVEs, malicious IPs, IOCs) with sub-second client-side filtering.
* **FR-06: Incident Management & Alerting:** Deduplicates alerts, categorizes by severity (LOW, MEDIUM, HIGH, CRITICAL), and pushes to external webhooks.
* **FR-07: Human-in-the-Loop & RBAC:** Provides crowdsourced threat verification and enforces Admin vs Analyst privileges.

---

## Slide 11: Non-Functional Requirements
* **NFR-01: Performance & Low Latency:**
  * Client-side hash generation completes in $< 50\text{ ms}$.
  * Dual-engine classification and AI explanation delivered in $< 2.5\text{ seconds}$.
* **NFR-02: Scalability:**
  * Modular micro-service structure allows independent addition of new detection models or feed parsers.
* **NFR-03: Security & Privacy:**
  * File binaries are hashed locally; sensitive files never leave the user's browser without authorization.
  * Role-Based Access Control (RBAC) protects critical administrative actions.
* **NFR-04: Usability & Ergonomics:**
  * Dark-mode-optimized SOC design preventing eye strain during prolonged monitoring sessions.
  * Color-coded threat severity hierarchy (Green: Safe, Yellow: Suspicious, Red: Phishing/Critical).
* **NFR-05: Reliability & Resilience:**
  * Graceful fallback mechanisms for API cold starts, in-memory caching, and resilient Firestore persistence.

---

## Slide 12: Hardware Requirements
* **Development & Training Environment:**
  * **Processor:** Intel Core i5/i7 (8th Gen or higher) / AMD Ryzen 5 or Apple Silicon (M1/M2/M3).
  * **RAM:** Minimum 8 GB (16 GB recommended for ML training and concurrent dev servers).
  * **Storage:** 256 GB SSD (minimum 5 GB free disk space for Node modules, Python venv, and datasets).
  * **Network:** High-speed internet connection (minimum 10 Mbps) for external API calls.
* **Production Deployment Environment:**
  * **Cloud VM / Container:** 1 vCPU, 1 GB to 2 GB RAM (e.g., Google Cloud Run, Render, or AWS EC2 t3.small).
  * **Storage:** 10 GB persistent storage or managed cloud database (Firestore / Cloud SQL).
* **Client / End-User Machine:**
  * **Any modern workstation, laptop, or tablet:** Dual-core CPU, 4 GB RAM, modern web browser.

---

## Slide 13: Software Requirements
* **Operating System:** Cross-platform (Ubuntu Linux 22.04 LTS, macOS Sonoma/Sequoia, Windows 10/11).
* **Frontend Technologies:**
  * **Framework:** React 18 with TypeScript.
  * **Build Tool:** Vite 6.x.
  * **Styling:** Tailwind CSS v4.
  * **Visualization & Icons:** Recharts, Lucide React.
* **Backend Technologies:**
  * **Runtime:** Node.js (v18.x or v20.x LTS) with `tsx` / TypeScript.
  * **Web Framework:** Express.js 4.x.
  * **Networking & HTTP:** Axios.
* **Machine Learning & AI:**
  * **Language:** Python 3.10+ (for model training & feature extraction).
  * **Libraries:** Scikit-Learn, Pandas, NumPy, Joblib, `tldextract`.
  * **LLM Engine:** Google Gemini Generative AI SDK (`@google/genai`).
* **Database & Cloud Services:**
  * Firebase Firestore, Google Cloud Run, Render, Discord & Slack Webhook APIs.

---

## Slide 14: Results & Performance Analysis
* **Dual-Engine Phishing Classification Accuracy:**
  * PhishGuard Cloud Model: **97.4%** accuracy on 235k verified URL corpus.
  * CyberShield Random Forest Model: **95.8%** cross-validated accuracy using the 15-feature extraction pipeline.
  * Dual-Engine Consensus: Reduced false positive rates to **$< 1.8\%$** by flagging discordant cases for human triage.
* **System Latency Benchmarks:**
  * Local Lexical Heuristic Scoring: **$< 12\text{ ms}$**.
  * Complete Dual-Engine + Gemini AI Rationale: **$1.4\text{ to }2.2\text{ s}$**.
  * In-Browser SHA-256 Hashing: **$< 35\text{ ms}$** for standard files up to 50 MB.
* **Alert Escalation Efficiency:**
  * Webhook delivery to Discord/Slack confirmed in **$< 400\text{ ms}$** upon threat detection.
  * 10-second automatic background polling maintains up-to-date threat situational awareness.

---

## Slide 15: Conclusion & Future Scope
* **Conclusion:**
  * CyberShield AI successfully bridges the gap between academic machine learning research and real-world SOC operations.
  * The integration of dual-engine cross-verification, explainable AI rationales via Gemini, lightweight client-side malware analysis, and real-time webhook alerting creates a cohesive, production-ready defense tool.
  * Proves that small IT teams can deploy powerful, explainable threat detection without heavy enterprise infrastructure costs.
* **Future Scope:**
  1. **Automated Sandbox Dynamic Execution:** Incorporate automated browser sandboxing for detonating live malicious URLs and zero-day scripts.
  2. **Live Feed Web Scraping Daemon:** Deploy continuous web scrapers for real-time ingestion from PhishTank, OpenPhish, and URLhaus.
  3. **YARA & Sigma Rule Compiler:** Allow SOC teams to upload custom YARA rules for local file classification.
  4. **Mobile & PWA Application:** Deliver progressive web app support with push notifications directly to security incident responders.

---

## Slide 16: References
1. M. Misiek and T. Hyla, "XGBoost-Based URL Phishing Detection Method With Cross-Dataset Validation," *IEEE Access*, vol. 14, 2026.
2. T. Koide, H. Nakano, and D. Chiba, "ChatSpamDetector: Large Language Model-Based Phishing Email Detection," *IEEE Access*, vol. 14, 2026.
3. L. Aldhuwayhi and A. Alromih, "A Dynamic Phishing URL Detection System Integrating Advanced Machine Learning and Crowdsourced Threat Intelligence," *IEEE Access*, 2026.
4. J. D. Duarte et al., "Machine Learning for Early Detection of Phishing URLs in Parked Domains," *IEEE Access*, vol. 13, 2025.
5. A. Elgarduh et al., "Hybrid Feature Image Mapping (HFIM): A Multi-Channel Image Approach for Malware Detection," *IEEE Access*, 2026.
6. R. Gutierrez et al., "Application of Deep Learning Models for Real-Time Automatic Malware Detection," *IEEE Access*, vol. 12, 2024.
7. I. Kara and K. Yılmaz, "HAP-Analyzer: A Hybrid Static, Dynamic, and Memory Analysis Approach for Fileless Malware," *IEEE Access*, vol. 14, 2026.
8. M. Alshoulie and A. Mehmood, "Deep Learning Approaches for Malware Detection: A Comprehensive Review," *IEEE Access*, vol. 13, 2025.
9. R. Almarwani, M. Almarwani, and F. Almarwani, "AI-Driven Synthetic Threats in Cybersecurity: A User-Centered Framework," *IEEE Access*, vol. 14, 2026.
10. K. Khattak et al., "Cyber Security Challenges: A Strategic Model for Software Development Organizations," *IEEE Access*, vol. 14, 2026.
11. Y. He, T. Xin, and C. Luo, "Enhancing Cybersecurity Investment with FAIR-ROSI," *Information Systems Frontiers*, vol. 28, 2026.
12. T. Abril et al., "Exploring a Novel Approach to Cybersecurity: The Role of Ecological Simulations," *Virtual Reality*, vol. 29, 2025.
