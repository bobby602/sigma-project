let jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;

const jwtGenerate = (user) => {
  const accessToken = jwt.sign(
    { name: user.Name, id: user.Login ,role: user.StAdmin, saleCode:user.saleCode},
    env.ACCESS_TOKEN_PRIVATE_KEY,
    { expiresIn: "1m", algorithm: "HS256" }
  )

  return accessToken
}

const jwtRefreshTokenGenerate = (user) => {
  const refreshToken = jwt.sign(
    { name: user.Name, id: user.Login ,role: user.StAdmin, saleCode:user.saleCode },
    env.REFRESH_TOKEN_PRIVATE_KEY,
    { expiresIn: "2m", algorithm: "HS256" }
  )

  return refreshToken
}

exports.jwtGenerate = jwtGenerate;
exports.jwtRefreshTokenGenerate = jwtRefreshTokenGenerate; 