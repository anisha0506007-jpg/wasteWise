import { TrendingDown, TrendingUp } from 'lucide-react';

import Skeleton from '../common/Skeleton.jsx';
import { formatNumber } from '../../utils/format.js';
import './StatCard.css';

// Trend from real data: this month compared with last month
function TrendBadge({ trend, label }) {
  if (!trend) return null;
  const { current, previous, percentChange } = trend;

  if (current === 0 && previous === 0) {
    return <span className="stat-card__trend stat-card__trend--flat">No {label} yet this month</span>;
  }
  if (percentChange === null) {
    return (
      <span className="stat-card__trend stat-card__trend--up">
        <TrendingUp size={14} aria-hidden="true" /> {formatNumber(current)} {label} this month
      </span>
    );
  }
  if (percentChange === 0) {
    return <span className="stat-card__trend stat-card__trend--flat">No change vs last month</span>;
  }

  const isUp = percentChange > 0;
  return (
    <span className={`stat-card__trend ${isUp ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
      {isUp ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
      {isUp ? '+' : ''}
      {percentChange}% vs last month
    </span>
  );
}

/**
 * Props: icon, label, value (text), description, trend, trendLabel,
 *        tone ('green' | 'orange' | 'red' | 'dark'), loading
 */
function StatCard({ icon: Icon, label, value, description, trend, trendLabel, tone = 'green', loading }) {
  if (loading) {
    return (
      <div className="stat-card" aria-busy="true">
        <Skeleton variant="circle" />
        <Skeleton variant="title" />
        <Skeleton variant="text" />
        <Skeleton variant="short" />
      </div>
    );
  }

  return (
    <article className="stat-card">
      <span className={`stat-card__icon stat-card__icon--${tone}`}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__description">{description}</p>
      <TrendBadge trend={trend} label={trendLabel} />
    </article>
  );
}

export default StatCard;