
# dsh-vpn worker — 桌面侧执行器。
#
# 只做一件事：把「连接 aTrust」这个动作拆成可观测的步骤，逐步以 JSON 行回给宿主。
# 每行一个 JSON 对象；最后一行带 final:$true（宿主据此判定成败）。
#
#   connect     唤起 aTrust → 填账号密码 → 点登录 → 等隧道真通
#   code        把二次验证码填进去并继续等隧道
#   disconnect  尽力通过 aTrust 窗口断开
#   status      只读：进程 / 网卡 / 探针
#   diagnose    把窗口控件树、网卡、日志摘要一次性吐出来
#   dump        把 UIA 树写到 ~/.dsh/vpn/ui-dump.txt（调试用）

param(
  [Parameter(Mandatory = $true)][string]$Action,
  [string]$Server = '',
  [string]$User = '',
  [string]$Probe = '',
  [string]$Code = '',
  [int]$TimeoutSec = 120
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms

$VpnDir = if ($env:DSHVPN_DIR) { $env:DSHVPN_DIR } else { Join-Path $env:USERPROFILE '.dsh\vpn' }
try { New-Item -ItemType Directory -Force -Path $VpnDir -ErrorAction Stop | Out-Null } catch { }
$DumpPath = Join-Path $VpnDir 'ui-dump.txt'
$TrayExe = 'C:\Program Files (x86)\Sangfor\aTrust\aTrustTray\aTrustTray.exe'
$Password = $env:DSHVPN_PASSWORD

# ---------------------------------------------------------------- 输出

function Emit([string]$Phase, [string]$Message, [string]$Level = 'info') {
  $obj = [ordered]@{ phase = $Phase; message = $Message; level = $Level }
  [Console]::Out.WriteLine(($obj | ConvertTo-Json -Compress))
  [Console]::Out.Flush()
}

function Finish([bool]$Ok, [string]$State, [string]$Message, $Extra = @{}) {
  $obj = [ordered]@{ final = $true; ok = $Ok; state = $State; message = $Message }
  foreach ($key in $Extra.Keys) { $obj[$key] = $Extra[$key] }
  [Console]::Out.WriteLine(($obj | ConvertTo-Json -Compress -Depth 6))
  [Console]::Out.Flush()
  exit 0
}

# ---------------------------------------------------------------- 系统信号

function Get-TunnelIps {
  $ips = @()
  try {
    $ips = @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
      Where-Object { $_.InterfaceAlias -like '*aTrust*' -and $_.IPAddress -notlike '169.254.*' } |
      ForEach-Object { $_.IPAddress })
  } catch { $ips = @() }
  return $ips
}

function Test-Probe([string]$Target) {
  if (-not $Target) { return $null }
  $parts = $Target.Split(':')
  if ($parts.Count -ne 2) { return @{ ok = $false; error = '探针格式应为 host:port' } }
  $hostName = $parts[0]
  $port = 0
  if (-not [int]::TryParse($parts[1], [ref]$port)) { return @{ ok = $false; error = '端口不是数字' } }
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $async = $client.BeginConnect($hostName, $port, $null, $null)
    if (-not $async.AsyncWaitHandle.WaitOne(2000)) { $client.Close(); return @{ ok = $false; error = '超时' } }
    $client.EndConnect($async)
    $client.Close()
    return @{ ok = $true }
  } catch {
    return @{ ok = $false; error = $_.Exception.Message }
  }
}

function Get-AuthProcesses {
  @(Get-Process aTrustTray -ErrorAction SilentlyContinue)
}

# ---------------------------------------------------------------- UIA 基础

$script:TrueCondition = [System.Windows.Automation.Condition]::TrueCondition

function Get-Descendants($Root) {
  $Root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $script:TrueCondition)
}

function Get-AuthWindows {
  $pids = @(Get-AuthProcesses | ForEach-Object { $_.Id })
  $windows = @()
  if ($pids.Count -eq 0) { return $windows }
  $root = [System.Windows.Automation.AutomationElement]::RootElement
  foreach ($child in $root.FindAll([System.Windows.Automation.TreeScope]::Children, $script:TrueCondition)) {
    try {
      if ($pids -contains $child.Current.ProcessId) { $windows += $child }
    } catch { }
  }
  return $windows
}

function Get-ElementKind($Element) {
  try { return $Element.Current.ControlType.ProgrammaticName } catch { return '' }
}

