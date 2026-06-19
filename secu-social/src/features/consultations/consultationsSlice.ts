import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Consultation } from '../../types';

interface ConsultationsState {
  consultations: Consultation[];
  selectedConsultation: Consultation | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConsultationsState = {
  consultations: [],
  selectedConsultation: null,
  loading: false,
  error: null,
};

const consultationsSlice = createSlice({
  name: 'consultations',
  initialState,
  reducers: {
    setConsultations(state, action: PayloadAction< Consultation[]>) {
      state.consultations = action.payload;
      state.loading = false;
      state.error = null;
    },
    addConsultation(state, action: PayloadAction<Consultation>) {
      state.consultations.push(action.payload);
    },
    updateConsultation(state, action: PayloadAction<Consultation>) {
      const index = state.consultations.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.consultations[index] = action.payload;
      }
    },
    selectConsultation(state, action: PayloadAction<Consultation | null>) {
      state.selectedConsultation = action.payload;
    },
    setConsultationsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setConsultationsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setConsultations,
  addConsultation,
  updateConsultation,
  selectConsultation,
  setConsultationsLoading,
  setConsultationsError,
} = consultationsSlice.actions;

export default consultationsSlice.reducer;
