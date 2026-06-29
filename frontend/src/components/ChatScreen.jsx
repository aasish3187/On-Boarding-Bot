import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  RefreshCw, 
  Clock, 
  Search, 
  MoreVertical, 
  Calendar, 
  LifeBuoy, 
  FileText, 
  LogOut,
  Bot,
  CheckCircle2,
  XCircle
} from "lucide-react";

const LeaveRequestWidget = ({ onSubmit, disabled }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const days = calculateDays();

  const handleSubmit = () => {
    if (!startDate || !endDate || !reason) return;
    onSubmit(`ACTION:SUBMIT_LEAVE|days:${days} day(s)|reason:${reason}`);
  };

  return (
    <div className="bg-black/40 border border-primary/30 rounded-2xl p-5 shadow-lg w-full min-w-[300px] max-w-sm flex flex-col gap-4 animate-fade-in-up">
      <h3 className="text-primary font-bold flex items-center gap-2 text-sm"><Calendar className="w-4 h-4"/> Request Leave</h3>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[11px] text-on-surface-variant block mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={disabled} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary focus:outline-none"/>
        </div>
        <div className="flex-1">
          <label className="text-[11px] text-on-surface-variant block mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={disabled} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary focus:outline-none"/>
        </div>
      </div>
      
      {days > 0 && <p className="text-xs text-secondary font-mono">Total: {days} day(s)</p>}
      
      <div>
        <label className="text-[11px] text-on-surface-variant block mb-1">Reason for leave</label>
        <textarea 
          value={reason} onChange={e => setReason(e.target.value)} disabled={disabled}
          placeholder="e.g. Family vacation" 
          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary focus:outline-none resize-none h-20"
        />
      </div>
      
      <button 
        onClick={handleSubmit} 
        disabled={disabled || days <= 0 || !reason}
        className="mt-1 w-full bg-primary hover:brightness-110 text-on-primary font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(41,161,149,0.3)]"
      >
        <CheckCircle2 className="w-4 h-4"/> Submit to HR
      </button>
    </div>
  );
};

