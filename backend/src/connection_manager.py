from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"New client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"Client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, action: str, data: dict):
        message = json.dumps({"action": action, "data": data})
        for connection in self.active_connections[:]:
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                self.disconnect(connection)
            except Exception as e:
                print(f"Error sending to client: {e}")
                self.disconnect(connection)

    async def send_message(self, action: str, data: dict, connection: int):
        message = json.dumps({"action": action, "data": data})
        try:
            await connection.send_text(message)
        except WebSocketDisconnect:
            self.disconnect(self.active_connections[connection])
        except Exception as e:
            print(f"Error sending to client: {e}")
            self.disconnect(self.active_connections[connection])

manager = ConnectionManager()