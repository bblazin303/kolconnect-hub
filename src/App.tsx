import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import KOLProfile from "./pages/KOLProfile";
import JobBoard from "./pages/JobBoard";
import PostJob from "./pages/PostJob";
import Leaderboard from "./pages/Leaderboard";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HowItWorks from "./pages/HowItWorks";
import KOLDashboard from "./pages/dashboard/KOLDashboard";
import ProjectDashboard from "./pages/dashboard/ProjectDashboard";
import Messages from "./pages/dashboard/Messages";
import Applications from "./pages/dashboard/Applications";
import Analytics from "./pages/dashboard/Analytics";
import Profile from "./pages/dashboard/Profile";
import KOLDirectoryRealUsers from "./pages/KOLDirectoryRealUsers";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider delayDuration={0}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/kols" element={<KOLDirectoryRealUsers />} />
              <Route path="/kols/:kolId" element={<KOLProfile />} />
              <Route path="/jobs" element={<JobBoard />} />
              <Route path="/jobs/post" element={<PostJob />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/dashboard/kol" element={<KOLDashboard />} />
              <Route path="/dashboard/kol/messages" element={<Messages />} />
              <Route path="/dashboard/kol/applications" element={<Applications />} />
              <Route path="/dashboard/kol/analytics" element={<Analytics />} />
              <Route path="/dashboard/kol/profile" element={<Profile />} />
              <Route path="/dashboard/project" element={<ProjectDashboard />} />
              <Route path="/dashboard/project/messages" element={<Messages />} />
              <Route path="/dashboard/project/applications" element={<Applications />} />
              <Route path="/dashboard/project/analytics" element={<Analytics />} />
              <Route path="/dashboard/project/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;