function Find-Element($Root, [string]$Kind, [string]$Pattern) {
  foreach ($element in (Get-Descendants $Root)) {
    try {
      $current = $element.Current
      if ($Kind -and (Get-ElementKind $element) -ne ('ControlType.' + $Kind)) { continue }
      if ($Pattern) {
        $hit = ($current.Name -match $Pattern) -or ($current.AutomationId -match $Pattern)
        if (-not $hit) { continue }
      }
      return $element
    } catch { }
  }
  return $null
}

function Find-PasswordField($Root) {
  foreach ($element in (Get-Descendants $Root)) {
    try {
      if ((Get-ElementKind $element) -ne 'ControlType.Edit') { continue }
      $isPassword = $element.GetCurrentPropertyValue([System.Windows.Automation.AutomationElement]::IsPasswordProperty)
      if ($isPassword -eq $true) { return $element }
    } catch { }
  }
  return $null
}

function Get-FieldText($Element) {
  try {
    $pattern = $Element.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
    return [string]$pattern.Current.Value
  } catch { return '' }
}

function Set-FieldValue($Element, [string]$Text) {
  try {
    $pattern = $Element.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
    $pattern.SetValue($Text)
    Start-Sleep -Milliseconds 120
    if ((Get-FieldText $Element) -eq $Text) { return $true }
  } catch { }
  try {
    $Element.SetFocus()
    Start-Sleep -Milliseconds 150
    Set-Clipboard -Value $Text
    Start-Sleep -Milliseconds 120
    [System.Windows.Forms.SendKeys]::SendWait('^a')
    Start-Sleep -Milliseconds 80
    [System.Windows.Forms.SendKeys]::SendWait('^v')
    Start-Sleep -Milliseconds 150
    return $true
  } catch { return $false }
}

function Invoke-Control($Element) {
  try {
    $pattern = $Element.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
    $pattern.Invoke()
    return $true
  } catch { }
  try {
    $Element.SetFocus()
    Start-Sleep -Milliseconds 120
    [System.Windows.Forms.SendKeys]::SendWait(' ')
    return $true
  } catch { return $false }
}

function Get-VisibleText($Root, [int]$Limit = 400) {
  $texts = @()
  $count = 0
  foreach ($element in (Get-Descendants $Root)) {
    if ($count -ge $Limit) { break }
    try {
      $name = $element.Current.Name
      if ($name) { $texts += $name; $count++ }
    } catch { }
  }
  return $texts
}

# ---------------------------------------------------------------- 窗口准备

function Ensure-Tray {
  if ((Get-AuthProcesses).Count -gt 0) { return $true }
  Emit 'launch' 'aTrust 没在运行，正在启动…'
  try {
    Start-Process -FilePath $TrayExe -WorkingDirectory (Split-Path $TrayExe) | Out-Null
  } catch {
    Emit 'launch' ('启动 aTrust 失败：' + $_.Exception.Message) 'error'
    return $false
  }
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 800
    if ((Get-AuthProcesses).Count -gt 0) {
      Emit 'launch' 'aTrust 进程已起来'
      return $true
    }
  }
  Emit 'launch' 'aTrust 启动后立刻退出了（可能被安全策略拦下）' 'error'
  return $false
}

function Wait-Window([int]$Seconds = 30) {
  for ($i = 0; $i -lt $Seconds; $i++) {
    $windows = Get-AuthWindows
    if ($windows.Count -gt 0) { return $windows[0] }
    Start-Sleep -Seconds 1
  }
  return $null
}

function Get-WindowLabel($Window) {
  try {
    $name = $Window.Current.Name
    if ($name) { return $name }
  } catch { }
  return '(无标题)'
}

# ---------------------------------------------------------------- 登录

function Test-NeedCode($Window) {
  foreach ($text in (Get-VisibleText $Window 500)) {
    if ($text -match '验证码|短信验证|动态码|二次验证|扫码|身份验证') { return $true }
  }
  return $false
}

function Show-LoginForm($Window) {
  $password = Find-PasswordField $Window
  if (-not $password) { return $false }
  return $true
}

