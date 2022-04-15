const html5QrCode = new Html5Qrcode("reader")

const config = { fps: 10, qrbox: 250 }

html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess).catch(error => {
  console.log(error)
});

function onScanSuccess(decodedText, decodedResult) {
  // Handle on success condition with the decoded text or result.
  console.log(`Scan result: ${decodedText}`, decodedResult);
  $('#ticket').val(decodedText)
  html5QrCode.stop()
  $('input[type=submit]').click()
}