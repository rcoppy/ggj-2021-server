export function repeat(n: number, f) {
    while (n-- > 0) {
        f();
    }
}