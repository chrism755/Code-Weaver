# 🖥️ CodeSpace — Live Code Playground

A fully client-side code playground you can host **for free** on GitHub Pages. No server needed.

## ✨ Features

| Feature | Details |
|---|---|
| **HTML / CSS / JS** | Live preview in an iframe |
| **JavaScript** | Console output with log, warn, error, info |
| **TypeScript** | Auto-transpiled via Babel Standalone |
| **Python** | Runs in-browser via [Pyodide](https://pyodide.org/) |
| **Multi-tab editor** | Open multiple files, switch between them |
| **Resizable panes** | Drag the divider between editor and output |
| **Line numbers** | Synced scrolling |
| **Keyboard shortcut** | `Ctrl+Enter` / `Cmd+Enter` to run |
| **Mobile support** | Toggle between editor and output |

---

## 🚀 Host on GitHub Pages (free)

### Option A — Upload the file directly

1. Create a new GitHub repository (public)
2. Upload `index.html` to the root of the repo
3. Go to **Settings → Pages → Source → Deploy from branch → main / root**
4. Visit `https://<your-username>.github.io/<repo-name>/`

### Option B — Git CLI

```bash
git init codespace
cd codespace
cp /path/to/index.html .
git add index.html
git commit -m "🚀 Launch CodeSpace"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then enable GitHub Pages in the repo settings.

---

## 🗂️ File structure

```
/
└── index.html   ← everything is in one self-contained file
```

No build step. No npm. No dependencies to install.

---

## 🛠️ Customisation tips

- **Default code**: Edit the `DEFAULTS` object in the `<script>` section of `index.html`
- **Theme colours**: Change CSS variables at the top of the `<style>` block
- **Add a language**: Add a case to `runCode()` and a default snippet to `DEFAULTS`

---

## 📄 License

MIT — do whatever you like with it.
