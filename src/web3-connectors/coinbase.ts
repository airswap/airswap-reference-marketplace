// eslint-disable-next-line import/no-extraneous-dependencies
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { initializeConnector } from '@web3-react/core';

import { getRpcUrl } from '../helpers/ethers';
import { Connection, ConnectionType } from './connections';
import { onConnectionError } from './helpers';

const chainId = +(process.env.REACT_APP_CHAIN_ID || '1');
const rpcUrl = getRpcUrl(chainId);

export function buildCoinbaseWalletConnector() {
  // @ts-ignore
  const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
    (actions) => new CoinbaseWallet({
      actions,
      options: {
        appName: `${process.env.REACT_APP_COLLECTION_NAME} Marketplace`,
        url: rpcUrl || '',
        overrideIsCoinbaseWallet: true,
      },
      onError: onConnectionError,
    }),
  );
  const coinbaseWalletConnection: Connection = {
    connector: web3CoinbaseWallet,
    hooks: web3CoinbaseWalletHooks,
    type: ConnectionType.coinbase,
  };

  return coinbaseWalletConnection;
}
