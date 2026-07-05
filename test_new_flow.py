import asyncio
from core.database_manager import get_client, get_profile
from intelligence.scorer import run_scoring
from agents.application_agent import ApplicationAgent
import time

async def main():
    user_id = "c38c960b-d3fd-4f88-9acb-d57b521e7c23"
    print(f"Testing for user: {user_id}")
    
    # 1. Insert a mock HOT job lead
    job_id = f"test_job_{int(time.time())}"
    client = get_client()
    client.table("global_jobs").insert({
        "job_id": job_id,
        "company": "OpenAI",
        "title": "Machine Learning Engineer",
        "location": "San Francisco, CA",
        "url": "https://openai.com/careers",
        "description": "We are looking for a Machine Learning Engineer to build scalable ML pipelines. You need deep experience with Python, PyTorch, and large language models (LLMs). Experience with Retrieval-Augmented Generation (RAG), FastAPI, Docker, Kubernetes, PostgreSQL, and vector databases like Pinecone or Milvus is highly desired.",
        "dedup_hash": job_id
    }).execute()
    
    client.table("user_job_pipelines").insert({
        "user_id": user_id,
        "job_id": job_id,
        "status": "Found",
        "score_band": "UNKNOWN"
    }).execute()
    
    print(f"Inserted mock job {job_id}")
    
    # 2. Score it
    profile = get_profile(user_id)
    print("Running scoring...")
    score_res = await run_scoring(profile)
    print("Scoring results:", score_res)
    
    # Check status and queue
    pipeline = client.table("user_job_pipelines").select("*").eq("job_id", job_id).execute().data[0]
    print(f"Job Status after scoring: {pipeline['status']}")
    
    queue = client.table("delivery_queue").select("*").eq("job_id", job_id).execute().data
    if len(queue) == 0:
        print("Job was not queued automatically. Forcing queue as WARM...")
        client.table("user_job_pipelines").update({"score_band": "WARM"}).eq("job_id", job_id).execute()
        client.table("delivery_queue").insert({"job_id": job_id, "user_id": user_id}).execute()
        queue = [1]
        
    print(f"Items in delivery queue for {job_id}: {len(queue)}")
    
    # 3. Deliver it via Telegram
    print("Running delivery...")
    agent = ApplicationAgent()
    deliv_res = await agent.process_deliveries(profile)
    print("Delivery results:", deliv_res)
    
if __name__ == "__main__":
    asyncio.run(main())
