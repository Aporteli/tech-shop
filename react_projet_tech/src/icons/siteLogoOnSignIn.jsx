export default function SiteLogo() {
  return (
   <svg width="180" height="45" viewBox="0 0 320 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cmGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#7f56d9"/>
      <stop offset="100%" stopColor="#7f56d9"/>                   
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="70" height="65" rx="16" fill="url(#cmGrad2)"/>
  <path d="M46 26 a13 13 0 1 0 0 26" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round"/>
  <circle cx="46" cy="26" r="2.6" fill="#ffffff"/>
  <circle cx="46" cy="52" r="2.6" fill="#ffffff"/>
  <line x1="46" y1="26" x2="54" y2="26" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
  <line x1="46" y1="52" x2="54" y2="52" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
  <circle cx="56" cy="26" r="2" fill="#ffffff"/>
  <circle cx="56" cy="52" r="2" fill="#ffffff"/>
</svg>
  );
}
