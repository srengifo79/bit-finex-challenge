const initialState = {
  orderBookData: null,
};

function updateOrderBookData(orderBookData, updateFields) {
  const [price, count, amount] = updateFields[1];

  // Deep copy so we dont mutate the original state
  const rows = orderBookData[1].map(
    ([existingPrice, existingCount, existingAmount]) => [
      existingPrice,
      existingCount,
      existingAmount,
    ]
  );

  if (count > 0) {
    // Find the existing row with the matching price
    const existingRow = rows.find(([existingPrice]) => existingPrice === price);

    if (existingRow) {
      // Update the existing row
      existingRow[1] = count;

      if (amount > 0) {
        existingRow[2] = amount; // Update asks
      } else if (amount < 0) {
        existingRow[2] = amount; // Update bids
      }
    } else {
      // Add a new row
      rows.push([price, count, amount]);
    }
  } else {
    // Remove the row with matching price
    const index = rows.findIndex(([existingPrice]) => existingPrice === price);

    if (index !== -1) {
      if (amount === 1) {
        rows.splice(index, 1); // Remove from asks
      } else if (amount === -1) {
        rows.splice(index, 1); // Remove from bids
      }
    }
  }

  return [orderBookData[0], rows];
}

const orderBookSocketReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'RECEIVE_ORDER_BOOK_DATA':
      return {
        ...state,
        orderBookData: action.payload,
      };
    case 'UPDATE_ORDER_BOOK_DATA':
      return {
        ...state,
        orderBookData: updateOrderBookData(state.orderBookData, action.payload),
      };
    case 'RESET_ORDER_BOOK_DATA':
      return {
        ...state,
        orderBookData: null,
      };
    default:
      return state;
  }
};

export default orderBookSocketReducer;
