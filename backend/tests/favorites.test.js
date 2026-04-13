const request = require('supertest');
const express = require('express');
const createApiRouter = require('../routes');
const path = require('path');

const fs = require('fs');
const usersFile = path.join(__dirname, '../data/test-users.json');
const booksFile = path.join(__dirname, '../data/test-books.json');

// Helper to get a valid JWT
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'test_secret';
function getToken(username = 'sandra') {
  return jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
}

const app = express();
app.use(express.json());
app.use('/api', createApiRouter({
  usersFile,
  booksFile,
  readJSON: (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : [],
  writeJSON: (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2)),
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    try {
      req.user = jwt.verify(token, SECRET_KEY);
      next();
    } catch {
      return res.sendStatus(403);
    }
  },
  SECRET_KEY,
}));

describe('Favorites API', () => {
  it('GET /api/favorites should fail without auth', async () => {
    const res = await request(app).get('/api/favorites');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/favorites should return favorites for valid user', async () => {
    const token = getToken('sandra');
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/favorites should 404 for non-existent user', async () => {
    const token = getToken('nouser');
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/favorites should add a book to favorites', async () => {
    const token = getToken('sandra');
    // Pick a book not already in favorites
    const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    const sandra = users.find(u => u.username === 'sandra');
    const notFav = books.find(b => !sandra.favorites.includes(b.id));
    if (!notFav) return; // skip if all are favorites
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId: notFav.id });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/added/);
  });

  it('POST /api/favorites should not duplicate favorites', async () => {
    const token = getToken('sandra');
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    const sandra = users.find(u => u.username === 'sandra');
    const alreadyFav = sandra.favorites[0];
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId: alreadyFav });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/added/);
  });

  it('POST /api/favorites should fail with missing bookId', async () => {
    const token = getToken('sandra');
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/favorites should 404 for non-existent user', async () => {
    const token = getToken('nouser');
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId: '1' });
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/favorites should fail without auth', async () => {
    const res = await request(app)
      .post('/api/favorites')
      .send({ bookId: '1' });
    expect(res.statusCode).toBe(401);
  });

  // generated-by-copilot: Tests for comment functionality
  describe('Comment on favorites', () => {
    it('PUT /api/favorites/:bookId/comment should update comment', async () => {
      const token = getToken('sandra');
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      const sandra = users.find(u => u.username === 'sandra');
      // Get a favorite bookId (handle both old string format and new object format)
      const firstFav = sandra.favorites[0];
      const bookId = typeof firstFav === 'string' ? firstFav : firstFav.bookId;
      
      const res = await request(app)
        .put(`/api/favorites/${bookId}/comment`)
        .set('Authorization', `Bearer ${token}`)
        .send({ comment: 'Great book!' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/updated/i);
      expect(res.body.comment).toBe('Great book!');
    });

    it('PUT /api/favorites/:bookId/comment should fail without auth', async () => {
      const res = await request(app)
        .put('/api/favorites/1/comment')
        .send({ comment: 'Test comment' });
      expect(res.statusCode).toBe(401);
    });

    it('PUT /api/favorites/:bookId/comment should 404 for non-existent user', async () => {
      const token = getToken('nouser');
      const res = await request(app)
        .put('/api/favorites/1/comment')
        .set('Authorization', `Bearer ${token}`)
        .send({ comment: 'Test comment' });
      expect(res.statusCode).toBe(404);
    });

    it('PUT /api/favorites/:bookId/comment should 404 for non-favorite book', async () => {
      const token = getToken('sandra');
      const res = await request(app)
        .put('/api/favorites/999/comment')
        .set('Authorization', `Bearer ${token}`)
        .send({ comment: 'Test comment' });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/favorite not found/i);
    });

    it('PUT /api/favorites/:bookId/comment should fail without comment field', async () => {
      const token = getToken('sandra');
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      const sandra = users.find(u => u.username === 'sandra');
      const firstFav = sandra.favorites[0];
      const bookId = typeof firstFav === 'string' ? firstFav : firstFav.bookId;
      
      const res = await request(app)
        .put(`/api/favorites/${bookId}/comment`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.statusCode).toBe(400);
    });

    it('GET /api/favorites should return comments with books', async () => {
      const token = getToken('sandra');
      // First add a comment
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      const sandra = users.find(u => u.username === 'sandra');
      const firstFav = sandra.favorites[0];
      const bookId = typeof firstFav === 'string' ? firstFav : firstFav.bookId;
      
      await request(app)
        .put(`/api/favorites/${bookId}/comment`)
        .set('Authorization', `Bearer ${token}`)
        .send({ comment: 'My favorite!' });
      
      // Then fetch favorites
      const res = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      const bookWithComment = res.body.find(b => b.id === bookId);
      expect(bookWithComment).toBeDefined();
      expect(bookWithComment.comment).toBe('My favorite!');
    });
  });
});
