import { ToastContainer, Slide } from 'react-toastify';

function CustomToastContainer() {
  return (
    <ToastContainer
      closeButton={false}
      pauseOnHover={true}
      closeOnClick={true}
      newestOnTop={true}
      hideProgressBar={true}
      position="top-right"
      autoClose={2000}
      icon={false}
      transition={Slide}
      style={{ top: '120px' }}
      toastStyle={{
        backgroundColor: '#43b40f', // ფონის ფერი
        color: '#ffffff', // ტექსტის ფერი
        borderRadius: '12px', // კუთხეები
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        fontFamily: 'inherit'
      }}
    />
  );
}

export default CustomToastContainer;
