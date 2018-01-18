import React, { PropTypes, Component } from 'react';
import Toolbar from './Toolbar';
import '../../../../themes/react-data-grid-toolbar.css';

const propTypes = {
  enableAddRow: React.PropTypes.bool,
	onAddRow: React.PropTypes.func,
	enableDeleteRow: React.PropTypes.bool,
	onDeleteRow: React.PropTypes.func,
	selectedRows: React.PropTypes.array,
	enableFilter: React.PropTypes.bool,
	filterRowsButtonText: React.PropTypes.string,
  onToggleFilter: React.PropTypes.func,
	enableRowSelect: React.PropTypes.bool,
	rowSelectValue: React.PropTypes.string,
	onRowSelectDropdownChange: React.PropTypes.func,
	children: PropTypes.array,
};

const defaultProps = {
  //enableAddRow: true,
  //enableDeleteRow: true,
	//enableFilter: true,
};

class AdvancedToolbar extends Component {
  render() {
    return (
      <div className="react-grid-Toolbar">
        {this.props.children}
        <div className="tools">
          <Toolbar
						enableAddRow={this.props.enableAddRow}
						onAddRow={this.props.onAddRow}
						enableDeleteRow={this.props.enableDeleteRow}
						onDeleteRow={this.props.onDeleteRow}
						selectedRows={this.props.selectedRows}
						enableFilter={this.props.enableFilter}
						filterRowsButtonText={this.props.filterRowsButtonText}
						onToggleFilter={this.props.onToggleFilter}
						enableRowSelect={this.props.enableRowSelect}
						rowSelectValue={this.props.rowSelectValue}
						onRowSelectDropdownChange={this.props.onRowSelectDropdownChange}
					/>
        </div>
      </div>);
  }
}

AdvancedToolbar.defaultProps = defaultProps;
AdvancedToolbar.propTypes = propTypes;

export default AdvancedToolbar;
