// src/components/PageContainer.tsx
import React from 'react';
import '../styles/PageContainer.css';

interface PageContainerProps {
  title: string;
  controls?: React.ReactNode;
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ title, controls, children }) => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h2 className="page-title">{title}</h2>
        {controls && <div className="page-controls">{controls}</div>}
      </header>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;