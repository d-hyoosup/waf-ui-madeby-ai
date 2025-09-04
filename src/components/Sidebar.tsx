// src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { AccountIcon, SettingsIcon, BackupIcon } from './Icons'; // SVG 아이콘

const Sidebar = () => {
  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        <h3 className="nav-title">WAF 설정</h3>
        <ul className="nav-menu">
          <li>
            <NavLink to="/account-management">
              <AccountIcon />
              <span>계정 관리</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/manage-settings">
              <SettingsIcon />
              <span>관리 설정</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/backup-restore">
              <BackupIcon />
              <span>백업/복원</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;