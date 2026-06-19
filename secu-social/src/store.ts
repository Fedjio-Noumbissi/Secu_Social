import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import assuresReducer from './features/assures/assuresSlice';
import medecinsReducer from './features/medecins/medecinsSlice';
import consultationsReducer from './features/consultations/consultationsSlice';
import prescriptionsReducer from './features/prescriptions/prescriptionsSlice';
import feuillesReducer from './features/feuillesMaladie/feuillesSlice';
import remboursementsReducer from './features/remboursements/remboursementsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assures: assuresReducer,
    medecins: medecinsReducer,
    consultations: consultationsReducer,
    prescriptions: prescriptionsReducer,
    feuillesMaladie: feuillesReducer,
    remboursements: remboursementsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
