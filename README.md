# project_DevSecOps

A minimal **Node.js + Express** web app wrapped in a complete **DevSecOps CI/CD pipeline**. The application itself is intentionally tiny — the real subject of this project is everything *around* the code: automated testing, dependency security scanning, and continuous deployment, all triggered automatically on every push.

This was built as a class/demo project by **Team 6**.

---

## Team Members

- Dipen Bhattarai
- Digdarshan Bohara
- Saugat Maharjan
- Sachin Acharya
- Sujal Budha Chettri
- Nirman Koirala

---

## What this project is about

**DevSecOps** is the practice of baking **Security** directly into the **Dev**elopment and **Op**erations lifecycle, instead of treating it as a separate step at the end. Rather than writing code, shipping it, and *then* checking for vulnerabilities, a DevSecOps pipeline runs security checks automatically as part of the normal build-and-deploy flow.

This repository demonstrates exactly that with a small Express server. Every time code is pushed to the `main` branch, GitHub Actions automatically:

1. Checks out the code
2. Installs dependencies
3. Runs the test suite
4. **Scans all dependencies for known security vulnerabilities (Snyk)**
5. Deploys the app to production (Vercel) — but only if every step above passed

If a test fails or a vulnerable dependency is found, the pipeline stops and the app is **never deployed**. This is the "shift-left" security idea in action: catch problems early and automatically, before they reach production.

---

## What this demonstrates

- **CI (Continuous Integration):** code is automatically built and tested on every push.
- **CD (Continuous Deployment):** passing code is automatically deployed live with no manual steps.
- **Security as code (the "Sec" in DevSecOps):** an automated [Snyk](https://snyk.io/) scan acts as a quality gate that blocks insecure dependencies from being deployed.
- **Pipeline as a gate:** deployment is *conditional* on tests and security checks passing — a core DevSecOps principle.
- **Infrastructure/config as code:** the entire pipeline and deployment setup lives in version-controlled files (`cicd.yml`, `vercel.json`), so the process is repeatable and auditable.

> Note: the dependency versions in `package.json` (e.g. older `lodash` / `minimatch`) are intentionally modest so the Snyk scan has something realistic to report on — that's part of the demonstration.

---

## What each file does

| File | Purpose |
|------|---------|
| [index.js](index.js) | The application itself — a small Express server with a single `GET /` route that returns a greeting. It also uses `lodash` and `minimatch` purely so the project has real third-party dependencies for the security scanner to analyze. It exports the `app` (via `module.exports`) so Vercel's serverless runtime can host it. |
| [package.json](package.json) | The project manifest. Declares metadata, dependencies (`express`, `lodash`, `minimatch`), the dev dependency `snyk`, and the npm scripts (`start`, `build`, `test`) that the pipeline calls. |
| [vercel.json](vercel.json) | Vercel deployment configuration. Tells Vercel to build `index.js` with the `@vercel/node` runtime and route **all** incoming requests (`/(.*)`) to it. |
| [.github/workflows/cicd.yml](.github/workflows/cicd.yml) | The heart of the project — the GitHub Actions CI/CD pipeline definition. Runs automatically on every push to `main` and orchestrates checkout → install → test → security scan → deploy. |
| [.gitignore](.gitignore) | Lists files/folders (like `node_modules`) that should not be committed to git. |
| [README.md](README.md) | This document. |

### Why the pipeline file matters most

[.github/workflows/cicd.yml](.github/workflows/cicd.yml) is where the DevSecOps story actually lives. Each step is a gate, and the steps run in order:

| Step | What it does | Why it matters |
|------|--------------|----------------|
| **Checkout Code** | Pulls the repo into the runner. | Every other step needs the source. |
| **Setup Node.js (v20)** | Installs the correct Node runtime. | Guarantees a consistent, reproducible build environment. |
| **Install Dependencies** | `npm install`. | Brings in the packages the app and the scanner need. |
| **Run Tests** | `npm test`. | The first quality gate — broken code stops the pipeline before deployment. |
| **Install + Auth Snyk** | Installs Snyk and logs in using a secret token. | Prepares the security scanner. |
| **Snyk Scan** | `snyk test --severity-threshold=medium`. | **The "Sec" gate.** Fails the build if any dependency has a medium-or-higher vulnerability — blocking insecure code from shipping. |
| **Deploy to Vercel** | Pulls Vercel env info and runs `vercel deploy --prod`. | The CD step — pushes the app live, but **only because every earlier gate passed**. |

---

## How to set this up yourself

### 1. Prerequisites

- [Node.js 20+](https://nodejs.org/) and npm
- A [GitHub](https://github.com/) account (to host the repo and run Actions)
- A free [Snyk](https://snyk.io/) account (for the security scan)
- A free [Vercel](https://vercel.com/) account (for deployment)

### 2. Clone and run locally

```bash
git clone https://github.com/<your-username>/project_DevSecOps.git
cd project_DevSecOps
npm install
npm start
```

> Heads up: `index.js` exports the Express `app` for Vercel's serverless runtime but does **not** call `app.listen(...)`, so `npm start` won't open a local port on its own. To run it locally as a normal server, add a small entry point, e.g.:
>
> ```js
> // server.js
> const app = require('./index');
> app.listen(3000, () => console.log('Running on http://localhost:3000'));
> ```
>
> then run `node server.js` and visit <http://localhost:3000>.

### 3. Run the checks the pipeline runs

```bash
npm test          # run the tests
npx snyk auth     # one-time: log in to Snyk
npx snyk test     # run the dependency security scan locally
```

### 4. Wire up the CI/CD pipeline

The pipeline runs automatically once you push to `main`, but it needs a few **GitHub Actions secrets** to authenticate with Snyk and Vercel. In your GitHub repo, go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret name | Where to get it |
|-------------|-----------------|
| `SNYK_TOKEN` | Snyk dashboard → Account Settings → Auth Token |
| `VERCEL_TOKEN` | Vercel dashboard → Account Settings → Tokens |
| `VERCEL_ORG_ID` | From `vercel pull` locally, or the Vercel project settings (`.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | Same place as the Org ID |

> Tip: run `npm i -g vercel && vercel link` once locally to create the Vercel project and reveal your `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.

### 5. Trigger the pipeline

```bash
git add .
git commit -m "Trigger DevSecOps pipeline"
git push origin main
```

Open the **Actions** tab in your GitHub repo to watch the pipeline run. If every stage is green, your app is automatically deployed live on Vercel. If a test fails or Snyk finds a vulnerability, the run goes red and deployment is skipped — which is exactly the behavior this project is meant to demonstrate.

---

## License

MIT
