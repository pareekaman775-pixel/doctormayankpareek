import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

const API_URL = "http://localhost:5000/api/auth/login";

function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      if (!data.token) {
        throw new Error(
          "Login successful, but authentication token was not received."
        );
      }

      /*
       * IMPORTANT:
       * This key must be exactly the same as the key
       * used inside App.tsx and AdminDashboard.tsx.
       */
      localStorage.setItem(
        "shree_shyam_admin_token",
        data.token
      );

      /*
       * Tell App.tsx that login was successful.
       * App.tsx will immediately render AdminDashboard.
       */
      onLoginSuccess(data.token);
    } catch (error) {
      console.error("Admin login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f9f8] px-4 py-10 text-[#173235]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] border border-[#dfeceb] bg-white p-7 shadow-[0_25px_70px_rgba(20,70,70,0.10)] sm:p-9">

          {/* Logo Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f6668] text-white shadow-lg">
            <Stethoscope
              size={30}
              strokeWidth={1.7}
            />
          </div>

          {/* Heading */}
          <div className="mt-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0f6668]">
              Shree Shyam Dental Care
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
              Admin Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#718687]">
              Sign in to manage patient appointment requests.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-xl border border-[#efcaca] bg-[#fff5f5] px-4 py-3 text-sm font-semibold leading-5 text-[#8c3030]">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleLogin}
            className="mt-7 space-y-5"
          >

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-bold text-[#405e5f]">
                Admin Email
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#849596]"
                  size={18}
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="admin@example.com"
                  autoComplete="username"
                  className="w-full rounded-xl border border-[#d6e5e3] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#0f6668] focus:ring-4 focus:ring-[#0f6668]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-bold text-[#405e5f]">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#849596]"
                  size={18}
                />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#d6e5e3] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#0f6668] focus:ring-4 focus:ring-[#0f6668]/10"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f6668] px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_25px_rgba(15,102,104,0.20)] transition hover:-translate-y-0.5 hover:bg-[#0b5557] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}

              {!loading && (
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          {/* Security Info */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#849596]">
            <ShieldCheck
              size={14}
              className="text-[#0f6668]"
            />

            Authorized clinic staff only
          </div>

          {/* Back */}
          <a
            href="/"
            className="mt-5 block text-center text-sm font-bold text-[#0f6668] hover:underline"
          >
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;