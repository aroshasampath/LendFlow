import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { StatusPage } from './pages/StatusPage';
import { ResponsiveDesignShowcase } from './pages/ResponsiveDesignShowcase';

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/responsive-qa" element={<ResponsiveDesignShowcase />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/status" element={<StatusPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
