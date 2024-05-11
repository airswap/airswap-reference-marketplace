import React, { FC, useEffect, useState } from 'react';

import { Connector } from '@web3-react/types';
import { useDebounce } from 'react-use';

import IconButton from '../../compositions/IconButton/IconButton';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getLastProviderFromLocalStorage } from '../../redux/stores/web3/web3Api';
import { setConnectionType, setIsInitialized, setUserHasClosedConnectModal } from '../../redux/stores/web3/web3Slice';
import { ConnectionType, getConnection } from '../../web3-connectors/connections';
import { buildGnosisSafeConnector } from '../../web3-connectors/gnosis';
import { tryActivateConnector } from '../../web3-connectors/helpers';
import walletProviders, { WalletProvider } from '../../web3-connectors/walletProviders';
import WalletProviderList from './subcomponents/WalletProviderList/WalletProviderList';

import './WalletConnector.scss';

interface WalletConnectorProps {
  onCloseButtonClick: () => void;
  className?: string;
}

const WalletConnector: FC<WalletConnectorProps> = ({ onCloseButtonClick, className = '' }) => {
  const { isActive, isInitialized } = useAppSelector((state) => state.web3);

  const dispatch = useAppDispatch();
  const [triedToEagerlyConnect, setTriedToEagerlyConnect] = useState(false);
  const [isActiveState, setIsActiveState] = useState(false);

  const activateWallet = async (provider: WalletProvider) => {
    try {
      await tryActivateConnector(getConnection(provider.type).connector);
      dispatch(setConnectionType(provider.type));
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setIsInitialized(true));
    }
  };

  const activateWalletEagerly = async (connector: Connector, type: ConnectionType) => {
    try {
      if (connector.connectEagerly) {
        // Currently connectEagerly does not throw error if connectEagerly fails. So we need to check if it is connected
        // by using the triedToEagerlyConnect state.
        await connector.connectEagerly();
        dispatch(setConnectionType(type));
      }
    } catch (error) {
      console.error(error);
      dispatch(setIsInitialized(true));
    } finally {
      setTriedToEagerlyConnect(true);
    }
  };

  const handleCloseButtonClick = (): void => {
    dispatch(setUserHasClosedConnectModal(true));
    onCloseButtonClick();
  };

  const handleWalletProviderButtonClick = (provider: WalletProvider): void => {
    if (!provider.isInstalled) {
      window.open(provider.url, '_blank');

      return;
    }

    activateWallet(provider);
  };

  useEffect(() => {
    const type = getLastProviderFromLocalStorage();

    if (!type) {
      dispatch(setIsInitialized(true));

      return;
    }

    activateWalletEagerly(getConnection(type).connector, type);
  }, []);

  useEffect(() => {
    const gnosisSafe = buildGnosisSafeConnector();

    try {
      activateWalletEagerly(gnosisSafe.connector, gnosisSafe.type);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    setIsActiveState(isActive);

    if (!isActive && isActiveState) {
      dispatch(setConnectionType(undefined));
    }
  }, [isActive]);

  useDebounce(() => {
    if (triedToEagerlyConnect && !isInitialized) {
      dispatch(setIsInitialized(true));
      setTriedToEagerlyConnect(false);
    }
  }, 100, [triedToEagerlyConnect, isActive, isInitialized]);

  return (
    <div className={`wallet-connector ${className}`}>
      <div className="wallet-connector__wrapper">
        <div className="wallet-connector__header">
          <h1 className="wallet-connector__title">Select wallet</h1>
          <IconButton
            hideLabel
            icon="close"
            text="Close"
            onClick={handleCloseButtonClick}
            className="wallet-connector__close-button"
          />
        </div>
        <WalletProviderList
          walletProviders={walletProviders}
          onWalletProviderButtonClick={handleWalletProviderButtonClick}
          className="wallet-connector__wallet-providers-list"
        />
      </div>
    </div>
  );
};

export default WalletConnector;
