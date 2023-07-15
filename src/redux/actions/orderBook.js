export const receiveOrderBookData = (data) => ({
  type: 'RECEIVE_ORDER_BOOK_DATA',
  payload: data,
});

export const updateOrderBookData = (data) => ({
  type: 'UPDATE_ORDER_BOOK_DATA',
  payload: data,
});
