from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from app.core.database import supabase
from app.schemas import UserData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(request: Request) -> UserData:
    token = request.cookies.get("access_token")
    if not token:
        # Fallback to Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    try:
        # Verify token with Supabase
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
            
        # Extract username from metadata if available, or use email part
        username = user.user_metadata.get("username") if user.user_metadata else user.email.split("@")[0]
        
        return UserData(
            id=user.id,
            username=username, 
            email=user.email, 
            role="researcher" # Default role, can be improved to fetch from DB
        )
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")

async def get_optional_user(request: Request) -> UserData | None:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None
