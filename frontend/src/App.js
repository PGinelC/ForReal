import Dispatcher from "./api/Dispatcher";
import "./App.css";

function App() {

  return (
    <div className="App">
      <Dispatcher />
      <header className="App-header">
        <h2>React-Python Event Tester</h2>
        <div
          style={{
            border: "1px solid white",
            padding: "10px",
            margin: "20px",
            width: "80%",
            height: "300px",
            overflowY: "scroll",
            textAlign: "left",
            background: "#282c34",
          }}
        >
          {responses.map((msg, index) => (
            <p key={index} style={{ margin: "5px" }}>
              {msg}
            </p>
          ))}
        </div>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ padding: "10px", fontSize: "16px" }}
          />
        </div>
        <div>
          <button
            onClick={() => sendMessage("echo")}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              fontSize: "16px",
            }}
          >
            Send (Echo)
          </button>
          <button
            onClick={() => sendMessage("broadcast_all")}
            style={{ padding: "10px 20px", fontSize: "16px" }}
          >
            Send (Broadcast)
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
