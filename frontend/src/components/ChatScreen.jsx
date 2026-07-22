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
  XCircle,
  Cpu,
  PenTool,
  Mic,
  Volume2,
  UserCheck,
  ShieldCheck,
  Award,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  Download,
  Headphones
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

const ITProvisioningWidget = ({ onSubmit, disabled }) => {
  const [selectedTools, setSelectedTools] = useState([]);

  const toolsList = ["Slack", "GitHub", "Jira", "Figma", "AWS"];

  const handleToggle = (tool) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(t => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleSubmit = () => {
    if (selectedTools.length === 0) return;
    onSubmit(`ACTION:SUBMIT_IT|tools:${selectedTools.join(", ")}`);
  };

  return (
    <div className="bg-black/40 border border-primary/30 rounded-2xl p-5 shadow-lg w-full min-w-[300px] max-w-sm flex flex-col gap-4 animate-fade-in-up">
      <h3 className="text-primary font-bold flex items-center gap-2 text-sm"><LifeBuoy className="w-4 h-4"/> IT Account Provisioning</h3>
      <p className="text-xs text-on-surface-variant leading-relaxed">Select the software tools and developer environments you need access to:</p>
      
      <div className="flex flex-col gap-2">
        {toolsList.map((tool) => (
          <label key={tool} className="flex items-center gap-3 p-2 rounded-lg bg-black/20 hover:bg-white/5 border border-white/5 cursor-pointer transition-colors text-xs font-semibold">
            <input 
              type="checkbox" 
              checked={selectedTools.includes(tool)} 
              onChange={() => handleToggle(tool)}
              disabled={disabled}
              className="rounded border-white/25 bg-black/30 text-primary focus:ring-0 w-4 h-4"
            />
            <span>{tool}</span>
          </label>
        ))}
      </div>
      
      <button 
        onClick={handleSubmit} 
        disabled={disabled || selectedTools.length === 0}
        className="mt-1 w-full bg-primary hover:brightness-110 text-on-primary font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(41,161,149,0.3)]"
      >
        <CheckCircle2 className="w-4 h-4"/> Request Access
      </button>
    </div>
  );
};

const DocumentUploadWidget = ({ onUpload, disabled }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setSuccess(true);
      onUpload(`ACTION:SUBMIT_DOC|file:${file.name}`);
    }, 2000);
  };

  return (
    <div className="bg-black/40 border border-primary/30 rounded-2xl p-5 shadow-lg w-full min-w-[300px] max-w-sm flex flex-col gap-4 animate-fade-in-up">
      <h3 className="text-primary font-bold flex items-center gap-2 text-sm"><FileText className="w-4 h-4"/> Document Upload Portal</h3>
      
      {success ? (
        <div className="flex flex-col items-center gap-2 text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-secondary animate-bounce" />
          <p className="text-sm font-semibold text-white">Upload Successful!</p>
          <p className="text-[11px] text-on-surface-variant font-mono truncate w-full px-4">{file?.name}</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Select and upload your signed contract or government-issued ID card:
          </p>
          <div className="border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-black/25">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              disabled={disabled || isUploading}
              onChange={e => setFile(e.target.files[0])}
            />
            <label htmlFor="file-upload" className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-xs font-semibold transition-all">
              {file ? "Change File" : "Choose File"}
            </label>
            {file && <p className="text-xs text-secondary font-mono mt-1 text-center truncate w-full px-4">{file.name}</p>}
          </div>
          
          <button 
            onClick={handleUpload} 
            disabled={disabled || !file || isUploading}
            className="mt-1 w-full bg-primary hover:brightness-110 text-on-primary font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(41,161,149,0.3)]"
          >
            {isUploading ? "Uploading..." : "Upload Document"}
          </button>
        </>
      )}
    </div>
  );
};

