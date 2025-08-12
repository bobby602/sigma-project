import React, { Fragment, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AuthContext from '../../../Store/auth-context';
import { LogoutApi } from '../../../Store/logoutApi';
import { useNavigation } from '../../../hooks/useNavigation';
import { useUserInfo } from '../../../hooks/useUserInfo';
import {
  PowerIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  
  // Custom hooks สำหรับ logic
  const { navigationItems, homePage } = useNavigation();
  const { userInfo, userRole } = useUserInfo();
  console.log('🔧 Component userInfo:', userInfo);
  console.log('🔧 Component userRole:', userRole);

  const handleLogout = () => {
    dispatch(LogoutApi());
    authCtx.onLogOut();
    navigate("/Login");
  };

  return (
    <Fragment>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/20 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <LogoSection homePage={homePage} userRole={userRole} />

            {/* Desktop Navigation */}
            <DesktopNavigation navigationItems={navigationItems} />

            {/* User Actions */}
            <UserActions 
              userInfo={userInfo}
              onLogout={handleLogout}
              onToggleMenu={() => setIsOpen(!isOpen)}
              isMenuOpen={isOpen}
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation 
          isOpen={isOpen}
          navigationItems={navigationItems}
          userInfo={userInfo}
          userRole={userRole}
          onClose={() => setIsOpen(false)}
        />
      </motion.nav>
    </Fragment>
  );
};

// แยก Component ย่อยออกมา
const LogoSection = ({ homePage, userRole }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex items-center space-x-3"
  >
    <Link to={homePage} className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <img 
            src={process.env.PUBLIC_URL + "/icons/a-icon-chemical.png"} 
            className="w-6 h-6 filter brightness-0 invert" 
            alt="Sigma"
          />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      <div className="hidden sm:block">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Sigma System
        </h1>
        <p className="text-xs text-gray-500 -mt-1">{userRole}</p>
      </div>
    </Link>
  </motion.div>
);

const DesktopNavigation = ({ navigationItems }) => (
  <div className="hidden md:block">
    <div className="ml-10 flex items-baseline space-x-1">
      {navigationItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2
            ${item.current
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
            }
          `}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  </div>
);

const UserActions = ({ userInfo, onLogout, onToggleMenu, isMenuOpen }) => (
  <div className="flex items-center space-x-4">
    {/* User Profile */}
    {userInfo.name && (
      <UserProfile userInfo={userInfo} />
    )}

    {/* Logout Button */}
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onLogout}
      className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <PowerIcon className="w-4 h-4" />
      <span className="hidden sm:inline">ออกจากระบบ</span>
    </motion.button>

    {/* Mobile menu button */}
    <button
      onClick={onToggleMenu}
      className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
    >
      {isMenuOpen ? (
        <XMarkIcon className="w-6 h-6" />
      ) : (
        <Bars3Icon className="w-6 h-6" />
      )}
    </button>
  </div>
);

const UserProfile = ({ userInfo }) => (
  <div className="hidden sm:block">
    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">
          {userInfo.name.charAt(0)}
        </span>
      </div>
      <div className="text-sm">
        <div className="font-medium text-gray-900">{userInfo.name}</div>
      </div>
    </div>
  </div>
);

const MobileNavigation = ({ isOpen, navigationItems, userInfo, userRole, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/20"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors
                ${item.current
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
          
          {/* Mobile User Info */}
          {userInfo.name && (
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {userInfo.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{userInfo.name}</div>
                  <div className="text-sm text-gray-500">{userRole}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Navbar;