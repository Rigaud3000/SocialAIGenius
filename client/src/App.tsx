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
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/content-creator" component={ContentCreator} />
      <Route path="/content-editor" component={ContentEditor} />
      <Route path="/connect-accounts" component={ConnectAccounts} />
      <Route path="/scheduler" component={Scheduler} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/ai-assistant" component={AiAssistant} />
      <Route path="/competitive-analysis" component={CompetitiveAnalysis} />
      <Route component={NotFound} />
    </Switch>
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
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
