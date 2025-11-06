import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchAdminStats, 
  fetchPendingCampaigns, 
  fetchUsers, 
  fetchDonations, 
  fetchAnalytics,
  verifyCampaign,
  toggleUserSuspension,
  flagEntity
} from '../../store/slices/adminSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { stats, pendingCampaigns, users, donations, analytics, loading } = useSelector(state => state.admin);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchAdminStats());
      dispatch(fetchPendingCampaigns());
      dispatch(fetchAnalytics());
    }
  }, [dispatch, user]);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'campaigns', name: 'Campaigns' },
              { id: 'users', name: 'Users' },
              { id: 'donations', name: 'Donations' },
              { id: 'analytics', name: 'Analytics' },
              { id: 'reports', name: 'Reports' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} pendingCampaigns={pendingCampaigns} />}
        {activeTab === 'campaigns' && <CampaignsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'donations' && <DonationsTab />}
        {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, pendingCampaigns }) => {
  if (!stats) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.stats.totalUsers} color="blue" />
        <StatCard title="Total Campaigns" value={stats.stats.totalCampaigns} color="green" />
        <StatCard title="Active Campaigns" value={stats.stats.activeCampaigns} color="purple" />
        <StatCard title="Pending Approval" value={stats.stats.pendingCampaigns} color="yellow" />
        <StatCard title="Total Donations" value={stats.stats.totalDonations} color="indigo" />
        <StatCard title="Total Raised" value={`$${stats.stats.totalAmountRaised.toLocaleString()}`} color="pink" />
        <StatCard title="Students" value={stats.stats.totalStudents} color="red" />
        <StatCard title="Donors" value={stats.stats.totalDonors} color="teal" />
      </div>

      {/* Pending Campaigns */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pending Campaign Approvals</h3>
        </div>
        <div className="p-6">
          {pendingCampaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending campaigns for approval</p>
          ) : (
            <div className="space-y-4">
              {pendingCampaigns.slice(0, 5).map(campaign => (
                <PendingCampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500'
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
      </div>
      <div className={`${colorClasses[color]} px-4 py-4 sm:px-6`}>
        <div className="text-sm text-white">
          {/* Optional: Add trend indicator */}
        </div>
      </div>
    </div>
  );
};

// Pending Campaign Card Component
const PendingCampaignCard = ({ campaign }) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');

  const handleVerification = () => {
    dispatch(verifyCampaign({ campaignId: campaign._id, action, notes }));
    setShowModal(false);
    setNotes('');
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
          <p className="text-sm text-gray-600">by {campaign.student.name}</p>
          <p className="text-sm text-gray-500">Target: ${campaign.targetAmount.toLocaleString()}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setAction('approve');
              setShowModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300"
          >
            Approve
          </button>
          <button
            onClick={() => {
              setAction('reject');
              setShowModal(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {action === 'approve' ? 'Approve Campaign' : 'Reject Campaign'}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Enter notes for ${action}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows="4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleVerification}
                className={`flex-1 text-white py-2 rounded-lg transition duration-300 ${
                  action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {action}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Other tab components (CampaignsTab, UsersTab, DonationsTab, AnalyticsTab, ReportsTab)
// Would be implemented similarly with their respective functionality

const CampaignsTab = () => {
  // Implementation for campaigns management
  return <div>Campaigns Management</div>;
};

const UsersTab = () => {
  // Implementation for users management
  return <div>Users Management</div>;
};

const DonationsTab = () => {
  // Implementation for donations management
  return <div>Donations Management</div>;
};

const AnalyticsTab = ({ analytics }) => {
  // Implementation for analytics
  return <div>Analytics Dashboard</div>;
};

const ReportsTab = () => {
  // Implementation for reports
  return <div>Reports Generator</div>;
};

export default AdminDashboard;