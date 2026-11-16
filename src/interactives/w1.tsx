import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Icon } from '../components/Icon';
import { Inline } from '../components/Markup';

import { UnixLayers, useS } from '../diagrams/d12';
import { GetpidFlow } from '../diagrams/d34';

export function Widget({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="widget">
      <div className="widget-head">
        <span className="title"><span className="badge-live">live</span> {title}</span>
        {actions && <span className="btn-row">{actions}</span>}
      </div>
      <div className="widget-body">{children}</div>
    </div>
  );
}

// ───────────── UNIX layer explorer ─────────────
export function UnixExplorer() {
  const s = useS();
  const [sel, setSel] = useState('sci');
  const info: Record<string, [string, string]> = {
    programs: [s('Kullanıcı programları ve OS komutları', 'User programs and OS commands'), s('`ls`, `cp`, sizin `a.out` programınız… Kullanıcı modunda çalışırlar ve donanıma doğrudan erişemezler; her hizmeti çekirdekten sistem çağrısıyla isterler.', '`ls`, `cp`, your own `a.out`… They run in user mode and cannot touch the hardware; every service is requested from the kernel through a system call.')],
    shell: [s('Kabuk (shell)', 'Shell'), s('Komut satırını okuyan sıradan bir kullanıcı programı. Bir komut için `fork()` ile alt işlem oluşturur, alt işlemde `exec` ile programı yükler ve (ön planda ise) `wait()` ile bekler.', 'An ordinary user program that reads command lines. For each command it creates a child with `fork()`, loads the program with `exec` in the child and (for foreground jobs) `wait()`s for it.')],
    library: [s('Kütüphaneler', 'Libraries'), s('`sin()`, `atoi()`, `strlen()` gibi fonksiyonlar tamamen kullanıcı modunda çalışır. `printf()` gibi bazıları ise işini bitirmek için içeriden bir sistem çağrısı (`write`) yapar.', 'Functions such as `sin()`, `atoi()`, `strlen()` run entirely in user mode. Others such as `printf()` end up making a system call (`write`) internally.')],
    sci: [s('Sistem çağrısı arayüzü', 'System call interface'), s('Kullanıcı seviyesinden çekirdeğe geçişin TEK yolu. Bir tuzak (trap) komutu işlemciyi çekirdek moduna geçirir ve kontrolü çekirdekteki ilgili sistem çağrısı koduna verir.', 'The ONLY way from user level into the kernel. A trap instruction switches the CPU into kernel mode and hands control to the kernel’s code for that system call.')],
    fs: [s('Dosya alt sistemi', 'File subsystem'), s('`open`, `read`, `write`, `close` çağrılarını gerçekleştirir; dosyaları, dizinleri ve tamponları yönetir; G/Ç için cihaz sürücülerini kullanır.', 'Implements `open`, `read`, `write`, `close`; manages files, directories and buffers; uses the device drivers for I/O.')],
    drivers: [s('Karakter ve blok G/Ç', 'Character and block I/O'), s('Karakter cihazları (terminal, seri port) baytları akış olarak; blok cihazları (disk) sabit boyutlu bloklar halinde aktarır.', 'Character devices (terminal, serial port) transfer bytes as a stream; block devices (disks) transfer fixed-size blocks.')],
    proc: [s('İşlem ve bellek yönetimi', 'Process & memory management'), s('`fork`, `exec`, `wait`, `exit` burada uygulanır: işlemleri oluşturur, zamanlar (scheduling), aralarında iletişimi sağlar ve her işleme sanal bellek verir.', '`fork`, `exec`, `wait`, `exit` live here: it creates processes, schedules them, provides communication between them and gives each one virtual memory.')],
    hwc: [s('Donanım kontrolü', 'Hardware control'), s('Kesmeleri işleyen ve donanımla doğrudan konuşan en alt çekirdek katmanı.', 'The lowest kernel layer: handles interrupts and talks to the hardware directly.')],
    hw: [s('Donanım', 'Hardware'), s('İşlemci, bellek, diskler, terminaller, ağ kartları. Yalnızca çekirdek modunda doğrudan erişilebilir.', 'CPU, memory, disks, terminals, network cards. Directly accessible only in kernel mode.')],
  };
  return (
    <Widget title={s('UNIX katmanlarını keşfedin — bir kutuya tıklayın', 'Explore the UNIX layers — click a box')}>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}><UnixLayers selected={sel} onSelect={setSel} /></div>
        <div className="panel panel-pad" aria-live="polite">
          <h3 style={{ marginBottom: 8 }}>{info[sel][0]}</h3>
          <p style={{ marginBottom: 0 }}><Inline text={info[sel][1]} /></p>
        </div>
      </div>
    </Widget>
  );
}

