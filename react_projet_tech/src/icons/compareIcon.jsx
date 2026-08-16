import React from "react";

const CompareIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{ display: "block" }}
    >
      <circle cx="50" cy="50" r="45" fill="#7f56d9" />

      <line
        x1="50"
        y1="5"
        x2="50"
        y2="95"
        stroke="#ffffff"
        strokeWidth="2"
        strokeDasharray="6,4"
        strokeLinecap="round"
      />

      {/* ძირითადი ხაზი */}
      <line
        x1="30"
        y1="65"
        x2="70"
        y2="65"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* მარცხენა ისრის წვერი */}
      <path
        d="M 36 59 L 30 65 L 36 71"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* მარჯვენა ისრის წვერი */}
      <path
        d="M 64 59 L 70 65 L 64 71"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CompareIcon;
