"use client";
import { useEffect } from "react";

export default function GoogleAuthCallback() {
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const idToken = params.get("id_token");

    if (idToken) {
      try {
        const payload = JSON.parse(atob(idToken.split(".")[1]));
        const user = {
          id: payload.sub,
          email: payload.email || "",
          name: payload.name || "",
          picture: payload.picture || "",
          provider: "google" as const,
        };

        if (window.opener) {
          window.opener.postMessage({ type: "google-auth-success", idToken, user }, window.location.origin);
        }
      } catch {
        if (window.opener) {
          window.opener.postMessage({ type: "google-auth-error", error: "Failed to parse auth response" }, window.location.origin);
        }
      }
    } else {
      if (window.opener) {
        window.opener.postMessage({ type: "google-auth-error", error: "No token received" }, window.location.origin);
      }
    }

    window.close();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-500">Completing sign in...</p>
      </div>
    </div>
  );
}
