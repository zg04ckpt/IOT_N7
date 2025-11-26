from dotenv import load_dotenv
import httpx
import os

load_dotenv()

BASE_API_URL = os.getenv("BASE_API_URL")

async def login(email, passw):
    async with httpx.AsyncClient() as client:
        r = await client.post(BASE_API_URL + "/users/login", json={
            "email": email,
            "password": passw
        })
        return r.status_code == 200, r.json()
    