// ───────────── Multitasking time slices ─────────────
export function Timeslice() {
  const s = useS();
  const [n, setN] = useState(3);
  const [q, setQ] = useState(2);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const work = [5, 3, 6, 4, 2].slice(0, n);
  const schedule = useMemo(() => {
    const left = work.slice();
    const slots: number[] = [];
    let i = 0;
    while (left.some((x) => x > 0)) {
      if (left[i] > 0) { const run = Math.min(q, left[i]); for (let k = 0; k < run; k++) slots.push(i); left[i] -= run; }
      i = (i + 1) % n;
    }
    return slots;
  }, [n, q]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setT(0), [n, q]);
  useEffect(() => {
    if (!playing) return;
    if (t >= schedule.length) { setPlaying(false); return; }
    const id = setTimeout(() => setT((x) => x + 1), 420);
    return () => clearTimeout(id);
  }, [playing, t, schedule.length]);
  const switches = schedule.slice(0, t).filter((p, i, a) => i > 0 && a[i - 1] !== p).length;
  const W = 34, X0 = 90;
  const width = X0 + schedule.length * W + 20;
  return (
    <Widget
      title={s('Çok görevlilik: iş aktarma (task switching)', 'Multitasking: task switching')}
      actions={<>
        <button className="btn small primary" onClick={() => { if (t >= schedule.length) setT(0); setPlaying((p) => !p); }}><Icon name={playing ? 'pause' : 'play'} size={14} /> {playing ? s('Duraklat', 'Pause') : s('Oynat', 'Play')}</button>
        <button className="btn small" onClick={() => setT((x) => Math.min(schedule.length, x + 1))} disabled={t >= schedule.length}><Icon name="step" size={14} /> {s('Adım', 'Step')}</button>
        <button className="btn small ghost" onClick={() => { setT(0); setPlaying(false); }}><Icon name="reset" size={14} /></button>
      </>}
    >
      <div className="btn-row" style={{ marginBottom: 12 }}>
        <label className="inline">{s('İşlem sayısı', 'Processes')} <input type="range" min={2} max={5} value={n} onChange={(e) => setN(+e.target.value)} /> <b>{n}</b></label>
        <label className="inline">{s('Zaman dilimi', 'Time slice')} <input type="range" min={1} max={4} value={q} onChange={(e) => setQ(+e.target.value)} /> <b>{q}</b></label>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${n * 36 + 40}`} style={{ minWidth: Math.min(width, 640), width: '100%' }} role="img" aria-label="Gantt">
          {work.map((w, p) => (
            <g key={p}>
              <text x={8} y={p * 36 + 26} className="d-text">{s('İşlem', 'Proc')} {p + 1}</text>
              <text x={8} y={p * 36 + 38} className="d-muted">{s('iş', 'work')}: {w}</text>
              <line x1={X0} y1={p * 36 + 36} x2={width - 10} y2={p * 36 + 36} className="d-dash" />
            </g>
          ))}
          {schedule.map((p, i) => (
            <rect key={i} x={X0 + i * W + 1} y={p * 36 + 10} width={W - 2} height={24} rx={4} fill={`var(--p${p})`} opacity={i < t ? 0.9 : 0.12} />
          ))}
          {t > 0 && t <= schedule.length && <line x1={X0 + t * W} y1={4} x2={X0 + t * W} y2={n * 36 + 14} stroke="var(--text)" strokeWidth={2} />}
          {schedule.map((_, i) => i % 2 === 0 && <text key={i} x={X0 + i * W + 2} y={n * 36 + 32} className="d-muted">{i}</text>)}
        </svg>
      </div>
      <p className="small" style={{ marginTop: 10, marginBottom: 0 }}>
        {t < schedule.length && t > 0 ? s(`Şu an sadece İşlem ${schedule[t - 1] + 1} çalışıyor. `, `Right now only Process ${schedule[t - 1] + 1} is running. `) : ''}
        {s(`İş aktarma sayısı: ${switches}. Tek işlemcide her an yalnızca bir işlem çalışır; ama belli bir sürenin sonunda hepsi ilerleme kaydeder.`, `Task switches so far: ${switches}. On one CPU only one process runs at any instant, yet over time every process makes progress.`)}
      </p>
    </Widget>
  );
}

// ───────────── argv builder ─────────────
function splitArgs(line: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

export function ArgvBuilder() {
  const s = useS();
  const [cmd, setCmd] = useState('a.out -s -o output input');
  const args = splitArgs(cmd.replace(/^[%$]\s*/, '')).slice(0, 12);
  const prog = `int main(int argc, char *argv[])
{
    int i;
    printf("argc = %d\\n", argc);
    for (i = 0; i < argc; ++i)
        printf("argv[%d]: %s\\n", i, argv[i]);
    return 0;
}`;
  return (
    <Widget title={s('argc / argv oluşturucu', 'argc / argv builder')}>
      <label className="small muted" htmlFor="argv-in">{s('Komut satırını yazın (tırnaklar tek argüman yapar):', 'Type a command line (quotes make a single argument):')}</label>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', margin: '4px 0 12px' }}>
        <span className="mono muted">%</span>
        <input id="argv-in" type="text" value={cmd} onChange={(e) => setCmd(e.target.value)} style={{ flex: 1, fontFamily: 'var(--font-mono)' }} spellCheck={false} />
      </div>
      <div className="btn-row" style={{ marginBottom: 12 }}>
        {['a.out -s -o output input', 'copy text1.c text2.c', 'myprog 35 56', 'myprog "hello world" x', 'myprog'].map((ex) => (
          <button key={ex} className="btn small ghost mono" onClick={() => setCmd(ex)}>{ex}</button>
        ))}
      </div>
      {args.length === 0 ? <p className="muted">{s('Boş komut.', 'Empty command.')}</p> : (
        <div className="grid-2">
          <div>
            <p style={{ margin: '0 0 8px' }}><b className="mono">argc = {args.length}</b> <span className="muted small">({s('program adı dahil', 'including the program name')})</span></p>
            <div style={{ display: 'grid', gap: 6 }}>
              {[...args, null].map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span className="mono small" style={{ width: 64, flex: 'none', color: i === 0 ? 'var(--accent)' : undefined }}>argv[{i}]</span>
                  <span className="muted">→</span>
                  {a === null ? <span className="chip">NULL</span> : (
                    <span className="cells" aria-label={a}>
                      {[...a].map((c, j) => <span key={j}>{c === ' ' ? '␣' : c}</span>)}
                      <span className="nul">\0</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
            {args.slice(1).some((a) => /^-?\d+$/.test(a)) && (
              <p className="small" style={{ marginTop: 10 }}>
                <Inline text={s('Sayı gibi görünen argümanlar da **dizgidir**: `atoi(argv[i])` ile `int`e çevirin.', 'Arguments that look like numbers are still **strings**: convert them with `atoi(argv[i])`.')} />
              </p>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <CodeBlock code={prog} title="args.c" />
            <pre className="term" style={{ marginTop: 8 }}>
              <span className="cap">{s('çıktı', 'output')}</span>
              {`argc = ${args.length}\n` + args.map((a, i) => `argv[${i}]: ${a}`).join('\n')}
            </pre>
          </div>
        </div>
      )}
    </Widget>
  );
}

// ───────────── cc command builder ─────────────
type FileKind = 'c' | 'o' | 'exe';
interface VFile { name: string; kind: FileKind }
const MODS: Record<string, { defines: string[]; needs: string[] }> = {
  module1: { defines: ['main'], needs: ['f2', 'f3', 'printf'] },
  module2: { defines: ['f2'], needs: [] },
  module3: { defines: ['f3'], needs: [] },
};
const START: VFile[] = [{ name: 'module1.c', kind: 'c' }, { name: 'module2.c', kind: 'c' }, { name: 'module3.c', kind: 'c' }];

export function CompileBuilder() {
  const s = useS();
  const [dir, setDir] = useState<VFile[]>(START);
  const [sel, setSel] = useState<string[]>(['module1.c']);
  const [dashC, setDashC] = useState(true);
  const [outName, setOutName] = useState('');
  const [log, setLog] = useState<{ cmd: string; lines: string[]; ok: boolean; stages: string[] }[]>([]);
  const cmd = `cc${dashC ? ' -c' : ''}${outName ? ` -o ${outName}` : ''} ${sel.join(' ')}`.trim();

  const run = () => {
    const lines: string[] = [];
    const stages: string[] = [];
    let ok = true;
    const next = dir.slice();
    const add = (f: VFile) => { const i = next.findIndex((x) => x.name === f.name); if (i >= 0) next[i] = f; else next.push(f); };
    if (!sel.length) { lines.push('cc: fatal error: no input files'); ok = false; }
    else if (dashC) {
      const cs = sel.filter((f) => f.endsWith('.c'));
      sel.filter((f) => f.endsWith('.o')).forEach((f) => lines.push(`cc: warning: ${f}: linker input file unused because linking not done`));
      if (outName && cs.length > 1) { lines.push("cc: fatal error: cannot specify '-o' with '-c' with multiple files"); ok = false; }
      else {
        cs.forEach((f) => { const o = outName || f.replace(/\.c$/, '.o'); add({ name: o, kind: 'o' }); lines.push(s(`${f} → ${o} oluşturuldu (önişlemci → derleyici)`, `${f} → ${o} created (preprocessor → compiler)`)); });
        stages.push('pre', 'cc');
      }
    } else {
      const mods = sel.map((f) => f.replace(/\.[co]$/, ''));
      if (sel.some((f) => f.endsWith('.c'))) stages.push('pre', 'cc');
      stages.push('ld');
      const defined = new Set(mods.flatMap((m) => MODS[m]?.defines ?? []));
      defined.add('printf');
      const missing = [...new Set(mods.flatMap((m) => MODS[m]?.needs ?? []))].filter((x) => !defined.has(x));
      if (!defined.has('main')) missing.unshift('main');
      if (missing.length) {
        ok = false;
        missing.forEach((x) => lines.push(`ld: undefined reference to \`${x}'`));
        lines.push('collect2: error: ld returned 1 exit status');
      } else {
        const exe = outName || 'a.out';
        add({ name: exe, kind: 'exe' });
        lines.push(s(`${sel.join(' + ')} bağlandı → çalıştırılabilir ${exe}`, `${sel.join(' + ')} linked → executable ${exe}`));
        if (sel.some((f) => f.endsWith('.c'))) lines.push(s('(geçici .o dosyaları otomatik silindi)', '(temporary .o files were deleted automatically)'));
      }
    }
    if (ok) setDir(next);
    setLog((l) => [...l.slice(-5), { cmd, lines, ok, stages }]);
  };
  const files = dir.filter((f) => f.kind !== 'exe');
  const last = log[log.length - 1];
  const stageList: [string, string][] = [['pre', s('Önişlemci', 'Preprocessor')], ['cc', s('Derleyici', 'Compiler')], ['ld', s('Bağlayıcı', 'Linker')]];
  return (
    <Widget title={s('cc komutu kurun ve çalıştırın', 'Build and run a cc command')} actions={<button className="btn small ghost" onClick={() => { setDir(START); setLog([]); setSel(['module1.c']); }}><Icon name="reset" size={14} /> {s('Sıfırla', 'Reset')}</button>}>
      <p className="small muted" style={{ marginTop: 0 }}><Inline text={s('`module1.c` içinde `main()` var ve `f2()`, `f3()` çağırıyor; `module2.c` `f2()`’yi, `module3.c` `f3()`’ü tanımlıyor.', '`module1.c` contains `main()` and calls `f2()` and `f3()`; `module2.c` defines `f2()`, `module3.c` defines `f3()`.')} /></p>
      <div className="grid-2">
        <div className="stack">
          <div>
            <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>{s('Girdi dosyaları', 'Input files')}</div>
            <div className="btn-row">
              {files.map((f) => (
                <label key={f.name} className="inline mono"><input type="checkbox" checked={sel.includes(f.name)} onChange={(e) => setSel((x) => (e.target.checked ? [...x, f.name] : x.filter((y) => y !== f.name)))} /> {f.name}</label>
              ))}
            </div>
          </div>
          <div className="btn-row">
            <label className="inline"><input type="checkbox" checked={dashC} onChange={(e) => setDashC(e.target.checked)} /> <code>-c</code> {s('(sadece derle)', '(compile only)')}</label>
            <label className="inline"><code>-o</code> <input type="text" value={outName} onChange={(e) => setOutName(e.target.value.replace(/\s/g, ''))} placeholder="myprog" style={{ width: 110, fontFamily: 'var(--font-mono)' }} /></label>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <code style={{ flex: 1, padding: '6px 10px' }}>% {cmd}</code>
            <button className="btn primary small" onClick={run}><Icon name="play" size={14} /> {s('Çalıştır', 'Run')}</button>
          </div>
          <div>
            <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>{s('Dizin', 'Directory')} ($ ls)</div>
            <div className="btn-row">{dir.map((f) => <span key={f.name} className={'chip ' + (f.kind === 'exe' ? 'ok' : f.kind === 'o' ? 'accent' : '')}>{f.name}{f.kind === 'exe' ? '*' : ''}</span>)}</div>
          </div>
        </div>
        <div className="stack">
          <div className="btn-row" aria-label={s('Çalışan aşamalar', 'Stages run')}>
            {stageList.map(([id, name], i) => (
              <span key={id} className={'chip ' + (last?.stages.includes(id) ? (last.ok || id !== 'ld' ? 'ok' : 'bad') : '')}>{i + 1}. {name}</span>
            ))}
          </div>
          <pre className="term" style={{ minHeight: 140 }}>
            {log.length === 0 ? s('Bir komut kurup Çalıştır’a basın.', 'Build a command and press Run.') : log.map((l) => `% ${l.cmd}\n${l.lines.join('\n')}\n`).join('\n')}
          </pre>
          <p className="small muted" style={{ margin: 0 }}><Inline text={s('Deneyin: üç dosyayı tek tek `-c` ile derleyin, sonra `.o` dosyalarını `-o myprog` ile bağlayın. Veya bir modülü unutup bağlayıcı hatasını görün.', 'Try: compile the three files one by one with `-c`, then link the `.o` files with `-o myprog`. Or leave a module out and look at the linker error.')} /></p>
        </div>
      </div>
    </Widget>
  );
}

