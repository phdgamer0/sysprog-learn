/** Interactive components that can be embedded in lessons with {type:'interactive', id, props}. */
export const INTERACTIVES = {
  'fork-sim': 'Full fork()/wait()/exit() simulator running real mini-C code. props: { preset?: PresetId } where PresetId is one of the keys in src/sim/presets.ts',
  'argv-builder': 'Type a command line, see argc and the argv[] array with each character cell and the NULL terminator',
  'compile-builder': 'Choose source files and cc flags (-c, -o) and see which files are produced at each pipeline stage',
  'syscall-stepper': 'Step-by-step animation of getpid(): user mode -> trap -> kernel mode -> return',
  'syscall-classifier': 'Sorting game: decide whether each function (printf, sin, atoi, fork, read, getpid, strlen, ...) is a library call or a system call',
  'errno-lab': 'Simulate open() on existing/missing/forbidden file; see return value, errno, and perror() output',
  'timeslice': 'Multitasking: adjustable number of processes and time quantum, animated Gantt chart of task switching',
  'state-machine': 'Clickable process state diagram; only legal transitions are enabled; shows which syscall/event causes each',
  'zombie-timeline': 'Two sliders: time child exits and time parent calls wait; shows zombie interval or parent-blocked interval',
  'shell-sim': 'Shell running a program in foreground vs background (&): timeline of fork/exec/wait and prompt',
  'exec-vs-system': 'Side-by-side stepping of execl() (no return, same PID) and system() (returns, continues)',
  'memory-explorer': 'Click a variable in the sample program to highlight its segment (text/data/bss/heap/stack) with addresses from the slides',
  'unix-explorer': 'Clickable UNIX layer architecture; selecting a layer explains it and lists examples',
} as const;
export type InteractiveId = keyof typeof INTERACTIVES;
