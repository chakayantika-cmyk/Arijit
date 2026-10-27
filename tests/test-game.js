/**
 * Automated Verification Test Suite for Operation: Rescue Motku
 * Tests questions, validations, configs, messages, and asset integrity.
 */

import fs from 'fs';
import path from 'path';
import {
  QUESTIONS,
  CORRECT_MESSAGES,
  INCORRECT_MESSAGES,
  COMPLETION_MESSAGE,
  MORE_QUESTIONS_MESSAGE,
  validateAnswer,
  QUIZ_CONFIG
} from '../src/questions.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== RUNNING TESTS FOR OPERATION: RESCUE MOTKU ===\n');

// 1. Checkpoint interval tests
assert(QUIZ_CONFIG.defaultIntervalSeconds === 60, 'Default checkpoint interval must be 60 seconds');
assert(QUIZ_CONFIG.testIntervalSeconds === 10, 'Testing checkpoint interval must be 10 seconds');
assert(QUIZ_CONFIG.currentIntervalSeconds === 60, 'Current interval must start at default 60 seconds');

// 2. Question count test
assert(QUESTIONS.length === 5, 'Exactly 5 confirmed questions must be defined initially');

// 3. Question 1 tests
const q1 = QUESTIONS[0];
assert(q1.prompt === 'When did Arijit first meet Ayantika?', 'Q1 prompt matches');
assert(q1.correctAnswer === 'C', 'Q1 correct answer is C');
assert(validateAnswer(q1, 'C') === true, 'Q1: validateAnswer("C") is true');
assert(validateAnswer(q1, 'c') === true, 'Q1: validateAnswer("c") is case-insensitive');
assert(validateAnswer(q1, 'A') === false, 'Q1: validateAnswer("A") is false');
assert(validateAnswer(q1, 'B') === false, 'Q1: validateAnswer("B") is false');
assert(validateAnswer(q1, 'D') === false, 'Q1: validateAnswer("D") is false');

// 4. Question 2 tests
const q2 = QUESTIONS[1];
assert(q2.prompt === 'What is the first thing we ate together?', 'Q2 prompt matches');
assert(q2.correctAnswer === 'A', 'Q2 correct answer is A (momo)');
assert(validateAnswer(q2, 'A') === true, 'Q2: validateAnswer("A") is true');
assert(validateAnswer(q2, 'B') === false, 'Q2: validateAnswer("B") is false');
assert(validateAnswer(q2, 'C') === false, 'Q2: validateAnswer("C") is false');

// 5. Question 3 tests (Text input)
const q3 = QUESTIONS[2];
assert(q3.type === 'text', 'Q3 is text input type');
assert(q3.correctAnswer === '7044987173', 'Q3 correct answer is 7044987173');
assert(validateAnswer(q3, '7044987173') === true, 'Q3 accepts exact answer "7044987173"');
assert(validateAnswer(q3, '  7044987173  ') === true, 'Q3 ignores accidental leading/trailing spaces');
assert(validateAnswer(q3, '704498717') === false, 'Q3 rejects incomplete numbers');
assert(validateAnswer(q3, 'hello') === false, 'Q3 rejects random text');

// 6. Question 4 tests
const q4 = QUESTIONS[3];
assert(q4.prompt === 'How much money did Arijit pay to the eunuchs on his first date with Ayantika in Rabindra Sarobar?', 'Q4 prompt matches');
assert(q4.correctAnswer === 'C', 'Q4 correct answer is C (none)');
assert(validateAnswer(q4, 'C') === true, 'Q4: validateAnswer("C") is true');
assert(validateAnswer(q4, 'A') === false, 'Q4: validateAnswer("A") is false');

// 7. Question 5 tests
const q5 = QUESTIONS[4];
assert(q5.prompt === 'When is the first time we said I love you over text?', 'Q5 prompt matches');
assert(q5.correctAnswer === 'B', 'Q5 correct answer is B (3rd Sep 2025)');
assert(validateAnswer(q5, 'B') === true, 'Q5: validateAnswer("B") is true');
assert(validateAnswer(q5, 'A') === false, 'Q5: validateAnswer("A") is false');

