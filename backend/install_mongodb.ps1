# Download MongoDB installer
$mongoVersion = "7.0.5"
$downloadUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-$mongoVersion-signed.msi"
$installerPath = "$env:TEMP\mongodb-installer.msi"

Write-Host "Downloading MongoDB $mongoVersion..."
Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath

# Install MongoDB
Write-Host "Installing MongoDB..."
Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet ADDLOCAL=`"ServerNoService,Client,Router,MonitoringTools`" /l*v install.log" -Wait

# Add MongoDB to PATH
$mongoPath = "C:\Program Files\MongoDB\Server\$mongoVersion\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if (-not $currentPath.Contains($mongoPath)) {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$mongoPath", "Machine")
}

Write-Host "MongoDB installation completed!"