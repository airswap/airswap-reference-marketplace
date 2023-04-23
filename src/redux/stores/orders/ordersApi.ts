import { TokenKinds } from '@airswap/constants';
import { Swap } from '@airswap/libraries';
import { FullOrder, FullOrderERC20 } from '@airswap/types';
import { checkResultToErrors } from '@airswap/utils';
import erc20Contract from '@openzeppelin/contracts/build/contracts/ERC20.json';
import erc721Contract from '@openzeppelin/contracts/build/contracts/ERC721.json';
import erc1155Contract from '@openzeppelin/contracts/build/contracts/ERC1155.json';
import {
  BigNumber,
  constants,
  ContractTransaction,
  ethers,
  Transaction,
} from 'ethers';

import { AppError } from '../../../errors/appError';
import { SwapError, transformSwapErrorToAppError } from '../../../errors/swapError';
import transformUnknownErrorToAppError from '../../../errors/transformUnknownErrorToAppError';

const erc20Interface = new ethers.utils.Interface(erc20Contract.abi);
const erc721Interface = new ethers.utils.Interface(erc721Contract.abi);
const erc1155Interface = new ethers.utils.Interface(erc1155Contract.abi);

export async function approveErc20Token(
  baseToken: string,
  provider: ethers.providers.Web3Provider,
): Promise<Transaction> {
  const contract = new ethers.Contract(
    baseToken,
    erc20Interface,
    provider.getSigner(),
  );
  return contract.approve(
    Swap.getAddress(provider.network.chainId),
    constants.MaxUint256,
  );
}

export async function approveNftToken(
  baseToken: string,
  tokenId: number,
  provider: ethers.providers.Web3Provider,
  tokenKind: TokenKinds.ERC1155 | TokenKinds.ERC721,
): Promise<Transaction> {
  const contract = new ethers.Contract(
    baseToken,
    tokenKind === TokenKinds.ERC1155 ? erc1155Interface : erc721Interface,
    provider.getSigner(),
  );
  return contract.approve(
    Swap.getAddress(provider.network.chainId),
    tokenId,
  );
}

export async function takeOrder(
  order: FullOrder,
  senderWallet: string,
  provider: ethers.providers.Web3Provider,
): Promise<ContractTransaction | AppError> {
  try {
    const { chainId } = provider.network;
    return Swap.getContract(provider.getSigner(), chainId).swap(
      senderWallet,
      '0',
      order,
    );
  } catch (error: any) {
    console.error(error);
    return transformUnknownErrorToAppError(error);
  }
}

export async function checkOrder(
  order: FullOrder,
  senderWallet: string,
  provider: ethers.providers.Web3Provider,
): Promise<AppError[]> {
  const { chainId } = provider.network;

  const result = await Swap.getContract(provider.getSigner(), chainId).check(senderWallet, order);
  const errors = checkResultToErrors(result[1], result[0]) as SwapError[];

  if (errors.length) {
    console.error(errors);
  }

  return errors.map((error) => transformSwapErrorToAppError(error));
}

export async function getNonceUsed(
  order: FullOrderERC20,
  provider: ethers.providers.Web3Provider,
): Promise<boolean> {
  return Swap.getContract(provider, order.chainId).nonceUsed(
    order.signerWallet,
    order.nonce,
  );
}

export async function getNftTokenApproved(
  baseToken: string,
  tokenId: number,
  provider: ethers.providers.Web3Provider,
  tokenKind: TokenKinds.ERC1155 | TokenKinds.ERC721,
): Promise<boolean> {
  const contract = new ethers.Contract(
    baseToken,
    tokenKind === TokenKinds.ERC1155 ? erc1155Interface : erc721Interface,
    provider.getSigner(),
  );

  const response = await contract.getApproved(tokenId);

  return response === Swap.getAddress(5);
}

export async function getErc20TokenAllowance(
  address: string,
  account: string,
  spenderAddress: string,
  provider: ethers.providers.Web3Provider,
): Promise<BigNumber> {
  const contract = new ethers.Contract(
    address,
    erc20Interface,
    provider.getSigner(),
  );

  return contract.allowance(account, spenderAddress);
}