export default function ChatScreen({ user, onLogout }) {
  const [messages, setMessages] = useState([
    { sender: "knowledge_rag", content: "Hello! I'm OnboardBot, your virtual HR assistant. How can I help you settle in today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null); // 'pending', 'approved', 'rejected'
  const messagesEndRef = useRef(null);

  const renderFormattedMessage = (content) => {
    if (!content) return "";
    let html = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/`(.*?)`/g, "<code class='bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs text-secondary border border-white/5'>$1</code>");
    
    const lines = html.split("\n");
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ")) {
        return `<li class="ml-4 list-disc my-1 text-on-surface-variant">${trimmed.substring(2)}</li>`;
      }
      if (trimmed.startsWith("* ")) {
        return `<li class="ml-4 list-disc my-1 text-on-surface-variant">${trimmed.substring(2)}</li>`;
      }
      return `<p class="my-1 leading-relaxed">${line}</p>`;
    });
    
    return <div className="space-y-1" dangerouslySetInnerHTML={{ __html: formattedLines.join("") }} />;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/bot/history", {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const history = await res.json();
        if (history.length > 0) {
          setMessages(history);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  const resumeThread = async (threadId, status, note = "") => {
    try {
      const resumeResponse = await fetch(`http://localhost:8000/api/v1/chat/${threadId}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: status,
          note: note || `HR processed this request: ${status}`
        })
      });

      if (resumeResponse.ok) {
        const resumeData = await resumeResponse.json();
        // Shift status to approved/rejected in-place to animate the card
        setApprovalStatus(status);
        
        // Wait 3 seconds to let user view the resolved status animation, then append text and clear card
        setTimeout(() => {
          setMessages(prev => [...prev, { sender: "knowledge_rag", content: resumeData.response }]);
          setPendingApprovalId(null);
          setApprovalStatus(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to resume thread", error);
      setPendingApprovalId(null);
      setApprovalStatus(null);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, pendingApprovalId]);

  useEffect(() => {
    fetchHistory();

    const ws = new WebSocket("ws://localhost:8000/api/ws");

    ws.onopen = () => {
      console.log("[WebSocket] Connected in employee view");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "approval_decision" && data.employee_id === user.id) {
          if (data.ticket_id === pendingApprovalId || pendingApprovalId === null) {
            resumeThread(data.ticket_id, data.status);
          }
        }
      } catch (e) {
        console.error("WS error parsing message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [user.token, pendingApprovalId]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading || pendingApprovalId) return;

    setMessages(prev => [...prev, { sender: "user", content: messageText }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/bot/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          message: messageText
        })
      });

      if (!response.ok) throw new Error("Server communication failed.");

      const data = await response.json();
      
      if (data.status === "awaiting_approval") {
        setPendingApprovalId(data.thread_id);
        setApprovalStatus("pending");
        setMessages(prev => [...prev, { sender: "knowledge_rag", content: data.response }]);
      } else {
        setMessages(prev => [...prev, { sender: "knowledge_rag", content: data.response }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: "error", content: "Sorry, I had trouble connecting. Please ensure the backend is running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleRefreshStatus = async () => {
    if (!pendingApprovalId) return;
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/v1/approvals/${pendingApprovalId}/status`);
      if (!response.ok) throw new Error("Failed to check status.");
      
      const data = await response.json();
      
      if (data.status !== "pending") {
        await resumeThread(pendingApprovalId, data.status);
      } else {
        alert("HR Action is still pending approval. Please wait for an administrator to review it.");
      }
    } catch (error) {
      console.error(error);
      alert("Error checking status. Make sure the backend is active.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mesh-bg flex h-screen w-full relative z-10 p-4 gap-4 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Left Sidebar (Glass Panel) */}
      <aside className="hidden md:flex flex-col w-[25%] max-w-[320px] glass-panel rounded-xl shadow-2xl relative overflow-hidden p-6">
        
        {/* User Profile Section */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <div className="relative w-12 h-12 rounded-full border border-white/20 overflow-hidden shrink-0">
            <img 
              className="w-full h-full object-cover" 
              alt="Profile Pic"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQUVP-3QQQY8Q4ecMFhczNRm5cYzxg0REXj2KP-kkTpb1PIRM3l_GlkPY9CmjcKv7lLPu7KeIKnPC0LWoUBUsBVi8nId7J19YZOGXuBx6jitzZ_pe09V76GUstO9nkDdsOmKJXCY4Tec6iOqHS4wpJnKMkSrllRMkrWTtUCEylW8DAycC2-qdXFZb1G0ctIHgDWPl2UQqka7DhWV2opWla0_dIZ3jOMgMl7vgKr8MFAhofm_5Qu6ybbC4wEidkkKWfGeiZzUo15IWa"
            />
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <h2 className="font-bold text-on-surface truncate text-base">{user?.name || "Alex Vance"}</h2>
            <p className="text-xs text-on-surface-variant truncate capitalize">{user?.department || "Engineering"} • {user?.role || "Developer"}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-6 flex-1 text-left">
          <h3 className="text-[11px] font-mono tracking-widest text-tertiary mb-4 uppercase">Quick Actions</h3>
          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => sendMessage("I would like to request leave")}
              disabled={isLoading || !!pendingApprovalId}
              className="flex items-center gap-3 p-3 rounded-lg text-on-surface hover:bg-white/5 transition-all duration-200 group w-full text-left disabled:opacity-50 disabled:pointer-events-none"
            >
              <Calendar className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Request Leave</span>
            </button>
            <button 
              onClick={() => sendMessage("I need help setting up my software accounts")}
              disabled={isLoading || !!pendingApprovalId}
              className="flex items-center gap-3 p-3 rounded-lg text-on-surface hover:bg-white/5 transition-all duration-200 group w-full text-left disabled:opacity-50 disabled:pointer-events-none"
            >
              <LifeBuoy className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">IT Help</span>
            </button>
            <button 
              onClick={() => sendMessage("What onboarding documents do I need to submit?")}
              disabled={isLoading || !!pendingApprovalId}
              className="flex items-center gap-3 p-3 rounded-lg text-on-surface hover:bg-white/5 transition-all duration-200 group w-full text-left disabled:opacity-50 disabled:pointer-events-none"
            >
              <FileText className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Documents</span>
            </button>
          </nav>

          {/* HR Contact Block */}
          <div className="mt-8 p-4 rounded-lg bg-black/20 border border-white/10 text-left">
            <h3 className="text-[10px] font-mono tracking-widest text-tertiary mb-1.5 uppercase">HR Contact</h3>
            <p className="text-xs font-semibold text-on-surface">Sarah Jenkins</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">s.jenkins@company.com</p>
          </div>
        </div>

        {/* Sign Out */}
        <div className="pt-4 border-t border-white/10 mt-auto">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group w-full text-left"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Right Main Chat Area */}
      <main className="flex-1 flex flex-col glass-panel rounded-xl shadow-2xl relative overflow-hidden h-full">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/20 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg text-primary tracking-tight">OnboardBot</h1>
            <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-secondary status-dot-pulse"></div>
              <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <div className="relative hidden sm:flex items-center">
              <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search messages..."
                className="bg-black/30 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-40 focus:w-56 transition-all duration-300"
              />
            </div>
            {/* Mobile search button */}
            <button className="sm:hidden p-2 rounded-full hover:bg-white/10 text-on-surface-variant transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 text-on-surface-variant transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Message History Canvas */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 chat-scroll relative scroll-smooth">
          <div className="h-2 w-full shrink-0"></div>

          {messages.map((msg, i) => (
            <div key={i} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "user" ? (
                <div className="max-w-[75%] md:max-w-[60%] flex flex-col items-end gap-1 animate-fade-in-up">
                  <div className="px-5 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#1c2e5e] to-[#334576] border border-primary/20 shadow-lg text-white backdrop-blur-md text-sm md:text-[15px] leading-relaxed text-left">
                    {msg.content.startsWith("ACTION:SUBMIT_LEAVE|") ? (
                      <span className="italic opacity-70">Form Submitted</span>
                    ) : (
                      renderFormattedMessage(msg.content)
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 max-w-[85%] md:max-w-[70%] animate-fade-in-up">
                  <div className="w-8 h-8 rounded-full bg-black/40 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    {msg.content === "WIDGET:LEAVE_FORM" ? (
                      <LeaveRequestWidget 
                        onSubmit={sendMessage} 
                        disabled={isLoading || !!pendingApprovalId || i !== messages.length - 1} 
                      />
                    ) : msg.content.startsWith("ACTION:SUBMIT_LEAVE|") ? (
                      <div className="px-5 py-3 rounded-2xl rounded-tl-sm glass-panel text-white/50 shadow-lg text-sm italic md:text-[15px] leading-relaxed text-left">
                        [Leave Request Form Submitted]
                      </div>
                    ) : (
                      <div className="px-5 py-3 rounded-2xl rounded-tl-sm glass-panel text-white shadow-lg text-sm md:text-[15px] leading-relaxed text-left">
                        {renderFormattedMessage(msg.content)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="flex gap-3 max-w-[85%] md:max-w-[70%] animate-fade-in-up">
                <div className="w-8 h-8 rounded-full bg-black/40 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="px-5 py-3 rounded-2xl rounded-tl-sm glass-panel text-white shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}

          {/* Pending HR Action Block */}
          {pendingApprovalId && (
            <div className="flex justify-start w-full mt-2 animate-fade-in-up">
              <div className="ml-[44px] max-w-[85%] md:max-w-[60%] w-full">
                <div className={`px-4 py-3 rounded-xl border transition-all duration-500 flex items-center justify-between gap-3 shadow-lg relative overflow-hidden ${
                  approvalStatus === "approved" 
                    ? "border-green-500/40 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    : approvalStatus === "rejected"
                    ? "border-red-500/40 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                    : "border-secondary/30 bg-black/30 shadow-[0_0_15px_rgba(41,161,149,0.15)] animate-subtle-pulse"
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  
                  <div className="flex items-center gap-3">
                    {approvalStatus === "approved" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : approvalStatus === "rejected" ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-secondary animate-pulse" />
                    )}
                    <span className={`text-xs font-semibold ${
                      approvalStatus === "approved" 
                        ? "text-green-400" 
                        : approvalStatus === "rejected"
                        ? "text-red-400" 
                        : "text-secondary"
                    }`}>
                      {approvalStatus === "approved" 
                        ? "Request Approved! Resuming conversation..." 
                        : approvalStatus === "rejected" 
                        ? "Request Rejected. Resuming..." 
                        : "HR Action Pending Approval..."}
                    </span>
                  </div>

                  {approvalStatus === "pending" && (
                    <button 
                      onClick={handleRefreshStatus}
                      className="bg-secondary-container hover:brightness-110 text-on-secondary-container text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 relative z-10 shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh Status
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 pt-4 bg-gradient-to-t from-surface via-surface/90 to-transparent shrink-0">
          <form onSubmit={handleSend} className="relative flex items-end w-full max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              disabled={isLoading || !!pendingApprovalId}
              placeholder={pendingApprovalId ? "Waiting for HR Action..." : "Type a message..."}
              rows={1}
              style={{ minHeight: "52px" }}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-4 pr-14 text-white placeholder-on-surface-variant/50 resize-none max-h-32 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-black/60 transition-all duration-300"
            />
            <button 
              type="submit"
              disabled={isLoading || !!pendingApprovalId || !input.trim()}
              className="absolute right-2 bottom-2 w-10 h-10 rounded-xl bg-primary-container text-white hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center shadow-[0_0_10px_rgba(91,107,160,0.4)] hover:shadow-[0_0_15px_rgba(219,225,255,0.6)] active:scale-95 group disabled:opacity-40 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-on-surface-variant/60">OnboardBot may produce inaccurate information.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
