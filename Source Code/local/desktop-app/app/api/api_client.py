from dotenv import load_dotenv
import httpx
import os

load_dotenv()

BASE_API_URL = os.getenv("BASE_API_URL")

async def handle_401(response: httpx.Response):
    if response.status_code == 401:
        print(f"401 Unauthorized detected for {response.url}")

class APIClient:
    _instance = None 

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(APIClient, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if hasattr(self, "_initialized"):
            return 

        self.client = httpx.Client(
            base_url=BASE_API_URL,
            event_hooks={"response": [handle_401]}
        )

        self._initialized = True

    def login(self, email, passw):
        r = self.client.post(BASE_API_URL + "/users/login", json={
            "email": email,
            "password": passw
        })
        return r.status_code == 200, r.json()
    
    def check_in_out(self, uid, plate, image_bytes):

        files = {
            "image": ("plate.jpg", image_bytes, "image/jpeg")
        }

        data = {
            "card_uid": uid,
            "plate": plate
        }

        r = self.client.post(BASE_API_URL + "/sessions/check", data=data, files=files)
        return r.status_code == 200, r.json()
    
