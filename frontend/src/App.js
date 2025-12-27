import React, { useState } from 'react';
import { useApi } from './Api/ApiContext';
import './App.css';

function App() {
  const { streamData, connectionStatus, sendGET } = useApi();
  const [httpResponse, setHttpResponse] = useState('No HTTP response yet');

  const handleFetchClick = async () => {
    setHttpResponse('Sending request...');
    
    const result = await sendGET('/');

    if (result.success) {
      setHttpResponse(`Success: ${JSON.stringify(result.response)}`);
    } else {
      setHttpResponse(`Error: ${result.status} - ${JSON.stringify(result.error)}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>SSE & HTTP Client (CRA)</h1>
      <p>Connection Status: <strong>{connectionStatus}</strong></p>

      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h2>Standard HTTP Fetch Request</h2>
        <button 
          onClick={handleFetchClick} 
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px' }}
        >
          GET from backend
        </button>
        <p><strong>Last Response:</strong> {httpResponse}</p>
      </div>
      
      <div style={{ border: '1px solid #00a0e0', padding: '15px', borderRadius: '5px', maxHeight: '400px', overflowY: 'scroll' }}>
        <h2>Live SSE Stream Data</h2>
        {streamData.length === 0 ? (
          <p>Awaiting events from the server...</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {streamData.slice(-100).map((item, index) => (
              <li key={index} style={{ marginBottom: '5px', padding: '5px', borderRadius: '3px' }}>
                <span style={{ marginLeft: '10px' }}>{item.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;