import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchFavorites = createAsyncThunk('favorites/fetchFavorites', async (token) => {
  const res = await fetch('http://localhost:4000/api/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
});

export const addFavorite = createAsyncThunk('favorites/addFavorite', async ({ token, bookId }) => {
  await fetch('http://localhost:4000/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookId }),
  });
  return bookId;
});

// generated-by-copilot: thunk for rating a favorite book 1-5 stars
export const rateBook = createAsyncThunk('favorites/rateBook', async ({ token, bookId, rating }) => {
  const res = await fetch(`http://localhost:4000/api/favorites/${bookId}/rating`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating }),
  });
  if (!res.ok) throw new Error('Failed to save rating');
  return { bookId, rating };
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFavorites.pending, state => { state.status = 'loading'; })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, state => { state.status = 'failed'; })
      .addCase(addFavorite.fulfilled, (state, action) => {
        // After adding, fetch the updated favorites list to ensure UI is in sync
      })
      .addCase(rateBook.fulfilled, (state, action) => {
        const { bookId, rating } = action.payload;
        const book = state.items.find(b => b.id === bookId);
        if (book) book.rating = rating;
      });
  },
});

export default favoritesSlice.reducer;
