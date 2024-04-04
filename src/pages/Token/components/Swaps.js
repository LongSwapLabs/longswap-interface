import { useSelector } from "react-redux";
import { cn, Link, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { formatTimestamp } from "../../../utils/time";
import { formatAmount } from "../../../utils/amount";
import { tailAddress } from "../../../utils/address";
import { useTranslation } from "react-i18next";

const Swaps = () => {
  const {t} = useTranslation()
  const token = useSelector(state => state.trade.token);
  const swaps = useSelector(state => state.trade.swaps);

  return (
    <div className={'overflow-auto'}>
      <Table removeWrapper
             isStriped
             isCompact
             aria-label="swaps"
      >
        <TableHeader>
          <TableColumn>{t("time")}</TableColumn>
          <TableColumn className={'hidden sm:table-cell'}>{t("side")}</TableColumn>
          <TableColumn>{t("price")}($)</TableColumn>
          <TableColumn>{token.symbol}</TableColumn>
          <TableColumn>USD</TableColumn>
          <TableColumn className={'hidden sm:table-cell'}>BNB</TableColumn>
          <TableColumn>{t("user")}</TableColumn>
          <TableColumn className={'hidden sm:table-cell'}>TXN</TableColumn>
        </TableHeader>
        <TableBody emptyContent={t("no-swap-data")}>
          {
            swaps.map(e => (
              <TableRow key={e.id}>
                <TableCell className={'text-slate-500'}>{formatTimestamp(e.timestamp)}</TableCell>
                <TableCell className={'hidden sm:table-cell'}>
                  <span className={cn(e.side === 1 ? 'text-green-600' : 'text-danger')}>
                    {e.side === 1 ? t('buy') : t('sell')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn(e.side === 1 ? 'text-green-600' : 'text-danger')}>
                    {formatAmount(e.price)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn(e.side === 1 ? 'text-green-600' : 'text-danger')}>
                    {formatAmount(e.volume)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn(e.side === 1 ? 'text-green-600' : 'text-danger')}>
                    {formatAmount(e.amount)}
                  </span>
                </TableCell>
                <TableCell className={'hidden sm:table-cell'}>
                  <span className={cn(e.side === 1 ? 'text-green-600' : 'text-danger')}>
                    {formatAmount(e.etherAmount)}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    color={'foreground'}
                    isExternal
                    size={'sm'}
                    href={`https://bscscan.com/address/${e.user}`}
                  >
                    {tailAddress(e.user)}
                  </Link>
                </TableCell>
                <TableCell className={'hidden sm:table-cell'}>
                  <Link
                    color={'foreground'}
                    isExternal
                    size={'sm'}
                    href={`https://bscscan.com/tx/${e.txHash}`}
                    showAnchorIcon
                  />
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </div>
  )
}

export default Swaps