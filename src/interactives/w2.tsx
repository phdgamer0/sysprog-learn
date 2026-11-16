import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Icon } from '../components/Icon';
import { Inline } from '../components/Markup';
import { useS } from '../diagrams/d12';
import { ProcessStates } from '../diagrams/d34';
import { MemoryLayout } from '../diagrams/d5';
import { Widget } from './w1';

// ───────────── Process state machine ─────────────
type St = 'new' | 'ready' | 'running' | 'sleeping' | 'zombie' | 'gone';
export function StateMachine() {
  const s = useS();
  const T: Record<St, { to: St; ev: [string, string] }[]> = {
    new: [{ to: 'ready', ev: ['ana işlem fork() çağırdı → yeni işlem hazır kuyruğuna girer', 'parent called fork() → the new process enters the ready queue'] }],
    ready: [{ to: 'running', ev: ['dağıtıcı (scheduler) işlemciyi bu işleme verdi', 'the scheduler gave the CPU to this process'] }],
    running: [
      { to: 'ready', ev: ['zaman dilimi bitti; işlemci başka işleme geçti (iş aktarma)', 'time slice expired; the CPU switched to another process (task switch)'] },
      { to: 'sleeping', ev: ['sleep(), wait() veya bir G/Ç beklemesi → işlem uyutuldu/engellendi', 'sleep(), wait() or waiting for I/O → the process sleeps/blocks'] },
      { to: 'zombie', ev: ['exit() çağrıldı ama ana işlem henüz wait() yapmadı → zombi', 'exit() was called but the parent has not called wait() yet → zombie'] },
    ],
    sleeping: [{ to: 'ready', ev: ['beklenen olay oldu (süre doldu, alt işlem bitti, veri geldi) → aktif edildi', 'the awaited event happened (timer, child exit, data arrived) → woken up'] }],
    zombie: [{ to: 'gone', ev: ['ana işlem wait() ile çıkış durumunu aldı → işlem tablosundan silindi', 'the parent collected the exit status with wait() → removed from the process table'] }],
    gone: [],
  };
  const [cur, setCur] = useState<St>('new');
  const [hist, setHist] = useState<string[]>([]);
  const go = (to: string) => {
    const tr = T[cur].find((x) => x.to === to);
    if (!tr) return;
    setHist((h) => [...h, s(tr.ev[0], tr.ev[1])]);
    setCur(to as St);
  };
  const names: Record<St, string> = { new: '(fork)', ready: s('hazır', 'ready'), running: s('çalışıyor', 'running'), sleeping: s('uyuyor', 'sleeping'), zombie: s('zombi', 'zombie'), gone: s('sonlandı', 'gone') };
  return (
    <Widget title={s('İşlem durum makinesi — geçişleri siz yapın', 'Process state machine — drive the transitions')} actions={<button className="btn small ghost" onClick={() => { setCur('new'); setHist([]); }}><Icon name="reset" size={14} /> {s('Sıfırla', 'Reset')}</button>}>
      <ProcessStates current={cur} enabled={T[cur].map((x) => x.to)} onPick={go} />
      <div className="btn-row" style={{ marginTop: 8 }}>
        <span className="small muted">{s('Mümkün geçişler:', 'Possible transitions:')}</span>
        {T[cur].map((x) => <button key={x.to} className="btn small" onClick={() => go(x.to)}>{names[cur]} → {names[x.to]}</button>)}
        {cur === 'gone' && <span className="small">{s('İşlem tamamen sonlandı. Sıfırlayıp tekrar deneyin.', 'The process is completely gone. Reset to try again.')}</span>}
      </div>
      {hist.length > 0 && (
        <ol className="small" style={{ marginBottom: 0, color: 'var(--text-2)' }} aria-live="polite">
          {hist.map((h, i) => <li key={i}>{h}</li>)}
        </ol>
      )}
    </Widget>
  );
}

