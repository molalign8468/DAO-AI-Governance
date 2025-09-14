import { Twitter, Linkedin, Github } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/Hexagonal DAO AI Logo Design.png";

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300 pt-12 pb-6 mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={logo}
              alt="DAO AI Governance Logo"
              className="h-12 w-auto"
            />
            <h3 className="text-xl font-bold text-white">DAO AI Governance</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Empowering decentralized decision-making with AI insights. Manage
            proposals, delegate votes, and analyze treasury data seamlessly.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-accent transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/proposals" className="hover:text-accent transition">
                Proposals
              </Link>
            </li>
            <li>
              <Link to="/create" className="hover:text-accent transition">
                Create Proposal
              </Link>
            </li>
            <li>
              <Link to="/delegate" className="hover:text-accent transition">
                Delegate Votes
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
          <div className="flex gap-5">
            <a
              href="https://x.com/molalign52091"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition"
            >
              <Twitter size={22} />
            </a>
            <a
              href="https://github.com/molalign8468"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition"
            >
              <Github size={22} />
            </a>
            <a
              href="https://www.linkedin.com/in/molalign-getahun-6a995131b/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition"
            >
              <Linkedin size={22} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-10 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} DAO AI Governance. All rights
        reserved.
      </div>
    </footer>
  );
}