// 8. Messages lists verification
assert(CORRECT_MESSAGES.includes('Tui koto bhalo 🥹❤️'), 'Correct list has "Tui koto bhalo 🥹❤️"');
assert(CORRECT_MESSAGES.includes('Mitti chele 😚💗'), 'Correct list has "Mitti chele 😚💗"');
assert(CORRECT_MESSAGES.includes('Baby kothakar 💋💕'), 'Correct list has "Baby kothakar 💋💕"');
assert(CORRECT_MESSAGES.includes('I love youuuuu 😭❤️🔥'), 'Correct list has "I love youuuuu 😭❤️🔥"');

assert(INCORRECT_MESSAGES.includes('Amake ekdom bhalobashena 😭💔'), 'Incorrect list has "Amake ekdom bhalobashena 😭💔"');
assert(INCORRECT_MESSAGES.includes('Oshobbho 😤🥀'), 'Incorrect list has "Oshobbho 😤🥀"');
assert(INCORRECT_MESSAGES.includes('Baje 😔💔'), 'Incorrect list has "Baje 😔💔"');

assert(COMPLETION_MESSAGE === 'Five memories down, forever to go! ❤️', 'Completion message matches exact wording');
assert(MORE_QUESTIONS_MESSAGE === 'More questions coming soon ❤️', 'More questions message matches exact wording');

// 9. Exact uploaded collage file test
const collagePath = path.resolve('public/assets/anniversary-collage.jpeg');
assert(fs.existsSync(collagePath), 'anniversary-collage.jpeg exists in public/assets/');
const stat = fs.statSync(collagePath);
assert(stat.size > 50000, `anniversary-collage.jpeg is a valid image (${stat.size} bytes)`);

// 10. Dist production build asset test
const distCollagePath = path.resolve('dist/assets/anniversary-collage.jpeg');
assert(fs.existsSync(distCollagePath), 'anniversary-collage.jpeg exists in production build dist/assets/');

// 11. HTML contents verification
const htmlContent = fs.readFileSync('index.html', 'utf8');
assert(htmlContent.includes('Eishob prem tem chere porashona koro'), 'Villain catchphrase is in index.html');
assert(htmlContent.includes('DO YOU WANT TO SAVE AYANTIKA?'), 'Start button exact wording is in index.html');
assert(htmlContent.includes('Happy 14th months, I love you more than you love me !!!!'), 'Exact anniversary primary message is in index.html');
assert(htmlContent.includes('Forever your Ayantika ♡'), 'Exact anniversary secondary message is in index.html');
assert(!htmlContent.includes('Saree-Wearing Evil HOD') && !htmlContent.includes('SAREE-WEARING EVIL HOD'), 'Does NOT say Saree-Wearing Evil HOD in HTML');
assert(!htmlContent.includes('HELD HOSTAGE!'), 'HELD HOSTAGE writeup has been removed from index.html');
assert(htmlContent.includes('>HOD<'), 'Text HOD is present and properly visible');
assert(htmlContent.includes('>MOTKU<'), 'Text MOTKU is present and properly visible');
assert(htmlContent.includes('The HOD Says:'), 'Dialog has natural speaker tag "The HOD Says:"');
assert(htmlContent.includes('hostage-mock-container'), 'Mock avatar hostage container exists in index.html');
assert(htmlContent.includes('hod-saree-avatar'), 'Mock avatar of woman in saree exists in index.html');
assert(htmlContent.includes('ayantika-avatar'), 'Mock avatar of Ayantika in jeans & t-shirt exists in index.html');

// 12. Character avatars and Love Clock files verification
assert(fs.existsSync('src/characters/femaleHod.js'), 'femaleHod.js exists for saree-wearing evil HOD');
assert(fs.existsSync('src/characters/ayantika.js'), 'ayantika.js exists for Ayantika avatar in jeans & t-shirt');
assert(fs.existsSync('src/characters/arijit.js'), 'arijit.js exists for Arijit avatar in kurta');
assert(fs.existsSync('src/characters/villain.js'), 'villain.js exists for male assistant HOD');

const clockContent = fs.readFileSync('src/game/loveClock.js', 'utf8');
assert(clockContent.includes('Chengis Khan with his Motku since'), 'Clock header contains "Chengis Khan with his Motku since"');
assert(clockContent.includes('YEARS') && clockContent.includes('MONTHS') && clockContent.includes('DAYS'), 'Clock contains YEARS, MONTHS, DAYS boxes');
assert(clockContent.includes('HOURS') && clockContent.includes('MINUTES') && clockContent.includes('SECONDS'), 'Clock contains HOURS, MINUTES, SECONDS boxes');

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
