import { Arrow, Box, line, Svg, T, TimeAxis } from './kit';
import { useS } from './d12';

export function ExecReplace() {
  const s = useS();
  return (
    <Svg w={680} h={300} title={s('İşlem içinde başka bir programa aktarma', 'Switching to another program inside a process')}>
      <rect x={180} y={14} width={320} height={270} rx={12} className="d-box2" />
      <T x={340} y={32} cls="d-acc-text">{s('Aynı işlem — PID 300 hiç değişmez', 'Same process — PID 300 never changes')}</T>
      <Box x={210} y={50} w={260} h={70} tone="box" label={s('Program A', 'Program A')} sub={s('komutlar + veriler', 'instructions + data')} />
      <Box x={250} y={136} w={180} h={30} tone="warn" label={'execl("B", …)'} mono />
      <Arrow d={line(340, 120, 340, 134)} />
      <Arrow d={line(340, 166, 340, 190)} tone="acc" />
      <Box x={210} y={192} w={260} h={70} tone="acc" label={s('Program B', 'Program B')} sub={s('yeni komutlar + yeni veriler', 'new instructions + new data')} />
      <T x={20} y={84} anchor="start" cls="d-mono">getpid() → 300</T>
      <T x={20} y={228} anchor="start" cls="d-mono">getpid() → 300</T>
      <T x={520} y={84} anchor="start" cls="d-sub">{s('A’nın kodu, verisi,\nkümesi (stack) silinir', 'A’s code, data and\nstack are discarded')}</T>
      <T x={520} y={228} anchor="start" cls="d-sub">{s('B baştan (main) başlar', 'B starts from main()')}</T>
    </Svg>
  );
}

export function ExecNoReturn() {
  const s = useS();
  return (
    <Svg w={680} h={300} title={s('execl başarılıysa geri dönüş yoktur', 'A successful execl does not return')}>
      <Box x={20} y={20} w={260} h={200} tone="box" />
      <T x={150} y={40} cls="d-sub">{s('Program-1', 'Program-1')}</T>
      <T x={40} y={70} anchor="start" cls="d-mono">printf("start\n");</T>
      <T x={40} y={96} anchor="start" cls="d-mono">execl("program_2", …);</T>
      <rect x={30} y={112} width={240} height={96} rx={6} className="d-bad" strokeDasharray="5 4" />
      <T x={40} y={130} anchor="start" cls="d-mono">perror("execl");</T>
      <T x={40} y={154} anchor="start" cls="d-mono">exit(1);</T>
      <T x={150} y={190} cls="d-bad-text">{s('sadece execl başarısızsa çalışır', 'runs only if execl fails')}</T>
      <Arrow d="M270,96 C330,96 340,70 398,70" tone="acc" />
      <Box x={400} y={40} w={260} h={140} tone="acc" />
      <T x={530} y={60} cls="d-sub">{s('Program-2 (aynı işlem!)', 'Program-2 (same process!)')}</T>
      <T x={420} y={92} anchor="start" cls="d-mono">{'int main() {'}</T>
      <T x={436} y={116} anchor="start" cls="d-mono">…</T>
      <T x={436} y={140} anchor="start" cls="d-mono">exit(0);</T>
      <Arrow d={line(530, 180, 530, 232)} />
      <Box x={440} y={234} w={180} h={40} tone="box2" label={s('İşlem sonlandırılır', 'Process terminates')} />
      <T x={150} y={262} cls="d-muted">{s('Program-1’e geri dönülmez', 'There is no return to Program-1')}</T>
    </Svg>
  );
}