function Invoke-Login($Window) {
  $accountPattern = '账号|帐号|用户名|用户|account|user|手机|mobile|工号'

  $passwordField = Find-PasswordField $Window
  if (-not $passwordField) {
    Emit 'form' '登录窗里没找到密码框' 'error'
    return $false
  }

  if ($User) {
    $accountField = $null
    foreach ($element in (Get-Descendants $Window)) {
      try {
        if ((Get-ElementKind $element) -ne 'ControlType.Edit') { continue }
        $isPassword = $element.GetCurrentPropertyValue([System.Windows.Automation.AutomationElement]::IsPasswordProperty)
        if ($isPassword -eq $true) { continue }
        $label = '' + $element.Current.Name + ' ' + $element.Current.AutomationId
        if ($label -match $accountPattern) { $accountField = $element; break }
      } catch { }
    }
    if (-not $accountField) {
      foreach ($element in (Get-Descendants $Window)) {
        try {
          if ((Get-ElementKind $element) -ne 'ControlType.Edit') { continue }
          $isPassword = $element.GetCurrentPropertyValue([System.Windows.Automation.AutomationElement]::IsPasswordProperty)
          if ($isPassword -eq $true) { continue }
          $accountField = $element
          break
        } catch { }
      }
    }
    if ($accountField) {
      $current = Get-FieldText $accountField
      if ($current -ne $User) {
        if (Set-FieldValue $accountField $User) { Emit 'form' ('已填入账号 ' + $User) }
        else { Emit 'form' '账号框写入失败' 'warn' }
      } else {
        Emit 'form' '账号已经填好'
      }
    } else {
      Emit 'form' '没找到账号框，跳过' 'warn'
    }
  }

  $typed = Set-FieldValue $passwordField $Password
  if ($typed) { Emit 'form' '已填入密码' } else { Emit 'form' '密码框写入失败' 'error'; return $false }

  $loginButton = $null
  foreach ($element in (Get-Descendants $Window)) {
    try {
      if ((Get-ElementKind $element) -ne 'ControlType.Button') { continue }
      $name = [string]$element.Current.Name
      if ($name -match '^\s*(登\s*录|立即登录|Login|Sign\s*in|提交)\s*$') { $loginButton = $element; break }
    } catch { }
  }

  if ($loginButton) {
    Emit 'form' ('点击「' + $loginButton.Current.Name + '」')
    [void](Invoke-Control $loginButton)
  } else {
    Emit 'form' '没找到登录按钮，用回车提交' 'warn'
    try { $passwordField.SetFocus(); [System.Windows.Forms.SendKeys]::SendWait('{ENTER}') } catch { }
  }
  return $true
}

function Wait-Connected([int]$Seconds, $Window) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  $lastNote = Get-Date
  while ((Get-Date) -lt $deadline) {
    $ips = @(Get-TunnelIps)
    if ($ips.Count -gt 0) {
      $probe = Test-Probe $Probe
      if (-not $probe -or $probe.ok) {
        return @{ ok = $true; ips = $ips; probe = $probe }
      }
      if (((Get-Date) - $lastNote).TotalSeconds -ge 6) {
        Emit 'verify' ('隧道有地址 ' + ($ips -join ',') + '，探针还不通（' + $probe.error + '）') 'warn'
        $lastNote = Get-Date
      }
    }
    if ($Window -and (Test-NeedCode $Window)) {
      $current = Get-AuthWindows
      if ($current.Count -gt 0) { $Window = $current[0] }
      $pw = Find-PasswordField $Window
      if (-not $pw -and (Test-NeedCode $Window)) {
        return @{ ok = $false; needCode = $true }
      }
    }
    Start-Sleep -Milliseconds 1200
  }
  return @{ ok = $false; timeout = $true }
}

# ---------------------------------------------------------------- 动作

function Invoke-Connect {
  $ips = @(Get-TunnelIps)
  if ($ips.Count -gt 0) {
    Emit 'verify' ('已经连着了：' + ($ips -join ','))
    Finish $true 'connected' ('已在连接状态（' + ($ips -join ',') + '）') @{ tunnelIps = $ips }
  }

  if (-not $Password) { Finish $false 'error' '没有拿到密码（设置里保存一次）' }

  if (-not (Ensure-Tray)) { Finish $false 'error' 'aTrust 起不来，看看是不是被安全软件拦了' }

  Emit 'window' '等待 aTrust 登录窗…'
  $window = Wait-Window 30
  if (-not $window) {
    Finish $false 'error' '30 秒内没等到 aTrust 窗口（它可能缩在托盘里）'
  }
  Emit 'window' ('找到窗口：' + (Get-WindowLabel $window))

  if (-not (Show-LoginForm $window)) {
    Start-Sleep -Seconds 3
    $windows = Get-AuthWindows
    if ($windows.Count -gt 0) { $window = $windows[0] }
    if (-not (Show-LoginForm $window)) {
      $ips = @(Get-TunnelIps)
      if ($ips.Count -gt 0) { Finish $true 'connected' ('已连接：' + ($ips -join ',')) @{ tunnelIps = $ips } }
      Finish $false 'error' '窗口里没有登录表单（可能停在别的页面）'
    }
  }

  if (-not (Invoke-Login $window)) { Finish $false 'error' '填表失败' }

  Emit 'verify' '等隧道建立…'
  $result = Wait-Connected $TimeoutSec $window
  if ($result.ok) {
    Finish $true 'connected' ('已连接：' + ($result.ips -join ',')) @{ tunnelIps = $result.ips; probe = $result.probe }
  }
  if ($result.needCode) {
    Emit 'need_code' '需要验证码，请在面板里输入' 'warn'
    Finish $false 'need_code' '需要二次验证码'
  }
  Finish $false 'error' ('等了 ' + $TimeoutSec + ' 秒隧道还没起来')
}

