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

const LeaveRequestWidget = ({ onSubmit, disabled, isDarkMode }) => {
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
    <div className={`rounded-2xl p-5 shadow-lg w-full min-w-[300px] max-w-sm flex flex-col gap-4 animate-fade-in-up border ${
      isDarkMode ? "bg-slate-900/90 border-sky-500/30 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
    }`}>
      <h3 className={`font-bold flex items-center gap-2 text-sm ${isDarkMode ? "text-sky-400" : "text-sky-700"}`}>
        <Calendar className="w-4 h-4"/> Request Leave
      </h3>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <label className={`text-[11px] font-mono uppercase block mb-1 font-bold ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
            disabled={disabled} 
            className={`w-full rounded-lg p-2 text-sm border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
              isDarkMode ? "bg-slate-950 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900 font-semibold"
            }`}
          />
        </div>
        <div className="flex-1">
          <label className={`text-[11px] font-mono uppercase block mb-1 font-bold ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>End Date</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
            disabled={disabled} 
            className={`w-full rounded-lg p-2 text-sm border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
              isDarkMode ? "bg-slate-950 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900 font-semibold"
            }`}
          />
        </div>
      </div>
      
      {days > 0 && <p className="text-xs text-emerald-600 font-mono font-bold">Total Duration: {days} day(s)</p>}
      
      <div>
        <label className={`text-[11px] font-mono uppercase block mb-1 font-bold ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>Reason for leave</label>
        <textarea 
          value={reason} onChange={e => setReason(e.target.value)} disabled={disabled}
          placeholder="e.g. Family vacation" 
          className={`w-full rounded-lg p-2.5 text-sm border focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none h-20 ${
            isDarkMode ? "bg-slate-950 border-white/20 text-white placeholder:text-slate-500" : "bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-500 font-semibold"
          }`}
        />
      </div>
      
      <button 
        onClick={handleSubmit} 
        disabled={disabled || days <= 0 || !reason}
        className="mt-1 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md active:scale-95 cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4"/> Submit to HR
      </button>
    </div>
  );
};

const ITProvisioningWidget = ({ onSubmit, disabled, isDarkMode }) => {
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
    <div className={`rounded-2xl p-5 shadow-lg w-full min-w-[300px] max-w-sm flex flex-col gap-4 animate-fade-in-up border ${
      isDarkMode ? "bg-slate-900/90 border-sky-500/30 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
    }`}>
      <h3 className={`font-bold flex items-center gap-2 text-sm ${isDarkMode ? "text-sky-400" : "text-sky-700"}`}>
        <LifeBuoy className="w-4 h-4"/> IT Account Provisioning
      </h3>
      <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-700 font-medium"}`}>Select the software tools and developer environments you need access to:</p>
      
      <div className="flex flex-col gap-2">
        {toolsList.map((tool) => (
          <label key={tool} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all text-xs font-bold ${
            isDarkMode ? "bg-black/20 hover:bg-white/10 border-white/10 text-white" : "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900"
          }`}>
            <input 
              type="checkbox" 
              checked={selectedTools.includes(tool)} 
              onChange={() => handleToggle(tool)}
              disabled={disabled}
              className="rounded border-slate-400 text-sky-600 focus:ring-0 w-4 h-4"
            />
            <span>{tool}</span>
          </label>
        ))}
      </div>
      
      <button 
        onClick={handleSubmit} 
        disabled={disabled || selectedTools.length === 0}
        className="mt-1 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md active:scale-95 cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4"/> Request Access
      </button>
    </div>
  );
};

const DocumentUploadWidget = ({ onUpload, disabled, isDarkMode }) => {
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
    <div className={`rounded-2xl p-5 shadow-lg w-full min-w-[300px] max-w-sm flex flex-col gap-4 animate-fade-in-up border ${
      isDarkMode ? "bg-slate-900/90 border-sky-500/30 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
    }`}>
      <h3 className={`font-bold flex items-center gap-2 text-sm ${isDarkMode ? "text-sky-400" : "text-sky-700"}`}>
        <FileText className="w-4 h-4"/> Document Upload Portal
      </h3>
      
      {success ? (
        <div className="flex flex-col items-center gap-2 text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
          <p className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Upload Successful!</p>
          <p className={`text-[11px] font-mono truncate w-full px-4 ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>{file?.name}</p>
        </div>
      ) : (
        <>
          <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-700 font-medium"}`}>
            Select and upload your signed contract or government-issued ID card:
          </p>
          <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 ${
            isDarkMode ? "border-white/20 bg-black/25 text-white" : "border-slate-300 bg-slate-50 text-slate-800"
          }`}>
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              disabled={disabled || isUploading}
              onChange={e => setFile(e.target.files[0])}
            />
            <label htmlFor="file-upload" className={`cursor-pointer border px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              isDarkMode ? "bg-white/10 border-white/20 hover:bg-white/20 text-white" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-900 shadow-sm"
            }`}>
              {file ? "Change File" : "Choose File"}
            </label>
            {file && <p className="text-xs text-emerald-600 font-mono mt-1 text-center truncate w-full px-4 font-bold">{file.name}</p>}
          </div>
          
          <button 
            onClick={handleUpload} 
            disabled={disabled || !file || isUploading}
            className="mt-1 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md active:scale-95 cursor-pointer"
          >
            {isUploading ? "Uploading..." : "Upload Document"}
          </button>
        </>
      )}
    </div>
  );
};

const HardwareProcurementWidget = ({ onSubmit, disabled, isDarkMode }) => {
  const [laptop, setLaptop] = useState("MacBook Pro M3 Max (32GB)");
  const [monitors, setMonitors] = useState("Dual 27-inch 4K Displays");
  const [peripherals, setPeripherals] = useState("Ergonomic Keyboard & Precision Mouse");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit(`ACTION:SUBMIT_HARDWARE|Laptop:${laptop}|Monitors:${monitors}|Peripherals:${peripherals}`);
  };

  return (
    <div className={`rounded-2xl p-5 shadow-lg w-full min-w-[300px] max-w-sm flex flex-col gap-4 animate-fade-in-up border ${
      isDarkMode ? "bg-slate-900/90 border-sky-500/30 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
    }`}>
      <h3 className={`font-bold flex items-center gap-2 text-sm ${isDarkMode ? "text-sky-400" : "text-sky-700"}`}>
        <Cpu className="w-4 h-4"/> Hardware Workstation Order
      </h3>
      {submitted ? (
        <div className="flex flex-col items-center gap-2 text-center py-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          <p className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Order Submitted for Approval</p>
          <p className={`text-xs font-mono ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>{laptop}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5 text-left">
            <label className={`text-[10px] font-mono uppercase font-bold ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>Laptop Model</label>
            <select 
              value={laptop} 
              onChange={e => setLaptop(e.target.value)} 
              disabled={disabled} 
              className={`rounded-lg p-2 text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold ${
                isDarkMode ? "bg-slate-950 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900"
              }`}
            >
              <option value="MacBook Pro M3 Max (32GB)" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>MacBook Pro M3 Max (32GB)</option>
              <option value="Dell XPS 15 Touch (64GB)" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Dell XPS 15 Touch (64GB)</option>
              <option value="Lenovo ThinkPad X1 Carbon" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Lenovo ThinkPad X1 Carbon</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className={`text-[10px] font-mono uppercase font-bold ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>Display Options</label>
            <select 
              value={monitors} 
              onChange={e => setMonitors(e.target.value)} 
              disabled={disabled} 
              className={`rounded-lg p-2 text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold ${
                isDarkMode ? "bg-slate-950 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900"
              }`}
            >
              <option value="Dual 27-inch 4K Displays" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Dual 27-inch 4K Displays</option>
              <option value="34-inch Curved UltraWide Monitor" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>34-inch Curved UltraWide Monitor</option>
              <option value="Single 27-inch 4K Display" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Single 27-inch 4K Display</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className={`text-[10px] font-mono uppercase font-bold ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>Accessories</label>
            <select 
              value={peripherals} 
              onChange={e => setPeripherals(e.target.value)} 
              disabled={disabled} 
              className={`rounded-lg p-2 text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold ${
                isDarkMode ? "bg-slate-950 border-white/20 text-white" : "bg-slate-100 border-slate-300 text-slate-900"
              }`}
            >
              <option value="Ergonomic Keyboard & Precision Mouse" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Ergonomic Keyboard & Precision Mouse</option>
              <option value="Noise-Canceling Wireless Headset" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Noise-Canceling Wireless Headset</option>
              <option value="Complete Developer Bundle" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Complete Developer Bundle</option>
            </select>
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={disabled} 
            className="mt-1 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4"/> Submit Hardware Order
          </button>
        </>
      )}
    </div>
  );
};

const ESignatureWidget = ({ onSubmit, disabled, isDarkMode }) => {
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
      ctx.strokeStyle = isDarkMode ? "#38bdf8" : "#0284c7";
      ctx.lineWidth = 2.5;
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
    <div className={`rounded-2xl p-5 shadow-lg w-full min-w-[300px] max-w-sm flex flex-col gap-4 animate-fade-in-up border ${
      isDarkMode ? "bg-slate-900/90 border-sky-500/30 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
    }`}>
      <h3 className={`font-bold flex items-center gap-2 text-sm ${isDarkMode ? "text-sky-400" : "text-sky-700"}`}>
        <PenTool className="w-4 h-4"/> Digital E-Signature Pad
      </h3>
      {submitted ? (
        <div className="flex flex-col items-center gap-2 text-center py-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          <p className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Signature Recorded</p>
          <p className={`text-xs font-mono ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>Employee NDA & Policy Agreement</p>
        </div>
      ) : (
        <>
          <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-700 font-medium"}`}>Draw your digital signature below to execute the onboarding agreements:</p>
          <div className={`border rounded-xl p-1 ${isDarkMode ? "border-white/20 bg-slate-950" : "border-slate-300 bg-slate-100"}`}>
            <canvas 
              ref={canvasRef}
              width={280}
              height={100}
              onMouseDown={handleMouseDown}
              className={`w-full rounded-lg cursor-crosshair ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={clearCanvas} 
              disabled={disabled} 
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                isDarkMode ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
              }`}
            >
              Clear
            </button>
            <button 
              onClick={handleSave} 
              disabled={disabled || !isSigned} 
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-xl text-xs font-bold disabled:opacity-40 shadow-md active:scale-95"
            >
              Confirm Signature
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const PeerMentorCard = ({ isDarkMode }) => (
  <div className={`rounded-2xl p-4 flex items-center gap-3 shadow-lg max-w-sm border ${
    isDarkMode ? "bg-slate-900/90 border-white/15 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
  }`}>
    <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-bold text-sky-600 text-sm font-mono shrink-0">
      DV
    </div>
    <div className="flex-1 text-left">
      <h4 className={`text-xs font-bold leading-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>David Vance</h4>
      <span className="text-[10px] text-sky-600 font-mono font-bold block">Senior Onboarding Buddy</span>
      <span className={`text-[10px] font-mono truncate block ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>d.vance@luminasystems.com</span>
    </div>
    <a 
      href="mailto:d.vance@luminasystems.com" 
      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all shrink-0 ${
        isDarkMode ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100 shadow-sm"
      }`}
    >
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
            <h2 className={`font-bold truncate text-base ${isDarkMode ? "text-white" : "text-slate-900 font-extrabold"}`}>{user?.name || "Alex Vance"}</h2>
            <p className={`text-xs truncate capitalize ${isDarkMode ? "text-slate-400" : "text-slate-600 font-medium"}`}>{user?.department || "Engineering"} • {user?.role || "Developer"}</p>
          </div>
        </div>

        {/* Onboarding Progress Gauge */}
        <div className={`pt-5 border-b pb-5 text-left flex flex-col gap-3 ${isDarkMode ? "border-white/10" : "border-slate-300"}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-[11px] font-mono tracking-widest uppercase font-bold ${isDarkMode ? "text-sky-400" : "text-sky-700"}`}>Onboarding Completion</h3>
            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${isDarkMode ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold"}`}>{calculateProgress()}%</span>
          </div>

          <div className={`flex items-center gap-4 p-3 rounded-xl border shadow-inner ${isDarkMode ? "bg-black/30 border-white/10" : "bg-white border-slate-300 shadow-sm"}`}>
            {/* SVG Circular Progress Ring */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className={isDarkMode ? "text-white/10" : "text-slate-200"}
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-sky-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${calculateProgress()}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className={`absolute text-[11px] font-mono font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{calculateProgress()}%</span>
            </div>

            <div className="flex flex-col gap-1 overflow-hidden">
              <span className={`text-xs font-bold truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>Milestone Tracker</span>
              <span className={`text-[10px] font-mono ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
                {Object.values(onboardingTasks).filter(v => v).length} of {Object.keys(onboardingTasks).length} tasks completed
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-1.5 text-xs pt-1">
            <li className="flex items-center gap-2">
              <ShieldCheck className={`w-3.5 h-3.5 ${onboardingTasks.login ? "text-emerald-500" : isDarkMode ? "text-white/20" : "text-slate-300"}`} />
              <span className={onboardingTasks.login ? "line-through opacity-60 text-slate-500" : isDarkMode ? "text-white/90" : "text-slate-800 font-semibold"}>Workspace Registration</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className={`w-3.5 h-3.5 ${onboardingTasks.policy ? "text-emerald-500" : isDarkMode ? "text-white/20" : "text-slate-300"}`} />
              <span className={onboardingTasks.policy ? "line-through opacity-60 text-slate-500" : isDarkMode ? "text-white/90" : "text-slate-800 font-semibold"}>Ask Policy Question</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className={`w-3.5 h-3.5 ${onboardingTasks.leave ? "text-emerald-500" : isDarkMode ? "text-white/20" : "text-slate-300"}`} />
              <span className={onboardingTasks.leave ? "line-through opacity-60 text-slate-500" : isDarkMode ? "text-white/90" : "text-slate-800 font-semibold"}>Leave Request</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className={`w-3.5 h-3.5 ${onboardingTasks.it ? "text-emerald-500" : isDarkMode ? "text-white/20" : "text-slate-300"}`} />
              <span className={onboardingTasks.it ? "line-through opacity-60 text-slate-500" : isDarkMode ? "text-white/90" : "text-slate-800 font-semibold"}>IT Provisioning</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className={`w-3.5 h-3.5 ${onboardingTasks.doc ? "text-emerald-500" : isDarkMode ? "text-white/20" : "text-slate-300"}`} />
              <span className={onboardingTasks.doc ? "line-through opacity-60 text-slate-500" : isDarkMode ? "text-white/90" : "text-slate-800 font-semibold"}>Document Upload</span>
            </li>
          </ul>
        </div>

        {/* Quick Actions with 3D Card Hover */}
        <div className="pt-4 flex-1 text-left">
          <h3 className={`text-[11px] font-mono tracking-widest mb-3 uppercase font-bold ${isDarkMode ? "text-sky-400" : "text-sky-700"}`}>Quick Actions</h3>
          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => sendMessage("I would like to request leave")}
              disabled={isLoading || !!pendingApprovalId}
              className={`glass-card-hover flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 group w-full text-left disabled:opacity-50 ${
                isDarkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-300 text-slate-900 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-600 group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Request Leave</span>
            </button>
            <button 
              onClick={() => sendMessage("I need help setting up my software accounts")}
              disabled={isLoading || !!pendingApprovalId}
              className={`glass-card-hover flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 group w-full text-left disabled:opacity-50 ${
                isDarkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-300 text-slate-900 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 group-hover:scale-110 transition-transform">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>IT Help</span>
            </button>
            <button 
              onClick={() => setMessages(prev => [...prev, { sender: "knowledge_rag", content: "WIDGET:DOCUMENT_UPLOAD" }])}
              disabled={isLoading || !!pendingApprovalId}
              className={`glass-card-hover flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 group w-full text-left disabled:opacity-50 ${
                isDarkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-300 text-slate-900 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Documents</span>
            </button>
            <button 
              onClick={() => setMessages(prev => [...prev, { sender: "it_provisioner", content: "WIDGET:HARDWARE_ORDER" }])}
              disabled={isLoading || !!pendingApprovalId}
              className={`glass-card-hover flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 group w-full text-left disabled:opacity-50 ${
                isDarkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-300 text-slate-900 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-600 group-hover:scale-110 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Hardware Order</span>
            </button>
            <button 
              onClick={() => setMessages(prev => [...prev, { sender: "knowledge_rag", content: "WIDGET:E_SIGNATURE" }])}
              disabled={isLoading || !!pendingApprovalId}
              className={`glass-card-hover flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 group w-full text-left disabled:opacity-50 ${
                isDarkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-300 text-slate-900 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-600 group-hover:scale-110 transition-transform">
                <PenTool className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Sign Policy</span>
            </button>
            <button 
              onClick={() => setMessages(prev => [...prev, { sender: "knowledge_rag", content: "WIDGET:PEER_MENTOR" }])}
              disabled={isLoading || !!pendingApprovalId}
              className={`glass-card-hover flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 group w-full text-left disabled:opacity-50 ${
                isDarkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-300 text-slate-900 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 group-hover:scale-110 transition-transform">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Peer Mentor</span>
            </button>
          </nav>

          {/* HR Contact Block */}
          <div className={`mt-6 p-4 rounded-xl border text-left ${isDarkMode ? "bg-black/20 border-white/10" : "bg-white border-slate-300 shadow-sm"}`}>
            <h3 className={`text-[10px] font-mono tracking-widest mb-1.5 uppercase font-bold ${isDarkMode ? "text-sky-400" : "text-sky-700"}`}>HR Contact</h3>
            <p className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Sarah Jenkins</p>
            <p className={`text-[11px] mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>s.jenkins@company.com</p>
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
        <header className={`h-16 flex items-center justify-between px-6 border-b transition-colors duration-500 relative z-40 shrink-0 ${isDarkMode ? "border-white/10" : "border-slate-300/70 bg-white/40"}`}>
          <div className="flex items-center gap-3">
            <span className={`font-bold text-lg tracking-tight font-mono ${isDarkMode ? "text-sky-400" : "text-sky-600"}`}>OnboardBot</span>
          </div>

          {/* Centered Floating Dynamic Island Capsule (Combined Hover Morph) */}
          <div className="dynamic-island cursor-pointer bg-slate-950 text-white border border-white/20 rounded-full px-5 py-2 flex items-center gap-3.5 shadow-2xl backdrop-blur-xl relative z-50 group transition-all duration-500 hover:px-6">
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
                <span className="text-xs font-mono font-semibold text-white">{calculateProgress()}% Onboarded</span>
              </div>
            )}

            {/* Combined Expanded Details on Hover */}
            <div className="hidden group-hover:flex items-center gap-3 pl-3 border-l border-white/20 animate-fade-in-up">
              <span className="text-[11px] font-mono text-cyan-300 font-bold">5/5 Milestones</span>
              <div className="h-3 w-px bg-white/20"></div>
              <span className="text-[11px] font-mono text-emerald-300 font-bold">Enterprise Mode</span>
            </div>
          </div>

          {/* Right Control Bar */}
          <div className="flex items-center gap-2.5 relative">
            {/* Persona Selector (Outside) */}
            <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              isDarkMode ? "bg-slate-900/80 border-white/15 text-white" : "bg-white/80 border-slate-300 text-slate-800 shadow-sm"
            }`}>
              <Sparkles className={`w-3.5 h-3.5 ${isDarkMode ? "text-sky-400" : "text-sky-600"}`} />
              <select 
                value={persona} 
                onChange={e => setPersona(e.target.value)} 
                className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                <option value="professional" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Professional HR</option>
                <option value="tech_mentor" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Tech Mentor</option>
                <option value="executive" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Executive Guide</option>
              </select>
            </div>

            {/* Language Selector (Outside) */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              isDarkMode ? "bg-slate-900/80 border-white/15 text-white" : "bg-white/80 border-slate-300 text-slate-800 shadow-sm"
            }`}>
              <span className={`text-[10px] font-mono font-bold uppercase ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>LANG</span>
              <select 
                value={language} 
                onChange={e => setLanguage(e.target.value)} 
                className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                <option value="en" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>English (EN)</option>
                <option value="es" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Español (ES)</option>
                <option value="fr" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Français (FR)</option>
                <option value="de" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Deutsch (DE)</option>
              </select>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to liquidGlass Light Mode" : "Switch to Deep Obsidian Dark Mode"}
              className={`p-2 rounded-xl transition-all border ${
                isDarkMode 
                  ? "bg-slate-900/80 border-white/15 text-yellow-400 hover:bg-white/10" 
                  : "bg-white/80 border-slate-300 text-sky-600 hover:bg-slate-200/60 shadow-sm"
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
            </button>

            {/* Header Sign Out Button */}
            <button 
              onClick={onLogout} 
              title="Sign Out to switch account" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-xs font-semibold text-red-400 hover:text-red-300 transition-all cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> 
              <span>Sign Out</span>
            </button>

            {/* Functional Three Dots Menu Button */}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 rounded-xl transition-all border ${
                  isDarkMode 
                    ? "bg-slate-900/80 border-white/15 text-white hover:bg-white/10" 
                    : "bg-white/80 border-slate-300 text-slate-800 hover:bg-slate-200/60 shadow-sm"
                }`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Three Dots Dropdown Menu */}
              {showMenu && (
                <div className={`absolute right-0 mt-2 w-56 border rounded-xl shadow-2xl py-2 z-50 animate-fade-in-up text-left ${
                  isDarkMode ? "bg-slate-900/95 border-white/15 text-white" : "bg-white/95 border-slate-300 text-slate-800 shadow-xl"
                }`}>
                  <button 
                    onClick={() => { setIsDarkMode(!isDarkMode); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-xs hover:bg-slate-500/10 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
                    <span>{isDarkMode ? "Switch to liquidGlass Light" : "Switch to Deep Obsidian Dark"}</span>
                  </button>

                  <button 
                    onClick={handleClearChat}
                    className="w-full px-4 py-2 text-xs hover:bg-slate-500/10 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4 text-sky-500" />
                    <span>Clear Chat History</span>
                  </button>

                  <button 
                    onClick={handleDownloadSummary}
                    className="w-full px-4 py-2 text-xs hover:bg-slate-500/10 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <Download className="w-4 h-4 text-emerald-500" />
                    <span>Export Chat Log</span>
                  </button>

                  <button 
                    onClick={() => { setMessages(prev => [...prev, { sender: "knowledge_rag", content: "WIDGET:PEER_MENTOR" }]); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-xs hover:bg-slate-500/10 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <Headphones className="w-4 h-4 text-indigo-500" />
                    <span>HR Support Hotdesk</span>
                  </button>

                  <div className={`my-1 border-t ${isDarkMode ? "border-white/10" : "border-slate-200"}`}></div>

                  <button 
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors font-semibold"
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
                  <div className={`px-5 py-3 rounded-2xl rounded-tr-sm shadow-lg text-white text-sm md:text-[15px] leading-relaxed text-left ${
                    isDarkMode ? "bg-gradient-to-br from-[#1c2e5e] to-[#334576] border border-primary/20" : "bg-sky-600 shadow-md font-medium"
                  }`}>
                    {msg.content.startsWith("ACTION:SUBMIT_LEAVE|") || msg.content.startsWith("ACTION:SUBMIT_IT|") || msg.content.startsWith("ACTION:SUBMIT_DOC|") ? (
                      <span className="italic opacity-80">Form Submitted</span>
                    ) : (
                      renderFormattedMessage(msg.content)
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 max-w-[85%] md:max-w-[70%] animate-fade-in-up">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                    isDarkMode ? "bg-black/40 border-primary/30 text-primary" : "bg-sky-100 border-sky-300 text-sky-700 shadow-sm"
                  }`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    {msg.content === "WIDGET:LEAVE_FORM" ? (
                      <LeaveRequestWidget 
                        onSubmit={sendMessage} 
                        disabled={isLoading || !!pendingApprovalId || i !== messages.length - 1} 
                        isDarkMode={isDarkMode}
                      />
                    ) : msg.content === "WIDGET:IT_PROVISION_FORM" ? (
                      <ITProvisioningWidget 
                        onSubmit={sendMessage} 
                        disabled={isLoading || !!pendingApprovalId || i !== messages.length - 1} 
                        isDarkMode={isDarkMode}
                      />
                    ) : msg.content === "WIDGET:HARDWARE_ORDER" ? (
                      <HardwareProcurementWidget 
                        onSubmit={sendMessage} 
                        disabled={isLoading || !!pendingApprovalId || i !== messages.length - 1} 
                        isDarkMode={isDarkMode}
                      />
                    ) : msg.content === "WIDGET:E_SIGNATURE" ? (
                      <ESignatureWidget 
                        onSubmit={sendMessage} 
                        disabled={isLoading || !!pendingApprovalId || i !== messages.length - 1} 
                        isDarkMode={isDarkMode}
                      />
                    ) : msg.content === "WIDGET:PEER_MENTOR" ? (
                      <PeerMentorCard isDarkMode={isDarkMode} />
                    ) : msg.content === "WIDGET:DOCUMENT_UPLOAD" ? (
                      <DocumentUploadWidget 
                        onUpload={sendMessage} 
                        disabled={isLoading || !!pendingApprovalId || i !== messages.length - 1} 
                        isDarkMode={isDarkMode}
                      />
                    ) : msg.content.startsWith("ACTION:SUBMIT_HARDWARE|") ? (
                      <div className={`px-5 py-3 rounded-2xl rounded-tl-sm border text-sm italic md:text-[15px] leading-relaxed text-left ${
                        isDarkMode ? "glass-panel text-white/60" : "bg-white border-slate-300 text-slate-600 shadow-sm"
                      }`}>
                        [Hardware Procurement Order Submitted]
                      </div>
                    ) : msg.content.startsWith("ACTION:SUBMIT_SIGNATURE|") ? (
                      <div className={`px-5 py-3 rounded-2xl rounded-tl-sm border text-sm italic md:text-[15px] leading-relaxed text-left ${
                        isDarkMode ? "glass-panel text-white/60" : "bg-white border-slate-300 text-slate-600 shadow-sm"
                      }`}>
                        [Digital Signature Recorded]
                      </div>
                    ) : msg.content.startsWith("ACTION:SUBMIT_LEAVE|") ? (
                      <div className={`px-5 py-3 rounded-2xl rounded-tl-sm border text-sm italic md:text-[15px] leading-relaxed text-left ${
                        isDarkMode ? "glass-panel text-white/60" : "bg-white border-slate-300 text-slate-600 shadow-sm"
                      }`}>
                        [Leave Request Form Submitted]
                      </div>
                    ) : msg.content.startsWith("ACTION:SUBMIT_IT|") ? (
                      <div className={`px-5 py-3 rounded-2xl rounded-tl-sm border text-sm italic md:text-[15px] leading-relaxed text-left ${
                        isDarkMode ? "glass-panel text-white/60" : "bg-white border-slate-300 text-slate-600 shadow-sm"
                      }`}>
                        [IT Provisioning Form Submitted]
                      </div>
                    ) : msg.content.startsWith("ACTION:SUBMIT_DOC|") ? (
                      <div className={`px-5 py-3 rounded-2xl rounded-tl-sm border text-sm italic md:text-[15px] leading-relaxed text-left ${
                        isDarkMode ? "glass-panel text-white/60" : "bg-white border-slate-300 text-slate-600 shadow-sm"
                      }`}>
                        [Document Upload Form Submitted]
                      </div>
                    ) : (
                      <div className={`px-5 py-3 rounded-2xl rounded-tl-sm border shadow-lg text-sm md:text-[15px] leading-relaxed text-left ${
                        isDarkMode ? "glass-panel text-white" : "bg-white border-slate-300 text-slate-900 font-medium shadow-md"
                      }`}>
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
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                  isDarkMode ? "bg-black/40 border-primary/30 text-primary" : "bg-sky-100 border-sky-300 text-sky-700 shadow-sm"
                }`}>
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className={`px-5 py-3 rounded-2xl rounded-tl-sm border flex items-center gap-2 ${
                  isDarkMode ? "glass-panel text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
                }`}>
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
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
                    : isDarkMode
                    ? "border-secondary/30 bg-black/30 shadow-[0_0_15px_rgba(41,161,149,0.15)] animate-subtle-pulse"
                    : "border-sky-300 bg-sky-50 shadow-md"
                }`}>
                  <div className="flex items-center gap-3">
                    {approvalStatus === "approved" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : approvalStatus === "rejected" ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-sky-600 animate-pulse" />
                    )}
                    <span className={`text-xs font-bold ${
                      approvalStatus === "approved" 
                        ? "text-green-600" 
                        : approvalStatus === "rejected"
                        ? "text-red-600" 
                        : isDarkMode ? "text-sky-300" : "text-sky-800"
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
                      className="bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
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
        <div className={`p-6 pt-4 shrink-0 transition-colors duration-500 ${
          isDarkMode ? "bg-gradient-to-t from-surface via-surface/90 to-transparent" : "bg-gradient-to-t from-white via-white/95 to-transparent"
        }`}>
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
              className={`w-full border rounded-2xl py-3 pl-4 pr-24 resize-none max-h-32 focus:outline-none transition-all duration-300 ${
                isDarkMode 
                  ? "bg-black/40 border-white/10 text-white placeholder:text-slate-400 focus:ring-sky-500 focus:bg-black/60" 
                  : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 font-semibold shadow-md focus:ring-sky-600 focus:border-sky-500"
              }`}
            />
            <button 
              type="button"
              onClick={handleVoiceInput}
              disabled={isLoading || !!pendingApprovalId}
              title="Voice Input (Speech-to-Text)"
              className={`absolute right-14 bottom-2.5 w-9 h-9 rounded-xl border transition-all flex items-center justify-center ${
                isListening 
                  ? "bg-red-500/20 text-red-500 border-red-500/40 animate-pulse" 
                  : isDarkMode
                  ? "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 shadow-sm"
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button 
              type="submit"
              disabled={isLoading || !!pendingApprovalId || !input.trim()}
              className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-xl bg-sky-600 text-white hover:bg-sky-500 transition-colors flex items-center justify-center shadow-md active:scale-95 group disabled:opacity-40 disabled:pointer-events-none"
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
