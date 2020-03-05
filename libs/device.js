import { Platform } from "react-native";
import DeviceInfo from 'react-native-device-info';


export const getDeviceId = async () => {
    var deviceId = await DeviceInfo.getUniqueId();
    return deviceId;
}

export const getDeviceOS = () => {
    let os = Platform.OS;
    return os;
}