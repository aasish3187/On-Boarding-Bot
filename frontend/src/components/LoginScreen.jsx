import React, { useState, useEffect, useRef } from "react";
import { ToyBrick, User, Shield, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginScreen({ onLoginSuccess }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [role, setRole] = useState("employee"); // 'employee' or 'hr'
  const [username, setUsername] = useState("test_user@luminasystems.com");
  const [password, setPassword] = useState("SecurePassword123");
  const [name, setName] = useState("Alice Developer");
  const [department, setDepartment] = useState("Engineering");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canvasRef = useRef(null);

  // WebGL Shader Animation Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    let animationFrameId;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
        vec2 uv = v_texCoord;
        float t = u_time * 0.15;
        
        vec3 color1 = vec3(0.01, 0.08, 0.15); // Deep navy
        vec3 color2 = vec3(0.04, 0.11, 0.21); // Deep slate
        vec3 color3 = vec3(0.08, 0.15, 0.27); // Subtle indigo
        vec3 color4 = vec3(0.02, 0.05, 0.12); // Near black navy
        
        float n1 = sin(uv.x * 2.0 + t) * 0.5 + 0.5;
        float n2 = cos(uv.y * 3.0 - t * 0.8) * 0.5 + 0.5;
        float n3 = sin((uv.x + uv.y) * 1.5 + t * 0.5) * 0.5 + 0.5;
        
        vec3 finalColor = mix(color1, color2, n1);
        finalColor = mix(finalColor, color3, n2 * 0.5);
        finalColor = mix(finalColor, color4, n3 * 0.3);
        
        float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
        finalColor += grain * 0.01;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const compileShader = (source, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const program = gl.createProgram();
    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Shader link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resLoc = gl.getUniformLocation(program, "u_resolution");

    const resize = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }
    };

    const render = (time) => {
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      if (isLoginTab) {
        // Handle Login
        const res = await fetch("http://localhost:8000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: username,
            password: password,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Invalid credentials.");
        }

        const data = await res.json();
        
        // Handle success and pass data up
        onLoginSuccess({
          token: data.access_token,
          id: data.id,
          name: data.name,
          role: data.role || role, // Fallback to selected role
        });
      } else {
        // Handle Signup
        const res = await fetch("http://localhost:8000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: username,
            password: password,
            name: name,
            role: role,
            department: department,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Sign up failed.");
        }

        // Auto-login after signup
        const loginRes = await fetch("http://localhost:8000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: username,
            password: password,
          }),
        });

        if (!loginRes.ok) {
          throw new Error("Signup succeeded but auto-login failed. Please try logging in.");
        }

        const loginData = await loginRes.json();
        onLoginSuccess({
          token: loginData.access_token,
          id: loginData.id,
          name: loginData.name,
          role: loginData.role || role,
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Background WebGL Shader */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-80"
      />

      {/* Auth Card */}
      <main className="relative z-10 w-full max-w-[480px] px-6">
        <div className="bg-[#031427]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col gap-6 relative">
          <div className="absolute inset-0 border-t border-l border-white/20 rounded-2xl pointer-events-none"></div>

          {/* Title Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2.5 mb-1">
              <ToyBrick className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight text-primary font-sans">OnboardBot</h1>
            </div>
            <p className="text-xs text-on-surface-variant">Secure Enterprise Authentication</p>
          </div>

          {/* Form Selector Tabs */}
          <div className="flex p-1 bg-black/30 rounded-full border border-white/10">
            <button
              onClick={() => {
                setIsLoginTab(true);
                setErrorMsg("");
              }}
              className={`flex-1 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                isLoginTab
                  ? "bg-white/15 text-white shadow-md"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLoginTab(false);
                setErrorMsg("");
              }}
              className={`flex-1 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                !isLoginTab
                  ? "bg-white/15 text-white shadow-md"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Display error message */}
            {errorMsg && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Role Switcher */}
            <div>
              <label className="block text-[11px] font-mono tracking-widest uppercase text-on-surface-variant mb-2 ml-1">
                Select Workspace Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setRole("employee")}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                    role === "employee"
                      ? "border-primary bg-primary/10"
                      : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"
                  }`}
                >
                  <User className={`w-7 h-7 ${role === "employee" ? "text-primary" : "text-on-surface-variant"}`} />
                  <span className={`text-xs font-semibold ${role === "employee" ? "text-primary" : "text-on-surface-variant"}`}>
                    Employee
                  </span>
                </div>

                <div
                  onClick={() => setRole("hr")}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                    role === "hr"
                      ? "border-primary bg-primary/10"
                      : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"
                  }`}
                >
                  <Shield className={`w-7 h-7 ${role === "hr" ? "text-primary" : "text-on-surface-variant"}`} />
                  <span className={`text-xs font-semibold ${role === "hr" ? "text-primary" : "text-on-surface-variant"}`}>
                    HR Manager
                  </span>
                </div>
              </div>
            </div>

            {/* Name input (only for Sign Up) */}
            {!isLoginTab && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alice Developer"
                    className="w-full bg-black/20 border border-white/25 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-black/30 backdrop-blur-md text-on-surface rounded-xl py-3 px-4 transition-all placeholder:text-on-surface-variant/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant ml-1">Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Engineering"
                    className="w-full bg-black/20 border border-white/25 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-black/30 backdrop-blur-md text-on-surface rounded-xl py-3 px-4 transition-all placeholder:text-on-surface-variant/40"
                  />
                </div>
              </>
            )}

            {/* Username/Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant ml-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="test_user@luminasystems.com"
                className="w-full bg-black/20 border border-white/25 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-black/30 backdrop-blur-md text-on-surface rounded-xl py-3 px-4 transition-all placeholder:text-on-surface-variant/40"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Password</label>
                <a href="#" className="text-[10px] font-mono uppercase text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-black/20 border border-white/25 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-black/30 backdrop-blur-md text-on-surface rounded-xl py-3 pl-4 pr-10 transition-all placeholder:text-on-surface-variant/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-primary-container text-white py-4 rounded-xl font-bold hover:brightness-110 shadow-[0_0_15px_rgba(91,107,160,0.35)] transition-all active:scale-[0.98] border border-white/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? "Validating Credentials..." : isLoginTab ? "Enter Workspace" : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
