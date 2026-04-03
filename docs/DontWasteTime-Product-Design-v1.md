# Don't Waste Time — Product Design Document

**Version:** 1.0  
**Date:** 3 April 2026  
**Author:** Praveen (Easyrun)

---

## 1. The Idea in One Line

A memento mori dashboard that strips away routine time from your remaining life and shows you the raw, emotional truth of how little free time you actually have left for the things that matter.

---

## 2. Competitive Landscape

The "life visualization" space has several players, but none nail the specific angle this product targets.

**Wait But Why / Life in Weeks (2014 origin)**
Tim Urban's iconic blog post spawned an entire category. Shows your life as a grid of weekly squares, colour-coded by phase. Multiple clones exist (lifeweeks.app, bryanbraun.com, loggd.life). Limitation: it's a static grid. No routine subtraction, no emotional insight generation, no personalization beyond birth date.

**howmuchlife.com**
Closest competitor. Breaks down daily activities and shows lifetime accumulation as a monthly grid. Good concept but the execution is basic, the insights are generic (how much time sleeping/working over lifetime), and it doesn't get into the emotionally resonant stuff (time with parents, time with pets, sunsets remaining).

**Life Left (Android app)**
Visual month blocks, life clock, countdown timer. Charges for "hard mode" monthly notifications. No routine subtraction, no relationship-based insights.

**LifeDots / Life Time Visualizer**
Focused specifically on screen time visualization, not comprehensive life breakdown.

**Sage Calculator / Time Remaining Calculator**
Utility-style calculator with progress bars. Functional but zero emotional design, no shareability, no insight engine.

**The Gap (Your Opportunity)**
Nobody is combining all three of these:
1. Subtracting routine time (sleep, commute, work, hygiene, chores) from remaining lifespan
2. Generating deeply personal, emotionally resonant insights (time with parents, pets, children, nature events)
3. Wrapping it in a visually stunning, shareable, mobile-first experience

The closest thing is howmuchlife.com for #1 and Wait But Why for inspiration, but neither delivers the gut-punch emotional clarity you're describing. That's the white space.

---

## 3. Core Concept: "The Real Time You Have Left"

The fundamental insight is this: people think they have X years left, but once you subtract the non-negotiable daily routines, the actual discretionary time is shockingly small. And when you further filter that by context (time with specific people, seasonal experiences, natural phenomena), the numbers become almost unbearably small in the best possible way.

**The emotional arc of the experience:**

1. **Entry** — user provides age, gender, country (for life expectancy), and basic routine info
2. **The Subtraction** — animated visualization strips away sleep, work, commute, hygiene, meals, chores
3. **The Reveal** — the remaining "free" time is displayed as a stunningly small number
4. **The Insights** — context-specific gut-punches: "You have ~X more summers with your dad", "Your dog has ~Y weekends left with you"
5. **The Shift** — call to action. Not productivity porn. A genuine invitation to presence.

---

## 4. User Input (Onboarding Flow)

The onboarding should feel like a conversation, not a form. Each step on its own screen/card with large type and minimal UI.

### Step 1: The Basics
- **Date of birth** (date picker)
- **Gender** (Male / Female / Non-binary) — affects life expectancy estimate
- **Country of residence** (dropdown, affects life expectancy, weather data, seasonal events)
- **Country of origin / heritage** (optional — for gene pool life expectancy adjustment)

### Step 2: Your Routine (Sliders, Pre-filled with Smart Defaults)
All values in hours per day unless noted.

| Activity | Default (Adult) | Default (Student) | Range |
|---|---|---|---|
| Sleep | 7.5 | 8.5 | 4-12 |
| Work / School | 8.0 | 6.5 | 0-16 |
| Commute | 1.0 | 0.5 | 0-4 |
| Meals (cooking + eating) | 1.5 | 1.0 | 0.5-4 |
| Personal hygiene (shower, teeth, toilet, grooming) | 0.75 | 0.5 | 0.25-2 |
| Household chores (cleaning, laundry, errands) | 1.0 | 0.5 | 0-3 |
| Screen time (non-work social media, TV, scrolling) | 2.0 | 3.0 | 0-8 |
| Phone / digital admin | 0.5 | 0.5 | 0-3 |

**Total routine burden (default adult):** ~22.25 hours/day  
**Remaining discretionary time:** ~1.75 hours/day  

(This is the gut-punch moment.)

