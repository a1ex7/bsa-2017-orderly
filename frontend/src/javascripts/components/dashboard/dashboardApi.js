import R from 'ramda';
const url = 'http://localhost:2020/api/tables';

const getTables = () =>
    fetch(url)
        .then( (responce) => responce.json())
        .catch(R.tap(console.error));

const addTable = (name) =>
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(name),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
        .then((responce) => responce.json())
        .catch(R.tap(console.error));

export {
    getTables,
    addTable
};