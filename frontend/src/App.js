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

function Dashboard({ token, onLogout }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [credit, setCredit] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loans, setLoans] = useState(null);
  const [insights, setInsights] = useState(null);
  const [goals, setGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [depositAmounts, setDepositAmounts] = useState({});
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [comparison, setComparison] = useState(null);
  const [cmpMonth1, setCmpMonth1] = useState("");
  const [cmpYear1, setCmpYear1] = useState("2026");
  const [cmpMonth2, setCmpMonth2] = useState("");
  const [cmpYear2, setCmpYear2] = useState("2026");
  const [showComparison, setShowComparison] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  const addTransaction = async () => {
    if (!desc || !amount) { alert("Please fill both fields"); return; }
    await axios.post(`${API}/transactions/`, {
      description: desc,
      amount: parseFloat(amount),
      date: txDate
    }, { headers });
    setDesc("");
    setAmount("");
    loadTransactions();
  };

  const loadTransactions = async (month, year) => {
    let url = `${API}/transactions/`;
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    const res = await axios.get(url, { headers });
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
  
  const loadGoals = async () => {
  const res = await axios.get(`${API}/goals/`, { headers });
  setGoals(res.data.goals);
  };

  const loadComparison = async () => {
    if (!cmpMonth1 || !cmpMonth2) {
      alert("Please select both months to compare");
      return;
    }
    try {
      const res = await axios.get(
        `${API}/comparison/monthly?month1=${cmpMonth1}&year1=${cmpYear1}&month2=${cmpMonth2}&year2=${cmpYear2}`,
        { headers }
      );
      setComparison(res.data);
      setShowComparison(true);
    } catch (e) {
      alert(e.response?.data?.error || "Error loading comparison");
    }
  };

  const editTransaction = async (id) => {
    await axios.put(`${API}/transactions/${id}`, {
      description: editDesc,
      amount: parseFloat(editAmount)
    }, { headers });
    setEditingId(null);
    loadTransactions(filterMonth, filterYear);
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await axios.delete(`${API}/transactions/${id}`, { headers });
    loadTransactions(filterMonth, filterYear);
  };

  const searchTransactions = async () => {
    let url = `${API}/transactions/?`;
    if (filterMonth && filterYear) url += `month=${filterMonth}&year=${filterYear}&`;
    if (searchQuery) url += `search=${searchQuery}&`;
    if (categoryFilter) url += `category=${categoryFilter}`;
    const res = await axios.get(url, { headers });
    setTransactions(res.data);
  };

  const createGoal = async () => {
    if (!goalName || !goalAmount || !goalDeadline) {
      alert("Please fill all fields");
      return;
    }
    await axios.post(`${API}/goals/`, {
      goal_name: goalName,
      target_amount: parseFloat(goalAmount),
      deadline: goalDeadline
    }, { headers });
    setGoalName(""); setGoalAmount(""); setGoalDeadline("");
    setShowGoalForm(false);
    loadGoals();
  };

  const addDeposit = async (goalId) => {
    const amount = depositAmounts[goalId];
    if (!amount) { alert("Enter deposit amount"); return; }
    await axios.post(`${API}/goals/${goalId}/deposit`,
      { amount: parseFloat(amount) },
      { headers }
    );
    setDepositAmounts({ ...depositAmounts, [goalId]: "" });
    loadGoals();
  };

  const deleteGoal = async (goalId) => {
    await axios.delete(`${API}/goals/${goalId}`, { headers });
    loadGoals();
  };

  return (
    <div style={styles.dashboard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h2 style={{ margin: 0 }}>💰 AI Finance Advisor</h2>
      <button onClick={onLogout} style={{
        background: 'none',
        border: '1px solid #dc2626',
        color: '#dc2626',
        padding: '6px 16px',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 13
      }}>
        Logout
      </button>
    </div>

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
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: '#555', marginBottom: 4, display: 'block' }}>
            Transaction Date
          </label>
          <input
            type="date"
            style={styles.input}
            value={txDate}
            onChange={e => setTxDate(e.target.value)}
          />
        </div>
        <button style={styles.btn} onClick={addTransaction}>
          Add and Auto-Categorize
        </button>
      </div>

      <div style={styles.card}>
        <h3>Filter by Month</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <select
            style={{ ...styles.input, marginBottom: 0, width: 'auto' }}
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
          <select
            style={{ ...styles.input, marginBottom: 0, width: 'auto' }}
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          <button style={styles.btn}
            onClick={() => loadTransactions(filterMonth, filterYear)}>
            Load Transactions
          </button>
          <button style={styles.btn} onClick={loadCredit}>Get Credit Score</button>
          <button style={styles.btn} onClick={loadBudget}>Get Budget Tips</button>
          <button style={styles.btn} onClick={loadLoans}>Get Loan Recommendations</button>
          <button style={styles.btn} onClick={loadInsights}>Spending Insights</button>
          <button style={styles.btn} onClick={() => { loadGoals(); setShowGoalForm(true); }}>Savings Goals</button>
          <button style={styles.btn} onClick={() => setShowComparison(!showComparison)}>Month Comparison</button>
        </div>
      </div>

      {transactions.length > 0 && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Transactions ({transactions.length})</h3>
          </div>

          {/* Search and filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input
              style={{ ...styles.input, marginBottom: 0, flex: 2 }}
              placeholder="Search by description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchTransactions()}
            />
            <select
              style={{ ...styles.input, marginBottom: 0, flex: 1 }}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {['Food','Transport','Entertainment','Utilities',
                'Healthcare','Shopping','Finance','Education','Income'
              ].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button style={styles.btn} onClick={searchTransactions}>Search</button>
          </div>

          {/* Transaction list */}
          {transactions.map(t => (
            <div key={t.id} style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8
            }}>
              {editingId === t.id ? (
                // Edit mode
                <div>
                  <input
                    style={{ ...styles.input, marginBottom: 6 }}
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    placeholder="Description"
                  />
                  <input
                    style={{ ...styles.input, marginBottom: 8 }}
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    placeholder="Amount"
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={styles.btn} onClick={() => editTransaction(t.id)}>
                      Save
                    </button>
                    <button style={{ ...styles.btn, background: '#6b7280' }}
                      onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{t.description}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{t.date}</div>
                    </div>
                    <span style={styles.badge}>{t.category}</span>
                    <span style={{ fontWeight: 500, marginLeft: 8 }}>₹{t.amount}</span>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                      <button onClick={() => {
                        setEditingId(t.id);
                        setEditDesc(t.description);
                        setEditAmount(t.amount);
                      }} style={{
                        background: '#e0e7ff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: '#3730a3'
                      }}>Edit</button>
                      <button onClick={() => deleteTransaction(t.id)} style={{
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: '#dc2626'
                      }}>Delete</button>
                    </div>
                  </div>
                </div>
              )}
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

  {(goals.length > 0 || showGoalForm || true) && (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>🎯 Savings Goals</h3>
        <button style={{ ...styles.btn, padding: '6px 14px', fontSize: 13 }}
          onClick={() => setShowGoalForm(!showGoalForm)}>
          {showGoalForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showGoalForm && (
        <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid #eee' }}>
          <h4 style={{ margin: '0 0 12px' }}>Create New Goal</h4>
          <input style={styles.input} placeholder="Goal name (e.g. New Laptop)"
            value={goalName} onChange={e => setGoalName(e.target.value)} />
          <input style={styles.input} placeholder="Target amount (₹)"
            value={goalAmount} onChange={e => setGoalAmount(e.target.value)} />
          <input style={styles.input} type="date"
            value={goalDeadline} onChange={e => setGoalDeadline(e.target.value)} />
          <button style={styles.btn} onClick={createGoal}>Create Goal</button>
        </div>
      )}

      {goals.map(goal => (
        <div key={goal.id} style={{
          border: `1px solid ${goal.is_completed ? '#86efac' : goal.on_track ? '#93c5fd' : '#fca5a5'}`,
          borderRadius: 8,
          padding: 16,
          marginBottom: 12,
          background: goal.is_completed ? '#f0fdf4' : '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 500, fontSize: 16 }}>
              {goal.is_completed ? '✅' : '🎯'} {goal.goal_name}
            </span>
            <button onClick={() => deleteGoal(goal.id)}
              style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18 }}>
              ×
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>₹{goal.current_amount.toLocaleString()} saved</span>
              <span>{goal.progress_pct}%</span>
              <span>₹{goal.target_amount.toLocaleString()} goal</span>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: 8, height: 12 }}>
              <div style={{
                width: `${goal.progress_pct}%`,
                background: goal.is_completed ? '#16a34a' : goal.on_track ? '#4f46e5' : '#ef4444',
                borderRadius: 8,
                height: 12,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Deadline', value: goal.deadline },
              { label: 'Months Left', value: goal.months_left },
              { label: 'Need/Month', value: `₹${goal.required_monthly.toLocaleString()}` }
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center', background: '#f9f9f9', borderRadius: 6, padding: 8 }}>
                <div style={{ fontSize: 11, color: '#888' }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* On track status */}
          <div style={{
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 20,
            display: 'inline-block',
            marginBottom: 12,
            background: goal.on_track ? '#dcfce7' : '#fee2e2',
            color: goal.on_track ? '#16a34a' : '#dc2626'
          }}>
            {goal.is_completed ? '🎉 Goal Completed!'
              : goal.on_track ? '✅ On Track — keep it up!'
              : `⚠️ Behind — save ₹${goal.required_monthly.toLocaleString()}/month to reach goal`}
          </div>

          {/* Deposit */}
          {!goal.is_completed && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                placeholder="Add deposit (₹)"
                value={depositAmounts[goal.id] || ""}
                onChange={e => setDepositAmounts({ ...depositAmounts, [goal.id]: e.target.value })}
              />
              <button style={{ ...styles.btn, marginBottom: 0 }}
                onClick={() => addDeposit(goal.id)}>
                Add
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )}

  {showComparison && (
    <div style={styles.card}>
      <h3>📅 Month vs Month Comparison</h3>

      {/* Month selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 13, color: '#555', marginBottom: 4, display: 'block' }}>
            Month 1
          </label>
          <select style={{ ...styles.input, marginBottom: 6 }}
            value={cmpMonth1} onChange={e => setCmpMonth1(e.target.value)}>
            <option value="">Select Month</option>
            {['January','February','March','April','May','June',
              'July','August','September','October','November','December'
            ].map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select style={{ ...styles.input, marginBottom: 0 }}
            value={cmpYear1} onChange={e => setCmpYear1(e.target.value)}>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, color: '#555', marginBottom: 4, display: 'block' }}>
            Month 2
          </label>
          <select style={{ ...styles.input, marginBottom: 6 }}
            value={cmpMonth2} onChange={e => setCmpMonth2(e.target.value)}>
            <option value="">Select Month</option>
            {['January','February','March','April','May','June',
              'July','August','September','October','November','December'
            ].map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select style={{ ...styles.input, marginBottom: 0 }}
            value={cmpYear2} onChange={e => setCmpYear2(e.target.value)}>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
      </div>

      <button style={{ ...styles.btn, width: '100%', marginBottom: 16 }}
        onClick={loadComparison}>
        Compare Months
      </button>

      {comparison && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              {
                label: 'Income',
                v1: comparison.month1.total_income,
                v2: comparison.month2.total_income,
                change: comparison.changes.income_change
              },
              {
                label: 'Expenses',
                v1: comparison.month1.total_expenses,
                v2: comparison.month2.total_expenses,
                change: comparison.changes.expense_change
              },
              {
                label: 'Savings',
                v1: comparison.month1.total_savings,
                v2: comparison.month2.total_savings,
                change: comparison.changes.savings_change
              }
            ].map(item => (
              <div key={item.label} style={{
                background: '#f9f9f9',
                borderRadius: 8,
                padding: 12,
                border: '1px solid #eee',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#555' }}>
                  {comparison.month1_name}: <strong>₹{item.v1.toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: 12, color: '#555' }}>
                  {comparison.month2_name}: <strong>₹{item.v2.toLocaleString()}</strong>
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 500,
                  marginTop: 4,
                  color: item.change > 0 ? '#16a34a' : item.change < 0 ? '#dc2626' : '#555'
                }}>
                  {item.change > 0 ? '▲' : item.change < 0 ? '▼' : '–'} {Math.abs(item.change)}%
                </div>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <h4>Category Changes</h4>
          {comparison.category_comparison.map(cat => (
            <div key={cat.category} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                <span style={{ fontWeight: 500 }}>{cat.category}</span>
                <span style={{ color: cat.trend === 'up' ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
                  {cat.trend === 'up' ? '▲' : '▼'} {Math.abs(cat.change_pct)}%
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#666', marginBottom: 4 }}>
                <span>{comparison.month1_name}: ₹{cat.month1_amount.toLocaleString()}</span>
                <span>→</span>
                <span>{comparison.month2_name}: ₹{cat.month2_amount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <div style={{
                  flex: cat.month1_amount,
                  background: '#4f46e5',
                  height: 6,
                  borderRadius: 3
                }} />
                <div style={{
                  flex: cat.month2_amount,
                  background: cat.trend === 'up' ? '#ef4444' : '#16a34a',
                  height: 6,
                  borderRadius: 3
                }} />
              </div>
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
  const handleLogout = () => setToken(null);
  return token
    ? <Dashboard token={token} onLogout={handleLogout} />
    : <Login onLogin={setToken} />;
}