FUNDING PROPOSAL

CyberShield AI: A Web-Based Real-Time Cybersecurity Monitoring Dashboard with AI-Assisted Threat Analysis

Submitted To:
Kerala Startup Mission (KSUM)

Submitted By:
Project Team – CyberShield AI
Department of Computer Engineering
[College Name]
Kerala, India

Academic Year: 2026–2027

---

1. Executive Summary

CyberShield AI is an intelligent, lightweight cybersecurity monitoring and threat detection platform designed to provide small and medium-sized enterprises (SMEs), educational institutions, and junior Security Operations Center (SOC) analysts with real-time threat intelligence, automated detection, and explainable AI-assisted remediation guidance.

Modern organizations face severe cybersecurity challenges, including sophisticated credential-harvesting phishing campaigns, obfuscated and fileless malware, stealthy network exfiltration, and alert fatigue caused by disparate, siloed security tools. Commercial enterprise SIEM/SOAR platforms are prohibitively expensive, demand complex dedicated infrastructure, and typically produce raw statistical alerts without human-readable explanations.

CyberShield AI proposes a centralized, intuitive, and high-performance digital security platform that unifies real-time telemetry, dual-engine phishing detection, client-side malware forensics, threat intelligence aggregation, and automated multi-channel alerting into a cohesive dashboard. The platform incorporates the Google Gemini API to translate opaque detection telemetry into clear, plain-language threat explanations and actionable mitigation steps.

The proposed project seeks funding from the Kerala Startup Mission (KSUM) to develop a scalable deployment prototype, conduct simulated enterprise testing, enhance zero-day threat scrapers and sandboxing features, and carry out an initial pilot deployment across educational and SME networks.

---

2. Background

The rapid digitization of public administration, banking, academic institutions, and small businesses has drastically expanded the cyber threat landscape. Phishing remains the initial access vector in over 85% of confirmed security breaches, while polymorphic and fileless malware continues to evade conventional static antivirus filters.

However, smaller organizations and regional IT teams struggle to defend their digital assets due to:

- High licensing and operational costs of enterprise SIEM/SOAR tools
- A shortage of specialized, highly trained cybersecurity analysts
- The "black-box" nature of machine learning detection models that fail to explain the rationale behind alerts
- The lack of unified platforms combining URL scanning, malware forensics, and network telemetry
- Delays in incident triage and escalation when threats occur outside active working hours
- Reliance on multiple disconnected web portals and command-line utilities
- Difficulty communicating technical cyber risks to non-technical organizational decision-makers
- Inability to quickly compute file hashes and verify them against global threat intelligence

CyberShield AI is proposed as an accessible, intelligent digital shield that bridges the gap between sophisticated machine learning threat detection and human operational response.

---

3. Problem Statement

Security operations teams and small IT units frequently require instant, consolidated insights regarding suspicious incoming URLs, unexpected binary payloads, network bandwidth anomalies, and emerging global vulnerabilities. However, critical telemetry is scattered across fragmented tools, external threat feeds, and isolated server logs.

Furthermore, existing machine learning classifiers output raw probabilistic scores without context, leaving junior analysts unable to differentiate between benign network behavior and stealthy zero-day attacks.

There is therefore a critical need for an all-in-one, lightweight, and explainable web-based cybersecurity platform that can ingest live threat data, perform rapid dual-engine analysis, generate natural-language threat explanations, and automate incident alerting through a centralized, responsive interface.

---

4. Proposed Solution

CyberShield AI provides a consolidated cybersecurity command center consisting of the following major components:

4.1 Worker & Analyst Authentication (RBAC)

Analysts and administrators can securely authenticate into the platform with granular privileges.

Features include:

- Multi-factor and OTP-based email verification
- Role-Based Access Control (RBAC: Administrator vs Security Analyst)
- Secure session state management
- Token-based API authorization
- Protected administration controls (threat quarantine, webhook configuration)
- Immutable audit logging of all analyst investigations

4.2 Dual-Engine Phishing Detection

A two-way cross-verification engine evaluates suspicious URLs in parallel:

- Engine 1: PhishGuard AI Cloud Model trained on 235,000 verified URL samples
- Engine 2: CyberShield Multi-Heuristic & Random Forest Lexical Analyzer computing 15 structural features (Shannon entropy, subdomain depth, token frequency, IP detection)
- Automated consensus logic that detects full agreement or discordant verdicts
- Combined risk scoring (0–100) and statistical confidence metrics

