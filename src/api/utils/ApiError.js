class ApiError extends Error {
  constructor({ status, message, errors }) {
    super(message);

    this.status = status;
    this.message = message;
    this.errors = errors;

    // ✅ CRITICAL FLAGS
    this.isAuthError = status === 401;
    this.isForbidden = status === 403;
    this.isValidationError = status === 400;
    this.isServerError = status >= 500;
    this.isNetworkError = status === 0;
  }
}

export default ApiError;