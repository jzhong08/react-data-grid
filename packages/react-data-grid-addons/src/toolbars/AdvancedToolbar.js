import React, { PropTypes, Component } from 'react';
import Toolbar from './Toolbar';
import '../../../../themes/react-data-grid-toolbar.css';

const propTypes = {
    children: PropTypes.array,
    onToggleFilter: React.PropTypes.func
};

const defaultProps = {
  enableAddRow: true
};

class AdvancedToolbar extends Component {
  render() {
    return (
      <div className="react-grid-Toolbar">
        {this.props.children}
        <div className="tools">
          <Toolbar enableFilter={true} onToggleFilter={this.props.onToggleFilter} />
        </div>
      </div>);
  }
}

AdvancedToolbar.defaultProps = defaultProps;
AdvancedToolbar.propTypes = propTypes;

export default AdvancedToolbar;
