/* The VIRTUAL GLOBE program V0.7*/
/* This version improves the save structure on disk */

#include <graphics.h>
#include <stdio.h>
#include <stdlib.h>
#include <conio.h>
#include <math.h>
#include <io.h>

#define OK 0
#define TRUE 1
#define FALSE 0
#define ON 1
#define OFF 0
#define PI 3.1415927
#define UP_KEY 72
#define DOWN_KEY 80
#define LEFT_KEY 75
#define RIGHT_KEY 77
#define ESCAPE_KEY 27
#define F_ONE 59
#define F_TWELVE 134
#define F_ELEVEN 133
#define PGUP_KEY 73
#define PGDN_KEY 81
#define SHIFT_PLUS 43
#define SHIFT_MINUS 95
#define PLUS 61
#define MINUS 45
#define S_KEY 115

char spec_getch(char *special);
void FloatToStr (char *CharNumber, double number, int DecPlaces);
struct point *plot_point(double Lat, double Long);
void draw_globe(struct point *node, double Lat, double Long, double radius,
	int ZoomLevel);
struct point *plot_line(double Lat, double Long);
struct point *InsertNode(struct point *head, struct point *NewPoint);
void draw_title(double Radius, double Lat, double Long, double RotationAngle,
	int ZoomLevel);
void SelectLine(struct point *node, double *Lat, double *Long, double Radius,
	double RotationAngle, double ZoomLevel);
void SpinPoint(double GlobeLat, double GlobeLong, double PointLat,
	double PointLong, double Radius, double *endX, double *endy,
	double *endZ);
void DrawCrosshairs (double xCentre, double yCentre);
void WritePosition (double Latitude, double Longitude);
void DrawNewLine (struct point *start, struct point *end, double Latitude,
	double Longitude, double Radius);
void WriteData (struct point *head, struct point *tail, long CallingPoint);
struct point *LoadMapData ();
void InputPoint (double *Lat, double *Long);
struct point *ReadRec (struct point *head, char FromPreviousLevel);
void CheckFileDetail (double Lat, double Long, double Radius,
	struct point *head, int ZoomLevel);
void DrawCross (int CentreX, int CentreY);

/* Main structure for all points accessed by any module */
struct point
{
	int             ZoomVal;
	double          LatVal;
	double          LongVal;
	char            Move;
	long            FilePosition;
	struct point    *NextPoint;
	struct point    *PrevDetail;
	struct point    *NextDetail;
};

struct line
{
	struct point    *StartCoord;
	struct point    *EndCoord;
	struct line     *NextLine;
	struct line     *LastLine;
	char            LineIsOn;
};

/********************************************************/
/* Globals used in the whole program                    */
/********************************************************/
double  RadsPerDeg = 2 * PI / 360;
FILE    *fp, *LatIndxP, *LongIndxP;