const HardwareProcurementWidget = ({ onSubmit, disabled }) => {
  const [laptop, setLaptop] = useState("MacBook Pro M3 Max (32GB)");
  const [monitors, setMonitors] = useState("Dual 27-inch 4K Displays");
  const [peripherals, setPeripherals] = useState("Ergonomic Keyboard & Precision Mouse");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit(`ACTION:SUBMIT_HARDWARE|Laptop:${laptop}|Monitors:${monitors}|Peripherals:${peripherals}`);
  };

  return (
    <div className="bg-black/40 border border-primary/30 rounded-2xl p-5 shadow-lg w-full min-w-[300px] max-w-sm flex flex-col gap-4 animate-fade-in-up">
      <h3 className="text-primary font-bold flex items-center gap-2 text-sm"><Cpu className="w-4 h-4"/> Hardware Workstation Order</h3>
      {submitted ? (
        <div className="flex flex-col items-center gap-2 text-center py-4">
          <CheckCircle2 className="w-10 h-10 text-secondary" />
          <p className="text-sm font-semibold text-white">Order Submitted for Approval</p>
          <p className="text-xs text-on-surface-variant font-mono">{laptop}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-mono uppercase text-on-surface-variant">Laptop Model</label>
            <select value={laptop} onChange={e => setLaptop(e.target.value)} disabled={disabled} className="bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary">
              <option value="MacBook Pro M3 Max (32GB)" className="text-black">MacBook Pro M3 Max (32GB)</option>
              <option value="Dell XPS 15 Touch (64GB)" className="text-black">Dell XPS 15 Touch (64GB)</option>
              <option value="Lenovo ThinkPad X1 Carbon" className="text-black">Lenovo ThinkPad X1 Carbon</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-mono uppercase text-on-surface-variant">Display Options</label>
            <select value={monitors} onChange={e => setMonitors(e.target.value)} disabled={disabled} className="bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary">
              <option value="Dual 27-inch 4K Displays" className="text-black">Dual 27-inch 4K Displays</option>
              <option value="34-inch Curved UltraWide Monitor" className="text-black">34-inch Curved UltraWide Monitor</option>
              <option value="Single 27-inch 4K Display" className="text-black">Single 27-inch 4K Display</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-mono uppercase text-on-surface-variant">Accessories</label>
            <select value={peripherals} onChange={e => setPeripherals(e.target.value)} disabled={disabled} className="bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary">
              <option value="Ergonomic Keyboard & Precision Mouse" className="text-black">Ergonomic Keyboard & Precision Mouse</option>
              <option value="Noise-Canceling Wireless Headset" className="text-black">Noise-Canceling Wireless Headset</option>
              <option value="Complete Developer Bundle" className="text-black">Complete Developer Bundle</option>
            </select>
          </div>

          <button onClick={handleSubmit} disabled={disabled} className="mt-1 w-full bg-primary hover:brightness-110 text-on-primary font-bold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(41,161,149,0.3)]">
            <CheckCircle2 className="w-4 h-4"/> Submit Hardware Order
          </button>
        </>
      )}
    </div>
  );
};