export function SystemFlow() {
  const s = useS();
  return (
    <Svg w={680} h={300} title={s('system(): yeni programı çalıştır ve geri dön', 'system(): run a new program and come back')}>
      <Box x={20} y={20} w={280} h={240} tone="box" />
      <T x={160} y={40} cls="d-sub">{s('Şimdiki program', 'Current program')}</T>
      <T x={40} y={76} anchor="start" cls="d-mono">…</T>
      <T x={40} y={104} anchor="start" cls="d-mono">st = system("prog p1");</T>
      <T x={40} y={170} anchor="start" cls="d-mono">{s('/* dönen değeri incele */', '/* analyse return value */')}</T>
      <T x={40} y={196} anchor="start" cls="d-mono">…</T>
      <rect x={30} y={154} width={260} height={52} rx={6} className="d-ok" fillOpacity={0.5} />
      <Arrow d="M290,104 C340,104 350,80 398,80" tone="acc" />
      <Box x={400} y={50} w={260} h={140} tone="acc" />
      <T x={530} y={70} cls="d-sub">{s('Yeni program', 'New program')}</T>
      <T x={420} y={104} anchor="start" cls="d-mono">…</T>
      <T x={420} y={130} anchor="start" cls="d-mono">exit(0);</T>
      <Arrow d="M400,160 C340,170 330,170 292,170" tone="acc" />
      <T x={345} y={190} cls="d-acc-text">{s('dönüş kodu', 'return code')}</T>
      <T x={340} y={284} cls="d-muted">{s('Not: system() bir kütüphane fonksiyonudur; içeride fork + exec + wait kullanır (alt işlemde çalışır).', 'Note: system() is a library function; internally it uses fork + exec + wait (the program runs in a child).')}</T>
    </Svg>
  );
}

function ShellBase({ bg }: { bg: boolean }) {
  const s = useS();
  return (
    <Svg w={680} h={360} title={bg ? s('Kabuk programı arka planda çalıştırıyor', 'Shell running a program in the background') : s('Kabuk programı ön planda çalıştırıyor', 'Shell running a program in the foreground')}>
      <TimeAxis x={22} y1={20} y2={340} label={s('zaman', 'time')} />
      <Box x={90} y={14} w={200} h={34} tone="box2" label={s('kabuk işlemi (ana)', 'shell process (parent)')} cls="d-sub" />
      <T x={300} y={70} anchor="start" cls="d-mono">{bg ? '% X &' : '% X'}</T>
      <line x1={190} y1={48} x2={190} y2={330} stroke="var(--p0)" strokeWidth={3} />
      <Box x={150} y={84} w={80} h={28} tone="warn" label="fork()" mono />
      <Arrow d="M230,98 C300,98 340,116 380,132" tone="acc" />
      <Box x={380} y={124} w={180} h={30} tone="acc" label={s('alt işlem', 'child process')} cls="d-sub" />
      <line x1={470} y1={154} x2={470} y2={300} stroke="var(--p1)" strokeWidth={3} />
      <Box x={420} y={170} w={100} h={28} tone="warn" label={'execl("X")'} mono />
      <T x={540} y={236} anchor="start" cls="d-sub">{s('Program X\n(uzun sürebilir)', 'Program X\n(may run long)')}</T>
      <Box x={430} y={294} w={80} h={28} tone="bad" label="exit()" mono />
      {bg ? (
        <>
          <Box x={110} y={140} w={160} h={34} tone="ok" label={s('yeni istem: %', 'new prompt: %')} cls="d-sub" />
          <T x={60} y={210} anchor="start" cls="d-sub">{s('kullanıcı yeni komutlar\ngirebilir…', 'user can type new\ncommands…')}</T>
          <T x={60} y={260} anchor="start" cls="d-muted">{s('kabuk beklemez', 'the shell does not wait')}</T>
        </>
      ) : (
        <>
          <Box x={150} y={140} w={80} h={28} tone="warn" label="wait()" mono />
          <rect x={184} y={170} width={12} height={130} className="d-warn" />
          <T x={170} y={236} anchor="end" cls="d-warn-text">{s('kabuk\nbloklu', 'shell\nblocked')}</T>
          <Arrow d="M430,308 C350,320 260,310 200,308" dashed />
          <Box x={110} y={312} w={160} h={30} tone="ok" label={s('yeni istem: %', 'new prompt: %')} cls="d-sub" />
        </>
      )}
    </Svg>
  );
}
export const ShellForeground = () => <ShellBase bg={false} />;
export const ShellBackground = () => <ShellBase bg={true} />;

