import { useI18n } from '../i18n';
import { Arrow, Box, line, Svg, T } from './kit';

export const useS = () => {
  const { lang } = useI18n();
  return (tr: string, en: string) => (lang === 'tr' ? tr : en);
};

export function SysprogMap() {
  const s = useS();
  const cx = 360, cy = 200;
  const items: [string, boolean][] = [
    [s('İşletim sistemlerinin\nprogramlanması', 'Operating system\nprogramming'), false],
    [s('G/Ç sürücülerinin\nprogramlanması', 'I/O driver\nprogramming'), false],
    [s('Uygulama–İS arayüzü\nprogramlama', 'Application–OS\ninterface programming'), false],
    [s('Karmaşık uygulama\npaketleri', 'Complex application\npackages'), false],
    [s('İşlemler arası\niletişim (IPC) *', 'Inter-process\ncommunication (IPC) *'), true],
    [s('Ağ programlama *', 'Network\nprogramming *'), true],
    [s('İstemci–sunucu\nprogramlama *', 'Client–server\nprogramming *'), true],
    [s('Çevirme programları\n(assembler)', 'Assemblers'), false],
    [s('Derleyicilerin\nprogramlanması', 'Compiler\nprogramming'), false],
  ];
  const n = items.length;
  return (
    <Svg w={720} h={410} title={s('Sistem programlamanın alanları', 'Fields of system programming')}>
      {items.map(([label, aim], i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const x = cx + Math.cos(a) * 270, y = cy + Math.sin(a) * 150;
        return (
          <g key={i}>
            <path d={line(cx + Math.cos(a) * 80, cy + Math.sin(a) * 34, x - Math.cos(a) * 70, y - Math.sin(a) * 22)} className={aim ? 'd-line-acc' : 'd-line'} />
            <Box x={x - 78} y={y - 22} w={156} h={44} tone={aim ? 'acc' : 'box'} label={label} cls="d-sub" />
          </g>
        );
      })}
      <Box x={cx - 85} y={cy - 26} w={170} h={52} tone="box2" label={s('Sistem\nProgramlama', 'System\nProgramming')} cls="d-title" />
      <T x={360} y={398} cls="d-muted">{s('* bu dersin amaçları — kullanılan dil: C', '* aims of this course — language used: C')}</T>
    </Svg>
  );
}

export function UnixTimeline() {
  const s = useS();
  const X = (y: number) => 50 + (y - 1969) * 29;
  const ev = (year: number, row: number, label: string, tone: 'box' | 'acc' | 'info' | 'warn' = 'box') => {
    const y = [60, 160, 250][row];
    return (
      <g key={label}>
        <line x1={X(year)} y1={y + 20} x2={X(year)} y2={312} className="d-dash" />
        <Box x={X(year) - 52} y={y - 20} w={104} h={40} tone={tone} label={label} cls="d-sub" />
      </g>
    );
  };
  return (
    <Svg w={760} h={360} title={s('UNIX tarihinin önemli adımları', 'Milestones in UNIX history')}>
      <T x={8} y={22} anchor="start" cls="d-acc-text">{s('Bell Labs / AT&T', 'Bell Labs / AT&T')}</T>
      <T x={8} y={122} anchor="start" cls="d-acc-text">{s('Berkeley (BSD)', 'Berkeley (BSD)')}</T>
      <T x={8} y={212} anchor="start" cls="d-acc-text">{s('Bağımsız UNIX benzeri', 'Independent UNIX-like')}</T>
      {ev(1969, 0, s('1. sürüm\nThompson, PDP-11', 'Version 1\nThompson, PDP-11'), 'acc')}
      {ev(1978, 0, s('7. sürüm', 'Version 7'))}
      {ev(1983, 0, 'System V')}
      {ev(1989, 0, s('System V.4\n“Standart” UNIX', 'System V R4\n“Standard” UNIX'), 'acc')}
      {ev(1980, 1, 'BSD 4.1', 'info')}
      {ev(1987, 1, 'BSD 4.3', 'info')}
      {ev(1990, 2, 'MINIX', 'warn')}
      {ev(1991, 2, 'Linux', 'warn')}
      <Arrow d={line(X(1969) + 52, 60, X(1978) - 52, 60)} />
      <Arrow d={line(X(1978) + 52, 60, X(1983) - 52, 60)} />
      <Arrow d={line(X(1983) + 52, 60, X(1989) - 52, 60)} />
      <Arrow d={`M${X(1978)},80 C${X(1978)},140 ${X(1980) - 60},160 ${X(1980) - 52},160`} />
      <Arrow d={line(X(1980) + 52, 160, X(1987) - 52, 160)} />
      <Arrow d={`M${X(1987) + 52},150 C${X(1989) - 10},150 ${X(1989)},110 ${X(1989)},80`} dashed />
      <line x1={40} y1={312} x2={730} y2={312} className="d-line" />
      {[1969, 1975, 1980, 1985, 1990].map((y) => (
        <g key={y}><line x1={X(y)} y1={308} x2={X(y)} y2={316} className="d-line" /><T x={X(y)} y={332} cls="d-muted">{String(y)}</T></g>
      ))}
    </Svg>
  );
}

