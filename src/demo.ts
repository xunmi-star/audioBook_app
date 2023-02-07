type A1 = 'x' extends 'x' ? 1 : 2;

type A2 = 'x' | 'y' extends 'x' ? 1 : 2; // A2=2

type P<T> = T extends 'x' ? 1 : 2;

type A3 = P<'x' | 'y'> //  A3 = 1 | 2

type P_2<T> = [T] extends ['x'] ? 1 : 2; 

type A3_2 = P_2<'x' | 'y'> //  A3_2 = 2