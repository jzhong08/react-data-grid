import 'react-select/dist/react-select.css';
import React, {PropTypes} from 'react';
import Select from 'react-select';
import { utils, shapes } from 'react-data-grid';

const { isEmptyArray } = utils;
const { ExcelColumn } = shapes;

class AutoCompleteFilter extends React.Component {
  constructor(props) {
    super(props);
    this.getOptions = this.getOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.filterValues = this.filterValues.bind(this);
    //this.state = { options: this.getOptions(), rawValue: '', placeholder: 'Select...' };
    this.placeholder = React.createElement('div', { style: { textAlign: 'left', fontStyle: 'italic' } }, 'Select...');
    this.state = { options: this.getOptions(), rawValue: '', placeholder: this.placeholder };
  }

  componentWillReceiveProps(newProps) {
    this.setState({options: this.getOptions(newProps)});
  }

  getOptions(newProps) {
    let props = newProps || this.props;
    let options = props.getValidFilterValues(props.column.key);
    options = options.map(o => {
      if (typeof o === 'string') {
        return { value: o, label: o, style: { textAlign: 'left' } };
      }
      return o;
    });
    return options;
  }

  columnValueContainsSearchTerms(columnValue, filterTermValue) {
    if (columnValue !== undefined && filterTermValue !== undefined) {
      let strColumnValue = columnValue.toString();
      let strFilterTermValue = filterTermValue.toString();
      let checkValueIndex = strColumnValue.trim().toLowerCase().indexOf(strFilterTermValue.trim().toLowerCase());
      return checkValueIndex !== -1 && (checkValueIndex !== 0 || strColumnValue === strFilterTermValue);
    }
    return false;
  }

  filterValues(row, columnFilter, columnKey) {
    let include = true;
    if (columnFilter === null) {
      include = false;
    } else if (columnFilter.filterTerm && !isEmptyArray(columnFilter.filterTerm)) {
      if (columnFilter.filterTerm.length) {
        include = columnFilter.filterTerm.some(filterTerm => {
          return this.columnValueContainsSearchTerms(row[columnKey], filterTerm.value) === true;
        });
      } else {
        include = this.columnValueContainsSearchTerms(row[columnKey], columnFilter.filterTerm.value);
      }
    }
    return include;
  }

  handleChange(value) {
    let filters = value;
    this.setState({filters});
    this.props.onChange({filterTerm: filters, column: this.props.column, rawValue: value, filterValues: this.filterValues });
  }

  render() {
    return (
      <Select
        autosize={false}
        name={`filter-${this.props.column.key}`}
        options={this.state.options}
        placeholder={this.state.placeholder}
        onChange={this.handleChange}
        escapeClearsValue={true}
        multi={this.props.multiSelection !== undefined && this.props.multiSelection !== null ? this.props.multiSelection : true}
        value={this.state.filters} />
    );
  }
}

AutoCompleteFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  column: React.PropTypes.shape(ExcelColumn),
  getValidFilterValues: PropTypes.func,
  multiSelection: PropTypes.bool
};

export default AutoCompleteFilter;