function Invoke-SubmitCode {
  $windows = Get-AuthWindows
  $window = $null
  if ($windows.Count -gt 0) { $window = $windows[0] }
  if (-not $window) {
    $tray = Ensure-Tray
    if ($tray) { $window = Wait-Window 20 }
  }
  if (-not $window) { Finish $false 'error' '找不到 aTrust 窗口' }

  $field = $null
  foreach ($element in (Get-Descendants $window)) {
    try {
      if ((Get-ElementKind $element) -ne 'ControlType.Edit') { continue }
      $isPassword = $element.GetCurrentPropertyValue([System.Windows.Automation.AutomationElement]::IsPasswordProperty)
      if ($isPassword -eq $true) { continue }
      $label = '' + $element.Current.Name + ' ' + $element.Current.AutomationId
      if ($label -match '验证码|code|sms|otp') { $field = $element; break }
    } catch { }
  }
  if (-not $field) {
    foreach ($element in (Get-Descendants $window)) {
      try {
        if ((Get-ElementKind $element) -ne 'ControlType.Edit') { continue }
        $field = $element; break
      } catch { }
    }
  }
  if (-not $field) { Finish $false 'error' '验证码输入框没找到' }

  if (-not (Set-FieldValue $field $Code)) { Finish $false 'error' '验证码写入失败' }
  Emit 'form' '已填入验证码'

  $confirmed = $false
  foreach ($element in (Get-Descendants $window)) {
    try {
      if ((Get-ElementKind $element) -ne 'ControlType.Button') { continue }
      $name = [string]$element.Current.Name
      if ($name -match '确认|确定|提交|下一步|登录|OK|Submit|Next') { [void](Invoke-Control $element); $confirmed = $true; break }
    } catch { }
  }
  if (-not $confirmed) { try { $field.SetFocus(); [System.Windows.Forms.SendKeys]::SendWait('{ENTER}') } catch { } }

  $result = Wait-Connected $TimeoutSec $window
  if ($result.ok) {
    Finish $true 'connected' ('已连接：' + ($result.ips -join ',')) @{ tunnelIps = $result.ips; probe = $result.probe }
  }
  Finish $false 'error' '验证码提交后隧道仍未起来'
}

function Invoke-Disconnect {
  $windows = Get-AuthWindows
  if ($windows.Count -eq 0) {
    try { Start-Process -FilePath $TrayExe -ArgumentList '--allow-file-access-from-files' -WorkingDirectory (Split-Path $TrayExe) | Out-Null } catch { }
    $windows = @()
    for ($i = 0; $i -lt 20; $i++) {
      Start-Sleep -Seconds 1
      $windows = Get-AuthWindows
      if ($windows.Count -gt 0) { break }
    }
  }
  if ($windows.Count -eq 0) { Finish $false 'error' '打不开 aTrust 窗口，手动从托盘断开吧' }

  foreach ($window in $windows) {
    foreach ($element in (Get-Descendants $window)) {
      try {
        if ((Get-ElementKind $element) -ne 'ControlType.Button') { continue }
        $name = [string]$element.Current.Name
        if ($name -match '断开|退出登录|注销|注销登录|离线') {
          [void](Invoke-Control $element)
          Emit 'disconnect' ('点击了「' + $name + '」')
          Start-Sleep -Seconds 3
          $ips = @(Get-TunnelIps)
          if ($ips.Count -eq 0) { Finish $true 'disconnected' '已断开' }
          Finish $true 'disconnected' '已发出断开请求'
        }
      } catch { }
    }
  }
  Finish $false 'error' '窗口里没找到「断开」按钮，手动从托盘断开吧'
}

