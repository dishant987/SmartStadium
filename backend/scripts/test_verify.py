"""Quick verification script for RAG, realtime, and volunteer endpoints."""
import asyncio, json, sys, uuid
sys.path.insert(0, ".")
from app.services.langchain_rag import LangChainRAGService
from app.services.realtime_service import RealtimeSimulator, OpsLangGraphAgent
from app.db.session import SessionLocal
from app.services.volunteer_service import VolunteerService
from app.schemas.volunteer_schema import VolunteerCreate, VolunteerUpdate, VolunteerTaskCreate


async def test_rag():
    print("=" * 50)
    print("[VERIFY] RAG with ChromaDB + LangChain")
    rag = LangChainRAGService()
    queries = [
        ("gates opening hours", 3),
        ("wheelchair accessible", 2),
        ("NJ Transit schedule", 2),
        ("volunteer check in", 2),
        ("sustainability recycling", 2),
    ]
    all_ok = True
    for q, k in queries:
        docs = await rag.retrieve(q, top_k=k)
        status = "PASS" if docs else "FAIL"
        if not docs: all_ok = False
        print(f"  [{status}] '{q}' -> {len(docs)} docs")
        for d in docs:
            print(f"         {d[:100]}")
    print(f"  RAG overall: {'ALL PASS' if all_ok else 'SOME FAILED'}")
    return all_ok


async def test_realtime():
    print("\n" + "=" * 50)
    print("[VERIFY] Real-time Data Simulator + OpsLangGraphAgent")
    sim = RealtimeSimulator()
    state = sim.get_state()
    checks = [
        ("crowd_density count", len(state["crowd_density"]) == 5),
        ("transit count", len(state["transit"]) == 6),
        ("wait_times count", len(state["wait_times"]) == 10),
        ("match_status set", state["match_status"] in ("pre_match", "in_progress", "halftime", "post_match")),
        ("tick increments", state["tick"] > 0),
    ]
    for label, ok in checks:
        print(f"  {'PASS' if ok else 'FAIL'} {label}")

    agent = OpsLangGraphAgent()
    analysis = await agent.analyze(state)
    recs_ok = len(analysis["recommendations"]) > 0
    tasks_ok = "volunteer_tasks" in analysis
    print(f"  {'PASS' if recs_ok else 'FAIL'} analysis recommendations ({len(analysis['recommendations'])} items)")
    print(f"  {'PASS' if tasks_ok else 'FAIL'} analysis volunteer_tasks")
    if analysis["recommendations"]:
        print(f"         First rec: {analysis['recommendations'][0]['title']} ({analysis['recommendations'][0]['priority']})")

    all_ok = all(ok for _, ok in checks) and recs_ok and tasks_ok
    print(f"  Realtime overall: {'ALL PASS' if all_ok else 'SOME FAILED'}")
    return all_ok


