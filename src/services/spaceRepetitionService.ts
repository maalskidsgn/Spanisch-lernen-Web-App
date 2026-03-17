// SM-2 Space Repetition Algorithm
// https://en.wikipedia.org/wiki/SuperMemo

export interface VocabularyProgress {
  vocabId: string;
  repetitions: number;
  easeFactor: number; // Startet bei 2.5, min 1.3
  interval: number; // Tage bis zur nächsten Wiederholung
  nextReviewDate: Date;
  lastReviewDate: Date;
  difficulty: number; // 0-5 (wie schwer es war)
}

export interface ReviewSession {
  vocabId: string;
  correctness: number; // 0 = falsch, 5 = leicht gelöst
}

export class SpaceRepetitionManager {
  // SM-2 Formel
  static calculateEaseFactor(currentEF: number, quality: number): number {
    // quality: 0=completely wrong, 5=perfect recall
    let newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    return Math.max(1.3, newEF); // Minimum 1.3
  }

  static calculateNextInterval(
    repetitions: number,
    easeFactor: number,
    quality: number
  ): number {
    if (quality < 3) {
      // Falsch beantwortet - zurücksetzen
      return 1; // Morgen wiederholen
    }

    if (repetitions === 0) {
      return 1; // Erste Wiederholung: morgen
    } else if (repetitions === 1) {
      return 3; // Zweite: in 3 Tagen
    } else {
      // Ab dritter: Formel anwenden
      return Math.round(repetitions * easeFactor);
    }
  }

  static updateProgress(
    progress: VocabularyProgress,
    quality: number
  ): VocabularyProgress {
    const now = new Date();
    const newRepetitions =
      quality < 3 ? 0 : progress.repetitions + 1;
    const newEaseFactor = this.calculateEaseFactor(
      progress.easeFactor,
      quality
    );
    const newInterval = this.calculateNextInterval(
      newRepetitions,
      newEaseFactor,
      quality
    );
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      vocabId: progress.vocabId,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      interval: newInterval,
      nextReviewDate,
      lastReviewDate: now,
      difficulty: quality,
    };
  }

  // Wörter die jetzt wiederholt werden sollen
  static getDueVocabulary(allProgress: VocabularyProgress[]): string[] {
    const now = new Date();
    return allProgress
      .filter((p) => new Date(p.nextReviewDate) <= now)
      .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime())
      .map((p) => p.vocabId);
  }

  // Neues Vokabel initialisieren
  static createNewProgress(vocabId: string): VocabularyProgress {
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + 1);

    return {
      vocabId,
      repetitions: 0,
      easeFactor: 2.5, // SM-2 Standard
      interval: 1,
      nextReviewDate,
      lastReviewDate: new Date(),
      difficulty: 0,
    };
  }

  // Statistiken für Dashboard
  static getStatistics(progress: VocabularyProgress[]): {
    totalVocab: number;
    masteredVocab: number; // 4+ repetitions
    learningVocab: number; // 1-3 repetitions
    newVocab: number; // 0 repetitions
    dueForReview: number;
  } {
    const now = new Date();
    return {
      totalVocab: progress.length,
      masteredVocab: progress.filter((p) => p.repetitions >= 4).length,
      learningVocab: progress.filter((p) => p.repetitions > 0 && p.repetitions < 4).length,
      newVocab: progress.filter((p) => p.repetitions === 0).length,
      dueForReview: progress.filter(
        (p) => new Date(p.nextReviewDate) <= now
      ).length,
    };
  }
}
