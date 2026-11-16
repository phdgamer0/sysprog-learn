import { Arrow, Box, Diamond, line, Svg, T, TimeAxis } from './kit';
import { useS } from './d12';

export function CpuModes() {
  const s = useS();
  const priv = [s('kesmeleri açma / kapama', 'enabling / disabling interrupts'), s('G/Ç cihazlarına doğrudan erişim', 'direct access to I/O devices'), s('belirli bellek bölgelerine erişim', 'access to certain memory regions'), s('…', '…')];
  return (
    <Svg w={680} h={300} title={s('UNIX’te iki çalışma modu', 'The two modes of operation in UNIX')}>
      <Box x={20} y={20} w={290} h={70} tone="info" label={s('Kullanıcı modu', 'User mode')} sub={s('ayrıcalıklı işlemler YASAK', 'privileged operations FORBIDDEN')} />
      <Box x={370} y={20} w={290} h={70} tone="acc" label={s('Sistem (çekirdek) modu', 'System (kernel) mode')} sub={s('ayrıcalıklılar dahil HER ŞEY serbest', 'EVERYTHING allowed, incl. privileged')} />
      <Arrow d="M310,45 L368,45" tone="acc" />
      <T x={340} y={34} cls="d-muted">{s('sistem çağrısı', 'system call')}</T>
      <Arrow d="M368,70 L312,70" />
      <T x={340} y={84} cls="d-muted">{s('dönüş', 'return')}</T>
      <rect x={20} y={120} width={640} height={160} rx={8} className="d-box2" />
      <T x={340} y={140} cls="d-title">{s('Ayrıcalıklı işlemler (privileged operations)', 'Privileged operations')}</T>
      {priv.map((p, i) => (
        <g key={i}>
          <circle cx={60} cy={172 + i * 26} r={4} className="d-fill-acc" />
          <T x={74} y={172 + i * 26} anchor="start" cls="d-text">{p}</T>
          {i < 3 && <><T x={520} y={172 + i * 26} cls="d-bad-text">✕ user</T><T x={600} y={172 + i * 26} cls="d-ok-text">✓ kernel</T></>}
        </g>
      ))}
    </Svg>
  );
}

export function LibVsSyscall() {
  const s = useS();
  return (
    <Svg w={700} h={360} title={s('Kütüphane çağrıları ve sistem çağrıları', 'Library calls and system calls')}>
      <Box x={250} y={14} w={200} h={46} tone="box2" label={s('Kullanıcı programı', 'User program')} />
      <Arrow d="M280,60 C200,80 150,80 130,104" />
      <T x={150} y={78} cls="d-muted">{s('kütüphane çağrısı', 'library call')}</T>
      <Arrow d="M420,60 C500,80 550,80 570,104" tone="acc" />
      <T x={560} y={78} cls="d-acc-text">{s('sistem çağrısı', 'system call')}</T>
      <Box x={30} y={106} w={210} h={64} label={s('Kütüphane fonksiyonu', 'Library function')} sub="sin(), cos(), atoi()…" />
      <T x={135} y={190} cls="d-ok-text">{s('çekirdeğe gitmeden çalışır', 'runs without entering the kernel')}</T>
      <Box x={460} y={106} w={220} h={64} label={s('Kütüphane sarmalayıcısı', 'Library wrapper')} sub="write(), read(), fork()…" />
      <line x1={20} y1={220} x2={680} y2={220} stroke="var(--warn)" strokeWidth={2} strokeDasharray="6 4" />
      <T x={24} y={210} anchor="start" cls="d-warn-text">{s('sistem çağrısı arayüzü', 'system call interface')}</T>
      <Arrow d="M570,170 L570,250" tone="acc" />
      <T x={578} y={236} anchor="start" cls="d-acc-text">trap</T>
      <rect x={20} y={232} width={660} height={118} rx={10} className="d-box2" />
      <T x={40} y={250} anchor="start" cls="d-muted">{s('Çekirdek (kernel)', 'Kernel')}</T>
      <Box x={460} y={262} w={220} h={56} tone="acc" label={s('Sistem çağrısının ana kodu', 'Main code of the system call')} cls="d-sub" />
      <Box x={40} y={262} w={300} h={56} tone="box" label={s('Diğer sistem çağrısı kodları', 'Other system call code')} cls="d-sub" />
      <T x={350} y={340} cls="d-sub">{s('printf() gibi bazı kütüphane fonksiyonları içeride write() sistem çağrısını kullanır', 'Some library functions such as printf() use the write() system call internally')}</T>
    </Svg>
  );
}

