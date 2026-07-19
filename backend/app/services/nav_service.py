from dataclasses import dataclass

from app.schemas.nav_schema import (
    VenueMapResponse,
    VenueZone,
    VenueGate,
    VenueAmenity,
    RouteRequest,
    RouteResponse,
    RouteStep,
)
from app.schemas.wayfinding_schema import (
    WayfindingRequest,
    WayfindingRoute,
    WayfindingStep,
)


ZONES = [
    VenueZone(id="z1", name="Main Stand", type="seating"),
    VenueZone(id="z2", name="East Stand", type="seating"),
    VenueZone(id="z3", name="West Stand", type="seating"),
    VenueZone(id="z4", name="South Plaza", type="plaza"),
    VenueZone(id="z5", name="Fan Zone", type="fan_area"),
    VenueZone(id="z6", name="Parking Lot A", type="parking"),
]

GATES = [
    VenueGate(id="gA", name="Gate A", zone_id="z1"),
    VenueGate(id="gB", name="Gate B", zone_id="z2"),
    VenueGate(id="gC", name="Gate C", zone_id="z3"),
    VenueGate(id="gD", name="Gate D", zone_id="z4"),
]

AMENITIES = [
    VenueAmenity(id="a1", name="Guest Services", type="info", zone_id="z1"),
    VenueAmenity(id="a2", name="First Aid", type="medical", zone_id="z2"),
    VenueAmenity(
        id="a3", name="Accessible Entrance", type="accessibility", zone_id="z4"
    ),
    VenueAmenity(id="a4", name="Nursing Room", type="family", zone_id="z5"),
]

ZONE_GRAPH = {
    "z1": {"z2": 80, "z4": 120},
    "z2": {"z1": 80, "z3": 60, "z5": 100},
    "z3": {"z2": 60, "z4": 90},
    "z4": {"z1": 120, "z3": 90, "z5": 50, "z6": 200},
    "z5": {"z2": 100, "z4": 50},
    "z6": {"z4": 200},
}

WAYFINDING_DETAILS = {
    "z1": {
        "full_name": "Main Stand (Sections 101–130)",
        "level": "Level 2",
        "corridors": ["North Corridor", "West Concourse"],
        "elevators": ["Elevator A1 (North Lobby)"],
        "escalators": ["Escalator N1 to Level 1", "Escalator N2 to Level 3"],
        "exits": ["Gate A (northwest)", "Gate B (northeast)"],
        "landmarks": ["Team dugouts", "VIP Box entrance", "Main scoreboard"],
        "accessibility": "Wheelchair-accessible seating in Sections 115, 116. Elevator A1 provides step-free access from Level 1. Accessible restrooms on every concourse level.",
        "food": ["Concourse B hot dogs", "Section 112 beer garden"],
        "restrooms": ["Restroom N1 (Level 2, north)", "Restroom W1 (Level 2, west)"],
    },
    "z2": {
        "full_name": "East Stand (Sections 201–230)",
        "level": "Level 2",
        "corridors": ["East Concourse", "North Corridor"],
        "elevators": ["Elevator E1 (East Lobby)"],
        "escalators": ["Escalator E2 to Level 1"],
        "exits": ["Gate B (north)", "Gate E (east)"],
        "landmarks": [
            "First Aid station",
            "Fan merchandise shop",
            "East Plaza entrance",
        ],
        "accessibility": "Wheelchair-accessible seating in Section 218. Elevator E1 from parking garage. Assistive listening devices available at Info Desk.",
        "food": ["East Concession row", "Section 210 nachos"],
        "restrooms": ["Restroom E1 (Level 2, east)", "Restroom E2 (Level 1, east)"],
    },
    "z3": {
        "full_name": "West Stand (Sections 301–330)",
        "level": "Level 2",
        "corridors": ["West Concourse", "South Corridor"],
        "elevators": ["Elevator W1 (West Lobby)"],
        "escalators": ["Escalator W2 to Level 1"],
        "exits": ["Gate C (south)", "Gate F (west)"],
        "landmarks": ["Broadcast booth", "Press box", "West Plaza"],
        "accessibility": "Wheelchair-accessible seating in Section 320. Elevator W1 from street level. Accessible restrooms on concourse.",
        "food": ["West Concession tacos", "Section 310 craft beer"],
        "restrooms": ["Restroom W1 (Level 2, west)", "Restroom S1 (Level 1, south)"],
    },
    "z4": {
        "full_name": "South Plaza",
        "level": "Level 1",
        "corridors": ["South Concourse", "East Walkway"],
        "elevators": ["Elevator S1 (South Gate)"],
        "escalators": [],
        "exits": ["Gate D (south)", "Main Entrance (south)"],
        "landmarks": [
            "Main ticket office",
            "Guest services desk",
            "Accessible Entrance",
        ],
        "accessibility": "Fully accessible plaza with ramp access at all entry points. Accessible Entrance located here with dedicated staff assistance.",
        "food": ["Plaza food trucks", "South Concession area"],
        "restrooms": ["Restroom S1 (Level 1, south)", "Accessible restroom S2"],
    },
    "z5": {
        "full_name": "Fan Zone",
        "level": "Level 1",
        "corridors": ["Fan Walk", "East Promenade"],
        "elevators": [],
        "escalators": [],
        "exits": ["Gate E (east)"],
        "landmarks": ["Nursing room", "Kids play area", "Live screen viewing"],
        "accessibility": "Open-air accessible zone. Nursing room with private space. Stroller parking near Kids area.",
        "food": ["Fan Zone food court", "BBQ stand", "Ice cream cart"],
        "restrooms": ["Restroom F1 (Fan Zone)", "Family restroom F2"],
    },
    "z6": {
        "full_name": "Parking Lot A",
        "level": "Ground",
        "corridors": ["Parking walkway to South Plaza"],
        "elevators": [],
        "escalators": [],
        "exits": ["Exit to Route 120", "Exit to NJ Turnpike"],
        "landmarks": ["Accessible parking rows", "EV charging stations"],
        "accessibility": "Accessible parking in rows A1–A5 near the south elevator. Direct ramp to South Plaza. EV charging available.",
        "food": [],
        "restrooms": [],
    },
}

