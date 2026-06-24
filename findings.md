# Findings - Initialization Failure

## Research
- Reported command: `powershell -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; iex ((New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/Chun-Chieh-Chang/SkillsBuilder/main/bootstrap.ps1'))"`
- User reports an "error message" but hasn't provided the exact text yet.

## Hypotheses
1. GitHub connection issue (DNS, Proxy, SSL/TLS).
2. PowerShell version incompatibility.
3. `Net.WebClient` being blocked by security software.
4. Incorrect URL or content at the URL.

## Discoveries
- Found that `docs\devos-sidecar-guide.html` contains an incomplete command:
  `powershell -ExecutionPolicy Bypass -Command "iex ((New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/Chun-Chieh-Chang/SkillsBuilder/main/bootstrap.ps1'))"`
- This command is missing `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;`.
- PowerShell 5.1 (the default on most Windows machines) uses TLS 1.0 or 1.1 by default, which GitHub has deprecated.
- Without the TLS 1.2 setting, `DownloadString` will fail with an SSL/TLS connection error.
- Verified that the correct command exists in other files like `GEMINI.md` and `.cursorrules`.
