import asyncio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from network import send, event_generator

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stream")
async def stream_updates(request: Request):
    client_info = {
        "host": request.client.host,
        "port": request.client.port
    }
    send("connection", client_info)
    return EventSourceResponse(event_generator(request))

@app.get("/")
def read_root():
    send("http_request", {"message": "Root endpoint accessed"})
    return {"message": "Welcome to the FastAPI SSE server."}

if __name__ == '__main__':
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)