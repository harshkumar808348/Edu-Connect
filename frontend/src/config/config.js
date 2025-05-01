const config = {
  API_URL: import.meta.env.PROD 
    ? 'https://edu-connect-gamma.vercel.app/api'  // Production backend URL
    : 'http://localhost:3000/api'                 // Development backend URL
};

export default config; 