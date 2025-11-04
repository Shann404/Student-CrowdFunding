import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2%, transparent 0%), 
                           radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="py-9">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-5">
              <Link to="/" className="inline-flex items-center space-x-3 group mb-6">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110">
                    <span className="text-white font-bold text-lg">EF</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                    EduFund
                  </span>
                  <span className="text-gray-500 text-sm -mt-1">Empowering Dreams</span>
                </div>
              </Link>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md">
                Transforming education through global generosity. We connect passionate students with compassionate donors to build a brighter future, one dream at a time.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {[
                  {
                    name: 'Facebook',
                    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                    url: '#'
                  },
                  {
                    name: 'Twitter',
                    icon: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84',
                    url: '#'
                  },
                  {
                    name: 'Instagram',
                    icon: 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z',
                    url: '#'
                  },
                  {
                    name: 'LinkedIn',
                    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
                    url: '#'
                  }
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    className="group relative p-3 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-yellow-400/30 hover:bg-yellow-500/10 transition-all duration-300 hover:scale-110 hover:shadow-2xl"
                    aria-label={social.name}
                  >
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d={social.icon}/>
                    </svg>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      {social.name}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-3 lg:col-start-7">
              <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-6 flex items-center">
                Navigate
              </h3>
              <ul className="space-y-3">
                {[
                  { name: 'Browse Campaigns', path: '/campaigns' },
                  { name: 'Start a Campaign', path: '/create-campaign' },
                  { name: 'How It Works', path: '#' },
                  { name: 'Success Stories', path: '#' },
                  { name: 'About Us', path: '#' }
                ].map((link) => (
                  <li key={link.name}>
                    {link.path === '#' ? (
                      <a href={link.path} className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1">
                        <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        {link.name}
                      </a>
                    ) : (
                      <Link to={link.path} className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1">
                        <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Legal */}
            <div className="lg:col-span-4 lg:col-start-10">
              <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-6 flex items-center">
                Support
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <ul className="space-y-3">
                  {[
                    'Help Center',
                    'Contact Us',
                    'FAQ',
                    'Community'
                  ].map((item) => (
                    <li key={item}>
                      <a href="#" className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1">
                        <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
                
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-5">
          <div className="flex flex-col lg:flex-row justify-center items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-6 text-gray-400">
              <p>&copy; {currentYear} EduFund. All dreams reserved.</p>
              
            </div>
            
           
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-10 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-20 animate-float"></div>
      <div className="absolute top-20 right-20 w-6 h-6 bg-purple-400 rounded-full opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-40 right-40 w-3 h-3 bg-blue-300 rounded-full opacity-40 animate-float" style={{ animationDelay: '4s' }}></div>
    </footer>
  );
};

export default Footer;