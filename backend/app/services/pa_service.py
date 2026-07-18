"""PA broadcast service with working TTS generation.

Generates actual audio files via gTTS for each translation language.
Serves audio through the /api/pa/tts/{ann_id}/{lang} endpoint."""
import uuid
import os
from pathlib import Path
from datetime import datetime, timezone

from app.config import settings
from app.schemas.pa_schema import (
    PAAnnouncementRequest, PAAnnouncementResponse, PAAnnouncement,
    PALogResponse, PALogEntry,
)
from app.services.llm_provider import LLMProvider
from app.utils.logger import logger

TTS_DIR = Path(__file__).resolve().parent.parent.parent / "tts_output"

TRANSLATION_TEMPLATES = {
    "en": {
        "gate_closed": "Attention: {gate} is closed. {extra}",
        "evacuation": "URGENT: Evacuation in progress. Please proceed to the nearest exit calmly. {extra}",
        "delay": "Notice: There is a delay at {gate}. {extra}",
        "weather": "Weather advisory: {message}",
        "medical": "Medical assistance needed at {gate}. Staff please respond.",
        "lost_child": "Attention: A lost child is looking for their parent at {gate}.",
        "general": "Attention: {message}",
    },
    "es": {
        "gate_closed": "Atención: {gate} está cerrado. {extra}",
        "evacuation": "URGENTE: Evacuación en curso. Procedan a la salida más cercana con calma. {extra}",
        "delay": "Aviso: Hay un retraso en {gate}. {extra}",
        "weather": "Aviso meteorológico: {message}",
        "medical": "Asistencia médica necesaria en {gate}. Personal por favor respondan.",
        "lost_child": "Atención: Un niño perdido busca a su padre en {gate}.",
        "general": "Atención: {message}",
    },
    "fr": {
        "gate_closed": "Attention : {gate} est fermé. {extra}",
        "evacuation": "URGENT : Évacuation en cours. Veuillez procéder à la sortie la plus proche calmement. {extra}",
        "delay": "Avis : Il y a un retard à {gate}. {extra}",
        "weather": "Avis météorologique : {message}",
        "medical": "Assistance médicale requise au {gate}. Personnel merci de répondre.",
        "lost_child": "Attention : Un enfant perdu recherche ses parents au {gate}.",
        "general": "Attention : {message}",
    },
    "de": {
        "gate_closed": "Achtung: {gate} ist geschlossen. {extra}",
        "evacuation": "DRINGEND: Evakuierung läuft. Bitte gehen Sie ruhig zum nächsten Ausgang. {extra}",
        "delay": "Hinweis: Es gibt eine Verzögerung bei {gate}. {extra}",
        "weather": "Wetterhinweis: {message}",
        "medical": "Medizinische Hilfe benötigt bei {gate}.",
        "lost_child": "Achtung: Ein verlorenes Kind sucht seine Eltern bei {gate}.",
        "general": "Achtung: {message}",
    },
    "ar": {
        "gate_closed": "تنبيه: {gate} مغلق. {extra}",
        "evacuation": "عاجل: عملية إخلاء جارية. يرجى التوجه إلى أقرب مخرج بهدوء. {extra}",
        "delay": "إشعار: يوجد تأخير في {gate}. {extra}",
        "weather": "تنبيه الطقس: {message}",
        "medical": "مساعدة طبية مطلوبة في {gate}.",
        "lost_child": "تنبيه: طفل ضائع يبحث عن والديه في {gate}.",
        "general": "تنبيه: {message}",
    },
    "zh": {
        "gate_closed": "注意：{gate} 已关闭。{extra}",
        "evacuation": "紧急：疏散进行中。请冷静前往最近的出口。{extra}",
        "delay": "通知：{gate} 有延误。{extra}",
        "weather": "天气提醒：{message}",
        "medical": "{gate} 需要医疗援助。",
        "lost_child": "注意：一名走失儿童在 {gate} 寻找父母。",
        "general": "注意：{message}",
    },
}

GATE_EXTRAS = {
    "gate_closed": "Please use an alternative gate.",
    "evacuation": "Follow staff instructions.",
    "delay": "Wait times may be longer than usual.",
}

LANG_TTS_CODES = {"en": "en", "es": "es", "fr": "fr", "de": "de", "ar": "ar", "zh": "zh-CN"}


