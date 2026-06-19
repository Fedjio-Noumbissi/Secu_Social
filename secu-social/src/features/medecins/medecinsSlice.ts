import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Medecin } from '../../types';

interface MedecinsState {
  medecins: Medecin[];
  selectedMedecin: Medecin | null;
  loading: boolean;
  error: string | null;
}

const initialState: MedecinsState = {
  medecins: [],
  selectedMedecin: null,
  loading: false,
  error: null,
};

const medecinsSlice = createSlice({
  name: 'medecins',
  initialState,
  reducers: {
    setMedecins(state, action: PayloadAction<Medecin[]>) {
      state.medecins = action.payload;
      state.loading = false;
      state.error = null;
    },
    addMedecin(state, action: PayloadAction<Medecin>) {
      state.medecins.push(action.payload);
    },
    updateMedecin(state, action: PayloadAction<Medecin>) {
      const index = state.medecins.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.medecins[index] = action.payload;
      }
    },
    removeMedecin(state, action: PayloadAction<string>) {
      state.medecins = state.medecins.filter((m) => m.id !== action.payload);
    },
    selectMedecin(state, action: PayloadAction<Medecin | null>) {
      state.selectedMedecin = action.payload;
    },
    setMedecinsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setMedecinsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setMedecins,
  addMedecin,
  updateMedecin,
  removeMedecin,
  selectMedecin,
  setMedecinsLoading,
  setMedecinsError,
} = medecinsSlice.actions;

export default medecinsSlice.reducer;
