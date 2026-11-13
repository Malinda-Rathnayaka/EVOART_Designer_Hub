import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { AlertCircle } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  /* ------------------------- Particle ring canvas ------------------------- */
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let rafId;
    let particles = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.36;

      particles = Array.from({ length: 220 }, (_, i) => ({
        angle: (i / 220) * Math.PI * 2,
        baseAngle: (i / 220) * Math.PI * 2,
        radius: radius + (Math.random() - 0.5) * 50,
        size: Math.random() * 1.6 + 0.4,
        speed: (Math.random() - 0.5) * 0.0005,
        opacity: Math.random() * 0.5 + 0.12,
        phase: Math.random() * Math.PI * 2,
        cx,
        cy,
      }));
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        p.angle += p.speed;
        const pulse = Math.sin(Date.now() * 0.0007 + p.phase) * 3;
        const r = p.radius + pulse;
        const x = p.cx + Math.cos(p.angle) * r;
        const y = p.cy + Math.sin(p.angle) * r;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(175, 160, 255, ${p.opacity})`;
        ctx.fill();
      });

      rafId = requestAnimationFrame(draw);
    };

    resize();
    rafId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    return initParticles();
  }, [initParticles]);

  /* ----------------------------- Submit handler ---------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your email/username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <main data-theme="dark" className="relative min-h-screen w-full flex bg-[#080910] text-white overflow-hidden">
        {/* ---------------------- MikeAndrewDesigner login styles (90% transparent) ---------------------- */}
        <style>{`
        .ui-login {
          width: 380px;
          min-height: 440px;
          /* 90% transparent: rgba(44,44,44,0.1) */
          background: rgba(44, 44, 44, 0.1);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          padding: 47px 42px 46px;
          color: #fff;
          border-radius: 17px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
          font-size: 1.15em;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          position: relative;
        }

        .ui-login input[type="email"],
        .ui-login input[type="text"],
        .ui-login input[type="password"] {
          opacity: 1;
          display: block;
          border: 1px solid rgba(255, 255, 255, 0.08);
          outline: none;
          width: 100%;
          padding: 13px 18px;
          margin: 20px 0 0 0;
          font-size: 0.8em;
          border-radius: 100px;
          background: rgba(60, 60, 60, 0.12);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: #fff;
          transition: background 0.3s ease, box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .ui-login input[type="email"]::placeholder,
        .ui-login input[type="text"]::placeholder,
        .ui-login input[type="password"]::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .ui-login input:focus {
          animation: ui-bounce 1s;
          -webkit-appearance: none;
          background: rgba(60, 60, 60, 0.28);
          border-color: rgba(91, 66, 243, 0.45);
          box-shadow: 0 0 0 3px rgba(91, 66, 243, 0.14);
        }

        .ui-login input[type="submit"],
        .ui-login .ui-h1 {
          border: 0;
          outline: 0;
          width: 100%;
          padding: 13px;
          margin: 40px 0 0 0;
          border-radius: 500px;
          font-weight: 600;
          animation: ui-bounce2 1.6s;
        }

        .ui-h1 {
          padding: 0;
          position: relative;
          top: -35px;
          display: block;
          margin-bottom: -10px;
          font-size: 1.3em;
        }

        .ui-btn {
          background: linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb);
          color: #fff;
          padding: 16px !important;
          cursor: pointer;
          transition: all 0.4s ease;
          box-shadow: 0 8px 28px rgba(91, 66, 243, 0.3);
        }

        .ui-btn:hover {
          background: linear-gradient(144deg, #1e1e1e, 20%, #1e1e1e 50%, #1e1e1e);
          color: rgb(255, 255, 255);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
        }

        .ui-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ui-login input[type=email],
        .ui-login input[type=text] {
          animation: ui-bounce 1s;
          -webkit-appearance: none;
        }

        .ui-login input[type=password] {
          animation: ui-bounce1 1.3s;
        }

        .ui-span {
          font-weight: bolder;
          background: -webkit-linear-gradient(#b563ff, #535efc, #0ec8ee);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          border-bottom: 4px solid transparent;
          border-image: linear-gradient(0.25turn, #535efc, #0ec8ee, #0ec8ee);
          border-image-slice: 1;
          display: inline;
        }

        @media only screen and (max-width: 600px) {
          .ui-login {
            width: 100%;
            padding: 2.5em 1.8em;
          }
        }

        @keyframes ui-bounce {
          0% {
            transform: translateY(-250px);
            opacity: 0;
          }
        }

        @keyframes ui-bounce1 {
          0% { opacity: 0; }
          40% {
            transform: translateY(-100px);
            opacity: 0;
          }
        }

        @keyframes ui-bounce2 {
          0% { opacity: 0; }
          70% {
            transform: translateY(-20px);
            opacity: 0;
          }
        }
      `}</style>

        {/* ================= SHARED FULL-SCREEN BACKGROUND ================= */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[700px] h-[700px] rounded-full bg-indigo-600/[0.14] blur-[160px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-purple-600/[0.13] blur-[170px]" />
          <div className="absolute top-[30%] right-[30%] w-[500px] h-[500px] rounded-full bg-fuchsia-600/[0.06] blur-[150px]" />
        </div>

        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none opacity-60"
        />

        {/* ========================= SPLIT LAYOUT (no divider) ========================= */}

        {/* LEFT PANEL */}
        <section className="relative hidden lg:flex w-1/2 min-h-screen flex-col items-center justify-center overflow-hidden">
          <div className="relative z-10 max-w-lg px-12">
            <div className="flex items-center gap-2 mb-16">
              <span className="text-2xl font-bold tracking-[0.15em]">EVO</span>
              <span className="text-2xl font-light tracking-[0.15em] text-indigo-300">
                ART
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-1" />
            </div>

            <span className="text-[10px] uppercase tracking-[0.35em] text-indigo-300 font-semibold">
              Creative Intelligence
            </span>

            <h1 className="mt-7 text-6xl xl:text-7xl leading-[1.05] font-semibold tracking-[-0.045em]">
              Create
              <br />
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                without limits.
              </span>
            </h1>

            <p className="mt-8 text-base text-white/45 leading-8 max-w-md">
              Strategy, creativity, technology and business intelligence —
              bringing ambitious ideas to life. Your next chapter starts here.
            </p>

            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
              {[
                ["1000+", "Brands launched"],
                ["2030", "Project vision"],
                ["04", "Divisions"],
              ].map(([number, label]) => (
                <div key={label}>
                  <p className="text-3xl font-semibold tracking-tight">{number}</p>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-white/35">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-20 text-[10px] tracking-[0.25em] uppercase text-white/25">
              Think forward · Create differently
            </p>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="relative flex-1 min-h-screen flex items-center justify-center px-6 py-16 sm:px-12">
          <div className="relative z-10 w-full max-w-[480px] flex flex-col items-center">
            <div className="lg:hidden mb-10 self-start">
              <span className="text-xl font-bold tracking-[0.15em]">EVO</span>
              <span className="text-xl font-light tracking-[0.15em] text-indigo-300">
                {" "}ART
              </span>
            </div>

            <div className="mb-8 flex items-center gap-2">
              <span className="w-7 h-px bg-indigo-400" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-indigo-300">
                Client portal
              </span>
              <span className="w-7 h-px bg-indigo-400" />
            </div>

            {/* ==================== 90% TRANSPARENT MIKEANDREWDESIGNER FORM ==================== */}
            <div className="ui-login">
              <form onSubmit={handleSubmit}>
                <h1 className="ui-h1">
                  Welcome to <span className="ui-span">EVO ART</span>
                </h1>

                {error && (
                  <div
                    style={{
                      padding: "0.6rem 0.85rem",
                      borderRadius: "12px",
                      background: "rgba(244, 63, 94, 0.16)",
                      border: "1px solid rgba(244, 63, 94, 0.35)",
                      color: "#fb7185",
                      fontSize: "0.78rem",
                      marginBottom: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      textAlign: "left",
                      lineHeight: 1.3,
                    }}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <input
                  type="text"
                  name="email"
                  placeholder="Email or Username"
                  required
                  autoComplete="username"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                />

                <input
                  type="submit"
                  value={loading ? "Signing In..." : "Sign In"}
                  className="ui-btn"
                  disabled={loading}
                />
              </form>
            </div>
            {/* ================== END 90% TRANSPARENT FORM ================== */}

            <p className="mt-10 text-center text-[9px] uppercase tracking-[0.2em] text-white/20">
              Secure access · EVO ART
            </p>
          </div>
        </section>
      </main>
      );
}