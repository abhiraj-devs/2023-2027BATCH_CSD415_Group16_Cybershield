# CyberShield AI - Phishing URL Detection Architecture
# ----------------------------------------------------
# This document outlines the backend mechanics, algorithms, and integration 
# workflows for the Phishing URL Analysis module running in the server.

## 1. Input Validation & Parsing
When a user submits a URL to the `/api/phishing/analyze` endpoint, the backend first validates and parses the string using the native `URL` constructor. If no protocol is provided, it intelligently appends `https://`. This ensures all submitted data is properly formatted before analysis, preventing malformed URL crashes.

## 2. Lexical Feature Extraction
The engine breaks down the URL to perform a static lexical analysis, extracting key structural features known to indicate malicious intent:
- **Length Metrics:** Analyzes total URL length and hostname length (phishing URLs often use excessively long paths to hide payloads).
- **Subdomain Depth (`dotsCount`):** Counts periods in the hostname to detect subdomain nesting (e.g., `login.verify.apple-support.com`).
- **Hyphenation (`hyphensCount`):** Counts hyphens, a common tactic used to mimic legitimate domains (e.g., `paypal-secure-billing`).
- **Protocol Check (`hasHttps`):** Verifies if the site uses secure HTTPS encryption.
- **Direct IP Routing (`isIpAddress`):** Uses Regex to detect if the hostname is a direct IP address instead of a resolved domain name, which is highly suspicious.
- **Query Parameter Stuffing (`specialCharsCount`):** Counts symbols (`@, _, ?, &, =`) to detect complex redirect chains.
- **Keyword Matching (`suspiciousKeywordsCount`):** Scans the URL against a dictionary of sensitive, high-risk targets (e.g., "login", "verify", "secure", "bank", "apple", "paypal").

## 3. Risk Scoring Algorithm (Random Forest Simulation)
The backend calculates a numerical risk score (between 2 and 100) using a weighted algorithm designed to simulate a Random Forest decision tree:
- Starts with a baseline score of **10**.
- **URL Length > 75:** +15 points
- **Deep Subdomains (> 3 dots):** +20 points
- **High Hyphenation (> 2 hyphens):** +15 points
- **No HTTPS:** +25 points
- **Direct IP Address:** +30 points
- **Suspicious Keywords:** +18 points *per keyword*
- **High Special Characters (> 5):** +10 points

## 4. Classification & Confidence Scoring
Based on the final calculated risk score, the URL is bucketed into one of three threat classifications:
- **PHISHING:** Score ≥ 70
- **SUSPICIOUS:** Score ≥ 35 to 69
- **SAFE:** Score ≤ 34
The system mathematically derives a confidence percentage based on how far the score deviates from the ambiguous baseline (50), capping at 99%.

## 5. Gemini AI Expert Analysis Integration
If a Gemini API key is configured in the environment, the backend securely transmits the URL, classification, and score to the `gemini-3.6-flash` model via the `@google/genai` SDK. The AI acts as a SOC Analyst, generating a dynamic, 2-sentence expert security explanation.
*Fallback mechanism:* If the Gemini API is unreachable or experiences high demand, the backend gracefully falls back to generating a deterministic, template-based explanation using the extracted lexical features.

## 6. Persistence and Alerting
Once the scan concludes:
1. The detailed telemetry record is pushed to the database (history logs).
2. If the URL is classified as `PHISHING` or `SUSPICIOUS`, it automatically generates an incident in the internal **Alerts Dashboard** (Critical or High severity), notifying administrators of a detected threat.
