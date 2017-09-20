import React from 'react';
import { Modal, Header, Icon, Accordion } from 'semantic-ui-react';
import CommentsForm from './components/comments/commentsForm';
import './recordDialog.scss';
import TextLine from '../grid/fields/textLine/textLine';
import LongText from '../grid/fields/longText/longText';
import CurrencyField from '../grid/fields/currency/currency';
import Number from '../grid/fields/number/number';
import AutoNumber from '../grid/fields/autoNumber/autoNumber';
import Url from '../grid/fields/url/url';
import DateField from '../grid/fields/date/date';
import SingleSelect from '../grid/fields/singleSelect/singleSelect';
import Email from '../grid/fields/email/email';
import Percent from '../grid/fields/percent/percent';
import Phone from '../grid/fields/phone/phone';
import Attachment from '../grid/fields/attachment/attachment';
import MultipleSelect from '../grid/fields/multiple/multiple';
import CheckboxItem from '../grid/fields/checkbox/checkbox';
import HistoryList from './components/history/historyList';
import CommentsBlock from './components/comments/commentsBlock';
import {fieldIcons, fieldNames} from "../../configuration/fieldTypes";

export const Recordtem = ({id, type, data, tableId, recordData, uploadAttachment, deleteFile, currentField, recordIdx}) => {
    const fieldPayload = {
        id: id,
        value: data,
        tableId: tableId,
        currentField: currentField,
        uploadAttachment: uploadAttachment,
        deleteFile: deleteFile,
        selected: false,
        active: true,
        onActivate: () => {},
        onKeyPress: recordData.keyPressSimpleRecordHandler,
        onBlurField: recordData.blurRecordHandler,
        onBlurComponent: recordData.blurRecordComponentHandler,
        onChangeCheckbox: recordData.changeCheckboxHandler,
        autoFocus: false,
	    recordIdx: recordIdx,
        onMouseDownRecordItem: () => {},
        onMouseOverRecordItem: () => {}
    };
    let record = null;
    switch (type) {
        case 'longtext':
            const fieldPayloadLongtext = {...fieldPayload, ...{onKeyPress: recordData.keyPressRecordHandler} };
            record = <LongText {...fieldPayloadLongtext}/>;
            break;
        case 'number':
            record = <Number {...fieldPayload}/>;
            break;
        case 'select':
            record = <SingleSelect {...fieldPayload}/>;
            break;
        case 'currency':
            record = <CurrencyField {...fieldPayload}/>;
            break;
        case 'autonumber':
            record = <AutoNumber {...fieldPayload} recordIdx={recordIdx}/>;
            break;
        case 'url':
            record = <Url {...fieldPayload}/>;
            break;
        case 'date':
            record = <DateField {...fieldPayload}/>;
            break;
        case 'email':
            record = <Email {...fieldPayload}/>;
            break;
        case 'phone':
            record = <Phone {...fieldPayload}/>;
            break;
        case 'percent':
            record = <Percent {...fieldPayload}/>;
            break;
        case 'attachment':
            record = <Attachment {...fieldPayload}/>;
            break;
        case 'multiple':
            record = <MultipleSelect {...fieldPayload}/>;
            break;
        case 'checkbox':
            const fieldPayloadCheckbox = {...fieldPayload };
            record = <CheckboxItem {...fieldPayloadCheckbox}/>;
            break;
        default:
            record = <TextLine {...fieldPayload}/>;
    }

    return (
        <div className="field__item">
            {record}
        </div>
    );
};

const RecordDialog = ({record, fields, recordData, onOpenRecordDialog, onKeyPressComment, user, tableId,
                       uploadAttachment, deleteFile, recordIdx}) => {
    const panels = [
        {
            key: 'panel-history',
            title: <Header><Icon name="history" className="history-icon"/> History</Header>,
            content: <HistoryList record={record} fields={fields} />
        },
        {
            key: 'panel-comments',
            title: <Header><Icon name="commenting outline" className="comments-icon"/> Comments</Header>,
            content: <CommentsBlock record={record}/>
        }
    ];

    return (
        <Modal
            open={true}
            onClose={(event) => onOpenRecordDialog('')}
            className="recordDialog-modal"
            >
            <Modal.Header className="record-details">
                Record details
                <Icon
                    name='close'
                    className="closeRecordDialogBtn"
                    onClick={(event) => onOpenRecordDialog('')}
                />
            </Modal.Header>
            <Modal.Content image className="modal-content">
                <Modal.Description className="modal-fields-block content scrolling">
                    {record.record_data.map((recordItem, fieldIndex) => {
                        return (
                            <div key={recordItem._id} className="modal-field-item">
                                <div className="modal-field-name">
                                    <Icon name={fieldIcons[ fields[fieldIndex].type ]} className="field__icon"/>
                                    {fields[fieldIndex].name}
                                </div>
                                <div className={fields[fieldIndex].type=='multiple'||fields[fieldIndex].type=='select'? 'expand-record-item':''}>
                                <Recordtem id={recordItem._id} type={fields[fieldIndex].type}
                                        data={recordItem.data} recordData={recordData}
                                        uploadAttachment={uploadAttachment} deleteFile={deleteFile}
                                        currentField={fields[fieldIndex]} recordIdx={recordIdx}
                                        tableId={tableId}
                                />
                                </div>
                            </div>
                        )
                    })}
                </Modal.Description>
                <Modal.Description className="modal-sidebar-block">
                    <Accordion panels={panels} exclusive={false} fluid />
                    <CommentsForm record={record}
                                  user={user}
                                  tableId={tableId}
                                  onKeyPressComment={onKeyPressComment}/>
                </Modal.Description>
            </Modal.Content>
        </Modal>
    );
};

export default RecordDialog;
/*
user={user}
                                    tableId={tableId}
                                    onKeyPressComment={onKeyPressComment}
 */