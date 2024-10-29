import { getZodiac } from '../zodiac.utils';

describe('Chinese Zodiac Calculator', () => {
    // Test exact boundary dates
    test('returns correct zodiac for start date', () => {
        const date = new Date('2023-01-22');
        expect(getZodiac(date)).toBe('Rabbit');
    });

    test('returns correct zodiac for end date', () => {
        const date = new Date('2024-02-09');
        expect(getZodiac(date)).toBe('Rabbit');
    });

    // Test mid-year dates
    test('returns correct zodiac for middle of year', () => {
        const date = new Date('2023-07-15');
        expect(getZodiac(date)).toBe('Rabbit');
    });

    // Test consecutive years
    test('handles transition between zodiac years correctly', () => {
        const beforeTransition = new Date('2023-01-21');
        const afterTransition = new Date('2023-01-22');

        expect(getZodiac(beforeTransition)).toBe('Tiger');
        expect(getZodiac(afterTransition)).toBe('Rabbit');
    });

    // Test different decades
    test('correctly identifies zodiacs from different decades', () => {
        expect(getZodiac(new Date('1985-03-01'))).toBe('Ox');
        expect(getZodiac(new Date('1995-03-01'))).toBe('Boar');
        expect(getZodiac(new Date('2005-03-01'))).toBe('Rooster');
        expect(getZodiac(new Date('2015-03-01'))).toBe('Goat');
    });

    // Test leap years
    test('handles leap years correctly', () => {
        expect(getZodiac(new Date('2000-02-05'))).toBe('Dragon');
        expect(getZodiac(new Date('2004-02-05'))).toBe('Monkey');
        expect(getZodiac(new Date('2008-02-05'))).toBe('Boar');
        expect(getZodiac(new Date('2012-02-05'))).toBe('Dragon');
    });

    // Test earliest and latest dates in the dataset
    test('handles earliest and latest dates in dataset', () => {
        const earliestDate = new Date('1912-02-18');
        const latestDate = new Date('2024-02-09');

        expect(getZodiac(earliestDate)).toBe('Rat');
        expect(getZodiac(latestDate)).toBe('Rabbit');
    });

    // Test invalid dates
    test('handles dates outside of dataset range', () => {
        const tooEarly = new Date('1912-02-17');
        const tooLate = new Date('2024-02-10');

        expect(getZodiac(tooEarly)).toBe('');
        expect(getZodiac(tooLate)).toBe('');
    });

    // Test each zodiac animal appears correctly
    test('correctly identifies all zodiac animals', () => {
        const testCases = [
            { date: '2023-02-01', expected: 'Rabbit' },
            { date: '2022-06-01', expected: 'Tiger' },
            { date: '2021-06-01', expected: 'Ox' },
            { date: '2020-06-01', expected: 'Rat' },
            { date: '2019-06-01', expected: 'Pig' },
            { date: '2018-06-01', expected: 'Dog' },
            { date: '2017-06-01', expected: 'Rooster' },
            { date: '2016-06-01', expected: 'Monkey' },
            { date: '2015-06-01', expected: 'Goat' },
            { date: '2014-06-01', expected: 'Horse' },
            { date: '2013-06-01', expected: 'Snake' },
            { date: '2012-06-01', expected: 'Dragon' }
        ];

        testCases.forEach(({ date, expected }) => {
            expect(getZodiac(new Date(date))).toBe(expected);
        });
    });
});