// ───────────── getpid() stepper ─────────────
export function SyscallStepper() {
  const s = useS();
  const [step, setStep] = useState(0);
  const text = [
    s('Başlangıç: işlem kullanıcı modunda `p = getpid();` satırına geldi.', 'Start: the process (user mode) reaches `p = getpid();`.'),
    s('**1.** Program, C kütüphanesindeki `getpid()` fonksiyonunu çağırır. Bu sıradan bir fonksiyon çağrısıdır — hâlâ kullanıcı modundayız.', '**1.** The program calls the C library’s `getpid()` function. This is an ordinary function call — still in user mode.'),
    s('**2.** Kütüphane sarmalayıcısı bir **kesme/tuzak (trap)** komutu çalıştırır. İşlemci **çekirdek moduna** geçer ve kontrol çekirdeğe verilir.', '**2.** The library wrapper executes a **trap (software interrupt)** instruction. The CPU switches to **kernel mode** and control passes to the kernel.'),
    s('**3.** Çekirdek, işlemin PID’sini kendi veri yapılarından okur, bir **kaydediciye (register)** yazar ve `iret` ile kullanıcı moduna döner.', '**3.** The kernel reads the process’s PID from its own data structures, puts it into a **register** and returns to user mode with `iret`.'),
    s('**4.** Sarmalayıcı PID’yi kaydediciden okur ve normal bir dönüş değeri olarak programa döndürür: `p` artık PID’yi tutar.', '**4.** The wrapper reads the PID from the register and returns it as an ordinary return value: `p` now holds the PID.'),
  ];
  const mode = step === 3 || step === 2 ? s('çekirdek modu', 'kernel mode') : s('kullanıcı modu', 'user mode');
  return (
    <Widget
      title={s('getpid() adım adım', 'getpid() step by step')}
      actions={<>
        <button className="btn small" onClick={() => setStep((x) => Math.max(0, x - 1))} disabled={step === 0}><Icon name="back" size={14} /></button>
        <button className="btn small primary" onClick={() => setStep((x) => Math.min(4, x + 1))} disabled={step === 4}><Icon name="step" size={14} /> {s('İleri', 'Next')}</button>
        <button className="btn small ghost" onClick={() => setStep(0)}><Icon name="reset" size={14} /></button>
      </>}
    >
      <GetpidFlow active={step || undefined} />
      <div className="btn-row" style={{ marginTop: 8 }}>
        <span className={'chip ' + (step === 2 || step === 3 ? 'warn' : 'accent')}>{mode}</span>
        <span className="chip">{s('adım', 'step')} {step} / 4</span>
      </div>
      <p style={{ marginTop: 8, marginBottom: 0 }} aria-live="polite"><Inline text={text[step]} /></p>
    </Widget>
  );
}

