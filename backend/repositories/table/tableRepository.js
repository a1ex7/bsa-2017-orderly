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

    getById(id, currentViewId) {
        return this.model.findById(id)
            .populate('records.history.collaborator')
            .populate('records.comments.collaborator')
            .populate('views.view')
            .then((table) => {
                return TableRepository.filterRecords(table, currentViewId);
            });
    }

    getByIds(ids) {
        return this.model.find({'_id': {$in: ids}})
            .populate('records.history.collaborator')
            .populate('records.comments.collaborator')
            .populate('views.view')
            .then((tables) => {
                const firstTableView = tables[0].views[0].view;
                // Check if first view of first table have no filters, otherwise - perform filtering+
                if (!firstTableView.filters.filterSet.length) {
                    return tables;
                }
                const tableWithFilters = TableRepository.filterRecords(tables[0], firstTableView._id);
                return R.prepend(tableWithFilters, R.drop(1, tables));
            });
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
            return Promise.all(removeTableViews).then(() => {
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

    updateRecords(tableId, data, currentView) {
        return this.model.findById(tableId)
            .then((table) => {
                for (let record of table.records) {
                    record.record_data.push({data: data});
                }
                return table.save();
            })
            .then(() => this.getById(tableId, currentView));
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

    addField(tableId, field, currentView) {
        return this.model.findByIdAndUpdate(
            tableId,
            {'$push': {fields: field}},
            {'new': true}
        ).then((table) => {
            const newField = table.fields[table.fields.length - 1];
            let updatedViews = [];
            for (let view of table.views) {
                updatedViews.push(this.getFromView(view.view, view.type).then((v) => {
                    let config = v.fields_config;
                    if (!config) return v;
                    config.push({field: newField._id, size: 155, position: config.length + 1});
                    return v.save();
                }));
            }
            return Promise.all(updatedViews).then(() => {
                return table.save().then(() => this.getById(tableId, currentView));
            });
        });
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

    deleteField(tableId, fieldId, currentView) {
        return this.model.findById(tableId).then((table) => {
            const deleteAt = table.fields.indexOf(table.fields.find((f) => f._id.toString() === fieldId));
            table.fields.splice(deleteAt, 1);
            table.records.forEach((record) => record.record_data.splice(deleteAt, 1));
            let updatedViews = [];
            for (let view of table.views) {
                updatedViews.push(this.getFromView(view.view, view.type).then((v) => {
                    if (!v.fields_config) return v;
                    v.fields_config = v.fields_config.filter((f) => f.field.toString() !== fieldId);
                    return v.save();
                }));
            }
            return Promise.all(updatedViews).then(() => {
                return table.save().then(() => this.getById(tableId, currentView));
            });
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

    pushClonedViewsToTable(viewType, tableId, views) {
        let newViews = []
        for ( let view in views[0]) {
            newViews[view] = {view: views[0][view]._id, type: viewType}
        }
            return this.model.findByIdAndUpdate(
                tableId,
                {$push: { views: {$each: newViews } } },
                {upsert:true}
            ).populate('views.view');
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

    removeFilter(tableId, viewId, viewType, filterId) {
        return this.getFromView(viewId, viewType).then((view) => {
            view.filters.filterSet = view.filters.filterSet.filter((f) => f._id.toString() !== filterId);
            return view.save().then(() => {
                return this.getById(tableId, viewId);
            });
        });
    }

    removeAllFilters(tableId, viewId, viewType) {
        return this.getFromView(viewId, viewType).then((view) => {
            view.filters.filterSet = [];
            return view.save().then(() => {
                return this.getById(tableId, viewId);
            });
        });
    }

    addFilter(tableId, viewId, viewType, fieldId, fieldIndex) {
        return this.getFromView(viewId, viewType).then((view) => {
            view.filters.filterSet.push(
                {
                    fieldId: fieldId,
                    fieldIndex: Number(fieldIndex),
                    condition: 'contains',
                    value: '',
                }
            );
            return view.save().then(() => {
                return this.getById(tableId, viewId);
            });
        });
    }

    updateFilter(tableId, viewId, viewType, fieldId, fieldIndex, filterId, condition, query) {
        return this.getFromView(viewId, viewType).then((view) => {
            let filterToUpdate = view.filters.filterSet.find((f) => f._id.toString() === filterId);
            filterToUpdate.fieldId = fieldId;
            filterToUpdate.fieldIndex = Number(fieldIndex);
            filterToUpdate.value = query || '';
            filterToUpdate.condition = condition;
            return view.save().then(() => {
                return this.getById(tableId, viewId);
            });
        });
    }

    static filterRecords(table, viewId) {
        const view = table.views.find((v) => v.view._id.toString() === viewId.toString());
        if (view.type !== 'grid') return table; // filter only applicable for grid view, for now...
        let filteredRecords;
        for (let filterItem of view.view.filters.filterSet){
            const index = table.fields.findIndex((f) => f._id.toString() === filterItem.fieldId.toString());
            let recordsToFilter = filteredRecords || table.records;
            const lowerQuery = filterItem.value.toLowerCase();
            switch (filterItem.condition) {
            case 'contains':
                if (!lowerQuery.length) continue;
                filteredRecords = recordsToFilter.filter((r) => r.record_data[index].data.toString().toLowerCase().includes(lowerQuery));
                break;
            case '!contains':
                if (!lowerQuery.length) continue;
                filteredRecords = recordsToFilter.filter((r) => !r.record_data[index].data.toString().toLowerCase().includes(lowerQuery));
                break;
            case 'is':
                if (!lowerQuery.length) continue;
                filteredRecords = recordsToFilter.filter((r) => r.record_data[index].data.toString().toLowerCase() === lowerQuery);
                break;
            case '!is':
                if (!lowerQuery.length) continue;
                filteredRecords = recordsToFilter.filter((r) => r.record_data[index].data.toString().toLowerCase() !== lowerQuery);
                break;
            case 'empty':
                filteredRecords = recordsToFilter.filter((r) => !r.record_data[index].data.length);
                break;
            case '!empty':
                filteredRecords = recordsToFilter.filter((r) => r.record_data[index].data.length);
                break;
            }
        }
        const tableWithFilter = Object.assign({}, table.toObject(), {filteredRecords: filteredRecords});
        return tableWithFilter;
    }

}

const typeToSchema = {
    'grid': Grid,
    'form': Form,
    'gallery': Gallery,
    'kanban': Kanban,
};

module.exports = new TableRepository();
