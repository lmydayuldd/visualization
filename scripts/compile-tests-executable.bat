call variables.bat

set OUTPUT_DIR=..\target\lib

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

g++ -I"%PATH_TO_OCTAVE_HOME%\include\octave-4.2.1" ^
   -I"%PATH_TO_OCTAVE_HOME%\include\octave-4.2.1\octave" ^
   -L"%PATH_TO_OCTAVE_HOME%\bin" ^
   -o "%OUTPUT_DIR%\tests.exe" ^
   ..\src\main\cpp\autopilot\test\tests_main.cpp ^
   -loctave-4 -loctinterp-4
