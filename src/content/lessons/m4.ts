import type { Lesson, LText } from '../types';

const T = (tr: string, en: string): LText => ({ tr, en });

// ───────────────────────────── Lesson 1: fork() ─────────────────────────────

export const fork_basics: Lesson = {
  id: 'fork-basics',
  module: 'm4',
  order: 1,
  title: T('İşlem hiyerarşisi ve fork()', 'Process hierarchy and fork()'),
  blurb: T(
    'fork() ile yeni işlem yaratma, dönüş değerleri ve sınavlarda işlem/çıktı sayısını hesaplama yöntemi.',
    'Creating processes with fork(), its return values, and a systematic method for counting processes and printed lines in exam questions.',
  ),
  minutes: 40,
  sources: ['sys-prog-4.pdf s.1-2', 'Geçen yılın sınav soruları / last year exam questions'],
  objectives: [
    T('UNIX işlem hiyerarşisini (scheduler, init, pagedaemon, kabuk, ana/alt işlem) tarif edebilmek.', 'Describe the UNIX process hierarchy (scheduler, init, pagedaemon, shell, parent/child).'),
    T('fork() dönüş değerlerini (0, alt işlemin PID\'si, -1) ve "bir çağrı, iki dönüş" fikrini açıklayabilmek.', 'Explain the fork() return values (0, the child\'s PID, -1) and the idea of "one call, two returns".'),
    T('fork() sırasında nelerin kopyalandığını, nelerin paylaşıldığını söyleyebilmek.', 'State what fork() copies and what stays shared.'),
    T('Ardışık, döngü içindeki, koşullu ve `&&` ile yazılmış fork() çağrılarında işlem sayısını bulabilmek.', 'Count processes for sequential, looped, conditional and `&&` fork() calls.'),
    T('Bir printf satırının kaç kez çalışacağını "o satırı çalıştıran işlem sayısı" olarak hesaplayabilmek.', 'Compute how often a printf runs as "the number of processes that execute that line".'),
  ],
  prerequisites: ['syscall-errors'],
  sections: [
    {
      id: 'hierarchy',
      title: T('UNIX\'te işlem hiyerarşisi', 'The process hierarchy in UNIX'),
      blocks: [
        {
          type: 'p',
          text: T(
            'UNIX\'te her işlem (process) bir başka işlem tarafından yaratılır. Yaratan işleme **ana işlem (parent)**, yaratılana **alt işlem (child)** denir. Bu yüzden işlemler bir ağaç oluşturur. Ağacın tepesinde çekirdeğin kendi başlattığı birkaç özel işlem vardır; geri kalan her şey onlardan türer.',
            'In UNIX every process is created by another process. The creator is the **parent**, the new one is the **child**, so processes form a tree. At the top sit a few special processes started by the kernel itself; everything else descends from them.',
          ),
        },
        { type: 'diagram', id: 'process-hierarchy', caption: T('Klasik UNIX işlem hiyerarşisi.', 'The classic UNIX process hierarchy.') },
        {
          type: 'definitions',
          items: [
            { term: T('Scheduler (dağıtıcı), PID 0', 'Scheduler, PID 0'), text: T('Çekirdeğin parçasıdır; işlemlere CPU zamanı dağıtır. fork() ile yaratılmamıştır.', 'Part of the kernel; hands out CPU time to processes. It is not created by fork().') },
            { term: T('init, PID 1', 'init, PID 1'), text: T('İlk kullanıcı işlemi. Oturum açma ve kabukları (shell) başlatan işlemleri o yaratır; öksüz kalan işlemleri evlat edinir.', 'The first user process. It starts the login machinery and shells, and adopts orphaned processes.') },
            { term: T('pagedaemon, PID 2', 'pagedaemon, PID 2'), text: T('Bellek sayfalarını yöneten çekirdek işlemi.', 'A kernel process that manages memory pages.') },
            { term: T('Kabuk (shell)', 'Shell'), text: T('Her komutu fork() ile yeni bir alt işlem olarak çalıştırır (ileride göreceğiz).', 'Runs every command as a new child created with fork() (we will see this later).') },
          ],
        },
        {
          type: 'callout',
          variant: 'source',
          title: T('Notlarla ilgili not', 'About the slides'),
          text: T(
            'Notlar "init, 0 ve 2 hariç bütün işlemleri yaratır" der; bu klasik UNIX\'in resmidir. Modern Linux\'ta PID 0 boşta bekleme (idle/swapper) görevidir, PID 2 ise `kthreadd`\'dir ve sayfa yönetimi ayrı çekirdek iş parçacıklarına dağılmıştır. İlke aynıdır: PID 1\'in altında bir işlem ağacı vardır.',
            'The slides say "init creates all processes except 0 and 2"; that is the classic UNIX picture. On modern Linux PID 0 is the idle/swapper task and PID 2 is `kthreadd`, and paging is spread over several kernel threads. The principle is the same: there is a process tree under PID 1.',
          ),
        },
      ],
    },
    {
      id: 'fork-call',
      title: T('fork(): bir çağrı, iki dönüş', 'fork(): one call, two returns'),
      blocks: [
        { type: 'code', lang: 'c', code: '#include <unistd.h>\n\npid_t fork(void);', caption: T('`pid_t` için `<sys/types.h>` da gerekir.', '`pid_t` also needs `<sys/types.h>`.') },
        {
          type: 'p',
          text: T(
            'fork() çağıran işlemin neredeyse birebir bir kopyasını yaratır. Kopya, **fork()\'un hemen sonrasından** çalışmaya başlar: iki işlem de aynı satırda "fork() döndü" noktasındadır. Fark yalnızca dönen değerdir; programın akışını böyle ayırırız:',
            'fork() creates an almost exact copy of the calling process. The copy starts running **right after the fork() call**: both processes are at the same "fork() just returned" point. The only difference is the return value, and that is how we split the program flow:',
          ),
        },
        {
          type: 'table',
          head: [T('Durum', 'Case'), T('fork() ne döndürür', 'fork() returns')],
          rows: [
            [T('Alt işlemde', 'In the child'), T('`0`', '`0`')],
            [T('Ana işlemde', 'In the parent'), T('Alt işlemin PID\'si (> 0)', 'The child\'s PID (> 0)')],
            [T('Başarısızlık (hiçbir işlem yaratılmadı)', 'Failure (no process created)'), T('`-1`, `errno` ayarlanır', '`-1`, `errno` is set')],
          ],
        },
        { type: 'diagram', id: 'fork-basic', caption: T('fork() çağrısında işlem ikiye ayrılır.', 'The process splits in two at fork().') },
        {
          type: 'p',
          text: T(
            'Neden ana işlem alt işlemin PID\'sini alır? Bir işlemin birçok alt işlemi olabilir ve ana işlem sonra hangisini beklediğini (`wait`) bilmek ister. Alt işlem ise ana işlemini `getppid()` ile zaten öğrenebilir, bu yüzden ona 0 yeterlidir. Başarısızlığın tipik nedenleri: "Resource temporarily unavailable" (işlem sayısı sınırı doldu) ve "Not enough space" (bellek/takas alanı yok).',
            'Why does the parent get the child\'s PID? A process can have many children and the parent later needs to say which one it waits for (`wait`). The child can always ask for its parent via `getppid()`, so 0 is enough for it. Typical failure causes: "Resource temporarily unavailable" (process limit reached) and "Not enough space" (no memory/swap).',
          ),
        },
        { type: 'h3', text: T('Standart şablon', 'The standard template') },
        {
          type: 'code',
          lang: 'c',
          code: `pid_t pid;
/* commands before fork: run once */
pid = fork();
if (pid == -1) { perror("fork"); exit(1); }   /* error: no child */
if (pid == 0) {
    /* child only */
} else {
    /* parent only */
}
/* code here is run by BOTH (unless a branch exits) */`,
          caption: T('Hata, alt işlem ve ana işlem dalları ayrı ayrı ele alınır.', 'Error, child and parent branches are handled separately.'),
        },
        {
          type: 'table',
          head: [T('fork() sırasında', 'At fork()'), T('Ne olur', 'What happens')],
          caption: T('Kopyalanan ve paylaşılan öğeler.', 'What is copied and what is shared.'),
          rows: [
            [T('Veri (data), yığın (stack), öbek (heap)', 'Data, stack and heap'), T('Kopyalanır: alt işlem kendi ayrı kopyasını alır', 'Copied: the child gets its own separate copy')],
            [T('Açık dosyalar (dosya tanıtıcıları)', 'Open files (descriptors)'), T('Alt işleme aktarılır (aynı açık dosyaları kullanır)', 'Inherited by the child (it refers to the same open files)')],
            [T('stdio tamponları (henüz yazılmamış çıktı)', 'stdio buffers (output not yet flushed)'), T('Kopyalanır (aşağıdaki tuzağa bakın)', 'Copied (see the pitfall below)')],
            [T('Program kodu (text)', 'Program code (text)'), T('Paylaşılır; değişmediği için kopyalanmasına gerek yok', 'Shared; it never changes so no copy is needed')],
            [T('PID, ana işlem PID\'si', 'PID and parent PID'), T('Alt işlem yeni bir PID alır; PPID = ana işlemin PID\'si', 'The child gets a new PID; its PPID is the parent\'s PID')],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: T('Çalışma sırası belirsizdir', 'Scheduling order is not defined'),
          text: T(
            'fork() sonrasında önce ana mı alt mı çalışır, bunu zamanlayıcı (scheduler) belirler; programdan garanti edilemez. Sınavda "çıktı nedir?" sorusunda iki işlemin satırları araya girebiliyorsa, doğru cevap sıra değil **sayıdır** ya da sıranın belirsiz olduğunu belirten seçenektir. Sıra ancak `wait()` gibi bir eşzamanlama ile sabitlenir.',
            'After fork() it is the scheduler who decides whether parent or child runs first; the program cannot rely on it. When two processes can interleave their output, the right answer to an exam question is the **count**, or the option that says the order is unspecified. Order is only fixed by synchronisation such as `wait()`.',
          ),
        },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'fork-template' }, caption: T('Şablonu çalıştırın: alt işlemde `fork returned 0`, ana işlemde alt işlemin PID\'si görünür.', 'Run the template: the child sees `fork returned 0`, the parent sees the child\'s PID.') },
      ],
    },
    {
      id: 'counting',
      title: T('Sınav yöntemi: işlemleri ve satırları saymak', 'Exam method: counting processes and lines'),
      blocks: [
        {
          type: 'p',
          text: T(
            'fork() sorularında sonuç neredeyse hiç "tahmin" gerektirmez; iki sayım yeterlidir. Önce **kaç işlem oluşur**, sonra her printf için **o satırı kaç işlem çalıştırır**. Bir satırın çıktı sayısı, o satırı çalıştıran işlemlerin sayısıdır.',
            'fork() questions almost never need guessing; two counts are enough. First **how many processes exist**, then for each printf **how many processes execute that line**. The number of times a line prints equals the number of processes that run it.',
          ),
        },
        {
          type: 'steps',
          items: [
            { title: T('Tek bir işlemle başla', 'Start with one process'), text: T('Programı çalıştıran ilk işlem P\'dir. Sayaç: 1 işlem.', 'The first process P runs the program. Count: 1 process.') },
            { title: T('Kodu yukarıdan aşağı oku, her fork() noktasında işlem sayısını güncelle', 'Read top to bottom, update the count at every fork()'), text: T('Koşulsuz bir fork() o anda yaşayan **her** işlemi ikiye böler: sayı iki katına çıkar.', 'An unconditional fork() splits **every** process alive at that moment: the count doubles.') },
            { title: T('Koşulları işlemlere göre değerlendir', 'Evaluate conditions per process'), text: T('`if (fork() == 0)` ifadesinde fork() yine herkes için çalışır (sayı iki katına çıkar); ama gövde yalnızca alt işlemlerde çalışır. `fork() && fork()` ifadesinde ikinci fork() sadece ilkinden nonzero alanlar (ana işlemler) için çalışır.', 'In `if (fork() == 0)` the fork() still runs in everyone (the count doubles), but the body runs only in the children. In `fork() && fork()` the second fork() runs only in processes where the first returned nonzero (the parents).')},
            { title: T('Döngülerde i değerini unutma', 'In loops remember the value of i'), text: T('Alt işlem, fork() anındaki `i` değeri ile devam eder; sonraki turları o da yapar. Her tur, o turda yaşayan işlemleri ikiye katlar.', 'The child continues with the value of `i` at the time of the fork and also executes the remaining iterations. Each iteration doubles the processes alive at that point.') },
            { title: T('Her printf için say', 'Count per printf'), text: T('Her printf satırı için o satıra ulaşan işlemleri say. Ağaç çizmek (ana → alt oklarıyla) hata yapmanızı önler.', 'For each printf, count the processes that reach it. Drawing the tree (parent → child arrows) protects you from mistakes.') },
          ],
        },
        {
          type: 'table',
          head: [T('Kalıp', 'Pattern'), T('Toplam işlem', 'Total processes'), T('Not', 'Note')],
          rows: [
            [T('`fork();` × n (ardışık, koşulsuz)', '`fork();` × n (sequential, unconditional)'), T('2ⁿ', '2ⁿ'), T('3 fork → 8, 5 fork → 32', '3 forks → 8, 5 forks → 32')],
            [T('`for (i<n) fork();`', '`for (i<n) fork();`'), T('2ⁿ', '2ⁿ'), T('Alt işlemler de döngüye devam eder', 'Children continue the loop too')],
            [T('`for (i<n) { if (fork()==0) break; }`', '`for (i<n) { if (fork()==0) break; }`'), T('n + 1', 'n + 1'), T('Yelpaze: yalnızca asıl ana işlem yaratır', 'Fan: only the original parent creates')],
            [T('`for (i<n) { if (fork()!=0) break; }`', '`for (i<n) { if (fork()!=0) break; }`'), T('n + 1', 'n + 1'), T('Zincir: her işlem yalnızca bir alt işlem yaratır', 'Chain: each process creates exactly one child')],
            [T('`fork() && fork()`', '`fork() && fork()`'), T('3', '3'), T('Kısa devre: alt işlemde ikinci fork() çağrılmaz', 'Short-circuit: the child never reaches the second fork()')],
            [T('`fork() || fork()`', '`fork() || fork()`'), T('3', '3'), T('Bu kez ikinci fork() yalnızca alt işlemde çalışır', 'Here the second fork() runs only in the child')],
          ],
        },
        {
          type: 'p',
          text: T(
            'Bir koşulda printf varsa dikkat: `if (fork() == 0) printf("Three")` yalnızca bu fork()\'un **alt işlemleri** yazdırır, yani yaşayan işlemlerin yarısı kadar.',
            'Careful with printf inside a condition: `if (fork() == 0) printf("Three")` prints only in the **children** of that fork(), i.e. half of the processes alive at that point.',
          ),
        },
      ],
    },
    {
      id: 'slide-example',
      title: T('Ders örneği: Mesaj A / Mesaj B', 'Lecture example: Message A / Message B'),
      blocks: [
        {
          type: 'code',
          lang: 'c',
          code: `#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>

main()
{
    fork(); printf("Mesaj A\\n");
    fork(); printf("Mesaj B\\n");
}`,
        },
        {
          type: 'steps',
          items: [
            { title: T('Başlangıç', 'Start'), text: T('1 işlem (P).', '1 process (P).') },
            { title: T('Birinci fork()', 'First fork()'), text: T('P → P ve C1: 2 işlem. İkisi de "Mesaj A" yazar: **A × 2**.', 'P → P and C1: 2 processes. Both print "Mesaj A": **A × 2**.') },
            { title: T('İkinci fork()', 'Second fork()'), text: T('Yaşayan 2 işlemin her biri bölünür: 4 işlem (P, C1, C2, C3). Dördü de "Mesaj B" yazar: **B × 4**.', 'Each of the 2 live processes splits: 4 processes (P, C1, C2, C3). All four print "Mesaj B": **B × 4**.') },
          ],
        },
        { type: 'p', text: T('Cevap: 4 işlem çalışır, toplam 6 mesaj görüntülenir (A iki kez, B dört kez). Satırların sırası belirsizdir; sayılar değildir.', 'Answer: 4 processes run and 6 messages are printed in total (A twice, B four times). The order of the lines is unspecified; the counts are not.') },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'slide-ab' } },
      ],
    },
    {
      id: 'exam',
      title: T('Geçen yılın sınav soruları, adım adım', 'Last year\'s exam questions, step by step'),
      blocks: [
        { type: 'h3', text: T('Soru 1: Kaç kez "Three" yazdırılır?', 'Question 1: how many times is "Three" printed?') },
        {
          type: 'code',
          lang: 'c',
          code: `int main(int argc, char** argv) {
    int i;
    for (i = 0; i < 1; i++) {
        printf("One\\n");
        fork();
        printf("Two\\n");
        if (fork() == 0)
            printf("Three\\n");
    }
}`,
        },
        {
          type: 'steps',
          items: [
            { title: T('Döngü bir kez döner', 'The loop runs once'), text: T('`i < 1` olduğu için gövde yalnızca i = 0 için çalışır. Ağaç henüz tek işlemlik: P.', 'Because of `i < 1` the body runs only for i = 0. One process so far: P.') },
            { title: T('`printf("One")`', '`printf("One")`'), text: T('Yalnızca P çalıştırır: **One × 1**.', 'Only P runs it: **One × 1**.') },
            { title: T('Birinci fork()', 'First fork()'), text: T('P → P ve C1. Koşulsuz, 2 işlem.', 'P → P and C1. Unconditional, 2 processes.') },
            { title: T('`printf("Two")`', '`printf("Two")`'), text: T('İkisi de çalıştırır: **Two × 2**.', 'Both run it: **Two × 2**.') },
            { title: T('`if (fork() == 0)`', '`if (fork() == 0)`'), text: T('fork() her iki işlemde de çalışır: P → P, C2 ve C1 → C1, C3. Şimdi 4 işlem var. Koşul yalnızca yeni doğan C2 ve C3 için doğrudur.', 'fork() runs in both: P → P, C2 and C1 → C1, C3. Now there are 4 processes. The condition is true only in the newborn C2 and C3.') },
            { title: T('`printf("Three")`', '`printf("Three")`'), text: T('C2 ve C3 yazdırır: **Three × 2**.', 'C2 and C3 print it: **Three × 2**.') },
          ],
        },
        { type: 'output', text: 'One:   1\nTwo:   2\nThree: 2\n(4 processes)', caption: T('Cevap: "Three" 2 kez yazdırılır. Her satırın sırası değişebilir, sayılar değişmez.', 'Answer: "Three" is printed 2 times. The order of lines can vary, the counts cannot.') },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'exam-three' } },

        { type: 'h3', text: T('Soru 2: "PARENT: value = ?"', 'Question 2: "PARENT: value = ?"') },
        {
          type: 'code',
          lang: 'c',
          code: `int value = 5;
int main()
{
    pid_t pid;
    pid = fork();
    if (pid == 0)
    {
        value = value + 15;
    }
    else if (pid > 0)
    {
        wait(NULL);
        printf("PARENT: value = %d\\n", value);
        exit(0);
    }
}`,
        },
        {
          type: 'steps',
          items: [
            { title: T('fork()', 'fork()'), text: T('`value` genel (global) bir değişkendir; ama fork() veri alanını **kopyalar**. İki işlemin her birinin kendi `value` değişkeni vardır, ikisinde de 5.', '`value` is a global variable, but fork() **copies** the data area. Each process has its own `value`, both holding 5.') },
            { title: T('Alt işlem (`pid == 0`)', 'Child (`pid == 0`)'), text: T('Kendi kopyasını 20 yapar. Sonra `main` biter ve alt işlem sonlanır. Ana işlemin değişkeni bundan etkilenmez.', 'Sets its own copy to 20, then `main` ends and the child terminates. The parent\'s variable is unaffected.') },
            { title: T('Ana işlem (`pid > 0`)', 'Parent (`pid > 0`)'), text: T('`wait(NULL)` ile alt işlemin bitmesini bekler, sonra kendi kopyasını yazdırır: 5.', '`wait(NULL)` waits for the child to finish, then prints its own copy: 5.') },
          ],
        },
        { type: 'output', text: 'PARENT: value = 5', caption: T('Cevap 20 değil, 5. wait() sayesinde çıktı her koşuşta aynıdır.', 'The answer is 5, not 20. Thanks to wait() the output is the same on every run.') },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'exam-value' } },

        { type: 'h3', text: T('Soru 3: Kaç kez "One" ve "Two"?', 'Question 3: how many "One" and "Two"?') },
        {
          type: 'code',
          lang: 'c',
          code: `int main(int argc, char** argv) {
    int i;
    for (i = 0; i < 2; i++) {
        fork();
        printf("One\\n");
    }
    printf("Two\\n");
}`,
        },
        {
          type: 'table',
          head: [T('Tur', 'Iteration'), T('fork() öncesi yaşayan', 'Alive before fork()'), T('fork() sonrası yaşayan', 'Alive after fork()'), T('Bu turda "One"', '"One" in this iteration')],
          rows: [
            [T('i = 0', 'i = 0'), T('1 (P)', '1 (P)'), T('2 (P, C1)', '2 (P, C1)'), T('2', '2')],
            [T('i = 1', 'i = 1'), T('2 (P, C1; ikisi de i = 1\'e geldi)', '2 (P, C1; both reached i = 1)'), T('4 (+C2, C3)', '4 (+C2, C3)'), T('4', '4')],
          ],
        },
        {
          type: 'p',
          text: T(
            'Döngüden sonra 4 işlem de `i = 2` ile çıkar ve "Two" yazdırır. Toplam: One = 2 + 4 = **6**, Two = **4**. Bu sorudaki incelik: C1 `i = 0` turunda doğar, ama sayacı 1\'e çıkarıp ikinci turu kendisi de yapar. Ağaçta P iki çocuk (C1, C2), C1 ise bir çocuk (C3) yaratmıştır.',
            'After the loop all 4 processes leave with `i = 2` and print "Two". Total: One = 2 + 4 = **6**, Two = **4**. The subtlety: C1 is born in iteration i = 0, but it increments its counter to 1 and executes the second iteration itself. In the tree P created two children (C1, C2) and C1 created one (C3).',
          ),
        },
        { type: 'output', text: 'One: 6\nTwo: 4', caption: T('Cevap: One 6 kez, Two 4 kez.', 'Answer: One 6 times, Two 4 times.') },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'exam-one-loop' } },
        {
          type: 'callout',
          variant: 'source',
          title: T('Notlarla ilgili not', 'About the slides'),
          text: T(
            'Sınav kodları `wait()`/`exit()` kullanırken yalnızca `<stdio.h>`, `<unistd.h>`, `<sys/types.h>` ekler. Doğrusu `wait` için `<sys/wait.h>`, `exit` için `<stdlib.h>` eklemektir. Eksik başlıkla bazı derleyiciler uyarı verir; sınavda bu bir hata sayılmaz, ama kendi programlarınıza doğru başlıkları ekleyin.',
            'The exam programs call `wait()`/`exit()` while including only `<stdio.h>`, `<unistd.h>`, `<sys/types.h>`. The correct headers are `<sys/wait.h>` for `wait` and `<stdlib.h>` for `exit`. Some compilers warn about the missing headers; it does not matter in the exam, but include the right ones in your own programs.',
          ),
        },
      ],
    },
    {
      id: 'pitfalls',
      title: T('Tuzaklar: tampon ve sıra', 'Pitfalls: buffering and order'),
      blocks: [
        {
          type: 'callout',
          variant: 'warning',
          title: T('stdout tamponu fork() ile kopyalanır', 'The stdout buffer is copied by fork()'),
          text: T(
            '`printf("Hello ")` satır sonu içermiyorsa metin terminalde bile tamponda bekler. Tampon, veri alanının bir parçası olduğu için fork() ile **kopyalanır**; iki işlem de sonra "world\\n" yazıp tamponu boşaltınca "Hello world" **iki kez** çıkar. Çıktı bir dosyaya ya da boruya yönlendirilirse (tam tamponlama) satır sonu olan metinler bile fork() öncesinde tamponda kalabilir ve kopyalanır. Sınav sorularında genellikle `\\n` vardır ve tampon düşünülmez; ama gerçek programlarda `fflush(stdout)` ile fork() öncesinde tamponu boşaltın.',
            '`printf("Hello ")` without a newline waits in the buffer, even on a terminal. The buffer is part of the data area, so fork() **copies** it; both processes later print "world\\n" and flush, and "Hello world" appears **twice**. When output is redirected to a file or pipe (full buffering) even text ending in a newline can still be in the buffer at fork() and be copied. Exam questions usually have `\\n` and ignore this, but in real programs call `fflush(stdout)` before fork().',
          ),
        },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'buffering' }, caption: T('Tampon modunu değiştirip sonucu karşılaştırın.', 'Change the buffer mode and compare the result.') },
        {
          type: 'callout',
          variant: 'tip',
          title: T('Sınav kontrol listesi', 'Exam checklist'),
          text: T(
            '1) İşlem ağacını çiz. 2) Her fork() için "kim çalıştırıyor?" sor. 3) Koşulları (`== 0`, `&&`, `||`) işlem işlem değerlendir. 4) Her printf için çalıştıran işlemleri say. 5) Sıra sorulmuyorsa yalnızca sayıyı yaz.',
            '1) Draw the process tree. 2) For each fork() ask "who executes it?". 3) Evaluate conditions (`== 0`, `&&`, `||`) process by process. 4) For each printf count the processes that run it. 5) If order is not asked, answer with counts only.',
          ),
        },
      ],
    },
  ],
  misconceptions: [
    {
      wrong: T('fork() iki farklı değer döndürür, bu yüzden iki dönüş bir işlemde olur.', 'fork() returns two different values in one process.'),
      right: T('fork() bir kez çağrılır ama iki işlemde **birer kez** döner: alt işlemde 0, ana işlemde alt işlemin PID\'si.', 'fork() is called once but returns **once in each** of two processes: 0 in the child, the child\'s PID in the parent.'),
    },
    {
      wrong: T('Alt işlem programı baştan çalıştırır.', 'The child restarts the program from the beginning.'),
      right: T('Alt işlem fork()\'un hemen sonrasından devam eder; fork() öncesindeki satırları yeniden çalıştırmaz.', 'The child continues right after fork(); it does not re-run the lines before it.'),
    },
    {
      wrong: T('Genel (global) değişken ana ve alt işlem arasında paylaşılır.', 'A global variable is shared between parent and child.'),
      right: T('Veri alanı fork() sırasında kopyalanır; her işlem kendi değişkenini değiştirir. Paylaşılan tek şey program kodudur (salt okunur).', 'The data area is copied at fork(); each process modifies its own variable. Only the program code (read-only) is shared.'),
    },
    {
      wrong: T('Ana işlem her zaman alt işlemden önce çalışır (ya da tersi).', 'The parent always runs before the child (or vice versa).'),
      right: T('Sıra zamanlayıcıya bağlıdır ve garanti değildir. Sıra ancak `wait()` gibi eşzamanlama ile belirlenir.', 'The order depends on the scheduler and is not guaranteed. Only synchronisation such as `wait()` fixes it.'),
    },
    {
      wrong: T('`if (fork() == 0)` yalnızca bir işlem yaratır ve ana işlem fork() çağırmaz.', 'In `if (fork() == 0)` only the child calls fork().'),
      right: T('fork() koşulun içinde bile onu çalıştıran **her** işlemi böler. Koşul yalnızca gövdeyi kimin çalıştıracağını seçer.', 'fork() inside a condition still splits **every** process that executes it. The condition only chooses who runs the body.'),
    },
  ],
  summary: [
    T('fork() çağıran işlemin kopyasını yaratır; alt işlem fork()\'tan hemen sonra devam eder.', 'fork() creates a copy of the caller; the child continues right after the fork().'),
    T('Dönüş: alt işlemde 0, ana işlemde alt işlemin PID\'si, hatada -1 (hiç işlem yaratılmaz).', 'Return value: 0 in the child, the child\'s PID in the parent, -1 on error (no process is created).'),
    T('Veri, yığın, öbek, açık dosya bilgisi ve stdio tamponu kopyalanır; program kodu paylaşılır.', 'Data, stack, heap, open-file info and stdio buffers are copied; program text is shared.'),
    T('Ardışık n koşulsuz fork() 2ⁿ işlem verir; `fork() && fork()` ve `fork() || fork()` 3 işlem verir.', 'n sequential unconditional forks give 2ⁿ processes; `fork() && fork()` and `fork() || fork()` give 3.'),
    T('Bir printf\'in çıktı sayısı = o satırı çalıştıran işlem sayısı; ağaç çizmek en güvenli yoldur.', 'A printf\'s output count = the number of processes executing it; drawing the tree is the safest way.'),
    T('Ana/alt çalışma sırası belirsizdir, `wait()` olmadan sıraya güvenilemez.', 'The parent/child order is unspecified; do not rely on it without `wait()`.'),
  ],
  practice: [
    {
      id: 'fork-basics-p1', topic: 'fork-basics', difficulty: 1, kind: 'numeric', answer: 8,
      prompt: T('Aşağıdaki program kaç kez "X" yazdırır?', 'How many times does the program print "X"?'),
      code: 'int main() {\n    fork();\n    fork();\n    fork();\n    printf("X\\n");\n    return 0;\n}',
      explanation: T('Her koşulsuz fork() yaşayan işlem sayısını ikiye katlar: 1 → 2 → 4 → 8. printf\'i 8 işlemin hepsi çalıştırır.', 'Each unconditional fork() doubles the live processes: 1 → 2 → 4 → 8. All 8 processes execute the printf.'),
    },
    {
      id: 'fork-basics-p2', topic: 'fork-basics', difficulty: 2, kind: 'numeric', answer: 6,
      prompt: T('Geçen yılki sınav sorusu: Bu program kaç kez "One" yazdırır?', 'Last year\'s exam question: how many times does this program print "One"?'),
      code: 'int main(int argc, char** argv) {\n    int i;\n    for (i = 0; i < 2; i++) {\n        fork();\n        printf("One\\n");\n    }\n    printf("Two\\n");\n}',
      explanation: T('i = 0 turunda 2 işlem "One" yazar, i = 1 turunda yaşayan 2 işlem fork() ile 4 olur ve 4 "One" yazılır: 2 + 4 = 6. ("Two" 4 kez yazdırılır.)', 'In iteration 0 two processes print "One"; in iteration 1 the 2 live processes fork into 4 and 4 lines are printed: 2 + 4 = 6. ("Two" is printed 4 times.)'),
    },
    {
      id: 'fork-basics-p3', topic: 'fork-basics', difficulty: 2, kind: 'mcq', answer: 1,
      prompt: T('Bu program çalıştırıldığında "Y" ve "N" kaçar kez yazdırılır?', 'How many times are "Y" and "N" printed?'),
      code: 'int main() {\n    if (fork() || fork())\n        printf("Y\\n");\n    else\n        printf("N\\n");\n    return 0;\n}',
      options: [
        T('Y: 1, N: 2', 'Y: 1, N: 2'),
        T('Y: 2, N: 1', 'Y: 2, N: 1'),
        T('Y: 3, N: 0', 'Y: 3, N: 0'),
        T('Y: 2, N: 2', 'Y: 2, N: 2'),
      ],
      optionNotes: [
        T('Y sayısı eksik: ana işlem ile ikinci fork()\'u çağıran ilk alt işlem Y yazar.', 'Too few Y: both the original parent and the first child (the caller of the second fork()) print Y.'),
        T('Doğru. Ana işlem: ilk fork() nonzero → `||` doğru, ikinci fork() çağrılmaz → Y. İlk alt işlem: 0 → ikinci fork() çağrılır; onu çağıran (alt işlemin ana işlemi) nonzero alır → Y; yeni doğan 0 alır → N.', 'Correct. Original parent: the first fork() is nonzero → `||` is true, no second fork() → Y. First child: 0 → calls the second fork(); the caller gets nonzero → Y; the newborn gets 0 → N.'),
        T('Üç işlem var ama biri koşulu sağlamaz: ikinci fork()\'tan 0 alan işlem.', 'There are three processes but one fails the condition: the one that got 0 from the second fork().'),
        T('Toplam işlem sayısı 4 değil 3\'tür; ikinci fork() herkes için çağrılmaz.', 'There are 3 processes, not 4; the second fork() is not called by everyone.'),
      ],
      explanation: T('`||` kısa devre yapar: soldaki doğruysa sağdaki hiç hesaplanmaz. Ana işlemde ilk fork() nonzero olduğu için ikinci fork() çalışmaz; yalnızca ilk alt işlem (ilk fork()\'tan 0 aldı) ikinciyi çağırır. 3 işlem: 2 Y, 1 N.', '`||` short-circuits: if the left side is true the right side is never evaluated. In the original parent the first fork() is nonzero so the second never runs; only the first child (which got 0) calls it. 3 processes: 2 Y, 1 N.'),
    },
    {
      id: 'fork-basics-p4', topic: 'fork-basics', difficulty: 2, kind: 'tree',
      prompt: T('Bu kodun yarattığı işlem ağacını çizin (kim kimi fork() ile yarattı).', 'Draw the process tree this code creates (who forked whom).'),
      code: 'int main() {\n    int i;\n    for (i = 0; i < 2; i++) {\n        fork();\n    }\n    return 0;\n}',
      explanation: T('P, i = 0\'da C1\'i, i = 1\'de C2\'yi yaratır. C1 de i = 1 turunu yapar ve C3\'ü yaratır. Toplam 4 işlem: P\'nin iki çocuğu, C1\'in bir çocuğu var.', 'P creates C1 at i = 0 and C2 at i = 1. C1 also runs iteration i = 1 and creates C3. 4 processes: P has two children, C1 has one.'),
    },
    {
      id: 'fork-basics-p5', topic: 'fork-basics', difficulty: 2, kind: 'mcq', answer: 2,
      prompt: T('Bu program için hangi çıktı **kesinlikle** üretilir?', 'Which output is guaranteed for this program?'),
      code: 'int x = 10;\nint main() {\n    if (fork() == 0) {\n        x = x + 5;\n        printf("child: %d\\n", x);\n        exit(0);\n    }\n    wait(NULL);\n    printf("parent: %d\\n", x);\n    return 0;\n}',
      options: [
        T('child: 15, parent: 15', 'child: 15, parent: 15'),
        T('parent: 10, child: 15', 'parent: 10, child: 15'),
        T('child: 15, parent: 10', 'child: 15, parent: 10'),
        T('Sıra belirsiz; iki sıra da olabilir', 'Order unspecified; both are possible'),
      ],
      optionNotes: [
        T('Yanlış: x kopyalanır, alt işlemin değişikliği ana işleme yansımaz.', 'Wrong: x is copied, the child\'s change does not reach the parent.'),
        T('Yanlış: ana işlem wait() ile alt işlemin bitmesini bekler; önce alt işlemin satırı çıkar.', 'Wrong: the parent waits for the child, so the child\'s line comes first.'),
        T('Doğru: wait() sırayı sabitler ve ana işlemin x\'i 10 kalır.', 'Correct: wait() fixes the order and the parent\'s x stays 10.'),
        T('Yanlış: wait() sayesinde sıra belirlidir (simülatörde tüm olası çalışmalar denendi).', 'Wrong: wait() fixes the order (the simulator explored every possible schedule).'),
      ],
      explanation: T('Alt işlem kendi x kopyasını 15 yapar ve yazdırıp sonlanır. Ana işlem wait() ile onu bekler, sonra kendi kopyasını (10) yazdırır.', 'The child sets its own copy of x to 15, prints it and exits. The parent waits for it and then prints its own copy (10).'),
    },
    {
      id: 'fork-basics-p6', topic: 'fork-basics', difficulty: 1, kind: 'match',
      prompt: T('Durumları fork() dönüş değeriyle eşleştirin.', 'Match each situation to the fork() return value.'),
      left: [
        T('Alt işlemde', 'In the child'),
        T('Ana işlemde, başarılı', 'In the parent, success'),
        T('Hata (örneğin işlem sınırı doldu)', 'Error (e.g. process limit reached)'),
      ],
      right: [T('-1', '-1'), T('0', '0'), T('Alt işlemin PID\'si', 'The child\'s PID')],
      pairs: [1, 2, 0],
      explanation: T('Alt işlem 0 alır, ana işlem alt işlemin PID\'sini alır, hata durumunda hiçbir işlem yaratılmaz ve -1 döner (`errno` ayarlanır).', 'The child gets 0, the parent gets the child\'s PID, on error nothing is created and -1 is returned (`errno` is set).'),
    },
    {
      id: 'fork-basics-p7', topic: 'fork-basics', difficulty: 2, kind: 'fill',
      prompt: T('Boşlukları doldurun.', 'Fill in the blanks.'),
      template: T('Koşulsuz 5 ardışık fork() çağrısından sonra toplam {0} işlem vardır; bunlardan {1} tanesi yeni yaratılmış alt işlemdir.', 'After 5 sequential unconditional fork() calls there are {0} processes in total, of which {1} are newly created children.'),
      blanks: [['32'], ['31']],
      explanation: T('2⁵ = 32 işlem. Asıl işlem dışındaki 31 işlem fork() ile yaratıldı.', '2⁵ = 32 processes. All except the original one (31) were created by fork().'),
    },
    {
      id: 'fork-basics-p8', topic: 'fork-basics', difficulty: 3, kind: 'multi', answers: [0, 2, 3],
      prompt: T('fork() sonrasında hangi ifadeler doğrudur?', 'Which statements about fork() are true?'),
      options: [
        T('Alt işlem, ana işlemin yığın (stack) ve veri alanının ayrı bir kopyasını alır.', 'The child gets a separate copy of the parent\'s stack and data.'),
        T('Alt işlem, ana işlemin genel değişkenini değiştirdiğinde ana işlem bunu görür.', 'When the child modifies a global variable the parent sees the change.'),
        T('İki işlem de fork() çağrısından hemen sonraki komuttan devam eder.', 'Both processes continue at the instruction right after the fork() call.'),
        T('Program kodu (text) ana ve alt işlem arasında paylaşılır.', 'The program code (text) is shared between parent and child.'),
        T('Alt işlem her zaman ana işlemden önce çalışır.', 'The child always runs before the parent.'),
      ],
      explanation: T('Veri ve yığın kopyalanır (0), ikisi de fork()\'tan sonra devam eder (2), kod paylaşılır (3). Değişkenler paylaşılmaz (1) ve sıra garanti değildir (4).', 'Data and stack are copied (0), both continue after fork() (2), code is shared (3). Variables are not shared (1) and the order is not guaranteed (4).'),
    },
  ],
};

