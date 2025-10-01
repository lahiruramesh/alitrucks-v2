// Utility to handle post-login navigation logic
export const handlePostLoginRedirect = (user: any, searchParams?: URLSearchParams) => {
  // Check for return URL in search params
  const returnUrl = searchParams?.get('returnUrl');
  
  if (returnUrl) {
    // If return URL exists, navigate there
    return returnUrl;
  }
  
  // Default role-based navigation
  switch (user?.role) {
    case 'ADMIN':
      return '/admin';
    case 'SELLER':
      return '/seller';
    case 'BUYER':
    default:
      return '/dashboard';
  }
};

// Store booking context before authentication
export const storeBookingContext = (vehicleId: string, bookingData?: any) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('pendingBooking', JSON.stringify({
      vehicleId,
      bookingData,
      timestamp: Date.now()
    }));
  }
};

// Retrieve and clear booking context after authentication
export const retrieveBookingContext = () => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('pendingBooking');
    if (stored) {
      sessionStorage.removeItem('pendingBooking');
      const context = JSON.parse(stored);
      
      // Check if context is not too old (30 minutes)
      if (Date.now() - context.timestamp < 30 * 60 * 1000) {
        return context;
      }
    }
  }
  return null;
};