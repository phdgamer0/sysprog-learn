import type { Lesson, LText } from '../types';

const t = (tr: string, en: string): LText => ({ tr, en });

export const intro_sysprog: Lesson = {
  id: 'intro-sysprog',
  module: 'm1',
  order: 1,
  title: t('Sistem Programlamaya Giriş', 'Introduction to System Programming'),
  blurb: t(
    'Sistem programlamanın alanları, dersin amaçları ve UNIX/C ile çalışma yöntemi.',
    'The fields of system programming, the aims of the course, and how we will work with UNIX and C.',
  ),
  minutes: 12,
  sources: ['sys-prog-1.pdf s.1'],
  objectives: [
    t('Sistem programlamanın neyle ilgilendiğini bir cümleyle tanımlayabilmek.', 'Define in one sentence what system programming is about.'),
    t('Sistem programlama alanlarını (işletim sistemi, derleyici, sürücü vb.) sıralayabilmek.', 'List the fields of system programming (operating systems, compilers, drivers, ...).'),
    t('Bu dersin hedeflediği dört konuyu (C, ağ, IPC, istemci-sunucu) ayırt edebilmek.', 'Tell apart the four topics this course targets (C, networking, IPC, client-server).'),
    t('Sistem programı ile uygulama programı arasındaki farkı açıklayabilmek.', 'Explain the difference between a system program and an application program.'),
  ],
  prerequisites: [],
  sections: [
    {
      id: 'what',
      title: t('Sistem programlama nedir?', 'What is system programming?'),
      blocks: [
        { type: 'p', text: t(
          'Sistem programlama, bilgisayar mühendisliğinin karmaşık sistemleri ve bu sistemlerin parçalarını programlamakla ilgilenen alanıdır. "Sistem" burada günlük uygulamaların (bir oyun, bir tablo programı) çalıştığı **zemini** kuran yazılımlar anlamına gelir: işletim sistemi, derleyici, aygıt sürücüleri gibi.',
          'System programming is the branch of computer engineering that programs complex systems and the parts they are made of. Here "system" means the software that builds the **ground** on which everyday applications (a game, a spreadsheet) run: the operating system, the compiler, device drivers and so on.') },
        { type: 'p', text: t(
          'Uygulama programcısı "kullanıcıya ne sunacağım?" diye sorar. Sistem programcısı ise "bu program donanıma, diske, ağa ve diğer programlara nasıl güvenli ve verimli biçimde erişsin?" sorusuyla uğraşır. Bu yüzden sistem programları genellikle C gibi donanıma yakın bir dille yazılır ve hataya çok daha az toleransları vardır.',
          'An application programmer asks "what do I offer the user?". A system programmer asks "how can this program reach hardware, disk, network and other programs safely and efficiently?". That is why system software is usually written in a language close to the hardware such as C, and has much less tolerance for mistakes.') },
        { type: 'diagram', id: 'sysprog-map', caption: t('Sistem programlama alanları. Yıldızlı (*) olanlar bu dersin konusudur.', 'Fields of system programming. The starred (*) ones are the topics of this course.') },
      ],
    },
    {
      id: 'fields',
      title: t('Alanlar haritası', 'The map of fields'),
      blocks: [
        { type: 'table',
          head: [t('Alan', 'Field'), t('Neyi programlar?', 'What it programs')],
          rows: [
            [t('İşletim sistemleri', 'Operating systems'), t('Çekirdek: işlem, bellek ve dosya yönetimi', 'The kernel: process, memory and file management')],
            [t('Derleyiciler (compilers)', 'Compilers'), t('Kaynak kodu makine koduna çeviren programlar', 'Programs that translate source code to machine code')],
            [t('Çeviriciler (assemblers)', 'Assemblers'), t('Assembly dilini makine koduna çevirir', 'Translate assembly language to machine code')],
            [t('G/Ç sürücüleri', 'I/O drivers'), t('Disk, ağ kartı, klavye gibi cihazların yazılımı', 'Software for devices such as disks, network cards, keyboards')],
            [t('Uygulama arayüzü', 'Application interface'), t('Uygulamalar ile işletim sistemi arasındaki katman (sistem çağrıları)', 'The layer between applications and the OS (system calls)')],
            [t('Karmaşık paket programlar', 'Large application packages'), t('Kelime işlemci, benzetim, istatistik paketleri', 'Word processors, simulation and statistics packages')],
          ] },
        { type: 'p', text: t('Bu dersin hedefi alanların hepsini işlemek değil; aşağıdaki dört başlığa odaklanmaktır:', 'The course does not try to cover every field; it focuses on four topics:') },
        { type: 'list', items: [
          t('**C dili** - tüm örnekler ve ödevler C ile yazılır.', '**The C language** - all examples and assignments are in C.'),
          t('**Ağ programlama (network programming)** - bilgisayarlar arası iletişim.', '**Network programming** - communication between computers.'),
          t('**İşlemler arası iletişim (IPC, inter-process communication)** - aynı makinedeki programların konuşması.', '**Inter-process communication (IPC)** - programs on one machine talking to each other.'),
          t('**İstemci-sunucu (client-server) programlama** - bir hizmeti sunan ve isteyen program çifti.', '**Client-server programming** - a pair of programs, one offering and one requesting a service.'),
        ] },
        { type: 'callout', variant: 'note', title: t('Neden C?', 'Why C?'), text: t(
          'UNIX çekirdeğinin kendisi C ile yazılmıştır. Sistem çağrıları da C fonksiyonları gibi çağrılır. Dolayısıyla UNIX\'i anlamanın en doğrudan yolu C\'de program yazmaktır.',
          'The UNIX kernel itself is written in C, and system calls are invoked like C functions. So the most direct way of understanding UNIX is to write programs in C.') },
      ],
    },
    {
      id: 'method',
      title: t('Derste nasıl çalışacağız?', 'How we will work'),
      blocks: [
        { type: 'p', text: t(
          'Konular bir merdiven gibi ilerler: önce UNIX\'in ne olduğu ve nasıl yapılandığı, sonra bir C programının nasıl derlenip komut satırı argümanlarıyla çalıştırıldığı, ardından sistem çağrıları ve işlem (process) yönetimi (`fork`, `wait`, `exec`) gelir. Her yeni konu bir öncekinin üzerine kurulur; bu yüzden dersleri sırayla izlemeniz önerilir.',
          'Topics climb like a staircase: first what UNIX is and how it is structured, then how a C program is compiled and run with command-line arguments, then system calls and process management (`fork`, `wait`, `exec`). Each topic builds on the previous one, so follow the lessons in order.') },
        { type: 'callout', variant: 'tip', text: t(
          'Bir UNIX/Linux terminali açıp her örneği kendiniz yazın. Okumak ile çalıştırmak arasındaki fark, sistem programlamada çok büyüktür.',
          'Open a UNIX/Linux terminal and type every example yourself. In system programming the gap between reading and running code is huge.') },
      ],
    },
  ],
  misconceptions: [
    { wrong: t('Sistem programlama, "sistem yöneticiliği" (kurulum, kullanıcı ekleme) demektir.', 'System programming means "system administration" (installing software, adding users).'),
      right: t('Sistem programlama program **yazmaktır**: çekirdek, derleyici, sürücü, sistem çağrılarını kullanan programlar. Yöneticilik ayrı bir iştir.', 'System programming is about **writing** programs: kernels, compilers, drivers, programs using system calls. Administration is a different job.') },
    { wrong: t('Bu ders işletim sistemi dersinin tekrarıdır.', 'This course is a repeat of the operating systems course.'),
      right: t('İşletim sistemi dersi çekirdeğin *içini* anlatır; burada çekirdeğin sunduğu hizmetleri *kullanan* programlar yazarız.', 'An OS course explains the *inside* of the kernel; here we write programs that *use* the services the kernel offers.') },
    { wrong: t('C yalnızca eski bir dildir, sistem programlamada önemi kalmamıştır.', 'C is just an old language and no longer matters for system programming.'),
      right: t('İşletim sistemleri, sürücüler ve sistem çağrısı arayüzleri bugün de büyük oranda C ile yazılır/tanımlanır.', 'Operating systems, drivers and system-call interfaces are still largely written or specified in C.') },
  ],
  summary: [
    t('Sistem programlama, karmaşık sistemlerin ve parçalarının (OS, derleyici, sürücü...) programlanmasıdır.', 'System programming is the programming of complex systems and their parts (OS, compilers, drivers, ...).'),
    t('Uygulama programlarının altındaki zemini kurar; donanıma ve kaynaklara güvenli erişim sağlar.', 'It builds the ground under application programs and gives safe access to hardware and resources.'),
    t('Dersin dört odağı: C dili, ağ programlama, IPC, istemci-sunucu.', 'The four focuses of this course: C, network programming, IPC, client-server.'),
    t('Dersin dili C, hedef sistem UNIX\'tir.', 'The language is C and the target system is UNIX.'),
  ],
  practice: [
    { id: 'intro-sysprog-p1', topic: 'intro-sysprog', difficulty: 1, kind: 'mcq',
      prompt: t('Aşağıdakilerden hangisi bu dersin doğrudan hedeflerinden **biri değildir**?', 'Which of the following is **not** a direct aim of this course?'),
      options: [t('Ağ programlama', 'Network programming'), t('İşlemler arası iletişim', 'Inter-process communication'), t('Derleyici yazımı (compiler construction)', 'Compiler construction'), t('İstemci-sunucu programlama', 'Client-server programming')],
      answer: 2,
      optionNotes: [
        t('Dersin hedeflerinden biridir.', 'It is one of the aims.'),
        t('Dersin hedeflerinden biridir.', 'It is one of the aims.'),
        t('Derleyici yazımı sistem programlamanın bir alanıdır ama bu dersin yıldızlı hedefleri arasında değildir.', 'Compiler construction is a field of system programming but not among the starred aims of this course.'),
        t('Dersin hedeflerinden biridir.', 'It is one of the aims.'),
      ],
      explanation: t('Dersin hedefleri: C dili, ağ programlama, IPC ve istemci-sunucu. Derleyici yazımı haritada yer alır ama hedef değildir.', 'The aims are C, network programming, IPC and client-server. Compiler construction is on the map but is not an aim.') },
    { id: 'intro-sysprog-p2', topic: 'intro-sysprog', difficulty: 1, kind: 'tf', answer: true,
      prompt: t('Doğru mu yanlış mı: Aygıt sürücülerinin programlanması da sistem programlamanın bir alanıdır.', 'True or false: Programming device drivers is also a field of system programming.'),
      explanation: t('Evet; G/Ç sürücüleri haritadaki alanlardan biridir.', 'Yes; I/O drivers are one of the fields on the map.') },
    { id: 'intro-sysprog-p3', topic: 'intro-sysprog', difficulty: 1, kind: 'multi',
      prompt: t('Hangileri sistem programlama alanıdır? (Birden fazla seçin.)', 'Which are fields of system programming? (Select all that apply.)'),
      options: [t('İşletim sistemi programlama', 'Operating system programming'), t('Derleyici programlama', 'Compiler programming'), t('Web sitesi renk teması seçmek', 'Choosing colour themes for a website'), t('Assembler programlama', 'Assembler programming')],
      answers: [0, 1, 3],
      explanation: t('OS, derleyici ve assembler haritada yer alır; renk teması seçmek sistem programlama değildir.', 'OS, compilers and assemblers are on the map; choosing colour themes is not system programming.') },
    { id: 'intro-sysprog-p4', topic: 'intro-sysprog', difficulty: 1, kind: 'fill',
      prompt: t('Boşlukları doldurun.', 'Fill in the blanks.'),
      template: t('Bu derste kullanılan programlama dili {0}, hedef işletim sistemi {1}.', 'In this course the programming language is {0} and the target operating system is {1}.'),
      blanks: [['C', 'c'], ['UNIX', 'unix', 'Unix']],
      explanation: t('Ders C dili ve UNIX üzerine kuruludur.', 'The course is built on the C language and UNIX.') },
    { id: 'intro-sysprog-p5', topic: 'intro-sysprog', difficulty: 2, kind: 'match',
      prompt: t('Alanı, programladığı şeyle eşleştirin.', 'Match each field with what it programs.'),
      left: [t('Derleyici', 'Compiler'), t('Assembler', 'Assembler'), t('G/Ç sürücüsü', 'I/O driver'), t('İstatistik paketi', 'Statistics package')],
      right: [t('Kaynak kodu makine koduna çevirir', 'Translates source code to machine code'), t('Assembly dilini makine koduna çevirir', 'Translates assembly to machine code'), t('Bir cihazı çekirdeğe tanıtır', 'Makes a device usable by the kernel'), t('Karmaşık uygulama paketi', 'Large application package')],
      pairs: [0, 1, 2, 3],
      explanation: t('Her alanın kendine özgü bir görevi vardır.', 'Each field has its own job.') },
    { id: 'intro-sysprog-p6', topic: 'intro-sysprog', difficulty: 2, kind: 'short',
      prompt: t('"IPC" kısaltmasının İngilizce açılımı nedir?', 'What does the abbreviation "IPC" stand for?'),
      accept: ['inter process communication', 'inter-process communication', 'interprocess communication'],
      explanation: t('IPC = Inter-Process Communication (işlemler arası iletişim).', 'IPC = Inter-Process Communication.') },
  ],
};

