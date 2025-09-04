// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AccountManagement from './pages/AccountManagement';
import ManageSettings from './pages/ManageSettings';
import BackupRestore from './pages/BackupRestore';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AccountManagement />} />
          <Route path="account-management" element={<AccountManagement />} />
          <Route path="manage-settings" element={<ManageSettings />} />
          <Route path="backup-restore" element={<BackupRestore />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;