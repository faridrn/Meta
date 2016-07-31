function app() {
    this.delegateForms = function () {
        Forms.init();
    };
    var __construct = function (that) {
        that.delegateForms();
    }(this);
}

var token = '';
var Config = {
    title: 'Meta'
    , api: 'http://217.218.67.142:85'
};

var Data = {
    post: function (service, data, action) {
        $.ajax({
            contentType: "application/json"
            , url: service
            , type: 'post'
            , data: JSON.stringify(data)
            , headers: {"Authorization": token}
            , success: function (d) {
                switch (data.Action) {
                    case 'TokensCreate':
                        token = d.Token;
                        Cookie.set(token);
                        break;
                    default:
                        // Do nothing in particlurar
                        break;
                }
                console.log(d);
//                Data.handleAction(action, d);
            }
            , error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status + '/' + JSON.parse(xhr.responseText).ExceptionMessage);
            }
        });
    }
    , handleAction: function (action, data) {
        switch (action) {
            case 'toast':
                alert(data);
                break;
            default:
                location.href = action;
                break;
        }
    }
};

var Forms = {
    init: function () {
        $(document).on('submit', 'form', function (e) {
            var $form = Forms.validate($(this));
            var data = {
                Action: $form.attr('action')
                , Params: $form.serializeObject()
            };
            console.log(data);
            Data.post(Config.api, data, $form.attr('data-next'));
//            var 
//            switch($form.attr('action')) {
//                case 'TokensCreate':
//                    User.login($form);
//                    break;
//            }
            e.preventDefault();
            return false;
        });
    }
    , validate: function ($form) {
        var inputs = $form.find("input, textarea, select");
        $.each(inputs, function () {
            if ($(this).is("[required]")) {
                if (typeof $(this).val() === undefined || $(this).val() === "") {
                    $(this).parent().addClass("has-error");
                }
            }
        });
        return $form;
    }
};

var User = {
    login: function ($form) {
        var data = JSON.stringify($(this).serialize());
        Data.post(Config.api, data, $form.attr('data-next'));
    }
};

var Cookie = {
    lifetime: 600 // exp in seconds
    , title: 'meta_cookie='
    , init: function () {
        var Cookie = this;
    }
    , check: function (cname) {
        if (typeof cname === 'undefined')
            var cname = Cookie.title;
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
    , set: function (data, cname) {
        if (typeof cname === 'undefined')
            var cname = Cookie.title;
        // validating paramters
        var cname = Cookie.title;
        var d = new Date();
        d.setTime(d.getTime() + (Cookie.lifetime * 1000));
        var expires = 'expires=' + d.toGMTString();
        document.cookie = cname + data + '; ' + expires + '; path=/';
        return data;
    }
    , get: function (cname) {
        if (typeof cname === 'undefined')
            var cname = Cookie.title;
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(cname) === 0)
                return Cookie.parse(c.substring(cname.length, c.length));
        }
        return "";
    }
};

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

new app();