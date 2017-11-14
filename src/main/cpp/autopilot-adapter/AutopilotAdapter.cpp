#include "simulator_integration_AutopilotAdapter.h"

#define _GLIBCXX_USE_CXX11_ABI 0

// your (generated) autopilot
#include "../autopilot/de_rwth_ryndin_modeling_autopilot_autopilot.h"

#include <stdlib.h>
#include <stdio.h>
#include <time.h>

// generated helper is actually also generated
#include "../autopilot/Helper.h"

// creating an instance of the autopilot component
de_rwth_ryndin_modeling_autopilot_autopilot AUTOPILOT_INSTANCE;



void copyJLongArrayToMatrix(JNIEnv *jenv, jlongArray &source, Matrix &dest) {
  jsize len = jenv -> GetArrayLength(source);
  if (len <= 0) {
    return;
  }
  jlong *body = jenv -> GetLongArrayElements(source, 0);
  for (int i=0; i<len; i++) {
    dest(0,i) = body[i];
  }
  jenv -> ReleaseLongArrayElements(source, body, 0);
}

void copyJDoubleArrayToMatrix(JNIEnv *jenv, jdoubleArray &source, Matrix &dest) {
  jsize len = jenv -> GetArrayLength(source);
  if (len <= 0) {
    return;
  }
  jdouble *body = jenv -> GetDoubleArrayElements(source, 0);
  for (int i=0; i<len; i++) {
    dest(0,i) = body[i];
  }
  jenv -> ReleaseDoubleArrayElements(source, body, 0);
}



