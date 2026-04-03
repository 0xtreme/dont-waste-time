const STORAGE_KEY = 'dont-waste-time-profile-v1';
const THEME_KEY = 'dont-waste-time-theme';

const state = {
  datasets: null,
  stepIndex: 0,
  profile: null,
  calculation: null,
  insights: [],
  revealTimeouts: [],
};

const views = {
  landing: document.getElementById('landing'),
  onboarding: document.getElementById('onboarding'),
  reveal: document.getElementById('reveal'),
  dashboard: document.getElementById('dashboard'),
};

const els = {
  themeToggle: document.getElementById('themeToggle'),
  ambientStats: document.getElementById('ambientStats'),
  startFlow: document.getElementById('startFlow'),
  loadSaved: document.getElementById('loadSaved'),
  stepLabel: document.getElementById('stepLabel'),
  stepTitle: document.getElementById('stepTitle'),
  stepHost: document.getElementById('stepHost'),
  backStep: document.getElementById('backStep'),
  nextStep: document.getElementById('nextStep'),
  dots: Array.from(document.querySelectorAll('.dot')),
  revealTotal: document.getElementById('revealTotal'),
  revealLedger: document.getElementById('revealLedger'),
  revealFree: document.getElementById('revealFree'),
  revealNarrative: document.getElementById('revealNarrative'),
  skipReveal: document.getElementById('skipReveal'),
  enterDashboard: document.getElementById('enterDashboard'),
  heroFreeTime: document.getElementById('heroFreeTime'),
  heroSupport: document.getElementById('heroSupport'),
  expectedLife: document.getElementById('expectedLife'),
  routineBurden: document.getElementById('routineBurden'),
  freeHoursDay: document.getElementById('freeHoursDay'),
  editProfile: document.getElementById('editProfile'),
  refreshInsights: document.getElementById('refreshInsights'),
  gridMeta: document.getElementById('gridMeta'),
  lifeGridLegend: document.getElementById('lifeGridLegend'),
  lifeGrid: document.getElementById('lifeGrid'),
  reflectionCard: document.getElementById('reflectionCard'),
  microMetrics: document.getElementById('microMetrics'),
  insightDeck: document.getElementById('insightDeck'),
  rangeFieldTemplate: document.getElementById('rangeFieldTemplate'),
};

const emptyProfile = {
  dob: '1992-01-15',
  gender: 'male',
  country: 'Australia',
  city: 'Melbourne',
  lifeRole: 'adult',
  routine: {
    sleep: 7.5,
    work: 8,
    commute: 1,
    meals: 1.5,
    hygiene: 0.75,
    chores: 1,
    screen: 2,
    admin: 0.5,
  },
  parentsAlive: true,
  parentAges: '62, 58',
  parentDistance: 'same_city',
  children: false,
  childAge: 6,
  partner: true,
  pet: false,
  petType: 'Dog',
  petAge: 4,
  friendFrequency: 'monthly',
};

const routineLabels = {
  sleep: 'Sleep',
  work: 'Work or study',
  commute: 'Commute',
  meals: 'Meals',
  hygiene: 'Hygiene',
  chores: 'Chores',
  screen: 'Leisure screen time',
  admin: 'Digital admin',
};

const steps = [
  {
    title: 'The basics',
    render: renderBasicsStep,
    validate: validateBasicsStep,
  },
  {
    title: 'Your routine',
    render: renderRoutineStep,
    validate: () => true,
  },
  {
    title: 'Your people',
    render: renderPeopleStep,
    validate: () => true,
  },
  {
    title: 'Your place',
    render: renderPlaceStep,
    validate: () => true,
  },
];

boot();

async function boot() {
  state.datasets = await loadDatasets();
  state.profile = mergeProfile(loadSavedProfile(), emptyProfile);
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  renderAmbientStats();
  bindEvents();
}

