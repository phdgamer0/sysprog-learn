import type { ComponentType } from 'react';
import { ArgvStructure, CompilePipeline, KernelServices, SysprogMap, UnixLayers, UnixMerge, UnixTimeline } from './d12';
import {
  CpuModes, ForkAddressSpace, ForkBasic, GetpidFlow, LibVsSyscall, OrphanTimeline, ProcessHierarchy,
  ProcessStates, SyscallErrorFlow, WaitExitSync, WaitFlowchart, ZombieCases,
} from './d34';
import { ExecNoReturn, ExecReplace, MemoryLayout, ShellBackground, ShellForeground, SystemFlow } from './d5';
import type { DiagramId } from './ids';

export const DIAGRAM_COMPONENTS: Record<DiagramId, ComponentType> = {
  'sysprog-map': SysprogMap,
  'unix-timeline': UnixTimeline,
  'unix-merge': UnixMerge,
  'unix-layers': () => <UnixLayers />,
  'kernel-services': KernelServices,
  'compile-pipeline': CompilePipeline,
  'argv-structure': ArgvStructure,
  'cpu-modes': CpuModes,
  'lib-vs-syscall': LibVsSyscall,
  'getpid-flow': () => <GetpidFlow />,
  'syscall-error-flow': SyscallErrorFlow,
  'process-hierarchy': ProcessHierarchy,
  'fork-basic': ForkBasic,
  'orphan-timeline': OrphanTimeline,
  'fork-address-space': ForkAddressSpace,
  'wait-exit-sync': WaitExitSync,
  'wait-flowchart': WaitFlowchart,
  'zombie-cases': ZombieCases,
  'process-states': () => <ProcessStates />,
  'exec-replace': ExecReplace,
  'exec-noreturn': ExecNoReturn,
  'system-flow': SystemFlow,
  'shell-foreground': ShellForeground,
  'shell-background': ShellBackground,
  'memory-layout': () => <MemoryLayout />,
};

export function DiagramView({ id }: { id: DiagramId }) {
  const C = DIAGRAM_COMPONENTS[id];
  return <C />;
}
