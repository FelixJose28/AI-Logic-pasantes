"use strict";

const ALPHABETIC_LOWER = stringFromAsciiRange(97, 122);
const ALPHABETIC_UPPER = stringFromAsciiRange(65, 90);
const SYMBOLS = stringFromAsciiRange(33, 47) + stringFromAsciiRange(58, 64) + stringFromAsciiRange(91, 96) + stringFromAsciiRange(123, 126);
const NUMERIC = "0123456789";

const NAMES_MALE = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Donald", "Mark", "Paul", "Steven", "Andrew", "Kenneth", "Joshua", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel", "Frank", "Gregory", "Raymond", "Alexander", "Patrick", "Jack", "Dennis", "Jerry", "Tyler", "Aaron", "Jose", "Henry", "Adam", "Douglas", "Nathan", "Peter", "Zachary", "Kyle", "Walter", "Harold", "Jeremy", "Ethan", "Carl", "Keith", "Roger", "Gerald", "Christian", "Terry", "Sean", "Arthur", "Austin", "Noah", "Lawrence", "Jesse", "Joe", "Bryan", "Billy", "Jordan", "Albert", "Dylan", "Bruce", "Willie", "Gabriel", "Alan", "Juan", "Logan", "Wayne", "Ralph", "Roy", "Eugene", "Randy", "Vincent", "Russell", "Louis", "Philip", "Bobby", "Johnny", "Bradley"];
const NAMES_FEMALE = ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Nancy", "Lisa", "Margaret", "Betty", "Sandra", "Ashley", "Dorothy", "Kimberly", "Emily", "Donna", "Michelle", "Carol", "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Laura", "Sharon", "Cynthia", "Kathleen", "Amy", "Shirley", "Angela", "Helen", "Anna", "Brenda", "Pamela", "Nicole", "Samantha", "Katherine", "Emma", "Ruth", "Christine", "Catherine", "Debra", "Rachel", "Carolyn", "Janet", "Virginia", "Maria", "Heather", "Diane", "Julie", "Joyce", "Victoria", "Kelly", "Christina", "Lauren", "Joan", "Evelyn", "Olivia", "Judith", "Megan", "Cheryl", "Martha", "Andrea", "Frances", "Hannah", "Jacqueline", "Ann", "Gloria", "Jean", "Kathryn", "Alice", "Teresa", "Sara", "Janice", "Doris", "Madison", "Julia", "Grace", "Judy", "Abigail", "Marie", "Denise", "Beverly", "Amber", "Theresa", "Marilyn", "Danielle", "Diana", "Brittany", "Natalie", "Sophia", "Rose", "Isabella", "Alexis", "Kayla", "Charlotte"];
const LASTNAMES = ["Hernández", "Mora", "Rodríguez", "Jiménez", "Morales", "Sánchez", "Ramírez", "Pérez", "Calderón", "Gutiérrez", "Rojas", "Vargas", "Torres", "Salas", "Segura", "Valverde", "Villalobos", "Araya", "Herrera", "López", "Madrigal", "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White", "Lopez", "Lee", "Gonzalez"];

function stringFromAsciiRange(start, end) {
    let result = "";

    for (let i = start; i <= end; i++) {
        result += String.fromCodePoint(i);
    }

    return result;
}

/**
 * A fake data generator.
 */
export class Faker {
    /**
     * Constructs a new `Faker`
     * @param {Number} seed Initial state of the random number generator.
     */
    constructor(seed) {
        this.source = new RandomXor32(seed);
    }

    /**
     * Returns a random person name.
     * @param {"male" | "female"} gender the gender of the name.
     */
    nextName(gender) {
        switch (gender) {
            case "male":
                return this.nextValue(NAMES_MALE);
            case "female":
                return this.nextValue(NAMES_FEMALE);
            default:
                return this.nextValue(NAMES_MALE.concat(NAMES_FEMALE));
        }
    }

    /**
     * Returns a random person last name.
     */
    nextLastName() {
        return this.nextValue(LASTNAMES);
    }

    /**
     * Returns a new String replacing the values in the pattern with the corresponding.
     * By default:
     * - `N`: is replaced by a number from 0 to 9.
     * - `c`: is replaced by a lowercase letter from a to z.
     * - `C`: is replaced by a uppercase letter from A to Z.
     * 
     * @param {String} pattern the template string to replace the values.
     * @param options An object describing how replace the values as: `{ "pattern" : (faker) => value, ... }`.
     * 
     * @example
     * ```
     * const faker = new Faker();
     * 
     * // Here we replace all the `x` charactes with the number returned by `f.nextInt(0, 10)`
     * const number = faker.nextPattern("1-xxx-xxxx", {
     *      "x" : (f) => f.nextInt(0, 10)
     * })
     * ```
     */
    nextPattern(pattern, options) {
        if (pattern == null) {
            throw new Error("Pattern cannot be null");
        }

        if (options == null) {
            options = {
                "N" : (gen) => gen.nextInt(0, 10),
                "c" : (gen) => gen.nextString({ length: 1, lower: true }),
                "C" : (gen) => gen.nextString({ length: 1, upper: true })
            };
        }

        let result = pattern;

        for (const key in options) {
            if (Object.hasOwnProperty.call(options, key)) {
                if (typeof key === "string" || key instanceof String) {
                    const regex = new RegExp(key, "g");
                    result = result.replace(regex, () => options[key](this));
                } else {
                    throw new Error("nextPattern `options` keys must be strings");
                }
            }
        }

        return result;
    }

