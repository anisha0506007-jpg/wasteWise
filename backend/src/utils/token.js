import jwt from 'jsonwebtoken';

export const AUTH_COOKIE_NAME = 'wastewise_token';

const DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_DAYS = 1;
const REMEMBER_DAYS = 30;

const getCookieOptions = () => {
  const sameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
  const secure = process.env.NODE_ENV === 'production' || sameSite === 'none';

  return {
    httpOnly: true, 
    secure, 
    sameSite, 
  };
};

export const signToken = (userId, rememberMe = false) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: `${rememberMe ? REMEMBER_DAYS : SESSION_DAYS}d`,
  });

export const setAuthCookie = (res, token, rememberMe = false) => {
  const options = getCookieOptions();
 
  if (rememberMe) options.maxAge = REMEMBER_DAYS * DAY_MS;
  res.cookie(AUTH_COOKIE_NAME, token, options);
};

export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions());
};