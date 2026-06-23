import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsAuthenticated } from '../features/auth/authSlice';
import AuthGuard from '../components/guards/AuthGuard';
import RoleGuard from '../components/guards/RoleGuard';
import LandingLayout from '../layouts/LandingLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import AssuresListPage from '../pages/assures/AssuresListPage';
import AssureFormPage from '../pages/assures/AssureFormPage';
import AssureDetailPage from '../pages/assures/AssureDetailPage';
import MedecinsListPage from '../pages/medecins/MedecinsListPage';
import MedecinFormPage from '../pages/medecins/MedecinFormPage';
import MedecinDetailPage from '../pages/medecins/MedecinDetailPage';
import AttributionPage from '../pages/AttributionPage';
import ConsultationsListPage from '../pages/consultations/ConsultationsListPage';
import ConsultationFormPage from '../pages/consultations/ConsultationFormPage';
import ConsultationDetailPage from '../pages/consultations/ConsultationDetailPage';
import FeuillesListPage from '../pages/feuilles/FeuillesListPage';
import FeuilleFormPage from '../pages/feuilles/FeuilleFormPage';
import FeuilleDetailPage from '../pages/feuilles/FeuilleDetailPage';
import PrescriptionMedicamentPage from '../pages/prescriptions/PrescriptionMedicamentPage';
import PrescriptionSpecialistePage from '../pages/prescriptions/PrescriptionSpecialistePage';
import RemboursementPage from '../pages/remboursements/RemboursementPage';
import RapportsPage from '../pages/rapports/RapportsPage';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <DashboardLayout>
      {children}
    </DashboardLayout>
  </AuthGuard>
);

const AppRouter = () => {
  const role = useSelector(selectUserRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const getDefaultDashboardPath = () => {
    if (!isAuthenticated) return '/';
    switch (role) {
      case 'assureur': return '/dashboard';
      case 'medecin': return '/dashboard';
      default: return '/';
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultDashboardPath()} /> : <LoginPage />} />
        </Route>

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        <Route path="/assures" element={<RoleGuard allowedRoles={['assureur']}><DashboardLayout><AssuresListPage /></DashboardLayout></RoleGuard>} />
        <Route path="/assures/new" element={<RoleGuard allowedRoles={['assureur']}><DashboardLayout><AssureFormPage /></DashboardLayout></RoleGuard>} />
        <Route path="/assures/:id/edit" element={<RoleGuard allowedRoles={['assureur']}><DashboardLayout><AssureFormPage /></DashboardLayout></RoleGuard>} />
        <Route path="/assures/:id" element={<RoleGuard allowedRoles={['assureur']}><DashboardLayout><AssureDetailPage /></DashboardLayout></RoleGuard>} />

        <Route path="/medecins" element={<RoleGuard allowedRoles={['assureur']}><DashboardLayout><MedecinsListPage /></DashboardLayout></RoleGuard>} />
        <Route path="/medecins/new" element={<RoleGuard allowedRoles={['assureur']}><DashboardLayout><MedecinFormPage /></DashboardLayout></RoleGuard>} />
        <Route path="/medecins/:id/edit" element={<RoleGuard allowedRoles={['assureur']}><DashboardLayout><MedecinFormPage /></DashboardLayout></RoleGuard>} />
        <Route path="/medecins/:id" element={<RoleGuard allowedRoles={['assureur']}><DashboardLayout><MedecinDetailPage /></DashboardLayout></RoleGuard>} />

        <Route path="/attribution" element={<RoleGuard allowedRoles={['assureur']}><DashboardLayout><AttributionPage /></DashboardLayout></RoleGuard>} />

        <Route path="/consultations" element={<RoleGuard allowedRoles={['medecin']}><DashboardLayout><ConsultationsListPage /></DashboardLayout></RoleGuard>} />
        <Route path="/consultations/new" element={<RoleGuard allowedRoles={['medecin']}><DashboardLayout><ConsultationFormPage /></DashboardLayout></RoleGuard>} />
        <Route path="/consultations/:id/edit" element={<RoleGuard allowedRoles={['medecin']}><DashboardLayout><ConsultationFormPage /></DashboardLayout></RoleGuard>} />
        <Route path="/consultations/:id" element={<RoleGuard allowedRoles={['medecin']}><DashboardLayout><ConsultationDetailPage /></DashboardLayout></RoleGuard>} />

        <Route path="/feuilles-maladie" element={<RoleGuard allowedRoles={['medecin']}><DashboardLayout><FeuillesListPage /></DashboardLayout></RoleGuard>} />
        <Route path="/feuilles-maladie/new" element={<RoleGuard allowedRoles={['medecin']}><DashboardLayout><FeuilleFormPage /></DashboardLayout></RoleGuard>} />
        <Route path="/feuilles-maladie/:id/edit" element={<RoleGuard allowedRoles={['medecin']}><DashboardLayout><FeuilleFormPage /></DashboardLayout></RoleGuard>} />
        <Route path="/feuilles-maladie/:id" element={<RoleGuard allowedRoles={['medecin', 'assureur']}><DashboardLayout><FeuilleDetailPage /></DashboardLayout></RoleGuard>} />

        <Route path="/prescriptions/medicaments" element={<RoleGuard allowedRoles={['medecin']}><DashboardLayout><PrescriptionMedicamentPage /></DashboardLayout></RoleGuard>} />
        <Route path="/prescriptions/specialiste" element={<RoleGuard allowedRoles={['medecin']}><DashboardLayout><PrescriptionSpecialistePage /></DashboardLayout></RoleGuard>} />

        <Route path="/remboursements" element={<RoleGuard allowedRoles={['assureur']}><DashboardLayout><RemboursementPage /></DashboardLayout></RoleGuard>} />

        <Route path="/rapports" element={<RoleGuard allowedRoles={['assureur']}><DashboardLayout><RapportsPage /></DashboardLayout></RoleGuard>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
