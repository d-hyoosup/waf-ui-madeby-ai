// src/components/Header.tsx
import './Header.css';
import userAvatar from '../assets/user-avatar.png'; // 예시 아바타 이미지

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <h1>Hystio By BackOffice</h1>
        <span className="brand-tag">WAF Only</span>
      </div>
      <div className="header-nav">
        {/* Breadcrumb or other nav items can go here */}
      </div>
      <div className="header-user">
        <img src={userAvatar} alt="User Avatar" className="user-avatar" />
        <span>김현대 님</span>
      </div>
    </header>
  );
};

export default Header;