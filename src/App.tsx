import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MatchSquad from "@/pages/MatchSquad";
import AdminFixtures from "@/pages/admin/AdminFixtures";
import AdminLiveMatch from "@/pages/admin/AdminLiveMatch";
import AdminStandings from "@/pages/admin/AdminStandings";
import AdminLogin from "@/pages/admin/AdminLogin";
import { AdminAuthGuard } from "@/lib/admin-auth-guard";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/match/:id" component={MatchSquad} />
      <Route path="/fifaOwner/login" component={AdminLogin} />
      <Route path="/fifaOwner">
        <AdminAuthGuard>
          <AdminFixtures />
        </AdminAuthGuard>
      </Route>
      <Route path="/fifaOwner/standings">
        <AdminAuthGuard>
          <AdminStandings />
        </AdminAuthGuard>
      </Route>
      <Route path="/fifaOwner/match/:id">
        <AdminAuthGuard>
          <AdminLiveMatch />
        </AdminAuthGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
