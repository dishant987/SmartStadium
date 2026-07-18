import sys
from pathlib import Path

from loguru import logger

LOG_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

logger.remove()

logger.add(
    sys.stderr,
    format="<green>{time:HH:mm:ss}</green> | <level>{level:<8}</level> | {extra[request_id]:<36} | <level>{message}</level>",
    level="INFO",
    colorize=True,
)

logger.add(
    str(LOG_DIR / "app.log"),
    rotation="10 MB",
    retention="30 days",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level:<8} | {extra[request_id]:<36} | {message}",
    level="DEBUG",
)

logger.configure(extra={"request_id": "-"})
