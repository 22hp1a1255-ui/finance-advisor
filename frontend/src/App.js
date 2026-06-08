import { useState } from "react";
import axios from "axios";

const API = "https://finance-advisor-backend-okeg.onrender.com/api/v1";

function Login({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, { phone_number: phone });
      onLogin(res.data.token);
    } catch {
      alert("User not found. Please signup first.");
    }
  };

  const handleSignup = async () => {
    try {
      const res = await axios.post(`${API}/auth/signup`, {
        phone_number: phone,
        name: name
      });
      onLogin(res.data.token);
    } catch {
      alert("Signup failed. Try a different phone number.");
    }
  };

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2>💰 Finance Advisor</h2>
        {isSignup && (
          <input
            style={styles.input}
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        )}
        <input
          style={styles.input}
          placeholder="Phone number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        {isSignup
          ? <button style={styles.btn} onClick={handleSignup}>Sign Up</button>
          : <button style={styles.btn} onClick={handleLogin}>Login</button>
        }
        <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#666" }}>
          {isSignup ? "Already have an account? " : "New user? "}
          <span
            style={{ color: "#4f46e5", cursor: "pointer" }}
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
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
  const [loans, setLoans] = useState(null);
  const [insights, setInsights] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const addTransaction = async () => {
    if (!desc || !amount) { alert("Please fill both fields"); return; }
    await axios.post(`${API}/transactions/`, {
      description: desc,
      amount: parseFloat(amount)
    }, { headers });
    setDesc("");
    setAmount("");
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
      alert(e.response?.data?.error || "Add at least 3 transactions first");
    }
  };

  const loadBudget = async () => {
    const res = await axios.get(`${API}/budget/recommendations`, { headers });
    setBudget(res.data);
  };

  const loadLoans = async () => {
  try {
    const res = await axios.get(`${API}/loans/recommendations`, { headers });
    setLoans(res.data);
  } catch (e) {
    alert(e.response?.data?.error || "Error fetching loan recommendations");
  }
  };

  const loadInsights = async () => {
  try {
    const res = await axios.get(`${API}/insights/summary`, { headers });
    setInsights(res.data);
  } catch (e) {
    alert(e.response?.data?.error || "Error fetching insights");
  }
  };

  return (
    <div style={styles.dashboard}>
      <h2>💰 AI Finance Advisor</h2>

      <div style={styles.card}>
        <h3>Add Transaction</h3>
        <input
          style={styles.input}
          placeholder="Description (e.g. Swiggy order)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Amount (₹)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <button style={styles.btn} onClick={addTransaction}>
          Add and Auto-Categorize
        </button>
      </div>

      <div style={styles.row}>
        <button style={styles.btn} onClick={loadTransactions}>Load Transactions</button>
        <button style={styles.btn} onClick={loadCredit}>Get Credit Score</button>
        <button style={styles.btn} onClick={loadBudget}>Get Budget Tips</button>
        <button style={styles.btn} onClick={loadLoans}>Get Loan Recommendations</button>
        <button style={styles.btn} onClick={loadInsights}>Spending Insights</button>
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
          <div style={styles.score}>{credit.credit_score}<span style={{fontSize:24}}>/100</span></div>
          <p>{credit.explanation}</p>
          <h4>Top Drivers:</h4>
          {Object.entries(credit.top_drivers).map(([k, v]) => (
            <div key={k} style={styles.row}>
              <span>{k.replace(/_/g, " ")}</span>
              <span style={{ color: v > 0 ? "green" : "red" }}>
                {v > 0 ? "+" : ""}{v}
              </span>
            </div>
          ))}
        </div>
      )}

      {budget && (
        <div style={styles.card}>
          <h3>Budget Recommendations</h3>
          {budget.recommendations.map(r => (
            <div key={r.category} style={{
              borderLeft: `4px solid ${r.status === "good" ? "green" : "red"}`,
              paddingLeft: 8,
              marginBottom: 8,
              display: "flex",
              gap: 12,
              alignItems: "center"
            }}>
              <span style={{minWidth:100}}>{r.category}</span>
              <span>Limit: ₹{r.recommended_limit}</span>
              <span>Spent: ₹{r.actual_spend}</span>
              <span style={{ color: r.status === "good" ? "green" : "red" }}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {loans && (
    <div style={styles.card}>
      <h3>💰 Loan Recommendations</h3>
      <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <strong>Your Financial Summary</strong>
        <div style={styles.row}>
          <span>Monthly Income:</span>
          <span>₹{loans.financial_summary.monthly_income}</span>
        </div>
        <div style={styles.row}>
          <span>Monthly Expenses:</span>
          <span>₹{loans.financial_summary.monthly_expenses}</span>
        </div>
        <div style={styles.row}>
          <span>Savings Rate:</span>
          <span>{loans.financial_summary.savings_rate}</span>
        </div>
        <div style={styles.row}>
          <span>Debt-to-Income:</span>
          <span>{loans.financial_summary.debt_to_income_ratio}</span>
        </div>
      </div>

      <h4 style={{ color: 'green' }}>✅ Eligible Loans</h4>
      {loans.recommended_loans.map(loan => (
        <div key={loan.type} style={{
          border: '1px solid #86efac',
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
          background: '#f0fdf4'
        }}>
          <div style={{ fontSize: 18, fontWeight: 500 }}>{loan.icon} {loan.type}</div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>{loan.description}</div>
          <div style={styles.row}>
            <span>Interest Rate:</span><span>{loan.interest_rate}</span>
          </div>
          <div style={styles.row}>
            <span>Eligible Amount:</span>
            <span style={{ fontWeight: 500, color: '#16a34a' }}>₹{loan.eligibility_amount.toLocaleString()}</span>
          </div>
          <div style={styles.row}>
            <span>Sample EMI:</span><span>₹{loan.sample_emi.toLocaleString()}/month</span>
          </div>
        </div>
      ))}

      {loans.not_eligible.length > 0 && (
        <>
          <h4 style={{ color: '#dc2626' }}>❌ Not Eligible</h4>
          {loans.not_eligible.map(loan => (
            <div key={loan.type} style={{
              border: '1px solid #fca5a5',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              background: '#fef2f2'
            }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{loan.icon} {loan.type}</div>
              <div style={{ fontSize: 12, color: '#dc2626' }}>Reason: {loan.reason}</div>
            </div>
          ))}
        </>
      )}
    </div>
    )}
    {insights && (
    <div style={styles.card}>
      <h3>📊 Spending Insights</h3>

      {/* Health Score */}
      <div style={{
        textAlign: 'center',
        padding: 16,
        background: '#f0fdf4',
        borderRadius: 8,
        marginBottom: 16
      }}>
        <div style={{ fontSize: 13, color: '#555' }}>Financial Health</div>
        <div style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: insights.financial_health_color
        }}>
          {insights.financial_health}
        </div>
        <div style={{ fontSize: 13, color: '#555' }}>
          Savings Rate: {insights.savings_rate}%
        </div>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Total Income', value: `₹${insights.total_income.toLocaleString()}`, color: '#16a34a' },
          { label: 'Total Expenses', value: `₹${insights.total_expenses.toLocaleString()}`, color: '#dc2626' },
          { label: 'Total Savings', value: `₹${insights.total_savings.toLocaleString()}`, color: '#2563eb' }
        ].map(item => (
          <div key={item.label} style={{
            background: '#f9f9f9',
            borderRadius: 8,
            padding: 12,
            textAlign: 'center',
            border: '1px solid #eee'
          }}>
            <div style={{ fontSize: 11, color: '#888' }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {insights.alerts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4>⚠️ Alerts</h4>
          {insights.alerts.map((alert, i) => (
            <div key={i} style={{
              padding: '8px 12px',
              borderRadius: 8,
              marginBottom: 6,
              background: alert.type === 'warning' ? '#fef9c3' : '#f0fdf4',
              borderLeft: `4px solid ${alert.type === 'warning' ? '#ca8a04' : '#16a34a'}`,
              fontSize: 13
            }}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Top Categories */}
      <h4>Top Spending Categories</h4>
      {insights.top_categories.map(item => {
        const max = insights.top_categories[0].amount;
        const pct = Math.round((item.amount / max) * 100);
        return (
          <div key={item.category} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
              <span>{item.category}</span>
              <span>₹{item.amount.toLocaleString()}</span>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: 4, height: 8 }}>
              <div style={{
                width: `${pct}%`,
                background: '#4f46e5',
                borderRadius: 4,
                height: 8
              }} />
            </div>
          </div>
        );
      })}

      {/* Monthly Trend */}
      {insights.monthly_trend.length > 0 && (
        <>
          <h4>Monthly Spending Trend</h4>
          {insights.monthly_trend.map(item => (
            <div key={item.month} style={styles.row}>
              <span style={{ minWidth: 80, fontSize: 13 }}>{item.month}</span>
              <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 4, height: 8 }}>
                <div style={{
                  width: `${Math.round((item.amount / Math.max(...insights.monthly_trend.map(m => m.amount))) * 100)}%`,
                  background: '#f59e0b',
                  borderRadius: 4,
                  height: 8
                }} />
              </div>
              <span style={{ fontSize: 13, minWidth: 80, textAlign: 'right' }}>
                ₹{item.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  )}
    </div>
  );

}

const styles = {
  center: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  dashboard: { maxWidth: 700, margin: "0 auto", padding: 20 },
  card: { background: "#f9f9f9", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #eee" },
  input: { display: "block", width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" },
  btn: { background: "#4f46e5", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", marginRight: 8, marginBottom: 8 },
  row: { display: "flex", gap: 12, alignItems: "center", marginBottom: 4 },
  badge: { background: "#e0e7ff", color: "#3730a3", padding: "2px 10px", borderRadius: 20, fontSize: 12 },
  score: { fontSize: 64, fontWeight: "bold", color: "#4f46e5", textAlign: "center" }
};

export default function App() {
  const [token, setToken] = useState(null);
  return token ? <Dashboard token={token} /> : <Login onLogin={setToken} />;
}