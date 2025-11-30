import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from './components/ui/Toaster';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="fixed inset-0 -z-10 bg-gradient-hero opacity-60" />
      <Navbar />
      <main className="container py-8 px-4 lg:px-0 space-y-12">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      <ScrollRestoration />
    </div>
  );
}

export default App;

