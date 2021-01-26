const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      // 카카오 로그인 설정
      {
        clientID: process.env.KAKAO_ID, // 카카오에서 발급해주는 ID, 노출되지 않아야 하므로 process.env.KAKAO_ID로 설정
        callbackURL: '/auth/kakao/callback', // 카카오로부터 인증 결과를 받을 라우터 주소, 아래에서 라우터 작성 시 이 주소 사용
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('kakao profile', profile);
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: 'kakao' },
          });
          // 이미 등록된 사용자인 경우
          if (exUser) {
            done(null, exUser);
          } else {
            // 신규 등록
            const newUser = await User.create({
              email: profile._json && profile._json.kakao_account_email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: 'kakao',
            });
            done(null, newUser);
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  );
};
