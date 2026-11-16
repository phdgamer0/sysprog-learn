import type { Lesson, LText } from '../types';

const t = (tr: string, en: string): LText => ({ tr, en });

export const c_compilation: Lesson = {
  id: 'c-compilation',
  module: 'm2',
  order: 1,
  title: t('C Programının Derlenmesi', 'Compiling a C Program'),
  blurb: t(
    'Kaynak dosyadan çalıştırılabilir dosyaya: önişlemci, derleyici, bağlayıcı ve cc seçenekleri.',
    'From source file to executable: preprocessor, compiler, linker and the cc options.',
  ),
  minutes: 18,
  sources: ['sys-prog-2.pdf s.1-2'],
  objectives: [
    t('Derleme hattının aşamalarını ve her aşamanın girdi/çıktısını sıralayabilmek.', 'Order the stages of the compilation pipeline with the input and output of each.'),
    t('`cc -c` ve `cc -o` seçeneklerinin ne yaptığını açıklayabilmek.', 'Explain what `cc -c` and `cc -o` do.'),
    t('Tek dosyalı (Durum A) ve çok dosyalı (Durum B) programları derleyebilmek.', 'Build single-file (Case A) and multi-file (Case B) programs.'),
    t('Neden nesne dosyalarının ayrı derlenip sonra bağlandığını anlatabilmek.', 'Explain why object files are compiled separately and linked afterwards.'),
  ],
  prerequisites: ['unix-architecture'],
  sections: [
    {
      id: 'pipeline',
      title: t('Derleme hattı', 'The compilation pipeline'),
      blocks: [
        { type: 'p', text: t(
          'Bir C kaynak dosyası doğrudan çalıştırılamaz; işlemcinin anladığı makine koduna dönüştürülmesi gerekir. Bu dönüşüm tek adım değil, bir **hattır** (pipeline): her aşama bir öncekinin çıktısını alır.',
          'A C source file cannot be run directly; it must be converted to machine code that the processor understands. The conversion is not one step but a **pipeline**: each stage takes the output of the previous one.') },
        { type: 'diagram', id: 'compile-pipeline', caption: t('Kaynak dosyadan çalıştırılabilir dosyaya.', 'From source file to executable.') },
        { type: 'steps', items: [
          { title: t('Önişlemci (preprocessor)', 'Preprocessor'), text: t('`#` ile başlayan yönergeleri (`#include`, `#define`) işler. `#include <stdio.h>` satırı, o başlık dosyasının içeriğiyle değiştirilir. Çıktı: yalnızca C komutlarından oluşan **ara kaynak dosyası**.', 'Handles the directives that start with `#` (`#include`, `#define`). A line `#include <stdio.h>` is replaced by the contents of that header. Output: an **intermediate source file** with only C statements.') },
          { title: t('C derleyicisi (compiler)', 'C compiler'), text: t('Ara kaynağı çevirir (assembly aşamasından geçerek) ve **nesne dosyası** (`.o`) üretir: makine kodu + bağlayıcı için bilgiler (hangi fonksiyonlar tanımlı, hangileri dışarıdan beklenir).', 'Translates the intermediate source (going through assembly) and produces an **object file** (`.o`): machine code plus information for the linker (which functions are defined, which are expected from elsewhere).') },
          { title: t('Bağlayıcı (linker)', 'Linker'), text: t('Nesne dosyalarını ve kütüphanelerdeki nesne dosyalarını (örneğin `printf`\'in bulunduğu standart kütüphane) birleştirir; fonksiyon çağrılarını gerçek adreslere bağlar. Çıktı: **çalıştırılabilir dosya**.', 'Combines object files and the object files from libraries (e.g. the standard library that contains `printf`), and connects function calls to real addresses. Output: the **executable file**.') },
        ] },
        { type: 'callout', variant: 'important', title: t('Hata türleri bu hatta bağlıdır', 'Error kinds follow the pipeline'), text: t(
          '`stdio.h` bulunamadı gibi hatalar önişlemciden; sözdizimi hataları derleyiciden; "undefined reference to ..." (tanımsız referans) hataları ise **bağlayıcıdan** gelir. Hata mesajının hangi aşamadan geldiğini bilmek, sorunu hızla bulmanızı sağlar.',
          'Errors such as "stdio.h not found" come from the preprocessor; syntax errors from the compiler; "undefined reference to ..." errors come from the **linker**. Knowing which stage produced the message lets you find the problem quickly.') },
        { type: 'callout', variant: 'source', title: t('Notlarla ilgili not', 'About the slides'), text: t(
          'Slayt hattı "önişlemci → ara kaynak → derleyici → nesne → bağlayıcı" diye gösterir. Gerçek `gcc` derleyicisinde derleyici ile assembler ayrı aşamalardır (`.c → .s → .o`), ama `cc` komutu hepsini tek komutla sürer. `cc` çoğu sistemde `gcc`\'ye (veya başka bir C derleyicisine) bir bağdır.',
          'The slide shows the pipeline as "preprocessor → intermediate source → compiler → object → linker". In real `gcc` the compiler and assembler are separate stages (`.c → .s → .o`), but the `cc` command drives all of them. On most systems `cc` is a link to `gcc` (or another C compiler).') },
      ],
    },
    {
      id: 'commands',
      title: t('Derleyici komutları ve seçenekler', 'Compiler commands and options'),
      blocks: [
        { type: 'table',
          head: [t('Komut', 'Command'), t('Derleyici', 'Compiler')],
          rows: [
            [t('`cc` (veya `gcc`)', '`cc` (or `gcc`)'), t('C derleyicisi', 'C compiler')],
            [t('`CC` (veya `g++`)', '`CC` (or `g++`)'), t('C++ derleyicisi', 'C++ compiler')],
          ] },
        { type: 'table',
          head: [t('Seçenek', 'Option'), t('Anlamı', 'Meaning'), t('Örnek', 'Example')],
          rows: [
            [t('`-c`', '`-c`'), t('Yalnızca derle (bağlama): `.o` üretir', 'Compile only (do not link): produces `.o`'), t('`cc -c edit.c` → `edit.o`', '`cc -c edit.c` → `edit.o`')],
            [t('`-o ad`', '`-o name`'), t('Çıktı dosyasına `ad` ismini ver', 'Name the output file `name`'), t('`cc -o edit edit.c` → `edit`', '`cc -o edit edit.c` → `edit`')],
          ] },
        { type: 'callout', variant: 'note', title: t('-o vermezseniz', 'Without -o'), text: t(
          '`-o` verilmezse çalıştırılabilir dosya varsayılan olarak `a.out` adını alır. Bu yüzden argv örneklerinde `a.out` sık görünür.',
          'If `-o` is omitted the executable is named `a.out` by default. That is why `a.out` shows up so often in argv examples.') },
        { type: 'interactive', id: 'compile-builder', caption: t('Kaynak dosyaları ve seçenekleri seçin; her aşamada hangi dosyaların oluştuğunu görün.', 'Choose source files and options; see which files appear at each stage.') },
      ],
    },
    {
      id: 'case-a',
      title: t('Durum A: tek kaynak dosya', 'Case A: a single source file'),
      blocks: [
        { type: 'steps', items: [
          { title: t('Yaz ve kaydet', 'Write and save'), text: t('Bir metin düzenleyiciyle (örneğin `pico`, `nano`, `vi`) kaynağı yazıp `myprog.c` olarak kaydedin.', 'With a text editor (e.g. `pico`, `nano`, `vi`) write the source and save it as `myprog.c`.') },
          { title: t('Derle ve bağla', 'Compile and link'), text: t('`cc -o myprog myprog.c` - önişlemci, derleyici ve bağlayıcı tek komutta çalışır, çalıştırılabilir `myprog` oluşur.', '`cc -o myprog myprog.c` - preprocessor, compiler and linker all run in one command and the executable `myprog` appears.') },
          { title: t('Çalıştır', 'Run'), text: t('`myprog` veya parametrelerle `myprog param1 param2`.', '`myprog`, or with parameters `myprog param1 param2`.') },
        ] },
        { type: 'code', lang: 'shell', code:
`% pico myprog.c
% cc -o myprog myprog.c
% myprog param1 param2` },
        { type: 'callout', variant: 'tip', title: t('Geçerli dizin PATH\'te değilse', 'If the current directory is not in PATH'), text: t(
          'Modern sistemlerde güvenlik nedeniyle geçerli dizin genellikle `PATH`\'te yer almaz; programı `./myprog` diye çalıştırmanız gerekir. Slaytlar kısalık için `myprog` yazar.',
          'On modern systems the current directory is usually not in `PATH` for security reasons, so you must run the program as `./myprog`. The slides write `myprog` for brevity.') },
      ],
    },
    {
      id: 'case-b',
      title: t('Durum B: birkaç kaynak dosya', 'Case B: several source files'),
      blocks: [
        { type: 'p', text: t(
          'Büyük programlar birçok dosyaya bölünür (`module1.c`, `module2.c`, `module3.c`). İki yol vardır:',
          'Large programs are split over many files (`module1.c`, `module2.c`, `module3.c`). There are two ways:') },
        { type: 'code', lang: 'shell', title: t('Yol 1 - ayrı ayrı', 'Way 1 - separately'), code:
`% cc -c module1.c        # module1.o
% cc -c module2.c        # module2.o
% cc -c module3.c        # module3.o
% cc -o myprog module1.o module2.o module3.o` },
        { type: 'code', lang: 'shell', code:
`% cc -o myprog module1.c module2.c module3.c    # Yol 2 / Way 2: hepsi tek komutta` },
        { type: 'p', text: t(
          'Neden Yol 1\'i kullanırız? Bir dosyayı değiştirdiğinizde yalnızca onu yeniden derleyip (`cc -c module2.c`) bağlamanız yeterlidir; diğerleri zaten `.o` olarak hazırdır. Büyük projelerde bu çok zaman kazandırır (bu mantık `make` aracının temelidir).',
          'Why use Way 1? When you change one file you only need to recompile that one (`cc -c module2.c`) and link again; the others are already ready as `.o` files. In large projects this saves a lot of time (this logic is the basis of the `make` tool).') },
        { type: 'callout', variant: 'warning', title: t('Sık hata', 'Common mistake'), text: t(
          '`-c` ile bağlama yapılmaz. `cc -c module1.c module2.c -o myprog` gibi bir komut, çalıştırılabilir dosya üretmez (ve birden fazla dosyayla `-o` kullanımı hata verir). Çalıştırılabilir dosya için `-c` **olmadan** bağlama komutunu verin.',
          'With `-c` no linking happens. A command like `cc -c module1.c module2.c -o myprog` does not produce an executable (and `-o` with several files is an error). For an executable, give the link command **without** `-c`.') },
        { type: 'callout', variant: 'tip', text: t(
          '`-o` seçeneğinden hemen sonra gelen kelime çıktı dosyasının adıdır. `cc -o myprog.c myprog` yazarsanız kaynağınızın üzerine yazılabilir; sırayı kontrol edin.',
          'The word right after `-o` is the output name. If you write `cc -o myprog.c myprog` you may overwrite your own source file; check the order.') },
      ],
    },
  ],
  misconceptions: [
    { wrong: t('`cc -c prog.c` çalıştırılabilir dosya üretir.', '`cc -c prog.c` produces an executable.'),
      right: t('`-c` bağlamadan önce durur ve yalnızca nesne dosyası `prog.o` üretir.', '`-c` stops before linking and only produces the object file `prog.o`.') },
    { wrong: t('Nesne dosyası (.o) çalıştırılabilir dosyadır.', 'An object file (.o) is an executable.'),
      right: t('Nesne dosyasında çözülmemiş referanslar vardır (örneğin `printf`); bağlayıcı bunları çözerek çalıştırılabilir dosyayı oluşturur.', 'An object file has unresolved references (e.g. `printf`); the linker resolves them to build the executable.') },
    { wrong: t('"undefined reference" hatası derleyiciden gelir.', 'An "undefined reference" error comes from the compiler.'),
      right: t('Bu bağlayıcı hatasıdır: bir fonksiyon çağrılmış ama hiçbir nesne dosyasında/kütüphanede tanımı bulunamamıştır.', 'It is a linker error: a function was called but its definition was found in no object file/library.') },
    { wrong: t('`#include` satırı derleyici tarafından işlenir.', 'The `#include` line is processed by the compiler.'),
      right: t('`#` yönergelerini önişlemci işler; derleyici zaten birleştirilmiş ara kaynağı görür.', 'The preprocessor processes `#` directives; the compiler already sees the merged intermediate source.') },
  ],
  summary: [
    t('Hat: kaynak → önişlemci → ara kaynak → derleyici → nesne dosyası → bağlayıcı (+ kütüphaneler) → çalıştırılabilir dosya.', 'Pipeline: source → preprocessor → intermediate source → compiler → object file → linker (+ libraries) → executable.'),
    t('`#` yönergelerini önişlemci, C komutlarını derleyici, fonksiyonların birleştirilmesini bağlayıcı yapar.', 'The preprocessor handles `#` directives, the compiler handles C statements, the linker joins functions together.'),
    t('`cc` (gcc) C, `CC` (g++) C++ derleyicisidir.', '`cc` (gcc) is the C compiler, `CC` (g++) the C++ compiler.'),
    t('`-c` yalnızca derler (.o); `-o ad` çıktı dosyasına ad verir.', '`-c` only compiles (.o); `-o name` names the output file.'),
    t('Durum A: `cc -o myprog myprog.c`. Durum B: önce her dosya için `cc -c`, sonra `cc -o myprog *.o` veya hepsi tek komutta.', 'Case A: `cc -o myprog myprog.c`. Case B: `cc -c` for each file then link the `.o` files, or everything in one command.'),
  ],
  practice: [
    { id: 'c-compilation-p1', topic: 'c-compilation', difficulty: 1, kind: 'order',
      prompt: t('Derleme hattının aşamalarını sırayla dizin.', 'Put the stages of the compilation pipeline in order.'),
      items: [t('Kaynak dosya (.c)', 'Source file (.c)'), t('Önişlemci', 'Preprocessor'), t('Ara kaynak dosyası', 'Intermediate source file'), t('C derleyicisi', 'C compiler'), t('Nesne dosyası (.o)', 'Object file (.o)'), t('Bağlayıcı', 'Linker'), t('Çalıştırılabilir dosya', 'Executable file')],
      explanation: t('Her aşamanın çıktısı bir sonrakinin girdisidir.', 'The output of each stage is the input of the next.') },
    { id: 'c-compilation-p2', topic: 'c-compilation', difficulty: 1, kind: 'mcq',
      prompt: t('`cc -c edit.c` komutunun sonunda diskte hangi yeni dosya oluşur?', 'After `cc -c edit.c`, which new file exists on disk?'),
      options: [t('`edit`', '`edit`'), t('`a.out`', '`a.out`'), t('`edit.o`', '`edit.o`'), t('Hiçbiri; yalnızca hata denetlenir', 'None; it only checks for errors')],
      answer: 2,
      optionNotes: [
        t('`edit` çalıştırılabilir dosya adıdır; `-c` ile bağlama yapılmadığı için oluşmaz.', '`edit` would be an executable; with `-c` there is no linking so it is not created.'),
        t('`a.out` bağlama sonucu varsayılan addır; burada bağlama yok.', '`a.out` is the default link result; there is no linking here.'),
        t('Doğru: `-c` nesne dosyasını (`edit.o`) üretir.', 'Correct: `-c` produces the object file `edit.o`.'),
        t('Nesne dosyası diske yazılır.', 'The object file is written to disk.'),
      ],
      explanation: t('`-c` yalnızca derler; çıktı kaynak adıyla aynı kökte `.o` dosyasıdır.', '`-c` only compiles; the output is a `.o` file with the same base name as the source.') },
    { id: 'c-compilation-p3', topic: 'c-compilation', difficulty: 1, kind: 'fill',
      prompt: t('Komutu tamamlayın: `edit.c` dosyasından `edit` adlı çalıştırılabilir dosya üretin.', 'Complete the command: build an executable named `edit` from `edit.c`.'),
      template: t('cc {0} edit edit.c', 'cc {0} edit edit.c'),
      blanks: [['-o']],
      explanation: t('`-o` çıktı dosyasının adını belirler.', '`-o` sets the output file name.') },
    { id: 'c-compilation-p4', topic: 'c-compilation', difficulty: 2, kind: 'mcq',
      prompt: t('`module1.c`, `module2.c`, `module3.c` dosyalarından `myprog` programını tek komutla üretmek için hangisi doğrudur?', 'Which single command builds `myprog` from `module1.c`, `module2.c`, `module3.c`?'),
      options: [t('`cc -c -o myprog module1.c module2.c module3.c`', '`cc -c -o myprog module1.c module2.c module3.c`'), t('`cc -o myprog module1.c module2.c module3.c`', '`cc -o myprog module1.c module2.c module3.c`'), t('`cc -o module1.c module2.c module3.c myprog`', '`cc -o module1.c module2.c module3.c myprog`'), t('`cc myprog module1.c module2.c module3.c`', '`cc myprog module1.c module2.c module3.c`')],
      answer: 1,
      optionNotes: [
        t('`-c` bağlamayı engeller; çalıştırılabilir dosya oluşmaz.', '`-c` prevents linking; no executable is produced.'),
        t('Doğru.', 'Correct.'),
        t('`-o`\'dan sonra gelen kelime çıktı adıdır; `module1.c` çıktı olur ve kaynak dosya bozulabilir.', 'The word after `-o` is the output name; `module1.c` would be the output and your source could be clobbered.'),
        t('`myprog` diye bir girdi dosyası arar; çıktı adı belirtilmediği için `a.out` oluşurdu, üstelik `myprog` bulunamaz.', '`myprog` is taken as an input file that does not exist; output would be `a.out` anyway.'),
      ],
      explanation: t('Birden fazla `.c` dosyası verildiğinde `cc` hepsini derler ve bağlar; `-o` çıktının adını verir.', 'With several `.c` files `cc` compiles and links them all; `-o` names the output.') },
    { id: 'c-compilation-p5', topic: 'c-compilation', difficulty: 2, kind: 'match',
      prompt: t('Aşamayı, yaptığı işle eşleştirin.', 'Match each stage with what it does.'),
      left: [t('Önişlemci', 'Preprocessor'), t('Derleyici', 'Compiler'), t('Bağlayıcı', 'Linker')],
      right: [t('`#include` ve `#define` yönergelerini işler', 'Handles `#include` and `#define` directives'), t('C kodunu makine koduna çevirip `.o` üretir', 'Translates C code to machine code, producing `.o`'), t('Nesne dosyalarını ve kütüphane fonksiyonlarını birleştirir', 'Joins object files and library functions')],
      pairs: [0, 1, 2],
      explanation: t('Üç aşamanın sorumlulukları farklıdır.', 'The three stages have different responsibilities.') },
    { id: 'c-compilation-p6', topic: 'c-compilation', difficulty: 3, kind: 'multi',
      prompt: t('`module2.c` değişti, `module1.c` ve `module3.c` değişmedi; `module1.o`, `module3.o` zaten var. Hangi komutlar programı doğru günceller?', '`module2.c` changed; `module1.c` and `module3.c` did not and `module1.o`, `module3.o` already exist. Which commands correctly update the program?'),
      options: [t('`cc -c module2.c` ardından `cc -o myprog module1.o module2.o module3.o`', '`cc -c module2.c` then `cc -o myprog module1.o module2.o module3.o`'), t('`cc -o myprog module1.o module2.c module3.o`', '`cc -o myprog module1.o module2.c module3.o`'), t('Yalnızca `cc -c module2.c`', 'Only `cc -c module2.c`'), t('`cc -o myprog module1.c module2.c module3.c`', '`cc -o myprog module1.c module2.c module3.c`')],
      answers: [0, 1, 3],
      explanation: t('A: yeniden derle + bağla. B: `cc` hem `.c` hem `.o` kabul eder; module2.c derlenir, hepsi bağlanır. D: her şeyi baştan derler (daha yavaş ama doğru). C: yalnızca `module2.o`\'yu günceller, çalıştırılabilir dosya eski kalır.', 'A: recompile + link. B: `cc` accepts both `.c` and `.o`; it compiles module2.c and links everything. D: recompiles everything (slower but correct). C only refreshes `module2.o`; the executable stays stale.') },
  ],
};

