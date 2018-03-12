import { DragSource, DropTarget } from 'react-dnd';
import React, {PropTypes, Component} from 'react';
import { _constants, HeaderCell } from 'react-data-grid';
const { DragItemTypes } = _constants;

class DraggableHeaderCell extends Component {

  componentDidMount() {
    let connectDragPreview = this.props.connectDragPreview;
    let img = new Image();
    img.src = './dist/assets/images/drag_column_full.png';
    img.onload = function() {
      connectDragPreview(img);
    };
  }

  setScrollLeft(scrollLeft) {
    let node = ReactDOM.findDOMNode(this);
    node.style.webkitTransform = `translate3d(${scrollLeft}px, 0px, 0px)`;
    node.style.transform = `translate3d(${scrollLeft}px, 0px, 0px)`;
  }

  render() {
    const {
      connectDragSource,
      isDragging,
      connectDropTarget,
    } = this.props;

    if (isDragging) {
      return null;
    }

    // width: 0 - move the cloned header to be exactly at where the mouse pointer is
    return connectDragSource(
      connectDropTarget(
        <div style={{ width: 0, cursor: 'move' }}>
            <HeaderCell {...this.props} />
        </div>));
  }
}

DraggableHeaderCell.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  connectDragPreview: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool,
  canDrop: PropTypes.bool
};

// drop source
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview(),
    connectDropTarget: null
  };
}

const headerCellSource = {
  beginDrag(props) {
    return props.column;
  },
  endDrag(props, monitor) {
      if (monitor.didDrop() && typeof monitor.getDropResult().source != "undefined") {
          const source = monitor.getDropResult().source;
          const targetKey = monitor.getDropResult().target;
          return props.handleHeaderDrop(source, targetKey);
      }
      return props.column;
  }
};

// drop target
const target = {
    drop(props, monitor) {
        let source = monitor.getItem().key;
        let targetKey = props.column.key;
        return {
            source: source,
            target: targetKey
        };
    }
};

function targetCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        draggedHeader: monitor.getItem()
    };
}

DraggableHeaderCell = DropTarget(DragItemTypes.Column, target, targetCollect)(DraggableHeaderCell);
DraggableHeaderCell = DragSource(DragItemTypes.Column, headerCellSource, collect)(DraggableHeaderCell);

export default DraggableHeaderCell;
