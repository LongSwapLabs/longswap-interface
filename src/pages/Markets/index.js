import {
  BreadcrumbItem,
  Breadcrumbs, cn, Link,
  Pagination, Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader, TableRow
} from "@nextui-org/react";
import React, { useMemo, useState } from "react";
import request from "../../services/request";
import useSWR from "swr";
import { TokenLogo } from "../../components/TokenLogo";
import { formatAmount } from "../../utils/amount";
import Decimal from "decimal.js";
import { useTranslation } from "react-i18next";

const fetcher = (...args) => {
  return request(...args).then((res) => res.data.data)
}

function Markets() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1);
  const {data, isLoading} = useSWR(`/v1/token/all?page=${page}&limit=10`, fetcher, {
    keepPreviousData: true,
  });

  const rowsPerPage = 10;

  const pages = useMemo(() => {
    return data?.count ? Math.ceil(data.count / rowsPerPage) : 0;
  }, [data?.count, rowsPerPage]);

  const loadingState = (isLoading || data?.list === null) ? "loading" : "idle";

  return (
    <div className={'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col gap-4'}>
      <Breadcrumbs size={'lg'} className={'my-6'}>
        <BreadcrumbItem href={'/'}>{t("home")}</BreadcrumbItem>
        <BreadcrumbItem>{t("markets")}</BreadcrumbItem>
      </Breadcrumbs>

      <Table
        aria-label="Markets"
        removeWrapper
        bottomContent={
          pages > 0 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="default"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn>{t("token")}</TableColumn>
          <TableColumn>{t("price")}</TableColumn>
          <TableColumn>{t("quote")}</TableColumn>
          <TableColumn>{t("operate")}</TableColumn>
        </TableHeader>
        <TableBody
          items={data?.list ?? []}
          loadingContent={<Spinner/>}
          loadingState={loadingState}
        >
          {(item) => (
            <TableRow key={item?.id}>
              <TableCell>
                <div className={'flex items-center gap-2'}>
                  <TokenLogo width={24} height={24} token={item}/>
                  <span>{item.symbol}</span>
                </div>
              </TableCell>
              <TableCell>
                ${formatAmount(item.price)}
              </TableCell>
              <TableCell>
                <div
                  className={cn('text-white rounded w-fit py-0.5 px-1.5 text-sm flex items-center', item.rate24h > 0 ? 'bg-green-600' : 'bg-danger')}>
                  <span>{new Decimal(item.rate24h).toDP(2).toJSON()}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Link className={'text-foreground'} size={'sm'} href={`/markets/${item.address}`}>{t("check")}</Link>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default Markets