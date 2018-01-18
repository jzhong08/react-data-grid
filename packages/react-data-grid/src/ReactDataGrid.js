const React                 = require('react');
const ReactDOM = require('react-dom');
const BaseGrid              = require('./Grid');
const Row                   = require('./Row');
const ExcelColumn           = require('./PropTypeShapes/ExcelColumn');
const KeyboardHandlerMixin  = require('./KeyboardHandlerMixin');
const CheckboxEditor        = require('./editors/CheckboxEditor');
//const DOMMetrics           = require('./DOMMetrics');
const ColumnMetricsMixin      = require('./ColumnMetricsMixin');
const RowUtils = require('./RowUtils');
const ColumnUtils = require('./ColumnUtils');
const KeyCodes = require('./KeyCodes');
const isFunction = require('./utils/isFunction');
import AppConstants from './AppConstants';
//import ReactConfirmAlert, { confirmAlert } from 'react-confirm-alert';
//import 'react-confirm-alert/src/react-confirm-alert.css'
require('../../../themes/react-data-grid-core.css');
require('../../../themes/react-data-grid-checkbox.css');

if (!Object.assign) {
  Object.assign = require('object-assign');
}

type SelectedType = {
  rowIdx: number;
  idx: number;
};

type ColumnEvent = {
  name: string,
  rowIdx: number;
  idx: number;
}

type DraggedType = {
  idx: number;
  rowIdx: number;
  value: string;
};

type RowUpdateEvent = {
  keyCode: string;
  changed: {expandedHeight: number};
  rowIdx: number;
};

