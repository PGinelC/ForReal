from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Optional, Union
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        # store connections in a dict keyed by incremental integer IDs
        self.active_connections: Dict[int, WebSocket] = {}
        self._next_id: int = 1
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> int:
        await websocket.accept()
        async with self._lock:
            connection_id = self._next_id
            self._next_id += 1
            self.active_connections[connection_id] = websocket
        print(f"New client connected (id={connection_id}). Total clients: {len(self.active_connections)}")
        return connection_id

    def disconnect(self, id: int):
        if id in self.active_connections:
            del self.active_connections[id]
            print(f"Client disconnected (id={id}). Total clients: {len(self.active_connections)}")

    async def listen(self, id: int):
        connection = self.active_connections.get(id)
        data = await connection.receive_text()
        print(f"Data received from {id}")
        return data


    async def broadcast(self, action: str, data: dict):
        message = json.dumps({"action": action, "data": data})
        for connection in list(self.active_connections.values()):
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                self.disconnect(connection)
            except Exception as e:
                print(f"Error sending to client: {e}")
                self.disconnect(connection)

    async def send_message(self, action: str, data: dict, id: Optional[int] = None):
        message = json.dumps({"action": action, "data": data})
        if id is None:
            await self.broadcast(action, data)
            return

        connection = self.active_connections.get(id)
        if connection is None:
            return

        try:
            await connection.send_text(message)
        except WebSocketDisconnect:
            try:
                self.disconnect(id)
            except Exception:
                pass
        except Exception as e:
            print(f"Error sending to client: {e}")
            try:
                self.disconnect(connection_id)
            except Exception:
                pass

manager = ConnectionManager()