class PAService:
    _announcements: list = []

    def __init__(self):
        self.llm = LLMProvider()

    @property
    def announcements(self) -> list:
        return PAService._announcements

    async def _generate_tts(self, text: str, lang: str, filename: str) -> bool:
        try:
            from gtts import gTTS
            os.makedirs(TTS_DIR, exist_ok=True)
            lang_code = LANG_TTS_CODES.get(lang, "en")
            tts = gTTS(text=text, lang=lang_code, slow=False)
            filepath = TTS_DIR / filename
            tts.save(str(filepath))
            logger.info("TTS saved: {f}", f=filepath)
            return True
        except Exception as e:
            logger.warning("TTS failed for {lang}: {err}", lang=lang, err=str(e))
            return False

    async def _upload_to_cloudinary(self, filepath: Path, filename: str) -> str | None:
        try:
            import cloudinary
            import cloudinary.uploader
            
            if not (settings.cloudinary_cloud_name and settings.cloudinary_api_key and settings.cloudinary_api_secret):
                if settings.cloudinary_url:
                    pass
                else:
                    logger.info("Cloudinary credentials not fully configured, using local file serving")
                    return None
            
            if settings.cloudinary_cloud_name:
                cloudinary.config(
                    cloud_name=settings.cloudinary_cloud_name,
                    api_key=settings.cloudinary_api_key,
                    api_secret=settings.cloudinary_api_secret,
                    secure=True
                )
            
            public_id = Path(filename).stem
            logger.info("Uploading {f} to Cloudinary...", f=filename)
            
            import asyncio
            from concurrent.futures import ThreadPoolExecutor
            
            def do_upload():
                return cloudinary.uploader.upload(
                    str(filepath),
                    public_id=public_id,
                    resource_type="video",
                    folder="stadiumsense_tts"
                )
            
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as pool:
                res = await loop.run_in_executor(pool, do_upload)
                
            secure_url = res.get("secure_url")
            logger.info("Cloudinary upload successful: {u}", u=secure_url)
            return secure_url
        except ImportError:
            logger.warning("cloudinary package not installed, using local file serving")
            return None
        except Exception as e:
            logger.warning("Cloudinary upload failed: {err}", err=str(e))
            return None

    async def create_announcement(self, req: PAAnnouncementRequest) -> PAAnnouncementResponse:
        now = datetime.now(timezone.utc).isoformat()
        ann_id = str(uuid.uuid4())[:8]

        translations = {}
        tts_urls = {}
        for lang in req.languages:
            templates = TRANSLATION_TEMPLATES.get(lang, TRANSLATION_TEMPLATES["en"])
            template = templates.get(req.type, templates["general"])
            gate_label = req.gate or "the stadium"
            extra = GATE_EXTRAS.get(req.type, "")
            translated = template.format(gate=gate_label, message=req.message, extra=extra)
            translations[lang] = translated

            # Generate TTS audio file
            filename = f"{ann_id}_{lang}.mp3"
            success = await self._generate_tts(translated, lang, filename)
            
            cloudinary_url = None
            if success:
                cloudinary_url = await self._upload_to_cloudinary(TTS_DIR / filename, filename)
                
            if cloudinary_url:
                tts_urls[lang] = cloudinary_url
            else:
                tts_urls[lang] = f"/api/pa/tts/{ann_id}/{lang}" if success else ""

        announcement = PAAnnouncement(
            id=ann_id, type=req.type, severity=req.severity,
            original_message=req.message, translations=translations,
            gate=req.gate, timestamp=now, broadcast=req.broadcast,
            status="broadcast" if req.broadcast else "draft",
        )

        self.announcements.append({
            "id": ann_id, "type": req.type, "severity": req.severity,
            "message": req.message, "gate": req.gate, "timestamp": now,
            "broadcast": req.broadcast, "languages": req.languages,
        })
        if len(self.announcements) > 500:
            self.announcements.pop(0)

        return PAAnnouncementResponse(announcement=announcement, tts_urls=tts_urls)

    async def get_tts_audio(self, ann_id: str, lang: str):
        """Serve the TTS audio file for an announcement in a given language."""
        filepath = TTS_DIR / f"{ann_id}_{lang}.mp3"
        if filepath.exists():
            return filepath
        # Fallback: generate on the fly
        entry = next((a for a in self.announcements if a["id"] == ann_id), None)
        if entry:
            templates = TRANSLATION_TEMPLATES.get(lang, TRANSLATION_TEMPLATES["en"])
            template = templates.get(entry["type"], templates["general"])
            extra = GATE_EXTRAS.get(entry["type"], "")
            text = template.format(gate=entry["gate"] or "the stadium", message=entry["message"], extra=extra)
            success = await self._generate_tts(text, lang, f"{ann_id}_{lang}.mp3")
            if success:
                return filepath
        return None

    async def get_log(self) -> PALogResponse:
        entries = [
            PALogEntry(
                id=a["id"], type=a["type"], severity=a["severity"],
                message=a["message"], gate=a["gate"], timestamp=a["timestamp"],
                broadcast=a["broadcast"], languages=a["languages"],
            )
            for a in reversed(self.announcements[-50:])
        ]
        return PALogResponse(announcements=entries, total=len(self.announcements))
