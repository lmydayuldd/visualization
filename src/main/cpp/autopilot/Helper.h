#ifndef HELPER_H
#define HELPER_H
#define _GLIBCXX_USE_CXX11_ABI 0
#include <iostream>
#include <octave/oct.h>
#include <octave/octave.h>
#include <octave/parse.h>
#include <octave/interpreter.h>
#include <stdarg.h>
#include <initializer_list>
class Helper
{
public:
    static void init()
    {
        string_vector argv(2);
        argv(0) = "embedded";
        argv(1) = "-q";
        octave_main(2, argv.c_str_vec(), 1);
        //octave_debug=1;
        //feval ("pkg", ovl ("load", "all"), 0);
    }

    static octave_value_list convertToOctaveValueList(double a)
    {
        octave_value_list in;
        in(0) = a;

        return in;
    }

    static octave_value_list convertToOctaveValueList(Matrix a)
    {
        octave_value_list in;
        in(0) = a;

        return in;
    }

    static octave_value_list convertToOctaveValueList(RowVector a)
    {
        octave_value_list in;
        in(0) = a;

        return in;
    }

    static octave_value_list convertToOctaveValueList(ColumnVector a)
    {
        octave_value_list in;
        in(0) = a;

        return in;
    }

    static octave_value_list convertToOctaveValueList(double a, double b)
    {
        octave_value_list in;
        in(0) = a;
        in(1) = b;

        return in;
    }

    static octave_value_list convertToOctaveValueList(std::initializer_list<double> args)
    {
        octave_value_list in;
        int counter = 0;
        for(double element : args) {
            in(counter) = octave_value(element);
            ++counter;
        }

        return in;
    }

    static octave_value_list convertToOctaveValueList(Matrix a, double b)
    {
        octave_value_list in;
        in(0) = a;
        in(1) = b;
        return in;
    }

    static octave_value_list convertToOctaveValueList(RowVector a, double b)
    {
        octave_value_list in;
        in(0) = a;
        in(1) = b;

        return in;
    }

    static octave_value_list convertToOctaveValueList(ColumnVector a, double b)
    {
        octave_value_list in;
        in(0) = a;
        in(1) = b;

        return in;
    }

    static octave_value_list callOctaveFunction(octave_value_list in, std::string functionName,int argsOut)
    {

        /*octave_idx_type n = 2;
        octave_value_list in;

        for(octave_idx_type i = 0; i < n; i++)
            in(i) = octave_value(5 * (i + 2));

        octave_value_list out = feval("gcd", in, 1);

        if(!error_state && out.length() > 0)
            std::cout << "GCD of [" << in(0).int_value() << ", " << in(1).int_value() << "] is " << out(0).int_value()
                      << std::endl;
        else
            std::cout << "invalid\n";

        clean_up_and_exit(0);*/
  /*      if(functionName=="eigs")
            return feval(functionName, in, 2);
        else if(functionName=="kmeans")
            return feval(functionName, in, 2);
*/
        return feval(functionName, in, argsOut);
    }

    static int callOctaveFunctionIntFirstResult(octave_value_list in, std::string functionName, int argsOut)
    {
        // printf("callOctaveFunctionIntFirstResult pre return functionName: %s\n",functionName.c_str());
        return callOctaveFunction(in, functionName,argsOut)(0).int_value();
    }

    static double callOctaveFunctionDoubleFirstResult(octave_value_list in, std::string functionName, int argsOut)
    {
        // printf("callOctaveFunctionDoubleFirstResult pre return functionName: %s\n",functionName.c_str());
        return callOctaveFunction(in, functionName,argsOut)(0).double_value();
    }

    static Matrix callOctaveFunctionMatrixFirstResult(octave_value_list in, std::string functionName, int argsOut)
    {
        return callOctaveFunction(in, functionName,argsOut)(0).matrix_value();
    }
    static ColumnVector callOctaveFunctionColumnVectorFirstResult(octave_value_list in, std::string functionName, int argsOut)
    {
        printf("pre Call %s\n", functionName.c_str());
        try {
            in=octave_value_list();
            octave_value_list list = callOctaveFunction(in, functionName,argsOut);
            printf("post Call %s\n", functionName.c_str());
            return list(0).array_value().as_column();
        } catch(const std::exception& e) {
            printf("%s\n", e.what());
        }
        return ColumnVector();
    }

    static RowVector callOctaveFunctionRowVectorFirstResult(octave_value_list in, std::string functionName, int argsOut)
    {
        return callOctaveFunction(in, functionName,argsOut)(0).array_value().as_row();
    }

    static int callOctaveFunctionIntSecondResult(octave_value_list in, std::string functionName, int argsOut)
    {
        return callOctaveFunction(in, functionName,argsOut)(1).int_value();
    }

    static double callOctaveFunctionDoubleSecondResult(octave_value_list in, std::string functionName, int argsOut)
    {
        return callOctaveFunction(in, functionName,argsOut)(1).double_value();
    }

    static Matrix callOctaveFunctionMatrixSecondResult(octave_value_list in, std::string functionName, int argsOut)
    {
        return callOctaveFunction(in, functionName,argsOut)(1).matrix_value();
    }
    static ColumnVector callOctaveFunctionColumnVectorSecondResult(octave_value_list in, std::string functionName, int argsOut)
    {
        return callOctaveFunction(in, functionName,argsOut)(1).array_value().as_column();
    }

    static RowVector callOctaveFunctionRowVectorSecondResult(octave_value_list in, std::string functionName, int argsOut)
    {
        return callOctaveFunction(in, functionName,argsOut)(1).array_value().as_row();
    }
    
    static Matrix getMatrixFromOctaveListFirstResult(octave_value_list list){
        return list(0).matrix_value();
    }
    
    
    static RowVector getRowVectorFromOctaveListFirstResult(octave_value_list list){
        return list(0).array_value().as_row();
    }
    
    
    static ColumnVector getColumnVectorFromOctaveListFirstResult(octave_value_list list){
        return list(0).array_value().as_column();
    }
    
    
    static double getDoubleFromOctaveListFirstResult(octave_value_list list){
        return list(0).double_value();
    }
    
    
    static int getIntFromOctaveListFirstResult(octave_value_list list){
        return list(0).int_value();
    }
};

#endif // HELPER_H