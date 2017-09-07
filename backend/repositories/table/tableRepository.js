require('../../db/dbConnect');
const Repository = require('../generalRepository');
const Table = require('../../schemas/table/Table');
const Grid = require('../../schemas/view/gridSchema');
const Form = require('../../schemas/view/formSchema');
const Gallery = require('../../schemas/view/gallerySchema');
const Kanban = require('../../schemas/view/kanbanSchema');
const objectId = require('mongoose').Types.ObjectId;
const R = require('ramda');

class TableRepository extends Repository {

    constructor() {
        super();
        this.model = Table;
    }

    getById(id) {
        return this.model.findById(id)
            .populate('records.history.collaborator')
            .populate('records.comments.collaborator')
            .populate('views.view');
    }

    getByIds(ids) {
        return this.model.find({'_id': {$in: ids}})
            .populate('records.history.collaborator')
            .populate('records.comments.collaborator')
            .populate('views.view');
    }

    update(id, body) {
        return this.model.findByIdAndUpdate(id, body, {'new': true})
            .populate('records.history.collaborator')
            .populate('records.comments.collaborator')
            .populate('views.view');
    }

    remove(id) {
        return this.model.findById(id).then((table) => {
            let removeTableViews = [];
            for (let view of table.views) {
                removeTableViews.push(this.getFromView(view.view, view.type).then((v) => v.remove()));
            }
            Promise.all(removeTableViews).then(() => {
                return table.remove();
            });
        });
    }

    getRecords(tableId) {
        return this.model.findById(tableId).select('records');
    }

    getOneRecord(tableId, recordId) {
        return this.model.findOne(
            {_id: tableId},
            {
                records: {
                    $elemMatch: {
                        _id: recordId
                    }
                }
            }).select('-_id -views -fields -name -description');
    }

    addRecord(tableId, record) {
        return this.model.findByIdAndUpdate(
            tableId,
            {'$push': {records: record}},
            {'new': true}
        );
    }

    pullRecord(tableId, recordId) {
        return this.model.findByIdAndUpdate(
            tableId,
            {'$pull': {records: {_id: recordId}}},
            {'new': true}
        );
    }

    updateRecords(tableId, data) {
        return this.model.findById(tableId)
            .then((table) => {
                for (let record of table.records) {
                    record.record_data.push(data);
                }
                return table.save();
            });
    }

    getFields(tableId) {
        return this.model.findById(tableId).select('fields');
    }

    getOneField(tableId, fieldId) {
        return this.model.findOne(
            {_id: tableId},
            {
                fields: {
                    $elemMatch: {
                        _id: fieldId
                    }
                }
            }).select('-_id -views -records -name -description');
    }

    addField(tableId, field) {
        this.model.findById(tableId).populate('views.view').then((t) => {
            console.log(t);
        });
        return this.model.findByIdAndUpdate(
            tableId,
            {'$push': {fields: field}},
            {'new': true}
        );
    }

    updateField(tableId, fieldId, data) {
        return this.model.findById(tableId).then((table) => {
            const fieldIndex = table.fields.findIndex((f) => f._id.toString() === fieldId);
            const field = table.fields[fieldIndex];
            field.type = data.fieldType || field.type;
            field.name = data.fieldName || field.name;
            
            if (data.type === 'CHANGE_FIELD_OPTIONS') {
                switch (data.currentValue) {
                case 'select':
                    field.options.select = data.fieldOption || field.options.select;
                    break;
                case 'number':
                    field.options.number = data.fieldOption || field.options.number;
                    break;
                case 'currency':
                    field.options.currency = data.fieldOption || field.options.currency;
                    break;
                case 'date':
                    field.options.date = data.fieldOption || field.options.date;
                    break;
                case 'percent':
                    field.options.percent = data.fieldOption || field.options.percent;
                    break;
                case 'multiple':
                    field.options.multiple = data.fieldOption || field.options.multiple;
                    break;
                }
            }
            
            if (data.fieldType) {
                table.records.forEach((record) => (record.record_data[fieldIndex].data = ''));
            }
            return table.save();
        });
    }