export function GetpidFlow({ active }: { active?: number }) {
  const s = useS();
  const hi = (n: number) => (active === n ? 'acc' : 'box');
  return (
    <Svg w={720} h={380} title={s('getpid() sistem çağrısının Linux’ta gerçekleşmesi', 'How getpid() is carried out in Linux')}>
      <rect x={10} y={10} width={700} height={190} rx={10} className="d-box2" />
      <T x={24} y={28} anchor="start" cls="d-acc-text">{s('Kullanıcı modu', 'User mode')}</T>
      <rect x={10} y={216} width={700} height={154} rx={10} className="d-info" />
      <T x={24} y={234} anchor="start" cls="d-acc-text">{s('Sistem (çekirdek) modu', 'System (kernel) mode')}</T>
      <Box x={40} y={48} w={230} h={130} tone={hi(1)} />
      <T x={155} y={66} cls="d-sub">{s('Kullanıcı işlemi', 'User process')}</T>
      <T x={56} y={96} anchor="start" cls="d-mono">int p;</T>
      <T x={56} y={118} anchor="start" cls="d-mono">p = getpid();</T>
      <T x={56} y={140} anchor="start" cls="d-mono">…</T>
      <Box x={380} y={48} w={300} h={130} tone={active === 2 || active === 4 ? 'acc' : 'box'} />
      <T x={530} y={66} cls="d-sub">{s('getpid() kütüphane fonksiyonu (arayüz)', 'getpid() library wrapper')}</T>
      <T x={396} y={96} anchor="start" cls="d-mono">{s('kesme (trap) komutu', 'trap instruction')}</T>
      <T x={396} y={122} anchor="start" cls="d-mono">{s('PID’yi kaydediciden oku', 'read PID from register')}</T>
      <T x={396} y={148} anchor="start" cls="d-mono">{s('PID’yi döndür', 'return PID')}</T>
      <Box x={380} y={246} w={300} h={110} tone={hi(3)} />
      <T x={396} y={274} anchor="start" cls="d-mono">{s('PID’yi çekirdekten oku', 'read PID from kernel data')}</T>
      <T x={396} y={300} anchor="start" cls="d-mono">{s('PID’yi kaydediciye yaz', 'write PID into register')}</T>
      <T x={396} y={326} anchor="start" cls="d-mono">iret (return)</T>
      <Arrow d="M270,110 L378,96" tone={active === 1 ? 'acc' : 'muted'} />
      <Arrow d="M470,104 C330,160 330,240 378,276" tone={active === 2 ? 'acc' : 'muted'} />
      <Arrow d="M530,330 C760,300 760,130 682,122" tone={active === 3 ? 'acc' : 'muted'} />
      <Arrow d="M378,150 C330,160 300,150 272,135" tone={active === 4 ? 'acc' : 'muted'} />
      {[[318, 92, '1'], [334, 210, '2'], [710, 220, '3'], [320, 162, '4']].map(([x, y, n]) => (
        <g key={n as string}>
          <circle cx={x as number} cy={y as number} r={11} className={active === Number(n) ? 'd-fill-acc' : 'd-fill-muted'} />
          <T x={x as number} y={(y as number) + 1} cls="d-text" weight={700}>{n as string}</T>
        </g>
      ))}
    </Svg>
  );
}

