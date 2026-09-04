export const WEB_APP_DEFAULT_PHASES = [
  'Idea & Research',
  'Requirement Analysis',
  'Project Planning',
  'Technology Discussion & Selection',
  'Prototype Design',
  'Frontend Development',
  'Backend Development',
  'Library Integration',
  'Google Authentication Integration',
  'Database Connection',
  'Testing',
  'Quality Check',
  'Bug Fixing',
  'New Feature Discussion',
  'Review',
  'Beta Launch',
  'Final Launch 🚀',
];

export const ANDROID_APP_DEFAULT_PHASES = [
  'Idea & Research',
  'Requirement Analysis',
  'Project Planning',
  'Technology Discussion & Selection',
  'Prototype Design',
  'Android UI Development',
  'App Backend Development',
  'Library Integration',
  'Google Authentication Integration',
  'Firebase Integration',
  'Database Connection',
  'Testing',
  'Quality Check',
  'Bug Fixing',
  'New Feature Discussion',
  'Review',
  'AAB File Creation & Testing',
  'Beta Launch',
  'Final Launch 🚀',
];

export const getTemplateForCategory = (category) => {
  if (category === 'Android App') {
    return [...ANDROID_APP_DEFAULT_PHASES];
  }
  return [...WEB_APP_DEFAULT_PHASES];
};
