from core.database_manager import get_profile
import json

profile = get_profile("c38c960b-d3fd-4f88-9acb-d57b521e7c23")
print("Resume Data:", json.dumps(profile.get("resume_data"))[:200])
