import fs from 'fs';

export default class Data {

    data = {}

    constructor() {
        this.readData();
    }

    setDataItems(user, data) {
        if (!this.data[user]) { this.data[user] = { items: [], themes: [] } }
        this.data[user].items = data;
        console.log(this.data);
        this.saveData()
    }

    getData(user) {
        if (!this.data[user]) { this.data[user] = { items: [], themes: [] } }
        return JSON.stringify(this.data[user]);
    }

    setDataThemes(user, data) {
        if (!this.data[user]) { this.data[user] = { items: [], themes: [] } }
        this.data[user].themes = data;
        console.log(this.data);
        this.saveData()
    }

    saveData() {
        var jsonS = JSON.stringify(this.data);
        fs.writeFileSync('secure/data.json', jsonS, (err) => {
            if (err) throw err;
            console.log('The data has been saved!');
        });
    }

    readData() {
        fs.readFile('secure/data.json', 'utf8', (err, data) => {
            if (data != "") {
                this.data = JSON.parse(data) || {};
            }
        });
    }

}