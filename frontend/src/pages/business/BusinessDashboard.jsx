import { useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  HeartHandshake,
  Hourglass,
  Leaf,
  Package,
  Plus,
  RefreshCw,
  ShoppingBasket,
  TriangleAlert,
} from 'lucide-react';

import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ActivityList from '../../components/business/ActivityList.jsx';
import BusinessCard from '../../components/business/BusinessCard.jsx';
import DonationChart from '../../components/business/DonationChart.jsx';
import ExpiryAlerts from '../../components/business/ExpiryAlerts.jsx';
import RecentProducts from '../../components/business/RecentProducts.jsx';
import RecentRequests from '../../components/business/RecentRequests.jsx';
import StatCard from '../../components/business/StatCard.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useAuth } from '../../hooks/useAuth.js';
import {
  getActivity,
  getAnalytics,
  getDashboardStats,
  getExpiryAlerts,
  getRecentProducts,
  getRecentRequests,
} from '../../services/businessService.js';
import { formatLongDate, formatNumber, formatQuantity, getGreeting } from '../../utils/format.js';
import './BusinessDashboard.css';

function BusinessDashboard() {
  const { user } = useAuth();
  const { refreshUnread } = useOutletContext();

  // Each section loads on its own, so one failure never breaks the whole page
  const stats = useFetch(getDashboardStats);
  const analytics = useFetch(() => getAnalytics(6));
  const products = useFetch(() => getRecentProducts({ limit: 5 }));
  const requests = useFetch(() => getRecentRequests({ limit: 5 }));
  const alerts = useFetch(() => getExpiryAlerts({ limit: 5 }));
  const activity = useFetch(() => getActivity({ limit: 8 }));

  const sections = [stats, analytics, products, requests, alerts, activity];
  const isRefreshing = sections.some((section) => section.refreshing);

  // Refresh every section quietly (no skeleton flash)
  const reloadAll = () => {
    sections.forEach((section) => section.reload({ silent: true }));
    refreshUnread();
  };

  // Refresh again when the owner comes back to this browser tab
  const reloadAllRef = useRef(reloadAll);
  useEffect(() => {
    reloadAllRef.current = reloadAll;
  });
  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState === 'visible') reloadAllRef.current();
    };
    document.addEventListener('visibilitychange', handleVisible);
    return () => document.removeEventListener('visibilitychange', handleVisible);
  }, []);

  const firstName = user.name.split(' ')[0];
  const s = stats.data?.stats;

  // "Total quantity rescued": one unit -> "80 kg". Mixed units -> total + breakdown.
  const rescued = s?.quantityRescued;
  const singleUnit = rescued?.byUnit.length === 1 ? rescued.byUnit[0] : null;
  const rescuedValue = rescued
    ? singleUnit
      ? formatQuantity(singleUnit.quantity, singleUnit.unit)
      : formatNumber(rescued.value)
    : '0';
  const rescuedDescription =
    rescued && rescued.byUnit.length > 1
      ? rescued.byUnit.map((item) => formatQuantity(item.quantity, item.unit)).join(' · ')
      : 'From collected donations';

  const hasNoActivityYet =
    s && s.totalProducts.value === 0 && s.pendingRequests.value === 0 && s.successfulDonations.value === 0;

  return (
    <div className="bd">
      {/* ---------- Welcome ---------- */}
      <section className="bd-welcome">
        <div>
          <h2 className="bd-welcome__title">
            {getGreeting()}, {firstName}!
          </h2>
          <p className="bd-welcome__text">Here&apos;s what&apos;s happening with your business today.</p>
          <p className="bd-welcome__date">
            <CalendarDays size={16} aria-hidden="true" /> {formatLongDate()}
          </p>
        </div>

        <div className="bd-welcome__actions">
          <Button
            variant="outline"
            onClick={reloadAll}
            disabled={isRefreshing}
            leftIcon={<RefreshCw size={16} className={isRefreshing ? 'bd-spin' : ''} aria-hidden="true" />}
          >
            Refresh
          </Button>
          <Button to="/business/products/new" size="lg" leftIcon={<Plus size={18} aria-hidden="true" />}>
            Add Surplus Product
          </Button>
        </div>
      </section>

      {/* ---------- Statistics ---------- */}
      {stats.error && !s ? (
        <BusinessCard>
          <EmptyState icon={TriangleAlert} tone="error" compact title="Could not load your statistics" text={stats.error}>
            <Button size="sm" variant="outline" onClick={() => stats.reload()}>
              Try again
            </Button>
          </EmptyState>
        </BusinessCard>
      ) : (
        <section className="bd-stats" aria-label="Key statistics">
          <StatCard
            loading={stats.loading && !s}
            icon={Package}
            label="Total Products Listed"
            value={formatNumber(s?.totalProducts.value)}
            description="All your active and donated listings"
            trend={s?.totalProducts.trend}
            trendLabel="products listed"
          />
          <StatCard
            loading={stats.loading && !s}
            icon={ShoppingBasket}
            label="Available Products"
            value={formatNumber(s?.availableProducts.value)}
            description="In stock and ready to be requested"
          />
          <StatCard
            loading={stats.loading && !s}
            tone="dark"
            icon={HeartHandshake}
            label="Successful Donations"
            value={formatNumber(s?.successfulDonations.value)}
            description="Collected by NGOs and individuals"
            trend={s?.successfulDonations.trend}
            trendLabel="donations collected"
          />
          <StatCard
            loading={stats.loading && !s}
            tone="orange"
            icon={Hourglass}
            label="Pending Requests"
            value={formatNumber(s?.pendingRequests.value)}
            description="Waiting for your response"
            trend={s?.pendingRequests.trend}
            trendLabel="requests received"
          />
          <StatCard
            loading={stats.loading && !s}
            tone="red"
            icon={Clock}
            label="Products Near Expiry"
            value={formatNumber(s?.nearExpiry.value)}
            description={
              s?.nearExpiry.expiredCount > 0
                ? `Within 3 days · ${s.nearExpiry.expiredCount} already expired`
                : 'Expiring within the next 3 days'
            }
          />
          <StatCard
            loading={stats.loading && !s}
            icon={Leaf}
            label="Total Quantity Rescued"
            value={rescuedValue}
            description={rescuedDescription}
            trend={rescued?.trend}
            trendLabel="rescued"
          />
        </section>
      )}

      {/* ---------- First-time empty state ---------- */}
      {hasNoActivityYet && (
        <BusinessCard>
          <EmptyState
            icon={Leaf}
            title="Your dashboard is ready"
            text="Once you list surplus products and receive requests, your statistics, charts and alerts will fill in automatically."
          >
            <Button to="/business/products/new" leftIcon={<Plus size={18} aria-hidden="true" />}>
              List your first product
            </Button>
          </EmptyState>
        </BusinessCard>
      )}

      {/* ---------- Analytics ---------- */}
      <section className="bd-charts" aria-label="Donation analytics">
        <DonationChart
          type="monthly"
          className="bd-charts__monthly"
          title="Monthly Donations"
          subtitle="Collected donations, last 6 months"
          data={analytics.data?.monthly}
          loading={analytics.loading && !analytics.data}
          error={analytics.error && !analytics.data ? analytics.error : ''}
          onRetry={() => analytics.reload()}
        />
        <DonationChart
          type="category"
          title="Product Categories"
          subtitle="Collected donations by category (all time)"
          data={analytics.data?.categories}
          loading={analytics.loading && !analytics.data}
          error={analytics.error && !analytics.data ? analytics.error : ''}
          onRetry={() => analytics.reload()}
        />
        <DonationChart
          type="status"
          title="Donation Status"
          subtitle="All requests by status"
          data={analytics.data?.status}
          loading={analytics.loading && !analytics.data}
          error={analytics.error && !analytics.data ? analytics.error : ''}
          onRetry={() => analytics.reload()}
        />
      </section>

      {/* ---------- Recent products and requests ---------- */}
      <RecentProducts
        products={products.data?.products}
        loading={products.loading && !products.data}
        error={products.error && !products.data ? products.error : ''}
        onRetry={() => products.reload()}
      />
      <RecentRequests
        requests={requests.data?.requests}
        loading={requests.loading && !requests.data}
        error={requests.error && !requests.data ? requests.error : ''}
        onRetry={() => requests.reload()}
      />

      {/* ---------- Alerts and activity ---------- */}
      <section className="bd-bottom">
        <ExpiryAlerts
          data={alerts.data}
          loading={alerts.loading && !alerts.data}
          error={alerts.error && !alerts.data ? alerts.error : ''}
          onRetry={() => alerts.reload()}
        />
        <ActivityList
          activities={activity.data?.activities}
          loading={activity.loading && !activity.data}
          error={activity.error && !activity.data ? activity.error : ''}
          onRetry={() => activity.reload()}
        />
      </section>
    </div>
  );
}

export default BusinessDashboard;