main ()
{
	/***************************************************************/
	/* Variables used in function main()                           */
	/***************************************************************/
	/************* variables used for lists ************************/
	struct point    *head = NULL, *NewPoint;

	/******* integers for the creation of the graphics window ******/
	int     Mode, Driver, GraphMessage, MaxX, MaxY;

	/***************** Colour integers *****************************/
	int     GlobeColour, EquatorColour;

	/********* Variables connected with the globe it's self *********/
	double  X_Centre, Y_Centre, DegsPerRad, Radius;
	double  Latitude = 0, Longitude = 0, LatLetterXpos, LatLetterYpos;
	double  LonLetterXpos, LonLetterYpos, RotationAngle = 2.0;
	int     ZoomLevel = 3;

	/**************** Variables used for input ***********************/
	char    key, TempStr[10];
	int     special = 0;

	/**************** Variables used for file handling ***************/
	char    NoPreviousData = FALSE;

	/*****************************************************************/
	/* Set up graphics                                               */
	/*****************************************************************/
	Driver = DETECT;
	detectgraph(&Driver, &Mode);
	initgraph(&Driver, &Mode, '');

	GraphMessage = graphresult();
	if (GraphMessage != OK)
		{printf ("%s\nGraphics Error: file missing",
			grapherrormsg(GraphMessage));
		exit(-1);
		}
	/*****************************************************************/
	/* Set up all variables                                          */
	/*****************************************************************/
	X_Centre = getmaxx()/2;
	Y_Centre = getmaxy()/2;
	Radius = 2 * Y_Centre / 3;
	/*****************************************************************/
	/* Actual graphics part goes in here                             */
	/*****************************************************************/
	/*****************************************************************/
	/* Load and Display saved globe data                             */
	/*****************************************************************/
	head = LoadMapData ();
	if (!head) NoPreviousData = TRUE;
	draw_title(Radius, Latitude, Longitude, RotationAngle, ZoomLevel);
	draw_globe(head, Latitude, Longitude, Radius, ZoomLevel);
	/******************************************************************/
	/* This main input handler                                        */
	/******************************************************************/
	while (key != ESCAPE_KEY || special == TRUE)
	{
	key = spec_getch(&special);
		if (special == TRUE){
			switch (key)
			{
			case (UP_KEY):
			{
				cleardevice();
				Latitude -= RotationAngle;
				if (Latitude < -90.0) Latitude = -90.0;
				draw_title(Radius, Latitude, Longitude,
					RotationAngle, ZoomLevel);
				draw_globe(head, Latitude, Longitude, Radius,
					ZoomLevel);
				break;
			}
			case (DOWN_KEY):
			{
				cleardevice();
				Latitude += RotationAngle;
				if (Latitude > 90.0) Latitude = 90.0;
				draw_title(Radius, Latitude, Longitude,
					RotationAngle, ZoomLevel);
				draw_globe(head, Latitude, Longitude, Radius,
					ZoomLevel);
				break;
			}
			case (RIGHT_KEY):
			{
				cleardevice();
				Longitude += RotationAngle;
				if (Longitude > 180.0) Longitude -= 360;
				draw_title (Radius, Latitude, Longitude,
					RotationAngle, ZoomLevel);
				draw_globe (head, Latitude, Longitude, Radius,
					ZoomLevel);
				break;
			}
			case (LEFT_KEY):
			{
				cleardevice();
				Longitude -= RotationAngle;
				if (Longitude < -180.0) Longitude += 360;
				draw_title(Radius, Latitude, Longitude,
					RotationAngle, ZoomLevel);
				draw_globe(head, Latitude, Longitude, Radius,
					ZoomLevel);
				break;
			}
			case (F_ONE):
			{
				NewPoint = plot_line(Latitude, Longitude);
				head = InsertNode(head, NewPoint);
				break;
			}
			case (F_ELEVEN):
			{
				NewPoint = plot_line(Latitude, Longitude);
				head = InsertNode(head, NewPoint);
				break;
			}
			case (F_TWELVE):
			{
				InputPoint (&Latitude, &Longitude);
			}
			case (PGUP_KEY):
			{
				ZoomLevel ++;
				Radius *= 1.5;
				RotationAngle /= 2.0;
				if (ZoomLevel > 5)
					CheckFileDetail (Latitude, Longitude,
						Radius, head, ZoomLevel);
				cleardevice();
				draw_title(Radius, Latitude, Longitude,
					RotationAngle, ZoomLevel);
				draw_globe(head, Latitude, Longitude, Radius,
					ZoomLevel);
				break;
			}
			case (PGDN_KEY):
			{
				if (ZoomLevel > 0)
				{
					ZoomLevel--;
					Radius /= 1.5;
					RotationAngle *= 2.0;
					cleardevice();
					draw_title(Radius, Latitude, Longitude,
						RotationAngle, ZoomLevel);
					draw_globe(head, Latitude, Longitude,
						Radius, ZoomLevel);
				}
				break;
			}
			case (ESCAPE_KEY) : break;
			}
		}
		else {
			switch (key)
			{
			case (PLUS):
			{
				FloatToStr (TempStr, RotationAngle, 3);
				/* paint old value black */
				setcolor (BLACK);
				outtextxy ((9*getmaxx()/10), (19*getmaxy()/20),
					TempStr);
				RotationAngle *= 2.0;
				if (RotationAngle > 128) RotationAngle = 128;
				FloatToStr (TempStr, RotationAngle, 3);
				setcolor (LIGHTMAGENTA);
				outtextxy ((9*getmaxx()/10), (19*getmaxy()/20),
					TempStr);
				break;
			}
			case (MINUS):
			{
				FloatToStr (TempStr,
				RotationAngle, 3);
				setcolor (BLACK);
				outtextxy ((9*getmaxx()/10), (19*getmaxy()/20),
					TempStr);
				RotationAngle /= 2.0;
				FloatToStr (TempStr, RotationAngle, 3);
				setcolor (LIGHTMAGENTA);
				outtextxy ((9*getmaxx()/10), (19*getmaxy()/20),
					TempStr);
				break;
			}
			case (S_KEY):
			{
				SelectLine(head, &Latitude, &Longitude, Radius,
					RotationAngle, ZoomLevel);
			}
			}
		}
	}
	/*****************************************************************/
	/*  If there was no data previously then save all data           */
	/*****************************************************************/
	if (NoPreviousData)
	{
		WriteData (head, NULL, -1l);
	}
	/*****************************************************************/
	/* Close down the graphics                                       */
	/*****************************************************************/
	closegraph();
}

/************************************************************/
/* Routine that gets characters from the keyboard           */
/* Lifted from "Pixels to animation" by  James Alan Farrell */
/************************************************************/
char spec_getch(char *special)
{
	char key = getch();
	if ((key == 0) && (kbhit())) {
		*special = TRUE;
		key = getch();
		return (key);}
	else {
		*special = FALSE;
		return (key);}
}

