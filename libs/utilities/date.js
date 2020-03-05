import moment from 'moment';

export const getUTCTime = (miliseconds = 0) => {
    return new Date(Date.now() + miliseconds).toISOString();
}

export const dateValidate = (date, day) => {
    let expectedDate = moment(date);

    if (day != null)
        expectedDate.add(day, 'day');

    return new Date().toISOString() < expectedDate.toISOString();
}