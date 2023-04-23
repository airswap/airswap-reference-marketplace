import { useMemo } from 'react';

import { TokenInfo } from '@airswap/types';
import { BigNumber } from 'bignumber.js';

import { useAppSelector } from '../redux/hooks';

const useInsufficientBalance = (
  tokenInfo: TokenInfo | null,
  amount: string,
): boolean => {
  const { currencyTokenBalance } = useAppSelector(store => store.balances);

  return useMemo(() => {
    if (!tokenInfo || !amount) {
      return false;
    }

    if (parseFloat(amount) === 0 || amount === '.') {
      return false;
    }

    if (!tokenInfo.decimals) {
      return false;
    }

    return new BigNumber(currencyTokenBalance).lt(
      new BigNumber(amount).multipliedBy(10 ** tokenInfo.decimals),
    );
  }, [currencyTokenBalance, tokenInfo, amount]);
};

export default useInsufficientBalance;
