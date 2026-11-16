import type { LText } from '../i18n/langs';

export interface Preset {
  title: LText;
  note: LText;
  code: string;
}

export const PRESETS = {
  'fork-template': {
    title: { tr: 'Temel fork() şablonu', en: 'Basic fork() template' },
    note: {
      tr: 'Ders notlarındaki şablon: dönen değere göre ana ve alt işlem farklı dallara girer.',
      en: 'The template from the lecture notes: parent and child take different branches depending on the return value.',
    },
    code: `#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>

int main()
{
    pid_t pid;
    printf("Before fork, PID=%d\\n", getpid());
    pid = fork();
    if (pid == -1) { perror("fork"); exit(1); }
    if (pid == 0) {
        printf("Child: fork returned %d, my PID=%d, parent=%d\\n", pid, getpid(), getppid());
    } else {
        printf("Parent: fork returned %d, my PID=%d\\n", pid, getpid());
    }
    return 0;
}
`,
  },
  'slide-ab': {
    title: { tr: 'Ders örneği: Mesaj A / Mesaj B', en: 'Lecture example: Message A / Message B' },
    note: {
      tr: 'Kaç işlem çalışır? Kaç mesaj görüntülenir? (sys-prog-4, s.2)',
      en: 'How many processes run? How many messages are printed? (sys-prog-4, p.2)',
    },
    code: `#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>

int main()
{
    fork();
    printf("Mesaj A\\n");
    fork();
    printf("Mesaj B\\n");
}
`,
  },
  'exam-three': {
    title: { tr: 'Geçen yıl: kaç defa "Three"?', en: 'Last year: how many "Three"?' },
    note: {
      tr: 'Geçen yılın sınav sorusu (Örnek 4). fork() == 0 sadece alt işlemde doğrudur.',
      en: "Last year's exam question (Example 4). fork() == 0 is true only in the child.",
    },
    code: `#include <stdio.h>

int main(int argc, char** argv) {
    int i;
    for (i = 0; i < 1; i++) {
        printf("One\\n");
        fork();
        printf("Two\\n");
        if (fork() == 0)
            printf("Three\\n");
    }
}
`,
  },
  'exam-value': {
    title: { tr: 'Geçen yıl: PARENT value = ?', en: 'Last year: PARENT value = ?' },
    note: {
      tr: 'Geçen yılın sınav sorusu (Örnek 2). Alt işlemin değişikliği ana işlemi etkiler mi?',
      en: "Last year's exam question (Example 2). Does the child's change affect the parent?",
    },
    code: `#include <sys/types.h>
#include <stdio.h>
#include <unistd.h>
int value = 5;
int main()
{
    pid_t pid;
    pid = fork();
    if(pid == 0)
    {
        value = value + 15;
    }
    else if(pid > 0)
    {
        wait(NULL);
        printf("PARENT: value = %d\\n", value);
        exit(0);
    }
}
`,
  },
  'exam-one-loop': {
    title: { tr: 'Geçen yıl: kaç defa "One"?', en: 'Last year: how many "One"?' },
    note: {
      tr: 'Geçen yılın sınav sorusu. Döngü içindeki fork() her turda işlem sayısını ikiye katlar.',
      en: "Last year's exam question. fork() inside the loop doubles the number of processes every iteration.",
    },
    code: `int main(int argc, char** argv) {
    int i;
    for (i = 0; i < 2; i++) {
        fork();
        printf("One\\n");
    }
    printf("Two\\n");
}
`,
  },
  orphan: {
    title: { tr: 'Öksüz (orphan) işlem', en: 'Orphan process' },
    note: {
      tr: 'Ana işlem önce sonlanır; alt işlem init (PID 1) tarafından evlat edinilir ve getppid() 1 döndürür.',
      en: 'The parent exits first; the child is adopted by init (PID 1) and getppid() returns 1.',
    },
    code: `#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main()
{
    pid_t pid = fork();
    if (pid == 0) {
        printf("child: my parent is %d\\n", getppid());
        sleep(5);
        printf("child: now my parent is %d\\n", getppid());
        exit(0);
    }
    printf("parent %d exits\\n", getpid());
    exit(0);
}
`,
  },
  zombie: {
    title: { tr: 'Zombi işlem', en: 'Zombie process' },
    note: {
      tr: 'Alt işlem hemen sonlanır ama ana işlem wait() çağırana kadar zombi kalır.',
      en: 'The child exits immediately but stays a zombie until the parent calls wait().',
    },
    code: `#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <unistd.h>

int main()
{
    int status;
    pid_t pid = fork();
    if (pid == 0) {
        printf("child exits with 7\\n");
        exit(7);
    }
    sleep(3);            /* child is a zombie during this time */
    pid = wait(&status);
    printf("reaped %d, exit code %d\\n", pid, WEXITSTATUS(status));
    return 0;
}
`,
  },
  'wait-all': {
    title: { tr: 'Tüm alt işlemleri bekleme', en: 'Waiting for all children' },
    note: {
      tr: 'Ders notlarındaki örnek: 3 alt işlem başlatılır, ana işlem wait() -1 döndürene kadar bekler.',
      en: 'Lecture example: 3 children are started, the parent loops on wait() until it returns -1.',
    },
    code: `#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <unistd.h>

int main()
{
    int i, pid, status, w;
    for (i = 0; i < 3; i++) {
        pid = fork();
        if (pid == 0) {          /* child runs and terminates */
            exit(i + 1);
        }
    }
    while ((w = wait(&status)) && w != -1)
        printf("child PID: %d, exit code: %d\\n", w, WEXITSTATUS(status));
    return 0;
}
`,
  },
  'value-sync': {
    title: { tr: 'Ayrı adres alanları', en: 'Separate address spaces' },
    note: {
      tr: 'Her iki işlem de aynı değişken adını kullanır ama değerler ayrı kopyalardadır.',
      en: 'Both processes use the same variable names but the values live in separate copies.',
    },
    code: `#include <stdio.h>
#include <unistd.h>

int main()
{
    int i = 12;
    int id = fork();
    if (id == 0) {
        i = i + 1;
        printf("child:  i = %d\\n", i);
    } else {
        i = i * 2;
        printf("parent: i = %d\\n", i);
    }
    return 0;
}
`,
  },
  buffering: {
    title: { tr: 'stdio tamponu ve fork()', en: 'stdio buffer and fork()' },
    note: {
      tr: '"Hello" satır sonu olmadan tamponda kalır; fork() tamponu da kopyalar, bu yüzden iki kez yazılır. Tampon modunu değiştirip deneyin.',
      en: '"Hello" stays in the buffer (no newline); fork() copies the buffer too, so it is printed twice. Try changing the buffer mode.',
    },
    code: `#include <stdio.h>
#include <unistd.h>

int main()
{
    printf("Hello ");
    fork();
    printf("world\\n");
    return 0;
}
`,
  },
  logical: {
    title: { tr: 'fork() && fork()', en: 'fork() && fork()' },
    note: {
      tr: 'Kısa devre değerlendirme: alt işlemde ilk fork() 0 döndürdüğü için ikinci fork() çağrılmaz.',
      en: 'Short-circuit evaluation: in the first child fork() returned 0, so the second fork() is not called.',
    },
    code: `#include <stdio.h>
#include <unistd.h>

int main()
{
    if (fork() && fork())
        printf("parent of two\\n");
    else
        printf("child\\n");
    return 0;
}
`,
  },
  chain: {
    title: { tr: 'İşlem zinciri', en: 'Process chain' },
    note: {
      tr: 'Her işlem bir alt işlem oluşturup döngüden çıkar; sadece yeni alt işlem devam eder.',
      en: 'Each process creates one child and leaves the loop; only the new child continues.',
    },
    code: `#include <stdio.h>
#include <sys/wait.h>
#include <unistd.h>

int main()
{
    int i;
    for (i = 0; i < 3; i++) {
        if (fork() != 0)
            break;          /* parent stops creating */
    }
    wait(NULL);
    printf("i=%d pid=%d ppid=%d\\n", i, getpid(), getppid());
    return 0;
}
`,
  },
  fan: {
    title: { tr: 'Yelpaze (fan)', en: 'Fan of children' },
    note: {
      tr: 'Sadece ana işlem alt işlem oluşturur; alt işlemler döngüden çıkar.',
      en: 'Only the original parent creates children; the children leave the loop.',
    },
    code: `#include <stdio.h>
#include <sys/wait.h>
#include <unistd.h>

int main()
{
    int i;
    for (i = 0; i < 3; i++) {
        if (fork() == 0)
            break;          /* child stops creating */
    }
    printf("i=%d pid=%d\\n", i, getpid());
    while (wait(NULL) != -1)
        ;
    return 0;
}
`,
  },
} satisfies Record<string, Preset>;

export type PresetId = keyof typeof PRESETS;
