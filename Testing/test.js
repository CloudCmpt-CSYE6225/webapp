import request from 'supertest';
import app from '../index.js';
import sequelize from '../app/config/database.js';

let server;

beforeAll(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized');
    server = app.listen();
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
}, 30000);

// Unit Tests for User Creation Endpoint

describe('User Creation Endpoint', () => {
  it('should create a new user with valid data', async () => {
    const res = await request(app)
      .post('/v1/user')
      .send({
        email: 'srijith.makam@abc.com',
        password: '12345',
        first_name: 'Srijith',
        last_name: 'Makam'
      });

    expect(res.status).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/v1/user')
      .send({
        email: 'makam.s@example.com',
      });

    expect(res.status).toEqual(400);
  });

  it('should return 400 if user already exists', async () => {
    const res = await request(app)
      .post('/v1/user')
      .send({
        email: 'srijith.makam@abc.com',
        password: '12345',
        first_name: 'Srijith',
        last_name: 'Makam'
      });

    expect(res.status).toEqual(400);
  });
});

// Integration Tests for Health Check and User Update Endpoints

describe('Health Check and User Update Endpoints', () => {
  it('should return 200 for health check with no payload', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toEqual(200);
  });

  it('should return 400 for health check with payload', async () => {
    const res = await request(app).get('/healthz?test=1');
    expect(res.status).toEqual(400);
  });

  it('should return 204 on successful user update', async () => {
    const res = await request(app)
      .put('/v1/user/self')
      .auth('srijith.makam@abc.com', '12345')
      .send({
        email: 'srijith.makam@abc.com',
        first_name: 'Srijith',
        last_name: 'Makam',
        password: 'abcd1234'
      });

    expect(res.status).toEqual(204);
  });

  it('should return 400 if required fields are missing for user update', async () => {
    const res = await request(app)
      .put('/v1/user/self')
      .auth('srijith.makam@abc.com', 'abcd1234')
      .send({
        email: 'srijith.makam@abc.com',
      });

    expect(res.status).toEqual(400);
  });

  it('should return user information on successful GET request', async () => {
    // Assuming a user with email 'srijith.makam' exists and is authenticated.
    const res = await request(app)
      .get('/v1/user/self')
      .auth('srijith.makam@abc.com', 'abcd1234')

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('first_name');
    expect(res.body).toHaveProperty('last_name');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('account_created');
    expect(res.body).toHaveProperty('account_updated');
  });

  it('should return 401 if user is not authenticated', async () => {
    // Assuming no user is authenticated or the authenticated user doesn't exist.
    const res = await request(app)
      .get('/v1/user/self')
      .auth('srijith.makam@abcd.com', 'abcd1234')

    expect(res.status).toEqual(401);
  });
});

afterAll(async () => {
    // Close the server
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  
    // Close the database connection
    await sequelize.close();
  })