export function UnixMerge() {
  const s = useS();
  const vers = ['UNIX System V', 'SunOS', '4.3 BSD', 'XENIX'];
  const stds = ['POSIX 1003.1', 'X/Open XPG3', 'ANSI X3J11 C'];
  return (
    <Svg w={700} h={300} title={s('Sürümler ve standartlar SVR4’te birleşir', 'Versions and standards merge into SVR4')}>
      <T x={95} y={20} cls="d-acc-text">{s('Sürümler', 'Versions')}</T>
      <T x={605} y={20} cls="d-acc-text">{s('Standartlar', 'Standards')}</T>
      {vers.map((v, i) => (
        <g key={v}>
          <Box x={20} y={40 + i * 62} w={150} h={40} label={v} />
          <Arrow d={`M170,${60 + i * 62} C220,${60 + i * 62} 230,150 270,150`} />
        </g>
      ))}
      {stds.map((v, i) => (
        <g key={v}>
          <Box x={530} y={70 + i * 62} w={150} h={40} tone="info" label={v} />
          <Arrow d={`M530,${90 + i * 62} C480,${90 + i * 62} 470,150 430,150`} />
        </g>
      ))}
      <Box x={270} y={110} w={160} h={80} tone="acc" label={s('UNIX System V\nSürüm 4', 'UNIX System V\nRelease 4')} sub={s('“Standart” UNIX', '“Standard” UNIX')} />
    </Svg>
  );
}

export function UnixLayers({ selected, onSelect }: { selected?: string; onSelect?: (id: string) => void }) {
  const s = useS();
  const sel = (id: string) => (onSelect ? { className: 'svg-btn', role: 'button', tabIndex: 0, 'aria-pressed': selected === id, onClick: () => onSelect(id), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); } } } : {});
  const tone = (id: string, base: 'box' | 'box2' | 'acc' | 'info' | 'warn' = 'box') => (selected === id ? 'acc' : base);
  return (
    <Svg w={720} h={470} title={s('UNIX’in temel modülleri', 'Basic modules of UNIX')}>
      <rect x={10} y={10} width={700} height={110} rx={10} className="d-box2" />
      <T x={700} y={26} anchor="end" cls="d-muted">{s('Kullanıcı seviyesi', 'User level')}</T>
      <g {...sel('programs')}><Box x={30} y={40} w={200} h={60} tone={tone('programs')} label={s('Kullanıcı programları', 'User programs')} sub={s('ve OS komutları', 'and OS commands')} /></g>
      <g {...sel('shell')}><Box x={260} y={40} w={180} h={60} tone={tone('shell')} label={s('Kabuk', 'Shell')} sub="sh, bash…" /></g>
      <g {...sel('library')}><Box x={470} y={40} w={220} h={60} tone={tone('library')} label={s('Kütüphaneler', 'Libraries')} sub="libc: printf, atoi…" /></g>
      <g {...sel('sci')}><Box x={10} y={135} w={700} h={40} tone={tone('sci', 'warn')} label={s('Sistem çağrısı arayüzü (system call interface)', 'System call interface')} /></g>
      <rect x={10} y={190} width={700} height={170} rx={10} className="d-box2" />
      <T x={700} y={206} anchor="end" cls="d-muted">{s('Çekirdek seviyesi', 'Kernel level')}</T>
      <g {...sel('fs')}>
        <Box x={30} y={218} w={300} h={56} tone={tone('fs')} label={s('Dosya alt sistemi', 'File subsystem')} />
      </g>
      <g {...sel('drivers')}>
        <Box x={30} y={288} w={140} h={56} tone={tone('drivers')} label={s('Karakter G/Ç', 'Character I/O')} cls="d-sub" />
        <Box x={190} y={288} w={140} h={56} tone={tone('drivers')} label={s('Blok G/Ç', 'Block I/O')} cls="d-sub" />
      </g>
      <g {...sel('proc')}>
        <Box x={360} y={218} w={330} h={126} tone={tone('proc')} label={s('İşlem yönetimi', 'Process management')} sub={s('zamanlama, fork/exec, IPC\n+ Bellek yönetimi', 'scheduling, fork/exec, IPC\n+ Memory management')} />
      </g>
      <g {...sel('hwc')}><Box x={10} y={372} w={700} h={36} tone={tone('hwc', 'box')} label={s('Cihaz sürücüleri ve donanım kontrolü', 'Device drivers & hardware control')} /></g>
      <g {...sel('hw')}><Box x={10} y={420} w={700} h={40} tone={tone('hw', 'info')} label={s('Donanım (işlemci, bellek, diskler, terminaller, ağ)', 'Hardware (CPU, memory, disks, terminals, network)')} /></g>
      <Arrow d={line(130, 100, 130, 133)} both />
      <Arrow d={line(580, 100, 580, 133)} both />
      <Arrow d={line(180, 177, 180, 216)} both />
      <Arrow d={line(525, 177, 525, 216)} both />
    </Svg>
  );
}

