// export const roleMiddleware = (roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({ error: 'Forbidden: insufficient role' });
//     }
//     next();
//   };
// };

// Middleware to authorize based on user roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      // Check if user exists and has an allowed role
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, no user found' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error.message);
      return res.status(500).json({ message: 'Server error in role middleware' });
    }
  };
};
