"use client";
import { useState } from "react";
import { FaHome, FaChartLine, FaCubes, FaMagic, FaEnvelope, FaBars, FaTimes } from "react-icons/fa";

const navItems = [
  { id: "hero", label: "Home", icon: <FaHome /> },
  { id: "stats", label: "Stats", icon: <FaChartLine /> },
  { id: "features", label: "Features", icon: <FaCubes /> },
  { id: "demo", label: "Demo", icon: <FaMagic /> },
  { id: "footer", label: "Contact", icon: <FaEnvelope /> },
];

export default function SideNav() {
  const [open, setOpen] = useState(false);

  const handleNav = (id) => {
    if (typeof window !== "undefined") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  return (
    <>
      {/* Hamburger button always visible */}
      {!open && (
        <button
          className="fixed top-4 left-4 z-[100] bg-black/60 text-white p-2 rounded-full shadow-lg focus:outline-none"
          onClick={() => setOpen(true)}
          aria-label="Show sidebar"
        >
          <FaBars />
        </button>
      )}
      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full z-50 flex flex-col items-center bg-black/40 backdrop-blur-lg py-8 px-2 gap-6 shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-64"}`}
        style={{ minWidth: "64px" }}
      >
        {/* Close button above nav items, not overlapping */}
        {open && (
          <button
            className="mb-8 bg-black/60 text-white p-2 rounded-full shadow-lg focus:outline-none"
            onClick={() => setOpen(false)}
            aria-label="Hide sidebar"
          >
            <FaTimes />
          </button>
        )}
        {open &&
          navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="flex flex-col items-center text-gray-300 hover:text-white transition group focus:outline-none mt-2"
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-semibold group-hover:underline">{item.label}</span>
            </button>
          ))}
      </nav>
    </>
  );
} 