import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Bell, CheckCheck, Clock, HeartHandshake, Inbox, TriangleAlert } from 'lucide-react';

import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import BusinessCard from '../../components/business/BusinessCard.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/businessService.js';
import { getErrorMessage } from '../../utils/errors.js';
import { timeAgo } from '../../utils/format.js';
import './BusinessNotifications.css';

const TYPE_ICONS = { request: Inbox, expiry: Clock, donation: HeartHandshake, system: Bell };

function BusinessNotifications() {
  const { refreshUnread } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);
  const { data, loading, error, reload } = useFetch(() => getNotifications({ page, limit: 10 }), page);

  const handleOpen = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationRead(notification.id);
        refreshUnread();
      } catch (err) {
        toast.error(getErrorMessage(err));
        return;
      }
    }
    if (notification.link) navigate(notification.link);
    else reload({ silent: true });
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      toast.success('All notifications marked as read.');
      await reload({ silent: true });
      refreshUnread();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMarkingAll(false);
    }
  };

  let body;
  if (loading && !data) {
    body = (
      <div className="notif-skeletons" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="row" />
        ))}
      </div>
    );
  } else if (error && !data) {
    body = (
      <EmptyState icon={TriangleAlert} tone="error" title="Could not load notifications" text={error}>
        <Button size="sm" variant="outline" onClick={() => reload()}>
          Try again
        </Button>
      </EmptyState>
    );
  } else if (!data || data.notifications.length === 0) {
    body = (
      <EmptyState
        icon={Bell}
        title="You're all caught up"
        text="New requests, expiry reminders and pickup updates will appear here."
      />
    );
  } else {
    body = (
      <>
        <ul className="notif-list">
          {data.notifications.map((notification) => {
            const Icon = TYPE_ICONS[notification.type] || Bell;
            const interactive = !notification.isRead || Boolean(notification.link);
            const Tag = interactive ? 'button' : 'div';

            return (
              <li key={notification.id}>
                <Tag
                  {...(interactive ? { type: 'button', onClick: () => handleOpen(notification) } : {})}
                  className={`notif ${notification.isRead ? '' : 'notif--unread'}`}
                >
                  <span className={`notif__icon notif__icon--${notification.type}`}>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="notif__body">
                    <span className="notif__title">{notification.title}</span>
                    <span className="notif__message">{notification.message}</span>
                    <span className="notif__time">{timeAgo(notification.createdAt)}</span>
                  </span>
                  {!notification.isRead && <span className="notif__dot" aria-label="Unread" />}
                </Tag>
              </li>
            );
          })}
        </ul>
        <Pagination pagination={data.pagination} onChange={setPage} />
      </>
    );
  }

  return (
    <div className="notif-page">
      <BusinessCard
        title="Notifications"
        subtitle={data ? `${data.unreadCount} unread` : ''}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            loading={markingAll}
            disabled={!data || data.unreadCount === 0}
            leftIcon={<CheckCheck size={16} aria-hidden="true" />}
          >
            Mark all as read
          </Button>
        }
      >
        {body}
      </BusinessCard>
    </div>
  );
}

export default BusinessNotifications;