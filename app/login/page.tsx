"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("Klub");
  const [password, setPassword] = useState("1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Login failed");
        setLoading(false);
        return;
      }

      // little "boom" animation time
      await new Promise((r) => setTimeout(r, 600));

      // go to main app
      window.location.href = "/";
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Klub</h1>
        <p className="text-sm text-gray-500 mt-1">
          Prototype login (Klub / 1234)
        </p>

        <form className="mt-6 space-y-4" onSubmit={onLogin}>
          <div>
            <label className="text-sm font-medium">Account</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Klub"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Passcode</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="1234"
              type="password"
            />
          </div>

          {error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : null}

          <button
            className="w-full rounded-xl bg-black text-white py-2 font-medium disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4">
          This is only for prototype. Real app will use real accounts.
        </p>
      </div>
    </div>
  );
}
