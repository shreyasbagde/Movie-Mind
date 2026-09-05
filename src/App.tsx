import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { AiAdvisorModal } from './components/AiAdvisorModal';

// Pages
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetails } from './pages/MovieDetails';
import { Recommendations } from './pages/Recommendations';
import { Favorites } from './pages/Favorites';
import { Analytics } from './pages/Analytics';
import { About } from './pages/About';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#050505] text-gray-100 selection:bg-red-600 selection:text-white relative">
          {/* Subtle ambient light glows for frosted glass reflection */}
          <div className="fixed top-[-150px] left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[128px] pointer-events-none -z-10" />
          <div className="fixed bottom-[-150px] right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none -z-10" />

          {/* Top Sticky Navigation */}
          <Navbar />

          {/* Main Route Content */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />

          {/* Interactive Modals and Toasts */}
          <AiAdvisorModal />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
