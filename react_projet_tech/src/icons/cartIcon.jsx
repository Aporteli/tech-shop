import React from 'react';

const CartIcon = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width="100%"       // <-- შეიცვალა
      height="100%"     // <-- შეიცვალა
      style={{ display: 'block' }}
    >
      <circle cx="50" cy="50" r="45" fill="#7f56d9" />
      <path 
        d="M 25 35 L 32 35 L 41 62 L 66 62 L 74 42 L 34 42" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="44" cy="73" r="4.5" fill="#ffffff" />
      <circle cx="63" cy="73" r="4.5" fill="#ffffff" />
    </svg>
  );
};

export default CartIcon;