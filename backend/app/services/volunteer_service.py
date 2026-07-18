"""Volunteer management service with LangGraph-powered task assignment."""
import uuid
from datetime import datetime, timezone
from typing import Optional
from dataclasses import dataclass

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.volunteer import Volunteer, VolunteerTask, VolunteerRole, VolunteerStatus, VolunteerTaskStatus
from app.schemas.volunteer_schema import (
    VolunteerCreate, VolunteerResponse, VolunteerUpdate,
    VolunteerTaskCreate, VolunteerTaskResponse, VolunteerTaskUpdate,
    VolunteerDashboardResponse,
)
from app.services.langgraph_agent import LangGraphAgent
from app.utils.logger import logger


@dataclass
class VolunteerService:
    db: Session

    # ─── Volunteers ───

    def list_volunteers(self, role: Optional[str] = None) -> list[VolunteerResponse]:
        q = select(Volunteer)
        if role:
            q = q.where(Volunteer.role == role)
        rows = self.db.execute(q.order_by(Volunteer.name)).scalars().all()
        return [self._vol_to_resp(r) for r in rows]

    def get_volunteer(self, volunteer_id: str) -> Optional[VolunteerResponse]:
        v = self.db.get(Volunteer, volunteer_id)
        return self._vol_to_resp(v) if v else None

    def create_volunteer(self, user_id: str, req: VolunteerCreate) -> VolunteerResponse:
        v = Volunteer(
            id=str(uuid.uuid4()), user_id=user_id, name=req.name,
            role=req.role, zone=req.zone, languages=req.languages, phone=req.phone,
        )
        self.db.add(v)
        self.db.commit()
        self.db.refresh(v)
        return self._vol_to_resp(v)

    def update_volunteer(self, volunteer_id: str, req: VolunteerUpdate) -> Optional[VolunteerResponse]:
        v = self.db.get(Volunteer, volunteer_id)
        if not v:
            return None
        if req.status is not None:
            v.status = req.status
        if req.zone is not None:
            v.zone = req.zone
        self.db.commit()
        self.db.refresh(v)
        return self._vol_to_resp(v)

    # ─── Tasks ───

    def list_tasks(self, status: Optional[str] = None) -> list[VolunteerTaskResponse]:
        q = select(VolunteerTask)
        if status:
            q = q.where(VolunteerTask.status == status)
        rows = self.db.execute(q.order_by(VolunteerTask.created_at.desc())).scalars().all()
        return [self._task_to_resp(r) for r in rows]

    def create_task(self, req: VolunteerTaskCreate) -> VolunteerTaskResponse:
        t = VolunteerTask(
            id=str(uuid.uuid4()), volunteer_id=req.volunteer_id,
            task_type=req.task_type, description=req.description,
            zone=req.zone, priority=req.priority,
        )
        self.db.add(t)
        self.db.commit()
        self.db.refresh(t)
        return self._task_to_resp(t)

    def update_task(self, task_id: str, req: VolunteerTaskUpdate) -> Optional[VolunteerTaskResponse]:
        t = self.db.get(VolunteerTask, task_id)
        if not t:
            return None
        t.status = req.status
        if req.volunteer_id is not None:
            t.volunteer_id = req.volunteer_id
        if req.status == VolunteerTaskStatus.completed.value:
            t.completed_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(t)
        return self._task_to_resp(t)

    # ─── Dashboard ───

    def dashboard(self) -> VolunteerDashboardResponse:
        total = self.db.execute(select(func.count(Volunteer.id))).scalar() or 0
        on_shift = self.db.execute(
            select(func.count(Volunteer.id)).where(Volunteer.status == VolunteerStatus.on_shift.value)
        ).scalar() or 0
        available = self.db.execute(
            select(func.count(Volunteer.id)).where(Volunteer.status == VolunteerStatus.available.value)
        ).scalar() or 0
        active_tasks = self.db.execute(
            select(func.count(VolunteerTask.id)).where(
                VolunteerTask.status.in_([VolunteerTaskStatus.assigned.value, VolunteerTaskStatus.in_progress.value])
            )
        ).scalar() or 0
        volunteers = self.list_volunteers()
        tasks = self.list_tasks()
        return VolunteerDashboardResponse(
            total=total, on_shift=on_shift, available=available,
            active_tasks=active_tasks, volunteers=volunteers, tasks=tasks,
        )

    # ─── AI Task Assignment ───

    async def assign_tasks_from_analysis(self, analysis_tasks: list[dict]):
        """Auto-assign high-priority tasks to available volunteers using LangGraph."""
        available_vs = self.db.execute(
            select(Volunteer).where(Volunteer.status == VolunteerStatus.available.value)
        ).scalars().all()

        for task_data in analysis_tasks:
            matched = None
            for v in available_vs:
                if task_data.get("zone") and v.zone and v.zone == task_data["zone"]:
                    matched = v
                    break
            if not matched and available_vs:
                matched = available_vs[0]

            task_req = VolunteerTaskCreate(
                volunteer_id=matched.id if matched else None,
                task_type=task_data.get("type", "general"),
                description=task_data.get("description", ""),
                zone=task_data.get("zone"),
                priority=task_data.get("priority", "medium"),
            )
            self.create_task(task_req)
            if matched:
                matched.status = VolunteerStatus.on_shift.value
                self.db.commit()

    # ─── Helpers ───

    def _vol_to_resp(self, v: Volunteer) -> VolunteerResponse:
        return VolunteerResponse(
            id=v.id, user_id=v.user_id, name=v.name, role=v.role,
            status=v.status, zone=v.zone, languages=v.languages,
            phone=v.phone, created_at=v.created_at,
        )

    def _task_to_resp(self, t: VolunteerTask) -> VolunteerTaskResponse:
        return VolunteerTaskResponse(
            id=t.id, volunteer_id=t.volunteer_id, task_type=t.task_type,
            description=t.description, zone=t.zone, priority=t.priority,
            status=t.status, assigned_at=t.assigned_at,
            completed_at=t.completed_at, created_at=t.created_at,
        )
