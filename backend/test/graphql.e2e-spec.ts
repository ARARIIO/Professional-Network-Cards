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
      { input: { email: email.toUpperCase(), password } },
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
          id slug name email skills isPublic viewsCount savesCount
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
    expect(
      dataField<{ savesCount: number }>(created.body, 'createCard').savesCount,
    ).toBe(0);

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

    const savedAgain = await graphql(
      app,
      `mutation Save($input: SaveContactInput!) {
        saveContact(input: $input) { id }
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
    expect(dataField<{ id: string }>(savedAgain.body, 'saveContact').id).toBe(
      contact.id,
    );

    const ownSave = await graphql(
      app,
      `mutation Save($input: SaveContactInput!) {
        saveContact(input: $input) { id }
      }`,
      {
        input: {
          name: 'E2E User',
          email,
          sourceSlug: card.slug,
        },
      },
      token,
    );
    expect(ownSave.body.errors !== null && ownSave.body.errors.length > 0).toBe(
      true,
    );

    const otherEmail = `e2e-other-${stamp}@pnc.test`;
    const otherAuth = await graphql(
      app,
      `mutation Register($input: RegisterInput!) {
        register(input: $input) { token }
      }`,
      { input: { email: otherEmail, password, name: 'Other' } },
      null,
    );
    const otherToken = dataField<{ token: string }>(
      otherAuth.body,
      'register',
    ).token;
    const directory = await graphql(
      app,
      `query Search($query: String) {
        searchPublicCards(query: $query, limit: 20) {
          slug name alreadySaved
        }
      }`,
      { query: null },
      otherToken,
    );
    const hits = dataField<Array<{ slug: string; alreadySaved: boolean }>>(
      directory.body,
      'searchPublicCards',
    );
    expect(hits.some((hit) => hit.slug === card.slug && hit.alreadySaved === false)).toBe(
      true,
    );
    const named = await graphql(
      app,
      `query Search($query: String) {
        searchPublicCards(query: $query) { slug }
      }`,
      { query: 'E2E User' },
      otherToken,
    );
    expect(
      dataField<Array<{ slug: string }>>(named.body, 'searchPublicCards').some(
        (hit) => hit.slug === card.slug,
      ),
    ).toBe(true);
    const ownDirectory = await graphql(
      app,
      `query { searchPublicCards { slug } }`,
      null,
      token,
    );
    expect(
      dataField<Array<{ slug: string }>>(ownDirectory.body, 'searchPublicCards').some(
        (hit) => hit.slug === card.slug,
      ),
    ).toBe(false);

    const sourcedBlocked = await graphql(
      app,
      `mutation Save($input: SaveContactInput!) {
        saveContact(input: $input) { id }
      }`,
      {
        input: {
          name: 'E2E User',
          email,
          sourceSlug: card.slug,
        },
      },
      otherToken,
    );
    expect(sourcedBlocked.body.errors !== null && sourcedBlocked.body.errors.length > 0).toBe(
      true,
    );
    const invited = await graphql(
      app,
      `mutation Invite($slug: String!) { sendContactInvite(sourceSlug: $slug) { id status } }`,
      { slug: card.slug },
      otherToken,
    );
    const invite = dataField<{ id: string; status: string }>(invited.body, 'sendContactInvite');
    expect(invite.status).toBe('pending');
    const invitedAgain = await graphql(
      app,
      `mutation Invite($slug: String!) { sendContactInvite(sourceSlug: $slug) { id status } }`,
      { slug: card.slug },
      otherToken,
    );
    expect(dataField<{ id: string }>(invitedAgain.body, 'sendContactInvite').id).toBe(invite.id);
    const pendingSearch = await graphql(
      app,
      `query Search($query: String) {
        searchPublicCards(query: $query) { slug alreadySaved inviteStatus }
      }`,
      { query: card.slug },
      otherToken,
    );
    expect(
      dataField<Array<{ slug: string; alreadySaved: boolean; inviteStatus: string }>>(
        pendingSearch.body,
        'searchPublicCards',
      ).some(
        (hit) =>
          hit.slug === card.slug && hit.alreadySaved === false && hit.inviteStatus === 'pending',
      ),
    ).toBe(true);
    const inbox = await graphql(
      app,
      `query { incomingContactInvites { id fromEmail cardSlug status } }`,
      null,
      token,
    );
    expect(
      dataField<Array<{ id: string; status: string }>>(inbox.body, 'incomingContactInvites').some(
        (row) => row.id === invite.id && row.status === 'pending',
      ),
    ).toBe(true);
    const accepted = await graphql(
      app,
      `mutation Respond($id: String!, $accept: Boolean!) {
        respondContactInvite(id: $id, accept: $accept) { status }
      }`,
      { id: invite.id, accept: true },
      token,
    );
    expect(dataField<{ status: string }>(accepted.body, 'respondContactInvite').status).toBe(
      'accepted',
    );
    const savedHit = await graphql(
      app,
      `query Search($query: String) {
        searchPublicCards(query: $query) { slug alreadySaved inviteStatus }
      }`,
      { query: card.slug },
      otherToken,
    );
    const savedHits = dataField<Array<{ slug: string; alreadySaved: boolean; inviteStatus: string }>>(
      savedHit.body,
      'searchPublicCards',
    );
    expect(
      savedHits.some(
        (hit) => hit.slug === card.slug && hit.alreadySaved && hit.inviteStatus === 'accepted',
      ),
    ).toBe(true);
    const otherBook = await graphql(
      app,
      `query { myContacts(limit: 10, offset: 0) { name email } }`,
      null,
      otherToken,
    );
    expect(
      dataField<Array<{ name: string }>>(otherBook.body, 'myContacts').some(
        (row) => row.name === 'E2E User',
      ),
    ).toBe(true);
    const thirdEmail = `e2e-third-${stamp}@pnc.test`;
    const thirdAuth = await graphql(
      app,
      `mutation Register($input: RegisterInput!) {
        register(input: $input) { token }
      }`,
      { input: { email: thirdEmail, password, name: 'Third' } },
      null,
    );
    const thirdToken = dataField<{ token: string }>(thirdAuth.body, 'register').token;
    const declinedInvite = await graphql(
      app,
      `mutation Invite($slug: String!) { sendContactInvite(sourceSlug: $slug) { id status } }`,
      { slug: card.slug },
      thirdToken,
    );
    const declinedId = dataField<{ id: string }>(declinedInvite.body, 'sendContactInvite').id;
    const declined = await graphql(
      app,
      `mutation Respond($id: String!, $accept: Boolean!) {
        respondContactInvite(id: $id, accept: $accept) { status }
      }`,
      { id: declinedId, accept: false },
      token,
    );
    expect(dataField<{ status: string }>(declined.body, 'respondContactInvite').status).toBe(
      'declined',
    );
    const thirdBook = await graphql(
      app,
      `query { myContacts(limit: 10, offset: 0) { name } }`,
      null,
      thirdToken,
    );
    expect(
      dataField<Array<{ name: string }>>(thirdBook.body, 'myContacts').some(
        (row) => row.name === 'E2E User',
      ),
    ).toBe(false);
    const afterSave = await graphql(
      app,
      `query { myCard { savesCount } }`,
      null,
      token,
    );
    expect(dataField<{ savesCount: number }>(afterSave.body, 'myCard').savesCount).toBe(
      1,
    );

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
    const ownDraft = await graphql(
      app,
      `query GetCard($slug: String!) { getCard(slug: $slug) { name } }`,
      { slug: card.slug },
      token,
    );
    expect(dataField<{ name: string }>(ownDraft.body, 'getCard').name).toBe('E2E User');
    const missing = await graphql(
      app,
      `query GetCard($slug: String!) { getCard(slug: $slug) { name } }`,
      { slug: card.slug },
      null,
    );
    expect(missing.body.errors !== null).toBe(true);
    const hiddenSearch = await graphql(
      app,
      `query Search($query: String) {
        searchPublicCards(query: $query) { slug }
      }`,
      { query: card.slug },
      otherToken,
    );
    expect(
      dataField<Array<{ slug: string }>>(hiddenSearch.body, 'searchPublicCards').some(
        (hit) => hit.slug === card.slug,
      ),
    ).toBe(false);

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', loggedIn.cookies.join('; '));
    expect([200, 201]).toContain(refresh.status);
    expect(typeof refresh.body.token).toBe('string');
    expect(refresh.body.token.length).toBeGreaterThan(10);

    const logout = await graphql(app, `mutation { logout }`, null, token);
    expect(dataField<boolean>(logout.body, 'logout')).toBe(true);
    const logoutAnon = await graphql(app, `mutation { logout }`, null, null);
    expect(dataField<boolean>(logoutAnon.body, 'logout')).toBe(true);

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
