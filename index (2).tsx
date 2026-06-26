import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CipherShield Text Pro — Advanced Caesar Cipher Platform" },
      { name: "description", content: "Premium cybersecurity workspace for Caesar Cipher encryption, decryption, brute force and frequency analysis." },
      { property: "og:title", content: "CipherShield Text Pro" },
      { property: "og:description", content: "Advanced Caesar Cipher Encryption & Decryption Platform." },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/login.html");
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#05060d", color: "#e6ecff", fontFamily: "system-ui" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ background: "linear-gradient(120deg,#00e5ff,#a855f7)", WebkitBackgroundClip: "text", color: "transparent" }}>CipherShield Text Pro</h1>
        <p>Loading secure workspace…</p>
        <a href="/login.html" style={{ color: "#00e5ff" }}>Enter →</a>
      </div>
    </div>
  );
}