export const unix_history: Lesson = {
  id: 'unix-history',
  module: 'm1',
  order: 2,
  title: t('UNIX Tarihi ve Standartlar', 'UNIX History and Standards'),
  blurb: t(
    'UNIX\'in 1969\'dan Linux\'a uzanan tarihi ve farklı sürümlerin System V Release 4\'te birleşmesi.',
    'UNIX history from 1969 to Linux, and how different versions merged into System V Release 4.',
  ),
  minutes: 14,
  sources: ['sys-prog-1.pdf s.2-3'],
  objectives: [
    t('UNIX\'in önemli tarihlerini (1969, 1978, 1980, 1983, 1987, 1989, 1990, 1991) sıralayabilmek.', 'Order the key UNIX dates (1969, 1978, 1980, 1983, 1987, 1989, 1990, 1991).'),
    t('AT&T (System V) ve Berkeley (BSD) kollarını ayırt edebilmek.', 'Tell the AT&T (System V) and Berkeley (BSD) branches apart.'),
    t('SVR4\'te hangi özelliğin hangi kaynaktan geldiğini söyleyebilmek.', 'Say which source each SVR4 feature came from.'),
    t('POSIX, XPG3 ve ANSI C gibi standartların neden gerekli olduğunu açıklayabilmek.', 'Explain why standards such as POSIX, XPG3 and ANSI C are needed.'),
  ],
  prerequisites: ['intro-sysprog'],
  sections: [
    {
      id: 'timeline',
      title: t('Zaman çizelgesi', 'The timeline'),
      blocks: [
        { type: 'p', text: t(
          'UNIX 1969\'da Bell Labs araştırma biriminde Ken Thompson tarafından, çok basit bir PDP-11 bilgisayarı üzerinde yazılan ilk sürümle başladı. Ardından iki ana kol gelişti: AT&T\'nin kendi sürümleri (7. sürüm, System V) ve Berkeley Üniversitesi\'nin BSD (Berkeley Software Distribution) sürümleri.',
          'UNIX began in 1969 at Bell Labs research, when Ken Thompson wrote the first version on a very simple PDP-11 computer. Two main branches then grew: AT&T\'s own versions (7th edition, System V) and the University of California, Berkeley\'s BSD (Berkeley Software Distribution) versions.') },
        { type: 'diagram', id: 'unix-timeline', caption: t('Sol sütun AT&T kolu, sağ sütun BSD kolu ve sonrası.', 'Left column: the AT&T branch; right column: the BSD branch and what followed.') },
        { type: 'table',
          head: [t('Yıl', 'Year'), t('Olay', 'Event')],
          rows: [
            [t('1969', '1969'), t('Birinci sürüm - Bell Labs, Ken Thompson, PDP-11', 'First version - Bell Labs, Ken Thompson, PDP-11')],
            [t('1978', '1978'), t('Yedinci sürüm (7th edition)', 'Seventh edition')],
            [t('1980', '1980'), t('BSD 4.1 (Berkeley)', 'BSD 4.1 (Berkeley)')],
            [t('1983', '1983'), t('AT&T System V', 'AT&T System V')],
            [t('1987', '1987'), t('BSD 4.3', 'BSD 4.3')],
            [t('1989', '1989'), t('System V Release 4 ("standart" UNIX)', 'System V Release 4 (the "standard" UNIX)')],
            [t('1990', '1990'), t('MINIX', 'MINIX')],
            [t('1991', '1991'), t('Linux', 'Linux')],
          ] },
        { type: 'callout', variant: 'tip', title: t('Aklınızda tutmak için', 'Memory aid'), text: t(
          'Önce kronolojiyi, sonra kolları öğrenin: 69 → 78 → 80 → 83 → 87 → 89 → 90 → 91. AT&T kolu: 1969, 1978, 1983, 1989. Berkeley kolu: 1980, 1987. MINIX ve Linux ise ayrı, bağımsız yazılmış UNIX benzeri sistemlerdir.',
          'Learn the chronology first, then the branches: 69 → 78 → 80 → 83 → 87 → 89 → 90 → 91. AT&T branch: 1969, 1978, 1983, 1989. Berkeley branch: 1980, 1987. MINIX and Linux are separately written UNIX-like systems.') },
        { type: 'callout', variant: 'source', title: t('Notlarla ilgili not', 'About the slides'), text: t(
          'Slayt MINIX ve Linux\'u zaman çizelgesine aynı sütunda koyar; bunlar AT&T veya BSD kodundan türemiş değil, UNIX\'ten esinlenip sıfırdan yazılmış UNIX benzeri sistemlerdir. Slayttaki yıllar sürümlerin yaklaşık duyuru tarihleridir.',
          'The slide puts MINIX and Linux in the same column of the timeline; they are not derived from AT&T or BSD code but are UNIX-like systems written from scratch, inspired by UNIX. The years on the slide are approximate release dates.') },
      ],
    },
    {
      id: 'why-merge',
      title: t('Neden birleşme gerekti?', 'Why did the versions have to merge?'),
      blocks: [
        { type: 'p', text: t(
          'Farklı üreticiler (AT&T, Berkeley, Sun, Microsoft/XENIX) UNIX\'i kendi yönlerinde geliştirdi. Sonuç: bir sistemde yazılan program başka bir "UNIX"te derlenmiyor ya da farklı çalışıyordu. Çözüm iki yönlüydü: (1) iyi özellikleri tek sürümde toplamak (System V Release 4) ve (2) arayüzleri yazılı **standartlara** bağlamak.',
          'Different vendors (AT&T, Berkeley, Sun, Microsoft/XENIX) pushed UNIX in their own directions. The result: a program written for one "UNIX" would not compile or would behave differently on another. The solution had two sides: (1) collect the good features in one release (System V Release 4) and (2) tie the interfaces to written **standards**.') },
        { type: 'diagram', id: 'unix-merge', caption: t('Sürümler (solda) ve standartlar (sağda) SVR4\'te birleşir.', 'Versions (left) and standards (right) merge into SVR4.') },
        { type: 'definitions', items: [
          { term: t('POSIX 1003.1', 'POSIX 1003.1'), text: t('Sistem çağrıları ve temel kütüphane arayüzünü tanımlayan IEEE standardı.', 'The IEEE standard that defines the system-call and basic library interface.') },
          { term: t('X/Open XPG3', 'X/Open XPG3'), text: t('X/Open konsorsiyumunun taşınabilirlik kılavuzu (X/Open Portability Guide, 3. sürüm).', 'The X/Open consortium\'s portability guide (X/Open Portability Guide, issue 3).') },
          { term: t('ANSI X3J11 C', 'ANSI X3J11 C'), text: t('C dilinin ANSI standardını hazırlayan komite; yani C dilinin kendisinin standardı.', 'The committee that produced the ANSI standard for the C language itself.') },
        ] },
      ],
    },
    {
      id: 'svr4-features',
      title: t('SVR4\'ün özellikleri nereden geldi?', 'Where did SVR4\'s features come from?'),
      blocks: [
        { type: 'p', text: t('System V Release 4, her kaynaktan en iyi parçayı alır. Slayttaki tabloyu şöyle okuyabilirsiniz:', 'System V Release 4 takes the best piece from each source. The slide\'s table reads as follows:') },
        { type: 'table',
          head: [t('Kaynak', 'Source'), t('Getirdiği özellikler', 'Features contributed')],
          rows: [
            [t('System V Release 3', 'System V Release 3'), t('RFS (Remote File Sharing), TLI (Transport Layer Interface), STREAMS, IPC', 'RFS (Remote File Sharing), TLI (Transport Layer Interface), STREAMS, IPC')],
            [t('4.3 BSD', '4.3 BSD'), t('TCP/IP protokolleri, soketler (sockets), Hızlı Dosya Sistemi (FFS)', 'TCP/IP protocols, sockets, Fast File System (FFS)')],
            [t('SunOS', 'SunOS'), t('Ağ Dosya Sistemi (NFS), uzaktan yordam çağırma (RPC), bellek eşlemeli dosyalar', 'Network File System (NFS), remote procedure calls (RPC), memory-mapped files')],
            [t('XENIX', 'XENIX'), t('80386 ikili uyumluluğu (binary compatibility)', '80386 binary compatibility')],
            [t('Yeni', 'New'), t('Sanal Dosya Sistemi (VFS), gerçek zaman (real time)', 'Virtual File System (VFS), real time')],
          ] },
        { type: 'p', text: t(
          'Bu dersin konusuyla ilişkisi: IPC ve soketler, ileriki derslerde göreceğimiz işlemler arası iletişim ve ağ programlamanın temelidir.',
          'Relevance to this course: IPC and sockets are the foundation of inter-process communication and network programming covered later.') },
        { type: 'callout', variant: 'source', title: t('Notlarla ilgili not', 'About the slides'), text: t(
          'Tablo, özelliklerin yaygın biçimde hangi sürümle anılan kaynaktan geldiğini gösteren bir özettir. Gerçekte bazı fikirlerin kökeni daha karmaşıktır (ör. Hızlı Dosya Sistemi 4.2BSD\'de doğmuştur, 4.3BSD ile anılır). Sınavda slayttaki eşleşmeyi bilmeniz yeterlidir.',
          'The table is a simplified summary of which commonly named source each feature came from. In reality some origins are more tangled (e.g. the Fast File System was born in 4.2BSD and is associated with 4.3BSD). For the exam, knowing the slide\'s mapping is enough.') },
      ],
    },
  ],
  misconceptions: [
    { wrong: t('Linux, UNIX\'in 1991\'de çıkan bir BSD sürümüdür.', 'Linux is a BSD release of UNIX from 1991.'),
      right: t('Linux çekirdeği sıfırdan yazılmış UNIX benzeri bir sistemdir; AT&T veya BSD kodundan türemez.', 'The Linux kernel is a UNIX-like system written from scratch; it does not derive from AT&T or BSD code.') },
    { wrong: t('BSD, AT&T\'nin ürünüdür.', 'BSD is a product of AT&T.'),
      right: t('BSD, Berkeley\'deki California Üniversitesi\'nin dağıtımıdır; System V ise AT&T\'nindir.', 'BSD is a distribution of the University of California at Berkeley; System V belongs to AT&T.') },
    { wrong: t('Standartlar (POSIX vb.) bir UNIX sürümünün adıdır.', 'Standards such as POSIX are names of UNIX versions.'),
      right: t('Standartlar arayüz belirtimleridir; birçok sistem aynı standarda uyabilir.', 'Standards are interface specifications; many systems can conform to the same standard.') },
    { wrong: t('Sockets ve TCP/IP System V\'in özelliğidir.', 'Sockets and TCP/IP are System V features.'),
      right: t('Slayta göre TCP/IP ve soketler 4.3BSD\'den gelir; STREAMS/TLI System V\'den.', 'According to the slide, TCP/IP and sockets come from 4.3BSD; STREAMS/TLI come from System V.') },
  ],
  summary: [
    t('UNIX 1969\'da Bell Labs\'te Ken Thompson tarafından PDP-11 üzerinde başladı.', 'UNIX started in 1969 at Bell Labs with Ken Thompson on a PDP-11.'),
    t('İki ana kol: AT&T (7. sürüm 1978, System V 1983, SVR4 1989) ve Berkeley BSD (4.1 1980, 4.3 1987).', 'Two main branches: AT&T (7th ed. 1978, System V 1983, SVR4 1989) and Berkeley BSD (4.1 1980, 4.3 1987).'),
    t('MINIX (1990) ve Linux (1991) UNIX benzeri, bağımsız yazılmış sistemlerdir.', 'MINIX (1990) and Linux (1991) are independently written UNIX-like systems.'),
    t('SVR4; System V, SunOS, 4.3BSD ve XENIX\'i birleştirir ve POSIX 1003.1, XPG3, ANSI C standartlarına uyar.', 'SVR4 merges System V, SunOS, 4.3BSD and XENIX and conforms to POSIX 1003.1, XPG3 and ANSI C.'),
    t('Standartlar, programların farklı UNIX sistemleri arasında taşınabilir olmasını sağlar.', 'Standards make programs portable between different UNIX systems.'),
  ],
  practice: [
    { id: 'unix-history-p1', topic: 'unix-history', difficulty: 1, kind: 'order',
      prompt: t('Olayları eskiden yeniye doğru sıralayın.', 'Order the events from oldest to newest.'),
      items: [t('UNIX birinci sürüm (Bell Labs)', 'UNIX first version (Bell Labs)'), t('BSD 4.1', 'BSD 4.1'), t('System V (AT&T)', 'System V (AT&T)'), t('BSD 4.3', 'BSD 4.3'), t('System V Release 4', 'System V Release 4'), t('Linux', 'Linux')],
      explanation: t('1969, 1980, 1983, 1987, 1989, 1991.', '1969, 1980, 1983, 1987, 1989, 1991.') },
    { id: 'unix-history-p2', topic: 'unix-history', difficulty: 1, kind: 'mcq',
      prompt: t('UNIX\'in ilk sürümünü kim, hangi bilgisayarda yazdı?', 'Who wrote the first version of UNIX, and on which computer?'),
      options: [t('Dennis Ritchie, IBM 360', 'Dennis Ritchie, IBM 360'), t('Ken Thompson, PDP-11', 'Ken Thompson, PDP-11'), t('Linus Torvalds, 80386', 'Linus Torvalds, 80386'), t('Bill Joy, VAX', 'Bill Joy, VAX')],
      answer: 1,
      optionNotes: [
        t('Ritchie C dilinin yaratıcısıdır; ilk sürüm IBM 360\'ta değildir.', 'Ritchie created C; the first version was not on an IBM 360.'),
        t('Doğru: Bell Labs, 1969, PDP-11.', 'Correct: Bell Labs, 1969, PDP-11.'),
        t('Torvalds Linux\'un (1991) yazarıdır.', 'Torvalds wrote Linux (1991).'),
        t('Bill Joy Berkeley kolunda çalışmıştır, ilk sürümde değil.', 'Bill Joy worked in the Berkeley branch, not on the first version.'),
      ],
      explanation: t('Slayta göre Bell Labs Research\'te Ken Thompson, çok basit bir PDP-11 üzerinde, 1969.', 'According to the slide: Ken Thompson at Bell Labs Research, on a very simple PDP-11, in 1969.') },
    { id: 'unix-history-p3', topic: 'unix-history', difficulty: 2, kind: 'match',
      prompt: t('Özelliği, SVR4\'e geldiği kaynakla eşleştirin.', 'Match each feature with the source it came to SVR4 from.'),
      left: [t('STREAMS', 'STREAMS'), t('Soketler (sockets)', 'Sockets'), t('NFS', 'NFS'), t('80386 ikili uyumluluğu', '80386 binary compatibility'), t('Sanal Dosya Sistemi (VFS)', 'Virtual File System (VFS)')],
      right: [t('System V R3', 'System V R3'), t('4.3 BSD', '4.3 BSD'), t('SunOS', 'SunOS'), t('XENIX', 'XENIX'), t('Yeni özellik', 'New feature')],
      pairs: [0, 1, 2, 3, 4],
      explanation: t('Slayttaki tabloya göre.', 'According to the slide\'s table.') },
    { id: 'unix-history-p4', topic: 'unix-history', difficulty: 2, kind: 'multi',
      prompt: t('Hangileri SVR4\'ün birleştirdiği **standartlardır**?', 'Which are **standards** that SVR4 conforms to?'),
      options: [t('POSIX 1003.1', 'POSIX 1003.1'), t('X/Open XPG3', 'X/Open XPG3'), t('ANSI X3J11 C', 'ANSI X3J11 C'), t('XENIX', 'XENIX'), t('SunOS', 'SunOS')],
      answers: [0, 1, 2],
      explanation: t('XENIX ve SunOS standart değil, *sürümdür* (versiyon).', 'XENIX and SunOS are *versions*, not standards.') },
    { id: 'unix-history-p5', topic: 'unix-history', difficulty: 1, kind: 'tf', answer: false,
      prompt: t('Doğru mu yanlış mı: BSD, AT&T tarafından geliştirilen bir sürümdür.', 'True or false: BSD is a release developed by AT&T.'),
      explanation: t('BSD = Berkeley Software Distribution; Berkeley\'de geliştirildi. AT&T\'nin kolu System V\'tir.', 'BSD = Berkeley Software Distribution, developed at Berkeley. AT&T\'s branch is System V.') },
    { id: 'unix-history-p6', topic: 'unix-history', difficulty: 1, kind: 'numeric', answer: 1991,
      prompt: t('Linux hangi yıl çıkmıştır? (slayta göre)', 'In which year did Linux appear? (according to the slide)'),
      explanation: t('Slayt: MINIX 1990, LINUX 1991.', 'The slide: MINIX 1990, LINUX 1991.') },
  ],
};