// ───────────── library vs system call classifier ─────────────
const CLASSIFY: { fn: string; sys: boolean; why: [string, string] }[] = [
  { fn: 'fork()', sys: true, why: ['Yeni işlem oluşturmak çekirdeğin işidir.', 'Creating a process is the kernel’s job.'] },
  { fn: 'sin()', sys: false, why: ['Saf hesaplama; çekirdeğe gerek yok.', 'Pure computation; no kernel needed.'] },
  { fn: 'read()', sys: true, why: ['Dosya/cihazdan okumak donanıma erişim ister.', 'Reading a file/device needs hardware access.'] },
  { fn: 'atoi()', sys: false, why: ['Dizgiyi tamsayıya çevirir; tamamen kullanıcı modunda.', 'Converts a string to an int entirely in user mode.'] },
  { fn: 'getpid()', sys: true, why: ['PID çekirdeğin veri yapılarında tutulur.', 'The PID is kept in kernel data structures.'] },
  { fn: 'strlen()', sys: false, why: ['Bellekteki karakterleri sayar.', 'Counts characters in memory.'] },
  { fn: 'write()', sys: true, why: ['Çıktı cihazına yazmak çekirdek modu ister.', 'Writing to an output device needs kernel mode.'] },
  { fn: 'printf()', sys: false, why: ['Kütüphane fonksiyonu: biçimlendirmeyi kullanıcı modunda yapar, sonra içeride write() sistem çağrısını kullanır.', 'Library function: formats in user mode, then internally uses the write() system call.'] },
  { fn: 'wait()', sys: true, why: ['Alt işlemin bitmesini beklemek çekirdek tarafından yönetilir.', 'Waiting for a child is managed by the kernel.'] },
  { fn: 'perror()', sys: false, why: ['errno’ya bakıp mesaj yazdıran kütüphane fonksiyonu.', 'Library function that looks at errno and prints a message.'] },
  { fn: 'pipe()', sys: true, why: ['İşlemler arası iletişim kanalını çekirdek oluşturur.', 'The kernel creates the inter-process channel.'] },
  { fn: 'cos()', sys: false, why: ['Matematik kütüphanesi.', 'Math library.'] },
];

