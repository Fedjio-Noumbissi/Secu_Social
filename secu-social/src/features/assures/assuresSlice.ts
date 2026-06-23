import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Assure } from '../../types';

interface AssuresState {
  assures: Assure[];
  selectedAssure: Assure | null;
  loading: boolean;
  error: string | null;
}

const initialState: AssuresState = {
  assures: [],
  selectedAssure: null,
  loading: false,
  error: null,
};

const assuresSlice = createSlice({
  name: 'assures',
  initialState,
  reducers: {
    setAssures(state, action: PayloadAction<Assure[]>) {
      state.assures = action.payload;
      state.loading = false;
      state.error = null;
    },
    addAssure(state, action: PayloadAction<Assure>) {
      state.assures.push(action.payload);
    },
    updateAssure(state, action: PayloadAction<Assure>) {
      const index = state.assures.findIndex(
        (a) => String(a.id) === String(action.payload.id)
      );
      if (index !== -1) {
        state.assures[index] = action.payload;
      }
    },
    removeAssure(state, action: PayloadAction<string>) {
      state.assures = state.assures.filter(
        (a) => String(a.id) !== String(action.payload)
      );
    },
    selectAssure(state, action: PayloadAction<Assure | null>) {
      state.selectedAssure = action.payload;
    },
    setAssuresLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setAssuresError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setAssures,
  addAssure,
  updateAssure,
  removeAssure,
  selectAssure,
  setAssuresLoading,
  setAssuresError,
} = assuresSlice.actions;

export default assuresSlice.reducer;
