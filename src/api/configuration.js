const config = Object.freeze({
  api: {
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  },
  app: {
    baseURL: window.location.origin,
  },
});

export default config;