// === QUIZ DATA ===
const quizData = [
  {
    question: "What does CSS stand for?",
    options: ["Computer Style Sheets", "Creative Style System", "Cascading Style Sheets", "Colorful Style Setup"],
    correct: 2
  },
  {
    question: "Which property is used to change the background color?",
    options: ["color", "bgcolor", "background-color", "bg-color"],
    correct: 2
  },
  {
    question: "How do you write a single-line comment in JavaScript?",
    options: ["// comment", "/* comment */", "!-- comment --", "# comment"],
    correct: 0
  },
  {
    question: "Which method is used to fetch data from an API in modern JS?",
    options: ["XMLHttpRequest", "fetch()", "ajax()", "http.get()"],
    correct: 1
  },
  {
    question: "What does 'responsive design' mean?",
    options: ["Website works only on desktop", "Website adapts to screen size", "Website loads faster", "Website uses animations"],
    correct: 1
  }
];

// === QUIZ INIT ===
function initQuiz() {
  const container = document.getElementById('quiz-container');
  let userAnswers = [];

  quizData.forEach((q, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
      <strong>${index + 1}. ${q.question}</strong><br><br>
      ${q.options.map((opt, i) => 
        `<label><input type="radio" name="q${index}" value="${i}"> ${opt}</label><br>`
      ).join('')}
    `;
    container.appendChild(questionDiv);

    // Track selection
    const radios = questionDiv.querySelectorAll(`input[name="q${index}"]`);
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        userAnswers[index] = parseInt(radio.value);      });
    });
  });

  // Submit handler
  document.getElementById('submit-quiz').addEventListener('click', () => {
    const resultEl = document.getElementById('quiz-result');
    let score = 0;
    let feedback = '';

    quizData.forEach((q, i) => {
      const userAns = userAnswers[i];
      if (userAns === undefined) {
        feedback += `<p>⚠️ Question ${i+1}: Not answered</p>`;
      } else if (userAns === q.correct) {
        score++;
        feedback += `<p>✅ Question ${i+1}: Correct!</p>`;
      } else {
        feedback += `<p>❌ Question ${i+1}: Incorrect. Correct answer: "${q.options[q.correct]}"</p>`;
      }
    });

    resultEl.innerHTML = `
      <h4>Score: ${score}/${quizData.length}</h4>
      ${feedback}
    `;
    resultEl.style.backgroundColor = score === quizData.length ? '#d4edda' : '#f8d7da';
    resultEl.style.color = score === quizData.length ? '#155724' : '#721c24';
    resultEl.style.padding = '12px';
    resultEl.style.borderRadius = '6px';
  });
}

// === CAROUSEL ===
class Carousel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.slides = Array.from(this.container.querySelectorAll('.slide'));
    this.indicators = document.getElementById('indicators');
    this.currentIndex = 0;
    this.timer = null;

    this.init();
  }

  init() {
    this.renderIndicators();
    this.showSlide(this.currentIndex);

    // Prev/Next buttons    document.querySelector('.prev').addEventListener('click', () => this.prev());
    document.querySelector('.next').addEventListener('click', () => this.next());

    // Indicators click
    this.indicators.addEventListener('click', (e) => {
      if (e.target.classList.contains('indicator')) {
        const index = parseInt(e.target.dataset.index);
        this.goTo(index);
      }
    });

    // Auto-rotate
    this.startAutoRotate();
  }

  renderIndicators() {
    this.indicators.innerHTML = '';
    this.slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = `indicator ${i === this.currentIndex ? 'active' : ''}`;
      dot.dataset.index = i;
      this.indicators.appendChild(dot);
    });
  }

  showSlide(index) {
    this.slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    this.indicators.children[this.currentIndex]?.classList.remove('active');
    this.indicators.children[index]?.classList.add('active');
    this.currentIndex = index;
  }

  next() {
    this.goTo((this.currentIndex + 1) % this.slides.length);
  }

  prev() {
    this.goTo((this.currentIndex - 1 + this.slides.length) % this.slides.length);
  }

  goTo(index) {
    this.showSlide(index);
    this.resetTimer();
  }

  startAutoRotate() {
    this.timer = setInterval(() => {
      this.next();    }, 4000);
  }

  resetTimer() {
    clearInterval(this.timer);
    this.startAutoRotate();
  }
}

// === WEATHER API (Open-Meteo) ===
async function fetchWeather() {
  const weatherEl = document.getElementById('weather-data');
  weatherEl.innerHTML = '<p>📍 Detecting location...</p>';

  try {
    // Try geolocation first
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
    });

    const { latitude, longitude } = position.coords;

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
    );
    const data = await res.json();

    const { current_weather } = data;
    const { temperature, windspeed, weathercode } = current_weather;

    // Weather code mapping (simplified)
    const weatherDesc = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Drizzle: Light",
      53: "Drizzle: Moderate",
      55: "Drizzle: Dense",
      61: "Rain: Slight",
      63: "Rain: Moderate",
      65: "Rain: Heavy",
      71: "Snow fall: Slight",
      73: "Snow fall: Moderate",
      75: "Snow fall: Heavy",
      80: "Rain showers: Slight",
      81: "Rain showers: Moderate",
      82: "Rain showers: Violent",      95: "Thunderstorm with hail"
    };

    const desc = weatherDesc[weathercode] || "Unknown";

    weatherEl.innerHTML = `
      <h4>🌤️ Current Weather</h4>
      <p><strong>Temperature:</strong> ${temperature}°C</p>
      <p><strong>Condition:</strong> ${desc}</p>
      <p><strong>Wind:</strong> ${windspeed} km/h</p>
      <p><small>Location: Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}</small></p>
    `;
  } catch (err) {
    console.warn("Geolocation failed or API error:", err);
    // Fallback to London
    weatherEl.innerHTML = `
      <h4>🌤️ Weather (London, UK - fallback)</h4>
      <p>Using default location due to permission/network issue.</p>
      <p><em>Note: Enable location for accurate weather.</em></p>
    `;
    // Optional: hardcode sample data
    setTimeout(() => {
      weatherEl.innerHTML += `
        <p><strong>Temperature:</strong> 8°C</p>
        <p><strong>Condition:</strong> Partly cloudy</p>
        <p><strong>Wind:</strong> 12 km/h</p>
      `;
    }, 800);
  }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  initQuiz();
  new Carousel('carousel-inner');
  fetchWeather();
});