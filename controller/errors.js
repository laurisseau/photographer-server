const handleDuplicateFieldsDB = (err) => {
  const keyObj = err.keyValue;
  const message = `${Object.keys(keyObj)} is already in use`;
  return message;
};

const prodErrors = (err, req, res) => {
  console.log(err);
  return res.status(404).json({ message: err });
};

const devErrors = (err, req, res) => {
  console.log(err);
  return res.status(500).send({ message: err.stack });
};

export const errors = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    devErrors(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    error.message = err.message;

    if (err.code === 11000) error = handleDuplicateFieldsDB(err);

    prodErrors(error, req, res);
  }
};
