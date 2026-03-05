#!/usr/bin/env node
// Script d'automatisation Playwright + extraction token + k6
// Usage : node run-k6-upload.js

const { execSync } = require('child_process');
const path = require('path');

function log(msg) {
  console.log(`[run-k6-upload] ${msg}`);
}

try {
  // 1. Générer storageState.json avec Playwright
  log('Lancement Playwright pour générer storageState.json...');
  execSync('npx playwright test frontend/tests/e2e/auth.setup.spec.ts', { stdio: 'inherit' });

  // 2. Extraire le token JWT
  log('Extraction du token JWT dans token.txt...');
  execSync('node frontend/tests/e2e/extract-token.js > frontend/tests/e2e/token.txt', { stdio: 'inherit' });

  // 3. Lancer le test k6
  log('Lancement du test k6 sur l\'upload...');
  execSync('k6 run perf/upload-file.js', { stdio: 'inherit' });

  log('Test k6 terminé. Vérifie les logs ci-dessus.');
} catch (err) {
  log('Erreur lors de l\'exécution :');
  log(err.message);
  process.exit(1);
}
