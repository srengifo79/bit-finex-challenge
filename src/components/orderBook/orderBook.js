import React from 'react';
import { useSelector } from 'react-redux';

import './orderBook.css';
import useOrderBookSocket from '../../hooks/useOrderBookSocket';

export function OrderBook() {
  const {
    socket,
    handleConnect,
    precision,
    handleAddPrecision,
    handleReducePrecision,
  } = useOrderBookSocket();

  const orderBookData = useSelector((state) => state.orderBook.orderBookData);
  const orderBookDataBuy = orderBookData?.[1].slice(0, 25) ?? [];
  const orderBookDataSell = orderBookData?.[1].slice(25) ?? [];

  let totalBuy = 0;
  let totalAsk = 0;
  return (
    <div className="root">
      <div className="header">
        <span>ORDER BOOK BTC/USD</span>
        <div>
          <button onClick={handleReducePrecision} disabled={precision < 1}>
            -0
          </button>
          <button onClick={handleAddPrecision} disabled={precision > 3}>
            +0
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', columnGap: '2px' }}>
          <div>
            <div style={{ display: 'flex', columnGap: '30px' }}>
              <span className="count">COUNT</span>
              <span className="amount">AMOUNT</span>
              <span className="total">TOTAL</span>
              <span className="price">PRICE</span>
            </div>
            {orderBookDataBuy.map((row, index) => {
              const [price, count, amount] = row;
              totalBuy = totalBuy + amount;

              return (
                <div key={price} style={{ display: 'flex', columnGap: '30px' }}>
                  <span className="count">{count}</span>
                  <span className="amount">{amount}</span>
                  <span className="total">{totalBuy}</span>
                  <span className="price">{price}</span>
                </div>
              );
            })}
          </div>
          <div>
            <div style={{ display: 'flex', columnGap: '30px' }}>
              <span className="price">PRICE</span>
              <span className="total">TOTAL</span>
              <span className="amount">AMOUNT</span>
              <span className="count">COUNT</span>
            </div>
            {orderBookDataSell.map((row) => {
              const [price, count, amount] = row;
              const absAmount = Math.abs(amount);

              totalAsk = totalAsk + absAmount;

              return (
                <div key={price} style={{ display: 'flex', columnGap: '30px' }}>
                  <span className="price">{price}</span>
                  <span className="total">{totalAsk}</span>
                  <span className="amount">{absAmount}</span>
                  <span className="count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={handleConnect} style={{ width: 'fit-content' }}>
          {socket ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
}
