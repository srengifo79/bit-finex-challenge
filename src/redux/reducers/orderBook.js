const initialState = {
  orderBookData: null,
};

const orderBookSocketReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'RECEIVE_ORDER_BOOK_DATA':
      return {
        ...state,
        orderBookData: action.payload,
      };
    default:
      return state;
  }
};

export default orderBookSocketReducer;
