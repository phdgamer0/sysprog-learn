import type { Question } from '../types';
import { L, c } from './h';

export const QUESTIONS_M3: Question[] = [
  {
    id: 'm3-q01', topic: 'kernel-user-mode', difficulty: 2, kind: 'mcq',
    prompt: L('Bir kullanıcı programı doğrudan bir G/Ç (I/O) aygıtının kayıtlarına erişmeye çalışıyor. Neden başarısız olur ve doğru yol nedir?', 'A user program tries to access the registers of an I/O device directly. Why does it fail, and what is the right way?'),
    options: [
      L('Kullanıcı modunda ayrıcalıklı işlemler yasaktır; program ilgili sistem çağrısını (ör. `read`/`write`) kullanmalıdır.', 'Privileged operations are forbidden in user mode; the program must use the appropriate system call (e.g. `read`/`write`).'),
      L('Derleyici bu kodu üretmez; bağlayıcı seçeneği değiştirilmelidir.', 'The compiler does not generate this code; a linker option must be changed.'),
      L('Aygıtlar yalnızca kabuk üzerinden erişilebilir.', 'Devices are only reachable through the shell.'),
      L('Bellek yetersizdir; `malloc` ile daha fazla bellek alınmalıdır.', 'Memory is insufficient; more must be obtained with `malloc`.'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: aygıtlara doğrudan erişim ayrıcalıklıdır ve yalnızca çekirdek modunda yapılabilir.', 'Correct: direct device access is privileged and possible only in kernel mode.'),
      L('Sorun derleme değil, çalışma zamanındaki ayrıcalık denetimidir.', 'The issue is a run-time privilege check, not compilation.'),
      L('Kabuk da kullanıcı programıdır ve aynı sınıra tabidir.', 'The shell is a user program, subject to the same limit.'),
      L('Bellek miktarıyla ilgisi yok.', 'Unrelated to memory amount.'),
    ],
    explanation: L('UNIX iki modda çalışır: kullanıcı modunda kesme açma/kapama, G/Ç aygıtlarına doğrudan erişim, belli bellek bölgelerine erişim gibi ayrıcalıklı işlemler yasaktır; çekirdek modunda her şey serbesttir. Program bu işleri çekirdekten sistem çağrısı ile ister.', 'UNIX runs in two modes: in user mode privileged operations (interrupt enabling/disabling, direct I/O access, access to certain memory regions) are forbidden; kernel mode allows everything. A program asks the kernel for such work through system calls.'),
  },
  {
    id: 'm3-q02', topic: 'kernel-user-mode', difficulty: 1, kind: 'multi',
    prompt: L('Hangi işlemler kullanıcı modunda **yasaktır** (ayrıcalıklıdır)?', 'Which operations are **forbidden** (privileged) in user mode?'),
    options: [
      L('Kesmeleri (interrupt) kapatmak', 'Disabling interrupts'),
      L('G/Ç aygıtına doğrudan erişmek', 'Accessing an I/O device directly'),
      L('İki tamsayıyı toplamak', 'Adding two integers'),
      L('Kendi yığınındaki (stack) bir değişkeni okumak', 'Reading a variable on its own stack'),
    ],
    answers: [0, 1],
    explanation: L('Sıradan hesaplama ve kendi belleğine erişim kullanıcı modunda serbesttir. Kesme denetimi ve aygıtlara doğrudan erişim çekirdeğe ayrılmıştır.', 'Ordinary computation and access to your own memory are allowed in user mode. Interrupt control and direct device access are reserved for the kernel.'),
  },
  {
    id: 'm3-q03', topic: 'kernel-user-mode', difficulty: 2, kind: 'tf',
    prompt: L('Her kütüphane işlevi çağrısı (örneğin `sin()` veya `atoi()`) çekirdeğe geçişe neden olur.', 'Every library function call (for example `sin()` or `atoi()`) causes a transition into the kernel.'),
    answer: false,
    explanation: L('Kütüphane işlevlerinin çoğu tamamen kullanıcı modunda çalışır; çekirdeğe gitmeden bitirilir. Sistem çağrısı ise her zaman sistem çağrısı arayüzünü ve çekirdeği gerektirir. (`printf` gibi bazı kütüphane işlevleri içeride `write` çağırır.)', 'Most library functions run entirely in user mode without going to the kernel. A system call always needs the system call interface and the kernel. (Some library functions such as `printf` call `write` internally.)'),
  },
  {
    id: 'm3-q04', topic: 'kernel-user-mode', difficulty: 2, kind: 'numeric',
    prompt: L('Bir program şunları çağırıyor: `getpid()` 5 kez, `sqrt()` 3 kez, `atoi()` 2 kez, `write()` 1 kez. Kullanıcı modundan çekirdek moduna **en az** kaç geçiş olur? (`sqrt` ve `atoi` saf kütüphane hesaplamasıdır.)', 'A program calls `getpid()` 5 times, `sqrt()` 3 times, `atoi()` 2 times and `write()` once. At least how many user-to-kernel mode transitions occur? (`sqrt` and `atoi` are pure library computations.)'),
    answer: 6,
    explanation: L('Yalnızca sistem çağrıları çekirdeğe geçer: 5 `getpid` + 1 `write` = 6. `sqrt` ve `atoi` kullanıcı modunda biter.', 'Only system calls enter the kernel: 5 `getpid` + 1 `write` = 6. `sqrt` and `atoi` finish in user mode.'),
  },
  {
    id: 'm3-q05', topic: 'kernel-user-mode', difficulty: 2, kind: 'order',
    prompt: L('`p = getpid();` çağrısının Linux’taki adımlarını doğru sıraya koyun.', 'Put the steps of `p = getpid();` on Linux in the correct order.'),
    items: [
      L('Kullanıcı programı `getpid()` kütüphane işlevini çağırır.', 'The user program calls the `getpid()` library function.'),
      L('Kütüphane işlevi kesme (trap) komutuyla çekirdeğe geçer (kullanıcı → sistem modu).', 'The library function switches to the kernel with an interrupt (trap) instruction (user → system mode).'),
      L('Çekirdek işlem kimliğini (PID) okur ve sonucu kayıtçıya (register) yazar.', 'The kernel reads the process identifier (PID) and writes the result to a register.'),
      L('`iret` ile kullanıcı moduna dönülür.', 'Control returns to user mode with `iret`.'),
      L('Kütüphane işlevi PID’yi kayıtçıdan okuyup çağırana döndürür.', 'The library function reads the PID from the register and returns it to the caller.'),
    ],
    explanation: L('Kütüphane işlevi sadece bir sarmalayıcıdır: işlem numarasını kayıtçıya koyup kesme komutuyla çekirdeğe geçer; sonuç yine kayıtçı üzerinden döner.', 'The library function is just a wrapper: it triggers the interrupt to enter the kernel; the result comes back through a register.'),
  },
  {
    id: 'm3-q06', topic: 'kernel-user-mode', difficulty: 2, kind: 'match',
    prompt: L('Sistem çağrılarını gruplarıyla eşleştirin.', 'Match each system call with its group.'),
    left: [L('`fork`', '`fork`'), L('`open`', '`open`'), L('`stat`', '`stat`'), L('`pipe`', '`pipe`')],
    right: [L('Haberleşme', 'Communication'), L('Proses kontrolü', 'Process control'), L('Bilgi işleme', 'Information'), L('Dosya sistemi', 'File system')],
    pairs: [1, 3, 2, 0],
    explanation: L('`fork`/`wait`/`exec` proses kontrolü, `open`/`read`/`write` dosya sistemi, `time`/`stat` bilgi, `pipe`/`socket` haberleşme grubundadır.', '`fork`/`wait`/`exec` are process control, `open`/`read`/`write` file system, `time`/`stat` information and `pipe`/`socket` communication.'),
  },
  {
    id: 'm3-q07', topic: 'kernel-user-mode', difficulty: 2, kind: 'mcq',
    prompt: L('Neden `getpid()` gibi basit bir sistem çağrısı, aynı derecede basit bir kütüphane işlevinden (ör. `abs()`) genellikle daha yavaştır?', 'Why is a simple system call like `getpid()` usually slower than an equally simple library function such as `abs()`?'),
    options: [
      L('Kullanıcı–çekirdek mod geçişi ve geri dönüş maliyeti vardır.', 'There is the cost of switching from user to kernel mode and back.'),
      L('Sistem çağrıları yorumlanır, kütüphane işlevleri derlenir.', 'System calls are interpreted, library functions compiled.'),
      L('PID’yi hesaplamak çok karmaşıktır.', 'Computing the PID is very complicated.'),
      L('Sistem çağrıları diske yazar.', 'System calls write to disk.'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: kesme, ayrıcalık değişimi ve dönüş (`iret`) maliyetlidir.', 'Correct: the trap, privilege change and return (`iret`) are costly.'),
      L('Her ikisi de derlenmiş koddur.', 'Both are compiled code.'),
      L('PID bir kayıt okumaktan ibarettir.', 'The PID is just a value read.'),
      L('Böyle bir kural yok.', 'No such rule.'),
    ],
    explanation: L('Maliyetin kaynağı işin kendisi değil, mod geçişidir. Bu yüzden G/Ç kütüphaneleri tamponlama ile sistem çağrısı sayısını azaltır.', 'The cost comes from the mode switch, not the work itself. That is why I/O libraries use buffering to reduce the number of system calls.'),
  },
  {
    id: 'm3-q08', topic: 'syscall-errors', difficulty: 1, kind: 'fill',
    prompt: L('Boşlukları doldurun.', 'Fill in the blanks.'),
    template: L('Başarılı bir sistem çağrısı genellikle {0} veya pozitif bir değer döndürür; başarısız olduğunda {1} döner ve hata kodu dış değişken {2} içine yazılır.', 'A successful system call usually returns {0} or a positive value; on failure it returns {1} and the error code is stored in the external variable {2}.'),
    blanks: [['0', 'sıfır', 'zero', 'sifir'], ['-1', 'eksi bir', 'minus one'], ['errno']],
    explanation: L('Sistem çağrısı genel biçimi: `ret = sistem_cagrisi(...)`; `ret == -1` ise `errno` neden başarısız olduğunu söyler.', 'General form: `ret = system_call(...)`; if `ret == -1`, `errno` tells you why it failed.'),
  },
  {
    id: 'm3-q09', topic: 'syscall-errors', difficulty: 2, kind: 'tf',
    prompt: L('Programın sağlamlığı için `errno` her sistem çağrısından sonra, çağrının sonucuna bakmaksızın okunmalıdır.', 'For robustness, `errno` should be read after every system call, regardless of the call’s result.'),
    answer: false,
    explanation: L('Önce dönüş değeri denetlenir (`-1` mi?). `errno` yalnızca çağrı başarısız olduysa anlamlıdır; başarılı çağrılar onu sıfırlamak zorunda değildir ve başka çağrılar onu değiştirmiş olabilir.', 'First check the return value (`-1`?). `errno` is meaningful only after a failed call; successful calls need not reset it and other calls may have changed it.'),
  },
  {
    id: 'm3-q10', topic: 'syscall-errors', difficulty: 2, kind: 'mcq',
    prompt: L('Aşağıdaki kodlardan hangisi hatayı doğru yakalar?', 'Which of the following snippets catches the error correctly?'),
    options: [
      L('`if (fd = -1) { perror("data.txt"); exit(1); }`', '`if (fd = -1) { perror("data.txt"); exit(1); }`'),
      L('`fd = open("data.txt", O_RDONLY); if (fd == -1) { perror("data.txt"); exit(1); }`', '`fd = open("data.txt", O_RDONLY); if (fd == -1) { perror("data.txt"); exit(1); }`'),
      L('`fd = open("data.txt", O_RDONLY); if (errno) exit(1);`', '`fd = open("data.txt", O_RDONLY); if (errno) exit(1);`'),
      L('`open("data.txt", O_RDONLY); perror("data.txt");`', '`open("data.txt", O_RDONLY); perror("data.txt");`'),
    ],
    answer: 1,
    optionNotes: [
      L('`=` atamadır; `fd` her zaman -1 olur ve koşul her zaman doğrudur.', '`=` is assignment; `fd` becomes -1 and the condition is always true.'),
      L('Doğru: sonuç `-1` ile karşılaştırılıyor, hata varsa `perror` mesaj yazıyor.', 'Correct: the result is compared with `-1`; on error `perror` prints the message.'),
      L('`errno` başarıdan sonra sıfır olmayabilir; yanlış alarm verebilir.', '`errno` may be non-zero after success; this can give false alarms.'),
      L('Dönüş değeri denetlenmiyor; başarılı çağrıdan sonra da hata mesajı yazılır.', 'The return value is not checked; a message is printed even after success.'),
    ],
    explanation: L('Kalıp: çağır, dönüş değerini `-1` ile **karşılaştır** (`==`), hata varsa `errno`’yu `perror` ile açıkla ve gerekirse çık.', 'Pattern: call, **compare** the return with `-1` (`==`), on error explain `errno` via `perror` and exit if necessary.'),
  },
  {
    id: 'm3-q11', topic: 'syscall-errors', difficulty: 1, kind: 'short',
    prompt: L('`errno` içindeki kodu okunabilir bir hata mesajına çevirip yazdıran kütüphane işlevinin adı nedir?', 'What is the name of the library function that turns the code in `errno` into a readable message and prints it?'),
    accept: ['perror', 'perror()'],
    explanation: L('`perror(const char *message)` önce verdiğin metni, sonra `: ` ve `errno`’ya karşılık gelen sistem mesajını stderr’e yazar. Örn. `data.txt: No such file or directory`.', '`perror(const char *message)` prints your text, then `: ` and the system message for `errno` to stderr. E.g. `data.txt: No such file or directory`.'),
  },
  {
    id: 'm3-q12', topic: 'syscall-errors', difficulty: 1, kind: 'tf',
    prompt: L('`perror()` bir sistem çağrısıdır.', '`perror()` is a system call.'),
    answer: false,
    explanation: L('`perror` bir kütüphane işlevidir; hata mesajını biçimlendirip standart hataya (stderr) yazar. Başarısız olan sistem çağrısı ise ondan öncekidir.', '`perror` is a library function that formats the message and writes it to standard error (stderr). The failing system call is the one before it.'),
  },
  {
    id: 'm3-q13', topic: 'syscall-errors', difficulty: 3, kind: 'mcq',
    prompt: L('Bir sunucu işlem, her istek için `pid = fork();` çağırıyor. Yoğun saatte `fork` -1 döndürmeye başlıyor (`errno` = kaynak geçici olarak kullanılamıyor). Aşağıdaki kodun yan etkisi nedir?', 'A server process calls `pid = fork();` for each request. At peak hours `fork` starts returning -1 (`errno` = resource temporarily unavailable). What is the side effect of the code below?'),
    code: c`pid = fork();
if (pid == 0) {
    handle_request();
    exit(0);
} else {
    wait(NULL);
}`,
    options: [
      L('`pid == -1` olduğunda `else` dalı çalışır; `wait(NULL)` alt işlem olmadığı için hemen -1 döner ve istek sessizce atlanır.', 'When `pid == -1` the `else` branch runs; `wait(NULL)` returns -1 at once because there is no child, and the request is silently dropped.'),
      L('`handle_request()` ana işlemde çalışır.', '`handle_request()` runs in the parent.'),
      L('Sunucu otomatik olarak çöker ve hata mesajı yazar.', 'The server crashes automatically and prints an error message.'),
      L('Çekirdek `fork`’u başarana kadar kendiliğinden tekrarlar.', 'The kernel retries `fork` until it succeeds.'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: `-1` durumu hiç denetlenmedi; hata görünmez biçimde yutuldu.', 'Correct: the `-1` case was never checked; the error is swallowed invisibly.'),
      L('`pid == 0` yalnızca alt işlemde doğrudur; -1 durumunda hiçbir alt işlem yoktur.', '`pid == 0` is true only in a child; with -1 there is no child.'),
      L('C kendiliğinden hata mesajı yazmaz ve çökmez.', 'C neither prints errors nor crashes by itself.'),
      L('Sistem çağrıları otomatik yeniden denenmez.', 'System calls are not retried automatically.'),
    ],
    explanation: L('Üçüncü bir dal (`pid == -1`) gerekir: `perror("fork")` ile hatayı bildirmek, gerekirse bir süre bekleyip yeniden denemek ya da isteği reddetmek. “Her sistem çağrısının dönüş değerini denetle” kuralı budur.', 'A third branch (`pid == -1`) is needed: report with `perror("fork")`, perhaps retry after a pause or reject the request. This is the “always check the return value of system calls” rule.'),
  },
  {
    id: 'm3-q14', topic: 'syscall-errors', difficulty: 2, kind: 'multi',
    prompt: L('Hangi durumlarda `fork()` -1 döndürebilir (slayttaki olası hatalar)?', 'In which situations can `fork()` return -1 (errors listed in the slides)?'),
    options: [
      L('Gerekli kaynak geçici olarak kullanılamıyor', 'A required resource is temporarily unavailable'),
      L('Yeni işlem için yeterli bellek/alan yok', 'Not enough space for the new process'),
      L('Ana işlemin PID’si 1’dir', 'The parent’s PID is 1'),
      L('Alt işlem `exit` çağırdı', 'The child called `exit`'),
    ],
    answers: [0, 1],
    explanation: L('`fork` kaynak yetersizliği nedeniyle başarısız olur (işlem tablosu/bellek). PID değeri ya da alt işlemin sonlanması `fork`’un başarısını etkilemez.', '`fork` fails due to lack of resources (process table/memory). The parent’s PID or a child exiting does not affect `fork`’s success.'),
  },
  {
    id: 'm3-q15', topic: 'syscall-errors', difficulty: 3, kind: 'short',
    prompt: L('Bir sistem çağrısının hata durumunda döndürdüğü değer nedir? (sayı olarak yazın)', 'What value does a system call return when it fails? (write the number)'),
    accept: ['-1', '−1', 'minus one', 'eksi bir'],
    explanation: L('Hata durumunda `-1` döner; neden `errno` içindedir. Başarıda 0 veya pozitif değer döner (ör. `open` bir dosya tanıtıcısı, `fork` bir PID).', 'On error `-1` is returned; the reason is in `errno`. On success 0 or a positive value is returned (e.g. `open` returns a file descriptor, `fork` a PID).'),
  },
  {
    id: 'm3-q16', topic: 'kernel-user-mode', difficulty: 3, kind: 'mcq',
    prompt: L('`printf("hi\\n")` bir kütüphane işlevidir. Terminale yazı çıkması için sonunda ne gerekir?', '`printf("hi\\n")` is a library function. What must eventually happen for the text to reach the terminal?'),
    options: [
      L('Kütüphane, tamponu boşaltmak için `write` sistem çağrısını yapar.', 'The library performs the `write` system call to flush its buffer.'),
      L('Kütüphane doğrudan ekran kartının belleğine yazar.', 'The library writes directly into the video card memory.'),
      L('Derleyici `printf`’i tek bir makine komutuna çevirir.', 'The compiler turns `printf` into a single machine instruction.'),
      L('Kabuk metni terminale kopyalar.', 'The shell copies the text to the terminal.'),
    ],
    answer: 0,
    optionNotes: [
      L('Doğru: kullanıcı modundaki kod aygıta erişemez; çıktı sonunda `write` ile çekirdeğe iletilir.', 'Correct: user-mode code cannot touch the device; output eventually goes to the kernel via `write`.'),
      L('Bu ayrıcalıklı bir erişimdir ve kullanıcı modunda yasaktır.', 'That is a privileged access, forbidden in user mode.'),
      L('`printf` karmaşık bir kütüphane işlevidir.', '`printf` is a complex library function.'),
      L('Kabuk çalışan programın çıktısına karışmaz.', 'The shell is not involved in the running program’s output.'),
    ],
    explanation: L('Kütüphane işlevleri (`printf`) kullanıcı modunda biçimlendirme yapar; gerçek çıkış için sistem çağrısı (`write`) gerekir. Bu, “kütüphane – sistem çağrısı” katmanlamasının tipik örneğidir ve fork bölümündeki tampon (buffer) davranışını da açıklar.', 'Library functions (`printf`) format in user mode; real output needs a system call (`write`). This is the typical example of the library/system-call layering and also explains buffer behaviour in the fork chapter.'),
  },
];
