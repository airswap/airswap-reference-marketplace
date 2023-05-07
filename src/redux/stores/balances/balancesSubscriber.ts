import { SubmittedTransactionType } from '../../../entities/SubmittedTransaction/SubmittedTransaction';
import { getLibrary } from '../../../helpers/ethers';
import { store } from '../../store';
import { fetchCurrencyTokenAllowance, fetchCurrencyTokenBalance, fetchUserTokens } from './balancesApi';
import { setIsInitialized } from './balancesSlice';

export const configureBalancesSubscriber = () => {
  let account: string;
  let chainId: number;
  let lastTransactionHash: string | undefined;

  store.subscribe(() => {
    const { config, transactions, web3 } = store.getState();

    const lastTransaction = transactions.transactions[0];
    const lastSucceededTransaction = lastTransaction?.status === 'succeeded' ? lastTransaction : undefined;

    if (!web3.chainId || !web3.account) {
      return;
    }

    if (account !== web3.account || chainId !== web3.chainId) {
      account = web3.account;
      chainId = web3.chainId;

      const library = getLibrary(web3.chainId);

      store.dispatch(setIsInitialized(false));

      Promise.all([
        store.dispatch(fetchCurrencyTokenBalance({
          chainId: web3.chainId,
          provider: library,
          collectionTokenAddress: config.currencyToken,
          walletAddress: web3.account,
        })),

        store.dispatch(fetchCurrencyTokenAllowance({
          chainId: web3.chainId,
          provider: library,
          collectionTokenAddress: config.currencyToken,
          walletAddress: web3.account,
        })),

        store.dispatch(fetchUserTokens({
          provider: library,
          walletAddress: web3.account,
          collectionToken: config.collectionToken,
        })),
      ]).then(() => {
        store.dispatch(setIsInitialized(true));
      });
    }

    if (lastSucceededTransaction && lastSucceededTransaction.hash !== lastTransactionHash) {
      lastTransactionHash = lastSucceededTransaction?.hash;

      const library = getLibrary(web3.chainId);

      if (lastSucceededTransaction.type === SubmittedTransactionType.order) {
        store.dispatch(fetchUserTokens({
          provider: library,
          walletAddress: web3.account,
          collectionToken: config.collectionToken,
        }));

        store.dispatch(fetchCurrencyTokenBalance({
          chainId: web3.chainId,
          provider: library,
          collectionTokenAddress: config.currencyToken,
          walletAddress: web3.account,
        }));
      }

      if (lastSucceededTransaction.type === SubmittedTransactionType.erc20Approval) {
        store.dispatch(fetchCurrencyTokenAllowance({
          chainId: web3.chainId,
          provider: library,
          collectionTokenAddress: config.currencyToken,
          walletAddress: web3.account,
        }));
      }
    }
  });
};
