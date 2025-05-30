import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_KEY = '411e7482b082456cbf968bac1646f53a';

// export const fetchGames = createAsyncThunk(
//   'games/fetchGames',
//   async ({ page = 1, url = null } = {}) => {
//     const finalUrl = url ?? `https://api.rawg.io/api/games?key=${API_KEY}&page_size=15&dates=1980-01-01,2005-12-31&ordering=-rating`;
//     const response = await axios.get(finalUrl);
//     return {
//       results: response.data.results,
//       next: response.data.next,
//       previous: response.data.previous,
//       usedUrl: finalUrl,
//       page: page,
//     };
//   }
// );

export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async ({ page = 1, url, filters = {} }, thunkAPI) => {
    try {
      let query = url || `https://api.rawg.io/api/games?key=${API_KEY}&page_size=15&dates=1980-01-01,2005-12-31&ordering=-rating`;

      const params = new URLSearchParams(filters);
      if (params.toString()) {
        query += `&${params.toString()}`;
      }
      const response = await axios.get(query);
      return {
        results: response.data.results,
        next: response.data.next,
        previous: response.data.previous,
        usedUrl: query,
        page: page,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
    gamesList: [],
    status: 'idle',
    error: null,
    nextPageUrl: null,
    prevPageUrl: null,
    currentPage:1,
    pageHistory:{
    }
}

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        const { results, next, previous, usedUrl, page } = action.payload;
        state.status = 'succeeded';
        state.gamesList = results;
        state.nextPageUrl = next;
        state.prevPageUrl = previous;

        state.pageHistory[page] = usedUrl;
        state.currentPage = page;

        if (next) {
          state.pageHistory[page + 1] = next;
        }
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const selectAllGames = (state) => state.games.gamesList;
export const selectGameStatus = (state) => state.games.status;
export const selectGameError = (state) => state.games.error;
export const selectNextPage = (state) => state.games.nextPageUrl;
export const selectPrevPage = (state) => state.games.prevPageUrl;
export const selectCurrentPage = (state) => state.games.currentPage;
export const selectPageHistory = (state) => state.games.pageHistory;

export default gamesSlice.reducer;