const ReactDataGrid = React.createClass({

  mixins: [
    ColumnMetricsMixin,
    //DOMMetrics.MetricsComputatorMixin,
    KeyboardHandlerMixin
  ],

  propTypes: {
    rowHeight: React.PropTypes.number.isRequired,
    headerRowHeight: React.PropTypes.number,
    headerFiltersHeight: React.PropTypes.number,
    minHeight: React.PropTypes.number.isRequired,
    minWidth: React.PropTypes.number,
    onRowUpdated: React.PropTypes.func,
    rowGetter: React.PropTypes.func.isRequired,
    rowsCount: React.PropTypes.number.isRequired,
    toolbar: React.PropTypes.element,
    enableCellSelect: React.PropTypes.bool,
    columns: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]).isRequired,
    onFilter: React.PropTypes.func,
    onCellCopyPaste: React.PropTypes.func,
    onCellsDragged: React.PropTypes.func,
    onAddFilter: React.PropTypes.func,
    onGridSort: React.PropTypes.func,
    onDragHandleDoubleClick: React.PropTypes.func,
    onGridRowsUpdated: React.PropTypes.func,
    onRowSelect: React.PropTypes.func,
		rowSelectColumnWidth: React.PropTypes.number.isRequired,
    rowKey: React.PropTypes.string,
    rowScrollTimeout: React.PropTypes.number,
		deleteSelectedRows: React.PropTypes.func,
    onClearFilters: React.PropTypes.func,
    contextMenu: React.PropTypes.element,
    cellNavigationMode: React.PropTypes.oneOf(['none', 'loopOverRow', 'changeRow']),
    onCellSelected: React.PropTypes.func,
    onCellDeSelected: React.PropTypes.func,
    onCellExpand: React.PropTypes.func,
    enableDragAndDrop: React.PropTypes.bool,
    onRowExpandToggle: React.PropTypes.func,
    draggableHeaderCell: React.PropTypes.func,
    getValidFilterValues: React.PropTypes.func,
    rowSelection: React.PropTypes.shape({
      enableShiftSelect: React.PropTypes.bool,
      onRowsSelected: React.PropTypes.func,
      onRowsDeselected: React.PropTypes.func,
      showCheckbox: React.PropTypes.bool,
      selectBy: React.PropTypes.oneOfType([
        React.PropTypes.shape({
          indexes: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
        }),
        React.PropTypes.shape({
          isSelectedKey: React.PropTypes.string.isRequired
        }),
        React.PropTypes.shape({
          keys: React.PropTypes.shape({
            values: React.PropTypes.array.isRequired,
            rowKey: React.PropTypes.string.isRequired
          }).isRequired
        })
      ]).isRequired
    }),
    onRowClick: React.PropTypes.func,
    onGridKeyUp: React.PropTypes.func,
    onGridKeyDown: React.PropTypes.func,
    rowGroupRenderer: React.PropTypes.func,
    rowActionsCell: React.PropTypes.func,
    onCheckCellIsEditable: React.PropTypes.func,
    /* called before cell is set active, returns a boolean to determine whether cell is editable */
    overScan: React.PropTypes.object,
    onDeleteSubRow: React.PropTypes.func,
    onAddSubRow: React.PropTypes.func
  },

  getDefaultProps(): {enableCellSelect: boolean} {
    return {
      enableCellSelect: false,
      tabIndex: -1,
      rowHeight: 35,
      headerFiltersHeight: 45,
      minHeight: 350,
	  rowSelectColumnWidth: 30,
      rowKey: 'id',
      rowScrollTimeout: 0,
      cellNavigationMode: 'none',
      overScan: {
        colsStart: 5,
        colsEnd: 5,
        rowsStart: 5,
        rowsEnd: 5
      }
    };
  },

  getInitialState: function(): {
	  selected: SelectedType;
	  copied: ?{idx: number; rowIdx: number};
	  selectedRows: Array<Row>;
	  expandedRows: Array<Row>;
	  canFilter: boolean;
	  rowSelectValue: string;
	  columnFilters: any;
	  sortDirection: ?SortType;
	  sortColumn: ?ExcelColumn;
	  dragged: ?DraggedType;
	}
	{
    //let columnMetrics = this.createColumnMetrics();
		let columnMetrics = this.getColumnMetricsType({
      columns: this.props.columns,
      minColumnWidth: this.props.minColumnWidth,
      totalWidth: this.props.minWidth
    });
    let initialState = {
			columnMetrics,
			selectedRows: [],
			copied: null,
			expandedRows: [],
			canFilter: false,
			rowSelectValue: 'none',
			columnFilters: {},
			sortDirection: null,
			sortColumn: null,
			dragged: null,
			scrollOffset: 0,
			lastRowIdxUiSelected: -1
		};
    if (this.props.enableCellSelect) {
      initialState.selected = {rowIdx: 0, idx: 0};
    } else {
      initialState.selected = {rowIdx: -1, idx: -1};
    }
    return initialState;
  },

  hasSelectedCellChanged: function(selected: SelectedType) {
    let previouslySelected = Object.assign({}, this.state.selected);
    return previouslySelected.rowIdx !== selected.rowIdx || previouslySelected.idx !== selected.idx || previouslySelected.active === false;
  },

  onContextMenuHide: function() {
    document.removeEventListener('click', this.onContextMenuHide);
    let newSelected = Object.assign({}, this.state.selected, {contextMenuDisplayed: false});
    this.setState({selected: newSelected});
  },

  onColumnEvent: function(ev :SyntheticEvent, columnEvent: ColumnEvent) {
    let {idx, name} = columnEvent;

    if (name && typeof idx !== 'undefined') {
      let column = this.getColumn(idx);

      if (column && column.events && column.events[name] && typeof column.events[name] === 'function') {
        let eventArgs = {
          idx,
          rowIdx: columnEvent.rowIdx,
          rowId: columnEvent.rowId,
          column
        };

        column.events[name](ev, eventArgs);
      }
    }
  },

  onSelect: function(selected: SelectedType) {
    if (this.state.selected.rowIdx !== selected.rowIdx
      || this.state.selected.idx !== selected.idx
      || this.state.selected.active === false) {
      let idx = selected.idx;
      let rowIdx = selected.rowIdx;
      if (this.isCellWithinBounds(selected)) {
        const oldSelection = this.state.selected;
        this.setState({selected: selected}, () => {
          if (typeof this.props.onCellDeSelected === 'function') {
            this.props.onCellDeSelected(oldSelection);
          }
          if (typeof this.props.onCellSelected === 'function') {
            this.props.onCellSelected(selected);
          }
        });
      } else if (rowIdx === -1 && idx === -1) {
        // When it's outside of the grid, set rowIdx anyway
        this.setState({selected: { idx, rowIdx }});
      }
    }
  },

  onCellClick: function(cell: SelectedType) {
    this.onSelect({rowIdx: cell.rowIdx, idx: cell.idx});

    if (this.props.onRowClick && typeof this.props.onRowClick === 'function') {
      this.props.onRowClick(cell.rowIdx, this.props.rowGetter(cell.rowIdx), this.getColumn(cell.idx));
    }
  },

  onCellContextMenu: function(cell: SelectedType) {
    this.onSelect({rowIdx: cell.rowIdx, idx: cell.idx, contextMenuDisplayed: this.props.contextMenu});
    if (this.props.contextMenu) {
      document.addEventListener('click', this.onContextMenuHide);
    }
  },

  onCellDoubleClick: function(cell: SelectedType) {
    this.onSelect({rowIdx: cell.rowIdx, idx: cell.idx});
    this.setActive('DoubleClick');
  },

  onViewportDoubleClick: function() {
    this.setActive();
  },

  onPressArrowUp(e: SyntheticEvent) {
    this.moveSelectedCell(e, -1, 0);
  },

  onPressArrowDown(e: SyntheticEvent) {
    this.moveSelectedCell(e, 1, 0);
  },

  onPressArrowLeft(e: SyntheticEvent) {
    this.moveSelectedCell(e, 0, -1);
  },

  onPressArrowRight(e: SyntheticEvent) {
    this.moveSelectedCell(e, 0, 1);
  },

  onPressTab(e: SyntheticEvent) {
    this.moveSelectedCell(e, 0, e.shiftKey ? -1 : 1);
  },

  onPressEnter(e: SyntheticKeyboardEvent) {
    this.setActive(e.key);
  },

  onPressDelete(e: SyntheticKeyboardEvent) {
    this.setActive(e.key);
  },

  onPressEscape(e: SyntheticKeyboardEvent) {
    this.setInactive(e.key);
    this.handleCancelCopy();
  },

  onPressBackspace(e: SyntheticKeyboardEvent) {
    this.setActive(e.key);
  },

  onPressChar(e: SyntheticKeyboardEvent) {
    if (this.isKeyPrintable(e.keyCode)) {
      this.setActive(e.keyCode);
    }
  },

  onPressKeyWithCtrl(e: SyntheticKeyboardEvent) {
    let keys = {
      KeyCode_c: 99,
      KeyCode_C: 67,
      KeyCode_V: 86,
      KeyCode_v: 118
    };

    let rowIdx = this.state.selected.rowIdx;
    let row = this.props.rowGetter(rowIdx);

    let idx = this.state.selected.idx;
    let col = this.getColumn(idx);

    if (ColumnUtils.canEdit(col, row, this.props.enableCellSelect)) {
      if (e.keyCode === keys.KeyCode_c || e.keyCode === keys.KeyCode_C) {
        let value = this.getSelectedValue();
        this.handleCopy({ value: value });
      } else if (e.keyCode === keys.KeyCode_v || e.keyCode === keys.KeyCode_V) {
        this.handlePaste();
      }
    }
  },

  onGridRowsUpdated(cellKey, fromRow, toRow, updated, action, originRow) {
    let rowIds = [];

    for (let i = fromRow; i <= toRow; i++) {
      rowIds.push(this.props.rowGetter(i)[this.props.rowKey]);
    }

    let fromRowData = this.props.rowGetter(action === 'COPY_PASTE' ? originRow : fromRow);
    let fromRowId = fromRowData[this.props.rowKey];
    let toRowId = this.props.rowGetter(toRow)[this.props.rowKey];
    this.props.onGridRowsUpdated({cellKey, fromRow, toRow, fromRowId, toRowId, rowIds, updated, action, fromRowData});
  },

  onCellCommit(commit: RowUpdateEvent) {
    let selected = Object.assign({}, this.state.selected);
    selected.active = false;
    if (commit.key === 'Tab') {
      selected.idx += 1;
    }
    let expandedRows = this.state.expandedRows;
    // if(commit.changed && commit.changed.expandedHeight){
    //   expandedRows = this.expandRow(commit.rowIdx, commit.changed.expandedHeight);
    // }
    this.setState({selected: selected, expandedRows: expandedRows});

    if (this.props.onRowUpdated) {
      this.props.onRowUpdated(commit);
    }

    let targetRow = commit.rowIdx;

    if (this.props.onGridRowsUpdated) {
      this.onGridRowsUpdated(commit.cellKey, targetRow, targetRow, commit.updated, AppConstants.UpdateActions.CELL_UPDATE);
    }
  },

  onDragStart(e: SyntheticEvent) {
    let idx = this.state.selected.idx;
    // To prevent dragging down/up when reordering rows.
    const isViewportDragging = e && e.target && e.target.className;
    if (idx > -1 && isViewportDragging) {
      let value = this.getSelectedValue();
      this.handleDragStart({idx: this.state.selected.idx, rowIdx: this.state.selected.rowIdx, value: value});
      // need to set dummy data for FF
      if (e && e.dataTransfer) {
        if (e.dataTransfer.setData) {
          e.dataTransfer.dropEffect = 'move';
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', '');
        }
      }
    }
  },

	onDeleteRow() {
		if (this.props.deleteSelectedRows) {
			// No need to check if there are selected rows; otherwise the Delete Row button is disabled.
			if (window.confirm('Are you sure to delete ' + this.getSelectedRows().length + ' selected rows?') == true) {
				this.props.deleteSelectedRows(this.getSelectedRows());
				this.setState({ selectedRows : [] });
				this.metricsUpdated(this.state.rowSelectValue, false); // Reset multi-select box to un-checked if all rows are selected and then deleted.
			}
    }
		else {
			alert("this.props.deleteSelectedRows is not defined.")
		}
	},

  onToggleFilter() {
    // setState() does not immediately mutate this.state but creates a pending state transition.
    // Therefore if you want to do something after the state change occurs, pass it in as a callback function.
    this.setState({ canFilter: !this.state.canFilter }, () => {
      if (this.state.canFilter === false && this.props.onClearFilters) {
        this.props.onClearFilters();
      }
    });
  },
  
  onRowSelectDropdownChange(event) {
	  this.metricsUpdated(event.target.value);
  },

  onDragHandleDoubleClick(e) {
    if (this.props.onDragHandleDoubleClick) {
      this.props.onDragHandleDoubleClick(e);
    }

    if (this.props.onGridRowsUpdated) {
      let cellKey = this.getColumn(e.idx).key;
      this.onGridRowsUpdated(cellKey, e.rowIdx, this.props.rowsCount - 1, {[cellKey]: e.rowData[cellKey]}, AppConstants.UpdateActions.COLUMN_FILL);
    }
  },

  onCellExpand(args) {
    if (this.props.onCellExpand) {
      this.props.onCellExpand(args);
    }
  },

  onRowExpandToggle(args) {
    if (typeof this.props.onRowExpandToggle === 'function') {
      this.props.onRowExpandToggle(args);
    }
  },

  isCellWithinBounds({idx, rowIdx}) {
    return idx >= 0
      && rowIdx >= 0
      && idx < ColumnUtils.getSize(this.state.columnMetrics.columns)
      && rowIdx < this.props.rowsCount;
  },

  handleDragStart(dragged: DraggedType) {
    if (!this.dragEnabled()) { return; }
    if (this.isCellWithinBounds(dragged)) {
      this.setState({ dragged: dragged });
    }
  },

  handleDragEnd() {
    if (!this.dragEnabled()) { return; }
    const { selected, dragged } = this.state;
    const column = this.getColumn(this.state.selected.idx);
    if (selected && dragged && column) {
      let cellKey = column.key;
      let fromRow = selected.rowIdx < dragged.overRowIdx ? selected.rowIdx : dragged.overRowIdx;
      let toRow   = selected.rowIdx > dragged.overRowIdx ? selected.rowIdx : dragged.overRowIdx;
      if (this.props.onCellsDragged) {
        this.props.onCellsDragged({cellKey: cellKey, fromRow: fromRow, toRow: toRow, value: dragged.value});
      }
      if (this.props.onGridRowsUpdated) {
        this.onGridRowsUpdated(cellKey, fromRow, toRow, {[cellKey]: dragged.value}, AppConstants.UpdateActions.CELL_DRAG);
      }
    }
    this.setState({dragged: {complete: true}});
  },

  handleDragEnter(row: any) {
    if (!this.dragEnabled() || this.state.dragged == null) { return; }
    let dragged = this.state.dragged;
    dragged.overRowIdx = row;
    this.setState({dragged: dragged});
  },

  handleTerminateDrag() {
    if (!this.dragEnabled()) { return; }
    this.setState({ dragged: null });
  },

  handlePaste() {
    if (!this.copyPasteEnabled() || !(this.state.copied)) { return; }
    let selected = this.state.selected;
    let cellKey = this.getColumn(this.state.selected.idx).key;
    let textToCopy = this.state.textToCopy;
    let fromRow = this.state.copied.rowIdx;
    let toRow = selected.rowIdx;

    if (this.props.onCellCopyPaste) {
      this.props.onCellCopyPaste({cellKey: cellKey, rowIdx: toRow, value: textToCopy, fromRow: fromRow, toRow: toRow});
    }

    if (this.props.onGridRowsUpdated) {
      this.onGridRowsUpdated(cellKey, toRow, toRow, {[cellKey]: textToCopy}, AppConstants.UpdateActions.COPY_PASTE, fromRow);
    }
  },

  handleCancelCopy() {
    this.setState({copied: null});
  },

  handleCopy(args: {value: string}) {
    if (!this.copyPasteEnabled()) { return; }
    let textToCopy = args.value;
    let selected = this.state.selected;
    let copied = {idx: selected.idx, rowIdx: selected.rowIdx};
    this.setState({textToCopy: textToCopy, copied: copied});
  },

  handleSort: function(columnKey: string, direction: SortType) {
    this.setState({sortDirection: direction, sortColumn: columnKey}, function() {
      this.props.onGridSort(columnKey, direction);
    });
  },

  getSelectedRow(rows, key) {
    let selectedRow = rows.filter(r => {
      if (r[this.props.rowKey] === key) {
        return true;
      }
      return false;
    });
    if (selectedRow.length > 0) {
      return selectedRow[0];
    }
  },

