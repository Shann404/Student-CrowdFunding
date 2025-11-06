import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserCampaigns } from '../../store/slices/campaignSlice';
import { fetchDonorProfile, fetchDonorDonations } from '../../store/slices/donorSlice'; // Add this import

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { userCampaigns } = useSelector(state => state.campaigns);
  const { donor, donations, loading } = useSelector(state => state.donor); // Update this line

  useEffect(() => {
    if (user?.role === 'student') {
      dispatch(fetchUserCampaigns());
    } else if (user?.role === 'donor') {
      dispatch(fetchDonorProfile()); // Replace fetchUserDonations with these
      dispatch(fetchDonorDonations());
    }
  }, [dispatch, user]);

  if (!user) return null;

   if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome, Administrator!</h1>
            <p className="text-gray-600 mb-6">
              You are logged in as a system administrator. Use the Admin Dashboard to manage the platform.
            </p>
            <Link
              to="/admin"
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition duration-300 font-semibold text-lg inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Go to Admin Dashboard
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">Admin</div>
                <div className="text-gray-600">System Administrator</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Full</div>
                <div className="text-gray-600">Platform Access</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Manage</div>
                <div className="text-gray-600">All Users & Campaigns</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <EnhancedDonorDashboard donor={donor} donations={donations} loading={loading} user={user} />
        )}
      </div>
    </div>
  );
};

// Your existing StudentDashboard remains the same
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

// Enhanced DonorDashboard component
const EnhancedDonorDashboard = ({ donor, donations, loading, user }) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600">
                Thank you for supporting students in their educational journey.
              </p>
            </div>
            <Link
              to="/campaigns"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 mt-4 md:mt-0"
            >
              Browse Campaigns
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${donor?.totalDonated?.toLocaleString() || '0'}
                </div>
                <div className="text-gray-600">Total Donated</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {donor?.campaignsSupported?.length || '0'}
                </div>
                <div className="text-gray-600">Campaigns Supported</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {donations?.length || '0'}
                </div>
                <div className="text-gray-600">Total Donations</div>
              </div>
            </div>

            {/* Recent Donations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Donations</h2>
              
              {donations && donations.length > 0 ? (
                <div className="space-y-4">
                  {donations.slice(0, 5).map(donation => (
                    <DonationCard key={donation._id} donation={donation} />
                  ))}
                  
                  {donations.length > 5 && (
                    <Link
                      to="/donor/donations"
                      className="block text-center text-blue-600 hover:text-blue-700 font-medium py-2"
                    >
                      View All Donations
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No donations yet</h3>
                  <p className="text-gray-500 mb-4">Make your first donation to support a student's education.</p>
                  <Link
                    to="/campaigns"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    Browse Campaigns
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/campaigns"
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Donate to Campaign
                </Link>
                <Link
                  to="/donor/profile"
                  className="block w-full bg-gray-200 text-gray-800 text-center py-2 rounded-lg hover:bg-gray-300 transition duration-300"
                >
                  Update Profile
                </Link>
                <Link
                  to="/donor/preferences"
                  className="block w-full bg-gray-200 text-gray-800 text-center py-2 rounded-lg hover:bg-gray-300 transition duration-300"
                >
                  Notification Settings
                </Link>
              </div>
            </div>

            {/* Supported Campaigns */}
            {donor?.campaignsSupported && donor.campaignsSupported.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Campaigns</h3>
                <div className="space-y-3">
                  {donor.campaignsSupported.slice(0, 3).map(supported => (
                    <Link
                      key={supported.campaign._id}
                      to={`/campaigns/${supported.campaign._id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition duration-300"
                    >
                      <h4 className="font-medium text-gray-800 line-clamp-1">
                        {supported.campaign.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ${supported.totalAmount} donated
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DonationCard = ({ donation }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <div>
          <h4 className="font-medium text-gray-800">
            {donation.campaign?.title}
          </h4>
          <p className="text-sm text-gray-600">
            {new Date(donation.createdAt).toLocaleDateString()}
            {donation.isAnonymous && ' • Anonymous'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-green-600">${donation.amount}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${
          donation.status === 'completed' ? 'bg-green-100 text-green-800' :
          donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {donation.status}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;