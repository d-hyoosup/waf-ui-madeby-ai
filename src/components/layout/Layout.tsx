// src/components/Layout.tsx
import { Outlet } from 'react-router-dom';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <Header />
      <div className="main-wrapper">
        <Sidebar />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;