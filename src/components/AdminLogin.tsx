import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Props {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const verifyPin = useAction(api.admin.verifyPin);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const ok = await verifyPin({ pin });
      if (ok) {
        onSuccess();
      } else {
        setError("Incorrect PIN. Try again.");
      }
    } catch {
      setError("Something went wrong.");
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
            Admin PIN
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••••"
            className="w-full bg-bg-elevated border border-ink-faint rounded-lg px-4 py-3 text-ink focus:border-gold transition-colors shadow-neu-inset"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !pin}
          className="w-full py-3 rounded-lg bg-gold text-bg font-semibold tracking-wide hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-gold-glow"
        >
          {loading ? "Verifying…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
