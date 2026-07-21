import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Cpu, 
  User, 
  Calendar, 
  Plus, 
  ShieldCheck, 
  Briefcase, 
  Building, 
  Settings, 
  HelpCircle,
  LogOut
} from "lucide-react";

export default function DashboardScreen({ user, onLogout }) {
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [activeDecision, setActiveDecision] = useState(null);
  const [activeTab, setActiveTab] = useState("approvals");

  // New features state
  const [employees, setEmployees] = useState([]);
  const [settings, setSettings] = useState({
    core_hours: "",
    hr_contact: "",
    hr_email: "",
    documents_required: ""
  });
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequestForm, setNewRequestForm] = useState({ employee_id: "", action_type: "provisioning", req_details: "" });

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchPendingApprovals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/v1/approvals/pending");
      if (!response.ok) throw new Error("Could not load approvals from server.");
      const data = await response.json();
      setApprovals(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend. Please ensure it is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistoryApprovals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/v1/approvals/history");
      if (!response.ok) throw new Error("Could not load approvals history.");
      const data = await response.json();
      setApprovals(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend. Please ensure it is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/users");
      if (!response.ok) throw new Error("Failed to load employees");
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch employee list", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/settings");
      if (!response.ok) throw new Error("Failed to load settings");
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error("Failed to save settings");
      addToast("Settings updated successfully", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to save settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/v1/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRequestForm)
      });
      if (!response.ok) throw new Error("Failed to create request");
      addToast("New approval ticket created successfully", "success");
      setShowNewRequest(false);
      setNewRequestForm({ employee_id: "", action_type: "provisioning", req_details: "" });
      fetchPendingApprovals();
    } catch (err) {
      console.error(err);
      addToast("Failed to create approval ticket", "error");
    }
  };

  useEffect(() => {
    fetchPendingApprovals();

    const ws = new WebSocket("ws://localhost:8000/api/ws");

    ws.onopen = () => {
      console.log("[WebSocket] Connected in HR view");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "approval_created") {
          fetchPendingApprovals();
        }
      } catch (e) {
        console.error("WS error parsing message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (activeTab === "employees") {
      fetchEmployees();
    } else if (activeTab === "company" || activeTab === "settings") {
      fetchSettings();
    } else if (activeTab === "approvals") {
      fetchPendingApprovals();
    }
  }, [activeTab]);

  const handleAction = async (id, action, note = "") => {
    try {
      // Step 1: Post decision to approvals endpoint
      const decisionResponse = await fetch(`http://localhost:8000/api/v1/approvals/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note || "HR Action Processed" })
      });

      if (!decisionResponse.ok) throw new Error("Failed to register decision.");
      const decisionData = await decisionResponse.json();

      const threadId = decisionData.thread_id;

      // Step 2: Immediately post to chat resume endpoint to unblock agent
      const resumeResponse = await fetch(`http://localhost:8000/api/v1/chat/${threadId}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note || "HR Action Processed" })
      });

      if (!resumeResponse.ok) throw new Error("Failed to resume bot thread.");

      // Remove from state on success
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      addToast(`Request ${id} successfully ${action === "approve" ? "approved" : "rejected"}.`, "success");
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to process decision.", "error");
    }
  };

  return (
    <div className="flex h-screen w-full relative z-10 p-4 gap-4 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Left Sidebar (Glass Panel) */}
      <aside className="hidden md:flex flex-col w-[25%] max-w-[320px] glass-panel rounded-xl shadow-2xl relative overflow-hidden p-6">
        <div className="flex flex-col items-center mb-8 gap-2 text-center border-b border-white/10 pb-6">
          <img 
            alt="HR Admin Avatar" 
            className="w-16 h-16 rounded-full border border-white/20 shadow-lg object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFDmeLekMFYVgjfrNxqjWQmXCOQlTmxmqOGVNcHQWCvWMbxR9oFgxnArT8Gdjhniw6o0sGLyWLDYAIYp0pxDlRBD5shaM_CGILJg8tMzYdeUH9BZqzumASy2J4fMl5lcmI1mxU7VZu3sWvp2B9PRng-Hy8KwgxatEDcpWZQSGoA0D64VhEi7uy28IsppiZ4vCSYIvFuW2deKdYDSyUAOgX_Q5qEbu5V0bkdQAXBjc0zPpZvPaUjTYIQlJZ9UEKUiD5uOZaDTZTCd76"
          />
          <h2 className="font-bold text-on-surface text-base">Welcome, HR Admin</h2>
          <p className="text-xs text-on-surface-variant opacity-80">OnboardBot Concierge</p>
        </div>

        <button 
          onClick={() => setShowNewRequest(true)}
          className="w-full py-3 mb-6 bg-primary-container text-white rounded-lg shadow-[0_0_15px_rgba(180,197,255,0.3)] hover:shadow-[0_0_25px_rgba(180,197,255,0.5)] hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm font-semibold border border-white/10"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
 
        <nav className="flex flex-col gap-1 flex-grow text-left">
          <button 
            onClick={() => setActiveTab("approvals")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border-l-4 w-full text-left ${
              activeTab === "approvals" || activeTab === "history" 
                ? "bg-primary-container/35 text-primary border-l-primary" 
                : "text-on-surface-variant opacity-80 hover:bg-white/5 hover:opacity-100 border-l-transparent"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            Approvals
          </button>
          
          <button 
            onClick={() => setActiveTab("employees")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border-l-4 w-full text-left ${
              activeTab === "employees" 
                ? "bg-primary-container/35 text-primary border-l-primary" 
                : "text-on-surface-variant opacity-80 hover:bg-white/5 hover:opacity-100 border-l-transparent"
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Employee Details
          </button>
          
          <button 
            onClick={() => setActiveTab("company")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border-l-4 w-full text-left ${
              activeTab === "company" 
                ? "bg-primary-container/35 text-primary border-l-primary" 
                : "text-on-surface-variant opacity-80 hover:bg-white/5 hover:opacity-100 border-l-transparent"
            }`}
          >
            <Building className="w-5 h-5" />
            Company Details
          </button>
        </nav>
 
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-white/10 text-left">
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border-l-4 w-full text-left ${
              activeTab === "settings" 
                ? "bg-primary-container/35 text-primary border-l-primary" 
                : "text-on-surface-variant opacity-80 hover:bg-white/5 hover:opacity-100 border-l-transparent"
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <a className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant opacity-80 hover:bg-white/5 hover:opacity-100 text-xs font-mono uppercase tracking-wider transition-all border-l-4 border-transparent" href="#">
            <HelpCircle className="w-4 h-4" />
            Help
          </a>
        </div>
      </aside>

      {/* Right Content Area */}
      <main className="flex-grow flex flex-col glass-panel rounded-xl shadow-2xl relative overflow-hidden h-full">
        {/* TopNavBar */}
        <nav className="h-16 flex justify-between items-center px-6 bg-black/20 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg text-primary cursor-pointer hover:text-primary transition-colors">OnboardBot v2</span>
          </div>
          <div className="flex items-center gap-4">
            <img 
              alt="HR Admin Profile" 
              className="w-9 h-9 rounded-full border border-white/20 shadow-lg object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFDmeLekMFYVgjfrNxqjWQmXCOQlTmxmqOGVNcHQWCvWMbxR9oFgxnArT8Gdjhniw6o0sGLyWLDYAIYp0pxDlRBD5shaM_CGILJg8tMzYdeUH9BZqzumASy2J4fMl5lcmI1mxU7VZu3sWvp2B9PRng-Hy8KwgxatEDcpWZQSGoA0D64VhEi7uy28IsppiZ4vCSYIvFuW2deKdYDSyUAOgX_Q5qEbu5V0bkdQAXBjc0zPpZvPaUjTYIQlJZ9UEKUiD5uOZaDTZTCd76"
            />
            <button 
              onClick={onLogout}
              className="text-xs font-semibold px-3 py-1.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 hover:text-red-300 rounded-lg text-on-surface transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </nav>

        {/* Inner Content Area */}
        <div className="flex-1 overflow-y-auto p-6 chat-scroll flex flex-col">
          {/* Sub-header */}
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6 flex-wrap gap-4 text-left">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-on-surface drop-shadow-md">Pending Approvals</h1>
              <span className="bg-primary/20 border border-primary/40 text-primary px-3 py-1 rounded-full text-xs font-mono">
                {approvals.length} New
              </span>
            </div>
            
            {/* Toggles */}
            <div className="flex bg-black/30 rounded-full p-1 border border-white/10 shadow-inner">
              <button 
                onClick={() => { setActiveTab("approvals"); fetchPendingApprovals(); }}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "approvals" 
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-md" 
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                Approvals
              </button>
              <button 
                onClick={() => { setActiveTab("history"); fetchHistoryApprovals(); }}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "history" 
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-md" 
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                History
              </button>
            </div>
          </div>

          {/* Bento Grid & Conditional Tab Views */}
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center flex flex-col items-center max-w-md mx-auto my-10">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="text-lg font-bold text-red-200 mb-2">Connection Error</h3>
              <p className="text-red-300/80 text-sm mb-4">{error}</p>
              <button 
                onClick={fetchPendingApprovals} 
                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 px-4 py-2 rounded transition-all text-sm"
              >
                Retry
              </button>
            </div>
          ) : (activeTab === "approvals" || activeTab === "history") ? (
            approvals.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center py-20 text-on-surface-variant border border-dashed border-white/10 rounded-2xl bg-white/5">
                <CheckCircle2 className="w-16 h-16 text-secondary mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-on-surface mb-1">All Caught Up!</h3>
                <p className="text-sm">There are no pending actions requiring approvals.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                {approvals.map((approval) => (
                  <article 
                    key={approval.id} 
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 relative group overflow-hidden text-left"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Card Top Row */}
                    <div className="flex justify-between items-start z-10">
                      <div className="flex items-center gap-3">
                        <img 
                          alt="Submitter Avatar" 
                          className="w-12 h-12 rounded-full border-2 border-white/20 object-cover" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8hVNY3CopT2hyMAEbb9_XZxJctq3ihGYzCkAH3F30MtIbmfaM2UYD-pGYwcKcIYV7VNAiQxoyJallfdqFu8FLCmQ_GVqhKid9r9cfFtDvF4BDRTZogZV53cr9WtQD01CkikS-VBA5NbAZbUpeEfDqz71rPEpk2ZuzFKy1HprHalj6FO9SvuAS8aPHI-Oq_y8U9Ea67uRQV7j2TqxP3tmat76eG_NT0ndgfSi7KPtJcHYbAzIO0yqCDiQQ-eq0m9DIM8cKDDCCVk0W"
                        />
                        <div>
                          <h3 className="font-bold text-on-surface text-[15px] leading-tight">{approval.submitted_by.split(" (")[0]}</h3>
                          <span className="text-[10px] font-mono text-on-surface-variant block mt-0.5">
                            {approval.details["Employee ID"]} • {approval.submitted_by.split(" (")[1]?.replace(")", "") || "Staff"}
                          </span>
                        </div>
                      </div>
                      <span className="bg-secondary-container/20 text-secondary border border-secondary/30 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-wider">
                        High Priority
                      </span>
                    </div>
  
                    {/* Card Middle Row */}
                    <div className="bg-black/25 rounded-xl p-4 border border-white/10 z-10 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-primary">
                        <Cpu className="w-4.5 h-4.5" />
                        <span className="text-xs font-bold font-mono uppercase tracking-wider">{approval.tool_name}</span>
                      </div>
                      <div className="text-[13px] text-on-surface-variant font-mono mt-1 leading-relaxed">
                        {approval.details["Action Required"] || "System Provisioning"}
                      </div>
                    </div>
  
                    {/* Card Details */}
                    <div className="z-10 flex-grow text-xs text-on-surface-variant leading-relaxed">
                      <p className="line-clamp-3"><span className="text-primary font-mono block mb-1">Details:</span> {approval.details["Requested Access"]}</p>
                    </div>
  
                    {/* Actions */}
                    <div className="flex gap-3 z-10 pt-3 border-t border-white/10 mt-auto">
                      {activeTab === "history" ? (
                        <div className="w-full flex items-center justify-center py-2 px-4 rounded-lg bg-black/25 border border-white/5 text-xs font-semibold">
                          {approval.status === "approved" ? (
                            <span className="text-green-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> Approved
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1.5">
                              <XCircle className="w-4 h-4" /> Rejected
                            </span>
                          )}
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => setActiveDecision({ id: approval.id, name: approval.submitted_by.split(" (")[0], action: "reject", note: "" })}
                            className="flex-grow flex items-center justify-center gap-1.5 bg-white/5 hover:bg-red-500/10 text-on-surface border border-white/10 hover:border-red-500/40 hover:text-red-300 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                          <button 
                            onClick={() => setActiveDecision({ id: approval.id, name: approval.submitted_by.split(" (")[0], action: "approve", note: "" })}
                            className="flex-grow flex items-center justify-center gap-1.5 bg-[#2563eb] text-white hover:brightness-110 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : activeTab === "employees" ? (
            <div className="glass-panel rounded-2xl p-6 border border-white/10 text-left">
              <h2 className="text-xl font-bold text-white mb-4">Employee Directory</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-on-surface-variant">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-wider text-primary">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white font-semibold">{emp.name}</td>
                        <td className="py-3 px-4 font-mono">{emp.email}</td>
                        <td className="py-3 px-4 capitalize">{emp.department}</td>
                        <td className="py-3 px-4 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${emp.role === "hr" ? "bg-secondary-container/20 text-secondary border border-secondary/30" : "bg-primary/20 text-primary border border-primary/20"}`}>
                            {emp.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "company" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col gap-3">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2"><Building className="w-5 h-5"/> Workspace Core Info</h2>
                <div className="flex flex-col gap-2 mt-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Core Working Hours</span>
                    <p className="text-sm font-semibold text-white">{settings.core_hours}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Primary HR Support Email</span>
                    <p className="text-sm font-semibold text-white">{settings.hr_email} ({settings.hr_contact})</p>
                  </div>
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col gap-3">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2"><FileText className="w-5 h-5"/> Required Onboarding Docs</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">Employees must submit the following documents to complete their file:</p>
                <ul className="list-disc list-inside text-sm text-white mt-2 space-y-1.5 font-semibold">
                  {settings.documents_required.split(", ").map(doc => <li key={doc}>{doc}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <form onSubmit={saveSettings} className="glass-panel rounded-2xl p-6 border border-white/10 text-left max-w-xl flex flex-col gap-4">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2"><Settings className="w-5 h-5"/> Update Policy Settings</h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Core Working Hours</label>
                <input type="text" value={settings.core_hours} onChange={e => setSettings(prev => ({ ...prev, core_hours: e.target.value }))} className="w-full bg-black/20 border border-white/25 rounded-xl py-3 px-4 text-white focus:border-primary focus:outline-none"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">HR Support Contact Name</label>
                <input type="text" value={settings.hr_contact} onChange={e => setSettings(prev => ({ ...prev, hr_contact: e.target.value }))} className="w-full bg-black/20 border border-white/25 rounded-xl py-3 px-4 text-white focus:border-primary focus:outline-none"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">HR Support Email</label>
                <input type="email" value={settings.hr_email} onChange={e => setSettings(prev => ({ ...prev, hr_email: e.target.value }))} className="w-full bg-black/20 border border-white/25 rounded-xl py-3 px-4 text-white focus:border-primary focus:outline-none"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Required Onboarding Docs (Comma separated)</label>
                <input type="text" value={settings.documents_required} onChange={e => setSettings(prev => ({ ...prev, documents_required: e.target.value }))} className="w-full bg-black/20 border border-white/25 rounded-xl py-3 px-4 text-white focus:border-primary focus:outline-none"/>
              </div>
              <button type="submit" className="mt-2 bg-primary hover:brightness-110 text-on-primary font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(41,161,149,0.3)]">Save Settings</button>
            </form>
          )}
        </div>
      </main>
 
      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <form onSubmit={createCustomRequest} className="w-full max-w-md bg-[#0a182c] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-lg text-on-surface">Issue New Ticket / Task</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed text-left">
                Select an employee and request access or allocate an onboarding task:
              </p>
            </div>
            
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Select Employee</label>
              <select 
                value={newRequestForm.employee_id} 
                onChange={e => setNewRequestForm(prev => ({ ...prev, employee_id: e.target.value }))}
                required
                className="w-full bg-black/30 border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="" disabled className="text-black">Choose Employee...</option>
                {employees.map(emp => emp.role === "employee" && (
                  <option key={emp.id} value={emp.id} className="text-black">{emp.name} ({emp.department})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Request Type</label>
              <select 
                value={newRequestForm.action_type} 
                onChange={e => setNewRequestForm(prev => ({ ...prev, action_type: e.target.value }))}
                required
                className="w-full bg-black/30 border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="provisioning" className="text-black">IT Provisioning</option>
                <option value="leave" className="text-black">Leave Approval</option>
                <option value="documentation" className="text-black">Document Verification</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Request Details</label>
              <textarea
                value={newRequestForm.req_details}
                onChange={e => setNewRequestForm(prev => ({ ...prev, req_details: e.target.value }))}
                placeholder="e.g., Slack / GitHub access, 3-day sick leave"
                required
                rows={3}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-on-surface-variant/40 resize-none focus:outline-none focus:border-primary transition-all"
              />
            </div>
            
            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewRequest(false);
                  setNewRequestForm({ employee_id: "", action_type: "provisioning", req_details: "" });
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:brightness-110 shadow-lg transition-all"
              >
                Create Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {activeDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in animate-duration-200">
          <div className="w-full max-w-md bg-[#0a182c] border border-white/10 rounded-2xl p-6 shadow-2xl relative flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-lg text-on-surface capitalize">Confirm {activeDecision.action}al</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed text-left">
                You are about to <strong>{activeDecision.action}</strong> the request from <strong>{activeDecision.name}</strong>. Add an optional feedback note:
              </p>
            </div>
            
            <textarea
              value={activeDecision.note}
              onChange={(e) => setActiveDecision(prev => ({ ...prev, note: e.target.value }))}
              placeholder={activeDecision.action === "reject" ? "Reason for rejection (highly recommended)..." : "Additional instructions (optional)..."}
              rows={3}
              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-on-surface-variant/40 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left"
            />
            
            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => setActiveDecision(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const { id, action, note } = activeDecision;
                  setActiveDecision(null);
                  await handleAction(id, action, note);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all ${
                  activeDecision.action === "approve"
                    ? "bg-[#2563eb] hover:brightness-110"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`flex items-center gap-3 p-4 rounded-lg shadow-xl border-l-4 backdrop-blur-md glass-panel ${
              t.type === "success" 
                ? "border-l-secondary text-secondary" 
                : "border-l-red-500 text-red-200"
            } animate-fade-in-up`}
          >
            {t.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="text-sm font-semibold">{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
