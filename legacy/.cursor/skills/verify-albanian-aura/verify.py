#!/usr/bin/env python3
"""Verification runner for AlbanianAura. See SKILL.md."""
import json, os, re, subprocess, sys, time
from pathlib import Path
REPO = Path(__file__).resolve().parents[3]
failures = []
def check(name, ok, detail=''):
    print(('PASS' if ok else 'FAIL'), name, (':: ' + str(detail))[:400] if detail else '')
    if not ok: failures.append(name)
def run(cmd, **kw):
    return subprocess.run(cmd, cwd=REPO, capture_output=True, text=True, timeout=900, **kw)
def main():
    if not (REPO / 'node_modules').is_dir():
        check('npm install', run(['npm', 'install', '--no-audit', '--no-fund']).returncode == 0)
    proc = run(['npx', 'vitest', 'run'])
    tail = re.sub(r'\x1b\[[0-9;]*m', '', proc.stdout + proc.stderr)
    m = re.search(r'Tests\s+(\d+) passed', tail)
    check('vitest unit suites (37 tests)', proc.returncode == 0 and m, tail[-300:])
    env = dict(os.environ, PW_PORT='8181', PW_BASE_URL='http://localhost:8181')
    proc = run(['npx', 'playwright', 'test', '--project=chromium'], env=env)
    tail = re.sub(r'\x1b\[[0-9;]*m', '', proc.stdout + proc.stderr)
    check('playwright e2e (chromium: mission control, user journey)', proc.returncode == 0 and ' failed' not in tail and 'passed' in tail, tail[-300:])
    print('FAILURES=%d' % len(failures))
    with open(REPO / '.cursor/skills/verify-albanian-aura/evidence.json', 'w') as f:
        json.dump({'repo': 'AlbanianAura', 'ts': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'failures': failures}, f, indent=2)
    return 1 if failures else 0
if __name__ == '__main__':
    sys.exit(main())
