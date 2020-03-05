import wooDeviceModel from './models/woodevice';

var defaultDeviceData = {
    iysContent: {},
    os: '',
    device: '',
    createdDate: new Date().toISOString(),
    date: '',
    purchase: [],
    keyInfo: {}
};

export const get = async () => {
    let result = defaultDeviceData;
    let list = await wooDeviceModel.list();

    if (list.length) {
        result = list[0];
    }

    return result;
}

export const set = async (obj) => {
    let deviceData = await get();

    if (obj)
        Object.keys(obj).forEach(key => { deviceData[key] = obj[key]; });

    await wooDeviceModel.upsert(deviceData);
}