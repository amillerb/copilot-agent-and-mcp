const express = require('express');

// generated-by-copilot: Helper to normalize favorites array
// Converts legacy string format to object format with comment support
function normalizeFavorites(favorites) {
  if (!favorites) return [];
  return favorites.map(fav => {
    if (typeof fav === 'string') {
      return { bookId: fav, comment: '' };
    }
    return fav;
  });
}

// generated-by-copilot: Helper to find a favorite by book ID
function findFavorite(favorites, bookId) {
  const normalized = normalizeFavorites(favorites);
  return normalized.find(f => f.bookId === bookId);
}

function createFavoritesRouter({ usersFile, booksFile, readJSON, writeJSON, authenticateToken }) {
  const router = express.Router();

  // generated-by-copilot: GET favorites with comments
  router.get('/', authenticateToken, (req, res) => {
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const books = readJSON(booksFile);
    const normalizedFavorites = normalizeFavorites(user.favorites);
    
    // generated-by-copilot: Return books with their comments
    const favorites = normalizedFavorites
      .map(fav => {
        const book = books.find(b => b.id === fav.bookId);
        if (!book) return null;
        return { ...book, comment: fav.comment || '' };
      })
      .filter(Boolean);
    res.json(favorites);
  });

  // generated-by-copilot: POST to add a favorite with optional comment
  router.post('/', authenticateToken, (req, res) => {
    const { bookId, comment } = req.body;
    if (!bookId) return res.status(400).json({ message: 'Book ID required' });
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // generated-by-copilot: Normalize existing favorites to new format
    user.favorites = normalizeFavorites(user.favorites);
    
    const existingFav = findFavorite(user.favorites, bookId);
    if (!existingFav) {
      user.favorites.push({ bookId, comment: comment || '' });
      writeJSON(usersFile, users);
    }
    res.status(200).json({ message: 'Book added to favorites' });
  });

  // generated-by-copilot: PUT to update comment on a favorite
  router.put('/:bookId/comment', authenticateToken, (req, res) => {
    const { bookId } = req.params;
    const { comment } = req.body;
    
    if (comment === undefined) {
      return res.status(400).json({ message: 'Comment is required' });
    }
    
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // generated-by-copilot: Normalize favorites to new format
    user.favorites = normalizeFavorites(user.favorites);
    
    const favorite = user.favorites.find(f => f.bookId === bookId);
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    
    favorite.comment = comment;
    writeJSON(usersFile, users);
    res.status(200).json({ message: 'Comment updated', comment });
  });

  return router;
}

module.exports = createFavoritesRouter;
