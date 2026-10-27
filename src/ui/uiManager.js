/**
 * Operation: Rescue Motku - UI Manager
 * Handles screen transitions, HUD updates, quiz modals, input validation,
 * feedback banners, and final anniversary collage presentation.
 */

import {
  QUESTIONS,
  CORRECT_MESSAGES,
  INCORRECT_MESSAGES,
  COMPLETION_MESSAGE,
  MORE_QUESTIONS_MESSAGE,
  validateAnswer,
  getRandomMessage,
  QUIZ_CONFIG
} from '../questions.js';
import { soundManager } from '../audio/soundManager.js';
import { loveClock } from '../game/loveClock.js';

export class UIManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;

    // Start Live IST Love Clock
    loveClock.start();

    // Elements
    this.hud = document.getElementById('hud-overlay');
    this.hudLives = document.getElementById('hud-lives');
    this.hudHighScore = document.getElementById('hud-highscore');
    this.hudDistance = document.getElementById('hud-distance');
    this.hudCoins = document.getElementById('hud-coins');
    this.hudScore = document.getElementById('hud-score');
    this.hudTimer = document.getElementById('hud-timer');
    this.intervalLabel = document.getElementById('interval-label');
    this.mobileControls = document.getElementById('mobile-controls');

    this.introModal = document.getElementById('intro-modal');
    this.instructionsModal = document.getElementById('instructions-modal');
    this.quizModal = document.getElementById('quiz-modal');
    this.gameoverModal = document.getElementById('gameover-modal');
    this.pauseModal = document.getElementById('pause-modal');
    this.rescueModal = document.getElementById('rescue-modal');
    this.endingModal = document.getElementById('ending-modal');
    this.scoreboardModal = document.getElementById('scoreboard-modal');

    // Scoreboard sub-elements
    this.sbHighScore = document.getElementById('sb-highscore');
    this.sbCurrentScore = document.getElementById('sb-current-score');
    this.sbDistance = document.getElementById('sb-distance');
    this.sbCoins = document.getElementById('sb-coins');
    this.sbMemories = document.getElementById('sb-memories');

    this.feedbackBanner = document.getElementById('feedback-banner');
    this.feedbackText = document.getElementById('feedback-text');

    this.quizBadge = document.getElementById('quiz-number-badge');
    this.quizPrompt = document.getElementById('quiz-prompt-text');
    this.quizOptions = document.getElementById('quiz-options-container');
    this.quizTextContainer = document.getElementById('quiz-text-container');
    this.quizTextInput = document.getElementById('quiz-text-input');
    this.btnSubmitText = document.getElementById('btn-submit-text');

    this.btnMute = document.getElementById('btn-mute');
    this.btnPause = document.getElementById('btn-pause');
    this.btnToggleSpeed = document.getElementById('btn-toggle-speed');

    this.isSubmittingQuiz = false;
    this.feedbackTimeout = null;

    this.setupListeners();
  }

  setupListeners() {
    // Intro start button (Exact wording: "DO YOU WANT TO SAVE AYANTIKA?")
    document.getElementById('btn-save-motku').addEventListener('click', () => {
      soundManager.init();
      soundManager.resume();
      this.introModal.classList.add('hidden');
      this.gameEngine.startRunning();
    });

    // Skip intro button
    document.getElementById('btn-skip-intro').addEventListener('click', () => {
      soundManager.init();
      soundManager.resume();
      this.introModal.classList.add('hidden');
      this.gameEngine.startRunning();
    });

    // Start from instructions
    document.getElementById('btn-start-runner').addEventListener('click', () => {
      this.instructionsModal.classList.add('hidden');
      this.gameEngine.startRunning();
    });

    // Sound toggle
    this.btnMute.addEventListener('click', () => {
      const muted = soundManager.toggleMute();
      this.btnMute.textContent = muted ? '🔇' : '🔊';
    });

    // Direct "Quiz Now" button in HUD
    const btnQuizNow = document.getElementById('btn-quiz-now');
    if (btnQuizNow) {
      btnQuizNow.addEventListener('click', () => {
        this.gameEngine.triggerQuizNow();
      });
    }

    // Intro mode buttons (Standard 60s / Fast Quiz 10s)
    const btnMode60 = document.getElementById('btn-mode-60');
    const btnMode10 = document.getElementById('btn-mode-10');

    if (btnMode60 && btnMode10) {
      btnMode60.addEventListener('click', () => {
        QUIZ_CONFIG.currentIntervalSeconds = QUIZ_CONFIG.defaultIntervalSeconds;
        btnMode60.className = 'btn btn-gold';
        btnMode10.className = 'btn btn-secondary';
        this.intervalLabel.textContent = `${QUIZ_CONFIG.currentIntervalSeconds}s`;
        this.gameEngine.resetCheckpointTimer();
      });

      btnMode10.addEventListener('click', () => {
        QUIZ_CONFIG.currentIntervalSeconds = QUIZ_CONFIG.testIntervalSeconds;
        btnMode10.className = 'btn btn-gold';
        btnMode60.className = 'btn btn-secondary';
        this.intervalLabel.textContent = `${QUIZ_CONFIG.currentIntervalSeconds}s`;
        this.gameEngine.resetCheckpointTimer();
      });
    }

    // Scoreboard buttons
    const btnOpenScoreboard = document.getElementById('btn-open-scoreboard');
    if (btnOpenScoreboard) {
      btnOpenScoreboard.addEventListener('click', () => {
        this.openScoreboard();
      });
    }

    const btnCloseScoreboard = document.getElementById('btn-close-scoreboard');
    if (btnCloseScoreboard) {
      btnCloseScoreboard.addEventListener('click', () => {
        this.closeScoreboard();
      });
    }

    // Pause button
    this.btnPause.addEventListener('click', () => {
      this.gameEngine.pauseGame();
    });

    // Resume button
    document.getElementById('btn-resume').addEventListener('click', () => {
      this.gameEngine.resumeGame();
    });

    // Pause Restart button
    document.getElementById('btn-pause-restart').addEventListener('click', () => {
      this.pauseModal.classList.add('hidden');
      this.gameEngine.restartGame();
    });

    // Checkpoint Interval Toggle (60s default / 10s dev test)
    this.btnToggleSpeed.addEventListener('click', () => {
      if (QUIZ_CONFIG.currentIntervalSeconds === QUIZ_CONFIG.defaultIntervalSeconds) {
        QUIZ_CONFIG.currentIntervalSeconds = QUIZ_CONFIG.testIntervalSeconds;
        if (btnMode10) btnMode10.className = 'btn btn-gold';
        if (btnMode60) btnMode60.className = 'btn btn-secondary';
      } else {
        QUIZ_CONFIG.currentIntervalSeconds = QUIZ_CONFIG.defaultIntervalSeconds;
        if (btnMode60) btnMode60.className = 'btn btn-gold';
        if (btnMode10) btnMode10.className = 'btn btn-secondary';
      }
      this.intervalLabel.textContent = `${QUIZ_CONFIG.currentIntervalSeconds}s`;
      this.gameEngine.resetCheckpointTimer();
    });

    // Game Over Restart button
    document.getElementById('btn-restart').addEventListener('click', () => {
      this.gameoverModal.classList.add('hidden');
      this.gameEngine.restartGame();
    });

    // Rescue Modal -> Ending Modal
    document.getElementById('btn-see-anniversary').addEventListener('click', () => {
      this.rescueModal.classList.add('hidden');
      this.showEndingScreen();
    });

    // Replay buttons
    document.getElementById('btn-replay').addEventListener('click', () => {
      this.endingModal.classList.add('hidden');
      this.gameEngine.restartGame();
    });

    document.getElementById('btn-back-to-title').addEventListener('click', () => {
      this.endingModal.classList.add('hidden');
      this.introModal.classList.remove('hidden');
      this.gameEngine.resetToTitle();
    });

    // Mobile on-screen control buttons
    document.getElementById('ctrl-left').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.gameEngine.moveLane(-1);
    });
    document.getElementById('ctrl-right').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.gameEngine.moveLane(1);
    });
    document.getElementById('ctrl-jump').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.gameEngine.jump();
    });
    document.getElementById('ctrl-slide').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.gameEngine.slide();
    });

    // Text question submission
    this.btnSubmitText.addEventListener('click', () => {
      this.handleTextAnswerSubmit();
    });

    this.quizTextInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        this.handleTextAnswerSubmit();
      }
    });

    // Fallback image handler for the exact collage
    const collageImg = document.getElementById('anniversary-collage-img');
    const fallbackBox = document.getElementById('collage-fallback');
    if (collageImg) {
      collageImg.onerror = () => {
        collageImg.style.display = 'none';
        if (fallbackBox) fallbackBox.style.display = 'block';
      };
      collageImg.onload = () => {
        collageImg.style.display = 'block';
        if (fallbackBox) fallbackBox.style.display = 'none';
      };
    }
  }

  openScoreboard() {
    if (this.sbHighScore) this.sbHighScore.textContent = this.gameEngine.highScore || 0;
    if (this.sbCurrentScore) this.sbCurrentScore.textContent = this.gameEngine.score || 0;
    if (this.sbDistance) this.sbDistance.textContent = `${Math.floor(this.gameEngine.distance || 0)} m`;
    if (this.sbCoins) this.sbCoins.textContent = this.gameEngine.coins || 0;
    if (this.sbMemories) this.sbMemories.textContent = `${this.gameEngine.currentQuestionIndex} / 5`;

    loveClock.update();

    if (this.gameEngine.state === 'RUNNING') {
      this.gameEngine.pauseGame();
      this.wasRunningBeforeScoreboard = true;
    }
    if (this.scoreboardModal) {
      this.scoreboardModal.classList.remove('hidden');
    }
  }

  closeScoreboard() {
    if (this.scoreboardModal) {
      this.scoreboardModal.classList.add('hidden');
    }
    if (this.wasRunningBeforeScoreboard) {
      this.wasRunningBeforeScoreboard = false;
      this.gameEngine.resumeGame();
    }
  }

  showHUD(visible) {
    this.hud.style.display = visible ? 'flex' : 'none';
    // Show mobile controls on touch-capable screens
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.mobileControls.style.display = visible && isTouch ? 'flex' : 'none';
  }

  updateHUD(distance, coins, score, secondsUntilCheckpoint, lives = 3, highScore = 0) {
    if (this.hudLives) {
      this.hudLives.textContent = '❤️'.repeat(Math.max(0, lives)) || '💔';
    }
    if (this.hudHighScore) {
      this.hudHighScore.textContent = highScore;
    }
    this.hudDistance.textContent = `${Math.floor(distance)} m`;
    this.hudCoins.textContent = coins;
    this.hudScore.textContent = score;
    this.hudTimer.textContent = `${Math.ceil(secondsUntilCheckpoint)}s`;
  }

  showPauseModal(show) {
    if (show) {
      this.pauseModal.classList.remove('hidden');
    } else {
      this.pauseModal.classList.add('hidden');
    }
  }

  showGameOver(distance, coins, score, customMsg = null) {
    this.showHUD(false);
    document.getElementById('go-distance').textContent = `${Math.floor(distance)} m`;
    document.getElementById('go-coins').textContent = coins;
    document.getElementById('go-score').textContent = score;

    const msgEl = document.getElementById('gameover-msg');
    if (customMsg) {
      msgEl.textContent = customMsg;
    } else {
      msgEl.textContent = getRandomMessage(INCORRECT_MESSAGES);
    }

    soundManager.playGameOver();
    this.gameoverModal.classList.remove('hidden');
  }

  showRescueModal() {
    this.showHUD(false);
    this.rescueModal.classList.remove('hidden');
    soundManager.startBgm('rescue');
  }

  showEndingScreen() {
    this.showHUD(false);
    this.endingModal.classList.remove('hidden');
  }

  showQuizCheckpoint(questionIndex) {
    this.isSubmittingQuiz = false;

    // Check if we have questions left
    if (questionIndex >= QUESTIONS.length) {
      // All 5 memories completed!
      this.showFeedbackBanner(MORE_QUESTIONS_MESSAGE, 2200);
      setTimeout(() => {
        this.gameEngine.resumeFromQuiz();
      }, 2200);
      return;
    }

    const question = QUESTIONS[questionIndex];
    this.quizBadge.textContent = `Memory Checkpoint #${question.id} of 5`;
    this.quizPrompt.textContent = question.prompt;

    this.quizOptions.innerHTML = '';

    if (question.type === 'choice') {
      this.quizOptions.style.display = 'flex';
      this.quizTextContainer.style.display = 'none';

      question.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `<span class="opt-key">${opt.key}</span> <span>${opt.text}</span>`;

        btn.addEventListener('click', () => {
          if (this.isSubmittingQuiz) return;
          this.isSubmittingQuiz = true;
          this.evaluateQuizAnswer(question, opt.key);
        });

        this.quizOptions.appendChild(btn);
      });

    } else if (question.type === 'text') {
      this.quizOptions.style.display = 'none';
      this.quizTextContainer.style.display = 'flex';
      this.quizTextInput.value = '';
      this.quizTextInput.placeholder = question.placeholder || 'Type your answer...';

      setTimeout(() => {
        this.quizTextInput.focus();
      }, 200);
    }

    this.quizModal.classList.remove('hidden');
  }

  handleTextAnswerSubmit() {
    if (this.isSubmittingQuiz) return;
    this.isSubmittingQuiz = true;

    const currentQ = QUESTIONS[this.gameEngine.currentQuestionIndex];
    const rawVal = this.quizTextInput.value;
    this.evaluateQuizAnswer(currentQ, rawVal);
  }

  evaluateQuizAnswer(question, rawInput) {
    const isCorrect = validateAnswer(question, rawInput);

    // Hide quiz modal immediately
    this.quizModal.classList.add('hidden');

    if (isCorrect) {
      // Play sound and romantic effects
      soundManager.playCorrectAnswer();
      this.gameEngine.triggerRomanticBurst();

      // Show random correct message
      const msg = getRandomMessage(CORRECT_MESSAGES);
      this.showFeedbackBanner(msg, 2000);

      // Advance question index
      this.gameEngine.currentQuestionIndex++;

      // Check if this was Question 5
      if (this.gameEngine.currentQuestionIndex === 5) {
        setTimeout(() => {
          this.showFeedbackBanner(COMPLETION_MESSAGE, 2500);
          // Set flag that rescue target is reached!
          this.gameEngine.isRescueReady = true;
          setTimeout(() => {
            this.gameEngine.resumeFromQuiz();
          }, 2500);
        }, 2100);
      } else {
        setTimeout(() => {
          this.gameEngine.resumeFromQuiz();
        }, 2000);
      }

    } else {
      // Incorrect answer: immediate game over with random Bengali phrase
      const failMsg = getRandomMessage(INCORRECT_MESSAGES);
      this.showGameOver(
        this.gameEngine.distance,
        this.gameEngine.coins,
        this.gameEngine.score,
        failMsg
      );
    }
  }

  showFeedbackBanner(text, duration = 2000) {
    if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
    this.feedbackText.textContent = text;
    this.feedbackBanner.classList.add('show');

    this.feedbackTimeout = setTimeout(() => {
      this.feedbackBanner.classList.remove('show');
    }, duration);
  }
}
