import { Route, Routes } from 'react-router-dom'
import AccountSettingsPage from '../pages/account/AccountSettingsPage.js'
import ProfilePage from '../pages/account/ProfilePage.js'
import AdvisorsPage from '../pages/advisors/AdvisorsPage.js'
import ApplicationsPage from '../pages/applications/ApplicationsPage.js'
import AuditLogPage from '../pages/audit/AuditLogPage.js'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.js'
import LoginPage from '../pages/auth/LoginPage.js'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.js'
import SetPasswordPage from '../pages/auth/SetPasswordPage.js'
import ConversationDetailPage from '../pages/conversations/ConversationDetailPage.js'
import ConversationsPage from '../pages/conversations/ConversationsPage.js'
import DashboardPage from '../pages/dashboard/DashboardPage.js'
import IndustryIntelPage from '../pages/industry-intel/IndustryIntelPage.js'
import AddProgramPage from '../pages/programs/AddProgramPage.js'
import EditProgramPage from '../pages/programs/EditProgramPage.js'
import GlobalAddProgramPage from '../pages/programs/GlobalAddProgramPage.js'
import ProgramDetailPage from '../pages/programs/ProgramDetailPage.js'
import ProgramsPage from '../pages/programs/ProgramsPage.js'
import RecommendationsPage from '../pages/recommendations/RecommendationsPage.js'
import AddSchoolPage from '../pages/schools/AddSchoolPage.js'
import EditSchoolPage from '../pages/schools/EditSchoolPage.js'
import SchoolDetailPage from '../pages/schools/SchoolDetailPage.js'
import SchoolsPage from '../pages/schools/SchoolsPage.js'
import SettingsPage from '../pages/settings/SettingsPage.js'
import NotFoundPage from '../pages/system/NotFoundPage.js'
import AddStudentPage from '../pages/students/AddStudentPage.js'
import StudentDetailPage from '../pages/students/StudentDetailPage.js'
import StudentsPage from '../pages/students/StudentsPage.js'
import EditTeamMemberPage from '../pages/team/EditTeamMemberPage.js'
import InviteTeamMemberPage from '../pages/team/InviteTeamMemberPage.js'
import TeamMemberDetailPage from '../pages/team/TeamMemberDetailPage.js'
import TeamPage from '../pages/team/TeamPage.js'
import ProtectedRoute from './ProtectedRoute.js'

const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/reset-password/:token' element={<ResetPasswordPage />} />
        <Route path='/set-password/:token' element={<SetPasswordPage />} />
        <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path='/account-settings' element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
        <Route path='/' element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path='/conversations' element={<ProtectedRoute><ConversationsPage /></ProtectedRoute>} />
        <Route path='/conversations/:conversationId' element={<ProtectedRoute><ConversationDetailPage /></ProtectedRoute>} />
        <Route path='/students' element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
        <Route path='/students/new' element={<ProtectedRoute><AddStudentPage /></ProtectedRoute>} />
        <Route path='/students/:studentId' element={<ProtectedRoute><StudentDetailPage /></ProtectedRoute>} />
        <Route path='/programs' element={<ProtectedRoute><ProgramsPage /></ProtectedRoute>} />
        <Route path='/programs/new' element={<ProtectedRoute roles={['ADMIN', 'OPERATIONS']}><GlobalAddProgramPage /></ProtectedRoute>} />
        <Route path='/programs/:programId/edit' element={<ProtectedRoute roles={['ADMIN', 'OPERATIONS']}><EditProgramPage /></ProtectedRoute>} />
        <Route path='/programs/:programId' element={<ProtectedRoute><ProgramDetailPage /></ProtectedRoute>} />
        <Route path='/applications' element={<ProtectedRoute roles={['ADMIN', 'ADVISOR']}><ApplicationsPage /></ProtectedRoute>} />
        <Route path='/recommendations' element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
        <Route path='/schools' element={<ProtectedRoute><SchoolsPage /></ProtectedRoute>} />
        <Route path='/schools/new' element={<ProtectedRoute roles={['ADMIN', 'OPERATIONS']}><AddSchoolPage /></ProtectedRoute>} />
        <Route path='/schools/:schoolId/edit' element={<ProtectedRoute roles={['ADMIN', 'OPERATIONS']}><EditSchoolPage /></ProtectedRoute>} />
        <Route path='/schools/:schoolId/programs/new' element={<ProtectedRoute roles={['ADMIN', 'OPERATIONS']}><AddProgramPage /></ProtectedRoute>} />
        <Route path='/schools/:schoolId' element={<ProtectedRoute><SchoolDetailPage /></ProtectedRoute>} />
        <Route path='/team' element={<ProtectedRoute roles={['ADMIN']}><TeamPage /></ProtectedRoute>} />
        <Route path='/team/invite' element={<ProtectedRoute roles={['ADMIN']}><InviteTeamMemberPage /></ProtectedRoute>} />
        <Route path='/team/:memberId/edit' element={<ProtectedRoute roles={['ADMIN']}><EditTeamMemberPage /></ProtectedRoute>} />
        <Route path='/team/:memberId' element={<ProtectedRoute roles={['ADMIN']}><TeamMemberDetailPage /></ProtectedRoute>} />
        <Route path='/advisors' element={<ProtectedRoute><AdvisorsPage /></ProtectedRoute>} />
        <Route path='/settings' element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path='/audit-log' element={<ProtectedRoute roles={['ADMIN']}><AuditLogPage /></ProtectedRoute>} />
        <Route path='/industry-intel' element={<ProtectedRoute><IndustryIntelPage /></ProtectedRoute>} />
        <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
