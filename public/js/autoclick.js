$(document).ready(function () {
// Set the date we're counting down to
    let delay = 10

// Update the count down every 1 second
    let x = setInterval(function () {

        // Display the result in the element with id="demo"
        document.getElementById("redirect").innerHTML = 'This page will redirect in ' + delay-- + ' seconds.';

        // If the count down is finished, write some text
        if (delay < 0) {
            clearInterval(x);
            $('input[type=submit]').click();
        }
    }, 1000);
})