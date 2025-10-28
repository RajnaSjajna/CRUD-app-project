export default function isSignedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/sign-in');
  }
  next();
}