function bindEvents() {
  els.themeToggle?.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });

  els.startFlow?.addEventListener('click', () => {
    state.stepIndex = 0;
    showView('onboarding');
    renderStep();
  });

  els.loadSaved?.addEventListener('click', () => {
    const saved = loadSavedProfile();
    if (!saved) {
      els.loadSaved.textContent = 'No saved profile yet';
      setTimeout(() => {
        els.loadSaved.textContent = 'Load saved profile';
      }, 1200);
      return;
    }
    state.profile = mergeProfile(saved, emptyProfile);
    runCalculationAndReveal(false);
  });

  els.backStep?.addEventListener('click', () => {
    if (state.stepIndex === 0) {
      showView('landing');
      return;
    }
    persistStepInputs();
    state.stepIndex -= 1;
    renderStep();
  });

  els.nextStep?.addEventListener('click', () => {
    persistStepInputs();
    const activeStep = steps[state.stepIndex];
    const validation = activeStep.validate();
    if (validation !== true) {
      els.nextStep.textContent = validation;
      setTimeout(() => {
        els.nextStep.textContent = state.stepIndex === steps.length - 1 ? 'Reveal' : 'Next';
      }, 1500);
      return;
    }

    if (state.stepIndex === steps.length - 1) {
      runCalculationAndReveal(true);
      return;
    }

    state.stepIndex += 1;
    renderStep();
  });

  els.skipReveal?.addEventListener('click', () => finishReveal(true));
  els.enterDashboard?.addEventListener('click', () => showDashboard());
  els.editProfile?.addEventListener('click', () => {
    state.stepIndex = 1;
    showView('onboarding');
    renderStep();
  });
  els.refreshInsights?.addEventListener('click', () => {
    if (!state.calculation) return;
    state.insights = buildInsightDeck(state.profile, state.calculation, state.datasets);
    renderInsights();
  });
}

async function loadDatasets() {
  const [lifeExpectancy, weather, pets, defaults] = await Promise.all([
    fetch('./data/life-expectancy.json').then((res) => res.json()),
    fetch('./data/weather-data.json').then((res) => res.json()),
    fetch('./data/pet-lifespans.json').then((res) => res.json()),
    fetch('./data/routine-defaults.json').then((res) => res.json()),
  ]);

  return { lifeExpectancy, weather, pets, defaults };
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  if (els.themeToggle) {
    els.themeToggle.textContent = theme === 'light' ? 'Dark' : 'Light';
  }
}

function renderAmbientStats() {
  const examples = [
    { label: 'Adult default free time / day', value: '1.75 hours' },
    { label: 'Default lost to sleep', value: '31.3%' },
    { label: 'Everything stays on-device', value: '100%' },
  ];

  els.ambientStats.innerHTML = examples
    .map(
      (item) => `
        <div class="landing-stat">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </div>
      `,
    )
    .join('');
}

function renderStep() {
  const step = steps[state.stepIndex];
  els.stepLabel.textContent = `Step ${state.stepIndex + 1} of ${steps.length}`;
  els.stepTitle.textContent = step.title;
  els.nextStep.textContent = state.stepIndex === steps.length - 1 ? 'Reveal' : 'Next';
  els.dots.forEach((dot, index) => dot.classList.toggle('active', index === state.stepIndex));
  step.render();
}

function renderBasicsStep() {
  const countryOptions = state.datasets.lifeExpectancy
    .map((entry) => `<option value="${entry.country}">${entry.country}</option>`)
    .join('');

  els.stepHost.innerHTML = `
    <div class="step-card">
      <div class="step-intro">
        <h2>Start with the broad outline.</h2>
        <p>
          This sets the lifespan baseline. The rest of the experience becomes more personal from
          here.
        </p>
      </div>
      <div class="field-grid">
        <label class="field">
          <span class="field-label">Date of birth</span>
          <input id="profileDob" type="date" value="${state.profile.dob}" />
        </label>
        <label class="field">
          <span class="field-label">Gender</span>
          <select id="profileGender">
            ${['male', 'female', 'nonBinary']
              .map(
                (gender) =>
                  `<option value="${gender}" ${state.profile.gender === gender ? 'selected' : ''}>${gender === 'nonBinary' ? 'Non-binary' : capitalize(gender)}</option>`,
              )
              .join('')}
          </select>
        </label>
        <label class="field">
          <span class="field-label">Country of residence</span>
          <select id="profileCountry">${countryOptions}</select>
        </label>
        <label class="field">
          <span class="field-label">Life stage</span>
          <select id="profileLifeRole">
            <option value="adult" ${state.profile.lifeRole === 'adult' ? 'selected' : ''}>Adult</option>
            <option value="student" ${state.profile.lifeRole === 'student' ? 'selected' : ''}>Student</option>
            <option value="older" ${state.profile.lifeRole === 'older' ? 'selected' : ''}>Older adult / semi-retired</option>
          </select>
          <small class="field-help">This controls the default routine mix, not the final answer.</small>
        </label>
      </div>
    </div>
  `;

  const countrySelect = document.getElementById('profileCountry');
  countrySelect.value = state.profile.country;
  countrySelect.addEventListener('change', () => {
    state.profile.country = countrySelect.value;
    if (!matchesWeatherCity(state.profile.city, state.profile.country, state.datasets.weather)) {
      const fallbackCity = state.datasets.weather.find((entry) => entry.country === state.profile.country);
      if (fallbackCity) state.profile.city = fallbackCity.city;
    }
  });

  const lifeRole = document.getElementById('profileLifeRole');
  lifeRole.addEventListener('change', () => {
    applyDefaultsForRole(lifeRole.value);
    renderStep();
  });
}

