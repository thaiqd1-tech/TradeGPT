import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/sonner'
import './lib/i18n/config'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import PostAuthRouter from './pages/PostAuthRouter'
import OnboardingCreateWorkspace from './pages/OnboardingCreateWorkspace'
import OnboardingCompanyWebsite from './pages/OnboardingCompanyWebsite'
import OnboardingWorkspaceProfile from './pages/OnboardingWorkspaceProfile'
import AgentChat from './pages/AgentChat'
import AIAgentChat from './pages/AIAgentChat'
import LoginPage from './pages/LoginPage'
import ForgotPassword from './pages/ForgotPassword'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ThemeProvider } from './hooks/useTheme'
import { FolderProvider } from './contexts/FolderContext'
import './App.css'
import ScheduledTasksPage from './pages/ScheduledTasks';
import AgentProfilePage from './pages/AgentProfilePage';


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <FolderProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/features" element={<HomePage />} />
                  <Route path="/pricing" element={<HomePage />} />
                  <Route path="/about" element={<HomePage />} />
                  <Route path="/contact" element={<HomePage />} />
                  <Route path="/demo" element={<HomePage />} />
                  <Route path="/trial" element={<HomePage />} />
                  <Route path="/post-auth" element={
                    <ProtectedRoute>
                      <PostAuthRouter />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/onboarding/create-workspace" element={
                    <ProtectedRoute>
                      <OnboardingCreateWorkspace />
                    </ProtectedRoute>
                  } />
                  <Route path="/onboarding/company-website" element={
                    <ProtectedRoute>
                      <OnboardingCompanyWebsite />
                    </ProtectedRoute>
                  } />
                  <Route path="/onboarding/workspace-profile" element={
                    <ProtectedRoute>
                      <OnboardingWorkspaceProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/agents/:agentId" element={
                    <ProtectedRoute>
                      <AgentChat />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/agents/:agentId/profile" element={
                    <ProtectedRoute>
                      <AgentProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/ai-agents/:agentId" element={
                    <ProtectedRoute>
                      <AIAgentChat />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/scheduled-tasks" element={
                  <ProtectedRoute>
                    <ScheduledTasksPage />
                  </ProtectedRoute>
                } />
                </Routes>
                
                <Toaster />
              </div>
            </BrowserRouter>
          </FolderProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App