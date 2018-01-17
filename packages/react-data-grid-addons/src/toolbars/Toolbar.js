const React = require('react');
require('../../../../themes/react-data-grid-toolbar.css');
//import Select from 'react-select';
//import 'react-select/dist/react-select.css';

const Toolbar = React.createClass({
  propTypes: {
    enableAddRow: React.PropTypes.bool,
	addRowButtonText: React.PropTypes.string,
	onAddRow: React.PropTypes.func,
    enableFilter: React.PropTypes.bool,
	filterRowsButtonText: React.PropTypes.string,
    onToggleFilter: React.PropTypes.func,
	enableRowSelect: React.PropTypes.bool,
	rowSelectValue: React.PropTypes.string,
    numberOfRows: React.PropTypes.number,
    children: React.PropTypes.any
  },

  onAddRow() {
    //if (this.props.onAddRow !== null && this.props.onAddRow instanceof Function) {
    //  this.props.onAddRow({newRowIndex: this.props.numberOfRows});
    //}
      this.props.onAddRow({ newRowIndex: 0 });
  },

  getDefaultProps() {
    return {
      enableAddRow: false,
      addRowButtonText: 'Add Row',
      enableFilter: false,
      filterRowsButtonText: 'Default Filter Rows Button Name',
	  enableRowSelect: false,
    };
  },

  renderAddRowButton() {
    if (this.props.enableAddRow) {
      return (<button type="button" className="btn" onClick={this.onAddRow}>
        {this.props.addRowButtonText}
      </button>);
    }
  },

  renderToggleFilterButton() {
    if (this.props.enableFilter) {
      return (<button type="button" className="btn" onClick={this.props.onToggleFilter}>
        {this.props.filterRowsButtonText}
    </button>);
    }
  },

  //renderRowSelectDropdown() {
  //  if (this.props.enableRowSelect) {
  //    return (<Select className="select" name="row-selection" value="NoSelect" onChange={this.props.onChange}
	//			options = {[
	//				{value: "MultipleSelect", label: "Multiple Select"},
	//				{value: "SingleSelect", label: "Single Select"},
	//				{value: "No Select", label: "No Select"},
	//			]}
	//		  />);
    //}
  //},
  
  renderRowSelectDropdown() {
    if (this.props.enableRowSelect) {
      return (<select className="select" value={this.props.rowSelectValue} onChange={this.props.onRowSelectDropdownChange}>
        <option value="multiple">Multiple Select</option>
		<option value="single">Single Select</option>
		<option value="none">No Select</option>
    </select>);
    }
  },
  
  render() {
    return (
      <div className="react-grid-Toolbar">
        <div className="tools">
          {this.renderAddRowButton()}
          {this.renderToggleFilterButton()}
		  {this.renderRowSelectDropdown()}
          {this.props.children}
        </div>
      </div>);
  }
});

module.exports = Toolbar;
