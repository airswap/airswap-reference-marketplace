import { FullOrder } from '@airswap/types';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

import { OrderFilter } from '../../../entities/OrderFilter/OrderFilter';
import { TokenIdsWithBalance } from '../../../entities/TokenIdsWithBalance/TokenIdsWithBalance';
import { getOrdersFromIndexers } from '../../../helpers/indexers';
import { AppThunkApiConfig } from '../../store';
import { getOwnedTokenIdsOfWallet } from '../balances/balancesHelpers';

export const getProfileOrders = createAsyncThunk<
FullOrder[],
OrderFilter,
AppThunkApiConfig
>('profile/getProfileOrders', async (filter, { getState }) => {
  const { indexer } = getState();

  return getOrdersFromIndexers(filter, indexer.urls);
});

interface GetOwnedTokensOfAccountParams {
  account: string,
  provider: ethers.providers.BaseProvider,
}

export const getProfileTokens = createAsyncThunk<
TokenIdsWithBalance,
GetOwnedTokensOfAccountParams,
AppThunkApiConfig
>('profile/getProfileTokens', async ({ account, provider }, { getState }) => {
  const { config } = getState();

  return getOwnedTokenIdsOfWallet(provider, account, config.collectionToken);
});
