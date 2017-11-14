#ifndef DE_RWTH_RYNDIN_MODELING_AUTOPILOT_AUTOPILOT
#define DE_RWTH_RYNDIN_MODELING_AUTOPILOT_AUTOPILOT
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif
#include "octave/oct.h"
class de_rwth_ryndin_modeling_autopilot_autopilot{
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
double CONSTANTPORT1;
double CONSTANTPORT2;
double CONSTANTPORT3;
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
this->CONSTANTPORT1 = 3/2;
this->CONSTANTPORT2 = 0/1;
this->CONSTANTPORT3 = 0/1;
}
void execute()
{
engine = CONSTANTPORT1;
steering = CONSTANTPORT2;
brakes = CONSTANTPORT3;
}

};
#endif
