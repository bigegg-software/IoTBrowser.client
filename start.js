const _ = require('underscore');

const Browser = require('./Browser');

const IoT = require('alibabacloud-iot-device-sdk');

const config = {
    productKey: process.env.IB_PRODUCT_KEY,
    deviceName: process.env.IB_DEVICE_NAME,
    deviceSecret: process.env.IB_DEVICE_SECRET,
}


class IoTBrowser {

    constructor(conf) {
        this.config = conf;
        this.browser = new Browser();
    }

    connect() {
        this.device = IoT.device(this.config);
        this.device.on('connect', this.onConnect.bind(this));
        this.device.on('offline', this.onOffline.bind(this));
        this.device.on('error', this.onError.bind(this));
        this.device.on('close', this.onClose.bind(this));
        this.device.on('reconnect', this.onReconnect.bind(this));

        this.device.onService('addTabSync', this.on_addTabSync.bind(this));
        this.device.onService('setCurrentTabSync', this.on_setCurrentTabSync.bind(this));
        this.device.onService('deleteTabSync', this.on_deleteTabSync.bind(this));
        this.device.onService('readProps', this.on_readProps.bind(this));
    }

    async launch() {
        await this.browser.launch();
    }

    onConnect() {
        console.log('onConnect');
        this.device.subscribe(`/${this.config.productKey}/${this.config.deviceName}/user/get`);
    }

    onOffline() {
        console.log('onoffline');
    }

    onError() {
        console.log('onError');
    }

    onClose() {
        console.log('onClose');
    }

    onReconnect() {
        console.log('onReconnect');
    }

    SUCCESS(reply, data = {}, isAsync = true) {
        reply({data, code: 200}, isAsync ? undefined : 'sync');
        // reply({data, code: 200}, 'sync');
    }

    FAILED(reply, data = {}, isAsync = true) {
        reply({data, code: 500}, isAsync ? undefined : 'sync');
    }

    async on_addTabSync(res, reply) {
        await this.browser.addTab(res.params.tab);
        this.SUCCESS(reply, {"success": true}, false);
    }

    async on_setCurrentTabSync(res, reply) {
        await this.browser.bringTabToFront(res.params.uuid);
        this.SUCCESS(reply, {"success": true}, false);
    }

    async on_deleteTabSync(res, reply) {
        await this.browser.deleteTab(res.params.uuid);
        this.SUCCESS(reply, {"success": true}, false);
    }

    async on_readProps(res, reply) {
        this.SUCCESS(reply, {"success": true}, false);
    }
}

let iot = new IoTBrowser(config);
iot.connect();
iot.launch();
