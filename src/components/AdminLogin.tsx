import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function AdminLogin() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("email", email.trim());
      formData.set("password", password);
      formData.set("flow", flow);
      await signIn("password", formData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (/sign-up is disabled/i.test(msg)) {
        setError("Sign-up is disabled — this email is not the configured admin.");
      } else if (/invalid/i.test(msg)) {
        setError("Invalid credentials.");
      } else {
        setError(flow === "signIn" ? "Could not sign in." : "Could not sign up.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-display text-gold mb-2">Rushes</h1>
        <p className="text-ink-muted text-sm tracking-widest uppercase">Admin Portal</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-bg-card rounded-xl shadow-neu-flat p-8 flex flex-col gap-5"
      >
        <div>
          <label className="block text-xs uppercase tracking-widest text-ink-muted mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-bg-elevated border border-ink-faint rounded-lg px-4 py-3 text-ink focus:border-gold transition-colors shadow-neu-inset"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-ink-muted mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-bg-elevated border border-ink-faint rounded-lg px-4 py-3 text-ink focus:border-gold transition-colors shadow-neu-inset"
            required
            minLength={8}
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-3 rounded-lg bg-gold text-bg font-semibold tracking-wide hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-gold-glow"
        >
          {loading ? "Working…" : flow === "signIn" ? "Sign in" : "Create admin"}
        </button>

        <button
          type="button"
          onClick={() => {
            setFlow(flow === "signIn" ? "signUp" : "signIn");
            setError("");
          }}
          className="text-xs text-ink-muted hover:text-gold transition-colors"
        >
          {flow === "signIn"
            ? "First-time setup? Create the admin account."
            : "Already set up? Sign in."}
        </button>
      </form>
    </div>
  );
}
