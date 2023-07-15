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

  return (
    <>
      <div>
        <button onClick={handleAddPrecision} disabled={precision > 4}>
          +0
        </button>
        <button onClick={handleReducePrecision} disabled={precision < 1}>
          -0
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', columnGap: '100px' }}>
          <div>
            <div style={{ display: 'flex', columnGap: '50px' }}>
              <span>Count</span>
              <span>Amount</span>
              <span>Price</span>
            </div>
            {orderBookDataBuy.map((row) => {
              const [price, count, amount] = row;

              return (
                <div key={price} style={{ display: 'flex', columnGap: '50px' }}>
                  <span>{count}</span>
                  <span>{amount}</span>
                  <span>{price}</span>
                </div>
              );
            })}
          </div>
          <div>
            <div style={{ display: 'flex', columnGap: '50px' }}>
              <span>Price</span>
              <span>Amount</span>
              <span>Count</span>
            </div>
            {orderBookDataSell.map((row) => {
              const [price, count, amount] = row;

              return (
                <div key={price} style={{ display: 'flex', columnGap: '50px' }}>
                  <span>{price}</span>
                  <span>{amount}</span>
                  <span>{count}</span>
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