/************************************************************/
/* Function to convert floating point numbers to strings so */
/* they can be printed out on a graphic screen.             */
/************************************************************/
void FloatToStr (char *CharNumber, double number, int DecPlaces)
{
	int     power = 1, TempNumber, n = 0, temp;

	if (number < 0.0){
		*CharNumber = '-';
		n++;
		number *= -1.0;}

	TempNumber = (int)number;
	while(TempNumber > 9){
		TempNumber /= 10;
		power *= 10;}
	TempNumber = (int)number;

	do{
		temp = TempNumber / power;
		*(CharNumber + n) = (char)(temp + 48);
		TempNumber -= (temp * power);
		power /= 10;
		n++;
	} while (power >= 1);

	if (DecPlaces > 0)
	{
		*(CharNumber + n) = '.';
		TempNumber = number;
		n++;
		number -= (double)TempNumber;
		power = 10;

		while (DecPlaces > 0){
			TempNumber = (power * number);
			*(CharNumber + n) = (char)(TempNumber + 48);
			number -= (double)TempNumber / (double)power;
			n++;
			power *= 10;
			DecPlaces--;}
	}
	*(CharNumber + n) = '\0';

}

/******************************************************/
/* Function to draw all the points on the globe       */
/******************************************************/
void draw_globe(struct point *node, double Lat, double Long, double radius,
	int ZoomLevel)
{
	double  endX, endY, endZ, LastX = 0.0, LastY = 0.0;

	setcolor(GREEN);
	while (node){
		SpinPoint (Lat, Long, node->LatVal, node->LongVal, radius,
			&endX, &endY, &endZ);

		if (LastX !=0.0 && endZ > 0){
			line(LastX, LastY, endX, endY);
			LastX = endX;
			LastY = endY;}
		else{
			LastX = endX;
			LastY = endY;}
		
		/* Move down to the appropriate zoom level */
		if (node->NextDetail &&
			ZoomLevel >= node->NextDetail->ZoomVal)
			node = node->NextDetail;
		else node = node->NextPoint;
	}
}

struct point *plot_line(double Lat, double Long)
{
	double  x, y, z;
	struct point    *NewPoint;
	char            TempStr[20];

	/* Write out where we are looking at */
	setcolor (LIGHTBLUE);
	settextstyle (DEFAULT_FONT, HORIZ_DIR, 1/6);
	outtextxy (getmaxx()/30, 17*getmaxy()/20, "Lat Pos");
	outtextxy (getmaxx()/30, 9*getmaxy()/10, "Long Pos");

	FloatToStr(TempStr, Lat, 3);
	setcolor(CYAN);
	outtextxy(getmaxx()/5, 17*getmaxy()/20, TempStr);
	FloatToStr(TempStr, Long, 3);
	outtextxy(getmaxx()/5, 9*getmaxy()/10, TempStr);

	/* Create a new node in the list */
	NewPoint = (struct point *)malloc(sizeof(struct point));
	if(NewPoint){
		NewPoint->ZoomVal = 1;
		NewPoint->LatVal = Lat;
		NewPoint->LongVal = Long;
		NewPoint->Move = FALSE;
		NewPoint->NextPoint = NULL;
		NewPoint->PrevDetail = NULL;
		NewPoint->NextDetail = NULL;}
	return(NewPoint);
}

struct point *InsertNode(struct point *head, struct point *NewPoint)
{
	NewPoint->NextPoint = head;
	return(NewPoint);
}

void draw_title(double Radius, double Lat, double Long, double RotationAngle,
	int ZoomLevel)
{
	char    TempStr[20];
	double  endX, endY, endZ, LastX, LastY, pLat, pLong;

	setcolor (GREEN);
	circle (getmaxx()/2, getmaxy()/2, Radius);

	/* draw crosshairs */
	setcolor(RED);
	DrawCrosshairs (getmaxx()/2, getmaxy()/2);

	/* Write out where we are looking at */
	setcolor (WHITE);
	settextstyle (DEFAULT_FONT, HORIZ_DIR, 1/5);
	outtextxy (getmaxx()/30, getmaxy()/20, "Latitude");
	outtextxy (getmaxx()/30, getmaxy()/10, "Longitude");

	/* Print text to show where the cursor is */
	setcolor(YELLOW);
	WritePosition (Lat, Long);

	/* Write the rotation angle */
	setcolor (MAGENTA);
	outtextxy ((2*getmaxx()/3), (19*getmaxy()/20), "Rotation Angle");
	FloatToStr (TempStr, RotationAngle, 3);
	setcolor (LIGHTMAGENTA);
	outtextxy ((9*getmaxx()/10), (19*getmaxy()/20), TempStr);

	/* Write ZoomLevel */
	setcolor (CYAN);
	outtextxy (getmaxx()/30, (19*getmaxy()/20), "Zoom Level");
	setcolor(LIGHTCYAN);
	FloatToStr (TempStr, (double) ZoomLevel, 0);
	outtextxy (getmaxx()/5, (19*getmaxy()/20), TempStr);

	/* Draw the lines of latitude and longitude using THE rotation */
	/* equation  */

	setcolor(BLUE);
	LastX = 0.0;

	/* Draw lines of latitude */
	for (pLat = -90;pLat < 90;pLat += 30)
	{
		for (pLong = 0;pLong < 361; pLong += 12)
		{
			SpinPoint(Lat, Long, pLat, pLong, Radius,
				&endX, &endY, &endZ);
			if (LastX != 0.0 && endZ > 0)
				line(LastX, LastY, endX, endY);
			LastX = endX;
			LastY = endY;
		}
		LastX = 0.0;
	}

	/* Draw lines of longitude */
	for (pLong = -180;pLong < 180;pLong += 30)
	{
		for (pLat = -90;pLat < 90;pLat += 12)
		{
			SpinPoint(Lat, Long, pLat, pLong, Radius,
				&endX, &endY, &endZ);
			if (LastX != 0.0 && endZ > 0)
				line(LastX, LastY, endX, endY);
			LastX = endX;
			LastY = endY;
		}
		LastX = 0.0;
	}
}

