import api


class LoginController:
    def __init__(self, on_login_failed, on_login_successful):
        self.on_login_failed = on_login_failed
        self.on_login_successful = on_login_successful
    
    async def login(self, email, passw):
        self.on_login_successful()
        # try:
        #     success, res = await api.login(email, passw)
        #     if success:
        #         self.on_login_successful()
        #     else:
        #         self.on_login_failed(f"Đăng nhập thất bại: {res['message']}")
        # except Exception as e:
        #     self.on_login_failed(f"Đăng nhập thất bại: {str(e)}")

    