//  useNewRowSelection() {
//    return this.props.rowSelection && this.props.rowSelection.selectBy;
//  },
  // return false if not a shift select so can be handled as normal row selection
  handleShiftSelect(rowIdx) {
    if (this.state.lastRowIdxUiSelected > -1 && this.isSingleKeyDown(KeyCodes.Shift)) {
      let {keys, indexes, isSelectedKey} = this.props.rowSelection.selectBy;
      let isPreviouslySelected = RowUtils.isRowSelected(keys, indexes, isSelectedKey, this.props.rowGetter(rowIdx), rowIdx);

      if (isPreviouslySelected) return false;

      let handled = false;

      if (rowIdx > this.state.lastRowIdxUiSelected) {
        let rowsSelected = [];

        for (let i = this.state.lastRowIdxUiSelected + 1; i <= rowIdx; i++) {
          rowsSelected.push({rowIdx: i, row: this.props.rowGetter(i)});
        }

        if (typeof this.props.rowSelection.onRowsSelected === 'function') {
          this.props.rowSelection.onRowsSelected(rowsSelected);
        }

        handled = true;
      } else if (rowIdx < this.state.lastRowIdxUiSelected) {
        let rowsSelected = [];

        for (let i = rowIdx; i <= this.state.lastRowIdxUiSelected - 1; i++) {
          rowsSelected.push({rowIdx: i, row: this.props.rowGetter(i)});
        }

        if (typeof this.props.rowSelection.onRowsSelected === 'function') {
          this.props.rowSelection.onRowsSelected(rowsSelected);
        }

        handled = true;
      }

      if (handled) {
        this.setState({lastRowIdxUiSelected: rowIdx});
      }

      return handled;
    }

    return false;
  },

  handleNewRowSelect(rowIdx, rowData) {
    if (this.selectAllCheckbox && this.selectAllCheckbox.checked === true) {
      this.selectAllCheckbox.checked = false;
    }

    let {keys, indexes, isSelectedKey} = this.props.rowSelection.selectBy;
    let isPreviouslySelected = RowUtils.isRowSelected(keys, indexes, isSelectedKey, rowData, rowIdx);

    this.setState({lastRowIdxUiSelected: isPreviouslySelected ? -1 : rowIdx, selected: {rowIdx: rowIdx, idx: 0}});

    if (isPreviouslySelected && typeof this.props.rowSelection.onRowsDeselected === 'function') {
      this.props.rowSelection.onRowsDeselected([{rowIdx, row: rowData}]);
    } else if (!isPreviouslySelected && typeof this.props.rowSelection.onRowsSelected === 'function') {
      this.props.rowSelection.onRowsSelected([{rowIdx, row: rowData}]);
    }
  },
  // columnKey not used here as this function will select the whole row,
  // but needed to match the function signature in the CheckboxEditor
  handleRowSelect(rowIdx: number, columnKey: string, rowData, e: Event) {
    e.stopPropagation();

    //if (this.useNewRowSelection()) {
    //  if (this.props.rowSelection.enableShiftSelect === true) {
    //    if (!this.handleShiftSelect(rowIdx)) {
    //      this.handleNewRowSelect(rowIdx, rowData);
    //    }
    //  } else {
    //    this.handleNewRowSelect(rowIdx, rowData);
    //  }
    //} else { // Fallback to old onRowSelect handler
	  let selectedRows = this.state.selectedRows.slice(0);
      let selectedRow = this.getSelectedRow(selectedRows, rowData[this.props.rowKey]);
      if (selectedRow) {
        selectedRow.isSelected = !selectedRow.isSelected;
      } else {
		if (this.state.rowSelectValue === 'single') {
	      selectedRows = [];
		}
        rowData.isSelected = true;
        selectedRows.push(rowData);
      }
      this.setState({selectedRows: selectedRows, selected: {rowIdx: rowIdx, idx: 0}});
      if (this.props.onRowSelect) {
		let filteredRows = selectedRows.filter(r => r.isSelected === true);
        this.props.onRowSelect(filteredRows);
      }
    //}
  },

  handleCheckboxChange: function(e: SyntheticEvent) {
    let allRowsSelected;
    if (e.currentTarget instanceof HTMLInputElement && e.currentTarget.checked === true) {
      allRowsSelected = true;
    } else {
      allRowsSelected = false;
    }
    //if (this.useNewRowSelection()) {
    //  let {keys, indexes, isSelectedKey} = this.props.rowSelection.selectBy;

    //  if (allRowsSelected && typeof this.props.rowSelection.onRowsSelected === 'function') {
    //    let selectedRows = [];
    //    for (let i = 0; i < this.props.rowsCount; i++) {
    //      let rowData = this.props.rowGetter(i);
    //      if (!RowUtils.isRowSelected(keys, indexes, isSelectedKey, rowData, i)) {
    //        selectedRows.push({rowIdx: i, row: rowData});
    //      }
    //    }

    //    if (selectedRows.length > 0) {
    //      this.props.rowSelection.onRowsSelected(selectedRows);
    //    }
    //  } else if (!allRowsSelected && typeof this.props.rowSelection.onRowsDeselected === 'function') {
    //    let deselectedRows = [];
    //    for (let i = 0; i < this.props.rowsCount; i++) {
    //      let rowData = this.props.rowGetter(i);
    //      if (RowUtils.isRowSelected(keys, indexes, isSelectedKey, rowData, i)) {
    //        deselectedRows.push({rowIdx: i, row: rowData});
    //      }
    //    }

    //    if (deselectedRows.length > 0) {
    //      this.props.rowSelection.onRowsDeselected(deselectedRows);
    //    }
    //  }
    //} else {
      let selectedRows = [];
      for (let i = 0; i < this.props.rowsCount; i++) {
        let row = Object.assign({}, this.props.rowGetter(i), {isSelected: allRowsSelected});
        selectedRows.push(row);
      }
      this.setState({selectedRows: selectedRows});
			this.metricsUpdated(this.state.rowSelectValue, allRowsSelected);
      if (typeof this.props.onRowSelect === 'function') {
        this.props.onRowSelect(selectedRows.filter(r => r.isSelected === true));
      }
    //}
  },

  getScrollOffSet() {
    let scrollOffset = 0;
    let canvas = ReactDOM.findDOMNode(this).querySelector('.react-grid-Canvas');
    if (canvas) {
      scrollOffset = canvas.offsetWidth - canvas.clientWidth;
    }
    this.setState({scrollOffset: scrollOffset});
  },

  getRowOffsetHeight(): number {
    let offsetHeight = 0;
    this.getHeaderRows().forEach((row) => offsetHeight += parseFloat(row.height, 10) );
    return offsetHeight;
  },

  getHeaderRows(): Array<{ref: Function; height: number;}> {
    let rows = [{ ref: (node) => this.row = node, height: this.props.headerRowHeight || this.props.rowHeight, rowType: 'header' }];
    if (this.state.canFilter === true) {
      rows.push({
        ref: (node) => this.filterRow = node,
        filterable: true,
        onFilterChange: this.props.onAddFilter,
        height: this.props.headerFiltersHeight,
        rowType: 'filter'
      });
    }
    return rows;
  },
  getInitialSelectedRows: function() {
    let selectedRows = [];
    for (let i = 0; i < this.props.rowsCount; i++) {
      selectedRows.push(false);
    }
    return selectedRows;
  },
  getRowSelectionProps() {
    if (this.props.rowSelection) {
      return this.props.rowSelection.selectBy;
    }

    return null;
  },
  getSelectedRows() {
    if (this.props.rowSelection) {
      return [];
    }

    return this.state.selectedRows.filter(elem => elem.isSelected);
  },
  getSelectedValue(): string {
    let rowIdx = this.state.selected.rowIdx;
    let idx = this.state.selected.idx;
    let cellKey = this.getColumn(idx).key;
    let row = this.props.rowGetter(rowIdx);
    return RowUtils.get(row, cellKey);
  },

  moveSelectedCell(e: SyntheticEvent, rowDelta: number, cellDelta: number) {
    // we need to prevent default as we control grid scroll
    // otherwise it moves every time you left/right which is janky
    e.preventDefault();
    let rowIdx;
    let idx;
    const { cellNavigationMode } = this.props;
    if (cellNavigationMode !== 'none') {
      ({idx, rowIdx} = this.calculateNextSelectionPosition(cellNavigationMode, cellDelta, rowDelta));
    } else {
      rowIdx = this.state.selected.rowIdx + rowDelta;
      idx = this.state.selected.idx + cellDelta;
    }
    this.scrollToColumn(idx);
    this.onSelect({ idx: idx, rowIdx: rowIdx });
  },

  getNbrColumns() {
    const {columns} = this.props;
    return this.state.rowSelectValue != 'none' ? columns.length + 1 : columns.length;
  },

  getDataGridDOMNode() {
    if (!this._gridNode) {
      this._gridNode = ReactDOM.findDOMNode(this);
    }
    return this._gridNode;
  },

  calculateNextSelectionPosition(cellNavigationMode: string, cellDelta: number, rowDelta: number) {
    let _rowDelta = rowDelta;
    let idx = this.state.selected.idx + cellDelta;
    const nbrColumns = this.getNbrColumns();
    if (cellDelta > 0) {
      if (this.isAtLastCellInRow(nbrColumns)) {
        if (cellNavigationMode === 'changeRow') {
          _rowDelta = this.isAtLastRow() ? rowDelta : rowDelta + 1;
          idx = this.isAtLastRow() ? idx : 0;
        } else {
          idx = 0;
        }
      }
    } else if (cellDelta < 0) {
      if (this.isAtFirstCellInRow()) {
        if (cellNavigationMode === 'changeRow') {
          _rowDelta = this.isAtFirstRow() ? rowDelta : rowDelta - 1;
          idx = this.isAtFirstRow() ? 0 : nbrColumns - 1;
        } else {
          idx = nbrColumns - 1;
        }
      }
    }
    let rowIdx = this.state.selected.rowIdx + _rowDelta;
    return {idx, rowIdx};
  },

  isAtLastCellInRow(nbrColumns) {
    return this.state.selected.idx === nbrColumns - 1;
  },

  isAtLastRow() {
    return this.state.selected.rowIdx === this.props.rowsCount - 1;
  },

  isAtFirstCellInRow() {
    return this.state.selected.idx === 0;
  },

  isAtFirstRow() {
    return this.state.selected.rowIdx === 0;
  },

  openCellEditor(rowIdx, idx) {
    let row = this.props.rowGetter(rowIdx);
    let col = this.getColumn(idx);

    if (!ColumnUtils.canEdit(col, row, this.props.enableCellSelect)) {
      return;
    }

    let selected = {rowIdx, idx};
    if (this.hasSelectedCellChanged(selected)) {
      this.setState({selected}, () => {
        this.setActive('Enter');
      });
    } else {
      this.setActive('Enter');
    }
  },

  scrollToColumn(colIdx) {
    let canvas = ReactDOM.findDOMNode(this).querySelector('.react-grid-Canvas');
    if (canvas) {
      let left = 0;
      let locked = 0;

      for (let i = 0; i < colIdx; i++) {
        let column = this.getColumn(i);
        if (column) {
          if (column.width) {
            left += column.width;
          }
          if (column.locked) {
            locked += column.width;
          }
        }
      }

      let selectedColumn = this.getColumn(colIdx);
      if (selectedColumn) {
        let scrollLeft = left - locked - canvas.scrollLeft;
        let scrollRight =  left + selectedColumn.width - canvas.scrollLeft;

        if (scrollLeft < 0) {
          canvas.scrollLeft += scrollLeft;
        } else if (scrollRight > canvas.clientWidth) {
          let scrollAmount =  scrollRight - canvas.clientWidth;
          canvas.scrollLeft += scrollAmount;
        }
      }
    }
  },

  setActive(keyPressed: string) {
    let rowIdx = this.state.selected.rowIdx;
    let row = this.props.rowGetter(rowIdx);

    let idx = this.state.selected.idx;
    let column = this.getColumn(idx);

    if (ColumnUtils.canEdit(column, row, this.props.enableCellSelect) && !this.isActive()) {
      let selected = Object.assign({}, this.state.selected, {idx: idx, rowIdx: rowIdx, active: true, initialKeyCode: keyPressed});
      let showEditor = true;
      if (typeof this.props.onCheckCellIsEditable === 'function') {
        let args = Object.assign({}, { row, column }, selected);
        showEditor = this.props.onCheckCellIsEditable(args);
      }
      if (showEditor !== false) {
        if (column.locked) {
          this.setState({selected});
        } else {
          this.setState({selected}, () => { this.scrollToColumn(idx); });
        }
        this.handleCancelCopy();
      }
    }
  },

  setInactive() {
    let rowIdx = this.state.selected.rowIdx;
    let row = this.props.rowGetter(rowIdx);

    let idx = this.state.selected.idx;
    let col = this.getColumn(idx);

    if (ColumnUtils.canEdit(col, row, this.props.enableCellSelect) && this.isActive()) {
      let selected = Object.assign({}, this.state.selected, {idx: idx, rowIdx: rowIdx, active: false});
      this.setState({selected: selected});
    }
  },

  isActive(): boolean {
    return this.state.selected.active === true;
  },

 // setupGridColumns: function(props): Array<any> {
 //   const { columns } = props;
 //   if (this._cachedColumns === columns) {
 //     return this._cachedComputedColumns;
 //   }

 //   this._cachedColumns = columns;

 //   let cols = columns.slice(0);
 //   //let newCols = {};
	////let rowSelectValue = this.state ? this.state.rowSelectValue : 'multiple';
 //   if (this.props.rowActionsCell || (this.state.rowSelectValue != 'none' && !this.props.rowSelection) || (props.rowSelection && props.rowSelection.showCheckbox !== false)) {
 //     let headerRenderer = this.state.rowSelectValue === 'single' ? null :
 //     <div className="react-grid-checkbox-container checkbox-align">
 //       <input className="react-grid-checkbox" type="checkbox" name="select-all-checkbox" id="select-all-checkbox" ref={grid => this.selectAllCheckbox = grid} onChange={this.handleCheckboxChange} />
 //       <label htmlFor="select-all-checkbox" className="react-grid-checkbox-label"></label>
 //     </div>;
 //     let Formatter = this.props.rowActionsCell ? this.props.rowActionsCell : CheckboxEditor;
 //     let selectColumn = {
 //       key: 'select-row',
 //       name: '',
 //       formatter: <Formatter rowSelection={this.props.rowSelection}/>,
 //       onCellChange: this.handleRowSelect,
 //       filterable: false,
 //       headerRenderer: headerRenderer,
 //       width: 30,
 //       locked: true,
 //       getRowMetaData: (rowData) => rowData,
 //       cellClass: this.props.rowActionsCell ? 'rdg-row-actions-cell' : ''
 //     };
 //     let newCols = cols.unshift(selectColumn);
 //     cols = newCols > 0 ? cols : newCols;
 //   }
 //   this._cachedComputedColumns = cols;

 //   return this._cachedComputedColumns;
 // },

  setupGridColumns: function(rowSelectValue, allRowsSelected, props) {
		// No need to check if rowSelectValue has changed because the grid columns need to generate from scratch (props.columns) anyway.
    //if (rowSelectValue === this.state.rowSelectValue) {
    //  return props.columns; // This would be wrong if rowSelectValue is not 'none'.
    //}

		// Cannot keep multiple selected rows when changed to single selection (from either none or multiple). 
		// So ask users to confirm. If confirmed, clear all selected rows.
		if (rowSelectValue === 'single' && this.getSelectedRows().length > 1) {
			//<ReactConfirmAlert
				//title = 'Change to Single Row selection?'
			//message = 'More than one row has been selected. Change to Single Row selection will clear all selected rows.'
			//confirmLabel = 'Confirm'
			//cancelLabel = 'Cancel'
			//onConfirm = { () => alert('Confirmed') }
			//onCancel = { () => alert('Canceled') }
			///>
			if (window.confirm('Change to Single Row selection? All ' + this.getSelectedRows().length + ' selected rows will be cleared.') == true) {
				this.setState({ rowSelectValue : rowSelectValue, selected : {}, selectedRows : [] });
			}
			else {
				rowSelectValue = this.state.rowSelectValue; // Revert to the previous rowSelectValue when Cancel is chosen.
			}
		}
		// Otherwise, keep the selected rows, even when the row select column is not shown.
		else {
			this.setState({ rowSelectValue : rowSelectValue });
		}
		
    if (rowSelectValue === 'none') {
      return { rowSelectValue : rowSelectValue, columns : props.columns };
    }
		else {
			// Create the row select column.
			let columnsNew = props.columns.slice(0);
			let headerRenderer = rowSelectValue === 'single' ? null :
				<div className="react-grid-checkbox-container checkbox-align">
					<input checked={allRowsSelected} className="react-grid-checkbox" type="checkbox" name="select-all-checkbox" id="select-all-checkbox" ref={grid => 		this.selectAllCheckbox = grid} onChange={this.handleCheckboxChange} />
					<label htmlFor="select-all-checkbox" className="react-grid-checkbox-label"></label>
				</div>;
			let Formatter = this.props.rowActionsCell ? this.props.rowActionsCell : CheckboxEditor;
			let selectColumn = {
				key: 'select-row',
				name: '',
				formatter: <Formatter rowSelection={this.props.rowSelection} />,
				onCellChange: this.handleRowSelect,
				filterable: false,
				headerRenderer: headerRenderer,
				width: props.rowSelectColumnWidth,
				locked: true,
				getRowMetaData: (rowData) => rowData,
				cellClass: this.props.rowActionsCell ? 'rdg-row-actions-cell' : ''
			}
			columnsNew.unshift(selectColumn);
		
			return { rowSelectValue : rowSelectValue, columns : columnsNew };;
		}
  },

  copyPasteEnabled: function(): boolean {
    return this.props.onCellCopyPaste !== null;
  },

  dragEnabled: function(): boolean {
    return this.props.onGridRowsUpdated !== undefined || this.props.onCellsDragged !== undefined;
  },

  renderToolbar(): ReactElement {
    let Toolbar = this.props.toolbar;
	let filterRowsButtonText = this.state.canFilter ? "Hide Filter" : "Show Filter";
    let toolBarProps =  {
	  columns: this.props.columns,
		onDeleteRow: this.onDeleteRow,
		selectedRows: this.state.selectedRows,
	  onToggleFilter: this.onToggleFilter,
	  filterRowsButtonText: filterRowsButtonText,
	  onRowSelectDropdownChange: this.onRowSelectDropdownChange,
	  rowSelectValue: this.state.rowSelectValue,
	  numberOfRows: this.props.rowsCount
	};
    if (React.isValidElement(Toolbar)) {
      return ( React.cloneElement(Toolbar, toolBarProps));
    } else if (isFunction(Toolbar)) {
      return <Toolbar {...toolBarProps}/>;
    }
  },

  render() {
    let cellMetaData = {
      rowKey: this.props.rowKey,
      selected: this.state.selected,
      dragged: this.state.dragged,
      hoveredRowIdx: this.state.hoveredRowIdx,
      onCellClick: this.onCellClick,
      onCellContextMenu: this.onCellContextMenu,
      onCellDoubleClick: this.onCellDoubleClick,
      onCommit: this.onCellCommit,
      onCommitCancel: this.setInactive,
      copied: this.state.copied,
      handleDragEnterRow: this.handleDragEnter,
      handleTerminateDrag: this.handleTerminateDrag,
      enableCellSelect: this.props.enableCellSelect,
      onColumnEvent: this.onColumnEvent,
      openCellEditor: this.openCellEditor,
      onDragHandleDoubleClick: this.onDragHandleDoubleClick,
      onCellExpand: this.onCellExpand,
      onRowExpandToggle: this.onRowExpandToggle,
      onRowHover: this.onRowHover,
      getDataGridDOMNode: this.getDataGridDOMNode,
      onDeleteSubRow: this.props.onDeleteSubRow,
      onAddSubRow: this.props.onAddSubRow,
      isScrollingVerticallyWithKeyboard: this.isKeyDown(KeyCodes.DownArrow) || this.isKeyDown(KeyCodes.UpArrow),
      isScrollingHorizontallyWithKeyboard: this.isKeyDown(KeyCodes.LeftArrow) || this.isKeyDown(KeyCodes.RightArrow) || this.isKeyDown(KeyCodes.Tab)
    };

    let toolbar = this.renderToolbar();
    //let containerWidth = this.props.minWidth || this.DOMMetrics.gridWidth();
		let containerWidth = this.state.columnMetrics.totalWidth || this.DOMMetrics.gridWidth();
    let gridWidth = containerWidth - this.state.scrollOffset;

    // depending on the current lifecycle stage, gridWidth() may not initialize correctly
    // this also handles cases where it always returns undefined -- such as when inside a div with display:none
    // eg Bootstrap tabs and collapses
    if (typeof containerWidth === 'undefined' || isNaN(containerWidth) || containerWidth === 0) {
      containerWidth = '100%';
    }
    if (typeof gridWidth === 'undefined' || isNaN(gridWidth) || gridWidth === 0) {
      gridWidth = '100%';
    }
		
    return (
      <div className="react-grid-Container" style={{width: containerWidth}}>
        {toolbar}
        <div className="react-grid-Main">
          <BaseGrid
            ref={(node) => this.base = node}
            {...this.props}
            rowKey={this.props.rowKey}
            headerRows={this.getHeaderRows()}
            columnMetrics={this.state.columnMetrics}
            rowGetter={this.props.rowGetter}
            rowsCount={this.props.rowsCount}
            rowHeight={this.props.rowHeight}
            cellMetaData={cellMetaData}
            selectedRows={this.getSelectedRows()}
            rowSelection={this.getRowSelectionProps()}
            expandedRows={this.state.expandedRows}
            rowOffsetHeight={this.getRowOffsetHeight()}
            sortColumn={this.state.sortColumn}
            sortDirection={this.state.sortDirection}
            onSort={this.handleSort}
            minHeight={this.props.minHeight}
            totalWidth={gridWidth}
            onViewportKeydown={this.onKeyDown}
            onViewportKeyup={this.onKeyUp}
            onViewportDragStart={this.onDragStart}
            onViewportDragEnd={this.handleDragEnd}
            onViewportDoubleClick={this.onViewportDoubleClick}
            onColumnResize={this.onColumnResize}
            rowScrollTimeout={this.props.rowScrollTimeout}
            contextMenu={this.props.contextMenu}
            overScan={this.props.overScan} />
          </div>
        </div>
      );
  }
});


module.exports = ReactDataGrid;
