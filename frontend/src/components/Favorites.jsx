import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFavorites, rateBook } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Favorites.module.css';

// generated-by-copilot: StarRating component renders 1-5 clickable stars
const StarRating = ({ bookId, rating, token }) => {
  const dispatch = useAppDispatch();

  const handleRate = (star) => {
    dispatch(rateBook({ token, bookId, rating: star }));
  };

  return (
    <div className={styles.starRating} aria-label="Rate this book">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          className={styles.starBtn}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={rating === star}
          onClick={() => handleRate(star)}
          title={`${star} star${star > 1 ? 's' : ''}`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={rating !== null && rating >= star ? '#f5a623' : 'none'}
            stroke={rating !== null && rating >= star ? '#f5a623' : '#bbb'}
            strokeWidth="1.8"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const Favorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.favorites.items);
  const status = useAppSelector(state => state.favorites.status);
  const token = useAppSelector(state => state.user.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(fetchFavorites(token));
  }, [dispatch, token, navigate]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Failed to load favorites.</div>;

  return (
    <div>
      <h2>My Favorite Books</h2>
      {favorites.length === 0 ? (
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '2rem auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center',
          color: '#888',
        }}>
          <p>No favorite books yet.</p>
          <p>
            Go to the <a href="/books" onClick={e => { e.preventDefault(); navigate('/books'); }}>book list</a> to add some!
          </p>
        </div>
      ) : (
        <ul className={styles.favoritesList}>
          {favorites.map(book => (
            <li key={book.id} className={styles.favoriteItem}>
              <div className={styles.bookInfo}>
                <strong>{book.title}</strong>
                <span className={styles.bookAuthor}> by {book.author}</span>
              </div>
              <StarRating bookId={book.id} rating={book.rating} token={token} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
