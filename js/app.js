const THEME_KEY = 'dont-waste-time-theme';

const state = {
  datasets: null,
  detailedMode: false,
  insightCount: 6,
  parentAgesAuto: true,
  profile: {
    age: 34,
    originCountry: 'Global average',
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
    parentAges: deriveParentAgeString(34),
    parentDistance: 'same_city',
    children: false,
    childAge: 6,
    pet: false,
    petType: 'Dog',
    petAge: 4,
    friendFrequency: 'monthly',
  },
  calculation: null,
  insights: [],
};

const routineLabels = {
  sleep: 'Sleep',
  work: 'Work',
  commute: 'Commute',
  meals: 'Meals',
  hygiene: 'Hygiene',
  chores: 'Chores',
  screen: 'Screen time',
  admin: 'Admin',
};

const defaultRoutine = {
  sleep: 7.5,
  work: 8,
  commute: 1,
  meals: 1.5,
  hygiene: 0.75,
  chores: 1,
  screen: 2,
  admin: 0.5,
};

const els = {
  themeToggle: document.getElementById('themeToggle'),
  detailsToggle: document.getElementById('detailsToggle'),
  detailPanel: document.getElementById('detailPanel'),
  ageDisplay: document.getElementById('ageDisplay'),
  ageRange: document.getElementById('ageRange'),
  ageMinus: document.getElementById('ageMinus'),
  agePlus: document.getElementById('agePlus'),
  quickAges: document.getElementById('quickAges'),
  originCountry: document.getElementById('originCountry'),
  resetRoutine: document.getElementById('resetRoutine'),
  routineFields: document.getElementById('routineFields'),
  parentsAlive: document.getElementById('parentsAlive'),
  parentAges: document.getElementById('parentAges'),
  parentDistance: document.getElementById('parentDistance'),
  childrenToggle: document.getElementById('childrenToggle'),
  childAge: document.getElementById('childAge'),
  petToggle: document.getElementById('petToggle'),
  petType: document.getElementById('petType'),
  petAge: document.getElementById('petAge'),
  friendFrequency: document.getElementById('friendFrequency'),
  heroNumber: document.getElementById('heroNumber'),
  heroNarrative: document.getElementById('heroNarrative'),
  statExpectancy: document.getElementById('statExpectancy'),
  statRoutine: document.getElementById('statRoutine'),
  statFree: document.getElementById('statFree'),
  gridMeta: document.getElementById('gridMeta'),
  lifeGridLegend: document.getElementById('lifeGridLegend'),
  lifeGrid: document.getElementById('lifeGrid'),
  reflectionCard: document.getElementById('reflectionCard'),
  microMetrics: document.getElementById('microMetrics'),
  insightDeck: document.getElementById('insightDeck'),
  toggleInsights: document.getElementById('toggleInsights'),
  refreshInsights: document.getElementById('refreshInsights'),
  rangeFieldTemplate: document.getElementById('rangeFieldTemplate'),
};

boot();

async function boot() {
  state.datasets = await loadDatasets();
  renderOriginOptions();
  renderPetOptions();
  renderQuickAges();
  renderRoutineFields();
  hydrateStaticControls();
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  bindEvents();
  recompute();
}

async function loadDatasets() {
  const [lifeExpectancy, pets] = await Promise.all([
    fetch('./data/life-expectancy.json').then((res) => res.json()),
    fetch('./data/pet-lifespans.json').then((res) => res.json()),
  ]);

  return { lifeExpectancy, pets };
}

