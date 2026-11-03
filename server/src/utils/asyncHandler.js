/**
 * Asynchronous Controller Handler Wrapper
 * Catches rejected promises from async controller methods and passes them to next(error).
 * Eliminates repetitive try-catch blocks across all controllers.
 * 
 * @param {Function} fn - Async controller function (req, res, next)
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
