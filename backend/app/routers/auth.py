from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from supabase import create_client, Client, AuthApiError
from app.core.config import settings

router = APIRouter()

# --- Security Config ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# --- Supabase Client ---
# Initialize Supabase client
# Ensure keys are set in .env
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

# --- Models ---
class Token(BaseModel):
    access_token: str
    token_type: str

class UserData(BaseModel):
    username: str
    email: str | None = None
    role: str = "user"
    id: str

class UserSignup(BaseModel):
    username: str
    email: str
    password: str

# --- Utils ---
async def get_current_user(request: Request):
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
            role="researcher" # Default role
        )
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")

# --- Routes ---

@router.post("/login", response_model=Token)
async def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        # Supabase Login
        auth_response = supabase.auth.sign_in_with_password({
            "email": form_data.username, # form_data.username maps to email in standard OAuth2 form usually, but our frontend sends actual username/email. 
            # Frontend sends "username" as email for admin? 
            # Frontend logic: `const username = email === "admin@aqilytics.com" ? "admin" : email;`
            # Reverting frontend to send EMAIL is better, but for now let's assume form_data.username IS the email or we try to sign in with it.
            # Supabase requires email.
            "password": form_data.password
        })
        
        session = auth_response.session
        access_token = session.access_token
        
        # Set httpOnly cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            # Supabase tokens last longer, but let's stick to our config or session expiry
            max_age=session.expires_in, 
            samesite="lax",
            secure=False, # Set to True in production
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login failed"
        )

@router.post("/signup", response_model=Token)
async def signup(response: Response, user_data: UserSignup):
    try:
        # Supabase Signup
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "username": user_data.username
                }
            }
        })
        
        if not auth_response.session:
             # Confirmation required scenario
             raise HTTPException(status_code=status.HTTP_201_CREATED, detail="Please check your email to confirm registration")

        session = auth_response.session
        access_token = session.access_token
        
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=session.expires_in,
            samesite="lax",
            secure=False,
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except AuthApiError as e:
        print(f"Supabase Auth Error: {e.message} - {e}")
        raise HTTPException(status_code=400, detail=e.message)

@router.post("/logout")
async def logout(response: Response):
    # Ideally we sign out from Supabase too, but we need the token. 
    # For now, clearing the cookie is sufficient for the client.
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserData)
async def read_users_me(current_user: UserData = Depends(get_current_user)):
    return current_user
