import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../../store/slices/campaignSlice';

const CreateCampaign = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.campaigns);
  const { user } = useSelector(state => state.auth);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [images, setImages] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Check if student profile exists
  useEffect(() => {
    const checkStudentProfile = async () => {
      try {
        const response = await fetch('/api/students/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          setHasProfile(true);
        } else {
          setHasProfile(false);
        }
      } catch (error) {
        setHasProfile(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    if (user?.role === 'student') {
      checkStudentProfile();
    }
  }, [user]);

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      targetAmount: parseFloat(data.targetAmount),
      images: images
    };

    const result = await dispatch(createCampaign(formData));
    if (result.type === 'campaigns/createCampaign/fulfilled') {
      navigate('/dashboard');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  if (user.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only students can create campaigns.</p>
        </div>
      </div>
    );
  }

  // Show loading while checking profile
  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your profile...</p>
        </div>
      </div>
    );
  }

  // Redirect to profile creation if no profile exists
  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-yellow-100 border border-yellow-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Required</h2>
          <p className="text-gray-600 mb-6">
            Before creating campaigns, you need to complete your student profile verification.
            This helps build trust with potential donors.
          </p>
          <button
            onClick={() => navigate('/student-profile')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 font-semibold"
          >
            Complete Student Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Your Campaign</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Your existing form fields */}
            {/* ... */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;