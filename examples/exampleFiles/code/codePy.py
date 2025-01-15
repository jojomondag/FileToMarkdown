def fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        a, b = 0, 1
        for _ in range(2, n + 1):
            a, b = b, a + b
        return b

def main():
    # Test the fibonacci function
    for i in range(10):
        print(f"Fibonacci({i}) = {fibonacci(i)}")

if __name__ == "__main__":
    main() 