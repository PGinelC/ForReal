from connection_manager import manager
import json
from fastapi import WebSocket, WebSocketDisconnect, FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "From FastAPI"}


# Expects the JSON to have an action and a data fields
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    id = await manager.connect(websocket)
    try:
        while True:
            data = await manager.listen()
            
            try:
                payload = json.loads(data)
                action = payload.get("action")
                data = payload.get("data")
                
                if action == "echo":
                    await manager.send_message(
                        action="acknowledgement",
                        data=f"Python acknowledges your message: {data}",
                        websocket=None)
                
                elif action == "broadcast_all":
                    # Broadcast this message to *all* clients
                    await manager.send_message(
                        action="broadcast_message",
                        data=f"A user says: {data}"
                    )
                
                else:
                    await manager.send_message(
                        action="error",
                        data=f"Unknown action",
                        websocket=None
                    )
                    
            except json.JSONDecodeError:
                await manager.send_message(
                        action="error",
                        data=f"Invalid JSON",
                        websocket=None
                    )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"An error occurred: {e}")
        manager.disconnect(websocket)