/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_timeIncrement
 * Signature: (D)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1timeIncrement
  (JNIEnv *jenv, jobject jobj, jdouble v) { AUTOPILOT_INSTANCE.timeIncrement = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_currentVelocity
 * Signature: (D)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1currentVelocity
  (JNIEnv *jenv, jobject jobj, jdouble v) { AUTOPILOT_INSTANCE.currentVelocity = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_currentGpsLat
 * Signature: (D)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1currentGpsLat
  (JNIEnv *jenv, jobject jobj, jdouble v) { AUTOPILOT_INSTANCE.currentGpsLat = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_currentGpsLon
 * Signature: (D)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1currentGpsLon
  (JNIEnv *jenv, jobject jobj, jdouble v) { AUTOPILOT_INSTANCE.currentGpsLon = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_compass
 * Signature: (D)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1compass
  (JNIEnv *jenv, jobject jobj, jdouble v) { AUTOPILOT_INSTANCE.compass = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_currentEngine
 * Signature: (D)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1currentEngine
  (JNIEnv *jenv, jobject jobj, jdouble v) { AUTOPILOT_INSTANCE.currentEngine = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_currentSteering
 * Signature: (D)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1currentSteering
  (JNIEnv *jenv, jobject jobj, jdouble v) { AUTOPILOT_INSTANCE.currentSteering = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_currentBrakes
 * Signature: (D)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1currentBrakes
  (JNIEnv *jenv, jobject jobj, jdouble v) { AUTOPILOT_INSTANCE.currentBrakes = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_goalNodeId
 * Signature: (J)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1goalNodeId
  (JNIEnv *jenv, jobject jobj, jlong v) { AUTOPILOT_INSTANCE.goalNodeId = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_addNodes_length
 * Signature: (I)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1addNodes_1length
  (JNIEnv *jenv, jobject jobj, jint v) { AUTOPILOT_INSTANCE.addNodes_length = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_addNodes_id
 * Signature: ([J)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1addNodes_1id
  (JNIEnv *jenv, jobject jobj, jlongArray v) { copyJLongArrayToMatrix(jenv, v, AUTOPILOT_INSTANCE.addNodes_id); }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_addNodes_gpsLat
 * Signature: ([D)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1addNodes_1gpsLat
  (JNIEnv *jenv, jobject jobj, jdoubleArray v) { copyJDoubleArrayToMatrix(jenv, v, AUTOPILOT_INSTANCE.addNodes_gpsLat); }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_addNodes_gpsLon
 * Signature: ([D)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1addNodes_1gpsLon
  (JNIEnv *jenv, jobject jobj, jdoubleArray v) { copyJDoubleArrayToMatrix(jenv, v, AUTOPILOT_INSTANCE.addNodes_gpsLon); }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_removeNodes_length
 * Signature: (I)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1removeNodes_1length
  (JNIEnv *jenv, jobject jobj, jint v) { AUTOPILOT_INSTANCE.removeNodes_length = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_removeNodes_id
 * Signature: ([J)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1removeNodes_1id
  (JNIEnv *jenv, jobject jobj, jlongArray v) { copyJLongArrayToMatrix(jenv, v, AUTOPILOT_INSTANCE.removeNodes_id); }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_addOrUpdateEdges_length
 * Signature: (I)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1addOrUpdateEdges_1length
  (JNIEnv *jenv, jobject jobj, jint v) { AUTOPILOT_INSTANCE.addOrUpdateEdges_length = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_addOrUpdateEdges_fromNodeId
 * Signature: ([J)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1addOrUpdateEdges_1fromNodeId
  (JNIEnv *jenv, jobject jobj, jlongArray v) { copyJLongArrayToMatrix(jenv, v, AUTOPILOT_INSTANCE.addOrUpdateEdges_fromNodeId); }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_addOrUpdateEdges_toNodeId
 * Signature: ([J)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1addOrUpdateEdges_1toNodeId
  (JNIEnv *jenv, jobject jobj, jlongArray v) { copyJLongArrayToMatrix(jenv, v, AUTOPILOT_INSTANCE.addOrUpdateEdges_toNodeId); }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_addOrUpdateEdges_cost
 * Signature: ([D)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1addOrUpdateEdges_1cost
  (JNIEnv *jenv, jobject jobj, jdoubleArray v) { copyJDoubleArrayToMatrix(jenv, v, AUTOPILOT_INSTANCE.addOrUpdateEdges_cost); }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_removeEdges_length
 * Signature: (I)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1removeEdges_1length
  (JNIEnv *jenv, jobject jobj, jint v) { AUTOPILOT_INSTANCE.removeEdges_length = v; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_removeEdges_fromNodeId
 * Signature: ([J)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1removeEdges_1fromNodeId
  (JNIEnv *jenv, jobject jobj, jlongArray v) { copyJLongArrayToMatrix(jenv, v, AUTOPILOT_INSTANCE.removeEdges_fromNodeId); }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    set_removeEdges_toNodeId
 * Signature: ([J)V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_set_1removeEdges_1toNodeId
  (JNIEnv *jenv, jobject jobj, jlongArray v) { copyJLongArrayToMatrix(jenv, v, AUTOPILOT_INSTANCE.removeEdges_toNodeId); }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    get_engine
 * Signature: ()D
 */
JNIEXPORT jdouble JNICALL Java_simulator_integration_AutopilotAdapter_get_1engine
  (JNIEnv *jenv, jobject jobj) { return AUTOPILOT_INSTANCE.engine; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    get_steering
 * Signature: ()D
 */
JNIEXPORT jdouble JNICALL Java_simulator_integration_AutopilotAdapter_get_1steering
  (JNIEnv *jenv, jobject jobj) { return AUTOPILOT_INSTANCE.steering; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    get_brakes
 * Signature: ()D
 */
JNIEXPORT jdouble JNICALL Java_simulator_integration_AutopilotAdapter_get_1brakes
  (JNIEnv *jenv, jobject jobj) { return AUTOPILOT_INSTANCE.brakes; }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    exec
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_exec
  (JNIEnv *jenv, jobject jobj) { AUTOPILOT_INSTANCE.execute(); }

/*
 * Class:     simulator_integration_AutopilotAdapter
 * Method:    init
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_simulator_integration_AutopilotAdapter_init
  (JNIEnv *jenv, jobject jobj) {
    srand(time(NULL));
    Helper::init();
    AUTOPILOT_INSTANCE.init();
  }