export function KernelServices() {
  const s = useS();
  return (
    <Svg w={680} h={330} title={s('UNIX ve temel servisleri', 'UNIX and its basic services')}>
      <T x={170} y={18} cls="d-acc-text">{s('Kullanıcı işlemleri', 'User processes')}</T>
      <T x={520} y={18} cls="d-acc-text">{s('Sistem işlemleri', 'System processes')}</T>
      {[0, 1, 2].map((i) => <Box key={i} x={70 + i * 70} y={32} w={56} h={40} label={s('K', 'U')} sub="" />)}
      {[0, 1].map((i) => <Box key={i} x={470 + i * 70} y={32} w={56} h={40} tone="info" label="S" />)}
      {[0, 1, 2].map((i) => <Arrow key={i} d={line(98 + i * 70, 72, 98 + i * 70, 116)} both />)}
      {[0, 1].map((i) => <Arrow key={i} d={line(498 + i * 70, 72, 498 + i * 70, 116)} both />)}
      <line x1={30} y1={118} x2={650} y2={118} stroke="var(--warn)" strokeWidth={2} strokeDasharray="6 4" />
      <T x={34} y={108} anchor="start" cls="d-warn-text">{s('sistem çağrısı arayüzü', 'system call interface')}</T>
      <Box x={60} y={130} w={560} h={80} tone="acc" label={s('Çekirdek (Kernel)', 'Kernel')} sub={s('başlatma · işlem · bellek · dosya sistemi · G/Ç · iletişim', 'init · processes · memory · file system · I/O · communication')} />
      <line x1={30} y1={222} x2={650} y2={222} stroke="var(--text-3)" strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={34} y={236} anchor="start" cls="d-muted">{s('cihazlara olan arayüz', 'interface to devices')}</T>
      {[s('Disk', 'Disk'), s('Terminal', 'Terminal'), 'LAN', 'Modem'].map((d, i) => (
        <g key={d}>
          <Arrow d={line(150 + i * 130, 212, 150 + i * 130, 258)} both />
          <Box x={100 + i * 130} y={260} w={100} h={44} tone="box2" label={d} />
        </g>
      ))}
      <T x={340} y={322} cls="d-muted">{s('Cihazlar (devices)', 'Devices')}</T>
    </Svg>
  );
}