TRANSLATIONS = {
    "en": {
        "exit_via": "Exit via the {corridor}",
        "take_elevator": "Take {elevator} to {destination}",
        "take_escalator": "Take {escalator} to {destination}",
        "follow_signs": "Follow {color} signage to {destination}",
        "proceed": "Proceed through {area}",
        "you_will_see": "You will pass {landmark}",
        "exit_gate": "Exit through {gate}",
        "turn_left": "Turn left at {landmark}",
        "turn_right": "Turn right at {landmark}",
        "walk_straight": "Walk straight for {distance}m",
        "arrived": "You have arrived at {destination}",
        "wheelchair_note": "Wheelchair users: {instruction}",
        "accessibility_route": "This route is fully accessible with step-free access.",
        "estimated_time": "Estimated walking time: {minutes} minutes",
    },
    "es": {
        "exit_via": "Salga por {corridor}",
        "take_elevator": "Tome {elevator} hacia {destination}",
        "take_escalator": "Tome {escalator} hacia {destination}",
        "follow_signs": "Siga la señalización {color} hacia {destination}",
        "proceed": "Continúe por {area}",
        "you_will_see": "Pasará por {landmark}",
        "exit_gate": "Salga por {gate}",
        "turn_left": "Gire a la izquierda en {landmark}",
        "turn_right": "Gire a la derecha en {landmark}",
        "walk_straight": "Camine recto por {distance}m",
        "arrived": "Ha llegado a {destination}",
        "wheelchair_note": "Usuarios de silla de ruedas: {instruction}",
        "accessibility_route": "Esta ruta es completamente accesible sin escalones.",
        "estimated_time": "Tiempo estimado de caminata: {minutes} minutos",
    },
    "fr": {
        "exit_via": "Sortez par {corridor}",
        "take_elevator": "Prenez {elevator} vers {destination}",
        "take_escalator": "Prenez {escalator} vers {destination}",
        "follow_signs": "Suivez la signalisation {color} vers {destination}",
        "proceed": "Continuez par {area}",
        "you_will_see": "Vous passerez par {landmark}",
        "exit_gate": "Sortez par {gate}",
        "turn_left": "Tournez à gauche à {landmark}",
        "turn_right": "Tournez à droite à {landmark}",
        "walk_straight": "Marchez tout droit pendant {distance}m",
        "arrived": "Vous êtes arrivé à {destination}",
        "wheelchair_note": "Utilisateurs de fauteuil roulant : {instruction}",
        "accessibility_route": "Cet itinéraire est entièrement accessible sans marches.",
        "estimated_time": "Temps de marche estimé : {minutes} minutes",
    },
    "ar": {
        "exit_via": "اخرج عبر {corridor}",
        "take_elevator": "خذ {elevator} إلى {destination}",
        "take_escalator": "خذ {escalator} إلى {destination}",
        "follow_signs": "اتبع اللافتات {color} إلى {destination}",
        "proceed": "تابع عبر {area}",
        "exit_gate": "اخرج عبر {gate}",
        "arrived": "وصلت إلى {destination}",
        "accessibility_route": "هذه المسار متاح بالكامل بدون درج.",
        "estimated_time": "وقت المشي المقدر: {minutes} دقيقة",
    },
}


