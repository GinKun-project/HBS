import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RoleRoute({ user, allowedRoles, children }) {
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
