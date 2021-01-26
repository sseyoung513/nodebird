const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

// 회원가입 라우터
router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    // 기존에 같은 이메일로 가입한 사용자가 있는지 조회
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      // 있다면 회원가입 페이지로 되돌려보냄
      return res.redirect('/join?error=exist'); // 에러를 쿼리스트링으로 표시
    }
    // 회원가입 시 비밀번호 암호화하여 저장(pbkdf2로도 가능)
    // bcrypt의 2번째 인수 = pbkdf2의 반복 횟수와 비슷한 기능, 12이상 추천, 31까지 가능, promise 지원
    const hash = await bcrypt.hash(password, 12);
    await User.create({ email, nick, password: hash });
    return res.redirect('/');
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// 로그인 라우터
router.post('/login', isNotLoggedIn, async (req, res, next) => {
  // 로그인 요청 시, passport.authenticate('local') 미들웨어가 로컬 로그인 전략 수행
  // - 전략 성공하거나 실패 시, authenticate의 콜백 함수 실행됨
  // 미들웨어인데 라우터 미들웨어 안에 존재
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      // authError 존재 시, 전략 실패
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      //콜백의 2번째 매개변수가 존재해야 전략 성공
      return res.redirect(`/?loginError=${info.message}`);
    }
    // passport는 req 객체에 login, logout 메서드 추가함
    // req.login은 passport.serializeUser를 호출
    // - 1번째 매개변수가 serializeUser로 전달됨
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙여(인수 제공) 호출

  // 로그아웃 라우터
  router.get('/logout', isLoggedIn, (req, res) => {
    req.logout(); // req.user 객체 제거
    req.session.destroy(); // req.session 객체 내용 제거
    res.redirect('/'); // 메인페이지로 되돌아감(로그인 해제돼있음)
  });

  // 카카오 로그인 라우터
  // GET /auth/kakao로 접근 시 카카오 로그인 과정 시작됨
  // -> 카카오 로그인 창으로 리다이렉트
  //    -> 그 창에서 성공 여부 결과를 GET /auth/kakao/callback으로 받음
  router.get('/kakao', passport.authenticate('kakao'));

  // 위 라우터로 요청 받아 카카오 로그인 전략 수행
  router.get(
    '/kakao/callback',
    passport.authenticate(
      'kakao',
      { failureRedirect: '/' }, // 실패했을 때 어디로 리다이렉트할지
      (req, res) => {
        // 카카오 로그인은 로컬 로그인과 다르게 passport.authenticate 메서드에 콜백 함수 제공하지 않음
        // 카카오 로그인은 로그인 성공 시 내부적으로 req.login을 호출(직접 호출할 필요 없음)
        res.redirect('/'); // 성공 시 어디로 리다이렉트할지
      }
    )
  );
});

module.exports = router;
