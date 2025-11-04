import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserCampaigns } from '../../store/slices/campaignSlice';
import { fetchUserDonations, fetchDonationStats } from '../../store/slices/donationSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { userCampaigns } = useSelector(state => state.campaigns);
  const { userDonations, stats } = useSelector(state => state.donations);

  useEffect(() => {
    if (user?.role === 'student') {
      dispatch(fetchUserCampaigns());
    } else if (user?.role === 'donor') {
      dispatch(fetchUserDonations());
      dispatch(fetchDonationStats());
    }
  }, [dispatch, user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-500">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user.name}! {user.role === 'student' ? 'Manage your campaigns here.' : 'Track your donations here.'}
          </p>
        </div>

        {user.role === 'student' ? (
          <StudentDashboard campaigns={userCampaigns} />
        ) : (
          <DonorDashboard donations={userDonations} stats={stats} />
        )}
      </div>
    </div>
  );
};

const StudentDashboard = ({ campaigns }) => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Campaigns</h3>
          <p className="text-3xl font-bold text-yellow-500">{campaigns.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Campaigns</h3>
          <p className="text-3xl font-bold text-yellow-500">
            {campaigns.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Raised</h3>
          <p className="text-3xl font-bold text-yellow-500">
            ${campaigns.reduce((total, campaign) => total + campaign.currentAmount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-yellow-500">Your Campaigns</h2>
            <Link
              to="/create-campaign"
              className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition duration-300"
            >
              Create New Campaign
            </Link>
          </div>
        </div>

        <div className="p-6">
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't created any campaigns yet.</p>
              <Link
                to="/create-campaign"
                className="bg-yellow-400 text-white px-6 py-2 rounded-lg hover:bg-yellow-500 transition duration-300"
              >
                Start Your First Campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map(campaign => (
                <div key={campaign._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{campaign.title}</h3>
                      <p className="text-gray-600 mt-1 line-clamp-2">{campaign.description}</p>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Raised: ${campaign.currentAmount.toLocaleString()}</span>
                          <span>Goal: ${campaign.targetAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(campaign.currentAmount / campaign.targetAmount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {campaign.status.replace('_', ' ')}
                      </span>
                      <Link
                        to={`/campaigns/${campaign._id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DonorDashboard = ({ donations, stats }) => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Donations</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalDonations || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Amount</h3>
          <p className="text-3xl font-bold text-green-600">
            ${(stats.totalAmount || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Students Supported</h3>
          <p className="text-3xl font-bold text-purple-600">
            {new Set(donations.map(d => d.campaign?.student)).size}
          </p>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Your Recent Donations</h2>
        </div>

        <div className="p-6">
          {donations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't made any donations yet.</p>
              <Link
                to="/campaigns"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Browse Campaigns
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.slice(0, 5).map(donation => (
                <div key={donation._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {donation.campaign?.title || 'Campaign'}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Donated: ${donation.amount} • {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
              
              {donations.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    to="/campaigns"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Donations
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;