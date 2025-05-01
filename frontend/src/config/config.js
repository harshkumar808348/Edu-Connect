const config = {
  API_URL: import.meta.env.PROD 
    ? 'https://edu-connect-2.onrender.com/api'  // Update this to your Render backend URL
    : 'http://localhost:3000/api'                 // Development backend URL
};

export default config; 