import opts from './config';
import * as wooDeviceRepo from './src/repositories/woodevice';
import * as request from './src/apis/request';
import { dateValidate } from 'woo-utilities/date';
import * as device from './src/utilities/device';

var wooDeviceData = null;

export const config = async ({
    wooIYSUrl, onChange, publicKey, privateKey, tokenTimeout
}) => {
    opts.wooIYSUrl = wooIYSUrl;
    opts.onChange = onChange;
    opts.publicKey = publicKey;
    opts.privateKey = privateKey;
    opts.tokenTimeout = tokenTimeout;

    initial();
}

export const insertPurchase = async ({
    keys
}) => {
    keys = keys || [];
    await initVariables();

    let oldValidateKeys = keys.filter(key => {
        let lastPurchase = wooDeviceData.purchase
            .filter(x => x.key == key)
            .sort((x, y) => x.date > y.date ? -1 : 1)[0];

        return lastPurchase
            && wooDeviceData.keyInfo[key]
            && dateValidate(lastPurchase.date, wooDeviceData.keyInfo[key].subscriptionPeriod);
    });

    if (oldValidateKeys.length != keys.length) {
        wooDeviceData.keyInfo = await getKeyInfo();

        var notExistKeys = keys.filter(x => oldValidateKeys.indexOf(x) == -1);
        notExistKeys.forEach(key => {
            wooDeviceData.purchase.push({
                key,
                date: new Date().toISOString()
            });
        });

        var iysContent = await request.insertPurchase({
            purchase: wooDeviceData.purchase,
            device: wooDeviceData.device,
            os: wooDeviceData.os
        });

        if (iysContent) {
            wooDeviceData.date = new Date().toISOString();
            wooDeviceData.iysContent = iysContent;
        }

        await wooDeviceRepo.set(wooDeviceData);

        if (opts.onChange)
            opts.onChange(wooDeviceData.iysContent, wooDeviceData.purchase);
    }
}

export const getDeviceId = async () => {
    if (wooDeviceData == null)
        await initial();

    return wooDeviceData.device;
}

const getKeyInfo = async () => {
    return await request.getKeyInfo({
        os: wooDeviceData.os
    });
}

const initial = async () => {
    await initVariables();
    var changed = false;

    if (!wooDeviceData.device) {
        wooDeviceData.device = await device.getDeviceId();
        changed = true;
    }

    if (!wooDeviceData.os) {
        wooDeviceData.os = device.getDeviceOS();
        changed = true;
    }

    var iysContent = await request.insertPurchase({
        purchase: wooDeviceData.purchase,
        device: wooDeviceData.device,
        os: wooDeviceData.os
    });

    if (iysContent) {
        wooDeviceData.date = new Date().toISOString();
        wooDeviceData.iysContent = iysContent;
        changed = true;
    }

    let filteredPurchases = (wooDeviceData.purchase || []).filter(p => {
        return dateValidate(p.date, wooDeviceData.keyInfo[p.key] && wooDeviceData.keyInfo[p.key].subscriptionPeriod);
    });

    if (filteredPurchases.length != (wooDeviceData.purchase || []).length) {
        wooDeviceData.purchase = filteredPurchases;
        changed = true;
    }

    if (changed)
        wooDeviceRepo.set(wooDeviceData);

    // uygulama ilk açılışta olduğu için burası değişiklik olmasa da çalışacak
    if (opts.onChange)
        opts.onChange(wooDeviceData.iysContent, wooDeviceData.purchase);
}

const initVariables = async () => {
    if (wooDeviceData == null)
        wooDeviceData = await wooDeviceRepo.get();
}

