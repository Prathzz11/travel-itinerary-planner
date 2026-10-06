const controllerError = (res, error, fallback) => {
  // Let MongoDB retry the entire transaction on write conflicts.
  if (error.hasErrorLabel?.('TransientTransactionError') || error.hasErrorLabel?.('UnknownTransactionCommitResult')) throw error;
  if (error.name === 'ValidationError' || error.name === 'CastError' || error.status === 400) {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'This record already exists' });
  }
  return res.status(500).json({ message: fallback });
};

module.exports = { controllerError };