function bindEvents() {
  els.themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });

  els.detailsToggle.addEventListener('click', () => {
    state.detailedMode = !state.detailedMode;
    els.detailPanel.classList.toggle('hidden-block', !state.detailedMode);
    els.detailsToggle.setAttribute('aria-expanded', String(state.detailedMode));
    els.detailsToggle.textContent = state.detailedMode ? 'Hide details' : 'Detailed mode';
    recompute();
  });

  els.ageRange.addEventListener('input', () => {
    updateAge(Number(els.ageRange.value));
  });

  els.ageMinus.addEventListener('click', () => updateAge(state.profile.age - 1));
  els.agePlus.addEventListener('click', () => updateAge(state.profile.age + 1));

  els.originCountry.addEventListener('change', () => {
    state.profile.originCountry = els.originCountry.value;
    recompute();
  });

  els.resetRoutine.addEventListener('click', () => {
    state.profile.routine = { ...defaultRoutine };
    renderRoutineFields();
    recompute();
  });

  [
    ['parentsAlive', 'parentsAlive', (value) => value === 'true'],
    ['parentDistance', 'parentDistance', (value) => value],
    ['childrenToggle', 'children', (value) => value === 'true'],
    ['childAge', 'childAge', (value) => Number(value || 0)],
    ['petToggle', 'pet', (value) => value === 'true'],
    ['petType', 'petType', (value) => value],
    ['petAge', 'petAge', (value) => Number(value || 0)],
    ['friendFrequency', 'friendFrequency', (value) => value],
  ].forEach(([id, key, parser]) => {
    els[id].addEventListener('input', () => {
      state.profile[key] = parser(els[id].value);
      recompute();
    });
    els[id].addEventListener('change', () => {
      state.profile[key] = parser(els[id].value);
      recompute();
    });
  });

  els.parentAges.addEventListener('input', () => {
    state.profile.parentAges = els.parentAges.value;
    state.parentAgesAuto = normalizeAgesText(els.parentAges.value) === normalizeAgesText(deriveParentAgeString(state.profile.age));
    recompute();
  });

  els.parentAges.addEventListener('change', () => {
    state.profile.parentAges = els.parentAges.value;
    state.parentAgesAuto = normalizeAgesText(els.parentAges.value) === normalizeAgesText(deriveParentAgeString(state.profile.age));
    recompute();
  });

  els.refreshInsights.addEventListener('click', () => {
    state.insights = buildInsightDeck(
      buildEffectiveProfile(),
      state.calculation,
      state.datasets,
      true,
      state.insightCount,
    );
    renderInsights();
  });

  els.toggleInsights.addEventListener('click', () => {
    state.insightCount = state.insightCount === 6 ? 9 : 6;
    els.toggleInsights.textContent = state.insightCount === 6 ? 'Show more' : 'Show less';
    recompute();
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (state.calculation) renderLifeGrid(state.calculation);
    }, 120);
  });
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  els.themeToggle.textContent = theme === 'light' ? 'Dark' : 'Light';
}

function renderOriginOptions() {
  const options = ['Global average', ...state.datasets.lifeExpectancy.map((entry) => entry.country)];
  els.originCountry.innerHTML = options
    .map((country) => `<option value="${country}">${country}</option>`)
    .join('');
  els.originCountry.value = state.profile.originCountry;
}

function renderPetOptions() {
  els.petType.innerHTML = state.datasets.pets
    .map((pet) => `<option value="${pet.type}">${pet.label}</option>`)
    .join('');
  els.petType.value = state.profile.petType;
}

function renderQuickAges() {
  const ages = [18, 25, 30, 35, 40, 50, 65];
  els.quickAges.innerHTML = ages
    .map((age) => `<button class="quick-age" type="button" data-age="${age}">${age}</button>`)
    .join('');

  els.quickAges.querySelectorAll('[data-age]').forEach((button) => {
    button.addEventListener('click', () => updateAge(Number(button.dataset.age)));
  });
}

function renderRoutineFields() {
  els.routineFields.innerHTML = '';

  Object.entries(defaultRoutine).forEach(([key, defaultValue]) => {
    const node = els.rangeFieldTemplate.content.firstElementChild.cloneNode(true);
    const label = node.querySelector('.field-label');
    const value = node.querySelector('.field-value');
    const input = node.querySelector('input');
    label.textContent = routineLabels[key];
    value.textContent = `${state.profile.routine[key].toFixed(2)} h`;
    input.min = key === 'sleep' ? '4' : '0';
    input.max = key === 'work' ? '16' : key === 'sleep' ? '12' : key === 'screen' ? '8' : key === 'commute' ? '4' : key === 'hygiene' ? '2' : key === 'chores' ? '3' : '4';
    input.step = '0.25';
    input.value = String(state.profile.routine[key]);
    input.addEventListener('input', () => {
      state.profile.routine[key] = Number(input.value);
      value.textContent = `${state.profile.routine[key].toFixed(2)} h`;
      recompute();
    });
    els.routineFields.appendChild(node);
  });
}

function hydrateStaticControls() {
  updateAge(state.profile.age, false);
  els.parentsAlive.value = String(state.profile.parentsAlive);
  els.parentAges.value = state.profile.parentAges;
  els.parentDistance.value = state.profile.parentDistance;
  els.childrenToggle.value = String(state.profile.children);
  els.childAge.value = String(state.profile.childAge);
  els.petToggle.value = String(state.profile.pet);
  els.petType.value = state.profile.petType;
  els.petAge.value = String(state.profile.petAge);
  els.friendFrequency.value = state.profile.friendFrequency;
}

