from dotenv import load_dotenv
import httpx
import os

load_dotenv()

BASE_API_URL = os.getenv("BASE_API_URL")

async def handle_401(response: httpx.Response):
    if response.status_code == 401:
        print(f"401 Unauthorized detected for {response.url}")

class API:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=BASE_API_URL,
            event_hooks={
                "response": [handle_401]
            }
        )

    async def login(self, email, passw):
        r = await self.client.post(BASE_API_URL + "/users/login", json={
            "email": email,
            "password": passw
        })
        return r.status_code == 200, r.json()
    
