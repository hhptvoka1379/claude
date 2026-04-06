import { v4 as uuid } from 'uuid';

export function createSubject(overrides = {}) {
  return {
    id: uuid(),
    name: '',
    colour: '#6b4f3a',
    target_grade: 7,
    weight: 1.0,
    ...overrides,
  };
}

export function createCategory(overrides = {}) {
  return {
    id: uuid(),
    subject_id: '',
    name: '',
    ...overrides,
  };
}

export function createTopic(overrides = {}) {
  return {
    id: uuid(),
    category_id: '',
    name: '',
    notes: '',
    completed: false,
    ...overrides,
  };
}

export function createExercise(overrides = {}) {
  return {
    id: uuid(),
    topic_ids: [],
    date: new Date().toISOString().split('T')[0],
    duration_min: null,
    outcome: 'correct', // correct | incorrect | partial
    score: null,
    max_score: null,
    title: '',
    notes: '',
    confab_flagged: false,
    confab_reason: '',
    ...overrides,
  };
}

export function createEssay(overrides = {}) {
  return {
    id: uuid(),
    tipo: 'A', // A | B | C
    title: '',
    date: new Date().toISOString().split('T')[0],
    word_count: null,
    duration_min: null,
    grade: null,
    feedback: '',
    prompt_text: '',
    content: '',
    ...overrides,
  };
}

export function createSession(overrides = {}) {
  return {
    id: uuid(),
    type: 'exercise_set',
    date: new Date().toISOString().split('T')[0],
    duration_min: 0,
    topic_ids: [],
    count: null,
    notes: '',
    xp: 0,
    ...overrides,
  };
}

export function createGrade(overrides = {}) {
  return {
    id: uuid(),
    subject_id: '',
    value: null,
    date: new Date().toISOString().split('T')[0],
    type: 'written', // oral | written | test
    notes: '',
    ...overrides,
  };
}

export function createPCTOActivity(overrides = {}) {
  return {
    id: uuid(),
    name: '',
    hours_logged: 0,
    hours_required: 0,
    status: 'pending', // pending | in_progress | awaiting_certification | complete
    contact: '',
    deadline: '',
    docs: [],
    notes: '',
    next_action: '',
    pinned: false,
    ...overrides,
  };
}

export function createJournalEntry(overrides = {}) {
  return {
    id: uuid(),
    date: new Date().toISOString().split('T')[0],
    text: '',
    mood: 3,
    energy: 3,
    sleep: 3,
    ...overrides,
  };
}

export function createPrompt(overrides = {}) {
  return {
    id: uuid(),
    title: '',
    category: 'other', // essay | anki | grammar | review | other
    versions: [{
      id: uuid(),
      text: '',
      created_at: new Date().toISOString(),
    }],
    results: [],
    usage_count: 0,
    last_used: null,
    ...overrides,
  };
}

export function createAgendaTask(overrides = {}) {
  return {
    id: uuid(),
    date: new Date().toISOString().split('T')[0],
    text: '',
    completed: false,
    urgent: false,
    ...overrides,
  };
}

export const SESSION_TYPES = [
  { value: 'exercise_set', label: 'Exercise Set' },
  { value: 'essay_draft', label: 'Essay Draft' },
  { value: 'reading', label: 'Reading / Theory' },
  { value: 'anki_review', label: 'Anki Review' },
  { value: 'problem_solving', label: 'Problem Solving' },
  { value: 'mock_exam', label: 'Mock Exam' },
  { value: 'other', label: 'Other' },
];

export const PROMPT_CATEGORIES = [
  { value: 'essay', label: 'Essay' },
  { value: 'anki', label: 'Anki' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'review', label: 'Review' },
  { value: 'other', label: 'Other' },
];

export const PCTO_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'awaiting_certification', label: 'Awaiting Certification' },
  { value: 'complete', label: 'Complete' },
];

export const EVENT_TYPES = [
  { value: 'study', label: 'Study' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'essay', label: 'Essay' },
  { value: 'pcto', label: 'PCTO' },
  { value: 'exam', label: 'Exam' },
  { value: 'personal', label: 'Personal' },
];

export const EVENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'done', label: 'Done' },
  { value: 'skipped', label: 'Skipped' },
];

export function createCalendarEvent(overrides = {}) {
  return {
    id: uuid(),
    title: '',
    type: 'study',
    subject_id: null,
    date: new Date().toISOString().split('T')[0],
    time_start: null,
    duration_minutes: 60,
    notes: '',
    status: 'pending',
    recurrence: null,
    ...overrides,
  };
}