export const command_line_args: Lesson = {
  id: 'command-line-args',
  module: 'm2',
  order: 2,
  title: t('Komut Satırı Argümanları: argc ve argv', 'Command-Line Arguments: argc and argv'),
  blurb: t(
    'main fonksiyonunun iki biçimi, argc/argv\'nin anlamı, argümanların her zaman dizgi olması ve tipik kullanım kalıpları.',
    'The two forms of main, the meaning of argc/argv, arguments always being strings, and typical usage patterns.',
  ),
  minutes: 25,
  sources: ['sys-prog-2.pdf s.3-9'],
  objectives: [
    t('`main`\'in iki biçimini ve hangisinin ne zaman kullanıldığını söyleyebilmek.', 'State the two forms of `main` and when each is used.'),
    t('Bir komut satırı için `argc` değerini ve `argv[]` dizisinin içeriğini doğru yazabilmek.', 'Write the correct `argc` and contents of `argv[]` for a command line.'),
    t('`argv[0]`, `argv[argc] == NULL` ve argümanların dizgi oluşunu açıklayabilmek.', 'Explain `argv[0]`, `argv[argc] == NULL` and why arguments are strings.'),
    t('Kullanım (usage) mesajı kalıbını ve `atoi` ile sayı dönüşümünü uygulayabilmek.', 'Apply the usage-message pattern and `atoi` number conversion.'),
    t('`*++argv` ve `for (; *argv; ++argv)` gibi işaretçi gösterimli kalıpların çıktısını izleyebilmek.', 'Trace the output of pointer-style patterns like `*++argv` and `for (; *argv; ++argv)`.'),
  ],
  prerequisites: ['c-compilation'],
  sections: [
    {
      id: 'main-forms',
      title: t('main fonksiyonunun iki biçimi', 'The two forms of main'),
      blocks: [
        { type: 'p', text: t(
          'UNIX\'te her komut bir programdır ve çoğu komut ek bilgi alır: `mkdir dizin_ismi` komutundaki `dizin_ismi` gibi. Programın bu bilgiyi alabilmesi için `main` fonksiyonu iki biçimde yazılabilir:',
          'In UNIX every command is a program and most commands take extra information: like `dir_name` in `mkdir dir_name`. For a program to receive it, `main` can be written in two forms:') },
        { type: 'code', lang: 'c', title: 'form 1', code:
`int main(void)            /* argümansız / without arguments */
{
    /* gövde / body */
}` },
        { type: 'code', lang: 'c', title: 'form 2', code:
`int main(int argc, char *argv[])   /* argümanlı / with arguments */
{
    /* gövde / body */
}` },
        { type: 'p', text: t(
          'Birinci biçim `%progismi` ile, ikinci biçim `%progismi param1 param2` ile çalıştırılır. `time` komutu parametresizdir; `mkdir dizin` parametrelidir. İkinci biçimi seçseniz bile programı parametresiz çalıştırabilirsiniz (o zaman `argc == 1`).',
          'The first form is run with `%progname`, the second with `%progname param1 param2`. The `time` command takes no parameters; `mkdir dir` does. Even if you use the second form you may run the program without parameters (then `argc == 1`).') },
        { type: 'callout', variant: 'source', title: t('Notlarla ilgili not', 'About the slides'), text: t(
          'Slayt `main()` yazar (dönüş tipi belirtmeden). Bu eski C (K&R / C89) yazımıdır; `int` varsayılır. Modern C\'de `int main(void)` veya `int main(int argc, char *argv[])` yazın. Slayt örneklerinde `exit()` ve `atoi()` kullanıldığı halde yalnızca `<stdio.h>` eklenmiştir; doğru başlık `<stdlib.h>`\'dir. Ayrıca slaytlardaki akıllı tırnaklar (“ ”) gerçek C\'de düz tırnak (") olmalıdır.',
          'The slide writes `main()` with no return type. That is old C (K&R / C89) where `int` is assumed. In modern C write `int main(void)` or `int main(int argc, char *argv[])`. The slide examples use `exit()` and `atoi()` while including only `<stdio.h>`; the correct header is `<stdlib.h>`. Also the curly quotes (“ ”) on the slides must be plain quotes (") in real C.') },
      ],
    },
    {
      id: 'argc-argv',
      title: t('argc ve argv ne demek?', 'What are argc and argv?'),
      blocks: [
        { type: 'definitions', items: [
          { term: t('`argc` (argument count)', '`argc` (argument count)'), text: t('Komut satırındaki kelime sayısı; **program adı dahil**.', 'The number of words on the command line, **including the program name**.') },
          { term: t('`argv` (argument vector)', '`argv` (argument vector)'), text: t('Dizgilere (`char *`) işaretçilerden oluşan dizi; her eleman komut satırındaki bir kelimeyi gösterir.', 'An array of pointers to strings (`char *`); each element points to one word of the command line.') },
        ] },
        { type: 'diagram', id: 'argv-structure', caption: t('argv: n parametre için n+1 dizgi + sondaki NULL işaretçisi; argc = n + 1.', 'argv: n parameters give n+1 strings + a trailing NULL pointer; argc = n + 1.') },
        { type: 'list', items: [
          t('`argv[0]` program adını gösterir (çoğu zaman yol bilgisiyle birlikte, ör. `./copy`).', '`argv[0]` points to the program name (often including the path, e.g. `./copy`).'),
          t('`argv[i]`, `i = 1 … argc-1` için i. argümanı gösterir.', '`argv[i]` for `i = 1 … argc-1` points to the i-th argument.'),
          t('`argv[argc]` **NULL** işaretçisidir; argüman listesinin sonunu belirtir.', '`argv[argc]` is the **NULL** pointer; it marks the end of the argument list.'),
        ] },
        { type: 'callout', variant: 'important', title: t('Kural: argc = n + 1', 'Rule: argc = n + 1'), text: t(
          'n, program adı hariç parametre sayısıdır. Program adı da bir eleman olduğundan `argc` her zaman en az 1\'dir. Yani "kullanıcı kaç parametre girdi?" sorusunun cevabı `argc - 1`\'dir.',
          'n is the number of parameters excluding the program name. The program name is also an element, so `argc` is always at least 1. The answer to "how many parameters did the user give?" is `argc - 1`.') },
        { type: 'h3', text: t('Örnek 1: copy', 'Example 1: copy') },
        { type: 'code', lang: 'shell', code: '% copy text1.c text2.c' },
        { type: 'table',
          head: [t('İfade', 'Expression'), t('Gösterdiği', 'Points to')],
          rows: [
            [t('`argv[0]`', '`argv[0]`'), t('"copy" (yol da olabilir)', '"copy" (possibly with a path)')],
            [t('`argv[1]`', '`argv[1]`'), t('"text1.c"', '"text1.c"')],
            [t('`argv[2]`', '`argv[2]`'), t('"text2.c"', '"text2.c"')],
            [t('`argv[3]`', '`argv[3]`'), t('NULL', 'NULL')],
          ],
          caption: t('Burada `argc = 3`.', 'Here `argc = 3`.') },
        { type: 'h3', text: t('Örnek 2: a.out -s -o output input', 'Example 2: a.out -s -o output input') },
        { type: 'p', text: t(
          'Kelimeleri sayın: `a.out`, `-s`, `-o`, `output`, `input` = 5 kelime. Dolayısıyla `argc = 5`; `argv[0]`…`argv[4]` bu kelimeleri, `argv[5]` NULL\'u gösterir. Seçenekler (`-s`, `-o`) kabuk için özel değildir; programa sıradan dizgiler olarak gelir ve anlamlandırmak programın işidir.',
          'Count the words: `a.out`, `-s`, `-o`, `output`, `input` = 5 words. Hence `argc = 5`; `argv[0]`…`argv[4]` point to these words and `argv[5]` is NULL. The options (`-s`, `-o`) are not special to the shell; they arrive as ordinary strings and it is the program\'s job to interpret them.') },
        { type: 'interactive', id: 'argv-builder', caption: t('Kendi komut satırınızı yazıp argc ve argv\'yi görün.', 'Type your own command line and see argc and argv.') },
        { type: 'callout', variant: 'note', title: t('Kabuk ne yapar?', 'What does the shell do?'),  text: t(
          'Komut satırını kelimelere bölen kabuktur (boşluklarda). Bu yüzden `"iki kelime"` gibi tırnaklı bir ifade tek argüman olur: `copy "my file.c" b.c` komutunda `argc = 3`. Ayrıca `*` gibi joker karakterleri de kabuk genişletir; program genişletilmiş listeyi alır.',
          'It is the shell that splits the command line into words (at whitespace). That is why a quoted expression such as `"two words"` is a single argument: in `copy "my file.c" b.c`, `argc = 3`. The shell also expands wildcards like `*`; the program receives the expanded list.') },
      ],
    },
    {
      id: 'strings',
      title: t('Argümanlar her zaman dizgidir', 'Arguments are always strings'),
      blocks: [
        { type: 'p', text: t(
          '`myprog 35 56` yazdığınızda `argv[1]` ve `argv[2]`, sayı değil `"35"` ve `"56"` **karakter dizgilerini** gösterir (`"3"`...). Sayıyla işlem yapacaksanız dönüştürmelisiniz: `atoi()` (ASCII to integer) bir dizgiyi `int`\'e çevirir ve `<stdlib.h>` başlığındadır.',
          'When you type `myprog 35 56`, `argv[1]` and `argv[2]` point to the **character strings** `"35"` and `"56"`, not numbers (characters `3` and `5` plus a terminating NUL). To compute with them you must convert: `atoi()` (ASCII to integer) turns a string into an `int` and lives in `<stdlib.h>`.') },
        { type: 'code', lang: 'c', title: 'usage.c', code:
`#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
    int gun, yil;

    /* Kullanım denetimi / usage check */
    if (argc != 3) {
        printf("Kullanım: %s <gun> <yil>\\n", argv[0]);
        return 1;
    }
    gun = atoi(argv[1]);   /* "12" -> 12 */
    yil = atoi(argv[2]);
    printf("gun=%d yil=%d\\n", gun, yil);
    return 0;
}` },
        { type: 'p', text: t(
          'Bu **kullanım (usage) mesajı kalıbı**, UNIX komutlarının standart davranışıdır: önce `argc`\'yi denetle; yanlışsa programın nasıl çağrılacağını `argv[0]` ile yazdırıp hata koduyla çık. `argv[0]`\'ı kullanmak, programın adı değişse bile mesajın doğru kalmasını sağlar.',
          'This **usage-message pattern** is standard UNIX behaviour: check `argc` first; if it is wrong, print how the program should be called, using `argv[0]`, and exit with an error code. Using `argv[0]` keeps the message right even if the program is renamed.') },
        { type: 'output', text: `% usage
Kullanım: usage <gun> <yil>
% usage 12 2024
gun=12 yil=2024`, caption: t('Parametresiz çalıştırınca kullanım mesajı çıkar.', 'Run without parameters, the usage message appears.') },
        { type: 'code', lang: 'c', title: 'copy.c (iskelet / skeleton)', code:
`/* % copy filename1 filename2 */
int main(int argc, char *argv[])
{
    int f1, f2;
    /* ... argc == 3 denetimi / check ... */
    f1 = open(argv[1], O_RDONLY);       /* kaynak / source */
    f2 = creat(argv[2], 0644);          /* hedef / destination */
    /* ... */
}`, caption: t('Dosya kopyalama programı iki parametre alır; adlar doğrudan open/creat\'e verilir.', 'A file copy program takes two parameters; the names are passed straight to open/creat.') },
        { type: 'callout', variant: 'warning', title: t('atoi hata bildirmez', 'atoi does not report errors'), text: t(
          '`atoi("abc")` sessizce 0 döndürür; 0 mı yoksa geçersiz girdi mi olduğunu ayırt edemezsiniz. Ciddi programlarda `strtol` kullanılır. Bu derste `atoi` yeterlidir.',
          '`atoi("abc")` silently returns 0; you cannot tell zero from invalid input. Serious programs use `strtol`. `atoi` is enough for this course.') },
        { type: 'callout', variant: 'warning', title: t('Erişmeden önce argc\'yi denetleyin', 'Check argc before indexing'), text: t(
          '`argc == 1` iken `argv[1]` NULL\'dur. `atoi(argv[1])` veya `printf("%s", argv[1])` yazmak tanımsız davranıştır (çökme). Bu yüzden usage denetimi önce gelir.',
          'When `argc == 1`, `argv[1]` is NULL. Writing `atoi(argv[1])` or `printf("%s", argv[1])` is undefined behaviour (a crash). That is why the usage check comes first.') },
      ],
    },
    {
      id: 'patterns',
      title: t('Tipik kalıplar ve işaretçi gösterimi', 'Typical patterns and pointer notation'),
      blocks: [
        { type: 'code', lang: 'c', title: 'myprog.c', code:
`#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
    if (argc < 2) {
        printf("Kullanım : %s parametre\\n", argv[0]);
        exit(1);
    }
    printf("Çalıştırılan program %s \\n", argv[0]);
    printf("Parametrelerin sayısı %d \\n", argc - 1);
    printf("Birinci parametre %s\\n", argv[1]);
    exit(0);
}` },
        { type: 'output', text: `% myprog
Kullanım : myprog parametre
% myprog abcdef
Çalıştırılan program myprog
Parametrelerin sayısı 1
Birinci parametre abcdef`, caption: t('Çıktılar (yol bilgisi olmadan çalıştırıldığı varsayımıyla).', 'Outputs (assuming it was started without a path).') },
        { type: 'callout', variant: 'note', text: t(
          'Gerçek sistemde `./myprog` yazarsanız `argv[0]` `"./myprog"` olur ve çıktıda da öyle görünür. `argv[0]`, kabuğun programı çağırırken verdiği ad/yoldur.',
          'On a real system, if you type `./myprog` then `argv[0]` is `"./myprog"` and it appears that way in the output. `argv[0]` is the name/path the shell used to invoke the program.') },
        { type: 'h3', text: t('Diziler yerine işaretçi artırmak', 'Pointer increment instead of indexing') },
        { type: 'p', text: t(
          '`argv`, bir `char *` dizisinin ilk elemanını gösteren bir işaretçidir (`char **`). `argv[0]` yerine `*argv`, `argv[1]` yerine `*++argv` yazılabilir. Dikkat: `++argv`, `argv`\'nin **kendisini** bir eleman ilerletir. Yani `*++argv` önce `argv`\'yi artırır, sonra yeni göstermeye bakar.',
          '`argv` is a pointer to the first element of an array of `char *` (`char **`). `*argv` can replace `argv[0]` and `*++argv` can replace `argv[1]`. Careful: `++argv` moves **`argv` itself** one element forward. So `*++argv` first increments `argv`, then dereferences the new position.') },
        { type: 'code', lang: 'c', title: 'demo.c', code:
`#include <stdio.h>

int main(int argc, char *argv[])
{
    printf("%s\\n", *argv);     /* argv[0] */
    printf("%s\\n", *++argv);   /* artık argv eski argv[1]'i gösterir */
    printf("%s\\n", argv[1]);   /* şimdiki argv[1] = eski argv[2] */
    return 0;
}` },
        { type: 'output', text: `% demo x y z
demo
x
y`, caption: t('`argv[1]` ifadesinin anlamı, `argv` değiştikten sonra kaydı!', 'The meaning of `argv[1]` shifts once `argv` has been modified!') },
        { type: 'h3', text: t('Tüm argümanları dolaşmak', 'Walking over all arguments') },
        { type: 'p', text: t(
          '`argv[argc]` NULL olduğu için sayacı kullanmadan, NULL gelene kadar ilerleyebiliriz:',
          'Because `argv[argc]` is NULL we can walk without a counter, until NULL appears:') },
        { type: 'code', lang: 'c', code:
`#include <stdio.h>
int main(int argc, char *argv[])
{
    for ( ; *argv ; ++argv )
        printf("%s\\n", *argv);
}` },
        { type: 'output', text: `% benimprog bu bir testtir
benimprog
bu
bir
testtir` },
        { type: 'p', text: t('Sayaçlı eşdeğeri, hem `argc`\'yi hem her elemanı gösterir:', 'The counter-based equivalent, which also shows `argc` and each element:') },
        { type: 'code', lang: 'c', code:
`#include <stdio.h>
int main(int argc, char *argv[])
{
    int i;
    printf("argc = %d\\n\\n", argc);
    for (i = 0; i < argc; ++i)
        printf("argv[%d]: %s\\n", i, argv[i]);
}` },
        { type: 'output', text: `% a.out hello 42
argc = 3

argv[0]: a.out
argv[1]: hello
argv[2]: 42` },
        { type: 'callout', variant: 'tip', text: t(
          'İki döngü eşdeğerdir ama `argv`\'yi artıran döngü bitince `argv` NULL\'u gösterir; orijinal başa dönemezsiniz. `argv` üzerinde oynamadan önce gerekirse bir kopya (`char **p = argv;`) alın.',
          'The two loops are equivalent, but after the `argv`-incrementing loop `argv` points to NULL and you cannot get back to the start. Before modifying `argv`, take a copy (`char **p = argv;`) if you need it.') },
      ],
    },
  ],
  misconceptions: [
    { wrong: t('`argc`, parametre sayısıdır.', '`argc` is the number of parameters.'),
      right: t('`argc` program adı dahil kelime sayısıdır; parametre sayısı `argc - 1`\'dir.', '`argc` counts words including the program name; the number of parameters is `argc - 1`.') },
    { wrong: t('`./prog 35` çalıştırınca `argv[1]` tamsayı 35\'tir.', 'After `./prog 35`, `argv[1]` is the integer 35.'),
      right: t('`argv[1]` `"35"` dizgisini gösterir; `atoi(argv[1])` ile `int`\'e çevrilir.', '`argv[1]` points to the string `"35"`; convert with `atoi(argv[1])`.') },
    { wrong: t('`argv[0]` ilk parametredir.', '`argv[0]` is the first parameter.'),
      right: t('`argv[0]` program adıdır; ilk parametre `argv[1]`\'dir.', '`argv[0]` is the program name; the first parameter is `argv[1]`.') },
    { wrong: t('`argv[argc]` son argümandır.', '`argv[argc]` is the last argument.'),
      right: t('Son argüman `argv[argc-1]`\'dir; `argv[argc]` NULL\'dur ve geçerli bir dizgi değildir.', 'The last argument is `argv[argc-1]`; `argv[argc]` is NULL and not a valid string.') },
    { wrong: t('`*++argv` ve `argv[1]` her zaman aynı değeri verir.', '`*++argv` and `argv[1]` always give the same value.'),
      right: t('Yalnızca `++argv`\'den önce. `++argv`, `argv`\'yi değiştirir; sonraki `argv[1]` eski `argv[2]` olur.', 'Only before `++argv`. `++argv` modifies `argv`; a later `argv[1]` is the old `argv[2]`.') },
  ],
  summary: [
    t('`main` iki biçimde yazılır: argümansız `main(void)` ve `main(int argc, char *argv[])`.', '`main` has two forms: `main(void)` without arguments and `main(int argc, char *argv[])`.'),
    t('`argc` = program adı dahil kelime sayısı = n + 1; `argv` dizgi işaretçileri dizisidir.', '`argc` = number of words including the program name = n + 1; `argv` is an array of string pointers.'),
    t('`argv[0]` program adı, `argv[1..argc-1]` argümanlar, `argv[argc]` NULL.', '`argv[0]` is the program name, `argv[1..argc-1]` the arguments, `argv[argc]` is NULL.'),
    t('Argümanlar her zaman dizgidir; sayı için `atoi` (`<stdlib.h>`).', 'Arguments are always strings; use `atoi` (`<stdlib.h>`) for numbers.'),
    t('Kullanım kalıbı: `if (argc != N) { printf("Kullanım: %s ...", argv[0]); return 1; }`.', 'Usage pattern: `if (argc != N) { printf("Usage: %s ...", argv[0]); return 1; }`.'),
    t('`for (; *argv; ++argv)` NULL sonlandırıcı sayesinde argc olmadan tüm argümanları dolaşır.', '`for (; *argv; ++argv)` walks all arguments without argc thanks to the NULL terminator.'),
  ],
  practice: [
    { id: 'command-line-args-p1', topic: 'command-line-args', difficulty: 1, kind: 'numeric', answer: 5,
      prompt: t('`a.out -s -o output input` komutu çalıştırıldığında `argc` kaç olur?', 'What is `argc` when `a.out -s -o output input` is run?'),
      explanation: t('Kelimeler: a.out, -s, -o, output, input = 5. (`argv[5]` NULL.)', 'Words: a.out, -s, -o, output, input = 5. (`argv[5]` is NULL.)') },
    { id: 'command-line-args-p2', topic: 'command-line-args', difficulty: 1, kind: 'mcq',
      prompt: t('`% myprog 35 56` için `argv[1]` nedir?', 'For `% myprog 35 56`, what is `argv[1]`?'),
      options: [t('`int` değeri 35', 'The `int` value 35'), t('`"35"` dizgisini gösteren `char *`', 'A `char *` pointing to the string `"35"`'), t('`"myprog"` dizgisini gösteren `char *`', 'A `char *` pointing to `"myprog"`'), t('NULL', 'NULL')],
      answer: 1,
      optionNotes: [
        t('Argümanlar hiçbir zaman otomatik sayıya çevrilmez.', 'Arguments are never automatically converted to numbers.'),
        t('Doğru: dizgi; sayı için `atoi` gerekir.', 'Correct: a string; use `atoi` for a number.'),
        t('`"myprog"` `argv[0]`\'dır.', '`"myprog"` is `argv[0]`.'),
        t('NULL `argv[argc]` = `argv[3]`\'tür.', 'NULL is `argv[argc]` = `argv[3]`.'),
      ],
      explanation: t('Komut satırı argümanları her zaman karakter dizgisi olarak saklanır.', 'Command-line arguments are always stored as character strings.') },
    { id: 'command-line-args-p3', topic: 'command-line-args', difficulty: 1, kind: 'tf', answer: true,
      prompt: t('Doğru mu yanlış mı: `argv[argc]` her zaman NULL işaretçisidir.', 'True or false: `argv[argc]` is always the NULL pointer.'),
      explanation: t('Argüman listesi NULL ile sonlanır; `for (; *argv; ++argv)` kalıbı buna dayanır.', 'The argument list is terminated by NULL; the `for (; *argv; ++argv)` pattern relies on it.') },
    { id: 'command-line-args-p4', topic: 'command-line-args', difficulty: 2, kind: 'mcq',
      prompt: t('Aşağıdaki program `./demo x y z` ile çalıştırılırsa çıktısı nedir?', 'What does the program print when run as `./demo x y z`?'),
      code: `#include <stdio.h>
int main(int argc, char *argv[])
{
    printf("%d\\n", argc);
    printf("%s\\n", *++argv);
    printf("%s\\n", argv[1]);
    return 0;
}`,
      options: [t('4, x, y', '4, x, y'), t('4, y, z', '4, y, z'), t('3, x, y', '3, x, y'), t('4, ./demo, x', '4, ./demo, x')],
      answer: 0,
      optionNotes: [
        t('Doğru: argc = 4; `++argv` ile argv eski argv[1]\'i ("x") gösterir; sonra `argv[1]` eski argv[2] = "y".', 'Correct: argc = 4; after `++argv` argv points at old argv[1] ("x"); then `argv[1]` is old argv[2] = "y".'),
        t('`*++argv` "y" değil "x"\'tir: önce artırır, sonra argv[0] (yeni) = eski argv[1].', '`*++argv` is "x", not "y": it increments first and then reads the new argv[0] = old argv[1].'),
        t('argc program adını da sayar: 3 değil 4.', 'argc counts the program name too: 4, not 3.'),
        t('`*++argv` program adını değil, bir sonraki kelimeyi verir.', '`*++argv` yields the next word, not the program name.'),
      ],
      explanation: t('argc = 4 (demo, x, y, z). `*++argv` -> "x". Şimdi argv eski &argv[1] olduğundan `argv[1]` eski `argv[2]` = "y".', 'argc = 4 (demo, x, y, z). `*++argv` -> "x". Now argv is the old &argv[1], so `argv[1]` is the old `argv[2]` = "y".') },
    { id: 'command-line-args-p5', topic: 'command-line-args', difficulty: 2, kind: 'multi',
      prompt: t('`% copy text1.c text2.c` için hangi ifadeler doğrudur?', 'For `% copy text1.c text2.c`, which statements are true?'),
      options: [t('`argc == 3`', '`argc == 3`'), t('`argv[1]` "text1.c"\'yi gösterir', '`argv[1]` points to "text1.c"'), t('`argv[3]` NULL\'dır', '`argv[3]` is NULL'), t('`argv[2]` "copy"\'yi gösterir', '`argv[2]` points to "copy"')],
      answers: [0, 1, 2],
      explanation: t('argv[0] = copy, argv[1] = text1.c, argv[2] = text2.c, argv[3] = NULL; "copy" argv[2] değil argv[0]\'dır.', 'argv[0] = copy, argv[1] = text1.c, argv[2] = text2.c, argv[3] = NULL; "copy" is argv[0], not argv[2].') },
    { id: 'command-line-args-p6', topic: 'command-line-args', difficulty: 2, kind: 'fill',
      prompt: t('Boşlukları doldurun.', 'Fill in the blanks.'),
      template: t('Bir dizgiyi `int`\'e çevirmek için {0} fonksiyonu kullanılır; bu fonksiyon {1} başlık dosyasındadır.', 'To convert a string to an `int` use the function {0}, which is declared in the header {1}.'),
      blanks: [['atoi', 'atoi()'], ['<stdlib.h>', 'stdlib.h', 'stdlib']],
      explanation: t('`atoi` ve `exit` `<stdlib.h>` içindedir.', '`atoi` and `exit` are in `<stdlib.h>`.') },
    { id: 'command-line-args-p7', topic: 'command-line-args', difficulty: 2, kind: 'order',
      prompt: t('`argc != 3` denetimi yapan bir programın doğru akışını sıralayın.', 'Order the correct flow of a program that checks `argc != 3`.'),
      items: [t('`argc != 3` mi diye denetle', 'Check whether `argc != 3`'), t('Doğruysa `argv[0]` ile kullanım mesajı yazdır', 'If so, print the usage message using `argv[0]`'), t('Hata koduyla çık (`return 1`)', 'Exit with an error code (`return 1`)'), t('Aksi halde `atoi(argv[1])`, `atoi(argv[2])` ile sayıları oku', 'Otherwise read the numbers with `atoi(argv[1])`, `atoi(argv[2])`')],
      explanation: t('Önce denetim; geçersiz argv elemanlarına erişmeden önce çıkılmalıdır.', 'Check first; exit before touching invalid argv elements.') },
    { id: 'command-line-args-p8', topic: 'command-line-args', difficulty: 3, kind: 'short',
      prompt: t('`% benimprog bu bir testtir` komutuyla `for ( ; *argv ; ++argv ) printf("%s\\n", *argv);` döngüsü kaç satır yazdırır? (Sayıyı yazın.)', 'With `% benimprog bu bir testtir`, how many lines does `for ( ; *argv ; ++argv ) printf("%s\\n", *argv);` print? (Type the number.)'),
      accept: ['4', 'dört', 'dort', 'four'],
      explanation: t('Program adı dahil 4 kelime var (benimprog, bu, bir, testtir); döngü NULL\'a gelene kadar 4 kez döner.', 'There are 4 words including the program name; the loop runs 4 times until it reaches NULL.') },
  ],
};
