Title: Personalized Wallet Addresses
Date: 2022-05-05 00:00
Tags: eth, golang
Keywords: go, vanity address, ethereum
Authors: Caleb
Summary: The 0xABCs of generating custom wallet addresses

A Personalized Address (or Vanity Address) is a wallet address that is customized in some way. It's the web3 equivalent of a [vanity license plate](https://en.wikipedia.org/wiki/Vanity_plate). A typical (Ethereum) wallet address looks like this:

```
0x60C42Ecb80C2069eb7aC1Ee18A84244c8617E8Ab
```

But when sharing your Ethereum address, you might want something more reflective of your culinary skills (maybe just mine):

```
0xbadf00db80C2069eb7aC1Ee18A84244c8617E8Ab
```

If you're like me, then you're in the right place, keep reading. If not, enjoy your random address ¯\\_(ツ)\_/¯.

## Why do it yourself?
You could perform an internet search for Personalized Wallet Addresses or Vanity Addresses, and run whatever code you find. If you plan on using the generated address, it might be worth using a generator that you trust.

To trust a generator you'll probably want to read the source and understand its funky dependencies. Especially for Ethereum addresses, it's just easier to write your own generator that directly uses `go-ethereum`[^goeth].


## How
A wallet address in Ethereum is a 42 character hexadecimal string[^1]. "0x" takes the first two characters, so the actual address is 40 characters.

An Ethereum wallet address is generated in four stages. First, use a random entropy source to generate a private key (anything that samples [vacuum fluctuations](https://arxiv.org/abs/1703.00559) will be fine). Second, derive a public key that corresponds to the generated private key. Next, calculate the address that corresponds to the public key. Finally, compute the checksum[^check] (which affects the case of the hexadecimal letters). For the rest of this post I'm going to ignore the checksum stage because I don't care about casing.

It's important that the private key (and thus the public key and address) not be generated with anything deterministic. Using a non-random source will make it possible for an attacker to duplicate your generation process, generate your private/public keys, and gain access to your wallet.

This begs the question, how do we generate a custom address if we can only use a random source? Don't generate just one address, generate millions! It's a game of guess-and-check. You can continually generate addresses, until you find one that matches your criteria. The below pseudo code demonstrates an example of searching for a substring at the beginning of an address.

```python
def personalized_address(vanity_prefix: string)
  private_key = generate_key()
  public_key = generate_public_key(private_key)
  address = generate_address(public_key)
  if address.startswith(vanity_prefix)
    # Securely save the private key
```

You might think this process will be slow (it is). But, for short substrings (~5 characters) the generation can be done in a few minutes. There are 16 hexadecimal characters (again, ignoring the checksum).
When looking for an address that starts with an `n` length substring, the probability of finding a match in one iteration is `(1/16)^n`[: The probability is `(40-n)` times higher if you don't care where the substring is].
The probability of finding a match after `i` iterations is `1-(1-p)^i` where `p` is `(1/16)^n` and `n` is the substring length[: This comes from the [binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution)].
I can generate ~16,000 addresses/sec on my laptop. This means you can find a 5 character substring with 99% probability in about 5 minutes. You can find a 6 character substring (99% probability) in about 80 minutes, and an 8 character substring in around 15 days.


And that's all. I leave it as an exercise for the reader to implement the code for themselves (hint: take a look at [`go-ethereum`](https://github.com/ethereum/go-ethereum/tree/master/crypto)).


[^check]: <https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md>
[^goeth]: <https://github.com/ethereum/go-ethereum>
[^1]: <https://info.etherscan.com/what-is-an-ethereum-address>
