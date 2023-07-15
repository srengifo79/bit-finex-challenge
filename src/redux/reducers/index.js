import { combineReducers } from 'redux';
import orderBook from './orderBook';

const rootReducer = combineReducers({
  orderBook,
});

export default rootReducer;
