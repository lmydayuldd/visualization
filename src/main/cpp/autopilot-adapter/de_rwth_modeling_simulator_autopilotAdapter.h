#ifndef DE_RWTH_MODELING_SIMULATOR_AUTOPILOTADAPTER
#define DE_RWTH_MODELING_SIMULATOR_AUTOPILOTADAPTER
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif
#include "octave/oct.h"
class de_rwth_modeling_simulator_autopilotAdapter{
public:
double timeIncrement;
double currentVelocity;
double currentGpsLat;
double currentGpsLon;
double compass;
double currentEngine;
double currentSteering;
double currentBrakes;
double goalNodeId;
double addNodes_length;
Matrix addNodes_id;
Matrix addNodes_gpsLat;
Matrix addNodes_gpsLon;
double removeNodes_length;
Matrix removeNodes_id;
double addOrUpdateEdges_length;
Matrix addOrUpdateEdges_fromNodeId;
Matrix addOrUpdateEdges_toNodeId;
Matrix addOrUpdateEdges_cost;
double removeEdges_length;
Matrix removeEdges_fromNodeId;
Matrix removeEdges_toNodeId;
double engine;
double steering;
double brakes;
void init()
{
addNodes_id=Matrix(1,10000);
addNodes_gpsLat=Matrix(1,10000);
addNodes_gpsLon=Matrix(1,10000);
removeNodes_id=Matrix(1,10000);
addOrUpdateEdges_fromNodeId=Matrix(1,10000);
addOrUpdateEdges_toNodeId=Matrix(1,10000);
addOrUpdateEdges_cost=Matrix(1,10000);
removeEdges_fromNodeId=Matrix(1,10000);
removeEdges_toNodeId=Matrix(1,10000);
}
void execute()
{
}

};
#endif
