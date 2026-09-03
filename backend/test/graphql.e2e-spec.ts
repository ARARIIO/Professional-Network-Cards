import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

type GqlBody = {
  data: Record<string, unknown> | null;
  errors: Array<{ message: string }> | null;
};

async function graphql(
  app: INestApplication,
  query: string,
  variables: Record<string, unknown> | null,
  token: string | null,
): Promise<{ body: GqlBody; cookies: string[] }> {
  let req = request(app.getHttpServer())
    .post('/graphql')
    .send({ query, variables });
  if (token !== null) {
    req = req.set('Authorization', `Bearer ${token}`);
  }
  const response = await req;
  const cookiesHeader = response.headers['set-cookie'];
  const cookies = Array.isArray(cookiesHeader)
    ? cookiesHeader
    : typeof cookiesHeader === 'string'
      ? [cookiesHeader]
      : [];
  return { body: response.body as GqlBody, cookies };
}

function dataField<T>(body: GqlBody, key: string): T {
  if (body.data === null || typeof body.data !== 'object') {
    throw new Error(`Missing data for ${key}: ${JSON.stringify(body)}`);
  }
  return body.data[key] as T;
}

describe('GraphQL API (e2e)', () => {
  let app: INestApplication;
  const stamp = Date.now().toString();
  const email = `e2e-${stamp}@pnc.test`;
  const password = 'Password1!';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('covers auth, cards, contacts, analytics, rest extras', async () => {
    const health = await request(app.getHttpServer()).get('/health');
    expect(health.status).toBe(200);
    expect(health.body).toEqual({ status: 'ok' });

    const meAnon = await graphql(app, 'query { me { id } }', null, null);
    expect(dataField(meAnon.body, 'me')).toBeNull();

    const registered = await graphql(
      app,
      `mutation Register($input: RegisterInput!) {
        register(input: $input) { token user { id email name } }
      }`,
      { input: { email, password, name: 'E2E User' } },
      null,
    );
    const auth = dataField<{ token: string; user: { id: string } }>(
      registered.body,
      'register',
    );
    expect(auth.token.length).toBeGreaterThan(10);
    let token = auth.token;

    const dup = await graphql(
      app,
      `mutation Register($input: RegisterInput!) {
        register(input: $input) { token user { id } }
      }`,
      { input: { email, password, name: 'E2E User' } },
      null,
    );
    expect(dup.body.errors !== null && dup.body.errors.length > 0).toBe(true);

    const loggedIn = await graphql(
      app,
      `mutation Login($input: LoginInput!) {
        login(input: $input) { token user { email } }
      }`,
      { input: { email, password } },
      null,
    );
    token = dataField<{ token: string }>(loggedIn.body, 'login').token;

    const badLogin = await graphql(
      app,
      `mutation Login($input: LoginInput!) {
        login(input: $input) { token }
      }`,
      { input: { email, password: 'wrongpass' } },
      null,
    );
    expect(badLogin.body.errors !== null).toBe(true);

    const emptyCard = await graphql(app, 'query { myCard { id } }', null, token);
    expect(dataField(emptyCard.body, 'myCard')).toBeNull();

    const created = await graphql(
      app,
      `mutation CreateCard($input: CreateCardInput!) {
        createCard(input: $input) {
          id slug name email skills isPublic viewsCount
        }
      }`,
      {
        input: {
          name: 'E2E User',
          email,
          phone: '+1000',
          website: 'https://e2e.test',
          bio: 'Tester',
          skills: ['NestJS', 'GraphQL'],
          github: 'https://github.com/e2e',
        },
      },
      token,
    );
    const card = dataField<{ id: string; slug: string; viewsCount: number }>(
      created.body,
      'createCard',
    );
    expect(card.slug.length).toBe(12);
    expect(card.viewsCount).toBe(0);

    const again = await graphql(
      app,
      `mutation CreateCard($input: CreateCardInput!) {
        createCard(input: $input) { id }
      }`,
      { input: { name: 'E2E User', email } },
      token,
    );
    expect(again.body.errors !== null).toBe(true);

    const updated = await graphql(
      app,
      `mutation UpdateCard($input: UpdateCardInput!) {
        updateCard(input: $input) { bio isPublic }
      }`,
      { input: { bio: 'Updated bio', isPublic: true } },
      token,
    );
    expect(dataField<{ bio: string }>(updated.body, 'updateCard').bio).toBe(
      'Updated bio',
    );

    const publicView = await graphql(
      app,
      `query GetCard($slug: String!) {
        getCard(slug: $slug) { name email bio skills }
      }`,
      { slug: card.slug },
      null,
    );
    const publicCard = dataField<{ name: string }>(publicView.body, 'getCard');
    expect(publicCard.name).toBe('E2E User');

    const restView = await request(app.getHttpServer()).get(`/cards/${card.slug}`);
    expect(restView.status).toBe(200);
    expect(restView.body.data.name).toBe('E2E User');

    const analytics = await graphql(
      app,
      `query {
        cardAnalytics {
          totalViews
          lastSevenDaysViews { date count }
          recentViewers { ipAddress userAgent viewedAt }
        }
      }`,
      null,
      token,
    );
    const stats = dataField<{
      totalViews: number;
      lastSevenDaysViews: Array<{ date: string; count: number }>;
    }>(analytics.body, 'cardAnalytics');
    expect(stats.totalViews).toBeGreaterThanOrEqual(2);
    expect(stats.lastSevenDaysViews).toHaveLength(7);

    await graphql(
      app,
      `mutation Record($cardId: String!) { recordCardView(cardId: $cardId) }`,
      { cardId: card.id },
      null,
    );

    const saved = await graphql(
      app,
      `mutation Save($input: SaveContactInput!) {
        saveContact(input: $input) { id name email skills }
      }`,
      {
        input: {
          name: 'Saved Person',
          email: 'saved@pnc.test',
          skills: ['Go'],
        },
      },
      token,
    );
    const contact = dataField<{ id: string }>(saved.body, 'saveContact');

    const listed = await graphql(
      app,
      `query { myContacts(limit: 10, offset: 0) { id name } }`,
      null,
      token,
    );
    const contacts = dataField<Array<{ id: string }>>(listed.body, 'myContacts');
    expect(contacts.some((item) => item.id === contact.id)).toBe(true);

    const csvExport = await request(app.getHttpServer())
      .get('/contacts/export')
      .set('Authorization', `Bearer ${token}`);
    expect(csvExport.status).toBe(200);
    expect(csvExport.text).toContain('Saved Person');

    const imported = await request(app.getHttpServer())
      .post('/contacts/import')
      .set('Authorization', `Bearer ${token}`)
      .send({
        csv: '"name","email"\n"Imported","imp@pnc.test"',
      });
    expect([200, 201]).toContain(imported.status);
    expect(imported.body.imported).toBe(1);

    await graphql(
      app,
      `mutation Delete($id: String!) { deleteContact(id: $id) }`,
      { id: contact.id },
      token,
    );

    const hidden = await graphql(
      app,
      `mutation UpdateCard($input: UpdateCardInput!) {
        updateCard(input: $input) { isPublic }
      }`,
      { input: { isPublic: false } },
      token,
    );
    expect(dataField<{ isPublic: boolean }>(hidden.body, 'updateCard').isPublic).toBe(
      false,
    );
    const missing = await graphql(
      app,
      `query GetCard($slug: String!) { getCard(slug: $slug) { name } }`,
      { slug: card.slug },
      null,
    );
    expect(missing.body.errors !== null).toBe(true);

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', loggedIn.cookies.join('; '));
    expect([200, 201]).toContain(refresh.status);
    expect(typeof refresh.body.token).toBe('string');
    expect(refresh.body.token.length).toBeGreaterThan(10);

    const logout = await graphql(app, `mutation { logout }`, null, token);
    expect(dataField<boolean>(logout.body, 'logout')).toBe(true);

    await graphql(
      app,
      `mutation Login($input: LoginInput!) { login(input: $input) { token } }`,
      { input: { email, password } },
      null,
    );
    const deleted = await graphql(app, `mutation { deleteCard }`, null, token);
    expect(dataField<boolean>(deleted.body, 'deleteCard')).toBe(true);
  });
});
