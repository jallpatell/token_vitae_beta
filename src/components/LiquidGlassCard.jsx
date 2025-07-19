// components/LiquidGlassCard.jsx
import React from "react";
import "../styles/glass.css";

export default function LiquidGlassCard({ children, className, floating }) {
  return (
    <div className={`liquid-glass ${floating ? 'floating' : ''} ${className || ''}`}>
      {children}
    </div>
  );
}
