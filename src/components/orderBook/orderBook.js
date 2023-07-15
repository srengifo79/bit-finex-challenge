import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  receiveOrderBookData,
  resetOrderBookData,
  updateOrderBookData,
} from '../../redux/actions/orderBook';

function useOrderBookSocket() {
  const [socket, setSocket] = useState(null);

  const dispatch = useDispatch();

  const orderBookData = useSelector((state) => state.orderBook.orderBookData);

  useEffect(() => {
    // const socket = new WebSocket('wss://api-pub.bitfinex.com/ws/2');

    if (socket) {
      socket.onopen = () => {
        console.log('WebSocket connection established.');

        const msg = JSON.stringify({
          event: 'subscribe',
          channel: 'book',
          symbol: 'tBTCUSD',
        });

        socket.send(msg);
      };

      socket.onmessage = (event) => {
        console.log('Received data:', event.data);

        const data = JSON.parse(event.data);

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
  }, [dispatch, orderBookData, socket]);

  useEffect(() => {
    return () => {
      // Clean up the WebSocket connection
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const handleConnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    } else {
      const newSocket = new WebSocket('wss://api-pub.bitfinex.com/ws/2');
      setSocket(newSocket);
    }
  };

  return {
    socket,
    setSocket,
    handleConnect,
  };
}

export function OrderBook() {
  const { socket, handleConnect } = useOrderBookSocket();

  const orderBookData = useSelector((state) => state.orderBook.orderBookData);
  const orderBookDataBuy = orderBookData?.[1].slice(0, 25) ?? [];
  const orderBookDataSell = orderBookData?.[1].slice(25) ?? [];

  return (
    <>
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
      <button onClick={handleConnect}>
        {socket ? 'Disconnect' : 'Connect'}
      </button>
    </>
  );
}