### Step 3: Your People & Things (Optional, Unlocks Best Insights)
- **Parents alive?** (Yes/No, their approximate ages)
- **Children?** (Yes/No, ages — affects "time before they leave home")
- **Partner/Spouse?** (Yes/No)
- **Pets?** (Type — dog/cat/bird/etc., age, breed — for pet life expectancy)
- **Close friends you see regularly?** (How often — weekly/monthly/rarely)
- **Where do your parents live?** (Same city / Same country / Different country — affects visit frequency)

### Step 4: Your Place (For Nature/Seasonal Insights)
- Auto-detect location or manual city entry
- Used to calculate: rainy days per year, sunny days, snowfall days, sunrise/sunset patterns

---

## 5. Life Expectancy Engine

### Data Sources
- **WHO life tables** by country, gender (global coverage)
- **UN World Population Prospects 2024** — the most comprehensive dataset
- Fallback to regional averages when country-specific data is unavailable

### Key Reference Points (2024 data)
- India (male): 70.2 years
- Australia (both): 84 years
- Japan: 84.8 years (highest)
- Global average: 73.4 years (male 70.8, female 76.0)
- USA: 79.0 years (2024 estimate, rebounded from COVID dip)

### Adjustments (Optional, Phase 2)
- Smoker: -10 years
- Regular exercise: +3 years
- Heavy drinker: -5 years
- Vegetarian/Mediterranean diet: +2 years
- Family history of longevity (parents lived past 85): +3 years
- Existing health conditions: user-adjustable slider

### The Formula
```
remaining_life_years = life_expectancy - current_age
remaining_days = remaining_life_years * 365.25
routine_hours_per_day = SUM(all routine activities)
free_hours_per_day = 24 - routine_hours_per_day
total_free_hours_remaining = free_hours_per_day * remaining_days
```

Separate calculations for weekdays vs weekends (work hours differ).

---

## 6. The Insight Engine (The Soul of the Product)

This is what makes this product different from everything else. Each insight should hit like a line of poetry. Short, specific, personal.

### Category 1: Time with People

| Insight | Calculation Logic |
|---|---|
| "You have approximately **N more visits** with your parents" | (parent_remaining_life OR your_remaining_life, whichever is less) * visit_frequency_per_year |
| "Your child will leave home in about **N years**. That's **M weekends**" | (18 - child_age) * 52 weekends, minus routine time |
| "You've already spent **X%** of the time you'll ever spend with your parents" | Based on: intensive daily contact (0-18), then declining visit frequency |
| "You have **N dog-walks** left with [pet name]" | Pet remaining lifespan (by breed) * walks_per_day * 365 |
| "If you see your best friend once a month, you have **N meetups** left" | remaining_years * 12 |

### Category 2: Natural Phenomena

| Insight | Calculation Logic |
|---|---|
| "You have about **N more summers** left" | remaining_years (trivial but powerful when displayed big) |
| "You'll see approximately **N more full moons**" | remaining_years * 12.37 |
| "Based on [city]'s weather, you have ~**N rainy days** left to enjoy" | remaining_years * avg_rainy_days_per_year_for_location |
| "You'll experience about **N more sunrises** (if you wake up for them)" | remaining_days * probability_of_waking_before_sunrise |
| "There are roughly **N solstices** left in your lifetime" | remaining_years * 2 |
| "You have approximately **N more cherry blossom / autumn leaf seasons**" | remaining_years (location-dependent seasonal events) |
| "If Melbourne gets ~50 clear nights a year, you have **N more chances** to see the stars properly" | remaining_years * clear_nights |

### Category 3: Everyday Moments

| Insight | Calculation Logic |
|---|---|
| "You'll eat roughly **N more meals**" | remaining_days * 3 |
| "You have **N more Friday evenings** — the moment the week exhales" | remaining_weeks |
| "About **N more hot showers** where your best ideas find you" | remaining_days |
| "Approximately **N more times** you'll hear a song that stops you in your tracks" | Estimate: ~once a week = remaining_weeks |
| "About **N more chances** to smile at a stranger" | remaining_days * average_encounters |
| "You'll fall asleep roughly **N more times**. Some nights you won't want to. Others, you'll barely notice." | remaining_days |

### Category 4: The Reality Checks

| Insight | Calculation Logic |
|---|---|
| "Of your remaining **X years**, you'll spend **Y years** sleeping" | remaining_days * sleep_hours / 24 |
| "You'll spend about **Z months** in the bathroom" | remaining_days * bathroom_minutes / (60*24*30) |
| "Commuting will consume roughly **W months** of your remaining life" | remaining_days * commute_hours / (60*24*30) |
| "If you scroll for 2 hours a day, that's **V months** of your remaining life looking at a screen recreationally" | remaining_days * screen_hours / 24 / 365 in years |

