import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchAdminStats, 
  fetchPendingCampaigns, 
  fetchUsers, 
  fetchDonations, 
  fetchAnalytics,
  fetchStudentProfiles,
  fetchAllCampaignsWithDetails,
  verifyCampaign,
    verifyStudentProfile,
    rejectStudentVerification,
  toggleUserSuspension,
  flagEntity
} from '../../store/slices/adminSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { 
    stats, 
    pendingCampaigns, 
    studentProfiles, 
    allCampaigns, 
    users, 
    donations, 
    analytics, 
    loading 
  } = useSelector(state => state.admin);
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchAdminStats());
      dispatch(fetchPendingCampaigns());
      dispatch(fetchAnalytics());
      dispatch(fetchStudentProfiles());
      dispatch(fetchAllCampaignsWithDetails());
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
              { id: 'students', name: 'Students' },
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
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats} 
            pendingCampaigns={pendingCampaigns} 
            studentProfiles={studentProfiles}
            allCampaigns={allCampaigns}
            loading={loading}
          />
        )}
        {activeTab === 'campaigns' && <CampaignsTab allCampaigns={allCampaigns} loading={loading} />}
        {activeTab === 'students' && <StudentsTab studentProfiles={studentProfiles} loading={loading} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'donations' && <DonationsTab />}
        {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  );
};

