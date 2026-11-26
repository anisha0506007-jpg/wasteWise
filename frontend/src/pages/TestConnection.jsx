import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import Button from '../components/common/Button.jsx';
import { checkHealth } from '../services/healthService.js';
import '../styles/TestConnection.css';

function TestConnection() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

  const loadHealth = useCallback(async () => {
    try {
      const data = await checkHealth();
      setHealth(data);
      setError('');
    } catch (err) {
      setHealth(null);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to reach the backend server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Run the check once when the page opens
  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const handleRecheck = () => {
    setLoading(true);
    loadHealth();
  };

  const backendOnline = Boolean(health?.success);
  const databaseStatus = health?.database?.status;
  const databaseOnline = databaseStatus === 'connected';

  return (
    <section className="test-page">
      <div className="test-card">
        <p className="test-eyebrow">Setup Verification</p>
        <h1 className="test-title">
          Waste<span>Wise</span>
        </h1>
        <p className="test-subtitle">
          Smart Business Waste Reduction Platform
        </p>

        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">React Frontend</span>
            <span className="badge badge--success">Running</span>
          </div>

          <div className="status-item">
            <span className="status-label">Express Backend</span>
            {loading ? (
              <span className="badge badge--pending">Checking...</span>
            ) : backendOnline ? (
              <span className="badge badge--success">Connected</span>
            ) : (
              <span className="badge badge--error">Offline</span>
            )}
          </div>

          <div className="status-item">
            <span className="status-label">MongoDB Database</span>
            {loading ? (
              <span className="badge badge--pending">Checking...</span>
            ) : databaseOnline ? (
              <span className="badge badge--success">Connected</span>
            ) : (
              <span className="badge badge--error">
                {databaseStatus ? databaseStatus : 'Unknown'}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="test-error" role="alert">
            <strong>Connection problem:</strong> {error}
            <p>
              Make sure the backend is running with <code>npm run dev</code>{' '}
              inside the <code>backend</code> folder.
            </p>
          </div>
        )}

        {health && (
          <div className="test-response">
            <h2>API Response</h2>
            <pre>{JSON.stringify(health, null, 2)}</pre>
          </div>
        )}

        <Button
          onClick={handleRecheck}
          loading={loading}
          leftIcon={<RefreshCw size={16} />}
        >
          {loading ? 'Checking...' : 'Re-check Connection'}
        </Button>
      </div>
    </section>
  );
}

export default TestConnection;