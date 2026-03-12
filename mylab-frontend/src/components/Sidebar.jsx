import './Sidebar.css';

const Sidebar = ({
  activeTab,
  setActiveTab,
  user,
  isCollapsed,
  toggleCollapse,
  canManagePCs,
  canViewAnalytics,
  canManageUsers
}) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: '📊', alwaysShow: true },
    { id: 'labs', label: 'Labs', icon: '🖥️', alwaysShow: true },
    { id: 'pc-management', label: 'PC Management', icon: '⚙️', show: canManagePCs },
    { id: 'schedule', label: 'Schedule', icon: '📅', show: canManagePCs },
    { id: 'broken-pcs', label: 'Complaints', icon: '🚨', alwaysShow: true },
    { id: 'analytics', label: 'Analytics', icon: '📈', show: canViewAnalytics },
    { id: 'users', label: 'Users', icon: '👥', show: canManageUsers },
  ];

  return (
    <aside className={`nebula-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <span className="logo-icon">🌌</span>
          {!isCollapsed && <h2 className="neon-text-purple">Labtrack</h2>}
        </div>
        <button onClick={toggleCollapse} className="collapse-btn">
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (!item.alwaysShow && !item.show) return null;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
