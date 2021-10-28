var addToDoButton = document.getElementById('addToDo');
var toDoContainer = document.getElementById('toDoContainer');
var inputField = document.getElementById('inputField');

function getList() {
    var list = JSON.parse(localStorage.getItem("list"));
    if (list == null) {
        list = {};
        setList({});
    }
    return list;
}

function setList(list) {
    list = JSON.stringify(list);
    localStorage.setItem("list", list);
}

function addItem(item) {
    var list = getList();
    var maxListSize = 3000;
    var id = Math.floor(Math.random() * maxListSize);
    while (list[id] != undefined) {
        console.log("same")
        id = Math.floor(Math.random() * maxListSize);
    }
    list[id] = item;
    setList(list);
    return id;
}

function removeItem(id) {
    var list = getList();
    delete list[id]
    setList(list);
    // comment
}

addToDoButton.addEventListener('click', function(){
    var id = addItem(inputField.value);
    var paragraph = document.createElement('p');
    paragraph.classList.add('paragraph-styling');
    paragraph.innerText = inputField.value;
    paragraph.id = id;
    toDoContainer.appendChild(paragraph);
    inputField.value = " ";
    paragraph.addEventListener('click', function(){
        paragraph.style.textDecoration = "line-through";
    })
    paragraph.addEventListener('dblclick', function(){
        removeItem(paragraph.id);
        toDoContainer.removeChild(paragraph);

    })
})

var list = getList();
var keys = Object.keys(list);
keys.forEach(key => {
    var paragraph = document.createElement('p');
    paragraph.classList.add('paragraph-styling');
    paragraph.innerText = list[key];
    paragraph.id = key;
    toDoContainer.appendChild(paragraph);
    inputField.value = " ";
    paragraph.addEventListener('click', function(){
        paragraph.style.textDecoration = "line-through";
    })
    paragraph.addEventListener('dblclick', function(){
        removeItem(paragraph.id);
        toDoContainer.removeChild(paragraph);

    })
});