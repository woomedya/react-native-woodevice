import judel from 'judel';
import AsyncStorage from '@react-native-community/async-storage';

var adaptor = judel.adaptor.AsyncStorage(AsyncStorage);

export default new judel.Repo({
    adaptor
});