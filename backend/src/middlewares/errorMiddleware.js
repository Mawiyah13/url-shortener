export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  let message = err.message;
  let errors = null;

  // Handle Mongoose duplicate key error (like unique email or customAlias collision)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `The chosen ${field} is already in use. Please select a unique value.`;
    res.status(400);
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    message = 'Validation error occurred';
    errors = Object.values(err.errors).map(val => val.message);
    res.status(400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid auth token';
    res.status(401);
  }

  console.error(`💥 [Error] URL: ${req.originalUrl} | Msg: ${err.message} | Stack:`, err.stack);

  res.status(res.statusCode || 500).json({
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
