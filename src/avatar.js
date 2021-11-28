import request from 'request';

/**
 * ThisPersonDoesNotExist Class
 *
 * @class ThisPersonDoesNotExist
 * @extends {EventEmitter}
 */
export class ThisPersonDoesNotExist {

    /**
     * Get the image in base64
     *
     * @param {string} body buffer
     * @param {string} mimType type
     * @param {number} width default 128
     * @param {number} height default 128
     * @returns {string} resizedBase64
     * @memberof ThisPersonDoesNotExist
     */
    async getBase64(body, mimType, width, height, callback) {


        let resizedBase64;
        var reader  = new FileReader();
        reader.onloadend = function () {

            callback(reader.result);

        }
        reader.readAsDataURL(body);
        return resizedBase64;
    }

    /**
     * Get the image remotely
     *
     * @returns {Object}
     * @memberof ThisPersonDoesNotExist
     */
    async getRemoteImage() {
        return new Promise((resolve, reject) => {
            request.get({
                url: 'https://shielded-retreat-73034.herokuapp.com/https://thispersondoesnotexist.com/image',
                encoding: null
            }, (error, response, body) => {
                if (error) return reject(error);
                try {
                    if (response.statusCode == 200) {
                        let img = new Blob([body], {type : 'image/jpeg'});
                        let mimType = response.headers["content-type"];
                        resolve({
                            img,
                            mimType
                        });
                    } else {
                        throw error;
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    /**
     * Obtain a image
     *
     * @param {Object} options {
     *         width,
     *         height,
     *         type,
     *         path
     *     }
     * @returns {Object}
     * @memberof ThisPersonDoesNotExist
     */
    async getImage({
        width = 128,
        height = 128,
        type = 'base64',
        path = '.', 
        callback = () => {}
    }) {

        try {

            let {
                img,
                mimType
            } = await this.getRemoteImage();

            if (img && mimType) {

                let response;

                switch (type) {
                    case 'base64':
                        response = await this.getBase64(img, mimType, width, height, callback);
                        break;

                    case 'file':
                        response = await this.getImagePath(img, path, width, height);
                        break;

                    default:
                        break;
                }

                return {
                    status: true,
                    data: response
                };
            } else {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Generate random name
     *
     * @param {*} length
     * @returns {string} text
     * @memberof ThisPersonDoesNotExist
     */
    getId(length) {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

}