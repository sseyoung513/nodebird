const request = require('supertest');
const { sequelize } = require('../models');
const app = require('../app');

// beforeAll : 현재 테스트 실행 전 수행 코드
beforeAll(async () => {
  await sequelize.sync();
});

// 회원가입 테스트
describe('POST /join', () => {
  test('로그인 안 했으면 가입', (done) => {
    request(app)
      .post('/auth/join')
      .send({
        email: 'zerocho0@gmail.com',
        nick: 'zerocho',
        password: 'nodejsbook',
      })
      .expect('Location', '/')
      .expect(302, done);
  });
});

// 로그인한 생태에서 회원가입 기도하는 경우 테스트
describe('POST /login', () => {
  // 로그인 요청과 회원가입 요청이 순서대로 이뤄져야 함
  // 요청 2개 이상 => agent 만들어서 재사용하면 좋음
  const agent = request.agent(app);
  // beforeEach:각각의 테스트 실행에 앞서 먼저 실행되는 부분
  // 로그인 시 회원가입 요청하면 오류 나도록, 로그인 먼저 실행해본다
  beforeEach((done) => {
    agent
      .post('/auth/login')
      .send({ email: 'zerocho0@gmail.com', password: 'nodejsbook' })
      .end(done); // 함수 마무리되었음을 알림
  });

  //
  test('이미 로그인했으면 redirect /', (done) => {
    const message = encodeURIComponent('로그인한 상태입니다.');
    agent
      .post('/auth/join')
      .send({
        email: 'zerocho0@gmail.com',
        nick: 'zerocho',
        password: 'nodejsbook',
      })
      .expect('Location', `/?error=${message}`)
      .expect(302, done);
  });
});

describe('POST /login', () => {
  test('가입되지 않은 회원', async (done) => {
    const message = encodeURIComponent('가입되지 않은 회원입니다.');
    // supertest에서 request 함수 가져온 것
    // - 1번째 인수로 get/post/put/patch/delete 등의 메서드로 원하는 라우터에 요청 가능
    // send로 데이터 전달
    request(app)
      .post('/auth/login')
      .send({
        email: 'zerocho123123@gmail.com',
        password: 'nodejsbook',
      })
      .expect('Location', `/?loginError=${message}`)
      .expect(302, done);
  });

  test('로그인 수행', async (done) => {
    request(app)
      .post('/auth/login')
      .send({ email: 'zerocho0@gmail.com', password: 'nodejsbook' })
      .expect('Location', '/')
      .expect(302, done);
  });

  test('비밀번호 틀림', async (done) => {
    const message = encodeURIComponent('비밀번호가 일치하지 않습니다.');
    request(app)
      .post('/auth/login')
      .send({ email: 'zerocho0@gmail.com', password: 'wrong!!' })
      .expect('Location', `/?loginError=${message}`)
      .expect(302, done);
  });
});

describe('GET /logout', () => {
  test('로그인되어 있지 않으면 403', async (done) => {
    request(app).get('/auth/logout').expect(403, done);
  });

  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post('/auth/login')
      .send({ email: 'zerocho0@gmail.com', password: 'nodejsbook' })
      .end(done);
  });
  test('로그아웃 수행', async (done) => {
    const message = encodeURIComponent('비밀번호가 일치하지 않습니다.');
    agent.get('/auth/logout').expect('Location', '/').expect(302, done);
  });
});

afterAll(async () => {
  await sequelize.sync({ force: true }); // force: true => 테이블 새로 만듬
});
