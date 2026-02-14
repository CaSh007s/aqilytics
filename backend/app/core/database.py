from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client
# Ensure keys are set in .env
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
