$(document).ready(function () {
    if ($('#codes > option').length === 1) {
        $('#validation_code').attr('value', $('#codes > option')[0].getAttribute('value'))
        $('input[type=submit]').click();
    }
});