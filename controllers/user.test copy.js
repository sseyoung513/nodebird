// addFollowing 컨트롤러 안에는 User라는 모델 존재 -> 실제 DB 연결 -> 테스트 환경에서 사용 불가
// => User 모델도 모킹 필요
jest.mock('../models/user');
const User = require('../models/user');

const { addFollowing } = require('./user');

describe('addFollowing', () => {
  const req = { user: { id: 1 }, params: { id: 2 } };
  const res = { status: jest.fn(() => res), send: jest.fn() };
  const next = jest.fn();

  test('사용자를 찾아 팔로잉을 추가하고 success로 응답해야함', async () => {
    // addFollowing 컨트롤러 안에는 User라는 모델 존재 -> 실제 DB 연결 -> 테스트 환경에서 사용 불가
    // => User 모델도 모킹 필요
    // await addFollowing(req, res, next); : 모델을 모킹하지 않고 이것만 사용하면 오류 남
    User.findOne.mockReturnValue(
      Promise.resolve({
        addFollowing(id) {
          return Promise.resolve(true);
        },
      })
    );
    await addFollowing(req, res, next);
    expect(res.send).toBeCalledWith('success');
  });

  test('사용자를 못찾으면 res.status(404).send(no user)를 호출함', async () => {
    User.findOne.mockReturnValue(null);
    await addFollowing(req, res, next);
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith('no user');
  });

  test('DB에서 에러가 발생하면 next(error) 호출함', async () => {
    const error = '테스트용 에러';
    User.findOne.mockReturnValue(Promise.reject(error));
    await addFollowing(req, res, next);
    expect(next).toBeCalledWith(error);
  });
});
