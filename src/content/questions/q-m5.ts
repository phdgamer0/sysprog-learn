import type { Question } from '../types';
import { L, c } from './h';

export const QUESTIONS_M5: Question[] = [
  {
    id: 'm5-q01', topic: 'exec-system', difficulty: 2, kind: 'mcq',
    prompt: L('Bu programda `"after"` satırı ne zaman yazdırılır?', 'When is the line `"after"` printed in this program?'),
    code: c`int main()
{
    execl("/bin/ls", "ls", (char *)NULL);
    printf("after\n");
    return 0;
}`,
    options: [
      L('Her zaman, `ls` bittikten sonra', 'Always, after `ls` finishes'),
      L('Yalnızca `execl` başarısız olursa (ör. dosya yoksa)', 'Only if `execl` fails (e.g. the file does not exist)'),
      L('Hiçbir zaman', 'Never'),
      L('Yalnızca `ls` hata verirse', 'Only if `ls` reports an error'),
    ],
    answer: 1,
    optionNotes: [
      L('Bu `system()` davranışıdır; `exec` geri dönmez.', 'That is how `system()` behaves; `exec` does not return.'),
      L('Doğru: başarılı `exec` işlem görüntüsünü (image) değiştirir, eski komutlar bir daha çalışmaz. Dönüş yalnızca hata (-1) durumunda olur.', 'Correct: a successful `exec` replaces the process image so the old instructions never run again. It returns only on error (-1).'),
      L('Yanlış çağrı (ör. olmayan dosya) sonrasında yazılır.', 'It is printed after a failed call (e.g. a missing file).'),
      L('`ls`’in çıkış kodu `execl` dönüşünü etkilemez; zaten dönmez.', '`ls`’s exit code is irrelevant; `execl` does not return anyway.'),
    ],
    explanation: L('`exec` ailesi çağıran işlemin program görüntüsünü yenisiyle değiştirir; başarıda geri dönüş yoktur. `execl`’den sonraki kod yalnızca hata işleme içindir: `perror` ve `exit`.', 'The `exec` family replaces the caller’s program image with a new one; there is no return on success. Code after `execl` is only for error handling: `perror` and `exit`.'),
  },
  {
    id: 'm5-q02', topic: 'exec-system', difficulty: 2, kind: 'numeric',
    prompt: L('Terminalde çalıştırılan program (`/bin/echo` mevcut) toplam kaç satır çıktı üretir?', 'Run in a terminal (`/bin/echo` exists), how many lines of output does the program produce in total?'),
    code: c`int main()
{
    printf("A\n");
    execl("/bin/echo", "echo", "B", (char *)NULL);
    printf("C\n");
    return 0;
}`,
    answer: 2,
    explanation: L('`A` yazılır; `execl` başarılı olunca işlem `echo` olur ve `B` yazılır. `C` içeren kod artık bellekte değildir. Toplam: `A`, `B` = 2 satır.', '`A` is printed; when `execl` succeeds the process becomes `echo` and prints `B`. The code with `C` is no longer in memory. Total: `A`, `B` = 2 lines.'),
  },
  {
    id: 'm5-q03', topic: 'exec-system', difficulty: 1, kind: 'tf',
    prompt: L('`exec` çağrısı yeni bir işlem (yeni PID) yaratır.', 'An `exec` call creates a new process (new PID).'),
    answer: false,
    explanation: L('`exec` yeni işlem yaratmaz: aynı işlem, aynı PID ile başka bir programı çalıştırır. Yeni işlemi `fork` yaratır; `fork` + `exec` birlikte “yeni program başlatma” kalıbını oluşturur.', '`exec` does not create a process: the same process, same PID, runs another program. `fork` creates the new process; `fork` + `exec` together form the “start a new program” pattern.'),
  },
  {
    id: 'm5-q04', topic: 'exec-system', difficulty: 2, kind: 'mcq',
    prompt: L('Program A, PID’sini yazdırıp `execl("B", "B", (char *)NULL)` çağırıyor; program B de PID’sini yazdırıyor. İki çıktı için ne söylenebilir?', 'Program A prints its PID and then calls `execl("B", "B", (char *)NULL)`; program B prints its PID too. What can be said about the two outputs?'),
    options: [
      L('Aynıdırlar', 'They are the same'),
      L('B’nin PID’si A’nınkinden büyüktür', 'B’s PID is larger than A’s'),
      L('B’nin PID’si, A’nın PID’sinin ana işlemidir', 'B’s PID is A’s parent PID'),
      L('Hiçbir ilişki yoktur; rastgeledir', 'No relation; random'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: `exec` aynı işlemin içeriğini değiştirir; PID korunur.', 'Correct: `exec` replaces the contents of the same process; the PID is kept.'),
      L('Yeni PID yalnızca `fork` ile alınır.', 'A new PID comes only from `fork`.'),
      L('`getppid()` ile ilgili bir karışıklık.', 'A mix-up with `getppid()`.'),
      L('İlişki vardır: eşitlik.', 'There is a relation: equality.'),
    ],
    explanation: L('Slayttaki şemada “aynı PID değerini verir” vurgulanır: komutlar ve veriler değişir; işlem kimliği, ana işlem ilişkisi ve açık dosyalar sürer.', 'The slide diagram stresses “gives the same PID”: instructions and data change; the process ID, parent relation and open files remain.'),
  },
  {
    id: 'm5-q05', topic: 'exec-system', difficulty: 3, kind: 'mcq',
    prompt: L('`/bin/echo` mevcut. Program terminalde çalışıyor. Çıktı nedir? (satırlar boşlukla ayrılmıştır)', '`/bin/echo` exists. The program runs in a terminal. What is the output? (lines separated by spaces)'),
    code: c`int main()
{
    if (fork() == 0) {
        execl("/bin/echo", "echo", "child", (char *)NULL);
        printf("exec failed\n");
        exit(1);
    }
    wait(NULL);
    printf("parent\n");
    return 0;
}`,
    options: [
      L('child parent', 'child parent'),
      L('child exec failed parent', 'child exec failed parent'),
      L('parent child', 'parent child'),
      L('exec failed parent', 'exec failed parent'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: çocuk `echo` olur ve `child` yazar; ana işlem `wait` sonrası `parent` yazar.', 'Correct: the child becomes `echo` and prints `child`; the parent prints `parent` after `wait`.'),
      L('`exec` başarılı olduğundan hata satırı çalışmaz.', 'The error line does not run because `exec` succeeds.'),
      L('Ana işlem `wait` ile beklediği için `parent` ilk yazılamaz.', 'The parent waits, so `parent` cannot come first.'),
      L('Bu `exec` başarısız olsaydı oluşurdu (ve `child` yazılmazdı).', 'That would happen if `exec` failed (and `child` would not appear).'),
    ],
    explanation: L('Kabuğun yaptığıyla aynı kalıp: `fork` → çocukta `exec` → ana işlemde `wait`. Çocukta `exec`’den sonraki satırlar yalnızca `exec` başarısız olursa çalışır.', 'The same pattern a shell uses: `fork` → `exec` in the child → `wait` in the parent. Lines after `exec` in the child run only if `exec` fails.'),
  },
  {
    id: 'm5-q06', topic: 'shell-processes', difficulty: 2, kind: 'order',
    prompt: L('Kabuğun bir **ön planda** (foreground) komutu (`prog X`) çalıştırma adımlarını sıralayın.', 'Order the steps of a shell running a **foreground** command (`prog X`).'),
    items: [
      L('Kabuk kullanıcıdan komut satırını okur.', 'The shell reads the command line from the user.'),
      L('Kabuk `fork()` ile bir alt işlem yaratır.', 'The shell creates a child with `fork()`.'),
      L('Alt işlem `exec` ile `X` programına geçer; kabuk `wait()` ile bloklanır.', 'The child switches to program `X` with `exec`; the shell blocks in `wait()`.'),
      L('`X` çalışır ve `exit()` ile sonlanır.', '`X` runs and terminates with `exit()`.'),
      L('Kabuk `wait`’ten döner ve yeni bir komut istemi (prompt) gösterir.', 'The shell returns from `wait` and shows a new prompt.'),
    ],
    explanation: L('Kabuk de sıradan bir işlemdir. Programı doğrudan kendi içinde çalıştırsaydı kendini kaybederdi; bu yüzden önce `fork`, sonra `exec` kullanır.', 'The shell is an ordinary process. If it ran the program itself it would lose itself; hence it uses `fork` first and `exec` afterwards.'),
  },
  {
    id: 'm5-q07', topic: 'shell-processes', difficulty: 2, kind: 'mcq',
    prompt: L('`./X` ile `./X &` arasındaki, kabuğun işlem yönetimi açısından temel fark nedir?', 'What is the key difference, in terms of process handling, between `./X` and `./X &`?'),
    options: [
      L('`&` ile kabuk alt işlem için `wait()` çağırmadan hemen yeni istem gösterir', 'With `&` the shell does not `wait()` for the child and shows a new prompt right away'),
      L('`&` ile `fork` yapılmaz', 'With `&` no `fork` is performed'),
      L('`&` ile program yeni bir PID almaz', 'With `&` the program gets no new PID'),
      L('`&` ile program çekirdek modunda çalışır', 'With `&` the program runs in kernel mode'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: her iki durumda da `fork` + `exec` yapılır; fark yalnızca kabuğun beklemesidir.', 'Correct: both cases do `fork` + `exec`; the only difference is whether the shell waits.'),
      L('Arka plan işi de ayrı bir işlemdir; `fork` gerekir.', 'A background job is also a separate process; `fork` is needed.'),
      L('Her iki durumda da yeni bir alt işlem ve PID vardır.', 'Both cases have a new child and PID.'),
      L('Çalışma modu bununla ilgisizdir.', 'The execution mode is unrelated.'),
    ],
    explanation: L('Ön planda kabuk `wait()` ile bloklanır; arka planda beklemez, bu yüzden alt işlem bitince (ve kabuk onu toplamazsa) bir süre zombi kalabilir — gerçek kabuklar bunu `SIGCHLD` ile toplar.', 'In the foreground the shell blocks in `wait()`; in the background it does not, so the child could remain a zombie after finishing unless the shell collects it — real shells do this via `SIGCHLD`.'),
  },
  {
    id: 'm5-q08', topic: 'shell-processes', difficulty: 3, kind: 'mcq',
    prompt: L('Bir öğrenci kendi mini kabuğunu yazıyor ve her komut için doğrudan `execl(komut, ...)` çağırıyor (`fork` yok). İlk komuttan sonra ne olur?', 'A student writes a mini shell and calls `execl(command, ...)` directly for each command (no `fork`). What happens after the first command?'),
    options: [
      L('Kabuk işlemi komutun programına dönüşür; komut bitince işlem sonlanır ve kabuk geri gelmez', 'The shell process turns into the command’s program; when the command ends the process terminates and the shell never returns'),
      L('Komut bittikten sonra kabuk istemi yeniden gösterir', 'After the command finishes, the shell shows the prompt again'),
      L('Komut paralel çalışır, kabuk devam eder', 'The command runs in parallel and the shell continues'),
      L('`execl` derleme hatası verir', '`execl` gives a compile error'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: `exec` geri dönmez; kabuğun kodu bellekten silinir.', 'Correct: `exec` does not return; the shell’s code is gone from memory.'),
      L('Kabuk kodu artık yoktur, istemi basamaz.', 'The shell’s code no longer exists so it cannot print the prompt.'),
      L('Paralel çalışma için `fork` gerekir.', 'Parallelism needs `fork`.'),
      L('Bu geçerli bir çağrıdır; sorun çalışma zamanındadır.', 'The call is valid; the problem is at run time.'),
    ],
    explanation: L('Bu nedenle `fork` + `exec` + `wait` üçlüsü gereklidir: çocuk dönüşüme uğrar, kabuk ise kalır ve sonraki komutu bekler.', 'That is why the trio `fork` + `exec` + `wait` is needed: the child gets transformed while the shell survives and waits for the next command.'),
  },
  {
    id: 'm5-q09', topic: 'exec-system', difficulty: 2, kind: 'tf',
    prompt: L('`status = system("yeni_prog par1 par2");` çağrısı, komut tamamlandıktan sonra çağıran programa geri döner.', 'The call `status = system("new_prog par1 par2");` returns to the calling program after the command has finished.'),
    answer: true,
    explanation: L('`system()` içeride bir alt işlem yaratıp kabuk aracılığıyla komutu çalıştırır, bekler ve dönüş kodunu döndürür. `exec`’ten farkı budur: çağıran program yaşar.', '`system()` internally creates a child, runs the command through a shell, waits and returns its status. That is the difference from `exec`: the calling program survives.'),
  },
  {
    id: 'm5-q10', topic: 'exec-system', difficulty: 3, kind: 'mcq',
    prompt: L('Bir program `sort` komutunu çalıştırıp bittikten sonra sonuç dosyasını işlemeye devam etmek istiyor. Hangi yaklaşım doğrudur?', 'A program wants to run the `sort` command and then continue processing the result file. Which approach is correct?'),
    options: [
      L('`execl("/usr/bin/sort", ...)` çağırıp sonraki satırlarda sonucu işlemek', 'Call `execl("/usr/bin/sort", ...)` and process the result in the following lines'),
      L('`system("sort in.txt > out.txt");` çağırıp sonra `out.txt`’yi işlemek', 'Call `system("sort in.txt > out.txt");` and then process `out.txt`'),
      L('`fork()` yapıp ana işlemde `sort`’a `exec` etmek, çocukta sonucu işlemek', '`fork()` and `exec` `sort` in the parent while the child processes the result'),
      L('`sort`’u `wait()` ile çağırmak', 'Call `sort` with `wait()`'),
    ],
    answer: 1,
    optionNotes: [
      L('Başarılı `exec` geri dönmez; sonraki satırlar çalışmaz.', 'A successful `exec` does not return; the following lines never run.'),
      L('Doğru: `system` komut bitince döner; (alternatif: `fork`+`exec`+`wait`).', 'Correct: `system` returns when the command is done (alternative: `fork` + `exec` + `wait`).'),
      L('Roller ters: ana işlem `exec` ile kendini kaybeder, çocuk sonucu beklemeden işler.', 'Roles are reversed: the parent loses itself by `exec`, and the child would process without waiting.'),
      L('`wait` bir program çalıştırmaz, yalnızca alt işlemi bekler.', '`wait` does not run a program, it only waits for a child.'),
    ],
    explanation: L('Çağıran programın devam etmesi gerekiyorsa `system()` veya `fork`+`exec`+`wait` kullanılır. Doğrudan `exec` yalnızca “bu işlem artık o program olsun” için uygundur.', 'If the caller needs to continue, use `system()` or `fork`+`exec`+`wait`. Plain `exec` is only for “this process should now become that program”.'),
  },
  {
    id: 'm5-q11', topic: 'exec-system', difficulty: 2, kind: 'multi',
    prompt: L('`exec` ailesi hakkında hangileri doğrudur?', 'Which statements about the `exec` family are true?'),
    options: [
      L('Çağıran işlemin program görüntüsünü yenisiyle değiştirir.', 'It replaces the caller’s program image with a new one.'),
      L('İşlemin PID’si değişmez.', 'The process’s PID does not change.'),
      L('Başarılı olursa çağırana geri döner ve 0 verir.', 'On success it returns 0 to the caller.'),
      L('Başarısız olursa -1 döner ve `errno` ayarlanır.', 'On failure it returns -1 and sets `errno`.'),
    ],
    answers: [0, 1, 3],
    explanation: L('Başarıda geri dönüş yoktur (eski kod yok olmuştur); yalnızca hata durumunda -1 döner.', 'There is no return on success (the old code is gone); only on error does it return -1.'),
  },
  {
    id: 'm5-q12', topic: 'exec-system', difficulty: 2, kind: 'fill',
    prompt: L('`execl` argüman listesinin sonunu belirten değeri yazın.', 'Fill in the value that terminates the `execl` argument list.'),
    template: L('`execl("/bin/ls", "ls", "-l", (char *) {0});` Liste bir {1} işaretçisiyle biter.', '`execl("/bin/ls", "ls", "-l", (char *) {0});` The list ends with a {1} pointer.'),
    blanks: [['NULL', '0', 'null'], ['NULL', 'null', 'boş', 'bos']],
    explanation: L('Değişken sayıda argüman alan `execl`, listenin sonunu `(char *)NULL` ile anlar. Slayttaki `0` yazımı da çalışır ama tür dönüşümlü `NULL` doğru olandır.', 'The variadic `execl` detects the end of the list by `(char *)NULL`. The plain `0` in the slide works too, but the cast `NULL` is the correct form.'),
  },
  {
    id: 'm5-q13', topic: 'shell-processes', difficulty: 1, kind: 'short',
    prompt: L('Kabuğun ön plan komutu bitene kadar beklemesini sağlayan sistem çağrısı hangisidir?', 'Which system call makes the shell wait until a foreground command finishes?'),
    accept: ['wait', 'wait()', 'waitpid', 'waitpid()'],
    explanation: L('`wait()` (veya `waitpid()`): kabuk alt işlem sonlanana dek bloklanır, sonra çıkış durumunu alır.', '`wait()` (or `waitpid()`): the shell blocks until the child terminates, then collects its status.'),
  },
  {
    id: 'm5-q14', topic: 'shell-processes', difficulty: 2, kind: 'match',
    prompt: L('Çağrıları etkileriyle eşleştirin.', 'Match each call with its effect.'),
    left: [L('`fork`', '`fork`'), L('`exec`', '`exec`'), L('`wait`', '`wait`'), L('`exit`', '`exit`'), L('`system`', '`system`')],
    right: [
      L('Alt işlemin durumunu toplar', 'Collects a child’s status'),
      L('Komutu çalıştırır ve çağırana döner', 'Runs a command and returns to the caller'),
      L('İşlemi çoğaltır', 'Duplicates the process'),
      L('İşlemin programını değiştirir', 'Replaces the process’s program'),
      L('İşlemi sonlandırır', 'Terminates the process'),
    ],
    pairs: [2, 3, 0, 4, 1],
    explanation: L('Bu beşlisi birlikte kabuk mantığını kurar: `fork` (çoğalt) → `exec` (dönüştür) → `exit` (bitir) → `wait` (topla). `system` bunların kısayoludur.', 'Together these five make up shell logic: `fork` (duplicate) → `exec` (transform) → `exit` (finish) → `wait` (collect). `system` is a shortcut for them.'),
  },
  {
    id: 'm5-q15', topic: 'memory-layout', difficulty: 2, kind: 'mcq',
    prompt: L('`main` içinde tanımlı otomatik (yerel) değişken `int i = 0;` işlem belleğinin hangi bölgesinde saklanır?', 'In which region of process memory is the automatic (local) variable `int i = 0;` defined in `main` stored?'),
    options: [
      L('Stack (yığın; slaytlarda “küme”)', 'The stack (in the slides: “küme”)'),
      L('Heap (öbek; slaytlarda “yığın”)', 'The heap (in the slides: “yığın”)'),
      L('İlklendirilmiş veri (data) bölgesi', 'The initialized data region'),
      L('Metin (text) bölgesi', 'The text region'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: yerel değişkenler fonksiyon çağrısı sırasında stack’te yer alır ve fonksiyon bitince serbest kalır.', 'Correct: locals live on the stack for the duration of the call and vanish when the function returns.'),
      L('Heap’e `malloc` ile ayrılan bloklar konur.', 'Blocks obtained with `malloc` live on the heap.'),
      L('İlklendirilmiş **global/static** değişkenler buradadır; yerel değil.', 'Initialized **global/static** variables live there, not locals.'),
      L('Metin bölgesi program kodunu ve sabit verileri tutar.', 'The text region holds the program code and constant data.'),
    ],
    explanation: L('Slaytlarda terimler Türkçe literatürdeki yaygın kullanımın tersidir: **heap** “yığın”, **stack** “küme” diye anılır. Yaygın kullanımda *yığın = stack*, *öbek = heap*’tir. Hangi isim kullanılırsa kullanılsın yerel değişkenler stack’tedir.', 'The slides use the opposite of the usual Turkish terminology: **heap** is called “yığın” and **stack** “küme”. In common usage *yığın = stack*, *öbek = heap*. Whatever the names, locals live on the stack.'),
  },
  {
    id: 'm5-q16', topic: 'memory-layout', difficulty: 2, kind: 'match',
    prompt: L('Programdaki öğeleri bellek bölgeleriyle eşleştirin.', 'Match each item with its memory region.'),
    left: [
      L('Global `char buf1[25];` (ilk değer yok)', 'Global `char buf1[25];` (no initializer)'),
      L('Global `char *ptr = "Hello\\n";`', 'Global `char *ptr = "Hello\\n";`'),
      L('Yerel `int i = 0;`', 'Local `int i = 0;`'),
      L('`malloc(...)` ile ayrılan blok', 'A block obtained with `malloc(...)`'),
    ],
    right: [
      L('Heap', 'Heap'),
      L('Stack', 'Stack'),
      L('İlklendirilmiş veri', 'Initialized data'),
      L('İlklendirilmemiş veri', 'Uninitialized data'),
    ],
    pairs: [3, 2, 1, 0],
    explanation: L('İlk değer verilmemiş global diziler ilklendirilmemiş veri bölgesindedir; ilk değerli globaller ilklendirilmiş veri bölgesindedir; yerel değişkenler stack’te, `malloc` blokları heap’te.', 'Globals without an initializer are in the uninitialized data region; initialized globals in the initialized data region; locals on the stack and `malloc` blocks on the heap.'),
  },
  {
    id: 'm5-q17', topic: 'memory-layout', difficulty: 2, kind: 'order',
    prompt: L('Sanal adres uzayını **düşük adresten yüksek adrese** doğru sıralayın.', 'Order the virtual address space **from low to high addresses**.'),
    items: [
      L('Metin (text, program kodu)', 'Text (program code)'),
      L('İlklendirilmiş veri', 'Initialized data'),
      L('İlklendirilmemiş veri', 'Uninitialized data'),
      L('Heap (dinamik bellek)', 'Heap (dynamic memory)'),
      L('Stack (çağrı çerçeveleri)', 'Stack (call frames)'),
    ],
    explanation: L('Sıra: text → edata (initialized) → end (uninitialized) → heap (yukarı doğru büyür) → … boşluk … ← stack (aşağı doğru büyür) en yüksek adreslerde.', 'The order: text → edata (initialized) → end (uninitialized) → heap (grows upward) → … gap … ← stack (grows downward) at the highest addresses.'),
  },
  {
    id: 'm5-q18', topic: 'memory-layout', difficulty: 3, kind: 'mcq',
    prompt: L('`show` işlevi çağrılırken `buf2` işaretçisinin kendisi ile `malloc`’un ayırdığı blok nerede bulunur?', 'While `show` runs, where are the pointer `buf2` itself and the block allocated by `malloc`?'),
    code: c`int show(char *p)
{
    char *buf2;
    buf2 = malloc(strlen(p) + 1);
    strcpy(buf2, p);
    printf("%s", buf2);
    free(buf2);
    return 0;
}`,
    options: [
      L('İşaretçi stack’te, blok heap’te', 'The pointer is on the stack, the block on the heap'),
      L('İkisi de stack’te', 'Both are on the stack'),
      L('İşaretçi heap’te, blok stack’te', 'The pointer is on the heap, the block on the stack'),
      L('İkisi de heap’te', 'Both are on the heap'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: `buf2` yerel bir değişkendir (stack); gösterdiği bellek `malloc` ile heap’ten alınır ve `free` ile geri verilir.', 'Correct: `buf2` is a local variable (stack); the memory it points to comes from `malloc` on the heap and is returned with `free`.'),
      L('Blok `malloc` ile alındığı için stack’te değildir.', 'The block came from `malloc`, so it is not on the stack.'),
      L('Roller ters.', 'The roles are reversed.'),
      L('İşaretçi yerel olduğundan stack’tedir.', 'The pointer is local, hence on the stack.'),
    ],
    explanation: L('Değişken ile gösterdiği bellek aynı yerde olmak zorunda değildir. İşaretçi fonksiyon dönünce yok olur; `free` çağrılmazsa heap bloğu kalır (bellek sızıntısı).', 'A variable and what it points to need not be in the same place. The pointer vanishes when the function returns; if `free` is not called the heap block stays (memory leak).'),
  },
  {
    id: 'm5-q19', topic: 'memory-layout', difficulty: 3, kind: 'mcq',
    prompt: L('Bir özyinelemeli işlev bitiş koşulu olmadan kendini çağırıyor. İşlem sonunda hangi bölgenin tükenmesiyle çöker?', 'A recursive function calls itself with no base case. The process eventually crashes because which region is exhausted?'),
    options: [
      L('Stack: her çağrı yeni bir çerçeve ekler', 'The stack: each call adds a frame'),
      L('Heap: her çağrı `malloc` yapar', 'The heap: each call does a `malloc`'),
      L('Metin bölgesi', 'The text region'),
      L('İlklendirilmiş veri bölgesi', 'The initialized data region'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: yerel değişkenler, dönüş adresi ve parametreler her çağrıda stack’e eklenir (stack overflow).', 'Correct: locals, return address and parameters are pushed on the stack on every call (stack overflow).'),
      L('Kodda `malloc` yok; heap kullanılmıyor.', 'There is no `malloc`; the heap is not used.'),
      L('Kod sabit boyutludur, çağrı sayısıyla büyümez.', 'Code is fixed in size and does not grow with the number of calls.'),
      L('Global veriler çağrı sayısıyla büyümez.', 'Global data does not grow with the number of calls.'),
    ],
    explanation: L('Her işlev çağrısı stack’te bir çerçeve alır; sınırsız özyineleme stack’i taşırır. Heap taşması ise sürekli `malloc` ve `free` unutmakla oluşur.', 'Each function call takes a stack frame; unbounded recursion overflows the stack. Heap exhaustion comes from repeated `malloc` without `free`.'),
  },
  {
    id: 'm5-q20', topic: 'exec-system', difficulty: 3, kind: 'numeric',
    prompt: L('`/nonexistent` dosyası yok, yani `execl` her çağrıda **başarısız** olur ve -1 döner. `failed` satırı kaç kez yazdırılır?', 'The file `/nonexistent` does not exist, so `execl` **fails** every time and returns -1. How many times is `failed` printed?'),
    code: c`int main()
{
    int i;
    for (i = 0; i < 2; i++) {
        if (fork() == 0) {
            execl("/nonexistent", "x", (char *)NULL);
            printf("failed\n");
        }
    }
    return 0;
}`,
    answer: 3,
    explanation: L('`exec` başarısız olduğu için çocuk kendi kodunu sürdürür: `failed` yazar ve (`exit` olmadığından) döngüye devam eder. Başarısız `exec` çağrısı, “yalnızca `if (fork()==0) printf(...)`” ile aynı davranır: `fork` sayısı kadar satır: tur 0’da 1, tur 1’de 2 → 3. (`exec` hata dalında genellikle `exit(1)` çağrılır.)', 'Because `exec` fails the child keeps running its own code: it prints `failed` and, with no `exit`, continues the loop. A failed `exec` behaves like plain `if (fork()==0) printf(...)`: one line per `fork`: 1 in iteration 0, 2 in iteration 1 → 3. (After a failed `exec` you would normally call `exit(1)`.)'),
  },
  {
    id: 'm5-q21', topic: 'memory-layout', difficulty: 2, kind: 'tf',
    prompt: L('Stack’teki yerel değişkenlerin belleği işlev dönünce otomatik serbest kalır; heap’te `malloc` ile alınan bellek ise `free` ile açıkça geri verilmelidir.', 'Memory of local variables on the stack is released automatically when the function returns; memory obtained with `malloc` on the heap must be returned explicitly with `free`.'),
    answer: true,
    explanation: L('Bu fark, bellek sızıntılarının (leak) yalnızca heap’te oluşmasının nedenidir. Slayttaki örnekte `buf2` için `malloc`/`free` çifti bu yüzden bulunur.', 'This difference is why memory leaks occur only on the heap. The slide example pairs `malloc`/`free` for `buf2` for that reason.'),
  },
];
