import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Remboursement } from '../../types';

interface RemboursementsState {
  remboursements: Remboursement[];
  selectedRemboursement: Remboursement | null;
  loading: boolean;
  error: string | null;
}

const initialState: RemboursementsState = {
  remboursements: [],
  selectedRemboursement: null,
  loading: false,
  error: null,
};

const remboursementsSlice = createSlice({
  name: 'remboursements',
  initialState,
  reducers: {
    setRemboursements(state, action: PayloadAction<Remboursement[]>) {
      state.remboursements = action.payload;
      state.loading = false;
      state.error = null;
    },
    addRemboursement(state, action: PayloadAction<Remboursement>) {
      state.remboursements.push(action.payload);
    },
    updateRemboursement(state, action: PayloadAction<Remboursement>) {
      const index = state.remboursements.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.remboursements[index] = action.payload;
      }
    },
    selectRemboursement(state, action: PayloadAction<Remboursement | null>) {
      state.selectedRemboursement = action.payload;
    },
    setRemboursementsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setRemboursementsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setRemboursements,
  addRemboursement,
  updateRemboursement,
  selectRemboursement,
  setRemboursementsLoading,
  setRemboursementsError,
} = remboursementsSlice.actions;

export default remboursementsSlice.reducer;
