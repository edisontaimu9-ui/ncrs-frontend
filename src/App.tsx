import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import NewPatient from "./pages/NewPatient";
import PatientProfile from "./pages/PatientProfile";
import EditPatient from "./pages/EditPatient";
import ADIMENotes from "./pages/ADIMENotes";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="patients/:id/edit" element={<EditPatient />} />
            <Route path="new-patient" element={<NewPatient />} />
            <Route path="adime" element={<ADIMENotes />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin" element={<AdminPanel />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
