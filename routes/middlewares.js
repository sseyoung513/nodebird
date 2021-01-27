const jwt = require('jsonwebtoken');

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

exports.verifyToken = (req, res, next) => {
  try {
    // 사용자가 요청 시 헤더에 넣어 보내는 req.headers.authorization 토큰을 사용
    // jwt.verify로 검증
    // - 1번째 인수 : 토큰
    // - 2번째 인수 : 토큰의 비밀키
    // - req.decoded: 인증 성공 시, 토큰의 내용이 반환되어 저장됨, 다음 미들웨어에서 토큰의 내용물 사용 가능
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // 유효기간 초과
      return res.status(419).json({
        code: 419,
        message: '토큰이 만료되었습니다.',
      });
    }
    return res.status(401).json({
      code: 401,
      message: '유효하지 않은 토큰입니다.',
    });
  }
};
