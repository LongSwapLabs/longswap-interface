import { Image } from "@nextui-org/react";
import { useMemo } from "react";
import { ETHER } from "../../constants/types";
import { useAccount } from "wagmi";

export function TokenLogo({token, width, height}) {
  const {chainId} = useAccount()

  const tokenSrc = useMemo(() => {
    if (!token || token === ETHER) {
      return `/chains/${chainId}.png`
    }
    return `/tokens/${token.address}.png`
  }, [token, chainId])

  return (
    <Image
      height={width}
      width={height}
      src={tokenSrc}
      radius={'full'}
    />
  )
}
