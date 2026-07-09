import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAdminSession } from "@/hooks/useAdminSession";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAdminSession();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/fifaOwner/login");
    }
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <div className="w-full min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}