### Category 5: For Children (Age-Appropriate, Shown When User Age < 18)

| Insight | Calculation Logic |
|---|---|
| "You have **N school mornings** left before you graduate" | (graduation_year - current_year) * ~200 school days |
| "About **N more bedtime stories** (if someone still reads to you)" | Based on age, declining |
| "You'll have roughly **N more summer holidays** as a kid" | (18 - age) |

### Insight Display Rules
- Show 8-12 insights per session, curated by relevance
- Rotate insights on refresh (keep it fresh)
- Each insight should have a source note (e.g., "Based on WHO life expectancy for males in Australia")
- Never show the same set twice in a row
- Allow users to favourite/save insights
- Allow users to share individual insights as image cards (key virality mechanism)

---

## 7. Visual Design Direction

### Aesthetic: "Quiet Brutalism meets Memento Mori"

This isn't a cheerful productivity app. It's a meditation. The design should feel like standing in a gallery looking at something beautiful and uncomfortable.

### Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#0A0A0A` | Primary background — near-black |
| `--surface` | `#141414` | Card/panel backgrounds |
| `--text-primary` | `#F5F0EB` | Warm off-white, main text |
| `--text-secondary` | `#8A8580` | Muted warm grey |
| `--accent` | `#E8C170` | Warm amber/gold — for key numbers |
| `--accent-soft` | `#D4956A` | Terracotta — for secondary emphasis |
| `--danger` | `#C45B4A` | Warm red — for "time spent/lost" |
| `--nature` | `#7BA68A` | Muted sage — for nature insights |
| `--people` | `#9B8EC4` | Soft lavender — for relationship insights |

### Typography

- **Display / Hero Numbers:** "Instrument Serif" (Google Fonts) or "Playfair Display" — large, elegant, serif. The big numbers need to feel like they carry weight.
- **Body / Insight Text:** "Satoshi" or "General Sans" — clean geometric sans, high legibility.
- **Accent / Labels:** "JetBrains Mono" — for data-adjacent labels and small counters.

### Layout Principles

1. **The hero number is everything.** When you first see your "free time remaining," it should be the only thing on the screen. Enormous. Centered. Let it breathe.
2. **Progressive disclosure.** Don't overwhelm. Scroll down to discover more insights. Each one gets its own generous viewport space.
3. **Dark mode by default.** Light mode as a toggle. The dark theme creates the contemplative mood.
4. **Minimal chrome.** No navbars, no footers. Just content. The UI should feel like it's barely there.
5. **Animation is breath.** Slow, purposeful transitions. Numbers should count up/down slowly, not snap. The "subtraction" animation (stripping away routine time) should feel like watching sand fall.

### Key Visual Components

#### The Hourglass Visualization (Hero Section)
A stylized hourglass or sand-timer that fills/empties as you scroll. The top half represents total remaining life. The bottom half (falling sand) represents routine time. What's left in the middle — suspended — is your free time. This is the signature visual.

#### The Grid (Life in Context)
A dot/block grid showing your entire life. Each block = 1 month. Lived months are filled (warm gradient from birth to now). Remaining months are outlined. Routine months within the remaining are dimmed/greyed. The bright remaining blocks are your actual free time.

#### Insight Cards
Full-width cards with a single insight each. Large serif number on the left. Poetic description on the right. Subtle background gradient matching the insight category colour.

#### The Share Card Generator
Each insight can be exported as a beautiful image card (1080x1080 for Instagram, 1200x675 for Twitter/X). Dark background, serif number, clean text. Watermarked with "dontwastetime.com" or whatever the final domain is.

---

## 8. Technical Architecture

### Phase 1: Static Web App (MVP)

**Stack:**
- Next.js 14+ (App Router) on Cloudflare Pages (zero hosting cost, your existing setup pattern)
- React with Framer Motion for animations
- Tailwind CSS for styling
- All calculations client-side (no backend needed for MVP)
- Life expectancy data as a static JSON file (WHO/UN data, ~200 countries)

**Data Files (bundled, no API needed):**
- `life-expectancy.json` — country, gender, life expectancy at birth
- `pet-lifespans.json` — breed/type, average lifespan
- `weather-data.json` — city, avg rainy days, sunny days, clear nights per year
- `routine-defaults.json` — age-group based default routine values

**No backend, no database, no auth.** Everything runs in the browser. Privacy by design — no data ever leaves the device.

