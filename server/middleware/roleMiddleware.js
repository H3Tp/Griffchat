// Middleware to authorize based on user roles
// Usage: authorizeRoles('Super', 'GroupAdmin')
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      // Check if user exists (set by authMiddleware)
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, no user found' });
      }

      // Check if user's role is allowed
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }

      // Role is authorized, continue
      next();
    } catch (error) {
      console.error('Role middleware error:', error.message);
      return res.status(500).json({ message: 'Server error in role middleware' });
    }
  };
};