/****************************************************************/
/* The SelectLine function allows one line to be broken into    */
/* several lines if the zoom level is such that more detail is  */
/* required.                                                    */
/****************************************************************/
void SelectLine(struct point *node, double *Lat, double *Long, double Radius,
	double RotationAngle, double ZoomLevel)
{
	struct point    *BeginPoints, *NewPoint, *PointHead, *start;
	struct line     *NewLine, *head = NULL, *temp;
	double          BeginX, BeginY, BeginZ, finishX, finishY, finishZ;
	double          CrosshairCentreLat, CrosshairCentreLong;
	double          CrosshairX = getmaxx()/2, CrosshairY = getmaxy()/2;
	char            key, special, tempstr[20], EndIn, BeginIn, PointPlotted;
	int             testbit = 5, p;

	BeginPoints = node;
	/* Work out which lines fall within the screen window */
	while (node)
	{

		/* get to the same level as the curent zoom level */
		while (node->NextDetail &&
			ZoomLevel >= node->NextDetail->ZoomVal)
			node = node->NextDetail;

		/*IF there is a point after the current one in the list */
		if (node->NextPoint)
		{
			SpinPoint (*Lat, *Long, node->LatVal, node->LongVal,
				Radius, &BeginX, &BeginY, &BeginZ);
			if (BeginZ > 0 && BeginX > 0 && BeginX < getmaxx() &&
				BeginY > 0 && BeginY < getmaxy())
			{
				SpinPoint (*Lat, *Long, node->NextPoint->LatVal,
					node->NextPoint->LongVal, Radius, 
					&finishX, &finishY, &finishZ);
				if (finishZ > 0 && finishX > 0 && 
					finishX < getmaxx() && finishY > 0 && 
					finishY < getmaxy())
				{
					NewLine = (struct line *)
						malloc(sizeof(struct line));
					if(NewLine)
					{
					NewLine->StartCoord = node;
					NewLine->EndCoord = node->NextPoint;
					NewLine->NextLine = NULL;
					NewLine->LastLine = head;
					if (head) head->NextLine = NewLine;
					head = NewLine;
					}
				}
			}
		}
		node = node->NextPoint;
	}
	/* move to a line which is fully on the screen */
	temp = head;
	while (temp->LastLine != NULL && temp->LineIsOn == FALSE)
		{temp = temp->LastLine;}
	head = temp;

	SpinPoint (*Lat, *Long, head->StartCoord->LatVal,
		head->StartCoord->LongVal, Radius, &BeginX, &BeginY, &BeginZ);
	SpinPoint (*Lat, *Long, head->EndCoord->LatVal,
		head->EndCoord->LongVal, Radius, &finishX, &finishY, &finishZ);
	setcolor(WHITE);
	line (BeginX, BeginY, finishX, finishY);
	while (key != S_KEY)
	{
		key = spec_getch(&special);
		if (special == TRUE)
		{
			switch (key)
			{
			case(LEFT_KEY):
			{
				if (head->LastLine)
				{
					setcolor (GREEN);
					line (BeginX, BeginY, finishX, finishY);
					head = head->LastLine;
					SpinPoint (*Lat, *Long,
						head->StartCoord->LatVal,
						head->StartCoord->LongVal, Radius,
						&BeginX, &BeginY, &BeginZ);
					SpinPoint (*Lat, *Long, head->EndCoord->LatVal,
						head->EndCoord->LongVal, Radius,
						&finishX, &finishY, &finishZ);
					setcolor(WHITE);
					line (BeginX, BeginY, finishX, finishY);
				}
				break;
			}
			case(RIGHT_KEY):
			{
				if (head->NextLine)
				{
					setcolor(GREEN);
					line (BeginX, BeginY, finishX, finishY);
					head = head->NextLine;
					SpinPoint (*Lat, *Long, head->StartCoord->LatVal,
						head->StartCoord->LongVal, Radius,
						&BeginX, &BeginY, &BeginZ);
					SpinPoint (*Lat, *Long, head->EndCoord->LatVal,
						head->EndCoord->LongVal, Radius,
						&finishX, &finishY, &finishZ);
					setcolor(WHITE);
					line (BeginX, BeginY, finishX, finishY);
				}
				break;
			}
			}
		}
	}
	/* Centre the chosen Line */
	*Lat = (head->StartCoord->LatVal + head->EndCoord->LatVal)/2;
	*Long = (head->StartCoord->LongVal + head->EndCoord->LongVal)/2;
	cleardevice();
	draw_title (Radius, *Lat, *Long, RotationAngle, ZoomLevel);
	draw_globe (BeginPoints, *Lat, *Long, Radius, ZoomLevel);

	/* And Blacken it */
	SpinPoint (*Lat, *Long, head->StartCoord->LatVal,
		head->StartCoord->LongVal, Radius, &BeginX, &BeginY, &BeginZ);
	SpinPoint (*Lat, *Long, head->EndCoord->LatVal,
		head->EndCoord->LongVal, Radius, &finishX, &finishY, &finishZ);
	setcolor(BLACK);
	line(BeginX, BeginY, finishX, finishY);

	/* Red cross at end point */
	SpinPoint (*Lat, *Long, head->EndCoord->LatVal,
		head->EndCoord->LongVal, Radius, &BeginX,
		&BeginY, &BeginZ);
	setcolor(RED);
	DrawCross (BeginX, BeginY);

	/* Yellow cross at start point */
	SpinPoint (*Lat, *Long, head->StartCoord->LatVal,
		head->StartCoord->LongVal, Radius, &BeginX,
		&BeginY, &BeginZ);
	setcolor(YELLOW);
	DrawCross (BeginX, BeginY);

	setcolor(LIGHTGREEN);
	outtextxy (getmaxx()/4, 14*getmaxy()/16,
		"Plot the points from the yellow cross to the red cross.");

	key = 0;              /* reset key from last time 'S' was pressed */
	CrosshairCentreLat = *Lat;    /* Set crosshairs to present centre */
	CrosshairCentreLong = *Long;  /* of screen.                       */

	PointPlotted = FALSE;
	while (key != S_KEY)
	{
	key = spec_getch(&special);
		if (special == TRUE)
		{
			switch (key)
			{
			case (UP_KEY):
			{
				setcolor(BLACK);
				WritePosition (CrosshairCentreLat,
					CrosshairCentreLong);
				DrawCrosshairs(CrosshairX, CrosshairY);
				CrosshairCentreLat -= RotationAngle;
				SpinPoint (*Lat, *Long, CrosshairCentreLat,
					CrosshairCentreLong, Radius,
					&CrosshairX, &CrosshairY, &BeginZ);
				setcolor(RED);
				DrawCrosshairs(CrosshairX, CrosshairY);
				setcolor (YELLOW);
				WritePosition (CrosshairCentreLat,
					CrosshairCentreLong);
				break;
			}
			case (DOWN_KEY):
			{
				setcolor(BLACK);
				WritePosition (CrosshairCentreLat,
					CrosshairCentreLong);
				DrawCrosshairs(CrosshairX, CrosshairY);
				CrosshairCentreLat += RotationAngle;
				SpinPoint (*Lat, *Long, CrosshairCentreLat,
					CrosshairCentreLong, Radius,
					&CrosshairX, &CrosshairY, &BeginZ);
				setcolor(RED);
				DrawCrosshairs(CrosshairX, CrosshairY);
				setcolor (YELLOW);
				WritePosition (CrosshairCentreLat,
					CrosshairCentreLong);
				break;
			}
			case (RIGHT_KEY):
			{
				setcolor(BLACK);
				WritePosition (CrosshairCentreLat,
					CrosshairCentreLong);
				DrawCrosshairs(CrosshairX, CrosshairY);
				CrosshairCentreLong += RotationAngle;
				SpinPoint (*Lat, *Long, CrosshairCentreLat,
					CrosshairCentreLong, Radius,
					&CrosshairX, &CrosshairY, &BeginZ);
				setcolor(RED);
				DrawCrosshairs(CrosshairX, CrosshairY);
				setcolor (YELLOW);
				WritePosition (CrosshairCentreLat,
					CrosshairCentreLong);
				break;
			}
			case (LEFT_KEY):
			{
				setcolor(BLACK);
				WritePosition (CrosshairCentreLat,
					CrosshairCentreLong);
				DrawCrosshairs(CrosshairX, CrosshairY);
				CrosshairCentreLong -= RotationAngle;
				SpinPoint (*Lat, *Long, CrosshairCentreLat,
					CrosshairCentreLong, Radius,
					&CrosshairX, &CrosshairY, &BeginZ);
				setcolor(RED);
				DrawCrosshairs(CrosshairX, CrosshairY);
				setcolor (YELLOW);
				WritePosition (CrosshairCentreLat,
					CrosshairCentreLong);
				break;
			}
			case (F_ONE):
			{
				PointPlotted = TRUE;
				/* Create a new node in the list */
				NewPoint = (struct point *)
					malloc(sizeof(struct point));
				if(NewPoint){
					NewPoint->ZoomVal = 1;
					NewPoint->LatVal = CrosshairCentreLat;
					NewPoint->LongVal=CrosshairCentreLong;
					NewPoint->FilePosition = NULL;
					NewPoint->NextPoint = NULL;
					NewPoint->PrevDetail = NULL;
					NewPoint->NextDetail = NULL;}

				/* if (This is the first               */
				/*            point of the next layer) */
				if (head->StartCoord->NextDetail == NULL)
				{
					SpinPoint (*Lat, *Long,
						head->StartCoord->LatVal,
						head->StartCoord->LongVal,
						Radius, &BeginX, &BeginY, &BeginZ);
					line (CrosshairX, CrosshairY, BeginX,
						BeginY);
					head->EndCoord->PrevDetail = NewPoint;
					head->StartCoord->NextDetail = NewPoint;
					PointHead = NewPoint;
				}
				else
				{
					SpinPoint (*Lat, *Long,
						PointHead->LatVal,
						PointHead->LongVal,
						Radius, &BeginX, &BeginY, &BeginZ);
					line (CrosshairX, CrosshairY, BeginX,
						BeginY);
					PointHead->NextPoint = NewPoint;
					PointHead = NewPoint;
				}
				break;
			}
			}
		}
	}
	if (PointPlotted)
	{
		PointHead->NextPoint = head->EndCoord;
		SpinPoint (*Lat, *Long, PointHead->LatVal, PointHead->LongVal,
			Radius, &BeginX, &BeginY, &BeginZ);
		line (CrosshairX, CrosshairY, BeginX, BeginY);
		setcolor (BLACK);
		outtextxy (getmaxx()/4, 14*getmaxy()/16,
			"Plot the points from the yellow cross to the red cross.");
		setcolor(LIGHTGREEN);
		outtextxy (getmaxx()/4, 14*getmaxy()/16,
			"Use Pg. up and PG down to set zoom level.");

		/* Reset key */
		key = 0;

		while (key != S_KEY)
		{
			key = spec_getch(&special);
			if (special == TRUE)
			{
				switch (key)
				{
				case (PGUP_KEY):
				{
					ZoomLevel ++;
					Radius *= 1.5;
					RotationAngle /= 2.0;
					cleardevice();
					draw_title(Radius, *Lat, *Long,
						RotationAngle, ZoomLevel);
					DrawNewLine (head->StartCoord,
						head->EndCoord, *Lat, *Long, Radius);
					break;
				}
				case (PGDN_KEY):
				{
					if (ZoomLevel > 0)
					{
						ZoomLevel--;
						Radius /= 1.5;
						RotationAngle *= 2.0;
						cleardevice();
						draw_title(Radius, *Lat, *Long,
							RotationAngle, ZoomLevel);
					DrawNewLine (head->StartCoord,
						head->EndCoord, *Lat, *Long, Radius);

					}
					break;
				}
				}
			}
		}
		start = head->StartCoord->NextDetail;
		while (start != PointHead)
		{
			start->ZoomVal = ZoomLevel;
			start = start->NextPoint;
		}
		WriteData (head->StartCoord->NextDetail, head->EndCoord->NextPoint,
			head->StartCoord->FilePosition);
	}
	cleardevice();
	draw_title (Radius, *Lat, *Long, RotationAngle, ZoomLevel);
	draw_globe (BeginPoints, *Lat, *Long, Radius, ZoomLevel);
}
void DrawCross (int CentreX, int CentreY)
{
	line (CentreX, CentreY-(getmaxy()/50), CentreX, CentreY+(getmaxy()/50));
	line (CentreX-(getmaxx()/50), CentreY, CentreX+(getmaxx()/50), CentreY);
}

