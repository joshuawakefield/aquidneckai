"""Worker subprocess: stdin JSON -> stdout JSON. Only previously audited endpoints."""
import json
import sys
from audit_registry_pilot import check
from audit_sources import ROOT

if __name__ == '__main__':
    source = json.load(sys.stdin)
    allowed = json.loads((ROOT / 'data/imports/pilot-candidates.json').read_text(encoding='utf-8'))
    if not any(s['source_id'] == source.get('source_id') and s['endpoint_url'] == source.get('endpoint_url')
               and s['monitor_mode'] == 'rss' for s in allowed):
        print(json.dumps({'status': 'failed', 'error_type': 'UnsupportedEndpoint'}))
    else:
        print(json.dumps(check(source)))
