"""Seed the ChromaDB vector store with FIFA 2026 stadium knowledge.

Run once: python -m scripts.seed_rag
Re-runs safely (adds to existing collection)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.langchain_rag import LangChainRAGService

KNOWLEDGE_DOCS = [
    # ─── Venue Overview ───
    "MetLife Stadium is the host venue for FIFA World Cup 2026 matches. Located at 1 MetLife Stadium Drive, East Rutherford, NJ 07073. Capacity: 82,500. Opened: 2010. Home to the New York Giants and New York Jets. The stadium features a bowl design with 4 main stands: North, South, East, and West.",
    "The stadium has 4 entry levels: Plaza Level (Gates A-F), Main Concourse (Gates G-L), Upper Concourse (Gates M-R), and Suite Level. Each level has dedicated concessions, restrooms, and first aid stations.",
    "MetLife Stadium is accessible via NJ Transit's Meadowlands Rail Line from Secaucus Junction, with direct service on match days. The stadium also features 4 major parking lots (Lots A-D) with 27,500 parking spaces.",

    # ─── Gates ───
    "Gate A: Plaza Level North-East. Entry for sections 101-110. Nearest parking: Lot A. Best for: Main Stand access.",
    "Gate B: Plaza Level North-West. Entry for sections 111-120. Nearest parking: Lot B. Best for: West Stand access.",
    "Gate C: Plaza Level South-East. Entry for sections 121-130. Nearest parking: Lot C. Best for: Fan Zone access.",
    "Gate D: Plaza Level South-West. Entry for sections 131-140. Nearest parking: Lot D. Best for: South Plaza access.",
    "Gate E: Main Concourse East. Entry for sections 201-215. Nearest parking: Lot A. VIP and Suite access.",
    "Gate F: Main Concourse West. Entry for sections 216-230. Nearest parking: Lot B. Accessible entry available.",
    "All gates open 2 hours before kickoff. Gates close 30 minutes after final whistle. Gate F is the designated accessible entry with ramps and elevator access.",

    # ─── Sections & Seating ───
    "Section 101-110: North-East corner, Plaza Level. Good view of the main jumbotron. Close to concessions.",
    "Section 111-120: North-West corner, Plaza Level. Shaded seating in afternoon matches.",
    "Section 121-130: South-East corner, Plaza Level. Close to Fan Zone activities.",
    "Section 131-140: South-West corner, Plaza Level. Close to South Plaza food trucks.",
    "Section 201-230: Main Concourse Level. Premium seating with wider seats and additional legroom.",
    "Section 301-340: Upper Concourse Level. Budget-friendly seating with panoramic stadium views.",
    "Sections 341-350: Accessible seating areas. Located on all levels with companion seating available.",

    # ─── Concessions & Food ───
    "Main Stand Concessions: Located near Gate A, Plaza Level. Serves burgers, hot dogs, fries, and beverages. Open from gate open until 30 min post-match.",
    "East Stand Hot Dogs: Located near Gate C, Plaza Level. Specializes in gourmet hot dogs, sausages, and craft beer.",
    "West Stand Tacos: Located near Gate D, Plaza Level. Serves Mexican cuisine including tacos, burritos, and churros.",
    "Fan Zone Food Court: Located in the South Plaza. Features 15+ food vendors including international cuisine options. Open until 1 hour post-match.",
    "Vegetarian and halal options available at all main concession stands. Vegan options available at Fan Zone Food Court and East Stand Hot Dogs.",
    "Water refill stations are located on every concourse level near restrooms. Free reusable cups available at Guest Services booths.",

    # ─── Accessibility ───
    "Wheelchair accessible seating is available in all sections on every level. Companion seats are provided for each wheelchair space.",
    "Accessible restrooms are located on every level near the main concourse. Family restrooms are available near Guest Services.",
    "Assistive listening devices are available at Guest Services booths. Sign language interpretation can be requested 48 hours in advance.",
    "Service animals are welcome. A relief area is located outside Gate F on the Plaza Level.",
    "Elevator access is available at Gates E, F, and near sections 130 and 220. Escalators are located at all main concourse transition points.",
    "Wheelchair drop-off zones are located at Gates A, C, and F. Designated accessible parking in Lots A and C, closest to accessible entries.",
    "For mobility assistance during the event, contact any staff member or text HELP to the stadium information line.",

    # ─── Transit & Transport ───
    "NJ Transit Meadowlands Rail Line operates direct service from Secaucus Junction to MetLife Stadium on match days. Trains run every 5-10 minutes before and after matches.",
    "Shuttle A (Stadium Loop): Runs continuous circuit between all parking lots and stadium gates. Free service. Runs every 3-5 minutes on match days.",
    "Shuttle B (Downtown Express): Direct service from Newark Penn Station to the stadium. One-way fare: $5. Runs every 15 minutes.",
    "Bus 12 (North Route): Service from Bergen County park-and-ride locations. Drops at Lot A.",
    "Bus 27 (South Route): Service from Hudson County park-and-ride locations. Drops at Lot C.",
    "Rideshare drop-off zone is located at Lot D. Designated rideshare pickup area is in Lot B after matches.",
    "Parking: Lot A (North, 8,000 spaces), Lot B (West, 7,000 spaces), Lot C (South, 6,500 spaces), Lot D (East, 6,000 spaces). Parking passes must be purchased in advance.",
    "Green Line Metro: Service from Hoboken to MetLife via the Meadowlands connector. Limited service on non-match days.",

    # ─── Amenities ───
    "Guest Services booths are located at Gates A, C, F, and on the Main Concourse Level. Staffed from gate open until 1 hour post-match.",
    "First Aid stations are located at sections 110, 130, and 220. AEDs are located throughout all concourses.",
    "Nursing rooms are available at Guest Services booths. Baby changing stations are in all restrooms.",
    "Lost and Found is located at Guest Services near Gate A. After the event, contact stadium security.",
    "ATMs are located near Gates A, C, D, and on Main Concourse Level near section 210.",
    "WiFi: Free stadium-wide WiFi available. Network: FIFA2026-Stadium. No password required.",

    # ─── Matchday Operations ───
    "Gates open 2 hours before kickoff. Arrive early to avoid queues. Peak entry times are 60-30 minutes before kickoff.",
    "Bag policy: Clear bags only, maximum 12x12x6 inches. One gallon clear plastic bags permitted. Small clutch bags 4.5x6.5 inches allowed.",
    "Prohibited items: Outside food/beverages, weapons, drones, selfie sticks, professional cameras with detachable lenses, laptops, and tablets.",
    "Cashless venue: All purchases must be made by credit/debit card or mobile payment. Reverse ATMs available for cash conversion.",
    "Smoking policy: MetLife Stadium is a smoke-free venue. Designated smoking areas are located outside Gates A, C, and E.",
    "Re-entry: No re-entry permitted. All sales final.",

    # ─── Sustainability ───
    "MetLife Stadium is committed to sustainability. Recycling stations are located at every concession area. Compost bins are available at the Fan Zone Food Court.",
    "Water refill stations throughout the stadium have saved over 5 million single-use plastic bottles annually. Look for the blue hydration stations.",
    "The stadium uses LED lighting throughout, reducing energy consumption by 60% compared to traditional lighting.",
    "Low-carbon transport options: NJ Transit Rail, shuttle buses, and bicycle parking (located at Lot A, 500 spaces).",
    "Compostable servingware is used at all concession stands. Look for the green compost bins near food vendors.",
    "Electric vehicle charging stations are available in Lot A (20 spaces).",

    # ─── Emergency Procedures ───
    "In case of emergency: Follow instructions from PA announcements and stadium staff. Emergency exits are clearly marked on all levels.",
    "Evacuation assembly points: Lot A, Lot B, and the South Plaza. Follow the signs to your designated assembly area.",
    "Medical emergency: Contact the nearest staff member or call 911. First Aid stations are at sections 110, 130, and 220.",
    "Severe weather: The stadium has designated weather shelter areas on the Main Concourse Level. PA announcements will direct fans.",
    "Lost child: Report to nearest Guest Services booth or stadium staff. Children are escorted to Guest Services near Gate A.",

    # ─── Fan Zone ───
    "The Fan Zone is located in the South Plaza area (sections 121-130). Open 3 hours before kickoff and until 1 hour post-match.",
    "Fan Zone activities include: Live music, interactive football games, photo opportunities with FIFA trophies, and sponsor activations.",
    "The Fan Zone features 15+ international food vendors, 3 full-service bars, and seating for 2,000 fans.",
    "The FIFA Museum pop-up in the Fan Zone features World Cup history exhibits, interactive displays, and merchandise.",

    # ─── Volunteer Operations ───
    "Volunteers are assigned to zones: Gate Operations, Concierge, Transit Support, Accessibility Assistance, and Emergency Response.",
    "Gate volunteers check tickets, direct fans to sections, and manage entry flow. Gate zones are staffed by 8-12 volunteers per gate.",
    "Concierge volunteers staff Guest Services booths and rove the concourses. They provide directions, answer questions, and assist with accessibility needs.",
    "Transit volunteers are stationed at NJ Transit platforms, shuttle stops, and parking lots. They assist with boarding and directions.",
    "Accessibility volunteers assist fans with disabilities, escort to accessible seating, and manage wheelchair escorts.",
    "Emergency Response volunteers are trained in first aid and evacuation procedures. They wear distinct red vests and carry radios.",
    "Volunteer shifts are 6 hours (including 30-min break). Check-in is at the Volunteer Center (Gate E, Concourse Level) 30 minutes before shift.",
    "Volunteers receive: Meal voucher, parking pass, volunteer kit (vest, radio, map), and certificate of appreciation.",
]

MATCH_DOCS = [
    # ─── Group Stage ───
    "Match 1 — Group C: Saturday, June 13, 2026 at 6:00 PM ET. Brazil vs Morocco at New York New Jersey Stadium (MetLife Stadium). Result: Brazil 1-1 Morocco. Brazil opened the scoring through Vinicius Jr in the 12th minute. Morocco equalized via a Hakim Ziyech free kick in the 38th minute. Attendance: 78,432.",
    "Match 2 — Group I: Tuesday, June 16, 2026 at 3:00 PM ET. France vs Senegal at New York New Jersey Stadium (MetLife Stadium). Result: France 3-1 Senegal. Goals: Kylian Mbappe (24'), Antoine Griezmann (52'), Olivier Giroud (78') for France; Ismaïla Sarr (63') for Senegal. Attendance: 75,891.",
    "Match 3 — Group I: Monday, June 22, 2026 at 8:00 PM ET. Norway vs Senegal at New York New Jersey Stadium (MetLife Stadium). Result: Norway 3-2 Senegal. Goals: Erling Haaland (15', 67'), Martin Ødegaard (44') for Norway; Sadio Mane (8'), Ismaïla Sarr (82' pen) for Senegal. Attendance: 72,304.",
    "Match 4 — Group E: Thursday, June 25, 2026 at 4:00 PM ET. Ecuador vs Germany at New York New Jersey Stadium (MetLife Stadium). Result: Ecuador 2-1 Germany. Goals: Enner Valencia (31'), Moises Caicedo (58') for Ecuador; Kai Havertz (72') for Germany. Attendance: 80,115.",
    "Match 5 — Group L: Saturday, June 27, 2026 at 5:00 PM ET. Panama vs England at New York New Jersey Stadium (MetLife Stadium). Result: Panama 0-2 England. Goals: Harry Kane (41'), Jude Bellingham (65') for England. Attendance: 79,450.",

    # ─── Knockout Stage ───
    "Match 6 — Round of 32: Tuesday, June 30, 2026 at 5:00 PM ET. France vs Sweden at New York New Jersey Stadium (MetLife Stadium). Result: France 3-0 Sweden. Goals: Antoine Griezmann (33'), Kylian Mbappe (51'), Eduardo Camavinga (79'). France advanced to the Round of 16. Attendance: 76,220.",
    "Match 7 — Round of 16: Sunday, July 5, 2026 at 4:00 PM ET. Norway vs Brazil at New York New Jersey Stadium (MetLife Stadium). Result: Norway 2-1 Brazil. Goals: Erling Haaland (28', 64') for Norway; Vinicius Jr (73') for Brazil. Norway advanced to the Quarterfinals. Attendance: 81,003.",
    "Match 8 — Final: Sunday, July 19, 2026 at 3:00 PM ET. France vs Norway at New York New Jersey Stadium (MetLife Stadium). FIFA World Cup 2026 Final. France won Group I and beat Sweden 3-0 in the Round of 32. Norway won Group I and beat Brazil 2-1 in the Round of 16. Pre-match ceremonies begin at 1:30 PM ET. Gates open at 12:00 PM ET. Expected attendance: 82,500 (sellout).",

    # ─── Full Schedule Overview ───
    "MetLife Stadium hosts 8 matches at FIFA World Cup 2026: 5 Group Stage matches, 1 Round of 32, 1 Round of 16, and the Final. Dates: June 13, 16, 22, 25, 27, 30, July 5, and July 19.",
    "Group C at MetLife: Brazil vs Morocco (June 13, 1-1 draw). Group I at MetLife: France vs Senegal (June 16, 3-1 France wins), Norway vs Senegal (June 22, 3-2 Norway wins). Group E: Ecuador vs Germany (June 25, 2-1 Ecuador wins). Group L: Panama vs England (June 27, 0-2 England wins).",
    "Knockout matches at MetLife: Round of 32 — France 3-0 Sweden (June 30). Round of 16 — Norway 2-1 Brazil (July 5). Final — France vs Norway (July 19, 3:00 PM ET).",
    "France squad at FIFA World Cup 2026 includes Kylian Mbappe, Antoine Griezmann, Olivier Giroud, Eduardo Camavinga, and others. France are the defending champions.",
    "Norway squad at FIFA World Cup 2026 includes Erling Haaland, Martin Odegaard, and others. Norway advanced through Group I and beat Brazil in the Round of 16.",
]


def main():
    rag = LangChainRAGService()
    texts = []
    metadatas = []
    for i, doc in enumerate(KNOWLEDGE_DOCS):
        category = "venue"
        if any(w in doc.lower() for w in ["gate ", "section", "entry", "accessible entry"]):
            category = "gates"
        elif any(w in doc.lower() for w in ["transit", "train", "bus", "shuttle", "parking", "rail"]):
            category = "transport"
        elif any(w in doc.lower() for w in ["food", "concession", "restaurant", "taco", "burger", "vegetarian"]):
            category = "concessions"
        elif any(w in doc.lower() for w in ["wheelchair", "accessible", "disability", "service animal", "elevator"]):
            category = "accessibility"
        elif any(w in doc.lower() for w in ["emergency", "evacuation", "first aid", "medical", "severe weather"]):
            category = "safety"
        elif any(w in doc.lower() for w in ["volunteer", "shift", "vest"]):
            category = "volunteer"
        elif any(w in doc.lower() for w in ["fan zone", "activities"]):
            category = "fan_zone"
        elif any(w in doc.lower() for w in ["sustainability", "recycling", "compost", "energy"]):
            category = "sustainability"
        elif any(w in doc.lower() for w in ["guest service", "nursing", "wifi", "atm"]):
            category = "amenities"
        texts.append(doc)
        metadatas.append({"source": "fifa_knowledge_base", "category": category, "doc_id": i})
    for i, doc in enumerate(MATCH_DOCS):
        texts.append(doc)
        metadatas.append({"source": "fifa_knowledge_base", "category": "matches", "doc_id": len(KNOWLEDGE_DOCS) + i})
    rag.add_documents(texts, metadatas)
    print(f"Seeded {len(texts)} documents into ChromaDB at {__import__('app.services.langchain_rag').services.langchain_rag.CHROMA_PERSIST_DIR}")


if __name__ == "__main__":
    main()
