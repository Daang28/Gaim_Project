import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel
import re

# SETUP
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
app = FastAPI()

# CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://gaim-project-bn1m.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DATA STRUCTURES
class StrategyRequest(BaseModel):
    product_name: str
    product_description: str
    target_audience: str
    tone: str

class SocialsRequest(BaseModel):
    product_name: str
    product_description: str
    target_audience: str
    tone: str
    core_narrative: str

# POINT 1: INITIAL STRATEGIES
@app.post("/generate-strategies")
async def generate_strategies(request: StrategyRequest):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash-lite')

        # SME's perspective.
        prompt = f"""
        You are a panel of three different scrappy, innovative marketing consultants who specialize in helping small and medium-sized enterprises (SMEs) in India grow.
        For the product below, each of you will propose one unique, high-level marketing strategy concept.

        **Product Name:** {request.product_name}
        **Description:** {request.product_description}
        **Target Audience:** {request.target_audience}
        **Required Tone:** {request.tone}

        **CRITICAL INSTRUCTIONS:**
        -   Your proposed strategies MUST be practical and feasible for a business with a limited marketing budget.
        -   Focus on low-cost, high-impact ideas: digital marketing, content creation, community building, and local partnerships.
        -   AVOID suggesting expensive campaigns like TV commercials, large-scale print ads, or hiring celebrity brand ambassadors.
        -   Generate exactly THREE distinct strategy concepts.
        -   For each strategy, provide a **Concept Name** and a **Core Narrative**.
        -   Use the separator "---" between each of the three strategies.
        -   Do not include any introductory sentences. Your response must start immediately with the first strategy's "Concept Name".
        """
        response = model.generate_content(prompt)
        
        strategies = response.text.strip().split('---')
        
        return {"strategies": [s.strip() for s in strategies if s.strip()]}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": "Failed to generate strategies."}

# POINT 2: SOCIAL MEDIA
@app.post("/generate-socials")
async def generate_socials(request: SocialsRequest):
    try:
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        
        prompt = f"""
        You are an expert social media manager for Indian SMEs. Your ideas must be practical for a small team to execute.
        Based on the chosen marketing strategy below, create three unique posts for Instagram, Facebook, and LinkedIn.
        The overall tone must be **{request.tone}**.

        **Chosen Strategy & Core Narrative:**
        ---
        {request.core_narrative}
        ---
        
        **Product Name:** {request.product_name}

        **Instructions:**
        1.  **Instagram Post:** Focus on an easily created visual (e.g., a good photo, a simple Reel). Use relevant emojis and 5-7 engaging hashtags.
        2.  **Facebook Post:** Focus on community building. Ask a question to spark conversation and encourage sharing.
        3.  **LinkedIn Post:** Focus on building professional credibility. Frame the product as a smart solution or share an insight related to the industry.

        **Output Format:** Structure your response with clear headings for "Instagram Post", "Facebook Post", and "LinkedIn Post".
        """
        response = model.generate_content(prompt)
        
        return {"social_media_posts": response.text.strip()}
    
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": "Failed to generate social media posts."}