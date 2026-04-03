# Don't Waste Time

A static, client-side memento mori dashboard that estimates remaining lifespan, subtracts routine time, and turns what remains into a more emotionally legible set of insights.

## What is included

- Landing page with a strong visual identity and hourglass motif
- Four-step onboarding flow
- Routine subtraction reveal
- Dashboard with hero metric, life grid, reflection panel, and rotating insight cards
- Local browser persistence using `localStorage`
- Static supporting pages: `about.html`, `methodology.html`, `privacy.html`
- Client-side share export as downloadable SVG cards

## Run locally

From the project root:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/dont-waste-time/`.

## Deploy to GitHub Pages

This project is plain static HTML/CSS/JS, so it can be published directly from the repository root or a `docs/` folder in GitHub Pages settings.

Recommended structure after pushing to GitHub:

1. Keep the app at the repository root.
2. In GitHub repository settings, enable Pages.
3. Set the source to `Deploy from a branch`.
4. Choose the default branch and `/ (root)`.

## Notes

- All profile data stays in the browser.
- The bundled life expectancy and weather tables are indicative MVP datasets, not actuarial advice.
