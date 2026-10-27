/**
 * Operation: Rescue Motku
 * Relationship Quiz Module
 * Stores question definitions, answer validation, and romantic feedback messages.
 */

export const QUIZ_CONFIG = {
  defaultIntervalSeconds: 60,
  testIntervalSeconds: 10,
  currentIntervalSeconds: 60
};

export const QUESTIONS = [
  {
    id: 1,
    type: 'choice',
    prompt: 'When did Arijit first meet Ayantika?',
    options: [
      { key: 'A', text: '2 March 2026' },
      { key: 'B', text: '9 March 2025' },
      { key: 'C', text: '28 February 2025' },
      { key: 'D', text: '5th March 2025' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 2,
    type: 'choice',
    prompt: 'What is the first thing we ate together?',
    options: [
      { key: 'A', text: 'momo' },
      { key: 'B', text: 'biryani' },
      { key: 'C', text: 'roll' },
      { key: 'D', text: 'ice cream' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 3,
    type: 'text',
    prompt: 'What is the first text Ayantika has sent to Arijit?',
    placeholder: 'Type your answer here...',
    // Exact answer validated strictly after trimming
    correctAnswer: '7044987173'
  },
  {
    id: 4,
    type: 'choice',
    prompt: 'How much money did Arijit pay to the eunuchs on his first date with Ayantika in Rabindra Sarobar?',
    options: [
      { key: 'A', text: '100' },
      { key: 'B', text: '50' },
      { key: 'C', text: 'none' },
      { key: 'D', text: '200' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 5,
    type: 'choice',
    prompt: 'When is the first time we said I love you over text?',
    options: [
      { key: 'A', text: '4th Sep 2025' },
      { key: 'B', text: '3rd Sep 2025' },
      { key: 'C', text: '10th Sep 2025' },
      { key: 'D', text: '25th Sep 2025' }
    ],
    correctAnswer: 'B'
  }
];

export const CORRECT_MESSAGES = [
  'Tui koto bhalo 🥹❤️',
  'Mitti chele 😚💗',
  'Baby kothakar 💋💕',
  'I love youuuuu 😭❤️🔥'
];

export const INCORRECT_MESSAGES = [
  'Amake ekdom bhalobashena 😭💔',
  'Oshobbho 😤🥀',
  'Baje 😔💔'
];

export const COMPLETION_MESSAGE = 'Five memories down, forever to go! ❤️';
export const MORE_QUESTIONS_MESSAGE = 'More questions coming soon ❤️';

/**
 * Validates a user's answer against the target question.
 * @param {Object} question The question object.
 * @param {string} rawInput The raw user input.
 * @returns {boolean} True if correct, false otherwise.
 */
export function validateAnswer(question, rawInput) {
  if (!question || rawInput === undefined || rawInput === null) return false;

  if (question.type === 'text') {
    const cleaned = String(rawInput).trim();
    return cleaned === question.correctAnswer;
  }

  // Choice question: compare option key (e.g. 'A', 'B', 'C', 'D')
  const cleaned = String(rawInput).trim().toUpperCase();
  return cleaned === question.correctAnswer.toUpperCase();
}

/**
 * Gets a random message from an array.
 * @param {string[]} list
 * @returns {string}
 */
export function getRandomMessage(list) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}
