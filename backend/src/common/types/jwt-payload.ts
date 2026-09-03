export type JwtAccessPayload = {
  sub: string;
  email: string;
  typ: 'access';
};

export type JwtRefreshPayload = {
  sub: string;
  email: string;
  typ: 'refresh';
};
