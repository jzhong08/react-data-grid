import React, { PropTypes, Component } from 'react';
import Toolbar from './Toolbar';
import '../../../../themes/react-data-grid-toolbar.css';

const propTypes = {
    children: PropTypes.array,
    enableFilter: React.PropTypes.bool,
    onToggleFilter: React.PropTypes.func,
    enableAddRow: React.PropTypes.bool,
    onAddRow: React.PropTypes.func
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
          <Toolbar enableAddRow={this.props.enableAddRow} onAddRow={this.props.onAddRow} enableFilter={this.props.enableFilter} onToggleFilter={this.props.onToggleFilter} />
        </div>
      </div>);
  }
}

AdvancedToolbar.defaultProps = defaultProps;
AdvancedToolbar.propTypes = propTypes;

export default AdvancedToolbar;
