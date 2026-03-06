# Maven Wrapper Helper Script for PowerShell
# This script sets up the environment and runs the Maven wrapper

$env:Path += ";C:\Windows\System32\WindowsPowerShell\v1.0"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23.0.2"

# Get the directory where this script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Run the Maven wrapper with all passed arguments
& .\mvnw.cmd $args
