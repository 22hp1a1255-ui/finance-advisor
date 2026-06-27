import { useState } from "react";
import axios from "axios";
import {
  SignedIn,
  SignedOut,
  SignIn,
  useUser,
  useAuth
} from "@clerk/clerk-react";

const API = "https://finance-advisor-backend-okeg.onrender.com/api/v1";

const COLORS = {
  bg: "#F2F2EB",
  sidebar: "#202E44",
  card: "#ffffff",
  accent: "#8B734C",
  light: "#202E44",
  text: "#202E44",
  muted: "#A9BBC8",
  danger: "#ef4444",
  success: "#2d7a4f",
  warning: "#8B734C"
};

const S = {
  app: {
    display: "flex",
    minHeight: "100vh",
    background: "#F2F2EB",
    fontFamily: "'Inter', sans-serif",
    color: COLORS.text
  },
  sidebar: {
    width: 240,
    background: "#202E44",
    borderRight: `1px solid #A9BBC844`,
    display: "flex",
    flexDirection: "column",
    padding: "24px 0",
    position: "fixed",
    height: "100vh",
    overflowY: "auto"
  },
  profile: {
    padding: "0 20px 24px",
    borderBottom: `1px solid #A9BBC833`,
    marginBottom: 8
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: `linear-gradient(135deg, #8B734C, #202E44)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 10,
    color: "#F2F2EB"
  },
  profileName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#F2F2EB",
    marginBottom: 2
  },
  profileSub: {
    fontSize: 11,
    color: "#A9BBC8"
  },
  navItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 20px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    color: active ? "#F2F2EB" : "#A9BBC8",
    background: active ? "#8B734C33" : "none",
    borderLeft: active ? `3px solid #8B734C` : "3px solid transparent",
    transition: "all 0.2s"
  }),
  navIcon: { fontSize: 16, minWidth: 20 },
  main: {
    marginLeft: 240,
    flex: 1,
    padding: 32,
    minHeight: "100vh"
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#202E44",
    marginBottom: 4
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#A9BBC8",
    marginBottom: 28
  },
  card: {
    background: "#ffffff",
    border: `1px solid #C7BCAB55`,
    borderRadius: 14,
    padding: "20px 24px",
    marginBottom: 16,
    boxShadow: "0 2px 12px #202E4411"
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#202E44",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  input: {
    display: "block",
    width: "100%",
    padding: "10px 14px",
    marginBottom: 10,
    borderRadius: 8,
    border: `1px solid #C7BCAB`,
    background: "#F2F2EB",
    color: "#202E44",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box"
  },
  btn: {
    background: `linear-gradient(135deg, #8B734C, #202E44)`,
    color: "#F2F2EB",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    marginRight: 8,
    marginBottom: 8,
    transition: "opacity 0.2s"
  },
  btnDanger: {
    background: "#ef444422",
    color: "#ef4444",
    border: `1px solid #ef444444`,
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12
  },
  btnEdit: {
    background: "#8B734C22",
    color: "#8B734C",
    border: `1px solid #8B734C44`,
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12
  },
  badge: {
    background: "#A9BBC833",
    color: "#202E44",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 500
  },
  statCard: {
    background: "#F2F2EB",
    border: `1px solid #C7BCAB55`,
    borderRadius: 10,
    padding: "14px 16px",
    textAlign: "center"
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#202E44",
    marginBottom: 2
  },
  statLabel: {
    fontSize: 11,
    color: "#A9BBC8"
  },
  row: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap"
  },
  logoutBtn: {
    margin: "auto 20px 20px",
    background: "#ef444422",
    color: "#ef4444",
    border: `1px solid #ef444433`,
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    width: "calc(100% - 40px)"
  }
};

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const CATEGORIES = ['Food','Transport','Entertainment','Utilities',
  'Healthcare','Shopping','Finance','Education','Income'];


// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ token, userName, onLogout }) {
  const [activePage, setActivePage] = useState("transactions");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
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
  const [comparison, setComparison] = useState(null);
  const [cmpMonth1, setCmpMonth1] = useState("");
  const [cmpYear1, setCmpYear1] = useState("2026");
  const [cmpMonth2, setCmpMonth2] = useState("");
  const [cmpYear2, setCmpYear2] = useState("2026");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const addTransaction = async () => {
    if (!desc || !amount) { alert("Please fill both fields"); return; }
    await axios.post(`${API}/transactions/`, { description: desc, amount: parseFloat(amount), date: txDate }, { headers });
    setDesc(""); setAmount(""); setOcrResult(null);
    loadTransactions();
  };

  const loadTransactions = async (month, year) => {
    let url = `${API}/transactions/?`;
    if (month && year) url += `month=${month}&year=${year}&`;
    if (searchQuery) url += `search=${searchQuery}&`;
    if (categoryFilter) url += `category=${categoryFilter}`;
    const res = await axios.get(url, { headers });
    setTransactions(res.data);
  };

  const searchTransactions = async () => {
    let url = `${API}/transactions/?`;
    if (filterMonth && filterYear) url += `month=${filterMonth}&year=${filterYear}&`;
    if (searchQuery) url += `search=${searchQuery}&`;
    if (categoryFilter) url += `category=${categoryFilter}`;
    const res = await axios.get(url, { headers });
    setTransactions(res.data);
  };

  const editTransaction = async (id) => {
    await axios.put(`${API}/transactions/${id}`, { description: editDesc, amount: parseFloat(editAmount) }, { headers });
    setEditingId(null);
    loadTransactions(filterMonth, filterYear);
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await axios.delete(`${API}/transactions/${id}`, { headers });
    loadTransactions(filterMonth, filterYear);
  };

  const loadCredit = async () => {
    try {
      const res = await axios.get(`${API}/credit/score`, { headers });
      setCredit(res.data);
    } catch (e) { alert(e.response?.data?.error || "Add at least 3 transactions first"); }
  };

  const loadBudget = async () => {
    const res = await axios.get(`${API}/budget/recommendations`, { headers });
    setBudget(res.data);
  };

  const loadLoans = async () => {
    try {
      const res = await axios.get(`${API}/loans/recommendations`, { headers });
      setLoans(res.data);
    } catch (e) { alert(e.response?.data?.error || "Error fetching loans"); }
  };

  const loadInsights = async () => {
    try {
      const res = await axios.get(`${API}/insights/summary`, { headers });
      setInsights(res.data);
    } catch (e) { alert(e.response?.data?.error || "Error fetching insights"); }
  };

  const loadGoals = async () => {
    const res = await axios.get(`${API}/goals/`, { headers });
    setGoals(res.data.goals);
  };

  const createGoal = async () => {
    if (!goalName || !goalAmount || !goalDeadline) { alert("Please fill all fields"); return; }
    await axios.post(`${API}/goals/`, { goal_name: goalName, target_amount: parseFloat(goalAmount), deadline: goalDeadline }, { headers });
    setGoalName(""); setGoalAmount(""); setGoalDeadline("");
    setShowGoalForm(false);
    loadGoals();
  };

  const addDeposit = async (goalId) => {
    const amt = depositAmounts[goalId];
    if (!amt) { alert("Enter deposit amount"); return; }
    await axios.post(`${API}/goals/${goalId}/deposit`, { amount: parseFloat(amt) }, { headers });
    setDepositAmounts({ ...depositAmounts, [goalId]: "" });
    loadGoals();
  };

  const deleteGoal = async (goalId) => {
    await axios.delete(`${API}/goals/${goalId}`, { headers });
    loadGoals();
  };

  const loadComparison = async () => {
    if (!cmpMonth1 || !cmpMonth2) { alert("Select both months"); return; }
    try {
      const res = await axios.get(
        `${API}/comparison/monthly?month1=${cmpMonth1}&year1=${cmpYear1}&month2=${cmpMonth2}&year2=${cmpYear2}`,
        { headers }
      );
      setComparison(res.data);
    } catch (e) { alert("Error loading comparison"); }
  };

  const handleImageOCR = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOcrLoading(true); setOcrResult(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result.split(',')[1];
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 200,
            messages: [{
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: file.type, data: base64 } },
                { type: "text", text: `Extract from this bill: merchant name (max 5 words) and total amount. Respond ONLY in JSON: {"description": "name", "amount": 123.45}` }
              ]
            }]
          })
        });
        const data = await response.json();
        const parsed = JSON.parse(data.content[0].text.replace(/```json|```/g, '').trim());
        setOcrResult(parsed);
        if (parsed.description !== 'unknown') { setDesc(parsed.description); setAmount(parsed.amount.toString()); }
      } catch { alert("Could not read image. Please enter manually."); }
      finally { setOcrLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const navItems = [
    { id: "transactions", icon: "💳", label: "Transactions" },
    { id: "credit", icon: "📊", label: "Credit Score" },
    { id: "budget", icon: "📋", label: "Budget" },
    { id: "loans", icon: "🏦", label: "Loan Advisor" },
    { id: "insights", icon: "💡", label: "Insights" },
    { id: "goals", icon: "🎯", label: "Savings Goals" },
    { id: "comparison", icon: "📅", label: "Month Compare" },
  ];

  return (
    <div style={S.app}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.profile}>
          <div style={S.avatar}>{(userName || "U")[0].toUpperCase()}</div>
          <div style={S.profileName}>{userName || "User"}</div>
          <div style={S.profileSub}>Personal Finance</div>
        </div>

        {navItems.map(item => (
          <div key={item.id} style={S.navItem(activePage === item.id)}
            onClick={() => {
              setActivePage(item.id);
              if (item.id === 'transactions') loadTransactions();
              if (item.id === 'credit') loadCredit();
              if (item.id === 'budget') loadBudget();
              if (item.id === 'loans') loadLoans();
              if (item.id === 'insights') loadInsights();
              if (item.id === 'goals') { loadGoals(); setShowGoalForm(false); }
            }}>
            <span style={S.navIcon}>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div style={{ marginTop: "auto", padding: "0 20px 20px" }}>
          <button style={S.logoutBtn} onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      {/* Main content */}
      <div style={S.main}>

        {/* ── TRANSACTIONS ── */}
        {activePage === "transactions" && (
          <div>
            <div style={S.pageTitle}>💳 Transactions</div>
            <div style={S.pageSubtitle}>Add and manage your income and expenses</div>

            <div style={S.card}>
              <div style={S.cardTitle}>➕ Add Transaction</div>
              <input style={S.input} placeholder="Description (e.g. Swiggy order)"
                value={desc} onChange={e => setDesc(e.target.value)} />
              <input style={S.input} placeholder="Amount (₹)"
                value={amount} onChange={e => setAmount(e.target.value)} />
              <input type="date" style={S.input}
                value={txDate} onChange={e => setTxDate(e.target.value)} />

              <div style={{ border: `2px dashed #C7BCAB`, borderRadius: 8, padding: 12, marginBottom: 10, textAlign: "center", background: "#F2F2EB" }}>
                <div style={{ fontSize: 12, color: "#A9BBC8", marginBottom: 6 }}>📷 Scan bill/receipt image</div>
                <input type="file" accept="image/*" onChange={handleImageOCR} style={{ fontSize: 12, color: "#A9BBC8" }} />
                {ocrLoading && <div style={{ marginTop: 6, color: "#8B734C", fontSize: 12 }}>🔍 Reading your bill...</div>}
                {ocrResult && <div style={{ marginTop: 6, color: COLORS.success, fontSize: 12 }}>✅ Found: {ocrResult.description} — ₹{ocrResult.amount}</div>}
              </div>

              <button style={S.btn} onClick={addTransaction}>Add & Auto-Categorize</button>
            </div>

            <div style={S.card}>
              <div style={S.cardTitle}>🔍 Search & Filter</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <input style={{ ...S.input, marginBottom: 0, flex: 2 }}
                  placeholder="Search description..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchTransactions()} />
                <select style={{ ...S.input, marginBottom: 0, flex: 1 }}
                  value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select style={{ ...S.input, marginBottom: 0, width: "auto" }}
                  value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                  <option value="">All Months</option>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select style={{ ...S.input, marginBottom: 0, width: "auto" }}
                  value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                  <option value="">All Years</option>
                  {["2025","2026","2027"].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button style={S.btn} onClick={searchTransactions}>Search</button>
                <button style={S.btn} onClick={() => loadTransactions(filterMonth, filterYear)}>Load All</button>
              </div>
            </div>

            {transactions.length > 0 && (
              <div style={S.card}>
                <div style={S.cardTitle}>📋 {transactions.length} Transactions</div>
                {transactions.map(t => (
                  <div key={t.id} style={{ border: `1px solid #C7BCAB55`, borderRadius: 8, padding: 12, marginBottom: 8 }}>
                    {editingId === t.id ? (
                      <div>
                        <input style={S.input} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description" />
                        <input style={S.input} value={editAmount} onChange={e => setEditAmount(e.target.value)} placeholder="Amount" />
                        <button style={S.btn} onClick={() => editTransaction(t.id)}>Save</button>
                        <button style={{ ...S.btn, background: "#6b728033" }} onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "#202E44" }}>{t.description}</div>
                          <div style={{ fontSize: 11, color: "#A9BBC8" }}>{t.date}</div>
                        </div>
                        <span style={S.badge}>{t.category}</span>
                        <span style={{ fontWeight: 600, color: t.category === 'Income' ? COLORS.success : "#202E44" }}>
                          {t.category === 'Income' ? '+' : '-'}₹{t.amount}
                        </span>
                        <button style={S.btnEdit} onClick={() => { setEditingId(t.id); setEditDesc(t.description); setEditAmount(t.amount); }}>Edit</button>
                        <button style={S.btnDanger} onClick={() => deleteTransaction(t.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREDIT SCORE ── */}
        {activePage === "credit" && (
          <div>
            <div style={S.pageTitle}>📊 Credit Score</div>
            <div style={S.pageSubtitle}>AI-powered credit analysis using Random Forest + SHAP</div>
            {credit ? (
              <div style={S.card}>
                <div style={{ textAlign: "center", padding: 24 }}>
                  <div style={{ fontSize: 80, fontWeight: 800, color: credit.credit_score >= 70 ? COLORS.success : credit.credit_score >= 50 ? COLORS.warning : COLORS.danger }}>
                    {credit.credit_score}
                  </div>
                  <div style={{ fontSize: 16, color: "#A9BBC8" }}>out of 100</div>
                  <div style={{ marginTop: 8, fontSize: 13, color: "#202E44" }}>{credit.explanation}</div>
                </div>
                <div style={S.cardTitle}>Top Score Drivers</div>
                {Object.entries(credit.top_drivers).map(([k, v]) => (
                  <div key={k} style={{ ...S.row, marginBottom: 8 }}>
                    <span style={{ flex: 1, fontSize: 13, color: "#A9BBC8" }}>{k.replace(/_/g, ' ')}</span>
                    <span style={{ fontWeight: 600, color: v > 0 ? COLORS.success : COLORS.danger }}>
                      {v > 0 ? '+' : ''}{v}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={S.card}>
                <div style={{ textAlign: "center", padding: 32, color: "#A9BBC8" }}>
                  Add at least 3 transactions then click below
                </div>
                <button style={{ ...S.btn, width: "100%" }} onClick={loadCredit}>Generate Credit Score</button>
              </div>
            )}
          </div>
        )}

        {/* ── BUDGET ── */}
        {activePage === "budget" && (
          <div>
            <div style={S.pageTitle}>📋 Budget Planner</div>
            <div style={S.pageSubtitle}>Smart spending recommendations based on your income</div>
            {budget ? (
              <div style={S.card}>
                {budget.recommendations.map(r => (
                  <div key={r.category} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: "#202E44", fontWeight: 500 }}>{r.category}</span>
                      <span style={{ color: r.status === "good" ? COLORS.success : COLORS.danger }}>
                        {r.status === "good" ? "✅" : "⚠️"} ₹{r.actual_spend} / ₹{r.recommended_limit}
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "#F2F2EB", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(r.recommended_limit > 0 ? (r.actual_spend / r.recommended_limit) * 100 : 0, 100)}%`,
                        background: r.status === "good" ? COLORS.success : COLORS.danger,
                        borderRadius: 4
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={S.card}>
                <button style={{ ...S.btn, width: "100%" }} onClick={loadBudget}>Load Budget Recommendations</button>
              </div>
            )}
          </div>
        )}

        {/* ── LOANS ── */}
        {activePage === "loans" && (
          <div>
            <div style={S.pageTitle}>🏦 Loan Advisor</div>
            <div style={S.pageSubtitle}>Personalized loan recommendations based on your finances</div>
            {loans ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Monthly Income", value: `₹${loans.financial_summary.monthly_income.toLocaleString()}` },
                    { label: "Savings Rate", value: loans.financial_summary.savings_rate },
                    { label: "Debt-to-Income", value: loans.financial_summary.debt_to_income_ratio }
                  ].map(s => (
                    <div key={s.label} style={S.statCard}>
                      <div style={S.statValue}>{s.value}</div>
                      <div style={S.statLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>✅ Eligible Loans</div>
                  {loans.recommended_loans.map(loan => (
                    <div key={loan.type} style={{ border: `1px solid ${COLORS.success}44`, borderRadius: 8, padding: 12, marginBottom: 10, background: `${COLORS.success}11` }}>
                      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{loan.icon} {loan.type}</div>
                      <div style={{ fontSize: 12, color: "#A9BBC8", marginBottom: 8 }}>{loan.description}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {[
                          { label: "Rate", value: loan.interest_rate },
                          { label: "Eligible", value: `₹${loan.eligibility_amount.toLocaleString()}` },
                          { label: "EMI/mo", value: `₹${loan.sample_emi.toLocaleString()}` }
                        ].map(s => (
                          <div key={s.label} style={{ textAlign: "center", background: "#F2F2EB", borderRadius: 6, padding: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#202E44" }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: "#A9BBC8" }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {loans.not_eligible.length > 0 && (
                    <>
                      <div style={{ ...S.cardTitle, marginTop: 16 }}>❌ Not Eligible</div>
                      {loans.not_eligible.map(loan => (
                        <div key={loan.type} style={{ border: `1px solid ${COLORS.danger}44`, borderRadius: 8, padding: 12, marginBottom: 8, background: `${COLORS.danger}11` }}>
                          <div style={{ fontSize: 15, fontWeight: 500 }}>{loan.icon} {loan.type}</div>
                          <div style={{ fontSize: 12, color: COLORS.danger, marginTop: 4 }}>{loan.reason}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div style={S.card}>
                <button style={{ ...S.btn, width: "100%" }} onClick={loadLoans}>Get Loan Recommendations</button>
              </div>
            )}
          </div>
        )}

        {/* ── INSIGHTS ── */}
        {activePage === "insights" && (
          <div>
            <div style={S.pageTitle}>💡 Spending Insights</div>
            <div style={S.pageSubtitle}>AI analysis of your spending patterns and trends</div>
            {insights ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Income", value: `₹${insights.total_income.toLocaleString()}`, color: COLORS.success },
                    { label: "Expenses", value: `₹${insights.total_expenses.toLocaleString()}`, color: COLORS.danger },
                    { label: "Savings", value: `₹${insights.total_savings.toLocaleString()}`, color: "#8B734C" },
                    { label: "Health", value: insights.financial_health, color: "#202E44" }
                  ].map(s => (
                    <div key={s.label} style={S.statCard}>
                      <div style={{ ...S.statValue, color: s.color }}>{s.value}</div>
                      <div style={S.statLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {insights.alerts.length > 0 && (
                  <div style={S.card}>
                    <div style={S.cardTitle}>⚠️ Alerts</div>
                    {insights.alerts.map((a, i) => (
                      <div key={i} style={{ padding: "8px 12px", borderRadius: 6, marginBottom: 6, background: a.type === 'warning' ? "#f59e0b22" : `${COLORS.success}22`, borderLeft: `3px solid ${a.type === 'warning' ? COLORS.warning : COLORS.success}`, fontSize: 13, color: "#202E44" }}>
                        {a.message}
                      </div>
                    ))}
                  </div>
                )}

                <div style={S.card}>
                  <div style={S.cardTitle}>Top Categories</div>
                  {insights.top_categories.map(item => {
                    const max = insights.top_categories[0].amount;
                    return (
                      <div key={item.category} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                          <span style={{ color: "#202E44" }}>{item.category}</span>
                          <span style={{ color: "#A9BBC8" }}>₹{item.amount.toLocaleString()}</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: "#F2F2EB", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(item.amount / max) * 100}%`, background: "#8B734C", borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {insights.monthly_trend.length > 0 && (
                  <div style={S.card}>
                    <div style={S.cardTitle}>Monthly Trend</div>
                    {insights.monthly_trend.map(item => {
                      const max = Math.max(...insights.monthly_trend.map(m => m.amount));
                      return (
                        <div key={item.month} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                          <span style={{ fontSize: 12, color: "#A9BBC8", minWidth: 70 }}>{item.month}</span>
                          <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#F2F2EB", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(item.amount / max) * 100}%`, background: "#A9BBC8", borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 12, color: "#202E44", minWidth: 80, textAlign: "right" }}>₹{item.amount.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div style={S.card}>
                <button style={{ ...S.btn, width: "100%" }} onClick={loadInsights}>Load Insights</button>
              </div>
            )}
          </div>
        )}

        {/* ── GOALS ── */}
        {activePage === "goals" && (
          <div>
            <div style={S.pageTitle}>🎯 Savings Goals</div>
            <div style={S.pageSubtitle}>Set targets and track your progress</div>

            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showGoalForm ? 16 : 0 }}>
                <div style={S.cardTitle}>Your Goals</div>
                <button style={S.btn} onClick={() => setShowGoalForm(!showGoalForm)}>
                  {showGoalForm ? "Cancel" : "+ New Goal"}
                </button>
              </div>
              {showGoalForm && (
                <div style={{ borderTop: `1px solid #C7BCAB33`, paddingTop: 16 }}>
                  <input style={S.input} placeholder="Goal name (e.g. New Laptop)"
                    value={goalName} onChange={e => setGoalName(e.target.value)} />
                  <input style={S.input} placeholder="Target amount (₹)"
                    value={goalAmount} onChange={e => setGoalAmount(e.target.value)} />
                  <input type="date" style={S.input}
                    value={goalDeadline} onChange={e => setGoalDeadline(e.target.value)} />
                  <button style={S.btn} onClick={createGoal}>Create Goal</button>
                </div>
              )}
            </div>

            {goals.length === 0 && !showGoalForm && (
              <div style={{ ...S.card, textAlign: "center", padding: 40, color: "#A9BBC8" }}>
                No goals yet. Click "+ New Goal" to get started!
              </div>
            )}

            {goals.map(goal => (
              <div key={goal.id} style={{ ...S.card, border: `1px solid ${goal.is_completed ? COLORS.success : goal.on_track ? "#8B734C" : COLORS.danger}55` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, fontSize: 16, color: "#202E44" }}>{goal.is_completed ? '✅' : '🎯'} {goal.goal_name}</span>
                  <button style={S.btnDanger} onClick={() => deleteGoal(goal.id)}>×</button>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: "#A9BBC8" }}>₹{goal.current_amount.toLocaleString()} saved</span>
                    <span style={{ fontWeight: 600, color: "#202E44" }}>{goal.progress_pct}%</span>
                    <span style={{ color: "#A9BBC8" }}>₹{goal.target_amount.toLocaleString()} goal</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: "#F2F2EB", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${goal.progress_pct}%`,
                      background: goal.is_completed ? COLORS.success : goal.on_track ? "#8B734C" : COLORS.danger,
                      borderRadius: 5,
                      transition: "width 0.6s ease"
                    }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "Deadline", value: goal.deadline },
                    { label: "Months Left", value: goal.months_left },
                    { label: "Need/Month", value: `₹${goal.required_monthly.toLocaleString()}` }
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center", background: "#F2F2EB", borderRadius: 6, padding: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#202E44" }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "#A9BBC8" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 12, display: "inline-block", padding: "4px 12px", borderRadius: 20, marginBottom: 12, background: goal.on_track ? `${COLORS.success}22` : `${COLORS.danger}22`, color: goal.on_track ? COLORS.success : COLORS.danger }}>
                  {goal.is_completed ? '🎉 Goal Completed!' : goal.on_track ? '✅ On Track!' : `⚠️ Save ₹${goal.required_monthly.toLocaleString()}/month to reach goal`}
                </div>

                {!goal.is_completed && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input style={{ ...S.input, marginBottom: 0, flex: 1 }}
                      placeholder="Add deposit (₹)"
                      value={depositAmounts[goal.id] || ""}
                      onChange={e => setDepositAmounts({ ...depositAmounts, [goal.id]: e.target.value })} />
                    <button style={S.btn} onClick={() => addDeposit(goal.id)}>Add</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── COMPARISON ── */}
        {activePage === "comparison" && (
          <div>
            <div style={S.pageTitle}>📅 Month Comparison</div>
            <div style={S.pageSubtitle}>Compare spending patterns between any two months</div>

            <div style={S.card}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[
                  { label: "Month 1", month: cmpMonth1, setMonth: setCmpMonth1, year: cmpYear1, setYear: setCmpYear1 },
                  { label: "Month 2", month: cmpMonth2, setMonth: setCmpMonth2, year: cmpYear2, setYear: setCmpYear2 }
                ].map(m => (
                  <div key={m.label}>
                    <label style={{ fontSize: 12, color: "#A9BBC8", display: "block", marginBottom: 6 }}>{m.label}</label>
                    <select style={{ ...S.input, marginBottom: 8 }} value={m.month} onChange={e => m.setMonth(e.target.value)}>
                      <option value="">Select Month</option>
                      {MONTHS.map((mn, i) => <option key={mn} value={i + 1}>{mn}</option>)}
                    </select>
                    <select style={{ ...S.input, marginBottom: 0 }} value={m.year} onChange={e => m.setYear(e.target.value)}>
                      {["2025","2026","2027"].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button style={{ ...S.btn, width: "100%" }} onClick={loadComparison}>Compare</button>
            </div>

            {comparison && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Income", v1: comparison.month1.total_income, v2: comparison.month2.total_income, change: comparison.changes.income_change },
                    { label: "Expenses", v1: comparison.month1.total_expenses, v2: comparison.month2.total_expenses, change: comparison.changes.expense_change },
                    { label: "Savings", v1: comparison.month1.total_savings, v2: comparison.month2.total_savings, change: comparison.changes.savings_change }
                  ].map(item => (
                    <div key={item.label} style={S.statCard}>
                      <div style={S.statLabel}>{item.label}</div>
                      <div style={{ fontSize: 12, marginTop: 6, color: "#202E44" }}>{comparison.month1_name}: <strong>₹{item.v1.toLocaleString()}</strong></div>
                      <div style={{ fontSize: 12, color: "#202E44" }}>{comparison.month2_name}: <strong>₹{item.v2.toLocaleString()}</strong></div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6, color: item.change > 0 ? COLORS.success : COLORS.danger }}>
                        {item.change > 0 ? '▲' : '▼'} {Math.abs(item.change)}%
                      </div>
                    </div>
                  ))}
                </div>

                <div style={S.card}>
                  <div style={S.cardTitle}>Category Changes</div>
                  {comparison.category_comparison.map(cat => (
                    <div key={cat.category} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 500, color: "#202E44" }}>{cat.category}</span>
                        <span style={{ color: cat.trend === 'up' ? COLORS.danger : COLORS.success, fontWeight: 600 }}>
                          {cat.trend === 'up' ? '▲' : '▼'} {Math.abs(cat.change_pct)}%
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#A9BBC8", marginBottom: 4 }}>
                        {comparison.month1_name}: ₹{cat.month1_amount.toLocaleString()} → {comparison.month2_name}: ₹{cat.month2_amount.toLocaleString()}
                      </div>
                      <div style={{ display: "flex", gap: 4, height: 6 }}>
                        <div style={{ flex: cat.month1_amount || 1, background: "#A9BBC8", borderRadius: 3 }} />
                        <div style={{ flex: cat.month2_amount || 1, background: cat.trend === 'up' ? COLORS.danger : COLORS.success, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function DashboardWrapper() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [apiToken, setApiToken] = useState(null);

  const syncUser = async () => {
    try {
      const clerkToken = await getToken();
      const res = await axios.post(`${API}/auth/clerk-sync`, {
        clerk_id: user.id,
        name: user.fullName || user.username || "User",
        email: user.primaryEmailAddress?.emailAddress || ""
      }, {
        headers: { Authorization: `Bearer ${clerkToken}` }
      });
      setApiToken(res.data.token);
    } catch (e) {
      console.error("Sync failed", e);
    }
  };

  if (!apiToken) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F2F2EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ fontSize: 40 }}>💰</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#202E44" }}>
          Welcome, {user?.firstName || "there"}!
        </div>
        <button style={S.btn} onClick={syncUser}>
          Enter Finance Advisor
        </button>
      </div>
    );
  }

  return (
    <Dashboard
      token={apiToken}
      userName={user?.fullName || user?.username || "User"}
      onLogout={() => setApiToken(null)}
    />
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <SignedOut>
        <div style={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, #202E44 0%, #A9BBC8 60%, #F2F2EB 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif"
        }}>
          <SignIn />
        </div>
      </SignedOut>
      <SignedIn>
        <DashboardWrapper />
      </SignedIn>
    </>
  );
}