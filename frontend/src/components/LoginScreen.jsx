import React, { useState, useEffect, useRef } from "react";
import { ToyBrick, User, Shield, Eye, EyeOff, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../config";

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
        v_texCoord.y = 1.0 - v_texCoord.y;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;

      #define PI 3.14159265359

      // Subtle noise for organic motion
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        
        // Fluid, slow-moving mesh gradient
        float t = u_time * 0.015;
        
        // Dynamic centers with different frequency and radius
        vec2 c1 = vec2(0.5 + 0.35 * sin(t * 1.3), 0.5 + 0.35 * cos(t * 0.8));
        vec2 c2 = vec2(0.5 + 0.35 * cos(t * 0.9 + 2.0), 0.5 + 0.35 * sin(t * 1.4));
        vec2 c3 = vec2(0.3 + 0.25 * sin(t * 1.7 - 1.0), 0.7 + 0.25 * cos(t * 1.1));
        
        float d1 = length(uv - c1);
        float d2 = length(uv - c2);
        float d3 = length(uv - c3);
        
        // Smooth noise modifications
        float n1 = noise(uv * 3.0 + t);
        float n2 = noise(uv * 4.0 - t * 0.5);
        
        d1 += n1 * 0.08;
        d2 += n2 * 0.08;
        
        // Base background (Deep Dark Navy)
        vec3 color = vec3(0.03, 0.05, 0.09);
        
        // Radial colors
        vec3 col1 = vec3(0.05, 0.22, 0.42); // Muted Royal Blue
        vec3 col2 = vec3(0.04, 0.16, 0.32); // Deep Ocean Blue
        vec3 col3 = vec3(0.08, 0.10, 0.18); // Cool Slate Slate
        
        // Blend colors using smooth step
        color = mix(color, col1, smoothstep(0.7, 0.0, d1));
        color = mix(color, col2, smoothstep(0.6, 0.0, d2));
        color = mix(color, col3, smoothstep(0.5, 0.0, d3));
        
        // Add extremely subtle organic light shifts
        color += vec3(noise(uv * 8.0 + t * 2.0)) * 0.008;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function loadShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error: " + gl.getProgramInfoLog(program));
      return;
    }

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    function resizeCanvasToDisplaySize(canvas) {
      const width  = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        return true;
      }
      return false;
    }

    let startTime = Date.now();

    function render() {
      resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(timeUniformLocation, (Date.now() - startTime) / 1000);
      gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      if (isLoginTab) {
        // Handle Login
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
        const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
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
        const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
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
