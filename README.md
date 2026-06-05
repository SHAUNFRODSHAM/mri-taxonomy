# MRI ERP Implementation Taxonomy

A browser-based interactive process map for MRI Software ERP implementations. Gives implementation consultants a structured, clickable taxonomy of business processes across four MRI modules — **Commercial Management (CM)**, **General Ledger (GL)**, **Accounts Payable (AP)**, and **Residential Management (RM)**.

Consultants can browse processes by module, view business rationale and MRI setup requirements, customise content in Edit Mode, save named client-specific versions, and export Word or PDF documents for client delivery.

---

## Setup — step by step

Follow these steps in order from a clean machine. Skip any step you have already completed.

---

### Step 1 — Install Node.js

Node.js is required to run the development server and install packages.

1. Go to https://nodejs.org
2. Download the **LTS** version (v18 or later)
3. Run the installer, accepting all defaults
4. Verify the install — open a new terminal and run:

```
node --version
npm --version
```

Both commands should print a version number. If they don't, restart your terminal and try again.

---

### Step 2 — Install Git

Git is required to clone the repository and manage code changes. You can use the command-line Git tool, or GitHub Desktop for a visual interface — either works.

**Option A — GitHub Desktop (recommended for most users):**

1. Go to https://desktop.github.com
2. Download and run the installer
3. Sign in with your GitHub account
4. Use **File → Clone Repository** to clone the repo — no terminal needed

GitHub Desktop bundles Git, so if you choose this option you do not need to install Git separately.

**Option B — Git command line:**

1. Go to https://git-scm.com/downloads
2. Download the installer for your OS and run it, accepting all defaults
3. Verify:

```
git --version
```

---

### Step 3 — Install VS Code

1. Go to https://code.visualstudio.com
2. Download and run the installer
3. During install on Windows, tick **"Add to PATH"** so you can open VS Code from the terminal

---

### Step 4 — Install Claude Code

Claude Code is Anthropic's AI coding assistant that runs in the terminal. It reads `CLAUDE.md` automatically when you start it in this project, giving it full context of the data schema, content rules, and architecture.

**Option A — run without installing (npx):**

```
npx @anthropic-ai/claude-code
```

**Option B — install globally so you can just type `claude`:**

```
npm install -g @anthropic-ai/claude-code
```

Verify:

```
claude --version
```

On first run, Claude Code will prompt you to log in with your Anthropic account. Follow the prompts in the terminal.

---

### Step 5 — Clone the repository

Open a terminal and run:

```
git clone <repo-url>
cd mri-taxonomy
```

Replace `<repo-url>` with the actual repository URL from GitHub.

---

### Step 6 — Install project dependencies

From inside the `mri-taxonomy` folder:

```
npm install
```

This installs Vite and all other packages listed in `package.json` into a local `node_modules/` folder. You only need to do this once, or again after pulling changes that update `package.json`.

---

### Step 7 — Open the project in VS Code

**From the terminal:**

```
code .
```

**Or from VS Code:**

1. Open VS Code
2. Go to **File → Open Folder**
3. Select the `mri-taxonomy` folder

---

### Step 8 — Install recommended VS Code extensions (optional but useful)

Once the project is open in VS Code, install these extensions for a better editing experience:

- Search for **ESLint** by Microsoft — `dbaeumer.vscode-eslint`
- Search for **Prettier** by Prettier — `esbenp.prettier-vscode`

To open the Extensions panel: `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS).

---

### Step 9 — Start the development server

Open the integrated terminal in VS Code with `` Ctrl+` `` (Windows/Linux) or `` Cmd+` `` (macOS), then run:

```
npm run dev
```

The terminal will print:

```
VITE v5.x.x  ready in Xms
➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser. The app loads immediately. Any changes you save to source files are reflected in the browser instantly — no manual refresh needed.

---

### Step 10 — Start Claude Code

Open a **second terminal tab** in VS Code (click the `+` icon in the terminal panel), make sure you are in the `mri-taxonomy` folder, then run:

```
claude
```

Claude Code will read `CLAUDE.md` and be ready to help. You can now ask it to edit data files, add new processes, fix bugs, or explain how the app works — while the dev server keeps running in the first terminal tab.

**Useful Claude Code commands once it is running:**

| Command | What it does |
|---|---|
| `/help` | List all available commands |
| `/clear` | Clear the conversation and start fresh |
| `Ctrl+C` | Cancel the current response |
| `Ctrl+D` | Exit Claude Code |

---

## Day-to-day workflow

Once setup is complete, the daily workflow is:

1. Open the project in VS Code — `code .` from the `mri-taxonomy` folder
2. Start the dev server — `npm run dev` in one terminal tab
3. Start Claude Code — `claude` in a second terminal tab
4. Make changes (via Claude Code or directly in the editor) and review them at http://localhost:5173
5. Commit changes — `git add` and `git commit` when done

---

## npm script reference

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:5173 with hot reload |
| `npm run build` | Build for production — output goes to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Project structure

```
index.html              # App shell — tab bar, topbar, canvas
src/
  main.js               # Bootstrap, event wiring, tab switching, undo/redo, versions
  state.js              # Central state + helpers
  versions.js           # localStorage CRUD for named version snapshots
  data/
    index.js            # Registers all modules
    cm.js               # Commercial Management data
    gl.js               # General Ledger data
    ap.js               # Accounts Payable data
    rm.js               # Residential Management data
  components/
    grid.js             # Column/process/sub card grid
    panel.js            # Right-side detail panel
    editModal.js        # In-place edit modal
    addModal.js         # Add column/process/sub modal
    genModal.js         # Generate Doc modal (Word + PDF export)
    versionMenu.js      # Versions side panel
  styles/
    main.css            # All styles
```

---

## Modules

| Module | Key | Columns |
|--------|-----|---------|
| Commercial Management | `cm` | Lease Lifecycle, Billing, Collections, CAM Recovery, Retail, FASB, Period Close |
| General Ledger | `gl` | Financial Structure, Journals, Budgets, Period/Year Close, Reporting |
| Accounts Payable | `ap` | Supplier Mgmt, Invoice Approval, Invoice Mgmt, Payments, Reconciliation, Compliance |
| Residential Management | `rm` | Leasing, Residents, Billing, Deposits, Maintenance, Vendor/AP, Month-End |

---

## Key features

- **Interactive process map** — click any process or sub-process card to see the business description, activities, MRI setup prerequisites, and associated MRI screens
- **Edit Mode** — add, edit, or remove columns, processes, and sub-processes directly in the browser
- **Versioning** — save named snapshots per client; versions persist in `localStorage` in the same browser
- **Document export** — generate a Word (`.doc`) or PDF from the current module for client delivery
- **Undo** — up to 20 steps; revert individual tabs or the entire app to original data

---

## Editing content

Data files live in `src/data/`. Edit them directly for permanent content changes — the dev server picks up changes instantly.

- `src/data/cm.js` — Commercial Management
- `src/data/gl.js` — General Ledger
- `src/data/ap.js` — Accounts Payable
- `src/data/rm.js` — Residential Management

See `CLAUDE.md` for the full data schema and content writing rules.

---

## Notes on versioning

- Client versions are stored in the **browser's `localStorage`** — they do not sync between machines
- To share content changes with teammates, edit the data files and commit to git
- `ORIGINAL_DATA` is frozen at load time; **Reset to Original** always restores the committed data files

---

## Tech stack

- [Vite 5.4](https://vitejs.dev/) — build tool and dev server
- Vanilla JavaScript (ES modules) — no framework, no TypeScript
- Entirely client-side — no backend or database
