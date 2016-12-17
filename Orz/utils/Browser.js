var Orz = Orz || {};

Orz.Browser = {
    /* 获取浏览器信息，包括名称和版本 */
    info: function () {
        var ua = navigator.userAgent.toLowerCase();
        var browser = {
            name: null,
            version: null
        }
        var s;
        (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? browser.name = 'ie' :
            (s = ua.match(/msie ([\d.]+)/)) ? browser.name = 'ie' :
                (s = ua.match(/firefox\/([\d.]+)/)) ? browser.name = 'firefox' :
                    (s = ua.match(/chrome\/([\d.]+)/)) ? browser.name = 'chrome' :
                        (s = ua.match(/opera.([\d.]+)/)) ? browser.name = 'opera' :
                            (s = ua.match(/version\/([\d.]+).*safari/)) ? browser.name = 'safari' : 0;
        browser.version = s[1];
        return browser;
    },
    /* 是否为IE */
    isIE: function () {
        return this.info().name === 'ie';
    },
    /* 是否为chrome */
    isChrome: function () {
        return this.info().name === 'chrome';
    },
    /* 是否为opera */
    isOpera: function () {
        return this.info().name === 'opera';
    },
    /* 是否为safari */
    isSafari: function () {
        return this.info().name === 'safari';
    },
    /* 是否为firefox */
    isFirefox: function () {
        return this.info().name === 'firefox';
    },
}