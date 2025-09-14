import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CreateProposal from "./components/CreateProposal";
import ProposalsList from "./components/ProposalsList";
import DelegateVotes from "./components/DelegateVotes";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark text-light">
        <Navbar />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/proposals" element={<ProposalsList />} />
            <Route path="/create" element={<CreateProposal />} />
            <Route path="/delegate" element={<DelegateVotes />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
