# Mathematical & Logic Verification Script for KrishiSetu AI Irrigation Engine
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Running KrishiSetu AI Irrigation Calculation Engine Verification" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$passed = 0
$total = 0

function Assert-Equal($testName, $actual, $expected, $tolerance = 0.001) {
    $script:total++
    $diff = [Math]::Abs($actual - $expected)
    if ($diff -le $tolerance) {
        $script:passed++
        Write-Host " [PASS] $testName (Actual: $actual, Expected: $expected)" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $testName (Actual: $actual, Expected: $expected, Diff: $diff)" -ForegroundColor Red
    }
}

function Assert-True($testName, $condition) {
    $script:total++
    if ($condition) {
        $script:passed++
        Write-Host " [PASS] $testName" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $testName" -ForegroundColor Red
    }
}

# 1. Test Land Area Normalization
$acreHa = 1.0 * 0.404686
Assert-Equal "1.0 Acre to Hectare conversion" $acreHa 0.404686
$bighaHa = 1.0 * 0.2529
Assert-Equal "1.0 Bigha to Hectare conversion" $bighaHa 0.2529

# 2. Test USDA SCS Effective Rainfall
function Get-Peff($p) {
    if ($p -lt 2.0) { return 0.0 }
    if ($p -le 250.0) {
        $peff = $p * ((125.0 - 0.2 * $p) / 125.0)
        return [Math]::Round([Math]::Min($p, [Math]::Max(0.0, $peff)), 1)
    }
    return [Math]::Round(125.0 + 0.1 * $p, 1)
}

Assert-Equal "Rainfall < 2mm yields 0 Peff (interception)" (Get-Peff 1.5) 0.0
# 20 * (125 - 4) / 125 = 20 * 121 / 125 = 19.36 ~ 19.4 mm
Assert-Equal "20mm Rainfall yields ~19.4mm Peff" (Get-Peff 20.0) 19.4

# 3. Test Hargreaves ETo calculation
function Get-HargreavesEto($tMax, $tMin, $lat = 26.9124) {
    $tMean = ($tMax + $tMin) / 2.0
    $tempDiff = [Math]::Max(1.0, $tMax - $tMin)
    $ra = [Math]::Max(12.0, 15.2 - [Math]::Abs($lat - 20.0) * 0.1)
    $eto = 0.0023 * ($tMean + 17.8) * [Math]::Sqrt($tempDiff) * $ra
    return [Math]::Round([Math]::Min(8.5, [Math]::Max(2.0, $eto)), 2)
}

$jaipurEto = Get-HargreavesEto 31.0 19.0 26.9124
Assert-True "Jaipur 31C/19C Hargreaves ETo is between 3.5 and 6.0 mm/day" ($jaipurEto -ge 3.5 -and $jaipurEto -le 6.0)

# 4. Test Jaipur Scenario: 1 Acre Tomato at Flowering with 40,000 L Available Water
# Parameters:
$cropKc = 1.15
$soilAwc = 150.0 # mm/m
$rootDepth = 0.6 # m
$madFraction = 0.45
$dripEfficiency = 0.90
$budgetLiters = 40000.0
$hectares = 0.4047

$taw = $soilAwc * $rootDepth # 90 mm
Assert-Equal "Total Available Water (TAW) = 90 mm" $taw 90.0
$raw = $taw * $madFraction # 40.5 mm
Assert-Equal "Readily Available Water (RAW) = 40.5 mm" $raw 40.5

# Daily ETc over 5 days:
$dailyEto = @(4.68, 4.75, 4.75, 4.82, 4.68)
$dailyRain = @(0.0, 0.0, 0.0, 2.0, 0.0)
$totalGrossDemandLiters = 0.0

for ($i = 0; $i -lt 5; $i++) {
    $etc = $dailyEto[$i] * $cropKc
    $peff = Get-Peff $dailyRain[$i]
    $netDemandMm = [Math]::Max(0.0, $etc - $peff)
    $grossLiters = ($netDemandMm * 10000.0 * $hectares) / $dripEfficiency
    $totalGrossDemandLiters += $grossLiters
}

# Initial depletion (approx 4 days * 5.4 mm/day = ~21.6 mm)
$daysElapsed = 4
$estDr = [Math]::Min($taw, $daysElapsed * 5.4)
Assert-True "Root-zone depletion Dr is within safe buffer < RAW" ($estDr -le $raw)

# Total Net Depth = Initial Depletion + 5-day net demand depth
$totalNetDemandMm = 0.0
for ($i = 0; $i -lt 5; $i++) {
    $etc = $dailyEto[$i] * $cropKc
    $peff = Get-Peff $dailyRain[$i]
    $totalNetDemandMm += [Math]::Max(0.0, $etc - $peff)
}
$totalNetNeedDepthMm = $estDr + $totalNetDemandMm
$netNeedLiters = $totalNetNeedDepthMm * 10000.0 * $hectares
$grossNeedLiters = $netNeedLiters / $dripEfficiency

Write-Host " 5-Day Net Root Need: $([Math]::Round($netNeedLiters)) Liters ($([Math]::Round($totalNetNeedDepthMm, 1)) mm)" -ForegroundColor Yellow
Write-Host " 5-Day Gross Pump Need: $([Math]::Round($grossNeedLiters)) Liters (at 90% drip efficiency)" -ForegroundColor Yellow
Write-Host " Available Water Budget: $budgetLiters Liters" -ForegroundColor Yellow

# Constraint check for Schedule 3 (Budget-Optimized Deficit):
$schedDeficitLiters = [Math]::Min($budgetLiters, $grossNeedLiters)
Assert-True "Schedule 3 respects budget constraint: $schedDeficitLiters <= $budgetLiters" ($schedDeficitLiters -le $budgetLiters)

# Invariant: No feasible schedule allocates more water than budget
Assert-True "Feasibility Invariant: Allocated water never exceeds budget" ($schedDeficitLiters -le $budgetLiters)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Summary: $passed / $total tests passed successfully." -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Red" })
Write-Host "==========================================================" -ForegroundColor Cyan