4.3 Explainable AI Threat Analysis (Google Gemini API)

The platform integrates the Google Gemini Generative AI engine as a virtual AI SOC Analyst.

The AI Co-Pilot helps analysts:

- Understand the exact structural and lexical anomalies that triggered a detection
- Receive plain-language, 2-sentence executive threat summaries
- Review context-aware remediation guidance and perimeter blocking steps
- Eliminate the ambiguity of black-box machine learning models

4.4 In-Browser Malware Forensics Engine

A client-side digital forensics laboratory where analysts can inspect suspicious files.

Features include:

- Instant SHA-256 hash generation in the browser using the Web Cryptography API (`crypto.subtle`)
- Privacy preservation: zero binary upload required for initial hash reputation checks
- Correlation against 72+ global antivirus vendor signatures (VirusTotal API integration structure)
- PE header breakdown, binary byte-level Shannon entropy calculation, and packer detection

4.5 Real-Time Network Telemetry & Threat Intelligence

The platform continuously monitors internal network telemetry and aggregates global threat feeds.

Features include:

- 10-second periodic auto-refresh telemetry tracking bandwidth, active connections, and egress spikes
- Flagging anomalous egress volume and connections to known Tor exit nodes
- Live CVE vulnerability monitoring and indicator of compromise (IOC) search
- Sub-second client-side filtering across live threat feeds

4.6 Automated Multi-Channel Alerting

When critical threats or discordant dual-engine verdicts are detected, CyberShield AI triggers real-time alerts.

Features include:

- Direct webhook dispatch to team communication channels (Discord and Slack)
- Severity-based incident categorization (LOW, MEDIUM, HIGH, CRITICAL)
- Alert deduplication and incident triage workflows
- Live visual alerts with color-coded risk badges on the dashboard

---

5. Objectives

The primary objectives of CyberShield AI are:

1. To develop a centralized, lightweight web-based SOC dashboard for real-time cybersecurity monitoring.
2. To build and deploy a Two-Way Dual-Engine Phishing Detector combining deep cloud ML with local lexical feature analysis.
3. To incorporate Shannon Entropy and structural feature extraction for detecting obfuscated and algorithmically generated domains (DGAs).
4. To integrate Large Language Models (Google Gemini API) for generating plain-English, explainable threat justifications.
5. To implement browser-based client-side cryptographic hashing for private, rapid malware forensics across 72+ vendor engines.
6. To visualize real-time network telemetry, anomalous egress flows, and global threat intelligence feeds.
7. To provide automated multi-channel webhook alerting (Discord/Slack) to reduce incident response latency.
8. To enforce Role-Based Access Control (RBAC) and maintain tamper-resistant audit logs of security operations.
9. To validate the platform through institutional pilot testing within college and SME network environments.

---

6. Innovation

The major innovation of CyberShield AI is the seamless convergence of detection, explainability, telemetry, and automated alerting into a single unified platform.

Instead of requiring analysts to toggle between isolated tools, CyberShield AI delivers:

Ingestion → Dual-Engine Cross-Verification → Gemini AI Explanation → Forensics Correlation → Webhook Escalation

within one unified, dark-mode-optimized SOC environment.

The platform eliminates black-box obscurity by treating human-readable AI explanation as a first-class operational output rather than an afterthought.

---

7. Target Beneficiaries

The primary beneficiaries are:

- Small and Medium-Sized Enterprises (SMEs) lacking dedicated enterprise SOC budgets
- Educational institutions, colleges, and university computer centres
- Junior SOC analysts, IT support personnel, and security trainees
- Regional government IT departments and public sector digital units
- Startup development teams seeking lightweight infrastructure security monitoring

Secondary beneficiaries may include:

- Computer Emergency Response Teams (CERTs) and regional cyber cells
- Cybersecurity researchers and academic students studying threat patterns
- Managed Security Service Providers (MSSPs) seeking lightweight client portals
- Corporate HR and compliance teams requiring employee awareness simulations

---

8. Technology Stack

The proposed technology stack includes:

Frontend

- React 18
- TypeScript
- Vite Build Engine
- Tailwind CSS
- Recharts (Real-Time Telemetry & Data Visualization)
- Lucide React (Cybersecurity Iconography)

Backend

- Node.js
- Express.js
- TypeScript
- RESTful Micro-Services
- Axios

Database & Persistence