export function SyscallErrorFlow() {
  const s = useS();
  return (
    <Svg w={640} h={430} title={s('Sistem çağrısından sonra hata kontrolü', 'Error checking after a system call')}>
      <Box x={200} y={10} w={240} h={46} tone="box2" label={s('ret = sistem_çağrısı(…)', 'ret = system_call(…)')} mono />
      <Arrow d={line(320, 56, 320, 82)} />
      <Diamond cx={320} cy={120} w={170} h={74} label={s('ret == -1 ?', 'ret == -1 ?')} />
      <Arrow d="M235,120 L130,120 L130,170" />
      <T x={182} y={110} cls="d-muted">{s('hayır', 'no')}</T>
      <Box x={20} y={172} w={220} h={70} tone="ok" label={s('İşlem devam eder', 'Process continues')} sub={s('dönen değer kullanılır', 'return value is used')} />
      <Arrow d="M405,120 L510,120 L510,170" tone="bad" />
      <T x={458} y={110} cls="d-bad-text">{s('evet', 'yes')}</T>
      <Box x={400} y={172} w={220} h={50} tone="bad" label={s('Sistem çağrısı başarısız', 'System call failed')} />
      <Arrow d={line(510, 222, 510, 246)} tone="bad" />
      <Box x={400} y={248} w={220} h={50} label={s('İS hata kodunu errno’ya koyar', 'OS puts the error code in errno')} cls="d-sub" />
      <Arrow d={line(510, 298, 510, 322)} />
      <Box x={400} y={324} w={220} h={50} label={s('errno’yu analiz et veya perror()', 'analyse errno or call perror()')} cls="d-sub" />
      <Arrow d={line(510, 374, 510, 396)} />
      <Box x={430} y={398} w={160} h={28} tone="box2" label={s('exit(1) — sonlan', 'exit(1) — terminate')} cls="d-sub" />
    </Svg>
  );
}

// ───────────── module 4 ─────────────

export function ProcessHierarchy() {
  const s = useS();
  return (
    <Svg w={680} h={330} title={s('UNIX’te işlem hiyerarşisi', 'Process hierarchy in UNIX')}>
      <Box x={250} y={10} w={180} h={40} tone="box2" label={s('Çekirdek (fork yok)', 'Kernel (no fork)')} cls="d-sub" />
      <Arrow d="M290,50 L130,86" dashed />
      <Arrow d={line(340, 50, 340, 86)} dashed />
      <Arrow d="M390,50 L560,86" dashed />
      <Box x={40} y={88} w={180} h={44} tone="info" label={s('dağıtıcı (scheduler)', 'scheduler')} sub="PID 0" />
      <Box x={260} y={88} w={160} h={44} tone="acc" label="init" sub="PID 1" />
      <Box x={470} y={88} w={180} h={44} tone="info" label="pagedaemon" sub="PID 2" />
      <Arrow d="M300,132 L200,176" tone="acc" />
      <Arrow d="M380,132 L480,176" tone="acc" />
      <Box x={110} y={178} w={170} h={40} label={s('kabuk (shell)', 'shell')} sub={s('ana', 'parent')} />
      <Box x={400} y={178} w={170} h={40} label={s('kabuk (shell)', 'shell')} sub={s('ana', 'parent')} />
      <Arrow d="M195,218 L195,250" tone="acc" />
      <Arrow d="M485,218 L485,250" tone="acc" />
      <Box x={130} y={252} w={130} h={36} label={s('alt / ana', 'child / parent')} cls="d-sub" />
      <Box x={420} y={252} w={130} h={36} label={s('alt', 'child')} cls="d-sub" />
      <Arrow d="M195,288 L195,312" tone="acc" />
      <T x={250} y={314} anchor="start" cls="d-muted">{s('→ alt …   (her ok bir fork() çağrısıdır)', '→ child …   (every arrow is a fork() call)')}</T>
    </Svg>
  );
}