// ───────────── Zombie timeline ─────────────
export function ZombieTimeline() {
  const s = useS();
  const [tExit, setTExit] = useState(3);
  const [tWait, setTWait] = useState(7);
  const [never, setNever] = useState(false);
  const END = 12; // parent exits at the end
  const X = (t: number) => 70 + t * 46;
  const zombieFrom = tExit, zombieTo = never ? END : tWait;
  const isZombie = never || tExit < tWait;
  const blocked = !never && tExit >= tWait;
  return (
    <Widget title={s('Zombi zaman çizelgesi', 'Zombie timeline')}>
      <div className="btn-row" style={{ marginBottom: 10 }}>
        <label className="inline">t(exit) <input type="range" min={1} max={11} value={tExit} onChange={(e) => setTExit(+e.target.value)} /> <b className="mono">{tExit}</b></label>
        <label className="inline">t(wait) <input type="range" min={1} max={11} value={tWait} disabled={never} onChange={(e) => setTWait(+e.target.value)} /> <b className="mono">{never ? '—' : tWait}</b></label>
        <label className="inline"><input type="checkbox" checked={never} onChange={(e) => setNever(e.target.checked)} /> {s('ana işlem hiç wait() çağırmaz', 'parent never calls wait()')}</label>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${X(END) + 60} 170`} style={{ width: '100%', minWidth: 520 }} role="img" aria-label="timeline">
          <text x={8} y={46} className="d-text">{s('ana P', 'parent P')}</text>
          <text x={8} y={106} className="d-text">{s('alt C', 'child C')}</text>
          <line x1={X(0)} y1={42} x2={X(END)} y2={42} stroke="var(--p0)" strokeWidth={4} />
          {blocked && <rect x={X(tWait)} y={34} width={X(tExit) - X(tWait)} height={16} className="d-warn" />}
          <line x1={X(0)} y1={102} x2={X(tExit)} y2={102} stroke="var(--p1)" strokeWidth={4} />
          {isZombie && <rect x={X(zombieFrom)} y={94} width={X(zombieTo) - X(zombieFrom)} height={16} className="d-bad" />}
          <circle cx={X(0)} cy={42} r={5} className="d-fill-acc" />
          <text x={X(0)} y={24} textAnchor="middle" className="d-mono">fork</text>
          <text x={X(tExit)} y={134} textAnchor="middle" className="d-bad-text">exit</text>
          <line x1={X(tExit)} y1={94} x2={X(tExit)} y2={122} stroke="var(--bad)" strokeWidth={2} />
          {!never && <><text x={X(tWait)} y={24} textAnchor="middle" className="d-warn-text">wait</text><line x1={X(tWait)} y1={30} x2={X(tWait)} y2={56} stroke="var(--warn)" strokeWidth={2} /></>}
          <text x={X(END)} y={24} textAnchor="middle" className="d-muted">{s('ana exit', 'parent exits')}</text>
          {Array.from({ length: END + 1 }, (_, i) => <text key={i} x={X(i)} y={160} textAnchor="middle" className="d-muted">{i}</text>)}
        </svg>
      </div>
      <p style={{ marginBottom: 0 }} aria-live="polite">
        {never
          ? <Inline text={s(`Alt işlem t=${tExit} ile t=${END} arasında **zombi**. Ana işlem sonlanınca zombi öksüz kalır; init (PID 1) onu evlat edinir ve hemen wait() ile toplar.`, `The child is a **zombie** from t=${tExit} to t=${END}. When the parent exits, the zombie is orphaned; init (PID 1) adopts it and reaps it with wait() right away.`)} />
          : isZombie
            ? <Inline text={s(`t(exit) < t(wait): alt işlem t=${tExit}’te bitti ama ana işlem t=${tWait}’e kadar wait() çağırmadı → alt işlem ${tWait - tExit} birim **zombi**. wait() hemen döner.`, `t(exit) < t(wait): the child finished at t=${tExit} but the parent did not call wait() until t=${tWait} → the child is a **zombie** for ${tWait - tExit} units. wait() returns immediately.`)} />
            : <Inline text={s(`t(exit) ≥ t(wait): ana işlem t=${tWait}’te wait() çağırdı ve alt işlem bitene (t=${tExit}) kadar **bloklandı**. Alt işlem zombi kalmaz (pratikte yok denecek kadar kısa).`, `t(exit) ≥ t(wait): the parent called wait() at t=${tWait} and was **blocked** until the child exited at t=${tExit}. The child is not left as a zombie (only for an instant).`)} />}
      </p>
    </Widget>
  );
}

// ───────────── Shell simulator ─────────────
export function ShellSim() {
  const s = useS();
  const [bg, setBg] = useState(false);
  const [i, setI] = useState(0);
  const code = `while (1) {
    printf("%% ");                       /* prompt */
    read_command(cmd, &background);       /* e.g. "X" or "X &" */
    pid = fork();
    if (pid == 0) {                       /* child */
        execl(cmd, cmd, (char *)NULL);
        perror("execl"); exit(1);
    }
    if (!background)
        waitpid(pid, &status, 0);         /* foreground: wait */
}`;
  type Step = { line: number[]; shell: string; child: string; term: string; text: [string, string] };
  const common: Step[] = [
    { line: [2], shell: 'running', child: '—', term: '% ', text: ['Kabuk istem (prompt) yazar.', 'The shell prints a prompt.'] },
    { line: [3], shell: 'running', child: '—', term: bg ? '% X &' : '% X', text: ['Kullanıcı komutu girer; kabuk okur.', 'The user types a command; the shell reads it.'] },
    { line: [4], shell: 'running', child: 'shell copy', term: bg ? '% X &' : '% X', text: ['fork(): kabuğun bir kopyası olan alt işlem oluşur.', 'fork(): a child that is a copy of the shell is created.'] },
    { line: [5, 6], shell: bg ? 'running' : 'running', child: 'X', term: bg ? '% X &' : '% X', text: ['Alt işlem execl("X") ile kendini X programıyla değiştirir (aynı PID).', 'The child replaces itself with program X via execl("X") (same PID).'] },
  ];
  const fg: Step[] = [
    ...common,
    { line: [9, 10], shell: 'blocked', child: 'X', term: '% X\n(X output…)', text: ['Ön plan: kabuk waitpid() ile bloklanır. X çalışırken yeni istem yok.', 'Foreground: the shell blocks in waitpid(). No new prompt while X runs.'] },
    { line: [10], shell: 'running', child: 'exited', term: '% X\n(X output…)', text: ['X exit() ile biter; kabuk uyanır ve onu toplar (zombi kalmaz).', 'X calls exit(); the shell wakes up and reaps it (no zombie left).'] },
    { line: [2], shell: 'running', child: '—', term: '% X\n(X output…)\n% ', text: ['Ancak şimdi yeni istem görünür.', 'Only now does the new prompt appear.'] },
  ];
  const bgs: Step[] = [
    ...common,
    { line: [9], shell: 'running', child: 'X', term: '% X &\n% ', text: ['Arka plan: background doğru, waitpid() atlanır. Kabuk hemen yeni istem yazar.', 'Background: background is true, waitpid() is skipped. The shell prints a new prompt immediately.'] },
    { line: [3], shell: 'running', child: 'X', term: '% X &\n% ls\n…', text: ['Kullanıcı X çalışırken yeni komutlar girebilir; ikisi birlikte çalışır.', 'The user can type new commands while X keeps running; both run concurrently.'] },
    { line: [3], shell: 'running', child: 'exited', term: '% X &\n% ls\n…', text: ['X bitince kabuk onu daha sonra toplar (gerçek kabuklar SIGCHLD ile haberdar olur).', 'When X finishes the shell reaps it later (real shells are notified via SIGCHLD).'] },
  ];
  const steps = bg ? bgs : fg;
  const st = steps[Math.min(i, steps.length - 1)];
  const lines = code.split('\n');
  return (
    <Widget
      title={s('Kabuk bir programı nasıl çalıştırır?', 'How does the shell run a program?')}
      actions={<>
        <div className="seg" role="group">
          <button aria-pressed={!bg} onClick={() => { setBg(false); setI(0); }}>{s('Ön plan', 'Foreground')}</button>
          <button aria-pressed={bg} onClick={() => { setBg(true); setI(0); }}>{s('Arka plan (&)', 'Background (&)')}</button>
        </div>
        <button className="btn small" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}><Icon name="back" size={14} /></button>
        <button className="btn small primary" onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={i >= steps.length - 1}><Icon name="step" size={14} /> {s('İleri', 'Next')}</button>
      </>}
    >
      <div className="grid-2">
        <div className="sim-code" style={{ maxHeight: 'none' }}>
          {lines.map((l, k) => (
            <div key={k} className={'sim-line' + (st.line.includes(k + 1) ? ' cur' : '')}><span className="n">{k + 1}</span><span>{l}</span></div>
          ))}
        </div>
        <div className="stack">
          <div className="procs" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="proc" style={{ ['--pc' as string]: 'var(--p0)' }}>
              <span className="top"><span className="pid">{s('kabuk', 'shell')}</span><span className={'st ' + (st.shell === 'blocked' ? 'blocked' : 'ready')}>{st.shell === 'blocked' ? s('bloklu', 'blocked') : s('çalışıyor', 'running')}</span></span>
            </div>
            <div className="proc" style={{ ['--pc' as string]: 'var(--p1)', opacity: st.child === '—' ? 0.4 : 1 }}>
              <span className="top"><span className="pid">{s('alt', 'child')}</span><span className={'st ' + (st.child === 'exited' ? 'terminated' : 'ready')}>{st.child === '—' ? '—' : st.child === 'exited' ? s('bitti', 'exited') : st.child === 'X' ? 'X' : s('kabuk kopyası', 'shell copy')}</span></span>
            </div>
          </div>
          <pre className="term" style={{ minHeight: 90 }}>{st.term}</pre>
          <p style={{ margin: 0 }} aria-live="polite"><b>{i + 1}/{steps.length}.</b> {s(st.text[0], st.text[1])}</p>
        </div>
      </div>
    </Widget>
  );
}

// ───────────── exec vs system ─────────────
export function ExecVsSystem() {
  const s = useS();
  const [i, setI] = useState(0);
  const execCode = `printf("before\\n");
execl("/bin/date", "date", (char *)NULL);
printf("after\\n");   /* only on error */`;
  const sysCode = `printf("before\\n");
st = system("date");
printf("after, status=%d\\n", st);`;
  const N = 4;
  const ex = [
    { line: 1, pid: 300, prog: 'prog', out: 'before', note: ['Program "before" yazar.', 'The program prints "before".'] },
    { line: 2, pid: 300, prog: 'date', out: 'before\nMon Nov 16 10:00:00 2026', note: ['execl: PID 300 artık /bin/date’i çalıştırıyor. Eski programın kodu yok oldu.', 'execl: PID 300 now runs /bin/date. The old program’s code is gone.'] },
    { line: 2, pid: 300, prog: 'date', out: 'before\nMon Nov 16 10:00:00 2026', note: ['date bitince işlem (PID 300) sonlanır.', 'When date finishes, the process (PID 300) terminates.'] },
    { line: 3, pid: 300, prog: '—', out: 'before\nMon Nov 16 10:00:00 2026', note: ['"after" ASLA yazdırılmaz — dönülecek program kalmadı.', '"after" is NEVER printed — there is no program left to return to.'] },
  ];
  const sy = [
    { line: 1, pid: '300', prog: 'prog', out: 'before', note: ['Program "before" yazar.', 'The program prints "before".'] },
    { line: 2, pid: '300 → 301', prog: s('prog bekliyor; 301: date', 'prog waits; 301: date'), out: 'before\nMon Nov 16 10:00:00 2026', note: ['system(): içeride fork + exec; date alt işlemde (301) çalışır, çağıran bekler.', 'system(): fork + exec inside; date runs in a child (301) while the caller waits.'] },
    { line: 2, pid: '300', prog: 'prog', out: 'before\nMon Nov 16 10:00:00 2026', note: ['date bitti; system() durum kodunu döndürür.', 'date finished; system() returns its status.'] },
    { line: 3, pid: '300', prog: 'prog', out: 'before\nMon Nov 16 10:00:00 2026\nafter, status=0', note: ['Program kaldığı yerden devam eder ve "after" yazar.', 'The program continues where it was and prints "after".'] },
  ];
  const col = (title: string, code: string, st: { line: number; pid: number | string; prog: string; out: string; note: string[] }, dead: boolean) => (
    <div className="stack" style={{ minWidth: 0 }}>
      <h3>{title}</h3>
      <div className="sim-code" style={{ maxHeight: 'none' }}>
        {code.split('\n').map((l, k) => (
          <div key={k} className={'sim-line' + (st.line === k + 1 ? (dead && k === 2 ? ' err' : ' cur') : '')}><span className="n">{k + 1}</span><span style={{ opacity: dead && k === 2 ? 0.5 : 1 }}>{l}</span></div>
        ))}
      </div>
      <dl className="kv"><dt>PID</dt><dd>{st.pid}</dd><dt>{s('program', 'program')}</dt><dd>{st.prog}</dd></dl>
      <pre className="term" style={{ minHeight: 84 }}>{st.out}</pre>
      <p className="small" style={{ margin: 0 }}>{s(st.note[0], st.note[1])}</p>
    </div>
  );
  return (
    <Widget
      title={s('execl() ve system() yan yana', 'execl() vs system() side by side')}
      actions={<>
        <button className="btn small" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}><Icon name="back" size={14} /></button>
        <button className="btn small primary" onClick={() => setI((x) => Math.min(N - 1, x + 1))} disabled={i >= N - 1}><Icon name="step" size={14} /> {s('İleri', 'Next')}</button>
        <button className="btn small ghost" onClick={() => setI(0)}><Icon name="reset" size={14} /></button>
      </>}
    >
      <div className="grid-2">
        {col('execl()', execCode, ex[i], i === 3)}
        {col('system()', sysCode, sy[i], false)}
      </div>
    </Widget>
  );
}

// ───────────── memory explorer ─────────────
export function MemoryExplorer() {
  const s = useS();
  const items: { id: string; label: string; seg: string; line: number; text: [string, string] }[] = [
    { id: 'main', label: 'main()', seg: 'text', line: 5, text: ['Fonksiyonların makine kodu **metin** bölümündedir (main @ 2290, show @ 243C). Salt-okunurdur ve fork sonrası paylaşılabilir.', 'The machine code of functions is in the **text** segment (main @ 2290, show @ 243C). It is read-only and can be shared after fork.'] },
    { id: 'ptr', label: 'ptr', seg: 'data', line: 3, text: ['`ptr` başlangıç değeri olan bir global işaretçi → **ilklendirilmiş veri** (@ 4108). Gösterdiği "Hello\\n" sabiti ise genelde salt-okunur bölgede (metin/rodata) durur.', '`ptr` is a global pointer with an initial value → **initialized data** (@ 4108). The constant "Hello\\n" it points to usually lives in the read-only area (text/rodata).'] },
    { id: 'buf1', label: 'buf1[25]', seg: 'bss', line: 4, text: ['Başlangıç değeri olmayan global dizi → **ilklendirilmemiş veri (bss)** (@ 42B0). Program başlarken sıfırlarla doldurulur; dosyada yer kaplamaz.', 'Global array without an initial value → **uninitialized data (bss)** (@ 42B0). Zero-filled when the program starts; takes no space in the file.'] },
    { id: 'i', label: 'int i', seg: 'stack', line: 7, text: ['`main` içindeki otomatik (yerel) değişken → **küme (stack)** (@ EFFFFE1C). main dönünce yok olur.', 'Automatic (local) variable in `main` → **stack** (@ EFFFFE1C). Disappears when main returns.'] },
    { id: 'buf2', label: 'char *buf2', seg: 'stack', line: 13, text: ['`buf2` işaretçisinin KENDİSİ show() çağrılırken **kümede** (@ EFFFFDAC) saklanır…', 'The pointer `buf2` ITSELF is stored on the **stack** (@ EFFFFDAC) while show() runs…'] },
    { id: 'malloc', label: 'malloc(…)', seg: 'heap', line: 14, text: ['…ama `malloc()` ile ayrılan bellek **yığından (heap)** gelir (@ 6388) ve `free()` ile geri verilir.', '…but the memory returned by `malloc()` comes from the **heap** (@ 6388) and is given back with `free()`.'] },
  ];
  const [sel, setSel] = useState('ptr');
  const cur = items.find((x) => x.id === sel)!;
  const code = `#include <stdio.h> …
/* global */
char *ptr = "Hello\\n";        /* initialized data   */
char buf1[25];                /* uninitialized data */
int main()
{   int show(char *);
    int i = 0;                /* automatic -> stack */
    for ( ; i < 3; ++i) show(ptr);
}

int show(char *p)
{
    char *buf2;               /* stack during the call */
    buf2 = malloc((unsigned)(strlen(p) + 1));  /* heap */
    strcpy(buf2, p);
    printf("%s", buf2);
    free(buf2);               /* back to the heap */
}`;
  return (
    <Widget title={s('Değişkenler bellekte nerede? — birine tıklayın', 'Where do variables live? — click one')}>
      <div className="btn-row" style={{ marginBottom: 10 }}>
        {items.map((x) => <button key={x.id} className={'btn small' + (sel === x.id ? ' primary' : '')} onClick={() => setSel(x.id)}><code style={{ background: 'none', border: 0 }}>{x.label}</code></button>)}
      </div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <CodeBlock code={code} highlight={[cur.line]} title="show.c" />
        </div>
        <div className="stack" style={{ minWidth: 0 }}>
          <MemoryLayout highlight={cur.seg} onPick={(seg) => { const f = items.find((x) => x.seg === seg); if (f) setSel(f.id); }} />
          <p style={{ margin: 0 }} aria-live="polite"><Inline text={s(cur.text[0], cur.text[1])} /></p>
        </div>
      </div>
    </Widget>
  );
}
