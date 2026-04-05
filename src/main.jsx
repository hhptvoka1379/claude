import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import App from './App';
import Dashboard from './pages/Dashboard/Dashboard';
import Subjects from './pages/Subjects/Subjects';
import Essays from './pages/Essays/Essays';
import Exercises from './pages/Exercises/Exercises';
import Sessions from './pages/Sessions/Sessions';
import Gamification from './pages/Gamification/Gamification';
import PCTO from './pages/PCTO/PCTO';
import Journal from './pages/Journal/Journal';
import Prompts from './pages/Prompts/Prompts';
import Settings from './pages/Settings/Settings';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="subjects/:topicId" element={<Subjects />} />
            <Route path="essays" element={<Essays />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="gamification" element={<Gamification />} />
            <Route path="pcto" element={<PCTO />} />
            <Route path="journal" element={<Journal />} />
            <Route path="prompts" element={<Prompts />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
);
