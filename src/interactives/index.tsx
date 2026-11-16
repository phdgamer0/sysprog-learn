import type { ComponentType } from 'react';
import { PRESETS, type PresetId } from '../sim/presets';
import { ForkSim } from './ForkSim';
import type { InteractiveId } from './ids';
import { ArgvBuilder, CompileBuilder, ErrnoLab, SyscallClassifier, SyscallStepper, Timeslice, UnixExplorer } from './w1';
import { ExecVsSystem, MemoryExplorer, ShellSim, StateMachine, ZombieTimeline } from './w2';

type P = Record<string, unknown> | undefined;

const REGISTRY: Record<InteractiveId, ComponentType<{ props?: P }>> = {
  'fork-sim': ({ props }) => {
    const preset = props?.preset as string | undefined;
    return <ForkSim preset={preset && preset in PRESETS ? (preset as PresetId) : undefined} />;
  },
  'argv-builder': ArgvBuilder,
  'compile-builder': CompileBuilder,
  'syscall-stepper': SyscallStepper,
  'syscall-classifier': SyscallClassifier,
  'errno-lab': ErrnoLab,
  timeslice: Timeslice,
  'state-machine': StateMachine,
  'zombie-timeline': ZombieTimeline,
  'shell-sim': ShellSim,
  'exec-vs-system': ExecVsSystem,
  'memory-explorer': MemoryExplorer,
  'unix-explorer': UnixExplorer,
};

export function InteractiveView({ id, props }: { id: InteractiveId; props?: P }) {
  const C = REGISTRY[id];
  return <C props={props} />;
}
