import json
import subprocess

# Run rendercv to get the schema
res = subprocess.run(["rendercv", "new", "test_schema"], capture_output=True, text=True)
with open("test_schema/Akash_Yaduwanshi_CV.yaml", "r") as f:
    print(f.read())
