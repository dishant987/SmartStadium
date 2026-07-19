"""
Seed ChromaDB with FIFA World Cup 2026 stadium knowledge.
Run: python -m scripts.seed_chroma
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.chroma_client import get_chroma_client

COLLECTION = "stadium_knowledge"

KNOWLEDGE_DOCS = [
    # Gate & Navigation
    {
        "id": "gate_a",
        "text": "Gate A (North Entrance) provides access to Sections 101-115 on the lower bowl. Elevator access at Gate A lobby to 200 Club Level. ADA accessible entrance with ramp.",
        "metadata": {"category": "navigation", "venue": "metlife"},
    },
    {
        "id": "gate_b",
        "text": "Gate B (East Entrance) serves Sections 116-130. Currently at 92% capacity during peak hours. Use Gate C as alternative. Stairwell and elevator to 300 Level.",
        "metadata": {"category": "navigation", "venue": "metlife"},
    },
    {
        "id": "gate_c",
        "text": "Gate C (West Plaza) is closest to Sections 205-215. Elevator to 200 Club Level at North Lobby. Family-friendly entrance with stroller parking.",
        "metadata": {"category": "navigation", "venue": "metlife"},
    },
    {
        "id": "gate_d",
        "text": "Gate D (South Entrance) serves Sections 131-145. VIP and premium seat access. Dedicated security lane for premium ticket holders.",
        "metadata": {"category": "navigation", "venue": "metlife"},
    },
    {
        "id": "gate_e",
        "text": "Gate E (Southeast) is nearest to food court and concession stands. Shortest food lines reported at Gate E. Accessible via Lot K shuttle.",
        "metadata": {"category": "navigation", "venue": "metlife"},
    },
    # Sections & Seating
    {
        "id": "section_115",
        "text": "Section 115 has step-free access from Gate A. Blue signage marks the accessible route. Wheelchair companion seats available in rows 1-3.",
        "metadata": {"category": "accessibility", "venue": "metlife"},
    },
    {
        "id": "section_215",
        "text": "Section 215 on 200 Club Level offers premium food service. Access via Gate C elevator. Climate-controlled concourse with indoor seating areas.",
        "metadata": {"category": "navigation", "venue": "metlife"},
    },
    {
        "id": "club_200",
        "text": "200 Club Level features premium dining, wider seats, and dedicated restrooms. Accessible via elevators at Gates A and C. Capacity: 5,000 seats.",
        "metadata": {"category": "navigation", "venue": "metlife"},
    },
    # Accessibility
    {
        "id": "ada_ramps",
        "text": "Wheelchair ramps available at all gates. Accessible restrooms on every level. Elevator at North Lobby connects all levels. Service animals welcome throughout the venue.",
        "metadata": {"category": "accessibility", "venue": "metlife"},
    },
    {
        "id": "assistive_services",
        "text": "Assistive listening devices available at Guest Services (Gate A). Sign language interpreters available upon 48-hour advance request. Audio description service for visually impaired fans.",
        "metadata": {"category": "accessibility", "venue": "metlife"},
    },
    {
        "id": "accessible_seating",
        "text": "Accessible seating available in all price categories. Companion seats adjacent to wheelchair spaces. Accessible viewing platforms at 200 and 300 levels. Contact accessibility@fifa.com for booking.",
        "metadata": {"category": "accessibility", "venue": "metlife"},
    },
    # Transit & Parking
    {
        "id": "meadowlands_rail",
        "text": "Meadowlands Rail runs from Secaucus Junction to stadium. Trains every 8-12 minutes on match days. Last train departs 30 minutes after final whistle. Platform accessible via ramp.",
        "metadata": {"category": "transit", "venue": "metlife"},
    },
    {
        "id": "shuttle_service",
        "text": "Free shuttle runs every 10 minutes from Lot J and Lot K. Wheelchair-accessible shuttles available. Shuttle ride takes approximately 5 minutes.",
        "metadata": {"category": "transit", "venue": "metlife"},
    },
    {
        "id": "parking_lots",
        "text": "Lot J is 70% full on average. Lot K has more availability. Lot F is closest to Gate A. Accessible parking in all lots near entrance. Pre-paid parking required on match days.",
        "metadata": {"category": "transit", "venue": "metlife"},
    },
    {
        "id": "rideshare",
        "text": "Designated rideshare drop-off at Gate E plaza. Uber/Lyft pickup zone at Lot K exit. Surge pricing common 1 hour before and after matches.",
        "metadata": {"category": "transit", "venue": "metlife"},
    },
    # Food & Concessions
    {
        "id": "food_concourse",
        "text": "Concourse level has 12 food stands. Gate E has shortest lines. Options include nachos, hot dogs, burgers, vegetarian wraps, and halal food. Mobile ordering available via FIFA app.",
        "metadata": {"category": "food", "venue": "metlife"},
    },
    {
        "id": "premium_dining",
        "text": "200 Club Level has sit-down restaurant with table service. Reservations required. Menu includes steak, seafood, and craft cocktails. Accessible seating available.",
        "metadata": {"category": "food", "venue": "metlife"},
    },
    # Sustainability
    {
        "id": "recycling",
        "text": "Recycling stations at every concession area. Blue bins for plastic/metal, green for compost. Goal: 85% waste diversion rate. Reusable cup program available at all bars.",
        "metadata": {"category": "sustainability", "venue": "metlife"},
    },
    {
        "id": "low_carbon",
        "text": "Encourage public transit use to reduce carbon footprint. Meadowlands Rail is the greenest option. Electric vehicle charging stations in Lot F (20 spaces). Bicycle parking at Gate A.",
        "metadata": {"category": "sustainability", "venue": "metlife"},
    },
    {
        "id": "water_stations",
        "text": "Free water refill stations at every concourse level. Bring empty bottle to fill. Water bottle recycling bins at exits. Tap water safe to drink throughout venue.",
        "metadata": {"category": "sustainability", "venue": "metlife"},
    },
    # Security
    {
        "id": "bag_policy",
        "text": "Clear bag policy: only clear plastic bags (12x6x12 inches) or small clutch bags (4.5x6.5 inches) allowed. No backpacks. Bag check available at Gate D for $10.",
        "metadata": {"category": "security", "venue": "metlife"},
    },
    {
        "id": "entry_procedure",
        "text": "Gates open 2 hours before kickoff. Arrive 60-90 minutes early for security screening. Mobile ticket required (no paper tickets). Touchless entry via FIFA app.",
        "metadata": {"category": "security", "venue": "metlife"},
    },
    # Match Day Schedule
    {
        "id": "matchday_timeline",
        "text": "Gates open: 2 hours before kickoff. Food stands open at gate opening. Team warmups: 45 minutes before kickoff. National anthem: 10 minutes before kickoff. Kickoff: scheduled time.",
        "metadata": {"category": "schedule", "venue": "metlife"},
    },
    {
        "id": "halftime",
        "text": "Halftime is 15 minutes. Food stands remain open. Restroom lines longest during halftime. Consider going early in the half. Entertainment shown on big screens.",
        "metadata": {"category": "schedule", "venue": "metlife"},
    },
    # Venue Info
    {
        "id": "metlife_overview",
        "text": "MetLife Stadium in East Rutherford, New Jersey. Capacity: 82,500. Hosts FIFA World Cup 2026 matches including semi-finals. Three levels: 100, 200 Club, 300. 2,000 accessible seats.",
        "metadata": {"category": "venue", "venue": "metlife"},
    },
    {
        "id": "wifi",
        "text": "Free WiFi available throughout the stadium. Network: FIFA_WC2026. Password not required. High-speed connectivity in Club Level areas.",
        "metadata": {"category": "amenities", "venue": "metlife"},
    },
    {
        "id": "guest_services",
        "text": "Guest Services desk at Gate A lobby. Services: lost and found, accessibility assistance, information, complaint resolution. Open from gate opening to 1 hour after final whistle.",
        "metadata": {"category": "amenities", "venue": "metlife"},
    },
]


def seed():
    print("Connecting to ChromaDB...")
    client = get_chroma_client()

    print(f"Getting collection '{COLLECTION}'...")
    try:
        collection = client.get_collection(COLLECTION)
        count = collection.count()
        print(f"Collection has {count} documents")
        if count > 0:
            print("Collection already has data. Skipping seed.")
            return
    except Exception as e:
        print(f"Collection '{COLLECTION}' not found. Creating...")
        collection = client.create_collection(COLLECTION)

    print(f"Seeding {len(KNOWLEDGE_DOCS)} documents...")
    for doc in KNOWLEDGE_DOCS:
        collection.add(
            ids=[doc["id"]],
            documents=[doc["text"]],
            metadatas=[doc["metadata"]],
        )
        print(f"  + {doc['id']}")

    print(f"Done! Seeded {len(KNOWLEDGE_DOCS)} documents into '{COLLECTION}'.")


if __name__ == "__main__":
    seed()
