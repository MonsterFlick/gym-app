import { SetDifficulty } from '../types/database';

export interface SuggestionResult {
  suggestedWeight: number;
  direction: 'increase' | 'maintain' | 'decrease';
  delta: number;
  reason: string;
}

export function calculateNextSetSuggestion(params: {
  currentWeight: number;
  actualReps: number;
  minReps: number | null;
  maxReps: number | null;
  rpe?: number | null;
  difficulty?: SetDifficulty | null;
  incrementKg?: number;
}): SuggestionResult | null {
  const {
    currentWeight,
    actualReps,
    minReps,
    maxReps,
    rpe,
    difficulty,
    incrementKg = 2.5,
  } = params;

  if (currentWeight <= 0) return null;

  // Case 1: To failure exercise (no fixed min/max reps)
  if (minReps === null || maxReps === null) {
    if (rpe && rpe >= 9.5) {
      const reduction = Math.max(incrementKg, Math.round((currentWeight * 0.1) / incrementKg) * incrementKg);
      const newWeight = Math.max(0, currentWeight - reduction);
      return {
        suggestedWeight: newWeight,
        direction: 'decrease',
        delta: -reduction,
        reason: 'Suggested reduction: maximal exertion reached on prior set.',
      };
    }
    return {
      suggestedWeight: currentWeight,
      direction: 'maintain',
      delta: 0,
      reason: 'Maintain load for remaining working sets.',
    };
  }

  // Case 2: Fell short of minimum reps
  if (actualReps < minReps) {
    const isVeryHard =
      (rpe && rpe >= 9) ||
      difficulty === 'very_hard' ||
      difficulty === 'maximum';

    const reduction = isVeryHard
      ? Math.max(incrementKg, Math.round((currentWeight * 0.1) / incrementKg) * incrementKg)
      : incrementKg;
    const newWeight = Math.max(0, currentWeight - reduction);

    return {
      suggestedWeight: newWeight,
      direction: 'decrease',
      delta: -reduction,
      reason: `Suggested reduction: logged ${actualReps} reps, below minimum target of ${minReps}.`,
    };
  }

  // Case 3: Reached or exceeded top of rep range easily
  if (actualReps >= maxReps) {
    const isEasy = (rpe && rpe <= 7) || difficulty === 'easy' || difficulty === 'moderate';
    if (isEasy) {
      return {
        suggestedWeight: currentWeight + incrementKg,
        direction: 'increase',
        delta: incrementKg,
        reason: `Target exceeded (${actualReps}/${maxReps} reps) with manageable effort. Small increase suggested.`,
      };
    }
    return {
      suggestedWeight: currentWeight,
      direction: 'maintain',
      delta: 0,
      reason: `Hit target of ${actualReps} reps. Maintain load to build volume before increasing.`,
    };
  }

  // Case 4: Within target rep range
  return {
    suggestedWeight: currentWeight,
    direction: 'maintain',
    delta: 0,
    reason: `Reps (${actualReps}) in target range (${minReps}–${maxReps}). Maintain load.`,
  };
}
