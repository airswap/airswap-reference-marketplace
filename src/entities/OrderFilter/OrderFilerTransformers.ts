import { OrderFilter as AirswapOrderFilter } from '@airswap/types';

import { OrderFilter } from './OrderFilter';

export const transformOrderFilterToAirswapOrderFilter = (orderFilter: OrderFilter): AirswapOrderFilter => {
  const {
    chainId,
    signerWallet,
    signerToken,
    signerId,
    senderWallet,
    senderToken,
  } = orderFilter;

  return {
    chainId,
    signerWallet,
    signerToken,
    signerId,
    senderWallet,
    senderToken,
  };
};
