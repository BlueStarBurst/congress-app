export function setStorage(name: string, value: any) {
    localStorage.setItem(name, JSON.stringify(value));
}

export function getStorage(name: string) {
    var item = localStorage.getItem(name);
    if (item) {
        return JSON.parse(item);
    }
    return null;
}