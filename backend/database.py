import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# This new block checks if the URL was found and provides a clear error.
if not DATABASE_URL:
    print("FATAL ERROR: DATABASE_URL environment variable is not set.")
    print("Please check your .env file in the 'backend' directory.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()