import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import MeetingsDashboard from "./pages/MeetingDashbaord";
import { Notion } from "./components/Notion";

const App = () => {
  const isLoggedIn = !!localStorage.getItem('token');

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
              path="/meetings"
              element={<MeetingsDashboard />} 
            />
            <Route 
              path="/notion" 
              element={<Notion />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
