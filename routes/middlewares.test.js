const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

describe('isLoggedIn', () => {
  const res = {
    // jest.fn : 함수 모킹  시 사용
    // - 반환값 지정 : jest.fn(() => 반환값)
    status: jest.fn(() => res), // res.status(403).send('hello') 처럼 메서드 체이닝 위해 res 반환
    send: jest.fn(),
  };
  const next = jest.fn();

  // test 함수 내부에서는 모킹된 객체와 함수를 사용해 isLoggedIn 미들웨어를 호출한 후 exprect로 원하는 내용대로 실행되었는지 체크
  test('로그인되어 있으면 isLoggedIn이 next를 호출해야 함', () => {
    const req = { isAuthenticated: jest.fn(() => true) };
    isLoggedIn(req, res, next);
    expect(next).toBeCalledTimes(1); // 정확한 호출 횟수
  });

  test('로그인되어 있지 않으면 isLoggedIn이 에러를 응답해야 함', () => {
    const req = { isAuthenticated: jest.fn(() => false) };
    isLoggedIn(req, res, next);
    expect(res.status).toBeCalledWith(403); // 특정 인수와 함께 호출되었는지 체크
    expect(res.send).toBeCalledWith('로그인 필요');
  });
});

describe('isNotLoggedIn', () => {
  const res = { redirect: jest.fn() };
  const next = jest.fn();

  test('로그인되어 있으면 isNotLoggedIn이 에러를 응답해야 함', () => {
    const req = { isAuthenticated: jest.fn(() => true) };
    isNotLoggedIn(req, res, next);
    const message = encodeURIComponent('로그인한 상태입니다.');
    expect(res.redirect).toBeCalledWith(`/?error=${message}`);
  });

  test('로그인되어 있지 않으면 isNotLoggedIn이 next를 호출해야 함', () => {
    const req = { isAuthenticated: jest.fn(() => false) };
    isNotLoggedIn(req, res, next);
    expect(next).toBeCalledTimes(1);
  });
});
