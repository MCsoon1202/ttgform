import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Home from "@/pages/home";
import FormsList from "@/pages/forms-list";
import FormDetail from "@/pages/form-detail";
import SearchPage from "@/pages/search-page";
import Admin from "@/pages/admin";
import FormRequestPage from "@/pages/form-request";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/forms" component={FormsList} />
      <Route path="/forms/:slug" component={FormDetail} />
      <Route path="/search" component={SearchPage} />
      <Route path="/form-request" component={FormRequestPage} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Layout() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!isAdmin && <SiteHeader />}
      <main className="flex-1">
        <Router />
      </main>
      {!isAdmin && <SiteFooter />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Layout />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