export const unix_architecture: Lesson = {
  id: 'unix-architecture',
  module: 'm1',
  order: 3,
  title: t('UNIX Mimarisi, İşlemler ve Temel Komutlar', 'UNIX Architecture, Processes and Basic Commands'),
  blurb: t(
    'UNIX\'in katmanları, çekirdek servisleri, program ve proses farkı, çokgörevlilik, çokkullanıcılılık ve temel komutlar.',
    'UNIX layers, kernel services, program vs process, multitasking, multiuser operation and basic commands.',
  ),
  minutes: 22,
  sources: ['sys-prog-1.pdf s.4-9'],
  objectives: [
    t('UNIX katmanlarını (kullanıcı seviyesi, sistem çağrısı arayüzü, çekirdek, donanım) sıralayıp her birinin görevini söyleyebilmek.', 'List the UNIX layers (user level, system call interface, kernel, hardware) and state each one\'s job.'),
    t('Çekirdeğin temel servislerini sayabilmek.', 'Name the basic services of the kernel.'),
    t('Program ile prosesi ayırt edebilmek.', 'Distinguish a program from a process.'),
    t('Çokgörevlilik ve görev değiştirmeyi (task switching) açıklayabilmek.', 'Explain multitasking and task switching.'),
    t('Temel komutları (ls, cd, rm, mkdir, rmdir, more) kullanabilmek.', 'Use the basic commands (ls, cd, rm, mkdir, rmdir, more).'),
  ],
  prerequisites: ['unix-history'],
  sections: [
    {
      id: 'layers',
      title: t('UNIX\'in katmanları', 'The layers of UNIX'),
      blocks: [
        { type: 'p', text: t(
          'UNIX, her biri yalnızca altındaki katmanla konuşan katmanlardan oluşur. Üstten alta: kullanıcı programları ve kabuk (shell) → sistem çağrısı arayüzü → çekirdek (kernel) → donanım. Bu düzenin amacı, kullanıcı programlarının donanıma doğrudan dokunmasını engelleyip her erişimi çekirdeğin denetiminden geçirmektir.',
          'UNIX is made of layers, each one talking only to the layer below it. From top to bottom: user programs and the shell → system call interface → kernel → hardware. The point of this arrangement is to stop user programs from touching hardware directly and to route every access through the kernel.') },
        { type: 'diagram', id: 'unix-layers', caption: t('UNIX\'in temel modülleri.', 'The basic modules of UNIX.') },
        { type: 'interactive', id: 'unix-explorer', caption: t('Bir katmana tıklayın; ne yaptığını ve örneklerini görün.', 'Click a layer to see what it does and examples.') },
        { type: 'table',
          head: [t('Katman', 'Layer'), t('İçeriği', 'Contents')],
          rows: [
            [t('Kullanıcı seviyesi', 'User level'), t('Kullanıcı programları, OS komutları (ls, cp...), kütüphaneler, kabuk (shell)', 'User programs, OS commands (ls, cp, ...), libraries, the shell')],
            [t('Sistem çağrısı arayüzü', 'System call interface'), t('Kullanıcı programının çekirdekten hizmet isteme kapısı', 'The gate through which a user program asks the kernel for service')],
            [t('Çekirdek seviyesi', 'Kernel level'), t('Dosya alt sistemi, işlem yönetimi, bellek yönetimi, karakter/blok G/Ç, cihaz sürücüleri', 'File subsystem, process management, memory management, character/block I/O, device drivers')],
            [t('Donanım kontrolü / donanım', 'Hardware control / hardware'), t('Çekirdeğin donanımla konuştuğu en alt katman ve donanımın kendisi', 'The lowest layer where the kernel talks to hardware, and the hardware itself')],
          ] },
        { type: 'callout', variant: 'important', text: t(
          'Kabuk (shell) çekirdeğin bir parçası **değildir**; kullanıcı seviyesinde çalışan sıradan bir programdır. Komutları okur ve sizin için sistem çağrıları yapar.',
          'The shell is **not** part of the kernel; it is an ordinary program running at user level. It reads commands and makes system calls on your behalf.') },
      ],
    },
    {
      id: 'kernel',
      title: t('Çekirdek ve servisleri', 'The kernel and its services'),
      blocks: [
        { type: 'p', text: t(
          'Çekirdek, tüm kullanıcı proseslerinin ve sistem proseslerinin altındaki ortak yazılımdır. Proseslerin hepsi sistem çağrısı arayüzünden çekirdeğe başvurur; çekirdek de cihazlarla (ağ kartı, modem, disk) konuşur.',
          'The kernel is the common software underneath all user processes and system processes. They all call into the kernel through the system call interface, and the kernel in turn talks to devices (network card, modem, disk).') },
        { type: 'diagram', id: 'kernel-services', caption: t('Kullanıcı prosesleri (K) ve sistem prosesleri (S) çekirdek üzerinden cihazlara erişir.', 'User processes (K) and system processes (S) reach devices through the kernel.') },
        { type: 'p', text: t('Çekirdeğin sunduğu temel servisler:', 'The basic services the kernel provides:') },
        { type: 'list', items: [
          t('Sistem başlatma (system initialization)', 'System initialization'),
          t('Proses yönetimi - proses yaratma, çalıştırma, sonlandırma', 'Process management - creating, running and ending processes'),
          t('Bellek yönetimi', 'Memory management'),
          t('Dosya sistemi yönetimi', 'File system management'),
          t('Giriş/çıkış yönetimi', 'Input/output management'),
          t('İletişim fasiliteleri (ağ, IPC)', 'Communication facilities (network, IPC)'),
          t('Program arayüzü - sistem çağrıları', 'Program interface - system calls'),
        ] },
        { type: 'callout', variant: 'note', text: t(
          'Bu dersin geri kalanı, listenin son maddesinin (sistem çağrıları) nasıl kullanıldığını, özellikle de **proses yönetimi** servisini (`fork`, `wait`, `exec`) ele alır.',
          'The rest of the course is about using the last item (system calls), particularly the **process management** service (`fork`, `wait`, `exec`).') },
      ],
    },
    {
      id: 'process',
      title: t('Program, proses ve çokgörevlilik', 'Program, process and multitasking'),
      blocks: [
        { type: 'p', text: t(
          'UNIX; sanal belleği, programlanabilir kabuğu ve ağ kapasitesi olan çokgörevli (multitasking), çokkullanıcılı (multiuser) bir işletim sistemidir.',
          'UNIX is a multitasking, multiuser operating system with virtual memory, a programmable shell and network capability.') },
        { type: 'definitions', items: [
          { term: t('Program', 'Program'), text: t('Diskte duran çalıştırılabilir dosya. Pasiftir; bir şey yapmaz.', 'An executable file sitting on disk. It is passive; it does nothing by itself.') },
          { term: t('Proses (işlem, süreç, task/iş)', 'Process (also called task / job)'), text: t('Çalıştırılmakta olan program. Bellekte yer tutar, kendi durumu vardır. Örnek: çalışan bir C programı, e-posta gönderme işi.', 'A program being executed. It occupies memory and has its own state. Examples: a running C program, an e-mail being sent.') },
          { term: t('Çokgörevlilik (multitasking)', 'Multitasking'), text: t('Birden fazla prosesin birlikte yürütülmesi.', 'Running several processes together.') },
        ] },
        { type: 'p', text: t(
          'Aynı program dosyasını iki kez çalıştırırsanız ortada **bir program, iki proses** olur: her birinin ayrı belleği ve ayrı ilerleyişi vardır. Bu ayrım, `fork()` konusunu anlamanın temelidir.',
          'If you run the same program file twice you get **one program but two processes**: each has its own memory and its own progress. This distinction is the foundation for understanding `fork()`.') },
        { type: 'p', text: t(
          'Çokgörevlilikte bir anda yalnızca bir proses çalışır (tek işlemcide). İşletim sistemi çok kısa zaman dilimleriyle prosesler arasında hızla geçiş yapar (görev değiştirme, task switching). Bu o kadar hızlıdır ki belirli bir süre sonunda tüm prosesler ilerleme kaydetmiş olur ve hepsi aynı anda çalışıyormuş gibi görünür.',
          'In multitasking only one process runs at any instant (on a single processor). The OS switches rapidly between processes in very short time slices (task switching). This is so fast that after a while every process has made progress and they all appear to run simultaneously.') },
        { type: 'interactive', id: 'timeslice', caption: t('Proses sayısını ve zaman dilimini değiştirin; Gantt şemasında görev değiştirmeyi izleyin.', 'Change the number of processes and the quantum; watch task switching in the Gantt chart.') },
        { type: 'callout', variant: 'source', title: t('Notlarla ilgili not', 'About the slides'), text: t(
          '"Her zaman sadece bir proses çalışır" ifadesi tek işlemcili (tek çekirdekli) sistem modelidir. Çok çekirdekli günümüz makinelerinde aynı anda birden çok proses *gerçekten* paralel çalışabilir; ancak her çekirdekte yine de görev değiştirme vardır. Ders boyunca slayttaki basit model kullanılır.',
          'The statement "only one process runs at a time" is the single-processor model. On today\'s multicore machines several processes can run *truly* in parallel, but each core still does task switching. The course uses the slide\'s simple model throughout.') },
      ],
    },
    {
      id: 'multiuser',
      title: t('Çokkullanıcılılık ve ağ', 'Multiuser operation and networking'),
      blocks: [
        { type: 'p', text: t(
          'Çokkullanıcılı demek, birçok kullanıcının aynı UNIX makinesini aynı anda kullanabilmesi demektir. Tipik düzen: bir UNIX sunucusu yerel ağda (LAN) durur; kullanıcılar kendi PC\'lerinden (UNIX olmayabilir, ör. Windows) bağlanır. Sunucu, bu kullanıcıların başlattığı bir grup birbirinden bağımsız prosesi çalıştırır; her kullanıcı kabuk (shell) aracılığıyla komutlarını verir.',
          'Multiuser means many users can use the same UNIX machine at the same time. The typical setup: a UNIX server sits on a local area network (LAN) and users connect from their own PCs (which need not run UNIX, e.g. Windows). The server runs a group of independent processes started by these users, and each user issues commands through a shell.') },
        { type: 'p', text: t('UNIX\'in ağ kapasitesi şu hizmetleri kapsar:', 'UNIX\'s network capability covers services such as:') },
        { type: 'list', items: [
          t('Elektronik posta (e-mail)', 'Electronic mail (e-mail)'),
          t('Dosya aktarımı (FTP)', 'File transfer (FTP)'),
          t('Dünya çapında ağ (WWW)', 'World Wide Web (WWW)'),
          t('Uzaktan giriş (remote login)', 'Remote login'),
          t('Ping, traceroute ve benzerleri', 'Ping, traceroute and similar tools'),
        ] },
      ],
    },
    {
      id: 'commands',
      title: t('Temel komutlar ve oturum açma', 'Basic commands and logging in'),
      blocks: [
        { type: 'p', text: t(
          'Oturum açarken sistem sizden kimliğinizi (login) ve şifrenizi (password) ister. Ardından kabuk bir istem (prompt) gösterir; slaytlarda `%` ile gösterilir (gerçek sistemde `$` da olabilir). Komutları yazıp sırayla çalıştırır, bitirince çıkış (logout) yaparsınız.',
          'When you log in the system asks for your identity (login) and your password. The shell then shows a prompt, written `%` on the slides (it may be `$` on a real system). You type commands one after another and finish with logout.') },
        { type: 'code', lang: 'shell', title: 'session', code:
`login: ogrenci
password: ********
% ls -l
% mkdir deneme
% cd deneme
% more notlar.txt
% cd ..
% rmdir deneme
% logout`, caption: t('Örnek bir oturum.', 'A sample session.') },
        { type: 'table',
          head: [t('Komut', 'Command'), t('Ne yapar?', 'What it does')],
          rows: [
            [t('`ls` veya `ls -l`', '`ls` or `ls -l`'), t('Geçerli dizini listeler (`-l` ayrıntılı)', 'Lists the current directory (`-l` gives details)')],
            [t('`cd <yol>`', '`cd <path>`'), t('Dizin değiştirir', 'Changes directory')],
            [t('`rm <dosya>`', '`rm <file>`'), t('Dosya siler', 'Deletes a file')],
            [t('`mkdir <dizin>`', '`mkdir <dir>`'), t('Dizin yaratır', 'Creates a directory')],
            [t('`rmdir <dizin>`', '`rmdir <dir>`'), t('(Boş) dizini siler', 'Deletes an (empty) directory')],
            [t('`more <dosya>`', '`more <file>`'), t('Metin dosyasını sayfa sayfa gösterir', 'Shows a text file page by page')],
          ] },
        { type: 'callout', variant: 'warning', title: t('Dikkat: rm geri almaz', 'Careful: rm is permanent'), text: t(
          'UNIX\'te `rm` ile silinen dosya çöp kutusuna gitmez; geri dönüşü yoktur. `rmdir` yalnızca **boş** dizini siler. Ayrıca UNIX komutları büyük/küçük harfe duyarlıdır: `ls` ile `LS` farklıdır.',
          'In UNIX a file removed with `rm` does not go to a recycle bin; there is no undo. `rmdir` only deletes an **empty** directory. Also, UNIX commands are case sensitive: `ls` and `LS` differ.') },
        { type: 'p', text: t(
          'Bu komutların her biri aslında bir **programdır** (`/bin/ls` gibi). Kabuk onu bir proses olarak çalıştırır - ileriki derslerde bunu `fork` ve `exec` ile kendimiz yapacağız. (`cd` istisnadır; kabuğun içinde yerleşik çalışır, çünkü kabuğun kendi geçerli dizinini değiştirmesi gerekir.)',
          'Each of these commands is actually a **program** (such as `/bin/ls`). The shell runs it as a process - in later lessons we will do that ourselves with `fork` and `exec`. (`cd` is the exception; it is built into the shell because it must change the shell\'s own current directory.)') },
      ],
    },
  ],
  misconceptions: [
    { wrong: t('Program ile proses aynı şeydir.', 'A program and a process are the same thing.'),
      right: t('Program diskteki dosyadır; proses o dosyanın çalışmakta olan örneğidir. Bir program aynı anda birden çok proses olabilir.', 'A program is the file on disk; a process is a running instance of it. One program can be several processes at once.') },
    { wrong: t('Çokgörevlilikte tüm prosesler tam olarak aynı anda çalışır.', 'In multitasking all processes run at exactly the same instant.'),
      right: t('Tek işlemcide bir anda yalnız bir proses çalışır; hızlı görev değiştirme eşzamanlılık izlenimi yaratır.', 'On a single processor only one process runs at a time; fast task switching creates the impression of simultaneity.') },
    { wrong: t('Kabuk (shell) çekirdeğin bir parçasıdır.', 'The shell is part of the kernel.'),
      right: t('Kabuk kullanıcı seviyesinde çalışan bir programdır; çekirdekten sistem çağrılarıyla hizmet ister.', 'The shell is a user-level program that requests services from the kernel through system calls.') },
    { wrong: t('Kullanıcı programları donanıma doğrudan erişir.', 'User programs access hardware directly.'),
      right: t('Her erişim sistem çağrısı arayüzünden geçip çekirdek tarafından yapılır.', 'Every access goes through the system call interface and is performed by the kernel.') },
  ],
  summary: [
    t('Katmanlar: kullanıcı seviyesi → sistem çağrısı arayüzü → çekirdek → donanım.', 'Layers: user level → system call interface → kernel → hardware.'),
    t('Çekirdek servisleri: başlatma, proses, bellek, dosya sistemi, G/Ç, iletişim ve sistem çağrısı arayüzü.', 'Kernel services: initialization, processes, memory, file system, I/O, communication, and the system call interface.'),
    t('Program diskteki dosyadır; proses çalışan programdır.', 'A program is a file on disk; a process is a running program.'),
    t('Çokgörevlilikte bir anda bir proses çalışır, hızlı görev değiştirme hepsine ilerleme sağlar.', 'In multitasking one process runs at a time and fast task switching lets all make progress.'),
    t('UNIX çokkullanıcılıdır ve ağ hizmetleri (e-posta, FTP, WWW, uzaktan giriş) sunar.', 'UNIX is multiuser and offers network services (e-mail, FTP, WWW, remote login).'),
    t('Temel komutlar: ls, cd, rm, mkdir, rmdir, more.', 'Basic commands: ls, cd, rm, mkdir, rmdir, more.'),
  ],
  practice: [
    { id: 'unix-architecture-p1', topic: 'unix-architecture', difficulty: 1, kind: 'order',
      prompt: t('UNIX katmanlarını üstten alta sıralayın.', 'Order the UNIX layers from top to bottom.'),
      items: [t('Kullanıcı programları ve kabuk', 'User programs and shell'), t('Sistem çağrısı arayüzü', 'System call interface'), t('Çekirdek (kernel)', 'Kernel'), t('Donanım kontrolü', 'Hardware control'), t('Donanım', 'Hardware')],
      explanation: t('Her katman yalnızca altındakiyle konuşur.', 'Each layer talks only to the one beneath it.') },
    { id: 'unix-architecture-p2', topic: 'unix-architecture', difficulty: 1, kind: 'mcq',
      prompt: t('Diskte duran `a.out` dosyası için hangisi doğrudur?', 'Which is true about the file `a.out` sitting on disk?'),
      options: [t('Bir prosestir', 'It is a process'), t('Bir programdır', 'It is a program'), t('Çekirdeğin parçasıdır', 'It is part of the kernel'), t('Bir sistem çağrısıdır', 'It is a system call')],
      answer: 1,
      optionNotes: [
        t('Proses, çalıştırılmakta olan programdır; dosya çalıştırılmadıkça proses yoktur.', 'A process is a program being run; without running it there is no process.'),
        t('Doğru: diskteki çalıştırılabilir dosya programdır.', 'Correct: an executable file on disk is a program.'),
        t('Kullanıcı programları çekirdekte değil kullanıcı seviyesinde çalışır.', 'User programs run at user level, not in the kernel.'),
        t('Sistem çağrısı çekirdeğe yapılan bir istektir, dosya değil.', 'A system call is a request to the kernel, not a file.'),
      ],
      explanation: t('Program pasif dosyadır; çalıştırıldığında proses olur.', 'A program is a passive file; when it is run it becomes a process.') },
    { id: 'unix-architecture-p3', topic: 'unix-architecture', difficulty: 2, kind: 'multi',
      prompt: t('Hangileri çekirdeğin temel servisleridir?', 'Which are basic services of the kernel?'),
      options: [t('Bellek yönetimi', 'Memory management'), t('Proses yönetimi', 'Process management'), t('Dosya sistemi yönetimi', 'File system management'), t('Metin düzenleme (pico)', 'Text editing (pico)'), t('Giriş/çıkış yönetimi', 'Input/output management')],
      answers: [0, 1, 2, 4],
      explanation: t('Metin düzenleyici kullanıcı seviyesinde bir programdır, çekirdek servisi değildir.', 'A text editor is a user-level program, not a kernel service.') },
    { id: 'unix-architecture-p4', topic: 'unix-architecture', difficulty: 2, kind: 'tf', answer: true,
      prompt: t('Doğru mu yanlış mı: Tek işlemcili modelde, bir anda yalnızca bir proses çalışır ve proseslerin hepsinin ilerlemesi görev değiştirme ile sağlanır.', 'True or false: In the single-processor model only one process runs at any instant, and all processes make progress through task switching.'),
      explanation: t('Çokgörevliliğin tanımı budur.', 'This is the definition of multitasking.') },
    { id: 'unix-architecture-p5', topic: 'unix-architecture', difficulty: 2, kind: 'match',
      prompt: t('Komutu görevle eşleştirin.', 'Match each command with its job.'),
      left: [t('`ls -l`', '`ls -l`'), t('`mkdir d`', '`mkdir d`'), t('`rmdir d`', '`rmdir d`'), t('`more f`', '`more f`'), t('`cd d`', '`cd d`')],
      right: [t('Dizini ayrıntılı listeler', 'Long-lists the directory'), t('Dizin yaratır', 'Creates a directory'), t('Boş dizini siler', 'Deletes an empty directory'), t('Dosyayı sayfa sayfa gösterir', 'Displays a file page by page'), t('Dizin değiştirir', 'Changes directory')],
      pairs: [0, 1, 2, 3, 4],
      explanation: t('Slayttaki komut tablosu.', 'The slide\'s command table.') },
    { id: 'unix-architecture-p6', topic: 'unix-architecture', difficulty: 1, kind: 'fill',
      prompt: t('Boşlukları doldurun.', 'Fill in the blanks.'),
      template: t('Çalıştırılmakta olan programa {0} denir; birden fazla prosesin birlikte yürütülmesine {1} denir.', 'A program that is being run is called a {0}; running several of them together is called {1}.'),
      blanks: [['proses', 'process', 'işlem', 'süreç'], ['çokgörevlilik', 'multitasking', 'cok gorevlilik', 'çok görevlilik']],
      explanation: t('Tanımlar slayttaki gibidir.', 'Definitions as on the slide.') },
    { id: 'unix-architecture-p7', topic: 'unix-architecture', difficulty: 2, kind: 'short',
      prompt: t('Kullanıcı programının çekirdekten hizmet istemek için geçtiği arayüzün adı nedir? (İngilizce)', 'What is the interface called through which a user program asks the kernel for service?'),
      accept: ['system call interface', 'system call', 'system calls', 'sistem çağrısı arayüzü', 'sistem çağrısı'],
      explanation: t('Sistem çağrısı arayüzü (system call interface).', 'The system call interface.') },
  ],
};
