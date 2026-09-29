"""
Train Random Forest Phishing URL Classifier
Outputs: phishing_rf_model.joblib
"""
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
from features import extract_url_features

# Curated dataset of known legitimate and phishing URL patterns for initial training
training_data = [
    # Legitimate (label = 0)
    ("https://www.google.com", 0),
    ("https://www.wikipedia.org", 0),
    ("https://github.com/explore", 0),
    ("https://stackoverflow.com/questions", 0),
    ("https://www.amazon.com/products", 0),
    ("https://microsoft.com/en-us", 0),
    ("https://developer.mozilla.org/en-US", 0),
    ("https://nytimes.com/section/world", 0),
    ("https://www.apple.com/iphone", 0),
    ("https://netflix.com/browse", 0),
    ("https://cloudflare.com/learning", 0),
    ("https://news.ycombinator.com", 0),
    ("https://docs.python.org/3/library", 0),
    ("https://hub.docker.com", 0),
    ("https://reddit.com/r/cybersecurity", 0),
    ("https://medium.com/tag/machine-learning", 0),
    ("https://linkedin.com/in/profile", 0),
    ("https://cnn.com/world", 0),
    ("https://bbc.com/news", 0),
    ("https://dropbox.com/home", 0),

    # Phishing / Malicious (label = 1)
    ("http://192.168.1.100/account-verification/update.php", 1),
    ("http://paypa1-security-update.verify-account.tk/login", 1),
    ("http://apple-id-verify.support-device.cf/auth/signin.html", 1),
    ("http://secure-banking-login.service-update.ga/webapps", 1),
    ("http://chase-security-alert.urgent-action.ml/verify", 1),
    ("http://netflix-billing-issue.account-renew.gq/login", 1),
    ("http://wallet-connect-dapps.web3-verify.site/auth", 1),
    ("http://microsoft-outlook-web-login.support-ticket.xyz", 1),
    ("http://amazon-order-blocked.refund-process.top/confirm", 1),
    ("http://instagram-copyright-infringement.help-form.icu", 1),
    ("http://steam-community-free-skins.trade-link.win", 1),
    ("http://binance-kyc-reactivation.security-check.biz/login", 1),
    ("http://dhl-package-tracking-failed.delivery-notice.cc", 1),
    ("http://wellsfargo-online-session.account-locked.work", 1),
    ("http://bit.ly/3xXyZ1_fake_login_portal_urgent_action", 1),
    ("http://tinyurl.com/bank-security-confirmation-987", 1),
    ("http://google-drive-shared-doc-preview.cloud-file.vip", 1),
    ("http://facebook-security-badge-verification.social-support.pw", 1),
    ("http://paypal.com.verify-billing-details.us-region.online/signin", 1),
    ("http://104.244.42.1/login.php?client_id=bank_america", 1)
]

def main():
    print("1. Extracting URL features...")
    records = []
    labels = []
    for url, label in training_data:
        feats = extract_url_features(url)
        records.append(feats)
        labels.append(label)

    X = pd.DataFrame(records)
    y = labels
    feature_names = list(X.columns)

    print(f"Dataset shape: {X.shape[0]} samples with {len(feature_names)} features.")

    print("2. Training Random Forest classifier...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight="balanced"
    )
    clf.fit(X, y)

    print("3. Exporting model artifacts...")
    artifacts = {
        "model": clf,
        "feature_names": feature_names
    }
    
    output_filename = "phishing_rf_model.joblib"
    joblib.dump(artifacts, output_filename, compress=3)
    print(f"SUCCESS! Created '{output_filename}' ({round(len(joblib.load(output_filename)['feature_names']))} features saved).")

if __name__ == "__main__":
    main()
