
const HeartIcon = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width="100%" 
      height="100%"
      style={{ display: 'block' }}
    >
      {/* იასამნისფერი წრიული ფონი */}
      <circle cx="50" cy="50" r="45" fill="#7f56d9" />
      
      {/* იდეალურად ცენტრირებული და ფოტოს მსგავსი გულის ფორმა */}
      <path 
        d="M 50 37 
           C 40 23, 22 25, 22 43 
           C 22 58, 38 68, 48 76
           M 52 76
           C 62 68, 78 58, 78 43
           C 78 25, 60 23, 50 37" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

export default HeartIcon;