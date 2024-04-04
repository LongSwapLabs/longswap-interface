import { useCallback, useEffect, useMemo, useRef } from 'react';
import { UDFCompatibleDatafeed } from './datafeed';
import { useSelector } from 'react-redux';
import { getLocalInterval, getDefaultTimezone } from './helper';
import { getLang } from "../../utils/lang";

function TradeChart() {
  const token = useSelector(state => state.trade.token);

  const refToken = useRef()
  useEffect(() => {
    refToken.current = token
  }, [token])

  const container = useRef();
  const widget = useRef();

  const loadTradingView = useCallback(() => {
    if (refToken.current) {
      widget.current = new window.TradingView.widget({
        locale: getLang(),
        fullscreen: false,
        autosize: true,
        theme: 'Light',
        symbol: 'Token',
        interval: getLocalInterval(),
        container_id: 'container',
        datafeed: new UDFCompatibleDatafeed(refToken.current),
        library_path: '/lib/charting_library/',
        timezone: getDefaultTimezone(),
        disabled_features: [
          'header_symbol_search',
          'symbol_search_hot_key',
          'header_compare',
          'volume_force_overlay',
          'header_saveload',
          'left_toolbar'
        ],
        enabled_features: ['use_localstorage_for_settings'],
        overrides: {
          volumePaneSize: 'small',
          'paneProperties.topMargin': '10',
          'paneProperties.vertGridProperties.style': 2,
          'paneProperties.legendProperties.showLegend': false,
          'paneProperties.legendProperties.showStudyArguments': true,
          'paneProperties.legendProperties.showStudyTitles': true,
          'paneProperties.legendProperties.showStudyValues': true,
          'paneProperties.legendProperties.showSeriesTitle': true,
          'paneProperties.legendProperties.showSeriesOHLC': true,
          'mainSeriesProperties.candleStyle.drawWick': true,
          'mainSeriesProperties.candleStyle.drawBorder': true,
          'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,
          'mainSeriesProperties.hollowCandleStyle.drawWick': true,
          'mainSeriesProperties.hollowCandleStyle.drawBorder': true,
          'mainSeriesProperties.haStyle.drawWick': true,
          'mainSeriesProperties.haStyle.drawBorder': true,
          'mainSeriesProperties.haStyle.barColorsOnPrevClose': false,
          'mainSeriesProperties.barStyle.barColorsOnPrevClose': false,
          'mainSeriesProperties.barStyle.dontDrawOpen': false,
          'mainSeriesProperties.lineStyle.linewidth': 2,
          'mainSeriesProperties.lineStyle.priceSource': 'close',
          'mainSeriesProperties.areaStyle.linewidth': 2,
          'mainSeriesProperties.areaStyle.priceSource': 'close',
        },
      });
      console.log(widget.current, "widget.current")
    } else if (widget.current) {
      // todo
    }
  }, [])

  const observer = useMemo(() => new ResizeObserver(loadTradingView), [loadTradingView])

  useEffect(() => {
    if (container.current) {
      observer.observe(container.current)
      return () => {
        observer.disconnect()
      }
    }
  }, [observer])

  useEffect(() => {
    if (token) loadTradingView()
  }, [token, loadTradingView])

  return (
    <div className={'h-[500px]'}>
      <div className={'h-full'} id="container" ref={container}/>
    </div>
  );
}

export default TradeChart;