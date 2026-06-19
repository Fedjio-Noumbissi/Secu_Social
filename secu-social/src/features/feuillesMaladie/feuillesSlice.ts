import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FeuilleMaladie } from '../../types';

interface FeuillesState {
  feuilles: FeuilleMaladie[];
  selectedFeuille: FeuilleMaladie | null;
  loading: boolean;
  error: string | null;
}

const initialState: FeuillesState = {
  feuilles: [],
  selectedFeuille: null,
  loading: false,
  error: null,
};

const feuillesSlice = createSlice({
  name: 'feuillesMaladie',
  initialState,
  reducers: {
    setFeuilles(state, action: PayloadAction<FeuilleMaladie[]>) {
      state.feuilles = action.payload;
      state.loading = false;
      state.error = null;
    },
    addFeuille(state, action: PayloadAction<FeuilleMaladie>) {
      state.feuilles.push(action.payload);
    },
    updateFeuille(state, action: PayloadAction<FeuilleMaladie>) {
      const index = state.feuilles.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.feuilles[index] = action.payload;
      }
    },
    selectFeuille(state, action: PayloadAction<FeuilleMaladie | null>) {
      state.selectedFeuille = action.payload;
    },
    setFeuillesLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setFeuillesError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setFeuilles,
  addFeuille,
  updateFeuille,
  selectFeuille,
  setFeuillesLoading,
  setFeuillesError,
} = feuillesSlice.actions;

export default feuillesSlice.reducer;
