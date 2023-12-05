// Text format helpers are to provide formatting such as degrees

export default class TextFormatHelpers  {

    static degreeSymbol() {
        return '\u00B0';
    }
    static latitudeGCS(latitude) {
        const wholeDegree = Math.floor(latitude);
        const positiveWholeDegree = Math.abs(wholeDegree);
        let suffix = '';
        if (wholeDegree < 0) {
            suffix = 'N';
        } else if (wholeDegree > 0) {
            suffix = 'S';
        } else {
            suffix = '';
        }

        return positiveWholeDegree + this.degreeSymbol() + suffix;
    }
    static longitudeGCS(longitude) {
        const wholeDegree = Math.floor(longitude);
        const positiveWholeDegree = Math.abs(wholeDegree);
        let suffix = '';
        if (wholeDegree < 0) {
            suffix = 'W';
        } else if (wholeDegree > 0) {
            suffix = 'E';
        } else {
            suffix = '';
        }

        return positiveWholeDegree + this.degreeSymbol() + suffix;
    }
}