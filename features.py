import re
import math
from urllib.parse import urlparse

def calculate_entropy(text: str) -> float:
    """Calculates Shannon entropy to detect randomized/obfuscated strings."""
    if not text:
        return 0.0
    entropy = 0.0
    for char in set(text):
        p_x = float(text.count(char)) / len(text)
        if p_x > 0:
            entropy += - p_x * math.log2(p_x)
    return entropy

def extract_url_features(url: str) -> dict:
    """Extracts 15 lexical and structural features from a raw URL string."""
    clean_url = url.strip()
    parsed = urlparse(clean_url if "://" in clean_url else "http://" + clean_url)
    
    host_only = parsed.netloc.split(":")[0]
    domain = host_only
    path = parsed.path
    query = parsed.query

    # IP address detection in host (e.g. http://192.168.1.1/login)
    has_ip = 1 if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", host_only) else 0

    # Common phishing keywords
    keywords = ["login", "verify", "secure", "account", "update", "banking", "signin", "wallet", "support", "confirm", "ebay", "paypal", "apple", "recover"]
    keyword_count = sum(1 for kw in keywords if kw in clean_url.lower())

    # URL shorteners (bit.ly, tinyurl, etc.)
    shorteners = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "adf.ly"}
    is_shortened = 1 if domain.lower() in shorteners else 0

    subdomains = host_only.split(".")
    num_subdomains = max(0, len(subdomains) - 2)

    return {
        "url_length": len(clean_url),
        "domain_length": len(domain),
        "path_length": len(path),
        "query_length": len(query),
        "num_dots": clean_url.count("."),
        "num_hyphens": clean_url.count("-"),
        "num_at": clean_url.count("@"),
        "num_slash": clean_url.count("/"),
        "num_digits": sum(c.isdigit() for c in clean_url),
        "num_subdomains": num_subdomains,
        "is_https": 1 if parsed.scheme == "https" else 0,
        "has_ip_address": has_ip,
        "is_shortened": is_shortened,
        "entropy": calculate_entropy(clean_url),
        "keyword_count": keyword_count,
    }
