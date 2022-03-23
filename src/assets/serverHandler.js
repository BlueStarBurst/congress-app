export function httpPostAsync(theUrl, data, callback = console.log, error = console.log, unAuth = console.log) {
    var xmlHttp = new XMLHttpRequest();

    // xmlHttp.open("POST", 'http://localhost:9736' + theUrl, true); // true for asynchronous 
    xmlHttp.open("POST", 'https://blue-scheduler.herokuapp.com' + theUrl, true); // true for asynchronous 
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlHttp.setRequestHeader('Authorization', localStorage.getItem("session"));

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            callback(xmlHttp.responseText);
        }
        else if (xmlHttp.status === 401 && unAuth) {
            unAuth(xmlHttp.status)
        }
        else if (xmlHttp.status !== 200) {
            // console.log(xmlHttp.readyState);
            // console.log(xmlHttp.status);
            error(xmlHttp.status)
        }
    }

    xmlHttp.send(data);
}

export function httpGetAsync(theUrl, data, callback = console.log) {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.setRequestHeader('Authorization', 'stuff');
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }

    xmlHttp.send(data);
}