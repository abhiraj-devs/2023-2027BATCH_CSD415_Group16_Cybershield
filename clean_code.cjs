const fs = require('fs');

function removeUnusedImports(file, unusedImports) {
  let content = fs.readFileSync(file, 'utf8');
  unusedImports.forEach(imp => {
    // Basic regex to remove the import word. If it leaves empty commas, we'll fix them.
    let regex = new RegExp(`\\b${imp}\\b\\s*,?`, 'g');
    content = content.replace(regex, '');
  });
  // Cleanup empty commas like `, ,` or `{ ,` or `, }`
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/{\s*,/g, '{');
  content = content.replace(/,\s*}/g, '}');
  fs.writeFileSync(file, content);
}

// 1. DashboardView.tsx
removeUnusedImports('./src/components/DashboardView.tsx', ['Bug', 'Radio', 'Globe', 'Bell', 'AlertTriangle']);

// 2. AlertsView.tsx
removeUnusedImports('./src/components/AlertsView.tsx', ['RefreshCw']);

// 3. HistoryView.tsx
removeUnusedImports('./src/components/HistoryView.tsx', ['Search']);

// 4. MalwareView.tsx
removeUnusedImports('./src/components/MalwareView.tsx', ['Bug', 'Upload', 'CheckCircle2', 'Cpu']);

// 5. NetworkView.tsx
removeUnusedImports('./src/components/NetworkView.tsx', ['Cpu', 'Terminal']);

// 6. PhishingView.tsx
removeUnusedImports('./src/components/PhishingView.tsx', ['ShieldCheck', 'Terminal', 'ExternalLink']);

// 7. SettingsView.tsx
removeUnusedImports('./src/components/SettingsView.tsx', ['Cpu', 'Shield']);

// 8. ThreatIntelView.tsx
removeUnusedImports('./src/components/ThreatIntelView.tsx', ['Search', 'Shield', 'Zap', 'Activity', 'Database', 'ShieldCheck', 'ArrowRight', 'Filter', 'MapView']);

// 9. VulnerabilityScannerView.tsx
removeUnusedImports('./src/components/VulnerabilityScannerView.tsx', ['Terminal']);

console.log("Removed unused imports.");
