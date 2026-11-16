import type { Module } from './types';

export const MODULES: Module[] = [
  {
    id: 'm1',
    title: { tr: 'Sistem Programlama ve UNIX', en: 'System Programming and UNIX' },
    description: {
      tr: 'Sistem programlamanın kapsamı, UNIX tarihi, standartlar ve UNIX çekirdeğinin yapısı.',
      en: 'The scope of system programming, UNIX history, standards and the structure of the UNIX kernel.',
    },
    source: 'sys-prog-1.pdf',
  },
  {
    id: 'm2',
    title: { tr: "UNIX'te C Programları", en: 'C Programs on UNIX' },
    description: {
      tr: 'Derleme aşamaları, cc seçenekleri ve komut satırı argümanları (argc/argv).',
      en: 'Compilation stages, cc options and command-line arguments (argc/argv).',
    },
    source: 'sys-prog-2.pdf',
  },
  {
    id: 'm3',
    title: { tr: 'Sistem Çağrıları', en: 'System Calls' },
    description: {
      tr: 'Kullanıcı ve çekirdek modu, kütüphane fonksiyonları ile sistem çağrıları, hata yönetimi (errno, perror).',
      en: 'User and kernel mode, library functions vs system calls, error handling (errno, perror).',
    },
    source: 'sys-prog-3.pdf',
  },
  {
    id: 'm4',
    title: { tr: 'İşlemler: fork, wait, exit', en: 'Processes: fork, wait, exit' },
    description: {
      tr: 'İşlem hiyerarşisi, fork(), PID/PPID, öksüz ve zombi işlemler, wait()/exit() senkronizasyonu.',
      en: 'Process hierarchy, fork(), PID/PPID, orphan and zombie processes, wait()/exit() synchronization.',
    },
    source: 'sys-prog-4.pdf',
  },
  {
    id: 'm5',
    title: { tr: 'exec, Kabuk ve Bellek', en: 'exec, the Shell and Memory' },
    description: {
      tr: 'execl() ve system(), kabuğun programları ön/arka planda çalıştırması, işlem bellek düzeni.',
      en: 'execl() and system(), how the shell runs programs in foreground/background, process memory layout.',
    },
    source: 'sys-prog-5.pdf',
  },
];