### Phase 2: Enhanced

- **Supabase** for optional user accounts (save your profile, track changes over time)
- **Share API** — generate shareable insight cards server-side (or use html2canvas client-side)
- **PWA** — installable on mobile, optional weekly notification ("You used 7 of your N remaining weekends this month")
- **API for embeds** — let other sites embed the "time remaining" widget

### Hosting & Domain

The domain `dontwastetime.com` appears to not be in use as a product (there's a UK company registered with that name, and an Australian lifestyle site at dwtlifestyle.com.au). Worth checking availability directly. Alternatives if taken:

- `timeleft.life`
- `yourtimeleft.com`
- `dontwastelife.com`
- `timeremaining.life`
- `lifeindays.co`
- `precious.time` (new TLD)

---

## 9. Monetisation (Keep It Honest)

This is a "give first" product. The free experience should be complete and valuable.

**Free tier (forever):**
- Full calculation engine
- All insight categories
- Share cards
- No signup required

**Optional paid tier ("Presence" — one-time $4.99 or $2.99/month):**
- Weekly email/push digest ("This week you have N weekends left with your dog. Go for a long walk.")
- Historical tracking (see how your free time changes as you adjust routines)
- "Family mode" — add multiple family members, see overlapping time windows
- Custom insight creation ("How many more chess games will I play?")
- Print-quality PDF life poster (Wait But Why style, but with your personalised data)
- Ad-free experience (if free tier shows minimal, respectful sponsor cards)

**Affiliate / Sponsor (tasteful, optional):**
- "Reclaim 30 minutes a day" — link to meditation apps, time-management tools
- Never interruptive. Only at the very bottom of the page after all insights.

---

## 10. Information Architecture (Sitemap)

```
/                       → Landing page + onboarding flow
/dashboard              → Main dashboard (after input)
/insights               → Full list of personalised insights
/insights/[category]    → Filtered view (people, nature, everyday, reality)
/share/[insight-id]     → Public share page for a single insight card
/about                  → The why behind the project
/methodology            → How calculations work, data sources, assumptions
/privacy                → Privacy policy (we store nothing)
```

---

## 11. User Flows

### Flow 1: First Visit (Cold Traffic)

1. Landing page — dark, moody. One line: "How much time do you really have left?"
2. CTA: "Find out" (no signup)
3. Step-by-step onboarding (4 screens, ~90 seconds)
4. The reveal animation — routine time gets subtracted visually
5. Dashboard with hero number + scrollable insights
6. Share prompt at bottom

### Flow 2: Return Visit

1. Dashboard loads instantly (data in localStorage)
2. Fresh insight rotation
3. "Update your routine" link in corner

### Flow 3: Shared Link Click

1. See the specific insight card (e.g., "Praveen has 2,340 weekends left")
2. CTA: "Calculate your own"
3. Into onboarding flow

---

## 12. Key Assumptions & Data Sources

### Daily Routine Assumptions (Default Adult, 30-65)

| Activity | Hours/Day | Source |
|---|---|---|
| Sleep | 7.5 | National Sleep Foundation recommendation |
| Work | 8.0 | Standard full-time |
| Commute | 1.0 | Australian average ~30 min each way |
| Meals | 1.5 | OECD average |
| Hygiene | 0.75 | Estimated (shower 10min, teeth 6min, toilet 15min, grooming 14min) |
| Chores | 1.0 | ABS Time Use Survey ~7 hrs/week |
| Screen (leisure) | 2.0 | Nielsen / eMarketer average |
| Digital admin | 0.5 | Estimated |

### Parent Visit Frequency Assumptions

| Living Situation | Visits/Year |
|---|---|
| Same city | 52 (weekly) |
| Same country, different city | 6 |
| Different country | 1-2 |

### Pet Life Expectancy (Top Breeds)

| Type | Average Lifespan |
|---|---|
| Labrador Retriever | 10-12 years |
| Jack Russell Terrier | 13-16 years |
| Golden Retriever | 10-12 years |
| Cat (indoor) | 12-18 years |
| Cat (outdoor) | 5-10 years |
| Budgerigar | 5-8 years |

---

## 13. Emotional Design Principles

1. **Never guilt. Always awaken.** The tone is gentle, philosophical, not anxious. This is not "you're wasting your life." It's "here's what's left — isn't it precious?"

2. **Specificity creates emotion.** "You have 47 years left" is abstract. "You have about 2,444 Friday evenings left" hits different. Always choose the specific over the general.

3. **The smallest numbers are the most powerful.** "You have ~18 more visits with your parents" is more affecting than "You have 35 more years." Find the insights where the number is surprisingly small.

4. **Poetic but not pretentious.** The writing voice should be warm, direct, slightly wistful. Like a wise friend at 2am, not a self-help guru.

5. **Respect the weight.** Some people will see this and feel grief. That's natural and okay. Don't try to fix it with a "but here's how to optimise!" CTA. Let the feeling land. Offer a gentle "This can feel heavy. That's the point. It means you care."

6. **Cultural sensitivity.** Different cultures have very different relationships with mortality. The default should be universal, but avoid assumptions about family structure, religion, or afterlife.

---

## 14. MVP Feature Scope (Phase 1 Checklist)

**Must Have:**
- [ ] Onboarding flow (4 steps)
- [ ] Life expectancy calculation by country + gender
- [ ] Routine time subtraction engine
- [ ] Hero "free time remaining" display with animation
- [ ] Life grid visualization (months as blocks)
- [ ] 15-20 pre-built insight templates
- [ ] Insight card share (generate image client-side)
- [ ] Mobile-responsive design
- [ ] Dark mode (default)
- [ ] Privacy-first (all data in localStorage, nothing leaves device)
- [ ] Methodology page with sources

**Nice to Have (Phase 1):**
- [ ] Light mode toggle
- [ ] Onboarding animations (sand falling, time stripping)
- [ ] Social meta tags (OG image per shared insight)
- [ ] PWA manifest (installable)
- [ ] Keyboard accessible

**Phase 2:**
- [ ] User accounts (Supabase)
- [ ] Weekly digest notifications
- [ ] Family mode
- [ ] Pet breed life expectancy lookup
- [ ] Weather/seasonal data by city (for nature insights)
- [ ] Custom insight builder
- [ ] Print PDF poster
- [ ] Routine comparison over time

---

## 15. Naming & Domain Strategy

**Primary candidates:**

| Name | Vibe | Domain Status |
|---|---|---|
| Don't Waste Time | Direct, memorable, action-oriented | dontwastetime.com — check availability |
| Time Left | Clean, simple | timeleft.life — likely available |
| Precious Time | Emotional, warm | precioustime.co — check |
| The Real Time | Factual, punchy | therealtime.life — check |
| Life Minus | Mathematical, clever | lifeminus.com — check |
| Finite | One word, powerful | finite.life — check |

**Recommended:** "Finite" or "Don't Waste Time" — both are memorable and communicate the core concept instantly. "Finite" has the advantage of being one word, works across languages, and the .life TLD feels perfect.

---

## 16. Go-to-Market (Organic First)

1. **Build the MVP** — Next.js on Cloudflare Pages, 2-3 week build
2. **Personal launch** — Share your own dashboard/insights on LinkedIn, Twitter/X
3. **Reddit** — Post to r/dataisbeautiful, r/InternetIsBeautiful, r/productivity, r/GetMotivated
4. **Product Hunt** — Classic indie launch
5. **Hacker News** — "Show HN: I built a memento mori dashboard"
6. **Share mechanic is the growth engine** — every insight card has the URL watermarked. People share their "N weekends with parents" card, friends calculate their own.

The Wait But Why audience (millions of readers) is the perfect target. Tim Urban's "Your Life in Weeks" is the gateway drug. This product is the personalised, emotional, interactive evolution of that concept.

---

## 17. Quick Wireframe Descriptions

### Screen 1: Landing
- Full viewport, dark background
- Center: "How much of your life is really yours?"
- Subtitle: "Find out in 90 seconds"
- Single button: "Calculate"
- Subtle animated sand particles falling in background

### Screen 2-5: Onboarding Steps
- One question per screen
- Large, friendly text
- Slider interactions for time inputs
- Progress indicator (4 dots)
- Back/Next navigation

### Screen 6: The Reveal
- Animated sequence: total remaining life shown first (big number)
- Then routine categories peel away one by one (each shrinks the number)
- Sleep: -X years... Work: -X years... Commute: -X months...
- Final number lands: "Your actual free time: X years, Y months, Z days"
- The number should feel small. That's the design working.

### Screen 7: Dashboard
- Hero: "X years, Y months of free time remaining" in large serif
- Below: Life grid (scrollable horizontal)
- Below: Insight cards (vertical scroll, one per viewport height)
- Floating share button on each card
- Bottom: "Adjust your routine" link + methodology link

---

*This document is the blueprint. The next step is building the interactive React prototype. Ready when you are.*