void DrawNewLine (struct point *start, struct point *end, double Latitude,
	double Longitude, double Radius)
{
	double  endX, endY, endZ, LastX = 0, LastY = 0;
	char    first = TRUE;

	setcolor (WHITE);
	while (start != end->NextPoint)
	{
		SpinPoint (Latitude, Longitude, start->LatVal, start->LongVal,
			Radius, &endX, &endY, &endZ);

		if (LastX !=0.0 && endZ > 0){
			line(LastX, LastY, endX, endY);
			LastX = endX;
			LastY = endY;}
		else{
			LastX = endX;
			LastY = endY;}
		if (first)
		{
			start = start->NextDetail;
			first = FALSE;
		}
		else start = start->NextPoint;
	}
}

void SpinPoint(double GlobeLat, double GlobeLong, double PointLat,
	double PointLong, double Radius, double *endX, double *endY,
	double *endZ)
{
	double  cosPlat, cosPlong, sinPlat, sinPlong;
	double  xCentre, yCentre, zCentre, zRange;
	double  RadsPerDeg = 2 * PI / 360;

	cosPlat = cos(PointLat * RadsPerDeg);
	sinPlat = sin(PointLat * RadsPerDeg);

	/* My calculation to work out the new position of a */
	/* point after the globe has been rotated           */
	xCentre = getmaxx()/2;
	yCentre = (getmaxy()/2) + (Radius * cos(GlobeLat * RadsPerDeg) *
		sinPlat);
	zCentre = sin(GlobeLat * RadsPerDeg) * sinPlat;

	*endX =  xCentre + (Radius * cosPlat * sin((PointLong - GlobeLong) *
		RadsPerDeg));
	*endY = yCentre - (Radius * cosPlat * cos((PointLong - GlobeLong) *
		RadsPerDeg) * sin(GlobeLat * RadsPerDeg));
	zRange = cosPlat * cos(GlobeLat * RadsPerDeg);
	*endZ = zCentre + (zRange * cos((PointLong - GlobeLong) * RadsPerDeg));
}

