import { useState, useMemo, useEffect } from 'react'
import { Wallet, TrendingUp, TrendingDown, Pencil, Trash2, LayoutDashboard, List, PlusCircle, PieChart as PieChartIcon } from 'lucide-react';
import './App.css'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
 
function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [page, setPage] = useState("dashboard");
  const [category, setCategory] = useState("Food");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ description: "", amount: "", category: "" });
  const recentTransactions = transactions.slice(-5).reverse();
  const COLORS = ["#22c55e", "#38bdf8", "#f97316", "#a78bfa", "#f43f5e", "#facc15"];
 
  const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;
 
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, filterType]);
 
  const incomeVsExpense = [{ name: "Total", Income: income, Expense: expense }];
 
  const categoryBreakdown = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);
 
  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }
 
  function editTransaction(id, updates) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }
 
  function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    const newTransaction = {
      id: Date.now(),
      description,
      amount: Number(amount),
      category,
      type,
      date: new Date().toISOString().slice(0, 10),
    };
    setTransactions((prev) => [...prev, newTransaction]);
    setDescription("");
    setAmount("");
  }
 
  return (
    <>
    <div className="app">
      <aside className='sidebar'>
        <div className='logo'>
          <Wallet size={22} style={{ color: "whitesmoke"}} className='main-icon' />
          <h1 style={{ color: "whitesmoke"}}>Expense Tracker</h1>
        </div>
        <nav>
          <button className={page=="dashboard"?"sidebtn active":"sidebtn"} onClick={() => setPage("dashboard")}><LayoutDashboard size={16} /> Dashboard</button>
          <button className={page=="transactions"?"sidebtn active":"sidebtn"} onClick={() => setPage("transactions")}><List size={16} /> Transactions</button>
          <button className={page=="add"?"sidebtn active":"sidebtn"} onClick={() => setPage("add")}><PlusCircle size={16} /> Add New</button>
          <button className={page=="analytics"?"sidebtn active":"sidebtn"} onClick={() => setPage("analytics")}><PieChartIcon size={16} /> Analytics</button>
        </nav>
      </aside>
 
      <main className='content'>
        {page == "dashboard" && (
          <div>
             <h1 style={{color:"whitesmoke"}}>Dashboard</h1>
            <div className='summary-grid'>
              <div className='card'>
                <p className='card-label'><Wallet size={14}/>Balance</p>
                <p className={`card-value ${balance >= 0 ? "positive" : "negative"}`}>₹{balance}</p>
              </div>
              <div className='card'>
                <p className='card-label positive'><TrendingUp size={14} /> Income</p>
                <p className='card-value positive'>₹{income}</p>
              </div>
              <div className='card'>
                <p className='card-label negative'><TrendingDown size={14} /> Expense</p>
                <p className='card-value negative'>₹{expense}</p>
              </div>
            </div>
 
            <h3 className="section-label">Recent Activity</h3>
            <ul>
              {recentTransactions.map((t) => (
                <li key={t.id}>
                  <div>
                    <span>{t.description} ({t.category})</span>
                    <span className="date"> · {t.date}</span>
                  </div>
                  <span className={t.type === "income" ? "positive" : "negative"}>
                    {t.type === "income" ? "+" : "-"}₹{t.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
 
        {page == "add" && (
         <>
         <h1 style={{color:"whitesmoke"}}>Add New Transaction</h1>
          <form className="submitform" onSubmit={handleSubmit}>
            <input type="text" placeholder='Description' value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="number" placeholder='Amount' value={amount} onChange={(e) => setAmount(e.target.value)} />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Gifts">Gifts</option>
              <option value="Bills">Bills</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Salary">Salary</option>
              <option value="Other">Other</option>
            </select>
            <button className="addbtn" type="submit"><PlusCircle size={14}/>Add transaction</button>
          </form>
        </>
        )}
 
        {page == "transactions" && (
          <div>
            <h1 style={{color:'whitesmoke'}}>Transactions</h1>
            <input type="text" value={search} placeholder='Search Transactions' onChange={(e) => setSearch(e.target.value)} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
            <ul>
              {filteredTransactions.map((t) => (
                <li key={t.id}>
                  {editingId === t.id ? (
                    <>
                      <input
                        value={editDraft.description}
                        onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                      />
                      <input
                        type="number"
                        value={editDraft.amount}
                        onChange={(e) => setEditDraft((d) => ({ ...d, amount: e.target.value }))}
                      />
                      <button
                        onClick={() => {
                          editTransaction(t.id, {
                            description: editDraft.description,
                            amount: Number(editDraft.amount),
                          });
                          setEditingId(null);
                        }}
                      >
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <div>
                        <span>{t.description} ({t.category})</span>
                        <span className="date"> · {t.date}</span>
                      </div>
                      <span className={t.type === "income" ? "positive" : "negative"}>
                        {t.type === "income" ? "+" : "-"}₹{t.amount}
                      </span>
                      <button className="iconbtn"
                        onClick={() => {
                          setEditingId(t.id);
                          setEditDraft({ description: t.description, amount: t.amount, category: t.category });
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button className="iconbtn" onClick={() => deleteTransaction(t.id)}><Trash2 size={14} /></button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
 
        {page == "analytics" && (
          <>
          <h1 style={{color:"whitesmoke"}}>Analytics</h1>
          <div className="charts-row">
            <div className="charts" id="ch1">
                <div style={{ width: "100%", height: 300 }}>
              <h2 style={{color:"whitesmoke"}}>Spending By Category</h2>
              <ResponsiveContainer>
                <PieChart>
                   <Pie data={categoryBreakdown} dataKey="value" nameKey="name" outerRadius={80} label>
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                         ))}
               </Pie>
               <Tooltip/>   
                </PieChart>
               
              </ResponsiveContainer>
              </div>
            </div>
            <div className="charts" id="ch2" >
              <h2 style={{color:"whitesmoke"}}>Income vs Expense</h2>
                <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={incomeVsExpense}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Income" fill="#22c55e" />
                  <Bar dataKey="Expense" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          </div>
          </>
        )}
      </main>
    </div>
    </>
  );
}
 
export default App