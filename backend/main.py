from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import stocks, backtest, portfolio, paper_trading

app = FastAPI(
    title="QuantLab API",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router,       prefix="/api")
app.include_router(backtest.router,     prefix="/api")
app.include_router(portfolio.router,    prefix="/api")
app.include_router(paper_trading.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