export function CompilePipeline() {
  const s = useS();
  const rows: [string, string, 'box' | 'acc' | 'info'][] = [
    [s('Kaynak dosya', 'Source file'), 'myprog.c', 'box'],
    [s('Önişlemci', 'Preprocessor'), 'cpp', 'acc'],
    [s('Ara kaynak dosyası', 'Intermediate source'), 'myprog.i', 'box'],
    [s('C derleyicisi', 'C compiler'), 'cc1 (+ as)', 'acc'],
    [s('Nesne dosyası', 'Object file'), 'myprog.o', 'box'],
    [s('Bağlayıcı', 'Linker'), 'ld', 'acc'],
    [s('Çalıştırılabilir dosya', 'Executable file'), 'myprog', 'info'],
  ];
  const notes = [
    s('önişlemci yönlendiricileri (#) + C komutları', 'preprocessor directives (#) + C statements'),
    s('#include/#define işlenir', '#include / #define are processed'),
    s('sadece C komutları', 'C statements only'),
    s('kaynak kodu makine (assembly) koduna çevirir', 'translates source into machine (assembly) code'),
    s('makine kodu + bağlayıcı için bilgi', 'machine code + information for the linker'),
    s('kütüphane fonksiyonlarını ve diğer dosyalardaki fonksiyonları birleştirir', 'combines library functions and functions from other files'),
    s('makine programı', 'machine program'),
  ];
  return (
    <Svg w={680} h={560} title={s('Bir C programının derleme adımları', 'Steps of building a C program')}>
      {rows.map(([label, sub, tone], i) => {
        const y = 14 + i * 76;
        const isStage = tone === 'acc';
        return (
          <g key={i}>
            <Box x={isStage ? 80 : 60} y={y} w={isStage ? 200 : 240} h={50} tone={tone} label={label} sub={sub} rx={isStage ? 25 : 6} />
            {i < rows.length - 1 && <Arrow d={line(180, y + 50, 180, y + 74)} tone={isStage ? 'acc' : 'muted'} />}
            <T x={330} y={y + 25} anchor="start" cls="d-sub">{notes[i]}</T>
          </g>
        );
      })}
      <Box x={430} y={392} w={210} h={44} tone="box2" label={s('Nesne dosyası kütüphanesi', 'Library of object files')} sub="libc.a / libc.so" cls="d-sub" />
      <Arrow d="M430,414 C380,414 320,414 282,420" />
    </Svg>
  );
}

export function ArgvStructure() {
  const s = useS();
  const args = ['copy', 'text1.c', 'text2.c'];
  return (
    <Svg w={680} h={270} title={s('argv[] yapısı', 'Structure of argv[]')}>
      <T x={20} y={20} anchor="start" cls="d-mono">% copy text1.c text2.c</T>
      <T x={60} y={50} cls="d-acc-text">argv</T>
      <rect x={40} y={60} width={40} height={30} className="d-acc" />
      <circle cx={60} cy={75} r={3} className="d-fill-acc" />
      <Arrow d="M60,78 L60,96 L104,96" tone="acc" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <T x={96} y={100 + i * 40} anchor="end" cls="d-muted">{`[${i}]`}</T>
          <rect x={106} y={84 + i * 40} width={60} height={34} className={i === 3 ? 'd-box2' : 'd-box'} />
          {i < 3 ? <circle cx={136} cy={101 + i * 40} r={3} className="d-fill-text" /> : <T x={136} y={101 + i * 40} cls="d-mono">NULL</T>}
        </g>
      ))}
      {args.map((a, i) => {
        const chars = [...a, '\\0'];
        return (
          <g key={a}>
            <Arrow d={line(140, 101 + i * 40, 218, 101 + i * 40)} />
            {chars.map((c, j) => (
              <g key={j}>
                <rect x={220 + j * 28} y={86 + i * 40} width={28} height={30} className={c === '\\0' ? 'd-box2' : 'd-box'} />
                <T x={234 + j * 28} y={101 + i * 40} cls={c === '\\0' ? 'd-muted' : 'd-mono'}>{c}</T>
              </g>
            ))}
          </g>
        );
      })}
      <T x={20} y={250} anchor="start" cls="d-sub">{s('argc = 3  ·  argv[0] program adı  ·  argv[argc] == NULL  ·  her argüman \\0 ile biten bir dizgidir', 'argc = 3  ·  argv[0] is the program name  ·  argv[argc] == NULL  ·  every argument is a \\0-terminated string')}</T>
    </Svg>
  );
}
