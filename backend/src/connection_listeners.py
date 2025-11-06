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


@app.post("/push-test")
async def push_test_message():

    await manager.send_message(
        action="server_push",
        data={"message": "This is a test push from the server!"}
    )
    return {"status": "success", "message": "Push notification sent to all clients."}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                payload = json.loads(data)
                action = payload.get("action")
                data = payload.get("data")
                
                # (NEW) Route incoming messages based on their action
                if action == "echo":
                    # Send an acknowledgement back to the *same* client
                    response = {
                        "action": "acknowledgement",
                        "data": f"Python acknowledges your message: {data}"
                    }
                    await websocket.send_text(json.dumps(response))
                
                elif action == "broadcast_all":
                    # Broadcast this message to *all* clients
                    await manager.send_message(
                        action="broadcast_message",
                        data=f"A user says: {data}"
                    )
                
                else:
                    response = {"action": "error", "data": "Unknown action"}
                    await websocket.send_text(json.dumps(response))
                    
            except json.JSONDecodeError:
                response = {"action": "error", "data": "Invalid JSON"}
                await websocket.send_text(json.dumps(response))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"An error occurred: {e}")
        manager.disconnect(websocket)