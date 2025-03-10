import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access:", location.pathname);

    // Auto-redirect to home after 5 seconds (Optional)
    const timer = setTimeout(() => navigate("/"), 5000);

    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">
        Oops! The page you're looking for doesn't exist.
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        Redirecting to home in 5 seconds...
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
      >
        Go to Home
      </button>
    </div>
  );
};

export default NotFound;
