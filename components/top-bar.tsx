import SignOutButton from '@/app/app/sign-out-button';

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
      <div className="auth-brand"><span className="brand-mark"></span>ARC-EN-CIEL Affair</div>
      <nav className="module-nav">
        {LINKS.map((link) => (
          <a key={link.key} href={link.href} className={link.key === props.active ? 'active' : ''}>
            {link.label}
          </a>
        ))}
      </nav>
      <SignOutButton />
    </header>
  );
}
