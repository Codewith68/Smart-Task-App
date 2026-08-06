import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlinePlus,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUser,
  HiOutlineSparkles,
} from 'react-icons/hi';
import './Layout.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <HiOutlineViewGrid size={22} />, label: 'Dashboard' },
    { to: '/tasks', icon: <HiOutlineClipboardList size={22} />, label: 'Tasks' },
  ];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <HiOutlineSparkles size={24} />
        </div>
        {!collapsed && <span className="logo-text gradient-text">TaskFlow AI</span>}
      </div>

      {/* Create Task Button */}
      <button className="btn btn-primary create-task-btn" onClick={() => { navigate('/tasks', { state: { openCreateModal: true } }); setMobileOpen(false); }}>
        <HiOutlinePlus size={20} />
        {!collapsed && <span>New Task</span>}
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <HiOutlineUser size={18} />
          </div>
          {!collapsed && (
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          )}
        </div>
        <button className="btn btn-ghost btn-icon logout-btn" onClick={handleLogout} title="Logout">
          <HiOutlineLogout size={20} />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button className="mobile-menu-toggle hide-desktop" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-overlay hide-desktop" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <button className="collapse-toggle hide-mobile" onClick={() => setCollapsed(!collapsed)}>
          <HiOutlineMenu size={20} />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
