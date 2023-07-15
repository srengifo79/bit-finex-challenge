import { useEffect } from 'react';

function useOrderBookSocket() {
  useEffect(() => {
    const socket = new WebSocket('wss://api-pub.bitfinex.com/ws/2');

    // WebSocket event handlers
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
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    // Clean up the WebSocket connection
    return () => {
      socket.close();
    };
  }, []);
}

export function OrderBook() {
  return <span>Hello from order book</span>;
}
