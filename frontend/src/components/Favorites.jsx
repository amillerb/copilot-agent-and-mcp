import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFavorites, updateFavoriteComment } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';

// generated-by-copilot: Favorites component with comment support
const Favorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.favorites.items);
  const status = useAppSelector(state => state.favorites.status);
  const token = useAppSelector(state => state.user.token);
  const navigate = useNavigate();
  
  // generated-by-copilot: Local state for editing comments
  const [editingId, setEditingId] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(fetchFavorites(token));
  }, [dispatch, token, navigate]);

  // generated-by-copilot: Handle starting to edit a comment
  const handleEditComment = (book) => {
    setEditingId(book.id);
    setCommentText(book.comment || '');
  };

  // generated-by-copilot: Handle saving a comment
  const handleSaveComment = async (bookId) => {
    await dispatch(updateFavoriteComment({ token, bookId, comment: commentText }));
    setEditingId(null);
    setCommentText('');
  };

  // generated-by-copilot: Handle canceling edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setCommentText('');
  };

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
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {favorites.map(book => (
            <li key={book.id} style={{
              background: '#fff',
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <strong>{book.title}</strong> by {book.author}
              
              {/* generated-by-copilot: Comment display and edit section */}
              <div style={{ marginTop: '0.5rem' }}>
                {editingId === book.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add your comment..."
                      style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        resize: 'vertical',
                        minHeight: '60px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleSaveComment(book.id)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#f0f0f0',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {book.comment ? (
                      <p style={{ 
                        fontStyle: 'italic', 
                        color: '#666',
                        margin: '0.5rem 0',
                        padding: '0.5rem',
                        background: '#f9f9f9',
                        borderRadius: '4px',
                      }}>
                        "{book.comment}"
                      </p>
                    ) : null}
                    <button
                      onClick={() => handleEditComment(book)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      {book.comment ? 'Edit Comment' : 'Add Comment'}
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
