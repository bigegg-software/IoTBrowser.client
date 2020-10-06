const _ = require('underscore');
const EventEmitter = require('events');
const puppeteer = require('puppeteer-core');

class Browser extends EventEmitter {

    constructor() {
        super();
        this.isLaunched = false;
        this.tabs = [];
        this.currentTab = "init";
    }

    async launch() {
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-fullscreen', '--kiosk', '--noerrdialogs', '--content-shell-hide-toolbar'],
            ignoreDefaultArgs: ['--enable-automation'],
        });
        this.isLaunched = true;
        return this.browser;
    }

    async bringTabToFront(uuid) {
        console.log('setCurrentTabSync called,res:', uuid);
        let tab = _.findWhere(this.tabs, {uuid});
        if (tab) {
            console.log('change tab', tab.uuid, tab.page);
            this.currentTab = uuid;
            await tab.page.bringToFront();
            return tab;
        } else {
            console.log('tab not exists', uuid);
            throw Error('tab not exists');
        }
    }

    async addTab(tab) {
        let newTab = {
            uuid: tab.uuid,
            url: tab.url,
            isLoaded: 0
        };
        if (!_.findWhere(this.tabs, {uuid: newTab.uuid})) {
            newTab.page = await this.browser.newPage();
            newTab.page.goto(newTab.url)
                .then(() => {
                    newTab.isLoaded = true;
                    this.emit('pageLoaded', newTab.uuid);
                })
            this.tabs.push(newTab);
            console.log('tab added', this.tabs);
            return newTab;
        } else {
            throw Error('uuid already exists');
        }
    }

    async deleteTab(uuid) {
        console.log('deleteTabSync called,res:', uuid);
        let result = undefined;
        this.tabs = _.reject(this.tabs, (item) => {
            if (item.uuid == uuid) {
                item.page.close();
                result = item;
                return true;
            } else {
                return false;
            }
        });
        return result;
    }

    getProps() {
        return {
            tabs: _.map(this.tabs, tab => {
                console.log(tab.uuid, tab.url);
                return {uuid: tab.uuid, url: tab.url, isLoaded: tab.isLoaded};
            }),
            currentTab: this.currentTab
        };
    }
}

module.exports = Browser;