function updateAge(age, rerender = true) {
  const clamped = Math.max(5, Math.min(100, age));
  state.profile.age = clamped;
  if (state.parentAgesAuto) {
    state.profile.parentAges = deriveParentAgeString(clamped);
    els.parentAges.value = state.profile.parentAges;
  }
  els.ageRange.value = String(clamped);
  els.ageDisplay.textContent = String(clamped);
  if (rerender) recompute();
}

function recompute() {
  const effectiveProfile = buildEffectiveProfile();
  state.calculation = calculateProfile(effectiveProfile, state.datasets);
  state.insights = buildInsightDeck(
    effectiveProfile,
    state.calculation,
    state.datasets,
    false,
    state.insightCount,
  );
  renderOverview();
  renderInsights();
}

function buildEffectiveProfile() {
  if (state.detailedMode) {
    return state.profile;
  }

  return {
    ...state.profile,
    originCountry: 'Global average',
    parentsAlive: false,
    children: false,
    pet: false,
  };
}

function calculateProfile(profile, datasets) {
  const expectancy = getExpectancy(profile.originCountry, datasets.lifeExpectancy);
  const remainingYears = Math.max(expectancy - profile.age, 0);
  const remainingDays = remainingYears * 365.25;
  const remainingWeeks = remainingDays / 7;
  const routineHoursPerDay = sum(Object.values(profile.routine));
  const freeHoursPerDay = Math.max(24 - routineHoursPerDay, 0);
  const freeHoursRemaining = freeHoursPerDay * remainingDays;
  const routineHoursRemaining = routineHoursPerDay * remainingDays;
  const livedMonths = Math.round(profile.age * 12);
  const routineMonthsRemaining = Math.round(routineHoursRemaining / 24 / 30.44);
  const freeMonthsRemaining = Math.round(freeHoursRemaining / 24 / 30.44);

  const breakdown = Object.fromEntries(
    Object.entries(profile.routine).map(([key, value]) => [key, (value * remainingDays) / 24 / 365.25]),
  );

  return {
    expectancy,
    remainingYears,
    remainingDays,
    remainingWeeks,
    routineHoursPerDay,
    freeHoursPerDay,
    freeHoursRemaining,
    routineHoursRemaining,
    livedMonths,
    routineMonthsRemaining,
    freeMonthsRemaining,
    percentageFree: remainingDays > 0 ? (freeHoursRemaining / (remainingDays * 24)) * 100 : 0,
    breakdown,
  };
}

function renderOverview() {
  const calc = state.calculation;
  els.heroNumber.textContent = formatDuration(calc.freeHoursRemaining);
  els.heroNarrative.textContent =
    calc.freeHoursPerDay < 1
      ? `At ${state.profile.age}, your current defaults leave very little unscripted time each day. The scarcity is the point.`
      : `At ${state.profile.age}, this model leaves about ${calc.freeHoursPerDay.toFixed(2)} hours a day that are still yours to decide.`;
  els.statExpectancy.textContent = `${calc.expectancy.toFixed(1)} years`;
  els.statRoutine.textContent = `${calc.routineHoursPerDay.toFixed(2)} h/day`;
  els.statFree.textContent = `${calc.freeHoursPerDay.toFixed(2)} h/day`;
  els.gridMeta.textContent = `${calc.livedMonths} lived · ${calc.routineMonthsRemaining} routine ahead · ${calc.freeMonthsRemaining} free ahead`;
  els.reflectionCard.textContent = buildReflection(calc);
  renderMicroMetrics(calc);
  renderLifeGrid(calc);
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
  const lived = Math.min(calc.livedMonths, totalMonths);
  const routine = Math.min(calc.routineMonthsRemaining, Math.max(totalMonths - lived, 0));
  const columns = window.matchMedia('(max-width: 720px)').matches
    ? 30
    : window.matchMedia('(max-width: 960px)').matches
      ? 38
      : 52;
  const rows = Math.ceil(totalMonths / columns);
  const step = 10;
  const radius = window.matchMedia('(max-width: 720px)').matches ? 2.65 : 2.15;
  const width = columns * step;
  const height = rows * step;

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

  const dots = [];
  for (let index = 0; index < totalMonths; index += 1) {
    let tone = 'free';
    if (index < lived) tone = 'lived';
    else if (index < lived + routine) tone = 'routine';
    const column = index % columns;
    const row = Math.floor(index / columns);
    const cx = column * step + step / 2;
    const cy = row * step + step / 2;
    dots.push(`<circle class="life-dot ${tone}" cx="${cx}" cy="${cy}" r="${radius}" />`);
  }

  els.lifeGrid.innerHTML = `
    <svg
      class="life-grid-svg"
      viewBox="0 0 ${width} ${height}"
      role="img"
      aria-label="Life in months dot matrix"
      preserveAspectRatio="xMidYMid meet"
    >
      ${dots.join('')}
    </svg>
  `;
}

