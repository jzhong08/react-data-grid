import React, { PropTypes, Component } from 'react';
import Toolbar from './Toolbar';
import GroupedColumnsPanel from './GroupedColumnsPanel';
import '../../../../themes/react-data-grid-toolbar.css';

const AdvancedToolbar = React.createClass({
    propTypes: {
        groupBy: React.PropTypes.array.isRequired,
        onColumnGroupAdded: React.PropTypes.func.isRequired,
        onColumnGroupDeleted: React.PropTypes.func.isRequired,
        onAddRow: React.PropTypes.func.isRequired,
        onDeleteRow: React.PropTypes.func,
        selectedRows: React.PropTypes.array,
        onToggleFilter: React.PropTypes.func,
        filterRowsButtonText: React.PropTypes.string,
        rowSelectValue: React.PropTypes.string,
        onRowSelectDropdownChange: React.PropTypes.func,
    },

    render() {
       return (
				<div>
					<GroupedColumnsPanel 
						groupBy={this.props.groupBy} 
						onColumnGroupAdded={this.props.onColumnGroupAdded} 
						onColumnGroupDeleted={this.props.onColumnGroupDeleted} />
					<Toolbar
							enableAddRow={true}
							onAddRow={this.props.onAddRow}
							enableDeleteRow={true}
							onDeleteRow={this.props.onDeleteRow}
							selectedRows={this.props.selectedRows}
							enableFilter={true}
							filterRowsButtonText={this.props.filterRowsButtonText}
							onToggleFilter={this.props.onToggleFilter}
							enableRowSelect={true}
							rowSelectValue={this.props.rowSelectValue}
							onRowSelectDropdownChange={this.props.onRowSelectDropdownChange} />
        </div>);
    }
});

module.exports = AdvancedToolbar;