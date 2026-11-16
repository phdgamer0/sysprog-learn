import type { Question } from '../types';
import { L, c } from './h';

export const QUESTIONS_M2: Question[] = [
  {
    id: 'm2-q01', topic: 'c-compilation', difficulty: 1, kind: 'order',
    prompt: L('Bir C kaynak dosyasının çalıştırılabilir programa dönüşme adımlarını doğru sıraya koyun.', 'Put the steps that turn a C source file into an executable in the right order.'),
    items: [
      L('Önişlemci (`#include`, `#define` satırlarını işler)', 'Preprocessor (handles `#include`, `#define` lines)'),
      L('Derleyici (ara kaynağı assembly/nesne koduna çevirir)', 'Compiler (translates the intermediate source to assembly/object code)'),
      L('Nesne dosyası (`.o`) oluşur', 'Object file (`.o`) is produced'),
      L('Bağlayıcı (kütüphane ve diğer nesne dosyalarını birleştirir)', 'Linker (combines libraries and other object files)'),
      L('Çalıştırılabilir dosya', 'Executable file'),
    ],
    explanation: L('Önişlemci `#` yönergelerini çözer, derleyici makine koduna ve bağlayıcı için bilgiye sahip nesne dosyası üretir, bağlayıcı kütüphane işlevlerini ve diğer nesne dosyalarını birleştirerek çalıştırılabilir dosyayı oluşturur.', 'The preprocessor resolves `#` directives, the compiler produces an object file with machine code plus information for the linker, and the linker merges library functions and other object files into the executable.'),
  },
  {
    id: 'm2-q02', topic: 'c-compilation', difficulty: 1, kind: 'mcq',
    prompt: L('`cc -c edit.c` komutu ne üretir?', 'What does `cc -c edit.c` produce?'),
    options: [
      L('`edit` adlı çalıştırılabilir dosya', 'An executable named `edit`'),
      L('`edit.o` nesne dosyası; bağlama yapılmaz', 'An object file `edit.o`; no linking is done'),
      L('`a.out` dosyası', 'An `a.out` file'),
      L('Yalnızca önişlemci çıktısı ekrana yazılır', 'Only the preprocessor output printed to the screen'),
    ],
    answer: 1,
    optionNotes: [
      L('Çalıştırılabilir dosya için `-o` ile bağlama gerekir.', 'An executable requires linking (e.g. with `-o`).'),
      L('Doğru: `-c` “sadece derle” demektir.', 'Correct: `-c` means “compile only”.'),
      L('`a.out` varsayılan çıktı adıdır ve `-c` kullanılmadığında oluşur.', '`a.out` is the default name when `-c` is not used.'),
      L('Önişlemci çıktısı ayrı bir seçenekle (`-E`) alınır.', 'Preprocessor output requires a separate option (`-E`).'),
    ],
    explanation: L('`-c` bağlama aşamasına geçmeden durur ve `.o` dosyası bırakır. Çok dosyalı projelerde her kaynak ayrı derlenip sonra bağlanabilir.', '`-c` stops before the link step and leaves a `.o` file. In multi-file projects each source can be compiled separately and linked later.'),
  },
  {
    id: 'm2-q03', topic: 'c-compilation', difficulty: 2, kind: 'mcq',
    prompt: L('Derleme sırasında şu hata alınıyor: `undefined reference to \"helper\"`. Bu hata hangi aşamada oluşur ve olası neden nedir?', 'The build prints `undefined reference to \"helper\"`. At which stage does it occur and what is the likely cause?'),
    options: [
      L('Önişlemci; `#include` satırı yanlış yazılmış', 'Preprocessor; the `#include` line is misspelled'),
      L('Derleyici; `;` unutulmuş', 'Compiler; a `;` was forgotten'),
      L('Bağlayıcı; `helper` işlevinin tanımı içeren nesne dosyası/kütüphane komuta eklenmemiş', 'Linker; the object file/library defining `helper` was not given on the command line'),
      L('Çalışma zamanı; program belleği tükenmiş', 'Run time; the program ran out of memory'),
    ],
    answer: 2,
    optionNotes: [
      L('Eksik başlık dosyası önişlemcide “No such file” hatası verir.', 'A missing header gives a “No such file” error in the preprocessor.'),
      L('Sözdizimi hatası derleyici mesajıdır (`expected \";\"`).', 'Syntax errors are compiler messages (`expected \";\"`).'),
      L('Doğru: “undefined reference” tipik bağlayıcı hatasıdır; sembol bildirilmiş ama tanımı bulunamamıştır.', 'Correct: “undefined reference” is a typical linker error; the symbol is declared but no definition was found.'),
      L('Program henüz çalışmadı; hata derleme zamanı hatasıdır.', 'The program has not even run; this is a build-time error.'),
    ],
    explanation: L('Derleyici yalnızca bildirimi (prototipi) görürse nesne dosyasını üretir; asıl tanım bulunamazsa bağlayıcı şikâyet eder. Çözüm: ilgili `.c`/`.o` dosyasını ya da kütüphaneyi bağlama komutuna eklemek.', 'If the compiler only sees a declaration (prototype) it still produces the object file; the linker complains when the definition is missing. Fix: add the relevant `.c`/`.o` file or library to the link command.'),
  },
  {
    id: 'm2-q04', topic: 'c-compilation', difficulty: 2, kind: 'match',
    prompt: L('Komutları ne yaptıklarıyla eşleştirin.', 'Match each command with what it does.'),
    left: [
      L('`cc -c module1.c`', '`cc -c module1.c`'),
      L('`cc -o myprog module1.o module2.o`', '`cc -o myprog module1.o module2.o`'),
      L('`cc -o myprog module1.c module2.c`', '`cc -o myprog module1.c module2.c`'),
    ],
    right: [
      L('Hem derler hem bağlar, `myprog` üretir', 'Compiles and links, producing `myprog`'),
      L('Yalnızca `module1.o` üretir', 'Only produces `module1.o`'),
      L('Hazır nesne dosyalarını bağlayıp `myprog` üretir', 'Links existing object files into `myprog`'),
    ],
    pairs: [1, 2, 0],
    explanation: L('`-c` yalnızca derler; nesne dosyalarını `-o` ile bağlamak yalnızca bağlama adımıdır; kaynak dosyaları doğrudan `-o` ile verirsen her ikisi tek komutta yapılır.', '`-c` only compiles; giving object files with `-o` is just the link step; passing sources directly with `-o` does both in one command.'),
  },
  {
    id: 'm2-q05', topic: 'c-compilation', difficulty: 2, kind: 'tf',
    prompt: L('Üç kaynak dosyalı bir projede yalnızca `module2.c` değiştiyse, ayrı derleme yapılmışsa tüm `.c` dosyalarını yeniden derlemek **zorunludur**.', 'In a three-file project where only `module2.c` changed, and the files were compiled separately, you **must** recompile all `.c` files.'),
    answer: false,
    explanation: L('Yalnızca değişen dosyanın (`module2.c`) yeniden derlenmesi ve ardından tüm nesne dosyalarının yeniden bağlanması yeterlidir. Ayrı derlemenin amacı da budur.', 'Recompiling only the changed file (`module2.c`) and then relinking all object files is enough. That is the point of separate compilation.'),
  },
  {
    id: 'm2-q06', topic: 'c-compilation', difficulty: 2, kind: 'multi',
    prompt: L('Hangi satırlar **önişlemci** tarafından işlenir?', 'Which lines are processed by the **preprocessor**?'),
    options: [
      L('`#include <stdio.h>`', '`#include <stdio.h>`'),
      L('`#define MAX 10`', '`#define MAX 10`'),
      L('`int x = MAX;`', '`int x = MAX;`'),
      L('`return 0;`', '`return 0;`'),
    ],
    answers: [0, 1],
    explanation: L('Önişlemci yönergeleri `#` ile başlar. `int x = MAX;` önişlemciden sonra (MAX yerine 10 konarak) derleyiciye gider; `return 0;` doğrudan C komutudur.', 'Preprocessor directives begin with `#`. `int x = MAX;` reaches the compiler after substitution (MAX replaced by 10); `return 0;` is plain C.'),
  },
  {
    id: 'm2-q07', topic: 'c-compilation', difficulty: 1, kind: 'short',
    prompt: L('Çıktı dosyasının adını belirlemek için `cc` komutuna verilen seçenek nedir? (örn. `cc ___ edit edit.c`)', 'Which option tells `cc` the name of the output file? (e.g. `cc ___ edit edit.c`)'),
    accept: ['-o', 'o'],
    explanation: L('`-o edit` çalıştırılabilir dosyanın adını `edit` yapar; verilmezse varsayılan ad `a.out` olur.', '`-o edit` names the executable `edit`; without it the default name is `a.out`.'),
  },
  {
    id: 'm2-q08', topic: 'command-line-args', difficulty: 1, kind: 'numeric',
    prompt: L('`a.out -s -o output input` komutuyla başlatılan programda `argc` kaçtır?', 'What is `argc` in a program started as `a.out -s -o output input`?'),
    answer: 5,
    explanation: L('Program adı da sayılır: `a.out`, `-s`, `-o`, `output`, `input` = 5. `argv[5]` ise NULL’dır.', 'The program name counts too: `a.out`, `-s`, `-o`, `output`, `input` = 5. `argv[5]` is NULL.'),
  },
  {
    id: 'm2-q09', topic: 'command-line-args', difficulty: 2, kind: 'numeric',
    prompt: L('`./prog "hello world" 42` komutunda (kabuk tırnakları işler) `argc` kaçtır?', 'In `./prog "hello world" 42` (the shell processes the quotes), what is `argc`?'),
    answer: 3,
    explanation: L('Tırnak içindeki `hello world` tek argümandır: `./prog`, `hello world`, `42` → 3. Argümanları boşluklara göre bölen kabuktur, tırnak bunu engeller.', 'The quoted `hello world` is a single argument: `./prog`, `hello world`, `42` → 3. The shell splits arguments on whitespace, quotes prevent that.'),
  },
  {
    id: 'm2-q10', topic: 'command-line-args', difficulty: 2, kind: 'mcq',
    prompt: L('`copy text1.c text2.c` komutuyla çalışan `main(int argc, char *argv[])` içinde `argv[3]` neye eşittir?', 'In `main(int argc, char *argv[])` started with `copy text1.c text2.c`, what is `argv[3]`?'),
    options: [
      L('Tanımsız; dizi sınırı dışı', 'Undefined; out of bounds'),
      L('`NULL` işaretçisi', 'A `NULL` pointer'),
      L('Boş dizgi `""`', 'The empty string `""`'),
      L('`"text2.c"`', '`"text2.c"`'),
    ],
    answer: 1,
    optionNotes: [
      L('`argv` dizisi `argc + 1` elemanlıdır; `argv[argc]` geçerlidir.', 'The `argv` array has `argc + 1` elements; `argv[argc]` is valid.'),
      L('Doğru: `argc = 3` ve `argv[argc]` her zaman NULL’dır.', 'Correct: `argc = 3` and `argv[argc]` is always NULL.'),
      L('NULL ile boş dizgi farklıdır; ilki hiçbir yeri göstermez.', 'NULL and an empty string differ; NULL points nowhere.'),
      L('`argv[2]` `"text2.c"`’dir; `argv[0]` program adıdır.', '`argv[2]` is `"text2.c"`; `argv[0]` is the program name.'),
    ],
    explanation: L('`argv[0]=copy`, `argv[1]=text1.c`, `argv[2]=text2.c`, `argv[3]=NULL`. NULL son işaretçisi sayesinde `for (; *argv; ++argv)` gibi döngüler `argc` olmadan çalışır.', '`argv[0]=copy`, `argv[1]=text1.c`, `argv[2]=text2.c`, `argv[3]=NULL`. The NULL terminator lets loops like `for (; *argv; ++argv)` work without `argc`.'),
  },
  {
    id: 'm2-q11', topic: 'command-line-args', difficulty: 2, kind: 'mcq',
    prompt: L('`myprog 35 56` çalıştırılıyor. Programcı toplamı bulmak için `argv[1] + argv[2]` yazarsa ne olur?', 'You run `myprog 35 56`. What happens if the programmer writes `argv[1] + argv[2]` to get the sum?'),
    options: [
      L('91 hesaplanır', '91 is computed'),
      L('Derleme hatası: iki işaretçi toplanamaz; sayıya `atoi` ile dönüştürmek gerekir', 'Compile error: two pointers cannot be added; the strings must be converted with `atoi`'),
      L('`"3556"` dizgisi oluşur', 'The string `"3556"` is produced'),
      L('Program `argc` 2 olduğu için çöker', 'The program crashes because `argc` is 2'),
    ],
    answer: 1,
    optionNotes: [
      L('Argümanlar sayı değil karakter dizgisidir; otomatik dönüşüm yoktur.', 'Arguments are character strings, not numbers; there is no automatic conversion.'),
      L('Doğru: `argv[i]` bir `char *`’dır. Sayı için `atoi(argv[1]) + atoi(argv[2])` gerekir.', 'Correct: `argv[i]` is a `char *`. Use `atoi(argv[1]) + atoi(argv[2])`.'),
      L('C’de `+` dizgi birleştirmez.', 'C’s `+` does not concatenate strings.'),
      L('`argc` burada 3’tür; çökme nedeni bu değildir.', '`argc` is 3 here; that is not a crash cause.'),
    ],
    explanation: L('Komut satırı argümanları her zaman karakter dizgisi olarak saklanır. Sayısal kullanım için `<stdlib.h>` içindeki `atoi` (veya `strtol`) ile çevrilir.', 'Command-line arguments are always stored as character strings. For numeric use, convert with `atoi` (or `strtol`) from `<stdlib.h>`.'),
  },
  {
    id: 'm2-q12', topic: 'command-line-args', difficulty: 2, kind: 'numeric',
    prompt: L('Aşağıdaki program `./benimprog bu bir testtir` ile çalıştırılırsa kaç satır yazdırır?', 'How many lines does the following program print when run as `./benimprog bu bir testtir`?'),
    code: c`int main(int argc, char *argv[])
{
    for ( ; *argv ; ++argv )
        printf("%s\n", *argv);
}`,
    answer: 4,
    explanation: L('Döngü, NULL’a ulaşana kadar tüm elemanları yazdırır: program adı + 3 argüman = 4 satır.', 'The loop prints every element until it reaches NULL: program name + 3 arguments = 4 lines.'),
  },
  {
    id: 'm2-q13', topic: 'command-line-args', difficulty: 1, kind: 'tf',
    prompt: L('Program hiç argüman verilmeden çalıştırıldığında `argc` değeri 0’dır.', 'When a program is run with no arguments, `argc` is 0.'),
    answer: false,
    explanation: L('`argv[0]` program adıdır ve `argc`’ye dahildir; argümansız çalıştırmada `argc` 1’dir. Bu yüzden “argüman var mı” kontrolü `argc < 2` ile yapılır.', '`argv[0]` is the program name and counts towards `argc`; with no arguments `argc` is 1. That is why the “any arguments?” check is `argc < 2`.'),
  },
  {
    id: 'm2-q14', topic: 'command-line-args', difficulty: 2, kind: 'fill',
    prompt: L('Programa verilen **tüm** argümanları yazdıran döngüyü tamamlayın.', 'Complete the loop that prints **all** arguments.'),
    template: L('`for (i = 0; i < {0}; ++i) printf("%s\\n", {1}[i]);`', '`for (i = 0; i < {0}; ++i) printf("%s\\n", {1}[i]);`'),
    blanks: [['argc'], ['argv']],
    explanation: L('`argc` kaç argüman olduğunu, `argv` ise bu dizgilere işaretçi dizisini verir.', '`argc` gives the number of arguments, `argv` is the array of pointers to those strings.'),
  },
  {
    id: 'm2-q15', topic: 'command-line-args', difficulty: 3, kind: 'mcq',
    prompt: L('Kullanım denetimi yapan program `./sum 3` ile (tek argüman) çalıştırılıyor. Çıktı ne olur?', 'The following program with a usage check is run as `./sum 3` (a single argument). What is printed?'),
    code: c`int main(int argc, char *argv[])
{
    if (argc != 3) {
        printf("Usage: %s <a> <b>\n", argv[0]);
        return 1;
    }
    printf("%d\n", atoi(argv[1]) + atoi(argv[2]));
    return 0;
}`,
    options: [
      L('`3`', '`3`'),
      L('`Usage: ./sum <a> <b>`', '`Usage: ./sum <a> <b>`'),
      L('Bellek hatası, çünkü `argv[2]` yok', 'A memory error, because `argv[2]` does not exist'),
      L('Hiçbir şey yazdırılmaz', 'Nothing is printed'),
    ],
    answer: 1,
    optionNotes: [
      L('Toplama satırına hiç ulaşılmaz.', 'The addition line is never reached.'),
      L('Doğru: `argc` 2’dir, koşul `argc != 3` doğrudur, kullanım mesajı yazılır ve program 1 ile çıkar.', 'Correct: `argc` is 2, `argc != 3` is true, the usage message is printed and the program returns 1.'),
      L('`argv[2]` NULL’dır ama denetim sayesinde hiç okunmaz.', '`argv[2]` is NULL but the check ensures it is never read.'),
      L('Kullanım mesajı yazdırılır.', 'The usage message is printed.'),
    ],
    explanation: L('Program adı dahil `argc = 2`. Denetim, eksik argümanla `argv[2]`’nin kullanılmasını önler: böyle “guard” denetimleri komut satırı programlarının standart bir kalıbıdır.', 'Including the program name `argc = 2`. The check prevents using the missing `argv[2]`: such guard checks are a standard pattern in command-line programs.'),
  },
  {
    id: 'm2-q16', topic: 'command-line-args', difficulty: 2, kind: 'multi',
    prompt: L('`main(int argc, char *argv[])` hakkında hangileri doğrudur?', 'Which statements about `main(int argc, char *argv[])` are true?'),
    options: [
      L('`argv[0]` genellikle programın adını (veya yolunu) içerir.', '`argv[0]` usually holds the program name (or path).'),
      L('`argv[argc]` NULL’dır.', '`argv[argc]` is NULL.'),
      L('`argv[1]` her zaman bir tamsayıdır.', '`argv[1]` is always an integer.'),
      L('Argümanlar karakter dizgisi olarak saklanır.', 'Arguments are stored as character strings.'),
    ],
    answers: [0, 1, 3],
    explanation: L('`argv[1]` sayı gibi görünse bile bir `char *`’dır ve `atoi` ile dönüştürülmelidir.', '`argv[1]` is a `char *` even if it looks like a number and must be converted with `atoi`.'),
  },
];
