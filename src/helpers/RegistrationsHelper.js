class RegistrationsHelper {
    static dataUrl = 'https://crashtest.by/data.php';
    static formUrl = 'https://crashtest.by/form.php';

    static async getResponseData(url){
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    static async getRegistrations(id){
        return this.getResponseData(this.dataUrl + "?eventId=" + id);
    }
}
export default RegistrationsHelper;