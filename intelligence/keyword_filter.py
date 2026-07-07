"""
intelligence/keyword_filter.py — PhantmOS v3.0

BM25 relevance pre-filter for job harvest results.
Enforces TWO gates before a job reaches the database:
  Gate 1 — BM25 score > 25th-percentile of corpus scores (statistical relevance)
  Gate 2 — Core domain words from the query MUST appear in the job TITLE
            (prevents "Blockchain Engineer" slipping through a "cloud engineer" search
             just because its description mentions "cloud infrastructure")
"""
from rank_bm25 import BM25Okapi
from core.logger import get_logger
import re

EXCLUDE_KEYWORDS = ["clearance", "polygraph", "ts/sci", "secret clearance", "us citizen only"]
REQUIRED_KEYWORDS = []

# Words too generic to be "domain" words
_GENERIC_TOKENS = {
    "engineer", "developer", "manager", "remote", "senior", "junior",
    "specialist", "analyst", "intern", "lead", "staff", "head",
    "associate", "principal", "architect",
}

logger = get_logger(__name__)


def tokenize(text: str) -> list[str]:
    """Lowercase alphanumeric tokenization."""
    if not text:
        return []
    return re.findall(r'\b\w+\b', text.lower())


def filter_jobs_by_relevance(jobs: list[dict], search_query: str = None) -> list[dict]:
    """
    Two-gate relevance filter:
      Gate 1: BM25 score must exceed the 25th-percentile of the corpus
              (top 75% most BM25-relevant jobs pass).
      Gate 2: At least one *core* domain word from the query must appear
              in the job TITLE (not just description).

    Falls back to blacklist-only filtering when no search_query is given.
    """
    if not jobs:
        return []

    if not search_query:
        return [j for j in jobs if _passes_blacklist(j)]

    tokenized_query = tokenize(search_query)

    # Core tokens: domain-specific words only (strip generic seniority/role words)
    core_tokens = {t for t in tokenized_query if t not in _GENERIC_TOKENS}
    if not core_tokens:
        core_tokens = set(tokenized_query)

    # BM25 corpus: title triple-weighted so title matches dominate
    tokenized_corpus = []
    for job in jobs:
        title = job.get("title", "")
        desc = job.get("raw_description", "") or job.get("description", "")
        combined = f"{title} {title} {title} {desc}"
        tokenized_corpus.append(tokenize(combined))

    bm25 = BM25Okapi(tokenized_corpus)
    scores = bm25.get_scores(tokenized_query)

    # Gate 1 threshold: 25th percentile of non-zero scores
    non_zero = sorted(s for s in scores if s > 0)
    if not non_zero:
        return []
    threshold = non_zero[max(0, int(len(non_zero) * 0.25) - 1)]

    filtered_jobs = []
    for i, job in enumerate(jobs):
        if scores[i] <= threshold:
            continue  # Gate 1 failed

        # Gate 2: core domain word MUST be in the job TITLE
        title_tokens = set(tokenize(job.get("title", "")))
        if not core_tokens.intersection(title_tokens):
            continue  # Gate 2 failed — e.g. "Blockchain Eng" for "cloud engineer" search

        if _passes_blacklist(job):
            filtered_jobs.append(job)

    return filtered_jobs


def _passes_blacklist(job: dict) -> bool:
    """Hard exclusions — reject if any blacklist keyword appears in title or description."""
    title = job.get("title", "")
    desc = job.get("raw_description", "") or job.get("description", "")
    combined = f"{title} {desc}".lower()
    return not any(kw.lower() in combined for kw in EXCLUDE_KEYWORDS)