def resolve_zone_id(zone_or_item_id: str) -> str:
    if not zone_or_item_id:
        return zone_or_item_id
    val = zone_or_item_id.lower().strip()
    if val in ("z1", "z2", "z3", "z4", "z5", "z6"):
        return val
    # Map gates
    if val in ("gate-a", "ga"):
        return "z1"
    if val in ("gate-b", "gb"):
        return "z2"
    if val in ("gate-c", "gc"):
        return "z3"
    if val in ("gate-d", "gd"):
        return "z4"
    if val in ("gate-e", "ge"):
        return "z5"
    # Map sections
    if val in ("section-100", "100"):
        return "z1"
    if val in ("section-200", "200"):
        return "z2"
    if val in ("section-300", "300"):
        return "z3"
    # Map amenities
    if val in ("first-aid", "first aid", "a2"):
        return "z2"
    if val in ("info", "info desk", "guest services", "a1"):
        return "z1"
    if val == "a3":
        return "z4"
    if val == "a4":
        return "z5"
    return zone_or_item_id


def _bfs(start: str, end: str) -> list[str] | None:
    start = resolve_zone_id(start)
    end = resolve_zone_id(end)
    if start not in ZONE_GRAPH or end not in ZONE_GRAPH:
        return None
    visited, queue, parent = {start}, [(start, 0)], {start: None}
    while queue:
        current, _ = queue.pop(0)
        if current == end:
            path = []
            while current:
                path.append(current)
                current = parent[current]
            path.reverse()
            return path
        for neighbor in ZONE_GRAPH.get(current, {}):
            if neighbor not in visited:
                visited.add(neighbor)
                parent[neighbor] = current
                queue.append((neighbor, 0))
    return None


