const express = require('express');
// 로그인에 따른 라우터 접근 권한 제어 위한 미들웨어
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

// 라우터용 미들웨어 생성
// -> 템플릿 엔진에서 사용할 변수 설정
// (res.locals로 설정하는 이유 : 모든 템플릿 엔진에서 공통으로 사용할 변수)
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user
    ? req.user.Followings.map((f) => f.id)
    : [];
  next();
});

// 라우터 접근 권한 제어 위한, isLoggedIn 가 다른 라우터보다 앞에 존재
router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
});

// 라우터 접근 권한 제어 위한, isNotLoggedIn 가 다른 라우터보다 앞에 존재
router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: '회원가입 - NodeBird' });
});

router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: { model: User, attributes: ['id', 'nick'] },
      order: [['createdAt', 'DESC']],
    });
    res.render('main', { title: 'NodeBird', twits: posts });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    return res.render('main', { title: `${query} | NodeBird`, twits: posts });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