// Updated OverviewTab Component with proper error handling
const OverviewTab = ({ stats, pendingCampaigns, studentProfiles, allCampaigns, loading }) => {
  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) return <div>Loading statistics...</div>;

  // Safely handle studentProfiles data structure
  const profilesArray = Array.isArray(studentProfiles) 
    ? studentProfiles 
    : (studentProfiles?.studentProfiles || studentProfiles?.data || []);

  // Safely handle allCampaigns data structure
  const campaignsArray = Array.isArray(allCampaigns) 
    ? allCampaigns 
    : (allCampaigns?.campaigns || allCampaigns?.data || []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.stats?.totalUsers || 0} color="blue" />
        <StatCard title="Total Campaigns" value={stats.stats?.totalCampaigns || 0} color="green" />
        <StatCard title="Active Campaigns" value={stats.stats?.activeCampaigns || 0} color="purple" />
        <StatCard title="Pending Approval" value={stats.stats?.pendingCampaigns || 0} color="yellow" />
        <StatCard title="Total Donations" value={stats.stats?.totalDonations || 0} color="indigo" />
        <StatCard title="Total Raised" value={`$${(stats.stats?.totalAmountRaised || 0).toLocaleString()}`} color="pink" />
        <StatCard title="Students" value={stats.stats?.totalStudents || 0} color="red" />
        <StatCard title="Donors" value={stats.stats?.totalDonors || 0} color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Campaigns */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pending Campaign Approvals</h3>
          </div>
          <div className="p-6">
            {!pendingCampaigns || pendingCampaigns.length === 0 ? (
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

      {/* Recent Student Registrations */}
<div className="bg-white shadow rounded-lg">
  <div className="px-6 py-4 border-b border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900">
      Recent Student Registrations ({profilesArray.length})
    </h3>
  </div>
  <div className="p-6">
    {profilesArray.length === 0 ? (
      <p className="text-gray-500 text-center py-4">No student profiles found</p>
    ) : (
      <div className="space-y-3">
        {profilesArray.slice(0, 5).map(student => (
          <div key={student._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{student.user?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-600">{student.school?.name || 'No school'}</p>
              <p className="text-xs text-gray-500">{student.course?.name || 'No course'}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              student.status === 'rejected' ? 'bg-red-100 text-red-800' :
              student.user?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {student.status === 'rejected' ? 'Rejected' :
               student.user?.isVerified ? 'Verified' : 'Pending'}
            </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component (keep existing)
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

// Pending Campaign Card Component (keep existing)
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
          <p className="text-sm text-gray-600">by {campaign.student?.name || 'Unknown'}</p>
          <p className="text-sm text-gray-500">Target: ${campaign.targetAmount?.toLocaleString()}</p>
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

// Updated StudentsTab Component with verification handling
const StudentsTab = ({ studentProfiles, loading }) => {
  const dispatch = useDispatch();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'verified'

  // Safely handle studentProfiles data structure
  const profilesArray = Array.isArray(studentProfiles) 
    ? studentProfiles 
    : (studentProfiles?.studentProfiles || studentProfiles?.data || []);

   // CORRECTED: Filter students based on status and verification
  const filteredProfiles = profilesArray.filter(student => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !student.user?.isVerified && student.status !== 'rejected';
    if (filter === 'verified') return student.user?.isVerified && student.status !== 'rejected';
    if (filter === 'rejected') return student.status === 'rejected';
    return true;
  });

 const handleVerification = async (studentId, action, notes) => {
  try {
   console.log('Verification action:', action, 'for student:', studentId);
      
      if (action === 'reject') {
        // Use rejectStudentVerification for rejection
        const response = await dispatch(rejectStudentVerification({ 
          studentId, 
          action,
          notes 
        })).unwrap();
        
        console.log('Student rejected successfully:', response.message);
      } else {
        // Use verifyStudentProfile for verification
        const response = await dispatch(verifyStudentProfile({ 
          studentId, 
          action, 
          notes 
        })).unwrap();
        
        console.log('Student verified successfully:', response.message);
      }

      
    } catch (error) {
      console.error('Error processing student verification:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'verified','rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status} (
                {status === 'all' ? profilesArray.length :
                 status === 'pending' ? profilesArray.filter(s => !s.user?.isVerified && s.status !== 'rejected').length :
           status === 'verified' ? profilesArray.filter(s => s.user?.isVerified).length :
           profilesArray.filter(s => s.status === 'rejected').length}
              )
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Student Profiles ({filteredProfiles.length})
            {filter !== 'all' && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({profilesArray.length} total)
              </span>
            )}
          </h3>
        </div>
        <div className="p-6">
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {filter === 'pending' 
                  ? 'No pending student profiles for verification'
                  : filter === 'verified'
                  ? 'No verified student profiles'
                  : 'No student profiles found'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProfiles.map((student) => (
                <StudentProfileCard 
                  key={student._id} 
                  student={student} 
                  onViewDetails={setSelectedStudent}
                  onVerification={handleVerification}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <StudentDetailsModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
};

// Updated StudentProfileCard Component with verification buttons
const StudentProfileCard = ({ student, onViewDetails, onVerification }) => {
  const user = student.user;
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleVerification = () => {
    onVerification(student._id, action, notes);
    setShowModal(false);
    setNotes('');
  };

  const openVerificationModal = (verificationAction) => {
    setAction(verificationAction);
    setShowModal(true);
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-300">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-semibold text-gray-900">{user?.name || 'Unknown'}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                    student.status === 'rejected' ? 'bg-red-100 text-red-800' :
                user?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                    {student.status === 'rejected' ? 'Rejected' : 
                user?.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
              <div>
                <span className="font-medium">Student ID:</span> {student.studentId}
              </div>
              <div>
                <span className="font-medium">Institution:</span> {student.school?.name || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Course:</span> {student.course?.name || 'Not specified'}
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <span className="font-medium">Year of Study:</span> {student.course?.yearOfStudy || 'N/A'} | 
              <span className="font-medium ml-2">Gender:</span> {student.gender || 'Not specified'}
            </div>
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => onViewDetails(student)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
            >
              View Details
            </button>
            
            {/* Verification buttons - only show for unverified students */}
           {!user?.isVerified && student.status !== 'rejected' && (
            <div className="flex space-x-2">
              <button
                onClick={() => openVerificationModal('verify')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition duration-300"
              >
                Verify
              </button>
              <button
                onClick={() => openVerificationModal('reject')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition duration-300"
              >
                Reject
              </button>
            </div>
          )}

          {/* Show message for rejected students */}
          {student.status === 'rejected' && (
            <span className="text-red-600 text-sm font-medium">Profile Rejected</span>
          )}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {action === 'verify' ? 'Verify Student Profile' : 'Reject Student Profile'}
            </h3>
            <p className="text-gray-600 mb-4">
              {action === 'verify' 
                ? 'Are you sure you want to verify this student profile? This will allow them to create campaigns.'
                : 'Are you sure you want to reject this student profile? They will need to resubmit their documents.'
              }
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Enter notes for ${action}... (optional)`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows="3"
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
                  action === 'verify' 
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

// Updated StudentDetailsModal with verification actions
const StudentDetailsModal = ({ student, onClose }) => {
  const dispatch = useDispatch();
  const user = student.user;
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // In StudentDetailsModal component, update the handleVerification function:
const handleVerification = async () => {
  try {
    let response;
    
    if (action === 'reject') {
      // Use rejectStudentVerification for rejection
      response = await dispatch(rejectStudentVerification({ 
        studentId: student._id, 
        notes 
      })).unwrap();
    } else {
      // Use verifyStudentProfile for verification
      response = await dispatch(verifyStudentProfile({ 
        studentId: student._id, 
        action, 
        notes 
      })).unwrap();
    }
    
    console.log(`Student ${action}ed successfully:`, response.message);
    setShowVerificationModal(false);
    setNotes('');
    onClose(); // Close the modal after verification
    
  } catch (error) {
    console.error('Error verifying student:', error);
  }
};

  const openVerificationModal = (verificationAction) => {
    setAction(verificationAction);
    setShowVerificationModal(true);
  };

   const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Get the correct image URL based on your data structure
  const getStudentIdImageUrl = () => {
    // Try different possible locations for the student ID image
    return student.studentIdImage?.url || 
           student.academicDocuments?.studentIdCard?.url || 
           student.studentIdCard?.url;
  };

  const studentIdImageUrl = getStudentIdImageUrl();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">Student Profile Details</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  student.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  user?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {student.status === 'rejected' ? 'Rejected' :
                   user?.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{user?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{user?.email || 'No email'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Student ID</label>
                    <p className="text-gray-900">{student.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900 capitalize">{student.gender || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Academic Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Institution</label>
                    <p className="text-gray-900">{student.school?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Institution Type</label>
                    <p className="text-gray-900 capitalize">{student.school?.type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Course/Program</label>
                    <p className="text-gray-900">{student.course?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Year of Study</label>
                    <p className="text-gray-900">{student.course?.yearOfStudy || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Program Duration</label>
                    <p className="text-gray-900">{student.course?.duration || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(student.bio || student.academicPerformance || student.futureGoals) && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Additional Information</h4>
                <div className="space-y-4">
                  {student.bio && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bio</label>
                      <p className="text-gray-900 mt-1">{student.bio}</p>
                    </div>
                  )}
                  {student.academicPerformance && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Academic Performance</label>
                      <p className="text-gray-900 mt-1">{student.academicPerformance}</p>
                    </div>
                  )}
                  {student.futureGoals && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Future Goals</label>
                      <p className="text-gray-900 mt-1">{student.futureGoals}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Student ID Image Section */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Student ID Verification</h4>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {studentIdImageUrl ? (
                  <div className="text-center">
                    <div className="relative inline-block">
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                      <img
                        src={`http://localhost:5000${student.academicDocuments?.studentIdCard?.url}`}
                        alt="Student ID Card"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        className={`max-w-full max-h-96 object-contain mx-auto rounded-lg shadow-sm ${
                          imageLoading ? 'opacity-0' : 'opacity-100'
                        } transition-opacity duration-300`}
                      />
                    </div>
                    
                    {imageError ? (
                    <div className="text-center py-4 text-red-600">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p>Failed to load student ID image</p>
                    </div>
                  ) : (
                    <>
                     
                      <p className="text-sm text-gray-500 mt-2">
                        Uploaded: {
                          student.academicDocuments?.studentIdCard?.url
                            ? new Date(parseInt(student.academicDocuments.studentIdCard.url.match(/\d+/)?.[0])).toLocaleDateString()
                            : 'Date not available'
                        }
                      </p>

                        <div className="mt-4 flex space-x-2 justify-center">
                          <button
                            onClick={() => window.open(`http://localhost:5000${student.academicDocuments?.studentIdCard?.url}`, '_blank')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            Open Full Size
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = studentIdImageUrl;
                              link.download = `student-id-${user?.name || 'unknown'}.jpg`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                          >
                            Download
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No Student ID Image Available</p>
                    <p className="text-sm mt-1">Student has not uploaded their ID card</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                  {!user?.isVerified && student.status !== 'rejected' && (
      <div className="flex space-x-2">
        <button
          onClick={() => openVerificationModal('verify')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300"
        >
          Verify Student
        </button>
        <button
          onClick={() => openVerificationModal('reject')}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
        >
          Reject Profile
        </button>
      </div>
          )}
          {student.status === 'rejected' && (
            <div className="text-red-600 font-medium">
              This profile has been rejected
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
        >
          Close
        </button>
      </div> 
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {action === 'verify' ? 'Verify Student Profile' : 'Reject Student Profile'}
            </h3>
            <p className="text-gray-600 mb-4">
              {action === 'verify' 
                ? 'Are you sure you want to verify this student profile? This will allow them to create campaigns.'
                : 'Are you sure you want to reject this student profile? They will need to resubmit their documents.'
              }
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Enter notes for ${action}... (optional)`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows="3"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleVerification}
                className={`flex-1 text-white py-2 rounded-lg transition duration-300 ${
                  action === 'verify' 
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

// Updated CampaignsTab Component with proper error handling
const CampaignsTab = ({ allCampaigns, loading }) => {
  const [filter, setFilter] = useState('all');

  // Safely handle allCampaigns data structure
  const campaignsArray = Array.isArray(allCampaigns) 
    ? allCampaigns 
    : (allCampaigns?.campaigns || allCampaigns?.data || []);

  const filteredCampaigns = campaignsArray.filter(campaign => {
    if (filter === 'all') return true;
    return campaign.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'active', 'completed', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status} ({status === 'all' ? campaignsArray.length : campaignsArray.filter(c => c.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Campaigns ({filteredCampaigns.length})
          </h3>
        </div>
        <div className="p-6">
          {filteredCampaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No campaigns found</p>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map(campaign => (
                <CampaignDetailCard key={campaign._id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Campaign Detail Card Component (keep existing)
const CampaignDetailCard = ({ campaign }) => {
  const dispatch = useDispatch();
  const student = campaign.student;

  const handleVerification = (action, notes = '') => {
    dispatch(verifyCampaign({ campaignId: campaign._id, action, notes }));
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Campaign Info */}
        <div className="lg:col-span-2">
          <h4 className="font-semibold text-gray-900 mb-2">{campaign.title}</h4>
          <p className="text-sm text-gray-600 mb-1 line-clamp-2">{campaign.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Category: {campaign.category}</span>
            <span>Target: ${campaign.targetAmount?.toLocaleString()}</span>
            <span>Raised: ${campaign.amountRaised?.toLocaleString() || '0'}</span>
          </div>
        </div>

        {/* Student Info */}
        <div>
          <h5 className="font-medium text-gray-900 mb-2">Student Information</h5>
          <p className="text-sm text-gray-600 mb-1">{student?.name || 'Unknown'}</p>
          <p className="text-sm text-gray-600 mb-1">{campaign.institutionName}</p>
          <p className="text-sm text-gray-500">ID: {campaign.studentId}</p>
        </div>

        {/* Status & Actions */}
        <div className="flex flex-col items-end justify-between">
          <span className={`px-3 py-1 text-sm rounded-full ${
            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
            campaign.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            campaign.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {campaign.status}
          </span>
          
          {campaign.status === 'pending' && (
            <div className="flex space-x-2 mt-2">
              <button 
                onClick={() => handleVerification('approve')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Approve
              </button>
              <button 
                onClick={() => handleVerification('reject')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Keep existing UsersTab, DonationsTab, AnalyticsTab, ReportsTab components
const UsersTab = () => {
  return <div>Users Management</div>;
};

const DonationsTab = () => {
  return <div>Donations Management</div>;
};

const AnalyticsTab = ({ analytics }) => {
  return <div>Analytics Dashboard</div>;
};

const ReportsTab = () => {
  return <div>Reports Generator</div>;
};

export default AdminDashboard;