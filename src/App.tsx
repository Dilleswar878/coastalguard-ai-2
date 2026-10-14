import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';
import { ReportResultPage } from './pages/ReportResultPage';
import { MapPage } from './pages/MapPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { AdminPage } from './pages/AdminPage';
import { RewardsPage } from './pages/RewardsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { incidentService } from './services/incidentStorage';
import { Incident } from './types/incident';

const AppContent: React.FC = () => {
  const { isCRTActive } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [navigationState, setNavigationState] = useState<Record<string, unknown>>({});
  const [incidents, setIncidents] = useState<Incident[]>(() => incidentService.getAll());

  // Subscribe to storage changes across components and browser storage
  useEffect(() => {
    const unsub = incidentService.subscribe(() => {
      setIncidents(incidentService.getAll());
    });
    return unsub;
  }, []);

  // Listen to popstate for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, state?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    if (state) {
      setNavigationState(state);
    } else {
      setNavigationState({});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    setIncidents(incidentService.getAll());
  };

  // Route matching
  let pageContent: React.ReactNode;

  if (currentPath === '/') {
    pageContent = <HomePage onNavigate={navigate} incidents={incidents} />;
  } else if (currentPath === '/report') {
    pageContent = <ReportPage onNavigate={navigate} />;
  } else if (currentPath === '/report/result') {
    const passedIncident = (navigationState.incident as Incident) || incidents[0] || null;
    pageContent = <ReportResultPage incident={passedIncident} onNavigate={navigate} />;
  } else if (currentPath === '/map') {
    pageContent = <MapPage incidents={incidents} onNavigate={navigate} />;
  } else if (currentPath === '/dashboard') {
    pageContent = <DashboardPage incidents={incidents} onNavigate={navigate} />;
  } else if (currentPath.startsWith('/report/')) {
    const id = currentPath.replace('/report/', '');
    pageContent = <IncidentDetailPage incidentId={id} onNavigate={navigate} />;
  } else if (currentPath === '/admin') {
    pageContent = <AdminPage incidents={incidents} onNavigate={navigate} onRefresh={handleRefresh} />;
  } else if (currentPath === '/rewards') {
    pageContent = <RewardsPage incidents={incidents} onNavigate={navigate} />;
  } else if (currentPath === '/login') {
    pageContent = <LoginPage onNavigate={navigate} />;
  } else if (currentPath === '/register') {
    pageContent = <RegisterPage onNavigate={navigate} />;
  } else if (currentPath === '/about') {
    pageContent = <AboutPage onNavigate={navigate} />;
  } else {
    pageContent = <NotFoundPage onNavigate={navigate} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#030a16] text-[#e2f1f8] selection:bg-cyan-500 selection:text-black">
      {/* CRT Scanline Glitch Overlay */}
      {isCRTActive && (
        <div className="fixed inset-0 crt-overlay z-40 pointer-events-none" />
      )}

      {/* Primary Navigation */}
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      {/* Main Page Body */}
      <main className="flex-1 w-full" id="main-content">
        {pageContent}
      </main>

      {/* Accessible Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
