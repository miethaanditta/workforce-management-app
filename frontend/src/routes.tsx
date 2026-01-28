import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/login/Login';
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import { RequireRole } from './auth/RequireRole';
import Navbar from './components/Navbar';
import Employee from './pages/employee/Employee';
import CreateEmployee from './pages/employee/CreateEmployee';
import EmployeeDetail from './pages/employee/EmployeeDetail';
import Attendance from './pages/attendance/Attendance';
import { ProtectedRoute } from './components/ProtectedRoute';
import AccountSettings from './pages/login/AccountSettings';

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/account"
                    element={
                        <>
                            <Navbar />
                            <AccountSettings />
                        </>
                    }
                />

                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/"
                        element={
                            <RequireRole role="USER">
                                <Navbar />
                                <UserDashboard />
                            </RequireRole>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <RequireRole role="ADMIN">
                                <Navbar />
                                <AdminDashboard />
                            </RequireRole>
                        }
                    />

                    <Route
                        path="/employee"
                        element={
                            <RequireRole role="ADMIN">
                                <Navbar />
                                <Employee />
                            </RequireRole>
                        }
                    />

                    <Route
                        path="/employee/create"
                        element={
                            <RequireRole role="ADMIN">
                                <Navbar />
                                <CreateEmployee />
                            </RequireRole>
                        }
                    />

                    <Route
                        path="/employee/:id"
                        element={
                            <>
                                <Navbar />
                                <EmployeeDetail />
                            </>
                        }
                    />

                    <Route
                        path="/attendance"
                        element={
                            <>
                                <Navbar />
                                <Attendance />
                            </>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
