import urllib.request, json, time, sys, os

token = os.environ.get("GITHUB_TOKEN", "")
headers = {"Authorization": f"token {token}", "User-Agent": "Python"}
base = "https://api.github.com/repos/qq1375828505/AIGC-NetNov/actions"

if len(sys.argv) > 1 and sys.argv[1] == "wait":
    time.sleep(30)

# Check specific run
r = urllib.request.Request(f"{base}/runs/27919371476", headers=headers)
d = json.loads(urllib.request.urlopen(r).read())
print(f"Run 27919371476 (09fc40d): status={d['status']} conclusion={d.get('conclusion')}")

# Check latest runs
r2 = urllib.request.Request(f"{base}/runs?per_page=3", headers=headers)
d2 = json.loads(urllib.request.urlopen(r2).read())
for run in d2.get("workflow_runs", []):
    print(f"Run {run['id']} sha:{run['head_sha'][:7]} status:{run['status']} conclusion:{run.get('conclusion')} created:{run['created_at']}")
