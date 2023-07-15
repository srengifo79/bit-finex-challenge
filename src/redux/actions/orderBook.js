export const receiveOrderBookData = (data) => ({
  type: 'RECEIVE_ORDER_BOOK_DATA',
  payload: data,
});

export const updateOrderBookData = (data) => ({
  type: 'UPDATE_ORDER_BOOK_DATA',
  payload: data,
});

export const resetOrderBookData = () => ({
  type: 'RESET_ORDER_BOOK_DATA',
  payload: null,
});

export const addPrecision = () => ({
  type: 'ADD_PRECISION',
  payload: null,
});

export const reducePrecision = () => ({
  type: 'REDUCE_PRECISION',
  payload: null,
});
