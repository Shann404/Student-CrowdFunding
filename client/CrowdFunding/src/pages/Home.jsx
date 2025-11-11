import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCampaigns } from '../store/slices/campaignSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { campaigns, loading } = useSelector(state => state.campaigns);
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchCampaigns({ limit: 6 }));
  }, [dispatch]);

  const featuredCampaigns = campaigns.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.7)), url('https://plus.unsplash.com/premium_photo-1682125773446-259ce64f9dd7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171')`
          }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up">
            Fund Your
            <span className="block bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              Education Dreams
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-200 animate-slide-up delay-200">
            Join thousands of students turning academic aspirations into reality through the power of global community support. Your future starts here.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up delay-400">
            {isAuthenticated ? (
              user.role === 'student' ? (
                <Link
                  to="/create-campaign"
                  className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center space-x-3"
                >
                  <span>Start Your Campaign</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <Link
                  to="/campaigns"
                  className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center space-x-3"
                >
                  <span>Support Students</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>
              )
            ) : (
              <>
                <Link
                  to="/register"
                  className="group relative px-8 py-4 bg-gradient-to-r from-yellow-300 to-yellow-500 text-white font-semibold rounded-2xl hover:from-yellow-300 hover:to-yellow-500 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center space-x-3"
                >
                  <span>Start Your Journey</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/campaigns"
                  className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 hover:border-white/30 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center space-x-3"
                >
                  <span>Explore Dreams</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
              </>
            )}
          </div>

         
        </div>
      </section>

      {/* Stats Section with Background Pattern */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.3) 2%, transparent 0%)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-500 bg-clip-text text-transparent mb-4">
              Making Dreams Reality
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join a community that's already transformed thousands of educational journeys
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { number: '500+', label: 'Students Funded', color: 'from-yellow-600 to-yellow-500', icon: '🎓' },
              { number: '$2M+', label: 'Total Donations', color: 'from-yellow-600 to-yellow-500', icon: '💝' },
              { number: '95%', label: 'Success Rate', color: 'from-yellow-600 to-yellow-600', icon: '⭐' }
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="group text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 hover:border-blue-200/50 transition-all duration-500 hover:scale-105"
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-lg">
                  {stat.label}
                </div>
                <div className="w-0 group-hover:w-16 h-1 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full mx-auto mt-4 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="relative py-20 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)),url('https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687')`
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-2">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-400 bg-clip-text text-transparent mb-4">
              Featured Dreams
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Discover inspiring students who need your support to continue their education journey
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
              </div>
            </div>
          ) : (
            <>
             
              
              <div className="text-center">
                <Link
                  to="/campaigns"
                  className="inline-flex items-center mt-0 border-transparent space-x-3 px-8 py-4 bg-gradient-to-r from-yellow-300 to-yellow-300 text-white font-semibold rounded-2xl hover:bg-gradient-to-r from-yellow-300 to-yellow-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-transparent "
                >
                  <span>Explore All Campaigns</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How It Works Section */}
     <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-30">
    <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2%, transparent 0%)`,
      backgroundSize: '60px 60px'
    }}></div>
  </div>

  {/* Floating Background Elements */}
  <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/40 rounded-full blur-3xl"></div>
  <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200/40 rounded-full blur-3xl"></div>
  <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-200/30 rounded-full blur-2xl"></div>

  <div className="container mx-auto px-4 relative z-10">
    <div className="text-center mb-16">
      
      
      <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-yellow-600 bg-clip-text text-transparent">
        How Dreams Become Reality
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        A simple, transparent process that connects dreams with opportunities
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {[
        {
          step: '1',
          title: 'Create Your Campaign',
          description: 'Students share their story, academic goals, and funding needs with verified documentation.',
          icon: '📝',
          color: 'from-yellow-300 to-yellow-300',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        },
        {
          step: '2',
          title: 'Receive Global Support',
          description: 'Donors worldwide discover and contribute to campaigns that inspire them.',
          icon: '🌍',
          color: 'from-yellow-300 to-yellow-300',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        },
        {
          step: '3',
          title: 'Achieve Your Dreams',
          description: 'Students receive funds and continue their educational journey toward success.',
          icon: '🎯',
          color: 'from-yellow-300 to-yellow-300',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      ].map((step, index) => (
        <div 
          key={step.step}
          className="group text-center p-8 bg-white rounded-3xl border-2 border-gray-100 hover:border-yellow-200 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-2xl relative overflow-hidden"
        >
          {/* Background Blur Effect */}
          <div className={`absolute inset-0 ${step.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          
          {/* Step Number Background */}
          <div className="absolute -top-8 -left-8 text-8xl text-gray-100 font-bold select-none z-0">
            {step.step}
          </div>

          {/* Step Icon */}
          <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10`}>
            <span className="text-3xl">{step.icon}</span>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
              {step.title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg group-hover:text-gray-700 transition-colors duration-300">
              {step.description}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 flex justify-center space-x-1">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  dot === parseInt(step.step) 
                    ? 'bg-yellow-300 w-6' 
                    : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>

         
        </div>
      ))}
    </div>

   
  </div>
</section>
    </div>
  );
};

export default Home;