export function ForkBasic() {
  const s = useS();
  return (
    <Svg w={680} h={300} title={s('fork(): bir çağrı, iki dönüş', 'fork(): one call, two returns')}>
      <TimeAxis x={30} y1={20} y2={280} label={s('zaman', 'time')} />
      <Box x={230} y={14} w={220} h={44} tone="box2" label={s('Ana işlem (PID 123)', 'Parent (PID 123)')} />
      <Arrow d={line(340, 58, 340, 96)} />
      <Box x={270} y={98} w={140} h={36} tone="warn" label="pid = fork();" mono />
      <Arrow d="M300,134 C260,170 200,170 190,196" />
      <Arrow d="M380,134 C420,170 480,170 490,196" tone="acc" />
      <Box x={80} y={198} w={220} h={64} tone="box" label={s('Ana işlem devam eder', 'Parent continues')} sub={s('fork() → 124 (alt işlemin PID’si)', 'fork() → 124 (child’s PID)')} />
      <Box x={380} y={198} w={220} h={64} tone="acc" label={s('Alt işlem (PID 124)', 'Child (PID 124)')} sub={s('fork() → 0', 'fork() → 0')} />
      <T x={340} y={290} cls="d-muted">{s('Hata durumunda fork() -1 döndürür ve alt işlem oluşmaz', 'On error fork() returns -1 and no child is created')}</T>
    </Svg>
  );
}

export function OrphanTimeline() {
  const s = useS();
  return (
    <Svg w={680} h={360} title={s('Öksüz işlem: ana işlem önce sonlanır', 'Orphan: the parent terminates first')}>
      <TimeAxis x={24} y1={20} y2={340} label={s('zaman', 'time')} />
      <line x1={120} y1={30} x2={120} y2={330} className="d-dash" />
      <Box x={60} y={14} w={120} h={36} tone="info" label="init" sub="PID 1" />
      <line x1={300} y1={50} x2={300} y2={200} stroke="var(--p0)" strokeWidth={3} />
      <Box x={230} y={14} w={140} h={36} tone="box2" label={s('Ana, PID 123', 'Parent, PID 123')} cls="d-sub" />
      <Box x={262} y={84} w={76} h={26} tone="warn" label="fork()" mono />
      <Arrow d="M338,97 C400,97 420,110 450,130" tone="acc" />
      <line x1={470} y1={130} x2={470} y2={330} stroke="var(--p1)" strokeWidth={3} />
      <Box x={400} y={130} w={140} h={30} tone="acc" label={s('Alt, PID 124', 'Child, PID 124')} cls="d-sub" />
      <T x={486} y={182} anchor="start" cls="d-mono">getppid() → 123</T>
      <Box x={262} y={200} w={76} h={28} tone="bad" label="exit()" mono />
      <T x={300} y={244} cls="d-bad-text">{s('(sonlandı)', '(terminated)')}</T>
      <Arrow d="M460,268 C300,268 200,268 124,268" dashed />
      <T x={300} y={258} cls="d-muted">{s('init evlat edinir', 'init adopts it')}</T>
      <T x={486} y={296} anchor="start" cls="d-mono">getppid() → 1</T>
      <T x={486} y={316} anchor="start" cls="d-warn-text">{s('öksüz (orphan)', 'orphan')}</T>
    </Svg>
  );
}