export function SyscallClassifier() {
  const s = useS();
  const { lang } = { lang: s('tr', 'en') as 'tr' | 'en' };
  const [ans, setAns] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const score = CLASSIFY.filter((c) => ans[c.fn] === c.sys).length;
  return (
    <Widget
      title={s('Kütüphane mi, sistem çağrısı mı?', 'Library function or system call?')}
      actions={<>
        <button className="btn small primary" onClick={() => setChecked(true)} disabled={Object.keys(ans).length < CLASSIFY.length}>{s('Kontrol et', 'Check')}</button>
        <button className="btn small ghost" onClick={() => { setAns({}); setChecked(false); }}><Icon name="reset" size={14} /></button>
      </>}
    >
      <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}>
        {CLASSIFY.map((c) => {
          const v = ans[c.fn];
          const right = checked && v === c.sys;
          const wrong = checked && v !== undefined && v !== c.sys;
          return (
            <div key={c.fn} className={'opt locked' + (right ? ' right' : wrong ? ' wrong' : '')} style={{ flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', width: '100%' }}>
                <code>{c.fn}</code>
                <div className="seg" role="group" aria-label={c.fn}>
                  <button aria-pressed={v === false} onClick={() => !checked && setAns((a) => ({ ...a, [c.fn]: false }))}>{s('Kütüphane', 'Library')}</button>
                  <button aria-pressed={v === true} onClick={() => !checked && setAns((a) => ({ ...a, [c.fn]: true }))}>{s('Sistem çağrısı', 'Syscall')}</button>
                </div>
              </div>
              {checked && <span className="small" style={{ color: 'var(--text-2)' }}>{c.why[lang === 'tr' ? 0 : 1]}</span>}
            </div>
          );
        })}
      </div>
      {checked && <p style={{ marginBottom: 0, marginTop: 10 }}><b>{score} / {CLASSIFY.length}</b> {s('doğru.', 'correct.')}</p>}
    </Widget>
  );
}

// ───────────── open() / errno lab ─────────────
export function ErrnoLab() {
  const s = useS();
  const [scenario, setScenario] = useState<'ok' | 'enoent' | 'eacces'>('enoent');
  const [step, setStep] = useState(0);
  useEffect(() => setStep(0), [scenario]);
  const sc = {
    ok: { file: 'notes.txt', ret: 3, errno: '—', msg: '' },
    enoent: { file: 'nofile.txt', ret: -1, errno: 'ENOENT (2)', msg: 'No such file or directory' },
    eacces: { file: '/etc/shadow', ret: -1, errno: 'EACCES (13)', msg: 'Permission denied' },
  }[scenario];
  const code = `int fd = open(argv[1], O_RDONLY);   /* % prog ${sc.file} */
if (fd == -1) {
    perror(argv[1]);
    exit(1);
}
/* OK — use fd */`;
  const steps = [
    s('`open()` sistem çağrısı yapılır.', '`open()` system call is made.'),
    sc.ret === -1 ? s(`Çekirdek hatayı bulur: \`open\` **-1** döndürür ve \`errno = ${sc.errno}\` olur.`, `The kernel detects an error: \`open\` returns **-1** and sets \`errno = ${sc.errno}\`.`) : s('Başarılı: `open` negatif olmayan bir dosya tanımlayıcı döndürür (**3**; 0,1,2 stdin/stdout/stderr’dir).', 'Success: `open` returns a non-negative file descriptor (**3**; 0,1,2 are stdin/stdout/stderr).'),
    sc.ret === -1 ? s('`fd == -1` doğru → `perror()` errno’daki koda karşılık gelen mesajı stderr’e yazar.', '`fd == -1` is true → `perror()` prints the message for the code in errno to stderr.') : s('`fd == -1` yanlış → program dosyayı kullanmaya devam eder. errno’ya BAKILMAZ (başarıda anlamsızdır).', '`fd == -1` is false → the program goes on using the file. errno is NOT examined (it is meaningless on success).'),
    sc.ret === -1 ? s('`exit(1)`: işlem sıfırdan farklı durumla sonlanır (hata).', '`exit(1)`: the process ends with a non-zero status (failure).') : s('Bitti.', 'Done.'),
  ];
  return (
    <Widget
      title={s('open() hata laboratuvarı', 'open() error lab')}
      actions={<>
        <button className="btn small primary" onClick={() => setStep((x) => Math.min(3, x + 1))} disabled={step >= 3}><Icon name="step" size={14} /> {s('İleri', 'Next')}</button>
        <button className="btn small ghost" onClick={() => setStep(0)}><Icon name="reset" size={14} /></button>
      </>}
    >
      <div className="seg" role="group" aria-label={s('Senaryo', 'Scenario')} style={{ marginBottom: 12, flexWrap: 'wrap' }}>
        <button aria-pressed={scenario === 'ok'} onClick={() => setScenario('ok')}>{s('dosya var', 'file exists')}</button>
        <button aria-pressed={scenario === 'enoent'} onClick={() => setScenario('enoent')}>{s('dosya yok', 'no such file')}</button>
        <button aria-pressed={scenario === 'eacces'} onClick={() => setScenario('eacces')}>{s('izin yok', 'no permission')}</button>
      </div>
      <div className="grid-2">
        <CodeBlock code={code} />
        <div className="stack">
          <dl className="kv">
            <dt>{s('dönen değer', 'return value')}</dt><dd>{step >= 1 ? `fd = ${sc.ret}` : '…'}</dd>
            <dt>errno</dt><dd>{step >= 1 ? sc.errno : '…'}</dd>
          </dl>
          <pre className="term">
            <span className="cap">stderr</span>
            {step >= 2 && sc.ret === -1 ? `${sc.file}: ${sc.msg}` : ' '}
          </pre>
          <p style={{ margin: 0 }} aria-live="polite"><Inline text={steps[step]} /></p>
        </div>
      </div>
    </Widget>
  );
}
