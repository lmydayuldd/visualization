call variables.bat

javah -d ..\src\main\cpp\autopilot-adapter ^
   -classpath ..\target\classes ^
   -jni simulator.integration.AutopilotAdapter
