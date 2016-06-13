var App = {
    firstInit: false
    , start: function (title) {
        debug && console.log(Global.t() + ' App Started');
        Location.init();
        new Data(new HandleLocation(Location.parts).path);
        document.title = (typeof title === "undefined") ? Global.pageTitle : Global.pageTitle + ' - ' + title; // Set title
        if (App.firstInit === false) {
            debug && console.log(Global.t() + ' App::NOT first init');
            App.firstInit = true;
            App.addListeners();
        } else
            debug && console.log(Global.t() + ' App::first init');
        Global.registerHabdlebarsHelpers();
    }
    , navigate: function (params) {
        history.pushState(null, params.title, params.href);
        Location.init();
        App.start(params.title);
    }
    , addListeners: function () {
        window.onpopstate = history.onpushstate = function (e) {
            if (e.type === 'popstate')
                App.start();
        };

        /* Resoinsive Utilities */
        responsive_resize();
        $(window).resize(function () { /* Change width value on user resize, after DOM */
            responsive_resize();
        });
        return null;
    }
};
function HandleLocation(parts) {
    "use strict";
    this.parts = parts;
    this.path;

    this.getPath = function (parts) {
        debug && console.log(Global.t() + ' Get params from url');
        var last = parts.pop();
        if ($.inArray(last, Config.paths) >= 0)
            return [last, 0];
        return [parts[0], last];
    };

    var __construct = function (that) {
        that.path = that.getPath(that.parts);
        debug && console.log(Global.t() + ' HandleLocation::construct()', that.path);
    }(this);
}

function Data(path) {
    this.path = path;
    this.params;
    this.args;
    this.getParams = function (path) {
        args = {type: path[0], id: path[1]};
        debug && console.log(Global.t() + ' Create Data parameters object to load parent data:', args);
        args.id = (typeof args.id === "undefined" || args.id === "") ? 0 : args.id;
        if ($.inArray(args.type, Config.paths) < 0)
            return;
        
        var parentLocation = Location.getParentLocation(Location.getCurrent());
        var params = {
            parentId: args.id
            , type: Location.parent
            , template: (Location.parent === "live") ? $("#liveitems-template").html() : $("#items-template").html()
            , childrenTemplate: $("#children-template").html()
            , data: null
            , container: $("#panels")
            , sources: [
                {
                    url: Services[args.type][0].url.replace(/{pid}/gi, parentLocation)
                    , params: Services[args.type][0].params
                }
            ]
        };
        if (Services[args.type].length > 0) {
            for (i = 1; i < Services[args.type].length; i++) {
                params.sources.push({
                    url: Services[args.type][i].url.replace(/{pid}/gi, parentLocation)
                        , params: Services[args.type][i].params
                });
            }
        }
        return params;
    };
    this.handle = function (data, params) {
        $.each(data, function () {
            this.PubDate = (typeof this.PubDate !== "undefined") ? Global.convertTime(this.PubDate) : null;
            if (typeof params !== "undefined")
                this.params = params;
//            console.warn(params);
//            if (typeof params.type !== "undefined")
//                this.params.type = 'aod'; // TODO
        });
        return data;
    }
    this.loadParent = function (params, index) {
        debug && console.log(Global.t() + ' Data -> Load parents data');
        var o = this;
        
        index = (typeof index !== "undefined") ? index : 0;
        var append = (typeof params.sources[index].params.append !== "undefined") ? params.sources[index].params.append : false;
        $.ajax({
            url: params.sources[index].url
            , dataType: "json"
            , success: function (d) {
                params.data = d;
                var templateHtml = o.compileTemplate(params.template, d, params.sources[index].params);
                if (append === true) {
                    params.container.append(templateHtml);
                    // TODO: sometimes its not working, needs investigation
                } else
                    params.container.html(templateHtml);
                params.container.promise().done(function () {
                    o.loadChildren(params, d, index);
                });
            }
        });
//        return params;
    };
    this.loadChildren = function (params, data, index) {
        debug && console.log(Global.t() + ' Data -> Load children & append:', params.sources[index].params.append, ' & carousel:', params.sources[index].params.carousel);
        var o = this;
        $.each(data, function () {
            var url = this.Url;
            var uid = this.SiteItemID
            $.ajax({
                url: url
                , dataType: "json"
                , success: function (d) {
                    var id = Global.addPrefix(params.sources[index].params.type, uid);
                    var templateHtml = o.compileTemplate(params.childrenTemplate, d, params.sources[index].params, id);
                    $("ul#items-" + id).html(templateHtml).promise().done(function () {
                        if (params.sources[index].params.carousel === true)
                            createCarousel($("ul#items-" + id));
                    });
                }
            });
        });

        return params;
    };
    this.compileTemplate = function (tmpl, data, params, uid) {
        data = this.handle(data, params);
        debug && console.log(Global.t() + ' Data -> Compiling template:', (typeof uid === "undefined" ? 'parent' : 'children: ' + uid));
        var template = Handlebars.compile(tmpl);
        var html = template(data);
        return html;
    };
    this.updateBreadcrumbs = function () {
        debug && console.log(Global.t() + ' Update Breadcrumbs');
        var urlParts = Location.get().split('/');
        $("#breadcrumbs ol").empty();
        if (urlParts.length > 3) {
            for (var i = 0; i < urlParts.length; i++) {
                urlParts.pop();
                link = '<li><a class="page" href="' + urlParts.join('/') + '">' + urlParts[urlParts.length - 1].split('-')[1] + '</a></li>';
                $("#breadcrumbs ol").prepend(link);
            }
        }
    };

    var __construct = function (that) {
        debug && console.log(Global.t() + ' Data::construct()');
        that.params = that.getParams(path);
        $.each(that.params.sources, function(i) {
            that.loadParent(that.params, i);
        });
        that.updateBreadcrumbs();
    }(this);
}