export function ForkAddressSpace() {
  const s = useS();
  return (
    <Svg w={700} h={330} title={s('Ana ve alt işlemin adres alanları', 'Address spaces of parent and child')}>
      <Box x={20} y={20} w={200} h={150} tone="box" />
      <T x={120} y={38} cls="d-sub">{s('Ana işlemin verileri', 'Parent’s data')}</T>
      {['int i = 12;', 'float p = 9.0;', 'int id;', 'id ≠ 0'].map((l, i) => <T key={i} x={36} y={68 + i * 24} anchor="start" cls={i === 3 ? 'd-acc-text' : 'd-mono'}>{l}</T>)}
      <Box x={480} y={20} w={200} h={150} tone="acc" />
      <T x={580} y={38} cls="d-sub">{s('Alt işlemin verileri (kopya)', 'Child’s data (copy)')}</T>
      {['int i = 12;', 'float p = 9.0;', 'int id;', 'id = 0'].map((l, i) => <T key={i} x={496} y={68 + i * 24} anchor="start" cls={i === 3 ? 'd-acc-text' : 'd-mono'}>{l}</T>)}
      <Box x={250} y={60} w={200} h={150} tone="box2" />
      <T x={350} y={78} cls="d-sub">{s('Program (paylaşılan metin)', 'Program (shared text)')}</T>
      {['…', 'id = fork();', '…', 'if (id == 0) …'].map((l, i) => <T key={i} x={266} y={106 + i * 24} anchor="start" cls="d-mono">{l}</T>)}
      <Arrow d="M220,110 L248,120" />
      <Arrow d="M480,110 L452,120" />
      <T x={350} y={250} cls="d-text">{s('Veri, küme (stack) ve yığın (heap) kopyalanır; değişiklikler diğerini ETKİLEMEZ.', 'Data, stack and heap are copied; changes do NOT affect the other process.')}</T>
      <T x={350} y={274} cls="d-sub">{s('Program kodu (metin) salt-okunur olduğu için paylaşılabilir.', 'The program code (text) is read-only, so it can be shared.')}</T>
      <T x={350} y={300} cls="d-muted">{s('Modern sistemler “copy-on-write” kullanır: sayfalar ancak yazılınca gerçekten kopyalanır.', 'Modern systems use copy-on-write: pages are only really copied when written.')}</T>
    </Svg>
  );
}

export function WaitExitSync() {
  const s = useS();
  return (
    <Svg w={640} h={360} title={s('Ana ve alt işlem arasında senkronizasyon', 'Synchronization between parent and child')}>
      <TimeAxis x={24} y1={20} y2={340} label={s('zaman', 'time')} />
      <Box x={150} y={14} w={140} h={34} tone="box2" label={s('ana işlem', 'parent')} />
      <line x1={220} y1={48} x2={220} y2={330} stroke="var(--p0)" strokeWidth={3} />
      <Box x={180} y={70} w={80} h={28} tone="warn" label="fork" mono />
      <Arrow d="M260,84 C330,84 370,100 400,120" tone="acc" />
      <line x1={420} y1={120} x2={420} y2={240} stroke="var(--p1)" strokeWidth={3} />
      <T x={236} y={130} anchor="start" cls="d-sub">{s('bazı aktiviteler', 'some activity')}</T>
      <T x={436} y={170} anchor="start" cls="d-sub">{s('bazı aktiviteler', 'some activity')}</T>
      <Box x={180} y={160} w={80} h={28} tone="warn" label="wait" mono />
      <rect x={214} y={190} width={12} height={58} className="d-warn" />
      <T x={170} y={220} anchor="end" cls="d-warn-text">{s('ana işlem bekliyor', 'parent waiting')}</T>
      <Box x={380} y={240} w={80} h={28} tone="bad" label="exit" mono />
      <Arrow d="M420,268 C380,290 280,262 228,262" dashed />
      <T x={470} y={254} anchor="start" cls="d-bad-text">{s('alt işlem sonlandı', 'child terminated')}</T>
      <T x={236} y={300} anchor="start" cls="d-ok-text">{s('ana işlem devam eder', 'parent continues')}</T>
    </Svg>
  );
}

