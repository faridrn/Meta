
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}
function IE(v) {
    var r = RegExp('msie' + (!isNaN(v) ? ('\\s' + v) : ''), 'i');
    return r.test(navigator.userAgent);
}

var rfile = '', rfile = '';
var srcs;
//setTimeout(function () {
var ff22 = document.getElementById('inpPlayback').value;
ff22v = ff22.replace("\\", "/");
var ff23 = document.getElementById('imgPlayback').src;
//var baseAddr = "http://85.17.24.134:82/hispantv/";
var baseAddr = "http://192.99.219.222:82/hispantv/";
//var baseAddr = "http://178.32.255.194:82/hispantv/";

//var baseAddr = "http://8f4aad807b7d73c135b68421bbe6a4f8.lswcdn.net/hispantv/";
// if (locdet1 || getCookie('locdet1'))
//if (getCookie('locdet1'))
//    baseAddr = "http://217.218.67.243/videos/";
// console.log(locdet1 || getCookie('locdet1'));
srcs = [
    { "file": baseAddr + ff22, "label": "1080p", "default": true },
    { "file": baseAddr + ff22.replace('.mp4', '_low_700.mp4'), "label": "720p" },
    { "file": baseAddr + ff22.replace('.mp4', '_low_500.mp4'), "label": "360p" },
    { "file": baseAddr + ff22.replace('.mp4', '_low_200.mp4'), "label": "180p" }
];
jwplayer("mediaplayer").setup({
    playlist: [{
        image: ff23.replace(" ", "%20"),
        sources: srcs,
        tracks: [{
            //file: "http://217.218.67.244:8181/vtt.aspx?address="+baseAddr+ff22+"&format=.vtt", 
            file: baseAddr + ff22.replace('.mp4', '.mp4'),
            // file: 'http://217.218.67.233:82/video' + ff22.replace('.mp4', '.mp4'),
            kind: "thumbnails"
        }]
    }],
    height: '100%',
    //autostart: true,
    startparam: "start",
    width: '100%',
    //primary: (IE(9)||IE(10))?"html5":"flash",
    primary: "flash",
    skin: "/views/assets/player/six.xml",
    stretching: "fill"
});
//}, 50);