import { useI18n } from '../i18n';
import { ForkSim } from '../interactives/ForkSim';
import { PRESETS, type PresetId } from '../sim/presets';

export function Lab({ query }: { query: URLSearchParams }) {
  const { t } = useI18n();
  const code = query.get('code') ?? undefined;
  const p = query.get('preset');
  const preset = p && p in PRESETS ? (p as PresetId) : 'exam-three';
  return (
    <div className="page">
      <h1>{t('lab.title')}</h1>
      <p className="lead" style={{ marginBottom: 20 }}>{t('lab.lead')}</p>
      <ForkSim key={(code ?? '') + preset} full code={code} preset={preset} />
    </div>
  );
}
