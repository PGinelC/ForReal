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
- use ApiContext
- getData and postData to make requests
- in connection_listeners define a function with that route and what it will trigger in the backend

# Backend -> Frontend
- from connection_manager import manager
- manager.send_message(str: action, dict: data, int: connection index) or manager.broadcast(str: action, dict: data) (all connected react apps)
- in react, use ApiContext and addCallbackFunction with the action and function(data) to be called when that action is received

# TO DO
- probably need to de-register the callback function when a component unmounts if one was added to the ApiContext, done with a useEffect