// ───────────────────────────── Lesson 2: getpid / orphans ─────────────────────────────

export const pids_orphans: Lesson = {
  id: 'pids-orphans',
  module: 'm4',
  order: 2,
  title: T('İşlem kimlikleri, öksüz işlemler ve adres alanları', 'Process IDs, orphans and address spaces'),
  blurb: T(
    'getpid()/getppid(), ana işlem önce bitince alt işlemin evlat edinilmesi ve fork() sonrası ayrı adres alanları.',
    'getpid()/getppid(), adoption of a child when its parent exits first, and the separate address spaces after fork().',
  ),
  minutes: 25,
  sources: ['sys-prog-4.pdf s.3-5'],
  objectives: [
    T('getpid() ve getppid() prototiplerini, başlık dosyalarını ve kullanımını bilmek.', 'Know the prototypes, headers and use of getpid() and getppid().'),
    T('Öksüz (orphan) işlemin nasıl oluştuğunu ve getppid() değerinin nasıl değiştiğini açıklamak.', 'Explain how an orphan arises and how the getppid() value changes.'),
    T('fork() sonrasında ana ve alt işlemin ayrı veri alanlarına sahip olduğunu, kodun ise paylaşıldığını göstermek.', 'Show that after fork() parent and child have separate data while the code is shared.'),
  ],
  prerequisites: ['fork-basics'],
  sections: [
    {
      id: 'getpid',
      title: T('Kimliğimi ve ana işlemimi öğrenmek', 'Asking for my ID and my parent\'s ID'),
      blocks: [
        {
          type: 'code',
          lang: 'c',
          code: '#include <sys/types.h>\n#include <unistd.h>\n\npid_t getpid(void);    /* my process ID */\npid_t getppid(void);   /* my parent\'s process ID */',
        },
        {
          type: 'p',
          text: T(
            'Her işlemin bir kimliği (PID) ve bir ana işlemi vardır. İkisini de iki basit sistem çağrısı verir; bu çağrılar hata vermez. PID\'nin çekirdekten bir CPU yazmacı (register) üzerinden döndüğünü getpid-flow diyagramında görmüştük.',
            'Each process has an ID (PID) and a parent. Two simple system calls return them and they cannot fail. We saw in the getpid-flow diagram that the PID travels back from the kernel through a CPU register.',
          ),
        },
        { type: 'code', lang: 'c', code: 'printf("Benim islem kimligim %d dir.\\n", getpid());\nprintf("Benim ana islemimin kimligi %d dir.\\n", getppid());' },
        {
          type: 'p',
          text: T(
            'fork() ile birlikte kullanınca fork() dönüş değeri ile getpid() birbirini tamamlar: ana işlemde `pid = fork()` alt işlemin PID\'sini, alt işlemde `getppid()` ana işlemin PID\'sini verir.',
            'Together with fork() they complement each other: in the parent `pid = fork()` yields the child\'s PID, in the child `getppid()` yields the parent\'s PID.',
          ),
        },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'fork-template' }, caption: T('Çıktıdaki PID değerlerini karşılaştırın: ana işlemin `fork returned` değeri = alt işlemin `my PID` değeri.', 'Compare the PIDs: the parent\'s `fork returned` value = the child\'s `my PID` value.') },
      ],
    },
    {
      id: 'orphans',
      title: T('Öksüz (orphan) işlemler', 'Orphan processes'),
      blocks: [
        {
          type: 'p',
          text: T(
            'Ana işlem, alt işleminden **önce** sonlanırsa alt işlem öksüz (orphan) kalır. UNIX çekirdeği her işlemin bir ana işleminin olmasını ister; bu yüzden öksüzü sistem işlemi **init (PID 1)** evlat edinir. Alt işlem `getppid()` ile ana işlemini sorarsa artık eskisini değil 1\'i görür.',
            'If a parent terminates **before** its child, the child becomes an orphan. The kernel wants every process to have a parent, so the system process **init (PID 1)** adopts it. When the child calls `getppid()` it no longer sees the old parent but 1.',
          ),
        },
        { type: 'diagram', id: 'orphan-timeline', caption: T('Ana işlem 123, alt işlem 124: `getppid()` önce 123, ana işlem çıkınca 1 döndürür.', 'Parent 123, child 124: `getppid()` returns 123 first, then 1 after the parent exits.') },
        {
          type: 'code',
          lang: 'c',
          code: `pid_t pid = fork();
if (pid == 0) {                            /* child */
    printf("child: my parent is %d\\n", getppid());   /* parent's PID */
    sleep(5);                              /* parent exits meanwhile */
    printf("child: now my parent is %d\\n", getppid()); /* 1 (init) */
    exit(0);
}
printf("parent %d exits\\n", getpid());
exit(0);`,
          caption: T('Ders notlarındaki "ana işlem 25, sleep(5)" örneğinin kısa hali.', 'A short version of the lecture\'s "parent 25, sleep(5)" example.'),
        },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'orphan' } },
        {
          type: 'callout',
          variant: 'source',
          title: T('Notlarla ilgili not: "1" her zaman 1 değildir', 'About the slides: "1" is not always 1'),
          text: T(
            'Notlar klasik UNIX davranışını anlatır: öksüzü init (PID 1) alır. Modern Linux\'ta bir işlem kendini **subreaper** ilan edebilir (`prctl(PR_SET_CHILD_SUBREAPER)`) ve masaüstü oturumlarında `systemd --user` genellikle böyledir. Bu durumda öksüz işlem PID 1 yerine o işleme bağlanır ve `getppid()` 1 dışında bir sayı (örneğin 1234) döndürebilir. Konteynerlerde de "PID 1" konteynerin kendi init\'idir. Sınav cevabı: **1 (init)**; ama gerçek sistemde bunu denerseniz farklı bir sayı görmeniz hata değildir.',
            'The slides describe classic UNIX: init (PID 1) takes the orphan. Modern Linux lets a process declare itself a **subreaper** (`prctl(PR_SET_CHILD_SUBREAPER)`), and on desktop sessions `systemd --user` often is one. The orphan is then re-parented to that process and `getppid()` may return a number other than 1 (e.g. 1234). In containers "PID 1" is the container\'s own init. Exam answer: **1 (init)**; but if you try it on a real machine and see another number, nothing is wrong.',
          ),
        },
      ],
    },
    {
      id: 'address-spaces',
      title: T('Ayrı adres alanları', 'Separate address spaces'),
      blocks: [
        {
          type: 'p',
          text: T(
            'fork() sonrasında iki işlem aynı kaynak koddaki aynı değişken adlarını kullanır ama bunlar bellekte farklı yerlerde duran farklı kopyalardır. Birinin değişikliği diğerini etkilemez. Programın **kodu** ise salt okunur olduğundan iki işlem arasında paylaşılır.',
            'After fork() both processes use the same variable names from the same source, but these are different copies in different places in memory. One process\'s change does not affect the other. The program **code** is read-only and is therefore shared.',
          ),
        },
        { type: 'diagram', id: 'fork-address-space', caption: T('`i = 12`, `p = 9.0` iki kopyada da vardır; `id` ana işlemde ≠ 0, alt işlemde 0\'dır.', '`i = 12` and `p = 9.0` exist in both copies; `id` is ≠ 0 in the parent and 0 in the child.') },
        {
          type: 'code',
          lang: 'c',
          code: `int i = 12;
int id = fork();
if (id == 0) { i = i + 1; printf("child:  i = %d\\n", i); }   /* 13 */
else         { i = i * 2; printf("parent: i = %d\\n", i); }   /* 24 */`,
        },
        {
          type: 'p',
          text: T(
            'İki satırın hangisinin önce çıkacağı belirsizdir; ama değerler her zaman 13 ve 24\'tür. Simülatörün tüm olası çalışma sıralarını denemesi tam olarak bunu gösterir: yalnızca iki farklı çıktı vardır ve ikisi de aynı iki satırı içerir.',
            'Which of the two lines comes first is unspecified, but the values are always 13 and 24. Exploring all schedules in the simulator shows exactly this: there are only two different outputs and both contain the same two lines.',
          ),
        },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'value-sync' } },
        {
          type: 'callout',
          variant: 'tip',
          title: T('İki işlem nasıl haberleşir?', 'How do two processes communicate?'),
          text: T(
            'Bellek paylaşılmadığına göre ana işlem alt işlemden bir sonuç nasıl alır? Bu derste göreceğimiz en basit kanal `exit` değeri ve `wait()`\'tir (sonraki ders). Daha zengin kanallar (boru, ortak bellek, mesaj) IPC konusudur.',
            'If memory is not shared, how does a parent get a result from its child? The simplest channel in this course is the `exit` value together with `wait()` (next lesson). Richer channels (pipes, shared memory, messages) belong to IPC.',
          ),
        },
      ],
    },
    {
      id: 'trace',
      title: T('Hepsini birleştirelim: PID\'leri izlemek', 'Putting it together: tracing PIDs'),
      blocks: [
        {
          type: 'p',
          text: T(
            'Simülatörde ilk işlem PID 1000, onun yarattığı alt işlem 1001 alır (gerçek sistemde sayılar farklıdır). `fork-template` programında şunları görürsünüz:',
            'In the simulator the first process gets PID 1000 and its child gets 1001 (real systems use other numbers). In the `fork-template` program you see:',
          ),
        },
        { type: 'output', text: 'Before fork, PID=1000\nParent: fork returned 1001, my PID=1000\nChild: fork returned 0, my PID=1001, parent=1000', caption: T('Son iki satırın sırası değişebilir.', 'The order of the last two lines can vary.') },
        {
          type: 'list',
          items: [
            T('"Before fork" yalnızca bir kez çıkar: fork() öncesini tek işlem çalıştırır.', '"Before fork" appears once: only one process runs the code before fork().'),
            T('Ana işlemin `fork returned` değeri = alt işlemin `my PID` değeri.', 'The parent\'s `fork returned` value = the child\'s `my PID` value.'),
            T('Alt işlemin `parent=` değeri = ana işlemin `my PID` değeri (ana işlem hâlâ yaşadığı sürece).', 'The child\'s `parent=` value = the parent\'s `my PID` value (as long as the parent is alive).'),
          ],
        },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'fork-template' } },
      ],
    },
  ],
  misconceptions: [
    {
      wrong: T('Alt işlemin `getppid()` değeri ömrü boyunca sabittir.', 'The child\'s `getppid()` value stays the same for its whole life.'),
      right: T('Ana işlem önce çıkarsa alt işlem evlat edinilir ve `getppid()` değişir (klasik UNIX\'te 1).', 'If the parent exits first the child is adopted and `getppid()` changes (1 in classic UNIX).'),
    },
    {
      wrong: T('Öksüz işlem ana işlemi öldüğü için kendiliğinden sonlanır.', 'An orphan terminates automatically because its parent died.'),
      right: T('Öksüz işlem çalışmaya devam eder; yalnızca ana işlemi değişir. (Terminal kapanması gibi başka sinyaller ayrı konudur.)', 'An orphan keeps running; only its parent changes. (Other mechanisms such as a closing terminal sending a signal are a separate topic.)'),
    },
    {
      wrong: T('Öksüz işlemin ana işlemi her bilgisayarda kesinlikle 1\'dir.', 'An orphan\'s new parent is always exactly 1 on every machine.'),
      right: T('Klasik UNIX\'te evet; modern Linux\'ta subreaper (ör. `systemd --user`) veya konteyner init\'i devralabilir.', 'In classic UNIX yes; on modern Linux a subreaper (e.g. `systemd --user`) or a container\'s init may adopt it.'),
    },
    {
      wrong: T('fork() sonrasında `id` değişkeni iki işlemde aynı değerdedir.', 'After fork() the variable `id` has the same value in both processes.'),
      right: T('`id` ana işlemde alt işlemin PID\'si (≠ 0), alt işlemde 0\'dır; bu yüzden if/else iki işlemi ayırabilir.', '`id` is the child\'s PID (≠ 0) in the parent and 0 in the child; that is why if/else can separate them.'),
    },
  ],
  summary: [
    T('`getpid()` kendi PID\'ni, `getppid()` ana işlemin PID\'sini verir; başlıklar `<sys/types.h>` ve `<unistd.h>`.', '`getpid()` returns your own PID, `getppid()` your parent\'s; headers `<sys/types.h>` and `<unistd.h>`.'),
    T('Ana işlem önce biterse alt işlem öksüz olur ve init (PID 1) tarafından evlat edinilir.', 'If the parent exits first the child becomes an orphan and is adopted by init (PID 1).'),
    T('Modern Linux\'ta öksüzü bir subreaper (ör. `systemd --user`) alabilir; `getppid()` 1 olmayabilir.', 'On modern Linux a subreaper (e.g. `systemd --user`) may adopt it; `getppid()` need not be 1.'),
    T('fork() sonrası veri alanları ayrıdır, değişkenler birbirini etkilemez; program kodu paylaşılır.', 'After fork() the data areas are separate and variables do not affect each other; the code is shared.'),
    T('`id` ana işlemde ≠ 0, alt işlemde 0 olduğundan aynı kod iki işlemde farklı dallara girer.', '`id` is ≠ 0 in the parent and 0 in the child, so the same code takes different branches.'),
  ],
  practice: [
    {
      id: 'pids-orphans-p1', topic: 'pids-orphans', difficulty: 1, kind: 'mcq', answer: 1,
      prompt: T('Ana işlem sonlandıktan sonra, klasik UNIX\'te alt işlemdeki `getppid()` ne döndürür?', 'After the parent has terminated, what does `getppid()` return in the child in classic UNIX?'),
      options: [
        T('0', '0'),
        T('1 (init)', '1 (init)'),
        T('Ana işlemin eski PID\'si', 'The old PID of the parent'),
        T('Alt işlemin kendi PID\'si', 'The child\'s own PID'),
      ],
      optionNotes: [
        T('0, fork()\'un alt işlemde döndürdüğü değerdir; `getppid()` 0 döndürmez.', '0 is what fork() returns in the child; `getppid()` does not return 0.'),
        T('Doğru: öksüz işlemi init evlat edinir.', 'Correct: init adopts the orphan.'),
        T('Eski ana işlem artık yok; bu yalnızca ana işlem hâlâ yaşıyorsa doğru olurdu.', 'The old parent is gone; this would only hold while it is alive.'),
        T('Kendi PID\'sini `getpid()` verir.', '`getpid()` gives its own PID.'),
      ],
      explanation: T('Ana işlem çıkınca çekirdek alt işlemi init\'e bağlar, `getppid()` 1 döndürür. (Modern Linux\'ta subreaper nedeniyle farklı bir sayı olabilir.)', 'When the parent exits the kernel re-parents the child to init and `getppid()` returns 1. (On modern Linux a subreaper may give a different number.)'),
    },
    {
      id: 'pids-orphans-p2', topic: 'pids-orphans', difficulty: 1, kind: 'tf', answer: false,
      prompt: T('Doğru mu yanlış mı: Bir alt işlemin `getppid()` değeri, ana işlem ölse bile hep aynı kalır.', 'True or false: a child\'s `getppid()` value stays the same even if its parent dies.'),
      explanation: T('Yanlış. Ana işlem ölünce alt işlem evlat edinilir ve `getppid()` yeni ana işlemin PID\'sini (klasikte 1) döndürür.', 'False. When the parent dies the child is adopted and `getppid()` returns the new parent\'s PID (1 in the classic case).'),
    },
    {
      id: 'pids-orphans-p3', topic: 'pids-orphans', difficulty: 2, kind: 'mcq', answer: 2,
      prompt: T('Bu programın olası çıktıları hangileridir?', 'Which outputs are possible for this program?'),
      code: 'int main() {\n    int i = 12;\n    int id = fork();\n    if (id == 0) {\n        i = i + 1;\n        printf("child:  i = %d\\n", i);\n    } else {\n        i = i * 2;\n        printf("parent: i = %d\\n", i);\n    }\n    return 0;\n}',
      options: [
        T('Yalnızca "child: i = 13" sonra "parent: i = 24"', 'Only "child: i = 13" then "parent: i = 24"'),
        T('"child: i = 26" ve "parent: i = 13"', '"child: i = 26" and "parent: i = 13"'),
        T('Satırlar iki sırada da çıkabilir; değerler her zaman 13 ve 24', 'The lines can appear in either order; the values are always 13 and 24'),
        T('Her iki satırda da i = 25', 'i = 25 on both lines'),
      ],
      optionNotes: [
        T('wait() yok, bu yüzden ana işlem önce de yazabilir.', 'There is no wait(), so the parent may print first.'),
        T('Her işlem yalnızca kendi dalındaki işlemi yapar; çarpma ve toplama birbirine karışmaz.', 'Each process only executes its own branch; the operations never mix.'),
        T('Doğru: ayrı kopyalar (12+1 ve 12×2), sıra ise zamanlayıcıya bağlı.', 'Correct: separate copies (12+1 and 12×2), the order depends on the scheduler.'),
        T('Değişken paylaşılsaydı bile iki işlem aynı değeri yazmazdı; paylaşılmıyor.', 'Even a shared variable would not give 25 on both lines; and it is not shared.'),
      ],
      explanation: T('Alt işlem kendi kopyasını 13, ana işlem kendi kopyasını 24 yapar. Sıra belirsiz olduğundan iki farklı çıktı mümkündür.', 'The child makes its copy 13, the parent makes its copy 24. Because the order is unspecified, two different outputs are possible.'),
    },
    {
      id: 'pids-orphans-p4', topic: 'pids-orphans', difficulty: 1, kind: 'numeric', answer: 3,
      prompt: T('Çıktı satır sonu karakteriyle bittiği için tamponlama sorun çıkarmıyor. Program toplam kaç satır yazdırır?', 'Output ends with a newline so buffering is not an issue. How many lines does the program print in total?'),
      code: 'int main() {\n    printf("A\\n");\n    fork();\n    printf("B\\n");\n    return 0;\n}',
      explanation: T('"A" fork() öncesinde tek işlem tarafından yazılır (1 satır). "B" fork() sonrası iki işlem tarafından yazılır (2 satır). Toplam 3.', '"A" is printed before the fork() by one process (1 line); "B" after it by two processes (2 lines). Total 3.'),
    },
    {
      id: 'pids-orphans-p5', topic: 'pids-orphans', difficulty: 2, kind: 'order',
      prompt: T('Öksüz işlem senaryosunu doğru sıraya koyun.', 'Put the orphan scenario in the correct order.'),
      items: [
        T('Ana işlem fork() çağırır, alt işlem yaratılır.', 'The parent calls fork() and a child is created.'),
        T('Alt işlem `getppid()` çağırır: ana işlemin PID\'sini alır.', 'The child calls `getppid()` and gets the parent\'s PID.'),
        T('Ana işlem exit() ile sonlanır.', 'The parent terminates with exit().'),
        T('Çekirdek alt işlemi init\'e (PID 1) bağlar.', 'The kernel re-parents the child to init (PID 1).'),
        T('Alt işlem yeniden `getppid()` çağırır ve 1 alır.', 'The child calls `getppid()` again and gets 1.'),
      ],
      explanation: T('Önce çocuk yaratılır ve ana işlem hâlâ yaşarken eski PID görülür; ana işlem çıkınca evlat edinme olur ve sonraki çağrı 1 döndürür.', 'First the child is created and sees the old PID while the parent is alive; when the parent exits the adoption happens and the next call returns 1.'),
    },
    {
      id: 'pids-orphans-p6', topic: 'pids-orphans', difficulty: 1, kind: 'fill',
      prompt: T('Boşlukları doldurun.', 'Fill in the blanks.'),
      template: T('`pid_t` türü `<{0}>` içinde, `getpid()` ise `<{1}>` içinde bildirilir.', 'The type `pid_t` is defined in `<{0}>`, and `getpid()` is declared in `<{1}>`.'),
      blanks: [['sys/types.h'], ['unistd.h']],
      explanation: T('Notlardaki başlık listesi: `<sys/types.h>` ve `<unistd.h>`.', 'The header list from the notes: `<sys/types.h>` and `<unistd.h>`.'),
    },
    {
      id: 'pids-orphans-p7', topic: 'pids-orphans', difficulty: 2, kind: 'multi', answers: [0, 1, 3],
      prompt: T('fork() sonrasındaki bellek durumu için hangileri doğrudur?', 'Which statements about memory after fork() are true?'),
      options: [
        T('`int i = 12;` iki işlemde de ayrı bir kopya olarak bulunur.', '`int i = 12;` exists as a separate copy in both processes.'),
        T('Program kodu iki işlem arasında paylaşılır.', 'The program code is shared between the two.'),
        T('Alt işlemde `i = 13` yapmak ana işlemdeki `i`\'yi de 13 yapar.', 'Setting `i = 13` in the child also sets the parent\'s `i` to 13.'),
        T('`id` ana işlemde sıfırdan farklı, alt işlemde sıfırdır.', '`id` is nonzero in the parent and zero in the child.'),
      ],
      explanation: T('Veri kopyalanır (0), kod paylaşılır (1), `id` iki işlemde farklıdır (3). Değişkenler paylaşılmadığı için (2) yanlıştır.', 'Data is copied (0), code is shared (1), `id` differs between the two (3). Variables are not shared so (2) is false.'),
    },
  ],
};

