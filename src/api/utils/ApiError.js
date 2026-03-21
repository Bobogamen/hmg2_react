class ApiError extends Error {
  constructor({ message, status, errors }) {
    super(message || "server:error");

    this.status = status || 0;
    this.errors = errors || null;

    this.isValidationError = status === 400 && !!errors;
    this.isAuthError = status === 401;
    this.isForbidden = status === 403;
    this.isServerError = status >= 500;
    this.isNetworkError = status === 0;
  }
}

export default ApiError;