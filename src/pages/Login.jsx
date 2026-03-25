import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Bike, Users, Map, Trophy, Calendar } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Sign up fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await base44.auth.signInWithGoogle();
      // Google OAuth redirects to Google — page unloads, so no navigate needed
    } catch (err) {
      setError(err?.message || "Google sign-in failed. Try again.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await base44.auth.resetPassword(email);
      setSuccessMessage("Password reset link sent! Check your email inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (isSignUp) {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          setLoading(false);
          return;
        }
        const result = await base44.auth.signUp(email, password);
        // If Supabase requires email confirmation, user won't have a session yet
        if (result?.user && !result.session) {
          setSuccessMessage("Account created! Check your email to confirm your address, then sign in.");
        } else {
          setSuccessMessage("Account created! You can now sign in.");
        }
        setIsSignUp(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        const result = await base44.auth.signInWithEmail(email, password);
        // signInWithPassword returns { user, session } on success
        // Wait a tick for onAuthStateChange to fire and update context
        if (result?.session) {
          // Small delay so AuthContext picks up the SIGNED_IN event
          await new Promise((resolve) => setTimeout(resolve, 300));
          navigate("/");
        } else {
          setError("Sign in failed — no session returned. Check your email for a confirmation link.");
        }
      }
    } catch (err) {
      const msg = err?.message || err?.error_description || String(err);
      if (msg.includes("Invalid login credentials")) {
        setError("Invalid email or password. Double-check your credentials or create a new account.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Your email isn't confirmed yet. Check your inbox for the confirmation link.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--cy-bg)] flex overflow-hidden">
      {/* LEFT SIDE — Branding & Value Props */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background — gradient fallback, override in CMS site settings */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--cy-bg)] via-[var(--cy-bg)]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--cy-bg)] via-transparent to-[var(--cy-bg)]/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <Bike className="w-12 h-12 text-[#ff6b35]" />
            <span className="text-3xl font-black text-[var(--cy-text)] tracking-wider">
              CYBLIME
            </span>
          </div>

          {/* Tagline */}
          <h1 className="text-4xl xl:text-5xl font-black text-[var(--cy-text)] leading-tight mb-4">
            Ride Together.
            <br />
            <span className="text-[#ff6b35]">Grow Together.</span>
          </h1>
          <p className="text-lg text-[var(--cy-text-secondary)] mb-12 max-w-md">
            Join a community that pushes your limits and celebrates every
            milestone on two wheels.
          </p>

          {/* Value props */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-[#ff6b35]" />
              </div>
              <div>
                <p className="text-[var(--cy-text)] font-semibold">Weekly Group Rides</p>
                <p className="text-[var(--cy-text-muted)] text-sm">
                  Events for every skill level, from casual to competitive
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center flex-shrink-0">
                <Map className="w-6 h-6 text-[#ff6b35]" />
              </div>
              <div>
                <p className="text-[var(--cy-text)] font-semibold">Curated Routes</p>
                <p className="text-[var(--cy-text-muted)] text-sm">
                  Discover the best cycling routes in your area
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-[#ff6b35]" />
              </div>
              <div>
                <p className="text-[var(--cy-text)] font-semibold">
                  Challenges & Leaderboards
                </p>
                <p className="text-[var(--cy-text-muted)] text-sm">
                  Compete, earn badges, and track your progress
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-[#ff6b35]" />
              </div>
              <div>
                <p className="text-[var(--cy-text)] font-semibold">Community Forum</p>
                <p className="text-[var(--cy-text-muted)] text-sm">
                  Connect with riders, share tips, and find buddies
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 min-w-0">
        <div className="w-full max-w-md min-w-0">
          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <Bike className="w-10 h-10 text-[#ff6b35]" />
              <span className="text-2xl font-black text-[var(--cy-text)] tracking-wider">
                CYBLIME
              </span>
            </div>
            <p className="text-[var(--cy-text-muted)]">
              Ride Together. Grow Together.
            </p>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--cy-text)] mb-2">
              {isForgotPassword
                ? "Reset Password"
                : isSignUp
                ? "Create Account"
                : "Welcome Back"}
            </h2>
            <p className="text-[var(--cy-text-muted)] text-sm sm:text-base">
              {isForgotPassword
                ? "Enter your email and we'll send you a reset link"
                : isSignUp
                ? "Join the pack — it's free and always will be"
                : "Sign in to access your rides, routes, and community"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
              {successMessage}
            </div>
          )}

          {/* Forgot Password Form */}
          {isForgotPassword ? (
            <>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[var(--cy-bg-elevated)] border border-[var(--cy-border-strong)] rounded-xl text-[var(--cy-text)] placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] transition-colors"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff6b35] hover:bg-[#ff8555] text-white font-bold py-6 text-base rounded-xl uppercase tracking-wide"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <div className="mt-8 pt-6 border-t border-[var(--cy-border-strong)] text-center">
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#ff6b35] font-semibold hover:underline text-sm"
                >
                  ← Back to Sign In
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Google Login */}
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-[var(--cy-bg-card)] text-black hover:bg-gray-100 font-semibold py-6 text-base rounded-xl mb-6"
              >
                <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--cy-border-strong)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[var(--cy-bg)] px-4 text-[var(--cy-text-muted)]">
                    or {isSignUp ? "sign up" : "sign in"} with email
                  </span>
                </div>
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[var(--cy-bg-elevated)] border border-[var(--cy-border-strong)] rounded-xl text-[var(--cy-text)] placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] transition-colors text-sm sm:text-base"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[var(--cy-bg-elevated)] border border-[var(--cy-border-strong)] rounded-xl text-[var(--cy-text)] placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] transition-colors text-sm sm:text-base"
                    />
                  </div>
                )}
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[var(--cy-bg-elevated)] border border-[var(--cy-border-strong)] rounded-xl text-[var(--cy-text)] placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] transition-colors"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-[var(--cy-bg-elevated)] border border-[var(--cy-border-strong)] rounded-xl text-[var(--cy-text)] placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] transition-colors"
                />
                {isSignUp && (
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-[var(--cy-bg-elevated)] border border-[var(--cy-border-strong)] rounded-xl text-[var(--cy-text)] placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] transition-colors"
                  />
                )}

                {isSignUp && (
                  <p className="text-xs text-[var(--cy-text-muted)] leading-relaxed">
                    By signing up, you agree to our{" "}
                    <span className="text-[#ff6b35] cursor-pointer hover:underline">
                      Terms
                    </span>{" "}
                    and{" "}
                    <span className="text-[#ff6b35] cursor-pointer hover:underline">
                      Privacy Policy
                    </span>
                    .
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff6b35] hover:bg-[#ff8555] text-white font-bold py-6 text-base rounded-xl uppercase tracking-wide"
                >
                  {loading
                    ? "Loading..."
                    : isSignUp
                    ? "Sign Up"
                    : "Sign In"}
                </Button>
              </form>

              {/* Forgot password (only on sign-in) */}
              {!isSignUp && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[var(--cy-text-muted)] hover:text-[#ff6b35] text-sm transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Toggle */}
              <div className="mt-8 pt-6 border-t border-[var(--cy-border-strong)] text-center">
                <p className="text-[var(--cy-text-muted)] text-sm mb-3">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </p>
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full py-3 text-[#ff6b35] border border-[#ff6b35]/30 rounded-xl font-bold text-base hover:bg-[#ff6b35]/10 transition-colors uppercase tracking-wide"
                >
                  {isSignUp ? "Sign In Instead" : "Create New Account"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
