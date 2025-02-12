import { fromBech32 } from '@cosmjs/encoding';

export const creditFromFaucet = async (
  address: string,
  denom: string,
  port: number
) => {
  const faucetEndpoint = `http://localhost:${port}/credit`;

  await fetch(faucetEndpoint, {
    method: 'POST',
    body: JSON.stringify({
      address,
      denom,
    }),
    headers: {
      'Content-type': 'application/json',
    },
  });
};

export const validateChainAddress = (address: string, bech32Prefix: string) => {
  if (!address.startsWith(bech32Prefix)) {
    return `Invalid prefix (expected "${bech32Prefix}")`;
  }

  try {
    fromBech32(address);
  } catch (e) {
    return 'Invalid address';
  }

  return null;
};
