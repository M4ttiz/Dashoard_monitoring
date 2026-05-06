import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync('/app/package.json', 'utf8'))
const lockExists = fs.existsSync('/app/package-lock.json')
let lockfileVersion = null
try {
  if (lockExists) {
    lockfileVersion = JSON.parse(fs.readFileSync('/app/package-lock.json', 'utf8')).lockfileVersion
  }
} catch {
  lockfileVersion = 'parse_error'
}

// #region agent log
fetch('http://127.0.0.1:7385/ingest/6927c551-f1e7-4489-a6cd-06b6e908ec9a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'ddbbe2' },
  body: JSON.stringify({
    sessionId: 'ddbbe2',
    runId: 'pre-fix',
    hypothesisId: 'H1_H2_H3_H4',
    location: 'frontend/scripts/buildProbe.mjs:14',
    message: 'pre-npm-ci dependency snapshot',
    data: {
      eslint: pkg.devDependencies?.eslint,
      jsxA11y: pkg.devDependencies?.['eslint-plugin-jsx-a11y'],
      lockExists,
      lockfileVersion,
      node: process.version,
    },
    timestamp: Date.now(),
  }),
}).catch(() => {})
// #endregion

