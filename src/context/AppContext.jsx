import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { load, save } from '../data/store';
import { seedIfNeeded } from '../data/seed';

const AppContext = createContext(null);

const DEFAULT_SETTINGS = {
  font_scale: 1,
  exam_date: '2026-06-18',
  gamification_enabled: true,
};

export function AppProvider({ children }) {
  // Initialize seed data on first load
  useState(() => seedIfNeeded());

  const [subjects, setSubjects] = useState(() => load('subjects') || []);
  const [categories, setCategories] = useState(() => load('categories') || []);
  const [topics, setTopics] = useState(() => load('topics') || []);
  const [settings, setSettings] = useState(() => load('settings') || DEFAULT_SETTINGS);
  const [gameState, setGameState] = useState(() => load('gameState') || {
    pagine: 0, streak_days: 0, last_activity_date: null, capitoli: [], passe: [],
  });

  // Persist on change
  useEffect(() => { save('subjects', subjects); }, [subjects]);
  useEffect(() => { save('categories', categories); }, [categories]);
  useEffect(() => { save('topics', topics); }, [topics]);
  useEffect(() => { save('settings', settings); }, [settings]);
  useEffect(() => { save('gameState', gameState); }, [gameState]);

  // Apply font scale
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', settings.font_scale);
  }, [settings.font_scale]);

  const updateSettings = useCallback((patch) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const addSubject = useCallback((subject) => {
    setSubjects(prev => [...prev, subject]);
  }, []);

  const updateSubject = useCallback((id, patch) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }, []);

  const removeSubject = useCallback((id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  }, []);

  const addCategory = useCallback((cat) => {
    setCategories(prev => [...prev, cat]);
  }, []);

  const updateCategory = useCallback((id, patch) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  }, []);

  const removeCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setTopics(prev => prev.filter(t => t.category_id !== id));
  }, []);

  const addTopic = useCallback((topic) => {
    setTopics(prev => [...prev, topic]);
  }, []);

  const updateTopic = useCallback((id, patch) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);

  const removeTopic = useCallback((id) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  }, []);

  const addXP = useCallback((amount) => {
    setGameState(prev => {
      const today = new Date().toISOString().split('T')[0];
      const isConsecutive = prev.last_activity_date &&
        (new Date(today) - new Date(prev.last_activity_date)) <= 86400000 * 1.5;
      return {
        ...prev,
        pagine: prev.pagine + amount,
        streak_days: prev.last_activity_date === today
          ? prev.streak_days
          : (isConsecutive ? prev.streak_days + 1 : 1),
        last_activity_date: today,
      };
    });
  }, []);

  const value = {
    subjects, categories, topics, settings, gameState,
    addSubject, updateSubject, removeSubject,
    addCategory, updateCategory, removeCategory,
    addTopic, updateTopic, removeTopic,
    updateSettings, addXP, setGameState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
