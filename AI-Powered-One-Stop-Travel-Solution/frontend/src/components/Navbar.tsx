import { useState, useEffect } from 'react'; // Import hooks
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'; // Import routing hooks
import { motion } from 'framer-motion';
import { Compass, Map, Waves, PanelsTopLeft, LogOut, User } from 'lucide-react'; // Added LogOut and User icons
import { Button } from './ui/button';
import { useToast } from './ui/use-toast'; // Import toast for notifications

const links = [
  { to: '/search', label: 'Traveler Search' },
  { to: '/recommendations', label: 'Recommendations' },
  { to: '/itinerary', label: 'Itinerary' },
  { to: '/vendor/dashboard', label: 'Vendor Dashboard' },
  { to: '/agency/events', label: 'Agency Events' }
];

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation(); // Hooks to detect route changes
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check login status whenever the route changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Set true if token exists, false otherwise
  }, [location]);

  const handleLogout = () => {
    // 1. Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    // 2. Update state
    setIsLoggedIn(false);

    // 3. Notify user
    toast({
      title: "Logged Out",
      description: "See you next time!",
    });

    // 4. Redirect to home or auth page
    navigate('/');
  };

  return (
    <motion.header
      className="sticky top-4 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/20 bg-slate-900/60 px-5 py-3 shadow-glow backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <Compass className="h-6 w-6 text-brand-400" />
          HyperLocal
        </Link>
        <nav className="hidden items-center gap-3 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm transition ${
                  isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {/* <Button variant="secondary" size="sm" className="hidden md:inline-flex">
            <Map className="mr-2 h-4 w-4" /> Mock Mode
          </Button> */}
          
          {isLoggedIn ? (
            <Button size="sm" variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm">
                <PanelsTopLeft className="mr-2 h-4 w-4" /> Login
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-400 md:hidden">
        <NavLink to="/search" className="flex items-center gap-1">
          <Waves className="h-3 w-3" /> Search
        </NavLink>
        <NavLink to="/vendor/dashboard" className="flex items-center gap-1">
          <Map className="h-3 w-3" /> Vendors
        </NavLink>
      </div>
    </motion.header>
  );
}