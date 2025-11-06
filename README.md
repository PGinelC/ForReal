# How to run

## Front end
In ./frontend:
- npm install
- npm start

## Back end
In ./backend/src
- python3 -m venv venv
- ../venv/Scripts/activate
- pip install requirements.txt

In ./backend/src:
- uvicorn main:app --reload


# Communication

# Frontend -> Backend
- import Requests.js
- Requests.get("endpoint/name") or Requests.post("endpoint/name", payload)
- in connection_listeners define a function with that route and what it will trigger in the backend

# Backend -> Frontend
- from connection_manager import manager
- manager.send_message(str: action, dict: data, int: connection index) or manager.broadcast(str: action, dict: data) (all connected react apps)
- in react the dispatcher, add the state changes or function calls that you need
