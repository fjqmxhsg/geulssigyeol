# src\build.ps1  —  src 안의 파일 4개를 합쳐서 deploy\index.html 한 파일로 만듭니다.
# 사용법: PowerShell에서   .\src\build.ps1   (geulssigyeol 폴더에서 실행)
$ErrorActionPreference = 'Stop'
$src = $PSScriptRoot
$out = Join-Path (Split-Path $src -Parent) 'deploy\index.html'

$html = Get-Content (Join-Path $src 'index.html') -Raw -Encoding UTF8
$css  = Get-Content (Join-Path $src 'styles.css')  -Raw -Encoding UTF8
$eng  = Get-Content (Join-Path $src 'handfont.js') -Raw -Encoding UTF8
$app  = Get-Content (Join-Path $src 'app.js')      -Raw -Encoding UTF8

$html = $html.Replace('<link rel="stylesheet" href="styles.css">', "<style>`n$css</style>")
$html = $html.Replace('<script src="handfont.js"></script>', "<script>`n$eng</script>")
$html = $html.Replace('<script src="app.js"></script>', "<script>`n$app</script>")

New-Item -ItemType Directory -Force (Split-Path $out -Parent) | Out-Null
[System.IO.File]::WriteAllText($out, $html, (New-Object System.Text.UTF8Encoding $false))
Write-Host "완료: $out  ($([math]::Round((Get-Item $out).Length/1KB)) KB)"
