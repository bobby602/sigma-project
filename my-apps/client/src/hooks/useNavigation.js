import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export const useNavigation = () => {
  const location = useLocation();
  
  // Get user data
  const getUserData = () => {
    try {
      const token = sessionStorage.getItem('token');
      return token ? JSON.parse(token) : {};
    } catch {
      return {};
    }
  };

  const userData = getUserData();
  
  // Determine home page based on user role
  const homePage = useMemo(() => {
    if (userData.StAdmin === '1') return "/MainPage";
    if (userData.StAdmin === '2') return "/SalesPage";
    return "/PriceList";
  }, [userData.StAdmin]);

  // Generate navigation items based on user role
  const navigationItems = useMemo(() => {
    const baseItems = [
      {
        name: 'หน้าหลัก',
        href: homePage,
        icon: HomeIcon,
        current: location.pathname === homePage
      }
    ];

    // Admin menu (StAdmin = '1')
    if (userData.StAdmin === '1') {
      return [
        ...baseItems,
        {
          name: 'รายการสินค้า',
          href: '/ProductList',
          icon: ShoppingCartIcon,
          current: location.pathname === '/ProductList'
        },
        {
          name: 'ตารางราคา',
          href: '/PriceList',
          icon: DocumentTextIcon,
          current: location.pathname === '/PriceList'
        },
        {
          name: 'ลูกค้า',
          href: '/CustomerPage',
          icon: UsersIcon,
          current: location.pathname === '/CustomerPage'
        },
        {
          name: 'รายงาน',
          href: '/SummaryPages',
          icon: ChartBarIcon,
          current: location.pathname === '/SummaryPages'
        }
      ];
    }

    // Sales menu (StAdmin = '2')
    if (userData.StAdmin === '2') {
      return [
        ...baseItems,
        {
          name: 'ลูกค้า',
          href: '/CustomerPage',
          icon: UsersIcon,
          current: location.pathname === '/CustomerPage'
        },
        {
          name: 'สรุปยอดขาย',
          href: '/SummaryPages',
          icon: ChartBarIcon,
          current: location.pathname === '/SummaryPages'
        },
        {
          name: 'ราคาสินค้า',
          href: '/ProductList',
          icon: DocumentTextIcon,
          current: location.pathname === '/ProductList'
        }
      ];
    }

    // Basic user menu
    return [
      ...baseItems,
      {
        name: 'ตารางราคา',
        href: '/PriceList',
        icon: DocumentTextIcon,
        current: location.pathname === '/PriceList'
      }
    ];
  }, [userData.StAdmin, location.pathname, homePage]);

  return {
    navigationItems,
    homePage,
    userRole: userData.StAdmin
  };
};