import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addPrecision,
  receiveOrderBookData,
  reducePrecision,
  resetOrderBookData,
  updateOrderBookData,
} from '../redux/actions/orderBook';
import { orderBookDataSelector, precisionSelector } from '../redux/selectors';

const timeoutDuration = 3000; // Time to reset if offline

function useOrderBookSocket() {
  const [socket, setSocket] = useState(null);
  const connectedRef = useRef(false);
  const timeoutRef = useRef(null);
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
        connectedRef.current = true;
        subscribe();
      };

      socket.onmessage = (event) => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          // Close the WebSocket if no data is received after the timeout
          socket.close();
        }, timeoutDuration);
        // console.log('Received data:', event.data);

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
        clearTimeout(timeoutRef.current);

        if (connectedRef.current)
          setTimeout(function () {
            initConnection();
          }, 1000);
      };
    }
  }, [connectedRef, dispatch, orderBookData, precision, socket, subscribe]);

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
      connectedRef.current = false;
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

export default useOrderBookSocket;