function renderInsights() {
  els.insightDeck.innerHTML = state.insights
    .map(
      (insight) => `
        <article class="insight-card" data-tone="${insight.tone}">
          <span class="insight-kicker">${insight.category}</span>
          <h4 class="insight-number">${insight.value}</h4>
          <p class="insight-text">${insight.text}</p>
          <p class="insight-source">${insight.source}</p>
        </article>
      `,
    )
    .join('');
}

function buildInsightDeck(profile, calc, datasets, reshuffle, limit = 6) {
  const pet = datasets.pets.find((entry) => entry.type === profile.petType) || datasets.pets[0];
  const parentVisits = { same_city: 52, same_country: 6, different_country: 1.5 };
  const friendMeetups = { weekly: 52, monthly: 12, rarely: 4 };
  const parentAges = profile.parentAges
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
  const parentExpectancy = 84;
  const parentWindowYears = profile.parentsAlive
    ? Math.min(
        calc.remainingYears,
        parentAges.length
          ? average(parentAges.map((age) => Math.max(parentExpectancy - age, 0)))
          : Math.max(calc.remainingYears * 0.55, 0),
      )
    : 0;

  const base = [
    {
      category: 'Reality',
      tone: 'reality',
      value: formatYears(calc.breakdown.sleep),
      text: `Of what remains, about ${formatYears(calc.breakdown.sleep)} will likely be spent asleep. Necessary, but still gone from the total.`,
      source: `Based on ${profile.routine.sleep.toFixed(2)} hours of sleep per day.`,
      score: 98,
    },
    {
      category: 'Reality',
      tone: 'reality',
      value: `${calc.freeHoursPerDay.toFixed(2)} h`,
      text: `Your daily margin for unplanned living is about ${calc.freeHoursPerDay.toFixed(2)} hours. That is the real container your future is happening inside.`,
      source: 'Calculated as 24 hours minus routine hours.',
      score: 99,
    },
    {
      category: 'Everyday',
      tone: 'everyday',
      value: formatInteger(calc.remainingWeeks),
      text: `You have about ${formatInteger(calc.remainingWeeks)} Friday evenings left. Weekly relief feels infinite until it becomes countable.`,
      source: 'Estimated from remaining projected weeks.',
      score: 95,
    },
    {
      category: 'Nature',
      tone: 'nature',
      value: formatInteger(calc.remainingYears),
      text: `You may have only ${formatInteger(calc.remainingYears)} more summers. Annual things sound abundant until you turn them into digits.`,
      source: 'One summer per projected remaining year.',
      score: 94,
    },
    {
      category: 'Everyday',
      tone: 'everyday',
      value: formatInteger(calc.remainingDays * 3),
      text: `You will eat roughly ${formatInteger(calc.remainingDays * 3)} more meals. A surprising amount of life arrives disguised as repetition.`,
      source: 'Assumes three meals per day.',
      score: 88,
    },
    {
      category: 'Nature',
      tone: 'nature',
      value: formatInteger(calc.remainingYears * 12.37),
      text: `There are around ${formatInteger(calc.remainingYears * 12.37)} full moons left in your line of sight, if you bother to look up.`,
      source: 'Uses 12.37 full moons per year.',
      score: 84,
    },
    {
      category: 'Reality',
      tone: 'reality',
      value: formatYears(calc.breakdown.screen),
      text: `If recreational screen time stays steady, about ${formatYears(calc.breakdown.screen)} of what remains will be spent staring into a lit rectangle.`,
      source: `Based on ${profile.routine.screen.toFixed(2)} leisure screen hours per day.`,
      score: 90,
    },
    {
      category: 'Reality',
      tone: 'reality',
      value: formatYears(calc.breakdown.commute),
      text: `Commuting alone consumes about ${formatYears(calc.breakdown.commute)} from the remainder. Small daily drains become whole chapters.`,
      source: `Based on ${profile.routine.commute.toFixed(2)} commute hours per day.`,
      score: profile.routine.commute > 0.25 ? 82 : 46,
    },
    {
      category: 'Everyday',
      tone: 'everyday',
      value: formatInteger(calc.remainingDays),
      text: `You will fall asleep about ${formatInteger(calc.remainingDays)} more times. Most of those nights will not announce that they mattered.`,
      source: 'One sleep cycle per remaining day.',
      score: 79,
    },
    {
      category: 'Nature',
      tone: 'nature',
      value: formatInteger(calc.remainingYears * 2),
      text: `There are roughly ${formatInteger(calc.remainingYears * 2)} solstices left. The grand astronomical markers are not endless either.`,
      source: 'Two solstices per year.',
      score: 77,
    },
  ];

  if (profile.parentsAlive) {
    base.push({
      category: 'People',
      tone: 'people',
      value: formatInteger(parentWindowYears * parentVisits[profile.parentDistance]),
      text: `At this distance, you may have only ${formatInteger(parentWindowYears * parentVisits[profile.parentDistance])} more ordinary visits with your parents.`,
      source: `Uses ${parentVisits[profile.parentDistance]} visits per year and the smaller of your remaining life or their estimated remaining window.`,
      score: 100,
    });
  }

  if (profile.children) {
    const yearsUntilAdult = Math.max(18 - profile.childAge, 0);
    base.push({
      category: 'People',
      tone: 'people',
      value: formatInteger(yearsUntilAdult * 52),
      text: `Your child has about ${formatInteger(yearsUntilAdult * 52)} weekends left before adulthood changes the texture of your time together.`,
      source: `Calculated from youngest child age ${profile.childAge}.`,
      score: 97,
    });
  }

  if (profile.pet) {
    const petYearsLeft = Math.max(pet.lifespan - profile.petAge, 0);
    base.push({
      category: 'People',
      tone: 'people',
      value: formatInteger(petYearsLeft * 365),
      text: `With a ${profile.petType.toLowerCase()} this age, you may have around ${formatInteger(petYearsLeft * 365)} more ordinary days together.`,
      source: `Uses an average ${profile.petType.toLowerCase()} lifespan of ${pet.lifespan} years.`,
      score: 96,
    });
  }

  base.push({
    category: 'People',
    tone: 'people',
    value: formatInteger(calc.remainingYears * friendMeetups[profile.friendFrequency]),
    text: `If your closest friendship keeps the same rhythm, there may be only ${formatInteger(calc.remainingYears * friendMeetups[profile.friendFrequency])} more meetups.`,
    source: `Based on a ${frequencyLabel(profile.friendFrequency)} cadence.`,
    score: 86,
  });

  const ordered = reshuffle ? shuffle(base) : [...base];
  return ordered.sort((a, b) => b.score - a.score).slice(0, limit);
}

