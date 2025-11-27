from dotenv import load_dotenv
import httpx
import os

load_dotenv()

BASE_API_URL = os.getenv("BASE_API_URL")

def handle_401(response: httpx.Response):
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
    
    def create_new_card(self, uid):
        r = self.client.post(BASE_API_URL + f"/cards", json={
            "uid": uid,
        })
        return r.status_code in (200, 201), r.json()
    
    def register_monthly(self, id, name, phone, months, address):
        r = self.client.put(BASE_API_URL + f"/cards/{id}/register-monthly", json={
            "name": name,
            "phone": phone,
            "months": int(months) if months else 0,
            "address": address
        })
        return r.status_code in (200, 201), r.json()
    
    def unregister_monthly(self, id):
        r = self.client.put(BASE_API_URL + f"/cards/{id}/unregister-monthly")
        return r.status_code in (200, 201), r.json()
    
    def get_card_info(self, uid):
        r = self.client.get(BASE_API_URL + f"/cards/info?uid={uid}")
        return r.status_code in (200, 201), r.json()

    def check_in_out(self, uid, plate, image_bytes):

        files = {
            "image": ("plate.jpg", image_bytes, "image/jpeg")
        }

        data = {
            "card_uid": uid,
            "plate": plate
        }

        r = self.client.post(BASE_API_URL + "/sessions/check", data=data, files=files)
        return r.status_code in (200, 201), r.json()
    
