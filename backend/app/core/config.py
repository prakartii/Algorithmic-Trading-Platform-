from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "QuantLab"
    debug: bool = False

    supabase_url: str
    supabase_key: str
    supabase_service_key: str

    alpaca_api_key: str
    alpaca_secret_key: str
    alpaca_base_url: str = "https://paper-api.alpaca.markets"

    class Config:
        env_file = ".env"


settings = Settings()
