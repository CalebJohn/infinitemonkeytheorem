Title: Personalized Wallet Addresses
Date: 2022-02-21 17:00
Tags: eth, fil
Authors: Caleb
Status: draft
Summary: The 0xABCs of generating custom wallet addresses

# What
A Personalized Address (or Vanity Address) is a wallet address that contains some custom characters. For example a typical (ethereum) wallet address looks like this:

```
0x60C42Ecb80C2069eb7aC1Ee18A84244c8617E8Ab
```

But when sharing your ethereum address, you might want something more reflective of your culinary skills (maybe just mine):

```
0xbadf00db80C2069eb7aC1Ee18A84244c8617E8Ab
```


# Why?
To look cool, and impress your friends.


# Why do it yourself?
You could perform an internet search for Personalized Wallet Addresses or Vanity Addresses, and run whatever code you find. If you plan on using the generated address, it might be worth using a generator that you trust.

To trust a generator you'll probably want to read the source code, and understand its funky dependencies. In the case of an ethereum address, it's just easier to write your own generator that directly uses [`go-ethereum`](https://github.com/ethereum/go-ethereum).


# How
A wallet address in ethereum is a 42 character hexadecimal string[^1]. "0x" takes the first two characters, so the actual address is 40 characters.

An ethereum wallet address is generated in a three[:I did a little bit of simplification here, there is a fourth stage, <a href='https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md'>checksum</a>. The checksum only affects the case, so I don't discuss it here. However, prior to using an address, it's important to run it through a checksum encoding so that the address can be verified.] stage process. First, use a random entropy source to generate a private key (anything that samples [vacuum fluctuations](https://arxiv.org/abs/1703.00559) should be sufficient). Second, derive a public key that corresponds to the generated private key. Lastly, derive an address that corresponds to the public key.

It's important that the private key (and thus the public key, and the address) not be generated with anything deterministic. Using a non-random source will make it possible for an attacker to duplicate your generation process, generate your private/public keys, and gain access to your wallet.

This begs the question, how can we generate a custom address if we can only use a random source? The answer is that we don't generate just one address, we generate millions! It's a game of guess-and-check. You can continually generate addresses, until you find one that matches your criteria.

The pseudo code to generate a personalized address is shown below.

```python
def personalized_address(vanity_prefix: string):
  private_key = generate_key()
  public_key = generate_public_key(private_key)
  address = generate_address(public_key)
  if address.startswith(vanity_prefix):
    # Securely save the private key
```

You might think this process will be too slow, and you'd be correct for longer personalizations. But, for short customizations (~5 characters) the generation can be done in a few minutes[:A naive implementation written in go running on my laptop generates ~16,000 addresses/sec].

And that's all. I leave it as an exercise for the reader to implement the code for themselves (hint: take a look at [`go-ethereum`](https://github.com/ethereum/go-ethereum)).


# Bonus
I applied to same procedure to generate a [Filecoin](https://filecoin.io/) wallet address. The only difference (aside from the libraries used) is that a Filecoin wallet address is base 32 encoded using the characters [a-z2-7][^4]. This allows for a denser address (hexadecimal is base 16, so half the density). Another cool benefit is that it doesn't suffer from the ambiguity of 1 and l, or o and 0 (because the numbers 0, 1, 8, and 9 are not used).



[^1]: <https://info.etherscan.com/what-is-an-ethereum-address>

5 characters means ((1/16)^5 * 16000)^-1 = ~1 minute to generate

[^4]: <a href='https://github.com/filecoin-project/go-address/blob/master/constants.go#L71'>https://github.com/filecoin-project/go-address/blob/master/constants.go#L71</a>
