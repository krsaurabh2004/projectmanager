const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
export default asyncHandler;
//clssic defibition of higher function taking function and returning a function
// its runs it safely and if anything breaks, it handles the error
