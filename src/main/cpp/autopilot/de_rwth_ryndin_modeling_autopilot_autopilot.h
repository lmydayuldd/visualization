#ifndef DE_RWTH_RYNDIN_MODELING_AUTOPILOT_AUTOPILOT
#define DE_RWTH_RYNDIN_MODELING_AUTOPILOT_AUTOPILOT
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif
#include "octave/oct.h"
#include "Helper.h"
#include "octave/builtin-defun-decls.h"
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
if((addNodes_length > 0/1 )){
double sumLat = 0/1 ;
for( auto i=1/1 ;i<=addNodes_length;++i){
sumLat = sumLat+addNodes_gpsLat(1/1 -1, i-1);
}
engine = 1/1 /(Helper::getDoubleFromOctaveListFirstResult(Fabs(Helper::convertToOctaveValueList(sumLat),1)));
}
else {
engine = 3/2 ;
}
steering = 0/1 ;
brakes = 0/1 ;
}

};
#endif
