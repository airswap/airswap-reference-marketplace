import { BatchCall, Swap } from '@airswap/libraries';
import { FullOrder, TokenInfo } from '@airswap/types';
import { BaseProvider } from '@ethersproject/providers';
import { format } from '@greypixel_/nicenumbers';
import { BigNumber } from 'bignumber.js';

import { nativeCurrencyAddress } from '../../constants/nativeCurrency';
import { FullOrderState } from '../../types/FullOrderState';

// A nonce is generated by signer and is not necessarily unique.
export const getFullOrderKey = (fullOrder: FullOrder): string => `${fullOrder.nonce}:${fullOrder.signer.token}:${fullOrder.signer.id}`;

export const getFullOrderSenderAmountPlusTotalFees = (fullOrder: FullOrder): BigNumber => {
  const protocolFeePercentage = +fullOrder.protocolFee / 10000;
  const affiliateFeePercentage = +fullOrder.affiliateAmount / 10000;
  const feePercentage = protocolFeePercentage + affiliateFeePercentage;
  const fullAmount = new BigNumber(fullOrder.sender.amount).dividedBy(1 - feePercentage);

  return fullAmount.decimalPlaces(0, BigNumber.ROUND_UP);
};

export const getFullOrderReadableSenderAmountPlusTotalFees = (fullOrder: FullOrder, token: TokenInfo): string => {
  const amount = getFullOrderSenderAmountPlusTotalFees(fullOrder);

  return format(amount, {
    tokenDecimals: token.decimals,
    omitTrailingZeroes: true,
  });
};

export const getFullOrderReadableSenderAmount = (fullOrder: FullOrder, token: TokenInfo): string => format(fullOrder.sender.amount, {
  tokenDecimals: token.decimals,
  omitTrailingZeroes: true,
});

export const getFullOrderExpiryDate = (fullOrder: FullOrder): Date => new Date(+fullOrder.expiry * 1000);

export const isFullOrderExpired = (fullOrder: FullOrder): boolean => getFullOrderExpiryDate(fullOrder) < new Date();

export const getFullOrderNonceUsed = (
  order: FullOrder,
  provider: BaseProvider,
// TODO: use batch call
): Promise<boolean> => Swap.getContract(provider, order.chainId).nonceUsed(
  order.signer.wallet,
  order.nonce,
);

export const getFullOrdersNonceUsed = (orders: FullOrder[], provider: BaseProvider): Promise<boolean[]> => Promise.all(
  orders.map(order => getFullOrderNonceUsed(order, provider)),
);

export const getFullOrdersIsValid = async (orders: FullOrder[], provider: BaseProvider): Promise<boolean[]> => {
  if (orders.length === 0) {
    return [];
  }

  const { chainId } = orders[0];
  const contract = BatchCall.getContract(provider, chainId);

  return contract.checkOrders(
    nativeCurrencyAddress,
    orders,
    Swap.getContract(provider, chainId).address,
  );
};

export const getFullOrderLabelTranslation = (state: FullOrderState, isHighlighted?: boolean): string | undefined => {
  if (isHighlighted) {
    return 'Newly listed';
  }

  switch (state) {
    case FullOrderState.expired:
      return 'Expired';
    case FullOrderState.invalid:
      return 'Invalid';
    case FullOrderState.taken:
      return 'Taken';
    default:
      return undefined;
  }
};