export function WaitFlowchart() {
  const s = useS();
  return (
    <Svg w={680} h={460} title={s('wait() ve exit() arasındaki ilişki', 'Relationship between wait() and exit()')}>
      <Box x={60} y={10} w={200} h={40} tone="box2" label="p = wait(&s)" mono />
      <Arrow d={line(160, 50, 160, 76)} />
      <Diamond cx={160} cy={114} w={200} h={72} label={s('alt işlem\nmevcut mu?', 'any child\nexists?')} />
      <Arrow d="M260,114 L380,114" tone="bad" />
      <T x={320} y={104} cls="d-bad-text">{s('hayır', 'no')}</T>
      <Box x={382} y={88} w={280} h={52} tone="bad" label={s('p = -1, errno ayarlanır (ECHILD)', 'p = -1, errno is set (ECHILD)')} cls="d-sub" />
      <Arrow d={line(160, 150, 160, 186)} />
      <T x={172} y={168} anchor="start" cls="d-ok-text">{s('evet', 'yes')}</T>
      <Box x={60} y={188} w={200} h={40} tone="warn" label={s('alt işlemi bekle…', 'wait for a child…')} />
      <Arrow d={line(160, 228, 160, 256)} />
      <Diamond cx={160} cy={294} w={210} h={72} label={s('bir alt işlem\nsonlandı mı?', 'has a child\nterminated?')} />
      <path d="M55,294 L30,294 L30,208 L58,208" className="d-line" />
      <Arrow d="M30,208 L58,208" />
      <T x={40} y={282} anchor="start" cls="d-muted">{s('hayır (blok)', 'no (block)')}</T>
      <Arrow d={line(160, 330, 160, 366)} />
      <T x={172} y={348} anchor="start" cls="d-ok-text">{s('evet', 'yes')}</T>
      <Box x={40} y={368} w={380} h={60} tone="ok" label={s('p ← alt işlemin PID’si', 'p ← child’s PID')} sub={s('s ← alt işlemin durumu (WEXITSTATUS(s) = x)', 's ← child’s status (WEXITSTATUS(s) = x)')} />
      <Box x={500} y={200} w={150} h={40} tone="acc" label={s('alt işlem', 'child')} />
      <line x1={575} y1={240} x2={575} y2={300} stroke="var(--p1)" strokeWidth={3} />
      <Box x={520} y={300} w={110} h={34} tone="bad" label="exit(x)" mono />
      <Arrow d="M520,317 C420,317 330,300 266,296" tone="acc" dashed />
      <T x={340} y={446} cls="d-muted">{s('wait(NULL) veya wait(0): sadece PID döner, durum saklanmaz', 'wait(NULL) or wait(0): only the PID is returned, status is discarded')}</T>
    </Svg>
  );
}

export function ZombieCases() {
  const s = useS();
  const lane = (ox: number, exitFirst: boolean) => {
    const tExit = exitFirst ? 140 : 250;
    const tWait = exitFirst ? 260 : 150;
    return (
      <g>
        <Box x={ox + 10} y={20} w={110} h={30} tone="box2" label={s('ana P', 'parent P')} cls="d-sub" />
        <line x1={ox + 65} y1={50} x2={ox + 65} y2={330} stroke="var(--p0)" strokeWidth={3} />
        <Box x={ox + 35} y={70} w={60} h={24} tone="warn" label="fork" mono />
        <Arrow d={`M${ox + 95},82 C${ox + 150},82 ${ox + 170},96 ${ox + 185},110`} tone="acc" />
        <T x={ox + 210} y={104} cls="d-sub">{s('alt C', 'child C')}</T>
        <line x1={ox + 195} y1={115} x2={ox + 195} y2={tExit} stroke="var(--p1)" strokeWidth={3} />
        <Box x={ox + 165} y={tExit} w={60} h={24} tone="bad" label="exit" mono />
        {exitFirst && <rect x={ox + 189} y={tExit + 24} width={12} height={tWait - tExit - 12} className="d-bad" />}
        {exitFirst && <T x={ox + 210} y={(tExit + tWait) / 2 + 6} anchor="start" cls="d-bad-text">{s('zombi', 'zombie')}</T>}
        <Box x={ox + 35} y={tWait} w={60} h={24} tone="warn" label="wait" mono />
        {!exitFirst && <rect x={ox + 59} y={tWait + 24} width={12} height={tExit - tWait} className="d-warn" />}
        {!exitFirst && <T x={ox + 52} y={(tWait + tExit) / 2 + 14} anchor="end" cls="d-warn-text">{s('bloklu', 'blocked')}</T>}
        <Arrow d={`M${ox + 165},${tExit + 12} L${ox + 98},${Math.max(tExit, tWait) + 14}`} dashed />
        <T x={ox + 130} y={350} cls="d-text" weight={650}>{exitFirst ? 't(exit) < t(wait)' : 't(exit) ≥ t(wait)'}</T>
      </g>
    );
  };
  return (
    <Svg w={640} h={372} title={s('Zombi durumu: exit ve wait zamanlaması', 'Zombie state: timing of exit and wait')}>
      {lane(20, true)}
      <line x1={320} y1={10} x2={320} y2={360} className="d-dash" />
      {lane(340, false)}
    </Svg>
  );
}

