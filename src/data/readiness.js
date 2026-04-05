export function calculateReadiness(subjects, topics, exercises, grades, categories) {
  if (!subjects.length) return { overall: 0, perSubject: {}, momentum: 0 };

  const perSubject = {};
  let weightedSum = 0;
  let totalWeight = 0;

  for (const subject of subjects) {
    const subjectCategories = categories.filter(c => c.subject_id === subject.id);
    const categoryIds = subjectCategories.map(c => c.id);
    const subjectTopics = topics.filter(t => categoryIds.includes(t.category_id));
    const subjectTopicIds = subjectTopics.map(t => t.id);

    // Grade score: current avg / target (capped at 1.0)
    const subjectGrades = grades.filter(g => g.subject_id === subject.id);
    const gradeAvg = subjectGrades.length > 0
      ? subjectGrades.reduce((sum, g) => sum + g.value, 0) / subjectGrades.length
      : 0;
    const gradeScore = Math.min(gradeAvg / (subject.target_grade || 7), 1.0);

    // Exercise completion: exercises with score >= 60% of max for subject topics
    const subjectExercises = exercises.filter(e =>
      e.topic_ids.some(tid => subjectTopicIds.includes(tid))
    );
    const completedExercises = subjectExercises.filter(e =>
      e.outcome === 'correct' || (e.score && e.max_score && e.score / e.max_score >= 0.6)
    );
    const exerciseCompletion = subjectExercises.length > 0
      ? completedExercises.length / subjectExercises.length
      : 0;

    // Topics covered: % of topics marked complete
    const topicsCovered = subjectTopics.length > 0
      ? subjectTopics.filter(t => t.completed).length / subjectTopics.length
      : 0;

    const readiness = (gradeScore * 0.5) + (exerciseCompletion * 0.3) + (topicsCovered * 0.2);
    const weight = subject.weight || 1.0;

    perSubject[subject.id] = {
      readiness: Math.round(readiness * 100),
      gradeAvg: Math.round(gradeAvg * 10) / 10,
      gradeScore: Math.round(gradeScore * 100),
      exerciseCompletion: Math.round(exerciseCompletion * 100),
      topicsCovered: Math.round(topicsCovered * 100),
      exerciseCount: subjectExercises.length,
      topicCount: subjectTopics.length,
      topicsDone: subjectTopics.filter(t => t.completed).length,
      gap: Math.max(0, Math.round((subject.target_grade - gradeAvg) * 10) / 10),
    };

    weightedSum += readiness * weight;
    totalWeight += weight;
  }

  const overall = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

  return { overall, perSubject, momentum: 0 };
}

export function getRiskLevel(gap) {
  if (gap >= 3) return { emoji: '\u{1F534}', label: 'High Risk', colour: 'var(--colour-error)' };
  if (gap >= 2) return { emoji: '\u{1F7E0}', label: 'Medium Risk', colour: 'var(--colour-warning)' };
  if (gap >= 1) return { emoji: '\u{1F7E1}', label: 'Low Risk', colour: 'var(--colour-warning)' };
  return { emoji: '\u{1F7E2}', label: 'On Track', colour: 'var(--colour-success)' };
}
