import type { Lesson } from '../types';
import { intro_sysprog, unix_history, unix_architecture } from './m1';
import { c_compilation, command_line_args } from './m2';
import { kernel_user_mode, syscall_errors } from './m3';
import { fork_basics, pids_orphans, wait_exit_zombie } from './m4';
import { exec_system, shell_processes, memory_layout } from './m5';

export const LESSONS: Lesson[] = [
  intro_sysprog, unix_history, unix_architecture,
  c_compilation, command_line_args,
  kernel_user_mode, syscall_errors,
  fork_basics, pids_orphans, wait_exit_zombie,
  exec_system, shell_processes, memory_layout,
].sort((a, b) => a.module.localeCompare(b.module) || a.order - b.order);

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