void DrawCrosshairs (double xCentre, double yCentre)
{
	line(xCentre, yCentre-(getmaxy()/50), xCentre, yCentre-(getmaxy()/100));
	line(xCentre, yCentre+(getmaxy()/100), xCentre, yCentre+(getmaxy()/50));
	line(xCentre+(getmaxx()/100), yCentre, xCentre+(getmaxx()/50), yCentre);
	line(xCentre-(getmaxx()/50), yCentre, xCentre-(getmaxx()/100), yCentre);
}


void WritePosition (double Latitude, double Longitude)
{
	double  PosValue, MinutesLeft, WholeDegrees;
	char    EndChar[2], TempStr[20];

	if (Longitude < 0) strcpy (EndChar, "W");
	else strcpy (EndChar, "E");
	PosValue = sqrt(Longitude * Longitude);
	WholeDegrees = (int) PosValue;
	FloatToStr(TempStr, WholeDegrees, 0);
	outtextxy(getmaxx()/5, getmaxy()/10, TempStr);
	MinutesLeft = PosValue - WholeDegrees;
	MinutesLeft *= 60.0;
	FloatToStr (TempStr, MinutesLeft, 3);
	outtextxy(getmaxx()/4, getmaxy()/10, TempStr);
	outtextxy(getmaxx()/3, getmaxy()/10, EndChar);

	if (Latitude < 0) strcpy (EndChar, "N");
	else strcpy (EndChar, "S");
	PosValue = sqrt(Latitude * Latitude);
	WholeDegrees = (int) PosValue;
	FloatToStr(TempStr, WholeDegrees, 0);
	outtextxy(getmaxx()/5, getmaxy()/20, TempStr);
	MinutesLeft = PosValue - WholeDegrees;
	MinutesLeft *= 60.0;
	FloatToStr (TempStr, MinutesLeft, 3);
	outtextxy(getmaxx()/4, getmaxy()/20, TempStr);
	outtextxy(getmaxx()/3, getmaxy()/20, EndChar);
}

