import React from 'react';

// HomePrivateRoute now just renders children, no auth check
const HomePrivateRoute = ({ children }) => {
  return children;
};

export default HomePrivateRoute;
