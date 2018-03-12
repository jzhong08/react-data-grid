const shallowCloneObject = require('./shallowCloneObject');
const sameColumn = require('./ColumnComparer');
const ColumnUtils = require('./ColumnUtils');
const getScrollbarSize  = require('./getScrollbarSize');
const isColumnsImmutable  = require('./utils/isColumnsImmutable');

type Column = {
  key: string;
  left: number;
  width: number;
};

type ColumnMetricsType = {
		columnSets: Array<Column>;
    columns: Array<Column>;
		allRowsSelected: boolean;
    totalWidth: number;
    minColumnWidth: number;
};

function setColumnWidths(columns, totalWidth) {
  return columns.map(column => {
    let colInfo = Object.assign({}, column);
    if (column.width) {
      if (/^([0-9]+)%$/.exec(column.width.toString())) {
        colInfo.width = Math.floor(
          column.width / 100 * totalWidth);
      }
    }
    return colInfo;
  });
}

function setDefferedColumnWidths(columns, unallocatedWidth, minColumnWidth) {
  let defferedColumns = columns.filter(c => !c.width);
  return columns.map((column) => {
    if (!column.width && column.width !== 0) {
      if (unallocatedWidth <= 0) {
        column.width = minColumnWidth;
      } else {
        let columnWidth = Math.floor(unallocatedWidth / (ColumnUtils.getSize(defferedColumns)));
        if (columnWidth < minColumnWidth) {
          column.width = minColumnWidth;
        } else {
          column.width = columnWidth;
        }
      }
    }
    return column;
  });
}

function setColumnOffsets(columns) {
	if (columns != null) {
		let left = 0;
		return columns.map(column => {
			column.left = left;
			left += column.width;
			return column;
		});
	}
	else {
		return null;
	}
}

/**
 * Update column metrics calculation.
 *
 * @param {ColumnMetricsType} metrics
 */
function recalculate(metrics: ColumnMetricsType): ColumnMetricsType {
    // compute width for columns which specify width
  let columns = setColumnWidths(metrics.columns, metrics.totalWidth);

  let unallocatedWidth = columns.filter(c => c.width).reduce((w, column) => {
    return w - column.width;
  }, metrics.totalWidth);
  unallocatedWidth -= getScrollbarSize();

  let width = columns.filter(c => c.width).reduce((w, column) => {
    return w + column.width;
  }, 0);

  // compute width for columns which doesn't specify width
  columns = setDefferedColumnWidths(columns, unallocatedWidth, metrics.minColumnWidth);

  // compute left offset for columns
  columns = setColumnOffsets(columns);

	if (metrics.columnSets != null) {
		// update column set width based on the new column widths.
		for (let columnSet of metrics.columnSets) {
			if (columnSet['columnKeys']) { // "select-row" column does not have 'columnKeys' attribute.
				columnSet['width'] = 0;
				for (let columnKey of columnSet['columnKeys']) {
					let column = columns.filter(elem => elem['key'] === columnKey)[0];
					columnSet['width'] += column['width'];
				}
			}
		}
	}
	
	// compute left offset for columnSets
	let columnSets = setColumnOffsets(metrics.columnSets);
	
  return {
		columnSets,
    columns,
		allRowsSelected: metrics.allRowsSelected,
    width,
    totalWidth: metrics.totalWidth,
    minColumnWidth: metrics.minColumnWidth
  };
}

/**
 * Update column metrics calculation by resizing a column.
 *
 * @param {ColumnMetricsType} metrics
 * @param {Column} column
 * @param {number} width
 */
function resizeColumn(metrics: ColumnMetricsType, index: number, width: number): ColumnMetricsType {
  let column = ColumnUtils.getColumn(metrics.columns, index);
  let metricsClone = shallowCloneObject(metrics);
  metricsClone.columns = metrics.columns.slice(0);

  let updatedColumn = shallowCloneObject(column);
  updatedColumn.width = Math.max(width, metricsClone.minColumnWidth);

  metricsClone = ColumnUtils.spliceColumn(metricsClone, index, updatedColumn);

  return recalculate(metricsClone);
}

function areColumnsImmutable(prevColumns: Array<Column>, nextColumns: Array<Column>) {
  return isColumnsImmutable(prevColumns) && isColumnsImmutable(nextColumns);
}

function compareEachColumn(prevColumns: Array<Column>, nextColumns: Array<Column>, isSameColumn: (a: Column, b: Column) => boolean) {
	// null == null, undefined == undefined, and null == undefined all return true.
	// array == array is transformed to array === array, which returns true only when they are the same object instance.
	if (prevColumns == nextColumns) { 
		return true;
	}
	
  let i;
  let len;
  let column;
  let prevColumnsByKey: { [key:string]: Column } = {};
  let nextColumnsByKey: { [key:string]: Column } = {};

	// Check the sizes of column arrays.
  if (ColumnUtils.getSize(prevColumns) !== ColumnUtils.getSize(nextColumns)) {
    return false;
  }

	// Check the orders of elements in column arrays.
	if (Array.from(prevColumns, elem => elem.key).join() !== Array.from(nextColumns, elem => elem.key).join()) {
		return false;
	}
	
  for (i = 0, len = ColumnUtils.getSize(prevColumns); i < len; i++) {
    column = prevColumns[i];
    prevColumnsByKey[column.key] = column;
  }

  for (i = 0, len = ColumnUtils.getSize(nextColumns); i < len; i++) {
    column = nextColumns[i];
    nextColumnsByKey[column.key] = column;
    let prevColumn = prevColumnsByKey[column.key];
    if (prevColumn === undefined || !isSameColumn(prevColumn, column)) {
      return false;
    }
  }

  for (i = 0, len = ColumnUtils.getSize(prevColumns); i < len; i++) {
    column = prevColumns[i];
    let nextColumn = nextColumnsByKey[column.key];
    if (nextColumn === undefined) {
      return false;
    }
  }
  return true;
}

function sameColumns(prevColumns: Array<Column>, nextColumns: Array<Column>, isSameColumn: (a: Column, b: Column) => boolean): boolean {
  if (areColumnsImmutable(prevColumns, nextColumns)) {
    return prevColumns === nextColumns;
  }

  return compareEachColumn(prevColumns, nextColumns, isSameColumn);
}

function sameColumnMetrics(prevMetrics, nextMetrics) {
	return (prevMetrics.allRowsSelected === nextMetrics.allRowsSelected) &&
		sameColumns(prevMetrics.columnSets, nextMetrics.columnSets, sameColumn) &&
		sameColumns(prevMetrics.columns, nextMetrics.columns, sameColumn)
}

module.exports = { recalculate, resizeColumn, sameColumn, sameColumns, sameColumnMetrics };
