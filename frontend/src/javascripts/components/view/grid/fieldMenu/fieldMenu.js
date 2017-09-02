import React, {Component} from 'react';
import { Icon, Input, Button } from 'semantic-ui-react';
import Select from 'react-select';
import { fieldIcons, fieldNames, fieldText } from "../../../configuration/fieldTypes";
import { TextType, NumberType } from "./fieldMenuOptions";
import {  SingleSelectType } from "./fieldMenuSingleSelect";
import fieldOptions from './fieldOptions'
import 'react-select/dist/react-select.css';
import './fieldMenu.scss';

let newOption;
export default class FieldMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isActive: false,
            currentName: this.props.name,
            fieldType: '',
            fieldOptionsSS:[],
            currentValue: null
        };
    }
    componentWillReceiveProps(nextProps) {
      this.setState({ 
        fieldOptionsSS: nextProps.currentField.options,
        currentValue: nextProps.currentField.type
    });

  }
    handleClickOnMenu = () => {
        if (this.refs.fieldMenu) {
            if (!this.state.isActive) {
                document.addEventListener('click', this.handleOutsideClick, false);
            } else {
                document.removeEventListener('click', this.handleOutsideClick, false);
            }

            this.setState((menuState) => ({
                isActive: !menuState.isActive,
            }));
        }
    };

    handleOutsideClick = (e) => {
        if (e.target.closest(".field__menu") === null) {
            if (this.node) {
                if (this.node.contains(e.target)) {
                    return;
                }
            }
            this.handleClickOnMenu();
        }
    };

    handleChangeName = (e) => {
        if (this.refs.fieldMenu) {
            this.setState({
                currentName: e.target.value
            })
        }
    };

    handleSumbit = () => {
        if (  this.state.fieldType!=this.props.currentField.type) {
            this.props.changeFieldType(this.props.tableId, this.state.fieldType, this.props.id)
        }
        if (  this.state.currentName!=this.props.currentField.name) {
            this.props.changeFieldName(this.props.tableId, this.props.id, this.state.currentName)
        }
        if (  this.state.fieldOptionsSS !== this.props.currentField.options) {
            this.props.changeFieldOptions(this.props.tableId, this.props.id, this.state.fieldOptionsSS)
        }
        this.handleClickOnMenu();
    }
    handleDeleteField = () => {
        this.props.deleteField(this.props.tableId, this.props.id)
    }
    handleChangeType =(event) => {
        this.setState({ fieldType: event.value, currentValue: event.value})
    }

    handleOptionsSubmit = (event) => {
        event.preventDefault();
        let newArray =[...this.state.fieldOptionsSS]
        newArray.push(newOption);
        this.setState({fieldOptionsSS: newArray});
        this.refs.select.refs.input.value = '';
    }

    handleOptionsChange = (event) => {
      newOption = event.target.value;
    }

    handleOptionsDelete = (optionToBeDeleted) => {
      let optionDel = this.state.fieldOptionsSS.filter((option) =>{
          return option != optionToBeDeleted
      });
      this.setState({fieldOptionsSS: optionDel});
    }

    render() {
         let currentType = fieldOptions.filter((option)=>{
            return option.key == this.props.currentField.type
        })
        let value = currentType[0];
        return(
            <div ref="fieldMenu" className='field__ellipsis'>
                <div ref={(node) => this.node = node } >
                    <div onClick={(e) => this.handleClickOnMenu(e)} >
                        <Icon name="ellipsis vertical" className="field__change-type"/>
                    </div>
                </div>
                <div className ={this.props.showFieldMenu === this.props.fieldId && this.state.isActive ? "field__menu" : "hide"}>
                    <Input className="menu__name"
                           value={this.state.currentName}
                           onChange={this.handleChangeName}
                    />
                    {this.props.index !== 0 &&
                    <Icon name="trash outline"
                        id="menu__delete"
                        size="large"
                        onClick={this.handleDeleteField}/>
                    }
                    <div>
                        <div className="fields-menu-options-container"> 
                            <Select options={fieldOptions}
                                value={this.state.currentValue}
                                placeholder='Choose field type'
                                onChange = {this.handleChangeType}
                            />
                            
                        </div>
                        <div className="explanation-text-wrapper">
                            <div className="explanation-text">{this.state.fieldType!=''?fieldText[this.state.fieldType]:''}</div> 
                        </div>
                        <SingleSelectType
                            fieldOptionsSS={this.state.fieldOptionsSS}
                            handleOptionsSubmit={this.handleOptionsSubmit.bind(this)}
                            handleOptionsChange={this.handleOptionsChange}
                            handleOptionsDelete={this.handleOptionsDelete}
                            type={this.state.fieldType}
                            ref='select'
                            currentField={this.props.currentField}

                        />
                        <div className='button-wrapper' 
                                onClick={this.handleSumbit}
                            >
                            <div className='save-btn'>Save</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
