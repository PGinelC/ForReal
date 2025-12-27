import asyncio
import json
from fastapi import Request

event_queue: asyncio.Queue = asyncio.Queue()

def send(event_name: str, data: dict):
    event_data = {
        "event": event_name,
        "data": json.dumps(data)
    }
    event_queue.put_nowait(event_data)
    print(f"Event queued: {event_name}")


async def event_generator(request: Request):
    yield {
        "event": "connection_status",
        "data": json.dumps({"status": "Connected to event stream."})
    }
    while True:
        try:
            event_to_send = await event_queue.get()
            if await request.is_disconnected():
                print("Client disconnected, stopping stream.")
                break
            yield event_to_send
            event_queue.task_done()

        except asyncio.CancelledError:
            print("Event generator task cancelled.")
            break
        except Exception as e:
            print(f"An error occurred: {e}")
            await asyncio.sleep(1)