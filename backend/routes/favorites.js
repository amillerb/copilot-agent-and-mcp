const express = require('express');

function createFavoritesRouter({ usersFile, booksFile, readJSON, writeJSON, authenticateToken }) {
  const router = express.Router();

  router.get('/', authenticateToken, (req, res) => {
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const books = readJSON(booksFile);
    const ratings = user.ratings || {};
    const favorites = books
      .filter(b => user.favorites.indexOf(b.id) !== -1)
      .map(b => ({ ...b, rating: ratings[b.id] || null }));
    res.json(favorites);
  });

  router.post('/', authenticateToken, (req, res) => {
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ message: 'Book ID required' });
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.favorites.indexOf(bookId) == -1) {
      user.favorites.push(bookId);
      writeJSON(usersFile, users);
    }
    res.status(200).json({ message: 'Book added to favorites' });
  });

  // generated-by-copilot: PUT /favorites/:bookId/rating - set a 1-5 star rating for a favorite book
  router.put('/:bookId/rating', authenticateToken, (req, res) => {
    const { bookId } = req.params;
    const { rating } = req.body;
    if (rating === undefined || rating === null) {
      return res.status(400).json({ message: 'Rating is required' });
    }
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.favorites.indexOf(bookId) === -1) {
      return res.status(404).json({ message: 'Book not in favorites' });
    }
    if (!user.ratings) user.ratings = {};
    user.ratings[bookId] = ratingNum;
    writeJSON(usersFile, users);
    res.status(200).json({ message: 'Rating saved', bookId, rating: ratingNum });
  });

  return router;
}

module.exports = createFavoritesRouter;
