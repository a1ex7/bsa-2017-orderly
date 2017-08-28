import React, {Component} from 'react';
import FormViewListOfFields from './formViewListOfFields';
import './formViewAvailableFields.scss';

export default class FormAvailableFields extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className='availableFormFieldContainer'>
                <div className='availableFormFieldsAndAllButtons'>
                    <div className='availableFormFieldsHeader'>
                        <div>Fields</div>
                        <div className='add-remove-options'>
                            <div className='add-all'
                                 onClick={() => {
                                     this.props.includeAll(
                                         this.props.currentTable.fields.map((f) => f._id)
                                     );
                                 }}>
                                add all
                            </div>
                            <div className='remove-all'
                                 onClick={() => this.props.excludeAll()}>
                                remove all
                            </div>
                        </div>
                    </div>
                    <FormViewListOfFields fields={this.props.currentTable.fields}
                                          included={this.props.included}
                                          includeField={this.props.includeField}/>
                    <div className='left-side-text'>
                        {`Need another field that is not listed here or in the form? You can `}
                        <span className="link-switchToGridView">switch to a grid view</span>
                        {` and create a new field there, and then come back here to add it to the form.`}
                    </div>
                </div>
            </div>
        );
    }
}