const ESignatureWidget = ({ onSubmit, disabled }) => {
  const canvasRef = useRef(null);
  const [isSigned, setIsSigned] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
  };

  const handleMouseDown = (e) => {
    if (disabled || submitted) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);

    const handleMouseMove = (me) => {
      ctx.lineTo(me.clientX - rect.left, me.clientY - rect.top);
      ctx.strokeStyle = "#29a195";
      ctx.lineWidth = 2;
      ctx.stroke();
      setIsSigned(true);
    };

    const handleMouseUp = () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
  };

  const handleSave = () => {
    if (!isSigned) return;
    setSubmitted(true);
    onSubmit("ACTION:SUBMIT_SIGNATURE|document:Employee_NDA_Policy");
  };

  return (
    <div className="bg-black/40 border border-primary/30 rounded-2xl p-5 shadow-lg w-full min-w-[300px] max-w-sm flex flex-col gap-4 animate-fade-in-up">
      <h3 className="text-primary font-bold flex items-center gap-2 text-sm"><PenTool className="w-4 h-4"/> Digital E-Signature Pad</h3>
      {submitted ? (
        <div className="flex flex-col items-center gap-2 text-center py-4">
          <CheckCircle2 className="w-10 h-10 text-secondary" />
          <p className="text-sm font-semibold text-white">Signature Recorded</p>
          <p className="text-xs text-on-surface-variant font-mono">Employee NDA & Policy Agreement</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-on-surface-variant leading-relaxed">Draw your digital signature below to execute the onboarding agreements:</p>
          <div className="border border-white/20 rounded-xl bg-black/40 p-1">
            <canvas 
              ref={canvasRef}
              width={280}
              height={100}
              onMouseDown={handleMouseDown}
              className="w-full bg-black/50 rounded-lg cursor-crosshair"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={clearCanvas} disabled={disabled} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2 rounded-lg text-xs font-semibold">
              Clear
            </button>
            <button onClick={handleSave} disabled={disabled || !isSigned} className="flex-1 bg-primary hover:brightness-110 text-on-primary py-2 rounded-lg text-xs font-bold disabled:opacity-50">
              Confirm Signature
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const PeerMentorCard = () => (
  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-lg max-w-sm">
    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-sm font-mono">
      DV
    </div>
    <div className="flex-1 text-left">
      <h4 className="text-xs font-bold text-white leading-tight">David Vance</h4>
      <span className="text-[10px] text-primary font-mono block">Senior Onboarding Buddy</span>
      <span className="text-[10px] text-on-surface-variant font-mono truncate block">d.vance@luminasystems.com</span>
    </div>
    <a href="mailto:d.vance@luminasystems.com" className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-semibold text-white transition-all">
      Connect
    </a>
  </div>
);

export default function ChatScreen({ user, onLogout }) {
  const [messages, setMessages] = useState([
    { sender: "knowledge_rag", content: "Hello! I'm OnboardBot, your virtual HR assistant. How can I help you settle in today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [persona, setPersona] = useState("professional");
  const [language, setLanguage] = useState("en");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const handleClearChat = () => {
    setMessages([
      { sender: "knowledge_rag", content: "Hello! I'm OnboardBot, your virtual HR assistant. How can I help you settle in today?" }
    ]);
    setShowMenu(false);
  };

  const handleDownloadSummary = () => {
    const text = messages.map(m => `[${m.sender.toUpperCase()}]: ${m.content}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Onboarding_Chat_Summary.txt";
    a.click();
    setShowMenu(false);
  };

  const [onboardingTasks, setOnboardingTasks] = useState({
    login: true,
    policy: false,
    leave: false,
    it: false,
    doc: false
  });

  const calculateProgress = () => {
    const total = Object.keys(onboardingTasks).length;
    const completed = Object.values(onboardingTasks).filter(v => v).length;
    return Math.round((completed / total) * 100);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : language === "de" ? "de-DE" : "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>?/gm, ''));
    window.speechSynthesis.speak(utterance);
  };

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
          message: messageText,
          persona: persona,
          language: language
        })
      });

      if (!response.ok) throw new Error("Server communication failed.");

      const data = await response.json();
      
      // Update Onboarding Progress checklist
      if (messageText.startsWith("ACTION:SUBMIT_LEAVE|")) {
        setOnboardingTasks(prev => ({ ...prev, leave: true }));
      } else if (messageText.startsWith("ACTION:SUBMIT_IT|")) {
        setOnboardingTasks(prev => ({ ...prev, it: true }));
      } else if (messageText.startsWith("ACTION:SUBMIT_DOC|")) {
        setOnboardingTasks(prev => ({ ...prev, doc: true }));
      } else if (!messageText.toLowerCase().includes("request leave") && !messageText.toLowerCase().includes("it help")) {
        setOnboardingTasks(prev => ({ ...prev, policy: true }));
      }
      
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
    <div className={`flex h-screen w-full relative z-10 p-4 gap-4 max-w-[1600px] mx-auto overflow-hidden transition-colors duration-500 ${isDarkMode ? "mesh-bg" : "liquid-light-bg text-slate-900 font-sans"}`}>
      
      {/* Left Sidebar (Glass Panel) */}
      <aside className={`hidden md:flex flex-col w-[25%] max-w-[320px] rounded-3xl shadow-2xl relative overflow-hidden p-6 transition-colors duration-500 ${isDarkMode ? "glass-panel" : "liquid-glass-panel"}`}>
        
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

        {/* Onboarding Progress Gauge */}
        <div className="pt-5 border-b border-white/10 pb-5 text-left flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] font-mono tracking-widest text-secondary uppercase font-bold">Onboarding Completion</h3>
            <span className="text-xs font-bold text-secondary font-mono px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20 glow-badge-success">{calculateProgress()}%</span>
          </div>

          <div className="flex items-center gap-4 bg-black/30 p-3 rounded-xl border border-white/10 shadow-inner">
            {/* SVG Circular Progress Ring */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary transition-all duration-700 ease-out"
                  strokeDasharray={`${calculateProgress()}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-bold text-white">{calculateProgress()}%</span>
            </div>

            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="text-xs font-semibold text-white truncate">Milestone Tracker</span>
              <span className="text-[10px] text-on-surface-variant font-mono">
                {Object.values(onboardingTasks).filter(v => v).length} of {Object.keys(onboardingTasks).length} tasks completed
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-1.5 text-xs pt-1">
            <li className="flex items-center gap-2 text-on-surface-variant">
              <ShieldCheck className={`w-3.5 h-3.5 ${onboardingTasks.login ? "text-green-400" : "text-white/20"}`} />
              <span className={onboardingTasks.login ? "line-through opacity-60" : "text-white/80"}>Workspace Registration</span>
            </li>
            <li className="flex items-center gap-2 text-on-surface-variant">
              <ShieldCheck className={`w-3.5 h-3.5 ${onboardingTasks.policy ? "text-green-400" : "text-white/20"}`} />
              <span className={onboardingTasks.policy ? "line-through opacity-60" : "text-white/80"}>Ask Policy Question</span>
            </li>
            <li className="flex items-center gap-2 text-on-surface-variant">
              <ShieldCheck className={`w-3.5 h-3.5 ${onboardingTasks.leave ? "text-green-400" : "text-white/20"}`} />
              <span className={onboardingTasks.leave ? "line-through opacity-60" : "text-white/80"}>Leave Request</span>
            </li>
            <li className="flex items-center gap-2 text-on-surface-variant">
              <ShieldCheck className={`w-3.5 h-3.5 ${onboardingTasks.it ? "text-green-400" : "text-white/20"}`} />
              <span className={onboardingTasks.it ? "line-through opacity-60" : "text-white/80"}>IT Provisioning</span>
            </li>
            <li className="flex items-center gap-2 text-on-surface-variant">
              <ShieldCheck className={`w-3.5 h-3.5 ${onboardingTasks.doc ? "text-green-400" : "text-white/20"}`} />
              <span className={onboardingTasks.doc ? "line-through opacity-60" : "text-white/80"}>Document Upload</span>
            </li>
          </ul>
        </div>

        {/* Quick Actions with 3D Card Hover */}
        <div className="pt-4 flex-1 text-left">
          <h3 className="text-[11px] font-mono tracking-widest text-tertiary mb-3 uppercase font-bold">Quick Actions</h3>
          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => sendMessage("I would like to request leave")}
              disabled={isLoading || !!pendingApprovalId}
              className="glass-card-hover flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface hover:bg-white/10 transition-all duration-200 group w-full text-left disabled:opacity-50"
            >
              <div className="p-1.5 rounded-lg bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">Request Leave</span>
            </button>
            <button 
              onClick={() => sendMessage("I need help setting up my software accounts")}
              disabled={isLoading || !!pendingApprovalId}
              className="glass-card-hover flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface hover:bg-white/10 transition-all duration-200 group w-full text-left disabled:opacity-50"
            >
              <div className="p-1.5 rounded-lg bg-secondary/20 text-secondary group-hover:scale-110 transition-transform">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">IT Help</span>
            </button>
            <button 
              onClick={() => setMessages(prev => [...prev, { sender: "knowledge_rag", content: "WIDGET:DOCUMENT_UPLOAD" }])}
              disabled={isLoading || !!pendingApprovalId}
              className="glass-card-hover flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface hover:bg-white/10 transition-all duration-200 group w-full text-left disabled:opacity-50"
            >
              <div className="p-1.5 rounded-lg bg-tertiary/20 text-tertiary group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">Documents</span>
            </button>
            <button 
              onClick={() => setMessages(prev => [...prev, { sender: "it_provisioner", content: "WIDGET:HARDWARE_ORDER" }])}
              disabled={isLoading || !!pendingApprovalId}
              className="glass-card-hover flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface hover:bg-white/10 transition-all duration-200 group w-full text-left disabled:opacity-50"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">Hardware Order</span>
            </button>
            <button 
              onClick={() => setMessages(prev => [...prev, { sender: "knowledge_rag", content: "WIDGET:E_SIGNATURE" }])}
              disabled={isLoading || !!pendingApprovalId}
              className="glass-card-hover flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface hover:bg-white/10 transition-all duration-200 group w-full text-left disabled:opacity-50"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <PenTool className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">Sign Policy</span>
            </button>
            <button 
              onClick={() => setMessages(prev => [...prev, { sender: "knowledge_rag", content: "WIDGET:PEER_MENTOR" }])}
              disabled={isLoading || !!pendingApprovalId}
              className="glass-card-hover flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface hover:bg-white/10 transition-all duration-200 group w-full text-left disabled:opacity-50"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">Peer Mentor</span>
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
      <main className={`flex-1 flex flex-col rounded-3xl shadow-2xl relative overflow-hidden h-full transition-colors duration-500 ${isDarkMode ? "glass-panel" : "liquid-glass-panel"}`}>
        
        {/* iOS Dynamic Island Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 relative z-40 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-primary tracking-tight font-mono">OnboardBot</span>
          </div>

          {/* Centered Floating Dynamic Island Capsule */}
          <div className="dynamic-island cursor-pointer bg-slate-950/90 text-white border border-white/20 rounded-full px-5 py-2 flex items-center gap-4 shadow-2xl backdrop-blur-xl relative z-50 group hover:px-6 transition-all duration-500">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">AI ACTIVE</span>
            </div>

            <div className="h-3.5 w-px bg-white/20"></div>

            {/* Live Equalizer Waves when AI is thinking */}
            {isLoading ? (
              <div className="flex items-center gap-1">
                <span className="soundwave-bar"></span>
                <span className="soundwave-bar"></span>
                <span className="soundwave-bar"></span>
                <span className="soundwave-bar"></span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-xs font-mono text-white/90">{calculateProgress()}% Onboarded</span>
              </div>
            )}

            {/* Dynamic Island Expansion Content on Hover */}
            <div className="hidden group-hover:flex items-center gap-3 pl-2 border-l border-white/20 animate-fade-in-up">
              <select value={persona} onChange={e => setPersona(e.target.value)} className="bg-transparent text-[11px] font-mono text-sky-300 focus:outline-none cursor-pointer">
                <option value="professional" className="bg-slate-900 text-white">Professional HR</option>
                <option value="tech_mentor" className="bg-slate-900 text-white">Tech Mentor</option>
                <option value="executive" className="bg-slate-900 text-white">Executive Guide</option>
              </select>

              <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-transparent text-[11px] font-mono text-emerald-300 focus:outline-none cursor-pointer">
                <option value="en" className="bg-slate-900 text-white">EN</option>
                <option value="es" className="bg-slate-900 text-white">ES</option>
                <option value="fr" className="bg-slate-900 text-white">FR</option>
                <option value="de" className="bg-slate-900 text-white">DE</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Light / Dark Mode Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to liquidGlass Light Mode" : "Switch to Deep Obsidian Dark Mode"}
              className="p-2 rounded-full hover:bg-white/10 text-on-surface-variant transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-sky-500" />}
            </button>

            {/* Header Sign Out Button */}
            <button 
              onClick={onLogout} 
              title="Sign Out to switch account" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold text-red-300 transition-all cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> 
              <span>Sign Out</span>
            </button>

            {/* Functional Three Dots Menu Button */}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-white/10 text-on-surface-variant transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Three Dots Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 glass-panel bg-slate-900/95 border border-white/15 rounded-xl shadow-2xl py-2 z-50 animate-fade-in-up text-left">
                  <button 
                    onClick={() => { setIsDarkMode(!isDarkMode); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-xs text-on-surface hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-secondary" />}
                    <span>{isDarkMode ? "Switch to liquidGlass Light" : "Switch to Deep Obsidian Dark"}</span>
                  </button>

                  <button 
                    onClick={handleClearChat}
                    className="w-full px-4 py-2 text-xs text-on-surface hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-primary" />
                    <span>Clear Chat History</span>
                  </button>

                  <button 
                    onClick={handleDownloadSummary}
                    className="w-full px-4 py-2 text-xs text-on-surface hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-secondary" />
                    <span>Export Chat Log</span>
                  </button>

                  <button 
                    onClick={() => { setMessages(prev => [...prev, { sender: "knowledge_rag", content: "WIDGET:PEER_MENTOR" }]); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-xs text-on-surface hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                  >
                    <Headphones className="w-4 h-4 text-tertiary" />
                    <span>HR Support Hotdesk</span>
                  </button>

                  <div className="my-1 border-t border-white/10"></div>

                  <button 
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-xs text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
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
                    {msg.content.startsWith("ACTION:SUBMIT_LEAVE|") || msg.content.startsWith("ACTION:SUBMIT_IT|") || msg.content.startsWith("ACTION:SUBMIT_DOC|") ? (
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
                    ) : msg.content === "WIDGET:IT_PROVISION_FORM" ? (
                      <ITProvisioningWidget 
                        onSubmit={sendMessage} 
                        disabled={isLoading || !!pendingApprovalId || i !== messages.length - 1} 
                      />
                    ) : msg.content === "WIDGET:HARDWARE_ORDER" ? (
                      <HardwareProcurementWidget 
                        onSubmit={sendMessage} 
                        disabled={isLoading || !!pendingApprovalId || i !== messages.length - 1} 
                      />
                    ) : msg.content === "WIDGET:E_SIGNATURE" ? (
                      <ESignatureWidget 
                        onSubmit={sendMessage} 
                        disabled={isLoading || !!pendingApprovalId || i !== messages.length - 1} 
                      />
                    ) : msg.content === "WIDGET:PEER_MENTOR" ? (
                      <PeerMentorCard />
                    ) : msg.content === "WIDGET:DOCUMENT_UPLOAD" ? (
                      <DocumentUploadWidget 
                        onUpload={sendMessage} 
                        disabled={isLoading || !!pendingApprovalId || i !== messages.length - 1} 
                      />
                    ) : msg.content.startsWith("ACTION:SUBMIT_HARDWARE|") ? (
                      <div className="px-5 py-3 rounded-2xl rounded-tl-sm glass-panel text-white/50 shadow-lg text-sm italic md:text-[15px] leading-relaxed text-left">
                        [Hardware Procurement Order Submitted]
                      </div>
                    ) : msg.content.startsWith("ACTION:SUBMIT_SIGNATURE|") ? (
                      <div className="px-5 py-3 rounded-2xl rounded-tl-sm glass-panel text-white/50 shadow-lg text-sm italic md:text-[15px] leading-relaxed text-left">
                        [Digital Signature Recorded]
                      </div>
                    ) : msg.content.startsWith("ACTION:SUBMIT_LEAVE|") ? (
                      <div className="px-5 py-3 rounded-2xl rounded-tl-sm glass-panel text-white/50 shadow-lg text-sm italic md:text-[15px] leading-relaxed text-left">
                        [Leave Request Form Submitted]
                      </div>
                    ) : msg.content.startsWith("ACTION:SUBMIT_IT|") ? (
                      <div className="px-5 py-3 rounded-2xl rounded-tl-sm glass-panel text-white/50 shadow-lg text-sm italic md:text-[15px] leading-relaxed text-left">
                        [IT Provisioning Form Submitted]
                      </div>
                    ) : msg.content.startsWith("ACTION:SUBMIT_DOC|") ? (
                      <div className="px-5 py-3 rounded-2xl rounded-tl-sm glass-panel text-white/50 shadow-lg text-sm italic md:text-[15px] leading-relaxed text-left">
                        [Document Upload Form Submitted]
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
              type="button"
              onClick={handleVoiceInput}
              disabled={isLoading || !!pendingApprovalId}
              title="Voice Input (Speech-to-Text)"
              className={`absolute right-14 bottom-2 w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${
                isListening 
                  ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse" 
                  : "bg-white/5 text-on-surface-variant border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
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
