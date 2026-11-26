import useInView from '../../hooks/useInView.js';
import './Reveal.css';
function Reveal({
  children,
  as: Tag = 'div',
  direction = 'up',
  delay = 0,
  fill = false,
  className = '',
}) {
  const [ref, inView] = useInView();

  const classes = [
    'reveal',
    `reveal--${direction}`,
    delay > 0 ? `reveal--delay-${Math.min(delay, 5)}` : '',
    fill ? 'reveal--fill' : '',
    inView ? 'reveal--visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes}>
      {children}
    </Tag>
  );
}

export default Reveal;