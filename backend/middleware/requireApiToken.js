const crypto = require('crypto');

const createApiTokenMiddleware = (apiToken) => {
  const expectedToken = Buffer.from(apiToken || '', 'utf8');

  return (req, res, next) => {
    const authorization = req.get('authorization') || '';
    const match = /^Bearer ([^\s]+)$/i.exec(authorization);
    if (!match) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const providedToken = Buffer.from(match[1], 'utf8');
    if (
      providedToken.length !== expectedToken.length ||
      !crypto.timingSafeEqual(providedToken, expectedToken)
    ) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    return next();
  };
};

module.exports = createApiTokenMiddleware;
