import R from 'ramda';
const url = 'http://localhost:2020/api';

const getBase = (_id) =>
    fetch(url + '/base/' + _id)
        .then((response) => response.json())
        .catch(R.tap(console.error));

const getTables = () =>
    fetch(url + '/tables')
        .then((response) => response.json())
        .catch(R.tap(console.error));

// const getTableById = (_id) =>
//     fetch(url + '/tables/' + _id)
//         .then((response) => response.json())
//         .catch(R.tap(console.error));

const getTablesByIds = (ids) => {
    fetch(url + '/tables/ids/' + ids.join(':'))
        .then( (response) => response.json())
	    .then( data => {
	    	console.log(data, 'inside feeeeeeetch')
	    })
        .catch(R.tap(console.error));
};

const addTable = (name) =>
    fetch(url + '/tables', {
        method: 'POST',
        body: JSON.stringify(name),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
        .then((response) => response.json())
        .catch(R.tap(console.error));

export {
    getBase,
    getTables,
    // getTableById,
    getTablesByIds,
    addTable
};