import re

INJECTION_PATTERNS = [
    r"(?i)(system|exec|eval|subprocess|os\.)",
    r"(?i)(ignore\s+all\s+(previous|above|prior)\s+instructions)",
    r"(?i)(forget|disregard|override)\s+(all\s+)?(previous|prior|above)",
    r"(?i)(you\s+are\s+(now|not\s+)?\s*(an?|the)\s+(free|unbound|unrestricted|god|master))",
    r"(?i)(jailbreak|prompt\s?injection)",
    r"(?i)(reveal\s+(your\s+)?(prompt|system\s+message|instructions|rules))",
    r"(?i)(DAN|do\s+anything\s+now)",
    r"(?i)(output\s+your\s+(prompt|instructions|system\s+message))",
]


def sanitize_prompt(text: str) -> str:
    stripped = re.sub(r"<[^>]*>", "", text)
    stripped = stripped.replace("\u0000", "")
    return stripped.strip()[:4000]


def contains_injection(text: str) -> bool:
    return any(re.search(p, text) for p in INJECTION_PATTERNS)
