from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    campaigns = relationship("Campaign", back_populates="owner")

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True)
    product_description = Column(String)
    target_audience = Column(String)
    tone = Column(String)
    strategies = Column(Text)
    selected_strategy = Column(Text, nullable=True) # NEW: To store the chosen strategy
    campaign_timeline = Column(Text, nullable=True) # NEW: To store the generated timeline
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="campaigns")