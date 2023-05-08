// GlobeHelpers.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#include <iostream>
#include <iomanip>
#include <fstream>
#include <string>

//Function declarations
int readmap(const std::string& inFile, const std::string& outFile, bool debuggingOn);

int main(int argc, char *argv[])
{
    if (argc == 1) {
        std::cout << "Error 11: No parameters passed\n";
        return 11;
    }

    char inputFilename[256] = "";
    char outputFilename[256 ] = "";
    bool debugMode = false;

    for (int i = 1; i < argc; i++){
        // Analyse parameters
        if (strcmp(argv[i], "/in") == 0) {
            // There should be another parameter that holds the filename
            if (argc > i+1) {
                // Check strlen of argv[i +1] is <= 256
                if (strlen(argv[i + 1]) > 256) {
                    std::cout << "Error 24: input filename cannot be greater than 256 chars\n";
                    return 24;
                }
                strcpy_s(inputFilename,argv[i+1]);
                i++;
            }
            else {
                std::cout << "Error 21: No file to read was passed\n";
                return 21;
            }
        }

        if (strcmp(argv[i], "/out") == 0) {
            // There should be another parameter that holds the filename
            if (argc > i + 1) {
                // Check strlen of argv[i +1] is <= 256
                if (strlen(argv[i + 1]) > 256) {
                    std::cout << "Error 34: output filename cannot be greater than 256 chars\n";
                    return 34;
                }
                strcpy_s(outputFilename, argv[i+1]);
                i++;
            }
            else {
                std::cout << "Error 31: No file to write out was passed\n";
                return 31;
            }
        }

        if (strcmp(argv[i], "/dbg") == 0) {
            debugMode = true;
        }
    }

    // do we have everything we need to proceed?
    if (!std::strlen(inputFilename)) {
        std::cout << "Error 12: No options passed. Use \"Globehelpers /h\" for help\n";
        return 12;
    }
 
    int returncode = readmap(inputFilename, outputFilename, debugMode);
    if (returncode == 22) {
        std::cout << "Error 22: file " << inputFilename << " could not be found\n";
        return 22;
    }
    else if (returncode == 23) {
        std::cout << "Error 23: file " << inputFilename << " could not be resolved\n";
        return 23;
    }

    return argc == 3 ? EXIT_SUCCESS : EXIT_FAILURE; // optional return value
}

int readmap(const std::string& inFile, const std::string& outFile, bool debuggingOn)
{

    // Try to open the file
    std::ifstream inputfile(inFile, std::ios::in | std::ios::binary);
    if (!inputfile)
        return 22;
    
    // Get file length
    inputfile.seekg(0, inputfile.end);
    int filelen = inputfile.tellg();
    inputfile.seekg(0, inputfile.beg);
    if (debuggingOn) std::cout << inFile << " is " << filelen << " characters long\n";

    double longitude, latitude;
    short int zoomLevel;
    char move;
    long nullLong1, nullLong2;
    int filePos = inputfile.tellg();
    const int lineLength = 26;

    unsigned int pointCount = 1;

    while (filePos != -1) {
        inputfile.read(reinterpret_cast<char*>(&latitude), sizeof(latitude));

        if (latitude == 999) {
            if (debuggingOn) std::cout << "End of file latitude code found\n";
            continue;
        }
        inputfile.read(reinterpret_cast<char*>(&longitude), sizeof(longitude));
        inputfile.read(reinterpret_cast<char*>(&zoomLevel), sizeof(zoomLevel));
        inputfile.read(reinterpret_cast<char*>(&nullLong1), sizeof(nullLong1));
        inputfile.read(reinterpret_cast<char*>(&nullLong2), sizeof(nullLong2));
        inputfile.read(reinterpret_cast<char*>(&move), sizeof(move));

        // Check if file pointer is asqew
        if (zoomLevel < 1 || zoomLevel > 8) {
            if (debuggingOn) std::cout << "File appears to be misaligned at this point\n";
            if (debuggingOn) std::cout << "File position is " << filePos << ", Rolling back to position " << filePos  <<".\n";

            int numberOfTries = 0;
            const int maxTries = 40;

            // Move back to last position without offset
            int peggedFilePos = filePos + numberOfTries;
            inputfile.seekg(filePos);                                                   // Absolute


            while ((zoomLevel < 1 || zoomLevel > 8) && numberOfTries <= maxTries) {
                filePos = peggedFilePos + numberOfTries;

                // Read a line
                inputfile.read(reinterpret_cast<char*>(&latitude), sizeof(latitude));
                inputfile.read(reinterpret_cast<char*>(&longitude), sizeof(longitude));
                inputfile.read(reinterpret_cast<char*>(&zoomLevel), sizeof(zoomLevel));
                inputfile.read(reinterpret_cast<char*>(&nullLong1), sizeof(nullLong1));
                inputfile.read(reinterpret_cast<char*>(&nullLong2), sizeof(nullLong2));
                inputfile.read(reinterpret_cast<char*>(&move), sizeof(move));

                // Output
                if (debuggingOn) std::cout << "Try #" << numberOfTries << " at file position " << peggedFilePos + numberOfTries << ".\n";
                if (debuggingOn) std::cout << "Latitude = " << latitude << ". Longuitude = " << longitude << ". zoomLevel = " << zoomLevel
                    << ". nullLong1 = " << nullLong1 << ". nullLong2 = " << nullLong2 << ". move = " << int(move) << "\n";

                // Increment
                numberOfTries++;

                // Move back to last position without offset
                inputfile.seekg(peggedFilePos + numberOfTries);                         // Absolute
            }
            if (zoomLevel >= 1 && zoomLevel <= 8) {                                     // All is back on track
                inputfile.seekg(filePos);
                if (debuggingOn) std::cout << "Found a way through with file position at " << filePos << " and offset after line of " << numberOfTries -1 << ".\n";
            }
            else return 23;
        }
        else {
            // Otherwise write out to file
            if (debuggingOn) std::cout << "File pos = " << filePos << ". Latitude = " << latitude << ". Longitude = " << longitude << ". zoomLevel = " << zoomLevel
                << ". nullLong1 = " << nullLong1 << ". nullLong2 = " << nullLong2 << ". move = " << int(move) << "\n";



            // Write out to text file
            // std::cout << latitude << ", " << longitude << ", " << zoomLevel << ", " << bool(move) << "\n";
            std::cout << "mapPoint.push({ latitude: " << latitude << ", longitude: " << longitude << ", zoomLevel: " << zoomLevel << ", move: " << int(move) <<
                ", nextPoint: " << pointCount << " });\n";

            pointCount++;
        }
        // Move along some additional places in the file to the beginning of the next line
        filePos = inputfile.tellg();
    }
    return 0;
}

