import { useEffect } from 'react';
import { setReferrerToLocal } from '../utils/referrer';
import useParsedQueryString from './useParsedQueryString';
import { isAddress } from "viem";

function useSetReferrerFromUrl() {
  const parsed = useParsedQueryString();

  useEffect(() => {
    const referrer = (
      parsed.ref && typeof parsed.ref === 'string' && isAddress(parsed.ref)
    ) || undefined;
    if (referrer) {
      setReferrerToLocal(parsed.ref);
    }
  }, [parsed.ref]);
}

export default useSetReferrerFromUrl;