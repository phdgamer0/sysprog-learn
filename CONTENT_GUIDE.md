# Content authoring guide

All course content lives in `src/content/` as typed TypeScript data. UI components never contain
course text. Types: `src/content/types.ts`. Run `npx vitest run src/content` to validate.

## Source material

The course is based on five Turkish lecture decks (`sys-prog-1.pdf` … `sys-prog-5.pdf`) and last
year's exam questions about `fork()`. Lesson text must agree with the slides. Where the slides are
simplified, ambiguous or use unusual terminology, **say so explicitly** in a `callout` with
`variant: 'source'` (title e.g. "Notlarla ilgili not / About the slides").

Known points that need such a callout:

- `sys-prog-5` labels the **heap** as "yığın" and the **stack** as "küme". Most Turkish literature
  uses *yığın = stack* and *öbek = heap*. Always show the English term next to the Turkish one.
- `sys-prog-4` says `wait(&s)` stores the child's exit value `x` in `s`. In real POSIX systems `s`
  holds an encoded status; the exit value is `WEXITSTATUS(s)` (= `(s >> 8) & 0xFF` on Linux).
- `sys-prog-4` says init (PID 1) creates all processes except 0 and 2 — on modern Linux, PID 2 is
  `kthreadd` and PID 0 is the idle/swapper task; the slides describe classic UNIX.
- Last year's exam code calls `wait()`/`exit()` while including only `<stdio.h>`, `<unistd.h>`,
  `<sys/types.h>`. Correct headers are `<sys/wait.h>` and `<stdlib.h>`.
- The slide's `execl("yeni_program", "yeni_program", 0)` should terminate the list with
  `(char *)NULL` / `(char *)0` to be strictly correct.
- The `getpid()` slide shows a "kayıt cihazı" (register) — the PID is returned through a CPU register.

## Languages

Every `LText` must contain **both** `tr` and `en`, with equivalent meaning. Write natural Turkish
(not machine-like), keeping the standard technical terms used in the slides: *işlem/proses*,
*ana işlem (parent)*, *alt işlem (child)*, *sistem çağrısı*, *çekirdek (kernel)*, *kabuk (shell)*,
*öksüz (orphan)*, *zombi*. On first use in a lesson, give the English term in parentheses in the
Turkish text and vice versa where useful (e.g. "alt işlem (child process)").

Inline markup in LText: `` `code` ``, `**bold**`, `*italic*`. No HTML.

C code blocks are language-neutral strings; if a code block has comments that should be translated,
use an `LText` for `code` (both versions must be the same program). `printf` texts in code
examples should stay as in the slides.

## Pedagogy

- Do **not** paste slide text. Explain: why it works, what happens step by step, what goes wrong.
- Each lesson: objectives (3–5), prerequisites, 3–6 sections, misconceptions (3–5), summary (4–7
  bullet points), practice questions (5–8, varied kinds, with explanations).
- Use diagrams (`src/diagrams/ids.ts`) and interactives (`src/interactives/ids.ts`) by id — only ids
  that exist there. `fork-sim` takes `props: { preset: '<id from src/sim/presets.ts>' }`.
- Any claim about program output must be verified with the simulator
  (`runProgram` / `exploreOutputs` in `src/sim/explore.ts`), or a real C compiler.
- Questions: avoid trivia, use plausible distractors, explanations say why the right answer is
  right and (for mcq, via `optionNotes`) why wrong ones are wrong.

## Adding things

- **Lesson**: add an object to a `src/content/lessons/m*.ts` file and list it in `lessons/index.ts`.
- **Question**: add it to `src/content/questions/q-m*.ts`; if its answer depends on running code,
  add a check to `questions/verify.test.ts`.
- **Exam**: add an entry to `src/content/exams.ts` (question ids from the bank).
- **Language**: add the code to `LANGS` in `src/i18n/langs.ts`, a dictionary in `src/i18n/ui.ts`,
  and the new key to every `LText`. `npx vitest run` lists every missing string.
