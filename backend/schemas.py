from pydantic import BaseModel
from typing import List, Optional

# --- For AI Endpoints ---
class StrategyRequest(BaseModel):
    product_name: str
    product_description: str
    target_audience: str
    tone: str

class SocialsTimelineRequest(BaseModel):
    campaign_id: int
    selected_strategy: str
    duration: int # e.g., 7, 15, or 30 days

# --- For Database & Users ---
class CampaignBase(BaseModel):
    product_name: str
    product_description: str
    target_audience: str
    tone: str

class Campaign(CampaignBase):
    id: int
    owner_id: int
    strategies: str
    selected_strategy: Optional[str] = None
    campaign_timeline: Optional[str] = None

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    campaigns: List[Campaign] = []

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None