function getExpectancy(country, table) {
  if (country === 'Global average') return 73.4;
  const match = table.find((entry) => entry.country === country);
  if (!match) return 73.4;
  return average([match.male, match.female]);
}

function buildReflection(calc) {
  if (calc.freeHoursPerDay < 1) {
    return 'This model is showing compression more than mortality. The days are so pre-filled that the remaining future is being reduced before it arrives.';
  }
  if (calc.freeHoursPerDay < 2.5) {
    return 'This is the uncomfortable band most adults occupy: enough freedom for meaning, not enough for carelessness.';
  }
  return 'You still have visible room inside the structure. The question is not whether time exists. It is whether attention will meet it.';
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function average(values) {
  return values.length ? sum(values) / values.length : 0;
}

function formatDuration(hours) {
  const totalDays = hours / 24;
  const years = Math.floor(totalDays / 365.25);
  const months = Math.floor((totalDays - years * 365.25) / 30.44);
  const days = Math.max(0, Math.floor(totalDays - years * 365.25 - months * 30.44));
  if (years <= 0 && months <= 0) return `${days} days`;
  return `${years} years, ${months} months, ${days} days`;
}

function formatYears(value) {
  if (value < 1) return `${(value * 12).toFixed(1)} months`;
  return `${value.toFixed(1)} years`;
}

function formatInteger(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value));
}

function frequencyLabel(key) {
  if (key === 'weekly') return 'weekly';
  if (key === 'monthly') return 'monthly';
  return 'a few times a year';
}

function deriveParentAgeString(age) {
  return `${Math.max(age + 28, 18)}, ${Math.max(age + 32, 18)}`;
}

function normalizeAgesText(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .join(', ');
}

function shuffle(items) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}
