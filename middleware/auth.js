
const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers['token'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, "college_system", (err, user) => {
      if (err) return res.sendStatus(403);
      if (roles.length && !roles.includes(user.role)) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };
};

module.exports = auth;
