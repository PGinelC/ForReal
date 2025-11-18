import {} from "./api/useApi";
import "./App.css";

function App() {

  const { loading, error, sendData } = useApi();
  const [data, setData] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await sendData('data', { data });

    if (result) {
      setData('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Send data</h3>
      <input
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
        placeholder="Sample data"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </form>
    );
}

export default App;
