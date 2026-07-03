import NotificationsBell from './notifications-bell';

const LINKS = [
  { href: '/app', label: 'Fil', key: 'fil' },
  { href: '/app/rencontre', label: 'Rencontre', key: 'rencontre' },
  { href: '/app/emploi', label: 'Emploi', key: 'emploi' },
  { href: '/app/marketplace', label: 'Market', key: 'marketplace' },
  { href: '/app/agenda', label: 'Agenda', key: 'agenda' },
];

export default function TopBar(props: { active: string }) {
  return (
    <header className="top-bar">
      <div className="top-bar-row">
        <a href="/app" className="auth-brand">
          <span className="brand-mark"></span>
          <span className="brand-word">ARC-EN-CIEL</span>
          <span className="brand-word brand-word-sub">Affair</span>
        </a>
        <div className="top-bar-actions">
          <NotificationsBell />
          <a
            href="/app/profil"
            className={'profil-link' + (props.active === 'profil' ? ' active' : '')}
            aria-label="Profil"
          >
            P
          </a>
        </div>
      </div>

      <nav className="module-nav">
        {LINKS.map((link) => (
          <a
            key={link.key}
            href={link.href}
            className={link.key + (link.key === props.active ? ' active' : '')}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
