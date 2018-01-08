const React = require('react');
require('../../../../themes/react-data-grid-toolbar.css');

const Toolbar = React.createClass({
  propTypes: {
    enableAddRow: React.PropTypes.bool,
	addRowButtonText: React.PropTypes.string,
	onAddRow: React.PropTypes.func,
    enableFilter: React.PropTypes.bool,
	filterRowsButtonText: React.PropTypes.string,
    onToggleFilter: React.PropTypes.func,
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
      enableAddRow: true,
      addRowButtonText: 'Add Row',
      enableFilter: true,
      filterRowsButtonText: 'Default Filter Rows Button Name'
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

  render() {
    return (
      <div className="react-grid-Toolbar">
        <div className="tools">
          {this.renderAddRowButton()}
          {this.renderToggleFilterButton()}
          {this.props.children}
        </div>
      </div>);
  }
});

module.exports = Toolbar;
