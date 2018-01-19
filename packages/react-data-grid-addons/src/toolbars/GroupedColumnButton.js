import React, {PropTypes, Component} from 'react';

export default class GroupedColumnButton extends Component {
  render() {
    let style = {
      width: '80px',
			fontSize: '11px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
    return (
      <button className="grouped-col-btn">
			  <span style={style}>{this.props.name}</span>
        <span
          className="glyphicon glyphicon-trash"
          style={{float: 'right', padding: '2px'}}
          onClick={this.props.onColumnGroupDeleted.bind(null, this.props.columnKey)}>
        </span>
      </button>
    );
  }
}

GroupedColumnButton.propTypes = {
  name: PropTypes.string.isRequired,
  onColumnGroupDeleted: PropTypes.func,
  columnKey: PropTypes.string.isRequired
};