    /**
     * Returns an array with the given number of elements with the object provided by the `factory`.
     * 
     * @param {Number} count The number of values in the array.
     * @param {(Faker, Number) => any} factory Constructs the objects of the array.
     * 
     * @example
     * ```
     * // Constructs an array of 5 persons which contains a name, lastName and age
     * const persons = new Faker().newArray(5, (f) => {
     *      return {
     *          name: f.nextName(),
     *          lastName: f.lastName(),
     *          age: f.nextInt(1, 100)
     *      };
     * });
     * ```
     */
    nextArray(count, factory) {
        const array = [];

        for (let i = 0; i < count; i++) {
            array.push(factory(this, i));
        }

        return array;
    }

    /**
     * Returns a random string containing alphanumeric characters.
     * @param options An object containing the options for construct the string valid values: `upper`, `lower`, `numeric` and `symbol`.
     * 
     * For Example: ``` { upper: true, number: true, length: 5 }```
     */
    nextString(options) {
        let source = "";

        if (options) {
            if (options.upper === true) {
                source += ALPHABETIC_UPPER;
            }
    
            if (options.lower === true) {
                source += ALPHABETIC_LOWER;
            }
    
            if (options.numeric === true) {
                source += NUMERIC;
            }
    
            if (options.symbol === true) {
                source += SYMBOLS;
            }
        }

        if (source.length === 0) {
            source = ALPHABETIC_UPPER + ALPHABETIC_LOWER + NUMERIC;
        }

        // Default string length
        let length = 10;

        if (typeof options === "number") {
            length = options;
        } else if (options && options.length){
            length = options.length
        }

        let string = "";

        for(let i = 0; i < length; i++) {
            string += this.nextValue(source);
        }

        return string;
    }

    /**
     * Returns a random value from the given object or array.
     * @param {any|Array} obj The object or array to pick the value.
     */
    nextValue(obj) {
        return this.source.nextValue(obj);
    }

    /**
     * Returns a random `boolean` value with a probability of 0.5.
     * @param {Number} probability The probability to get a `true` value.
     */
    nextBoolean(probability) {
        return this.source.nextBoolean(probability);
    }

    /**
     * Returns a random `float` number from 0 to 1 exclusive.
     */
    nextFloat() {
        return this.source.nextFloat();
    }

    /**
     * Returns a number between `boundLower` and `boundUpper` exclusive.
     * - If `boundUpper` is omited the returned number goes from 0 to `boundUpper` exclusive.
     * - If both arguments are omited the number goes from -2^32-1 to 2^32-1.
     * 
     * @param {Number} boundLower min bound of the number.
     * @param {Number} boundUpper max bound of the number.
     */
    nextInt(boundLower, boundUpper) {
        return this.source.nextInt(boundLower, boundUpper);
    }
}

/**
 * A random number generator using `Xorshift` algorithm.
 * 
 * @see https://en.wikipedia.org/wiki/Xorshift
 */
export class RandomXor32 {
    // Max value of integer of 32 bits.
    static MAX_INT32 = 2147483647;

    /**
     * Constructs a new `RandomXor32`.
     * @param {Number} seed the initial state of the random number generator.
     */
    constructor(seed) {
        while (seed == null || seed === 0) {
            seed = Math.trunc((Math.random() * RandomXor32.MAX_INT32));
        }

        this.state = Math.trunc(seed);
    }

    /**
     * Returns a random value from the given object or array.
     * @param {any|Array} obj The object or array to pick the value.
     */
    nextValue(obj) {
        if (Array.isArray(obj)) {
            const index = this.nextInt(0, obj.length);
            return obj[index];
        } else {
            const keys = Object.keys(obj).filter(k => typeof obj[k] !== "function");

            if (keys.length === 0) {
                return obj;
            }

            const index = this.nextInt(0, keys.length);
            return obj[keys[index]];
        }
    }

    /**
     * Returns a random `boolean` value with a probability of 0.5.
     * @param {Number} probability The probability to get a `true` value.
     */
    nextBoolean(probability) {
        if (probability != null) {
            return this.nextFloat() <= probability;
        } else {
            return this.nextFloat() <= 0.5;
        }
    }

    /**
     * Returns a random `float` number from 0 to 1 exclusive.
     */
    nextFloat() {
        return Math.abs(this.next()) / RandomXor32.MAX_INT32;
    }

    /**
     * Returns a number between `boundLower` and `boundUpper` exclusive.
     * - If `boundUpper` is omited the returned number goes from 0 to `boundUpper` exclusive.
     * - If both arguments are omited the number goes from -2^32-1 to 2^32-1.
     * 
     * @param {Number} boundLower min bound of the number.
     * @param {Number} boundUpper max bound of the number.
     */
    nextInt(boundLower, boundUpper) {
        if (boundLower == null && boundUpper == null) {
            return this.next();
        }

        if (boundLower && boundUpper == null) {
            const max = boundLower | 0;
            return Math.floor(this.nextFloat() * max);
        }
        else {
            const min = boundLower | 0;
            const max = boundUpper | 0;

            if (min > max) {
                throw new Error("min bound cannot be greater than max bound");
            }

            if (min === max) {
                return max;
            }

            let n = max - min;

            if (n < RandomXor32.MAX_INT32) {
                n = (this.nextFloat() * n) + min;
            } else {
                do {
                    n = this.next();
                }
                while (n < min || n > max);
            }

            return Math.floor(n);
        }
    }

    /**
     * Returns a random `Number`.
     */
    next() {
        let x = this.state;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        return this.state = x;
    }
}

/**
 * A global instance of the `Faker`.
 */
export const faker = new Faker();