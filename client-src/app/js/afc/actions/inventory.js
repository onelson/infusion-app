var alt = require('../alt');


class InventoryActions {
  updateInventory(items) {
    this.dispatch(items);
  }
}


module.exports = alt.createActions(InventoryActions);
