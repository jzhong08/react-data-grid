import {List} from 'immutable';
import groupBy from 'lodash/groupBy';
import { utils } from 'react-data-grid';
const { getMixedTypeValueRetriever, isImmutableMap } = utils;

export default class RowGrouperResolver {

  constructor(isImmutable) {
    this.isImmutable = isImmutable;
    this.getRowObj = getMixedTypeValueRetriever(isImmutable).getValue;
  }

  initRowsCollection() {
    return this.isImmutable ? new List() : [];
  }

  getGroupedRows(rows, columnKey) {
    return this.isImmutable ? rows.groupBy(x => isImmutableMap(x) ? x.get(columnKey) : x[columnKey]) : groupBy(rows, columnKey);
  }

  getGroupKeys(groupedRows) {
    let getKeys = Object.keys;
    if (this.isImmutable) {
      getKeys = (col) => {
        let keys = [];
        let iterator = col.keys();
        let item = iterator.next();

        while (!item.done) {
          keys.push(item.value);
          item = iterator.next();
        }
        return keys;
      };
    }
    return getKeys(groupedRows);
  }

  addHeaderRow(rowGroupHeader, dataviewRows) {
    let rows = dataviewRows;
    let dvRows = rows.push(rowGroupHeader);
    if (this.isImmutable) {
      return dvRows;
    }
    return rows;
  }
}
