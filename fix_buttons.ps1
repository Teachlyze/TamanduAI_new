$content = Get-Content 'src\pages\LandingPage.jsx' -Raw
$content = $content -replace 'className="bg-white text-purple-600 hover:bg-gray-50 shadow-xl"', 'className="bg-white text-purple-600 hover:bg-gray-50 shadow-xl w-full sm:w-auto whitespace-nowrap"'
Set-Content 'src\pages\LandingPage.jsx' -Value $content