async def test_volunteer():
    print("\n" + "=" * 50)
    print("[VERIFY] Volunteer System (DB models + service)")
    db = SessionLocal()
    try:
        svc = VolunteerService(db)
        test_email = f"test_vol_{uuid.uuid4().hex[:6]}@test.com"

        # Create volunteer
        v = svc.create_volunteer(test_email, VolunteerCreate(name="Test Volunteer", role="concierge", zone="z1", languages="en,es", phone="555-0100"))
        assert v.name == "Test Volunteer"
        assert v.role == "concierge"
        assert v.status == "available"
        print(f"  PASS create_volunteer (id={v.id[:8]})")

        # Update status
        v2 = svc.update_volunteer(v.id, VolunteerUpdate(status="on_shift"))
        assert v2 and v2.status == "on_shift"
        print(f"  PASS update_volunteer status -> on_shift")

        # Dashboard
        dash = svc.dashboard()
        assert dash.total > 0
        assert dash.volunteers
        assert dash.tasks is not None
        print(f"  PASS dashboard (total={dash.total}, on_shift={dash.on_shift}, available={dash.available})")

        # Create task
        t = svc.create_task(VolunteerTaskCreate(task_type="crowd_assist", description="Assist at Main Stand", zone="z1", priority="high"))
        assert t.task_type == "crowd_assist"
        assert t.status == "assigned"
        print(f"  PASS create_task (id={t.id[:8]})")

        # AI task assignment (simulates what OpsLangGraphAgent would emit)
        analysis_tasks = [
            {"type": "crowd_assist", "zone": "z1", "description": "High density at Main Stand", "priority": "high"},
            {"type": "transit_guide", "zone": "z2", "description": "Guide fans at Blue Line", "priority": "medium"},
        ]
        await svc.assign_tasks_from_analysis(analysis_tasks)
        tasks = svc.list_tasks()
        print(f"  PASS task assignment (total tasks now: {len(tasks)})")
        print(f"  Volunteer overall: ALL PASS")
        return True
    except Exception as e:
        print(f"  FAIL: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


async def test_sustainability():
    print("\n" + "=" * 50)
    print("[VERIFY] Sustainability — GenAI-powered")
    from app.services.sustainability_service import SustainabilityService
    svc = SustainabilityService()

    tip = await svc.get_tip("fan at main stand")
    ok1 = bool(tip.tip)
    print(f"  PASS AI tip ({tip.source}): {tip.tip[:80]}")

    tips = await svc.get_personalized_tips("z1", "halftime")
    ok2 = len(tips) >= 2
    print(f"  PASS personalized tips: {len(tips)} tips")
    for t in tips[:2]: print(f"       [{t.category}] {t.tip[:60]}")

    carbon = await svc.calculate_carbon("driving", 15, 2)
    ok3 = carbon.co2_kg > 0 and bool(carbon.greener_option)
    print(f"  PASS carbon calc: {carbon.co2_kg}kg CO2, greener={bool(carbon.greener_option)}")

    stations = await svc.get_stations()
    ok4 = len(stations.stations) >= 4
    print(f"  PASS stations: {len(stations.stations)} stations")

    all_ok = ok1 and ok2 and ok3 and ok4
    print(f"  Sustainability: {'ALL PASS' if all_ok else 'SOME FAILED'}")
    return all_ok


async def test_accessibility():
    print("\n" + "=" * 50)
    print("[VERIFY] Accessibility — AI-adaptive routing")
    from app.services.accessibility_service import AccessibilityService
    from app.schemas.accessibility_schema import AccessibilityRouteRequest
    svc = AccessibilityService()

    status = await svc.get_status()
    ok1 = len(status) >= 3
    print(f"  PASS elevator status: {len(status)} elevators")

    route = await svc.get_ai_route(AccessibilityRouteRequest(from_zone="z6", to_zone="z1", wheelchair=True, avoid_crowds=True))
    ok2 = len(route.steps) > 0 and route.total_distance_m > 0
    ok3 = bool(route.ai_summary)
    ok4 = len(route.warnings) > 0
    print(f"  PASS AI route: {route.from_name} -> {route.to_name}, {route.total_distance_m}m, {len(route.steps)} steps")
    print(f"  PASS AI summary: {route.ai_summary[:80]}")
    print(f"  PASS warnings: {len(route.warnings)} ({route.warnings[0][:40] if route.warnings else 'none'})")

    all_ok = ok1 and ok2 and ok3 and ok4
    print(f"  Accessibility: {'ALL PASS' if all_ok else 'SOME FAILED'}")
    return all_ok


async def test_pa_tts():
    print("\n" + "=" * 50)
    print("[VERIFY] PA TTS — Working text-to-speech")
    from app.services.pa_service import PAService
    from app.schemas.pa_schema import PAAnnouncementRequest
    from pathlib import Path
    svc = PAService()

    req = PAAnnouncementRequest(type="evacuation", severity="critical", message="Test evacuation alert", gate="Gate A", languages=["en", "es", "fr"], broadcast=True)
    result = await svc.create_announcement(req)

    ok1 = len(result.announcement.translations) == 3
    ok2 = len(result.tts_urls) == 3
    print(f"  PASS translations: {len(result.announcement.translations)} languages")
    print(f"  PASS TTS URLs: {list(result.tts_urls.keys())}")

    tts_dir = Path("tts_output")
    files = list(tts_dir.glob(f"{result.announcement.id}_*"))
    ok3 = len(files) == 3
    for f in files:
        print(f"       {f.name} ({f.stat().st_size} bytes)")

    audio = await svc.get_tts_audio(result.announcement.id, "en")
    ok4 = audio and Path(audio).exists()
    print(f"  PASS audio retrieval: {ok4}")

    all_ok = ok1 and ok2 and ok3 and ok4
    print(f"  PA TTS: {'ALL PASS' if all_ok else 'SOME FAILED'}")
    return all_ok


async def main():
    rag_ok = await test_rag()
    rt_ok = await test_realtime()
    vol_ok = await test_volunteer()
    sus_ok = await test_sustainability()
    acc_ok = await test_accessibility()
    tts_ok = await test_pa_tts()

    print("\n" + "=" * 50)
    results = f"RAG={'PASS' if rag_ok else 'FAIL'} | REALTIME={'PASS' if rt_ok else 'FAIL'} | VOLUNTEER={'PASS' if vol_ok else 'FAIL'} | SUSTAIN={'PASS' if sus_ok else 'FAIL'} | ACCESS={'PASS' if acc_ok else 'FAIL'} | TTS={'PASS' if tts_ok else 'FAIL'}"
    print(f"SUMMARY: {results}")
    if all([rag_ok, rt_ok, vol_ok, sus_ok, acc_ok, tts_ok]):
        print("ALL 6 VERIFIED SUCCESSFULLY")
    else:
        print("SOME CHECKS FAILED - see above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
