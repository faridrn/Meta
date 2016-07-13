//$(function () {
//    $(".login-form").on('submit', function (e) {
//        var data = JSON.stringify($(this).serialize());
//        testToken(data);
//        e.preventDefault();
//        return false;
//    });
//});
//
//function testToken(data) {
//    $.ajax({
//        contentType: "application/json",
//        url: 'http://217.218.67.142:85/api/login',
//        type: 'post',
//        data: data,
//        success: function (data) {
//            alert(data);
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            alert(xhr.status + '/' + JSON.parse(xhr.responseText).ExceptionMessage);
//        }
//    });
//}