struct point *LoadMapData ()
{
	struct point    *head = NULL;

	if ((fp = fopen ("world.map", "rb")) == NULL)
	{
		return (NULL);
	}
	else
	{
		/* read file */
		head = ReadRec(head, FALSE);
		fclose(fp);
		return (head);
	}
}

struct point *ReadRec (struct point *head, char FromPreviousLevel)
{
	double          lat, Long;
	int             ZoomLevel, n;
	long            NullLong = -1, FilePos;
	char            *p, Move, FirstOccurence = TRUE;
	struct point    *NewPoint, *LastPoint;

	/* Read first record to make sure there is something */
	p = &lat;
	for (n = 0;n < 8;n ++)
		{*p++ = getc(fp);}

	while(lat != 999)
	{
		p = &Long;
		for (n = 0;n <  8;n ++)
			{*p++ = getc(fp);}
		p = &ZoomLevel;
		for (n = 0;n < 2;n ++)
			{*p++ = getc(fp);}

		/* Save this position as the position where the  */
		/* NextDetail file position is                   */

		FilePos = ftell(fp);
	/* read the next 8 characters as 2 longs, otherwise we do not   */
	/* know what *p is writing over and hence are dabbling in things*/
	/* that mere C programmers were never meant to know about.      */
		p = &NullLong;
		for (n = 0;n < 4;n ++)
			{*p++ = getc(fp);}
		p = &NullLong;
		for (n = 0;n < 4;n ++)
			{*p++ = getc(fp);}
		Move = getc(fp);

		/* Create a new node in the list */
		NewPoint = (struct point *)malloc(sizeof(struct point));
		if(NewPoint){
			NewPoint->ZoomVal = ZoomLevel;
			NewPoint->LatVal = lat;
			NewPoint->LongVal = Long;
			NewPoint->Move = Move;
			NewPoint->FilePosition = FilePos;
			NewPoint->NextPoint = head;
			NewPoint->PrevDetail = NULL;
			NewPoint->NextDetail = NULL;}

			/* Lists from a previous level need to be built */
			/* backwards to that of ones at the top level   */
			if (FromPreviousLevel == 1)
			{
				if (FirstOccurence)
				{
					head->NextDetail = NewPoint;
				}
				else head->NextPoint = NewPoint;
				NewPoint->NextPoint = NULL;
			}
			head = NewPoint;
			FirstOccurence = FALSE;

		/* go to the next lat on disk to check if EOF is */
		/* reached */
			p = &lat;
			for (n = 0;n < 8;n ++)
				{*p++ = getc(fp);}
	}
	return (head);
}

