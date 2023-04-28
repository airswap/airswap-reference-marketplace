import React, {
  FC,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { CollectionTokenInfo, FullOrder, TokenInfo } from '@airswap/types';
import { Web3Provider } from '@ethersproject/providers';

import { AppErrorType, isAppError } from '../../../../errors/appError';
import useErc20ApprovalSuccess from '../../../../hooks/useErc20ApprovalSuccess';
import useInsufficientBalance from '../../../../hooks/useInsufficientBalance';
import useOrderTransaction from '../../../../hooks/useOrderTransaction';
import useSufficientErc20Allowance from '../../../../hooks/useSufficientErc20Allowance';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { approve as approveErc20, take } from '../../../../redux/stores/orders/ordersActions';
import { checkOrder } from '../../../../redux/stores/orders/ordersApi';
import { getTitle } from '../../helpers';
import BuyActionButtons from '../BuyActionButtons/BuyActionButtons';
import BuyNftWidgetDetailsContainer from '../BuyNftWidgetDetailsContainer/BuyNftWidgetDetailsContainer';
import BuyNftWidgetHeader from '../BuyNftWidgetHeader/BuyNftWidgetHeader';

import '../../BuyNftWidget.scss';

export enum BuyNftState {
  details = 'details',
  approve = 'approve',
  approving = 'approving',
  sign = 'sign',
  buying = 'buying',
  success = 'success',
  failed = 'failed',
}

interface ConnectedBuyNftWidgetProps {
  account: string;
  chainId: number
  collectionTokenInfo: CollectionTokenInfo;
  currencyTokenInfo: TokenInfo;
  fullOrder: FullOrder;
  library: Web3Provider
  className?: string;
}

const BuyNftWidget: FC<ConnectedBuyNftWidgetProps> = ({
  account,
  chainId,
  collectionTokenInfo,
  currencyTokenInfo,
  fullOrder,
  library,
  className = '',
}) => {
  const dispatch = useAppDispatch();
  const { collectionImage, collectionName } = useAppSelector(state => state.config);

  const [widgetState, setWidgetState] = useState<BuyNftState>(BuyNftState.details);

  const hasInsufficientBalance = useInsufficientBalance(fullOrder.sender.amount);
  const hasSufficientCurrencyAllowance = useSufficientErc20Allowance(currencyTokenInfo, fullOrder.sender.amount);
  const hasCurrencyApprovalSuccess = useErc20ApprovalSuccess(currencyTokenInfo.address);
  const orderTransaction = useOrderTransaction(fullOrder.nonce);
  const ownerIsAccount = fullOrder.signer.wallet.toLowerCase() === account.toLowerCase();

  const title = useMemo(() => getTitle(widgetState), [widgetState]);

  const handleActionButtonClick = async () => {
    if (widgetState === BuyNftState.details && !hasSufficientCurrencyAllowance) {
      setWidgetState(BuyNftState.approve);

      dispatch(approveErc20({
        tokenInfo: currencyTokenInfo,
        library,
        chainId,
      }))
        .unwrap()
        .then(() => {
          setWidgetState(BuyNftState.approving);
        })
        .catch((e) => {
          if (isAppError(e) && e.type === AppErrorType.rejectedByUser) {
            setWidgetState(BuyNftState.details);
          } else {
            setWidgetState(BuyNftState.failed);
          }
        });
    }

    if (widgetState === BuyNftState.details && hasSufficientCurrencyAllowance) {
      setWidgetState(BuyNftState.sign);

      const errors = await checkOrder(
        fullOrder,
        account,
        library,
      );

      if (errors.length) {
        // TODO: Show errors to user
        console.error(errors);

        return;
      }

      dispatch(take({
        order: fullOrder,
        senderWallet: account,
        library,
      }));
    }
  };

  useEffect(() => {
    if (hasCurrencyApprovalSuccess && widgetState === BuyNftState.approving) {
      setWidgetState(BuyNftState.details);
    }
  }, [widgetState, hasCurrencyApprovalSuccess]);

  useEffect(() => {
    if (orderTransaction?.status === 'processing') {
      setWidgetState(BuyNftState.buying);
    }

    if (orderTransaction?.status === 'succeeded') {
      setWidgetState(BuyNftState.success);
    }
  }, [orderTransaction?.status]);

  console.log(widgetState);

  return (
    <div className={`buy-nft-widget ${className}`}>
      <BuyNftWidgetHeader
        title={title}
        className="buy-nft-widget__header"
      />

      <BuyNftWidgetDetailsContainer
        collectionImage={collectionImage}
        collectionName={collectionName}
        collectionTokenInfo={collectionTokenInfo}
        currencyTokenInfo={currencyTokenInfo}
        fullOrder={fullOrder}
        widgetState={widgetState}
        className="buy-nft-widget__trade-details-container"
      />

      <BuyActionButtons
        hasInsufficientAmount={hasInsufficientBalance}
        hasNoCurrencyTokenApproval={!hasSufficientCurrencyAllowance}
        ownerIsAccount={ownerIsAccount}
        currencyTokenSymbol={currencyTokenInfo.symbol}
        state={widgetState}
        onActionButtonClick={handleActionButtonClick}
        className="buy-nft-widget__action-buttons"
      />
    </div>
  );
};

export default BuyNftWidget;
