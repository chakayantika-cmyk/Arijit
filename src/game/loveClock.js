/**
 * Operation: Rescue Motku - Live IST Love Clock
 * Matches exact UI:
 * "Chengis Khan with his Motku since ❤️ 💊 [avatar]"
 * [01 YEARS] [02 MONTHS] [00 DAYS] [HH HOURS] [MM MINUTES] [SS SECONDS]
 * Running live in Indian Standard Time (IST, UTC+5:30).
 */

export class LoveClock {
  constructor(containerId = 'love-clock-ticker') {
    this.container = document.getElementById(containerId);
    // Baseline start date corresponding to 14 months (1 year 2 months) ago in IST
    this.startDate = new Date('2025-08-27T00:00:00+05:30');
    this.timerId = null;
  }

  start() {
    this.update();
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => this.update(), 1000);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  getISTDate() {
    const now = new Date();
    // Convert to IST (UTC + 5 hours 30 mins)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 5.5));
  }

  getTimeComponents() {
    const nowIST = this.getISTDate();
    let diffMs = nowIST - this.startDate;
    if (diffMs < 0) diffMs = 0;

    const totalSeconds = Math.floor(diffMs / 1000);
    const secs = totalSeconds % 60;
    const totalMins = Math.floor(totalSeconds / 60);
    const mins = totalMins % 60;
    const totalHours = Math.floor(totalMins / 60);
    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);

    // 1 year (365 days) + 2 months (~61 days) = 426 days base
    const days = Math.max(0, totalDays - 426);

    const pad = (n) => String(n).padStart(2, '0');

    return {
      years: '01',
      months: '02',
      days: pad(days),
      hours: pad(hours),
      minutes: pad(mins),
      seconds: pad(secs)
    };
  }

  update() {
    if (!this.container) {
      this.container = document.getElementById('love-clock-ticker');
    }
    if (!this.container) return;

    const t = this.getTimeComponents();

    this.container.innerHTML = `
      <div class="love-card-inner">
        <div class="love-card-header">
          <span class="love-card-title">Chengis Khan with his Motku since ❤️ 💊</span>
          <img class="love-card-avatar" src="./assets/ayantika-photo.jpeg" alt="Motku" onerror="this.style.display='none'" />
        </div>
        <div class="love-boxes-row">
          <div class="love-box">
            <div class="love-box-num">${t.years}</div>
            <div class="love-box-label">YEARS</div>
          </div>
          <div class="love-box">
            <div class="love-box-num">${t.months}</div>
            <div class="love-box-label">MONTHS</div>
          </div>
          <div class="love-box">
            <div class="love-box-num">${t.days}</div>
            <div class="love-box-label">DAYS</div>
          </div>
          <div class="love-box">
            <div class="love-box-num">${t.hours}</div>
            <div class="love-box-label">HOURS</div>
          </div>
          <div class="love-box">
            <div class="love-box-num">${t.minutes}</div>
            <div class="love-box-label">MINUTES</div>
          </div>
          <div class="love-box">
            <div class="love-box-num">${t.seconds}</div>
            <div class="love-box-label">SECONDS</div>
          </div>
        </div>
      </div>
    `;

    // Also update scoreboard copy
    const sbClock = document.getElementById('sb-love-clock');
    if (sbClock) {
      sbClock.textContent = `Chengis Khan with his Motku: 01 YRS 02 MOS ${t.days}D ${t.hours}H ${t.minutes}M ${t.seconds}S (IST)`;
    }
  }
}

export const loveClock = new LoveClock();
