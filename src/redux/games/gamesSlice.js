import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { act } from 'react';

const API_KEY = '411e7482b082456cbf968bac1646f53a';

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

export const fetchGameDetails = createAsyncThunk(
  'games/fetchGameDetails',
  async (gameId, thunkAPI) => {
    try {
      let query = `https://api.rawg.io/api/games/${gameId}?key=${API_KEY}`;
      const response = await axios.get(query);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchGameTrailers = createAsyncThunk(
  'games/fetchGameTrailers',
  async (gameId, thunkAPI) => {
    try{
      let query = `https://api.rawg.io/api/games/${gameId}/movies?key=${API_KEY}`;
      const res = await axios.get(query)
      return res.data;
    }catch(error){
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchGameScreenshots = createAsyncThunk(
  'games/fetchGameScreenshots',
  async (gameId, thunkAPI) => {
    try{
      let query = `https://api.rawg.io/api/games/${gameId}/screenshots?key=${API_KEY}`;
      const res = await axios.get(query);
      return res.data;
    }catch(error){
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
    pageHistory:{},
    gameDetails:{
      status:'idle',
      data:null,
      trailers:[],
      trailersStatus:'idle',
      screenshots:[],
      screenshotsStatus:'idle',
    },
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
      })
      .addCase(fetchGameDetails.pending, (state) =>{
        state.gameDetails.status = 'loading';
      })
      .addCase(fetchGameDetails.fulfilled, (state, action) => {
        state.gameDetails.status = 'succeeded';
        state.gameDetails.data = action.payload;
      })
      .addCase(fetchGameDetails.rejected, (state, action) => {
        state.gameDetails.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchGameTrailers.pending, (state) => {
        state.gameDetails.trailersStatus = 'loading';
      })
      .addCase(fetchGameTrailers.fulfilled, (state, action) => {
        state.gameDetails.trailersStatus = 'succeeded';
        state.gameDetails.trailers = action.payload;
      })
      .addCase(fetchGameTrailers.rejected, (state, action) => {
        state.gameDetails.trailersStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchGameScreenshots.pending, (state) => {
        state.gameDetails.screenshotsStatus = 'loading';
      })
      .addCase(fetchGameScreenshots.fulfilled, (state, action) => {
        state.gameDetails.screenshotsStatus = 'succeeded';
        state.gameDetails.screenshots = action.payload;
      })
      .addCase(fetchGameScreenshots.rejected, (state, action) => {
        state.gameDetails.screenshotsStatus = 'failed';
        state.error = action.error.message;
      })
  }
});

export const selectAllGames = (state) => state.games.gamesList;
export const selectGameStatus = (state) => state.games.status;
export const selectGameError = (state) => state.games.error;
export const selectNextPage = (state) => state.games.nextPageUrl;
export const selectPrevPage = (state) => state.games.prevPageUrl;
export const selectCurrentPage = (state) => state.games.currentPage;
export const selectPageHistory = (state) => state.games.pageHistory;
export const selectGameDetails = (state) => state.games.gameDetails.data;
export const selectGameDetailsStatus = (state) => state.games.gameDetails.status;
export const selectGameTrailers = (state) => state.games.gameDetails.trailers;
export const selectGameTrailersStatus = (state) => state.games.gameDetails.trailersStatus;
export const selectGameScreenshots = (state) => state.games.gameDetails.screenshots;
export const selectGameScreenshotsStatus = (state) => state.games.gameDetails.screenshotsStatus;

export default gamesSlice.reducer;