function renderRoutineStep() {
  els.stepHost.innerHTML = `
    <div class="step-card">
      <div class="step-intro">
        <h2>Now subtract the routine.</h2>
        <p>
          These are daily averages. The defaults are intentionally realistic enough to sting.
        </p>
      </div>
      <div id="routineFields" class="field-grid"></div>
    </div>
  `;

  const host = document.getElementById('routineFields');
  const ranges = [
    ['sleep', 4, 12, 0.25, 'Hours spent asleep.'],
    ['work', 0, 16, 0.25, 'Work, study, or structured obligation.'],
    ['commute', 0, 4, 0.25, 'Daily travel that is not leisure.'],
    ['meals', 0.5, 4, 0.25, 'Cooking, eating, cleanup.'],
    ['hygiene', 0.25, 2, 0.25, 'Shower, toilet, grooming, teeth.'],
    ['chores', 0, 3, 0.25, 'Laundry, cleaning, errands.'],
    ['screen', 0, 8, 0.25, 'Recreational screen time.'],
    ['admin', 0, 3, 0.25, 'Digital admin, inboxes, logistics.'],
  ];

  ranges.forEach(([key, min, max, step, help]) => {
    const node = els.rangeFieldTemplate.content.firstElementChild.cloneNode(true);
    const label = node.querySelector('.field-label');
    const value = node.querySelector('.field-value');
    const input = node.querySelector('input');
    const helper = node.querySelector('.field-help');

    label.textContent = routineLabels[key];
    value.textContent = `${state.profile.routine[key].toFixed(2)} h`;
    input.id = `routine-${key}`;
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(state.profile.routine[key]);
    helper.textContent = help;
    input.addEventListener('input', () => {
      value.textContent = `${Number(input.value).toFixed(2)} h`;
      state.profile.routine[key] = Number(input.value);
    });

    host.appendChild(node);
  });
}

function renderPeopleStep() {
  els.stepHost.innerHTML = `
    <div class="step-card">
      <div class="step-intro">
        <h2>The best insights need names, distance, and rhythm.</h2>
        <p>
          None of this is required, but specific relationships are where the numbers become most
          human.
        </p>
      </div>
      <div class="field-grid">
        <label class="field">
          <span class="field-label">Parents alive?</span>
          <select id="parentsAlive">
            <option value="true" ${state.profile.parentsAlive ? 'selected' : ''}>Yes</option>
            <option value="false" ${!state.profile.parentsAlive ? 'selected' : ''}>No</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Parent ages</span>
          <input id="parentAges" type="text" value="${state.profile.parentAges}" placeholder="62, 58" />
          <small class="field-help">Comma-separated if two parents are alive.</small>
        </label>
        <label class="field">
          <span class="field-label">How far away are they?</span>
          <select id="parentDistance">
            <option value="same_city" ${state.profile.parentDistance === 'same_city' ? 'selected' : ''}>Same city</option>
            <option value="same_country" ${state.profile.parentDistance === 'same_country' ? 'selected' : ''}>Same country, different city</option>
            <option value="different_country" ${state.profile.parentDistance === 'different_country' ? 'selected' : ''}>Different country</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Children?</span>
          <select id="childrenToggle">
            <option value="true" ${state.profile.children ? 'selected' : ''}>Yes</option>
            <option value="false" ${!state.profile.children ? 'selected' : ''}>No</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Youngest child age</span>
          <input id="childAge" type="number" min="0" max="17" value="${state.profile.childAge}" />
        </label>
        <label class="field">
          <span class="field-label">Partner or spouse?</span>
          <select id="partnerToggle">
            <option value="true" ${state.profile.partner ? 'selected' : ''}>Yes</option>
            <option value="false" ${!state.profile.partner ? 'selected' : ''}>No</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Pet?</span>
          <select id="petToggle">
            <option value="true" ${state.profile.pet ? 'selected' : ''}>Yes</option>
            <option value="false" ${!state.profile.pet ? 'selected' : ''}>No</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Pet type and age</span>
          <div class="field-grid" style="grid-template-columns: 1fr 112px; gap: 0.7rem;">
            <select id="petType">
              ${state.datasets.pets
                .map(
                  (pet) =>
                    `<option value="${pet.type}" ${state.profile.petType === pet.type ? 'selected' : ''}>${pet.label}</option>`,
                )
                .join('')}
            </select>
            <input id="petAge" type="number" min="0" max="30" value="${state.profile.petAge}" />
          </div>
        </label>
        <label class="field">
          <span class="field-label">Best friend cadence</span>
          <select id="friendFrequency">
            <option value="weekly" ${state.profile.friendFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
            <option value="monthly" ${state.profile.friendFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
            <option value="rarely" ${state.profile.friendFrequency === 'rarely' ? 'selected' : ''}>A few times a year</option>
          </select>
        </label>
      </div>
    </div>
  `;
}

