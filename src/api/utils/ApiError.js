class ApiError extends Error {
  constructor({ status, message, errors }) {
    super(message);
    this.status = status;
    this.errors = errors; // field errors (for 400)
  }
}

export default ApiError;