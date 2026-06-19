import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PrescriptionMedicament, PrescriptionSpecialiste } from '../../types';

interface PrescriptionsState {
  medicaments: PrescriptionMedicament[];
  specialistes: PrescriptionSpecialiste[];
  loading: boolean;
  error: string | null;
}

const initialState: PrescriptionsState = {
  medicaments: [],
  specialistes: [],
  loading: false,
  error: null,
};

const prescriptionsSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {
    setPrescriptionsMedicaments(state, action: PayloadAction<PrescriptionMedicament[]>) {
      state.medicaments = action.payload;
    },
    addPrescriptionMedicament(state, action: PayloadAction<PrescriptionMedicament>) {
      state.medicaments.push(action.payload);
    },
    setPrescriptionsSpecialistes(state, action: PayloadAction<PrescriptionSpecialiste[]>) {
      state.specialistes = action.payload;
    },
    addPrescriptionSpecialiste(state, action: PayloadAction<PrescriptionSpecialiste>) {
      state.specialistes.push(action.payload);
    },
    setPrescriptionsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setPrescriptionsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setPrescriptionsMedicaments,
  addPrescriptionMedicament,
  setPrescriptionsSpecialistes,
  addPrescriptionSpecialiste,
  setPrescriptionsLoading,
  setPrescriptionsError,
} = prescriptionsSlice.actions;

export default prescriptionsSlice.reducer;
