import './SectionHeader.css';
function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
  titleId,
}) {
  const classes = [
    'section-header',
    `section-header--${align}`,
    light ? 'section-header--light' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={classes}>
      {eyebrow && <span className="section-header__eyebrow">{eyebrow}</span>}
      <h2 className="section-header__title" id={titleId}>
        {title}
      </h2>
      {description && (
        <p className="section-header__description">{description}</p>
      )}
    </header>
  );
}

export default SectionHeader;