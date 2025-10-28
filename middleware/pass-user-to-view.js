export default function passUserToView(req, res, next) {
  res.locals.user = req.session.user;
  next();
}
