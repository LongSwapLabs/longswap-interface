import { useCallback, useState } from "react";
import copy from "copy-to-clipboard";
import { FiCheckCircle, FiCopy } from "react-icons/fi";

function CopyHelper({text}) {
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(() => {
    copy(text)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1200)
  }, [text])

  return (
    <span className={'transition cursor-pointer hover:opacity-70'} onClick={onCopy}>
      {copied ? <FiCheckCircle/> : <FiCopy/>}
    </span>
  )
}

export default CopyHelper