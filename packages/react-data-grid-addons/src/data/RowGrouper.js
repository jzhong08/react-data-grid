import { utils } from 'react-data-grid';
import Resolver from './RowGrouperResolver';
const { isImmutableCollection } = utils;

class RowGrouper {

  constructor(columns, expandedRows, isImmutable = false) {
    this.columns = columns.slice(0);
    this.expandedRows = expandedRows;
    this.resolver = new Resolver(isImmutable);
  }

  isRowExpanded(columnKey, key) {
    let isExpanded = true;
    let expandedRowGroup = this.expandedRows[columnKey];
    if (expandedRowGroup && expandedRowGroup[key]) {
      isExpanded = expandedRowGroup[key].isExpanded;
    }
    return isExpanded;
  }

  groupRowsByColumn(rows, columnIndex = 0) {
    let nextColumnIndex = columnIndex;
    let columnKey = this.columns.length > 0 && typeof this.columns[columnIndex] === 'string' ? this.columns[columnIndex] : this.columns[columnIndex].key;
    let columnName = this.columns.length > 0 && typeof this.columns[columnIndex] === 'string' ? this.columns[columnIndex] : this.columns[columnIndex].name;
    let groupedRows = this.resolver.getGroupedRows(rows, columnKey);
    let keys = this.resolver.getGroupKeys(groupedRows);
    let dataviewRows = this.resolver.initRowsCollection();

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let isExpanded = this.isRowExpanded(columnKey, key);
      let rowGroupHeader = {name: key, __metaData: {isGroup: true, treeDepth: columnIndex, isExpanded: isExpanded, columnGroupKey: columnKey, columnGroupName: columnName}};

      dataviewRows = this.resolver.addHeaderRow(rowGroupHeader, dataviewRows);

      if (isExpanded) {
        nextColumnIndex = columnIndex + 1;
        if (this.columns.length > nextColumnIndex) {
          dataviewRows = dataviewRows.concat(this.groupRowsByColumn(this.resolver.getRowObj(groupedRows, key), nextColumnIndex));
          nextColumnIndex = columnIndex - 1;
        } else {
          dataviewRows = dataviewRows.concat(this.resolver.getRowObj(groupedRows, key));
        }
      }
    }
    return dataviewRows;
  }
}

const groupRows = (rows, groupedColumns, expandedRows) => {
  let rowGrouper = new RowGrouper(groupedColumns, expandedRows, isImmutableCollection(rows));
  return rowGrouper.groupRowsByColumn(rows, 0);
};

module.exports = groupRows;