- Firebase Firestore
- In-Memory High-Speed Cache
- Local Browser Caching & IndexedDB

Authentication

- Role-Based Access Control (RBAC)
- One-Time Password (OTP) verification
- Secure session state tokens

AI & Machine Learning

- Google Gemini Generative AI SDK (`@google/genai`)
- Scikit-Learn (Random Forest URL Classifier)
- Python 3.10+ (Feature Engineering Pipeline)
- PhishGuard AI Cloud Model (235,000 verified URL corpus)
- Shannon Entropy algorithmic calculators

Malware & Forensics

- Web Cryptography API (`crypto.subtle`) for local SHA-256 generation
- 72+ Antivirus Engine Correlation Structure (VirusTotal API)
- Binary byte-frequency entropy analysis

Infrastructure & Integrations

- Discord & Slack Incoming Webhooks
- Google Cloud Run / Render Container Hosting
- CI/CD automated build pipelines
- Cloudflare DNS & SSL protection

---

9. System Architecture

The proposed architecture consists of the following major layers:

                       CYBERSHIELD AI
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
     React Client (Vite)                Telemetry Visualizer
     (Dark-Mode SOC UI)                 (Recharts & Live Feeds)
          │                                     │
          └──────────────────┬──────────────────┘
                             │
                    Express.js REST APIs
                    (TypeScript Backend)
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    Dual-Engine ML      Gemini AI SOC      Malware Forensics
    URL Classifiers       Explainer          (SHA-256 & 72+ AV)
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
   Firebase / Cache                    External Webhooks
   (Audit Logs & Alerts)               (Discord / Slack)
                             │
                      Cloud Hosting
                (Render / Cloud Run / GCP)

---

10. Methodology

The project will be developed using an agile, iterative engineering methodology.

Phase 1 – Requirement Analysis & Threat Modeling

- Analyze common threat vectors targeting regional institutions and SMEs.
- Review 12 foundational research papers on phishing, malware, and explainable AI.
- Formulate functional and non-functional software specifications.
- Define RBAC policies and automated triage criteria.

Phase 2 – System Design & ML Formulation

- Design modular client-server API contracts and database schemas.
- Engineer the 15-feature URL lexical extraction engine (`features.py`).
- Implement Shannon entropy mathematical calculations.
- Train the initial Random Forest classifier (`train_model.py`) using balanced datasets.

Phase 3 – Core Prototype Development

Development of:

- Central SOC Overview Dashboard
- Dual-Engine Phishing URL Scanner
- In-browser SHA-256 Malware Forensics Scanner
- Network Telemetry simulator and live connection trackers
- Threat intelligence feed aggregator with instant filtering

Phase 4 – AI Explanation & Cloud Consensus Integration

- Integrate Google Gemini API for automated threat justification generation.
- Connect the live external PhishGuard 235k AI model on Render.
- Build consensus logic for full agreement vs discordant threat verdicts.
- Deploy automated Discord and Slack webhook escalation pipelines.

Phase 5 – Security Hardening & Persistence Optimization

- Harden role-based access control (Admin vs Analyst permissions).
- Resolve browser iframe IndexedDB lifecycle and database stability edge cases.
- Implement in-memory fallback persistence for resilient uptime.
- Audit API endpoints for data protection and input validation.

Phase 6 – Testing & Evaluation

Testing will include:

- Unit testing of feature extraction algorithms and regex parsers
- Classification accuracy, precision, recall, and ROC-AUC validation
- Latency and throughput benchmarking under simulated traffic
- Security penetration testing and input sanitization audits
- User acceptance testing with student analysts and IT administrators

Phase 7 – Pilot Deployment

A controlled pilot deployment will be conducted across campus computer labs and a partner small enterprise network.

User feedback, detection logs, and false-positive rates will be systematically reviewed for optimization.

---

11. Expected Outcomes

At the end of the proposed funding period, the project aims to deliver:

1. A production-grade, deployed CyberShield AI cybersecurity dashboard.
2. A validated Two-Way Dual-Engine Phishing Detection system achieving $>96\%$ classification accuracy.
3. An automated Explainable AI (XAI) engine generating plain-language threat rationales via Google Gemini.
4. A high-speed client-side malware analysis module utilizing zero-upload SHA-256 hashing.
5. Real-time network telemetry visualization with 10-second automated refresh cycles.
6. Multi-channel automated webhook dispatchers for instantaneous Discord and Slack alert notifications.
7. A complete 15-feature extraction library including Shannon entropy detection.
8. Enforced Role-Based Access Control and immutable audit logging for enterprise compliance.
9. A comprehensive benchmark evaluation report documenting latency, accuracy, and false-positive metrics.
10. A pilot deployment report detailing operational performance in a live institutional environment.