@dataclass
class NavService:
    async def get_venue_map(self) -> VenueMapResponse:
        return VenueMapResponse(zones=ZONES, gates=GATES, amenities=AMENITIES)

    async def get_route(self, req: RouteRequest) -> RouteResponse:
        start = resolve_zone_id(req.from_zone)
        end = resolve_zone_id(req.to_zone)
        if start not in ZONE_GRAPH or end not in ZONE_GRAPH:
            return RouteResponse(
                steps=[RouteStep(instruction="Unknown zone", distance_m=0)],
                total_distance_m=0,
                accessible=req.accessible,
            )
        visited, queue, parent = {start}, [(start, 0)], {start: None}
        while queue:
            current, dist = queue.pop(0)
            if current == end:
                path, steps = [], []
                while current:
                    path.append(current)
                    current = parent[current]
                path.reverse()
                total = 0
                for i in range(len(path) - 1):
                    d = ZONE_GRAPH[path[i]][path[i + 1]]
                    total += d
                    zone_name = next(
                        (z.name for z in ZONES if z.id == path[i + 1]), path[i + 1]
                    )
                    steps.append(
                        RouteStep(instruction=f"Proceed to {zone_name}", distance_m=d)
                    )
                return RouteResponse(
                    steps=steps, total_distance_m=total, accessible=req.accessible
                )
            for neighbor, distance in ZONE_GRAPH.get(current, {}).items():
                if neighbor not in visited:
                    visited.add(neighbor)
                    parent[neighbor] = current
                    queue.append((neighbor, dist + distance))
        return RouteResponse(
            steps=[RouteStep(instruction="No route found", distance_m=0)],
            total_distance_m=0,
            accessible=req.accessible,
        )

    async def get_wayfinding_route(self, req: WayfindingRequest) -> WayfindingRoute:
        path = _bfs(req.from_zone, req.to_zone)
        if not path:
            return WayfindingRoute(
                from_name=req.from_zone,
                to_name=req.to_zone,
                steps=[
                    WayfindingStep(
                        step_number=1,
                        instruction="No route found between these locations.",
                        distance_m=0,
                    )
                ],
                total_distance_m=0,
                estimated_time_min=0,
                accessible=req.accessible,
                accessibility_summary="Route not available.",
            )

        from_info = WAYFINDING_DETAILS.get(path[0], {})
        to_info = WAYFINDING_DETAILS.get(path[-1], {})
        from_name = from_info.get(
            "full_name", next((z.name for z in ZONES if z.id == path[0]), path[0])
        )
        to_name = to_info.get(
            "full_name", next((z.name for z in ZONES if z.id == path[-1]), path[-1])
        )

        steps: list[WayfindingStep] = []
        step_num = 1
        total_dist = 0

        current_info = from_info
        if current_info.get("corridors"):
            corridor = current_info["corridors"][0]
            steps.append(
                WayfindingStep(
                    step_number=step_num,
                    instruction=f"Exit via the {corridor}",
                    landmark=current_info.get("landmarks", [""])[0]
                    if current_info.get("landmarks")
                    else "",
                    distance_m=15,
                    level_change="",
                )
            )
            step_num += 1
            total_dist += 15

        if req.wheelchair or req.accessible:
            elevators = current_info.get("elevators", [])
            if elevators:
                steps.append(
                    WayfindingStep(
                        step_number=step_num,
                        instruction=f"Take {elevators[0]} to Level 1",
                        landmark="",
                        distance_m=5,
                        accessibility_note="Step-free access available",
                        level_change="Level 2 → Level 1",
                    )
                )
                step_num += 1
                total_dist += 5
            else:
                ramps = (
                    current_info.get("accessibility", "").split(".")[0]
                    if current_info.get("accessibility")
                    else ""
                )
                if ramps:
                    steps.append(
                        WayfindingStep(
                            step_number=step_num,
                            instruction="Use accessible ramp at east side of Level 2",
                            landmark="",
                            distance_m=20,
                            accessibility_note="Wheelchair-accessible ramp",
                            level_change="Level 2 → Level 1",
                        )
                    )
                    step_num += 1
                    total_dist += 20

        for i in range(1, len(path)):
            zone_id = path[i]
            zone_info = WAYFINDING_DETAILS.get(zone_id, {})
            zone_name = zone_info.get(
                "full_name", next((z.name for z in ZONES if z.id == zone_id), zone_id)
            )
            edge_dist = ZONE_GRAPH[path[i - 1]][zone_id]
            total_dist += edge_dist

            corridors = zone_info.get("corridors", [])
            corridor_text = f" through {corridors[0]}" if corridors else ""

            steps.append(
                WayfindingStep(
                    step_number=step_num,
                    instruction=f"Proceed to {zone_name}{corridor_text}",
                    landmark=zone_info.get("landmarks", [""])[0]
                    if zone_info.get("landmarks")
                    else "",
                    distance_m=edge_dist,
                )
            )
            step_num += 1

            if i == len(path) - 1:
                exits = zone_info.get("exits", [])
                if exits:
                    steps.append(
                        WayfindingStep(
                            step_number=step_num,
                            instruction=f"Exit through {exits[0]}",
                            landmark="",
                            distance_m=10,
                        )
                    )
                    step_num += 1
                    total_dist += 10

        if req.wheelchair or req.accessible:
            dest_info = WAYFINDING_DETAILS.get(path[-1], {})
            steps.append(
                WayfindingStep(
                    step_number=step_num,
                    instruction=dest_info.get(
                        "accessibility", "Destination is accessible."
                    ),
                    landmark="",
                    distance_m=0,
                    accessibility_note="Accessible route confirmed",
                )
            )
            step_num += 1

        est_time = max(1, total_dist // 80)
        wheelchair_alt = ""
        if req.wheelchair:
            dest_info = WAYFINDING_DETAILS.get(path[-1], {})
            wheelchair_alt = dest_info.get(
                "accessibility",
                "Use the accessible entrance at South Plaza for step-free access to all areas.",
            )

        return WayfindingRoute(
            from_name=from_name,
            to_name=to_name,
            steps=steps,
            total_distance_m=total_dist,
            estimated_time_min=est_time,
            accessible=req.accessible or req.wheelchair,
            accessibility_summary="Route includes step-free access via elevators and ramps."
            if (req.accessible or req.wheelchair)
            else "Standard route. Request accessible mode for step-free directions.",
            wheelchair_alternative=wheelchair_alt,
        )
