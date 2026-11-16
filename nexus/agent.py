"""NEXUS v0.2: read-only, bounded Sea.rho7 operational monitor.
No credentials, shell execution, production writes, or unapproved actions.
"""
import json
import os
import time
import urllib.request
from datetime import datetime, timezone

URL = os.getenv("NEXUS_HEALTH_URL", "https://searho7.ninthcoreai.in/")
INTERVAL = max(300, int(os.getenv("NEXUS_INTERVAL_SECONDS", "900")))
MAX_RUNS = max(1, min(96, int(os.getenv("NEXUS_MAX_RUNS", "4"))))
TIMEOUT = 10

def check():
    start = time.monotonic()
    try:
        req = urllib.request.Request(URL, headers={"User-Agent": "SeaRho7-NEXUS-Monitor/0.2"})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
            status = response.status
        return {"ok": 200 <= status < 400, "status": status, "latency_ms": round((time.monotonic()-start)*1000)}
    except Exception as exc:
        return {"ok": False, "error_type": type(exc).__name__, "latency_ms": round((time.monotonic()-start)*1000)}

def main():
    for index in range(MAX_RUNS):
        event = {"timestamp": datetime.now(timezone.utc).isoformat(), "agent": "nexus-v0.2", "mode": "read-only", "run": index+1, **check()}
        print(json.dumps(event), flush=True)
        if index+1 < MAX_RUNS:
            time.sleep(INTERVAL)

if __name__ == "__main__":
    main()