// ───────────────────────────── Lesson 3: wait / exit / zombie ─────────────────────────────

export const wait_exit_zombie: Lesson = {
  id: 'wait-exit-zombie',
  module: 'm4',
  order: 3,
  title: T('wait(), exit() ve zombi işlemler', 'wait(), exit() and zombie processes'),
  blurb: T(
    'Ana ve alt işlemi eşzamanlama, çıkış durumunu okuma, tüm alt işlemleri bekleme ve zombi durumu.',
    'Synchronising parent and child, reading the exit status, waiting for all children and the zombie state.',
  ),
  minutes: 35,
  sources: ['sys-prog-4.pdf s.5-9'],
  objectives: [
    T('Ana işlemin wait() ile alt işlemi nasıl beklediğini ve wait()\'in dönüş değerlerini açıklamak.', 'Explain how the parent waits with wait() and what wait() returns.'),
    T('exit(x) değerini `WEXITSTATUS(status)` ile okumak ve notlardaki sadeleştirmenin farkını bilmek.', 'Read the exit(x) value with `WEXITSTATUS(status)` and know how it differs from the slides\' simplification.'),
    T('Tüm alt işlemleri bekleyen döngüyü yazıp yorumlamak.', 'Write and interpret the loop that waits for all children.'),
    T('t(fork), t(exit), t(wait) zamanlarına bakarak zombi oluşup oluşmadığını söylemek.', 'Use t(fork), t(exit), t(wait) to decide whether a zombie appears.'),
    T('Basitleştirilmiş işlem durum diyagramını (hazır, çalışıyor, uyuyor, zombi) okumak.', 'Read the simplified process state diagram (ready, running, sleeping, zombie).'),
  ],
  prerequisites: ['pids-orphans'],
  sections: [
    {
      id: 'sync',
      title: T('Neden eşzamanlama?', 'Why synchronise?'),
      blocks: [
        {
          type: 'p',
          text: T(
            'fork() sonrası ana ve alt işlem birbirinden bağımsız ilerler. Çoğu zaman ana işlem alt işlemin işini bitirmesini bekleyip sonucunu (çıkış durumunu) almak ister. Bunun için alt işlem `exit()` ile sonlanır, ana işlem `wait()` ile bekler.',
            'After fork() parent and child proceed independently. Often the parent wants to wait until the child has finished and then collect its result (exit status). The child ends with `exit()` and the parent waits with `wait()`.',
          ),
        },
        { type: 'diagram', id: 'wait-exit-sync', caption: T('Ana işlem wait() içinde bloklanır; alt işlem exit() edince devam eder.', 'The parent blocks in wait(); when the child exits, it continues.') },
        {
          type: 'code',
          lang: 'c',
          code: `#include <sys/types.h>
#include <sys/wait.h>

pid_t wait(int *status);`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: T('wait() sayesinde çıktı sırası belirlenir', 'wait() fixes the output order'),
          text: T(
            'Bir önceki derste sıra belirsizdi. Aşağıdaki programda ise alt işlemin "A" satırından sonra ana işlem "C" yazar; çünkü `wait()` ana işlemi alt işlem bitene kadar bloklar. "B" ise ana işlemin `wait()` öncesinde yazdığı için "A" ile yarışabilir.',
            'In the previous lesson the order was unspecified. In the program below "C" always comes after the child\'s "A", because `wait()` blocks the parent until the child ends. "B" is printed before `wait()`, so it can race with "A".',
          ),
        },
        {
          type: 'code',
          lang: 'c',
          code: `if (fork() == 0) { printf("A\\n"); exit(0); }
printf("B\\n");
wait(NULL);
printf("C\\n");`,
          caption: T('Olası çıktılar: A B C veya B A C.', 'Possible outputs: A B C or B A C.'),
        },
      ],
    },
    {
      id: 'wait-call',
      title: T('wait() ne yapar?', 'What wait() does'),
      blocks: [
        { type: 'diagram', id: 'wait-flowchart', caption: T('`p = wait(&s)` karar akışı.', 'Decision flow of `p = wait(&s)`.') },
        {
          type: 'steps',
          items: [
            { title: T('Hiç alt işlem yok mu?', 'No children at all?'), text: T('wait() hemen **-1** döndürür ve `errno = ECHILD` olur. Bloklanmaz.', 'wait() returns **-1** immediately and sets `errno = ECHILD`. It does not block.') },
            { title: T('Alt işlem var ama hiçbiri bitmedi', 'Children exist but none has finished'), text: T('Ana işlem **bloklanır** (uyur); işlemci başkalarına verilir.', 'The parent **blocks** (sleeps); the CPU goes to others.') },
            { title: T('Bir alt işlem sonlandı', 'A child terminated'), text: T('wait() o alt işlemin **PID**\'sini döndürür ve `*status` içine çıkış bilgisini yazar. Alt işlem sistemden tamamen silinir.', 'wait() returns that child\'s **PID** and stores its exit information in `*status`. The child is removed from the system completely.') },
            { title: T('`wait(NULL)` / `wait(0)`', '`wait(NULL)` / `wait(0)`'), text: T('Çıkış durumuyla ilgilenmiyorsak argüman olarak null veririz; wait() yalnızca PID\'yi döndürür.', 'If we do not care about the status we pass a null pointer; wait() only returns the PID.') },
          ],
        },
        {
          type: 'h3',
          text: T('exit(x) ve WEXITSTATUS', 'exit(x) and WEXITSTATUS'),
        },
        {
          type: 'code',
          lang: 'c',
          code: `int status;
if (fork() == 0) exit(3);          /* child: exit status 3 */
wait(&status);
printf("%d\\n", WEXITSTATUS(status));   /* 3 */`,
        },
        {
          type: 'callout',
          variant: 'source',
          title: T('Notlarla ilgili not: status içinde ne var?', 'About the slides: what is in status?'),
          text: T(
            'Notlar "alt işlemin çıkış değeri x, s değişkenine atanır" der ve örnekte `status`\'u doğrudan yazdırır. Bu bir sadeleştirmedir. Gerçek POSIX sistemlerde `s` kodlanmış bir değerdir: Linux\'ta `exit(3)` için `s == 768` (= 3 << 8) olur. Çıkış değeri `WEXITSTATUS(s)` ile (yaklaşık `(s >> 8) & 0xFF`) alınır; işlemin normal bitip bitmediği `WIFEXITED(s)` ile sorulur. Sınavda "status\'a çıkış değeri atanır" cevabı beklenir; gerçek kodda her zaman makroyu kullanın. Ayrıca çıkış değeri 0–255 aralığıyla sınırlıdır.',
            'The slides say "the child\'s exit value x is assigned to s" and print `status` directly. That is a simplification. On real POSIX systems `s` is an encoded value: on Linux `exit(3)` gives `s == 768` (= 3 << 8). The exit value is obtained with `WEXITSTATUS(s)` (roughly `(s >> 8) & 0xFF`); whether the process ended normally is tested with `WIFEXITED(s)`. In the exam, "the exit value is stored in status" is the expected answer; in real code always use the macro. Also, the exit value is limited to 0–255.',
          ),
        },
        {
          type: 'callout',
          variant: 'note',
          title: T('Başlıklar', 'Headers'),
          text: T('`wait()` için `<sys/wait.h>`, `exit()` için `<stdlib.h>` gerekir.', '`wait()` needs `<sys/wait.h>`, `exit()` needs `<stdlib.h>`.'),
        },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'exam-value' }, caption: T('Soru 2\'yi `wait(NULL)` ile bir kez daha çalıştırın: çıktı hep aynıdır.', 'Run question 2 again with `wait(NULL)`: the output is always the same.') },
      ],
    },
    {
      id: 'wait-loop',
      title: T('Tüm alt işlemleri beklemek', 'Waiting for all children'),
      blocks: [
        {
          type: 'p',
          text: T(
            'Bir `wait()` çağrısı yalnızca **bir** alt işlemi toplar. Birden fazla alt işlem varsa, wait()\'in -1 döndürmesine kadar çağırırız; -1 "başka alt işlem kalmadı" demektir.',
            'One `wait()` call collects only **one** child. With several children we call wait() until it returns -1, which means "no children left".',
          ),
        },
        {
          type: 'code',
          lang: 'c',
          code: `int i, pid, status, w;
for (i = 0; i < 3; i++) {          /* 3 children */
    pid = fork();
    if (pid == 0) { exit(i + 1); } /* child terminates */
}
while ((w = wait(&status)) && w != -1)
    printf("child PID: %d, exit code: %d\\n", w, WEXITSTATUS(status));`,
          caption: T('Ders notlarındaki örnek; `status` yerine `WEXITSTATUS(status)` yazdık.', 'The lecture example; we print `WEXITSTATUS(status)` instead of `status`.'),
        },
        {
          type: 'p',
          text: T(
            'Dikkat: alt işlemlerin hangi sırayla biteceği belirsizdir, bu yüzden üç satır herhangi bir sırada çıkabilir; ama her zaman tam **üç** satır ve çıkış kodları 1, 2, 3 olur. Koşuldaki `w &&` kısmı gereksizdir (wait() 0 döndürmez); yalnızca `w != -1` yeterlidir. Döngüden sonra `wait()` -1 döndürdüğü için döngü sonlanır ve ana işlem kendi `exit` yoluna girer.',
            'Note that the order in which the children finish is unspecified, so the three lines can appear in any order; but there are always exactly **three** lines with exit codes 1, 2, 3. The `w &&` part in the condition is redundant (wait() never returns 0); `w != -1` alone suffices. After the last child wait() returns -1, the loop ends.',
          ),
        },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'wait-all' }, caption: T('Çalıştırma sıralarını değiştirerek PID\'lerin sırasının değiştiğini görün.', 'Change the scheduling and watch the order of the PIDs change.') },
      ],
    },
    {
      id: 'zombie',
      title: T('Zombi işlemler', 'Zombie processes'),
      blocks: [
        {
          type: 'p',
          text: T(
            'Alt işlem `exit()` ile bittiğinde çekirdek onu hemen silmez: ana işlemin `wait()` ile çıkış durumunu okuyabilmesi için küçük bir kayıt (işlem tablosu girdisi) bırakır. Sonlanmış ama henüz beklenmemiş işleme **zombi** denir. Zombi artık çalışmaz, yalnızca çıkış durumunu taşır.',
            'When a child ends with `exit()` the kernel does not delete it at once: it leaves a small record (a process table entry) so that the parent can read the exit status with `wait()`. A terminated but not yet waited-for process is a **zombie**. It no longer runs; it only holds its exit status.',
          ),
        },
        {
          type: 'p',
          text: T(
            'P ana işlem, C alt işlem olsun. t(fork): P\'nin fork() çağırdığı an; t(exit): C\'nin bittiği an; t(wait): P\'nin wait() çağırdığı an. Açıkça t(fork) < t(exit) ve t(fork) < t(wait). Asıl soru exit ile wait\'in sırasıdır:',
            'Let P be the parent and C the child. t(fork) is when P calls fork(); t(exit) is when C terminates; t(wait) is when P calls wait(). Obviously t(fork) < t(exit) and t(fork) < t(wait). The real question is the order of exit and wait:',
          ),
        },
        { type: 'diagram', id: 'zombie-cases', caption: T('Soldaki: önce exit, sonra wait. Sağdaki: önce wait, sonra exit.', 'Left: exit first, then wait. Right: wait first, then exit.') },
        {
          type: 'table',
          head: [T('Durum', 'Case'), T('Ne olur', 'What happens')],
          rows: [
            [T('t(exit) < t(wait)', 't(exit) < t(wait)'), T('Alt işlem exit ile wait arasında **zombi** kalır. wait() geldiğinde hemen döner ve zombi silinir.', 'The child is a **zombie** between exit and wait. When wait() arrives it returns at once and the zombie is removed.')],
            [T('t(exit) ≥ t(wait)', 't(exit) ≥ t(wait)'), T('Ana işlem wait() içinde **bloklanır**; alt işlem bitince uyandırılır. Zombi oluşmaz (ya da hemen temizlenir).', 'The parent **blocks** in wait(); it wakes when the child ends. No zombie lingers (it is reaped immediately).')],
          ],
        },
        { type: 'interactive', id: 'zombie-timeline', caption: T('İki kaydırıcıyla exit ve wait zamanını oynatın.', 'Move the exit and wait times with the two sliders.') },
        { type: 'interactive', id: 'fork-sim', props: { preset: 'zombie' }, caption: T('`sleep(3)` süresince alt işlem zombidir; sonra wait() onu toplar.', 'During `sleep(3)` the child is a zombie; then wait() reaps it.') },
        { type: 'h3', text: T('Durum diyagramı', 'State diagram') },
        { type: 'diagram', id: 'process-states', caption: T('Basitleştirilmiş UNIX işlem durumları.', 'Simplified UNIX process states.') },
        {
          type: 'table',
          head: [T('Geçiş', 'Transition'), T('Neden olur', 'Cause')],
          rows: [
            [T('(yok) → Hazır', '(none) → Ready'), T('Ana işlemde `fork()`', '`fork()` in the parent')],
            [T('Hazır ↔ Çalışıyor', 'Ready ↔ Running'), T('Zamanlayıcı CPU verir / zaman dilimi biter', 'The scheduler grants the CPU / the time slice ends')],
            [T('Çalışıyor → Uyuyor', 'Running → Sleeping'), T('İşlem bir olayı bekler (örn. wait(), sleep(), G/Ç): engellendi', 'The process waits for an event (e.g. wait(), sleep(), I/O): blocked')],
            [T('Uyuyor → Hazır', 'Sleeping → Ready'), T('Olay oldu: aktif edildi', 'The event happened: woken up')],
            [T('Çalışıyor → Zombi', 'Running → Zombie'), T('`exit()` (ana işlem henüz wait() çağırmadıysa)', '`exit()` (if the parent has not called wait() yet)')],
            [T('Zombi → (yok)', 'Zombie → (none)'), T('Ana işlem `wait()` çağırdı: tamamen sonlandırıldı', 'The parent called `wait()`: fully removed')],
          ],
        },
        { type: 'interactive', id: 'state-machine', caption: T('Yalnızca geçerli geçişler etkin; nedenini okuyun.', 'Only legal transitions are enabled; read the cause of each.') },
        {
          type: 'callout',
          variant: 'important',
          title: T('Zombileri kim temizler?', 'Who cleans up zombies?'),
          text: T(
            'Sadece ana işlemin `wait()` çağrısı zombiyi siler; zombiyi `kill` ile öldüremezsiniz, çünkü zaten ölüdür. Ana işlem hiç wait() çağırmazsa zombi, işlem tablosunda yer kaplamaya devam eder ve uzun süren bir sunucuda tablo dolabilir; fork() de "Resource temporarily unavailable" ile başarısız olmaya başlar. Ana işlem **sonlanırsa** zombi öksüz kalır; init (veya subreaper) onu evlat edinir ve wait() ile temizler.',
            'Only the parent\'s `wait()` removes a zombie; you cannot `kill` it because it is already dead. If the parent never calls wait() the zombie keeps occupying a process table slot, and in a long-running server the table can fill up so that fork() starts to fail with "Resource temporarily unavailable". If the parent **exits**, the zombie becomes an orphan; init (or a subreaper) adopts it and reaps it with wait().',
          ),
        },
      ],
    },
  ],
  misconceptions: [
    {
      wrong: T('wait(&s) çağrısı `s`\'ye doğrudan çıkış değerini koyar.', 'wait(&s) stores the exit value directly in `s`.'),
      right: T('Gerçek sistemlerde `s` kodlanmıştır (`exit(3)` → 768); değeri `WEXITSTATUS(s)` verir. Notlardaki gösterim sadeleştirmedir.', 'On real systems `s` is encoded (`exit(3)` → 768); `WEXITSTATUS(s)` gives the value. The slides\' notation is a simplification.'),
    },
    {
      wrong: T('wait() her zaman bloklanır.', 'wait() always blocks.'),
      right: T('Alt işlem hiç yoksa -1 döner (`ECHILD`); alt işlem zaten zombiyse hemen döner. Yalnızca çalışan alt işlem varken bloklanır.', 'With no children it returns -1 (`ECHILD`); if a child is already a zombie it returns at once. It blocks only while a running child exists.'),
    },
    {
      wrong: T('Bir wait() çağrısı tüm alt işlemleri bekler.', 'One wait() call waits for all children.'),
      right: T('Her wait() yalnızca bir alt işlemi toplar; hepsi için döngüde -1 gelene kadar çağırılır.', 'Each wait() collects exactly one child; loop until it returns -1 to collect all.'),
    },
    {
      wrong: T('Zombi, hâlâ çalışan ya da CPU harcayan bir işlemdir.', 'A zombie is a process that is still running or using CPU.'),
      right: T('Zombi sonlanmıştır; CPU ya da bellek kullanmaz, yalnızca işlem tablosunda çıkış durumuyla bir girdi tutar.', 'A zombie has terminated; it uses no CPU and no memory besides a process-table entry holding its exit status.'),
    },
    {
      wrong: T('Ana işlem wait() çağırdıktan sonra alt işlem zombi olur.', 'The child becomes a zombie after the parent calls wait().'),
      right: T('Zombi, exit ile wait **arasındaki** durumdur. wait() çağrısı zombiyi siler.', 'Zombie is the state **between** exit and wait. The wait() call removes the zombie.'),
    },
  ],
  summary: [
    T('`wait()` ana işlemi bir alt işlem bitene kadar bloklar ve bitenin PID\'sini döndürür; alt işlem yoksa -1 (`ECHILD`).', '`wait()` blocks the parent until a child ends and returns that child\'s PID; with no children it returns -1 (`ECHILD`).'),
    T('`wait(&status)` çıkış bilgisini alır; değer `WEXITSTATUS(status)` ile okunur. `wait(NULL)` yalnızca PID verir.', '`wait(&status)` receives the exit information, read the value with `WEXITSTATUS(status)`. `wait(NULL)` only returns the PID.'),
    T('Birden çok alt işlem için `while ((w = wait(&s)) != -1)` kalıbı kullanılır.', 'For several children use the pattern `while ((w = wait(&s)) != -1)`.'),
    T('Zombi: exit() çağırmış ama ana işlemi henüz wait() çağırmamış alt işlem; çıkış durumunu saklamak için vardır.', 'Zombie: a child that has called exit() whose parent has not called wait() yet; it exists to keep the exit status.'),
    T('t(exit) < t(wait) ise zombi aralığı vardır; t(exit) ≥ t(wait) ise ana işlem bloklanır.', 'If t(exit) < t(wait) there is a zombie interval; if t(exit) ≥ t(wait) the parent blocks.'),
    T('Ana işlem wait() çağırmadan çıkarsa zombi öksüz kalır; init (ya da subreaper) onu temizler.', 'If the parent exits without wait(), the zombie is orphaned; init (or a subreaper) reaps it.'),
  ],
  practice: [
    {
      id: 'wait-exit-zombie-p1', topic: 'wait-exit-zombie', difficulty: 1, kind: 'mcq', answer: 0,
      prompt: T('Hiç alt işlemi olmayan bir işlem `wait(NULL)` çağırırsa ne olur?', 'What happens when a process with no children calls `wait(NULL)`?'),
      options: [
        T('-1 döner ve `errno = ECHILD` olur', 'It returns -1 and sets `errno = ECHILD`'),
        T('Sonsuza kadar bloklanır', 'It blocks forever'),
        T('0 döner', 'It returns 0'),
        T('İşlem sinyal alıp sonlanır', 'The process gets a signal and terminates'),
      ],
      optionNotes: [
        T('Doğru: akış şemasında "alt işlem mevcut mu? Hayır" kolu.', 'Correct: the "child exists? No" branch of the flowchart.'),
        T('Yalnızca çalışan alt işlem varken bloklanır; hiç yoksa beklenecek bir şey olmadığı için hemen döner.', 'It blocks only while a running child exists; with none there is nothing to wait for.'),
        T('wait() 0 döndürmez; ya bir PID ya -1.', 'wait() never returns 0; either a PID or -1.'),
        T('Hata yalnızca dönüş değeri ve errno ile bildirilir.', 'The error is reported only through the return value and errno.'),
      ],
      explanation: T('Alt işlem yoksa wait() hata verir: dönüş değeri -1, `errno` = ECHILD.', 'Without children wait() fails: return value -1, `errno` = ECHILD.'),
    },
    {
      id: 'wait-exit-zombie-p2', topic: 'wait-exit-zombie', difficulty: 2, kind: 'numeric', answer: 3,
      prompt: T('Ders örneğindeki programda ana işlem kaç satır yazdırır?', 'How many lines does the parent print in the lecture example?'),
      code: 'int main() {\n    int i, pid, status, w;\n    for (i = 0; i < 3; i++) {\n        pid = fork();\n        if (pid == 0) { exit(i + 1); }\n    }\n    while ((w = wait(&status)) && w != -1)\n        printf("child PID: %d, exit code: %d\\n", w, WEXITSTATUS(status));\n    return 0;\n}',
      explanation: T('Alt işlemler exit() ile döngüden önce çıkar; yalnızca ana işlem 3 alt işlem yaratır. wait() üç kez bir PID, dördüncü kez -1 döndürür. 3 satır (kodlar 1, 2, 3; sıra belirsiz).', 'The children exit() inside the loop; only the parent creates 3 children. wait() returns a PID three times and -1 the fourth time. 3 lines (codes 1, 2, 3; order unspecified).'),
    },
    {
      id: 'wait-exit-zombie-p3', topic: 'wait-exit-zombie', difficulty: 2, kind: 'mcq', answer: 1,
      prompt: T('Bu program ne yazdırır (Linux)?', 'What does this program print (Linux)?'),
      code: 'int main() {\n    int s;\n    if (fork() == 0) exit(3);\n    wait(&s);\n    printf("%d\\n", WEXITSTATUS(s));\n    return 0;\n}',
      options: [
        T('768', '768'),
        T('3', '3'),
        T('0', '0'),
        T('Alt işlemin PID\'si', 'The child\'s PID'),
      ],
      optionNotes: [
        T('768, ham `s` değeridir (3 << 8). Makro bunu 3\'e çevirir.', '768 is the raw `s` (3 << 8). The macro turns it into 3.'),
        T('Doğru: WEXITSTATUS(s), exit(3)\'ün 3 değerini verir.', 'Correct: WEXITSTATUS(s) yields the 3 of exit(3).'),
        T('Alt işlem 0 ile çıksaydı 0 olurdu.', 'It would be 0 if the child had exited with 0.'),
        T('PID, wait()\'in dönüş değeridir, `s` değil.', 'The PID is wait()\'s return value, not `s`.'),
      ],
      explanation: T('Alt işlem çıkış kodu 3 ile biter; ana işlem wait() ile bekler ve makroyla 3\'ü okur. (Ham `s` Linux\'ta 768\'dir; notlar bunu "s = x" diye sadeleştirir.)', 'The child ends with exit code 3; the parent waits and reads 3 via the macro. (Raw `s` is 768 on Linux; the slides simplify this to "s = x".)'),
    },
    {
      id: 'wait-exit-zombie-p4', topic: 'wait-exit-zombie', difficulty: 2, kind: 'mcq', answer: 3,
      prompt: T('Bu program için hangi çıktı **imkansızdır**?', 'Which output is **impossible** for this program?'),
      code: 'int main() {\n    if (fork() == 0) { printf("A\\n"); exit(0); }\n    printf("B\\n");\n    wait(NULL);\n    printf("C\\n");\n    return 0;\n}',
      options: [
        T('A B C', 'A B C'),
        T('B A C', 'B A C'),
        T('Hepsi mümkündür', 'All are possible'),
        T('B C A', 'B C A'),
      ],
      optionNotes: [
        T('Mümkün: alt işlem önce çalışır.', 'Possible: the child runs first.'),
        T('Mümkün: ana işlem "B"yi önce yazar, wait() sonra alt işlemi bekler.', 'Possible: the parent prints "B" first and wait() then waits for the child.'),
        T('Biri mümkün değil.', 'One of them is impossible.'),
        T('Doğru: "C", wait() dönünce, yani "A" yazıldıktan sonra yazılır.', 'Correct: "C" is printed after wait() returns, i.e. after "A".'),
      ],
      explanation: T('"A" alt işlemde exit() öncesinde yazılır; wait() ancak alt işlem bitince döner ve "C" ondan sonra gelir. Dolayısıyla A her zaman C\'den önce çıkar. Yalnızca B\'nin yeri değişebilir (simülatör iki çıktıyı da buldu: ABC ve BAC).', '"A" is printed before exit() in the child; wait() returns only after the child ends and "C" follows. So A always precedes C. Only the place of B can vary (the simulator found exactly two outputs: ABC and BAC).'),
    },
    {
      id: 'wait-exit-zombie-p5', topic: 'wait-exit-zombie', difficulty: 2, kind: 'order',
      prompt: T('Zombi olan bir alt işlemin yaşam döngüsünü doğru sıraya koyun.', 'Put the life cycle of a child that becomes a zombie in the correct order.'),
      items: [
        T('Ana işlem fork() çağırır; alt işlem Hazır durumuna girer.', 'The parent calls fork(); the child enters the Ready state.'),
        T('Alt işlem çalışır (Çalışıyor).', 'The child runs (Running).'),
        T('Alt işlem exit() çağırır; Zombi durumuna geçer.', 'The child calls exit(); it becomes a Zombie.'),
        T('Ana işlem wait() çağırır.', 'The parent calls wait().'),
        T('Çıkış durumu ana işleme verilir ve alt işlem tamamen silinir.', 'The exit status is delivered to the parent and the child is removed completely.'),
      ],
      explanation: T('Zombi yalnızca exit ile wait arasındaki durumdur; wait() hem durumu teslim eder hem kaydı siler.', 'Zombie is only the state between exit and wait; wait() both delivers the status and removes the record.'),
    },
    {
      id: 'wait-exit-zombie-p6', topic: 'wait-exit-zombie', difficulty: 1, kind: 'match',
      prompt: T('Olayları durum diyagramındaki geçişlerle eşleştirin.', 'Match each event to the transition in the state diagram.'),
      left: [
        T('Ana işlemde fork()', 'fork() in the parent'),
        T('Alt işlemde exit() (ana işlem henüz beklemedi)', 'exit() in the child (parent has not waited yet)'),
        T('Ana işlemde wait()', 'wait() in the parent'),
        T('Çalışan işlem bir olayı beklemeye başlar', 'A running process starts waiting for an event'),
      ],
      right: [
        T('Çalışıyor → Uyuyor', 'Running → Sleeping'),
        T('Zombi → tamamen sonlanır', 'Zombie → removed completely'),
        T('Yeni alt işlem → Hazır', 'New child → Ready'),
        T('Çalışıyor → Zombi', 'Running → Zombie'),
      ],
      pairs: [2, 3, 1, 0],
      explanation: T('fork() Hazır durumunda yeni işlem yaratır, exit() Zombi yapar, wait() zombiyi siler, beklemek ise işlemi uyutur (engellenir).', 'fork() creates a new process in Ready, exit() makes it a Zombie, wait() removes the zombie, and waiting puts the process to sleep (blocked).'),
    },
    {
      id: 'wait-exit-zombie-p7', topic: 'wait-exit-zombie', difficulty: 2, kind: 'tf', answer: false,
      prompt: T('Doğru mu yanlış mı: Ana işlem wait() çağırmadan önce alt işlem zaten çıkmışsa, wait() bloklanır.', 'True or false: if the child has already exited before the parent calls wait(), then wait() blocks.'),
      explanation: T('Yanlış. Bu durumda alt işlem zombidir (t(exit) < t(wait)); wait() beklemeden zombiyi toplar ve hemen döner. Bloklanma t(exit) ≥ t(wait) durumunda olur.', 'False. The child is then a zombie (t(exit) < t(wait)); wait() collects it without waiting and returns at once. Blocking happens when t(exit) ≥ t(wait).'),
    },
    {
      id: 'wait-exit-zombie-p8', topic: 'wait-exit-zombie', difficulty: 3, kind: 'multi', answers: [0, 2, 3],
      prompt: T('Zombi işlemler hakkında hangileri doğrudur?', 'Which statements about zombie processes are true?'),
      options: [
        T('Çıkış durumunu ana işlem okuyabilsin diye işlem tablosunda tutulurlar.', 'They are kept in the process table so that the parent can read the exit status.'),
        T('`kill -9` ile öldürülerek temizlenirler.', 'They are cleaned up by killing them with `kill -9`.'),
        T('Ana işlemin wait() çağrısı onları siler.', 'The parent\'s wait() call removes them.'),
        T('Ana işlem wait() çağırmadan çıkarsa init (ya da subreaper) onları toplar.', 'If the parent exits without calling wait(), init (or a subreaper) reaps them.'),
        T('CPU zamanı harcamaya devam ederler.', 'They keep consuming CPU time.'),
      ],
      explanation: T('Zombi ölü bir işlemdir: öldürülemez (1), CPU harcamaz (4). Kaydı ana işlemin wait()\'i (2) ya da ana işlem çıkınca init/subreaper (3) siler; amaç çıkış durumunu korumaktır (0).', 'A zombie is already dead: it cannot be killed (1) and uses no CPU (4). Its record is removed by the parent\'s wait() (2) or by init/subreaper once the parent exits (3); its purpose is to preserve the exit status (0).'),
    },
  ],
};
