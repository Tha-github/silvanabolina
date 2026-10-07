Add-Type -AssemblyName System.Drawing

$project = Split-Path -Parent $PSScriptRoot
# Paleta do site (tokens.css): azul #324089, branco e ouro metálico
$navy = [System.Drawing.Color]::FromArgb(50, 64, 137)
$white = [System.Drawing.Color]::White
$goldStops = [System.Drawing.Color[]]@(
  [System.Drawing.Color]::FromArgb(191, 149, 63),
  [System.Drawing.Color]::FromArgb(252, 246, 186),
  [System.Drawing.Color]::FromArgb(179, 135, 40),
  [System.Drawing.Color]::FromArgb(251, 245, 183),
  [System.Drawing.Color]::FromArgb(176, 127, 36)
)
$brandLine = 'ESPA' + [char]0x00C7 + 'O'
$brandName = 'Revolu' + [char]0x00E7 + [char]0x00E3 + 'o de Vidas'
$role = 'Psic' + [char]0x00F3 + 'loga cl' + [char]0x00ED + 'nica e organizacional'
$motto = 'Formando alicerces com f' + [char]0x00E9 + ' e ci' + [char]0x00EA + 'ncia.'

function New-Canvas([int]$width, [int]$height, [System.Drawing.Color]$background) {
  $bitmap = [System.Drawing.Bitmap]::new($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear($background)
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Save-Ico([System.Drawing.Bitmap]$bitmap, [string]$path) {
  $stream = [System.IO.MemoryStream]::new()
  $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
  $png = $stream.ToArray()
  $ico = [System.IO.MemoryStream]::new()
  $writer = [System.IO.BinaryWriter]::new($ico)
  $writer.Write([UInt16]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]1)
  $writer.Write([Byte]$bitmap.Width)
  $writer.Write([Byte]$bitmap.Height)
  $writer.Write([Byte]0)
  $writer.Write([Byte]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]32)
  $writer.Write([UInt32]$png.Length)
  $writer.Write([UInt32]22)
  $writer.Write($png)
  [System.IO.File]::WriteAllBytes($path, $ico.ToArray())
  $writer.Dispose(); $ico.Dispose(); $stream.Dispose()
}

# Pincel em gradiente dourado (diagonal, mesmas paradas de --ouro-gradiente)
function New-GoldBrush([System.Drawing.RectangleF]$rect) {
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $goldStops[0], $goldStops[4], [single]45)
  $blend = [System.Drawing.Drawing2D.ColorBlend]::new(5)
  $blend.Colors = $goldStops
  $blend.Positions = [single[]]@(0, 0.25, 0.5, 0.75, 1)
  $brush.InterpolationColors = $blend
  return $brush
}

# Monograma RV em ouro com moldura fina (substitui o antigo Ψ)
function Draw-Monogram($graphics, [single]$x, [single]$y, [single]$size, [single]$fontSize) {
  $rect = [System.Drawing.RectangleF]::new($x, $y, $size, $size)
  $gold = New-GoldBrush $rect
  $pen = [System.Drawing.Pen]::new($gold, [single][Math]::Max(1.5, $size / 40))
  $inset = $size * 0.06
  $graphics.DrawRectangle($pen, $x + $inset, $y + $inset, $size - 2 * $inset, $size - 2 * $inset)
  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $font = [System.Drawing.Font]::new('Georgia', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.DrawString('RV', $font, $gold, $rect, $format)
}

# Imagem Open Graph em 1200 × 630
$og = New-Canvas 1200 630 $white
$g = $og.Graphics
$navyBrush = [System.Drawing.SolidBrush]::new($navy)
$g.FillRectangle($navyBrush, 0, 0, 400, 630)
Draw-Monogram $g 80 195 240 120
$line = [System.Drawing.RectangleF]::new(478, 250, 90, 4)
$g.FillRectangle((New-GoldBrush $line), $line)
$g.DrawString($brandLine, [System.Drawing.Font]::new('Arial', 17, [System.Drawing.FontStyle]::Bold), $navyBrush, 478, 140)
$g.DrawString($brandName, [System.Drawing.Font]::new('Georgia', 42, [System.Drawing.FontStyle]::Bold), $navyBrush, 473, 178)
$g.DrawString('Silvana Bolina', [System.Drawing.Font]::new('Arial', 32, [System.Drawing.FontStyle]::Bold), $navyBrush, 478, 290)
$g.DrawString($role, [System.Drawing.Font]::new('Arial', 23, [System.Drawing.FontStyle]::Regular), $navyBrush, 478, 344)
$g.DrawString('Atendimento, carreira e desenvolvimento', [System.Drawing.Font]::new('Arial', 20, [System.Drawing.FontStyle]::Regular), $navyBrush, 478, 392)
$g.DrawString($motto, [System.Drawing.Font]::new('Arial', 18, [System.Drawing.FontStyle]::Italic), $navyBrush, 478, 500)
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$quality = [System.Drawing.Imaging.EncoderParameters]::new(1)
$quality.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [Int64]88)
$og.Bitmap.Save((Join-Path $project 'og-image.jpg'), $encoder, $quality)
$g.Dispose(); $og.Bitmap.Dispose()

# Ícone quadrado para a tela inicial do iOS
$apple = New-Canvas 180 180 $navy
Draw-Monogram $apple.Graphics 10 10 160 74
$apple.Bitmap.Save((Join-Path $project 'apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$apple.Graphics.Dispose(); $apple.Bitmap.Dispose()

# ICO com PNG embutido, compatível com navegadores atuais
$small = New-Canvas 32 32 $navy
Draw-Monogram $small.Graphics 0 0 32 15
Save-Ico $small.Bitmap (Join-Path $project 'favicon.ico')
$small.Graphics.Dispose(); $small.Bitmap.Dispose()

Write-Output 'Gerados og-image.jpg (1200×630), apple-touch-icon.png (180×180) e favicon.ico (32×32).'
