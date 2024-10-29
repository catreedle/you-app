import { getHoroscope } from '../horoscope.utils'; // Adjust the import path

describe('getHoroscope', () => {
    it('should return Aquarius for January 20', () => {
        const birthday = new Date('2023-01-20');
        expect(getHoroscope(birthday)).toBe('Aquarius');
    });

    it('should return Pisces for February 19', () => {
        const birthday = new Date('2023-02-19');
        expect(getHoroscope(birthday)).toBe('Pisces');
    });

    it('should return Aries for March 21', () => {
        const birthday = new Date('2023-03-21');
        expect(getHoroscope(birthday)).toBe('Aries');
    });

    it('should return Taurus for April 20', () => {
        const birthday = new Date('2023-04-20');
        expect(getHoroscope(birthday)).toBe('Taurus');
    });

    it('should return Gemini for May 21', () => {
        const birthday = new Date('2023-05-21');
        expect(getHoroscope(birthday)).toBe('Gemini');
    });

    it('should return Cancer for June 21', () => {
        const birthday = new Date('2023-06-21');
        expect(getHoroscope(birthday)).toBe('Cancer');
    });

    it('should return Leo for July 23', () => {
        const birthday = new Date('2023-07-23');
        expect(getHoroscope(birthday)).toBe('Leo');
    });

    it('should return Virgo for August 23', () => {
        const birthday = new Date('2023-08-23');
        expect(getHoroscope(birthday)).toBe('Virgo');
    });

    it('should return Libra for September 23', () => {
        const birthday = new Date('2023-09-23');
        expect(getHoroscope(birthday)).toBe('Libra');
    });

    it('should return Scorpio for October 23', () => {
        const birthday = new Date('2023-10-23');
        expect(getHoroscope(birthday)).toBe('Scorpio');
    });

    it('should return Sagittarius for November 22', () => {
        const birthday = new Date('2023-11-22');
        expect(getHoroscope(birthday)).toBe('Sagittarius');
    });

    it('should return Capricorn for December 22', () => {
        const birthday = new Date('2023-12-22');
        expect(getHoroscope(birthday)).toBe('Capricorn');
    });

    // Edge cases
    it('should return Capricorn for January 19', () => {
        const birthday = new Date('2023-01-19');
        expect(getHoroscope(birthday)).toBe('Capricorn');
    });

    it('should return Aquarius for February 18', () => {
        const birthday = new Date('2023-02-18');
        expect(getHoroscope(birthday)).toBe('Aquarius');
    });
});
