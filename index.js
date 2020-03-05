import opts from './config';
import * as wooDeviceRepo from './libs/repositories/woodevice';
import * as request from './libs/request';
import { dateValidate } from './libs/utilities/date';
import * as device from './libs/device';

export const config = async ({
    wooIYSUrl, onChange, publicKey, privateKey, tokenTimeout
}) => {
    opts.wooIYSUrl = wooIYSUrl;
    opts.onChange = onChange;
    opts.publicKey = publicKey;
    opts.privateKey = privateKey;
    opts.tokenTimeout = tokenTimeout;

    postWooDevice();
}

export const insertPurchase = async ({
    keys
}) => {
    let wooDeviceData = await wooDeviceRepo.get();

    let oldValidateKeys = keys.filter(key => {
        let purchase = wooDeviceData.purchase.filter(x => x.key == key).sort((x, y) => x.date > y.date ? -1 : 1)[0];

        return purchase && wooDeviceData.keyInfo[key] && dateValidate(purchase.date, wooDeviceData.keyInfo[key].subscriptionPeriod)
    });

    if (oldValidateKeys.length != keys.length) {
        await getIYSContent({ keys });
        await getKeyInfo({ keys });
    }

    let deviceContentData = await wooDeviceRepo.get();

    if (oldValidateKeys.length != keys.length) {
        var notExistKeys = keys.filter(x => oldValidateKeys.indexOf(x) == -1);
        notExistKeys.forEach(key => {
            deviceContentData.purchase.push({
                key,
                date: new Date().toISOString()
            });
        });

        await wooDeviceRepo.set(deviceContentData)
    }

    if (opts.onChange)
        opts.onChange(deviceContentData)

    if (oldValidateKeys.length != keys.length)
        request.insertPurchase({
            iysContent: deviceContentData.iysContent,
            purchases: deviceContentData.purchase,
            device: deviceContentData.device,
            os: deviceContentData.os
        });
}

export const getIYSContent = async ({ keys }) => {
    let deviceContent = await wooDeviceRepo.get();

    let iysContent = await request.getWooDeviceContent({
        keys,
        device: deviceContent.device,
        os: deviceContent.os
    });

    deviceContent.iysContent = iysContent;
    deviceContent.date = new Date().toISOString();

    await wooDeviceRepo.set(deviceContent);

    if (opts.onChange)
        opts.onChange(deviceContent);

    return deviceContent;
}

const getKeyInfo = async ({ keys }) => {
    let deviceContent = await wooDeviceRepo.get();

    let infoContent = await request.getKeyInfo({
        keys,
        device: deviceContent.device,
        os: deviceContent.os
    });

    deviceContent.keyInfo = infoContent;
    deviceContent.date = new Date().toISOString();

    await wooDeviceRepo.set(deviceContent);

    if (opts.onChange)
        opts.onChange(deviceContent);

    return deviceContent;
}

const postWooDevice = async () => {
    let date = new Date();

    let wooDeviceData = await wooDeviceRepo.get();
    wooDeviceData.device = await device.getDeviceId();
    wooDeviceData.os = device.getDeviceOS();

    let result = await request.insertPurchase({
        device: wooDeviceData.device,
        os: wooDeviceData.os
    });

    if (result)
        wooDeviceData.date = date;

    await wooDeviceRepo.set(wooDeviceData);

    if (opts.onChange)
        opts.onChange(wooDeviceData);
}