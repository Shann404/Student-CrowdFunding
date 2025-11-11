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
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({ shouldUnregister: false });
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [studentIdImage, setStudentIdImage] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [verificationStep, setVerificationStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('bank');


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
  try {
    const campaignData = {
      ...data,
      paymentMethod,
      paymentVerified: data.paymentVerified || false,
      bankName: data.bankName,
      branch: data.branch,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      swiftCode: data.swiftCode,
      currency: data.currency,
      paymentReference: data.paymentReference,
      paymentPortalUrl: data.paymentPortalUrl,
      onlinePaymentInstructions: data.onlinePaymentInstructions,
      onlineReference: data.onlineReference,
      images,
      documents,
      studentIdImage,
    };

    const result = await dispatch(createCampaign(campaignData));
    if (result.type === 'campaigns/createCampaign/fulfilled') {
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Form submission error:', error);
  }
};


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(files);
  };

  const handleStudentIdImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setStudentIdImage(e.target.files[0]);
    }
  };

  const nextStep = () => setVerificationStep(2);
  const prevStep = () => setVerificationStep(1);

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
            className="w-full bg-yellow-300 text-white py-3 px-4 rounded-md hover:bg-yellow-500 transition duration-300 font-semibold"
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
          <h1 className="text-3xl font-bold text-yellow-500 mb-6">Create Your Campaign</h1>
          
          {/* Verification Steps Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center ${verificationStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${verificationStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Campaign Details</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
            <div className={`flex items-center ${verificationStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${verificationStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Verification</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {verificationStep === 1 && (
              <>
                {/* Campaign Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    {...register('title', { 
                      required: 'Title is required',
                      minLength: {
                        value: 10,
                        message: 'Title must be at least 10 characters'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g., Support my Computer Science Degree at University of Technology"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Description *
                  </label>
                  <textarea
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: {
                        value: 50,
                        message: 'Description must be at least 50 characters'
                      }
                    })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell your story... Why do you need funding? What are your academic goals?"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="tuition">Tuition Fees</option>
                    <option value="books">Books & Materials</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="research">Research Project</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                {/* Target Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('targetAmount', { 
                      required: 'Target amount is required',
                      min: {
                        value: 1,
                        message: 'Target amount must be at least $1'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                  />
                  {errors.targetAmount && (
                    <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>
                  )}
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Deadline *
                  </label>
                  <input
                    type="date"
                    {...register('deadline', { 
                      required: 'Deadline is required',
                      validate: value => {
                        const selectedDate = new Date(value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return selectedDate > today || 'Deadline must be in the future';
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.deadline && (
                    <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Continue to Verification
                </button>
              </>
            )}

            {verificationStep === 2 && (
              <>
                {/* Institution Payment Details */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    🎓 Institution Payment Verification
                  </h3>
                  <p className="text-blue-700 mb-4">
                    To prevent fraud and ensure funds are used for educational purposes, 
                    please provide official payment details from your institution.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institution Name *
                      </label>
                      <input
                        type="text"
                        {...register('institutionName', { required: 'Institution name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Official name of your educational institution"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID Number *
                      </label>
                      <input
                        type="text"
                        {...register('studentId', { required: 'Student ID is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your official student identification number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Year/Semester *
                      </label>
                      <input
                        type="text"
                        {...register('academicPeriod', { required: 'Academic period is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="E.g., Fall 2024, Academic Year 2024-2025"
                      />
                    </div>
                  </div>
                </div>

                {/* Fee Structure & Balance */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    💰 Fee Structure & Outstanding Balance
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Fees Due (USD) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('totalFees', { 
                          required: 'Total fees amount is required',
                          min: { value: 1, message: 'Amount must be greater than 0' }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Total amount due"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Already Paid (USD) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('amountPaid', { 
                          required: 'Paid amount is required',
                          min: { value: 0, message: 'Amount cannot be negative' }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Amount you've already paid"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded border">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Outstanding Balance:</span>
                      <span className="text-red-600">
                        ${(watch('totalFees') - watch('amountPaid') || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Official Documents Upload */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                    📄 Required Verification Documents
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Upload official documents to verify your student status and fee requirements.
                  </p>

                  {/* Student ID Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID Card (Image) *
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleStudentIdImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Upload a clear photo of your official student ID card
                    </p>
                    {studentIdImage && (
                      <p className="mt-1 text-sm text-green-600">
                        ✓ Student ID image selected: {studentIdImage.name}
                      </p>
                    )}
                  </div>

                  {/* Fee Statement/Invoice */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Official Fee Statement/Invoice *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDocumentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Must show your name, student ID, and detailed fee breakdown
                    </p>
                  </div>

                  {/* Admission Letter (Optional but recommended) */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admission/Enrollment Letter (Recommended)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDocumentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Institution Payment Instructions */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">
                    🏦 Institution Payment Instructions
                  </h3>
                  
                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Payment Method *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank')}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          paymentMethod === 'bank' 
                            ? 'border-purple-500 bg-purple-50 text-purple-700' 
                            : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-sm text-gray-500 mt-1">Direct bank transfer</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          paymentMethod === 'online' 
                            ? 'border-purple-500 bg-purple-50 text-purple-700' 
                            : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-medium">Online Portal</div>
                        <div className="text-sm text-gray-500 mt-1">University payment portal</div>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'bank' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-purple-700 mb-3">Bank Transfer Details</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name *
                          </label>
                          <input
                            type="text"
                            {...register('bankName', { required: paymentMethod === 'bank' ? 'Bank name is required' : false })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Kenya Commercial Bank"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Branch *
                          </label>
                          <input
                            type="text"
                            {...register('branch', { required: paymentMethod === 'bank' ? 'Branch is required' : false })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Main Branch"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Name *
                        </label>
                        <input
                          type="text"
                          {...register('accountName', { required: paymentMethod === 'bank' ? 'Account name is required' : false })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., University of Nairobi Fees Account"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            {...register('accountNumber', { required: paymentMethod === 'bank' ? 'Account number is required' : false })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 1234567890"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SWIFT Code *
                          </label>
                          <input
                            type="text"
                            {...register('swiftCode', { required: paymentMethod === 'bank' ? 'SWIFT code is required' : false })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., KCBKENYA"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency *
                          </label>
                          <select
                            {...register('currency', { required: paymentMethod === 'bank' ? 'Currency is required' : false })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select currency</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="KES">KES - Kenyan Shilling</option>
                            <option value="UGX">UGX - Ugandan Shilling</option>
                            <option value="TZS">TZS - Tanzanian Shilling</option>
                            <option value="ZAR">ZAR - South African Rand</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reference (Required) *
                          </label>
                          <input
                            type="text"
                            {...register('paymentReference', { required: paymentMethod === 'bank' ? 'Payment reference is required' : false })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., John Doe - ADM12345"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Format: [Student Full Name - Admission Number]
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'online' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-purple-700 mb-3">Online Payment Portal Details</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Portal URL *
                        </label>
                        <input
                          type="url"
                          {...register('paymentPortalUrl', { required: paymentMethod === 'online' ? 'Payment portal URL is required' : false })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://university.edu/payments"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Instructions *
                        </label>
                        <textarea
                          {...register('onlinePaymentInstructions', { required: paymentMethod === 'online' ? 'Payment instructions are required' : false })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Provide step-by-step instructions for donors on how to make payments through the online portal..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reference/Student ID Format *
                        </label>
                        <input
                          type="text"
                          {...register('onlineReference', { required: paymentMethod === 'online' ? 'Reference format is required' : false })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Use Student ID as payment reference"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      {...register('paymentVerified')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      I confirm that the above payment details are official and verified by my institution
                    </label>
                  </div>
                </div>

                {/* Campaign Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Campaign Images (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Upload additional images that help tell your story (max 5 images, 5MB each)
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !studentIdImage}
                    className="flex-1 bg-yellow-400 text-white py-3 px-4 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                  >
                    {loading ? 'Creating Campaign...' : 'Create Campaign'}
                  </button>
                </div>
              </>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error.message || 'Something went wrong. Please try again.'}
              </div>
            )}

            <p className="text-sm text-gray-600 text-center">
              Your campaign and verification documents will be reviewed by our team before going live. 
              This usually takes 24-48 hours.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;