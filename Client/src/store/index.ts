import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '@/store/slices/authSlice';
import categoryReducer from '@/store/slices/categorySlice';
import subCategoryReducer from '@/store/slices/subCategorySlice';
import questionReducer from '@/store/slices/questionSlice';
import userReducer from '@/store/slices/userSlice';
import lookupReducer from '@/store/slices/lookupSlice';

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['auth'],
};

const rootReducer = combineReducers({
    auth: authReducer,
    categories: categoryReducer,
    subCategories: subCategoryReducer,
    questions: questionReducer,
    users: userReducer,
    lookups: lookupReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