void WriteData (struct point *head, struct point *tail,
	long CallingPoint)
{
	char            *p, NullChar ;
	int             c;
	long            NullLong = -1, EndPos = 4;
	double          EndFloat = 999;

	/* If this is the first time that we write to the file */
	if (CallingPoint == -1)
	{
		fp=fopen("world.map", "w+b");
	}

	else
	{
		/* get old file len */
		fp = fopen("world.map", "r+b");

		fseek (fp, 0l, SEEK_END);
		EndPos = ftell(fp);
		fseek(fp, CallingPoint, SEEK_SET);
		/* write the end position into the point that will call it */
		p = &EndPos;
		for (c = 0;c < 4;c++)
		{
			fputc(*p, fp);
			p++;
		}
		fseek (fp, 0l, SEEK_END);
	}
	while (head != tail)
	{
		p = &(head->LatVal);
		for (c = 0;c < 8;c++)
		{
			fputc(*p, fp);
			p++;
		}
		p = &(head->LongVal);
		for (c = 0;c < 8;c++)
		{
			fputc(*p, fp);
			p++;
		}
		p = &(head->ZoomVal);
		for (c = 0;c < 2;c++)
		{
			fputc(*p, fp);
			p++;
		}
		p = &NullLong;
		for (c = 0;c < 4;c++)
		{
			fputc(*p, fp);
			p++;
		}
		p = &NullLong;
		for (c = 0;c < 4;c++)
		{
			fputc(*p, fp);
			p++;
		}
		fputc(head->Move, fp);

		head = head->NextPoint;

		/* increase the file len by the size of a record */
		EndPos += 27;
	}
	p = &EndFloat;
	for (c = 0;c < 8;c++)
	{
		fputc(*p, fp);
		p++;
	}
	fclose (fp);
}

void CheckFileDetail (double Lat, double Long, double Radius,
	struct point *head, int ZoomLevel)
{
	double          StartX, StartY, StartZ, EndX, EndY, EndZ;
	struct point    *NewHead;
	long            NextFileDetail;
	char            *p;
	int             n;

	fp = fopen ("world.map", "r+b");
	while (head->NextPoint)
	{
		SpinPoint (Lat, Long, head->LatVal, head->LongVal, Radius,
			&StartX, &StartY, &StartZ);
		SpinPoint (Lat, Long, head->NextPoint->LatVal,
			head->NextPoint->LongVal, Radius, &EndX, &EndY, &EndZ);

		/* Check that this point is within the screen */
		if (StartX > 0 && StartX < getmaxx() && StartY < getmaxy() &&
			StartY > 0 && StartZ > 0 && EndX > 0 && EndY > 0 &&
			EndX < getmaxx() && EndY < getmaxy())
		{
			while (head->NextDetail != NULL &&
				ZoomLevel < head->ZoomVal)
				{head = head->NextDetail;}
			if (ZoomLevel = head->ZoomVal &&
				head->NextDetail == NULL)
			{
				fseek (fp, head->FilePosition, SEEK_SET);
				p = &NextFileDetail;
				for (n = 0;n < 4;n ++)
					{*p++ = getc(fp);}
				if (NextFileDetail > -1)
				{
					printf ("It exists");
					fseek (fp, NextFileDetail, SEEK_SET);
					NewHead = ReadRec (head, TRUE);
					NewHead->NextPoint = head->NextPoint;
				}
			}
		}
		head = head->NextPoint;
	}
	fclose (fp);
}

void InputPoint (double *Lat, double *Long)
{
}