export const STATE_POS: Record<string, [number, number]> = {
  new: [70, 70], ready: [240, 70], running: [470, 70], sleeping: [355, 220], zombie: [620, 220], gone: [620, 340],
};

export function ProcessStates({ current, onPick, enabled }: { current?: string; onPick?: (to: string) => void; enabled?: string[] }) {
  const s = useS();
  const label: Record<string, string> = {
    new: s('(fork)', '(fork)'), ready: s('Çalışmaya hazır', 'Ready'), running: s('Çalışıyor', 'Running'),
    sleeping: s('Uyuyor', 'Sleeping'), zombie: s('Zombi', 'Zombie'), gone: s('Tamamen\nsonlandı', 'Fully\nterminated'),
  };
  const node = (id: string) => {
    const [x, y] = STATE_POS[id];
    const isCur = current === id;
    const can = enabled?.includes(id) && onPick;
    const tone = isCur ? 'acc' : id === 'zombie' ? 'bad' : id === 'gone' || id === 'new' ? 'box2' : 'box';
    return (
      <g key={id} className={can ? 'svg-btn' : undefined} role={can ? 'button' : undefined} tabIndex={can ? 0 : undefined}
        onClick={can ? () => onPick!(id) : undefined}
        onKeyDown={can ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick!(id); } } : undefined}
        aria-label={can ? label[id].replace('\n', ' ') : undefined}>
        <rect x={x - 70} y={y - 24} width={140} height={48} rx={24} className={'d-' + tone} strokeWidth={can ? 2.5 : undefined} strokeDasharray={can && !isCur ? '5 3' : undefined} />
        <T x={x} y={y} cls="d-text" weight={isCur ? 700 : undefined}>{label[id]}</T>
      </g>
    );
  };
  return (
    <Svg w={720} h={380} title={s('UNIX’te bir işlemin durum diyagramı (basitleştirilmiş)', 'UNIX process state diagram (simplified)')}>
      <Arrow d="M140,70 L168,70" />
      <Arrow d="M310,60 L398,60" tone="acc" />
      <T x={355} y={48} cls="d-muted">{s('dağıtıldı', 'dispatched')}</T>
      <Arrow d="M400,82 L312,82" />
      <T x={355} y={98} cls="d-muted">{s('zaman dilimi bitti', 'time slice over')}</T>
      <Arrow d="M450,94 L385,196" />
      <T x={448} y={150} anchor="start" cls="d-muted">{s('uyutuldu / engellendi', 'sleep / blocked')}</T>
      <Arrow d="M325,196 L262,94" />
      <T x={262} y={150} anchor="end" cls="d-muted">{s('aktif edildi', 'woken up')}</T>
      <Arrow d="M520,92 L590,196" tone="bad" />
      <T x={566} y={130} anchor="start" cls="d-bad-text">exit()</T>
      <Arrow d="M620,244 L620,314" />
      <T x={630} y={280} anchor="start" cls="d-muted">{s('ana işlem wait()', 'parent wait()')}</T>
      {Object.keys(STATE_POS).map(node)}
      <T x={20} y={360} anchor="start" cls="d-muted">{s('Zombi: exit() wait()’ten önce çağrılmışsa, ana işlem durumu alana kadar.', 'Zombie: if exit() is called before wait(), until the parent collects the status.')}</T>
    </Svg>
  );
}
