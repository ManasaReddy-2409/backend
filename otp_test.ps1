$ErrorActionPreference = 'Stop'
$phone = '+911234567890'
try {
  $sendBody = @{ phone = $phone } | ConvertTo-Json -Compress
  $send = Invoke-RestMethod -Uri 'http://localhost:6001/api/otp/send' -Method Post -ContentType 'application/json' -Body $sendBody
  Write-Output '---SEND-RESPONSE---'
  $send | ConvertTo-Json -Depth 5
  if ($send.otp) {
    $otp = $send.otp
    Write-Output "---VERIFY-REQUEST (otp=$otp)---"
    $verifyBody = @{ phone = $phone; otp = $otp } | ConvertTo-Json -Compress
    $verify = Invoke-RestMethod -Uri 'http://localhost:6001/api/otp/verify' -Method Post -ContentType 'application/json' -Body $verifyBody
    Write-Output '---VERIFY-RESPONSE---'
    $verify | ConvertTo-Json -Depth 5
  } else {
    Write-Output 'No OTP returned from /api/otp/send (likely production mode). Check server logs.'
  }
} catch {
  Write-Output 'ERROR DURING OTP TEST:'
  $_ | Format-List -Force
  exit 1
}
