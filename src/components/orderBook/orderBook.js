import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addPrecision,
  receiveOrderBookData,
  reducePrecision,
  resetOrderBookData,
  updateOrderBookData,
} from '../../redux/actions/orderBook';
import {
  orderBookDataSelector,
  precisionSelector,
} from '../../redux/selectors';
import './orderBook.css';

function useOrderBookSocket() {
  const [socket, setSocket] = useState(null);

  const dispatch = useDispatch();

  const orderBookData = useSelector(orderBookDataSelector);
  const precision = useSelector(precisionSelector);

  const subscribe = useCallback(() => {
    if (socket) {
      const msg = JSON.stringify({
        event: 'subscribe',
        channel: 'book',
        symbol: 'tBTCUSD',
        prec: `P${precision}`,
      });

      socket.send(msg);
    }
  }, [precision, socket]);

  const unsubscribe = () => {
    if (socket && orderBookData) {
      const msg = JSON.stringify({
        event: 'unsubscribe',
        chanId: orderBookData[0],
      });

      socket.send(msg);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.onopen = () => {
        console.log('WebSocket connection established.');

        subscribe();
      };

      socket.onmessage = (event) => {
        console.log('Received data:', event.data);

        const data = JSON.parse(event.data);

        if (data.event === 'unsubscribed') {
          subscribe();
        }

        if (!Array.isArray(data)) {
          return dispatch(resetOrderBookData());
        }

        if (!Array.isArray(data[1])) {
          return;
        }

        if (!orderBookData) {
          return dispatch(receiveOrderBookData(data));
        }

        dispatch(updateOrderBookData(data));
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed.');
      };
    }
  }, [dispatch, orderBookData, precision, socket, subscribe]);

  useEffect(() => {
    return () => {
      // Clean up the WebSocket connection
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const initConnection = () => {
    const newSocket = new WebSocket('wss://api-pub.bitfinex.com/ws/2');
    setSocket(newSocket);
  };

  const closeConnection = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const handleConnect = () => {
    if (socket) {
      closeConnection();
    } else {
      initConnection();
    }
  };

  const handleAddPrecision = () => {
    unsubscribe();
    dispatch(addPrecision());
  };

  const handleReducePrecision = () => {
    unsubscribe();
    dispatch(reducePrecision());
  };

  return {
    socket,
    setSocket,
    handleConnect,
    precision,
    handleAddPrecision,
    handleReducePrecision,
  };
}

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
    <>
      <div>
        <button onClick={handleAddPrecision} disabled={precision > 3}>
          +0
        </button>
        <button onClick={handleReducePrecision} disabled={precision < 1}>
          -0
        </button>
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
    </>
  );
}