function Invoke-Status {
  $ips = @(Get-TunnelIps)
  $procs = @(Get-AuthProcesses | ForEach-Object { $_.Id })
  $windows = @(Get-AuthWindows | ForEach-Object { Get-WindowLabel $_ })
  $probe = Test-Probe $Probe
  $extra = @{ tunnelIps = $ips; processes = $procs; windows = $windows; probe = $probe }
  if ($ips.Count -gt 0) { Finish $true 'connected' ('已连接 ' + ($ips -join ',')) $extra }
  if ($procs.Count -gt 0) { Finish $true 'disconnected' 'aTrust 在跑，但隧道没起来' $extra }
  Finish $true 'disconnected' 'aTrust 没在运行' $extra
}

function Save-Dump {
  $lines = @()
  $windows = Get-AuthWindows
  $lines += ('windows: ' + $windows.Count)
  foreach ($window in $windows) {
    try { $lines += ('--- ' + $window.Current.ClassName + ' ' + (Get-WindowLabel $window)) } catch { }
    foreach ($element in (Get-Descendants $window)) {
      try {
        $current = $element.Current
        $lines += (Get-ElementKind $element) + ' | name=' + $current.Name + ' | aid=' + $current.AutomationId + ' | class=' + $current.ClassName + ' | off=' + $current.IsOffscreen
      } catch { }
    }
  }
  Set-Content -Path $DumpPath -Value $lines -Encoding UTF8
  return @{ path = $DumpPath; lines = $lines.Count }
}

function Invoke-Diagnose {
  $problems = @()
  $ips = @(Get-TunnelIps)
  $procs = @(Get-AuthProcesses | ForEach-Object { $_.Id })
  Emit 'diag' ('aTrust 进程：' + $(if ($procs.Count) { $procs -join ',' } else { '没在运行' }))
  Emit 'diag' ('aTrust 隧道地址：' + $(if ($ips.Count) { $ips -join ',' } else { '没有' }))
  $windows = Get-AuthWindows
  Emit 'diag' ('aTrust 顶层窗口：' + $windows.Count)
  foreach ($window in $windows) {
    Emit 'diag' ('  窗口：' + (Get-WindowLabel $window) + ' / ' + $window.Current.ClassName)
    $hasPassword = [bool](Find-PasswordField $window)
    Emit 'diag' ('  登录表单：' + $(if ($hasPassword) { '有密码框' } else { '没有密码框' }))
  }
  if ($Server) {
    try {
      $response = Invoke-WebRequest -Uri $Server -UseBasicParsing -TimeoutSec 8 -MaximumRedirection 2
      Emit 'diag' ('服务器 ' + $Server + ' 可达，HTTP ' + $response.StatusCode)
    } catch {
      if ($_.Exception.Response) { Emit 'diag' ('服务器 ' + $Server + ' 可达（HTTP ' + [int]$_.Exception.Response.StatusCode + '）') }
      else { Emit 'diag' ('服务器 ' + $Server + ' 不可达：' + $_.Exception.Message) 'warn' }
    }
  }
  if ($Probe) {
    $probe = Test-Probe $Probe
    Emit 'diag' ('探针 ' + $Probe + '：' + $(if ($probe.ok) { '通' } else { '不通（' + $probe.error + '）' }))
  }
  $logPath = Join-Path $env:APPDATA 'Sangfor\aTrust\logs'
  $latest = Get-ChildItem $logPath -Filter 'aTrustTray.*.log' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($latest) {
    Emit 'diag' ('最近日志：' + $latest.Name)
    foreach ($line in (Get-Content $latest.FullName -Tail 6)) {
      $text = $line
      if ($text.Length -gt 160) { $text = $text.Substring(0, 160) }
      Emit 'diag' ('  ' + $text)
    }
  }
  $dump = Save-Dump
  Emit 'diag' ('控件树已写到 ' + $dump.path + '（' + $dump.lines + ' 行）')
}

try {
  switch ($Action.ToLower()) {
    'connect' { Invoke-Connect }
    'code' { Invoke-SubmitCode }
    'disconnect' { Invoke-Disconnect }
    'status' { Invoke-Status }
    'diagnose' { Invoke-Diagnose; Finish $true 'ok' '诊断完成' }
    'dump' { $dump = Save-Dump; Finish $true 'ok' ('控件树已写到 ' + $dump.path) @{ dump = $dump.path; lines = $dump.lines } }
    default { Finish $false 'error' ('未知动作：' + $Action) }
  }
} catch {
  Emit 'exception' $_.Exception.Message 'error'
  Finish $false 'error' ('执行异常：' + $_.Exception.Message)
}
