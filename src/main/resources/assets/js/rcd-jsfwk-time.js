function toRcdDateTimeFormat(date) {
    return "" + date.getFullYear() +
           toDoubleDigitFormat(date.getMonth() + 1) +
           toDoubleDigitFormat(date.getDate()) +
           toDoubleDigitFormat(date.getHours()) +
           toDoubleDigitFormat(date.getMinutes()) +
           toDoubleDigitFormat(date.getSeconds());
}

function toDoubleDigitFormat(number) {
    return pad(number, 2, '0');
}

function pad(number, characterCount, paddingCharacter) {
    var result = "" + number;
    while (result.length < characterCount) {
        result = paddingCharacter + result;
    }
    return result;
}