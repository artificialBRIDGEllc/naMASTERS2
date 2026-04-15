import asyncio
import json
import os
from pathlib import Path
import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from dotenv import load_dotenv
from server.personas.dorothy import (
    DOROTHY_SESSION_CONFIG,
    DOROTHY_ANCHOR_CONFIG,
    ANCHOR_WHISPER,
    OPENING_PROMPT
)

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI()

@app.get("/")
async def root():
    index_file = Path(__file__).resolve().parent.parent / "client" / "index.html"
    with open(index_file) as f:
        return HTMLResponse(f.read())


@app.websocket("/ws/call")
async def call_handler(agent_ws: WebSocket):
    await agent_ws.accept()

    turn_count = 0
    last_agent_spoke = asyncio.get_event_loop().time()

    OPENAI_WS_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview"
    HEADERS = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "OpenAI-Beta": "realtime=v1"
    }

    try:
        async with websockets.connect(OPENAI_WS_URL, additional_headers=HEADERS) as openai_ws:

            # ── SETUP SESSION ──────────────────────────────────────────
            await openai_ws.send(json.dumps({
                "type": "session.update",
                "session": DOROTHY_SESSION_CONFIG
            }))

            # ── TRIGGER DOROTHY'S OPENING LINE ─────────────────────────
            await openai_ws.send(json.dumps({
                "type": "conversation.item.create",
                "item": {
                    "type": "message",
                    "role": "user",
                    "content": [{
                        "type": "input_text",
                        "text": OPENING_PROMPT
                    }]
                }
            }))
            await openai_ws.send(json.dumps({"type": "response.create"}))

            # ── TASK 1: OpenAI → Agent browser ─────────────────────────
            async def receive_from_openai():
                nonlocal turn_count
                async for raw in openai_ws:
                    msg = json.loads(raw)
                    msg_type = msg.get("type", "")

                    if msg_type == "response.audio.delta":
                        audio_b64 = msg.get("delta", "")
                        if audio_b64:
                            await agent_ws.send_bytes(
                                __import
