// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.tsx';
import AccountManagement from './features/accounts/AccountManagement.tsx';
import ManageSettings from './features/settings/ManageSettings.tsx';
import BackupRestore from './features/backup/BackupRestore.tsx';

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