$(function () {
    App.start();

    $(document).on('click', "a.page", function (e) {
        var o = Global.getLinkParams($(this));
        App.navigate(o);
        e.preventDefault();
    });

    $(document).on('click', "a.play, li[data-type=live]", function (e) {
        var $this = $(this);
        $("#player-modal").modal();
        var playerType = $(this).attr('data-type');
        var videoSource = '';
        if ($this.prop("tagName") === "LI")
            videoSource = $this.attr('data-media');
        else
            videoSource = $this.attr('href');
        switch (playerType) {
            default:
            case 'video':
                Global.Player.setup('video', 'mediaplayer', videoSource, $(this).attr('data-image'));
                break;
            case 'live':
                Global.Player.setup('live', 'mediaplayer', videoSource, $(this).attr('data-image'));
                break;
        }

        e.preventDefault();
    });

    $(document).on('click', "[data-toggle]", function (e) {
        var target = $(this).attr('data-target');
        if (target.indexOf('$this') !== -1) {
            target = target.replace("$this ", "");
            var $target = $(target).parents(".panel:first").find(target);
        } else
            var $target = $(target);

        switch ($(this).attr('data-toggle')) {
            case 'class':
                $target.toggleClass($(this).attr('data-value'));
                break;
            case 'toggle':
                if ($target.is(':hidden'))
                    $target.show().addClass('active');
                else
                    $target.hide().removeClass('active');
                break;
            case 'slide':
                if ($target.is(':hidden'))
                    $target.slideDown().addClass('active');
                else
                    $target.slideUp().removeClass('active');
                break;
            case 'fade':
                if ($target.is(':hidden'))
                    $target.fadeIn().addClass('active');
                else
                    $target.fadeOut().removeClass('active');
                break;
        }
        e.preventDefault();
    });

    $(document).on('submit', ".login-form", function (e) {
        var data = $(this).serializeObject();
        $.ajax({
            url: Services.login
            , type: 'GET'
            , dataType: 'jsonp'
            , data: data
            , success: function (data) {
                if (typeof data[0].token !== "undefined" && data[0].token !== "")
                    Cookie.set(data[0].token, '/');
            }
        });
        e.preventDefault();
    });

    $(document).on('click', ".carousel .item", function (e) {
        var $item = $(this);
        if ($item.prop("tagName") === "LI")
            var $li = $(this);
        else
            var $li = $(this).find("li:first");
        var $info = $item.parents(".panel").find(".item-info");
        if ($item.hasClass('preview')) {
            $info.slideUp(function () {
                // empty info
                $item.removeClass('preview');
            });
            return;
        }
        $item.parent().find(".item").removeClass("preview");
        $item.addClass('preview');
        var id = $(this).find("li[data-id]").attr('data-id');

        if (typeof $li.attr('data-dir') !== "undefined")
            if ($li.attr('data-dir') === "rtl")
                $info.addClass('rtl');
            else
                $info.removeClass('rtl');
        $info.find('.poster img').attr('src', $li.attr('data-image'));
        $info.find('a.play').attr('href', $li.attr('data-media')).attr('data-image', $li.attr('data-image'));
        $info.find('.details h3 a').text($li.find("h3").text());
        $info.find('.details p').text($li.attr('data-summary'));
        $info.find('.meta .date').text($li.find('.date').text());

        if (!$info.is(":visible"))
            $info.slideDown();
    });

    $(document).on('click', ".search button[role=close]", function (e) {
        $(".search").fadeOut();
        e.preventDefault();
    });
    
    $(document).on('click', "li[data-href]", function (e) {
        var o = Global.getLinkParams($(this));
        App.navigate(o)
        e.preventDefault();
    });

    $(document).scroll(function () {
        var offset = $(window).scrollTop();
        if (offset > 70)
            $("#header").addClass("opaque");
        else
            $("#header").removeClass("opaque");
    });

    $('#player-modal').on('hidden.bs.modal', function (e) {
        Global.Player.remove('mediaplayer');
    });

});
function responsive_resize() {
    var current_width = $(window).width();
    if (current_width < 768) {
        $('body').addClass("_xs").removeClass("_sm _md _lg");
    } else if (current_width > 767 && current_width < 992) {
        $('body').addClass("_sm").removeClass("_xs _md _lg");
    } else if (current_width > 991 && current_width < 1200) {
        $('body').addClass("_md").removeClass("_xs _sm _lg");
    } else if (current_width > 1199) {
        $('body').addClass("_lg").removeClass("_xs _sm _md");
    }
}

function createCarousel($carousel) {
    if (!$carousel.length)
        return false;

    $carousel.owlCarousel({
        responsive: {
            1199: {items: 5}
            , 996: {items: 4}
            , 768: {items: 3}
            , 0: {items: 2}
        }
        , items: 5
        , nav: true
        , navContainerClass: 'pagers'
        , navClass: ['prev', 'next']
        , navText: ['', '']
        , loop: true
        , themeClass: 'carousel-theme'
        , baseClass: 'carousel'
        , itemClass: 'item'
        , dots: false
    });
}