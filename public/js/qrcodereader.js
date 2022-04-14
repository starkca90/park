var arg = {
    resultFunction: function (result) {
        $('#ticket').val(result.code);
        decoder.stop()
        $('input[type=submit]').click();
    }
};

var decoder = $("canvas").WebCodeCamJQuery(arg).data().plugin_WebCodeCamJQuery;
decoder.buildSelectMenu("select");
decoder.play();
/*  Without visible select menu
    decoder.buildSelectMenu(document.createElement('select'), 'environment|back').init(arg).play();
*/
$('select').on('change', function () {
    decoder.stop().play();
});