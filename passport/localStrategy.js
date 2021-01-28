const passport = require('passport');
// 로컬 로그인 전략 구현위해 LocalStorage 생성자 불러옴
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');
module.exports = () => {
  passport.use(
    // 로컬 로그인 전략 구현
    new LocalStrategy(
      // 1번째 객체 : 전략에 관한 설정
      {
        usernameField: 'email', // 일치하는 로그인 라우터의 req.body 속성명
        passwordField: 'password', // 일치하는 로그인 라우터의 req.body 속성명
      },
      // 2번째 인수 : 전략 수행
      // - 1번째 객체에서 넣어준 email, password가 각각 async 함수의 매개변수로 전달됨
      async (email, password, done) => {
        // done : passport.authenticate(routes/auth.js)의 콜백 함수
        // - 1번째 인수 사용하는 경우 : 서버 쪽 에러 발생한 경우
        // - 3번째 인수 사용하는 경우 : 사용자 정의 에러 발생(미가입 이메일, 비밀번호 불일치)
        // - done 호출 후, passport.authenticate의 콜백 함수 실행됨
        try {
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              done(null, exUser);
            } else {
              done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
          } else {
            done(null, false, { message: '가입되지 않은 회원입니다.' });
          }
        } catch (err) {
          console.error(err);
          done(err); // 서버 오류 발생 처리
        }
      }
    )
  );
};
