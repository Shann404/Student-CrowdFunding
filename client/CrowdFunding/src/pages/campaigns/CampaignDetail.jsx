import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCampaign } from '../../store/slices/campaignSlice';
import { fetchCampaignDonations, createDonation } from '../../store/slices/donationSlice'; // This should work now

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCampaign, loading } = useSelector(state => state.campaigns);
  const { campaignDonations } = useSelector(state => state.donations);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('updates');

  useEffect(() => {
    dispatch(fetchCampaign(id));
    dispatch(fetchCampaignDonations(id));
  }, [dispatch, id]);

  const handleDonation = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!donationAmount || donationAmount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    const donationData = {
      campaignId: id,
      amount: parseFloat(donationAmount),
      message,
      isAnonymous
    };

    const result = await dispatch(createDonation(donationData));
    if (result.type === 'donations/createDonation/fulfilled') {
      setShowDonationModal(false);
      setDonationAmount('');
      setMessage('');
      setIsAnonymous(false);
      
      // Refresh campaign data to update progress
      dispatch(fetchCampaign(id));
      dispatch(fetchCampaignDonations(id));
      
      alert('Thank you for your donation!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentCampaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Campaign Not Found</h2>
          <p className="text-gray-600">The campaign you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const progress = (currentCampaign.currentAmount / currentCampaign.targetAmount) * 100;
  const daysLeft = Math.ceil((new Date(currentCampaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  // Verification badges
  const VerificationBadge = ({ verified, label }) => (
    <div className={`flex items-center space-x-2 ${verified ? 'text-green-600' : 'text-gray-400'}`}>
      <svg className={`w-5 h-5 ${verified ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Campaign Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-96 bg-gray-200">
            {currentCampaign.images && currentCampaign.images.length > 0 ? (
              <img 
                src={currentCampaign.images[0].url} 
                alt={currentCampaign.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14v6l9-5-9-5-9 5 9 5z" />
                </svg>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
              {/* Campaign Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {currentCampaign.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    daysLeft <= 7 ? 'bg-red-100 text-red-800' : 
                    daysLeft <= 30 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentCampaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    currentCampaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {currentCampaign.status.replace('_', ' ')}
                  </span>
                  {currentCampaign.verificationStatus?.overallStatus === 'verified' && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      ✅ Verified
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {currentCampaign.title}
                </h1>

                {/* Verification Status */}
                {currentCampaign.verificationStatus && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-3">Verification Status</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <VerificationBadge 
                        verified={currentCampaign.verificationStatus.studentVerified} 
                        label="Student Verified" 
                      />
                      <VerificationBadge 
                        verified={currentCampaign.verificationStatus.documentsVerified} 
                        label="Documents Verified" 
                      />
                      <VerificationBadge 
                        verified={currentCampaign.verificationStatus.institutionVerified} 
                        label="Institution Verified" 
                      />
                      <VerificationBadge 
                        verified={currentCampaign.verificationStatus.financialsVerified} 
                        label="Financials Verified" 
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-lg font-medium">
                      {currentCampaign.student?.name?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {currentCampaign.student?.name || 'Student'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Campaign created {new Date(currentCampaign.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {currentCampaign.description}
                </p>
              </div>

              {/* Donation Card */}
              <div className="lg:w-96">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Raised</span>
                      <span className="text-gray-600">Goal</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-800">
                        ${currentCampaign.currentAmount?.toLocaleString() || '0'}
                      </span>
                      <span className="text-gray-600">
                        of ${currentCampaign.targetAmount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-center text-sm text-gray-500 mt-1">
                      {progress.toFixed(1)}% funded
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-gray-600 mb-2">
                      {campaignDonations?.length || 0} people have donated
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDonationModal(true)}
                    disabled={currentCampaign.status !== 'active' || currentCampaign.verificationStatus?.overallStatus !== 'verified'}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 font-semibold text-lg"
                  >
                    {currentCampaign.status === 'active' && currentCampaign.verificationStatus?.overallStatus === 'verified' 
                      ? 'Support This Campaign' 
                      : currentCampaign.verificationStatus?.overallStatus !== 'verified'
                      ? 'Under Verification'
                      : 'Campaign Ended'
                    }
                  </button>

                  <p className="text-center text-gray-500 text-sm mt-3">
                    Secure payment processed by Stripe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('updates')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'updates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Campaign Updates
              </button>
              <button
                onClick={() => setActiveTab('verification')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'verification'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Verification Details
              </button>
              <button
                onClick={() => setActiveTab('supporters')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'supporters'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Supporters
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'updates' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Campaign Updates</h2>
                {currentCampaign.updates && currentCampaign.updates.length > 0 ? (
                  <div className="space-y-6">
                    {currentCampaign.updates.map((update, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h3 className="font-semibold text-gray-800 mb-1">{update.title}</h3>
                        <p className="text-gray-600 mb-2">{update.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(update.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No updates yet. Check back later!
                  </p>
                )}
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Institution Details */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">🏫 Institution Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700">Institution</label>
                        <p className="text-blue-900">{currentCampaign.institutionDetails?.institutionName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700">Student ID</label>
                        <p className="text-blue-900">{currentCampaign.institutionDetails?.studentId || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700">Academic Period</label>
                        <p className="text-blue-900">{currentCampaign.institutionDetails?.academicPeriod || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">💰 Financial Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-green-700">Total Fees:</span>
                        <span className="font-semibold text-green-900">
                          ${currentCampaign.feeStructure?.totalFees?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Amount Paid:</span>
                        <span className="font-semibold text-green-900">
                          ${currentCampaign.feeStructure?.amountPaid?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-green-200 pt-2">
                        <span className="text-green-700 font-semibold">Outstanding Balance:</span>
                        <span className="font-bold text-green-900">
                          ${currentCampaign.feeStructure?.outstandingBalance?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Instructions */}
                {currentCampaign.paymentInstructions?.instructions && (
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4">🏦 Payment Instructions</h3>
                    <p className="text-purple-900 whitespace-pre-wrap">
                      {currentCampaign.paymentInstructions.instructions}
                    </p>
                    {currentCampaign.paymentInstructions.paymentVerified && (
                      <div className="flex items-center mt-3 text-green-600">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Payment methods verified by institution</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Verification Documents */}
                {currentCampaign.verificationDocuments && currentCampaign.verificationDocuments.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-4">📄 Verification Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentCampaign.verificationDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-700 capitalize">
                              {doc.documentType.replace('_', ' ')}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            doc.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            doc.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.verificationStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'supporters' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Supporters</h2>
                {campaignDonations && campaignDonations.length > 0 ? (
                  <div className="space-y-4">
                    {campaignDonations.slice(0, 10).map(donation => (
                      <div key={donation._id} className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            {donation.isAnonymous ? (
                              <span className="text-blue-600 text-sm font-medium">A</span>
                            ) : (
                              <span className="text-blue-600 text-sm font-medium">
                                {donation.donor?.name?.charAt(0) || 'D'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {donation.isAnonymous ? 'Anonymous Donor' : donation.donor?.name}
                            </p>
                            {donation.message && (
                              <p className="text-gray-600 text-sm">"{donation.message}"</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${donation.amount}</p>
                          <p className="text-gray-500 text-sm">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Be the first to support this campaign!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Make a Donation</h2>
            
            <form onSubmit={handleDonation}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add an encouraging message..."
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Donate anonymously</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDonationModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Donate Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;