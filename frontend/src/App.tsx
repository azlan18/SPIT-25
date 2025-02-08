import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import MeetingsDashboard from "./pages/MeetingDashbaord";


const App = () => {
  const isLoggedIn = !!localStorage.getItem('token'); // Check if token exists in localStorage

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/dashboard" 
              element={<MeetingsDashboard />} 
            />

          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