export const MEM_SEGMENTS = [
  { id: 'stack', y: 10, h: 70 },
  { id: 'gap', y: 80, h: 70 },
  { id: 'heap', y: 150, h: 70 },
  { id: 'bss', y: 220, h: 46 },
  { id: 'data', y: 266, h: 50 },
  { id: 'text', y: 316, h: 70 },
] as const;

/** Address 0 at the bottom, 4G at the top (heap grows up, stack grows down) — same convention as the lesson text. */
export function MemoryLayout({ highlight, onPick }: { highlight?: string; onPick?: (id: string) => void }) {
  const s = useS();
  const names: Record<string, [string, string]> = {
    text: [s('Metin (text)', 'Text'), s('program kodu + sabit veri', 'program code + constant data')],
    data: [s('İlklendirilmiş veri', 'Initialized data'), 'ptr'],
    bss: [s('İlklendirilmemiş veri (bss)', 'Uninitialized data (bss)'), 'buf1'],
    heap: [s('Yığın (heap) ↑ büyür', 'Heap ↑ grows up'), s('malloc(): buf2’nin gösterdiği', 'malloc(): what buf2 points to')],
    gap: ['', ''],
    stack: [s('Küme (stack) ↓ büyür', 'Stack ↓ grows down'), s('i, p, buf2 (otomatik değişkenler)', 'i, p, buf2 (automatic variables)')],
  };
  const addr: [number, string][] = [[10, 'FFFFFFFF (4G)'], [220, 'end = 42D0'], [266, 'edata = 42B0'], [316, 'etext = 2828'], [386, '0']];
  return (
    <Svg w={640} h={400} title={s('Bir işlemin sanal bellek düzeni', 'Virtual memory layout of a process')}>
      {MEM_SEGMENTS.map((seg) => {
        const hl = highlight === seg.id;
        const can = !!onPick && seg.id !== 'gap';
        return (
          <g key={seg.id} className={can ? 'svg-btn' : undefined} role={can ? 'button' : undefined} tabIndex={can ? 0 : undefined}
            onClick={can ? () => onPick!(seg.id) : undefined}
            onKeyDown={can ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick!(seg.id); } } : undefined}
            aria-label={can ? names[seg.id][0] : undefined}>
            <rect x={200} y={seg.y} width={240} height={seg.h} className={hl ? 'd-acc' : seg.id === 'gap' ? 'd-box2' : 'd-box'} strokeDasharray={seg.id === 'gap' ? '5 4' : undefined} />
            {seg.id !== 'gap' && <T x={320} y={seg.y + seg.h / 2 - 8} cls="d-text" weight={hl ? 700 : 600}>{names[seg.id][0]}</T>}
            {seg.id !== 'gap' && <T x={320} y={seg.y + seg.h / 2 + 10} cls="d-sub">{names[seg.id][1]}</T>}
          </g>
        );
      })}
      <Arrow d="M320,152 L320,134" />
      <Arrow d="M320,78 L320,96" />
      {addr.map(([y, a]) => (
        <g key={a}>
          <line x1={190} y1={y} x2={200} y2={y} className="d-line" />
          <T x={184} y={y} anchor="end" cls="d-mono">{a}</T>
        </g>
      ))}
      <T x={460} y={34} anchor="start" cls="d-muted">i @ EFFFFE1C</T>
      <T x={460} y={54} anchor="start" cls="d-muted">buf2 @ EFFFFDAC</T>
      <T x={460} y={185} anchor="start" cls="d-muted">{s('ayrılmış bellek @ 6388', 'allocated @ 6388')}</T>
      <T x={460} y={243} anchor="start" cls="d-muted">buf1 @ 42B0</T>
      <T x={460} y={291} anchor="start" cls="d-muted">ptr @ 4108</T>
      <T x={460} y={351} anchor="start" cls="d-muted">main() 2290, show() 243C</T>
      <T x={20} y={200} anchor="start" cls="d-muted">{s('sanal adres', 'virtual address')}</T>
      <Arrow d="M60,380 L60,214" />
    </Svg>
  );
}