---

12. Social & Industrial Impact

CyberShield AI creates meaningful societal and industrial impact by democratizing access to enterprise-grade cybersecurity capabilities for resource-constrained organizations.

Expected impact includes:

- Significant reduction in successful credential-theft and phishing attacks against regional organizations
- Democratizing SOC tooling for SMEs that cannot afford multi-lakh commercial SIEM licenses
- Transforming opaque ML alerts into educational, explainable insights for junior analysts
- Accelerated incident response through automated real-time webhook escalation
- Enhanced data privacy through client-side cryptographic file hashing
- Fostering indigenous cybersecurity innovation and startup capabilities within Kerala's tech ecosystem
- Providing a practical testbed for cybersecurity training in colleges and universities

---

13. Sustainability and Scalability

CyberShield AI is architected from the ground up for modular horizontal scalability.

Future versions can incorporate:

- Autonomous web scraping daemons ingesting continuous live feeds from PhishTank, OpenPhish, and URLhaus
- Containerized microVM sandboxes (Firecracker / Docker) for dynamic, live URL detonation
- Native mobile applications (Android / iOS) for on-the-go security officer notifications
- Integration with national threat-sharing frameworks and CERT-In advisory feeds
- Custom YARA and Sigma rule compilers for tailored enterprise threat matching
- Offline-first progressive web app (PWA) capabilities for air-gapped network management

The decoupled micro-service architecture allows new detection models or feeds to be added without modifying the core presentation layer.

---

14. Project Timeline

Phase| Activities| Duration
Phase 1| Requirement analysis, literature review & threat modeling| Month 1
Phase 2| System architecture, feature engineering & model training| Month 2
Phase 3| Backend API, dual-engine scanner & malware forensics dev| Months 3–4
Phase 4| Frontend dashboard, telemetry visualization & Recharts UI| Months 3–4
Phase 5| Gemini AI XAI integration & Discord/Slack webhook dispatch| Months 5–6
Phase 6| System hardening, security auditing & performance testing| Month 7
Phase 7| Campus network pilot deployment & institutional testing| Month 8
Phase 8| Pilot evaluation, accuracy fine-tuning & final KSUM report| Month 9

Total proposed duration: 9 months

---

15. Proposed Budget

The following is an indicative budget for prototype development, security auditing, and institutional pilot deployment tailored for CyberShield AI.

Expense| Estimated Cost
Cloud hosting and dedicated server infrastructure (AWS/GCP/Render)| ₹40,000
AI / LLM API services (Google Gemini API production quotas)| ₹50,000
Threat intelligence feeds, CVE tracking & VirusTotal API subscriptions| ₹30,000
Database, logging and secure cloud storage (Firestore/Cloud SQL)| ₹20,000
Software, development tools and ML pipeline compute| ₹20,000
Third-party security auditing, VAPT and penetration testing| ₹30,000
UI/UX refinement, SOC ergonomics and accessibility testing| ₹15,000
Campus pilot deployment, simulated threat testing & testbeds| ₹35,000
User training, documentation and onboarding workshops| ₹20,000
Project documentation, patent filing & publication charges| ₹15,000
Contingency and infrastructure reserve| ₹25,000
Total| ₹3,00,000

The final budget may be revised according to the funding agency's permissible expenditure categories and funding guidelines.

---

16. Funding Requested

The project team requests financial assistance of:

₹3,00,000 (Rupees Three Lakh Only)

The requested funding will primarily be utilized for:

- Dedicated cloud computing and scalable micro-service infrastructure
- Production Google Gemini AI API token quotas for automated explanations
- High-speed threat intelligence API subscriptions
- Third-party vulnerability assessment and penetration testing (VAPT)
- Campus pilot deployment and live threat telemetry evaluation
- Hardware testbed setup and student onboarding workshops

---

17. Risk Management

