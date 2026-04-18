import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Entry from "@/pages/entry";
import UsersPage from "@/pages/users";

// Initialize API client
setBaseUrl(window.location.origin);
setAuthTokenGetter(() => localStorage.getItem("auth_token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("auth_user");
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            return <Redirect to={user.role === "admin" ? "/dashboard" : "/entry"} />;
          } catch (e) {
            return <Redirect to="/login" />;
          }
        }
        return <Redirect to="/login" />;
      }} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/entry" component={Entry} />
      <Route path="/users" component={UsersPage} />
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