function renderPlaceStep() {
  const weatherOptions = state.datasets.weather
    .filter((entry) => entry.country === state.profile.country)
    .concat(state.datasets.weather.filter((entry) => entry.country !== state.profile.country))
    .map((entry) => `<option value="${entry.city}">${entry.city}, ${entry.country}</option>`)
    .join('');

  els.stepHost.innerHTML = `
    <div class="step-card">
      <div class="step-intro">
        <h2>Place changes the texture of time.</h2>
        <p>
          This gives the app a weather and season context for the nature insights. If your city is
          not listed, pick the closest match for now.
        </p>
      </div>
      <div class="field-grid">
        <label class="field">
          <span class="field-label">City</span>
          <select id="profileCity">${weatherOptions}</select>
        </label>
        <div class="field">
          <span class="field-label">What happens next</span>
          <p class="field-caption">
            The reveal will show remaining lifetime first, then strip away routine years, months,
            and hours until only discretionary time remains.
          </p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('profileCity').value = state.profile.city;
}

function validateBasicsStep() {
  const dob = document.getElementById('profileDob')?.value;
  if (!dob) return 'Add birth date';
  return true;
}

function persistStepInputs() {
  const dom = (id) => document.getElementById(id);

  if (dom('profileDob')) state.profile.dob = dom('profileDob').value;
  if (dom('profileGender')) state.profile.gender = dom('profileGender').value;
  if (dom('profileCountry')) state.profile.country = dom('profileCountry').value;
  if (dom('profileLifeRole')) state.profile.lifeRole = dom('profileLifeRole').value;
  if (dom('parentsAlive')) state.profile.parentsAlive = dom('parentsAlive').value === 'true';
  if (dom('parentAges')) state.profile.parentAges = dom('parentAges').value;
  if (dom('parentDistance')) state.profile.parentDistance = dom('parentDistance').value;
  if (dom('childrenToggle')) state.profile.children = dom('childrenToggle').value === 'true';
  if (dom('childAge')) state.profile.childAge = Number(dom('childAge').value || 0);
  if (dom('partnerToggle')) state.profile.partner = dom('partnerToggle').value === 'true';
  if (dom('petToggle')) state.profile.pet = dom('petToggle').value === 'true';
  if (dom('petType')) state.profile.petType = dom('petType').value;
  if (dom('petAge')) state.profile.petAge = Number(dom('petAge').value || 0);
  if (dom('friendFrequency')) state.profile.friendFrequency = dom('friendFrequency').value;
  if (dom('profileCity')) state.profile.city = dom('profileCity').value;
}

function runCalculationAndReveal(animated) {
  persistStepInputs();
  state.calculation = calculateProfile(state.profile, state.datasets);
  state.insights = buildInsightDeck(state.profile, state.calculation, state.datasets);
  saveProfile(state.profile);
  showView('reveal');
  renderReveal(animated);
}

function renderReveal(animated) {
  clearRevealTimeouts();
  const calc = state.calculation;
  els.revealTotal.textContent = formatYears(calc.remainingYears);
  els.revealFree.textContent = 'Calculating…';
  els.revealLedger.innerHTML = '';
  els.revealNarrative.textContent = '';
  els.enterDashboard.disabled = true;

  const items = [
    ['Sleep', calc.routineBreakdown.sleepYears],
    ['Work or study', calc.routineBreakdown.workYears],
    ['Commute', calc.routineBreakdown.commuteYears],
    ['Meals', calc.routineBreakdown.mealsYears],
    ['Hygiene', calc.routineBreakdown.hygieneYears],
    ['Chores', calc.routineBreakdown.choresYears],
    ['Leisure screen time', calc.routineBreakdown.screenYears],
    ['Digital admin', calc.routineBreakdown.adminYears],
  ].filter(([, years]) => years > 0.03);

  if (!animated) {
    items.forEach(([label, years]) => addRevealLine(label, years));
    finishReveal(true);
    return;
  }

  items.forEach(([label, years], index) => {
    const timeout = setTimeout(() => addRevealLine(label, years), 450 * (index + 1));
    state.revealTimeouts.push(timeout);
  });

  const finishTimeout = setTimeout(() => finishReveal(false), 450 * (items.length + 2));
  state.revealTimeouts.push(finishTimeout);
}

function addRevealLine(label, years) {
  const item = document.createElement('div');
  item.className = 'reveal-item';
  item.innerHTML = `<small>${label}</small><strong>-${formatYears(years)}</strong>`;
  els.revealLedger.appendChild(item);
}

function finishReveal(skipped) {
  clearRevealTimeouts();
  const calc = state.calculation;
  els.revealFree.textContent = formatDuration(calc.freeHoursRemaining);
  els.revealNarrative.textContent =
    calc.freeHoursPerDay <= 0.5
      ? 'Right now, your routine leaves almost no unclaimed space. That is not a moral verdict. It is a measurement.'
      : `On your current pattern, about ${calc.freeHoursPerDay.toFixed(2)} hours of each day remain unscripted. That is the part still available for presence, love, wonder, and attention.`;
  els.enterDashboard.disabled = false;
  if (skipped) els.enterDashboard.focus();
}

function showDashboard() {
  renderDashboard();
  showView('dashboard');
}

function renderDashboard() {
  const calc = state.calculation;
  const expectancy = getExpectancy(state.profile.country, state.profile.gender, state.datasets.lifeExpectancy);
  els.heroFreeTime.textContent = formatDuration(calc.freeHoursRemaining);
  els.heroSupport.textContent = `${calc.percentageFree.toFixed(1)}% of your remaining lifetime is still discretionary on this routine. The rest is already spoken for.`;
  els.expectedLife.textContent = `${expectancy.toFixed(1)} years`;
  els.routineBurden.textContent = `${calc.routineHoursPerDay.toFixed(2)} h/day`;
  els.freeHoursDay.textContent = `${calc.freeHoursPerDay.toFixed(2)} h/day`;
  els.gridMeta.textContent = `${calc.livedMonths} lived · ${calc.routineMonthsRemaining} routine months ahead · ${calc.freeMonthsRemaining} bright months left`;
  els.reflectionCard.innerHTML = `<p>${buildReflection(calc)}</p>`;
  renderMicroMetrics(calc);
  renderLifeGrid(calc);
  renderInsights();
}

function renderMicroMetrics(calc) {
  const metrics = [
    ['Friday evenings left', formatInteger(calc.remainingWeeks)],
    ['Meals left', formatInteger(calc.remainingDays * 3)],
    ['Full moons left', formatInteger(calc.remainingYears * 12.37)],
  ];

  els.microMetrics.innerHTML = metrics
    .map(
      ([label, value]) => `
        <div class="micro-card">
          <span class="stat-label">${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join('');
}

function renderLifeGrid(calc) {
  const totalMonths = Math.round(calc.expectancy * 12);
  const lived = calc.livedMonths;
  const routine = Math.min(calc.routineMonthsRemaining, totalMonths - lived);
  const free = Math.max(totalMonths - lived - routine, 0);

  els.lifeGridLegend.innerHTML = [
    ['lived', 'Lived'],
    ['routine', 'Already spoken for'],
    ['free', 'Still yours'],
  ]
    .map(
      ([tone, label]) =>
        `<span class="legend-chip"><span class="legend-swatch ${tone}"></span>${label}</span>`,
    )
    .join('');

  const cells = [];
  for (let index = 0; index < totalMonths; index += 1) {
    let tone = '';
    if (index < lived) tone = 'lived';
    else if (index < lived + routine) tone = 'routine';
    else tone = 'free';
    cells.push(`<div class="month-cell ${tone}" title="Month ${index + 1}"></div>`);
  }
  els.lifeGrid.innerHTML = cells.join('');
}

function renderInsights() {
  els.insightDeck.innerHTML = '';
  state.insights.forEach((insight, index) => {
    const card = document.createElement('article');
    card.className = 'panel insight-card';
    card.dataset.tone = insight.tone;
    card.innerHTML = `
      <span class="insight-kicker">${insight.category}</span>
      <div class="insight-body">
        <h4 class="insight-number">${insight.value}</h4>
        <p>${insight.text}</p>
        <p class="insight-source">${insight.source}</p>
      </div>
      <div class="insight-actions">
        <button class="share-button" type="button" data-share-index="${index}">Export card</button>
        <span class="share-status" data-share-status="${index}"></span>
      </div>
    `;
    els.insightDeck.appendChild(card);
  });

  els.insightDeck.querySelectorAll('[data-share-index]').forEach((button) => {
    button.addEventListener('click', () => exportInsightCard(Number(button.dataset.shareIndex)));
  });
}

function exportInsightCard(index) {
  const insight = state.insights[index];
  const accent =
    insight.tone === 'people' ? '#9B8EC4' : insight.tone === 'nature' ? '#7BA68A' : insight.tone === 'reality' ? '#C45B4A' : '#E8C170';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#0A0A0A"/>
          <stop offset="100%" stop-color="#17130F"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1080" fill="url(#bg)" rx="56"/>
      <circle cx="860" cy="220" r="220" fill="${accent}" opacity="0.18"/>
      <text x="88" y="142" fill="#8A8580" font-size="32" font-family="JetBrains Mono, monospace" letter-spacing="6">${escapeXml(insight.category.toUpperCase())}</text>
      <text x="88" y="420" fill="#E8C170" font-size="152" font-family="Georgia, serif">${escapeXml(insight.value)}</text>
      <foreignObject x="88" y="480" width="880" height="360">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color:#F5F0EB;font-family:Manrope,Arial,sans-serif;font-size:44px;line-height:1.35;">
          ${escapeXml(insight.text)}
        </div>
      </foreignObject>
      <text x="88" y="932" fill="#8A8580" font-size="28" font-family="Manrope, Arial, sans-serif">${escapeXml(insight.source)}</text>
      <text x="88" y="996" fill="#8A8580" font-size="28" font-family="JetBrains Mono, monospace">dontwastetime</text>
    </svg>
  `;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dont-waste-time-insight-${index + 1}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  const status = document.querySelector(`[data-share-status="${index}"]`);
  if (status) {
    status.textContent = 'SVG downloaded';
    setTimeout(() => {
      status.textContent = '';
    }, 1400);
  }
}

function calculateProfile(profile, datasets) {
  const age = getAge(profile.dob);
  const expectancy = getExpectancy(profile.country, profile.gender, datasets.lifeExpectancy);
  const remainingYears = Math.max(expectancy - age, 0);
  const remainingDays = remainingYears * 365.25;
  const routineHoursPerDay = sum(Object.values(profile.routine));
  const freeHoursPerDay = Math.max(24 - routineHoursPerDay, 0);
  const freeHoursRemaining = freeHoursPerDay * remainingDays;
  const routineHoursRemaining = routineHoursPerDay * remainingDays;
  const routineBreakdown = Object.fromEntries(
    Object.entries(profile.routine).map(([key, value]) => [key + 'Years', (value * remainingDays) / 24 / 365.25]),
  );
  const livedMonths = Math.min(Math.round(age * 12), Math.round(expectancy * 12));
  const routineMonthsRemaining = Math.round(routineHoursRemaining / 24 / 30.44);
  const freeMonthsRemaining = Math.round(freeHoursRemaining / 24 / 30.44);

  return {
    age,
    expectancy,
    remainingYears,
    remainingDays,
    remainingWeeks: Math.round(remainingDays / 7),
    routineHoursPerDay,
    freeHoursPerDay,
    freeHoursRemaining,
    routineHoursRemaining,
    routineBreakdown,
    livedMonths,
    routineMonthsRemaining,
    freeMonthsRemaining,
    percentageFree: remainingYears > 0 ? (freeHoursRemaining / (remainingDays * 24)) * 100 : 0,
  };
}

function buildInsightDeck(profile, calc, datasets) {
  const weather = lookupWeather(profile.city, profile.country, datasets.weather);
  const pet = datasets.pets.find((entry) => entry.type === profile.petType) || datasets.pets[0];
  const parentVisitsByYear = {
    same_city: 52,
    same_country: 6,
    different_country: 1.5,
  };
  const friendMeetupsByYear = {
    weekly: 52,
    monthly: 12,
    rarely: 4,
  };

  const parentAges = profile.parentAges
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
  const parentExpectancy = 84;
  const averageParentYearsLeft = parentAges.length
    ? average(parentAges.map((age) => Math.max(parentExpectancy - age, 0)))
    : Math.max(calc.remainingYears * 0.6, 0);
  const parentWindowYears = Math.min(calc.remainingYears, averageParentYearsLeft);

  const all = [
    {
      category: 'Reality check',
      tone: 'reality',
      value: formatYears(calc.routineBreakdown.sleepYears),
      text: `Of your remaining ${formatYears(calc.remainingYears)}, about ${formatYears(calc.routineBreakdown.sleepYears)} will be spent asleep. Rest matters. It still counts against the total.`,
      source: `Based on ${profile.routine.sleep.toFixed(2)} hours of sleep per day and an estimated lifespan of ${calc.expectancy.toFixed(1)} years in ${profile.country}.`,
      score: 96,
    },
    {
      category: 'Everyday',
      tone: 'everyday',
      value: formatInteger(calc.remainingWeeks),
      text: `You have about ${formatInteger(calc.remainingWeeks)} Friday evenings left. The small weekly exhale is finite too.`,
      source: 'Estimated from remaining weeks in your projected lifespan.',
      score: 94,
    },
    {
      category: 'Nature',
      tone: 'nature',
      value: formatInteger(calc.remainingYears),
      text: `You have about ${formatInteger(calc.remainingYears)} more summers left. A season feels annual until there are only a few dozen remaining.`,
      source: 'One summer per projected remaining year.',
      score: 95,
    },
    {
      category: 'Everyday',
      tone: 'everyday',
      value: formatInteger(calc.remainingDays * 3),
      text: `You will eat roughly ${formatInteger(calc.remainingDays * 3)} more meals. Many of them will feel ordinary. They are not.`,
      source: 'Assumes three meals per day across remaining projected days.',
      score: 88,
    },
    {
      category: 'Nature',
      tone: 'nature',
      value: formatInteger(calc.remainingYears * 12.37),
      text: `You will see approximately ${formatInteger(calc.remainingYears * 12.37)} more full moons. Enough to stop for, if you decide to.`,
      source: 'Uses an average of 12.37 full moons per year.',
      score: 84,
    },
    {
      category: 'Reality check',
      tone: 'reality',
      value: formatYears(calc.routineBreakdown.commuteYears),
      text: `On this routine, commuting will consume about ${formatYears(calc.routineBreakdown.commuteYears)} of what remains.`,
      source: `Based on ${profile.routine.commute.toFixed(2)} commute hours per day.`,
      score: profile.routine.commute > 0.2 ? 82 : 40,
    },
    {
      category: 'Reality check',
      tone: 'reality',
      value: formatYears(calc.routineBreakdown.screenYears),
      text: `If leisure screen time stays where it is, about ${formatYears(calc.routineBreakdown.screenYears)} of your remaining life will be spent looking into a lit rectangle.`,
      source: `Based on ${profile.routine.screen.toFixed(2)} daily leisure screen hours.`,
      score: profile.routine.screen > 0.5 ? 90 : 44,
    },
    {
      category: 'Nature',
      tone: 'nature',
      value: formatInteger(calc.remainingYears * weather.rainyDays),
      text: `In ${weather.city}, you have roughly ${formatInteger(calc.remainingYears * weather.rainyDays)} rainy days left. Some of them will arrive exactly when you need them.`,
      source: `Using a city estimate of ${weather.rainyDays} rainy days per year.`,
      score: 81,
    },
    {
      category: 'Nature',
      tone: 'nature',
      value: formatInteger(calc.remainingYears * weather.clearNights),
      text: `Based on ${weather.city}, you have about ${formatInteger(calc.remainingYears * weather.clearNights)} clear nights left for a proper look at the sky.`,
      source: `Using ${weather.clearNights} clearer nights per year for ${weather.city}.`,
      score: 78,
    },
    {
      category: 'Nature',
      tone: 'nature',
      value: formatInteger(calc.remainingYears * weather.sunrisesProbability * 365.25),
      text: `If you catch dawn as often as the average early riser, you have around ${formatInteger(calc.remainingYears * weather.sunrisesProbability * 365.25)} more sunrises that you actually witness.`,
      source: `Based on a ${Math.round(weather.sunrisesProbability * 100)}% chance of waking before sunrise.`,
      score: 72,
    },
    {
      category: 'Everyday',
      tone: 'everyday',
      value: formatInteger(calc.remainingDays),
      text: `You will fall asleep about ${formatInteger(calc.remainingDays)} more times. Some nights will be unforgettable. Most will not announce themselves.`,
      source: 'One sleep cycle per remaining day.',
      score: 79,
    },
    {
      category: 'Everyday',
      tone: 'everyday',
      value: formatInteger(calc.remainingWeeks),
      text: `Roughly ${formatInteger(calc.remainingWeeks)} more songs may stop you in your tracks, if that still happens about once a week.`,
      source: 'Assumes one memorable music moment per week.',
      score: 69,
    },
    {
      category: 'Reality check',
      tone: 'reality',
      value: `${calc.freeHoursPerDay.toFixed(2)} h`,
      text: `Your current routine leaves about ${calc.freeHoursPerDay.toFixed(2)} discretionary hours each day. That is the margin your life is really being built inside.`,
      source: 'Calculated as 24 hours minus total routine hours.',
      score: 97,
    },
    {
      category: 'Nature',
      tone: 'nature',
      value: formatInteger(calc.remainingYears),
      text: `There are roughly ${formatInteger(calc.remainingYears)} more ${weather.seasonalLabel} in your future. The count is gentler than a countdown, but it is still a count.`,
      source: `Location context set to ${weather.city}, ${weather.country}.`,
      score: 76,
    },
  ];

  if (profile.parentsAlive) {
    all.push({
      category: 'People',
      tone: 'people',
      value: formatInteger(parentWindowYears * parentVisitsByYear[profile.parentDistance]),
      text: `At your current distance, you may have about ${formatInteger(parentWindowYears * parentVisitsByYear[profile.parentDistance])} more in-person visits with your parents.`,
      source: `Uses ${parentVisitsByYear[profile.parentDistance]} visits per year for the selected distance pattern and an estimated parent window of ${parentWindowYears.toFixed(1)} years.`,
      score: 99,
    });
    all.push({
      category: 'People',
      tone: 'people',
      value: `${Math.min(99, Math.round((Math.max(calc.age - 18, 0) / Math.max(calc.age - 18 + parentWindowYears, 1)) * 100))}%`,
      text: 'You have already spent most of the ordinary, available-adult time you will ever spend with your parents. That is why the number feels small.',
      source: 'Simple model: frequent contact in childhood, then a shrinking adult window.',
      score: 93,
    });
  }

  if (profile.children) {
    const yearsUntilAdult = Math.max(18 - profile.childAge, 0);
    all.push({
      category: 'People',
      tone: 'people',
      value: formatInteger(yearsUntilAdult * 52),
      text: `Your child will likely have about ${formatInteger(yearsUntilAdult * 52)} weekends left before adulthood starts rearranging the pattern.`,
      source: `Calculated from your youngest child being ${profile.childAge} years old.`,
      score: 98,
    });
  }

  if (profile.pet) {
    const petYearsLeft = Math.max(pet.lifespan - profile.petAge, 0);
    all.push({
      category: 'People',
      tone: 'people',
      value: formatInteger(petYearsLeft * 365),
      text: `With a ${profile.petType.toLowerCase()} of this age, you may have around ${formatInteger(petYearsLeft * 365)} more ordinary days together.`,
      source: `Uses an average ${profile.petType.toLowerCase()} lifespan of ${pet.lifespan} years.`,
      score: 97,
    });
  }

  all.push({
    category: 'People',
    tone: 'people',
    value: formatInteger(calc.remainingYears * friendMeetupsByYear[profile.friendFrequency]),
    text: `If you keep seeing your closest friend ${frequencyLabel(profile.friendFrequency)}, there may be only ${formatInteger(calc.remainingYears * friendMeetupsByYear[profile.friendFrequency])} more meetups.`,
    source: `Based on a ${frequencyLabel(profile.friendFrequency)} cadence.`,
    score: 86,
  });

  return shuffle(all)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function buildReflection(calc) {
  if (calc.freeHoursPerDay < 1) {
    return 'The main signal here is not mortality. It is compression. Your days are so pre-allocated that your future is being reduced before it arrives.';
  }
  if (calc.freeHoursPerDay < 2.5) {
    return 'This is the strange middle ground many adults live inside: enough freedom to matter, not enough to waste casually.';
  }
  return 'Your routine is taking a meaningful share, but there is still visible breathing room. The important question is whether your remaining free time is being spent deliberately.';
}

function showView(viewName) {
  Object.entries(views).forEach(([name, node]) => {
    node.classList.toggle('view-active', name === viewName);
  });
}

function applyDefaultsForRole(role) {
  state.profile.lifeRole = role;
  state.profile.routine = {
    ...state.profile.routine,
    ...state.datasets.defaults[role],
  };
}

function getAge(dob) {
  const birthDate = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return Math.max(age, 0);
}

function getExpectancy(country, gender, table) {
  const match = table.find((entry) => entry.country === country) || table[0];
  return match[gender] || match.nonBinary;
}

function lookupWeather(city, country, table) {
  return (
    table.find((entry) => entry.city === city) ||
    table.find((entry) => entry.country === country) ||
    table[0]
  );
}

function matchesWeatherCity(city, country, table) {
  return table.some((entry) => entry.city === city && entry.country === country);
}

function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function loadSavedProfile() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function mergeProfile(saved, fallback) {
  if (!saved) return structuredClone(fallback);
  return {
    ...fallback,
    ...saved,
    routine: {
      ...fallback.routine,
      ...(saved.routine || {}),
    },
  };
}

function clearRevealTimeouts() {
  state.revealTimeouts.forEach((timeout) => clearTimeout(timeout));
  state.revealTimeouts = [];
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function average(values) {
  return values.length ? sum(values) / values.length : 0;
}

function formatYears(value) {
  if (value < 1) {
    const months = value * 12;
    return `${months.toFixed(1)} months`;
  }
  return `${value.toFixed(1)} years`;
}

function formatDuration(hours) {
  const totalDays = hours / 24;
  const years = Math.floor(totalDays / 365.25);
  const months = Math.floor((totalDays - years * 365.25) / 30.44);
  const days = Math.floor(totalDays - years * 365.25 - months * 30.44);
  if (years <= 0 && months <= 0) return `${days} days`;
  return `${years} years, ${months} months, ${days} days`;
}

function formatInteger(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value));
}

function frequencyLabel(key) {
  if (key === 'weekly') return 'weekly';
  if (key === 'monthly') return 'monthly';
  return 'a few times a year';
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function shuffle(items) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
