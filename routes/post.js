const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더 생성');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 단일 이미지 업로드받은 뒤 이미지 저장 경로를 클라이언트로 응답
// static 미들웨어가 /img 경로의 정적파일을 제공하므로 클라이언트에서 업로드한 이미지에 접근 가능
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
// 게시글 업로드 라우터
// 이미지를 업로드했다면, 이미지 주소도 req.body.url로 전송됨
// 데이터 형식이 multipart이지만, 이미지 데이터가 없으므로 none 메서드 사용
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    console.log(req.user);
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    // 게스글에서 해시태그를 정규표현식(#[^\s#]+/g)으로 추출
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => {
          // findOrCreate : 존재하면 가져오고, 미존재 시 생성하여 가져옴
          // 결괏값 : [모델, 생성여부]
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      // 모델만 가져오기 위해, r[0]
      // post.addHashtags : 게시글(post)를 hashtag와 연결
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
