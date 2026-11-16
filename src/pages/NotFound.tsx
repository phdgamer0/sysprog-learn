import { useI18n } from '../i18n';
import { href } from '../lib/router';

export function NotFound({ text }: { text?: string }) {
  const { t } = useI18n();
  return (
    <div className="page-narrow" style={{ padding: '40px 0' }}>
      <h1>404</h1>
      <p className="lead">{text ?? t('common.notFound')}</p>
      <a className="btn primary" href={href()}>{t('common.goHome')}</a>
    </div>
  );
}
