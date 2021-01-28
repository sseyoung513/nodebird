const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
// passport 모듈 연결
const passport = require('passport');

dotenv.config();
const pageRouter = require('./routes/page');
// 회원가입, 로그인, 로그아웃 라우터
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
// 모델과 서버 연결
const { sequelize } = require('./models');
// passport 모듈 연결
const passportConfig = require('./passport'); // ./passport/index.js

const app = express();
// passport 모듈 연결
passportConfig();

app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

// 모델과 서버 연결
sequelize
  .sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error('데이터베이스 연결 중 에러 : ', err);
  });

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
//  이미지 업로드 제공할 라우터
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
// passport 모듈 연결
app.use(passport.initialize()); // passport.initialize 미들웨어는 요청(req 객체)에 passport 설정을 심음
// passport.session 미들웨어는 req.session 객체에 passport 정보 저장
// req.session 객체는 express-session에서 생성하는 것이므로, passport 미들웨어는 express-session 미들웨어보다 뒤에 연결해야 함
app.use(passport.session());

app.use('/', pageRouter);
// 회원가입, 로그인, 로그아웃 라우터
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
