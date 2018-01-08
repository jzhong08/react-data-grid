import React, { PropTypes, Component } from 'react';
import Toolbar from './Toolbar';
import '../../../../themes/react-data-grid-toolbar.css';

const propTypes = {
    enableAddRow: React.PropTypes.bool,
	onAddRow: React.PropTypes.func,
	enableFilter: React.PropTypes.bool,
	filterRowsButtonText: React.PropTypes.string,
    onToggleFilter: React.PropTypes.func,
	children: PropTypes.array,
};

const defaultProps = {
  enableFilter: true,
  enableAddRow: true
};

class AdvancedToolbar extends Component {
  render() {
    return (
      <div className="react-grid-Toolbar">
        {this.props.children}
        <div className="tools">
          <Toolbar enableAddRow={this.props.enableAddRow} onAddRow={this.props.onAddRow} enableFilter={this.props.enableFilter} filterRowsButtonText={this.props.filterRowsButtonText} onToggleFilter={this.props.onToggleFilter} />
        </div>
      </div>);
  }
}

AdvancedToolbar.defaultProps = defaultProps;
AdvancedToolbar.propTypes = propTypes;

export default AdvancedToolbar;
