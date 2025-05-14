import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_KEY = '411e7482b082456cbf968bac1646f53a'; // Replace with your actual key

export const fetchGames = createAsyncThunk('games/fetchGames', async () => {
  const response = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}&page_size=10&dates=1980-01-01,2005-12-31&ordering=-rating`);
  return response.data;
});

const gamesSlice = createSlice({
  name: 'games',
  initialState: {
    gamesList: [],
    status: 'idle',
    error: null,
    nextPageUrl: null,
    prevPageUrl: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchGames.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.gamesList = action.payload.results;
        state.nextPageUrl = action.payload.next;
        state.prevPageUrl = action.payload.previous;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectAllGames = (state) => state.games.gamesList;
export const selectGameStatus = (state) => state.games.status;
export const selectGameError = (state) => state.games.error;
export const selectNextPage = (state) => state.games.nextPageUrl;
export const selectPrevPage = (state) => state.games.prevPageUrl;

export default gamesSlice.reducer;
