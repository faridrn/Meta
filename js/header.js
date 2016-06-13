var debug = true; // in development stage
var baseAddress = 'http://217.218.67.231/';

var Config = {
    html5mode: true
    , paths: ['home', 'vod', 'live', 'aod']
};
var Global = {
    pageTitle: '30Birds'
    , registerHabdlebarsHelpers: function () {
        Handlebars.registerHelper('toLowerCase', function (str) {
            return str.toLowerCase();
        });
        Handlebars.registerHelper('createId', function (type, title) {
            return Global.addPrefix(type, title);
        });
        Handlebars.registerHelper('route', function (type, title) {
            var path, currentLocation = Location.getCurrent();
            if (currentLocation[0] !== type)
                path = '/' + type + '/' + title.toLowerCase();
            else
                path = '/' + currentLocation.join('/') + '/' + title.toLowerCase();
            return path;
        });
    }
    , getLinkParams: function ($obj) {
        var href, link = ($obj.attr('data-href') !== "undefined") ? $obj.attr('data-href') : $obj.attr('href');
        ;
        if (link.charAt(0) === '/') {
            href = link;
        } else {
            if (Location.get().indexOf(Location.parent) === -1)
                href = Location.parent + '/' + link;
            else
                href = '/' + Location.get() + '/' + Global.trimChar(link, '/');
        }
        return {
            href: href
            , title: link.replace('/', '')
        };
    }
    , t: function (full) {
        if (typeof full !== "undefined" && full === true)
            return (new Date).getTime();
        else
            return ((new Date).getTime()).toString().substr(8);
    }
    , Player: {
        setup: function (type, obj, file, image) {
            switch (type) {
                default:
                case 'video':
                    jwplayer(obj).setup({
//                        abouttext: "30Birds"
//                        , aboutlink: "http://"
                        file: file
                        , image: image
                        , width: '100%'
//                        , height: '100%'
                        , aspectratio: '16:9'
                        , stretching: "uniform"
                        , controls: !0
                        , autostart: true
                        , autostart: true
                    });
                    break;
                case 'live':
                    var html = '<video width="100%" height="auto" poster="' + image + '" autoplay="true"><source src="' + file + '"></video>';
                    $('#' + obj).html(html);
                    $("body").addClass('live-playing');
                    $('video').mediaelementplayer({
                        features: []
                        , enableAutosize: true
                        , alwaysShowControls: false
                    });
                    Global.Player.liveplayerHabdler();
                    $(window).resize(function () {
                        Global.Player.liveplayerHabdler(true);
                    });
                    break;
            }
        }
        , remove: function (obj) {
            if (typeof jwplayer(obj) === "object") {
                $('#player-modal .modal-body').empty().promise().done(function () {
                    $('#player-modal .modal-body').append('<div id="mediaplayer"></div>');
                });
                return;
                jwplayer(obj).stop();
                jwplayer(obj).remove();
            } else {
                $("body").removeClass('live-playing');
                $('#' + obj).empty();
            }
        }
        , liveplayerHabdler: function (immediate) {
            var timeout = (typeof immediate !== "undefined" && immediate === true) ? 1 : 500;
            $(".modal-content").css({'height': '100vh'});
            window.setTimeout(function () {
                var w = $(".modal-content").width();
                var h = $(".modal-content").height();
                var hh = w / 1.77777777777777;
                $("#mediaplayer").css({'height': hh, 'width': '100%', 'position': 'absolute'});
                $(".mejs-container, .mejs-inner, .me-plugin, embed").css({'height': hh, 'width': '100%'});
                var mt = ((hh / 2) * -1);
                console.log(mt, hh);
                $("#mediaplayer").css({'margin-top': mt, 'top': '50%'});
            }, timeout);

        }
    }
    , trimChar: function (string, charToRemove) {
        while (string.charAt(0) === charToRemove)
            string = string.substring(1);
        while (string.charAt(string.length - 1) === charToRemove)
            string = string.substring(0, string.length - 1);
        return string;
    }
    , convertTime: function (timestamp) {
        var d = new Date(timestamp * 1000), // Convert the passed timestamp to milliseconds
                yyyy = d.getFullYear(),
                mm = ('0' + (d.getMonth() + 1)).slice(-2), // Months are zero based. Add leading 0.
                dd = ('0' + d.getDate()).slice(-2), // Add leading 0.
                hh = d.getHours(),
                h = hh,
                min = ('0' + d.getMinutes()).slice(-2), // Add leading 0.
                ampm = 'AM',
                time;
        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }
        // ie: 2013-02-18, 8:35 AM	
        time = yyyy + '-' + mm + '-' + dd + ' ' + h + ':' + min + ' ' + ampm;
        return time;
    }
    , addPrefix: function (type, title) {
        // TODO: for items without mediaType
        var firstChar = (type.toString().charAt(0)).toLowerCase();
        return id = firstChar + title.toString().toLowerCase();
    }
};
var Services = {
    base: baseAddress
    , login: 'http://www.irinn.ir:8080/webservice.asmx/getToken'
    , vodQuery: 'query/getsectionjson/{id}'
    , home: [
        {
            url: baseAddress + 'content/30birds/vod.json'
            , params: {type: 'vod', carousel: true, append: false}
        }
        , {
            url: baseAddress + 'content/30birds/aod.json'
            , params: {type: 'aod', carousel: false, append: true, followLinks: true}
        }
    ]
    , vod: [
        {
            url: baseAddress + 'content/30birds/{pid}.json'
            , params: {type: 'vod', carousel: true, append: false}
        }
    ]
    , aod: [
        {
            url: baseAddress + 'content/30birds/{pid}.json'
            , params: {type: 'aod', carousel: false, append: false, followLinks: true}
        }
    ]
    , live: [
        {
            url: baseAddress + 'content/30birds/live.json'
            , params: {type: 'live', carousel: false, append: false}
        }
    ]
};
var Request = {
    log: function (data) {
        console.log(data);
        return false;
    }
};
var Location = {
    splitter: '/'
    , parts: []
    , parent: ''
    , init: function (again) {
        debug && !again && console.log(Global.t() + ' Location.init()');
        Location.parts = Location.getCurrent();
        debug && console.log(Global.t() + ' Current Location parts: ' + Location.parts);
//        console.log(Location.parts[0]);
//        return;
        Location.parent = Location.parts[0];
        if (!Location.parts.length || Location.parts[0] === "" || ($.inArray(Location.parts[0], Config.paths) < 0)) {
            history.pushState(null, Global.pageTitle, '/home');
            Location.parent = 'home';
            debug && console.log(Global.t() + ' Location.init() again! because location changed suddenly.');
            Location.init(true);
        }
        // init on-render tools
    }
    , getCurrent: function () {
        var fragments = [];
        var f = location.pathname.replace('http://', '').replace('https://', '').replace('www', '').split(Location.splitter);
        for (i = 0; i < f.length; i++)
            if (f[i] !== "")
                fragments.push(f[i]);
        return fragments;
    }
    , get: function (full) {
        return (typeof full !== "undefined" && full === true) ? location.href : Global.trimChar(location.pathname, '/');
    }
    , parse: function (fragments) {
        if (typeof fragments !== "undefined") {
            var parts = fragments.split('/');
            Location.parts = parts;
            debug && console.log(Global.t() + ' Location Parts: ' + parts);
            return parts;
        } else {
            return false;
        }
        return false;
    }
    , goBack: function (back) {
        if (typeof back !== "undefined" && back === true) {
            debug && console.log('Redirecting to: Previous page');
            var redirect = Location.history[Location.history.length - 2];
            window.location.href = ((Config.html5mode === false) ? '#' : '') + redirect;
        }
    }
    , redirect: function (url, forceLegacyMode) {
        debug && console.log('Redirecting to:' + url);
        window.location.href = (((Config.html5mode === false || (typeof forceLegacyMode !== "undefined" && forceLegacyMode === true))) ? '#' : '') + url;
        return true;
    }
    , refresh: function () {
        location.reload();
    }
    , getParentLocation: function (fragments) {
//        $.each(fragments, function(i) {
//            if ($.inArray(this.toString(), Config.paths) >= 0)
//                delete fragments[i];
//        });
        return fragments.join('/');
    }
};
var Cookie = {
    lifetime: 1209600 // exp in minutes
    , title: 'thirtybirdstoken='
    , extend: function (id, username, cname) {
        // Cookie.delete();
        Cookie.set(id, username, cname);
        debug && console.log('Cookies: Session Extended');
        return true;
    }
    , check: function () {
        return Cookie.get(Cookie.title);
    }
    , parse: function (data) {
        if (typeof data !== 'undefined') {
            return data;
        }
        return false;
    }
    , delete: function (cname) {
        if (typeof cname === 'undefined')
            var cname = Cookie.title;
        var expires = 'Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = cname + '' + '; ' + expires + '; path=/';
    }
    , set: function (token, redirect) {
        // validating paramters
        var cname = Cookie.title;
        var data = token;
        var d = new Date();
        d.setTime(d.getTime() + (Cookie.lifetime * 1000));
        var expires = 'expires=' + d.toGMTString();
        document.cookie = cname + data + '; ' + expires + '; path=/';

        if (typeof redirect !== "undefined" && redirect !== "")
            Location.redirect(redirect);

        return data;
    }
    , get: function (name) {
        if (typeof name === 'undefined')
            var name = Cookie.title;
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) === 0)
                return Cookie.parse(c.substring(name.length, c.length));
        }
        return null;
    }
};

// Plugins
$.fn.serializeObject = function () { // serializeArray - serialize form as an array instead of default object
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// Location change
(function (history) {
    var pushState = history.pushState;
    history.pushState = function (state) {
        if (typeof history.onpushstate === "function") {
            history.onpushstate({state: state});
        }
        // ... whatever else you want to do
        // maybe call onhashchange e.handler
        return pushState.apply(history, arguments);
    };
})(window.history);

// Check token
var token = Cookie.check();
//if (typeof token === "undefined" || token === null)
//    if (Location.get() !== '/login.html')
//        Location.redirect('/login.html');
//Location.init();