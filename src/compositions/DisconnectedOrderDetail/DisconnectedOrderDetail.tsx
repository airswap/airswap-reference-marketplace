import React, { FC } from 'react';

import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import DisconnectedOrderDetailHeader from './subcomponents/DisconnectedOrderDetailHeader/DisconnectedOrderDetailHeader';

import './DisconnectedOrderDetail.scss';

interface DisconnectedBuyNftWidgetProps {
  isLoading?: boolean;
  isOrderNonceUndefined?: boolean;
  isOrderNotFound?: boolean;
  nftId?: number;
  orderNonce?: string;
  className?: string;
}

const DisconnectedOrderDetail: FC<DisconnectedBuyNftWidgetProps> = ({
  isLoading,
  isOrderNonceUndefined,
  isOrderNotFound,
  nftId,
  orderNonce,
  className = '',
}) => (
  <div className={`disconnected-order-detail ${className}`}>
    <div className="disconnected-order-detail__widget">
      <DisconnectedOrderDetailHeader
        title="Buy NFT"
        nftId={nftId}
        className="disconnected-order-detail__header"
      />
      {isLoading && <LoadingSpinner className="disconnected-order-detail__loading-spinner" />}
      {isOrderNonceUndefined && 'Order nonce not defined'}
      {isOrderNotFound && `Order with nonce ${orderNonce} not found`}
    </div>
  </div>
);

export default DisconnectedOrderDetail;
