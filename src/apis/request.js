import Crypto from 'woo-crypto';
import { getUTCTime } from 'woo-utilities/date';
import Axios from "axios";
import options from "../../config";

const url = {
    keyInfo: '/woodevice/keyinfo',
    insert: '/woodevice/insert'
}

const post = async (baseURL, url, headers, data) => {
    var instance = Axios.create({
        baseURL: baseURL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json', ...headers }
    });
    var responseJson = await instance.post(url, data);

    return responseJson.data
}

export const getKeyInfo = async (obj) => {
    try {
        var type = 'woodevice.key';
        var token = (Crypto.encrypt(JSON.stringify({ expire: getUTCTime(options.tokenTimeout).toString(), type }), options.publicKey, options.privateKey));
        var result = await post(options.wooIYSUrl, url.keyInfo, {
            public: options.publicKey,
            token
        }, {
            ...obj
        });

        return result.data;
    } catch (error) {
        return null
    }
}

export const insertPurchase = async (obj) => {
    try {
        var type = 'woodevice.insert';
        var token = (Crypto.encrypt(JSON.stringify({ expire: getUTCTime(options.tokenTimeout).toString(), type }), options.publicKey, options.privateKey));
        var result = await post(options.wooIYSUrl, url.insert, {
            public: options.publicKey,
            token
        }, {
            ...obj
        });

        return result.data;
    } catch (error) {
        return null
    }
}