import { useState } from "react";
import axios from "axios";

const API = "https://finance-advisor-backend.onrender.com/api/v1";

function Login({ onLogin }) {
  const [phone, setPhone] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, { phone_number: phone });
      onLogin(res.data.token);
    } catch {
      alert("User not found. Please signup first.");
    }
  };

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2>💰 Finance Advisor</h2>
        <input style={styles.input} placeholder="Phone number"
          value={phone} onChange={e => setPhone(e.target.value)} />
        <button style={styles.btn} onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

function Dashboard({ token }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [credit, setCredit] = useState(null);
  const [budget, setBudget] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const addTransaction = async () => {
    await axios.post(`${API}/transactions/`, { description: desc, amount: parseFloat(amount) }, { headers });
    setDesc(""); setAmount("");
    loadTransactions();
  };

  const loadTransactions = async () => {
    const res = await axios.get(`${API}/transactions/`, { headers });
    setTransactions(res.data);
  };

  const loadCredit = async () => {
    try {
      const res = await axios.get(`${API}/credit/score`, { headers });
      setCredit(res.data);
    } catch (e) {
      alert(e.response?.data?.error || "Error fetching credit score");
    }
  };

  const loadBudget = async () => {
    const res = await axios.get(`${API}/budget/recommendations`, { headers });
    setBudget(res.data);
  };

  return (
    <div style={styles.dashboard}>
      <h2>💰 AI Finance Advisor</h2>

      <div style={styles.card}>
        <h3>Add Transaction</h3>
        <input style={styles.input} placeholder="Description (e.g. Swiggy order)"
          value={desc} onChange={e => setDesc(e.target.value)} />
        <input style={styles.input} placeholder="Amount (₹)"
          value={amount} onChange={e => setAmount(e.target.value)} />
        <button style={styles.btn} onClick={addTransaction}>Add & Auto-Categorize</button>
      </div>

      <div style={styles.row}>
        <button style={styles.btn} onClick={loadTransactions}>Load Transactions</button>
        <button style={styles.btn} onClick={loadCredit}>Get Credit Score</button>
        <button style={styles.btn} onClick={loadBudget}>Get Budget Tips</button>
      </div>

      {transactions.length > 0 && (
        <div style={styles.card}>
          <h3>Transactions</h3>
          {transactions.map(t => (
            <div key={t.id} style={styles.row}>
              <span>{t.description}</span>
              <span style={styles.badge}>{t.category}</span>
              <span>₹{t.amount}</span>
            </div>
          ))}
        </div>
      )}

      {credit && (
        <div style={styles.card}>
          <h3>Credit Score</h3>
          <div style={styles.score}>{credit.credit_score}<span>/100</span></div>
          <p>{credit.explanation}</p>
          <h4>Top Drivers:</h4>
          {Object.entries(credit.top_drivers).map(([k, v]) => (
            <div key={k} style={styles.row}>
              <span>{k.replace(/_/g, ' ')}</span>
              <span style={{ color: v > 0 ? 'green' : 'red' }}>{v > 0 ? '+' : ''}{v}</span>
            </div>
          ))}
        </div>
      )}

      {budget && (
        <div style={styles.card}>
          <h3>Budget Recommendations</h3>
          {budget.recommendations.map(r => (
            <div key={r.category} style={{ ...styles.row, borderLeft: `4px solid ${r.status === 'good' ? 'green' : 'red'}`, paddingLeft: 8, marginBottom: 8 }}>
              <span>{r.category}</span>
              <span>Recommended: ₹{r.recommended_limit}</span>
              <span>Actual: ₹{r.actual_spend}</span>
              <span style={{ color: r.status === 'good' ? 'green' : 'red' }}>{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  dashboard: { maxWidth: 700, margin: '0 auto', padding: 20 },
  card: { background: '#f9f9f9', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid #eee' },
  input: { display: 'block', width: '100%', padding: 10, marginBottom: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  btn: { background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', marginRight: 8, marginBottom: 8 },
  row: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 },
  badge: { background: '#e0e7ff', color: '#3730a3', padding: '2px 10px', borderRadius: 20, fontSize: 12 },
  score: { fontSize: 64, fontWeight: 'bold', color: '#4f46e5', textAlign: 'center' }
};

export default function App() {
  const [token, setToken] = useState(null);
  return token ? <Dashboard token={token} /> : <Login onLogin={setToken} />;
}