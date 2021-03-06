const React = require('react');
require('../../../../themes/react-data-grid-toolbar.css');
//import Select from 'react-select';
//import 'react-select/dist/react-select.css';

const Toolbar = React.createClass({
  propTypes: {
    enableAddRow: React.PropTypes.bool,
		addRowButtonText: React.PropTypes.string,
		onAddRow: React.PropTypes.func,
		enableDeleteRow: React.PropTypes.bool,
		deleteRowButtonText: React.PropTypes.string,
		onDeleteRow: React.PropTypes.func,
		enableSaveRow: React.PropTypes.bool,
		saveRowButtonText: React.PropTypes.string,
		onSaveRow: React.PropTypes.func,
		selectedRows: React.PropTypes.array,
    enableFilter: React.PropTypes.bool,
		filterRowsButtonText: React.PropTypes.string,
    onToggleFilter: React.PropTypes.func,
		enableRowSelect: React.PropTypes.bool,
		rowSelectValue: React.PropTypes.string,
    numberOfRows: React.PropTypes.number,
    children: React.PropTypes.any
  },

  getDefaultProps() {
    return {
      enableAddRow: false,
      addRowButtonText: 'Add Row',
			enableDeleteRow: false,
      deleteRowButtonText: 'Delete Row',
			enableSaveRow: false,
      saveRowButtonText: 'Save Row',
      enableFilter: false,
      filterRowsButtonText: 'Default Filter Rows Button Name',
	  enableRowSelect: false,
    };
  },

  renderToggleFilterButton() {
    if (this.props.enableFilter) {
      return (<button type="button" className="btn" onClick={this.props.onToggleFilter}>
        {this.props.filterRowsButtonText}
    </button>);
    }
  },
	
  onAddRow() {
    //if (this.props.onAddRow !== null && this.props.onAddRow instanceof Function) {
    //  this.props.onAddRow({newRowIndex: this.props.numberOfRows});
    //}
      this.props.onAddRow({ newRowIndex: 0 });
  },

  renderAddRowButton() {
    if (this.props.enableAddRow) {
      return (<button type="button" className="btn" onClick={this.onAddRow}>
        {this.props.addRowButtonText}
      </button>);
    }
  },

	renderDeleteRowButton() {
    if (this.props.enableDeleteRow) {
			let buttonToggleStr = (this.props.selectedRows && this.props.selectedRows.filter(elem => elem.isSelected).length > 0) ? "" : "Disabled"; 
			// Empty string set to disabled attribute enables the button.
      return (
				<button type="button" className="btn" disabled={buttonToggleStr} onClick={this.props.onDeleteRow}>
					{this.props.deleteRowButtonText}
				</button>);
    }
  },
	
	renderSaveRowButton() {
    if (this.props.enableSaveRow) {
			let buttonToggleStr = (this.props.selectedRows && this.props.selectedRows.filter(elem => elem.isSelected).length > 0) ? "" : "Disabled"; 
			// Empty string set to disabled attribute enables the button.
      return (
				<button type="button" className="btn" disabled={buttonToggleStr} onClick={this.props.onSaveRow}>
					{this.props.saveRowButtonText}
				</button>);
    }
  },

  //renderRowSelectDropdown() {
  //  if (this.props.enableRowSelect) {
  //    return (<Select className="select" name="row-selection" value="NoSelect" onChange={this.props.onChange}
	//			options = {[
	//				{value: "MultipleSelect", label: "Multiple Select"},
	//				{value: "SingleSelect", label: "Single Select"},
	//				{value: "No Select", label: "Hide Select"},
	//			]}
	//		  />);
    //}
  //},
  
  renderRowSelectDropdown() {
    if (this.props.enableRowSelect) {
      return (<select className="select" value={this.props.rowSelectValue} onChange={this.props.onRowSelectDropdownChange}>
								<option value="multiple">Multiple Select</option>
								<option value="single">Single Select</option>
								<option value="none">Hide Select</option>
							</select>
			);
    }
  },
  
  render() {
    return (
      <div className="react-grid-Toolbar">
				{this.renderToggleFilterButton()}
				{this.renderAddRowButton()}
				{this.renderDeleteRowButton()}
				{this.renderSaveRowButton()}
				{this.renderRowSelectDropdown()}
				{this.props.children}
      </div>);
  }
});

module.exports = Toolbar;