    updateFields(tableId, data) {
        return this.model.findById(tableId)
            .then((table) => {
                table.records.push({record_data: new Array(table.fields.length).fill(data)});
                return table.save();
            });
    }

    deleteField(tableId, fieldId) {
        return this.model.findById(tableId).then((table) => {
            const deleteAt = table.fields.indexOf(table.fields.find((f) => f._id.toString() === fieldId));
            table.fields.splice(deleteAt, 1);
            table.records.forEach((record) => {
                record.record_data.splice(deleteAt, 1);
            });
            return table.save();
        });
    }

    deleteAllFields(tableId) {
        return this.model.update(
            {_id: objectId(tableId)},
            {'$pull': {fields: {}}});
    }

    getViews(tableId) {
        return this.model.findById(tableId).select('views');
    }

    getView(tableId, viewId) {
        return this.model.findById(tableId, {views: viewId});
    }

    getFromView(viewId, viewType){
        const viewModel = typeToSchema[viewType];
        return viewModel.findById(objectId(viewId));
    }

    addView(tableId, viewId, viewType) {
        return this.getFromView(viewId, viewType).then((view) => {
            switch (viewType) {
            case 'grid':
            case 'form':
            case 'kanban':
                this.getFields(tableId).then((fields) => {
                    fields.fields.map((f, ind) => {
                        switch (viewType) {
                        case 'grid':
                            view.fields_config.push({field: f._id, size: 155, position: ind + 1});
                            break;
                        case 'form':
                            view.fields_config.push({field: f._id, position: ind + 1, included: false});
                            break;
                        case 'kanban':
                            console.log('IN KANBAN CASE');
                            view.fields_config.push({field: f._id});
                            break;
                        }
                    });
                    view.save();
                });
                break;
            }
        }).then(() => {
            return this.model.findByIdAndUpdate(
                tableId,
                {'$push': {views: {view: viewId, type: viewType}}},
                {'new': true}
            ).populate('views.view');
        });
    }

    addClonedViewsToTable(viewType, tableId, views) {
        let newViews = []
        for ( let view in views[0]) {
            newViews[view] = {view: views[0][view]._id, type: viewType}
            
            return this.model.findByIdAndUpdate(
                tableId,
                {'$push': {views: newViews}},
                {'new': true}
            ).populate('views.view');
        }
    }

    updateRecordById(tableId, record_dataId, fileName, isDelete) {
        return this.model.findById(tableId)
			.then(table => R.map( record => {
				record.record_data = R.map(data => {
					if (data._id == record_dataId) {
						if (!data._id) return {_id: data._id, data: fileName}
						if (isDelete) {
							return {_id: data._id, data: fileName}
						} else {
							let dataArray = data.data.split(',')
							dataArray.push(fileName)
							return {_id: data._id, data: dataArray.join(',')}
						}
					}
					else return data
				})(record.record_data)
				return record
				})(table.records)
            )
			.then(newRecords => this.model.findByIdAndUpdate(tableId, {records: newRecords}, {'new': true}).populate('views.view'))
    }

    deleteView(tableId, viewId, viewType) {
        return this.getFromView(viewId, viewType).then((view) => {
            return view.remove().then(() => {
                return this.model.findByIdAndUpdate(
                    tableId,
                    {'$pull': {views: {view: viewId}}},
                    {'new': true}
                )
                    .populate('records.history.collaborator')
                    .populate('records.comments.collaborator')
                    .populate('views.view');
            });
        });
    }

    filterRecords(tableId, fieldId, condition, query) {
        return this.model.findById(tableId).then((table) => {
            const index = table.fields.findIndex((f) => f._id.toString() === fieldId);
            table.records = table.records.filter((r) => r.record_data[index].data.includes(query));
            return table;
        });
    }
}

const typeToSchema = {
    'grid': Grid,
    'form': Form,
    'gallery': Gallery,
    'kanban': Kanban,
};

module.exports = new TableRepository();