Risk| Mitigation
External API rate limits or downtime| Local in-memory caching and graceful heuristic fallback mechanisms
Adversarial evasion and polymorphic URLs| Combining structural heuristics with Shannon entropy and dual-engine consensus
High inference latency in UI| Asynchronous API workers and immediate local heuristic pre-scoring ($<15$ ms)
Data privacy concerns with malware uploads| Client-side cryptographic SHA-256 hashing; zero binary content transferred
Alert fatigue for security analysts| Severity-based alert deduplication and automated triage filtering
Inaccurate or hallucinatory AI explanations| Grounded system prompts strictly bound to computed feature metrics
Browser lifecycle/tab backgrounding issues| Resilient in-memory persistence and patched IndexedDB lifecycle handlers

---

18. Monitoring and Evaluation

The project will be evaluated using measurable technical and operational indicators:

- Dual-engine phishing classification accuracy (Target: $\ge 96\%$)
- False positive and false negative rates across benchmark URL corpora
- Average end-to-end scan latency (Target: $< 2.0$ seconds including Gemini AI explanation)
- Client-side SHA-256 hashing throughput for file payloads up to 50 MB (Target: $< 50$ ms)
- Number of active telemetry events processed per minute without UI degradation
- Webhook alert dispatch latency to Discord and Slack (Target: $< 500$ ms)
- System availability and uptime during continuous pilot monitoring (Target: $\ge 99.5\%$)
- Number of participating users and analysts during the institutional pilot phase
- Feedback scores from junior analysts regarding the utility of Gemini AI explanations
- Number of security vulnerabilities identified and remediated during VAPT audits

---

19. Future Scope

The long-term vision of CyberShield AI is to evolve into an open, community-driven, autonomous Security Operations platform for enterprise defense.

Future development will encompass:

- Autonomous browser sandboxing for dynamic URL detonation and DOM rendering
- Continuous web-scraping pipelines for zero-day threat intelligence ingestion
- Progressive Web App (PWA) with native mobile push notifications for incident responders
- Integration with national threat response bodies (CERT-In) and automated incident dispatch
- YARA and Sigma signature matching engines running natively in WebAssembly
- Multi-tenant cloud architecture for Managed Security Service Providers (MSSPs)
- Machine learning model auto-retraining pipeline triggered by verified crowdsourced threats

---

20. Conclusion

CyberShield AI proposes a practical, high-impact, technology-driven approach to democratizing modern cybersecurity monitoring and threat detection.

By seamlessly uniting dual-engine phishing detection, client-side cryptographic malware forensics, live network telemetry, explainable AI justifications via Google Gemini, and automated webhook alerting into a single accessible interface, the platform addresses the critical research-to-operations gap facing modern security teams.

Funding from the Kerala Startup Mission (KSUM) will enable the project team to transition the current high-fidelity working prototype into a robust, independently audited, and pilot-tested cybersecurity platform ready for real-world deployment across educational institutions and enterprise environments in Kerala.

The project team therefore seeks financial and institutional support to develop, validate, and pilot CyberShield AI – A Web-Based Real-Time Cybersecurity Monitoring Dashboard with AI-Assisted Threat Analysis.

---

21. Project Team

Name| Role| Responsibility
[Name]| Project Lead & Full-Stack Developer| Overall project coordination, Node/Express API backend, dual-engine integration & DB resilience
[Name]| Research Lead & Web Scraping Engineer| Research documentation, literature survey, web scraping architecture & UI design
[Name]| AI/ML Engineer| Random Forest URL classifier, 15-feature extraction engine & threat intel aggregation
[Name]| Faculty Mentor| Technical guidance, project review, and academic coordination
[Name]| Faculty Mentor| Cybersecurity architecture review and system validation
[Name]| Faculty Mentor| Departmental coordination and research methodology oversight

---

22. Contact Information

Project Name: CyberShield AI
Institution: [College Name]
Department: Department of Computer Engineering
Project Coordinator: [Name]
Email: [Email Address]
Phone: [Contact Number]
Location: Kerala, India

---

Declaration

We hereby declare that the information provided in this proposal is prepared for the purpose of seeking funding and institutional support from the Kerala Startup Mission (KSUM) for the development, security auditing, and pilot implementation of the CyberShield AI Cybersecurity Monitoring Dashboard.

We undertake to utilize any funding received exclusively for the approved objectives of the project and to maintain meticulous records of all project activities, milestones, and expenditures.

Place: ____________
Date: ____________

Project Coordinator: ____________________

Team Member: ____________________

Team Member: ____________________

Faculty Guide: ____________________

Head of Department: ____________________

Institution Seal: ____________________
