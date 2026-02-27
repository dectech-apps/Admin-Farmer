import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Truck, AlertCircle } from 'lucide-react';
import { adminAPI } from '../services/api';

export default function RiderDetails() {
  const { riderId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching rider details for ID:', riderId);
        const response = await adminAPI.getRiderDetails(riderId);
        console.log('Rider details response:', response.data);
        setDetails(response.data?.data || null);
      } catch (err) {
        console.error('Error fetching rider details:', err);
        setError(err.response?.data?.message || 'Failed to load rider details');
      } finally {
        setLoading(false);
      }
    };

    if (riderId) {
      fetchDetails();
    }
  }, [riderId]);

  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif', background: '#f5f2ec', minHeight: '100vh' }}>
      <Link to="/riders" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Riders
      </Link>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', background: '#0c2340', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={24} color="#7dd3fc" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Rider Details</h1>
            <p style={{ margin: '4px 0 0', color: '#888' }}>ID: {riderId}</p>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <p>Loading rider details...</p>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', color: '#dc2626' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && details && (
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Profile</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', color: '#888', width: '150px' }}>Name</td>
                  <td style={{ padding: '8px 0' }}>{details.profile?.name || '—'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: '#888' }}>Email</td>
                  <td style={{ padding: '8px 0' }}>{details.profile?.email || '—'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: '#888' }}>Phone</td>
                  <td style={{ padding: '8px 0' }}>{details.profile?.phone || '—'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: '#888' }}>Vehicle Type</td>
                  <td style={{ padding: '8px 0' }}>{details.rider?.vehicle_type || '—'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: '#888' }}>License Plate</td>
                  <td style={{ padding: '8px 0' }}>{details.rider?.license_plate || '—'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: '#888' }}>Total Deliveries</td>
                  <td style={{ padding: '8px 0' }}>{details.rider?.total_deliveries || 0}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: '#888' }}>Rating</td>
                  <td style={{ padding: '8px 0' }}>{details.rider?.rating || '0.0'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: '#888' }}>Available</td>
                  <td style={{ padding: '8px 0' }}>{details.rider?.is_available ? 'Yes' : 'No'}</td>
                </tr>
              </tbody>
            </table>

            <h2 style={{ fontSize: '18px', margin: '24px 0 16px' }}>Wallet</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', color: '#888', width: '150px' }}>Balance</td>
                  <td style={{ padding: '8px 0' }}>${details.wallet?.balance || 0}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: '#888' }}>Total Earned</td>
                  <td style={{ padding: '8px 0' }}>${details.wallet?.total_earned || 0}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '24px', padding: '16px', background: '#f0f0f0', borderRadius: '8px' }}>
              <strong>Debug - Raw Data:</strong>
              <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {!loading && !error && !details && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <p>No rider data found</p>
          </div>
        )}
      </div>
    </div>
  );
}
