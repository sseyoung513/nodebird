exports.isLoggedIn = (req, res, next) => {
  // passport가 req 객체에 req.isAuthenticated 메서드 추가해줌
  if (req.isAuthenticated()) {
    // 로그인 중이면 true
    next();
  } else {
    res.status(403).send('로그인 필요');
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('로그인한 상태');
    res.redirect(`/?error=${message}`);
  }
};
