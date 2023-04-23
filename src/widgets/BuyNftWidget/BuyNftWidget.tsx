import React, { FC } from 'react';

import { useWeb3React } from '@web3-react/core';

import useCollectionToken from '../../hooks/useCollectionToken';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrencyTokenInfo } from '../../redux/stores/metadata/metadataSlice';
import ConnectedBuyNftWidget from './subcomponents/ConnectedBuyNftWidget/ConnectedBuyNftWidget';
import DisconnectedBuyNftWidget from './subcomponents/DisconnectedBuyNftWidget/DisconnectedBuyNftWidget';

import './BuyNftWidget.scss';

interface BuyNftWidgetProps {
  className?: string;
}

const BuyNftWidget: FC<BuyNftWidgetProps> = ({ className = '' }) => {
  const { account, chainId, library } = useWeb3React();
  const { isLoading: isMetadataLoading } = useAppSelector(state => state.metadata);
  const { lastUserOrder } = useAppSelector((state) => state.listNft);
  const { collectionToken } = useAppSelector((state) => state.config);

  const currencyTokenInfo = useAppSelector(selectCurrencyTokenInfo);
  const id = lastUserOrder ? parseInt(lastUserOrder?.signer.id, 10) : 1;
  const [collectionTokenInfo, isCollectionTokenInfoLoading] = useCollectionToken(collectionToken, id);
  const isLoading = isMetadataLoading || isCollectionTokenInfoLoading;

  if (
    !isLoading
    && account
    && chainId
    && collectionTokenInfo
    && currencyTokenInfo
    && lastUserOrder
    && library
  ) {
    return (
      <ConnectedBuyNftWidget
        account={account}
        chainId={chainId}
        collectionTokenInfo={collectionTokenInfo}
        currencyTokenInfo={currencyTokenInfo}
        fullOrder={lastUserOrder}
        library={library}
        className={className}
      />
    );
  }

  return (
    <DisconnectedBuyNftWidget
      isLoading={isLoading}
      className={className}
    />
  );
};

export default BuyNftWidget;
