Add-Type -AssemblyName System.Drawing

$baseUpload = "C:\Users\DELL\.gemini\antigravity\brain\9b7d4d55-2d48-495b-8f7f-7dd53bbea744\.user_uploaded"
$outDir = "D:\ChessTimer\READY_FOR_PLAYSTORE"

# 1. Clean out existing screenshots from READY_FOR_PLAYSTORE except app-release.aab
Get-ChildItem -Path $outDir -Exclude "app-release.aab" | Remove-Item -Force

Write-Output "Cleaned out old files. Preserved app-release.aab."

# Helper to resize and letterbox on 1080x1920 with #0A0A0C background
function Format-PhoneScreenshot($srcPath, $dstPath) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $targetW = 1080
    $targetH = 1920
    $bmp = New-Object System.Drawing.Bitmap($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Fill background #0A0A0C
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 12))
    $g.FillRectangle($bgBrush, 0, 0, $targetW, $targetH)
    $bgBrush.Dispose()
    
    # Scale src to fit height 1920
    $scale = $targetH / $src.Height
    $scaledW = [math]::Round($src.Width * $scale)
    $offsetX = [math]::Floor(($targetW - $scaledW) / 2)
    
    $destRect = New-Object System.Drawing.Rectangle($offsetX, 0, $scaledW, $targetH)
    $g.DrawImage($src, $destRect, 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel)
    
    $bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Output "Created: $dstPath"
}

# Helper to create 512x512 app icon from 1024x1024 logo
function Create-AppIcon($srcPath, $dstPath) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $destRect = New-Object System.Drawing.Rectangle(0, 0, 512, 512)
    $g.DrawImage($src, $destRect, 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel)
    
    $bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Output "Created: $dstPath"
}

# Helper to create 1024x500 Feature Graphic using the logo and dark horology styling
function Create-FeatureGraphic($srcPath, $dstPath) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $targetW = 1024
    $targetH = 500
    $bmp = New-Object System.Drawing.Bitmap($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Fill background #0A0A0C
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 12))
    $g.FillRectangle($bgBrush, 0, 0, $targetW, $targetH)
    $bgBrush.Dispose()
    
    # Draw Logo scaled to fit height nicely (e.g. 480x480 at center-right)
    $logoSize = 480
    $logoX = 520
    $logoY = 10
    $destRect = New-Object System.Drawing.Rectangle($logoX, $logoY, $logoSize, $logoSize)
    $g.DrawImage($src, $destRect, 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel)
    
    # Text on left side: CHESS TIMER
    $fontTitle = New-Object System.Drawing.Font("Arial", 36, [System.Drawing.FontStyle]::Bold)
    $fontSubtitle = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
    $fontTags = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Regular)
    
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 212, 175, 55))
    $champagneBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 226, 179))
    $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 160, 160, 170))
    
    $g.DrawString("CHESS TIMER", $fontTitle, $goldBrush, 48, 140)
    $g.DrawString("HAUTE HORLOGERIE DUAL CLOCK", $fontSubtitle, $champagneBrush, 50, 205)
    $g.DrawString("BULLET  •  BLITZ  •  RAPID  •  CUSTOM", $fontTags, $mutedBrush, 50, 275)
    
    # Draw gold border frame
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 212, 175, 55), 2)
    $g.DrawRectangle($pen, 12, 12, 1000, 476)
    
    $bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $pen.Dispose()
    $goldBrush.Dispose()
    $champagneBrush.Dispose()
    $mutedBrush.Dispose()
    $fontTitle.Dispose()
    $fontSubtitle.Dispose()
    $fontTags.Dispose()
    $g.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Output "Created: $dstPath"
}

# Execute creation
Create-AppIcon "$baseUpload\media_1795440204048_62babefe.jpg" "$outDir\app_icon_512x512.png"
Create-FeatureGraphic "$baseUpload\media_1795440204048_62babefe.jpg" "$outDir\feature_graphic_1024x500.png"

Format-PhoneScreenshot "$baseUpload\media_1795440187796_2b3750fe.png" "$outDir\screenshot_1_splash.png"
Format-PhoneScreenshot "$baseUpload\media_1795440181064_0a411318.jpg" "$outDir\screenshot_2_setup.png"
Format-PhoneScreenshot "$baseUpload\media_1795440169781_26d5d72e.png" "$outDir\screenshot_3_timer.png"
Format-PhoneScreenshot "$baseUpload\media_1795440157567_f3510765.png" "$outDir\screenshot_4_history.png"
Format-PhoneScreenshot "$baseUpload\media_1795440147372_244ad6f0.jpg" "$outDir\screenshot_5_profile.png"

Write-Output "All processing complete!"
