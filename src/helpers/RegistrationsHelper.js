import { DATA_URL } from "../constants/Urls";
class RegistrationsHelper {
    
    static async getResponseData(url){
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    static async getRegistrations(id){
        return this.getResponseData(DATA_URL + "?eventId=" + id);
    }
}
export default RegistrationsHelper;