// 라우터에 버전을 붙인 이유 : 한번 버전이 정해진 후에는 라우터를 함부로 수정하면 X
// - 다른 사람/서비스가 기존 API를 사용 중임

const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('./middlewares');
const { Domain, User } = require('../models');

const router = express.Router();

// 토큰 발급 라우터
router.post('/token', async (req, res) => {
  // 전달받은 클라이언트 비밀키
  const { clientSecret } = req.body;
  try {
    // 전달받은 클라이언트 비밀 키로 도메인이 등록된 것인지 확인
    const domain = await Domain.findOne({
      where: { clientSecret },
      include: {
        model: User,
        attribute: ['nick', 'id'],
      },
    });
    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요',
      });
    }
    // 등록된 도메인이라면 토큰을 발급해서 응답
    const token = jwt.sign(
      // 1번째 인수 : 토큰의 내용
      {
        id: domain.User.id,
        nick: domain.User.nick,
      },
      // 2번째 인수 : 토큰의 비밀키
      process.env.JWT_SECRET,
      // 3번째 인수 : 토큰의 설정
      {
        expiresIn: '1m', // 유효기간, 1분, zeit/ms 형식으로 작성한 것( 60*1000 도 가능)
        issuer: 'nodebird', // 발급자
      }
    );
    return res.json({
      code: 200,
      message: '토큰이 발급되었습니다',
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    });
  }
});

// 토큰 테스트 라우터
router.get('/test', verifyToken, (req, res) => {
  res.json(req.decoded);
});

module.exports = router;
