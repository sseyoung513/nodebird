const passport = require('passport');
// passport는 로그인 시의 동작을 전략(strategy)라 부름
const local = require('./localStrategy'); // 로컬 로그인 전략
const kakao = require('./kakaoStrategy'); // 카카오 로그인 전략
const User = require('../models/user');

module.exports = () => {
  // 로그인 시 실행 됨
  // req.session(세션) 객체에 어떤 데이터를 저장할지 정하는 메서드
  passport.serializeUser((user, done) => {
    // done
    // - 1번째 인수 : 에러 발생 시 사용
    // - 2번째 인수 : 저장하고 싶은 데이터 넣음
    done(null, user.id); // 세션에 사용자 정보를 모두 저장하면 세션의 용량이 커지고 데이터 일관성에 문제가 발생하므로 사용자 id만 저장
  });

  // 매 요청 시 실행됨
  // passport.session 미들웨어가 이 메서드 호출
  // passport.serializeUser의 done의 2번째 인수가 passport.deserializeUser의 매개변수가 됨
  passport.deserializeUser((id, done) => {
    // id로 DB 조회하여 사용자 정보(user)를 req.user에 저장 => routes/page.js 등에 사용됨
    User.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ['id', 'nick'],
          as: 'Followers',
        },
        {
          model: User,
          attributes: ['id', 'nick'],
          as: 'Followings',
        },
      ],
    })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local();
  kakao();
};
