import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Inbox, Package, TriangleAlert, TrendingUp } from 'lucide-react';

import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Skeleton from '../common/Skeleton.jsx';
import { formatNumber } from '../../utils/format.js';
import BusinessCard from './BusinessCard.jsx';
import './DonationChart.css';

// Same colours as the CSS variables (SVG charts need plain colour values)
const COLORS = {
  primary: '#176B4D',
  dark: '#104C37',
  mid: '#3C9D78',
  orange: '#F4A340',
  red: '#C0392B',
  grid: '#E5EBE6',
  muted: '#718078',
};
const CATEGORY_COLORS = [COLORS.primary, COLORS.orange, COLORS.mid, COLORS.dark, '#8CCBAA', '#D98A27', '#5E7F70', '#B7D9C6'];
const STATUS_COLORS = { pending: COLORS.orange, accepted: COLORS.mid, collected: COLORS.primary, rejected: COLORS.red };
const STATUS_LABELS = { pending: 'Pending', accepted: 'Accepted', collected: 'Collected', rejected: 'Rejected' };

const EMPTY_TEXT = {
  monthly: { icon: TrendingUp, title: 'No donations yet', text: 'Collected donations will appear here month by month.' },
  category: { icon: Package, title: 'No category data yet', text: 'Once donations are collected you will see which categories help the most.' },
  status: { icon: Inbox, title: 'No requests yet', text: 'Requests from NGOs and individuals will be counted here.' },
};

const isEmptyData = (type, data) => {
  if (!data) return true;
  if (type === 'monthly') return data.every((item) => item.donations === 0);
  if (type === 'category') return data.length === 0;
  return data.every((item) => item.count === 0);
};

function MonthlyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{item.label}</strong>
      <span>
        {item.donations} donation{item.donations === 1 ? '' : 's'}
      </span>
      <span>{formatNumber(item.quantity)} units rescued</span>
    </div>
  );
}

const axisProps = {
  tick: { fill: COLORS.muted, fontSize: 12 },
  axisLine: false,
  tickLine: false,
};

function renderChart(type, data) {
  if (type === 'monthly') {
    return (
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis allowDecimals={false} {...axisProps} />
        <Tooltip content={<MonthlyTooltip />} cursor={{ fill: 'rgba(23,107,77,0.06)' }} />
        <Bar dataKey="donations" fill={COLORS.primary} radius={[8, 8, 0, 0]} maxBarSize={44} />
      </BarChart>
    );
  }

  if (type === 'category') {
    return (
      <PieChart>
        <Pie
          data={data}
          dataKey="donations"
          nameKey="category"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={3}
        >
          {data.map((item, index) => (
            <Cell key={item.category} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} donation${value === 1 ? '' : 's'}`, 'Collected']} />
        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    );
  }

  const statusData = data.map((item) => ({ ...item, label: STATUS_LABELS[item.status] }));
  return (
    <BarChart data={statusData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
      <XAxis dataKey="label" {...axisProps} />
      <YAxis allowDecimals={false} {...axisProps} />
      <Tooltip formatter={(value) => [value, 'Requests']} cursor={{ fill: 'rgba(23,107,77,0.06)' }} />
      <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
        {statusData.map((item) => (
          <Cell key={item.status} fill={STATUS_COLORS[item.status]} />
        ))}
      </Bar>
    </BarChart>
  );
}

/**
 * Props: type, title, subtitle, data, loading, error, onRetry, className
 */
function DonationChart({ type, title, subtitle, data, loading, error, onRetry, className = '' }) {
  let content;

  if (loading) {
    content = <Skeleton variant="chart" />;
  } else if (error) {
    content = (
      <EmptyState icon={TriangleAlert} tone="error" compact title="Could not load this chart" text={error}>
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </EmptyState>
    );
  } else if (isEmptyData(type, data)) {
    const empty = EMPTY_TEXT[type];
    content = <EmptyState compact icon={empty.icon} title={empty.title} text={empty.text} />;
  } else {
    content = (
      <div className={`donation-chart__scroll ${type === 'category' ? '' : 'donation-chart__scroll--wide'}`}>
        <div className="donation-chart__plot">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart(type, data)}
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <BusinessCard title={title} subtitle={subtitle} className={className}>
      {content}
    </BusinessCard>
  );
}

export default DonationChart;