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
    // Find the existing subarray with the matching price
    const existingSubarray = rows.find(
      ([existingPrice]) => existingPrice === price
    );

    if (existingSubarray) {
      // Update the existing subarray
      existingSubarray[1] = count;

      if (amount > 0) {
        existingSubarray[2] = amount; // Update asks
      } else if (amount < 0) {
        existingSubarray[2] = amount; // Update bids
      }
    } else {
      // Add a new subarray
      rows.push([price, count, amount]);
    }
  } else {
    // Remove the subarray with matching price
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
    default:
      return state;
  }
};

export default orderBookSocketReducer;
