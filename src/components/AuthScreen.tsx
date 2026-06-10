"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { RegisterSchema, LoginSchema } from "../lib/validations";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const schema = isSignUp ? RegisterSchema : LoginSchema;
    const validationResult = schema.safeParse({ email, password });

    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((err) => err.message).join(", ");
      setError(errorMsg);
      return;
    }

    const { email: validatedEmail, password: validatedPassword } = validationResult.data;
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: validatedEmail, password: validatedPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong during registration.");
        }

        setSuccessMessage("Registered successfully! Logging you in...");

        // Auto sign in after successful sign up
        const result = await signIn("credentials", {
          email: validatedEmail,
          password: validatedPassword,
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Registration succeeded, but login failed. Please sign in manually.");
        }
      } else {
        // Sign In Flow
        const result = await signIn("credentials", {
          email: validatedEmail,
          password: validatedPassword,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error || "Invalid credentials. Please try again.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 font-sans">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl shadow-black/20 overflow-hidden p-6 sm:p-8 transition-shadow duration-300 hover:shadow-emerald-500/5">
        {/* Custom SVG Logo */}
        <div className="flex flex-col items-center mb-6">
          <svg 
            className="h-16 w-16 mb-2" 
            viewBox="0 0 40 40" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="auth-logo-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <rect x="6" y="24" width="6" height="10" rx="1.5" fill="url(#auth-logo-gradient)" />
            <rect x="16" y="14" width="6" height="20" rx="1.5" fill="url(#auth-logo-gradient)" />
            <rect x="26" y="6" width="6" height="28" rx="1.5" fill="url(#auth-logo-gradient)" />
            <path d="M4 34H36" stroke="url(#auth-logo-gradient)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <h2 className="text-xl font-bold text-slate-100">FinanceTracker</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">Manage your wealth simply</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-surface p-1 rounded-lg mb-6 border border-border">
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
              !isSignUp ? "bg-surface-elevated text-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}
            onClick={() => {
              setIsSignUp(false);
              setError(null);
              setSuccessMessage(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
              isSignUp ? "bg-surface-elevated text-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}
            onClick={() => {
              setIsSignUp(true);
              setError(null);
              setSuccessMessage(null);
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-md font-medium">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-md font-medium">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-3.5 py-2 text-base sm:text-sm bg-surface border border-border rounded-md focus:bg-surface-elevated focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors font-medium text-slate-200 placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2 text-base sm:text-sm bg-surface border border-border rounded-md focus:bg-surface-elevated focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors font-medium text-slate-200 placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isSignUp ? "Registering..." : "Signing in..."}
              </>
            ) : isSignUp ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
          {isSignUp ? "Already have an account?" : "New to FinanceTracker?"}{" "}
          <button
            type="button"
            className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold transition-colors"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccessMessage(null);
            }}
          >
            {isSignUp ? "Sign in instead" : "Create one now"}
          </button>
        </p>
      </div>
    </div>
  );
}
