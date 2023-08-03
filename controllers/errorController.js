const AppError = require('./../utils/appError');

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    name: error.name,
    error,
  });
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const nameKey = Object.keys(err.keyValue).at(0);
  const message = `Duplicate key "${nameKey}" value: ${err.keyValue.name}. Please use another value`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const validationValues = Object.values(err.errors);
  const errors = validationValues.map((el) => el.properties.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid Token. Please log in again', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Token expired. Please log in again', 401)
}

const sendErrorProduction = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      name: error.name,
    });
  } else {
    console.error('ERROR!', error);
    res.status(500).json({ status: 'error', message: 'Something went wrong' });
  }
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let err = { ...error };

    if (err.kind === 'ObjectId') {
      err = handleCastErrorDB(err);
    }
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err._message === 'Tour validation failed')
      err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

    sendErrorProduction(err, res);
  }
};
