import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ContentCreator from "@/pages/content-creator";
import ContentEditor from "@/pages/content-editor";
import ConnectAccounts from "@/pages/connect-accounts";
import Scheduler from "@/pages/scheduler";
import Analytics from "@/pages/analytics";
import AiAssistant from "@/pages/ai-assistant";
import CompetitiveAnalysis from "@/pages/competitive-analysis";
import Web3Integration from "@/pages/web3-integration";
import Translation from "@/pages/translation";
import Sidebar from "@/components/layout/sidebar";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import Header from "@/components/layout/header";
import { useState, Suspense, lazy } from "react";

function Router() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center">Loading...</div>}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/content-creator" component={ContentCreator} />
        <Route path="/content-editor" component={ContentEditor} />
        <Route path="/connect-accounts" component={ConnectAccounts} />
        <Route path="/scheduler" component={Scheduler} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/ai-assistant" component={AiAssistant} />
        <Route path="/competitive-analysis" component={CompetitiveAnalysis} />
        <Route path="/web3-integration" component={Web3Integration} />
        <Route path="/translation" component={Translation} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 overflow-y-auto">
            <Router />
          </div>
        </main>
      </div>
      <Toaster />
      <ScrollToTop />
    </QueryClientProvider>
  );
}

export default App;
