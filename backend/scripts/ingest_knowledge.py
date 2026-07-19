"""One-time ingestion: chunk venue docs and embed into Chroma Cloud collection 'stadium_knowledge'."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.db.chroma_client import get_chroma_client

COLLECTION_NAME = "stadium_knowledge"

VENUE_DOCS: list[dict] = [
    # --- Gate maps ---
    {
        "category": "gate_map",
        "venue": "Estádio Nacional",
        "content": "Gate A — East entrance, serves sections 101-110. Gate B — North entrance, serves sections 111-120. Gate C — West entrance, serves sections 121-130. Gate D — South entrance, VIP and media access only.",
    },
    {
        "category": "gate_map",
        "venue": "Arena das Dunas",
        "content": "Gate 1 — Main entrance, serves sections 1-8. Gate 2 — South lot entry, serves sections 9-16. Gate 3 — North lot entry, serves sections 17-24.",
    },
    # --- Accessibility ---
    {
        "category": "accessibility",
        "venue": "Estádio Nacional",
        "content": "Wheelchair-accessible entrances at Gates B and D. Elevator access to all levels. Accessible restrooms located near sections 105, 115, 125. Assistive listening devices available at Guest Services.",
    },
    {
        "category": "accessibility",
        "venue": "Arena das Dunas",
        "content": "Ramp access at Gate 1. Wheelchair seating in sections 4, 12, 20. Sensory-friendly viewing room available — ask staff for directions. Service animals welcome.",
    },
    # --- Transport ---
    {
        "category": "transport",
        "venue": "Estádio Nacional",
        "content": "Metro: Green Line to Stadium Station. Shuttle buses run from Downtown Terminal every 10 min starting 3 hours before kickoff. Parking: Lots A (east, 500 spaces), B (west, 300 spaces). Rideshare drop-off at Gate C.",
    },
    {
        "category": "transport",
        "venue": "Arena das Dunas",
        "content": "Bus routes 12, 27, and 44 stop at Arena Plaza. Free shuttle from Convention Center parking lot. Limited on-site parking — pre-book required. Bicycle racks at all gates.",
    },
    # --- FAQs ---
    {
        "category": "faq",
        "venue": "",
        "content": "Q: What bags are allowed? A: Clear bags no larger than 12x12x6 inches. No backpacks.",
    },
    {
        "category": "faq",
        "venue": "",
        "content": "Q: Can I bring a water bottle? A: Empty reusable bottles up to 32 oz. Filling stations available.",
    },
    {
        "category": "faq",
        "venue": "",
        "content": "Q: Is re-entry allowed? A: No readmission once inside the venue.",
    },
    {
        "category": "faq",
        "venue": "",
        "content": "Q: Where is lost & found? A: Guest Services behind Section 110 at Estádio Nacional, or Section 8 at Arena das Dunas.",
    },
]


def chunk_text(text: str, max_chars: int = 500) -> list[str]:
    words = text.split()
    chunks, current = [], []
    char_count = 0
    for w in words:
        if char_count + len(w) + 1 > max_chars and current:
            chunks.append(" ".join(current))
            current, char_count = [], 0
        current.append(w)
        char_count += len(w) + 1
    if current:
        chunks.append(" ".join(current))
    return chunks


def main() -> None:
    client = get_chroma_client()
    try:
        collection = client.get_collection(COLLECTION_NAME)
        print(f"Collection '{COLLECTION_NAME}' exists, using it.")
    except Exception:
        collection = client.create_collection(COLLECTION_NAME)
        print(f"Created collection '{COLLECTION_NAME}'.")

    ids, documents, metadatas = [], [], []
    for i, doc in enumerate(VENUE_DOCS):
        chunks = chunk_text(doc["content"])
        for j, chunk in enumerate(chunks):
            chunk_id = f"doc_{i}_{j}"
            ids.append(chunk_id)
            documents.append(chunk)
            metadatas.append(
                {
                    "category": doc["category"],
                    "venue": doc["venue"] or "general",
                }
            )

    collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
    print(f"Ingested {len(ids)} chunks into '{COLLECTION_NAME}'.")


if __name__ == "__main__":
    main()
