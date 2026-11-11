"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message, website: trap }),
    }).catch(() => null);
    if (response?.ok) {
      setState("sent");
    } else {
      const data = await response?.json().catch(() => null);
      setError(data?.error ?? "Versturen lukt nu niet");
      setState("error");
    }
  }

  if (state === "sent") return <p className="form-ok">Bedankt! Je bericht is verstuurd.</p>;

  return (
    <form onSubmit={send} className="contact-form">
      <label className="field">
        <span>Naam (optioneel)</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" />
      </label>
      <label className="field">
        <span>E-mail (optioneel, als je een antwoord wilt)</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} autoComplete="email" />
      </label>
      <label className="field">
        <span>Bericht</span>
        <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required minLength={5} maxLength={3000} />
      </label>
      <div className="bot-trap" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
      </div>
      {state === "error" ? <p className="form-error">{error}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Versturen…" : "Versturen"}
      </button>
    </form>
  );
}
