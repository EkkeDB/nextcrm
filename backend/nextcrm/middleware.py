class CookieToHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print("🧠 CookieToHeaderMiddleware is running")  # ← ADD THIS
        token = request.COOKIES.get("access_token")
        if token:
            print("🔐 Found access_token in cookie")
            request.META["HTTP_AUTHORIZATION"] = f"Bearer {token}"
        else:
            print("❌ No access_token in cookie")
        return self.get_response(request)
