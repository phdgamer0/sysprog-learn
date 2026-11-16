import type { Question } from '../types';
import { L, c } from './h';

export const QUESTIONS_M4: Question[] = [
  // ───────────── basic counting ─────────────
  {
    id: 'm4-q01', topic: 'fork-basics', difficulty: 1, kind: 'numeric',
    prompt: L('Aşağıdaki programda `X` satırı kaç kez yazdırılır?', 'How many times is the line `X` printed by the following program?'),
    code: c`int main()
{
    fork();
    fork();
    printf("X\n");
    return 0;
}`,
    answer: 4,
    explanation: L('İlk `fork()` 2 işlem yapar. İkincisini **her iki işlem de** çalıştırır → 4 işlem. Her biri `printf`’e ulaşır: 4 satır. Genel kural: art arda `n` koşulsuz `fork()` → `2^n` işlem.', 'The first `fork()` makes 2 processes. **Both** execute the second one → 4 processes. Each reaches the `printf`: 4 lines. Rule of thumb: `n` unconditional `fork()` calls in a row → `2^n` processes.'),
  },
  {
    id: 'm4-q02', topic: 'fork-basics', difficulty: 1, kind: 'numeric',
    prompt: L('Bu program çalışırken (ilk işlem dahil) toplam kaç işlem oluşur?', 'How many processes exist in total (including the original) while this program runs?'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 3; i++)
        fork();
    printf("hi\n");
    return 0;
}`,
    answer: 8,
    explanation: L('Döngünün her turunda mevcut tüm işlemler `fork()` yapar, işlem sayısı ikiye katlanır: 1 → 2 → 4 → 8. `hi` de 8 kez yazılır.', 'In every iteration all existing processes call `fork()`, doubling the count: 1 → 2 → 4 → 8. `hi` is also printed 8 times.'),
  },
  {
    id: 'm4-q03', topic: 'fork-basics', difficulty: 1, kind: 'mcq',
    prompt: L('`pid = fork();` satırından hemen sonra, **alt işlemdeki** `pid` değişkeninin değeri nedir?', 'Right after the line `pid = fork();`, what is the value of `pid` **in the child process**?'),
    options: [
      L('Alt işlemin kendi PID’si', 'The child’s own PID'),
      L('0', '0'),
      L('Ana işlemin PID’si', 'The parent’s PID'),
      L('-1', '-1'),
    ],
    answer: 1,
    optionNotes: [
      L('Alt işlemin PID’sini `getpid()` verir; `fork`’un dönüşü ana işlemde bu değerdir.', 'The child’s PID comes from `getpid()`; `fork`’s return in the **parent** is that value.'),
      L('Doğru: alt işlemde `fork` 0 döndürür; çocuk ana işlem kimliğini `getppid()` ile öğrenir.', 'Correct: `fork` returns 0 in the child; it learns its parent’s ID with `getppid()`.'),
      L('Ana işlemin PID’si `getppid()` ile alınır, `fork` dönüşüyle değil.', 'The parent’s PID is obtained by `getppid()`, not the `fork` return value.'),
      L('-1 yalnızca `fork` başarısız olursa ve alt işlem oluşmamışken ana işlemde döner.', '-1 is returned only in the parent when `fork` fails; no child exists then.'),
    ],
    explanation: L('`fork()` bir kez çağrılır ama iki kez döner: ana işlemde yeni alt işlemin PID’sini, alt işlemde 0’ı. Programlar bu farkla hangi işlem olduklarını anlar.', '`fork()` is called once but returns twice: the new child’s PID in the parent and 0 in the child. Programs use this difference to tell which process they are.'),
  },
  {
    id: 'm4-q04', topic: 'fork-basics', difficulty: 2, kind: 'tf',
    prompt: L('`fork()` sonrasında ana ve alt işlem aynı değişkenleri **paylaşır**; biri `x`’i değiştirirse diğeri bu değişikliği görür.', 'After `fork()` parent and child **share** variables; if one changes `x` the other sees the change.'),
    answer: false,
    explanation: L('Alt işlem ana işlemin adres alanının **kopyasını** alır (program kodu paylaşılsa da veriler kopyalanır). Sonrasında yapılan değişiklikler birbirini etkilemez. Bu yüzden alt işlemin bir sonucu ana işleme dönmek için `exit` durumu, `pipe` gibi yöntemler gerekir.', 'The child gets a **copy** of the parent’s address space (code is shared but data is copied). Changes afterwards do not affect each other. That is why results must travel back via the exit status, a `pipe`, etc.'),
  },
  {
    id: 'm4-q05', topic: 'fork-basics', difficulty: 2, kind: 'numeric',
    prompt: L('Programda `A` satırı toplam kaç kez yazdırılır?', 'How many times is `A` printed in total?'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 2; i++) {
        fork();
        printf("A\n");
    }
    return 0;
}`,
    answer: 6,
    explanation: L('`i=0`: 1 işlem `fork` yapar → 2 işlem, ikisi de `A` yazar (2). `i=1`: 2 işlem `fork` yapar → 4 işlem, dördü de yazar (4). Toplam 2 + 4 = 6. (`printf` döngünün içinde olduğu için işlem sayısı değil, turlardaki toplamlar sayılır.)', '`i=0`: 1 process forks → 2 processes, both print `A` (2). `i=1`: 2 processes fork → 4 processes, all print (4). Total 2 + 4 = 6. (Because `printf` is inside the loop, the per-iteration totals are summed, not just the final process count.)'),
  },
  {
    id: 'm4-q06', topic: 'fork-basics', difficulty: 2, kind: 'numeric',
    prompt: L('`X` satırı kaç kez yazdırılır?', 'How many times is `X` printed?'),
    code: c`int main()
{
    if (fork())
        fork();
    printf("X\n");
    return 0;
}`,
    answer: 3,
    explanation: L('`fork()` ana işlemde sıfırdan farklıdır (alt işlemin PID’si) → ana işlem `if` gövdesine girip ikinci `fork`’u yapar. Alt işlem 0 aldığı için gövdeyi atlar. İşlemler: ana, ilk alt, ikinci alt = 3. Üçü de `printf`’e ulaşır.', '`fork()` is non-zero in the parent (the child’s PID) → only the parent enters the body and forks again. The first child gets 0 and skips it. Processes: parent, first child, second child = 3. All three reach the `printf`.'),
  },
  {
    id: 'm4-q07', topic: 'fork-basics', difficulty: 2, kind: 'mcq',
    prompt: L('Program ne yazdırır?', 'What does the program print?'),
    code: c`int main()
{
    int x = 10;
    if (fork() == 0) {
        x += 5;
        printf("%d\n", x);
    } else {
        wait(NULL);
        printf("%d\n", x);
    }
    return 0;
}`,
    options: [L('15 15', '15 15'), L('15 10', '15 10'), L('10 15', '10 15'), L('10 10', '10 10')],
    answer: 1,
    optionNotes: [
      L('Bu, değişkenin paylaşıldığını varsayar; yanlış, adres alanları kopyadır.', 'This assumes the variable is shared; wrong, the address spaces are copies.'),
      L('Doğru: alt işlem kendi kopyasını 15 yapıp yazar; ana işlem `wait` ile beklediği için sonra kendi kopyası olan 10’u yazar.', 'Correct: the child changes its own copy to 15 and prints it; the parent waits, then prints its own copy, 10.'),
      L('Sıra tersine olamaz: ana işlem `wait` ile bloklanır.', 'The order cannot be reversed: the parent blocks in `wait`.'),
      L('Alt işlem `x`’i artırdığı için 10 yazamaz.', 'The child increments `x`, so it cannot print 10.'),
    ],
    explanation: L('İki işlemin ayrı `x` değişkenleri vardır. `wait(NULL)` ana işlemi alt işlem bitene kadar beklettiği için çıktı sırası kesindir: önce 15, sonra 10.', 'The two processes have separate `x` variables. `wait(NULL)` blocks the parent until the child ends, so the output order is fixed: 15 first, then 10.'),
  },
  {
    id: 'm4-q08', topic: 'fork-basics', difficulty: 2, kind: 'mcq',
    prompt: L('Program çıktısı hangisidir? (satırlar boşlukla ayrılmıştır)', 'Which is the program’s output? (lines separated by spaces)'),
    code: c`int main()
{
    int x = 1;
    fork();
    x = x * 2;
    fork();
    x = x + 1;
    printf("%d\n", x);
    return 0;
}`,
    options: [L('3', '3'), L('3 3', '3 3'), L('3 3 3 3', '3 3 3 3'), L('3 2 3 2', '3 2 3 2')],
    answer: 2,
    optionNotes: [
      L('Tek işlem varsayıyor; 2 `fork` ile 4 işlem oluşur.', 'Assumes one process; two forks create 4.'),
      L('Yalnızca bir `fork`’un etkisi.', 'Only the effect of one `fork`.'),
      L('Doğru: 4 işlem de kendi kopyasında `1·2+1 = 3` hesaplar.', 'Correct: all 4 processes compute `1·2+1 = 3` on their own copy.'),
      L('Her işlem kendi `x`’ini ikiye katlar, kimse toplamaz; 2 değeri oluşmaz.', 'Every process doubles its own `x` before the second fork; nobody ends with 2.'),
    ],
    explanation: L('İlk `fork`’tan sonra her iki işlem `x = 2` yapar. İkinci `fork` ikisini daha çoğaltır (4 işlem, hepsinde `x = 2`). Hepsi `x = 3` olur ve 3 yazdırır: dört kez.', 'After the first `fork` both processes set `x = 2`. The second `fork` duplicates them again (4 processes, each `x = 2`). All become `x = 3` and print 3: four times.'),
  },
  // ───────────── loops, conditions ─────────────
  {
    id: 'm4-q09', topic: 'fork-basics', difficulty: 2, kind: 'numeric',
    prompt: L('`C` satırı kaç kez yazdırılır? (Alt işlemler `exit` çağırmıyor.)', 'How many times is `C` printed? (Children do not call `exit`.)'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 3; i++) {
        if (fork() == 0)
            printf("C\n");
    }
    return 0;
}`,
    answer: 7,
    explanation: L('Alt işlemler döngüden çıkmadığı için onlar da `fork` yapar; toplam işlem sayısı 2³ = 8. `C`’yi yalnızca `fork`’tan 0 alan işlemler yazar, yani 8 işlemden ilk işlem hariç hepsi: 7. Her alt işlem doğduğu `fork`’un hemen ardından bir kez yazar.', 'Children stay in the loop and fork too, so there are 2³ = 8 processes. Only a process that received 0 from `fork` prints `C`, i.e. every process except the original: 7. Each child prints once right after the fork that created it.'),
  },
  {
    id: 'm4-q10', topic: 'fork-basics', difficulty: 2, kind: 'mcq',
    prompt: L('Aşağıdaki programda `exit(0)` eklendiğinde (önceki sorudan fark) toplam kaç işlem oluşur?', 'In the following program (note the `exit(0)` compared with the previous question), how many processes are created in total (including the original)?'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 3; i++) {
        if (fork() == 0) {
            printf("C\n");
            exit(0);
        }
    }
    return 0;
}`,
    options: [L('3', '3'), L('4', '4'), L('7', '7'), L('8', '8')],
    answer: 1,
    optionNotes: [
      L('Alt işlemler 3’tür ama ana işlem de sayılır.', 'There are 3 children but the original counts too.'),
      L('Doğru: yalnızca ana işlem döngüde kalır ve 3 kez `fork` yapar; her çocuk hemen biter.', 'Correct: only the parent stays in the loop and forks 3 times; each child ends at once.'),
      L('Çocuklar döngüye devam etseydi 7 çocuk olurdu; `exit` bunu engeller.', 'That would be the count if children continued the loop; `exit` prevents it.'),
      L('2³ işlem, `exit` olmasaydı geçerliydi.', '2³ would apply without the `exit`.'),
    ],
    explanation: L('Kalıp “alt işlem işini yapar ve `exit` eder”: ana işlem n çocuk üretir (yelpaze/fan), çocuklar çoğalmaz. 1 + 3 = 4 işlem, 3 satır `C`.', 'The pattern “child does its job and `exit`s”: the parent produces n children (a fan), the children do not multiply. 1 + 3 = 4 processes, 3 lines of `C`.'),
  },
  {
    id: 'm4-q11', topic: 'fork-basics', difficulty: 3, kind: 'numeric',
    prompt: L('`X` satırı kaç kez yazdırılır?', 'How many times is `X` printed?'),
    code: c`int main()
{
    if (fork() && fork() || fork())
        ;
    printf("X\n");
    return 0;
}`,
    answer: 5,
    explanation: L('`&&` `||`’dan önceliklidir: `(fork() && fork()) || fork()`. Ana işlem: 1. `fork` sıfırdan farklı → 2. `fork` da sıfırdan farklı → ifade doğru, 3. `fork` atlanır. 1. `fork`’tan 0 alan çocuk: `&&` kısa devre yapar (yanlış) → 3. `fork`’u çalıştırır (+1 işlem). 2. `fork`’tan 0 alan çocuk: `&&` yanlış → o da 3. `fork`’u çalıştırır (+1). İşlemler: ana + 2 çocuk + 2 torun = 5.', '`&&` binds tighter than `||`: `(fork() && fork()) || fork()`. Parent: 1st `fork` non-zero → 2nd `fork` non-zero → true, so the 3rd `fork` is skipped. The child that got 0 from the 1st `fork`: `&&` short-circuits (false) → it runs the 3rd `fork` (+1 process). The child that got 0 from the 2nd `fork`: `&&` is false → it also runs the 3rd `fork` (+1). Processes: parent + 2 children + 2 more = 5.'),
  },
  {
    id: 'm4-q12', topic: 'fork-basics', difficulty: 3, kind: 'mcq',
    prompt: L('`X` satırı kaç kez yazdırılır?', 'How many times is `X` printed?'),
    code: c`int main()
{
    fork() || fork();
    printf("X\n");
    return 0;
}`,
    options: [L('2', '2'), L('3', '3'), L('4', '4'), L('1', '1')],
    answer: 1,
    optionNotes: [
      L('`||` sayesinde bir `fork` atlanır sanılıyor; ama yalnızca ana işlemde atlanır.', 'Assumes one `fork` is always skipped; it is skipped only in the parent.'),
      L('Doğru: ana işlem ilk `fork`’tan sıfırdan farklı alır, `||` kısa devre yapar. Çocuk 0 alır ve ikinci `fork`’u çalıştırır.', 'Correct: the parent gets non-zero from the first `fork` and `||` short-circuits. The child gets 0 and runs the second `fork`.'),
      L('Bu, `fork(); fork();` için doğru olurdu.', 'That would be correct for `fork(); fork();`.'),
      L('Hiçbir işlem yalnız kalmaz; en az iki işlem vardır.', 'Never just one; at least two processes exist.'),
    ],
    explanation: L('Ana işlem kısa devre yapıp devam eder (1). İlk çocuk 0 aldığı için ikinci `fork`’u çağırır: çocuk ve torun (2). Toplam 3 işlem → 3 `X`. Aynı şekilde `fork() && fork()` de 3 işlem üretir (bu kez ana işlem ikinci `fork`’u çalıştırır).', 'The parent short-circuits and continues (1). The first child gets 0, so it calls the second `fork`: child and grandchild (2). Total 3 processes → 3 `X`. Likewise `fork() && fork()` yields 3 processes (this time the parent runs the second `fork`).'),
  },
  {
    id: 'm4-q13', topic: 'fork-basics', difficulty: 3, kind: 'numeric',
    prompt: L('Program sonunda `X` kaç kez yazdırılır?', 'How many times is `X` printed at the end of the program?'),
    code: c`int main()
{
    int i, j;
    for (i = 0; i < 2; i++)
        for (j = 0; j < 2; j++)
            fork();
    printf("X\n");
    return 0;
}`,
    answer: 16,
    explanation: L('İç içe döngüler toplam 2 × 2 = 4 tur `fork` yapar; her tur işlem sayısını ikiye katlar: 2⁴ = 16.', 'The nested loops execute `fork` 2 × 2 = 4 times; each doubles the process count: 2⁴ = 16.'),
  },
  {
    id: 'm4-q14', topic: 'fork-basics', difficulty: 3, kind: 'numeric',
    prompt: L('`AB` satırı kaç kez yazdırılır? (Her `printf` çağrısının metnini dikkatle okuyun.)', 'How many times is the line `AB` printed? (Read each `printf` text carefully.)'),
    code: c`int main()
{
    printf("A");
    fork();
    printf("B\n");
    return 0;
}`,
    answer: 2,
    explanation: L('`"A"` satır sonu içermediği için stdio tamponunda bekler ve henüz yazılmamıştır. `fork` tamponu da kopyalar; iki işlem de sonra `"B\n"` ekleyip `AB` satırını yazar. Sonuç: `AB` iki kez (tek `A` ve iki `B` değil).', '`"A"` has no newline, so it sits in the stdio buffer and is not written yet. `fork` copies the buffer as well; both processes then append `"B\n"` and write the line `AB`. Result: `AB` twice (not one `A` and two `B`s).'),
  },
  {
    id: 'm4-q15', topic: 'fork-basics', difficulty: 3, kind: 'numeric',
    prompt: L('Sınav tarzı: `Done` satırı kaç kez yazdırılır?', 'Exam style: how many times is `Done` printed?'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 2; i++) {
        if (fork() == 0)
            printf("Child\n");
        printf("Done\n");
    }
    return 0;
}`,
    answer: 6,
    explanation: L('`i=0`: 1 işlem `fork` yapar (1 `Child`); 2 işlem `Done` yazar (2). `i=1`: 2 işlem `fork` yapar (2 yeni `Child`); 4 işlem `Done` yazar (4). Toplam `Done` = 2 + 4 = 6, `Child` = 1 + 2 = 3.', '`i=0`: 1 process forks (1 `Child`); 2 processes print `Done` (2). `i=1`: 2 processes fork (2 new `Child`); 4 processes print `Done` (4). Total `Done` = 2 + 4 = 6, `Child` = 1 + 2 = 3.'),
  },
  {
    id: 'm4-q16', topic: 'fork-basics', difficulty: 3, kind: 'numeric',
    prompt: L('Aynı programda `Child` satırı kaç kez yazdırılır?', 'In the same program, how many times is `Child` printed?'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 2; i++) {
        if (fork() == 0)
            printf("Child\n");
        printf("Done\n");
    }
    return 0;
}`,
    answer: 3,
    explanation: L('Her `fork`, tam bir `Child` satırı üretir (yeni çocuk `0` alır). Toplam `fork` sayısı: 1 (tur 0) + 2 (tur 1) = 3.', 'Each `fork` yields exactly one `Child` line (the new child sees `0`). Total number of `fork`s: 1 (iteration 0) + 2 (iteration 1) = 3.'),
  },
  {
    id: 'm4-q17', topic: 'fork-basics', difficulty: 3, kind: 'numeric',
    prompt: L('Program çalışırken toplam kaç işlem oluşur (ilk işlem dahil)?', 'How many processes exist in total (including the original)?'),
    code: c`int main()
{
    int n = 5;
    while (n > 0) {
        fork();
        n = n / 2;
    }
    return 0;
}`,
    answer: 8,
    explanation: L('`n` değerleri 5 → 2 → 1 → 0. Döngü 3 tur döner (5, 2, 1 için) ve her turda işlem sayısı ikiye katlanır: 2³ = 8. `n` her işlemde kendi kopyasında aynı biçimde azalır.', 'The values of `n` are 5 → 2 → 1 → 0. The loop runs 3 times (for 5, 2 and 1), each doubling the processes: 2³ = 8. `n` shrinks identically in every process’s own copy.'),
  },
  {
    id: 'm4-q18', topic: 'fork-basics', difficulty: 3, kind: 'numeric',
    prompt: L('`X` satırı kaç kez yazdırılır?', 'How many times is `X` printed?'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 4; i++)
        if (i % 2 == 0)
            fork();
    printf("X\n");
    return 0;
}`,
    answer: 4,
    explanation: L('Yalnızca `i = 0` ve `i = 2` için `fork` çağrılır: 2 koşulsuz `fork` → 2² = 4 işlem, hepsi `X` yazar.', '`fork` is called only for `i = 0` and `i = 2`: 2 unconditional forks → 2² = 4 processes, all printing `X`.'),
  },
  {
    id: 'm4-q19', topic: 'fork-basics', difficulty: 3, kind: 'mcq',
    prompt: L('`wait` içeren programın çıktısı hangisidir? (satırlar boşlukla ayrılmıştır)', 'Which is the output of this program with `wait`? (lines separated by spaces)'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 2; i++) {
        if (fork() == 0) {
            printf("C%d\n", i);
        } else {
            wait(NULL);
            printf("P%d\n", i);
        }
    }
    return 0;
}`,
    options: [
      L('C0 C1 P1 P0 C1 P1', 'C0 C1 P1 P0 C1 P1'),
      L('C0 P0 C1 P1', 'C0 P0 C1 P1'),
      L('C0 C1 P0 P1 C1 P1', 'C0 C1 P0 P1 C1 P1'),
      L('C0 C1 C1 P1 P1 P0', 'C0 C1 C1 P1 P1 P0'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: ayrıntılı izleme açıklamada.', 'Correct: see the trace in the explanation.'),
      L('Çocuklar döngüyü sürdürür; sadece 4 satır olamaz (toplam 4 işlem, 6 satır).', 'Children continue the loop; it cannot be just 4 lines (4 processes, 6 lines).'),
      L('`P0`, `P1`’den önce yazılamaz: ana işlem önce `P1`’e ulaşan çocuğunu beklemek zorundadır.', '`P0` cannot come before `P1`: the parent must first wait for its child, which reaches `P1` earlier.'),
      L('İkinci `C1`’i yazan işlem, ana işlem `P0`’ı yazdıktan sonra doğar; bu yüzden ilk `C1`’den hemen sonra gelemez.', 'The process printing the second `C1` is born only after the parent printed `P0`, so the two `C1`s cannot be adjacent like this.'),
    ],
    explanation: L('İşlemler A (ilk), B (A’nın ilk çocuğu). A `i=0`’da B’yi üretir ve bekler. B `C0` yazar, `i=1`’de C’yi üretir ve bekler. C `C1` yazar ve biter. B `P1` yazar, biter. A `P0` yazar, `i=1`’de D’yi üretir; D `C1` yazar ve biter; A `P1` yazar. Çıktı: `C0 C1 P1 P0 C1 P1`. `wait` tek bir sıra dayatır.', 'Processes A (original), B (A’s first child). A forks B at `i=0` and waits. B prints `C0`, forks C at `i=1` and waits. C prints `C1` and ends. B prints `P1` and ends. A prints `P0`, forks D at `i=1`; D prints `C1` and ends; A prints `P1`. Output: `C0 C1 P1 P0 C1 P1`. `wait` enforces one single order.'),
  },
  // ───────────── scheduling / ordering ─────────────
  {
    id: 'm4-q20', topic: 'wait-exit-zombie', difficulty: 2, kind: 'mcq',
    prompt: L('Aşağıdaki programın **olabilecek** çıktısı hangisidir? (satırlar boşlukla ayrılmıştır)', 'Which of these outputs **can** the program produce? (lines separated by spaces)'),
    code: c`int main()
{
    if (fork() == 0) { printf("A\n"); exit(0); }
    if (fork() == 0) { printf("B\n"); exit(0); }
    wait(NULL);
    wait(NULL);
    printf("C\n");
    return 0;
}`,
    options: [L('A C B', 'A C B'), L('C B A', 'C B A'), L('B A C', 'B A C'), L('C A B', 'C A B')],
    answer: 2,
    optionNotes: [
      L('`C` iki `wait` tamamlanmadan yazılamaz; `B` ondan önce yazılmış olmalıdır.', '`C` cannot be printed before both `wait`s complete; `B` must precede it.'),
      L('`C` ilk olamaz.', '`C` cannot be first.'),
      L('Doğru: çizelgeleyici B çocuğunu önce çalıştırırsa `B A C` oluşur; `A B C` de mümkündür.', 'Correct: if the scheduler runs child B first the output is `B A C`; `A B C` is possible too.'),
      L('`C` ilk olamaz.', '`C` cannot be first.'),
    ],
    explanation: L('İki çocuğun hangisinin önce yazacağı çizelgelemeye bağlıdır (`A B` veya `B A`), ama ana işlem iki `wait` bitmeden `C`’ye ulaşamaz. Bu yüzden `C` daima sondadır ve yalnızca `A B C` ile `B A C` mümkündür.', 'Which child prints first depends on scheduling (`A B` or `B A`), but the parent cannot reach `C` before both `wait`s return. `C` is therefore always last and only `A B C` and `B A C` are possible.'),
  },
  {
    id: 'm4-q21', topic: 'wait-exit-zombie', difficulty: 3, kind: 'numeric',
    prompt: L('Aynı program, `wait` çağrıları **kaldırılınca**: `A`, `B`, `C` satırlarının kaç farklı sırada yazdırılması mümkündür?', 'Same program but with the `wait` calls **removed**: in how many different orders can the lines `A`, `B`, `C` be printed?'),
    code: c`int main()
{
    if (fork() == 0) { printf("A\n"); exit(0); }
    if (fork() == 0) { printf("B\n"); exit(0); }
    printf("C\n");
    return 0;
}`,
    answer: 6,
    explanation: L('Üç işlem birbirinden bağımsız ve aralarında senkronizasyon yok; her sıralama (3! = 6) çizelgeleyici tarafından üretilebilir. Çıktı sırasına güvenmek için `wait` gerekir.', 'The three processes are independent with no synchronisation; every ordering (3! = 6) can be produced by the scheduler. To rely on output order you need `wait`.'),
  },
  {
    id: 'm4-q22', topic: 'wait-exit-zombie', difficulty: 2, kind: 'mcq',
    prompt: L('Üç kuşaklı program ne yazdırır? (satırlar boşlukla ayrılmıştır)', 'What does this three-generation program print? (lines separated by spaces)'),
    code: c`int main()
{
    if (fork() == 0) {
        if (fork() == 0) {
            printf("G\n");
        } else {
            wait(NULL);
            printf("C\n");
        }
    } else {
        wait(NULL);
        printf("P\n");
    }
    return 0;
}`,
    options: [L('P C G', 'P C G'), L('G C P', 'G C P'), L('C G P', 'C G P'), L('Sıra belirsiz', 'The order is non-deterministic')],
    answer: 1,
    optionNotes: [
      L('Ana işlem `wait` ile beklediği için ilk yazan olamaz.', 'The parent waits, so it cannot print first.'),
      L('Doğru: torun `G` yazar ve biter, çocuk `wait`ten döner `C` yazar, sonra ana işlem `P` yazar.', 'Correct: the grandchild prints `G` and ends, the child returns from `wait` and prints `C`, then the parent prints `P`.'),
      L('Çocuk `C`’yi torunu beklemeden yazamaz.', 'The child cannot print `C` before waiting for its child.'),
      L('Her seviyedeki `wait` sırayı belirler; belirsizlik yok.', 'The `wait` at each level fixes the order; there is no ambiguity.'),
    ],
    explanation: L('Zincirleme `wait`’ler sırayı tersine çevirir: en derindeki işlem önce biter. Çıktı daima `G C P`.', 'Chained `wait`s reverse the order: the deepest process finishes first. Output is always `G C P`.'),
  },
  {
    id: 'm4-q23', topic: 'wait-exit-zombie', difficulty: 2, kind: 'numeric',
    prompt: L('Program hangi sayıyı yazdırır?', 'Which number does the program print?'),
    code: c`int main()
{
    int s;
    if (fork() == 0)
        exit(7);
    wait(&s);
    printf("%d\n", WEXITSTATUS(s));
    return 0;
}`,
    answer: 7,
    explanation: L('`wait(&s)` alt işlemin kodlanmış durumunu `s`’ye yazar; `WEXITSTATUS(s)` bunun içindeki `exit` değerini (7) çıkarır. `s`’nin kendisi 7 değil, Linux’ta `7 << 8` = 1792’dir.', '`wait(&s)` stores the child’s encoded status in `s`; `WEXITSTATUS(s)` extracts the `exit` value (7). `s` itself is not 7 but `7 << 8` = 1792 on Linux.'),
  },
  {
    id: 'm4-q24', topic: 'pids-orphans', difficulty: 2, kind: 'mcq',
    prompt: L('Klasik UNIX davranışına göre (ders notları) program hangi `ppid` değerini yazdırır?', 'According to classic UNIX behaviour (the lecture notes), which `ppid` value does the program print?'),
    code: c`int main()
{
    if (fork() == 0) {
        sleep(2);
        printf("ppid=%d\n", getppid());
        exit(0);
    }
    printf("parent exits\n");
    return 0;
}`,
    options: [
      L('Ana işlemin PID’si', 'The parent’s PID'),
      L('1 (init)', '1 (init)'),
      L('0', '0'),
      L('Alt işlemin kendi PID’si', 'The child’s own PID'),
    ],
    answer: 1,
    optionNotes: [
      L('Ana işlem çocuktan önce bitti; artık onun çocuğu değil.', 'The parent finished before the child; the child no longer has that parent.'),
      L('Doğru: çocuk öksüz (orphan) kaldı ve init (PID 1) tarafından evlat edinildi.', 'Correct: the child became an orphan and was adopted by init (PID 1).'),
      L('0 bir işlem değil, `fork`’un çocukta döndürdüğü değerdir.', '0 is the value `fork` returns in the child, not a process.'),
      L('`getppid()` ana işlemi verir, kendini değil.', '`getppid()` returns the parent, not itself.'),
    ],
    explanation: L('Ana işlem, çocuk `sleep` ederken biter. Çocuğun ana işlemi artık yoktur; çekirdek onu init’e (PID 1) bağlar. Modern Linux’ta evlat edinen “subreaper” olabilir ama ders notlarına göre cevap 1’dir.', 'The parent ends while the child sleeps. The child’s parent no longer exists; the kernel re-parents it to init (PID 1). On modern Linux a “subreaper” may adopt it, but by the lecture notes the answer is 1.'),
  },
  {
    id: 'm4-q25', topic: 'pids-orphans', difficulty: 2, kind: 'tf',
    prompt: L('Ana işlemin `pid = fork()` ile aldığı `pid` değeri, alt işlemin kendi `getpid()` sonucuyla aynıdır.', 'The `pid` value the parent receives from `pid = fork()` equals the child’s own `getpid()` result.'),
    code: c`int main()
{
    int pid = fork();
    if (pid > 0)
        printf("P %d\n", pid);
    else if (pid == 0)
        printf("C %d\n", getpid());
    return 0;
}`,
    answer: true,
    explanation: L('Doğru: `fork` ana işleme yeni çocuğun PID’sini verir; çocuk aynı sayıyı `getpid()` ile görür. Gerçek PID değerleri sistemden sisteme değişir, ama eşitlik her zaman geçerlidir. (Satırların sırası belirsizdir.)', 'True: `fork` gives the parent the new child’s PID; the child sees the same number via `getpid()`. Actual PID values vary by system, but the equality always holds. (The order of the two lines is not defined.)'),
  },
  {
    id: 'm4-q26', topic: 'pids-orphans', difficulty: 1, kind: 'mcq',
    prompt: L('Alt işlem, ana işlemin kimliğini hangi çağrıyla öğrenir?', 'Which call lets a child learn its parent’s ID?'),
    options: [L('`getpid()`', '`getpid()`'), L('`getppid()`', '`getppid()`'), L('`fork()` dönüş değeri', 'the `fork()` return value'), L('`wait()`', '`wait()`')],
    answer: 1,
    optionNotes: [
      L('`getpid()` çağıranın **kendi** kimliğini verir.', '`getpid()` returns the caller’s **own** ID.'),
      L('Doğru: “parent PID”.', 'Correct: “parent PID”.'),
      L('Alt işlemde `fork` 0 döndürür; kimlik bilgisi vermez.', 'In the child `fork` returns 0, not an ID.'),
      L('`wait` ana işlemin çağırdığı bir çağrıdır ve alt işlemin kimliğini döndürür.', '`wait` is called by the parent and returns the child’s ID.'),
    ],
    explanation: L('`getpid()` kendi PID’ni, `getppid()` ana işlemin PID’sini verir. Her ikisi de `<sys/types.h>` ve `<unistd.h>` ile kullanılır.', '`getpid()` gives your own PID, `getppid()` your parent’s. Both need `<sys/types.h>` and `<unistd.h>`.'),
  },
  // ───────────── wait / zombie / orphan concepts and scenarios ─────────────
  {
    id: 'm4-q27', topic: 'wait-exit-zombie', difficulty: 1, kind: 'tf',
    prompt: L('Çağıran işlemin hiç alt işlemi yoksa `wait()` onu sonsuza kadar bloke eder.', 'If the calling process has no children at all, `wait()` blocks it forever.'),
    answer: false,
    explanation: L('Alt işlem yoksa `wait()` hemen `-1` döner ve `errno` ayarlanır. Bloke olmak yalnızca en az bir alt işlem varken ve henüz hiçbiri sonlanmamışken olur.', 'With no children `wait()` returns `-1` immediately and sets `errno`. Blocking happens only when at least one child exists and none has terminated yet.'),
  },
  {
    id: 'm4-q28', topic: 'wait-exit-zombie', difficulty: 2, kind: 'mcq',
    prompt: L('Bir sunucu işlem her istek için `fork()` ile bir işçi (worker) oluşturuyor, işçi işini bitirip `exit(0)` yapıyor. Sunucu hiç `wait()` çağırmıyor ve günlerce çalışıyor. Zamanla ne birikir?', 'A server process forks a worker per request; each worker finishes and calls `exit(0)`. The server never calls `wait()` and runs for days. What accumulates over time?'),
    options: [
      L('Zombi (zombie) işlemler: işlem tablosu girdileri dolar ve sonunda `fork` başarısız olur', 'Zombie processes: process-table entries fill up and eventually `fork` fails'),
      L('Öksüz (orphan) işlemler, çünkü sunucu çalışmaya devam eder', 'Orphan processes, because the server keeps running'),
      L('Çalışan işçi işlemler; hiç sonlanmazlar', 'Running worker processes; they never terminate'),
      L('Hiçbir şey; çekirdek bitmiş işlemleri hemen siler', 'Nothing; the kernel immediately removes finished processes'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: sonlanan çocuk, ana işlemi durumunu `wait` ile alana kadar zombi olarak kalır; bu girdiler PID ve tablo kaynaklarını tutar.', 'Correct: a terminated child stays a zombie until the parent collects its status with `wait`; the entries hold PIDs and table slots.'),
      L('Öksüz, ana işlemi bitmiş çocuktur; burada ana işlem yaşıyor.', 'An orphan is a child whose parent has ended; here the parent is alive.'),
      L('İşçiler `exit` çağırdığı için sonlanmıştır.', 'The workers called `exit`, so they have terminated.'),
      L('Çekirdek durum bilgisini ana işlem alana kadar saklar.', 'The kernel keeps the status until the parent collects it.'),
    ],
    explanation: L('Zombi, `exit` etmiş ama ana işlemi tarafından henüz `wait` ile “toplanmamış” işlemdir. Bellek serbest kalır, ancak işlem tablosu girdisi (PID ve çıkış durumu) kalır. Çözüm: `wait`/`waitpid` döngüsü veya `SIGCHLD` işleme.', 'A zombie has `exit`ed but has not yet been “reaped” via `wait` by its parent. Its memory is freed but the process-table entry (PID and exit status) remains. Fix: a `wait`/`waitpid` loop or `SIGCHLD` handling.'),
  },
  {
    id: 'm4-q29', topic: 'wait-exit-zombie', difficulty: 2, kind: 'tf',
    prompt: L('Bir zombi işlem `kill -9` ile öldürülerek tablodan kaldırılabilir.', 'A zombie process can be removed from the table by killing it with `kill -9`.'),
    answer: false,
    explanation: L('Zombi zaten ölüdür; sinyal ona etki etmez. Girdiyi ancak ana işlemin `wait` çağrısı kaldırır. Ana işlem sonlanırsa zombi init’e geçer ve init onu toplar.', 'A zombie is already dead; signals have no effect. Only the parent’s `wait` removes the entry. If the parent ends, the zombie is re-parented to init, which reaps it.'),
  },
  {
    id: 'm4-q30', topic: 'wait-exit-zombie', difficulty: 2, kind: 'multi',
    prompt: L('Zombi işlemler hakkında hangileri doğrudur?', 'Which statements about zombie processes are true?'),
    options: [
      L('Sonlanmıştır ancak ana işlemi durumunu henüz almamıştır.', 'It has terminated but its parent has not collected its status yet.'),
      L('`exit()` çağrısı `wait()` çağrısından önce gerçekleşirse oluşur.', 'It arises if `exit()` happens before the parent’s `wait()`.'),
      L('İşlemciyi (CPU) sürekli meşgul eder.', 'It keeps the CPU busy.'),
      L('Çıkış durumu `wait` ile okunabilir.', 'Its exit status can still be read with `wait`.'),
    ],
    answers: [0, 1, 3],
    explanation: L('Zombi, `t(exit) < t(wait)` durumunda oluşur ve çıkış durumunu ana işlemin alması için saklar. Çalışmadığı için CPU harcamaz.', 'A zombie arises when `t(exit) < t(wait)` and preserves the exit status for the parent. It does not run, so it consumes no CPU.'),
  },
  {
    id: 'm4-q31', topic: 'wait-exit-zombie', difficulty: 1, kind: 'short',
    prompt: L('Sonlanmış ama ana işlemi tarafından `wait` ile toplanmamış işlemin durumuna ne denir?', 'What is a process called that has terminated but has not yet been reaped by its parent via `wait`?'),
    accept: ['zombie', 'zombi', 'zombie process', 'zombi işlem'],
    explanation: L('Zombi (zombie) durumu: işlem sonlanmıştır, çıkış durumu ana işlem için tutulur.', 'The zombie state: the process has terminated and its exit status is kept for the parent.'),
  },
  {
    id: 'm4-q32', topic: 'pids-orphans', difficulty: 2, kind: 'short',
    prompt: L('Ana işlemi sonlanmış (öksüz) bir işlemi klasik UNIX’te hangi PID’ye sahip işlem evlat edinir? (sayı)', 'In classic UNIX, which PID does the process have that adopts an orphan? (number)'),
    accept: ['1', 'pid 1', 'init'],
    explanation: L('init işlemi (PID 1). `getppid()` bundan sonra 1 döndürür.', 'The init process (PID 1). `getppid()` returns 1 from then on.'),
  },
  {
    id: 'm4-q33', topic: 'fork-basics', difficulty: 1, kind: 'fill',
    prompt: L('Boşlukları doldurun.', 'Fill in the blanks.'),
    template: L('`fork()` alt işlemde {0} döndürür, ana işlemde alt işlemin {1} değerini döndürür, başarısız olursa {2} döndürür.', '`fork()` returns {0} in the child, the child’s {1} in the parent and {2} on failure.'),
    blanks: [['0', 'sıfır', 'zero'], ['pid', 'process id', 'kimliği', 'kimlik', 'pid si', 'id'], ['-1', 'eksi bir']],
    explanation: L('Bu üç değer, fork sonrası kodun dallanma kalıbının temelidir: `pid == 0` alt, `pid > 0` ana, `pid == -1` hata.', 'These three values underpin the post-fork branching pattern: `pid == 0` child, `pid > 0` parent, `pid == -1` error.'),
  },
  {
    id: 'm4-q34', topic: 'fork-basics', difficulty: 2, kind: 'match',
    prompt: L('Durumu `fork()`’un o durumdaki dönüş değeriyle eşleştirin.', 'Match each situation with the value `fork()` returns in it.'),
    left: [L('Alt işlemde', 'In the child'), L('Ana işlemde, başarıda', 'In the parent, on success'), L('Ana işlemde, yeterli kaynak yokken', 'In the parent, when resources are insufficient')],
    right: [L('-1', '-1'), L('Alt işlemin PID’si', 'The child’s PID'), L('0', '0')],
    pairs: [2, 1, 0],
    explanation: L('Alt işlem 0, başarılı ana işlem çocuğun PID’si alır; hatada çocuk yaratılmaz ve ana işlem -1 alır.', 'The child gets 0, the parent the child’s PID; on failure no child is created and the parent gets -1.'),
  },
  {
    id: 'm4-q35', topic: 'wait-exit-zombie', difficulty: 2, kind: 'order',
    prompt: L('Bir zombi işlemin yaşam döngüsünü doğru sıraya koyun.', 'Put the lifecycle of a zombie process in order.'),
    items: [
      L('Ana işlem `fork()` ile alt işlem yaratır.', 'The parent creates a child with `fork()`.'),
      L('Alt işlem `exit(x)` çağırır ve kaynaklarını bırakır.', 'The child calls `exit(x)` and releases its resources.'),
      L('Alt işlem zombi durumuna geçer; çıkış durumu çekirdekte saklanır.', 'The child becomes a zombie; its exit status is kept in the kernel.'),
      L('Ana işlem `wait(&s)` çağırır.', 'The parent calls `wait(&s)`.'),
      L('`wait` alt işlemin PID’sini ve durumunu döndürür, zombi tablodan silinir.', '`wait` returns the child’s PID and status; the zombie is removed from the table.'),
    ],
    explanation: L('`t(fork) < t(exit) < t(wait)` durumu: ana işlem geç beklerse çocuk zombi olur. Ana işlem önce beklerse bloklanır ve zombi hiç görülmez.', 'The case `t(fork) < t(exit) < t(wait)`: if the parent waits late the child becomes a zombie. If the parent waits first it blocks and no zombie is seen.'),
  },
  {
    id: 'm4-q36', topic: 'fork-basics', difficulty: 3, kind: 'order',
    prompt: L('`fork()` çağrısı sırasında çekirdeğin yaptığı işleri mantıksal sıraya koyun.', 'Put the work the kernel does during `fork()` into a logical order.'),
    items: [
      L('İşlem tablosunda yeni bir girdi ve yeni bir PID ayır.', 'Allocate a new process-table entry and a new PID.'),
      L('Ana işlemin adres alanını (veri, yığın) alt işleme kopyala; program kodunu paylaş.', 'Copy the parent’s address space (data, stack) for the child; share the program code.'),
      L('Alt işlemin dönüş değerini 0, ana işlemin dönüş değerini alt işlemin PID’si yap.', 'Set the child’s return value to 0 and the parent’s to the child’s PID.'),
      L('Her iki işlemi çalışmaya hazır duruma al; çizelgeleyici hangisinin önce çalışacağına karar verir.', 'Make both processes ready; the scheduler decides which runs first.'),
    ],
    explanation: L('Alt işlem, `fork`’tan hemen sonraki komuttan devam eder; ana ile aynı kodu, kopya veriyle çalıştırır. Hangisinin önce çalışacağı tanımsızdır.', 'The child continues at the instruction right after `fork`, running the same code with copied data. Which runs first is undefined.'),
  },
  {
    id: 'm4-q37', topic: 'wait-exit-zombie', difficulty: 3, kind: 'mcq',
    prompt: L('Bir ana işlem 3 alt işlem yaratıyor, her biri `exit` ediyor; ana işlem yalnızca **bir** kez `wait(NULL)` çağırıp sonra 60 saniye `sleep` ediyor. Bu 60 saniye boyunca `ps` en çok kaç zombi gösterir?', 'A parent creates 3 children, each of which calls `exit`; the parent calls `wait(NULL)` only **once** and then sleeps for 60 seconds. At most how many zombies does `ps` show during that 60 seconds?'),
    options: [L('0', '0'), L('1', '1'), L('2', '2'), L('3', '3')],
    answer: 2,
    optionNotes: [
      L('Ana işlem yalnızca bir çocuğu topladı; diğerleri duruyor.', 'The parent reaped only one child; the others remain.'),
      L('Tek zombi, iki `wait` yapılmış olsaydı kalırdı.', 'A single zombie would remain after two `wait`s.'),
      L('Doğru: 3 çocuk − 1 toplanmış = 2 zombi.', 'Correct: 3 children − 1 reaped = 2 zombies.'),
      L('Bir çocuk `wait` ile toplanmıştır.', 'One child has been reaped by `wait`.'),
    ],
    explanation: L('Her `wait` yalnızca bir sonlanmış çocuğu toplar. Üç çocuğun hepsi toplanacaksa `while (wait(NULL) > 0);` gibi bir döngü gerekir.', 'Each `wait` reaps only one terminated child. To collect all three you need a loop such as `while (wait(NULL) > 0);`.'),
  },
  {
    id: 'm4-q38', topic: 'pids-orphans', difficulty: 2, kind: 'mcq',
    prompt: L('Kullanıcı kabuğa `./long_job &` yazıp, `long_job` bitmeden kabuğu kapatıyor (sinyal gönderilmediğini varsayın). `long_job` için ne olur?', 'A user types `./long_job &` in a shell, then closes the shell before `long_job` finishes (assume no signal is delivered). What happens to `long_job`?'),
    options: [
      L('Öksüz kalır ve init tarafından evlat edinilip çalışmaya devam eder', 'It becomes an orphan, is adopted by init and keeps running'),
      L('Hemen zombi olur', 'It immediately becomes a zombie'),
      L('Çekirdek onu otomatik öldürür', 'The kernel kills it automatically'),
      L('Kabuğun PID’sini miras alır', 'It inherits the shell’s PID'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: ana işlemin ölümü çocuğu öldürmez; yeni ana işlem init olur.', 'Correct: the parent’s death does not kill the child; init becomes its new parent.'),
      L('Zombi, kendisi sonlanmış işlemdir; `long_job` hâlâ çalışıyor.', 'A zombie is a process that has itself terminated; `long_job` still runs.'),
      L('Ana işlemin sonlanması çocuğu otomatik sonlandırmaz.', 'A parent’s exit does not automatically terminate children.'),
      L('PID’ler miras alınmaz; yalnızca `ppid` değişir.', 'PIDs are not inherited; only `ppid` changes.'),
    ],
    explanation: L('Bu, öksüz (orphan) işlemin klasik senaryosudur. `&` ile arka planda çalışan işlem kabuğun alt işlemidir; kabuk ölürse `getppid()` 1’e döner.', 'This is the classic orphan scenario. A background process started with `&` is a child of the shell; if the shell dies, `getppid()` becomes 1.'),
  },
  {
    id: 'm4-q39', topic: 'wait-exit-zombie', difficulty: 2, kind: 'fill',
    prompt: L('Ana işlemin **tüm** alt işlemlerini bekleyen kalıbı tamamlayın.', 'Complete the pattern that waits for **all** of the parent’s children.'),
    template: L('`while ((w = {0}(&status)) != {1}) printf("child %d done\\n", w);`', '`while ((w = {0}(&status)) != {1}) printf("child %d done\\n", w);`'),
    blanks: [['wait'], ['-1', '− 1']],
    explanation: L('`wait` bir çocuk sonlandıkça onun PID’sini döndürür; hiç çocuk kalmayınca `-1` döner ve döngü biter.', '`wait` returns a child’s PID each time one terminates; when no children remain it returns `-1` and the loop ends.'),
  },
  {
    id: 'm4-q40', topic: 'pids-orphans', difficulty: 2, kind: 'multi',
    prompt: L('Hangileri `fork()` sonrasında alt işlemin ana işlemden **miras aldığı/kopyaladığı** şeylerdir?', 'Which of these does the child **inherit/copy** from the parent after `fork()`?'),
    options: [
      L('Değişkenlerin o andaki değerleri', 'The current values of the variables'),
      L('Aynı program kodu (aynı komutlar)', 'The same program code (same instructions)'),
      L('Ana işlemin PID’si', 'The parent’s PID'),
      L('Henüz boşaltılmamış stdio tamponunun içeriği', 'The contents of the not-yet-flushed stdio buffer'),
    ],
    answers: [0, 1, 3],
    explanation: L('Alt işlem verinin kopyasını, aynı kodu ve tamponu devralır. Ancak kendi **yeni** PID’sine sahiptir; ana işlemin PID’si onun `ppid` değeri olur.', 'The child gets a copy of the data, the same code and the buffer. But it has its **own new** PID; the parent’s PID becomes its `ppid`.'),
  },
  // ───────────── process trees ─────────────
  {
    id: 'm4-q41', topic: 'fork-basics', difficulty: 1, kind: 'tree',
    prompt: L('Bu programın oluşturduğu işlem ağacını çizin (kim kimi `fork` etti).', 'Draw the process tree this program creates (who forked whom).'),
    code: c`int main()
{
    fork();
    fork();
    return 0;
}`,
    explanation: L('Ana işlem P iki kez `fork` yapar: iki çocuk A ve B. İlk `fork`’ta doğan A da ikinci `fork`’u çalıştırır ve kendi çocuğunu (C) üretir. Ağaç: P → {A → {C}, B}. Toplam 4 işlem.', 'The original P forks twice: two children A and B. A (born from the first fork) also runs the second `fork` and creates its own child C. Tree: P → {A → {C}, B}. 4 processes in total.'),
  },
  {
    id: 'm4-q42', topic: 'fork-basics', difficulty: 2, kind: 'tree',
    prompt: L('İşlem ağacını çizin. Dikkat: hangi işlemler döngüde kalıyor?', 'Draw the process tree. Mind which processes stay in the loop.'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 3; i++) {
        if (fork() != 0)
            break;
    }
    return 0;
}`,
    explanation: L('Ana işlem ilk `fork`’tan sonra `break` ile ayrılır; döngüde yalnızca çocuk kalır ve o da aynısını yapar. Sonuç, uzunluğu 4 olan bir zincirdir: P → C1 → C2 → C3.', 'After its first `fork` the parent leaves via `break`; only the child stays in the loop and does the same. The result is a chain of length 4: P → C1 → C2 → C3.'),
  },
  {
    id: 'm4-q43', topic: 'fork-basics', difficulty: 2, kind: 'tree',
    prompt: L('İşlem ağacını çizin.', 'Draw the process tree.'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 3; i++) {
        if (fork() == 0)
            exit(0);
    }
    return 0;
}`,
    explanation: L('Çocuklar `exit` ettiği için çoğalmaz; ana işlem döngüde 3 kez `fork` yapar. Ağaç: bir kök ve 3 yaprak çocuk (yelpaze).', 'The children `exit` and do not multiply; the parent forks 3 times in the loop. Tree: one root with 3 leaf children (a fan).'),
  },
  {
    id: 'm4-q44', topic: 'fork-basics', difficulty: 3, kind: 'tree',
    prompt: L('İşlem ağacını çizin. (`&&` kısa devre yapar.)', 'Draw the process tree. (`&&` short-circuits.)'),
    code: c`int main()
{
    fork() && fork();
    return 0;
}`,
    explanation: L('Ana işlem P: ilk `fork` ≠ 0 → ikinci `fork`’u da çalıştırır. İlk çocuk A 0 alır ve kısa devre nedeniyle ikinciyi atlar. P iki çocuk üretir: P → {A, B}.', 'Parent P: first `fork` ≠ 0 → it runs the second `fork` as well. The first child A gets 0 and skips the second one due to short-circuiting. P produces two children: P → {A, B}.'),
  },
  {
    id: 'm4-q45', topic: 'fork-basics', difficulty: 3, kind: 'tree',
    prompt: L('İşlem ağacını çizin. (`||` kısa devre yapar.)', 'Draw the process tree. (`||` short-circuits.)'),
    code: c`int main()
{
    fork() || fork();
    return 0;
}`,
    explanation: L('Ana işlem P ilk `fork`’ta ≠ 0 alır ve kısa devre yapar: yalnızca A doğar. A 0 alır ve ikinci `fork`’u çalıştırarak C’yi üretir. Ağaç bir zincir: P → A → C. (Bir önceki sorunun `&&`’li hâliyle karşılaştırın.)', 'Parent P gets ≠ 0 from the first `fork` and short-circuits: only A is born. A gets 0 and runs the second `fork`, creating C. The tree is a chain: P → A → C. (Compare with the `&&` version in the previous question.)'),
  },
  {
    id: 'm4-q46', topic: 'fork-basics', difficulty: 3, kind: 'tree',
    prompt: L('İşlem ağacını çizin (toplam 8 işlem).', 'Draw the process tree (8 processes in total).'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 3; i++)
        fork();
    return 0;
}`,
    explanation: L('Kök P, `i = 0, 1, 2` turlarında üç çocuk üretir; bu çocukların alt ağaçları sırasıyla 4, 2 ve 1 işlemdir (çünkü `i=0`’da doğan çocuk kalan 2 turda 2 çocuk üretir ve onlar da kalan turlarda çoğalır…). Toplam 1 + 4 + 2 + 1 = 8.', 'Root P creates three children in iterations `i = 0, 1, 2`; their subtrees have 4, 2 and 1 processes respectively (the child born at `i=0` makes 2 children in the remaining 2 iterations, which multiply further…). Total 1 + 4 + 2 + 1 = 8.'),
  },
  {
    id: 'm4-q47', topic: 'wait-exit-zombie', difficulty: 2, kind: 'tree',
    prompt: L('İşlem ağacını çizin (`wait` ağaç şeklini değiştirmez, ama çalışma sırasını belirler).', 'Draw the process tree (`wait` does not change the tree shape, only the run order).'),
    code: c`int main()
{
    if (fork() == 0) {
        if (fork() == 0)
            printf("G\n");
        else
            wait(NULL);
    } else {
        wait(NULL);
    }
    return 0;
}`,
    explanation: L('Ana P bir çocuk C üretir; C bir torun G üretir. Ağaç P → C → G: üç kuşaklı zincir.', 'The parent P creates a child C; C creates a grandchild G. Tree P → C → G: a three-generation chain.'),
  },
];
