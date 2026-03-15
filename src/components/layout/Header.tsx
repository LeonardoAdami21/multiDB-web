interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const Header = ({ title, subtitle, action }: HeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-primary tracking-tight leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted text-xs font-mono mt-1.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default Header;
