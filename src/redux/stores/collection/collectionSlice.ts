import { CollectionTokenInfo } from '@airswap/types';
import { createSlice } from '@reduxjs/toolkit';

import { getUniqueArrayChildren } from '../../../helpers/array';
import { fetchCollectionToken } from './collectionApi';

export interface CollectionState {
  isLoading: boolean;
  tokensData: CollectionTokenInfo[];
}

const initialState: CollectionState = {
  isLoading: false,
  tokensData: [],
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchCollectionToken.pending, state => ({
      ...state,
      isLoading: true,
    }));

    builder.addCase(fetchCollectionToken.fulfilled, (state, action) => {
      const filteredTokens = action.payload.filter(token => token !== undefined) as CollectionTokenInfo[];

      const newTokensData = getUniqueArrayChildren([
        ...state.tokensData,
        ...filteredTokens,
      ].sort((a, b) => a.id - b.id), 'id') as CollectionTokenInfo[];

      return {
        ...state,
        isLoading: false,
        tokensData: newTokensData,
      };
    });

    // TODO: Add error handling https://github.com/airswap/airswap-marketplace/issues/48
    builder.addCase(fetchCollectionToken.rejected, (state, action) => {
      console.error('fetchCollectionTokens.rejected', action.error);
    });
  },
});

export default collectionSlice.reducer;
