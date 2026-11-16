# SysProg Lab — System Programming, interactively

An offline-capable, bilingual (Türkçe / English) learning site for the *Sistem Programlama* course
(lecture notes `sys-prog-1 … 5`): UNIX, C compilation, `argc/argv`, system calls & `errno`,
`fork()/wait()/exit()`, orphans & zombies, `execl()/system()`, the shell, and process memory layout.

- **13 lessons** in 5 modules, each with objectives, prerequisites, explanations, SVG diagrams,
  interactive demos, misconceptions, summary and practice questions.
- **Process Lab** — a real fork() simulator: a small C interpreter (`src/sim/`) that runs every process
  of a program, lets you choose which process runs next, undo steps, view the process tree,
  stdio buffering, orphans/zombies, and enumerates **every possible output** of a program.
- **6 exams + custom exams** from a 114-question bank (9 question types incl. process-tree building),
  timed, shuffled, with review and per-topic scores.
- Progress tracking in `localStorage` (export/import), dark/light theme, mobile layout.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # simulator, grading, content validation, UI smoke tests
npm run build      # -> dist/
```

## Deploy to GitHub Pages

1. Create a GitHub repository and push this folder to its `main` branch.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` tests, builds and publishes on every push.
   The site appears at `https://<user>.github.io/<repo>/`.

No base-path configuration is needed: the build uses relative asset paths and hash routing
(`#/lesson/fork-basics`), so it works under any sub-path and on page reload.

## Project structure

| Path | Contents |
| --- | --- |
| `src/content/` | All course content as typed data: `lessons/m1…m5.ts`, `questions/q-m1…m5.ts`, `exams.ts`, `glossary.ts`, `types.ts` |
| `src/i18n/` | Language list and UI dictionaries (`ui.ts`) |
| `src/sim/` | C-subset parser, compiler, multi-process VM, output explorer, presets |
| `src/diagrams/` | SVG diagrams (bilingual), referenced from content by id |
| `src/interactives/` | Interactive widgets (fork simulator, argv builder, cc builder, …) |
| `src/components/`, `src/pages/` | UI |

See `CONTENT_GUIDE.md` for how to add lessons, questions or a new language.
Every program-output answer in the question bank is checked against the simulator in
`src/content/questions/verify.test.ts`.
