from sqlalchemy import create_engine, text
from app.models import Base

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=engine)

from sqlalchemy.orm import sessionmaker
Session = sessionmaker(bind=engine)
s = Session()

result = s.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
print("Tables:", [r[0] for r in result])
