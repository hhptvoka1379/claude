import { v4 as uuid } from 'uuid';
import { load, save } from './store';

export function seedIfNeeded() {
  if (load('initialized')) return;

  // === SUBJECTS ===
  const subjects = [
    { id: 's-mat', name: 'Matematica', colour: '#c05050', target_grade: 7, weight: 1.5 },
    { id: 's-fis', name: 'Fisica', colour: '#c07a30', target_grade: 7, weight: 1.3 },
    { id: 's-ita', name: 'Italiano', colour: '#6b4f3a', target_grade: 7, weight: 1.2 },
    { id: 's-sto', name: 'Storia', colour: '#4a7c59', target_grade: 7, weight: 1.0 },
    { id: 's-ing', name: 'Inglese', colour: '#3a6b7c', target_grade: 7, weight: 1.0 },
    { id: 's-fil', name: 'Filosofia', colour: '#7c5c9a', target_grade: 7, weight: 1.0 },
    { id: 's-sci', name: 'Scienze', colour: '#4a7a6b', target_grade: 7, weight: 1.0 },
    { id: 's-edf', name: 'Ed. Fisica', colour: '#7c6b3a', target_grade: 7, weight: 1.0 },
  ];

  // === CATEGORIES ===
  const categories = [
    { id: 'c-analisi', subject_id: 's-mat', name: 'Analisi' },
    { id: 'c-geometria', subject_id: 's-mat', name: 'Geometria Analitica' },
    { id: 'c-probabilita', subject_id: 's-mat', name: 'Probabilità e Statistica' },
    { id: 'c-elettromag', subject_id: 's-fis', name: 'Elettromagnetismo' },
    { id: 'c-termodyn', subject_id: 's-fis', name: 'Termodinamica' },
    { id: 'c-meccanica', subject_id: 's-fis', name: 'Meccanica' },
    { id: 'c-letteratura', subject_id: 's-ita', name: 'Letteratura' },
    { id: 'c-produzione', subject_id: 's-ita', name: 'Produzione Scritta' },
    { id: 'c-analisi-testo', subject_id: 's-ita', name: 'Analisi del Testo' },
    { id: 'c-900', subject_id: 's-sto', name: 'Il Novecento' },
    { id: 'c-guerre', subject_id: 's-sto', name: 'Guerre Mondiali' },
    { id: 'c-dopoguerra', subject_id: 's-sto', name: 'Dopoguerra' },
    { id: 'c-eng-lit', subject_id: 's-ing', name: 'Literature' },
    { id: 'c-eng-gram', subject_id: 's-ing', name: 'Grammar' },
    { id: 'c-eng-writ', subject_id: 's-ing', name: 'Writing' },
    { id: 'c-idealismo', subject_id: 's-fil', name: 'Idealismo' },
    { id: 'c-positivismo', subject_id: 's-fil', name: 'Positivismo' },
    { id: 'c-esistenz', subject_id: 's-fil', name: 'Esistenzialismo' },
    { id: 'c-biologia', subject_id: 's-sci', name: 'Biologia' },
    { id: 'c-chimica', subject_id: 's-sci', name: 'Chimica' },
  ];

  // === TOPICS ===
  const topics = [
    // Matematica - Analisi
    { id: 't-limiti', category_id: 'c-analisi', name: 'Limiti e continuità', notes: '', completed: false },
    { id: 't-derivate', category_id: 'c-analisi', name: 'Derivate', notes: '', completed: false },
    { id: 't-integrali', category_id: 'c-analisi', name: 'Integrali definiti', notes: '', completed: false },
    { id: 't-studio-funz', category_id: 'c-analisi', name: 'Studio di funzione', notes: '', completed: false },
    // Matematica - Geometria
    { id: 't-retta', category_id: 'c-geometria', name: 'Retta nel piano', notes: '', completed: false },
    { id: 't-coniche', category_id: 'c-geometria', name: 'Coniche', notes: '', completed: true },
    // Matematica - Probabilità
    { id: 't-prob-base', category_id: 'c-probabilita', name: 'Probabilità classica', notes: '', completed: false },
    // Fisica - Elettromagnetismo
    { id: 't-campo-el', category_id: 'c-elettromag', name: 'Campo elettrico', notes: '', completed: false },
    { id: 't-campo-mag', category_id: 'c-elettromag', name: 'Campo magnetico', notes: '', completed: false },
    { id: 't-induzione', category_id: 'c-elettromag', name: 'Induzione elettromagnetica', notes: '', completed: false },
    { id: 't-maxwell', category_id: 'c-elettromag', name: 'Equazioni di Maxwell', notes: '', completed: false },
    // Fisica - Termodinamica
    { id: 't-principi', category_id: 'c-termodyn', name: 'Principi della termodinamica', notes: '', completed: true },
    { id: 't-gas', category_id: 'c-termodyn', name: 'Gas ideali', notes: '', completed: false },
    // Fisica - Meccanica
    { id: 't-newton', category_id: 'c-meccanica', name: 'Leggi di Newton', notes: '', completed: true },
    { id: 't-energia', category_id: 'c-meccanica', name: 'Energia e lavoro', notes: '', completed: true },
    // Italiano - Letteratura
    { id: 't-pirandello', category_id: 'c-letteratura', name: 'Pirandello', notes: '', completed: false },
    { id: 't-svevo', category_id: 'c-letteratura', name: 'Svevo', notes: '', completed: false },
    { id: 't-ungaretti', category_id: 'c-letteratura', name: 'Ungaretti', notes: '', completed: false },
    { id: 't-montale', category_id: 'c-letteratura', name: 'Montale', notes: '', completed: true },
    { id: 't-leopardi', category_id: 'c-letteratura', name: 'Leopardi', notes: '', completed: true },
    // Italiano - Produzione
    { id: 't-tipo-a', category_id: 'c-produzione', name: 'Tipo A — Analisi del testo', notes: '', completed: false },
    { id: 't-tipo-b', category_id: 'c-produzione', name: 'Tipo B — Argomentativo', notes: '', completed: false },
    { id: 't-tipo-c', category_id: 'c-produzione', name: 'Tipo C — Riflessione critica', notes: '', completed: false },
    // Storia
    { id: 't-ww1', category_id: 'c-guerre', name: 'Prima guerra mondiale', notes: '', completed: true },
    { id: 't-ww2', category_id: 'c-guerre', name: 'Seconda guerra mondiale', notes: '', completed: false },
    { id: 't-fascismo', category_id: 'c-900', name: 'Fascismo', notes: '', completed: false },
    { id: 't-resistenza', category_id: 'c-dopoguerra', name: 'Resistenza e Repubblica', notes: '', completed: false },
    // Inglese
    { id: 't-joyce', category_id: 'c-eng-lit', name: 'James Joyce', notes: '', completed: false },
    { id: 't-orwell', category_id: 'c-eng-lit', name: 'George Orwell', notes: '', completed: true },
    // Filosofia
    { id: 't-hegel', category_id: 'c-idealismo', name: 'Hegel', notes: '', completed: false },
    { id: 't-comte', category_id: 'c-positivismo', name: 'Comte', notes: '', completed: false },
    { id: 't-sartre', category_id: 'c-esistenz', name: 'Sartre', notes: '', completed: false },
    { id: 't-heidegger', category_id: 'c-esistenz', name: 'Heidegger', notes: '', completed: false },
  ];

  // === SAMPLE EXERCISES ===
  const exercises = [
    {
      id: uuid(), topic_ids: ['t-integrali'], date: '2026-04-03',
      duration_min: 45, outcome: 'correct', score: 8, max_score: 10,
      title: 'Integrali definiti — esercizi 1-5', notes: 'Buoni risultati su integrali per parti',
      confab_flagged: false, confab_reason: '',
    },
    {
      id: uuid(), topic_ids: ['t-derivate', 't-studio-funz'], date: '2026-04-02',
      duration_min: 60, outcome: 'partial', score: 6, max_score: 10,
      title: 'Studio di funzione completo', notes: 'Errori su asintoti obliqui',
      confab_flagged: true, confab_reason: 'Risposta data con certezza ma formula asintoto obliquo errata',
    },
    {
      id: uuid(), topic_ids: ['t-campo-el'], date: '2026-04-01',
      duration_min: 30, outcome: 'correct', score: 9, max_score: 10,
      title: 'Campo elettrico — problemi Coulomb', notes: '',
      confab_flagged: false, confab_reason: '',
    },
    {
      id: uuid(), topic_ids: ['t-pirandello'], date: '2026-04-03',
      duration_min: 25, outcome: 'correct', score: 7, max_score: 10,
      title: 'Analisi "Il fu Mattia Pascal"', notes: 'Buona analisi dei temi principali',
      confab_flagged: false, confab_reason: '',
    },
  ];

  // === SAMPLE ESSAYS ===
  const essays = [
    {
      id: uuid(), tipo: 'B', title: 'Il progresso tecnologico e la società',
      date: '2026-04-01', word_count: 720, duration_min: 90,
      grade: 7, feedback: 'Buona struttura argomentativa. Migliorare le transizioni.',
      prompt_text: 'Il progresso tecnologico ha trasformato la società contemporanea...',
      content: '',
    },
    {
      id: uuid(), tipo: 'A', title: 'Analisi — Montale, "Meriggiare pallido e assorto"',
      date: '2026-03-28', word_count: 580, duration_min: 75,
      grade: 7.5, feedback: 'Ottima analisi stilistica. Approfondire il contesto storico.',
      prompt_text: '', content: '',
    },
  ];

  // === SAMPLE SESSIONS ===
  const sessions = [
    {
      id: uuid(), type: 'exercise_set', date: '2026-04-03',
      duration_min: 120, topic_ids: ['t-integrali', 't-derivate'],
      count: 12, notes: 'Sessione intensa su analisi', xp: 60,
    },
    {
      id: uuid(), type: 'essay_draft', date: '2026-04-01',
      duration_min: 90, topic_ids: ['t-tipo-b'],
      count: 1, notes: 'Tema argomentativo sul progresso', xp: 45,
    },
    {
      id: uuid(), type: 'reading', date: '2026-04-02',
      duration_min: 45, topic_ids: ['t-pirandello', 't-svevo'],
      count: null, notes: 'Lettura capitoli su Pirandello e Svevo', xp: 22,
    },
    {
      id: uuid(), type: 'exercise_set', date: '2026-04-04',
      duration_min: 60, topic_ids: ['t-campo-el', 't-campo-mag'],
      count: 8, notes: 'Problemi elettromagnetismo', xp: 30,
    },
  ];

  // === GRADES ===
  const grades = [
    { id: uuid(), subject_id: 's-mat', value: 5.5, date: '2026-03-15', type: 'written', notes: 'Compito su derivate' },
    { id: uuid(), subject_id: 's-mat', value: 5, date: '2026-02-20', type: 'written', notes: 'Compito su limiti' },
    { id: uuid(), subject_id: 's-fis', value: 6, date: '2026-03-10', type: 'oral', notes: 'Interrogazione termodinamica' },
    { id: uuid(), subject_id: 's-fis', value: 6.5, date: '2026-03-25', type: 'written', notes: 'Compito elettromagnetismo' },
    { id: uuid(), subject_id: 's-ita', value: 7, date: '2026-03-20', type: 'written', notes: 'Tema in classe' },
    { id: uuid(), subject_id: 's-ita', value: 7.5, date: '2026-03-05', type: 'oral', notes: 'Interrogazione Pirandello' },
    { id: uuid(), subject_id: 's-sto', value: 7, date: '2026-03-18', type: 'oral', notes: 'Interrogazione WWII' },
    { id: uuid(), subject_id: 's-ing', value: 8, date: '2026-03-22', type: 'written', notes: 'Reading comprehension' },
    { id: uuid(), subject_id: 's-fil', value: 6.5, date: '2026-03-12', type: 'oral', notes: 'Interrogazione Hegel' },
  ];

  // === PCTO ACTIVITIES ===
  const pcto = [
    {
      id: uuid(), name: 'Oratorio Animator', hours_logged: 80, hours_required: 80,
      status: 'awaiting_certification', contact: 'Don Marco',
      deadline: '2026-04-30', docs: [], pinned: true,
      notes: 'Tutte le ore completate, manca certificazione',
      next_action: 'Submit form to Don Marco',
    },
    {
      id: uuid(), name: 'Mountain Refuge Volunteer — Val d\'Aosta', hours_logged: 40, hours_required: 40,
      status: 'complete', contact: 'Rifugio Ferraro',
      deadline: '', docs: [], pinned: false,
      notes: 'Esperienza estiva 2025', next_action: '',
    },
    {
      id: uuid(), name: 'CAE C1 English Certification', hours_logged: 30, hours_required: 30,
      status: 'complete', contact: 'British Council Milano',
      deadline: '', docs: [], pinned: false,
      notes: 'Certificazione ottenuta dicembre 2025', next_action: '',
    },
    {
      id: uuid(), name: 'Ireland Language Programme', hours_logged: 60, hours_required: 60,
      status: 'complete', contact: 'EF Education',
      deadline: '', docs: [], pinned: false,
      notes: 'Programma linguistico estate 2025', next_action: '',
    },
  ];

  // === JOURNAL ===
  const journal = [
    {
      id: uuid(), date: '2026-04-04',
      text: 'Giornata produttiva. Ho fatto 12 esercizi di analisi e una sessione di lettura. Mi sento più preparato sugli integrali ma gli asintoti obliqui mi danno ancora problemi. Domani devo concentrarmi su fisica.',
      mood: 4, energy: 4, sleep: 3,
    },
  ];

  // === AGENDA TASKS ===
  const agenda = [
    { id: uuid(), date: '2026-04-05', text: 'Integrali definiti — 3 esercizi', completed: false, urgent: false },
    { id: uuid(), date: '2026-04-05', text: 'Essay draft: Pirandello (Tipo B)', completed: false, urgent: false },
    { id: uuid(), date: '2026-04-05', text: 'Physics problem set 12', completed: false, urgent: false },
    { id: uuid(), date: '2026-04-05', text: 'Anki review (40 cards)', completed: false, urgent: false },
    { id: uuid(), date: '2026-04-05', text: 'PCTO: certify oratorio hours', completed: false, urgent: true },
  ];

  // === PROMPTS ===
  const prompts = [
    {
      id: uuid(), title: 'Essay Grader — Tipo B',
      category: 'essay', usage_count: 3, last_used: '2026-04-01',
      versions: [{
        id: uuid(), created_at: '2026-03-20T10:00:00Z',
        text: 'Grade the following Italian maturità essay (Tipo B — testo argomentativo) on a scale of 1-10. Evaluate: thesis clarity, argument structure, use of evidence, language quality, and conclusion strength. Provide specific line-level feedback.\n\n[PASTE ESSAY HERE]',
      }],
      results: [],
    },
    {
      id: uuid(), title: 'Anki Card Generator',
      category: 'anki', usage_count: 5, last_used: '2026-04-03',
      versions: [{
        id: uuid(), created_at: '2026-03-15T10:00:00Z',
        text: 'Generate 10 Anki flashcards (front/back format) for the following topic. Make them specific, testable, and avoid yes/no questions. Include one "reversal" card per 3 cards.\n\nTopic: [TOPIC]\nSubject: [SUBJECT]',
      }],
      results: [],
    },
  ];

  // === GAME STATE ===
  const gameState = {
    pagine: 157,
    streak_days: 4,
    last_activity_date: '2026-04-04',
    capitoli: [
      { id: 'cap-montale', name: 'Montale Completato', topic_id: 't-montale', earned_at: '2026-03-25' },
      { id: 'cap-newton', name: 'Newton Completato', topic_id: 't-newton', earned_at: '2026-03-10' },
    ],
    passe: [
      { id: 'pass-first-essay', name: 'Primo Tema', description: 'Completed first essay', earned_at: '2026-03-28' },
    ],
  };

  // === SETTINGS ===
  const settings = {
    font_scale: 1,
    exam_date: '2026-06-18',
    gamification_enabled: true,
  };

  // Save all
  save('subjects', subjects);
  save('categories', categories);
  save('topics', topics);
  save('exercises', exercises);
  save('essays', essays);
  save('sessions', sessions);
  save('grades', grades);
  save('pcto', pcto);
  save('journal', journal);
  save('agenda', agenda);
  save('prompts', prompts);
  save('gameState', gameState);
  save('settings', settings);
  save('initialized', true);
}
