import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminSession } from "@/hooks/useAdminSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const { session, loading: sessionLoading } = useAdminSession();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && session) {
      navigate("/fifaOwner");
    }
  }, [sessionLoading, session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate("/fifaOwner");
  }

  return (
    <div className="w-full min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full flex flex-col items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-foreground/10 border border-border flex items-center justify-center">
          <Lock className="w-6 h-6 text-foreground/80" />
        </div>
        <div className="text-center">
          <h1 className="font-barlow text-2xl font-extrabold tracking-wide">
            Match Control
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to manage live matches.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              placeholder="owner@schoolcup.example"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 font-bold tracking-wide"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="text-xs text-muted-foreground underline underline-offset-4"
        >
          Back to public site
        </button>
      </div>
    </div>
  );
}