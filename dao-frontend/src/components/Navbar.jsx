import { useWalletStore } from "../store/useStore";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/Hexagonal DAO AI Logo Design.png";

export default function NavBar() {
  const { address, connect, disconnect } = useWalletStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-dark text-light shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80">
          <img
            src={logo}
            alt="DAO AI Governance Logo"
            className="h-12 w-auto md:h-14"
          />
          <span className="text-xl md:text-2xl font-extrabold tracking-wide">
            DAO AI Governance
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-accent">
            Home
          </Link>
          <Link to="/proposals" className="hover:text-accent">
            Proposals
          </Link>
          <Link to="/create" className="hover:text-accent">
            Create
          </Link>
          <Link to="/delegate" className="hover:text-accent">
            Delegate
          </Link>

          {address ? (
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-danger text-white rounded-lg shadow hover:bg-red-600"
            >
              Disconnect {address.slice(0, 6)}...
            </button>
          ) : (
            <button
              onClick={connect}
              className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-indigo-700"
            >
              Connect Wallet
            </button>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-light hover:text-accent focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden px-6 pb-4 space-y-4 bg-dark">
          <Link
            to="/"
            className="block hover:text-accent"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/proposals"
            className="block hover:text-accent"
            onClick={() => setIsOpen(false)}
          >
            Proposals
          </Link>
          <Link
            to="/create"
            className="block hover:text-accent"
            onClick={() => setIsOpen(false)}
          >
            Create
          </Link>
          <Link
            to="/delegate"
            className="block hover:text-accent"
            onClick={() => setIsOpen(false)}
          >
            Delegate
          </Link>

          {address ? (
            <button
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 bg-danger text-white rounded-lg shadow hover:bg-red-600"
            >
              Disconnect {address.slice(0, 6)}...
            </button>
          ) : (
            <button
              onClick={() => {
                connect();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-indigo-700"
            >
              Connect Wallet
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
