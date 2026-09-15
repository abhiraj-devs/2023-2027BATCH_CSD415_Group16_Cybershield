# Network Telemetry Methodology

## Overview
The Network Telemetry module provides real-time packet inspection, anomaly detection, and bandwidth monitoring across all managed endpoints. It is designed to offer security analysts immediate visibility into network traffic patterns and potential threats.

## Data Collection
Network traffic is continuously monitored and logged. The system captures critical metadata from each network event, including:
- **Source and Destination IPs**: For tracking origin and target endpoints.
- **Protocol and Port**: To identify the type of service being accessed (e.g., TCP, UDP, HTTPS, DNS).
- **Packet and Byte Counts**: To measure the volume of data transferred.
- **Bandwidth**: Measured in Mbps to detect sudden spikes indicative of data exfiltration or DDoS attacks.

## Anomaly Detection
Each network event is evaluated against a baseline of normal behavior. An anomaly score (0-100) is generated based on:
1. **Unusual Protocol Usage**: Non-standard ports being used for common protocols.
2. **Geographical Irregularities**: Connections to or from unexpected geographic locations or known malicious ASNs.
3. **Volume Spikes**: Sudden, massive data transfers that deviate significantly from historical baselines.
4. **Threat Intelligence Correlation**: Matches against known malicious IPs from our threat intelligence feeds.

## Event Severity Classification
- **INFO**: Standard background traffic.
- **LOW**: Minor deviations from baseline; low risk.
- **MEDIUM**: Suspicious traffic requiring monitoring.
- **HIGH**: Probable malicious activity; alerts generated.
- **CRITICAL**: Confirmed malicious activity (e.g., known C2 server communication, severe data exfiltration).

## Real-Time Monitoring UI
The Network View dashboard polls the telemetry API endpoints (`/api/network/events` and `/api/network/summary`) at 5-second intervals. This provides a live, rolling view of network activity, visualized using Recharts for bandwidth trends and a tabular live feed for granular event inspection.
