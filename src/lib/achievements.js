// src/lib/achievements.js
// Pure functions — no state, no side effects.

export const ACHIEVEMENTS = [
  {
    id: 'first_step',
    name: 'First Step',
    icon: '🚀',
    description: 'Log hours for the first time',
    check: (memberId, logs) => {
      return logs.some(l => l.member_id === memberId && l.hours > 0);
    }
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    icon: '🔥',
    description: 'Hit a 3-day streak',
    check: (memberId, logs, _q, streak) => streak >= 3
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    icon: '⚔️',
    description: 'Hit a 7-day streak',
    check: (memberId, logs, _q, streak) => streak >= 7
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    icon: '🌟',
    description: 'Hit a 14-day streak',
    check: (memberId, logs, _q, streak) => streak >= 14
  },
  {
    id: 'legend',
    name: 'Legend',
    icon: '👑',
    description: 'Hit a 30-day streak',
    check: (memberId, logs, _q, streak) => streak >= 30
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    icon: '📚',
    description: 'Log 10+ total hours',
    check: (memberId, logs) => {
      const total = logs.filter(l => l.member_id === memberId).reduce((sum, l) => sum + l.hours, 0);
      return total >= 10;
    }
  },
  {
    id: 'scholar',
    name: 'Scholar',
    icon: '🎓',
    description: 'Log 50+ total hours',
    check: (memberId, logs) => {
      const total = logs.filter(l => l.member_id === memberId).reduce((sum, l) => sum + l.hours, 0);
      return total >= 50;
    }
  },
  {
    id: 'quiz_taker',
    name: 'Quiz Taker',
    icon: '🧠',
    description: 'Complete your first quiz',
    check: (memberId, _l, quizAttempts) => {
      return quizAttempts.some(q => q.member_id === memberId);
    }
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    icon: '🎯',
    description: 'Score 8+ on 3 different quizzes',
    check: (memberId, _l, quizAttempts) => {
      return quizAttempts.filter(q => q.member_id === memberId && q.score >= 8).length >= 3;
    }
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    icon: '💯',
    description: 'Score 10/10 on any quiz',
    check: (memberId, _l, quizAttempts) => {
      return quizAttempts.some(q => q.member_id === memberId && q.score === 10);
    }
  }
];

/**
 * Compute which achievements a member has earned.
 * @returns {{ ...achievement, earned: boolean }[]}
 */
export function computeAchievements(memberId, logs, quizAttempts, streak) {
  return ACHIEVEMENTS.map(a => ({
    ...a,
    earned: a.check(memberId, logs, quizAttempts, streak)
  }));
}
