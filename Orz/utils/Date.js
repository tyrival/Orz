var Orz = Orz || {};
Orz.Date = {
    parse: function(str) {
        if(Orz.Browser.isIE()) {
            str = str.split('-');
            var date = new Date();
            date.setUTCFullYear(str[0], str[1] - 1, str[2]);
            date.setUTCHours(0, 0, 0, 0);
            return date;
        } else {
            return new Date(str);
        }
    }
}