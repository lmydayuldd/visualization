call variables.bat

set OUTPUT_DIR=..\target\lib

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

g++ -shared -fPIC -I"%PATH_TO_JDK_HOME%\include" ^
   -I"%PATH_TO_JDK_HOME%\include\win32" ^
   -I"%PATH_TO_OCTAVE_HOME%\include\octave-4.2.1" ^
   -I"%PATH_TO_OCTAVE_HOME%\include\octave-4.2.1\octave" ^
   -L"..\octave-libs" ^
   -o "%OUTPUT_DIR%\AutopilotAdapter.dll" ^
   ..\src\main\cpp\autopilot-adapter\AutopilotAdapter.cpp ^
   -loctave-4 -loctinterp-4
