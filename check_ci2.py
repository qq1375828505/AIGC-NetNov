import urllib.request, json, os

token = os.environ.get("GITHUB_TOKEN", "")
headers = {"Authorization": f"token {token}", "User-Agent": "Python"}
base = "https://api.github.com/repos/qq1375828505/AIGC-NetNov/actions"

# Check jobs for failed run 27919371476
r = urllib.request.Request(f"{base}/runs/27919371476/jobs", headers=headers)
d = json.loads(urllib.request.urlopen(r).read())
for job in d.get("jobs", []):
    print(f"Job: {job['name']} - status: {job['status']} - conclusion: {job.get('conclusion')}")
    for step in job.get("steps", []):
        if step.get("conclusion") == "failure":
            print(f"  FAILED step: {step['name']} (number: {step['number']})")

# Also check new run status
r2 = urllib.request.Request(f"{base}/runs/27919551899", headers=headers)
d2 = json.loads(urllib.request.urlopen(r2).read())
print(f"\nNew run 27919551899 (33e2fc8): status={d2['status']} conclusion={d2.get('conclusion')}")
