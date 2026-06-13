import React from "react";

export const GlassCard = ({ children, className = "", onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-[20px] p-6 shadow-lg backdrop-blur-md ${onClick ? "cursor-pointer" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
