import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchCurrencyTokenAllowance, fetchCurrencyTokenBalance, fetchUserTokens } from './balancesApi';

interface BalancesState {
  isLoading: boolean;
  isLoadingAllowances: boolean;
  isLoadingBalances: boolean;
  isLoadingTokens: boolean;
  currencyTokenAllowance: string;
  currencyTokenBalance: string;
  tokens: number[];
}

const initialState: BalancesState = {
  isLoading: false,
  isLoadingAllowances: false,
  isLoadingBalances: false,
  isLoadingTokens: false,
  currencyTokenAllowance: '0',
  currencyTokenBalance: '0',
  tokens: [],
};

const balancesSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>): BalancesState => ({
      ...state,
      isLoading: action.payload,
    }),
    setAllowance: (state, action: PayloadAction<string>): BalancesState => ({
      ...state,
      currencyTokenAllowance: action.payload,
    }),
    setBalance: (state, action: PayloadAction<string>): BalancesState => ({
      ...state,
      currencyTokenBalance: action.payload,
    }),
  },
  extraReducers: builder => {
    builder.addCase(fetchCurrencyTokenBalance.pending, (state): BalancesState => ({
      ...state,
      isLoading: true,
      isLoadingBalances: true,
    }));

    builder.addCase(fetchCurrencyTokenBalance.fulfilled, (state, action): BalancesState => ({
      ...state,
      isLoading: state.isLoadingAllowances || state.isLoadingTokens,
      isLoadingBalances: false,
      currencyTokenBalance: action.payload,
    }));

    builder.addCase(fetchUserTokens.pending, (state): BalancesState => ({
      ...state,
      isLoading: true,
      isLoadingTokens: true,
    }));

    builder.addCase(fetchUserTokens.fulfilled, (state, action): BalancesState => ({
      ...state,
      isLoading: state.isLoadingAllowances || state.isLoadingBalances,
      isLoadingTokens: false,
      tokens: action.payload,
    }));

    builder.addCase(fetchCurrencyTokenAllowance.pending, (state): BalancesState => ({
      ...state,
      isLoading: true,
      isLoadingAllowances: true,
    }));

    builder.addCase(fetchCurrencyTokenAllowance.fulfilled, (state, action): BalancesState => ({
      ...state,
      isLoading: state.isLoadingBalances || state.isLoadingTokens,
      isLoadingAllowances: false,
      currencyTokenAllowance: action.payload,
    }));
  },
});

export const {
  setIsLoading,
  setAllowance,
  setBalance,
} = balancesSlice.actions;

export default balancesSlice.reducer;
