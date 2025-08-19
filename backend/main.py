from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
import google.generativeai as genai
from sqlalchemy.orm import Session
from typing import List
from dotenv import load_dotenv
import os

import auth, models, schemas
from database import SessionLocal, engine

# --- SETUP ---
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
models.Base.metadata.create_all(bind=engine)
app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTHENTICATION ENDPOINTS ---
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(db: Session = Depends(auth.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/register", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    db_user = auth.get_user(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return auth.create_user(db=db, user=user)

# --- AI & CAMPAIGN ENDPOINTS ---
@app.post("/generate-strategies", response_model=schemas.Campaign)
async def generate_strategies(request: schemas.StrategyRequest, db: Session = Depends(auth.get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    model = genai.GenerativeModel('gemini-2.5-flash-lite') # Using the specified model
    prompt = f"""
    You are a panel of three different innovative marketing consultants for Indian SMEs.
    Propose three unique, practical, and low-budget marketing strategy concepts.
    For each strategy, provide a **Concept Name** and a **Core Narrative**.
    Use the separator "---" between each strategy. Do not include any introductory text.
    **Product:** {request.product_name}
    **Audience:** {request.target_audience}
    **Tone:** {request.tone}
    """
    response = model.generate_content(prompt)
    strategies_text = response.text.strip()
    
    db_campaign = models.Campaign(
        product_name=request.product_name,
        product_description=request.product_description,
        target_audience=request.target_audience,
        tone=request.tone,
        strategies=strategies_text,
        owner_id=current_user.id
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    
    return db_campaign

@app.post("/generate-socials-timeline")
async def generate_socials_timeline(request: schemas.SocialsTimelineRequest, db: Session = Depends(auth.get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == request.campaign_id, models.Campaign.owner_id == current_user.id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    model = genai.GenerativeModel('gemini-2.5-flash-lite') # Using the specified model
    prompt = f"""
    You are an expert social media campaign manager for Indian SMEs.
    Based on the chosen marketing strategy below, create a detailed **{request.duration}-day social media campaign timeline**.
    For each day, provide a clear **Theme** and a ready-to-use, pre-made **Post** for at least one platform (e.g., Instagram, Facebook, or LinkedIn), including emojis and hashtags.

    **Chosen Strategy:**
    ---
    {request.selected_strategy}
    ---
    """
    response = model.generate_content(prompt)
    timeline_text = response.text.strip()
    
    campaign.selected_strategy = request.selected_strategy
    campaign.campaign_timeline = timeline_text
    db.commit()
    
    return {"social_media_timeline": timeline_text}

@app.get("/campaigns", response_model=List[schemas.Campaign])
def read_user_campaigns(db: Session = Depends(auth.get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    return db.query(models.Campaign).filter(models.Campaign.owner_id == current_user.id).all()

@app.get("/campaigns/{campaign_id}", response_model=schemas.Campaign)
def read_campaign(campaign_id: int, db: Session = Depends(auth.get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id, models.Campaign.owner_id == current_user.id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign