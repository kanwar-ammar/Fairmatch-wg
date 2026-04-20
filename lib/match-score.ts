type PreferenceVector = {
  cleanliness: number;
  recycling: number;
  diy: number;
  cooking: number;
  quietness: number;
  music: number;
  fitness: number;
  studyHabits: number;
  socialActivity: number;
  parties: number;
};

type HomePreferenceVector = {
  prefCleanliness: number;
  prefRecycling: number;
  prefDiy: number;
  prefCooking: number;
  prefQuietness: number;
  prefMusic: number;
  prefFitness: number;
  prefStudyHabits: number;
  prefSocial: number;
  prefParties: number;
};

export function calculateMatchScore(
  studentPreference: PreferenceVector | null | undefined,
  homePreference: HomePreferenceVector,
): number {
  if (!studentPreference) {
    return 50;
  }

  const deltas = [
    Math.abs(studentPreference.cleanliness - homePreference.prefCleanliness),
    Math.abs(studentPreference.recycling - homePreference.prefRecycling),
    Math.abs(studentPreference.diy - homePreference.prefDiy),
    Math.abs(studentPreference.cooking - homePreference.prefCooking),
    Math.abs(studentPreference.quietness - homePreference.prefQuietness),
    Math.abs(studentPreference.music - homePreference.prefMusic),
    Math.abs(studentPreference.fitness - homePreference.prefFitness),
    Math.abs(studentPreference.studyHabits - homePreference.prefStudyHabits),
    Math.abs(studentPreference.socialActivity - homePreference.prefSocial),
    Math.abs(studentPreference.parties - homePreference.prefParties),
  ];

  const averageDelta = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
  const score = Math.round(100 - averageDelta);

  return Math.max(0, Math.min(100, score));
}
